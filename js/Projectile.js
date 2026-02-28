/**
 * КЛАСС PROJECTILE v4 — NEW WEAPONS
 * Бумеранг (возврат), Огнемёт (конус), Баллиста (пронзает всех)
 */

class Projectile {
    constructor(scene, startX, startY, targetX, targetY, damage, speed, weaponKey, weaponState) {
        this.scene = scene;
        this.damage = damage;
        this.speed = speed;
        this.weaponKey = weaponKey;
        this.state = weaponState;
        this.isDead = false;
        this.hitEnemies = [];

        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;

        this.angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;

        this.isCrit = Math.random() * 100 < this.state.critChance;
        if (this.isCrit) this.damage *= 2;

        this.ammoType = this.state.ammoType;
        this.ammoConfig = CONFIG.AMMO_TYPES[this.ammoType];

        // Boomerang state
        this.isReturning = false;
        this.distanceTraveled = 0;
        this.maxRange = this.state.maxRange || CONFIG.WEAPONS[this.weaponKey].baseMaxRange || 400;

        this.createVisual();
    }

    createVisual() {
        var projTexKey = 'proj_' + this.weaponKey;
        this.hasCustomSprite = this.scene.textures.exists(projTexKey);

        if (this.hasCustomSprite) {
            this.projSprite = this.scene.add.image(this.x, this.y, projTexKey);
            var spriteSize = this.isCrit ? 32 : 24;
            if (CONFIG.WEAPONS[this.weaponKey].splash) spriteSize = this.isCrit ? 38 : 30;
            this.projSprite.setDisplaySize(spriteSize, spriteSize);
            this.projSprite.setRotation(this.angle);
            this.projSprite.setDepth(40);
            this.graphics = null;
            this.trail = null;
        } else {
            this.projSprite = null;
            this.graphics = this.scene.add.graphics();
            this.graphics.setDepth(40);

            if (CONFIG.WEAPONS[this.weaponKey].pierce || CONFIG.WEAPONS[this.weaponKey].boomerang) {
                this.trail = this.scene.add.graphics();
                this.trail.setDepth(39);
                this.trailPoints = [];
            }
        }

        this.drawProjectile();
    }

