/**
 * MENUSCENE — Main Menu, Level Select, Talents, Weapons Shop, Loadout Picker, Artifacts
 */
class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        var prog = window.gameProgress || {};
        this.prog = prog;

        // Background
        var bg = this.add.graphics();
        bg.fillGradientStyle(0x0d0716, 0x0d0716, 0x1a0e2e, 0x1a0e2e);
        bg.fillRect(0, 0, W, H);
        // Stars
        for (var s = 0; s < 40; s++) {
            bg.fillStyle(0xffeedd, 0.15 + Math.random() * 0.3);
            bg.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 1, 1);
        }

        // Title
        this.add.text(W/2, 40, 'THE GUILD DEFENCE', {
            fontSize: '16px', color: '#f0c866', fontFamily: FONT,
            stroke: '#1a0e0a', strokeThickness: 4
        }).setOrigin(0.5);

        // Gems display
        this.gemsText = this.add.text(W-20, 12, 'Gems: ' + (prog.gems || 0), {
            fontSize: '8px', color: '#66aaee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2
        }).setOrigin(1, 0);

        // Gold display
        this.goldText = this.add.text(W-20, 28, 'Gold: ' + (prog.gold || 0), {
            fontSize: '8px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2
        }).setOrigin(1, 0);

        this.currentView = 'menu';
        this.container = this.add.container(0, 0);
        // Reset loadout picker state
        this.ldWeapons = null;
        this.ldMages = null;
        this.ldLevelNum = null;
        this.showMainMenu();
    }

    clearContainer() {
        this.container.removeAll(true);
    }

    showMainMenu() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;

        this.createMenuButton(W/2, H/2 - 110, 'PLAY', '#aaee88', 0x2a4a1a, 0x6a9a3a, function() {
            self.showLevelSelect();
        });

        this.createMenuButton(W/2, H/2 - 55, 'TALENTS', '#cc88ee', 0x2a1a3a, 0x8844aa, function() {
            self.showTalents();
        });

        this.createMenuButton(W/2, H/2, 'WEAPONS', '#ee9944', 0x2a1a0a, 0x8a5a2a, function() {
            self.showWeaponsShop();
        });

        this.createMenuButton(W/2, H/2 + 55, 'MAGIC', '#88aaee', 0x0e1a2a, 0x2a5a8a, function() {
            self.showMagicShop();
        });

        this.createMenuButton(W/2, H/2 + 110, 'ARTIFACTS', '#f0c866', 0x3a2a0e, 0x8a6a2a, function() {
            self.showArtifacts();
        });
    }

    createMenuButton(x, y, text, textColor, bgColor, borderColor, callback) {
        var bg = this.add.graphics();
        bg.fillStyle(bgColor, 0.8); bg.fillRect(x-80, y-18, 160, 36);
        bg.lineStyle(2, borderColor, 0.7); bg.strokeRect(x-80, y-18, 160, 36);
        bg.lineStyle(1, borderColor, 0.2); bg.strokeRect(x-78, y-16, 156, 32);
        this.container.add(bg);

        var btn = this.add.rectangle(x, y, 160, 36, 0x000000, 0).setInteractive({useHandCursor: true});
        btn.on('pointerdown', callback);
        this.container.add(btn);

        var txt = this.add.text(x, y, text, {fontSize: '10px', color: textColor, fontFamily: FONT}).setOrigin(0.5);
        this.container.add(txt);
    }

    showLevelSelect() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        var unlocked = prog.unlockedLevels || [1];

        this.container.add(this.add.text(W/2, 70, 'SELECT LEVEL', {
            fontSize: '11px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        var cols = 5, startX = 120, startY = 130, cellW = 150, cellH = 80;
        var levelKeys = Object.keys(CONFIG.LEVELS);

        for (var i = 0; i < levelKeys.length; i++) {
            var levelNum = parseInt(levelKeys[i]);
            var level = CONFIG.LEVELS[levelNum];
            var col = i % cols, row = Math.floor(i / cols);
            var x = startX + col * cellW, y = startY + row * cellH;
            var isUnlocked = unlocked.indexOf(levelNum) !== -1;
            var bestWave = (prog.bestWavePerLevel && prog.bestWavePerLevel[levelNum]) || 0;

            var bg = this.add.graphics();
            if (isUnlocked) {
                bg.fillStyle(0x2a1a0e, 0.8); bg.fillRect(x-60, y-28, 120, 56);
                bg.lineStyle(1, 0x6a4a2a, 0.6); bg.strokeRect(x-60, y-28, 120, 56);
            } else {
                bg.fillStyle(0x0a0a0a, 0.6); bg.fillRect(x-60, y-28, 120, 56);
                bg.lineStyle(1, 0x333333, 0.3); bg.strokeRect(x-60, y-28, 120, 56);
            }
            this.container.add(bg);

            var numColor = isUnlocked ? '#f0c866' : '#666666';
            this.container.add(this.add.text(x, y-12, (level.icon || '') + ' ' + levelNum, {fontSize: '11px', color: numColor, fontFamily: FONT}).setOrigin(0.5));
            this.container.add(this.add.text(x, y+8, level.name || '', {fontSize: '5px', color: isUnlocked ? '#aa9988' : '#444444', fontFamily: FONT}).setOrigin(0.5));
            if (bestWave > 0) {
                this.container.add(this.add.text(x, y+22, '🏆 ' + bestWave, {fontSize: '6px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2}).setOrigin(0.5));
            }

            if (!isUnlocked) {
                this.container.add(this.add.text(x+44, y-14, '🔒', {fontSize: '10px'}).setOrigin(0.5));
            }

            if (isUnlocked) {
                var btn = this.add.rectangle(x, y+2, 120, 56, 0x000000, 0).setInteractive({useHandCursor: true});
                (function(ln) {
                    btn.on('pointerdown', function() {
                        self.ldWeapons = null;
                        self.ldMages = null;
                        self.showLoadoutPicker(ln);
                    });
                })(levelNum);
                this.container.add(btn);
            }
        }

        this.createBackButton();
    }

    // =============================================
    // TALENTS — costs are in GOLD
    // =============================================
    showTalents() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        var gold = prog.gold || 0;
        if (!prog.talents) prog.talents = {};

        this.container.add(this.add.text(W/2, 68, 'ТАЛАНТЫ', {
            fontSize: '11px', color: '#cc88ee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        this.talentGoldText = this.add.text(W/2, 86, 'Gold: ' + gold, {
            fontSize: '7px', color: '#f0c866', fontFamily: FONT
        }).setOrigin(0.5);
        this.container.add(this.talentGoldText);

        var categories = ['ATTACK', 'DEFENSE', 'MAGIC'];
        var catColors = { ATTACK: '#ee6644', DEFENSE: '#44cc88', MAGIC: '#8888ee' };
        var catIcons = { ATTACK: '⚔️', DEFENSE: '🛡️', MAGIC: '✨' };
        var colWidth = 290, startX = 45, startY = 108;

        for (var c = 0; c < categories.length; c++) {
            var cat = categories[c];
            var cx = startX + c * colWidth;

            this.container.add(this.add.text(cx + 80, startY, catIcons[cat] + ' ' + cat, {
                fontSize: '8px', color: catColors[cat], fontFamily: FONT
            }).setOrigin(0.5));

            var talents = CONFIG.TALENTS[cat];
            var tKeys = Object.keys(talents);
            for (var t = 0; t < tKeys.length; t++) {
                var tk = tKeys[t];
                var talent = talents[tk];
                var ty = startY + 22 + t * 112;
                var currentLevel = (prog.talents[cat] && prog.talents[cat][tk]) || 0;
                var isMaxed = currentLevel >= talent.maxLevel;
                var cost = isMaxed ? 0 : talent.costPerLevel[currentLevel];
                var canAfford = gold >= cost && !isMaxed;

                var tbg = this.add.graphics();
                tbg.fillStyle(0x1a0e0a, 0.6); tbg.fillRect(cx, ty, colWidth - 20, 100);
                tbg.lineStyle(1, 0x6a4a2a, 0.3); tbg.strokeRect(cx, ty, colWidth - 20, 100);
                this.container.add(tbg);

                this.container.add(this.add.text(cx + 8, ty + 6, talent.icon + ' ' + talent.name, {
                    fontSize: '8px', color: '#d4c4a4', fontFamily: FONT
                }));

                // Talent effect description
                var effectDesc = '+' + Math.round(talent.effectPerLevel * 100) + '% per level';
                this.container.add(this.add.text(cx + 8, ty + 24, effectDesc, {
                    fontSize: '6px', color: '#888877', fontFamily: FONT
                }));

                // Level dots
                var dotX = cx + 8;
                for (var d = 0; d < talent.maxLevel; d++) {
                    var dotColor = d < currentLevel ? 0xf0c866 : 0x333333;
                    var dot = this.add.circle(dotX + d * 22, ty + 50, 8, dotColor);
                    if (d < currentLevel) dot.setStrokeStyle(1, 0xaa8844);
                    this.container.add(dot);
                    this.container.add(this.add.text(dotX + d * 22, ty + 50, '' + (d + 1), {fontSize: '5px', color: d < currentLevel ? '#1a0e0a' : '#444444', fontFamily: FONT}).setOrigin(0.5));
                }

                if (!isMaxed) {
                    this.container.add(this.add.text(cx + 8, ty + 72, '💰 ' + cost + ' золота', {
                        fontSize: '7px', color: canAfford ? '#88cc66' : '#cc4444', fontFamily: FONT
                    }));

                    if (canAfford) {
                        var buyBg = this.add.graphics();
                        buyBg.fillStyle(0x2a4a1a, 0.7); buyBg.fillRect(cx + colWidth - 74, ty + 66, 50, 20);
                        buyBg.lineStyle(1, 0x6a9a3a, 0.5); buyBg.strokeRect(cx + colWidth - 74, ty + 66, 50, 20);
                        this.container.add(buyBg);
                        var buyBtn = this.add.rectangle(cx + colWidth - 49, ty + 76, 50, 20, 0x000000, 0).setInteractive({useHandCursor: true});
                        this.container.add(buyBtn);
                        this.container.add(this.add.text(cx + colWidth - 49, ty + 76, 'BUY', {fontSize: '6px', color: '#aaee88', fontFamily: FONT}).setOrigin(0.5));
                        (function(ca, tkey, co) {
                            buyBtn.on('pointerdown', function() {
                                if ((prog.gold || 0) < co) return;
                                prog.gold -= co;
                                if (!prog.talents[ca]) prog.talents[ca] = {};
                                prog.talents[ca][tkey] = (prog.talents[ca][tkey] || 0) + 1;
                                window.gameProgress = prog;
                                saveGameProgress();
                                self.showTalents();
                                self.gemsText.setText('Gems: ' + (prog.gems || 0));
                                self.goldText.setText('Gold: ' + (prog.gold || 0));
                            });
                        })(cat, tk, cost);
                    }
                } else {
                    this.container.add(this.add.text(cx + 8, ty + 72, '✓ МАКСИМУМ', {
                        fontSize: '7px', color: '#cc88ee', fontFamily: FONT
                    }));
                }
            }
        }

        this.createBackButton();
    }

    // =============================================
    // WEAPONS SHOP — buy with gems permanently
    // =============================================
    showWeaponsShop() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];
        var gems = prog.gems || 0;

        this.container.add(this.add.text(W/2, 68, 'АРСЕНАЛ', {
            fontSize: '11px', color: '#ee9944', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        this.container.add(this.add.text(W/2, 86, 'Gems: ' + gems, {
            fontSize: '7px', color: '#66aaee', fontFamily: FONT
        }).setOrigin(0.5));

        var weaponKeys = Object.keys(CONFIG.WEAPONS);
        var cols = 3, cellW = 290, cellH = 56, startX = 45, startY = 108;

        for (var i = 0; i < weaponKeys.length; i++) {
            var wk = weaponKeys[i];
            var w = CONFIG.WEAPONS[wk];
            var col = i % cols, row = Math.floor(i / cols);
            var x = startX + col * cellW, y = startY + row * cellH;
            var isOwned = prog.ownedWeapons.indexOf(wk) !== -1;
            var cost = w.gemCost || 0;
            var canAfford = gems >= cost && !isOwned;

            var wbg = this.add.graphics();
            if (isOwned) {
                wbg.fillStyle(0x1a2a1a, 0.7); wbg.fillRect(x, y, cellW - 20, cellH - 6);
                wbg.lineStyle(1, 0x6a9a3a, 0.5); wbg.strokeRect(x, y, cellW - 20, cellH - 6);
            } else {
                wbg.fillStyle(0x1a0e0a, 0.6); wbg.fillRect(x, y, cellW - 20, cellH - 6);
                wbg.lineStyle(1, 0x4a3a2a, 0.4); wbg.strokeRect(x, y, cellW - 20, cellH - 6);
            }
            this.container.add(wbg);

            this.container.add(this.add.text(x + 8, y + 6, w.icon + ' ' + w.name, {
                fontSize: '8px', color: isOwned ? '#d4c4a4' : '#888888', fontFamily: FONT
            }));
            this.container.add(this.add.text(x + 8, y + 26, w.name === 'Арбалет' ? 'Стартовое оружие' : (w.baseDamage + ' dmg / ' + w.baseFireRate + 'ms'), {
                fontSize: '5px', color: '#666666', fontFamily: FONT
            }));

            if (isOwned) {
                this.container.add(this.add.text(x + cellW - 55, y + 18, '✓ ЕСТЬ', {
                    fontSize: '7px', color: '#88ee66', fontFamily: FONT
                }));
            } else {
                this.container.add(this.add.text(x + cellW - 95, y + 8, '💎 ' + cost, {
                    fontSize: '7px', color: canAfford ? '#66aaee' : '#cc4444', fontFamily: FONT
                }));
                if (canAfford) {
                    var wBuyBg = this.add.graphics();
                    wBuyBg.fillStyle(0x1a2a3a, 0.7); wBuyBg.fillRect(x + cellW - 90, y + 26, 60, 18);
                    wBuyBg.lineStyle(1, 0x4488cc, 0.5); wBuyBg.strokeRect(x + cellW - 90, y + 26, 60, 18);
                    this.container.add(wBuyBg);
                    var wBuyBtn = this.add.rectangle(x + cellW - 60, y + 35, 60, 18, 0x000000, 0).setInteractive({useHandCursor: true});
                    this.container.add(wBuyBtn);
                    this.container.add(this.add.text(x + cellW - 60, y + 35, 'КУПИТЬ', {fontSize: '5px', color: '#88ccee', fontFamily: FONT}).setOrigin(0.5));
                    (function(wkey, co) {
                        wBuyBtn.on('pointerdown', function() {
                            if ((prog.gems || 0) < co) return;
                            prog.gems -= co;
                            if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];
                            prog.ownedWeapons.push(wkey);
                            window.gameProgress = prog;
                            saveGameProgress();
                            self.showWeaponsShop();
                            self.gemsText.setText('Gems: ' + (prog.gems || 0));
                            self.goldText.setText('Gold: ' + (prog.gold || 0));
                        });
                    })(wk, cost);
                }
            }
        }

        this.createBackButton();
    }

    // =============================================
    // MAGIC SHOP — buy magic spells with gems
    // =============================================
    showMagicShop() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedMagic) prog.ownedMagic = ['WIND', 'FREEZE', 'LIGHTNING', 'HEAL'];
        var gems = prog.gems || 0;

        this.container.add(this.add.text(W/2, 68, 'МАГИЧЕСКИЕ ЗАКЛИНАНИЯ', {
            fontSize: '10px', color: '#88aaee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        this.container.add(this.add.text(W/2, 88, '💎 Gems: ' + gems, {
            fontSize: '7px', color: '#66aaee', fontFamily: FONT
        }).setOrigin(0.5));

        var magicKeys = Object.keys(CONFIG.MAGIC);
        var cols = 2, cellW = 440, cellH = 56, startX = 40, startY = 108;

        for (var i = 0; i < magicKeys.length; i++) {
            var mk = magicKeys[i];
            var mg = CONFIG.MAGIC[mk];
            var col = i % cols, row = Math.floor(i / cols);
            var x = startX + col * (cellW / cols + 8), y = startY + row * cellH;
            var isOwned = prog.ownedMagic.indexOf(mk) !== -1;
            var cost = mg.gemCost || 0;
            var isStarter = cost === 0;
            var canAfford = gems >= cost && !isOwned && !isStarter;

            var mbg = this.add.graphics();
            if (isOwned || isStarter) {
                mbg.fillStyle(0x1a1a2a, 0.7); mbg.fillRect(x, y, cellW/cols - 8, cellH - 6);
                mbg.lineStyle(1, 0x4a6a9a, 0.5); mbg.strokeRect(x, y, cellW/cols - 8, cellH - 6);
            } else {
                mbg.fillStyle(0x0e0e1a, 0.6); mbg.fillRect(x, y, cellW/cols - 8, cellH - 6);
                mbg.lineStyle(1, 0x2a2a4a, 0.4); mbg.strokeRect(x, y, cellW/cols - 8, cellH - 6);
            }
            this.container.add(mbg);

            this.container.add(this.add.text(x + 8, y + 6, mg.icon + ' ' + mg.name, {
                fontSize: '8px', color: (isOwned || isStarter) ? '#c4ccee' : '#666688', fontFamily: FONT
            }));

            // Spell description
            var descParts = [];
            if (mg.manaCost) descParts.push(mg.manaCost + ' мана');
            if (mg.damage) descParts.push(mg.damage + ' урон');
            if (mg.duration) descParts.push((mg.duration/1000).toFixed(0) + 'с');
            var desc = descParts.join(' | ') + ' | КД: ' + (mg.cooldown/1000).toFixed(0) + 'с';
            this.container.add(this.add.text(x + 8, y + 24, desc, {
                fontSize: '5px', color: '#555577', fontFamily: FONT
            }));

            var colW = cellW/cols - 8;
            if (isOwned || isStarter) {
                this.container.add(this.add.text(x + colW - 60, y + 16, '✓ ИЗУЧЕНО', {
                    fontSize: '6px', color: '#88ee66', fontFamily: FONT
                }));
            } else {
                this.container.add(this.add.text(x + colW - 80, y + 6, '💎 ' + cost, {
                    fontSize: '7px', color: canAfford ? '#66aaee' : '#cc4444', fontFamily: FONT
                }));
                if (canAfford) {
                    var mBuyBg = this.add.graphics();
                    mBuyBg.fillStyle(0x1a2a3a, 0.7); mBuyBg.fillRect(x + colW - 68, y + 26, 58, 18);
                    mBuyBg.lineStyle(1, 0x4488cc, 0.5); mBuyBg.strokeRect(x + colW - 68, y + 26, 58, 18);
                    this.container.add(mBuyBg);
                    var mBuyBtn = this.add.rectangle(x + colW - 39, y + 35, 58, 18, 0x000000, 0).setInteractive({useHandCursor: true});
                    this.container.add(mBuyBtn);
                    this.container.add(this.add.text(x + colW - 39, y + 35, 'КУПИТЬ', {fontSize: '5px', color: '#88ccee', fontFamily: FONT}).setOrigin(0.5));
                    (function(mkey, co) {
                        mBuyBtn.on('pointerdown', function() {
                            if ((prog.gems || 0) < co) return;
                            prog.gems -= co;
                            if (!prog.ownedMagic) prog.ownedMagic = ['WIND', 'FREEZE', 'LIGHTNING', 'HEAL'];
                            prog.ownedMagic.push(mkey);
                            window.gameProgress = prog;
                            saveGameProgress();
                            self.showMagicShop();
                            self.gemsText.setText('Gems: ' + (prog.gems || 0));
                        });
                    })(mk, cost);
                }
            }
        }

        this.createBackButton();
    }

    // =============================================
    // LOADOUT PICKER — tower-themed loadout screen
    // =============================================
    showLoadoutPicker(levelNum) {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];

        this.ldLevelNum = levelNum;
        var LC = CONFIG.LOADOUT || { defaultWeaponSlots: 1, defaultMageSlots: 2, maxMageSlots: 4 };
        var weaponSlots = 1; // Always 1 weapon
        var mageSlots = LC.defaultMageSlots || 2;
        if (!prog.ownedMages) prog.ownedMages = ['AEROMANCER'];

        // Initialize loadout arrays
        if (!this.ldWeapons) {
            var saved = prog.loadout || { weapons: ['CROSSBOW'], mages: ['AEROMANCER', 'CRYOMANCER'] };
            this.ldWeapons = saved.weapons.slice(0, weaponSlots);
            this.ldMages   = (saved.mages || []).slice(0, mageSlots);
        }
        while (this.ldWeapons.length < weaponSlots) this.ldWeapons.push(null);
        this.ldWeapons = this.ldWeapons.slice(0, weaponSlots);
        while (this.ldMages.length < mageSlots) this.ldMages.push(null);
        this.ldMages = this.ldMages.slice(0, mageSlots);
        // Validate owned weapons
        for (var ni = 0; ni < this.ldWeapons.length; ni++) {
            if (this.ldWeapons[ni] && prog.ownedWeapons.indexOf(this.ldWeapons[ni]) === -1) this.ldWeapons[ni] = null;
        }
        // Validate owned mages
        for (var nj = 0; nj < this.ldMages.length; nj++) {
            if (this.ldMages[nj] && prog.ownedMages.indexOf(this.ldMages[nj]) === -1) this.ldMages[nj] = null;
        }

        var level = CONFIG.LEVELS[levelNum];
        var levelIcon = level ? level.icon : '⚔️';
        var levelName = level ? level.name : ('Level ' + levelNum);

        // === TITLE ===
        this.container.add(this.add.text(W/2, 26, 'СНАРЯЖЕНИЕ', {
            fontSize: '14px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 4
        }).setOrigin(0.5));

        this.container.add(this.add.text(W/2, 46, '🔮 Слотов магов: ' + mageSlots, {
            fontSize: '6px', color: '#cc88ee', fontFamily: FONT
        }).setOrigin(0.5));

        // ============================================================
        // CENTRAL TOWER GRAPHIC
        // ============================================================
        var tx = W / 2, ty = 250;
        var tg = this.add.graphics();
        // Tower base shadow
        tg.fillStyle(0x000000, 0.3); tg.fillRect(tx - 38, ty + 55, 76, 8);
        // Tower body
        tg.fillStyle(0x2e3040, 1); tg.fillRect(tx - 38, ty - 80, 76, 138);
        tg.fillStyle(0x3a3c50, 1); tg.fillRect(tx - 34, ty - 76, 68, 130);
        // Stone rows
        tg.lineStyle(1, 0x22232e, 0.7);
        for (var ri = 0; ri < 5; ri++) {
            tg.beginPath(); tg.moveTo(tx - 34, ty - 52 + ri * 28);
            tg.lineTo(tx + 34, ty - 52 + ri * 28); tg.strokePath();
        }
        // Stone brick alternating pattern
        tg.lineStyle(1, 0x22232e, 0.4);
        for (var bri = 0; bri < 5; bri++) {
            var offset = bri % 2 === 0 ? 0 : 17;
            for (var bci = 0; bci < 2; bci++) {
                tg.beginPath();
                tg.moveTo(tx - 34 + offset + bci * 34, ty - 52 + bri * 28);
                tg.lineTo(tx - 34 + offset + bci * 34, ty - 52 + (bri + 1) * 28);
                tg.strokePath();
            }
        }
        // Crenellations (battlements)
        for (var cbi = 0; cbi < 5; cbi++) {
            var cbx = tx - 34 + cbi * 17;
            if (cbi % 2 === 0) {
                tg.fillStyle(0x3a3c50, 1); tg.fillRect(cbx, ty - 94, 14, 18);
                tg.lineStyle(1, 0x22232e, 0.6);
                tg.strokeRect(cbx, ty - 94, 14, 18);
            }
        }
        // Door arch
        tg.fillStyle(0x120a06, 1); tg.fillRect(tx - 14, ty + 28, 28, 34);
        tg.fillStyle(0x1a0e0a, 1);
        tg.fillTriangle(tx - 14, ty + 28, tx + 14, ty + 28, tx, ty + 14);
        // Door studs
        tg.fillStyle(0x6a4a2a, 0.8);
        tg.fillRect(tx - 12, ty + 30, 4, 4); tg.fillRect(tx + 8, ty + 30, 4, 4);
        tg.fillRect(tx - 12, ty + 40, 4, 4); tg.fillRect(tx + 8, ty + 40, 4, 4);
        // Main window (glowing)
        tg.fillStyle(0x998844, 0.3); tg.fillRect(tx - 12, ty - 50, 24, 24);
        tg.fillStyle(0xddcc66, 0.5); tg.fillRect(tx - 9, ty - 47, 18, 18);
        tg.lineStyle(2, 0xaa8833, 0.8); tg.strokeRect(tx - 12, ty - 50, 24, 24);
        // Cross window divider
        tg.lineStyle(1, 0x333322, 0.9);
        tg.lineBetween(tx, ty - 50, tx, ty - 26);
        tg.lineBetween(tx - 12, ty - 38, tx + 12, ty - 38);
        // Small side windows
        tg.fillStyle(0x887733, 0.4); tg.fillRect(tx - 30, ty - 18, 10, 14);
        tg.fillRect(tx + 20, ty - 18, 10, 14);
        tg.lineStyle(1, 0x6a5a22, 0.6);
        tg.strokeRect(tx - 30, ty - 18, 10, 14); tg.strokeRect(tx + 20, ty - 18, 10, 14);
        // Flag pole
        tg.fillStyle(0x707080, 1); tg.fillRect(tx - 1, ty - 94, 2, -28);
        // Flag
        tg.fillStyle(0xcc3333, 1); tg.fillTriangle(tx + 1, ty - 122, tx + 22, ty - 113, tx + 1, ty - 104);
        tg.fillStyle(0xeeee44, 1); tg.fillCircle(tx + 8, ty - 113, 3);
        // Outer glow border
        tg.lineStyle(1, 0xf0c866, 0.18); tg.strokeRect(tx - 40, ty - 96, 80, 152);
        this.container.add(tg);

        // Level label below tower
        this.container.add(this.add.text(tx, ty + 72, levelIcon + ' ' + levelName, {
            fontSize: '7px', color: '#c8b898', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2
        }).setOrigin(0.5));

        // ============================================================
        // WEAPON SLOT (left side)
        // ============================================================
        var wCenterX = 160, wTopY = ty - 60;
        this.container.add(this.add.text(wCenterX, wTopY - 20, '⚔️ ОРУЖИЕ', {
            fontSize: '8px', color: '#ee9944', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2
        }).setOrigin(0.5));

        var wt = this.ldWeapons[0];
        var wCfg = wt ? CONFIG.WEAPONS[wt] : null;
        var wSlotW = 150, wSlotH = 90;
        var wxl = wCenterX - wSlotW / 2, wyt = wTopY;

        var wSlotBg = this.add.graphics();
        wSlotBg.fillStyle(0x1a0e20, 0.88); wSlotBg.fillRect(wxl, wyt, wSlotW, wSlotH);
        wSlotBg.lineStyle(2, wt ? 0xf0c866 : 0x4a3a2a, 0.85); wSlotBg.strokeRect(wxl, wyt, wSlotW, wSlotH);
        if (wt) { wSlotBg.lineStyle(1, 0xf0c866, 0.2); wSlotBg.strokeRect(wxl + 2, wyt + 2, wSlotW - 4, wSlotH - 4); }
        this.container.add(wSlotBg);

        if (wt) {
            this.container.add(this.add.text(wCenterX, wyt + 32, wCfg.icon, {fontSize: '28px'}).setOrigin(0.5));
            this.container.add(this.add.text(wCenterX, wyt + 62, wCfg.name, {
                fontSize: '6px', color: '#d4c4a4', fontFamily: FONT
            }).setOrigin(0.5));
        } else {
            this.container.add(this.add.text(wCenterX, wyt + wSlotH / 2, '[ выбрать\nоружие ]', {
                fontSize: '7px', color: '#666655', fontFamily: FONT, align: 'center'
            }).setOrigin(0.5));
        }
        var wBtn = this.add.rectangle(wCenterX, wyt + wSlotH / 2, wSlotW, wSlotH, 0x000000, 0).setInteractive({useHandCursor: true});
        wBtn.on('pointerdown', function() { self.openWeaponSelector(0); });
        this.container.add(wBtn);

        // ============================================================
        // MAGE SLOTS (right side)
        // ============================================================
        var mCenterX = W - 200;
        this.container.add(this.add.text(mCenterX, ty - 130, '🔮 МАГИ', {
            fontSize: '8px', color: '#8888ee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 2
        }).setOrigin(0.5));

        var mSlotW = 168, mSlotH = 76, mSlotGap = 6;
        var totalMH = mageSlots * mSlotH + (mageSlots - 1) * mSlotGap;
        var mStartY = ty - totalMH / 2 - 10;
        var mxl = mCenterX - mSlotW / 2;

        for (var mi = 0; mi < mageSlots; mi++) {
            var msy = mStartY + mi * (mSlotH + mSlotGap);
            var mgSlotKey = this.ldMages[mi];
            var mgSlotCfg = mgSlotKey && CONFIG.MAGES ? CONFIG.MAGES[mgSlotKey] : null;

            var mSlotBg = this.add.graphics();
            var mFillClr = mgSlotCfg ? 0x0e1030 : 0x08080e;
            var mBdrClr = mgSlotCfg ? (mgSlotCfg.color || 0x6666ee) : 0x2a2a5a;
            mSlotBg.fillStyle(mFillClr, 0.9); mSlotBg.fillRect(mxl, msy, mSlotW, mSlotH);
            mSlotBg.lineStyle(mgSlotCfg ? 2 : 1, mBdrClr, mgSlotCfg ? 0.85 : 0.5);
            mSlotBg.strokeRect(mxl, msy, mSlotW, mSlotH);
            if (mgSlotCfg) {
                mSlotBg.lineStyle(1, mBdrClr, 0.2);
                mSlotBg.strokeRect(mxl+2, msy+2, mSlotW-4, mSlotH-4);
            }
            this.container.add(mSlotBg);

            if (mgSlotCfg) {
                this.container.add(this.add.text(mxl+24, msy+mSlotH/2-8, mgSlotCfg.portrait || mgSlotCfg.icon, {fontSize:'22px'}).setOrigin(0.5));
                this.container.add(this.add.text(mxl+52, msy+10, mgSlotCfg.name, {fontSize:'7px', color:'#c8d8ff', fontFamily:FONT}).setOrigin(0,0.5));
                this.container.add(this.add.text(mxl+52, msy+26, mgSlotCfg.desc || '', {fontSize:'5px', color:'#7788aa', fontFamily:FONT, wordWrap:{width:mSlotW-58}}).setOrigin(0,0.5));
                var abIcons = '';
                for (var abI = 0; abI < mgSlotCfg.abilities.length; abI++) abIcons += mgSlotCfg.abilities[abI].icon;
                this.container.add(this.add.text(mxl+52, msy+mSlotH-12, abIcons, {fontSize:'11px'}).setOrigin(0,0.5));
            } else {
                this.container.add(this.add.text(mCenterX, msy+mSlotH/2, '[ выбрать мага ]', {fontSize:'6px', color:'#444466', fontFamily:FONT}).setOrigin(0.5));
            }

            var mBtn = this.add.rectangle(mCenterX, msy+mSlotH/2, mSlotW, mSlotH, 0x000000, 0).setInteractive({useHandCursor:true});
            (function(idx) { mBtn.on('pointerdown', function() { self.openMageSelector(idx); }); })(mi);
            this.container.add(mBtn);
        }

        // ============================================================
        // ARTIFACT STRIP (bottom)
        // ============================================================
        var equipped = prog.equippedArtifacts || [];
        var artY = H - 92;
        var artStripBg = this.add.graphics();
        artStripBg.fillStyle(0x1a1206, 0.6); artStripBg.fillRect(W/2 - 130, artY - 4, 260, 52);
        artStripBg.lineStyle(1, 0x6a4a2a, 0.4); artStripBg.strokeRect(W/2 - 130, artY - 4, 260, 52);
        this.container.add(artStripBg);
        this.container.add(this.add.text(W/2, artY + 4, 'АРТЕФАКТЫ', {
            fontSize: '5px', color: '#8a6a42', fontFamily: FONT
        }).setOrigin(0.5, 0));
        for (var ai = 0; ai < CONFIG.MAX_EQUIPPED_ARTIFACTS; ai++) {
            var artX2 = W/2 + (ai - Math.floor(CONFIG.MAX_EQUIPPED_ARTIFACTS / 2)) * 54;
            var artBg2 = this.add.graphics();
            artBg2.fillStyle(0x28180c, 0.8); artBg2.fillRect(artX2 - 20, artY + 16, 40, 32);
            artBg2.lineStyle(1, equipped[ai] ? 0xf0c866 : 0x4a3a2a, equipped[ai] ? 0.7 : 0.4);
            artBg2.strokeRect(artX2 - 20, artY + 16, 40, 32);
            this.container.add(artBg2);
            var eArt3 = equipped[ai] ? CONFIG.ARTIFACTS[equipped[ai]] : null;
            this.container.add(this.add.text(artX2, artY + 32, eArt3 ? eArt3.icon : '—', {
                fontSize: eArt3 ? '16px' : '10px', color: '#444444', fontFamily: FONT
            }).setOrigin(0.5));
        }

        // ============================================================
        // START + BACK buttons
        // ============================================================
        var atLeastOneWeapon = !!this.ldWeapons[0];

        var startBg = this.add.graphics();
        startBg.fillStyle(atLeastOneWeapon ? 0x2a4a1a : 0x151515, 0.9);
        startBg.fillRect(W/2 - 95, H - 38, 190, 34);
        startBg.lineStyle(2, atLeastOneWeapon ? 0x6a9a3a : 0x333333, 0.9);
        startBg.strokeRect(W/2 - 95, H - 38, 190, 34);
        this.container.add(startBg);
        this.container.add(this.add.text(W/2, H - 21, atLeastOneWeapon ? 'НАЧАТЬ ИГРУ' : 'Выбери оружие', {
            fontSize: '9px', color: atLeastOneWeapon ? '#aaee88' : '#665544', fontFamily: FONT
        }).setOrigin(0.5));
        if (atLeastOneWeapon) {
            var startBtn = this.add.rectangle(W/2, H - 21, 190, 34, 0x000000, 0).setInteractive({useHandCursor: true});
            startBtn.on('pointerdown', function() {
                var finalWeapons = self.ldWeapons.filter(function(w) { return w !== null; });
                var finalMages = self.ldMages.filter(function(m) { return m !== null; });
                if (finalMages.length === 0) finalMages = ['AEROMANCER'];
                var loadout = { weapons: finalWeapons, mages: finalMages };
                prog.loadout = loadout;
                window.gameProgress = prog;
                saveGameProgress();
                self.ldWeapons = null; self.ldMages = null;
                self.scene.start('GameScene', { level: levelNum, loadout: loadout });
            });
            this.container.add(startBtn);
        }

        var backBg = this.add.graphics();
        backBg.fillStyle(0x4a1a0e, 0.7); backBg.fillRect(14, H - 38, 76, 28);
        backBg.lineStyle(1, 0x8a3a1a, 0.5); backBg.strokeRect(14, H - 38, 76, 28);
        this.container.add(backBg);
        var backBtn = this.add.rectangle(52, H - 24, 76, 28, 0x000000, 0).setInteractive({useHandCursor: true});
        backBtn.on('pointerdown', function() { self.ldWeapons = null; self.ldMages = null; self.showLevelSelect(); });
        this.container.add(backBtn);
        this.container.add(this.add.text(52, H - 24, 'НАЗАД', {fontSize: '7px', color: '#ee8866', fontFamily: FONT}).setOrigin(0.5));
    }

    openWeaponSelector(slotIdx) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];
        var gems = prog.gems || 0;
        var allWeapons = Object.keys(CONFIG.WEAPONS);
        var elements = [];

        var ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88).setDepth(200);
        elements.push(ov);
        elements.push(this.add.text(W/2, 55, '⚔️ ОРУЖИЕ — слот ' + (slotIdx + 1), {
            fontSize: '9px', color: '#ee9944', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(201));
        var gemsLabel = this.add.text(W/2, 72, '💎 ' + gems, {fontSize: '7px', color: '#66aaee', fontFamily: FONT}).setOrigin(0.5).setDepth(201);
        elements.push(gemsLabel);

        var cols = 2, btnW = 220, btnH = 48, gap = 8;
        var totalW = cols * btnW + (cols - 1) * gap;
        var sx = W/2 - totalW/2, sy = 88;

        for (var i = 0; i < allWeapons.length; i++) {
            var wk = allWeapons[i], w = CONFIG.WEAPONS[wk];
            var col = i % cols, row = Math.floor(i / cols);
            var bx = sx + col * (btnW + gap), by = sy + row * (btnH + gap);
            var owned = prog.ownedWeapons.indexOf(wk) !== -1;
            var alreadyUsed = false;
            for (var ci = 0; ci < self.ldWeapons.length; ci++) {
                if (self.ldWeapons[ci] === wk && ci !== slotIdx) { alreadyUsed = true; break; }
            }
            var selected = self.ldWeapons[slotIdx] === wk;
            var canAfford = owned || (w.gemCost > 0 && gems >= w.gemCost);

            var bbg = this.add.graphics().setDepth(201);
            var bdrColor = selected ? 0xf0c866 : (owned ? 0x6a4a2a : (canAfford ? 0x2255aa : 0x333333));
            var fillColor = selected ? 0x1a3a1a : (owned ? 0x2a1a0e : (canAfford ? 0x0e1a2a : 0x0a0a0a));
            bbg.fillStyle(fillColor, 0.9); bbg.fillRect(bx, by, btnW, btnH);
            bbg.lineStyle(owned ? 2 : 1, bdrColor, owned ? 0.9 : 0.6); bbg.strokeRect(bx, by, btnW, btnH);
            elements.push(bbg);

            var nameColor = selected ? '#f0c866' : (owned ? '#d4c4a4' : (canAfford ? '#88aaff' : '#555555'));
            elements.push(this.add.text(bx + 10, by + 8, (selected ? '✓ ' : '') + w.icon + ' ' + w.name, {
                fontSize: '8px', color: nameColor, fontFamily: FONT
            }).setDepth(202));

            if (!owned) {
                var costStr = w.gemCost > 0 ? ('💎 ' + w.gemCost) : 'БЕСПЛАТНО';
                var costColor = canAfford ? '#66aaee' : '#884444';
                elements.push(this.add.text(bx + 10, by + 28, canAfford ? ('Купить: ' + costStr) : ('Нужно: ' + costStr), {
                    fontSize: '6px', color: costColor, fontFamily: FONT
                }).setDepth(202));
            } else if (alreadyUsed) {
                elements.push(this.add.text(bx + 10, by + 28, 'Уже в другом слоте', {fontSize: '6px', color: '#666644', fontFamily: FONT}).setDepth(202));
            }

            if (!alreadyUsed && (owned || canAfford)) {
                var btn = this.add.rectangle(bx + btnW/2, by + btnH/2, btnW, btnH, 0x000000, 0)
                    .setInteractive({useHandCursor: true}).setDepth(203);
                elements.push(btn);
                (function(weapon, isOwned, cost) {
                    btn.on('pointerdown', function() {
                        if (!isOwned) {
                            if ((prog.gems || 0) < cost) return;
                            prog.gems -= cost;
                            if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];
                            prog.ownedWeapons.push(weapon);
                            window.gameProgress = prog;
                            saveGameProgress();
                        }
                        for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy();
                        self.ldWeapons[slotIdx] = weapon;
                        self.showLoadoutPicker(self.ldLevelNum);
                    });
                })(wk, owned, w.gemCost || 0);
            }
        }

        // Cancel
        var closeBg = this.add.graphics().setDepth(201);
        closeBg.fillStyle(0x4a1a0e, 0.8); closeBg.fillRect(W/2 - 50, H - 50, 100, 28);
        closeBg.lineStyle(1, 0x8a3a1a, 0.5); closeBg.strokeRect(W/2 - 50, H - 50, 100, 28);
        elements.push(closeBg);
        var closeBtn = this.add.rectangle(W/2, H - 36, 100, 28, 0x000000, 0).setInteractive({useHandCursor: true}).setDepth(203);
        elements.push(closeBtn);
        elements.push(this.add.text(W/2, H - 36, 'ОТМЕНА', {fontSize: '6px', color: '#ee8866', fontFamily: FONT}).setOrigin(0.5).setDepth(202));
        closeBtn.on('pointerdown', function() { for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy(); });
    }

    openMageSelector(slotIdx) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedMages) prog.ownedMages = ['AEROMANCER'];
        var allMages = Object.keys(CONFIG.MAGES || {});
        var elements = [];

        var ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88).setDepth(200);
        elements.push(ov);
        elements.push(this.add.text(W/2, 36, '🔮 ВЫБОР МАГА — слот ' + (slotIdx + 1), {
            fontSize: '9px', color: '#8888ee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(201));
        elements.push(this.add.text(W/2, 56, 'Самоцветов: ' + (prog.gems || 0), {
            fontSize: '7px', color: '#66aaee', fontFamily: FONT
        }).setOrigin(0.5).setDepth(201));

        var cols = 2, btnW = 230, btnH = 90, gap = 6;
        var totalW = cols * btnW + (cols - 1) * gap;
        var sx = W/2 - totalW/2, sy = 68;

        for (var i = 0; i < allMages.length; i++) {
            var mk = allMages[i];
            var mgCfg5 = CONFIG.MAGES[mk];
            var col = i % cols, row = Math.floor(i / cols);
            var bx = sx + col * (btnW + gap), by = sy + row * (btnH + gap);
            var selected = self.ldMages[slotIdx] === mk;
            var owned = prog.ownedMages.indexOf(mk) !== -1;
            var charColor = mgCfg5.color || 0x4444aa;
            var gemCost = mgCfg5.unlockCost || 0;

            var mbg = this.add.graphics().setDepth(201);
            var mFill = selected ? 0x0c1230 : (owned ? 0x08090e : 0x0a0808);
            mbg.fillStyle(mFill, 0.95); mbg.fillRect(bx, by, btnW, btnH);
            mbg.lineStyle(selected ? 3 : 1, owned ? charColor : 0x444444, selected ? 1.0 : 0.55);
            mbg.strokeRect(bx, by, btnW, btnH);
            if (selected) { mbg.lineStyle(1, charColor, 0.25); mbg.strokeRect(bx+3, by+3, btnW-6, btnH-6); }
            elements.push(mbg);

            elements.push(this.add.text(bx+32, by+btnH/2-8, mgCfg5.portrait || mgCfg5.icon, {fontSize:'26px'}).setOrigin(0.5).setDepth(202));
            var nameClr = selected ? '#f0c866' : (owned ? '#c8d8ff' : '#888888');
            elements.push(this.add.text(bx+62, by+9, (selected ? '✓ ' : '') + mgCfg5.name, {fontSize:'8px', color:nameClr, fontFamily:FONT}).setDepth(202));
            elements.push(this.add.text(bx+62, by+26, mgCfg5.desc || '', {fontSize:'5px', color: owned ? '#7788aa' : '#555566', fontFamily:FONT, wordWrap:{width:btnW-68}}).setDepth(202));
            // Ability icons
            var abRow = '';
            for (var abJ = 0; abJ < mgCfg5.abilities.length; abJ++) abRow += mgCfg5.abilities[abJ].icon;
            elements.push(this.add.text(bx+62, by+btnH-20, abRow, {fontSize:'11px', color: owned ? '#aabbcc' : '#444444'}).setDepth(202));

            if (!owned && gemCost > 0) {
                // Buy button
                var buyBg = this.add.graphics().setDepth(202);
                buyBg.fillStyle(0x2a2a0a, 0.9); buyBg.fillRect(bx+62, by+btnH-38, 100, 18);
                buyBg.lineStyle(1, 0xddaa33, 0.7); buyBg.strokeRect(bx+62, by+btnH-38, 100, 18);
                elements.push(buyBg);
                elements.push(this.add.text(bx+112, by+btnH-29, '🔒 ' + gemCost + ' 💎 КУПИТЬ', {fontSize:'6px', color:'#f0c866', fontFamily:FONT}).setOrigin(0.5).setDepth(203));
            }

            var mbtn = this.add.rectangle(bx+btnW/2, by+btnH/2, btnW, btnH, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
            elements.push(mbtn);
            (function(mageKey2, isOwned, cost) {
                mbtn.on('pointerdown', function() {
                    if (!isOwned) {
                        var gems = prog.gems || 0;
                        if (gems < cost) { return; }
                        prog.gems = gems - cost;
                        if (!prog.ownedMages) prog.ownedMages = ['AEROMANCER'];
                        prog.ownedMages.push(mageKey2);
                        window.gameProgress = prog;
                        saveGameProgress();
                        for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy();
                        self.openMageSelector(slotIdx);
                        return;
                    }
                    for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy();
                    self.ldMages[slotIdx] = mageKey2;
                    self.showLoadoutPicker(self.ldLevelNum);
                });
            })(mk, owned, gemCost);
        }

        // Cancel button
        var closeBg2 = this.add.graphics().setDepth(201);
        closeBg2.fillStyle(0x4a1a0e, 0.8); closeBg2.fillRect(W/2-50, H-42, 100, 28);
        closeBg2.lineStyle(1, 0x8a3a1a, 0.5); closeBg2.strokeRect(W/2-50, H-42, 100, 28);
        elements.push(closeBg2);
        var closeBtn2 = this.add.rectangle(W/2, H-28, 100, 28, 0x000000, 0).setInteractive({useHandCursor:true}).setDepth(203);
        elements.push(closeBtn2);
        elements.push(this.add.text(W/2, H-28, 'ОТМЕНА', {fontSize:'6px', color:'#ee8866', fontFamily:FONT}).setOrigin(0.5).setDepth(202));
        closeBtn2.on('pointerdown', function() { for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy(); });
    }

    showArtifacts() {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        var gems = prog.gems || 0;
        if (!prog.ownedArtifacts) prog.ownedArtifacts = [];
        if (!prog.equippedArtifacts) prog.equippedArtifacts = [];

        this.container.add(this.add.text(W/2, 70, 'ARTIFACTS', {
            fontSize: '11px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        this.artifactGemsText = this.add.text(W/2, 90, 'Gems: ' + gems, {
            fontSize: '7px', color: '#66aaee', fontFamily: FONT
        }).setOrigin(0.5);
        this.container.add(this.artifactGemsText);

        // Equipped slots
        this.container.add(this.add.text(50, 108, 'EQUIPPED (' + prog.equippedArtifacts.length + '/' + CONFIG.MAX_EQUIPPED_ARTIFACTS + '):', {
            fontSize: '7px', color: '#aa9988', fontFamily: FONT
        }));

        for (var s = 0; s < CONFIG.MAX_EQUIPPED_ARTIFACTS; s++) {
            var sx = 50 + s * 70;
            var slotBg = this.add.graphics();
            slotBg.fillStyle(0x1a0e0a, 0.6); slotBg.fillRect(sx, 124, 60, 30);
            slotBg.lineStyle(1, 0xf0c866, 0.4); slotBg.strokeRect(sx, 124, 60, 30);
            this.container.add(slotBg);

            if (prog.equippedArtifacts[s]) {
                var eArt = CONFIG.ARTIFACTS[prog.equippedArtifacts[s]];
                if (eArt) {
                    this.container.add(this.add.text(sx + 30, 139, eArt.icon, {fontSize: '14px'}).setOrigin(0.5));
                    var unequipBtn = this.add.rectangle(sx + 30, 139, 60, 30, 0x000000, 0).setInteractive({useHandCursor: true});
                    (function(idx) {
                        unequipBtn.on('pointerdown', function() {
                            prog.equippedArtifacts.splice(idx, 1);
                            window.gameProgress = prog;
                            saveGameProgress();
                            self.showArtifacts();
                            self.gemsText.setText('Gems: ' + (prog.gems || 0));
                        });
                    })(s);
                    this.container.add(unequipBtn);
                }
            } else {
                this.container.add(this.add.text(sx + 30, 139, '—', {fontSize: '10px', color: '#444444', fontFamily: FONT}).setOrigin(0.5));
            }
        }

        // All artifacts
        var artKeys = Object.keys(CONFIG.ARTIFACTS);
        var cols = 3, startX = 50, startY = 175, cellW = 290, cellH = 52;

        for (var i = 0; i < artKeys.length; i++) {
            var ak = artKeys[i];
            var art = CONFIG.ARTIFACTS[ak];
            var col = i % cols, row = Math.floor(i / cols);
            var x = startX + col * cellW, y = startY + row * cellH;
            var isOwned = prog.ownedArtifacts.indexOf(ak) !== -1;
            var isEquipped = prog.equippedArtifacts.indexOf(ak) !== -1;
            var canAfford = gems >= art.cost;

            var abg = this.add.graphics();
            if (isEquipped) {
                abg.fillStyle(0x1a2a1a, 0.7); abg.fillRect(x, y, cellW - 20, 44);
                abg.lineStyle(1, 0xf0c866, 0.5); abg.strokeRect(x, y, cellW - 20, 44);
            } else if (isOwned) {
                abg.fillStyle(0x1a0e0a, 0.6); abg.fillRect(x, y, cellW - 20, 44);
                abg.lineStyle(1, 0x6a4a2a, 0.4); abg.strokeRect(x, y, cellW - 20, 44);
            } else {
                abg.fillStyle(0x0a0a0a, 0.5); abg.fillRect(x, y, cellW - 20, 44);
                abg.lineStyle(1, 0x333333, 0.3); abg.strokeRect(x, y, cellW - 20, 44);
            }
            this.container.add(abg);

            this.container.add(this.add.text(x + 8, y + 6, art.icon + ' ' + art.name, {
                fontSize: '6px', color: isOwned ? '#d4c4a4' : '#888888', fontFamily: FONT
            }));
            this.container.add(this.add.text(x + 8, y + 22, art.desc, {
                fontSize: '5px', color: '#888888', fontFamily: FONT
            }));

            if (!isOwned) {
                this.container.add(this.add.text(x + cellW - 80, y + 8, art.cost + ' gems', {
                    fontSize: '6px', color: canAfford ? '#88cc66' : '#cc4444', fontFamily: FONT
                }));
                if (canAfford) {
                    var buyBg2 = this.add.graphics();
                    buyBg2.fillStyle(0x3a2a0e, 0.7); buyBg2.fillRect(x + cellW - 70, y + 22, 44, 16);
                    buyBg2.lineStyle(1, 0xf0c866, 0.4); buyBg2.strokeRect(x + cellW - 70, y + 22, 44, 16);
                    this.container.add(buyBg2);
                    var buyBtn2 = this.add.rectangle(x + cellW - 48, y + 30, 44, 16, 0x000000, 0).setInteractive({useHandCursor: true});
                    this.container.add(buyBtn2);
                    this.container.add(this.add.text(x + cellW - 48, y + 30, 'BUY', {fontSize: '5px', color: '#f0c866', fontFamily: FONT}).setOrigin(0.5));
                    (function(akey, co) {
                        buyBtn2.on('pointerdown', function() {
                            if ((prog.gems || 0) < co) return;
                            prog.gems -= co;
                            prog.ownedArtifacts.push(akey);
                            window.gameProgress = prog;
                            saveGameProgress();
                            self.showArtifacts();
                            self.gemsText.setText('Gems: ' + (prog.gems || 0));
                        });
                    })(ak, art.cost);
                }
            } else if (!isEquipped) {
                if (prog.equippedArtifacts.length < CONFIG.MAX_EQUIPPED_ARTIFACTS) {
                    var eqBg = this.add.graphics();
                    eqBg.fillStyle(0x1a2a1a, 0.6); eqBg.fillRect(x + cellW - 70, y + 14, 44, 18);
                    eqBg.lineStyle(1, 0x6a9a3a, 0.4); eqBg.strokeRect(x + cellW - 70, y + 14, 44, 18);
                    this.container.add(eqBg);
                    var eqBtn = this.add.rectangle(x + cellW - 48, y + 23, 44, 18, 0x000000, 0).setInteractive({useHandCursor: true});
                    this.container.add(eqBtn);
                    this.container.add(this.add.text(x + cellW - 48, y + 23, 'EQUIP', {fontSize: '5px', color: '#aaee88', fontFamily: FONT}).setOrigin(0.5));
                    (function(akey) {
                        eqBtn.on('pointerdown', function() {
                            prog.equippedArtifacts.push(akey);
                            window.gameProgress = prog;
                            saveGameProgress();
                            self.showArtifacts();
                        });
                    })(ak);
                }
            } else {
                this.container.add(this.add.text(x + cellW - 55, y + 18, 'EQUIPPED', {
                    fontSize: '5px', color: '#88ee66', fontFamily: FONT
                }));
            }
        }

        this.createBackButton();
    }

    createBackButton() {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var bg = this.add.graphics();
        bg.fillStyle(0x4a1a0e, 0.7); bg.fillRect(20, H-40, 80, 28);
        bg.lineStyle(1, 0x8a3a1a, 0.5); bg.strokeRect(20, H-40, 80, 28);
        this.container.add(bg);
        var btn = this.add.rectangle(60, H-26, 80, 28, 0x000000, 0).setInteractive({useHandCursor: true});
        btn.on('pointerdown', function() { self.showMainMenu(); });
        this.container.add(btn);
        this.container.add(this.add.text(60, H-26, 'BACK', {fontSize: '7px', color: '#ee8866', fontFamily: FONT}).setOrigin(0.5));
    }
}
