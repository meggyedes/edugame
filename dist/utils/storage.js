// Storage utility for persistent game data using localStorage
const STORAGE_KEY = 'milo_van_zee_progress';
export class Storage {
    constructor() { }
    static getInstance() {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }
        return Storage.instance;
    }
    saveProgress(progress) {
        try {
            const data = {
                ...progress,
                exploredAreas: Array.from(progress.exploredAreas),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    loadProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return {
                    ...parsed,
                    exploredAreas: new Set(parsed.exploredAreas || []),
                };
            }
        }
        catch (e) {
            console.error('Failed to load progress:', e);
        }
        return null;
    }
    getDefaultProgress() {
        return {
            totalPoints: 0,
            discoveredAnimals: [],
            photos: [],
            badges: [],
            exploredAreas: new Set(),
            currentBiome: 'beach',
            language: 'nl',
            lastPlayed: Date.now(),
        };
    }
    savePhoto(photo) {
        try {
            const key = `photo_${photo.id}`;
            localStorage.setItem(key, JSON.stringify(photo));
        }
        catch (e) {
            console.error('Failed to save photo:', e);
        }
    }
    loadPhotos() {
        const photos = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('photo_')) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        photos.push(JSON.parse(data));
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to load photos:', e);
        }
        return photos.sort((a, b) => b.timestamp - a.timestamp);
    }
    setLanguage(language) {
        try {
            localStorage.setItem('milo_language', language);
        }
        catch (e) {
            console.error('Failed to save language:', e);
        }
    }
    getLanguage() {
        try {
            const lang = localStorage.getItem('milo_language');
            if (lang === 'en' || lang === 'nl') {
                return lang;
            }
        }
        catch (e) {
            console.error('Failed to load language:', e);
        }
        return 'nl';
    }
    get(key) {
        try {
            return localStorage.getItem(`milo_${key}`);
        }
        catch (e) {
            console.error('Failed to get value:', e);
            return null;
        }
    }
    set(key, value) {
        try {
            localStorage.setItem(`milo_${key}`, value);
        }
        catch (e) {
            console.error('Failed to set value:', e);
        }
    }
    clearProgress() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('milo_') || key?.startsWith('photo_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        catch (e) {
            console.error('Failed to clear progress:', e);
        }
    }
}
//# sourceMappingURL=storage.js.map