    drawProjectile() {
        if (this.hasCustomSprite && this.projSprite) {
            this.projSprite.x = this.x;
            this.projSprite.y = this.y;
            this.projSprite.setRotation(this.angle);
            return;
        }

        if (!this.graphics) return;
        this.graphics.clear();

        var x = this.x;
        var y = this.y;
        var cos = Math.cos(this.angle);
        var sin = Math.sin(this.angle);
        var color = this.ammoConfig.color;
        var sizeMult = this.isCrit ? 1.3 : 1;
        var weapon = CONFIG.WEAPONS[this.weaponKey];

        if (weapon.boomerang) {
            // Бумеранг — вращающийся объект
            var rot = this.scene.time.now * 0.01;
            this.graphics.fillStyle(0x8B4513);
            for (var a = 0; a < 3; a++) {
                var bAngle = rot + (a * Math.PI * 2 / 3);
                var bx = x + Math.cos(bAngle) * 10 * sizeMult;
                var by = y + Math.sin(bAngle) * 10 * sizeMult;
                this.graphics.fillRect(bx - 3, by - 2, 6, 4);
            }
            this.graphics.fillStyle(color, 0.5);
            this.graphics.fillCircle(x, y, 6 * sizeMult);

            if (this.trail) {
                this.trailPoints.push({ x: x, y: y });
                if (this.trailPoints.length > 12) this.trailPoints.shift();
                this.trail.clear();
                this.trail.lineStyle(2, 0x8B4513, 0.3);
                if (this.trailPoints.length > 1) this.trail.strokePoints(this.trailPoints);
            }
        } else if (weapon.flameCone) {
            // Огнемёт — огненный шар
            this.graphics.fillStyle(0xff4400);
            this.graphics.fillCircle(x, y, 6 * sizeMult);
            this.graphics.fillStyle(0xff8800, 0.6);
            this.graphics.fillCircle(x, y, 9 * sizeMult);

            if (Math.random() < 0.5) {
                var flame = this.scene.add.circle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, 3, 0xff6600, 0.7);
                this.scene.tweens.add({targets: flame, alpha: 0, y: flame.y - 8, scale: 0.3, duration: 200, onComplete: function(){flame.destroy();}});
            }
        } else if (weapon.splash) {
            this.graphics.fillStyle(0x333333);
            this.graphics.fillCircle(x, y, 10 * sizeMult);
            this.graphics.fillStyle(color, 0.5);
            this.graphics.fillCircle(x, y, 12 * sizeMult);

            if (Math.random() < 0.3) {
                var smoke = this.scene.add.circle(x - cos * 10, y - sin * 10, 4, 0x888888, 0.4);
                this.scene.tweens.add({targets: smoke, alpha: 0, scale: 2, duration: 400, onComplete: function(){smoke.destroy();}});
            }
        } else if (weapon.pierce && this.weaponKey === 'BALLISTA') {
            // Баллиста — большой болт
            this.graphics.lineStyle(4 * sizeMult, 0x664422);
            this.graphics.lineBetween(x - cos * 20, y - sin * 20, x + cos * 15, y + sin * 15);
            this.graphics.fillStyle(0xcccccc);
            var tipX = x + cos * 22;
            var tipY = y + sin * 22;
            var perpX = -sin * 6 * sizeMult;
            var perpY = cos * 6 * sizeMult;
            this.graphics.fillTriangle(tipX, tipY, x + cos * 12 + perpX, y + sin * 12 + perpY, x + cos * 12 - perpX, y + sin * 12 - perpY);

            if (this.trail) {
                this.trailPoints.push({ x: x, y: y });
                if (this.trailPoints.length > 15) this.trailPoints.shift();
                this.trail.clear();
                this.trail.lineStyle(3, 0x664422, 0.2);
                if (this.trailPoints.length > 1) this.trail.strokePoints(this.trailPoints);
            }
        } else if (weapon.pierce) {
            this.graphics.fillStyle(color);
            var perpX2 = -sin * 3 * sizeMult;
            var perpY2 = cos * 3 * sizeMult;
            this.graphics.fillTriangle(
                x - cos * 10 + perpX2, y - sin * 10 + perpY2,
                x - cos * 10 - perpX2, y - sin * 10 - perpY2,
                x + cos * 12, y + sin * 12
            );
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillCircle(x, y, 2 * sizeMult);

            if (this.trail) {
                this.trailPoints.push({ x: x, y: y });
                if (this.trailPoints.length > 10) this.trailPoints.shift();
                this.trail.clear();
                this.trail.lineStyle(2, color, 0.3);
                if (this.trailPoints.length > 1) this.trail.strokePoints(this.trailPoints);
            }
        } else {
            // Арбалет — стрела
            this.graphics.lineStyle(3 * sizeMult, 0x8B4513);
            this.graphics.lineBetween(x - cos * 15, y - sin * 15, x + cos * 10, y + sin * 10);

            this.graphics.fillStyle(color);
            var tipX3 = x + cos * 18;
            var tipY3 = y + sin * 18;
            var perpX3 = -sin * 4 * sizeMult;
            var perpY3 = cos * 4 * sizeMult;
            this.graphics.fillTriangle(tipX3, tipY3, x + cos * 10 + perpX3, y + sin * 10 + perpY3, x + cos * 10 - perpX3, y + sin * 10 - perpY3);

            this.graphics.fillStyle(0xff4444);
            var tailX = x - cos * 15;
            var tailY = y - sin * 15;
            this.graphics.fillTriangle(tailX, tailY, tailX - cos * 5 + perpX3, tailY - sin * 5 + perpY3, tailX - cos * 5 - perpX3, tailY - sin * 5 - perpY3);
        }

        if (this.isCrit) {
            this.graphics.lineStyle(2, 0xffff00, 0.7);
            this.graphics.strokeCircle(x, y, 15);
        }

