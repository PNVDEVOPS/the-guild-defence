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
        SHOOTER:      { file: 'sprites/witch.png',   fw: 64,  fh: 64,  frames: 4, fps: 8 },
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
        CROSSBOW: 'sprites/weapon_crossbow.png',
        CANNON:   'sprites/weapon_cannon.png',
        PLASMA:   'sprites/weapon_plasma.png',
        LASER:    'sprites/weapon_laser.png',
    },

    // ==============================================
    // СПРАЙТЫ СНАРЯДОВ (летят с поворотом)
    // Папка: sprites/  |  Размер: ~32x32, направление ВПРАВО
    // ==============================================
    PROJECTILE_SPRITES: {
        CROSSBOW: 'sprites/proj_crossbow.png',
        CANNON:   'sprites/proj_cannon.png',
        PLASMA:   'sprites/proj_plasma.png',
        LASER:    'sprites/proj_laser.png',
    },

    // ==============================================
    // СПРАЙТЫ МАГИИ (иконки кнопок)
    // Папка: sprites/  |  Размер: 32x32
    // ==============================================
    MAGIC_SPRITES: {
        WIND:      'sprites/magic_wind.png',
        FREEZE:    'sprites/magic_freeze.png',
        LIGHTNING: 'sprites/magic_lightning.png',
        HEAL:      'sprites/magic_heal.png',
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

    START_GOLD: 100,
    START_GEMS: 4,

    // ==============================================
    // РЕКЛАМА (Yandex Games SDK)
    // ==============================================
    ADS: {
        interstitialEveryWaves: 4,
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
            icon: '🏹', unlockWave: 0,
            upgrades: {
                damage: { level: 1, cost: 50, mult: 2, effect: 4 },
                fireRate: { level: 1, cost: 60, mult: 1.7, effect: -30 },
                crit: { level: 0, cost: 250, mult: 2.0, effect: 5, maxLevel: 5 }
            },
            ammoType: 'NORMAL',
            ammoCost: { ELECTRIC: 400, FIRE: 350, ICE: 300, MULTI: 500 }
        },
        CANNON: {
            name: 'Пушка', baseDamage: 50, baseFireRate: 1200, baseSpeed: 350,
            baseSplashRadius: 60, basePushback: 20, splash: true,
            icon: '💣', unlockWave: 10,
            upgrades: {
                damage: { level: 1, cost: 300, mult: 2, effect: 10 },
                fireRate: { level: 1, cost: 310, mult: 1.8, effect: -100 },
                radius: { level: 1, cost: 330, mult: 1.7, effect: 12 },
                pushback: { level: 1, cost: 300, mult: 1.8, effect: 15 },
                crit: { level: 0, cost: 400, mult: 2.5, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL',
            ammoCost: { ELECTRIC: 800, FIRE: 750, ICE: 600, MULTI: 950 }
        },
        PLASMA: {
            name: 'Плазма', baseDamage: 14, baseFireRate: 550, baseSpeed: 600,
            baseBounces: 2, baseDamageGrowth: 0.25, pierce: true,
            icon: '🟣', unlockWave: 20,
            upgrades: {
                damage: { level: 1, cost: 450, mult: 2, effect: 4 },
                fireRate: { level: 1, cost: 420, mult: 1.6, effect: -40 },
                bounces: { level: 1, cost: 480, mult: 2.2, effect: 1, maxLevel: 6 },
                damageGrowth: { level: 1, cost: 440, mult: 2.0, effect: 0.1, maxLevel: 5 },
                crit: { level: 0, cost: 500, mult: 2.2, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL',
            ammoCost: { ELECTRIC: 1250, FIRE: 1200, ICE: 1100, MULTI: 1350 }
        },
        LASER: {
            name: 'Лазер', baseDamage: 6, baseFireRate: 80, baseSpeed: 1400,
            pierce: true, icon: '🔴', unlockWave: 30,
            upgrades: {
                damage: { level: 1, cost: 900, mult: 2, effect: 2 },
                fireRate: { level: 1, cost: 700, mult: 1.8, effect: -8 },
                speed: { level: 1, cost: 800, mult: 1.7, effect: 100 },
                crit: { level: 0, cost: 1050, mult: 2.5, effect: 5, maxLevel: 10 }
            },
            ammoType: 'NORMAL',
            ammoCost: { ELECTRIC: 2000, FIRE: 2050, ICE: 1900, MULTI: 2300 }
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
            name: 'Гоблин', hp: 35, speed: 30, reward: 10, damage: 8,
            size: 30, color: 0x00ff00, moveType: 'straight', icon: '👹'
        },
        GOBLIN_ELITE: {
            name: 'Элитный Гоблин', hp: 130, speed: 80, reward: 20, damage: 18,
            size: 35, color: 0x00dd00, moveType: 'straight', icon: '👹',
            isElite: true, projectileCount: 2
        },
        ORC: {
            name: 'Орк', hp: 80, speed: 25, reward: 20, damage: 15,
            size: 40, color: 0x00aa00, moveType: 'straight', icon: '🧌'
        },
        ORC_ELITE: {
            name: 'Элитный Орк', hp: 190, speed: 60, reward: 35, damage: 35,
            size: 50, color: 0x009900, moveType: 'straight', icon: '🧌',
            isElite: true, projectileCount: 3
        },
        TROLL: {
            name: 'Тролль', hp: 180, speed: 22, reward: 15, damage: 35,
            size: 55, color: 0x006600, moveType: 'straight', icon: '👺',
            splitsInto: 'TROLL_MEDIUM', splitCount: 2
        },
        TROLL_MEDIUM: {
            name: 'Тролль-обломок', hp: 70, speed: 28, reward: 8, damage: 18,
            size: 40, color: 0x007700, moveType: 'straight', icon: '👺',
            splitsInto: 'TROLL_SMALL', splitCount: 2
        },
        TROLL_SMALL: {
            name: 'Тролль-осколок', hp: 30, speed: 38, reward: 5, damage: 8,
            size: 25, color: 0x008800, moveType: 'straight', icon: '👺'
        },
        TROLL_ELITE: {
            name: 'Элитный Тролль', hp: 300, speed: 35, reward: 50, damage: 60,
            size: 70, color: 0x005500, moveType: 'straight', icon: '👺',
            isElite: true, projectileCount: 4, splitsInto: 'TROLL_MEDIUM', splitCount: 3
        },
        ZIGZAG: {
            name: 'Уклонист', hp: 45, speed: 35, reward: 15, damage: 10,
            size: 28, color: 0xff00ff, moveType: 'zigzag',
            zigzagAmplitude: 50, zigzagFrequency: 1.5, icon: '🦇'
        },
        ZIGZAG_ELITE: {
            name: 'Элитный Уклонист', hp: 80, speed: 80, reward: 40, damage: 22,
            size: 35, color: 0xdd00dd, moveType: 'zigzag',
            zigzagAmplitude: 90, zigzagFrequency: 3.5, icon: '🦇',
            isElite: true, projectileCount: 2
        },
        DASHER: {
            name: 'Рывок', hp: 50, speed: 35, reward: 18, damage: 12,
            size: 30, color: 0xffaa00, moveType: 'dash',
            dashSpeed: 250, dashInterval: 2000, icon: '💨'
        },
        DASHER_ELITE: {
            name: 'Элитный Рывок', hp: 100, speed: 60, reward: 45, damage: 20,
            size: 38, color: 0xff8800, moveType: 'dash',
            dashSpeed: 350, dashInterval: 1500, icon: '💨',
            isElite: true, projectileCount: 3
        },
        SHOOTER: {
            name: 'Стрелок', hp: 55, speed: 35, reward: 20, damage: 7,
            size: 35, color: 0xff4444, moveType: 'straight',
            canShoot: true, shootDamage: 8, shootRate: 1800, shootRange: 400, icon: '🏹'
        },
        SHOOTER_ELITE: {
            name: 'Элитный Стрелок', hp: 140, speed: 45, reward: 55, damage: 15,
            size: 42, color: 0xdd2222, moveType: 'straight',
            canShoot: true, shootDamage: 12, shootRate: 1000, shootRange: 600, icon: '🏹',
            isElite: true, projectileCount: 3
        },
        HEALER: {
            name: 'Шаман', hp: 55, speed: 22, reward: 30, damage: 5,
            size: 35, color: 0x00ff88, moveType: 'straight',
            canHeal: true, healAmount: 15, healRate: 2500, healRange: 150, icon: '💀'
        },
        HEALER_ELITE: {
            name: 'Элитный Шаман', hp: 120, speed: 28, reward: 70, damage: 10,
            size: 42, color: 0x00dd66, moveType: 'straight',
            canHeal: true, healAmount: 40, healRate: 1800, healRange: 200, icon: '💀',
            isElite: true, projectileCount: 2
        },
        BOSS: {
            name: 'Дракон', hp: 800, speed: 28, reward: 200, damage: 12,
            size: 90, color: 0xff0000, moveType: 'boss_fly',
            isBoss: true, canShoot: true, shootDamage: 8, shootRate: 5000,
            flyZoneMinX: 200, flyZoneMaxX: 920,
            flyZoneMinY: 70, flyZoneMaxY: 430,
            flyChangeInterval: 1000,
            summons: true, summonType: 'GOBLIN', summonInterval: 7000, summonCount: 2,
            icon: '🐉'
        },
        MEGA_BOSS: {
            name: 'Древний Дракон',
            hp: 2500, speed: 35, reward: 500, damage: 30,
            size: 120, color: 0x660000, moveType: 'boss_fly',
            isBoss: true, canShoot: true,
            shootDamage: 12, shootRate: 4000,
            flyZoneMinX: 150, flyZoneMaxX: 930,
            flyZoneMinY: 60, flyZoneMaxY: 440,
            flyChangeInterval: 800,
            summons: true, summonType: 'ORC_ELITE', summonInterval: 8000, summonCount: 1,
            summonPool: ['GOBLIN_ELITE', 'ORC_ELITE', 'ZIGZAG_ELITE', 'SHOOTER_ELITE'],
            icon: '🐲'
        }
    },

    WAVE_CONFIG: {
        baseEnemyCount: 5, enemiesPerWave: 2,
        spawnDelayBase: 1600, spawnDelayMin: 350, spawnDelayReduction: 35,
        hpMultiplier: 0.05, damageMultiplier: 0.020, speedMultiplier: 0.007,
        bossEveryWave: 10, megaBossEveryWave: 50,
        bossHpMultiplier: 1.4, bossDamageMultiplier: 1.2,
        unlockWaves: { GOBLIN: 1, ORC: 3, ZIGZAG: 4, SHOOTER: 6, TROLL: 8, DASHER: 12, HEALER: 15 },
        spawnWeights: { GOBLIN: 10, ORC: 7, ZIGZAG: 6, SHOOTER: 5, TROLL: 3, DASHER: 4, HEALER: 2 },
        eliteStartWave: 17, eliteChanceBase: 0.04, eliteChancePerWave: 0.0025
    },

    MAGIC: {
        WIND: { name: 'Ветер', pushDistance: 100, targets: 6, cost: 1, cooldown: 3000, color: 0x88ccff, icon: '💨', hotkey: 'Q' },
        FREEZE: { name: 'Заморозка', duration: 3500, cost: 2, cooldown: 8000, color: 0x00ffff, icon: '❄️', hotkey: 'W' },
        LIGHTNING: { name: 'Молния', damage: 120, targets: 6, cost: 3, cooldown: 15000, color: 0xffff00, icon: '⚡', hotkey: 'E' },
        HEAL: { name: 'Исцеление', healAmount: 50, cost: 3, cooldown: 10000, color: 0x00ff00, icon: '💚', hotkey: 'R' }
    },

    CASTLE_UPGRADES: {
        maxHp: { level: 1, cost: 300, mult: 2, effect: 50 },
        regen: { level: 0, cost: 500, mult: 2, effect: 1 }
    }
};
