/**
 * VFX v5.0 — Fantasy Pixel Style
 * Минимум частиц, пиксельные эффекты
 *
 * === КАК СДЕЛАТЬ СВОИ VFX ===
 * 
 * 1. СПРАЙТШИТЫ ЭФФЕКТОВ:
 *    Положи PNG-спрайтшиты в папку sprites/vfx/
 *    Например: sprites/vfx/explosion.png (4 кадра 32x32)
 *    
 *    В config.js добавь:
 *    VFX_SPRITES: {
 *        EXPLOSION: { file: 'sprites/vfx/explosion.png', fw: 32, fh: 32, frames: 4, fps: 12 },
 *        HIT:       { file: 'sprites/vfx/hit.png',       fw: 16, fh: 16, frames: 3, fps: 16 },
 *        DEATH:     { file: 'sprites/vfx/death.png',     fw: 32, fh: 32, frames: 6, fps: 10 },
 *        SMOKE:     { file: 'sprites/vfx/smoke.png',     fw: 16, fh: 16, frames: 4, fps: 8 },
 *    }
 *    
 *    Загрузка в GameScene.preload():
 *    if (CONFIG.VFX_SPRITES) {
 *        for (var k in CONFIG.VFX_SPRITES) {
 *            var v = CONFIG.VFX_SPRITES[k];
 *            this.load.spritesheet('vfx_'+k, v.file, {frameWidth:v.fw, frameHeight:v.fh});
 *        }
 *    }
 *    
 *    Создание анимаций в createAnimations():
 *    if (CONFIG.VFX_SPRITES) {
 *        for (var k in CONFIG.VFX_SPRITES) {
 *            var v = CONFIG.VFX_SPRITES[k];
 *            if (this.textures.exists('vfx_'+k)) {
 *                this.anims.create({
 *                    key: 'vfxanim_'+k,
 *                    frames: this.anims.generateFrameNumbers('vfx_'+k, {start:0, end:v.frames-1}),
 *                    frameRate: v.fps,
 *                    repeat: 0  // одно проигрывание, потом удаляется
 *                });
 *            }
 *        }
 *    }
 *    
 *    Использование в VFX:
 *    playVfxSprite(x, y, key, size) — проигрывает анимацию и удаляет
 *
 * 2. СТАТИЧНЫЕ PNG ЭФФЕКТОВ (просто картинка с fade-out):
 *    VFX_IMAGES: {
 *        GOLD_COIN: 'sprites/vfx/coin.png',
 *        CRIT_STAR: 'sprites/vfx/star.png',
 *    }
 *    
 * 3. ИНСТРУМЕНТЫ ДЛЯ СОЗДАНИЯ:
 *    - Aseprite (лучший для pixel art анимаций)
 *    - Piskel (бесплатный, в браузере: piskelapp.com)
 *    - LibreSprite (бесплатный аналог Aseprite)
 *    
 *    Экспортируй как горизонтальный спрайтшит (все кадры в один ряд)
 *    Размеры кадра: 16x16, 32x32 или 64x64 для пиксельного стиля
 */
class VFX {
    constructor(scene) {
        this.scene = scene;
        this.shaking = false;
        this.bossRef = null;
        this.bossHpBg = null;
        this.bossHpBar = null;
        this.bossHpName = null;
    }

    // Проиграть VFX спрайт (если загружен), иначе фолбек
    playVfxSprite(x, y, key, size) {
        var animKey = 'vfxanim_' + key;
        if (this.scene.anims.exists(animKey)) {
            var spr = this.scene.add.sprite(x, y, 'vfx_' + key).setDisplaySize(size, size).setDepth(60);
            spr.play(animKey);
            spr.on('animationcomplete', function() { spr.destroy(); });
            return true;
        }
        return false;
    }

    shake(intensity, duration) {
        if (this.shaking) return;
        this.shaking = true;
        this.scene.cameras.main.shake(duration||120, intensity||0.004);
        var self = this;
        this.scene.time.delayedCall(duration||120, function(){self.shaking = false;});
    }

