/**
 * КЛАСС MAGIC — МАГИЧЕСКИЕ СПОСОБНОСТИ
 * Ветер, Заморозка (вся арена), Молния
 */

class Magic {
    static useWind(scene) {
        const config = CONFIG.MAGIC.WIND;
        
        let targets = scene.enemies
            .filter(e => !e.isDead && e.x <= CONFIG.GAME_WIDTH)
            .sort((a, b) => a.x - b.x)
            .slice(0, config.targets);
        
        if (targets.length === 0) {
            scene.mana = Math.min(scene.maxMana, scene.mana + (config.manaCost || 0));
            scene.updateManaBar();
            return;
        }

        const windLines = scene.add.graphics();
        windLines.lineStyle(4, config.color, 0.7);
        
        for (let i = 0; i < 10; i++) {
            const y = 150 + i * 30;
            windLines.lineBetween(CONFIG.CASTLE.x + 50, y, CONFIG.GAME_WIDTH, y + (Math.random() - 0.5) * 50);
        }
        
        scene.tweens.add({
            targets: windLines, alpha: 0, duration: 500,
            onComplete: () => windLines.destroy()
        });
        
        targets.forEach((enemy) => {
            if (enemy.isDead) return;

            const pushDist = config.pushDistance + (scene.windPushBonus || 0);
            const newX = Math.min(CONFIG.GAME_WIDTH + 30, enemy.x + pushDist);
            
            const windEffect = scene.add.text(enemy.x, enemy.y, '💨', { fontSize: '24px' }).setOrigin(0.5);
            scene.tweens.add({
                targets: windEffect, x: newX, alpha: 0, duration: 300,
                onComplete: () => windEffect.destroy()
            });
            
            scene.tweens.add({
                targets: enemy, x: newX, duration: 300, ease: 'Power2',
                onUpdate: () => { enemy.updateVisuals(); }
            });
        });
    }
    
