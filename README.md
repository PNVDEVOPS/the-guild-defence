# 🏹 ЗАЩИТНИК ЗАМКА - Shooter Defense

## 🎮 Описание игры

Это **активный шутер-защита** в стиле Defender 2, где ты управляешь арбалетом и защищаешь замок от волн монстров!

### Геймплей:
- 🎯 **Кликай** по экрану чтобы стрелять
- 👹 **Враги** идут справа к замку слева
- 💰 **Золото** за убийства → покупай улучшения
- 🔮 **Магия** (огонь, лёд, молния) → тратишь кристаллы
- ⚙️ **Улучшения** арбалета и замка
- 📈 **10 волн** с нарастающей сложностью

---

## 🚀 Быстрый старт

### Запуск локально:

```bash
# Python
python -m http.server 8000

# Открой: http://localhost:8000
```

### Или VS Code:
1. Открой папку в VS Code
2. Установи "Live Server"
3. Правый клик на index.html → Open with Live Server

---

## 📁 Структура проекта

```
defender-shooter/
│
├── index.html              # Главный HTML
│
└── js/
    ├── config.js          # ⚙️ Настройки игры
    ├── Enemy.js           # 👹 Класс врагов
    ├── Projectile.js      # 🎯 Снаряды арбалета
    ├── Magic.js           # 🔮 Магические способности
    ├── GameScene.js       # 🎮 Главная сцена
    ├── UpgradeScene.js    # ⬆️ Меню улучшений
    └── game.js            # 🚀 Инициализация
```

---

## 🧩 Подробное объяснение кода

### 1️⃣ **config.js** - Центр настроек

Весь баланс игры в одном файле!

```javascript
// Параметры арбалета
CROSSBOW: {
    baseDamage: 10,        // Урон стрелы
    fireRate: 500,         // Перезарядка (мс)
    projectileSpeed: 600   // Скорость полёта
}

// Типы врагов
ENEMIES: {
    GOBLIN: {
        hp: 20,            // Здоровье
        speed: 50,         // Скорость
        reward: 10,        // Золото за убийство
        damage: 5          // Урон замку
    }
}

// Магия
MAGIC: {
    FIREBALL: {
        damage: 50,        // Урон
        radius: 80,        // Радиус взрыва
        cost: 1,           // Кристаллы
        cooldown: 3000     // Перезарядка (мс)
    }
}
```

**Как балансировать:**
- Увеличь `baseDamage` → легче
- Уменьши `fireRate` → быстрее стрельба
- Увеличь `GOBLIN.hp` → сложнее

---

### 2️⃣ **Enemy.js** - Враги

Враги спавнятся справа и идут к замку.

#### Ключевые методы:

**constructor(scene, type)**
```javascript
// Создаёт врага с параметрами из config
this.config = CONFIG.ENEMIES[type];
this.hp = this.config.hp;
this.speed = this.config.speed;
```

**startMoving()**
```javascript
// Движение к замку используя Tween
this.moveTween = this.scene.tweens.add({
    targets: this.sprite,
    x: CONFIG.CASTLE.x,  // Позиция замка
    duration: (distance / speed) * 1000,
    ease: 'Linear',
    onComplete: () => {
        this.reachCastle();  // Достиг замка
    }
});
```

**takeDamage(damage)**
```javascript
this.hp -= damage;

// Обновляем полоску здоровья
const healthPercent = this.hp / this.maxHp;
this.healthBar.scaleX = healthPercent;

// Если HP <= 0 → умирает
if (this.hp <= 0) {
    this.die();
}
```

**freeze(duration)**
```javascript
// Замораживает врага (магия "Заморозка")
this.isFrozen = true;
this.moveTween.pause();  // Останавливаем движение
this.sprite.setTint(0x00ffff);  // Синий цвет
```

---

### 3️⃣ **Projectile.js** - Снаряды

Снаряды летят от арбалета к точке клика.

#### Как работает:

**Создание снаряда**
```javascript
constructor(scene, startX, startY, targetX, targetY, damage) {
    // Вычисляем угол к цели
    const angle = Phaser.Math.Angle.Between(
        startX, startY,
        targetX, targetY
    );
    
    // Устанавливаем скорость по этому углу
    this.sprite.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
    );
}
```

