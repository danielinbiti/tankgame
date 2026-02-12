/**
 * 音频管理器 - 使用 Web Audio API
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.initialized = false;
    }
    
    // 初始化音频上下文
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // 创建振荡器声音
    createOscillatorSound(frequency, type, duration, fadeOut = true) {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        if (fadeOut) {
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 射击音效
    playShoot() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // 爆炸音效
    playExplosion() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        // 使用噪声缓冲区创建爆炸声
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        // 低通滤波器让声音更闷
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        noise.start(this.audioContext.currentTime);
    }
    
    // 击中音效
    playHit() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        this.createOscillatorSound(400, 'square', 0.05);
    }
    
    // 移动音效（坦克履带声）
    playMove() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    // 开始游戏音效
    playStart() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const notes = [440, 554, 659, 880]; // A C# E A
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillatorSound(freq, 'square', 0.2);
            }, index * 100);
        });
    }
    
    // 游戏结束音效
    playGameOver() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const notes = [880, 659, 554, 440]; // A E C# A
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillatorSound(freq, 'sawtooth', 0.4);
            }, index * 200);
        });
    }
    
    // 过关音效
    playLevelComplete() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const notes = [523, 659, 783, 1046]; // C E G C
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillatorSound(freq, 'square', 0.15);
            }, index * 150);
        });
    }
    
    // 奖励音效
    playPowerUp() {
        if (!this.initialized || !this.sfxEnabled) return;
        
        const notes = [880, 1108, 1318]; // A C# E
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillatorSound(freq, 'square', 0.1);
            }, index * 80);
        });
    }
    
    // 暂停/恢复音频上下文
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // 设置音量
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Utils.clamp(volume, 0, 1);
        }
    }
    
    // 切换音效
    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
    
    // 切换音乐
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        return this.musicEnabled;
    }
}

// 导出到全局
window.AudioManager = AudioManager;
