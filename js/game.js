/**
 * GAME.JS v5.1 — Fantasy Pixel Style
 */

// Глобальный шрифт — Press Start 2P (pixel font)
var FONT = "'Press Start 2P', monospace";

window.ysdk = null;
window.yPlayer = null;
window.gameProgress = null;

// Default progress structure
function defaultProgress() {
    return {
        unlockedLevels: [1],
        gems: 0,
        gold: 0,
        talents: {},
        ownedArtifacts: [],
        equippedArtifacts: [],
        bestWavePerLevel: {},
        ownedWeapons: ['CROSSBOW'],
        ownedMagic: ['WIND'],
        megaBossKills: 0,
        loadout: { weapons: ['CROSSBOW'], magic: ['WIND'] }
    };
}

function saveGameProgress() {
    var data = window.gameProgress || defaultProgress();
    // Always save to localStorage as primary storage
    try { localStorage.setItem('guildDefenceProgress', JSON.stringify(data)); } catch(e) {}
    // Also save to Yandex if available
    if (window.yPlayer) {
        try { window.yPlayer.setData(data, true); } catch(e) {}
    }
}

function loadGameProgress(callback) {
    // Try localStorage first (works locally and as fallback)
    var localData = null;
    try {
        var raw = localStorage.getItem('guildDefenceProgress');
        if (raw) localData = JSON.parse(raw);
    } catch(e) {}

    if (window.yPlayer) {
        // Try to get Yandex player data
        try {
            window.yPlayer.getData().then(function(data) {
                // Merge: prefer Yandex data if it has more progress
                var yd = data || {};
                var ld = localData || defaultProgress();
                // Use whichever has more gems (simple heuristic)
                var merged = (yd.gems || 0) >= (ld.gems || 0) ? yd : ld;
                if (!merged.unlockedLevels || merged.unlockedLevels.length === 0) merged.unlockedLevels = [1];
                window.gameProgress = merged;
                callback();
            }).catch(function() {
                window.gameProgress = localData || defaultProgress();
                callback();
            });
        } catch(e) {
            window.gameProgress = localData || defaultProgress();
            callback();
        }
    } else {
        window.gameProgress = localData || defaultProgress();
        callback();
    }
}

// Legacy alias
function saveProgress(data) { if (!window.yPlayer) return; try { window.yPlayer.setData(data, true); } catch(e) {} }

function showInterstitialAd(callback) {
    var cb = callback || function(){};
    if (!window.ysdk) { cb(); return; }
    try { window.ysdk.adv.showFullscreenAdv({ callbacks: { onClose: function(){cb();}, onError: function(){cb();} } }); } catch(e) { cb(); }
}

function showRewardedAd(onRewarded, onClose) {
    var reward = onRewarded || function(){};
    var close = onClose || function(){};
    if (!window.ysdk) { reward(); close(); return; }
    try { window.ysdk.adv.showRewardedVideo({ callbacks: { onRewarded: function(){reward();}, onClose: function(){close();}, onError: function(){close();} } }); } catch(e) { close(); }
}

function startGame() {
    var loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    var config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: CONFIG.GAME_WIDTH,
        height: CONFIG.GAME_HEIGHT,
        backgroundColor: '#1a0e0a',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        physics: { default: 'arcade', arcade: { debug: false } },
        scene: [MenuScene, GameScene],
        render: { antialias: false, pixelArt: true },
        input: { activePointers: 2 }
    };

    window.game = new Phaser.Game(config);
}

function updateLoader(percent, text) {
    var bar = document.getElementById('load-bar');
    var txt = document.getElementById('load-text');
    if (bar) bar.style.width = percent + '%';
    if (txt) txt.textContent = text;
}

window.addEventListener('load', function() {
    updateLoader(30, 'Init...');
    if (typeof YaGames !== 'undefined') {
        YaGames.init().then(function(ysdk) {
            window.ysdk = ysdk;
            updateLoader(50, 'SDK...');
            return ysdk.getPlayer({ scopes: false });
        }).then(function(player) {
            window.yPlayer = player;
            updateLoader(70, 'Loading save...');
            loadGameProgress(function() {
                updateLoader(95, 'Ready...');
                startGame();
                if (window.ysdk && window.ysdk.features && window.ysdk.features.LoadingAPI) window.ysdk.features.LoadingAPI.ready();
            });
        }).catch(function() {
            updateLoader(70, 'Loading save...');
            loadGameProgress(function() {
                updateLoader(95, 'No SDK...');
                startGame();
            });
        });
    } else {
        updateLoader(70, 'Loading save...');
        loadGameProgress(function() {
            updateLoader(95, 'Starting...');
            setTimeout(startGame, 200);
        });
    }
});