**Коллизия с врагами**
```javascript
setupCollisions() {
    // Для каждого врага добавляем overlap
    this.scene.enemies.forEach(enemy => {
        this.scene.physics.add.overlap(
            this.sprite,
            enemy.sprite,
            () => {
                this.hit(enemy);  // Попадание!
            }
        );
    });
}
```

**След за снарядом**
```javascript
update() {
    // Каждые 50мс создаём точку следа
    if (this.scene.time.now % 50 < 20) {
        const trailDot = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            3, 0xffaa00, 0.5
        );
        // След исчезает через 300мс
    }
}
```

---

### 4️⃣ **Magic.js** - Магия

Три типа магии: огонь, лёд, молния.

#### Огненный шар (Area Damage)

```javascript
static useFireball(scene, x, y) {
    // Визуал взрыва
    const fireball = scene.add.circle(x, y, 20, 0xff6600);
    scene.tweens.add({
        targets: fireball,
        scale: 4,  // Расширяется
        alpha: 0,  // Исчезает
        duration: 500
    });
    
    // Урон всем в радиусе
    scene.enemies.forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(
            x, y, enemy.x, enemy.y
        );
        
        if (distance <= CONFIG.MAGIC.FIREBALL.radius) {
            enemy.takeDamage(CONFIG.MAGIC.FIREBALL.damage);
        }
    });
}
```

#### Заморозка (Crowd Control)

```javascript
static useFreeze(scene, x, y) {
    // Замораживает всех в радиусе
    scene.enemies.forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(
            x, y, enemy.x, enemy.y
        );
        
        if (distance <= CONFIG.MAGIC.FREEZE.radius) {
            enemy.freeze(CONFIG.MAGIC.FREEZE.duration);
        }
    });
}
```

#### Молния (Target Damage)

```javascript
static useLightning(scene) {
    // Находим 3 ближайших врага
    let targets = scene.enemies
        .filter(e => !e.isDead)
        .sort((a, b) => a.x - b.x)  // По близости к замку
        .slice(0, 3);
    
    // Бьём молнией каждого
    targets.forEach((target, index) => {
        setTimeout(() => {
            // Линия от верха к врагу
            const lightning = scene.add.line(
                target.x, 0,
                target.x, target.y,
                0xffff00
            );
            
            target.takeDamage(100);
        }, index * 100);  // С задержкой
    });
}
```

---

### 5️⃣ **GameScene.js** - Главная логика

#### Управление стрельбой

**Прицел следует за курсором**
```javascript
setupInput() {
    // Движение курсора
    this.input.on('pointermove', (pointer) => {
        this.crosshair.x = pointer.x;
        this.crosshair.y = pointer.y;
        
        // Линия от замка к курсору
        this.crossbowLine.setTo(
            CONFIG.CASTLE.x, CONFIG.CASTLE.y,
            pointer.x, pointer.y
        );
    });
    
    // Клик = выстрел
    this.input.on('pointerdown', (pointer) => {
        this.shoot(pointer.x, pointer.y);
    });
}
```

**Выстрел с перезарядкой**
```javascript
shoot(targetX, targetY) {
    const currentTime = this.time.now;
    
    // Проверка перезарядки
    if (currentTime - this.lastFireTime < this.crossbowFireRate) {
        return;  // Ещё не перезарядился
    }
    
    this.lastFireTime = currentTime;
    
    // Создаём снаряды (может быть несколько)
    for (let i = 0; i < this.crossbowMultiShot; i++) {
        const projectile = new Projectile(
            this,
            CONFIG.CASTLE.x + 30,
            CONFIG.CASTLE.y,
            targetX,
            targetY,
            this.crossbowDamage
        );
        
        this.projectiles.push(projectile);
    }
}
```

#### Система волн

```javascript
startWave() {
    const wave = CONFIG.WAVES[this.currentWave];
    
    let enemyIndex = 0;
    const spawnInterval = setInterval(() => {
        if (enemyIndex >= wave.enemies.length) {
            clearInterval(spawnInterval);
            this.currentWave++;
            return;
        }
        
        // Спавним врага
        const enemyType = wave.enemies[enemyIndex];
        const enemy = new Enemy(this, enemyType);
        this.enemies.push(enemy);
        
        enemyIndex++;
    }, wave.spawnDelay);  // Задержка между спавном
}
```

#### Game Loop

