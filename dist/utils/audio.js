// Simple Audio system using Web Audio API for sound effects
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.initAudioContext();
    }
    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    ensureContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    // Play a simple tone
    playTone(frequency, duration, type = 'sine', volume = 1) {
        if (!this.enabled || !this.audioContext)
            return;
        this.ensureContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        // Envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    // Play a sequence of notes
    playMelody(notes, type = 'sine') {
        if (!this.enabled || !this.audioContext)
            return;
        this.ensureContext();
        let time = this.audioContext.currentTime;
        notes.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(note.freq, time);
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, time + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, time + note.dur);
            oscillator.start(time);
            oscillator.stop(time + note.dur);
            time += note.dur * 0.8; // Slight overlap
        });
    }
    // === Sound Effects ===
    // Photo capture sound - camera click
    playPhotoCapture() {
        this.playTone(800, 0.05, 'square', 0.4);
        setTimeout(() => this.playTone(1200, 0.08, 'square', 0.3), 50);
    }
    // Animal discovered - happy melody
    playAnimalDiscovered() {
        this.playMelody([
            { freq: 523, dur: 0.1 }, // C5
            { freq: 659, dur: 0.1 }, // E5
            { freq: 784, dur: 0.15 }, // G5
            { freq: 1047, dur: 0.25 }, // C6
        ], 'sine');
    }
    // Badge unlocked - triumphant fanfare
    playBadgeUnlocked() {
        this.playMelody([
            { freq: 392, dur: 0.15 }, // G4
            { freq: 523, dur: 0.15 }, // C5
            { freq: 659, dur: 0.15 }, // E5
            { freq: 784, dur: 0.3 }, // G5
        ], 'triangle');
    }
    // Points earned - coin sound
    playPointsEarned() {
        this.playTone(987, 0.08, 'sine', 0.5);
        setTimeout(() => this.playTone(1318, 0.12, 'sine', 0.4), 60);
    }
    // Button click
    playButtonClick() {
        this.playTone(600, 0.05, 'square', 0.2);
    }
    // Menu hover
    playMenuHover() {
        this.playTone(400, 0.03, 'sine', 0.15);
    }
    // Camera mode on
    playCameraOn() {
        this.playMelody([
            { freq: 440, dur: 0.08 },
            { freq: 660, dur: 0.08 },
        ], 'sine');
    }
    // Camera mode off
    playCameraOff() {
        this.playMelody([
            { freq: 660, dur: 0.08 },
            { freq: 440, dur: 0.08 },
        ], 'sine');
    }
    // Footstep sound
    playFootstep() {
        if (!this.enabled || !this.audioContext)
            return;
        this.ensureContext();
        // Create noise for footstep
        const bufferSize = this.audioContext.sampleRate * 0.04;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 200 + Math.random() * 100;
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.value = this.masterVolume * 0.1;
        noise.start();
    }
    // Biome enter sound
    playBiomeEnter(biome) {
        const biomeNotes = {
            beach: [{ freq: 523, dur: 0.15 }, { freq: 659, dur: 0.2 }],
            jungle: [{ freq: 392, dur: 0.1 }, { freq: 440, dur: 0.1 }, { freq: 523, dur: 0.2 }],
            desert: [{ freq: 330, dur: 0.15 }, { freq: 392, dur: 0.2 }],
            tundra: [{ freq: 784, dur: 0.2 }, { freq: 659, dur: 0.15 }],
            forest: [{ freq: 440, dur: 0.12 }, { freq: 523, dur: 0.12 }, { freq: 659, dur: 0.2 }],
        };
        const notes = biomeNotes[biome] || biomeNotes.beach;
        this.playMelody(notes, 'triangle');
    }
    // Error/denied sound
    playError() {
        this.playTone(200, 0.15, 'sawtooth', 0.3);
    }
    // UI open sound
    playUIOpen() {
        this.playMelody([
            { freq: 300, dur: 0.05 },
            { freq: 450, dur: 0.08 },
        ], 'sine');
    }
    // UI close sound
    playUIClose() {
        this.playMelody([
            { freq: 450, dur: 0.05 },
            { freq: 300, dur: 0.08 },
        ], 'sine');
    }
    // Set master volume (0-1)
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    getVolume() {
        return this.masterVolume;
    }
    // Toggle audio on/off
    toggle() {
        this.enabled = !this.enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}
//# sourceMappingURL=audio.js.map