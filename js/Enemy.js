/**
 * КЛАСС ENEMY v5.0 — NEW ENEMIES & MECHANICS
 * Ассасин (невидимость), Некромант (воскрешение), Голем (иммунитет), Мега Голем (удар по земле)
 * Визуальный дроп гемов, разделение спрайтов walk/attack/death
 */
class Enemy {
    constructor(scene, type, waveMultiplier, spawnPos) {
        this.scene = scene;
        this.type = type;
        this.config = CONFIG.ENEMIES[type];

        var mult = waveMultiplier || {hp:1,damage:1,speed:1};
        var hpMult = typeof mult==='object'?mult.hp:mult;
        var dmgMult = typeof mult==='object'?mult.damage:1;
        var spdMult = typeof mult==='object'?mult.speed:1;

        this.maxHp = Math.floor(this.config.hp * hpMult);
        this.hp = this.maxHp;
        this.baseSpeed = Math.floor(this.config.speed * spdMult);
        this.speed = this.baseSpeed;
        this.reward = Math.floor(this.config.reward * (1+(hpMult-1)*0.5));
        this.damage = Math.floor(this.config.damage * dmgMult);
        this.projectileCount = this.config.projectileCount || 1;
        this.isElite = this.config.isElite || false;

        if (spawnPos) {
            this.x = spawnPos.x;
            this.y = spawnPos.y;
            this.isArenaSpawn = true;
        } else {
            this.x = CONFIG.GAME_WIDTH + 50;
            this.y = 80 + Math.random() * (CONFIG.GAME_HEIGHT - 160);
            this.isArenaSpawn = false;
        }
        this.startY = this.y;

        this.isDead = false;
        this.isFrozen = false;
        this.isSlowed = false;
        this.isBurning = false;
        this.freezeEndTime = 0;
        this.slowEndTime = 0;
        this.moveTime = 0;
        this.zigzagOffset = Math.random()*Math.PI*2;
        this.isDashing = false;
        this.lastDashTime = 0;
        this.lastShootTime = 0;
        this.lastSummonTime = 0;
        this.lastHealTime = 0;
        this.lastResurrectTime = 0;
        this.lastGroundPoundTime = 0;
        this.flyTargetX = this.x;
        this.flyTargetY = this.y;
        this.lastFlyChangeTime = 0;
        this.flyPhase = 'enter';

        // Assassin stealth
        this.isStealthed = false;
        this.stealthTriggered = false;
        this.revealTriggered = false;

        // Animation state
        this.animState = 'walk';

        this.createSprite();
        this.createHealthBar();

        // Тень
        this.shadow = null;
        if (scene.vfx) this.shadow = scene.vfx.createShadow(this.x, this.y, this.config.size);

        // Босс HP бар на экране
        if (this.config.isBoss && scene.vfx) scene.vfx.createBossHpBar(this);
    }