```javascript
update(time, delta) {
    // Обновляем всех врагов
    this.enemies.forEach(enemy => {
        enemy.update(time);
    });
    
    // Обновляем все снаряды
    this.projectiles.forEach(projectile => {
        projectile.update();
    });
    
    // Обновляем индикаторы перезарядки магии
    this.updateMagicCooldowns(time);
    
    // Проверяем конец волны
    if (this.enemies.length === 0) {
        // Следующая волна через 2 секунды
        this.time.delayedCall(2000, () => {
            this.startWave();
        });
    }
}
```

---

### 6️⃣ **UpgradeScene.js** - Улучшения

Пауза игры для покупки апгрейдов.

#### Расчёт стоимости улучшения

```javascript
// Каждый уровень дороже предыдущего
const cost = Math.floor(
    upgradeConfig.cost * 
    Math.pow(upgradeConfig.costMultiplier, upgradeConfig.level - 1)
);

// Пример:
// Уровень 1: 50 * 1.5^0 = 50
// Уровень 2: 50 * 1.5^1 = 75
// Уровень 3: 50 * 1.5^2 = 112
```

#### Применение улучшения

```javascript
purchaseUpgrade(upgradeType, cost, upgradeConfig) {
    // Проверяем золото
    if (this.gameScene.gold < cost) return;
    
    // Тратим
    this.gameScene.gold -= cost;
    upgradeConfig.level++;
    
    // Применяем эффект
    switch(upgradeType) {
        case 'damage':
            this.gameScene.crossbowDamage += 5;
            break;
        case 'fireRate':
            this.gameScene.crossbowFireRate -= 50;  // Быстрее!
            break;
        case 'multiShot':
            this.gameScene.crossbowMultiShot++;  // Больше стрел
            break;
    }
}
```

---

## 🎨 Как улучшить игру

### 1. Добавить нового врага

В `config.js`:
```javascript
ENEMIES: {
    // ... существующие ...
    
    DRAGON: {
        name: 'Дракон',
        hp: 500,
        speed: 30,
        reward: 200,
        damage: 30,
        size: 80,
        color: 0xff0000
    }
}
```

В волнах:
```javascript
{ 
    enemies: ['GOBLIN', 'ORC', 'DRAGON'],
    spawnDelay: 2000
}
```

### 2. Добавить новую магию

В `config.js`:
```javascript
MAGIC: {
    // ... существующие ...
    
    METEOR: {
        name: 'Метеорный дождь',
        damage: 30,
        count: 5,  // 5 метеоров
        cost: 2,
        cooldown: 6000,
        color: 0xff4500,
        icon: '☄️'
    }
}
```

В `Magic.js`:
```javascript
static useMeteor(scene) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = 200 + Math.random() * 400;
            const y = 100 + Math.random() * 300;
            
            // Визуал метеора
            const meteor = scene.add.circle(x, -50, 20, 0xff4500);
            
            scene.tweens.add({
                targets: meteor,
                y: y,
                duration: 500,
                onComplete: () => {
                    // Взрыв и урон
                    Magic.useFireball(scene, x, y);
                    meteor.destroy();
                }
            });
        }, i * 300);
    }
}
```

### 3. Добавить спецэффекты

**Частицы при выстреле:**
```javascript
shoot(targetX, targetY) {
    // ... код выстрела ...
    
    // Добавляем искры
    for (let i = 0; i < 5; i++) {
        const spark = this.add.circle(
            CONFIG.CASTLE.x + 30,
            CONFIG.CASTLE.y,
            3,
            0xffaa00
        );
        
        this.tweens.add({
            targets: spark,
            x: spark.x + (Math.random() - 0.5) * 30,
            y: spark.y + (Math.random() - 0.5) * 30,
            alpha: 0,
            duration: 300,
            onComplete: () => spark.destroy()
        });
    }
}
```

### 4. Добавить звуки

В `GameScene.preload()`:
```javascript
preload() {
    this.load.audio('shoot', 'assets/shoot.mp3');
    this.load.audio('hit', 'assets/hit.mp3');
    this.load.audio('magic', 'assets/magic.mp3');
}
```

При выстреле:
```javascript
shoot(targetX, targetY) {
    this.sound.play('shoot', { volume: 0.5 });
    // ...
}
```

### 5. Добавить настоящую графику

Замени круги на спрайты:

