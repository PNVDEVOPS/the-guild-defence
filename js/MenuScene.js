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
        this.ldMagic = null;
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
                        self.ldMagic = null;
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
    // LOADOUT PICKER — before starting a level
    // =============================================
    showLoadoutPicker(levelNum) {
        this.clearContainer();
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedWeapons) prog.ownedWeapons = ['CROSSBOW'];

        this.ldLevelNum = levelNum;
        var LC = CONFIG.LOADOUT || { defaultWeaponSlots: 3, defaultMagicSlots: 3, maxSlots: 5 };
        var megaKills = prog.megaBossKills || 0;
        var numSlots = Math.min(LC.maxSlots, LC.defaultWeaponSlots + megaKills);
        this.ldNumSlots = numSlots;

        // Initialize loadout arrays if first time entering
        if (!this.ldWeapons) {
            var saved = prog.loadout || { weapons: ['CROSSBOW'], magic: ['WIND', 'FREEZE', 'LIGHTNING'] };
            this.ldWeapons = saved.weapons.slice();
            this.ldMagic = saved.magic.slice();
        }
        // Ensure arrays have exactly numSlots entries
        while (this.ldWeapons.length < numSlots) this.ldWeapons.push(null);
        this.ldWeapons = this.ldWeapons.slice(0, numSlots);
        while (this.ldMagic.length < numSlots) this.ldMagic.push(null);
        this.ldMagic = this.ldMagic.slice(0, numSlots);
        // Remove weapons no longer owned
        for (var ni = 0; ni < this.ldWeapons.length; ni++) {
            if (this.ldWeapons[ni] && prog.ownedWeapons.indexOf(this.ldWeapons[ni]) === -1) {
                this.ldWeapons[ni] = null;
            }
        }
        // Remove magic not owned
        var ownedMagicCheck = prog.ownedMagic || ['WIND', 'FREEZE', 'LIGHTNING', 'HEAL'];
        for (var mi3 = 0; mi3 < this.ldMagic.length; mi3++) {
            if (this.ldMagic[mi3] && ownedMagicCheck.indexOf(this.ldMagic[mi3]) === -1) {
                this.ldMagic[mi3] = null;
            }
        }

        var level = CONFIG.LEVELS[levelNum];
        this.container.add(this.add.text(W/2, 52, 'ЭКИПИРОВКА — ' + (level ? level.name : 'Level ' + levelNum), {
            fontSize: '10px', color: '#f0c866', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5));

        if (numSlots > 3) {
            this.container.add(this.add.text(W/2, 70, '★ Открыто слотов: ' + numSlots + ' (мегабоссы: ' + megaKills + ')', {
                fontSize: '6px', color: '#cc88ee', fontFamily: FONT
            }).setOrigin(0.5));
        }

        // Section headers
        this.container.add(this.add.text(W/4, 86, '⚔️ ОРУЖИЯ', {fontSize: '8px', color: '#ee9944', fontFamily: FONT}).setOrigin(0.5));
        this.container.add(this.add.text(3*W/4, 86, '✨ МАГИЯ', {fontSize: '8px', color: '#8888ee', fontFamily: FONT}).setOrigin(0.5));

        var slotW = 170, slotH = 38, slotGap = 6;

        // Weapon slots
        var wStartX = W/4 - slotW/2;
        var wStartY = 100;
        for (var wi = 0; wi < numSlots; wi++) {
            var wsy = wStartY + wi * (slotH + slotGap);
            var wt = this.ldWeapons[wi];
            var wCfg = wt ? CONFIG.WEAPONS[wt] : null;

            var wSlotBg = this.add.graphics();
            wSlotBg.fillStyle(0x1a0e20, 0.8); wSlotBg.fillRect(wStartX, wsy, slotW, slotH);
            wSlotBg.lineStyle(2, wt ? 0xf0c866 : 0x4a3a2a, 0.7); wSlotBg.strokeRect(wStartX, wsy, slotW, slotH);
            this.container.add(wSlotBg);

            var wSlotTxt = wt ? (wCfg.icon + ' ' + wCfg.name) : '[ нажми чтобы выбрать ]';
            this.container.add(this.add.text(wStartX + slotW/2, wsy + slotH/2, wSlotTxt, {
                fontSize: wt ? '8px' : '6px', color: wt ? '#d4c4a4' : '#666666', fontFamily: FONT
            }).setOrigin(0.5));

            var wSlotBtn = this.add.rectangle(wStartX + slotW/2, wsy + slotH/2, slotW, slotH, 0x000000, 0)
                .setInteractive({useHandCursor: true});
            (function(idx) {
                wSlotBtn.on('pointerdown', function() { self.openWeaponSelector(idx); });
            })(wi);
            this.container.add(wSlotBtn);
        }

        // Magic slots
        var mStartX = 3*W/4 - slotW/2;
        var mStartY = 100;
        for (var mi = 0; mi < numSlots; mi++) {
            var msy = mStartY + mi * (slotH + slotGap);
            var mt = this.ldMagic[mi];
            var mCfg = mt ? CONFIG.MAGIC[mt] : null;

            var mSlotBg = this.add.graphics();
            mSlotBg.fillStyle(0x0e1020, 0.8); mSlotBg.fillRect(mStartX, msy, slotW, slotH);
            mSlotBg.lineStyle(2, mt ? 0x8888ee : 0x2a2a4a, 0.7); mSlotBg.strokeRect(mStartX, msy, slotW, slotH);
            this.container.add(mSlotBg);

            var mSlotTxt = mt ? (mCfg.icon + ' ' + mCfg.name) : '[ нажми чтобы выбрать ]';
            this.container.add(this.add.text(mStartX + slotW/2, msy + slotH/2, mSlotTxt, {
                fontSize: mt ? '8px' : '6px', color: mt ? '#c8c8ff' : '#666666', fontFamily: FONT
            }).setOrigin(0.5));

            var mSlotBtn = this.add.rectangle(mStartX + slotW/2, msy + slotH/2, slotW, slotH, 0x000000, 0)
                .setInteractive({useHandCursor: true});
            (function(idx) {
                mSlotBtn.on('pointerdown', function() { self.openMagicSelector(idx); });
            })(mi);
            this.container.add(mSlotBtn);
        }

        // Validation: require at least 1 weapon
        var atLeastOneWeapon = false;
        for (var vi = 0; vi < this.ldWeapons.length; vi++) {
            if (this.ldWeapons[vi]) { atLeastOneWeapon = true; break; }
        }
        var allFilled = atLeastOneWeapon;

        // Hint text
        if (!allFilled) {
            this.container.add(this.add.text(W/2, H - 100, 'Выберите хотя бы 1 оружие', {
                fontSize: '7px', color: '#886644', fontFamily: FONT
            }).setOrigin(0.5));
        }

        // START button
        var startBg = this.add.graphics();
        startBg.fillStyle(allFilled ? 0x2a4a1a : 0x1a1a1a, 0.85);
        startBg.fillRect(W/2 - 90, H - 82, 180, 38);
        startBg.lineStyle(2, allFilled ? 0x6a9a3a : 0x333333, 0.8);
        startBg.strokeRect(W/2 - 90, H - 82, 180, 38);
        this.container.add(startBg);

        this.container.add(this.add.text(W/2, H - 63, 'НАЧАТЬ ИГРУ', {
            fontSize: '9px', color: allFilled ? '#aaee88' : '#555555', fontFamily: FONT
        }).setOrigin(0.5));

        if (allFilled) {
            var startBtn = this.add.rectangle(W/2, H - 63, 180, 38, 0x000000, 0).setInteractive({useHandCursor: true});
            startBtn.on('pointerdown', function() {
                var finalWeapons = self.ldWeapons.filter(function(w) { return w !== null; });
                var finalMagic = self.ldMagic.filter(function(m) { return m !== null; });
                var loadout = { weapons: finalWeapons, magic: finalMagic };
                prog.loadout = loadout;
                window.gameProgress = prog;
                saveGameProgress();
                self.ldWeapons = null;
                self.ldMagic = null;
                self.scene.start('GameScene', { level: levelNum, loadout: loadout });
            });
            this.container.add(startBtn);
        }

        // Back to level select button
        var backBg = this.add.graphics();
        backBg.fillStyle(0x4a1a0e, 0.7); backBg.fillRect(20, H-40, 80, 28);
        backBg.lineStyle(1, 0x8a3a1a, 0.5); backBg.strokeRect(20, H-40, 80, 28);
        this.container.add(backBg);
        var backBtn = this.add.rectangle(60, H-26, 80, 28, 0x000000, 0).setInteractive({useHandCursor: true});
        backBtn.on('pointerdown', function() { self.ldWeapons = null; self.ldMagic = null; self.showLevelSelect(); });
        this.container.add(backBtn);
        this.container.add(this.add.text(60, H-26, 'НАЗАД', {fontSize: '7px', color: '#ee8866', fontFamily: FONT}).setOrigin(0.5));

        // Main menu button
        var menuBg = this.add.graphics();
        menuBg.fillStyle(0x1a1a3a, 0.7); menuBg.fillRect(W - 100, H-40, 80, 28);
        menuBg.lineStyle(1, 0x4a4a8a, 0.5); menuBg.strokeRect(W - 100, H-40, 80, 28);
        this.container.add(menuBg);
        var menuBtn = this.add.rectangle(W - 60, H-26, 80, 28, 0x000000, 0).setInteractive({useHandCursor: true});
        menuBtn.on('pointerdown', function() { self.ldWeapons = null; self.ldMagic = null; self.showMainMenu(); });
        this.container.add(menuBtn);
        this.container.add(this.add.text(W - 60, H-26, 'МЕНЮ', {fontSize: '7px', color: '#8888ee', fontFamily: FONT}).setOrigin(0.5));
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

    openMagicSelector(slotIdx) {
        var W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, self = this;
        var prog = this.prog;
        if (!prog.ownedMagic) prog.ownedMagic = ['WIND'];
        var gems = prog.gems || 0;
        var allMagic = Object.keys(CONFIG.MAGIC);
        var elements = [];

        var ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88).setDepth(200);
        elements.push(ov);
        elements.push(this.add.text(W/2, 55, '✨ МАГИЯ — слот ' + (slotIdx + 1), {
            fontSize: '9px', color: '#8888ee', fontFamily: FONT, stroke: '#1a0e0a', strokeThickness: 3
        }).setOrigin(0.5).setDepth(201));
        var gemsLabel2 = this.add.text(W/2, 72, '💎 ' + gems, {fontSize: '7px', color: '#66aaee', fontFamily: FONT}).setOrigin(0.5).setDepth(201);
        elements.push(gemsLabel2);

        var cols = 2, btnW = 220, btnH = 58, gap = 8;
        var totalW = cols * btnW + (cols - 1) * gap;
        var sx = W/2 - totalW/2, sy = 86;

        for (var i = 0; i < allMagic.length; i++) {
            var mk = allMagic[i], mg = CONFIG.MAGIC[mk];
            var col = i % cols, row = Math.floor(i / cols);
            var bx = sx + col * (btnW + gap), by = sy + row * (btnH + gap);
            var owned = prog.ownedMagic.indexOf(mk) !== -1 || (mg.gemCost === 0);
            var selected = self.ldMagic[slotIdx] === mk;
            var canAfford = owned || (mg.gemCost > 0 && gems >= mg.gemCost);

            var mbg = this.add.graphics().setDepth(201);
            var mFill = selected ? 0x1a1a3a : (owned ? 0x0e1020 : (canAfford ? 0x0a0e1a : 0x080808));
            var mBdr = selected ? 0x8888ee : (owned ? 0x4444aa : (canAfford ? 0x2244aa : 0x222222));
            mbg.fillStyle(mFill, 0.9); mbg.fillRect(bx, by, btnW, btnH);
            mbg.lineStyle(owned ? 2 : 1, mBdr, owned ? 0.9 : 0.6); mbg.strokeRect(bx, by, btnW, btnH);
            elements.push(mbg);

            elements.push(this.add.text(bx + 28, by + btnH/2, mg.icon, {fontSize: '18px'}).setOrigin(0.5).setDepth(202));
            var nameColor2 = selected ? '#f0c866' : (owned ? '#c8c8ff' : (canAfford ? '#88aaff' : '#555555'));
            elements.push(this.add.text(bx + 55, by + 10, (selected ? '✓ ' : '') + mg.name, {
                fontSize: '8px', color: nameColor2, fontFamily: FONT
            }).setDepth(202));
            elements.push(this.add.text(bx + 55, by + 26, 'Мана: ' + mg.manaCost + '  КД: ' + (mg.cooldown/1000).toFixed(0) + 'с', {
                fontSize: '6px', color: '#777788', fontFamily: FONT
            }).setDepth(202));

            if (!owned) {
                var mCostStr = mg.gemCost > 0 ? ('💎 ' + mg.gemCost) : 'БЕСПЛАТНО';
                elements.push(this.add.text(bx + 55, by + 40, canAfford ? ('Купить: ' + mCostStr) : ('Нужно: ' + mCostStr), {
                    fontSize: '6px', color: canAfford ? '#66aaee' : '#884444', fontFamily: FONT
                }).setDepth(202));
            }

            if (canAfford) {
                var mbtn = this.add.rectangle(bx + btnW/2, by + btnH/2, btnW, btnH, 0x000000, 0)
                    .setInteractive({useHandCursor: true}).setDepth(203);
                elements.push(mbtn);
                (function(magic, isOwned, cost) {
                    mbtn.on('pointerdown', function() {
                        if (!isOwned) {
                            if ((prog.gems || 0) < cost) return;
                            prog.gems -= cost;
                            if (!prog.ownedMagic) prog.ownedMagic = ['WIND'];
                            prog.ownedMagic.push(magic);
                            window.gameProgress = prog;
                            saveGameProgress();
                        }
                        for (var e = 0; e < elements.length; e++) if (elements[e] && elements[e].destroy) elements[e].destroy();
                        self.ldMagic[slotIdx] = magic;
                        self.showLoadoutPicker(self.ldLevelNum);
                    });
                })(mk, owned, mg.gemCost || 0);
            }
        }

        // Cancel
        var closeBg2 = this.add.graphics().setDepth(201);
        closeBg2.fillStyle(0x4a1a0e, 0.8); closeBg2.fillRect(W/2 - 50, H - 50, 100, 28);
        closeBg2.lineStyle(1, 0x8a3a1a, 0.5); closeBg2.strokeRect(W/2 - 50, H - 50, 100, 28);
        elements.push(closeBg2);
        var closeBtn2 = this.add.rectangle(W/2, H - 36, 100, 28, 0x000000, 0).setInteractive({useHandCursor: true}).setDepth(203);
        elements.push(closeBtn2);
        elements.push(this.add.text(W/2, H - 36, 'ОТМЕНА', {fontSize: '6px', color: '#ee8866', fontFamily: FONT}).setOrigin(0.5).setDepth(202));
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