    createSprite() {
        var baseType = this.type;
        if (this.type.indexOf('_ELITE')!==-1) baseType = this.type.replace('_ELITE','');
        this.baseType = baseType;
        var radius = this.config.size/2;

        // Check for multi-anim sprite format (walk/attack/death)
        var spriteConfig = CONFIG.SPRITES && CONFIG.SPRITES[baseType];
        var hasMultiAnim = spriteConfig && spriteConfig.walk;
        var hasSingleAnim = spriteConfig && spriteConfig.file;

        var spriteKey, animKey;
        if (hasMultiAnim) {
            spriteKey = 'sprite_'+baseType+'_walk';
            animKey = 'anim_'+baseType+'_walk';
        } else {
            spriteKey = 'sprite_'+baseType;
            animKey = 'anim_'+baseType;
        }

        var imageKey = 'enemy_'+baseType;
        var hasSpritesheet = spriteConfig && this.scene.textures.exists(spriteKey);
        var hasImage = !hasSpritesheet && CONFIG.IMAGES && CONFIG.IMAGES[baseType] && this.scene.textures.exists(imageKey);
        this.isAnimated = false;
        this.hasMultiAnim = hasMultiAnim;

        if (hasSpritesheet) {
            this.sprite = this.scene.add.sprite(this.x,this.y,spriteKey).setDisplaySize(this.config.size,this.config.size);
            this.scene.physics.add.existing(this.sprite);
            this.sprite.body.setCircle(radius,0,0);
            if (this.scene.anims.exists(animKey)) { this.sprite.play(animKey); this.isAnimated = true; }
            this.border = null; this.maskShape = null; this.icon = null;
            this.eliteOverlay = this.isElite ? this.scene.add.circle(this.x,this.y,radius,0x9900ff,0.25) : null;
        } else if (hasImage) {
            this.sprite = this.scene.add.image(this.x,this.y,imageKey).setDisplaySize(this.config.size,this.config.size);
            this.scene.physics.add.existing(this.sprite);
            this.sprite.body.setCircle(radius,0,0);
            this.maskShape = null; this.border = null; this.icon = null;
            this.eliteOverlay = this.isElite ? this.scene.add.circle(this.x,this.y,radius,0x9900ff,0.25) : null;
        } else {
            this.maskShape = null;
            this.sprite = this.scene.add.circle(this.x,this.y,radius,this.config.color);
            if (this.isElite) this.sprite.setStrokeStyle(3,0xff00ff);
            this.scene.physics.add.existing(this.sprite);
            this.sprite.body.setCircle(radius);
            this.icon = this.scene.add.text(this.x,this.y,this.config.icon||'👹',{fontSize:(this.config.size*0.7)+'px'}).setOrigin(0.5);
            this.border = null; this.eliteOverlay = null;
        }

        if (this.isElite) {
            this.eliteLabel = this.scene.add.text(this.x,this.y-this.config.size/2-12,'ELITE',{fontSize:'7px',color:'#ff44ff',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5);
        }
        if (this.config.isBoss) {
            this.bossLabel = this.scene.add.text(this.x,this.y-this.config.size,this.config.name||'BOSS',{fontSize:'8px',color:'#ee4444',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5);
        }
    }

    // Switch animation state (for multi-anim sprites)
    playAnim(state) {
        if (!this.hasMultiAnim || !this.isAnimated || this.animState === state) return;
        var animKey = 'anim_'+this.baseType+'_'+state;
        var spriteKey = 'sprite_'+this.baseType+'_'+state;
        if (this.scene.anims.exists(animKey) && this.scene.textures.exists(spriteKey)) {
            this.animState = state;
            this.sprite.setTexture(spriteKey);
            this.sprite.setDisplaySize(this.config.size, this.config.size);
            if (state === 'death') {
                this.sprite.play({key: animKey, repeat: 0});
            } else {
                this.sprite.play(animKey);
            }
        }
    }

    createHealthBar() {
        var bw = this.config.size, bh = this.config.isBoss ? 8 : 4;
        var yOff = this.y - this.config.size/2 - 8;
        this.healthBarBg = this.scene.add.rectangle(this.x,yOff,bw,bh,0x000000,0.5).setStrokeStyle(0.5,0x333333).setOrigin(0.5);
        this.healthBar = this.scene.add.rectangle(this.x,yOff,bw,bh-1,0x44ff44).setOrigin(0.5);
    }

    update(time, delta) {
        if (this.isDead) return;
        this.moveTime += delta/1000;
        if (this.isFrozen && time > this.freezeEndTime) this.unfreeze();
        if (this.isSlowed && time > this.slowEndTime) { this.isSlowed = false; this.speed = this.baseSpeed; this.clearTint(); }

        if (!this.isFrozen) {
            this.move(delta);
            if (this.config.canShoot) this.tryShoot(time);
            if (this.config.canHeal) this.tryHeal(time);
            if (this.config.summons) this.trySummon(time);
            if (this.config.canResurrect) this.tryResurrect(time);
            if (this.config.groundPound) this.tryGroundPound(time);
        }

        this.updateVisuals();

        if (this.config.moveType !== 'boss_fly') {
            if (this.x <= CONFIG.CASTLE.x + CONFIG.CASTLE.size/2) this.reachCastle();
        }
    }

    move(delta) {
        var currentSpeed = this.isFrozen ? 0 : this.speed;
        var moveX = currentSpeed * (delta/1000);
        var moveType = this.config.moveType || 'straight';
        if (moveType==='zigzag') this.moveZigzag(moveX);
        else if (moveType==='dash') this.moveDash(moveX);
        else if (moveType==='boss_fly') this.moveBossFly(delta);
        else if (moveType==='assassin') this.moveAssassin(moveX);
        else this.x -= moveX;
        this.sprite.x = this.x; this.sprite.y = this.y;
    }

    moveZigzag(moveX) {
        this.x -= moveX;
        var amp = this.config.zigzagAmplitude||50, freq = this.config.zigzagFrequency||2;
        this.y = this.startY + Math.sin((this.moveTime+this.zigzagOffset)*freq*Math.PI)*amp;
        this.y = Phaser.Math.Clamp(this.y, 70, CONFIG.GAME_HEIGHT-80);
    }

    moveDash(moveX) {
        var time = this.scene.time.now;
        var dashInterval = this.config.dashInterval||2000, dashSpeed = this.config.dashSpeed||200;
        var self = this;
        if (!this.isDashing && time-this.lastDashTime > dashInterval) {
            this.isDashing = true; this.lastDashTime = time;
            var dashEffect = this.scene.add.text(this.x+15,this.y,'💨',{fontSize:'18px'}).setOrigin(0.5);
            this.scene.tweens.add({targets:dashEffect,alpha:0,x:this.x+50,duration:300,onComplete:function(){dashEffect.destroy();}});
            var targetX = Math.max(CONFIG.CASTLE.x+50, this.x-dashSpeed*0.4);
            this.scene.tweens.add({targets:this,x:targetX,duration:180,ease:'Power2',onUpdate:function(){self.updateVisuals();},onComplete:function(){self.isDashing=false;}});
        }
        if (!this.isDashing) this.x -= moveX;
    }

    moveAssassin(moveX) {
        var screenWidth = CONFIG.GAME_WIDTH;
        var stealthAt = screenWidth * (this.config.stealthAtPercent || 0.6);
        var revealAt = screenWidth * (this.config.revealAtPercent || 0.2);

        this.x -= moveX;

        // Enter stealth
        if (!this.stealthTriggered && this.x <= stealthAt) {
            this.stealthTriggered = true;
            this.isStealthed = true;
            this.setAlpha(0.15);
            // Smoke effect
            var smoke = this.scene.add.text(this.x,this.y,'💨',{fontSize:'20px'}).setOrigin(0.5).setDepth(55);
            this.scene.tweens.add({targets:smoke,alpha:0,scale:2,duration:400,onComplete:function(){smoke.destroy();}});
        }

        // Reveal near castle with speed burst
        if (this.isStealthed && !this.revealTriggered && this.x <= revealAt + CONFIG.CASTLE.x) {
            this.revealTriggered = true;
            this.isStealthed = false;
            this.setAlpha(1);
            this.speed = this.baseSpeed * (this.config.burstSpeedMult || 3);
            // Reveal effect
            var reveal = this.scene.add.text(this.x,this.y,'🗡️',{fontSize:'20px'}).setOrigin(0.5).setDepth(55);
            this.scene.tweens.add({targets:reveal,alpha:0,y:this.y-30,duration:500,onComplete:function(){reveal.destroy();}});
        }
    }

    setAlpha(a) {
        if (this.sprite) this.sprite.setAlpha(a);
        if (this.icon) this.icon.setAlpha(a);
        if (this.healthBarBg) this.healthBarBg.setAlpha(a);
        if (this.healthBar) this.healthBar.setAlpha(a);
        if (this.eliteOverlay) this.eliteOverlay.setAlpha(a);
        if (this.eliteLabel) this.eliteLabel.setAlpha(a);
        if (this.shadow) this.shadow.setAlpha(a * 0.5);
    }

    moveBossFly(delta) {
        var time = this.scene.time.now, spd = this.speed*(delta/1000);
        var minX=this.config.flyZoneMinX||300,maxX=this.config.flyZoneMaxX||800;
        var minY=this.config.flyZoneMinY||100,maxY=this.config.flyZoneMaxY||420;
        var changeInterval = this.config.flyChangeInterval||1500;
        if (this.flyPhase==='enter') {
            if (this.isArenaSpawn) { this.flyPhase='fly'; this.pickNewFlyTarget(minX,maxX,minY,maxY); }
            else { this.x -= spd*2; if(this.x<=maxX){this.flyPhase='fly';this.pickNewFlyTarget(minX,maxX,minY,maxY);} return; }
        }
        if (time-this.lastFlyChangeTime > changeInterval) { this.pickNewFlyTarget(minX,maxX,minY,maxY); this.lastFlyChangeTime = time; }
        var dx=this.flyTargetX-this.x, dy=this.flyTargetY-this.y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist>5) { var ms=spd*3; this.x+=(dx/dist)*ms; this.y+=(dy/dist)*ms; }
        this.x = Phaser.Math.Clamp(this.x,minX,maxX);
        this.y = Phaser.Math.Clamp(this.y,minY,maxY);
    }
    pickNewFlyTarget(minX,maxX,minY,maxY) { this.flyTargetX=minX+Math.random()*(maxX-minX); this.flyTargetY=minY+Math.random()*(maxY-minY); }

    tryShoot(time) {
        var shootRate = this.config.shootRate||2000;
        if (time-this.lastShootTime < shootRate) return;
        if (this.config.moveType!=='boss_fly') { var sr=this.config.shootRange||400; if(this.x-CONFIG.CASTLE.x>sr) return; }
        this.lastShootTime = time;
        this.playAnim('attack');
        var self = this;
        this.scene.time.delayedCall(300, function(){ if(!self.isDead) self.playAnim('walk'); });
        var damage = this.config.shootDamage||10;
        var bullet = this.scene.add.rectangle(this.x,this.y,this.config.isBoss?8:5,this.config.isBoss?8:5,0xff4400).setDepth(40);
        var midY = Math.min(this.y,CONFIG.CASTLE.y)-60-Math.random()*80;
        this.scene.tweens.add({targets:bullet,x:(this.x+CONFIG.CASTLE.x)/2,y:midY,duration:350,ease:'Sine.easeOut',
            onComplete:function(){
                self.scene.tweens.add({targets:bullet,x:CONFIG.CASTLE.x,y:CONFIG.CASTLE.y,duration:350,ease:'Sine.easeIn',
                    onComplete:function(){
                        self.scene.damageCastle(damage); bullet.destroy();
                        var boom = self.scene.add.rectangle(CONFIG.CASTLE.x,CONFIG.CASTLE.y,6,6,0xff6600,0.7).setDepth(55);
                        self.scene.tweens.add({targets:boom,alpha:0,scale:4,duration:200,onComplete:function(){boom.destroy();}});
                    }
                });
            }
        });
        var flash = self.scene.add.rectangle(this.x,this.y,4,4,0xffaa00).setDepth(41);
        this.scene.tweens.add({targets:flash,alpha:0,scale:3,duration:150,onComplete:function(){flash.destroy();}});
    }

    trySummon(time) {
        var interval = this.config.summonInterval||5000;
        if (time-this.lastSummonTime < interval) return;
        this.lastSummonTime = time;
        var count = this.config.summonCount||1, pool = this.config.summonPool, self = this;
        window.sfx.summonSound();
        var swirl = this.scene.add.rectangle(this.x,this.y,this.config.size,this.config.size,0x9900ff,0.3).setStrokeStyle(2,0xff00ff).setDepth(55);
        this.scene.tweens.add({targets:swirl,alpha:0,scale:1.5,duration:400,onComplete:function(){swirl.destroy();}});
        for (var i = 0; i < count; i++) {
            var summonType;
            if (pool&&pool.length>0) summonType=pool[Math.floor(Math.random()*pool.length)]; else summonType=this.config.summonType||'GOBLIN';
            if (!CONFIG.ENEMIES[summonType]) summonType='GOBLIN';
            var enemy = new Enemy(this.scene, summonType, 1);
            var angle = (Math.PI*2/count)*i;
            enemy.x = this.x+Math.cos(angle)*60;
            enemy.y = Phaser.Math.Clamp(this.y+Math.sin(angle)*60, 70, CONFIG.GAME_HEIGHT-80);
            enemy.startY = enemy.y;
            enemy.updateVisuals();
            this.scene.enemies.push(enemy);
            var poof = this.scene.add.rectangle(enemy.x,enemy.y,8,8,0x9900ff,0.5).setDepth(55);
            this.scene.tweens.add({targets:poof,alpha:0,scale:2,duration:300,onComplete:function(){poof.destroy();}});
        }
    }

    tryHeal(time) {
        var healRate=this.config.healRate||2500, healRange=this.config.healRange||150, healAmount=this.config.healAmount||15;
        if (time-(this.lastHealTime||0)<healRate) return;
        this.lastHealTime = time;
        this.playAnim('attack');
        var self = this;
        this.scene.time.delayedCall(300, function(){ if(!self.isDead) self.playAnim('walk'); });
        var wounded = this.scene.enemies.filter(function(e){if(e===self||e.isDead||e.hp>=e.maxHp)return false;return Phaser.Math.Distance.Between(self.x,self.y,e.x,e.y)<=healRange;});
        if (wounded.length===0) return;
        for (var i=0;i<wounded.length;i++) {
            var enemy = wounded[i];
            enemy.hp = Math.min(enemy.maxHp, enemy.hp+healAmount);
            var hp = enemy.hp/enemy.maxHp;
            enemy.healthBar.scaleX = hp;
            if(hp>0.5)enemy.healthBar.setFillStyle(0x44ff44);else if(hp>0.25)enemy.healthBar.setFillStyle(0xffcc00);else enemy.healthBar.setFillStyle(0xff3333);
            var hfx = this.scene.add.text(enemy.x,enemy.y-20,'+'+healAmount,{fontSize:'7px',color:'#44cc88',fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5);
            this.scene.tweens.add({targets:hfx,y:hfx.y-25,alpha:0,duration:600,onComplete:function(){hfx.destroy();}});
        }
        var hc = this.scene.add.rectangle(this.x,this.y,healRange*2,healRange*2,0x00ff88,0.06).setStrokeStyle(1,0x00ff88,0.3).setDepth(55);
        this.scene.tweens.add({targets:hc,alpha:0,duration:300,onComplete:function(){hc.destroy();}});
    }

    tryResurrect(time) {
        var rate = this.config.resurrectRate || 5000;
        if (time - this.lastResurrectTime < rate) return;
        this.lastResurrectTime = time;
        var range = this.config.resurrectRange || 200;
        var count = this.config.resurrectCount || 1;
        var self = this;

        // Find recently dead positions (stored on scene)
        if (!this.scene.deadEnemyPositions || this.scene.deadEnemyPositions.length === 0) return;

        this.playAnim('attack');
        this.scene.time.delayedCall(300, function(){ if(!self.isDead) self.playAnim('walk'); });

        var resurrected = 0;
        for (var i = this.scene.deadEnemyPositions.length - 1; i >= 0 && resurrected < count; i--) {
            var dead = this.scene.deadEnemyPositions[i];
            var dist = Phaser.Math.Distance.Between(this.x, this.y, dead.x, dead.y);
            if (dist <= range) {
                // Resurrect as basic version of that type
                var resType = dead.type;
                if (resType.indexOf('_ELITE') !== -1) resType = resType.replace('_ELITE', '');
                if (!CONFIG.ENEMIES[resType]) resType = 'GOBLIN';

                var ne = new Enemy(this.scene, resType, {hp: 0.5, damage: 0.7, speed: 1});
                ne.x = dead.x;
                ne.y = Phaser.Math.Clamp(dead.y, 70, CONFIG.GAME_HEIGHT - 80);
                ne.startY = ne.y;
                ne.updateVisuals();
                this.scene.enemies.push(ne);

                // Purple resurrection effect
                var fx = this.scene.add.rectangle(dead.x, dead.y, 20, 20, 0x6600aa, 0.5).setStrokeStyle(2, 0xaa44ff).setDepth(55);
                this.scene.tweens.add({targets: fx, alpha: 0, scale: 3, duration: 500, onComplete: function(){fx.destroy();}});
                var txt = this.scene.add.text(dead.x, dead.y - 20, '💀', {fontSize: '16px'}).setOrigin(0.5).setDepth(55);
                this.scene.tweens.add({targets: txt, y: txt.y - 25, alpha: 0, duration: 600, onComplete: function(){txt.destroy();}});

                this.scene.deadEnemyPositions.splice(i, 1);
                resurrected++;
            }
        }
    }

    tryGroundPound(time) {
        var interval = this.config.groundPoundInterval || 6000;
        if (time - this.lastGroundPoundTime < interval) return;
        if (this.x > CONFIG.GAME_WIDTH) return; // Not on screen yet
        this.lastGroundPoundTime = time;

        var radius = this.config.groundPoundRadius || 150;
        var damage = this.config.groundPoundDamage || 25;
        var self = this;

        // Visual: shake + shockwave
        var wave = this.scene.add.circle(this.x, this.y, 10, 0x554422, 0.4).setStrokeStyle(3, 0xaa8844).setDepth(55);
        this.scene.tweens.add({targets: wave, scale: radius / 10, alpha: 0, duration: 600, onComplete: function(){wave.destroy();}});

        // Damage castle if in range
        var distToCastle = Phaser.Math.Distance.Between(this.x, this.y, CONFIG.CASTLE.x, CONFIG.CASTLE.y);
        if (distToCastle <= radius) {
            this.scene.damageCastle(damage);
        }

        // Camera shake effect
        if (this.scene.vfx) this.scene.vfx.shake(0.01, 300);
    }

    updateVisuals() {
        this.sprite.x = this.x; this.sprite.y = this.y;
        if (this.maskShape) { this.maskShape.clear(); this.maskShape.fillStyle(0xffffff); this.maskShape.fillCircle(this.x,this.y,this.config.size/2); }
        if (this.border) { this.border.x=this.x; this.border.y=this.y; }
        if (this.eliteOverlay) { this.eliteOverlay.x=this.x; this.eliteOverlay.y=this.y; }
        if (this.icon) { this.icon.x=this.x; this.icon.y=this.y; }
        this.healthBarBg.x = this.x; this.healthBarBg.y = this.y-this.config.size/2-8;
        this.healthBar.x = this.x; this.healthBar.y = this.y-this.config.size/2-8;
        if (this.eliteLabel) { this.eliteLabel.x=this.x; this.eliteLabel.y=this.y-this.config.size/2-12; }
        if (this.bossLabel) { this.bossLabel.x=this.x; this.bossLabel.y=this.y-this.config.size; }
        if (this.shadow) { this.shadow.x=this.x; this.shadow.y=this.y+this.config.size/2+3; }
    }

    takeDamage(damage, isCrit) {
        if (this.isDead) return;
        if (this.x > CONFIG.GAME_WIDTH) return;
        // Armor reduction from talents
        if (this.scene.armorReduction) damage = Math.max(1, damage * (1 - this.scene.armorReduction));
        this.hp -= damage;
        var hp = Math.max(0, this.hp/this.maxHp);
        this.healthBar.scaleX = hp;
        if(hp>0.5)this.healthBar.setFillStyle(0x44ff44);else if(hp>0.25)this.healthBar.setFillStyle(0xffcc00);else this.healthBar.setFillStyle(0xff3333);
        this.scene.tweens.add({targets:this.sprite,alpha:0.5,duration:80,yoyo:true});
        this.showDamageText(damage, isCrit);
        // Lifesteal
        if (this.scene.lifestealPercent && this.scene.lifestealPercent > 0) {
            var heal = Math.floor(damage * this.scene.lifestealPercent);
            if (heal > 0) {
                this.scene.castleHp = Math.min(this.scene.maxCastleHp, this.scene.castleHp + heal);
                this.scene.updateHpText();
            }
        }
        if (this.hp <= 0) this.die();
    }

    showDamageText(damage, isCrit) {
        var color = isCrit?'#ffee44':'#ddccbb';
        var size = isCrit?'9px':'7px';
        var text = isCrit?'-'+Math.floor(damage)+'!':'-'+Math.floor(damage);
        var dt = this.scene.add.text(this.x+(Math.random()-0.5)*8,this.y-12,text,{fontSize:size,color:color,fontFamily:FONT,stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5).setDepth(65);
        this.scene.tweens.add({targets:dt,y:dt.y-22,alpha:0,duration:600,onComplete:function(){dt.destroy();}});
    }

    die() {
        this.isDead = true;
        // Apply gold multiplier from artifacts
        var goldMult = this.scene.goldMult || 1;
        this.scene.addGold(Math.floor(this.reward * goldMult));
        // XP gain for roguelike system
        if (this.scene.gainXp) {
            var xpBase = Math.floor(Math.sqrt(this.reward) * 3);
            if (this.config.isBoss) xpBase = Math.floor(xpBase * 8);
            else if (this.config.isElite) xpBase = Math.floor(xpBase * 3);
            this.scene.gainXp(xpBase);
        }
        if (this.scene.manaOnKillValue > 0) {
            this.scene.mana = Math.min(this.scene.maxMana, this.scene.mana + this.scene.manaOnKillValue);
            this.scene.updateManaBar();
        }
        this.scene.totalKills++;
        if (this.config.isBoss) this.scene.onBossKilled(this.type);

        // Gem drop with visual animation
        if (Math.random() < 0.15 || this.config.isBoss) {
            var gemCount = this.config.isBoss ? 3 : 1;
            this.scene.spawnGemDrop(this.x, this.y, gemCount);
        }

        // Store death position for necromancer
        if (!this.scene.deadEnemyPositions) this.scene.deadEnemyPositions = [];
        this.scene.deadEnemyPositions.push({x: this.x, y: this.y, type: this.type, time: this.scene.time.now});
        // Keep only last 20 positions
        if (this.scene.deadEnemyPositions.length > 20) this.scene.deadEnemyPositions.shift();

        // VFX death
        if (this.scene.vfx) {
            this.scene.vfx.enemyDeath(this.x, this.y, this.config.color, this.config.size, this.config.isBoss);
            window.sfx.enemyDeath(this.config.isBoss);
        }

        // Play death animation if available
        this.playAnim('death');

        // Split
        if (this.config.splitsInto && CONFIG.ENEMIES[this.config.splitsInto]) {
            var splitCount = this.config.splitCount||2;
            for (var i=0;i<splitCount;i++) {
                var offsetY = (i-(splitCount-1)/2)*35;
                var ne = new Enemy(this.scene, this.config.splitsInto, {hp:1,damage:1,speed:1});
                ne.x = this.x+15;
                ne.y = Phaser.Math.Clamp(this.y+offsetY, 70, CONFIG.GAME_HEIGHT-80);
                ne.startY = ne.y; ne.updateVisuals();
                this.scene.enemies.push(ne);
                var poof = this.scene.add.rectangle(ne.x,ne.y,6,6,0xffaa44,0.6).setDepth(55);
                this.scene.tweens.add({targets:poof,alpha:0,scale:2,duration:200,onComplete:function(){poof.destroy();}});
            }
        }

        var targets = [this.sprite,this.healthBar,this.healthBarBg];
        if (this.border) targets.push(this.border);
        if (this.eliteOverlay) targets.push(this.eliteOverlay);
        if (this.icon) targets.push(this.icon);
        if (this.bossLabel) targets.push(this.bossLabel);
        if (this.eliteLabel) targets.push(this.eliteLabel);
        if (this.shadow) targets.push(this.shadow);
        var self = this;
        this.scene.tweens.add({targets:targets,alpha:0,scale:0,duration:300,onComplete:function(){self.destroy();}});
    }

    reachCastle() { this.isDead = true; this.scene.damageCastle(this.damage); this.destroy(); }

    freeze(duration) {
        if (this.config.immuneToFreeze) return;
        if (this.isFrozen) return;
        this.isFrozen = true; this.freezeEndTime = this.scene.time.now+duration;
        this.applyTint(0x00ccff);
        this.freezeIcon = this.scene.add.text(this.x,this.y-this.config.size,'❄️',{fontSize:'20px'}).setOrigin(0.5);
    }
    unfreeze() {
        this.isFrozen = false;
        if (!this.isSlowed) this.clearTint();
        if (this.freezeIcon) { this.freezeIcon.destroy(); this.freezeIcon = null; }
    }
    applySlow(duration, percent) {
        if (this.config.immuneToSlow) return;
        this.isSlowed=true; this.slowEndTime=this.scene.time.now+duration; this.speed=this.baseSpeed*percent; this.applyTint(0x88aaff);
    }
    applyTint(color) { if(this.sprite&&this.sprite.setTint) this.sprite.setTint(color); }
    clearTint() { if(this.sprite&&this.sprite.clearTint) this.sprite.clearTint(); }

    pushBack(angle, distance) {
        var newX = Math.min(CONFIG.GAME_WIDTH+30, Math.max(150, this.x+Math.cos(angle)*distance));
        var self = this;
        this.scene.tweens.add({targets:this,x:newX,duration:150,ease:'Power2',onUpdate:function(){self.updateVisuals();}});
    }

    destroy() {
        if(this.sprite)this.sprite.destroy();
        if(this.maskShape)this.maskShape.destroy();
        if(this.border)this.border.destroy();
        if(this.eliteOverlay)this.eliteOverlay.destroy();
        if(this.icon)this.icon.destroy();
        if(this.healthBar)this.healthBar.destroy();
        if(this.healthBarBg)this.healthBarBg.destroy();
        if(this.freezeIcon)this.freezeIcon.destroy();
        if(this.bossLabel)this.bossLabel.destroy();
        if(this.eliteLabel)this.eliteLabel.destroy();
        if(this.shadow)this.shadow.destroy();
        var idx = this.scene.enemies.indexOf(this);
        if (idx>-1) this.scene.enemies.splice(idx,1);
    }
}
