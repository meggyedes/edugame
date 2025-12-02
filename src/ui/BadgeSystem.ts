// Badge System - Achievements and rewards for the player

import { I18n } from '../i18n/translations.js';
import { Storage } from '../utils/storage.js';
import { AudioManager } from '../utils/audio.js';

export interface Badge {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    icon: string;
    requirement: number;
    type: 'photos' | 'animals' | 'biomes' | 'distance' | 'exploration' | 'zone';
    unlocked: boolean;
    progress: number;
}

export class BadgeSystem {
    private i18n: I18n;
    private storage: Storage;
    private audio: AudioManager;
    private badges: Badge[];
    private showNotification: boolean = false;
    private notificationBadge: Badge | null = null;
    private notificationTimer: number = 0;
    private animationTimer: number = 0;

    constructor() {
        this.i18n = I18n.getInstance();
        this.storage = Storage.getInstance();
        this.audio = AudioManager.getInstance();
        this.badges = this.initializeBadges();
        this.loadProgress();
    }

    private initializeBadges(): Badge[] {
        return [
            // Photo badges
            {
                id: 'first_photo', name: { nl: 'Eerste Foto', en: 'First Photo' },
                description: { nl: 'Maak je eerste foto van een dier', en: 'Take your first photo of an animal' },
                icon: '📸', requirement: 1, type: 'photos', unlocked: false, progress: 0
            },
            {
                id: 'photographer', name: { nl: 'Fotograaf', en: 'Photographer' },
                description: { nl: 'Maak 5 foto\'s', en: 'Take 5 photos' },
                icon: '📷', requirement: 5, type: 'photos', unlocked: false, progress: 0
            },
            {
                id: 'pro_photographer', name: { nl: 'Pro Fotograaf', en: 'Pro Photographer' },
                description: { nl: 'Maak 15 foto\'s', en: 'Take 15 photos' },
                icon: '🎞️', requirement: 15, type: 'photos', unlocked: false, progress: 0
            },
            {
                id: 'master_photographer', name: { nl: 'Meester Fotograaf', en: 'Master Photographer' },
                description: { nl: 'Maak 30 foto\'s', en: 'Take 30 photos' },
                icon: '🏆', requirement: 30, type: 'photos', unlocked: false, progress: 0
            },

            // Animal discovery badges
            {
                id: 'curious', name: { nl: 'Nieuwsgierig', en: 'Curious' },
                description: { nl: 'Ontdek je eerste dier', en: 'Discover your first animal' },
                icon: '🔍', requirement: 1, type: 'animals', unlocked: false, progress: 0
            },
            {
                id: 'explorer', name: { nl: 'Ontdekker', en: 'Explorer' },
                description: { nl: 'Ontdek 5 verschillende dieren', en: 'Discover 5 different animals' },
                icon: '🧭', requirement: 5, type: 'animals', unlocked: false, progress: 0
            },
            {
                id: 'naturalist', name: { nl: 'Naturalist', en: 'Naturalist' },
                description: { nl: 'Ontdek 10 verschillende dieren', en: 'Discover 10 different animals' },
                icon: '🌿', requirement: 10, type: 'animals', unlocked: false, progress: 0
            },
            {
                id: 'wildlife_expert', name: { nl: 'Wildlife Expert', en: 'Wildlife Expert' },
                description: { nl: 'Ontdek 20 verschillende dieren', en: 'Discover 20 different animals' },
                icon: '🦁', requirement: 20, type: 'animals', unlocked: false, progress: 0
            },
            {
                id: 'animal_master', name: { nl: 'Dierenmeester', en: 'Animal Master' },
                description: { nl: 'Ontdek alle 26 dieren!', en: 'Discover all 26 animals!' },
                icon: '👑', requirement: 26, type: 'animals', unlocked: false, progress: 0
            },

            // Biome badges
            {
                id: 'beach_visitor', name: { nl: 'Strandbezoeker', en: 'Beach Visitor' },
                description: { nl: 'Bezoek het strand', en: 'Visit the beach' },
                icon: '🏖️', requirement: 1, type: 'biomes', unlocked: false, progress: 0
            },
            {
                id: 'jungle_explorer', name: { nl: 'Jungle Ontdekker', en: 'Jungle Explorer' },
                description: { nl: 'Bezoek de jungle', en: 'Visit the jungle' },
                icon: '🌴', requirement: 1, type: 'biomes', unlocked: false, progress: 0
            },
            {
                id: 'desert_adventurer', name: { nl: 'Woestijn Avonturier', en: 'Desert Adventurer' },
                description: { nl: 'Bezoek de woestijn', en: 'Visit the desert' },
                icon: '🏜️', requirement: 1, type: 'biomes', unlocked: false, progress: 0
            },
            {
                id: 'polar_explorer', name: { nl: 'Poolonderzoeker', en: 'Polar Explorer' },
                description: { nl: 'Bezoek de toendra', en: 'Visit the tundra' },
                icon: '❄️', requirement: 1, type: 'biomes', unlocked: false, progress: 0
            },
            {
                id: 'forest_ranger', name: { nl: 'Boswachter', en: 'Forest Ranger' },
                description: { nl: 'Bezoek het bos', en: 'Visit the forest' },
                icon: '🌲', requirement: 1, type: 'biomes', unlocked: false, progress: 0
            },
            {
                id: 'world_traveler', name: { nl: 'Wereldreiziger', en: 'World Traveler' },
                description: { nl: 'Bezoek alle biomen!', en: 'Visit all biomes!' },
                icon: '🌍', requirement: 5, type: 'biomes', unlocked: false, progress: 0
            },

            // Exploration badges
            {
                id: 'first_steps', name: { nl: 'Eerste Stappen', en: 'First Steps' },
                description: { nl: 'Begin je avontuur!', en: 'Start your adventure!' },
                icon: '👣', requirement: 1, type: 'exploration', unlocked: false, progress: 0
            },
            {
                id: 'wanderer', name: { nl: 'Zwerver', en: 'Wanderer' },
                description: { nl: 'Verken 25% van de wereld', en: 'Explore 25% of the world' },
                icon: '🚶', requirement: 25, type: 'exploration', unlocked: false, progress: 0
            },
            {
                id: 'adventurer', name: { nl: 'Avonturier', en: 'Adventurer' },
                description: { nl: 'Verken 50% van de wereld', en: 'Explore 50% of the world' },
                icon: '🏃', requirement: 50, type: 'exploration', unlocked: false, progress: 0
            },
            {
                id: 'completionist', name: { nl: 'Completionist', en: 'Completionist' },
                description: { nl: 'Verken 100% van de wereld!', en: 'Explore 100% of the world!' },
                icon: '🎯', requirement: 100, type: 'exploration', unlocked: false, progress: 0
            },

            // Zone badges - Adventure mode
            {
                id: 'jungle_master', name: { nl: 'Jungle Meester', en: 'Jungle Master' },
                description: { nl: 'Voltooi alle Jungle levels!', en: 'Complete all Jungle levels!' },
                icon: '🌴', requirement: 4, type: 'zone', unlocked: false, progress: 0
            },
            {
                id: 'desert_master', name: { nl: 'Woestijn Meester', en: 'Desert Master' },
                description: { nl: 'Voltooi alle Woestijn levels!', en: 'Complete all Desert levels!' },
                icon: '🏜️', requirement: 3, type: 'zone', unlocked: false, progress: 0
            },
            {
                id: 'arctic_master', name: { nl: 'Arctisch Meester', en: 'Arctic Master' },
                description: { nl: 'Voltooi alle Arctische levels!', en: 'Complete all Arctic levels!' },
                icon: '❄️', requirement: 3, type: 'zone', unlocked: false, progress: 0
            },
            {
                id: 'ocean_master', name: { nl: 'Oceaan Meester', en: 'Ocean Master' },
                description: { nl: 'Voltooi alle Oceaan levels!', en: 'Complete all Ocean levels!' },
                icon: '🌊', requirement: 4, type: 'zone', unlocked: false, progress: 0
            },
            {
                id: 'savannah_master', name: { nl: 'Savanne Meester', en: 'Savannah Master' },
                description: { nl: 'Voltooi alle Savanne levels!', en: 'Complete all Savannah levels!' },
                icon: '🦁', requirement: 4, type: 'zone', unlocked: false, progress: 0
            },
            {
                id: 'world_explorer', name: { nl: 'Wereld Ontdekker', en: 'World Explorer' },
                description: { nl: 'Voltooi alle 5 zones!', en: 'Complete all 5 zones!' },
                icon: '🌍', requirement: 5, type: 'zone', unlocked: false, progress: 0
            },
        ];
    }

