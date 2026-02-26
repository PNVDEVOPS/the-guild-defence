# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Guild Defence** — a browser-based shooter/tower-defense game built with [Phaser 3](https://phaser.io/) targeting [Yandex Games](https://yandex.ru/dev/games/). The player fires weapons from a castle and defends against waves of enemies. No build tooling; all files are plain JS loaded via `<script>` tags.

## Running Locally

```bash
# Python (simplest)
python -m http.server 8000
# then open http://localhost:8000

# Or VS Code Live Server: right-click index.html → Open with Live Server
```

The game requires a local HTTP server (not `file://`) because assets are loaded via `fetch`/XHR. The `START_SERVER.bat` convenience script is Windows-only.

## Architecture

### Script Load Order (matters — no bundler)

Scripts are loaded in this order in `index.html`:
1. `js/config.js` — global `CONFIG` object (must be first)
2. `js/SoundManager.js` — global `SoundManager` class (Web Audio API)
3. `js/VFX.js` — global `VFX` class
4. `js/Enemy.js`
5. `js/Projectile.js`
6. `js/Magic.js` — static methods only
7. `js/UpgradeScene.js` — `Phaser.Scene` subclass
8. `js/GameScene.js` — `Phaser.Scene` subclass (main scene)
9. `js/game.js` — entry point, Yandex SDK init, `new Phaser.Game()`

### Key Systems

**`config.js`** — Single source of truth for all game balance:
- `CONFIG.WEAPONS` — 4 weapons (CROSSBOW, CANNON, PLASMA, LASER) with unlock waves and upgrade costs
- `CONFIG.AMMO_TYPES` — NORMAL / ELECTRIC / FIRE / ICE / MULTI with status effects
- `CONFIG.ENEMIES` — enemy stats, movement type (`straight`, `zigzag`, `dash`, `boss_fly`), special abilities (`canShoot`, `canHeal`, `splitsInto`)
- `CONFIG.MAGIC` — WIND / FREEZE / LIGHTNING / HEAL with hotkeys Q/W/E/R
- `CONFIG.WAVE_CONFIG` — procedural wave scaling (boss every 10 waves, mega-boss every 50)
- `CONFIG.SPRITES` / `CONFIG.IMAGES` — asset paths; all assets are **optional** — game falls back to emoji/shapes

**`GameScene.js`** — Main `Phaser.Scene`:
- Manages `this.enemies[]`, `this.projectiles[]`, `this.weaponStates{}`, `this.magicCooldowns{}`
- `create()` initialises all game state; `update()` runs the game loop
- Calls `this.scene.launch('UpgradeScene', { gameScene: this })` between waves
- Fires projectiles via click/touch (`pointerdown`); weapon state lives on the scene object

**`UpgradeScene.js`** — Overlay `Phaser.Scene` (pauses GameScene). Reads/writes `gameScene.weaponStates[weapon].upgrades` and `gameScene.gold`. Shows weapon tabs (only unlocked weapons active). Upgrade cost formula: `cost × mult^(level-1)`.

**`Enemy.js`** — Manages sprite, health bar, movement tweens, status effects (`isFrozen`, `isSlowed`, `isBurning`). Enemy types with `splitsInto` spawn children on death. Boss type `boss_fly` moves freely around the field; `SHOOTER` enemies fire back at the castle.

**`Projectile.js`** — Physics-based (Phaser arcade physics). Applies ammo-type effects on hit (chain lightning, burn DoT, slow, multi-shot spread).

**`VFX.js`** — Procedural pixel-style effects (no particle files required). Supports optional VFX spritesheets via `CONFIG.VFX_SPRITES`. Add custom VFX spritesheets in `sprites/vfx/` and register them in `CONFIG.VFX_SPRITES`.

**`SoundManager.js`** — Procedural sound via Web Audio API oscillators; no audio files needed. Music stubs are intentionally empty (`startMusic()`, `stopMusic()`).

**`game.js`** — Initialises Yandex Games SDK (`YaGames.init()`), stores `window.ysdk` and `window.yPlayer`. Exposes `showInterstitialAd(cb)` and `showRewardedAd(onRewarded, onClose)` globally. When SDK is absent (local dev), callbacks fire immediately.

### Asset Conventions

- Animated enemy sprites: spritesheets in `sprites/` — 64×64 frames (128×128 for bosses), 4 frames, registered in `CONFIG.SPRITES`
- Weapon sprites: `sprites/weapon_<NAME>.png` — 64×64, pointing right
- Projectile sprites: `sprites/proj_<NAME>.png` — 32×32, pointing right
- Magic icon sprites: `sprites/magic_<NAME>.png` — 32×32
- Fallback JPG images: `images/` folder — used when PNG spritesheets are absent
- Background/castle: `sprites/background.png`, `sprites/castle.png`

### Adding Content

**New enemy type:** Add entry to `CONFIG.ENEMIES` with `moveType` and optional special flags (`canShoot`, `canHeal`, `splitsInto`, `isBoss`). Add its sprite to `CONFIG.SPRITES` and `CONFIG.IMAGES`. Add to `CONFIG.WAVE_CONFIG.unlockWaves` and `spawnWeights` to include in procedural waves.

**New weapon:** Add to `CONFIG.WEAPONS` with `unlockWave`, `upgrades`, and `ammoType`. Add sprite paths to `CONFIG.WEAPON_SPRITES` and `CONFIG.PROJECTILE_SPRITES`. The weapon becomes selectable in UpgradeScene automatically once unlocked.

**New magic:** Add to `CONFIG.MAGIC` with a `hotkey`. Implement a static `use<NAME>(scene, x, y)` method in `Magic.js`. Wire it up in `GameScene.useMagic()`.

## Yandex Games SDK Notes

- The game must work without the SDK (local dev fallback is built in)
- `saveProgress(data)` calls `yPlayer.setData(data, true)` — call with serialisable game state only
- Interstitial ads fire every `CONFIG.ADS.interstitialEveryWaves` waves
- Rewarded ad bonuses are defined in `CONFIG.ADS.rewardedBonuses`