    flash(color, alpha, duration) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var r = this.scene.add.rectangle(W/2,H/2,W,H,color||0xffffff,alpha||0.2).setDepth(500);
        this.scene.tweens.add({targets:r,alpha:0,duration:duration||150,onComplete:function(){r.destroy();}});
    }

    // ─── СМЕРТЬ ВРАГА (простая) ───
    enemyDeath(x, y, color, size, isBoss) {
        // Попытка кастомного VFX
        if (isBoss && this.playVfxSprite(x, y, 'BOSS_DEATH', size*2)) return;
        if (!isBoss && this.playVfxSprite(x, y, 'DEATH', size*1.5)) return;

        var scene = this.scene;
        var count = isBoss ? 8 : 4;
        // Пиксельные квадратики вместо кругов
        for (var i = 0; i < count; i++) {
            var angle = (Math.PI*2/count)*i;
            var dist = (isBoss?40:20) + Math.random()*20;
            var sz = 2 + Math.floor(Math.random()*3);
            var p = scene.add.rectangle(x,y,sz,sz,color).setDepth(60);
            (function(pt,a,d){scene.tweens.add({targets:pt,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,duration:300+Math.random()*200,onComplete:function(){pt.destroy();}});})(p,angle,dist);
        }
        if (isBoss) { this.shake(0.012, 300); this.flash(0xff0000, 0.15, 200); }
    }

    hitSpark(x, y, color) {
        if (this.playVfxSprite(x, y, 'HIT', 16)) return;
        // 2 квадратика-искры
        for (var i = 0; i < 2; i++) {
            var a = Math.random()*Math.PI*2;
            var p = this.scene.add.rectangle(x,y,2,2,color||0xffffff).setDepth(55);
            (function(pt,an){pt.scene.tweens.add({targets:pt,x:x+Math.cos(an)*12,y:y+Math.sin(an)*12,alpha:0,duration:150,onComplete:function(){pt.destroy();}});})(p,a);
        }
    }

    explosion(x, y, radius, color) {
        if (this.playVfxSprite(x, y, 'EXPLOSION', radius*2)) { this.shake(0.006, 150); return; }
        var scene = this.scene;
        // Простой круг-волна
        var wave = scene.add.circle(x,y,8,color||0xff6600,0.5).setDepth(58);
        scene.tweens.add({targets:wave,scaleX:radius/8,scaleY:radius/8,alpha:0,duration:300,onComplete:function(){wave.destroy();}});
        // 6 искр
        for (var i = 0; i < 6; i++) {
            var a = (Math.PI*2/6)*i;
            var pt = scene.add.rectangle(x,y,3,3,0xffaa44).setDepth(57);
            (function(p,an){scene.tweens.add({targets:p,x:x+Math.cos(an)*radius*0.7,y:y+Math.sin(an)*radius*0.7,alpha:0,duration:250,onComplete:function(){p.destroy();}});})(pt,a);
        }
        this.shake(0.006, 150);
    }

    goldPopup(x, y, amount) {
        var t = this.scene.add.text(x,y,'+'+amount,{
            fontSize:'8px', fontFamily:FONT, color:'#f0c866',
            stroke:'#3a1e0a', strokeThickness:2
        }).setOrigin(0.5).setDepth(70);
        this.scene.tweens.add({targets:t,y:y-25,alpha:0,duration:800,onComplete:function(){t.destroy();}});
    }

    spawnPoof(x, y, color) {
        var c = this.scene.add.rectangle(x,y,4,4,color||0x8844aa).setDepth(45);
        this.scene.tweens.add({targets:c,scale:4,alpha:0,duration:250,onComplete:function(){c.destroy();}});
    }

    castleImpact(x, y) {
        this.shake(0.008, 150);
        this.flash(0xff0000, 0.12, 120);
        // 4 каменных осколка
        for (var i = 0; i < 4; i++) {
            var p = this.scene.add.rectangle(x+(Math.random()-0.5)*30,y+(Math.random()-0.5)*30,
                2+Math.random()*2,2+Math.random()*2,0x888888).setDepth(55);
            this.scene.tweens.add({targets:p,y:p.y-15-Math.random()*10,alpha:0,duration:400,onComplete:function(){p.destroy();}});
        }
    }

    electricChain(x1, y1, x2, y2) {
        var g = this.scene.add.graphics().setDepth(55);
        g.lineStyle(2, 0x44ddff, 0.8);
        g.beginPath(); g.moveTo(x1,y1);
        var steps = 4;
        for (var i = 1; i < steps; i++) {
            var t = i/steps;
            g.lineTo(x1+(x2-x1)*t+(Math.random()-0.5)*16, y1+(y2-y1)*t+(Math.random()-0.5)*16);
        }
        g.lineTo(x2,y2); g.strokePath();
        this.scene.tweens.add({targets:g,alpha:0,duration:180,onComplete:function(){g.destroy();}});
    }

    fireParticles(x, y) {
        var p = this.scene.add.rectangle(x+(Math.random()-0.5)*6,y,2,2,0xff6600).setDepth(55);
        this.scene.tweens.add({targets:p,y:p.y-10,alpha:0,duration:200,onComplete:function(){p.destroy();}});
    }
    iceParticles(x, y) {
        var p = this.scene.add.rectangle(x+(Math.random()-0.5)*6,y,2,2,0x88ddff).setDepth(55);
        this.scene.tweens.add({targets:p,y:p.y+6,alpha:0,duration:300,onComplete:function(){p.destroy();}});
    }

    createShadow(x, y, size) {
        return this.scene.add.ellipse(x,y+size/2+2,size*0.6,size*0.2,0x000000,0.15).setDepth(3);
    }

    // Атмосфера — очень редко, только пылинки
    ambientParticle() {
        if (Math.random() > 0.015) return;
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var dust = this.scene.add.rectangle(W+3,60+Math.random()*(H-140),1,1,0xd4a862,0.2).setDepth(1);
        this.scene.tweens.add({targets:dust,x:-3,y:dust.y+(Math.random()-0.5)*30,duration:10000,onComplete:function(){dust.destroy();}});
    }

    // ─── БАННЕР ВОЛНЫ ───
    waveBanner(text, color, isBoss) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, cx = W/2, cy = H/2, scene = this.scene;
        if (isBoss) this.shake(0.005, 300);

        // Тёмная полоса с пиксельной рамкой
        var bar = scene.add.rectangle(cx,cy,W,isBoss?50:40,0x1a0e0a,0.9).setDepth(150);
        var borderT = scene.add.rectangle(cx,cy-(isBoss?25:20),W,2,0x6a4a2a).setDepth(151);
        var borderB = scene.add.rectangle(cx,cy+(isBoss?25:20),W,2,0x6a4a2a).setDepth(151);
        bar.scaleX = 0;
        scene.tweens.add({targets:bar,scaleX:1,duration:150,ease:'Stepped',easeParams:[6]});
        scene.tweens.add({targets:[borderT,borderB],scaleX:1,delay:50,duration:100});

        var ann = scene.add.text(cx,cy,text,{
            fontSize:isBoss?'14px':'11px', fontFamily:FONT, color:color,
            stroke:'#1a0e0a', strokeThickness:3
        }).setOrigin(0.5).setDepth(152).setAlpha(0);
        scene.tweens.add({targets:ann,alpha:1,duration:200,delay:100});
        scene.tweens.add({targets:[bar,borderT,borderB,ann],alpha:0,delay:1800,duration:300,onComplete:function(){bar.destroy();borderT.destroy();borderB.destroy();ann.destroy();}});
    }

    // ─── БОСС HP ───
    createBossHpBar(boss) {
        var W = CONFIG.GAME_WIDTH;
        this.destroyBossHpBar();
        this.bossHpBg = this.scene.add.rectangle(W/2,60,220,10,0x1a0e0a,0.9).setStrokeStyle(2,0x6a4a2a).setDepth(92);
        this.bossHpBar = this.scene.add.rectangle(W/2,60,216,6,0xcc3333).setDepth(93);
        this.bossHpName = this.scene.add.text(W/2,72,boss.config.name||'BOSS',{fontSize:'7px',fontFamily:FONT,color:'#cc6644',stroke:'#1a0e0a',strokeThickness:2}).setOrigin(0.5).setDepth(93);
        this.bossRef = boss;
    }
    updateBossHpBar() {
        if (!this.bossRef || this.bossRef.isDead) { this.destroyBossHpBar(); return; }
        var p = Math.max(0, this.bossRef.hp/this.bossRef.maxHp);
        this.bossHpBar.scaleX = p;
        if(p>0.5)this.bossHpBar.setFillStyle(0xcc3333);else if(p>0.25)this.bossHpBar.setFillStyle(0xcc8833);else this.bossHpBar.setFillStyle(0xcccc33);
    }
    destroyBossHpBar() {
        if(this.bossHpBg){this.bossHpBg.destroy();this.bossHpBar.destroy();this.bossHpName.destroy();this.bossHpBg=null;this.bossHpBar=null;this.bossHpName=null;this.bossRef=null;}
    }
}