    private loadProgress(): void {
        const savedBadges = this.storage.get('badges');
        if (savedBadges) {
            try {
                const parsed = JSON.parse(savedBadges);
                parsed.forEach((saved: { id: string; unlocked: boolean; progress: number }) => {
                    const badge = this.badges.find(b => b.id === saved.id);
                    if (badge) {
                        badge.unlocked = saved.unlocked;
                        badge.progress = saved.progress;
                    }
                });
            } catch (e) {
                console.error('Failed to load badge progress:', e);
            }
        }
    }

    private saveProgress(): void {
        const data = this.badges.map(b => ({
            id: b.id,
            unlocked: b.unlocked,
            progress: b.progress
        }));
        this.storage.set('badges', JSON.stringify(data));
    }

    public updateProgress(type: Badge['type'], value: number, specificBadgeId?: string): void {
        let newUnlocks = false;

        this.badges.forEach(badge => {
            if (badge.unlocked) return;

            if (specificBadgeId && badge.id === specificBadgeId) {
                badge.progress = value;
                if (badge.progress >= badge.requirement) {
                    badge.unlocked = true;
                    newUnlocks = true;
                    this.showBadgeNotification(badge);
                }
            } else if (!specificBadgeId && badge.type === type) {
                badge.progress = value;
                if (badge.progress >= badge.requirement) {
                    badge.unlocked = true;
                    newUnlocks = true;
                    this.showBadgeNotification(badge);
                }
            }
        });

        if (newUnlocks) {
            this.saveProgress();
        }
    }