    static useFreeze(scene) {
        const config = CONFIG.MAGIC.FREEZE;
        
        const freezeOverlay = scene.add.rectangle(
            CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2,
            CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, config.color, 0.3
        );
        
        scene.tweens.add({
            targets: freezeOverlay, alpha: 0, duration: 1000,
            onComplete: () => freezeOverlay.destroy()
        });
        
        for (let i = 0; i < 30; i++) {
            const snowflake = scene.add.text(
                100 + Math.random() * (CONFIG.GAME_WIDTH - 200),
                100 + Math.random() * (CONFIG.GAME_HEIGHT - 200),
                '❄️', { fontSize: '24px' }
            ).setOrigin(0.5);
            
            scene.tweens.add({
                targets: snowflake, y: snowflake.y + 50, alpha: 0, duration: 1500,
                onComplete: () => snowflake.destroy()
            });
        }
        
        let frozenCount = 0;
        
        const freezeDur = config.duration + (scene.freezeExtendBonus || 0);
        scene.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            if (enemy.x > CONFIG.GAME_WIDTH) return;
            enemy.freeze(freezeDur);
            frozenCount++;
        });
        
        if (frozenCount > 0) {
            const text = scene.add.text(
                CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2,
                `❄️ Заморожено: ${frozenCount}`,
                { fontSize: '32px', color: '#00ffff', stroke: '#000000', strokeThickness: 4 }
            ).setOrigin(0.5);
            
            scene.tweens.add({
                targets: text, y: text.y - 50, alpha: 0, duration: 1500,
                onComplete: () => text.destroy()
            });
        }
    }
    
    static useHeal(scene, amount) {
        // Handled inline in GameScene.healCastle — this stub exists for consistency
        scene.healCastle(amount);
    }

    static useMeteor(scene) {
        const config = CONFIG.MAGIC.METEOR;
        const tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.75;
        const ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        const count = config.meteorCount || 5;
        const radius = config.radius || 80;
        const damage = Math.floor((config.damage || 80) * (scene.magicDamageMult || 1));

        for (let i = 0; i < count; i++) {
            scene.time.delayedCall(i * 280, function() {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                const mx = Math.max(300, Math.min(CONFIG.GAME_WIDTH - 30, tx + Math.cos(angle) * dist));
                const my = Math.max(60, Math.min(CONFIG.GAME_HEIGHT - 70, ty + Math.sin(angle) * dist));

                const meteor = scene.add.text(mx, -40, '☄️', { fontSize: '28px' }).setOrigin(0.5);
                scene.tweens.add({
                    targets: meteor, y: my, duration: 550, ease: 'Power2',
                    onComplete: function() {
                        // Impact flash
                        const exp = scene.add.circle(mx, my, 40, 0xff4400, 0.75);
                        scene.tweens.add({
                            targets: exp, scaleX: 2, scaleY: 2, alpha: 0, duration: 280,
                            onComplete: function() { meteor.destroy(); exp.destroy(); }
                        });
                        // Damage enemies in blast radius
                        for (var ei = 0; ei < scene.enemies.length; ei++) {
                            var e = scene.enemies[ei];
                            if (!e || e.isDead) continue;
                            var dx = e.x - mx, dy = e.y - my;
                            if (Math.sqrt(dx*dx + dy*dy) < 65) e.takeDamage(damage, false);
                        }
                    }
                });
            });
        }
    }

    static useShield(scene) {
        const config = CONFIG.MAGIC.SHIELD;
        const duration = config.duration || 8000;
        scene.castleShieldActive = true;
        scene.castleShieldReduction = config.reduction || 0.6;

        // Shield ring visual
        const shieldRing = scene.add.circle(CONFIG.CASTLE.x, CONFIG.CASTLE.y, 75, 0x4488ff, 0.18);
        shieldRing.setStrokeStyle(3, 0x88ccff, 0.85);
        scene.tweens.add({
            targets: shieldRing, scaleX: 1.1, scaleY: 1.1, alpha: 0.35,
            yoyo: true, repeat: -1, duration: 700
        });

        const shieldTxt = scene.add.text(CONFIG.CASTLE.x, CONFIG.CASTLE.y - 95, '🛡️ ЗАЩИТА', {
            fontSize: '7px', color: '#88ccff', fontFamily: FONT, stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        scene.time.delayedCall(duration, function() {
            scene.castleShieldActive = false;
            scene.tweens.add({
                targets: [shieldRing, shieldTxt], alpha: 0, duration: 500,
                onComplete: function() { shieldRing.destroy(); shieldTxt.destroy(); }
            });
        });
    }

    static useLava(scene) {
        const config = CONFIG.MAGIC.LAVA;
        const tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.7;
        const ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        const radius = config.radius || 70;
        const damage = config.damage || 15;
        const duration = config.duration || 6000;
        const ticks = Math.floor(duration / 1000);

        // Lava pool visual
        const lava = scene.add.circle(tx, ty, radius, 0xff4400, 0.6);
        lava.setStrokeStyle(3, 0xff8800, 0.8);

        // Bubble particles via Phaser timed events
        const bubbleEvt = scene.time.addEvent({
            delay: 350, repeat: Math.floor(duration / 350) - 1,
            callback: function() {
                if (!lava.active) return;
                var bx = tx + (Math.random() - 0.5) * radius * 1.5;
                var by = ty + (Math.random() - 0.5) * radius * 1.5;
                var bubble = scene.add.circle(bx, by, 5, 0xff6600, 0.8);
                scene.tweens.add({
                    targets: bubble, y: by - 18, alpha: 0, duration: 550,
                    onComplete: function() { bubble.destroy(); }
                });
            }
        });

        // Damage tick
        const dmgEvt = scene.time.addEvent({
            delay: 1000, repeat: ticks - 1,
            callback: function() {
                var dmg = Math.floor(damage * (scene.magicDamageMult || 1));
                for (var ei = 0; ei < scene.enemies.length; ei++) {
                    var e = scene.enemies[ei];
                    if (!e || e.isDead) continue;
                    var dx = e.x - tx, dy = e.y - ty;
                    if (Math.sqrt(dx*dx + dy*dy) < radius) {
                        e.takeDamage(dmg, false);
                        var burnTxt = scene.add.text(e.x, e.y - 20, '🔥', { fontSize: '12px' }).setOrigin(0.5);
                        scene.tweens.add({ targets: burnTxt, y: burnTxt.y - 18, alpha: 0, duration: 480, onComplete: function() { burnTxt.destroy(); } });
                    }
                }
            }
        });

        scene.time.delayedCall(duration, function() {
            bubbleEvt.remove(false);
            dmgEvt.remove(false);
            scene.tweens.add({
                targets: lava, alpha: 0, duration: 800,
                onComplete: function() { lava.destroy(); }
            });
        });
    }

    static useTornado(scene) {
        const config = CONFIG.MAGIC.TORNADO;
        const tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.65;
        const ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        const damage = config.damage || 20;
        const pullForce = config.pullForce || 80;
        const duration = config.duration || 4000;
        const pullRadius = 220;

        // Tornado emoji — spins via scale pulse (emoji rotation not reliable)
        const tornado = scene.add.text(tx, ty, '🌪️', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0.85);
        scene.tweens.add({
            targets: tornado, scaleX: 1.15, scaleY: 1.15,
            yoyo: true, repeat: -1, duration: 250
        });

        const ticks = Math.floor(duration / 200);
        const pullEvt = scene.time.addEvent({
            delay: 200, repeat: ticks - 1,
            callback: function() {
                var targets = [];
                for (var ei = 0; ei < scene.enemies.length; ei++) {
                    var e = scene.enemies[ei];
                    if (!e || e.isDead) continue;
                    var dx = tx - e.x, dy = ty - e.y;
                    var dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < pullRadius) targets.push({ e: e, dx: dx, dy: dy, dist: dist });
                }
                targets.sort(function(a, b) { return a.dist - b.dist; });
                var maxTargets = config.targets || 8;
                for (var ti = 0; ti < Math.min(targets.length, maxTargets); ti++) {
                    var t = targets[ti];
                    var pull = (pullForce * 0.06) * (1 - t.dist / pullRadius);
                    t.e.x = Math.max(CONFIG.CASTLE.x + 55, t.e.x + (t.dx / t.dist) * pull);
                    t.e.y = Math.max(70, Math.min(CONFIG.GAME_HEIGHT - 70, t.e.y + (t.dy / t.dist) * pull));
                    t.e.updateVisuals();
                    t.e.takeDamage(Math.floor(damage * (scene.magicDamageMult || 1) * 0.2), false);
                }
            }
        });

        scene.time.delayedCall(duration, function() {
            pullEvt.remove(false);
            scene.tweens.add({
                targets: tornado, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 500,
                onComplete: function() { tornado.destroy(); }
            });
        });
    }

    static useLightning(scene) {
        const config = CONFIG.MAGIC.LIGHTNING;
        
        let targets = scene.enemies
            .filter(e => !e.isDead && e.x <= CONFIG.GAME_WIDTH)
            .sort((a, b) => a.x - b.x)
            .slice(0, config.targets);
        
        if (targets.length === 0) {
            scene.mana = Math.min(scene.maxMana, scene.mana + (config.manaCost || 0));
            scene.updateManaBar();
            return;
        }

        targets.forEach((target, index) => {
            setTimeout(() => {
                if (target.isDead) return;
                
                const lightning = scene.add.graphics();
                lightning.lineStyle(4, config.color);
                
                let currentY = 0;
                let currentX = target.x;
                lightning.moveTo(currentX, currentY);
                
                while (currentY < target.y) {
                    currentX += (Math.random() - 0.5) * 40;
                    currentY += 20 + Math.random() * 30;
                    lightning.lineTo(currentX, Math.min(currentY, target.y));
                }
                
                lightning.strokePath();
                
                const flash = scene.add.circle(target.x, target.y, 30, config.color, 0.8);
                
                scene.tweens.add({
                    targets: [lightning, flash], alpha: 0, duration: 200,
                    onComplete: () => { lightning.destroy(); flash.destroy(); }
                });
                
                target.takeDamage(config.damage, false);
                
                for (let i = 0; i < 8; i++) {
                    const spark = scene.add.circle(
                        target.x + (Math.random() - 0.5) * 40,
                        target.y + (Math.random() - 0.5) * 40,
                        3, 0xffff00
                    );
                    scene.tweens.add({
                        targets: spark, y: spark.y + 30, alpha: 0, duration: 400,
                        onComplete: () => spark.destroy()
                    });
                }
            }, index * 100);
        });
    }
}