        this.drawAmmoEffect(x, y);
    }

    drawAmmoEffect(x, y) {
        if (!this.graphics) return;
        var ae = this.scene.ammoEffects;
        if (!ae) return;
        if (ae.electric > 0 && Math.random() < 0.3) {
            this.graphics.lineStyle(1, 0x00ffff, 0.8);
            for (var i = 0; i < 2; i++) {
                var sx = x + (Math.random() - 0.5) * 20;
                var sy = y + (Math.random() - 0.5) * 20;
                this.graphics.lineBetween(x, y, sx, sy);
            }
        }
        if (ae.fire > 0 && Math.random() < 0.4) {
            var flame = this.scene.add.circle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, 3 + Math.random() * 3, 0xff6600, 0.7);
            this.scene.tweens.add({targets: flame, alpha: 0, y: flame.y - 10, scale: 0.5, duration: 300, onComplete: function(){flame.destroy();}});
        }
        if (ae.ice > 0 && Math.random() < 0.2) {
            var ice = this.scene.add.circle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, 2, 0x88ffff, 0.8);
            this.scene.tweens.add({targets: ice, alpha: 0, duration: 400, onComplete: function(){ice.destroy();}});
        }
        if (ae.multi > 0 && Math.random() < 0.25) {
            var glow = this.scene.add.circle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, 2 + Math.random() * 2, 0xff00ff, 0.6);
            this.scene.tweens.add({targets: glow, alpha: 0, scale: 1.5, duration: 250, onComplete: function(){glow.destroy();}});
        }
    }

    update() {
        if (this.isDead) return;

        var delta = this.scene.game.loop.delta / 1000;
        var weapon = CONFIG.WEAPONS[this.weaponKey];

        // Boomerang return logic
        if (weapon.boomerang) {
            this.distanceTraveled += this.speed * delta;
            if (!this.isReturning && this.distanceTraveled >= this.maxRange) {
                this.isReturning = true;
                this.hitEnemies = []; // Can hit same enemies on return
                // Reverse direction toward castle
                this.angle = Phaser.Math.Angle.Between(this.x, this.y, this.startX, this.startY);
                this.velocityX = Math.cos(this.angle) * this.speed;
                this.velocityY = Math.sin(this.angle) * this.speed;
            }
            if (this.isReturning) {
                var distBack = Phaser.Math.Distance.Between(this.x, this.y, this.startX, this.startY);
                if (distBack < 30) { this.destroy(); return; }
            }
        }

        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;

        this.drawProjectile();

        if (this.x < -50 || this.x > CONFIG.GAME_WIDTH + 50 ||
            this.y < -50 || this.y > CONFIG.GAME_HEIGHT + 50) {
            this.destroy();
            return;
        }

        this.checkCollisions();
    }

    checkCollisions() {
        var weapon = CONFIG.WEAPONS[this.weaponKey];

        for (var e = 0; e < this.scene.enemies.length; e++) {
            var enemy = this.scene.enemies[e];
            if (enemy.isDead) continue;
            if (this.hitEnemies.indexOf(enemy) !== -1) continue;
            if (enemy.x > CONFIG.GAME_WIDTH) continue;
            // Skip stealthed assassins (can't be targeted)
            if (enemy.isStealthed) continue;

            var dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

            if (dist < enemy.config.size / 2 + 12) {
                this.hitEnemy(enemy);

                if (weapon.pierce || weapon.boomerang) {
                    this.hitEnemies.push(enemy);

                    if (weapon.pierce && this.state.bounces > 0) {
                        if (this.state.damageGrowth > 0) {
                            this.damage = Math.floor(this.damage * (1 + this.state.damageGrowth));
                            var growthFx = this.scene.add.text(enemy.x, enemy.y - 25, '⬆', {fontSize: '16px', color: '#ff00ff'}).setOrigin(0.5);
                            this.scene.tweens.add({targets: growthFx, y: growthFx.y - 20, alpha: 0, duration: 400, onComplete: function(){growthFx.destroy();}});
                        }

                        if (!this.scene.voidPierce && this.hitEnemies.length >= this.state.bounces) {
                            this.destroy();
                            return;
                        }
                    } else if (weapon.pierce && !this.scene.voidPierce) {
                        // no bounces limit but voidPierce overrides
                    }
                    continue;
                }

                if (weapon.splash) {
                    this.doSplashDamage(enemy);
                }

                // Void Pierce: all projectiles become piercing
                if (this.scene.voidPierce) {
                    this.hitEnemies.push(enemy);
                    continue;
                }

                this.destroy();
                return;
            }
        }
    }

    hitEnemy(enemy) {
        var dmg = this.damage;
        // Cursed Rounds: add % of enemy current HP as bonus damage
        if (this.scene.cursedRoundsValue > 0) {
            dmg = Math.floor(dmg + enemy.hp * this.scene.cursedRoundsValue);
        }
        enemy.takeDamage(dmg, this.isCrit);
        this.applyAmmoEffect(enemy);
        this.createHitEffect(enemy.x, enemy.y);
    }

    applyAmmoEffect(enemy) {
        var ae = this.scene.ammoEffects;
        if (!ae) return;
        if (ae.electric > 0) this.chainLightning(enemy);
        if (ae.fire > 0) this.applyBurn(enemy);
        if (ae.ice > 0) {
            var slowPct = Math.min(0.7, 0.3 + ae.ice * 0.10);
            var slowDur = 2000 + ae.ice * 500;
            enemy.applySlow(slowDur, slowPct);
        }
    }

    chainLightning(firstEnemy) {
        var ae = this.scene.ammoEffects;
        var chainTargets = 2 + (ae ? ae.electric : 0);
        var chainDmgPct = 0.3 + (ae ? ae.electric * 0.15 : 0);
        var chainDamage = this.damage * chainDmgPct;

        var lastEnemy = firstEnemy;

        for (var i = 0; i < chainTargets; i++) {
            var nearest = null;
            var nearestDist = 150;

            for (var e = 0; e < this.scene.enemies.length; e++) {
                var enemy = this.scene.enemies[e];
                if (enemy === lastEnemy || enemy === firstEnemy) continue;
                if (enemy.isDead) continue;
                if (enemy.x > CONFIG.GAME_WIDTH) continue;

                var dist = Phaser.Math.Distance.Between(lastEnemy.x, lastEnemy.y, enemy.x, enemy.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = enemy;
                }
            }

            if (nearest) {
                var lightning = this.scene.add.graphics();
                lightning.lineStyle(2, 0x00ffff);
                lightning.moveTo(lastEnemy.x, lastEnemy.y);

                var steps = 5;
                for (var s = 1; s <= steps; s++) {
                    var t = s / steps;
                    var tx = lastEnemy.x + (nearest.x - lastEnemy.x) * t + (Math.random() - 0.5) * 20;
                    var ty = lastEnemy.y + (nearest.y - lastEnemy.y) * t + (Math.random() - 0.5) * 20;
                    lightning.lineTo(tx, ty);
                }
                lightning.strokePath();

                this.scene.tweens.add({targets: lightning, alpha: 0, duration: 200, onComplete: function(){lightning.destroy();}});

                nearest.takeDamage(chainDamage, false);
                lastEnemy = nearest;
            } else {
                break;
            }
        }
    }

    applyBurn(enemy) {
        if (enemy.isBurning) return;

        var ae = this.scene.ammoEffects;
        var burnTicks = 3 + (ae ? ae.fire : 0);
        var burnDmgPct = 0.4 + (ae ? ae.fire * 0.12 : 0);
        var totalDamage = this.damage * burnDmgPct;
        var damagePerTick = Math.max(1, Math.floor(totalDamage / burnTicks));
        var burnDuration = 4000;
        var tickInterval = burnDuration / burnTicks;

        enemy.isBurning = true;
        var ticksLeft = burnTicks;
        var scene = this.scene;

        var burnTimer = scene.time.addEvent({
            delay: tickInterval,
            callback: function() {
                if (enemy.isDead) { burnTimer.remove(); return; }

                enemy.takeDamage(damagePerTick, false);

                var fire = scene.add.text(enemy.x, enemy.y - 20, '🔥', { fontSize: '16px' }).setOrigin(0.5);
                scene.tweens.add({targets: fire, y: fire.y - 15, alpha: 0, duration: 400, onComplete: function(){fire.destroy();}});

                ticksLeft--;
                if (ticksLeft <= 0) enemy.isBurning = false;
            },
            repeat: burnTicks - 1
        });
    }

    doSplashDamage(hitEnemy) {
        var radius = this.state.splashRadius;
        var pushback = this.state.pushback;
        var self = this;

        var explosion = this.scene.add.circle(this.x, this.y, 10, 0xff6600);
        this.scene.tweens.add({targets: explosion, scale: radius / 10, alpha: 0, duration: 300, onComplete: function(){explosion.destroy();}});

        for (var i = 0; i < 10; i++) {
            var angle = (Math.PI * 2 / 10) * i;
            var p = this.scene.add.circle(this.x, this.y, 4, 0xff4400);
            (function(pp, a){
                self.scene.tweens.add({targets: pp, x: self.x + Math.cos(a) * radius, y: self.y + Math.sin(a) * radius, alpha: 0, duration: 350, onComplete: function(){pp.destroy();}});
            })(p, angle);
        }

        for (var j = 0; j < this.scene.enemies.length; j++) {
            var enemy = this.scene.enemies[j];
            if (enemy.isDead || enemy === hitEnemy) continue;
            if (enemy.x > CONFIG.GAME_WIDTH) continue;

            var dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

            if (dist < radius) {
                var mult = 1 - (dist / radius) * 0.5;
                enemy.takeDamage(this.damage * mult * 0.4, false);

                if (pushback > 0) {
                    var pushDist = pushback * mult;
                    var newX = Math.min(CONFIG.GAME_WIDTH + 30, enemy.x + pushDist);

                    var pushEffect = this.scene.add.text(enemy.x, enemy.y, '💥', { fontSize: '16px' }).setOrigin(0.5);
                    (function(pe, nx){
                        self.scene.tweens.add({targets: pe, x: nx, alpha: 0, duration: 200, onComplete: function(){pe.destroy();}});
                    })(pushEffect, newX);

                    (function(en, nx2){
                        self.scene.tweens.add({targets: en, x: nx2, duration: 200, ease: 'Power2', onUpdate: function(){en.updateVisuals();}});
                    })(enemy, newX);
                }

                this.applyAmmoEffect(enemy);
            }
        }
    }

    createHitEffect(x, y) {
        var ae = this.scene.ammoEffects;
        var ammoColor = (ae && ae.electric > 0) ? 0x00ffff : (ae && ae.fire > 0) ? 0xff6600 : (ae && ae.ice > 0) ? 0x88ffff : 0xffffff;
        var color = this.isCrit ? 0xffff00 : ammoColor;
        var count = this.isCrit ? 8 : 5;

        for (var i = 0; i < count; i++) {
            var spark = this.scene.add.circle(
                x + (Math.random() - 0.5) * 15, y + (Math.random() - 0.5) * 15,
                2 + Math.random() * 2, color
            );
            (function(sp){
                sp.scene.tweens.add({targets: sp, alpha: 0, x: sp.x + (Math.random() - 0.5) * 25, y: sp.y + (Math.random() - 0.5) * 25, duration: 200, onComplete: function(){sp.destroy();}});
            })(spark);
        }

        if (this.isCrit) {
            var critText = this.scene.add.text(x, y - 20, 'КРИТ!', {fontSize: '14px', color: '#ffff00', fontStyle: 'bold'}).setOrigin(0.5);
            this.scene.tweens.add({targets: critText, y: critText.y - 20, alpha: 0, duration: 600, onComplete: function(){critText.destroy();}});
        }
    }

    destroy() {
        this.isDead = true;
        if (this.projSprite) this.projSprite.destroy();
        if (this.graphics) this.graphics.destroy();
        if (this.trail) this.trail.destroy();

        var idx = this.scene.projectiles.indexOf(this);
        if (idx > -1) this.scene.projectiles.splice(idx, 1);
    }
}