    public checkBiomeBadge(biome: string): void {
        const biomeToId: Record<string, string> = {
            'beach': 'beach_visitor',
            'jungle': 'jungle_explorer',
            'desert': 'desert_adventurer',
            'tundra': 'polar_explorer',
            'forest': 'forest_ranger'
        };

        const badgeId = biomeToId[biome];
        if (badgeId) {
            const badge = this.badges.find(b => b.id === badgeId);
            if (badge && !badge.unlocked) {
                badge.progress = 1;
                badge.unlocked = true;
                this.showBadgeNotification(badge);
                this.saveProgress();

                // Check world traveler badge
                const biomeBadges = ['beach_visitor', 'jungle_explorer', 'desert_adventurer', 'polar_explorer', 'forest_ranger'];
                const unlockedBiomes = this.badges.filter(b => biomeBadges.includes(b.id) && b.unlocked).length;
                this.updateProgress('biomes', unlockedBiomes, 'world_traveler');
            }
        }
    }

    // Update zone completion badges
    public updateZoneBadge(zoneId: string, completedLevels: number): void {
        const zoneToId: Record<string, string> = {
            'jungle': 'jungle_master',
            'desert': 'desert_master',
            'arctic': 'arctic_master',
            'ocean': 'ocean_master',
            'savannah': 'savannah_master'
        };

        const badgeId = zoneToId[zoneId];
        if (badgeId) {
            const badge = this.badges.find(b => b.id === badgeId);
            if (badge && !badge.unlocked) {
                badge.progress = completedLevels;
                if (badge.progress >= badge.requirement) {
                    badge.unlocked = true;
                    this.showBadgeNotification(badge);
                    this.saveProgress();

                    // Check world explorer badge
                    const zoneMasterBadges = ['jungle_master', 'desert_master', 'arctic_master', 'ocean_master', 'savannah_master'];
                    const completedZones = this.badges.filter(b => zoneMasterBadges.includes(b.id) && b.unlocked).length;
                    
                    const worldExplorerBadge = this.badges.find(b => b.id === 'world_explorer');
                    if (worldExplorerBadge && !worldExplorerBadge.unlocked) {
                        worldExplorerBadge.progress = completedZones;
                        if (completedZones >= 5) {
                            worldExplorerBadge.unlocked = true;
                            this.showBadgeNotification(worldExplorerBadge);
                            this.saveProgress();
                        }
                    }
                }
            }
        }
    }