```javascript
// Вместо:
this.sprite = this.scene.add.circle(x, y, size, color);

// Используй:
this.sprite = this.scene.add.sprite(x, y, 'goblin_sprite');

// И загрузи в preload():
preload() {
    this.load.image('goblin_sprite', 'assets/goblin.png');
    this.load.image('orc_sprite', 'assets/orc.png');
    this.load.image('arrow_sprite', 'assets/arrow.png');
}
```

---

## 🚀 Публикация на Яндекс.Игры

### Шаг 1: Тестирование
- Пройди все 10 волн
- Проверь все улучшения
- Попробуй всю магию
- Проиграй и выиграй

### Шаг 2: Подготовка
- Создай иконку 512x512px
- Сделай 3-5 скриншотов геймплея
- Напиши описание

### Шаг 3: Архив
Запакуй все файлы в ZIP:
```
defender-shooter.zip
├── index.html
└── js/
    ├── config.js
    ├── Enemy.js
    ├── Projectile.js
    ├── Magic.js
    ├── GameScene.js
    ├── UpgradeScene.js
    └── game.js
```

### Шаг 4: Загрузка
1. Зайди на https://yandex.ru/dev/games/
2. Создай аккаунт
3. "Добавить игру"
4. Загрузи ZIP
5. Заполни данные
6. Отправь на модерацию

---

## 💰 Монетизация

### Где показывать рекламу:

**1. При старте игры (fullscreen)**
```javascript
// В game.js уже реализовано
showFullscreenAd();
```

**2. После game over**
```javascript
gameOver() {
    // ...
    showFullscreenAd();
}
```

**3. Бонус за просмотр (rewarded)**

В `GameScene.createUI()`:
```javascript
const bonusBtn = this.add.text(650, 15, '📺 +100💰', {
    fontSize: '20px',
    backgroundColor: '#2c3e50',
    padding: { x: 10, y: 5 }
});
bonusBtn.setInteractive();
bonusBtn.on('pointerdown', () => {
    showRewardedAd(() => {
        this.addGold(100);
    });
});
```

---

## 🎯 Советы по балансировке

### Начальные враги должны быть слабыми:
```javascript
GOBLIN: {
    hp: 15,    // 2-3 выстрела
    speed: 40  // Медленный
}
```

### Постепенное усложнение:
- Волны 1-3: только гоблины
- Волны 4-6: орки
- Волны 7-9: тролли
- Волна 10: босс

### Баланс золота:
- Начальное: 100 (хватит на 3-4 апгрейда)
- За гоблина: 10
- За босса: 150

### Магия:
- Огонь: частое использование (3сек перезарядка)
- Заморозка: тактическое (5сек)
- Молния: редкое мощное (4сек, но 2 кристалла)

---

## ✅ Чек-лист готовности

- [ ] Игра запускается без ошибок
- [ ] Можно пройти все 10 волн
- [ ] Все улучшения работают
- [ ] Вся магия работает
- [ ] SDK инициализируется
- [ ] Реклама показывается
- [ ] Есть иконка 512x512
- [ ] Есть скриншоты
- [ ] Описание готово

---

## 📚 Отличия от Tower Defense

| Tower Defense | Shooter Defense |
|--------------|-----------------|
| Расставляешь башни | Стреляешь сам |
| Стратегия | Аркада + реакция |
| Пассивная игра | Активная игра |
| Сложная сетка | Простое управление |
| Долгие партии | Быстрые сессии |

**Shooter проще для разработки:**
- ✅ Нет сетки размещения
- ✅ Нет множества типов башен
- ✅ Проще балансировка
- ✅ Понятнее для игроков
- ✅ Лучше для мобильных

---

## 🐛 Типичные проблемы

### Снаряды не попадают
**Решение:** Увеличь размер hitbox снаряда
```javascript
this.sprite.body.setCircle(8);  // Было 5
```

### Слишком легко/сложно
**Решение:** Настрой в `config.js`:
```javascript
// Легче
START_GOLD: 200,
CROSSBOW.baseDamage: 15,
GOBLIN.hp: 15

// Сложнее
START_GOLD: 50,
CROSSBOW.baseDamage: 8,
GOBLIN.hp: 30
```

### Магия не работает
**Решение:** Проверь кристаллы
```javascript
START_GEMS: 10,  // Больше для тестов
```

---

**Удачи с разработкой! 🚀**

Это намного проще чем tower defense, и будет отлично работать на Яндекс.Играх!
