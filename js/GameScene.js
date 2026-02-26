/**
 * GAMESCENE v6.0 — Levels, Progression, New Weapons, Ad Overhaul
 */
class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.on('loaderror', function(file) { console.warn('Asset missing:', file.key); });
        if (CONFIG.BACKGROUND.image) this.load.image('background', CONFIG.BACKGROUND.image);
        if (CONFIG.ENV) {
            if (CONFIG.ENV.BACKGROUND) this.load.image('env_background', CONFIG.ENV.BACKGROUND);
            if (CONFIG.ENV.CASTLE) this.load.image('env_castle', CONFIG.ENV.CASTLE);
        }
        var sprites = CONFIG.SPRITES;
        if (sprites) {
            for (var key in sprites) {
                var sp = sprites[key];
                if (sp && sp.file) {
                    // Single anim format
                    this.load.spritesheet('sprite_' + key, sp.file, { frameWidth: sp.fw, frameHeight: sp.fh });
                } else if (sp && sp.walk) {
                    // Multi-anim format (walk/attack/death)
                    var states = ['walk', 'attack', 'death'];
                    for (var s = 0; s < states.length; s++) {
                        var st = states[s];
                        if (sp[st] && sp[st].file) {
                            this.load.spritesheet('sprite_' + key + '_' + st, sp[st].file, { frameWidth: sp[st].fw, frameHeight: sp[st].fh });
                        }
                    }
                }
            }
        }
        var images = CONFIG.IMAGES;
        for (var imgKey in images) { if (images[imgKey]) this.load.image('enemy_' + imgKey, images[imgKey]); }
        if (CONFIG.WEAPON_SPRITES) { for (var wk in CONFIG.WEAPON_SPRITES) this.load.image('weapon_' + wk, CONFIG.WEAPON_SPRITES[wk]); }
        if (CONFIG.PROJECTILE_SPRITES) { for (var pk in CONFIG.PROJECTILE_SPRITES) this.load.image('proj_' + pk, CONFIG.PROJECTILE_SPRITES[pk]); }
        if (CONFIG.MAGIC_SPRITES) { for (var mk in CONFIG.MAGIC_SPRITES) this.load.image('magic_' + mk, CONFIG.MAGIC_SPRITES[mk]); }
        if (CONFIG.VFX_SPRITES) { for (var vk in CONFIG.VFX_SPRITES) { var v = CONFIG.VFX_SPRITES[vk]; this.load.spritesheet('vfx_'+vk, v.file, {frameWidth:v.fw, frameHeight:v.fh}); } }
    }

    init(data) {
        this.currentLevel = (data && data.level) || 1;
        this.levelConfig = CONFIG.LEVELS[this.currentLevel] || CONFIG.LEVELS[1];
        this.maxWavesInLevel = this.levelConfig.endless ? 9999 : (this.levelConfig.waves || 10);
        // Load loadout from data or from saved progress
        var prog = window.gameProgress || {};
        var savedLoadout = prog.loadout || { weapons: ['CROSSBOW'], magic: ['WIND', 'FREEZE', 'LIGHTNING'] };
        this.runLoadout = (data && data.loadout) ? data.loadout : savedLoadout;
    }

    create() {
        // Load persistent progression
        var prog = window.gameProgress || {};
        var talentLevels = prog.talents || {};
        var equippedArtifacts = prog.equippedArtifacts || [];
        var artifactEffects = this.calculateArtifactEffects(equippedArtifacts);
        var talentEffects = this.calculateTalentEffects(talentLevels);

        this.gold = CONFIG.START_GOLD; this.gems = CONFIG.START_GEMS;
        this.runGoldEarned = 0; this.megaBossKilledInRun = 0;
        this.maxCastleHp = Math.floor(CONFIG.CASTLE.maxHp * (1 + talentEffects.maxHpBonus) * (artifactEffects.castleHpMult || 1));
        this.castleHp = this.maxCastleHp;
        this.castleRegen = talentEffects.regenBonus || 0;
        this.currentWave = 0; this.bossesKilled = 0; this.isGameOver = false;
        this.waveInProgress = false; this.waitingForNextWave = false; this.totalKills = 0;
        // Mana system
        this.maxMana = CONFIG.MANA ? CONFIG.MANA.max : 100;
        this.mana = this.maxMana;
        this.manaRegenRate = CONFIG.MANA ? CONFIG.MANA.regenPerSec : 8;
        // Roguelike XP system
        this.xp = 0; this.rogueLevel = 0;
        this.xpToNextLevel = CONFIG.XP_CONFIG ? CONFIG.XP_CONFIG.xpToFirstLevel : 60;
        this.pendingRoguePicks = 0; this.roguePickerOpen = false; this.pendingBossReward = null;
        this.currentEvent = null; this.waveGoldMult = 1;
        this.manaOnKillValue = 0; this.enemySlowAllValue = 0;
        // Ammo perk stacks (from roguelike perk picks)
        this.ammoEffects = { electric: 0, fire: 0, ice: 0, multi: 0 };
        this.castleShieldActive = false; this.castleShieldReduction = 0; this.chainShotPairs = [];
        this.damageBuff = 1 + talentEffects.damageBonus; this.damageBuffEndTime = 0;
        this.reviveUsed = false; this.gemAdUsed = 0;
        // Loadout-based weapon/magic init
        var loadout = this.runLoadout || { weapons: ['CROSSBOW'], magic: ['WIND', 'FREEZE', 'LIGHTNING'] };
        this.unlockedWeapons = loadout.weapons.slice();
        this.currentWeapon = this.unlockedWeapons[0] || 'CROSSBOW';
        this.activeMagic = loadout.magic.slice();

        // Progression effects stored for use
        this.armorReduction = talentEffects.armorReduction || 0;
        this.lifestealPercent = artifactEffects.lifesteal || 0;
        this.goldMult = artifactEffects.goldMult || 1;
        this.magicCdMult = (1 - talentEffects.cdReduction) * (artifactEffects.magicCdMult || 1);
        this.magicDamageMult = 1 + talentEffects.magicDamageBonus;
        this.magicDurationMult = 1 + talentEffects.durationBonus;
        this.baseCritBonus = talentEffects.critBonus || 0;
        this.fireRateMult = artifactEffects.fireRateMult || 1;

        this.deadEnemyPositions = [];

        this.weaponStates = {};
        for (var wk in CONFIG.WEAPONS) {
            var w = CONFIG.WEAPONS[wk];
            this.weaponStates[wk] = {
                damage: w.baseDamage, fireRate: Math.floor(w.baseFireRate * this.fireRateMult),
                speed: w.baseSpeed,
                splashRadius: w.baseSplashRadius||0, pushback: w.basePushback||0,
                bounces: w.baseBounces||0, damageGrowth: w.baseDamageGrowth||0,
                maxRange: w.baseMaxRange||400,
                critChance: this.baseCritBonus * 100,
                ammoType: w.ammoType || 'NORMAL',
                upgrades: JSON.parse(JSON.stringify(w.upgrades))
            };
        }

        this.lastFireTime = 0; this.enemies = []; this.projectiles = [];
        this.pendingSpawnCount = 0;
        this.magicCooldowns = {}; this.magicInProgress = false;
        var mk2 = Object.keys(CONFIG.MAGIC);
        for (var i = 0; i < mk2.length; i++) this.magicCooldowns[mk2[i]] = 0;

        // Ad timer
        this.lastAdTime = Date.now();

        this.vfx = new VFX(this);
        this.createAnimations(); this.createBackground(); this.createCastle();
        this.createCrosshair(); this.createUI(); this.setupInput();

        var self = this;
        this.time.addEvent({ delay: 1000, callback: function() {
            if (self.castleRegen > 0 && self.castleHp < self.maxCastleHp) {
                self.castleHp = Math.min(self.maxCastleHp, self.castleHp + self.castleRegen); self.updateHpText();
            }
            // Check timed ad
            if (Date.now() - self.lastAdTime >= CONFIG.ADS.interstitialIntervalMs) {
                self.lastAdTime = Date.now();
                showInterstitialAd(function(){});
            }
        }, loop: true });
        this.time.delayedCall(1000, function() { self.startWave(); });
    }

    calculateArtifactEffects(equipped) {
        var effects = { castleHpMult: 1, fireRateMult: 1, magicCdMult: 1, goldMult: 1, lifesteal: 0, startAmmo: null };
        for (var i = 0; i < equipped.length; i++) {
            var art = CONFIG.ARTIFACTS[equipped[i]];
            if (!art) continue;
            var e = art.effect;
            if (e.castleHpMult) effects.castleHpMult *= e.castleHpMult;
            if (e.fireRateMult) effects.fireRateMult *= e.fireRateMult;
            if (e.magicCdMult) effects.magicCdMult *= e.magicCdMult;
            if (e.goldMult) effects.goldMult *= e.goldMult;
            if (e.lifesteal) effects.lifesteal += e.lifesteal;
            if (e.startAmmo) effects.startAmmo = e.startAmmo;
        }
        return effects;
    }

    calculateTalentEffects(talents) {
        var effects = { damageBonus: 0, fireRateBonus: 0, critBonus: 0, maxHpBonus: 0, regenBonus: 0, armorReduction: 0, cdReduction: 0, magicDamageBonus: 0, durationBonus: 0 };
        if (talents.ATTACK) {
            if (talents.ATTACK.damage) effects.damageBonus = talents.ATTACK.damage * CONFIG.TALENTS.ATTACK.damage.effectPerLevel;
            if (talents.ATTACK.fireRate) effects.fireRateBonus = talents.ATTACK.fireRate * CONFIG.TALENTS.ATTACK.fireRate.effectPerLevel;
            if (talents.ATTACK.crit) effects.critBonus = talents.ATTACK.crit * CONFIG.TALENTS.ATTACK.crit.effectPerLevel;
        }
        if (talents.DEFENSE) {
            if (talents.DEFENSE.maxHp) effects.maxHpBonus = talents.DEFENSE.maxHp * CONFIG.TALENTS.DEFENSE.maxHp.effectPerLevel;
            if (talents.DEFENSE.regen) effects.regenBonus = talents.DEFENSE.regen * CONFIG.TALENTS.DEFENSE.regen.effectPerLevel;
            if (talents.DEFENSE.armor) effects.armorReduction = talents.DEFENSE.armor * CONFIG.TALENTS.DEFENSE.armor.effectPerLevel;
        }
        if (talents.MAGIC) {
            if (talents.MAGIC.cooldown) effects.cdReduction = talents.MAGIC.cooldown * CONFIG.TALENTS.MAGIC.cooldown.effectPerLevel;
            if (talents.MAGIC.magicDamage) effects.magicDamageBonus = talents.MAGIC.magicDamage * CONFIG.TALENTS.MAGIC.magicDamage.effectPerLevel;
            if (talents.MAGIC.duration) effects.durationBonus = talents.MAGIC.duration * CONFIG.TALENTS.MAGIC.duration.effectPerLevel;
        }
        return effects;
    }

    createAnimations() {
        var sprites = CONFIG.SPRITES; if (!sprites) return;
        for (var key in sprites) {
            var sp = sprites[key];
            if (sp && sp.file) {
                // Single anim
                var texKey = 'sprite_' + key;
                if (!this.textures.exists(texKey)) continue;
                var animKey = 'anim_' + key;
                if (this.anims.exists(animKey)) continue;
                this.anims.create({ key: animKey, frames: this.anims.generateFrameNumbers(texKey, { start: 0, end: sp.frames - 1 }), frameRate: sp.fps, repeat: -1 });
            } else if (sp && sp.walk) {
                // Multi-anim
                var states = ['walk', 'attack', 'death'];
                for (var s = 0; s < states.length; s++) {
                    var st = states[s];
                    if (!sp[st]) continue;
                    var texKey2 = 'sprite_' + key + '_' + st;
                    var animKey2 = 'anim_' + key + '_' + st;
                    if (!this.textures.exists(texKey2) || this.anims.exists(animKey2)) continue;
                    this.anims.create({ key: animKey2, frames: this.anims.generateFrameNumbers(texKey2, { start: 0, end: sp[st].frames - 1 }), frameRate: sp[st].fps, repeat: st === 'death' ? 0 : -1 });
                }
            }
        }
        if (CONFIG.VFX_SPRITES) {
            for (var vk in CONFIG.VFX_SPRITES) {
                var v = CONFIG.VFX_SPRITES[vk];
                if (this.textures.exists('vfx_'+vk) && !this.anims.exists('vfxanim_'+vk)) {
                    this.anims.create({ key:'vfxanim_'+vk, frames:this.anims.generateFrameNumbers('vfx_'+vk,{start:0,end:v.frames-1}), frameRate:v.fps, repeat:0 });
                }
            }
        }
    }

    createBackground() {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        if (this.textures.exists('env_background')) { this.add.image(W/2, H/2, 'env_background').setDisplaySize(W, H); }
        else if (this.textures.exists('background')) { this.add.image(W/2, H/2, 'background').setDisplaySize(W, H); }
        else {
            var sky = this.add.graphics();
            sky.fillGradientStyle(0x0d0716, 0x0d0716, 0x1a0e2e, 0x1a0e2e); sky.fillRect(0, 0, W, H*0.35);
            sky.fillGradientStyle(0x1a0e2e, 0x1a0e2e, 0x1a1a3a, 0x1a1a3a); sky.fillRect(0, H*0.35, W, H*0.25);
            var stars = this.add.graphics();
            for (var s = 0; s < 30; s++) { stars.fillStyle(0xffeedd, 0.2+Math.random()*0.4); stars.fillRect(Math.floor(Math.random()*W), Math.floor(Math.random()*H*0.4), 1, 1); }
            var mt = this.add.graphics(); mt.fillStyle(0x1a1a2a, 0.9);
            mt.beginPath(); mt.moveTo(0, H*0.52);
            for (var mx = 0; mx <= W; mx += 8) { var my = H*0.44 + Math.sin(mx*0.007)*20 + Math.sin(mx*0.02)*10; my = Math.floor(my/4)*4; mt.lineTo(mx, my); }
            mt.lineTo(W, H*0.6); mt.lineTo(0, H*0.6); mt.closePath(); mt.fill();
            var hl = this.add.graphics(); hl.fillStyle(0x1a2a16, 0.9);
            hl.beginPath(); hl.moveTo(0, H*0.65);
            for (var hx = 0; hx <= W; hx += 6) { var hy = H*0.58 + Math.sin(hx*0.01+1)*15 + Math.sin(hx*0.025)*8; hy = Math.floor(hy/3)*3; hl.lineTo(hx, hy); }
            hl.lineTo(W, H*0.72); hl.lineTo(0, H*0.72); hl.closePath(); hl.fill();
            var gr = this.add.graphics();
            gr.fillStyle(0x2a1a0e); gr.fillRect(0, H*0.70, W, H*0.3);
            gr.fillStyle(0x3a5a22); gr.fillRect(0, H*0.695, W, 4);
            gr.fillStyle(0x2a1a0e, 0.4); gr.fillRect(0, H*0.72, W, 2);
        }
    }

    createCastle() {
        var x = CONFIG.CASTLE.x, y = CONFIG.CASTLE.y, size = CONFIG.CASTLE.size;
        if (this.textures.exists('env_castle')) {
            this.castle = this.add.image(x, y, 'env_castle').setDisplaySize(size*1.5, size*2).setDepth(10);
        } else {
            var cg = this.add.graphics().setDepth(10);
            cg.fillStyle(0x4a4a5a); cg.fillRect(x-size/2, y-size*0.4, size, size*1.1);
            cg.fillStyle(0x3a3a4a); cg.fillRect(x-size/2, y-size*0.4, size*0.15, size*1.1);
            var bw = size/5;
            for (var i = 0; i < 5; i++) { var bx = x - size/2 + i*bw; if (i%2===0) { cg.fillStyle(0x5a5a6a); cg.fillRect(bx, y-size*0.4-12, bw, 12); } }
            cg.fillStyle(0x1a0e0a); cg.fillRect(x-size/7, y+size*0.2, size/3.5, size*0.5);
            cg.fillStyle(0xddaa44, 0.7); cg.fillRect(x-size/3, y-size*0.15, 6, 8);
            cg.fillRect(x+size/3-6, y-size*0.15, 6, 8);
            cg.fillStyle(0x666666); cg.fillRect(x, y-size*0.4-12, 2, -24);
            cg.fillStyle(0xaa2222); cg.fillRect(x+2, y-size*0.4-36, 12, 8);
            this.castle = this.add.rectangle(x, y, size, size*1.5, 0x000000, 0).setDepth(10);
        }
        this.castleHpBarBg = this.add.rectangle(x, y-size*0.8-6, size*1.1, 6, 0x1a0e0a, 0.8).setStrokeStyle(1, 0x6a4a2a).setDepth(11);
        this.castleHpBar = this.add.rectangle(x, y-size*0.8-6, size*1.1, 4, 0x44cc44).setDepth(12);
        this.crossbowX = x + 50; this.crossbowY = y - 10;
        this.weaponSprite = null; this.weaponEmoji = null;
        var wtk = 'weapon_' + this.currentWeapon;
        if (this.textures.exists(wtk)) { this.weaponSprite = this.add.image(this.crossbowX, this.crossbowY, wtk).setDisplaySize(48,48).setOrigin(0.3,0.5).setDepth(50); }
        else { this.weaponEmoji = this.add.text(this.crossbowX, this.crossbowY, CONFIG.WEAPONS[this.currentWeapon].icon, {fontSize:'28px'}).setOrigin(0.5).setDepth(50); }
    }

    createCrosshair() { this.crosshairLines = this.add.graphics().setDepth(200); }

    updateCrosshair(x, y) {
        var g = this.crosshairLines; g.clear();
        g.lineStyle(2, 0xcc3333, 0.7); g.strokeRect(x-10, y-10, 20, 20);
        g.fillStyle(0xcc3333, 0.9); g.fillRect(x-1, y-1, 2, 2);
        g.lineStyle(1, 0xcc3333, 0.5);
        g.lineBetween(x-16, y, x-12, y); g.lineBetween(x+12, y, x+16, y);
        g.lineBetween(x, y-16, x, y-12); g.lineBetween(x, y+12, x, y+16);
        var angle = Phaser.Math.Angle.Between(this.crossbowX, this.crossbowY, x, y);
        if (this.weaponSprite) { this.weaponSprite.setRotation(angle); this.weaponSprite.setFlipY(Math.abs(angle) > Math.PI/2); }
    }

    createUI() {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;

        this.drawPixelPanel(6, 4, W-12, 44, 90);
        var ts = {fontSize:'8px', fontFamily:FONT, stroke:'#1a0e0a', strokeThickness:2};
        this.goldText = this.add.text(16, 14, 'Gold:'+this.gold, Object.assign({},ts,{color:'#f0c866'})).setDepth(91);
        this.gemsText = this.add.text(16, 30, 'Gems:'+this.gems, Object.assign({},ts,{color:'#66aaee'})).setDepth(91);
        this.hpText = this.add.text(140, 14, 'HP:'+this.castleHp+'/'+this.maxCastleHp, Object.assign({},ts,{color:'#ee6644'})).setDepth(91);
        this.killText = this.add.text(140, 30, 'Kills:0', Object.assign({},ts,{color:'#aa9988'})).setDepth(91);

        // Level and wave info
        var levelName = this.levelConfig.name || ('Level ' + this.currentLevel);
        var waveSuffix = this.levelConfig.endless ? '∞' : this.maxWavesInLevel;
        this.waveText = this.add.text(W-14, 12, levelName + ' - Wave 1/' + waveSuffix, Object.assign({},ts,{color:'#e8d8c8',fontSize:'8px'})).setOrigin(1,0).setDepth(91);
        this.bossText = this.add.text(W-14, 30, 'Bosses:0', Object.assign({},ts,{color:'#cc8844',fontSize:'7px'})).setOrigin(1,0).setDepth(91);

        this.weaponText = this.add.text(W/2, 15, '', Object.assign({},ts,{color:'#d4c4a4',fontSize:'7px'})).setOrigin(0.5,0).setDepth(91);
        this.updateWeaponText();
        this.buffText = this.add.text(W/2, 32, '', Object.assign({},ts,{fontSize:'7px',color:'#ee6644'})).setOrigin(0.5,0).setDepth(91);

        // XP bar (above bottom panel)
        var xpBgG = this.add.graphics().setDepth(91);
        xpBgG.fillStyle(0x120820, 0.85); xpBgG.fillRect(14, H-66, 218, 5);
        xpBgG.lineStyle(1, 0x5522aa, 0.4); xpBgG.strokeRect(14, H-66, 218, 5);
        this.xpBarFill = this.add.rectangle(14, H-66, 218, 5, 0xaa44ee).setOrigin(0,0).setDepth(92);
        this.xpLevelText = this.add.text(236, H-67, 'Lv.0', {fontSize:'5px',color:'#aa66ff',fontFamily:FONT}).setDepth(92);
        this.add.text(14, H-73, 'XP', {fontSize:'5px',color:'#7744bb',fontFamily:FONT}).setDepth(91);

        // Mana bar (above bottom panel, below XP bar)
        var mnBgG = this.add.graphics().setDepth(91);
        mnBgG.fillStyle(0x060814, 0.85); mnBgG.fillRect(14, H-59, 218, 5);
        mnBgG.lineStyle(1, 0x224488, 0.4); mnBgG.strokeRect(14, H-59, 218, 5);
        this.manaBarFill = this.add.rectangle(14, H-59, 218, 5, 0x3366ee).setOrigin(0,0).setDepth(92);
        this.manaValueText = this.add.text(236, H-60, '100', {fontSize:'5px',color:'#4477cc',fontFamily:FONT}).setDepth(92);
        this.add.text(14, H-54, 'MP', {fontSize:'4px',color:'#336699',fontFamily:FONT}).setDepth(91);

        this.drawPixelPanel(6, H-52, W-12, 48, 90);
        var sep = this.add.graphics().setDepth(91);
        sep.fillStyle(0x6a4a2a, 0.4);
        sep.fillRect(235, H-48, 2, 40);
        sep.fillRect(W-138, H-48, 2, 40);

        this.createMagicButtons(); this.createWeaponButtons(); this.createAdBonusButton(); this.createSoundToggle();
    }

    drawPixelPanel(x, y, w, h, depth) {
        var g = this.add.graphics().setDepth(depth);
        g.fillStyle(0x2a1a0e, 0.88); g.fillRect(x, y, w, h);
        g.lineStyle(2, 0x6a4a2a, 0.8); g.strokeRect(x, y, w, h);
        g.lineStyle(1, 0x8a6a42, 0.3); g.strokeRect(x+2, y+2, w-4, h-4);
        var cs = 4;
        g.fillStyle(0x8a6a42, 0.6);
        g.fillRect(x, y, cs, cs); g.fillRect(x+w-cs, y, cs, cs);
        g.fillRect(x, y+h-cs, cs, cs); g.fillRect(x+w-cs, y+h-cs, cs, cs);
        return g;
    }

    createMagicButtons() {
        var H = CONFIG.GAME_HEIGHT, bY = H-28, bX = 30; this.magicButtons = []; var self = this;
        var MAGIC_HOTKEYS = ['Q','W','E','R','T'];
        var mk = this.activeMagic && this.activeMagic.length > 0 ? this.activeMagic : Object.keys(CONFIG.MAGIC);
        for (var i = 0; i < mk.length; i++) {
            var mt = mk[i], mg = CONFIG.MAGIC[mt];
            if (!mg) continue;
            var bg = this.add.graphics().setDepth(100);
            bg.fillStyle(0x1a0e0a, 0.8); bg.fillRect(bX-21, bY-18, 42, 36);
            bg.lineStyle(1, mg.color, 0.5); bg.strokeRect(bX-21, bY-18, 42, 36);
            bg.lineStyle(1, mg.color, 0.15); bg.strokeRect(bX-19, bY-16, 38, 32);
            var btn = this.add.rectangle(bX, bY, 42, 36, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(103);
            btn.magicType = mt;
            var mtk = 'magic_' + mt;
            if (this.textures.exists(mtk)) this.add.image(bX, bY-3, mtk).setDisplaySize(22,22).setDepth(101);
            else this.add.text(bX, bY-4, mg.icon, {fontSize:'16px'}).setOrigin(0.5).setDepth(101);
            this.add.text(bX, bY+13, MAGIC_HOTKEYS[i] || '', {fontSize:'6px',color:'#8a6a42',fontFamily:FONT}).setOrigin(0.5).setDepth(101);
            btn.cooldownOverlay = this.add.rectangle(bX, bY, 42, 36, 0x000000, 0.7).setVisible(false).setDepth(102);
            // Cooldown progress bar — grows left-to-right at bottom of button
            btn.cdBar = this.add.rectangle(bX - 21, bY + 15, 0, 4, mg.color || 0xaaaaff, 0.9).setOrigin(0, 0.5).setDepth(104);
            // Countdown text
            btn.cdText = this.add.text(bX, bY, '', {fontSize:'6px', color:'#ffffff', fontFamily:FONT, stroke:'#000000', strokeThickness:2}).setOrigin(0.5).setDepth(105);
            btn.btnBY = bY; btn.btnBX = bX;
            (function(t) { btn.on('pointerdown', function() { self.useMagic(t); }); })(mt);
            this.magicButtons.push(btn); bX += 48;
        }
    }

    createWeaponButtons() {
        var H = CONFIG.GAME_HEIGHT, bY = H-28, bX = 250; this.weaponButtons = []; var self = this;
        var wk = this.unlockedWeapons;
        var btnW = Math.min(52, Math.floor((CONFIG.GAME_WIDTH - 250 - 140) / Math.max(1, wk.length)) - 2);
        for (var i = 0; i < wk.length; i++) {
            var wt = wk[i], wp = CONFIG.WEAPONS[wt];
            var bg = this.add.graphics().setDepth(100);
            bg.fillStyle(0x1a0e0a, 0.8); bg.fillRect(bX-btnW/2, bY-18, btnW, 36);
            bg.lineStyle(1, 0x6a4a2a, 0.5); bg.strokeRect(bX-btnW/2, bY-18, btnW, 36);
            var btn = this.add.rectangle(bX, bY, btnW, 36, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(103);
            btn.weaponType = wt; btn._bg = bg;
            this.add.text(bX, bY-4, wp.icon, {fontSize:'13px'}).setOrigin(0.5).setDepth(101);
            this.add.text(bX, bY+13, ''+(i+1), {fontSize:'5px',color:'#6a4a2a',fontFamily:FONT}).setOrigin(0.5).setDepth(101);
            var lk = this.add.text(bX, bY, '🔒', {fontSize:'9px'}).setOrigin(0.5).setDepth(104);
            (function(t) { btn.on('pointerdown', function() { if (self.unlockedWeapons.indexOf(t)!==-1) self.selectWeapon(t); }); })(wt);
            this.weaponButtons.push({btn:btn, weaponType:wt, lockIcon:lk, bg:bg}); bX += btnW + 3;
        }
        this.updateWeaponButtons();
    }

    createAdBonusButton() {
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var bx = W/2+30, by = H-28;
        this.adBonusBg = this.add.graphics().setDepth(100).setVisible(false);
        this.adBonusBg.fillStyle(0x2a1a3a, 0.7); this.adBonusBg.fillRect(bx-48, by-14, 96, 28);
        this.adBonusBg.lineStyle(1, 0x8844aa, 0.5); this.adBonusBg.strokeRect(bx-48, by-14, 96, 28);
        this.adBonusBtn = this.add.rectangle(bx, by, 96, 28, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(103).setVisible(false);
        this.adBonusBtnText = this.add.text(bx, by, 'AD BONUS', {fontSize:'7px',color:'#cc88ee',fontFamily:FONT}).setOrigin(0.5).setDepth(101).setVisible(false);
        this.adBonusBtn.on('pointerdown', function() { self.showAdBonusMenu(); });
    }

    showAdBonusButton(show) { this.adBonusBtn.setVisible(show); this.adBonusBtnText.setVisible(show); this.adBonusBg.setVisible(show); }

    showAdBonusMenu() {
        if (this._adMenuOpen) return; this._adMenuOpen = true;
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, elements = [];
        elements.push(this.add.rectangle(W/2,H/2,W,H,0x000000,0.8).setDepth(200));
        elements.push(this.add.text(W/2, 60, 'AD BONUSES', {fontSize:'12px',color:'#f0c866',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(201));
        var deco = this.add.graphics().setDepth(201);
        deco.fillStyle(0x6a4a2a, 0.5); deco.fillRect(W/2-100, 78, 200, 2);
        elements.push(deco);

        var bonuses = CONFIG.ADS.rewardedBonuses, bk = Object.keys(bonuses), y = 100;
        for (var i = 0; i < bk.length; i++) {
            var key = bk[i], bonus = bonuses[key];
            // Check gem ad limit
            var isGemBonus = bonus.type === 'gems';
            var gemLimitReached = isGemBonus && self.gemAdUsed >= CONFIG.ADS.maxGemAds;

            var bg = this.add.graphics().setDepth(201);
            bg.fillStyle(gemLimitReached ? 0x1a1a1a : 0x2a1a0e, 0.9); bg.fillRect(W/2-150, y-16, 300, 32);
            bg.lineStyle(1, gemLimitReached ? 0x333333 : 0x6a4a2a, 0.5); bg.strokeRect(W/2-150, y-16, 300, 32);
            elements.push(bg);

            var desc = bonus.desc;
            if (isGemBonus) desc += ' (' + self.gemAdUsed + '/' + CONFIG.ADS.maxGemAds + ')';
            var bt = this.add.text(W/2-20, y, desc, {fontSize:'7px',color: gemLimitReached ? '#666666' : '#d4c4a4',fontFamily:FONT}).setOrigin(0.5).setDepth(202);
            var ai = this.add.text(W/2+120, y, gemLimitReached ? 'MAX' : 'WATCH', {fontSize:'6px',color: gemLimitReached ? '#666666' : '#cc88ee',fontFamily:FONT}).setOrigin(0.5).setDepth(202);
            elements.push(bt, ai);

            if (!gemLimitReached) {
                var hitbox = this.add.rectangle(W/2, y, 300, 32, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
                elements.push(hitbox);
                (function(k,hb) { hb.on('pointerdown', function() { showRewardedAd(function(){self.applyAdBonus(k);},function(){}); }); })(key,hitbox);
            }
            y += 40;
        }
        var closeBtn = this.add.rectangle(W/2, y+20, 120, 30, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
        var closeBg = this.add.graphics().setDepth(201);
        closeBg.fillStyle(0x4a1a0e, 0.8); closeBg.fillRect(W/2-60, y+5, 120, 30);
        closeBg.lineStyle(1, 0x8a3a1a, 0.6); closeBg.strokeRect(W/2-60, y+5, 120, 30);
        var closeTxt = this.add.text(W/2, y+20, 'CLOSE', {fontSize:'8px',color:'#ee8866',fontFamily:FONT}).setOrigin(0.5).setDepth(202);
        elements.push(closeBtn, closeBg, closeTxt);
        closeBtn.on('pointerdown', function() { for(var e=0;e<elements.length;e++) elements[e].destroy(); self._adMenuOpen=false; });
    }

    applyAdBonus(k) {
        var b = CONFIG.ADS.rewardedBonuses[k]; if (!b) return;
        if (b.type==='gold') { this.addGold(b.amount, true); this.showMessage('+'+b.amount+' gold','#f0c866'); }
        else if (b.type==='gems') { this.gemAdUsed++; this.addGems(b.amount); this.showMessage('+'+b.amount+' gems','#66aaee'); }
        else if (b.type==='buff') { this.damageBuff=b.mult; this.damageBuffEndTime=this.time.now+b.duration; this.showMessage('x'+b.mult+' DMG!','#ee4444'); }
        else if (b.type==='heal') { this.castleHp=this.maxCastleHp; this.updateHpText(); this.showMessage('Castle healed!','#44cc44'); }
    }

    createSoundToggle() {
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        this.soundBtn = this.add.text(W-14, H-28, 'SFX', {fontSize:'6px',color:'#8a6a42',fontFamily:FONT}).setOrigin(1,0.5).setDepth(105).setInteractive({useHandCursor:true});
        this.soundBtn.on('pointerdown', function() { window.sfx.enabled = !window.sfx.enabled; self.soundBtn.setColor(window.sfx.enabled ? '#8a6a42' : '#4a2a1a'); });
    }

    updateWeaponButtons() {
        for (var i=0;i<this.weaponButtons.length;i++) {
            var wb = this.weaponButtons[i], u = this.unlockedWeapons.indexOf(wb.weaponType)!==-1, s = wb.weaponType===this.currentWeapon;
            wb.lockIcon.setVisible(!u);
            wb.bg.clear();
            var btnW = wb.btn.width;
            if (!u) {
                wb.bg.fillStyle(0x0a0a0a, 0.6); wb.bg.fillRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
                wb.bg.lineStyle(1, 0x333333, 0.3); wb.bg.strokeRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
            } else if (s) {
                wb.bg.fillStyle(0x1a2a3a, 0.8); wb.bg.fillRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
                wb.bg.lineStyle(2, 0xf0c866, 0.8); wb.bg.strokeRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
                wb.bg.lineStyle(1, 0xf0c866, 0.2); wb.bg.strokeRect(wb.btn.x-btnW/2+2, wb.btn.y-16, btnW-4, 32);
            } else {
                wb.bg.fillStyle(0x1a0e0a, 0.8); wb.bg.fillRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
                wb.bg.lineStyle(1, 0x6a4a2a, 0.5); wb.bg.strokeRect(wb.btn.x-btnW/2, wb.btn.y-18, btnW, 36);
            }
        }
    }

    selectWeapon(wt) {
        if (this.unlockedWeapons.indexOf(wt)===-1) return;
        this.currentWeapon = wt; this.updateWeaponText(); this.updateWeaponButtons(); window.sfx.purchase();
        var wtk = 'weapon_'+wt;
        if (this.textures.exists(wtk)) {
            if (this.weaponEmoji) { this.weaponEmoji.destroy(); this.weaponEmoji=null; }
            if (!this.weaponSprite) { this.weaponSprite = this.add.image(this.crossbowX,this.crossbowY,wtk).setDisplaySize(48,48).setOrigin(0.3,0.5).setDepth(50); }
            else this.weaponSprite.setTexture(wtk);
        } else {
            if (this.weaponSprite) { this.weaponSprite.destroy(); this.weaponSprite=null; }
            if (!this.weaponEmoji) { this.weaponEmoji = this.add.text(this.crossbowX,this.crossbowY,CONFIG.WEAPONS[wt].icon,{fontSize:'28px'}).setOrigin(0.5).setDepth(50); }
            else this.weaponEmoji.setText(CONFIG.WEAPONS[wt].icon);
        }
    }

    updateWeaponText() { var w=CONFIG.WEAPONS[this.currentWeapon]; this.weaponText.setText(w.icon+' '+w.name); }

    onBossKilled(enemyType) {
        this.bossesKilled++; this.bossText.setText('Bosses:'+this.bossesKilled);
        var isMega = enemyType && (enemyType.indexOf('MEGA') !== -1);
        // Track mega boss kills for loadout slot unlocking
        if (isMega) {
            this.megaBossKilledInRun = (this.megaBossKilledInRun || 0) + 1;
        }
        // Queue boss perk reward (handled in update() when no picker is open)
        this.pendingBossReward = isMega ? 'mega' : 'boss';
        // Boss kill rewarded ad
        if (CONFIG.ADS.bossKillAd) {
            var self = this;
            this.time.delayedCall(1000, function() {
                self.showBossRewardPopup();
            });
        }
    }

    showBossRewardPopup() {
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, elements = [];
        var overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(200);
        elements.push(overlay);
        var title = this.add.text(W/2, H/2-40, 'BOSS KILLED!', {fontSize:'12px',color:'#f0c866',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(201);
        elements.push(title);
        var adBtnBg = this.add.graphics().setDepth(201);
        adBtnBg.fillStyle(0x2a1a3a, 0.8); adBtnBg.fillRect(W/2-80, H/2-5, 160, 30);
        adBtnBg.lineStyle(1, 0x8844aa, 0.6); adBtnBg.strokeRect(W/2-80, H/2-5, 160, 30);
        elements.push(adBtnBg);
        var adBtn = this.add.rectangle(W/2, H/2+10, 160, 30, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
        var adTxt = this.add.text(W/2, H/2+10, 'x2 GOLD (AD)', {fontSize:'7px',color:'#cc88ee',fontFamily:FONT}).setOrigin(0.5).setDepth(202);
        elements.push(adBtn, adTxt);
        adBtn.on('pointerdown', function() {
            showRewardedAd(function(){
                self.addGold(200, true); self.showMessage('+200 gold!', '#f0c866');
            }, function(){});
            for(var e=0;e<elements.length;e++) elements[e].destroy();
        });
        var skipBg = this.add.graphics().setDepth(201);
        skipBg.fillStyle(0x2a1a0e, 0.6); skipBg.fillRect(W/2-40, H/2+35, 80, 22);
        skipBg.lineStyle(1, 0x6a4a2a, 0.4); skipBg.strokeRect(W/2-40, H/2+35, 80, 22);
        elements.push(skipBg);
        var skipBtn = this.add.rectangle(W/2, H/2+46, 80, 22, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
        var skipTxt = this.add.text(W/2, H/2+46, 'SKIP', {fontSize:'6px',color:'#aa9988',fontFamily:FONT}).setOrigin(0.5).setDepth(202);
        elements.push(skipBtn, skipTxt);
        skipBtn.on('pointerdown', function() { for(var e=0;e<elements.length;e++) elements[e].destroy(); });
        // Auto-close after 5 seconds
        this.time.delayedCall(5000, function() {
            for(var e=0;e<elements.length;e++) { if(elements[e] && elements[e].scene) elements[e].destroy(); }
        });
    }

    showMessage(text, color) {
        var msg = this.add.text(CONFIG.GAME_WIDTH/2, 80, text, {fontSize:'10px',color:color||'#d4c4a4',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(150).setAlpha(0);
        this.tweens.add({targets:msg,alpha:1,duration:150});
        this.tweens.add({targets:msg,y:65,alpha:0,delay:1300,duration:600,onComplete:function(){msg.destroy();}});
    }

    // Visual gem drop
    spawnGemDrop(x, y, count) {
        var self = this;
        for (var i = 0; i < count; i++) {
            var gem = this.add.text(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20, '💎', {fontSize:'14px'}).setOrigin(0.5).setDepth(70);
            var targetX = 50, targetY = 30; // Position of gems counter
            (function(g, delay){
                self.time.delayedCall(delay, function() {
                    self.tweens.add({
                        targets: g, x: targetX, y: targetY, scale: 0.5, duration: 500, ease: 'Power2',
                        onComplete: function() {
                            g.destroy();
                            self.addGems(1);
                            // Bump animation on counter
                            if (self.gemsText) {
                                self.tweens.add({targets: self.gemsText, scale: 1.3, duration: 100, yoyo: true});
                            }
                        }
                    });
                });
            })(gem, i * 150);
        }
    }

    addGold(a, raw) {
        var amt = raw ? a : Math.round(a * (this.waveGoldMult || 1));
        this.gold += amt;
        this.runGoldEarned = (this.runGoldEarned || 0) + amt;
        this.goldText.setText('Gold:'+this.gold); window.sfx.coinPickup();
        if(this.killText) this.killText.setText('Kills:'+this.totalKills);
    }
    addGems(a) { this.gems+=a; this.updateGemsText(); }
    updateGemsText() { this.gemsText.setText('Gems:'+this.gems); }
    updateHpText() {
        var hp = Math.max(0, this.castleHp); this.hpText.setText('HP:'+hp+'/'+this.maxCastleHp);
        if (this.castleHpBar) { var p=hp/this.maxCastleHp; this.castleHpBar.scaleX=p;
            if(p>0.5)this.castleHpBar.setFillStyle(0x44cc44);else if(p>0.25)this.castleHpBar.setFillStyle(0xccaa33);else this.castleHpBar.setFillStyle(0xcc3333); }
    }
    damageCastle(d) {
        var actual = (this.castleShieldActive) ? Math.max(1, Math.floor(d * (1 - this.castleShieldReduction))) : d;
        this.castleHp -= actual; this.updateHpText();
        this.tweens.add({targets:this.castle,x:'+=4',duration:40,yoyo:true,repeat:2});
        if(this.vfx) this.vfx.castleImpact(CONFIG.CASTLE.x, CONFIG.CASTLE.y);
        window.sfx.castleHit(); if(this.castleHp<=0) this.gameOver();
    }

    setupInput() {
        this.isShooting = false; this.lastPointer = {x:CONFIG.GAME_WIDTH/2,y:CONFIG.GAME_HEIGHT/2}; var self = this;
        this.input.on('pointerdown', function(p) { window.sfx.ensure(); if(p.y>CONFIG.GAME_HEIGHT-56) return; self.isShooting=true; self.lastPointer={x:p.x,y:p.y}; });
        this.input.on('pointerup', function() { self.isShooting=false; });
        this.input.on('pointermove', function(p) { self.updateCrosshair(p.x,p.y); self.lastPointer={x:p.x,y:p.y}; });
        var WEAPON_HOTKEYS = ['ONE','TWO','THREE','FOUR','FIVE'];
        for (var wki = 0; wki < Math.min((self.unlockedWeapons||[]).length, WEAPON_HOTKEYS.length); wki++) {
            (function(weaponType, key) {
                self.input.keyboard.on('keydown-' + key, function() { self.selectWeapon(weaponType); });
            })(self.unlockedWeapons[wki], WEAPON_HOTKEYS[wki]);
        }
        // Dynamic magic hotkeys Q/W/E/R/T based on activeMagic loadout order
        var MAGIC_HOTKEYS = ['Q','W','E','R','T'];
        for (var hki = 0; hki < Math.min((self.activeMagic||[]).length, MAGIC_HOTKEYS.length); hki++) {
            (function(magicType, key) {
                self.input.keyboard.on('keydown-' + key, function() { self.useMagic(magicType); });
            })(self.activeMagic[hki], MAGIC_HOTKEYS[hki]);
        }
    }

    shoot(tx, ty) {
        var st = this.weaponStates[this.currentWeapon], ct = this.time.now;
        if (ct - this.lastFireTime < st.fireRate) return; this.lastFireTime = ct;
        var extraFromAmmo = (this.ammoEffects && this.ammoEffects.multi) ? this.ammoEffects.multi : 0;
        var tp = 1 + extraFromAmmo, sa = 10;
        var ba = Phaser.Math.Angle.Between(this.crossbowX,this.crossbowY,tx,ty), bd = st.damage*this.damageBuff;
        var weapon = CONFIG.WEAPONS[this.currentWeapon];

        // CANNON — chain shot (Книппель): two cannonballs connected by a chain
        if (this.currentWeapon === 'CANNON' && st.chainShot) {
            var a1 = ba - Phaser.Math.DegToRad(5), a2 = ba + Phaser.Math.DegToRad(5);
            var p1 = new Projectile(this, this.crossbowX, this.crossbowY, this.crossbowX+Math.cos(a1)*800, this.crossbowY+Math.sin(a1)*800, Math.floor(bd*1.2), Math.floor(st.speed*0.85), 'CANNON', st);
            var p2 = new Projectile(this, this.crossbowX, this.crossbowY, this.crossbowX+Math.cos(a2)*800, this.crossbowY+Math.sin(a2)*800, Math.floor(bd*1.2), Math.floor(st.speed*0.85), 'CANNON', st);
            this.projectiles.push(p1, p2);
            if (!this.chainShotPairs) this.chainShotPairs = [];
            this.chainShotPairs.push({ p1:p1, p2:p2, gfx:this.add.graphics().setDepth(45), hitEnemies:new Set(), chainDmg:Math.floor(bd*0.5) });
        } else if (weapon.flameCone) {
            // Flame cone: multiple spread projectiles
            var flameCount = (weapon.flameSpread || 5) + (this.flameSpreadBonus || 0);
            var flameAngle = Phaser.Math.DegToRad(weapon.flameAngle || 15);
            for (var f = 0; f < flameCount; f++) {
                var offset = (f - (flameCount-1)/2) * flameAngle / (flameCount-1) * 2;
                var fAngle = ba + offset;
                this.projectiles.push(new Projectile(this, this.crossbowX,this.crossbowY, this.crossbowX+Math.cos(fAngle)*300,this.crossbowY+Math.sin(fAngle)*300, bd,st.speed,this.currentWeapon,st));
            }
        } else {
            // BOOMERANG triple perk: extra boomerangs at offset angles
            var extraBoomerang = (this.currentWeapon === 'BOOMERANG' && this.boomerangTriple) ? Math.min(this.boomerangTriple, 4) : 0;
            // CROSSBOW barrage perk: extra arrows in a wide fan
            var extraCrossbow = (this.currentWeapon === 'CROSSBOW' && this.crossbowBarrage) ? Math.min(this.crossbowBarrage, 8) : 0;
            var totalExtra = extraFromAmmo + extraBoomerang + extraCrossbow;
            var tp2 = 1 + totalExtra;
            // Wider spread for crossbow barrage
            var spreadAngle = (extraCrossbow > 0) ? 20 : sa;
            for (var i=0;i<tp2;i++) {
                var a = ba; if(tp2>1) { var sr=Phaser.Math.DegToRad(spreadAngle), o=(i-(tp2-1)/2)*sr; a=ba+o; }
                this.projectiles.push(new Projectile(this, this.crossbowX,this.crossbowY, this.crossbowX+Math.cos(a)*800,this.crossbowY+Math.sin(a)*800, bd,st.speed,this.currentWeapon,st));
            }
        }

        var fl = this.add.rectangle(this.crossbowX+Math.cos(ba)*14, this.crossbowY+Math.sin(ba)*14, 4, 4, 0xffcc44);
        this.tweens.add({targets:fl,alpha:0,scale:3,duration:60,onComplete:function(){fl.destroy();}});
        window.sfx.shoot(this.currentWeapon);
        var rt = this.weaponSprite||this.weaponEmoji;
        if (rt) this.tweens.add({targets:rt,scale:0.88,duration:35,yoyo:true});
    }

    distToSegment(px, py, ax, ay, bx, by) {
        var dx = bx-ax, dy = by-ay, len2 = dx*dx+dy*dy;
        if (len2 === 0) return Math.hypot(px-ax, py-ay);
        var t = Math.max(0, Math.min(1, ((px-ax)*dx+(py-ay)*dy)/len2));
        return Math.hypot(px-(ax+t*dx), py-(ay+t*dy));
    }

    updateChainShots() {
        for (var ci = this.chainShotPairs.length-1; ci >= 0; ci--) {
            var pair = this.chainShotPairs[ci];
            var a1 = pair.p1.active, a2 = pair.p2.active;
            if (!a1 && !a2) { pair.gfx.destroy(); this.chainShotPairs.splice(ci, 1); continue; }
            var x1 = a1 ? pair.p1.x : pair.p2.x, y1 = a1 ? pair.p1.y : pair.p2.y;
            var x2 = a2 ? pair.p2.x : pair.p1.x, y2 = a2 ? pair.p2.y : pair.p1.y;
            // Draw chain — two segments with a midpoint offset for catenary look
            pair.gfx.clear();
            pair.gfx.lineStyle(3, 0xcc9944, 0.9);
            var mx = (x1+x2)*0.5 + (y2-y1)*0.08, my = (y1+y2)*0.5 + (x1-x2)*0.08;
            pair.gfx.beginPath(); pair.gfx.moveTo(x1,y1); pair.gfx.lineTo(mx,my); pair.gfx.lineTo(x2,y2); pair.gfx.strokePath();
            // Cannonball end-caps
            pair.gfx.fillStyle(0x884400, 1.0); pair.gfx.fillCircle(x1,y1,5); pair.gfx.fillCircle(x2,y2,5);
            // Chain deals damage to enemies close to the line
            if (a1 || a2) {
                for (var ei = 0; ei < this.enemies.length; ei++) {
                    var en = this.enemies[ei];
                    if (pair.hitEnemies.has(en)) continue;
                    if (this.distToSegment(en.x, en.y, x1, y1, x2, y2) < 20) {
                        pair.hitEnemies.add(en);
                        en.takeDamage(pair.chainDmg, false);
                    }
                }
            }
        }
    }

    useMagic(mt) {
        if (this.magicInProgress) return;
        if (this.activeMagic && this.activeMagic.indexOf(mt) === -1) return;
        var mg = CONFIG.MAGIC[mt], ct = this.time.now;
        var cooldown = Math.floor(mg.cooldown * this.magicCdMult);
        if (ct < this.magicCooldowns[mt]) return;
        var manaCost = mg.manaCost || 0;
        if (this.mana < manaCost) return;
        this.magicInProgress = true;
        this.mana -= manaCost;
        this.updateManaBar();
        this.magicCooldowns[mt] = ct + cooldown; window.sfx.magic(mt);
        if (mt==='WIND') Magic.useWind(this);
        else if (mt==='FREEZE') Magic.useFreeze(this);
        else if (mt==='LIGHTNING') Magic.useLightning(this);
        else if (mt==='HEAL') this.healCastle(Math.floor((mg.healAmount || 50) * this.magicDurationMult) + (this.healPowerBonus || 0));
        else if (mt==='METEOR') Magic.useMeteor(this);
        else if (mt==='SHIELD') Magic.useShield(this);
        else if (mt==='LAVA') Magic.useLava(this);
        else if (mt==='TORNADO') Magic.useTornado(this);
        var self = this; this.time.delayedCall(100, function(){self.magicInProgress=false;});
    }

    healCastle(amt) {
        this.castleHp = Math.min(this.maxCastleHp, this.castleHp+amt); this.updateHpText();
        var x=CONFIG.CASTLE.x, y=CONFIG.CASTLE.y;
        for (var i=0;i<5;i++) { var p=this.add.rectangle(x+(Math.random()-0.5)*30,y+(Math.random()-0.5)*40,2,2,0x44cc88);
            this.tweens.add({targets:p,y:p.y-20-Math.random()*15,alpha:0,duration:600,onComplete:function(){p.destroy();}}); }
        var t = this.add.text(x, y-40, '+'+amt, {fontSize:'9px',color:'#44cc88',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5);
        this.tweens.add({targets:t,y:t.y-20,alpha:0,duration:800,onComplete:function(){t.destroy();}});
    }

    startWave() {
        if (this.waveInProgress) return;
        this.currentWave++; this.waveInProgress = true; this.waitingForNextWave = false;
        this.waveGoldMult = 1; this.currentEvent = null;

        var levelName = this.levelConfig.name || ('Level ' + this.currentLevel);
        var waveSuffix = this.levelConfig.endless ? '∞' : this.maxWavesInLevel;
        this.waveText.setText(levelName + ' - Wave ' + this.currentWave + '/' + waveSuffix);
        this.showAdBonusButton(false);

        // Check for events every 5 waves (starting wave 5)
        if (this.currentWave >= 5 && this.currentWave % 5 === 0) {
            this.checkForEvent();
        }

        this.showWaveAnnouncement(); this.spawnWave();
    }

    spawnWave() {
        var we = this.generateWaveEnemies(), sd = this.getSpawnDelay(), self = this, idx = 0;
        var useArena = CONFIG.ARENA_SPAWN && CONFIG.ARENA_SPAWN.enabled;
        var positions = useArena ? this.getArenaSpawnPositions(we.length) : null;
        this.pendingSpawnCount = we.length;
        if (we.length>0) { this.spawnEnemy(we[idx], positions ? positions[idx] : null); idx++; }
        if (we.length>1) { this.spawnTimer = this.time.addEvent({delay:sd,callback:function(){if(idx<we.length){self.spawnEnemy(we[idx],positions?positions[idx]:null);idx++;}if(idx>=we.length)self.waveInProgress=false;},repeat:we.length-2}); }
        else this.waveInProgress = false;
    }

    spawnEnemy(et, pos) {
        var m = this.getWaveMultiplier(), self = this;
        // Apply event modifiers
        var ev = this.currentEvent ? CONFIG.EVENTS[this.currentEvent] : null;
        if (ev && ev.hpMult) m.hp *= ev.hpMult;
        if (ev && ev.speedMult) m.speed *= ev.speedMult;
        // Apply enemySlowAll perk
        if (this.enemySlowAllValue > 0) m.speed *= (1 - this.enemySlowAllValue);
        if (et==='BOSS'||et==='MEGA_BOSS'||et==='MEGA_GOLEM') { var c=CONFIG.WAVE_CONFIG; m.hp*=Math.pow(c.bossHpMultiplier,this.bossesKilled); m.damage*=Math.pow(c.bossDamageMultiplier,this.bossesKilled); }
        if (pos) {
            var cfg = CONFIG.ENEMIES[et], color = cfg ? cfg.color : 0x9900ff, size = cfg ? cfg.size : 48;
            this.showSpawnPortal(pos.x, pos.y, color, size, function() {
                if (self.pendingSpawnCount > 0) self.pendingSpawnCount--;
                var enemy = new Enemy(self, et, m, pos);
                var parts = [enemy.sprite, enemy.healthBar, enemy.healthBarBg];
                if (enemy.icon) parts.push(enemy.icon);
                if (enemy.eliteOverlay) parts.push(enemy.eliteOverlay);
                for (var i = 0; i < parts.length; i++) if (parts[i]) parts[i].setAlpha(0);
                self.tweens.add({ targets: parts.filter(Boolean), alpha: 1, duration: 200 });
                self.enemies.push(enemy);
            });
        } else {
            if (this.pendingSpawnCount > 0) this.pendingSpawnCount--;
            this.enemies.push(new Enemy(this, et, m));
        }
    }

    // Генерация позиций спавна с балансным паттерном
    getArenaSpawnPositions(count) {
        var z = CONFIG.ARENA_SPAWN, positions = [];
        var zoneW = z.maxX - z.minX, zoneH = z.maxY - z.minY;
        if (count <= 4) {
            // Случайные позиции с минимальным расстоянием
            for (var i = 0; i < count; i++) {
                var pos, ok, att = 0;
                do {
                    pos = { x: z.minX + Math.random()*zoneW, y: z.minY + Math.random()*zoneH };
                    ok = true;
                    for (var j = 0; j < positions.length; j++) {
                        var dx = positions[j].x - pos.x, dy = positions[j].y - pos.y;
                        if (dx*dx + dy*dy < z.minSpacing*z.minSpacing) { ok = false; break; }
                    }
                    att++;
                } while (!ok && att < 25);
                positions.push(pos);
            }
        } else {
            // Равномерное распределение по высоте со случайным X
            for (var i = 0; i < count; i++) {
                var t = count === 1 ? 0.5 : i / (count - 1);
                var x = z.minX + zoneW * (0.2 + Math.random() * 0.6);
                var y = z.minY + t * zoneH + (Math.random() - 0.5) * Math.min(40, zoneH / count * 0.6);
                positions.push({ x: x, y: Phaser.Math.Clamp(y, z.minY + 20, z.maxY - 20) });
            }
            // Перемешиваем чтобы враги не появлялись сверху вниз строго по порядку
            for (var i = positions.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = positions[i]; positions[i] = positions[j]; positions[j] = tmp;
            }
        }
        return positions;
    }

    // Визуальный эффект телепорт-портала
    showSpawnPortal(x, y, color, size, onSpawn) {
        var dur = CONFIG.ARENA_SPAWN.portalDuration, self = this, r = Math.max(size * 0.5, 24);
        // Тёмное ядро портала
        var center = this.add.circle(x, y, r, 0x000022, 0.7).setScale(0.05).setDepth(48);
        this.tweens.add({ targets: center, scale: 1, duration: dur*0.4, ease: 'Back.Out' });
        this.tweens.add({ targets: center, scale: 0.05, delay: dur*0.6, duration: dur*0.35, ease: 'Power2',
            onComplete: function() { center.destroy(); } });
        // Светящийся обод
        var ring = this.add.circle(x, y, r, 0, 0).setStrokeStyle(3, color, 1.0).setScale(0.05).setDepth(49);
        this.tweens.add({ targets: ring, scale: 1, duration: dur*0.4, ease: 'Back.Out' });
        this.tweens.add({ targets: ring, scale: 0.05, alpha: 0, delay: dur*0.6, duration: dur*0.35, ease: 'Power2',
            onComplete: function() { ring.destroy(); } });
        // 4 вращающиеся искры
        for (var i = 0; i < 4; i++) {
            var sa = (i / 4) * Math.PI * 2;
            (function(startAngle) {
                var proxy = { a: startAngle };
                var spark = self.add.rectangle(x + Math.cos(startAngle)*r, y + Math.sin(startAngle)*r, 4, 4, color, 0.85).setDepth(50);
                self.tweens.add({ targets: proxy, a: startAngle + Math.PI*2, duration: dur*0.75, ease: 'Linear',
                    onUpdate: function() { spark.x = x + Math.cos(proxy.a)*r; spark.y = y + Math.sin(proxy.a)*r; },
                    onComplete: function() { spark.destroy(); }
                });
            })(sa);
        }
        // Вспышка при появлении врага
        this.time.delayedCall(dur * 0.65, function() {
            var flash = self.add.circle(x, y, r, 0xffffff, 0.45).setDepth(51);
            self.tweens.add({ targets: flash, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 180,
                onComplete: function() { flash.destroy(); } });
            onSpawn();
        });
    }

    generateWaveEnemies() {
        var c = CONFIG.WAVE_CONFIG, lc = this.levelConfig, w = this.currentWave;
        var absoluteWave = (this.currentLevel - 1) * 30 + w;
        var forceElite = this.currentEvent === 'ELITE_INVASION';
        var ec = 0;
        if (absoluteWave >= c.eliteStartWave) {
            ec = Math.min(0.65, c.eliteChanceBase + (absoluteWave - c.eliteStartWave) * c.eliteChancePerWave);
        }

        // Build progressive weighted pool based on enemyUnlocks
        var pool = [];
        if (lc.enemyUnlocks && lc.enemyWeights) {
            var waveThresholds = Object.keys(lc.enemyUnlocks).map(Number).sort(function(a,b){return a-b;});
            var unlocked = {};
            for (var ti = 0; ti < waveThresholds.length; ti++) {
                if (w >= waveThresholds[ti]) {
                    var types = lc.enemyUnlocks[waveThresholds[ti]];
                    for (var tj = 0; tj < types.length; tj++) unlocked[types[tj]] = true;
                }
            }
            for (var type in unlocked) {
                var weight = lc.enemyWeights[type] || 1;
                for (var tw = 0; tw < weight; tw++) pool.push(type);
            }
        }
        if (pool.length === 0) pool = ['GOBLIN'];

        var e = [];
        var isMegaBossWave = lc.megaBossInterval && w % lc.megaBossInterval === 0;
        var isBossWave = !isMegaBossWave && lc.bossInterval && w % lc.bossInterval === 0;

        if (isMegaBossWave && lc.megaBossPool && lc.megaBossPool.length > 0) {
            e.push(lc.megaBossPool[Math.floor(Math.random() * lc.megaBossPool.length)]);
            var n = Math.min(20, Math.max(4, c.baseEnemyCount + Math.floor(w * c.enemiesPerWave / 3)));
            for (var i = 0; i < n; i++) e.push(pool[Math.floor(Math.random() * pool.length)]);
        } else if (isBossWave && lc.bossPool && lc.bossPool.length > 0) {
            e.push(lc.bossPool[Math.floor(Math.random() * lc.bossPool.length)]);
            var n = Math.min(25, Math.max(3, Math.floor((c.baseEnemyCount + Math.floor(w * c.enemiesPerWave / 2)) * 0.6)));
            for (var i = 0; i < n; i++) e.push(pool[Math.floor(Math.random() * pool.length)]);
        } else {
            var n = Math.min(40, c.baseEnemyCount + Math.floor(w * c.enemiesPerWave / 2));
            for (var i = 0; i < n; i++) e.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        return e.map(function(t) {
            if (t === 'BOSS' || t === 'MEGA_BOSS' || t === 'MEGA_GOLEM') return t;
            if (forceElite && CONFIG.ENEMIES[t + '_ELITE']) return t + '_ELITE';
            if (ec > 0 && Math.random() < ec && CONFIG.ENEMIES[t + '_ELITE']) return t + '_ELITE';
            return t;
        });
    }

    getSpawnDelay() {
        var c = CONFIG.WAVE_CONFIG;
        return Math.max(c.spawnDelayMin, c.spawnDelayBase - (this.currentWave * c.spawnDelayReduction));
    }
    getWaveMultiplier() {
        var c = CONFIG.WAVE_CONFIG;
        var absoluteWave = (this.currentLevel - 1) * 30 + this.currentWave;
        return { hp: 1 + (absoluteWave - 1) * c.hpMultiplier, damage: 1 + (absoluteWave - 1) * c.damageMultiplier, speed: 1 + (absoluteWave - 1) * c.speedMultiplier };
    }

    showWaveAnnouncement() {
        var lc = this.levelConfig;
        var isMegaBossWave = lc.megaBossInterval && this.currentWave % lc.megaBossInterval === 0;
        var isBossWave = !isMegaBossWave && lc.bossInterval && this.currentWave % lc.bossInterval === 0;
        var t, co, ib = false;
        if (isMegaBossWave) { t = '** МЕГА-БОСС **'; co = '#ff4444'; ib = true; window.sfx.bossAppear(); }
        else if (isBossWave) { t = '** BOSS WAVE **'; co = '#f0c866'; ib = true; window.sfx.bossAppear(); }
        else { t = 'WAVE ' + this.currentWave; co = '#d4c4a4'; window.sfx.waveStart(); }
        if (this.vfx) this.vfx.waveBanner(t, co, ib);
    }

    levelComplete() {
        this.waveInProgress = false;
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var reward = this.levelConfig.reward || { gems: 3, gold: 50 };

        // Save progress
        var prog = window.gameProgress || {};
        if (!prog.unlockedLevels) prog.unlockedLevels = [1];
        var nextLevel = this.currentLevel + 1;
        if (prog.unlockedLevels.indexOf(nextLevel) === -1 && CONFIG.LEVELS[nextLevel]) {
            prog.unlockedLevels.push(nextLevel);
        }
        prog.gems = (prog.gems || 0) + reward.gems + this.gems;
        prog.gold = (prog.gold || 0) + (this.runGoldEarned || 0);
        prog.megaBossKills = (prog.megaBossKills || 0) + (this.megaBossKilledInRun || 0);
        if (!prog.bestWavePerLevel) prog.bestWavePerLevel = {};
        if (!prog.bestWavePerLevel[this.currentLevel] || this.currentWave > prog.bestWavePerLevel[this.currentLevel]) {
            prog.bestWavePerLevel[this.currentLevel] = this.currentWave;
        }
        window.gameProgress = prog;
        saveGameProgress();

        // Victory screen
        var ov = this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(200);
        this.tweens.add({targets:ov,alpha:0.85,duration:600});

        var frame = this.add.graphics().setDepth(201).setAlpha(0);
        frame.fillStyle(0x1a2a1a, 0.95); frame.fillRect(W/2-160, H/2-100, 320, 200);
        frame.lineStyle(2, 0x6a9a3a); frame.strokeRect(W/2-160, H/2-100, 320, 200);
        this.tweens.add({targets:frame,alpha:1,delay:300,duration:300});

        var ti = this.add.text(W/2,H/2-70,'LEVEL COMPLETE!',{fontSize:'14px',color:'#88ee66',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:ti,alpha:1,delay:500,duration:300});

        var rewards = this.add.text(W/2,H/2-30,'+'+reward.gems+' Gems  +'+reward.gold+' Gold',{fontSize:'8px',color:'#f0c866',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:rewards,alpha:1,delay:700,duration:300});

        var st = this.add.text(W/2,H/2-5,'Kills:'+this.totalKills+'  Bosses:'+this.bossesKilled,{fontSize:'7px',color:'#aa9988',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:st,alpha:1,delay:800,duration:300});

        // Menu button
        var rbg = this.add.graphics().setDepth(201).setAlpha(0);
        rbg.fillStyle(0x2a4a1a, 0.8); rbg.fillRect(W/2-60, H/2+30, 120, 30);
        rbg.lineStyle(2, 0x6a9a3a, 0.7); rbg.strokeRect(W/2-60, H/2+30, 120, 30);
        this.tweens.add({targets:rbg,alpha:1,delay:1000,duration:300});

        var rb = this.add.rectangle(W/2,H/2+45,120,30,0x000000,0).setInteractive({useHandCursor:true}).setDepth(203).setAlpha(0);
        var rt = this.add.text(W/2,H/2+45,'MENU',{fontSize:'8px',color:'#aaee88',fontFamily:FONT}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:[rb,rt],alpha:1,delay:1000,duration:300});
        rb.on('pointerdown', function(){
            self.scene.start('MenuScene');
        });

        // Next level button
        if (CONFIG.LEVELS[nextLevel]) {
            var nbg = this.add.graphics().setDepth(201).setAlpha(0);
            nbg.fillStyle(0x1a2a3a, 0.8); nbg.fillRect(W/2-60, H/2+70, 120, 30);
            nbg.lineStyle(1, 0x4488cc, 0.6); nbg.strokeRect(W/2-60, H/2+70, 120, 30);
            this.tweens.add({targets:nbg,alpha:1,delay:1100,duration:300});
            var nb = this.add.rectangle(W/2,H/2+85,120,30,0x000000,0).setInteractive({useHandCursor:true}).setDepth(203).setAlpha(0);
            var nt = this.add.text(W/2,H/2+85,'NEXT LEVEL',{fontSize:'7px',color:'#88ccee',fontFamily:FONT}).setOrigin(0.5).setDepth(202).setAlpha(0);
            this.tweens.add({targets:[nb,nt],alpha:1,delay:1100,duration:300});
            nb.on('pointerdown', function(){
                self.scene.start('GameScene', {
                    level: nextLevel,
                    loadout: self.runLoadout
                });
            });
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;
        if (this.damageBuff>1&&time>this.damageBuffEndTime){this.damageBuff=1;this.buffText.setText('');}
        else if(this.damageBuff>1){this.buffText.setText('x'+this.damageBuff+' DMG '+Math.ceil((this.damageBuffEndTime-time)/1000)+'s');}
        if (this.isShooting && this.lastPointer.y < CONFIG.GAME_HEIGHT-56) this.shoot(this.lastPointer.x, this.lastPointer.y);
        for (var i=this.enemies.length-1;i>=0;i--) { if(this.enemies[i]) this.enemies[i].update(time,delta); }
        for (var j=this.projectiles.length-1;j>=0;j--) { if(this.projectiles[j]) this.projectiles[j].update(); }
        // Chain shot pairs — draw chain and apply chain damage
        if (this.chainShotPairs && this.chainShotPairs.length > 0) { this.updateChainShots(); }
        // Mana regen
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegenRate * delta / 1000);
            this.updateManaBar();
        }
        // Magic button overlays: cooldown OR not enough mana
        for (var k=0;k<this.magicButtons.length;k++) {
            var b=this.magicButtons[k];
            var onCd = time < this.magicCooldowns[b.magicType];
            var noMana = this.mana < ((CONFIG.MAGIC[b.magicType] && CONFIG.MAGIC[b.magicType].manaCost) || 0);
            b.cooldownOverlay.setVisible(onCd || noMana);
            // Cooldown bar and countdown timer
            if (b.cdBar) {
                if (onCd) {
                    var rem = Math.max(0, this.magicCooldowns[b.magicType] - time);
                    var totalCd = Math.floor(((CONFIG.MAGIC[b.magicType] && CONFIG.MAGIC[b.magicType].cooldown) || 5000) * (this.magicCdMult || 1));
                    var progress = 1 - rem / totalCd; // 0=just started, 1=ready
                    b.cdBar.setDisplaySize(Math.round(42 * progress), 4);
                    if (b.cdText) b.cdText.setText(Math.ceil(rem / 1000) + 's');
                } else {
                    b.cdBar.setDisplaySize(0, 4);
                    if (b.cdText) b.cdText.setText('');
                }
            }
        }
        if (this.vfx) { this.vfx.ambientParticle(); this.vfx.updateBossHpBar(); }
        // Boss reward picker: show when all enemies dead, no other picker active
        if (this.pendingBossReward && !this.roguePickerOpen && !this.waveInProgress && this.pendingSpawnCount <= 0 && this.enemies.length === 0) {
            var brt = this.pendingBossReward;
            this.pendingBossReward = null;
            this.roguePickerOpen = true;
            this.waitingForNextWave = true;
            this.showRoguePicker(brt);
        }
        if (this.enemies.length===0&&!this.waveInProgress&&!this.waitingForNextWave&&this.pendingSpawnCount<=0&&!this.roguePickerOpen) {
            this.waitingForNextWave=true;
            if (this.pendingRoguePicks > 0) {
                this.pendingRoguePicks--;
                this.roguePickerOpen = true;
                this.showRoguePicker();
            } else {
                var self=this; this.time.delayedCall(2500, function(){self.startWave();});
            }
        }
    }

    gameOver() {
        this.isGameOver=true; if(this.spawnTimer) this.spawnTimer.remove();
        if(this.vfx) this.vfx.destroyBossHpBar();
        var self=this, W=CONFIG.GAME_WIDTH, H=CONFIG.GAME_HEIGHT;
        window.sfx.gameOverSound();
        if(this.vfx){this.vfx.flash(0xff0000,0.3,400);this.vfx.shake(0.012,400);}
        var ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(200);
        this.tweens.add({targets:ov,alpha:0.85,duration:600});

        var frame = this.add.graphics().setDepth(201).setAlpha(0);
        frame.fillStyle(0x2a1a0e, 0.95); frame.fillRect(W/2-160, H/2-100, 320, 200);
        frame.lineStyle(2, 0x6a4a2a); frame.strokeRect(W/2-160, H/2-100, 320, 200);
        frame.lineStyle(1, 0x8a6a42, 0.3); frame.strokeRect(W/2-158, H/2-98, 316, 196);
        frame.fillStyle(0x8a6a42, 0.6);
        frame.fillRect(W/2-160,H/2-100,6,6); frame.fillRect(W/2+154,H/2-100,6,6);
        frame.fillRect(W/2-160,H/2+94,6,6); frame.fillRect(W/2+154,H/2+94,6,6);
        this.tweens.add({targets:frame,alpha:1,delay:300,duration:300});

        var ti=this.add.text(W/2,H/2-70,'DEFEAT',{fontSize:'16px',color:'#ee4444',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:ti,alpha:1,delay:500,duration:300});

        var dline = this.add.graphics().setDepth(202).setAlpha(0);
        dline.fillStyle(0x6a4a2a, 0.5); dline.fillRect(W/2-80, H/2-50, 160, 2);
        this.tweens.add({targets:dline,alpha:1,delay:600,duration:200});

        var st=this.add.text(W/2,H/2-30,'Wave:'+this.currentWave+'  Bosses:'+this.bossesKilled+'  Kills:'+this.totalKills,{fontSize:'7px',color:'#aa9988',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:st,alpha:1,delay:700,duration:300});

        // Menu button
        var mbg = this.add.graphics().setDepth(201).setAlpha(0);
        mbg.fillStyle(0x2a4a1a, 0.8); mbg.fillRect(W/2-60, H/2+5, 120, 30);
        mbg.lineStyle(2, 0x6a9a3a, 0.7); mbg.strokeRect(W/2-60, H/2+5, 120, 30);
        this.tweens.add({targets:mbg,alpha:1,delay:900,duration:300});

        var rb=this.add.rectangle(W/2,H/2+20,120,30,0x000000,0).setInteractive({useHandCursor:true}).setDepth(203).setAlpha(0);
        var rt=this.add.text(W/2,H/2+20,'MENU',{fontSize:'8px',color:'#aaee88',fontFamily:FONT}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:[rb,rt],alpha:1,delay:900,duration:300});
        rb.on('pointerdown', function(){self.scene.start('MenuScene');});

        // Retry button
        var rbg2 = this.add.graphics().setDepth(201).setAlpha(0);
        rbg2.fillStyle(0x2a1a0e, 0.8); rbg2.fillRect(W/2-60, H/2+42, 120, 28);
        rbg2.lineStyle(1, 0x6a4a2a, 0.5); rbg2.strokeRect(W/2-60, H/2+42, 120, 28);
        this.tweens.add({targets:rbg2,alpha:1,delay:950,duration:300});
        var rb2=this.add.rectangle(W/2,H/2+56,120,28,0x000000,0).setInteractive({useHandCursor:true}).setDepth(203).setAlpha(0);
        var rt2=this.add.text(W/2,H/2+56,'RETRY',{fontSize:'7px',color:'#ee8866',fontFamily:FONT}).setOrigin(0.5).setDepth(202).setAlpha(0);
        this.tweens.add({targets:[rb2,rt2],alpha:1,delay:950,duration:300});
        rb2.on('pointerdown', function(){self.scene.restart();});

        if (!this.reviveUsed) {
            var vbg = this.add.graphics().setDepth(201).setAlpha(0);
            vbg.fillStyle(0x2a1a3a, 0.8); vbg.fillRect(W/2-80, H/2+78, 160, 28);
            vbg.lineStyle(1, 0x8844aa, 0.6); vbg.strokeRect(W/2-80, H/2+78, 160, 28);
            this.tweens.add({targets:vbg,alpha:1,delay:1100,duration:300});

            var vb=this.add.rectangle(W/2,H/2+92,160,28,0x000000,0).setInteractive({useHandCursor:true}).setDepth(203).setAlpha(0);
            var vt=this.add.text(W/2,H/2+92,'REVIVE (AD) 1/1',{fontSize:'7px',color:'#cc88ee',fontFamily:FONT}).setOrigin(0.5).setDepth(202).setAlpha(0);
            this.tweens.add({targets:[vb,vt],alpha:1,delay:1100,duration:300});
            vb.on('pointerdown', function(){
                showRewardedAd(function(){
                    self.reviveUsed=true; self.isGameOver=false; self.castleHp=Math.floor(self.maxCastleHp*0.5); self.updateHpText();
                    var rm=self.children.list.filter(function(c){return c.depth>=200;}); for(var r=0;r<rm.length;r++) rm[r].destroy();
                    var tk=self.enemies.slice(0,5); for(var m=0;m<tk.length;m++){if(!tk[m].isDead) tk[m].takeDamage(9999,false);}
                    self.showMessage('Castle revived!','#cc88ee');
                }, function(){});
            });
        }

        // Save gold and megaBoss kills to persistent progress
        var prog = window.gameProgress || {};
        prog.gems = (prog.gems || 0) + Math.floor(this.gems / 2); // Keep half gems on death
        prog.gold = (prog.gold || 0) + (this.runGoldEarned || 0);
        prog.megaBossKills = (prog.megaBossKills || 0) + (this.megaBossKilledInRun || 0);
        if (!prog.bestWavePerLevel) prog.bestWavePerLevel = {};
        if (!prog.bestWavePerLevel[this.currentLevel] || this.currentWave > prog.bestWavePerLevel[this.currentLevel]) {
            prog.bestWavePerLevel[this.currentLevel] = this.currentWave;
        }
        window.gameProgress = prog;
        saveGameProgress();
    }

    // ==============================================
    // MANA BAR
    // ==============================================
    updateManaBar() {
        if (!this.manaBarFill) return;
        var pct = Math.max(0, Math.min(1, this.mana / this.maxMana));
        this.manaBarFill.scaleX = Math.max(0.001, pct);
        if (this.manaValueText) this.manaValueText.setText(Math.floor(this.mana) + '/' + this.maxMana);
    }

    // ==============================================
    // XP BAR
    // ==============================================
    updateXpBar() {
        if (!this.xpBarFill) return;
        var pct = Math.max(0, Math.min(1, this.xp / this.xpToNextLevel));
        this.xpBarFill.scaleX = Math.max(0.001, pct);
        if (this.xpLevelText) this.xpLevelText.setText('Lv.' + this.rogueLevel);
    }

    gainXp(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.rogueLevel++;
            var inc = CONFIG.XP_CONFIG ? CONFIG.XP_CONFIG.xpPerLevelIncrease : 35;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel + inc);
            this.pendingRoguePicks++;
        }
        this.updateXpBar();
    }

    // ==============================================
    // ROGUELIKE PERK PICKER
    // ==============================================

    isPerkRelevant(p) {
        var t = p.type;
        // Weapon-specific perks — only show if weapon is in current loadout
        if (t === 'plasmaExtraBounce' && this.unlockedWeapons.indexOf('PLASMA') === -1 && this.unlockedWeapons.indexOf('BALLISTA') === -1) return false;
        if (t === 'splashRadius'      && this.unlockedWeapons.indexOf('CANNON') === -1) return false;
        if (t === 'boomerangRange'    && this.unlockedWeapons.indexOf('BOOMERANG') === -1) return false;
        if (t === 'ballistaDamage'    && this.unlockedWeapons.indexOf('BALLISTA') === -1) return false;
        if (t === 'crossbowCrit'      && this.unlockedWeapons.indexOf('CROSSBOW') === -1) return false;
        if (t === 'flameSpread'       && this.unlockedWeapons.indexOf('FLAME_TOWER') === -1) return false;
        if (t === 'cannonPush'        && this.unlockedWeapons.indexOf('CANNON') === -1) return false;
        if (t === 'laserSpeed'        && this.unlockedWeapons.indexOf('LASER') === -1) return false;
        if (t === 'chainShot'         && this.unlockedWeapons.indexOf('CANNON') === -1) return false;
        if (t === 'boomerangTriple'   && this.unlockedWeapons.indexOf('BOOMERANG') === -1) return false;
        if (t === 'crossbowBarrage'   && this.unlockedWeapons.indexOf('CROSSBOW') === -1) return false;
        // Magic-specific perks — only if magic type is in active loadout
        if (t === 'windPush'          && this.activeMagic.indexOf('WIND') === -1) return false;
        if (t === 'freezeExtend'      && this.activeMagic.indexOf('FREEZE') === -1) return false;
        if (t === 'healPower'         && this.activeMagic.indexOf('HEAL') === -1) return false;
        return true;
    }

    showRoguePicker(bossRewardType) {
        var self = this, W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var allPerks = CONFIG.ROGUE_PERKS;
        if (!allPerks || allPerks.length === 0) { self.roguePickerOpen = false; self.waitingForNextWave = false; return; }

        // Filter to loadout-relevant perks only
        var perks = allPerks.filter(function(p) { return self.isPerkRelevant(p); });
        if (perks.length === 0) perks = allPerks.slice();

        // Rarity config
        var RARITY_WEIGHTS  = { COMMON: 10, RARE: 5, EPIC: 2, LEGENDARY: 1 };
        var RARITY_BORDER   = { COMMON: 0x888888, RARE: 0x4488ff, EPIC: 0xaa44ff, LEGENDARY: 0xffaa00 };
        var RARITY_NAME_CLR = { COMMON: '#cccccc', RARE: '#88aaff', EPIC: '#cc88ff', LEGENDARY: '#ffcc44' };
        var RARITY_LABEL    = { COMMON: 'ОБЫЧНОЕ', RARE: 'РЕДКОЕ', EPIC: 'ЭПИЧЕСКОЕ', LEGENDARY: '★ ЛЕГЕНДАРНОЕ' };

        // Build weighted pool
        var pool = [];
        for (var pi = 0; pi < perks.length; pi++) {
            var pw = RARITY_WEIGHTS[perks[pi].rarity || 'COMMON'];
            for (var wi = 0; wi < pw; wi++) pool.push(perks[pi]);
        }

        var picks = [], usedIds = {}, attempts = 0;

        // Boss reward: guarantee high-rarity picks
        if (bossRewardType) {
            var highPool = perks.filter(function(p) { return p.rarity === 'EPIC' || p.rarity === 'LEGENDARY'; });
            if (highPool.length > 0) {
                var hCount = bossRewardType === 'mega' ? Math.min(3, highPool.length) : 1;
                var shuffH = highPool.slice().sort(function() { return Math.random() - 0.5; });
                for (var hi = 0; hi < hCount && picks.length < 3; hi++) {
                    picks.push(shuffH[hi]); usedIds[shuffH[hi].id] = true;
                }
            }
        }

        // Fill remaining 3 slots with weighted random
        while (picks.length < 3 && attempts < 400) {
            attempts++;
            if (pool.length === 0) break;
            var cand = pool[Math.floor(Math.random() * pool.length)];
            if (!usedIds[cand.id]) { picks.push(cand); usedIds[cand.id] = true; }
        }
        if (picks.length === 0) { self.roguePickerOpen = false; self.waitingForNextWave = false; return; }

        var elements = [];
        var ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setDepth(300);
        elements.push(ov);

        // Title — different for boss reward vs normal
        var isBossReward = !!bossRewardType;
        var titleTxt = isBossReward
            ? (bossRewardType === 'mega' ? '🌟 МЕГА-БОСС ПОВЕРЖЕН — ЛЕГЕНДАРНАЯ НАГРАДА!' : '👑 БОСС ПОВЕРЖЕН — ОСОБАЯ НАГРАДА!')
            : ('⬆️ Уровень ' + this.rogueLevel + ' — выберите улучшение');
        var titleClr = isBossReward ? '#ffcc44' : '#f0c866';
        var title = this.add.text(W/2, H/2 - 115, titleTxt, {
            fontSize: '10px', color: titleClr, fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(301);
        elements.push(title);

        var cardW = 200, cardH = 120, gap = 16;
        var totalW = picks.length * cardW + (picks.length - 1) * gap;
        var startX = W / 2 - totalW / 2;
        var cardY = H / 2 - cardH / 2 + 5;

        for (var idx = 0; idx < picks.length; idx++) {
            (function(perk, cx) {
                var rarity = perk.rarity || 'COMMON';
                var borderClr = RARITY_BORDER[rarity];
                var nameClr   = RARITY_NAME_CLR[rarity];
                var bgFill = rarity === 'LEGENDARY' ? 0x1a1000 : (rarity === 'EPIC' ? 0x160d22 : (rarity === 'RARE' ? 0x0d1522 : 0x0d0d0d));

                var cardBg = self.add.graphics().setDepth(301);
                function drawCard(hover) {
                    cardBg.clear();
                    cardBg.fillStyle(hover ? (bgFill + 0x111111) : bgFill, 0.97);
                    cardBg.fillRect(cx, cardY, cardW, cardH);
                    cardBg.lineStyle(hover ? 3 : 2, borderClr, hover ? 1.0 : 0.85);
                    cardBg.strokeRect(cx, cardY, cardW, cardH);
                    if (rarity === 'LEGENDARY' || rarity === 'EPIC') {
                        cardBg.lineStyle(1, borderClr, 0.3);
                        cardBg.strokeRect(cx+3, cardY+3, cardW-6, cardH-6);
                    }
                }
                drawCard(false);
                elements.push(cardBg);

                // Rarity label
                var rarityLbl = self.add.text(cx + cardW/2, cardY + 9, RARITY_LABEL[rarity], {
                    fontSize: '5px', color: nameClr, fontFamily: FONT
                }).setOrigin(0.5).setDepth(302);
                elements.push(rarityLbl);

                var iconT = self.add.text(cx + cardW/2, cardY + 32, perk.icon, {fontSize:'26px'}).setOrigin(0.5).setDepth(302);
                elements.push(iconT);

                var nameT = self.add.text(cx + cardW/2, cardY + 62, perk.name, {
                    fontSize:'8px', color: nameClr, fontFamily:FONT, stroke:'#000000', strokeThickness:2,
                    wordWrap: { width: cardW - 12 }
                }).setOrigin(0.5).setDepth(302);
                elements.push(nameT);

                var descT = self.add.text(cx + cardW/2, cardY + 88, perk.desc, {
                    fontSize:'6px', color:'#b0a090', fontFamily:FONT, wordWrap:{width: cardW - 16}
                }).setOrigin(0.5).setDepth(302);
                elements.push(descT);

                var btn = self.add.rectangle(cx + cardW/2, cardY + cardH/2, cardW, cardH, 0x000000, 0)
                    .setInteractive({useHandCursor:true}).setDepth(303);
                elements.push(btn);
                btn.on('pointerover', function() { drawCard(true); });
                btn.on('pointerout',  function() { drawCard(false); });
                btn.on('pointerdown', function() {
                    for (var e=0; e<elements.length; e++) if (elements[e]) elements[e].destroy();
                    self.applyRoguePerk(perk);
                    self.roguePickerOpen = false;
                    self.waitingForNextWave = false;
                });
            })(picks[idx], startX + idx * (cardW + gap));
        }
    }

    applyRoguePerk(perk) {
        var type = perk.type, val = perk.value;
        var wk;
        switch(type) {
            case 'allDamage':
                for (wk in this.weaponStates) this.weaponStates[wk].damage = Math.max(1, Math.floor(this.weaponStates[wk].damage * (1 + val)));
                break;
            case 'allFireRate':
                for (wk in this.weaponStates) this.weaponStates[wk].fireRate = Math.max(50, Math.floor(this.weaponStates[wk].fireRate * (1 - val)));
                break;
            case 'critAll':
                for (wk in this.weaponStates) this.weaponStates[wk].critChance = (this.weaponStates[wk].critChance || 0) + val;
                break;
            case 'manaMax':
                this.maxMana += val; this.mana = Math.min(this.mana + val, this.maxMana); this.updateManaBar();
                break;
            case 'manaRegen':
                this.manaRegenRate += val;
                break;
            case 'magicDamage':
                this.magicDamageMult = (this.magicDamageMult || 1) * (1 + val);
                break;
            case 'magicCooldown':
                this.magicCdMult = Math.max(0.2, (this.magicCdMult || 1) * (1 - val));
                break;
            case 'castleHp':
                this.maxCastleHp += val; this.castleHp += val; this.updateHpText();
                break;
            case 'castleRegen':
                this.castleRegen += val;
                break;
            case 'castleArmor':
                this.armorReduction = Math.min(0.7, (this.armorReduction || 0) + val);
                break;
            case 'pierceAll':
                for (wk in this.weaponStates) this.weaponStates[wk].bounces = (this.weaponStates[wk].bounces || 0) + val;
                break;
            case 'splashRadius':
                if (this.weaponStates.CANNON) this.weaponStates.CANNON.splashRadius = Math.floor(this.weaponStates.CANNON.splashRadius * (1 + val));
                break;
            case 'projRange':
                for (wk in this.weaponStates) this.weaponStates[wk].maxRange = Math.floor((this.weaponStates[wk].maxRange || 400) * (1 + val));
                break;
            case 'gold':
                this.addGold(val);
                break;
            case 'lifesteal':
                this.lifestealPercent = (this.lifestealPercent || 0) + val;
                break;
            case 'electricChain':
                this.extraElectricChain = (this.extraElectricChain || 0) + val;
                break;
            case 'windPush':
                this.windPushBonus = (this.windPushBonus || 0) + val;
                break;
            case 'freezeExtend':
                this.freezeExtendBonus = (this.freezeExtendBonus || 0) + val;
                break;
            case 'healPower':
                this.healPowerBonus = (this.healPowerBonus || 0) + val;
                break;
            case 'plasmaExtraBounce':
                if (this.weaponStates.PLASMA) this.weaponStates.PLASMA.bounces = (this.weaponStates.PLASMA.bounces || 0) + val;
                if (this.weaponStates.BALLISTA) this.weaponStates.BALLISTA.bounces = (this.weaponStates.BALLISTA.bounces || 0) + val;
                break;
            case 'boomerangRange':
                if (this.weaponStates.BOOMERANG) this.weaponStates.BOOMERANG.maxRange = (this.weaponStates.BOOMERANG.maxRange || 400) + val;
                break;
            case 'ballistaDamage':
                if (this.weaponStates.BALLISTA) this.weaponStates.BALLISTA.damage = Math.floor(this.weaponStates.BALLISTA.damage * (1 + val));
                break;
            case 'crossbowCrit':
                if (this.weaponStates.CROSSBOW) this.weaponStates.CROSSBOW.critChance = (this.weaponStates.CROSSBOW.critChance || 0) + val;
                break;
            case 'flameSpread':
                this.flameSpreadBonus = (this.flameSpreadBonus || 0) + val;
                break;
            case 'cannonPush':
                if (this.weaponStates.CANNON) this.weaponStates.CANNON.pushback = (this.weaponStates.CANNON.pushback || 0) + val;
                break;
            case 'laserSpeed':
                if (this.weaponStates.LASER) this.weaponStates.LASER.speed = Math.floor(this.weaponStates.LASER.speed * (1 + val));
                break;
            case 'chainShot':
                if (this.weaponStates.CANNON) this.weaponStates.CANNON.chainShot = true;
                break;
            case 'boomerangTriple':
                this.boomerangTriple = (this.boomerangTriple || 0) + val;
                break;
            case 'crossbowBarrage':
                this.crossbowBarrage = (this.crossbowBarrage || 0) + val;
                break;
            case 'knockbackAll':
                for (wk in this.weaponStates) this.weaponStates[wk].pushback = (this.weaponStates[wk].pushback || 0) + val;
                break;
            case 'projSpeed':
                for (wk in this.weaponStates) this.weaponStates[wk].speed = Math.floor((this.weaponStates[wk].speed || 400) * (1 + val));
                break;
            case 'manaOnKill':
                this.manaOnKillValue = (this.manaOnKillValue || 0) + val;
                break;
            case 'goldInterest':
                this.addGold(Math.floor(this.gold * val), true);
                break;
            case 'enemySlowAll':
                this.enemySlowAllValue = Math.min(0.6, (this.enemySlowAllValue || 0) + val);
                break;
            case 'ammoElectric':
                this.ammoEffects.electric = (this.ammoEffects.electric || 0) + val;
                break;
            case 'ammoFire':
                this.ammoEffects.fire = (this.ammoEffects.fire || 0) + val;
                break;
            case 'ammoIce':
                this.ammoEffects.ice = (this.ammoEffects.ice || 0) + val;
                break;
            case 'ammoMulti':
                this.ammoEffects.multi = (this.ammoEffects.multi || 0) + val;
                break;
        }
        this.showMessage('✨ ' + perk.name + '!', '#cc88ee');
        window.sfx.purchase();
    }

    // ==============================================
    // EVENT SYSTEM
    // ==============================================
    checkForEvent() {
        var events = CONFIG.EVENTS;
        if (!events) return;
        var roll = Math.random(), cumulative = 0;
        var keys = Object.keys(events);
        for (var i = 0; i < keys.length; i++) {
            cumulative += events[keys[i]].chance;
            if (roll < cumulative) { this.triggerEvent(keys[i]); return; }
        }
    }

    triggerEvent(eventKey) {
        var ev = CONFIG.EVENTS[eventKey];
        if (!ev) return;
        this.currentEvent = eventKey;
        this.showEventBanner(ev);
        var self = this;
        switch(eventKey) {
            case 'METEOR_STORM':
                this.time.delayedCall(600, function() { self.triggerMeteorStorm(); });
                break;
            case 'GOLDEN_CHEST':
                this.addGold(ev.gold || 150, true);
                break;
            case 'MANA_SURGE':
                this.mana = this.maxMana; this.updateManaBar();
                break;
            case 'BERSERK_HORDE':
                this.waveGoldMult = ev.goldMult || 1.8;
                break;
            case 'CASTLE_REPAIR':
                this.castleHp = Math.min(this.maxCastleHp, this.castleHp + (ev.heal || 50)); this.updateHpText();
                this.showMessage('+' + (ev.heal || 50) + ' HP!', '#44cc88');
                break;
            case 'ANCIENT_SCROLL':
                this.pendingRoguePicks++;
                break;
            case 'DOUBLE_GOLD_WAVE':
                this.waveGoldMult = ev.goldMult || 2.0;
                break;
        }
    }

    showEventBanner(ev) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var bg = this.add.graphics().setDepth(160);
        bg.fillStyle(0x1a0a28, 0.92); bg.fillRect(W/2-200, H/2-35, 400, 70);
        bg.lineStyle(2, 0xcc66ff, 0.85); bg.strokeRect(W/2-200, H/2-35, 400, 70);
        bg.lineStyle(1, 0x8833aa, 0.4); bg.strokeRect(W/2-198, H/2-33, 396, 66);
        var title = this.add.text(W/2, H/2-14, ev.name, {fontSize:'12px',color:'#cc88ff',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:3}).setOrigin(0.5).setDepth(161);
        var desc = this.add.text(W/2, H/2+10, ev.desc, {fontSize:'7px',color:'#c8b8a0',fontFamily:FONT}).setOrigin(0.5).setDepth(161);
        var els = [bg, title, desc];
        this.tweens.add({targets:els, alpha:0, delay:2800, duration:700, onComplete:function(){for(var i=0;i<els.length;i++) els[i].destroy();}});
    }

    triggerMeteorStorm() {
        var self = this;
        for (var m = 0; m < 8; m++) {
            (function(delay) {
                self.time.delayedCall(delay, function() {
                    if (self.isGameOver) return;
                    var tx = 420 + Math.random() * 480, ty = 120 + Math.random() * 310;
                    var meteor = self.add.circle(tx - 80, 10, 7, 0xff6600, 0.9).setDepth(130);
                    self.tweens.add({targets:meteor, x:tx, y:ty, duration:700, ease:'Linear',
                        onComplete:function(){
                            meteor.destroy();
                            var flash = self.add.circle(tx, ty, 35, 0xff4400, 0.7).setDepth(130);
                            self.tweens.add({targets:flash, alpha:0, scaleX:3.5, scaleY:3.5, duration:350,
                                onComplete:function(){flash.destroy();}});
                            for (var j = self.enemies.length-1; j >= 0; j--) {
                                var e = self.enemies[j];
                                if (!e || e.isDead) continue;
                                var dx = e.x - tx, dy = e.y - ty;
                                if (dx*dx + dy*dy <= 55*55) e.takeDamage(180, false);
                            }
                        }
                    });
                });
            })(m * 350);
        }
    }

}