    private showBadgeNotification(badge: Badge): void {
        this.showNotification = true;
        this.notificationBadge = badge;
        this.notificationTimer = 4; // Show for 4 seconds
        this.audio.playBadgeUnlocked();
    }

    public update(deltaTime: number): void {
        this.animationTimer += deltaTime;

        if (this.showNotification && this.notificationTimer > 0) {
            this.notificationTimer -= deltaTime;
            if (this.notificationTimer <= 0) {
                this.showNotification = false;
                this.notificationBadge = null;
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        if (!this.showNotification || !this.notificationBadge) return;

        const badge = this.notificationBadge;
        const lang = this.i18n.getLanguage();

        // Animate entrance/exit
        let yOffset = 0;
        if (this.notificationTimer > 3.5) {
            // Slide in
            yOffset = (4 - this.notificationTimer) * 2 * 80 - 80;
        } else if (this.notificationTimer < 0.5) {
            // Slide out
            yOffset = (0.5 - this.notificationTimer) * 2 * -80;
        }

        const boxWidth = 280;
        const boxHeight = 80;
        const boxX = (width - boxWidth) / 2;
        const boxY = 20 + yOffset;

        ctx.save();

        // Glow effect
        const pulse = Math.sin(this.animationTimer * 4) * 0.2 + 0.8;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20 * pulse;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12);
        ctx.fill();

        // Gold border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Icon
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(badge.icon, boxX + 40, boxY + 52);

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'nl' ? '🎉 Badge Ontgrendeld!' : '🎉 Badge Unlocked!', boxX + 70, boxY + 28);

        // Badge name
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(badge.name[lang], boxX + 70, boxY + 48);

        // Description
        ctx.fillStyle = '#AAA';
        ctx.font = '11px Arial';
        ctx.fillText(badge.description[lang], boxX + 70, boxY + 66);

        ctx.restore();
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    public getBadges(): Badge[] {
        return this.badges;
    }

    public getUnlockedCount(): number {
        return this.badges.filter(b => b.unlocked).length;
    }

    public getTotalCount(): number {
        return this.badges.length;
    }

    public renderBadgePanel(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        const lang = this.i18n.getLanguage();
        const panelWidth = 600;
        const panelHeight = 450;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'nl' ? '🏆 Badges' : '🏆 Badges', width / 2, panelY + 35);

        // Progress
        ctx.fillStyle = '#AAA';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.getUnlockedCount()} / ${this.getTotalCount()} ${lang === 'nl' ? 'ontgrendeld' : 'unlocked'}`, width / 2, panelY + 55);

        // Badge grid
        const cols = 4;
        const badgeSize = 80;
        const spacing = 20;
        const startX = panelX + (panelWidth - (cols * badgeSize + (cols - 1) * spacing)) / 2;
        const startY = panelY + 80;

        this.badges.forEach((badge, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (badgeSize + spacing);
            const y = startY + row * (badgeSize + spacing);

            // Badge background
            ctx.fillStyle = badge.unlocked ? 'rgba(255, 215, 0, 0.2)' : 'rgba(100, 100, 100, 0.3)';
            this.roundRect(ctx, x, y, badgeSize, badgeSize, 10);
            ctx.fill();

            // Border
            ctx.strokeStyle = badge.unlocked ? '#FFD700' : '#555';
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y, badgeSize, badgeSize, 10);
            ctx.stroke();

            // Icon
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            if (badge.unlocked) {
                ctx.fillText(badge.icon, x + badgeSize / 2, y + 38);
            } else {
                ctx.fillStyle = '#555';
                ctx.fillText('🔒', x + badgeSize / 2, y + 38);
            }

            // Progress bar (if not unlocked)
            if (!badge.unlocked && badge.progress > 0) {
                const barWidth = badgeSize - 10;
                const progress = Math.min(badge.progress / badge.requirement, 1);
                
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 5, y + badgeSize - 12, barWidth, 6);
                
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 5, y + badgeSize - 12, barWidth * progress, 6);
            }

            // Name (small, below icon)
            ctx.fillStyle = badge.unlocked ? '#FFF' : '#777';
            ctx.font = '9px Arial';
            ctx.fillText(badge.name[lang].substring(0, 12), x + badgeSize / 2, y + badgeSize - 4);
        });

        ctx.textAlign = 'left';
    }
}
