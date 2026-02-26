/**
 * SOUNDMANAGER v5.0 — Только SFX, без музыки
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); this.initialized = true; }
        catch(e) { this.enabled = false; }
    }
    ensure() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    // Музыка отключена — заглушки
    startMusic() {}
    stopMusic() {}

    shoot(type) {
        this.ensure(); if(!this.ctx||!this.enabled) return;
        var t=this.ctx.currentTime, g=this.gain(this.volume*0.35);
        if(type==='CROSSBOW'){this.osc(700,'triangle',t,0.05,g);this.osc(350,'triangle',t+0.02,0.03,g);}
        else if(type==='CANNON'){this.noise(t,0.12,g,this.volume*0.4);this.osc(80,'sine',t,0.15,g);}
        else if(type==='PLASMA'){this.osc(550,'sawtooth',t,0.06,g);this.osc(800,'sine',t+0.02,0.04,g);}
        else if(type==='LASER'){this.osc(1100,'square',t,0.03,g);this.osc(700,'sine',t+0.01,0.02,g);}
    }

    hit() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.2); this.osc(180,'square',t,0.04,g); }
    crit() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.3); this.osc(500,'sawtooth',t,0.05,g);this.osc(800,'sawtooth',t+0.03,0.05,g); }

    enemyDeath(isBoss) {
        this.ensure(); if(!this.ctx||!this.enabled) return;
        var t=this.ctx.currentTime, g=this.gain(this.volume*(isBoss?0.5:0.25));
        if(isBoss){this.noise(t,0.2,g,this.volume*0.4);this.osc(150,'sawtooth',t,0.2,g);this.osc(80,'sine',t+0.1,0.2,g);}
        else{this.osc(250,'square',t,0.06,g);this.osc(120,'square',t+0.04,0.04,g);}
    }

    explosion() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.4); this.noise(t,0.18,g,this.volume*0.5);this.osc(60,'sine',t,0.18,g); }

    magic(type) {
        this.ensure(); if(!this.ctx||!this.enabled) return;
        var t=this.ctx.currentTime,g=this.gain(this.volume*0.35);
        if(type==='WIND'){this.noise(t,0.3,g,this.volume*0.25);this.osc(280,'sine',t,0.25,g);}
        else if(type==='FREEZE'){this.osc(1200,'sine',t,0.12,g);this.osc(1600,'sine',t+0.08,0.1,g);}
        else if(type==='LIGHTNING'){this.noise(t,0.1,g,this.volume*0.5);this.osc(100,'sawtooth',t,0.12,g);}
        else if(type==='HEAL'){this.osc(400,'sine',t,0.12,g);this.osc(550,'sine',t+0.1,0.12,g);this.osc(700,'sine',t+0.2,0.15,g);}
    }

    waveStart() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.3); this.osc(280,'triangle',t,0.12,g);this.osc(380,'triangle',t+0.1,0.12,g);this.osc(480,'triangle',t+0.2,0.15,g); }

    bossAppear() {
        this.ensure(); if(!this.ctx||!this.enabled) return;
        var t=this.ctx.currentTime,g=this.gain(this.volume*0.45);
        this.osc(90,'sawtooth',t,0.25,g);this.osc(70,'sawtooth',t+0.15,0.25,g);this.osc(55,'sawtooth',t+0.3,0.3,g);
    }

    purchase() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.25); this.osc(550,'sine',t,0.06,g);this.osc(750,'sine',t+0.06,0.08,g); }
    coinPickup() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.18); this.osc(1100,'sine',t,0.03,g);this.osc(1400,'sine',t+0.03,0.04,g); }
    summonSound() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.3); this.osc(180,'sine',t,0.15,g);this.osc(130,'sine',t+0.08,0.15,g); }

    gameOverSound() {
        this.ensure(); if(!this.ctx||!this.enabled) return;
        var t=this.ctx.currentTime,g=this.gain(this.volume*0.35);
        this.osc(350,'sawtooth',t,0.15,g);this.osc(260,'sawtooth',t+0.15,0.15,g);this.osc(180,'sawtooth',t+0.3,0.2,g);this.osc(90,'sine',t+0.45,0.3,g);
    }

    castleHit() { this.ensure(); if(!this.ctx||!this.enabled) return; var t=this.ctx.currentTime,g=this.gain(this.volume*0.3); this.osc(130,'square',t,0.08,g);this.noise(t,0.06,g,this.volume*0.25); }

    // Helpers
    gain(vol) { var g=this.ctx.createGain();g.gain.value=vol;g.connect(this.ctx.destination);return g; }
    osc(freq,type,startTime,duration,dest) {
        var o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type=type;o.frequency.value=freq;
        g.gain.setValueAtTime(0.3,startTime);
        g.gain.exponentialRampToValueAtTime(0.001,startTime+duration);
        o.connect(g);g.connect(dest);o.start(startTime);o.stop(startTime+duration+0.01);
    }
    noise(startTime,duration,dest,vol) {
        var bs=this.ctx.sampleRate*duration,buf=this.ctx.createBuffer(1,bs,this.ctx.sampleRate),data=buf.getChannelData(0);
        for(var i=0;i<bs;i++) data[i]=Math.random()*2-1;
        var src=this.ctx.createBufferSource();src.buffer=buf;
        var g=this.ctx.createGain();
        g.gain.setValueAtTime(vol||0.2,startTime);
        g.gain.exponentialRampToValueAtTime(0.001,startTime+duration);
        src.connect(g);g.connect(dest);src.start(startTime);src.stop(startTime+duration+0.01);
    }
}
window.sfx = new SoundManager();
