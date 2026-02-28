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
        var config = CONFIG.MAGIC.LIGHTNING;
        var targets = scene.enemies
            .filter(function(e) { return !e.isDead && e.x <= CONFIG.GAME_WIDTH; })
            .sort(function(a, b) { return a.x - b.x; })
            .slice(0, config.targets || 6);

        if (targets.length === 0) {
            scene.mana = Math.min(scene.maxMana, scene.mana + (config.manaCost || 0));
            scene.updateManaBar();
            return;
        }

        for (var idx = 0; idx < targets.length; idx++) {
            (function(target, delay) {
                scene.time.delayedCall(delay, function() {
                    if (target.isDead) return;
                    var g = scene.add.graphics();
                    g.lineStyle(4, config.color);
                    var cx = target.x, cy = 0;
                    g.moveTo(cx, cy);
                    while (cy < target.y) { cx += (Math.random()-0.5)*40; cy += 20+Math.random()*30; g.lineTo(cx, Math.min(cy, target.y)); }
                    g.strokePath();
                    var fl = scene.add.circle(target.x, target.y, 30, config.color, 0.8);
                    scene.tweens.add({ targets: [g, fl], alpha: 0, duration: 200, onComplete: function() { g.destroy(); fl.destroy(); } });
                    var dmg = Math.floor((config.damage || 120) * (scene.magicDamageMult || 1));
                    target.takeDamage(dmg, false);
                    for (var i = 0; i < 8; i++) {
                        var sp = scene.add.circle(target.x+(Math.random()-0.5)*40, target.y+(Math.random()-0.5)*40, 3, 0xffff00);
                        scene.tweens.add({ targets: sp, y: sp.y+30, alpha: 0, duration: 400, onComplete: function() { sp.destroy(); } });
                    }
                });
            })(targets[idx], idx * 100);
        }
    }

    // ==============================================
    // НОВЫЕ СПОСОБНОСТИ МАГОВ
    // ==============================================

    // AEROMANCER: Шквал воздуха — воздушный поток к курсору
    static useSquall(scene) {
        var tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.7;
        var ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        var cx = CONFIG.CASTLE.x, cy = CONFIG.CASTLE.y;
        var angle = Math.atan2(ty - cy, tx - cx);
        var dmg = Math.floor(22 * (scene.magicDamageMult || 1));
        // 3 воздушных волны по линии
        for (var wave = 0; wave < 3; wave++) {
            (function(w) {
                scene.time.delayedCall(w * 120, function() {
                    var g = scene.add.graphics();
                    g.lineStyle(3, 0xaaddff, 0.7);
                    var sx = cx + Math.cos(angle) * 60, sy = cy + Math.sin(angle) * 60;
                    g.lineBetween(sx + Math.sin(angle)*8*w, sy - Math.cos(angle)*8*w,
                                  sx + Math.cos(angle)*520 + Math.sin(angle)*8*w, sy + Math.sin(angle)*520 - Math.cos(angle)*8*w);
                    scene.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: function() { g.destroy(); } });
                });
            })(wave);
        }
        // Урон и отбрасывание врагов в конусе
        for (var ei = 0; ei < scene.enemies.length; ei++) {
            var e = scene.enemies[ei];
            if (!e || e.isDead) continue;
            var ex = e.x - cx, ey = e.y - cy;
            var dist = Math.sqrt(ex*ex + ey*ey);
            if (dist > 600) continue;
            var eAngle = Math.atan2(ey, ex);
            var diff = Math.abs(eAngle - angle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff < 0.6) { // ~34° half-angle cone
                e.takeDamage(dmg, false);
                e.pushBack(angle, 70 + (scene.windPushBonus || 0));
            }
        }
        var t = scene.add.text(tx, ty - 20, '💨', { fontSize: '28px' }).setOrigin(0.5);
        scene.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 600, onComplete: function() { t.destroy(); } });
    }

    // AEROMANCER: Вихревой шторм — 3 вихря зигзагом
    static useVortex(scene) {
        var dmg = Math.floor(15 * (scene.magicDamageMult || 1));
        for (var vi = 0; vi < 3; vi++) {
            (function(vIdx) {
                var vy = 120 + vIdx * 120;
                var vx = CONFIG.CASTLE.x + 100;
                var vEmoji = scene.add.text(vx, vy, '🌀', { fontSize: '36px' }).setOrigin(0.5);
                var phase = vIdx * Math.PI * 2 / 3;
                var ticks = 0, maxTicks = 30;
                var hitSet = {};
                var moveEvt = scene.time.addEvent({ delay: 60, repeat: maxTicks - 1, callback: function() {
                    ticks++;
                    vx += 14;
                    vy = 120 + vIdx * 120 + Math.sin(ticks * 0.4 + phase) * 70;
                    vEmoji.x = vx; vEmoji.y = vy;
                    for (var ei = 0; ei < scene.enemies.length; ei++) {
                        var e = scene.enemies[ei];
                        if (!e || e.isDead || hitSet[e.uid]) continue;
                        var dx = e.x - vx, dy = e.y - vy;
                        if (dx*dx + dy*dy < 55*55) {
                            hitSet[e.uid] = true;
                            e.takeDamage(dmg, false);
                            e.pushBack(Math.atan2(dy, dx), 40);
                        }
                    }
                    if (ticks >= maxTicks) scene.tweens.add({ targets: vEmoji, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: function() { vEmoji.destroy(); } });
                }});
            })(vi);
        }
    }

    // CRYOMANCER: Заморозка по линии
    static useFreezeRay(scene) {
        var tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.7;
        var ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        var cx = CONFIG.CASTLE.x, cy = CONFIG.CASTLE.y;
        var angle = Math.atan2(ty - cy, tx - cx);
        var g = scene.add.graphics();
        g.lineStyle(6, 0x88eeff, 0.8);
        g.lineBetween(cx, cy, cx + Math.cos(angle)*700, cy + Math.sin(angle)*700);
        scene.tweens.add({ targets: g, alpha: 0, duration: 600, onComplete: function() { g.destroy(); } });
        var freezeDur = 3500 + (scene.freezeExtendBonus || 0);
        for (var ei = 0; ei < scene.enemies.length; ei++) {
            var e = scene.enemies[ei];
            if (!e || e.isDead) continue;
            var ex = e.x - cx, ey = e.y - cy;
            var dist = Math.sqrt(ex*ex + ey*ey);
            if (dist > 700) continue;
            var eAngle = Math.atan2(ey, ex);
            var diff = Math.abs(eAngle - angle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff < 0.25) e.freeze(freezeDur); // narrow beam ~14°
        }
    }

    // CRYOMANCER: Дождь — замедление + урон по всем
    static useRain(scene) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var dmgPerTick = Math.floor(8 * (scene.magicDamageMult || 1));
        // Дождевая завеса
        var rainG = scene.add.graphics();
        for (var r = 0; r < 40; r++) {
            var rx = 80 + Math.random() * (W - 100);
            rainG.lineStyle(1, 0x88eeff, 0.4 + Math.random() * 0.4);
            rainG.lineBetween(rx, 0, rx - 10, 30);
        }
        scene.tweens.add({ targets: rainG, alpha: 0, duration: 4000, onComplete: function() { rainG.destroy(); } });
        // Замедление и тики урона 5 сек
        var enemies = scene.enemies.filter(function(e) { return !e.isDead; });
        for (var i = 0; i < enemies.length; i++) enemies[i].applySlow(5000, 0.5);
        var ticks = 0;
        var rainEvt = scene.time.addEvent({ delay: 1000, repeat: 4, callback: function() {
            ticks++;
            for (var ei = 0; ei < scene.enemies.length; ei++) {
                var e = scene.enemies[ei];
                if (!e || e.isDead) continue;
                e.takeDamage(dmgPerTick, false);
            }
        }});
        // Показать текст
        var rnTxt = scene.add.text(W/2, 80, '🌧️ Ледяной дождь!', { fontSize: '9px', color: '#88eeff', fontFamily: FONT, stroke: '#001133', strokeThickness: 3 }).setOrigin(0.5).setDepth(160);
        scene.tweens.add({ targets: rnTxt, y: rnTxt.y - 20, alpha: 0, delay: 1500, duration: 1000, onComplete: function() { rnTxt.destroy(); } });
    }

    // CRYOMANCER: Лечение постепенное (HoT)
    static useCryoHeal(scene) {
        var healPerTick = 10, ticks = 5;
        var t = scene.add.text(CONFIG.CASTLE.x, CONFIG.CASTLE.y - 60, '💚 Восстановление...', { fontSize: '7px', color: '#44ffaa', fontFamily: FONT, stroke: '#001a00', strokeThickness: 2 }).setOrigin(0.5).setDepth(160);
        scene.tweens.add({ targets: t, alpha: 0, delay: 4500, duration: 500, onComplete: function() { t.destroy(); } });
        scene.time.addEvent({ delay: 1000, repeat: ticks - 1, callback: function() { scene.healCastle(healPerTick); } });
    }

    // CRYOMANCER: Ульта — Ледяной шторм
    static useIceStorm(scene) {
        var count = 7, radius = 110;
        var freezeDur = 2500 + (scene.freezeExtendBonus || 0);
        var dmg = Math.floor(40 * (scene.magicDamageMult || 1));
        for (var i = 0; i < count; i++) {
            (function(idx) {
                scene.time.delayedCall(idx * 220, function() {
                    var mx = 120 + Math.random() * (CONFIG.GAME_WIDTH - 160);
                    var my = 60 + Math.random() * (CONFIG.GAME_HEIGHT - 120);
                    var shard = scene.add.text(mx, -30, '🌨️', { fontSize: '28px' }).setOrigin(0.5);
                    scene.tweens.add({ targets: shard, y: my, duration: 500, ease: 'Power2',
                        onComplete: function() {
                            var exp = scene.add.circle(mx, my, 45, 0x88eeff, 0.55);
                            scene.tweens.add({ targets: exp, scaleX: 2, scaleY: 2, alpha: 0, duration: 350, onComplete: function() { shard.destroy(); exp.destroy(); } });
                            for (var ei = 0; ei < scene.enemies.length; ei++) {
                                var e = scene.enemies[ei];
                                if (!e || e.isDead) continue;
                                var dx = e.x - mx, dy = e.y - my;
                                if (dx*dx + dy*dy < 65*65) { e.takeDamage(dmg, false); e.freeze(freezeDur); }
                            }
                        }
                    });
                });
            })(i);
        }
    }

    // GEOMANCER: Разлом — урон и замедление по линии
    static useQuake(scene) {
        var tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.7;
        var ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        var cx = CONFIG.CASTLE.x, cy = CONFIG.CASTLE.y;
        var angle = Math.atan2(ty - cy, tx - cx);
        var dmg = Math.floor(45 * (scene.magicDamageMult || 1));
        // Трещина земли — рисуем зигзаг
        var g = scene.add.graphics();
        g.lineStyle(5, 0x8B4513, 0.85);
        var px = cx, py = cy;
        for (var s = 0; s < 14; s++) {
            var nx = px + Math.cos(angle) * 50 + (Math.random()-0.5)*22;
            var ny = py + Math.sin(angle) * 50 + (Math.random()-0.5)*22;
            g.lineBetween(px, py, nx, ny);
            px = nx; py = ny;
        }
        var rockG = scene.add.graphics();
        rockG.fillStyle(0x8B4513, 0.6);
        for (var r = 0; r < 7; r++) {
            var rpx = cx + Math.cos(angle)*(60+r*75) + (Math.random()-0.5)*28;
            var rpy = cy + Math.sin(angle)*(60+r*75) + (Math.random()-0.5)*28;
            rockG.fillRect(rpx-6, rpy-6, 12+Math.random()*10, 12+Math.random()*10);
        }
        scene.tweens.add({ targets: [g, rockG], alpha: 0, delay: 300, duration: 600, onComplete: function() { g.destroy(); rockG.destroy(); } });
        // Урон врагам в конусе
        for (var ei = 0; ei < scene.enemies.length; ei++) {
            var e = scene.enemies[ei];
            if (!e || e.isDead) continue;
            var ex = e.x - cx, ey2 = e.y - cy;
            var dist = Math.sqrt(ex*ex + ey2*ey2);
            if (dist > 650) continue;
            var eAngle = Math.atan2(ey2, ex);
            var diff = Math.abs(eAngle - angle);
            if (diff > Math.PI) diff = Math.PI*2 - diff;
            if (diff < 0.35) { e.takeDamage(dmg, false); e.applySlow(3000, 0.4); }
        }
        scene.cameras.main.shake(200, 0.006);
    }

    // GEOMANCER: Колючая лоза — AoE у курсора
    static useThorns(scene) {
        var tx = scene.lastPointer ? scene.lastPointer.x : CONFIG.GAME_WIDTH * 0.7;
        var ty = scene.lastPointer ? scene.lastPointer.y : CONFIG.GAME_HEIGHT * 0.5;
        var radius = 130, duration = 5000;
        var dmg = Math.floor(10 * (scene.magicDamageMult || 1));
        var g = scene.add.circle(tx, ty, radius, 0x228B22, 0.45);
        g.setStrokeStyle(3, 0x006400, 0.8);
        for (var i = 0; i < 8; i++) {
            var ta = i / 8 * Math.PI * 2;
            var th = scene.add.text(tx + Math.cos(ta)*radius*0.7, ty + Math.sin(ta)*radius*0.7, '🌿', { fontSize: '16px' }).setOrigin(0.5);
            scene.tweens.add({ targets: th, alpha: 0, delay: duration - 400, duration: 400, onComplete: function() { th.destroy(); } });
        }
        var ticks = Math.floor(duration / 1000);
        scene.time.addEvent({ delay: 1000, repeat: ticks - 1, callback: function() {
            for (var ei = 0; ei < scene.enemies.length; ei++) {
                var e = scene.enemies[ei];
                if (!e || e.isDead) continue;
                var dx = e.x - tx, dy = e.y - ty;
                if (dx*dx + dy*dy < radius*radius) { e.takeDamage(dmg, false); e.applySlow(1200, 0.55); }
            }
        }});
        scene.time.delayedCall(duration, function() { scene.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: function() { g.destroy(); } }); });
    }

    // GEOMANCER: Ульта — 2 каменных голема
    static useGolemSummon(scene) {
        var golemDmg = 15, golemRadius = 80, golemDuration = 15000;
        for (var gi = 0; gi < 2; gi++) {
            (function(gIdx) {
                var gx = 350 + Math.random() * 300, gy = 120 + Math.random() * 300;
                var golemVis = scene.add.text(gx, gy, '🗿', { fontSize: '40px' }).setOrigin(0.5).setDepth(52);
                var hpBar = scene.add.rectangle(gx, gy - 30, 44, 5, 0x228B22).setDepth(53);
                scene.mageGolemObjects = scene.mageGolemObjects || [];
                var golemObj = { x: gx, y: gy, vis: golemVis, hp: hpBar, active: true };
                scene.mageGolemObjects.push(golemObj);
                var golemEvt = scene.time.addEvent({ delay: 800, repeat: Math.floor(golemDuration / 800) - 1, callback: function() {
                    if (!golemObj.active) { golemEvt.remove(); return; }
                    for (var ei = 0; ei < scene.enemies.length; ei++) {
                        var e = scene.enemies[ei];
                        if (!e || e.isDead) continue;
                        var dx = e.x - gx, dy = e.y - gy;
                        if (dx*dx + dy*dy < golemRadius*golemRadius) {
                            e.takeDamage(golemDmg, false);
                            var rock = scene.add.text(gx, gy, '🪨', { fontSize: '14px' }).setOrigin(0.5);
                            scene.tweens.add({ targets: rock, x: e.x, y: e.y, duration: 250, onComplete: function() { rock.destroy(); } });
                            break;
                        }
                    }
                }});
                scene.time.delayedCall(golemDuration, function() {
                    golemObj.active = false;
                    scene.tweens.add({ targets: [golemVis, hpBar], alpha: 0, duration: 500, onComplete: function() { golemVis.destroy(); hpBar.destroy(); } });
                    var idx2 = scene.mageGolemObjects.indexOf(golemObj);
                    if (idx2 > -1) scene.mageGolemObjects.splice(idx2, 1);
                });
            })(gi);
        }
        scene.showMessage('🗿 Голем призван!', '#aa8855');
    }

    // PYROMANCER: Лавовая броня — щит + лечение
    static useLavaArmor(scene) {
        var duration = 8000, healPerSec = 8;
        scene.castleShieldActive = true;
        scene.castleShieldReduction = 0.6;
        var shieldRing = scene.add.circle(CONFIG.CASTLE.x, CONFIG.CASTLE.y, 78, 0xff4400, 0.15);
        shieldRing.setStrokeStyle(4, 0xff8800, 0.9);
        scene.tweens.add({ targets: shieldRing, scaleX: 1.08, scaleY: 1.08, yoyo: true, repeat: -1, duration: 600 });
        var laTxt = scene.add.text(CONFIG.CASTLE.x, CONFIG.CASTLE.y - 95, '🛡️ ЛАВОВАЯ БРОНЯ', { fontSize: '7px', color: '#ff8800', fontFamily: FONT, stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
        var healEvt = scene.time.addEvent({ delay: 1000, repeat: Math.floor(duration / 1000) - 1, callback: function() { scene.healCastle(healPerSec); } });
        scene.time.delayedCall(duration, function() {
            scene.castleShieldActive = false;
            healEvt.remove(false);
            scene.tweens.add({ targets: [shieldRing, laTxt], alpha: 0, duration: 500, onComplete: function() { shieldRing.destroy(); laTxt.destroy(); } });
        });
    }

    // PYROMANCER: Ульта — Дыхание Дракона
    static useDragonBreath(scene) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var dmg = Math.floor(60 * (scene.magicDamageMult || 1));
        // Огненная волна слева направо
        var waveG = scene.add.graphics();
        waveG.fillStyle(0xff4400, 0.35); waveG.fillRect(0, 0, W, H);
        scene.tweens.add({ targets: waveG, alpha: 0, duration: 700, onComplete: function() { waveG.destroy(); } });
        var dragonTxt = scene.add.text(W/2, H/2, '🐉', { fontSize: '80px' }).setOrigin(0.5).setAlpha(0.9);
        scene.tweens.add({ targets: dragonTxt, alpha: 0, scaleX: 3, scaleY: 3, duration: 800, onComplete: function() { dragonTxt.destroy(); } });
        // Поджечь и отбросить всех
        for (var ei = 0; ei < scene.enemies.length; ei++) {
            var e = scene.enemies[ei];
            if (!e || e.isDead) continue;
            e.takeDamage(dmg, false);
            if (e.applyBurn) e.applyBurn(4, 0.15);
            e.pushBack(0, 80 + Math.random() * 40); // right
        }
        scene.cameras.main.shake(400, 0.01);
        scene.showMessage('🐉 Дыхание Дракона!', '#ff4400');
    }
}
