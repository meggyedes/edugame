// Storage utility for persistent game data using localStorage

import type { GameProgress, Photo, Language } from '../types/index.js';

const STORAGE_KEY = 'milo_van_zee_progress';

export class Storage {
    private static instance: Storage;

    private constructor() {}

    public static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }
        return Storage.instance;
    }

    public saveProgress(progress: GameProgress): void {
        try {
            const data = {
                ...progress,
                exploredAreas: Array.from(progress.exploredAreas),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    public loadProgress(): GameProgress | null {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return {
                    ...parsed,
                    exploredAreas: new Set(parsed.exploredAreas || []),
                };
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
        return null;
    }

    public getDefaultProgress(): GameProgress {
        return {
            totalPoints: 0,
            discoveredAnimals: [],
            photos: [],
            badges: [],
            exploredAreas: new Set<string>(),
            currentBiome: 'beach',
            language: 'nl',
            lastPlayed: Date.now(),
        };
    }

    public savePhoto(photo: Photo): void {
        try {
            const key = `photo_${photo.id}`;
            localStorage.setItem(key, JSON.stringify(photo));
        } catch (e) {
            console.error('Failed to save photo:', e);
        }
    }

    public loadPhotos(): Photo[] {
        const photos: Photo[] = [];
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
        } catch (e) {
            console.error('Failed to load photos:', e);
        }
        return photos.sort((a, b) => b.timestamp - a.timestamp);
    }

    public setLanguage(language: Language): void {
        try {
            localStorage.setItem('milo_language', language);
        } catch (e) {
            console.error('Failed to save language:', e);
        }
    }

    public getLanguage(): Language {
        try {
            const lang = localStorage.getItem('milo_language');
            if (lang === 'en' || lang === 'nl') {
                return lang;
            }
        } catch (e) {
            console.error('Failed to load language:', e);
        }
        return 'nl';
    }

    public get(key: string): string | null {
        try {
            return localStorage.getItem(`milo_${key}`);
        } catch (e) {
            console.error('Failed to get value:', e);
            return null;
        }
    }

    public set(key: string, value: string): void {
        try {
            localStorage.setItem(`milo_${key}`, value);
        } catch (e) {
            console.error('Failed to set value:', e);
        }
    }

    public clearProgress(): void {
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('milo_') || key?.startsWith('photo_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.error('Failed to clear progress:', e);
        }
    }
}

