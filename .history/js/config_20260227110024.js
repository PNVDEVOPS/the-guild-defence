/**
 * КОНФИГУРАЦИЯ ИГРЫ — THE GUILD DEFENCE v3.1
 * Все картинки опциональны — без них работает на эмодзи/фигурах
 */

const CONFIG = {
    GAME_WIDTH: 960,
    GAME_HEIGHT: 540,

    // ==============================================
    // СПРАЙТШИТЫ (анимированные PNG)
    // Папка: sprites/
    // fw/fh = размер кадра, frames = кол-во, fps = скорость
    // ==============================================
    SPRITES: {
        GOBLIN:       { file: 'sprites/goblin.png',    fw: 64,  fh: 64,  frames: 4, fps: 8 },
        ORC:          { file: 'sprites/orc.png',       fw: 64,  fh: 64,  frames: 4, fps: 6 },
        TROLL:        { file: 'sprites/troll.png',     fw: 64,  fh: 64,  frames: 4, fps: 6 },
        TROLL_MEDIUM: { file: 'sprites/troll.png',     fw: 64,  fh: 64,  frames: 4, fps: 6 },
        TROLL_SMALL:  { file: 'sprites/troll.png',     fw: 64,  fh: 64,  frames: 4, fps: 6 },
        ZIGZAG:       { file: 'sprites/zigzag.png',    fw: 64,  fh: 64,  frames: 4, fps: 10 },
        DASHER:       { file: 'sprites/dasher.png',    fw: 64,  fh: 64,  frames: 4, fps: 10 },
        SHOOTER:      { file: 'sprites/witchмне .png',   fw: 64,  fh: 64,  frames: 4, fps: 8 },
        HEALER:       { file: 'sprites/healer.png',    fw: 64,  fh: 64,  frames: 4, fps: 6 },
        BOSS:         { file: 'sprites/boss.png',      fw: 128, fh: 128, frames: 4, fps: 6 },
        MEGA_BOSS:    { file: 'sprites/megaboss.png',  fw: 128, fh: 128, frames: 4, fps: 6 },
    },

    // Кастомное окружение (обычные картинки, не спрайтшиты)
    ENV: {
        BACKGROUND: 'sprites/background.png',
        CASTLE:     'sprites/castle.png',
    },

    // ==============================================
    // СПРАЙТЫ ОРУЖИЙ (на замке, поворачиваются к курсору)
    // Папка: sprites/  |  Размер: ~64x64, направление ВПРАВО
    // ==============================================
    WEAPON_SPRITES: {
        CROSSBOW:    'sprites/weapon_crossbow.png',
        CANNON:      'sprites/weapon_cannon.png',
        BOOMERANG:   'sprites/weapon_boomerang.png',
        PLASMA:      'sprites/weapon_plasma.png',
        FLAME_TOWER: 'sprites/weapon_flametower.png',
        LASER:       'sprites/weapon_laser.png',
        BALLISTA:    'sprites/weapon_ballista.png',
    },

    // ==============================================
    // СПРАЙТЫ СНАРЯДОВ (летят с поворотом)
    // Папка: sprites/  |  Размер: ~32x32, направление ВПРАВО
    // ==============================================
    PROJECTILE_SPRITES: {
        CROSSBOW:    'sprites/proj_crossbow.png',
        CANNON:      'sprites/proj_cannon.png',
        BOOMERANG:   'sprites/proj_boomerang.png',
        PLASMA:      null, // set path when sprite is ready
        FLAME_TOWER: null,
        LASER:       null,
        BALLISTA:    null,
    },

    // ==============================================
    // СПРАЙТЫ МАГИИ (иконки кнопок)
    // Папка: sprites/  |  Размер: 32x32
    // ==============================================
    MAGIC_SPRITES: {
        WIND:      null, // set path when sprite is ready
        FREEZE:    null,
        LIGHTNING: null,
        HEAL:      null,
        METEOR:    null,
        SHIELD:    null,
        LAVA:      null,
        TORNADO:   null,
    },

    // Старые картинки мобов (JPG фолбек)
    IMAGES: {
        GOBLIN: 'images/goblin.jpg',
        ORC: 'images/orc.jpg',
        TROLL: 'images/troll.jpg',
        TROLL_MEDIUM: 'images/troll.jpg',
        TROLL_SMALL: 'images/troll.jpg',
        BOSS: 'images/boss.jpg',
        SHOOTER: 'images/shooter.jpg',
        ZIGZAG: 'images/zigzag.jpg',
        DASHER: 'images/dasher.jpg',
        HEALER: 'images/sniper.jpg',
        MEGA_BOSS: 'images/megaboss.jpg',
    },

    BACKGROUND: {
        image: 'images/background.jpg',
        skyColor1: 0x87ceeb,
        skyColor2: 0x4682b4,
        groundColor: 0x8b4513,
        grassColor: 0x228b22
    },

    CASTLE: { x: 100, y: 270, maxHp: 100, size: 80 },

    // ==============================================
    // АРЕНА: СПАВН ВРАГОВ ТЕЛЕПОРТОМ
    // enabled: true  — враги телепортируются в зону арены
    // enabled: false — враги появляются справа (классика)
    // minX/maxX/minY/maxY — зона спавна внутри экрана
    // minSpacing — мин. расстояние между точками спавна
    // portalDuration — время анимации портала до появления врага (мс)
    // ==============================================
    ARENA_SPAWN: {
        enabled: true,
        minX: 640, maxX: 920,
        minY: 85,  maxY: 455,
        minSpacing: 62,
        portalDuration: 480,
    },

    START_GOLD: 100,
    START_GEMS: 4,

    // ==============================================
    // РЕКЛАМА (Yandex Games SDK)
    // ==============================================
    ADS: {
        interstitialIntervalMs: 300000, // 5 минут
        bossKillAd: true, // реклама за убийство босса
        maxReviveAds: 1,  // оживление за рекламу 1 раз
        maxGemAds: 3,     // гемы за рекламу 3 раза
        rewardedBonuses: {
            GOLD_BONUS: { desc: '💰 +150 золота',          type: 'gold', amount: 150 },
            GEM_BONUS:  { desc: '💎 +3 кристалла',         type: 'gems', amount: 3 },
            DAMAGE_X2:  { desc: '⚔️ x2 урон на 45 сек',    type: 'buff', duration: 45000, mult: 2 },
            FULL_HEAL:  { desc: '💚 Полное лечение замка',  type: 'heal' },
        }
    },

    // ==============================================
    // ОРУЖИЯ
    // ==============================================
    WEAPONS: {
        CROSSBOW: {
            name: 'Арбалет', baseDamage: 10, baseFireRate: 600, baseSpeed: 600,
            icon: '🏹', unlockWave: 0, gemCost: 0,
            upgrades: {
                damage: { level: 1, cost: 50, mult: 2, effect: 4 },
                fireRate: { level: 1, cost: 60, mult: 1.7, effect: -30 },
                crit: { level: 0, cost: 250, mult: 2.0, effect: 5, maxLevel: 5 }
            },
            ammoType: 'NORMAL'
        },
        CANNON: {
            name: 'Пушка', baseDamage: 50, baseFireRate: 1200, baseSpeed: 350,
            baseSplashRadius: 60, basePushback: 20, splash: true,
            icon: '💣', unlockWave: 10, gemCost: 35,
            upgrades: {
                damage: { level: 1, cost: 300, mult: 2, effect: 10 },
                fireRate: { level: 1, cost: 310, mult: 1.8, effect: -100 },
                radius: { level: 1, cost: 330, mult: 1.7, effect: 12 },
                pushback: { level: 1, cost: 300, mult: 1.8, effect: 15 },
                crit: { level: 0, cost: 400, mult: 2.5, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL'
        },
        BOOMERANG: {
            name: 'Бумеранг', baseDamage: 18, baseFireRate: 900, baseSpeed: 500,
            baseMaxRange: 580, boomerang: true,
            icon: '🪃', unlockWave: 15, gemCost: 50,
            upgrades: {
                damage: { level: 1, cost: 200, mult: 2, effect: 5 },
                fireRate: { level: 1, cost: 220, mult: 1.7, effect: -60 },
                speed: { level: 1, cost: 180, mult: 1.6, effect: 50 },
                crit: { level: 0, cost: 350, mult: 2.2, effect: 5, maxLevel: 8 }
            },
            ammoType: 'NORMAL'
        },
        PLASMA: {
            name: 'Плазма', baseDamage: 18, baseFireRate: 550, baseSpeed: 600,
            baseBounces: 2, baseDamageGrowth: 0.4, pierce: true,
            icon: '🟣', unlockWave: 20, gemCost: 75,
            upgrades: {
                damage: { level: 1, cost: 450, mult: 2, effect: 4 },
                fireRate: { level: 1, cost: 420, mult: 1.6, effect: -40 },
                bounces: { level: 1, cost: 480, mult: 2.2, effect: 1, maxLevel: 6 },
                damageGrowth: { level: 1, cost: 440, mult: 2.0, effect: 0.1, maxLevel: 5 },
                crit: { level: 0, cost: 500, mult: 2.2, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL'
        },
        FLAME_TOWER: {
            name: 'Огнемёт', baseDamage: 8, baseFireRate: 400, baseSpeed: 350,
            flameCone: true, flameSpread: 5, flameAngle: 15,
            icon: '🔥', unlockWave: 25, gemCost: 100,
            upgrades: {
                damage: { level: 1, cost: 500, mult: 2, effect: 3 },
                fireRate: { level: 1, cost: 480, mult: 1.6, effect: -25 },
                crit: { level: 0, cost: 600, mult: 2.0, effect: 5, maxLevel: 8 }
            },
            ammoType: 'FIRE'
        },
        LASER: {
            name: 'Лазер', baseDamage: 7, baseFireRate: 150, baseSpeed: 1400,
            pierce: true, icon: '🔴', unlockWave: 30, gemCost: 140,
            upgrades: {
                damage: { level: 1, cost: 900, mult: 2, effect: 2 },
                fireRate: { level: 1, cost: 700, mult: 1.8, effect: -8 },
                speed: { level: 1, cost: 800, mult: 1.7, effect: 100 },
                crit: { level: 0, cost: 1050, mult: 2.5, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL'
        },
        BALLISTA: {
            name: 'Баллиста', baseDamage: 120, baseFireRate: 2500, baseSpeed: 800,
            pierce: true, baseBounces: 999,
            icon: '⚔️', unlockWave: 40, gemCost: 200,
            upgrades: {
                damage: { level: 1, cost: 1200, mult: 2.2, effect: 25 },
                fireRate: { level: 1, cost: 1100, mult: 1.8, effect: -200 },
                speed: { level: 1, cost: 1000, mult: 1.7, effect: 100 },
                crit: { level: 0, cost: 1500, mult: 2.5, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL'
        }
    },

    AMMO_TYPES: {
        NORMAL: { name: 'Обычный', color: 0xffff00, effect: null },
        ELECTRIC: { name: 'Электрический', color: 0x00ffff, chainTargets: 3, chainDamagePercent: 0.3, icon: '⚡' },
        FIRE: { name: 'Огненный', color: 0xff6600, burnDuration: 4000, burnDamagePercent: 0.5, burnTicks: 4, icon: '🔥' },
        ICE: { name: 'Ледяной', color: 0x88ffff, slowPercent: 0.4, slowDuration: 2500, icon: '🧊' },
        MULTI: { name: 'Двойной', color: 0xff00ff, extraProjectiles: 1, spreadAngle: 8, icon: '✦' }
    },

    // ==============================================
    // ВРАГИ (MEGA_BOSS НЕРФНУТ)
    // ==============================================
    ENEMIES: {
        GOBLIN: {
            name: 'Гоблин', hp: 35, speed: 30, reward: 5, damage: 8,
            size: 48, color: 0x00ff00, moveType: 'straight', icon: '👹'
        },
        GOBLIN_ELITE: {
            name: 'Элитный Гоблин', hp: 110, speed: 75, reward: 10, damage: 12,
            size: 55, color: 0x00dd00, moveType: 'straight', icon: '👹',
            isElite: true, projectileCount: 1
        },
        ORC: {
            name: 'Орк', hp: 80, speed: 25, reward: 10, damage: 15,
            size: 60, color: 0x00aa00, moveType: 'straight', icon: '🧌'
        },
        ORC_ELITE: {
            name: 'Элитный Орк', hp: 165, speed: 55, reward: 15, damage: 22,
            size: 68, color: 0x009900, moveType: 'straight', icon: '🧌',
            isElite: true, projectileCount: 2
        },
        TROLL: {
            name: 'Тролль', hp: 180, speed: 22, reward: 8, damage: 35,
            size: 80, color: 0x006600, moveType: 'straight', icon: '👺',
            splitsInto: 'TROLL_MEDIUM', splitCount: 2
        },
        TROLL_MEDIUM: {
            name: 'Тролль-обломок', hp: 70, speed: 28, reward: 3, damage: 18,
            size: 58, color: 0x007700, moveType: 'straight', icon: '👺',
            splitsInto: 'TROLL_SMALL', splitCount: 2
        },
        TROLL_SMALL: {
            name: 'Тролль-осколок', hp: 30, speed: 38, reward: 1, damage: 8,
            size: 40, color: 0x008800, moveType: 'straight', icon: '👺'
        },
        TROLL_ELITE: {
            name: 'Элитный Тролль', hp: 260, speed: 32, reward: 30, damage: 38,
            size: 90, color: 0x005500, moveType: 'straight', icon: '👺',
            isElite: true, projectileCount: 2, splitsInto: 'TROLL_MEDIUM', splitCount: 2
        },
        ZIGZAG: {
            name: 'Уклонист', hp: 45, speed: 35, reward: 10, damage: 10,
            size: 45, color: 0xff00ff, moveType: 'zigzag',
            zigzagAmplitude: 50, zigzagFrequency: 1.5, icon: '🦇'
        },
        ZIGZAG_ELITE: {
            name: 'Элитный Уклонист', hp: 70, speed: 75, reward: 30, damage: 14,
            size: 52, color: 0xdd00dd, moveType: 'zigzag',
            zigzagAmplitude: 80, zigzagFrequency: 3.0, icon: '🦇',
            isElite: true, projectileCount: 1
        },
        DASHER: {
            name: 'Рывок', hp: 50, speed: 35, reward: 12, damage: 12,
            size: 48, color: 0xffaa00, moveType: 'dash',
            dashSpeed: 250, dashInterval: 2000, icon: '💨'
        },
        DASHER_ELITE: {
            name: 'Элитный Рывок', hp: 90, speed: 55, reward: 35, damage: 14,
            size: 56, color: 0xff8800, moveType: 'dash',
            dashSpeed: 300, dashInterval: 1800, icon: '💨',
            isElite: true, projectileCount: 2
        },
        SHOOTER: {
            name: 'Стрелок', hp: 55, speed: 35, reward: 12, damage: 7,
            size: 52, color: 0xff4444, moveType: 'straight',
            canShoot: true, shootDamage: 8, shootRate: 1800, shootRange: 400, icon: '🏹'
        },
        SHOOTER_ELITE: {
            name: 'Элитный Стрелок', hp: 120, speed: 40, reward: 35, damage: 10,
            size: 58, color: 0xdd2222, moveType: 'straight',
            canShoot: true, shootDamage: 9, shootRate: 1400, shootRange: 500, icon: '🏹',
            isElite: true, projectileCount: 2
        },
        HEALER: {
            name: 'Шаман', hp: 55, speed: 22, reward: 13, damage: 5,
            size: 52, color: 0x00ff88, moveType: 'straight',
            canHeal: true, healAmount: 15, healRate: 2500, healRange: 150, icon: '💀'
        },
        HEALER_ELITE: {
            name: 'Элитный Шаман', hp: 105, speed: 26, reward: 40, damage: 8,
            size: 58, color: 0x00dd66, moveType: 'straight',
            canHeal: true, healAmount: 25, healRate: 2200, healRange: 180, icon: '💀',
            isElite: true, projectileCount: 1
        },
        // === НОВЫЕ ВРАГИ ===
        SKELETON: {
            name: 'Скелет', hp: 25, speed: 55, reward: 8, damage: 6,
            size: 44, color: 0xcccccc, moveType: 'straight', icon: '💀'
        },
        SKELETON_ELITE: {
            name: 'Элитный Скелет', hp: 70, speed: 90, reward: 18, damage: 14,
            size: 50, color: 0xaaaaaa, moveType: 'straight', icon: '💀',
            isElite: true, projectileCount: 2
        },
        GOLEM: {
            name: 'Голем', hp: 190, speed: 18, reward: 20, damage: 40,
            size: 75, color: 0x888866, moveType: 'straight', icon: '🪨',
            immuneToSlow: true, immuneToFreeze: true
        },
        GOLEM_ELITE: {
            name: 'Элитный Голем', hp: 280, speed: 20, reward: 45, damage: 42,
            size: 85, color: 0x666644, moveType: 'straight', icon: '🪨',
            isElite: true, projectileCount: 1, immuneToSlow: true, immuneToFreeze: true
        },
        NECROMANCER: {
            name: 'Некромант', hp: 70, speed: 18, reward: 25, damage: 5,
            size: 52, color: 0x6600aa, moveType: 'straight', icon: '🧙',
            canResurrect: true, resurrectRate: 5000, resurrectRange: 200, resurrectCount: 1
        },
        NECROMANCER_ELITE: {
            name: 'Элитный Некромант', hp: 130, speed: 20, reward: 35, damage: 8,
            size: 58, color: 0x5500aa, moveType: 'straight', icon: '🧙',
            isElite: true, projectileCount: 1,
            canResurrect: true, resurrectRate: 4000, resurrectRange: 220, resurrectCount: 1
        },
        ASSASSIN: {
            name: 'Ассасин', hp: 40, speed: 45, reward: 15, damage: 20,
            size: 46, color: 0x333366, moveType: 'assassin', icon: '🗡️',
            stealthAtPercent: 0.6, revealAtPercent: 0.2, burstSpeedMult: 3
        },
        ASSASSIN_ELITE: {
            name: 'Элитный Ассасин', hp: 80, speed: 56, reward: 28, damage: 22,
            size: 52, color: 0x222255, moveType: 'assassin', icon: '🗡️',
            isElite: true, projectileCount: 1,
            stealthAtPercent: 0.65, revealAtPercent: 0.2, burstSpeedMult: 3.5
        },
        DRAGON_RIDER: {
            name: 'Наездник', hp: 120, speed: 30, reward: 25, damage: 10,
            size: 60, color: 0xcc4400, moveType: 'boss_fly', icon: '🐉',
            canShoot: true, shootDamage: 10, shootRate: 2500, shootRange: 600,
            flyZoneMinX: 300, flyZoneMaxX: 900,
            flyZoneMinY: 80, flyZoneMaxY: 420,
            flyChangeInterval: 1200
        },
        BOSS: {
            name: 'Дракон', hp: 800, speed: 28, reward: 200, damage: 22,
            size: 120, color: 0xff0000, moveType: 'boss_fly',
            isBoss: true, canShoot: true, shootDamage: 20, shootRate: 3000,
            flyZoneMinX: 200, flyZoneMaxX: 920,
            flyZoneMinY: 70, flyZoneMaxY: 430,
            flyChangeInterval: 1000,
            summons: true, summonType: 'GOBLIN', summonInterval: 7000, summonCount: 2,
            icon: '🐉'
        },
        MEGA_BOSS: {
            name: 'Древний Дракон',
            hp: 2500, speed: 35, reward: 500, damage: 45,
            size: 160, color: 0x660000, moveType: 'boss_fly',
            isBoss: true, canShoot: true,
            shootDamage: 28, shootRate: 2500,
            flyZoneMinX: 150, flyZoneMaxX: 930,
            flyZoneMinY: 60, flyZoneMaxY: 440,
            flyChangeInterval: 800,
            summons: true, summonType: 'ORC_ELITE', summonInterval: 8000, summonCount: 1,
            summonPool: ['GOBLIN_ELITE', 'ORC_ELITE', 'ZIGZAG_ELITE', 'SHOOTER_ELITE'],
            icon: '🐲'
        },
        MEGA_GOLEM: {
            name: 'Мега Голем',
            hp: 3000, speed: 15, reward: 600, damage: 80,
            size: 140, color: 0x554422, moveType: 'straight',
            isBoss: true, immuneToSlow: true, immuneToFreeze: true,
            groundPound: true, groundPoundDamage: 50, groundPoundInterval: 5000, groundPoundRadius: 180,
            icon: '🏔️'
        }
    },

    WAVE_CONFIG: {
        baseEnemyCount: 7, enemiesPerWave: 3,
        spawnDelayBase: 2000, spawnDelayMin: 600, spawnDelayReduction: 20,
        hpMultiplier: 0.055, damageMultiplier: 0.022, speedMultiplier: 0.008,
        bossHpMultiplier: 1.5, bossDamageMultiplier: 1.3,
        eliteStartWave: 15, eliteChanceBase: 0.04, eliteChancePerWave: 0.003
    },

    // ==============================================
    // МАНА (вместо кристаллов для магии)
    // ==============================================
    MANA: {
        max: 100,
        regenPerSec: 2,
    },

    MAGIC: {
        WIND:      { name: 'Ветер',        pushDistance: 80, targets: 6,  manaCost: 30, cooldown: 4000,  color: 0x88ccff, icon: '💨', hotkey: 'Q', gemCost: 0 },
        FREEZE:    { name: 'Заморозка',    duration: 3500,               manaCost: 35, cooldown: 9000,  color: 0x00ffff, icon: '❄️', hotkey: 'W', gemCost: 4 },
        LIGHTNING: { name: 'Молния',       damage: 120, targets: 6,       manaCost: 55, cooldown: 12000, color: 0xffff00, icon: '⚡', hotkey: 'E', gemCost: 8 },
        HEAL:      { name: 'Исцеление',    healAmount: 50,                manaCost: 45, cooldown: 10000, color: 0x00ff00, icon: '💚', hotkey: 'R', gemCost: 5 },
        METEOR:    { name: 'Метеорит',     damage: 80, meteorCount: 5, radius: 80, manaCost: 60, cooldown: 15000, color: 0xff4400, icon: '☄️', hotkey: 'T', gemCost: 8 },
        SHIELD:    { name: 'Щит замка',    duration: 8000, reduction: 0.6, manaCost: 40, cooldown: 20000, color: 0x4488ff, icon: '🛡️', hotkey: 'Y', gemCost: 6 },
        LAVA:      { name: 'Лавовая зона', damage: 15, duration: 6000, radius: 70, manaCost: 50, cooldown: 18000, color: 0xff6600, icon: '🌋', hotkey: 'U', gemCost: 10 },
        TORNADO:   { name: 'Торнадо',      damage: 20, pullForce: 80, duration: 4000, targets: 8, manaCost: 45, cooldown: 14000, color: 0xccaaff, icon: '🌪️', hotkey: 'I', gemCost: 7 },
    },

    // ==============================================
    // РОГАЛИК — ОПЫТ И ПЕРКИ
    // ==============================================
    XP_CONFIG: {
        xpToFirstLevel: 60,
        xpPerLevelIncrease: 35,
        perksPerPick: 3,
    },

    // Rarity weights: COMMON=10, RARE=5, EPIC=2, LEGENDARY=1
    ROGUE_PERKS: [
        { id: 'ALL_DAMAGE',     rarity: 'COMMON',    name: 'Острые лезвия',      icon: '⚔️', desc: '+12% урон всех оружий',        type: 'allDamage',        value: 0.12 },
        { id: 'FIRE_RATE',      rarity: 'COMMON',    name: 'Быстрые руки',        icon: '💨', desc: '+12% скорострельность всех',   type: 'allFireRate',       value: 0.12 },
        { id: 'CRIT_ALL',       rarity: 'COMMON',    name: 'Меткий взгляд',       icon: '🎯', desc: '+6% шанс крита',               type: 'critAll',           value: 6 },
        { id: 'MANA_MAX',       rarity: 'COMMON',    name: 'Резервуар маны',       icon: '💧', desc: '+30 макс. мана',               type: 'manaMax',           value: 30 },
        { id: 'MANA_REGEN',     rarity: 'COMMON',    name: 'Медитация',            icon: '🔮', desc: '+4 рег. маны/сек',             type: 'manaRegen',         value: 4 },
        { id: 'MAGIC_POWER',    rarity: 'RARE',      name: 'Аркан Силы',           icon: '✨', desc: '+25% урон магии',              type: 'magicDamage',       value: 0.25 },
        { id: 'MAGIC_CD',       rarity: 'RARE',      name: 'Быстрые заклинания',  icon: '⏱️', desc: '-15% кулдаун магии',           type: 'magicCooldown',     value: 0.15 },
        { id: 'CASTLE_HP',      rarity: 'COMMON',    name: 'Укрепление стен',      icon: '🏰', desc: '+60 HP замка',                type: 'castleHp',          value: 60 },
        { id: 'CASTLE_REGEN',   rarity: 'RARE',      name: 'Магический ремонт',    icon: '💚', desc: '+2 рег. HP/сек',              type: 'castleRegen',       value: 2 },
        { id: 'CASTLE_ARMOR',   rarity: 'EPIC',      name: 'Гранитная броня',      icon: '🛡️', desc: '-10% урон по замку',          type: 'castleArmor',       value: 0.1 },
        { id: 'PIERCE_SHOT',    rarity: 'RARE',      name: 'Пробойный выстрел',    icon: '🔵', desc: '+1 пробивание всех снарядов',   type: 'pierceAll',         value: 1 },
        { id: 'LONG_RANGE',     rarity: 'COMMON',    name: 'Дальнобойность',        icon: '↗️', desc: '+40% дальность снарядов',       type: 'projRange',         value: 0.4 },
        { id: 'GOLD_RUSH',      rarity: 'COMMON',    name: 'Золотая лихорадка',    icon: '👑', desc: '+150 золота',                 type: 'gold',              value: 150 },
        { id: 'LIFESTEAL',      rarity: 'EPIC',      name: 'Кровопийца',           icon: '🧛', desc: '+2% кражи жизней',             type: 'lifesteal',         value: 0.02 },
        { id: 'ELECTRIC_CHAIN', rarity: 'EPIC',      name: 'Проводник',            icon: '⚡', desc: '+1 цель цепной молнии',        type: 'electricChain',     value: 1 },
        { id: 'WIND_PUSH',      rarity: 'COMMON',    name: 'Буря',                icon: '🌪️', desc: 'Ветер отбрасывает на 80 дальше', type: 'windPush',          value: 80 },
        { id: 'FREEZE_EXTEND',  rarity: 'COMMON',    name: 'Вечная Зима',         icon: '🧊', desc: 'Заморозка длится на 2 сек дольше',type: 'freezeExtend',     value: 2000 },
        { id: 'HEAL_POWER',     rarity: 'RARE',      name: 'Великий Лекарь',     icon: '💖', desc: 'Исцеление замка +25 HP',          type: 'healPower',         value: 25 },
        { id: 'HEAVY_HIT',      rarity: 'RARE',      name: 'Тяжёлый удар',         icon: '⚔️', desc: '+15% урон всех оружий',         type: 'allDamage',         value: 0.15 },
        { id: 'MARKSMAN',       rarity: 'RARE',      name: 'Меткий стрелок',       icon: '🎯', desc: '+8% шанс крита',                type: 'critAll',           value: 8 },
        { id: 'FORCEFUL_BLOW',  rarity: 'COMMON',    name: 'Мощный удар',          icon: '💫', desc: '+20 отбрасывание всех снарядов',type: 'knockbackAll',      value: 20 },
        { id: 'SWIFT_STRIKE',   rarity: 'COMMON',    name: 'Молниеносный удар',    icon: '⚡', desc: '+25% скорость снарядов',        type: 'projSpeed',         value: 0.25 },
        // Weapon-specific perks (filtered by loadout)
        { id: 'PLASMA_BOUNCE',  rarity: 'RARE',      name: 'Рикошет',              icon: '🟣', desc: 'Плазма/Баллиста: +2 отскока',   type: 'plasmaExtraBounce', value: 2 },
        { id: 'CANNON_SPLASH',  rarity: 'RARE',      name: 'Большой взрыв',        icon: '💥', desc: 'Пушка: +30% радиус взрыва',     type: 'splashRadius',      value: 0.3 },
        { id: 'BOOMERANG_RANGE',rarity: 'RARE',      name: 'Дальний бумеранг',     icon: '🪃', desc: 'Бумеранг: +150 дальность',      type: 'boomerangRange',    value: 150 },
        { id: 'BALLISTA_DMG',   rarity: 'RARE',      name: 'Сила Баллисты',        icon: '🏹', desc: 'Баллиста: +30% урон',           type: 'ballistaDamage',    value: 0.3 },
        { id: 'CROSSBOW_CRIT',  rarity: 'RARE',      name: 'Снайпер',              icon: '🎯', desc: 'Арбалет: +10% крит',            type: 'crossbowCrit',      value: 10 },
        { id: 'FLAME_SPREAD',   rarity: 'RARE',      name: 'Адское Пламя',         icon: '🔥', desc: 'Огнемёт: +3 снаряда',           type: 'flameSpread',       value: 3 },
        { id: 'CANNON_PUSH',    rarity: 'RARE',      name: 'Разрушитель',          icon: '💥', desc: 'Пушка: +20 отбрасывание',       type: 'cannonPush',        value: 20 },
        { id: 'LASER_SPEED',    rarity: 'RARE',      name: 'Световой Луч',         icon: '🔴', desc: 'Лазер: +20% скорость',          type: 'laserSpeed',        value: 0.2 },
        // Legendary & Epic weapon-specific
        { id: 'CHAIN_SHOT',     rarity: 'LEGENDARY', name: 'Книппель',             icon: '⛓️', desc: 'Пушка: два ядра на цепи вместо одного', type: 'chainShot', value: 1 },
        { id: 'BOOMERANG_TRIPLE',rarity:'EPIC',       name: 'Тройной бросок',       icon: '🪃', desc: 'Бумеранг: 3 снаряда за один бросок', type: 'boomerangTriple', value: 2 },
        { id: 'CROSSBOW_BARRAGE',rarity:'EPIC',       name: 'Шквал стрел',          icon: '🏹', desc: 'Арбалет: +4 стрелы веером за выстрел', type: 'crossbowBarrage', value: 4 },
        // Universal projectile multipliers (super rare)
        { id: 'MULTISHOT',      rarity: 'EPIC',      name: 'Мультивыстрел',        icon: '✦',  desc: '+3 доп. снаряда за выстрел',    type: 'ammoMulti',         value: 3 },
        { id: 'BARRAGE',        rarity: 'LEGENDARY', name: 'Шквальный огонь',      icon: '🌟', desc: '+6 доп. снарядов за выстрел',   type: 'ammoMulti',         value: 6 },
        { id: 'MANA_ON_KILL',   rarity: 'COMMON',    name: 'Пожиратель Душ',      icon: '👻', desc: '+3 маны за каждого убитого врага',type: 'manaOnKill',       value: 3 },
        { id: 'GOLD_INTEREST',  rarity: 'EPIC',      name: 'Ростовщик',           icon: '🏦', desc: '+1% от накопленного золота сразу',type: 'goldInterest',     value: 0.01 },
        { id: 'ENEMY_SLOW_ALL', rarity: 'LEGENDARY', name: 'Тяжёлые Путы',       icon: '⛓️', desc: 'Все враги изначально замедлены на 10%', type: 'enemySlowAll', value: 0.1 },
        // Снаряды-перки (стакаются)
        { id: 'AMMO_ELECTRIC', rarity: 'COMMON',    name: 'Электроснаряд',     icon: '⚡', desc: '+1 цель цепи, +15% урон цепи',           type: 'ammoElectric', value: 1 },
        { id: 'AMMO_FIRE',     rarity: 'COMMON',    name: 'Огненный снаряд',   icon: '🔥', desc: '+1 тик горения, +12% урон огня',         type: 'ammoFire',     value: 1 },
        { id: 'AMMO_ICE',      rarity: 'COMMON',    name: 'Ледяной снаряд',    icon: '🧊', desc: '+10% замедление, +0.5с длительн.',       type: 'ammoIce',      value: 1 },
        { id: 'AMMO_MULTI',    rarity: 'RARE',      name: 'Сдвоенный выстрел', icon: '✦',  desc: '+1 доп. снаряд за выстрел',              type: 'ammoMulti',    value: 1 },
    ],

    // ==============================================
    // СНАРЯДЫ-ПЕРКИ (стакаются, применяются ко всем оружиям)
    // ==============================================
    AMMO_PERKS: {
        ELECTRIC: { chainTargetsPerStack: 1, chainDamagePerStack: 0.15 },
        FIRE:     { burnTicksPerStack: 1, burnDamagePerStack: 0.12 },
        ICE:      { slowPercentPerStack: 0.10, slowDurationPerStack: 500 },
        MULTI:    { extraProjectilesPerStack: 1 }
    },

    // ==============================================
    // ЭКИПИРОВКА ПЕРЕД ЗАБЕГОМ
    // ==============================================
    LOADOUT: { defaultWeaponSlots: 3, defaultMagicSlots: 3, maxSlots: 5 },

    // ==============================================
    // УРОВНИ — бесконечные волны в стиле рогалика
    // enemyUnlocks — враги появляются начиная с указанной волны
    // enemyWeights — вес каждого типа врага при случайном выборе
    // bossInterval — босс каждые N волн
    // megaBossInterval — мега-босс каждые N волн
    // ==============================================
    LEVELS: {
        1: {
            name: 'Дикий Лес', icon: '🌲', endless: true,
            desc: 'Гоблины, орки, первые монстры',
            enemyUnlocks: {
                1:  ['GOBLIN'],
                4:  ['ORC'],
                7:  ['ZIGZAG'],
                10: ['TROLL', 'SHOOTER'],
                14: ['DASHER'],
                18: ['HEALER'],
            },
            enemyWeights: { GOBLIN:10, ORC:8, ZIGZAG:6, TROLL:5, SHOOTER:5, DASHER:4, HEALER:3 },
            bossPool: ['BOSS'],
            megaBossPool: ['MEGA_BOSS'],
            bossInterval: 10, megaBossInterval: 30,
        },
        2: {
            name: 'Подземелья Смерти', icon: '💀', endless: true,
            desc: 'Нежить, големы и тени',
            enemyUnlocks: {
                1:  ['SKELETON'],
                3:  ['GOLEM'],
                6:  ['ZIGZAG', 'DASHER'],
                10: ['HEALER', 'ASSASSIN'],
                14: ['NECROMANCER'],
                18: ['DRAGON_RIDER'],
            },
            enemyWeights: { SKELETON:10, GOLEM:6, ZIGZAG:7, DASHER:7, HEALER:4, ASSASSIN:5, NECROMANCER:4, DRAGON_RIDER:3 },
            bossPool: ['BOSS','MEGA_GOLEM'],
            megaBossPool: ['MEGA_BOSS','MEGA_GOLEM'],
            bossInterval: 8, megaBossInterval: 25,
        },
        3: {
            name: 'Врата Хаоса', icon: '🌋', endless: true,
            desc: 'Все враги. Хаос. Удачи.',
            enemyUnlocks: {
                1:  ['GOBLIN', 'SKELETON'],
                3:  ['ORC', 'GOLEM'],
                5:  ['ZIGZAG', 'ASSASSIN'],
                8:  ['TROLL', 'DASHER', 'SHOOTER'],
                12: ['HEALER', 'NECROMANCER', 'DRAGON_RIDER'],
            },
            enemyWeights: { GOBLIN:8, SKELETON:8, ORC:7, GOLEM:5, ZIGZAG:6, ASSASSIN:5, TROLL:5, DASHER:6, SHOOTER:5, HEALER:4, NECROMANCER:4, DRAGON_RIDER:3 },
            bossPool: ['BOSS','MEGA_GOLEM','MEGA_BOSS'],
            megaBossPool: ['MEGA_BOSS','MEGA_GOLEM'],
            bossInterval: 7, megaBossInterval: 20,
        }
    },

    // ==============================================
    // СОБЫТИЯ (редкие, каждые 5 волн — шанс)
    // ==============================================
    EVENTS: {
        METEOR_STORM: {
            name: '☄️ Метеоритный Дождь',
            desc: 'Метеориты падают на врагов!',
            chance: 0.14, type: 'positive',
        },
        GOLDEN_CHEST: {
            name: '🪙 Золотой Сундук',
            desc: '+150 золота',
            chance: 0.14, type: 'positive', gold: 150,
        },
        BERSERK_HORDE: {
            name: '😡 Ярость Орды',
            desc: 'Враги быстрее (+30%) и живучее (+50%), но дают x1.8 золота',
            chance: 0.10, type: 'challenge',
            hpMult: 1.5, speedMult: 1.3, goldMult: 1.8,
        },
        MANA_SURGE: {
            name: '💙 Всплеск Маны',
            desc: 'Мана восстановлена до максимума!',
            chance: 0.10, type: 'positive',
        },
        ELITE_INVASION: {
            name: '💀 Нашествие Элиты',
            desc: 'Вся волна — элитные враги!',
            chance: 0.08, type: 'challenge',
        },
        CASTLE_REPAIR: {
            name: '🔨 Ремонт Замка',
            desc: '+50 HP замка',
            chance: 0.12, type: 'positive', heal: 50,
        },
        ANCIENT_SCROLL: {
            name: '📜 Древний Свиток',
            desc: 'Дополнительный выбор перка!',
            chance: 0.08, type: 'positive',
        },
        DOUBLE_GOLD_WAVE: {
            name: '💰 Золотая Волна',
            desc: 'Враги этой волны дают x2 золота',
            chance: 0.12, type: 'positive', goldMult: 2.0,
        },
    },

    // ==============================================
    // ТАЛАНТЫ (перманентные улучшения за гемы)
    // ==============================================
    TALENTS: {
        ATTACK: {
            damage:   { name: '+Урон',       icon: '⚔️', maxLevel: 5, costPerLevel: [150,300,500,800,1200], effectPerLevel: 0.05 },
            fireRate: { name: '+Скорость',   icon: '🏹', maxLevel: 5, costPerLevel: [150,300,500,800,1200], effectPerLevel: 0.05 },
            crit:     { name: '+Крит',       icon: '💥', maxLevel: 5, costPerLevel: [250,500,900,1400,2000], effectPerLevel: 0.02 }
        },
        DEFENSE: {
            maxHp:  { name: '+HP Замка',   icon: '🏰', maxLevel: 5, costPerLevel: [200,400,700,1100,1600], effectPerLevel: 0.1 },
            regen:  { name: '+Реген',      icon: '💚', maxLevel: 5, costPerLevel: [300,600,1000,1500,2200], effectPerLevel: 1 },
            armor:  { name: 'Броня',       icon: '🛡️', maxLevel: 5, costPerLevel: [350,700,1200,1800,2500], effectPerLevel: 0.05 }
        },
        MAGIC: {
            cooldown:    { name: '-Кулдаун',    icon: '⏱️', maxLevel: 5, costPerLevel: [200,400,700,1100,1600], effectPerLevel: 0.05 },
            magicDamage: { name: '+Маг.урон',   icon: '✨', maxLevel: 5, costPerLevel: [300,600,1000,1500,2200], effectPerLevel: 0.1 },
            duration:    { name: '+Длительн.',  icon: '⌛', maxLevel: 5, costPerLevel: [300,600,1000,1500,2200], effectPerLevel: 0.1 }
        }
    },

    // ==============================================
    // АРТЕФАКТЫ (покупаются за гемы, экипируется 3)
    // ==============================================
    ARTIFACTS: {
        FIRE_AMULET:   { name: 'Огненный Амулет',  icon: '🔥', desc: 'Стартовые огненные патроны',  cost: 5,  effect: { startAmmo: 'FIRE' } },
        SHIELD_GUARD:  { name: 'Щит Стража',        icon: '🛡️', desc: '+20% HP замка',              cost: 4,  effect: { castleHpMult: 1.2 } },
        SPEED_RING:    { name: 'Кольцо Скорости',   icon: '💍', desc: '+15% скорострельность',      cost: 5,  effect: { fireRateMult: 0.85 } },
        MANA_CRYSTAL:  { name: 'Кристалл Маны',     icon: '💎', desc: '-20% кулдаун магии',         cost: 6,  effect: { magicCdMult: 0.8 } },
        GOLD_CROWN:    { name: 'Золотая Корона',     icon: '👑', desc: '+30% золота',               cost: 5,  effect: { goldMult: 1.3 } },
        VAMPIRE_FANG:  { name: 'Клык Вампира',       icon: '🧛', desc: '2% кражи жизней',          cost: 7,  effect: { lifesteal: 0.02 } }
    },
    MAX_EQUIPPED_ARTIFACTS: 3
};
