// HUD (Heads-Up Display) for showing game information

import type { Language, BiomeType } from '../types/index.js';
import { I18n } from '../i18n/translations.js';

interface MinimapData {
    playerX: number;
    playerY: number;
    worldWidth: number;
    worldHeight: number;
    exploredChunks: Set<string>;
}

export class HUD {
    private i18n: I18n;
    private points: number = 0;
    private animalsDiscovered: number = 0;
    private photosTaken: number = 0;
    private currentBiome: BiomeType = 'beach';
    private notification: { message: string; timer: number } | null = null;
    private showInteractionPrompt: boolean = false;
    private minimapData: MinimapData | null = null;
    private badgeCount: { unlocked: number; total: number } = { unlocked: 0, total: 18 };
    private pulseTimer: number = 0;

    constructor() {
        this.i18n = I18n.getInstance();
    }

    public update(deltaTime: number): void {
        this.pulseTimer += deltaTime;
        if (this.notification) {
            this.notification.timer -= deltaTime;
            if (this.notification.timer <= 0) {
                this.notification = null;
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        this.renderTopBar(ctx, canvasWidth);
        this.renderMinimap(ctx, canvasWidth);
        this.renderBiomeIndicator(ctx, canvasWidth);
        this.renderControlsHint(ctx, canvasWidth, canvasHeight);
        this.renderNotification(ctx, canvasWidth, canvasHeight);
        if (this.showInteractionPrompt) {
            this.renderInteractionPrompt(ctx, canvasWidth, canvasHeight);
        }
    }

    private renderTopBar(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 55);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, 55);

        // Stats container with icons
        const stats = [
            { icon: '⭐', value: this.points, label: this.i18n.t('points'), color: '#FFD700' },
            { icon: '🦎', value: this.animalsDiscovered, label: this.i18n.t('animals_discovered'), color: '#90EE90' },
            { icon: '📷', value: this.photosTaken, label: this.i18n.t('photos'), color: '#87CEEB' },
            { icon: '🏆', value: `${this.badgeCount.unlocked}/${this.badgeCount.total}`, label: 'Badges', color: '#FFB6C1' },
        ];

        let xPos = 15;
        stats.forEach(stat => {
            // Icon box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.roundRect(ctx, xPos, 8, 130, 38, 8);
            ctx.fill();

            // Border with glow
            ctx.strokeStyle = stat.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = stat.color;
            ctx.shadowBlur = 5;
            this.roundRect(ctx, xPos, 8, 130, 38, 8);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icon
            ctx.font = '20px Arial';
            ctx.fillText(stat.icon, xPos + 10, 34);

            // Value
            ctx.fillStyle = stat.color;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(String(stat.value), xPos + 40, 32);

            xPos += 145;
        });
    }

    private renderMinimap(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        if (!this.minimapData) return;

        const mapSize = 120;
        const mapX = canvasWidth - mapSize - 15;
        const mapY = 60;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.roundRect(ctx, mapX - 5, mapY - 5, mapSize + 10, mapSize + 10, 10);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        this.roundRect(ctx, mapX - 5, mapY - 5, mapSize + 10, mapSize + 10, 10);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MINIMAP', mapX + mapSize / 2, mapY - 10);
        ctx.textAlign = 'left';

        // Draw biomes
        const biomeColors: Record<string, string> = {
            beach: '#D4A574',
            jungle: '#2E7D32',
            desert: '#C9A961',
            tundra: '#B8D4E8',
            forest: '#4A7C4E',
        };

        // Beach (left edge)
        ctx.fillStyle = biomeColors.beach;
        ctx.fillRect(mapX, mapY, mapSize * 0.15, mapSize);

        // Jungle (top center)
        ctx.fillStyle = biomeColors.jungle;
        ctx.fillRect(mapX + mapSize * 0.15, mapY, mapSize * 0.35, mapSize * 0.4);

        // Desert (right side)
        ctx.fillStyle = biomeColors.desert;
        ctx.fillRect(mapX + mapSize * 0.5, mapY, mapSize * 0.5, mapSize * 0.5);

        // Tundra (bottom right)
        ctx.fillStyle = biomeColors.tundra;
        ctx.fillRect(mapX + mapSize * 0.5, mapY + mapSize * 0.5, mapSize * 0.5, mapSize * 0.5);

        // Forest (bottom center)
        ctx.fillStyle = biomeColors.forest;
        ctx.fillRect(mapX + mapSize * 0.15, mapY + mapSize * 0.4, mapSize * 0.35, mapSize * 0.6);

        // Draw explored areas overlay (fog of war effect)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        const chunkSizeX = mapSize / (this.minimapData.worldWidth / 320);
        const chunkSizeY = mapSize / (this.minimapData.worldHeight / 320);
        
        // Grid overlay for unexplored areas
        for (let x = 0; x < mapSize; x += chunkSizeX) {
            for (let y = 0; y < mapSize; y += chunkSizeY) {
                const worldX = Math.floor((x / mapSize) * this.minimapData.worldWidth / 320) * 320;
                const worldY = Math.floor((y / mapSize) * this.minimapData.worldHeight / 320) * 320;
                const chunkKey = `${Math.floor(worldX / 320)},${Math.floor(worldY / 320)}`;
                
                if (!this.minimapData.exploredChunks.has(chunkKey)) {
                    ctx.fillRect(mapX + x, mapY + y, chunkSizeX, chunkSizeY);
                }
            }
        }

        // Player position (pulsing dot)
        const playerMapX = mapX + (this.minimapData.playerX / this.minimapData.worldWidth) * mapSize;
        const playerMapY = mapY + (this.minimapData.playerY / this.minimapData.worldHeight) * mapSize;

        const pulse = Math.sin(this.pulseTimer * 4) * 2 + 6;

        // Outer glow
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, pulse + 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner dot
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Border dot
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    private renderBiomeIndicator(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        const biomeData: Record<BiomeType, { color: string; icon: string }> = {
            beach: { color: '#F5DEB3', icon: '🏖️' },
            jungle: { color: '#228B22', icon: '🌴' },
            rainforest: { color: '#1E7B1E', icon: '🌿' },
            desert: { color: '#DEB887', icon: '🏜️' },
            tundra: { color: '#E0FFFF', icon: '❄️' },
            arctic: { color: '#B0E0E6', icon: '🧊' },
            ocean: { color: '#4169E1', icon: '🌊' },
            coral_reef: { color: '#FF7F50', icon: '🐠' },
            deep_ocean: { color: '#191970', icon: '🐋' },
            savannah: { color: '#DAA520', icon: '🦁' },
            forest: { color: '#2E8B57', icon: '🌲' },
            wetland: { color: '#6B8E23', icon: '🐸' },
            mountain: { color: '#708090', icon: '🏔️' },
        };

        const data = biomeData[this.currentBiome];
        const boxWidth = 130;
        const boxX = canvasWidth - boxWidth - 15;
        const boxY = 190;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, boxX, boxY, boxWidth, 40, 8);
        ctx.fill();

        // Colored indicator
        ctx.fillStyle = data.color;
        ctx.fillRect(boxX + 5, boxY + 5, 30, 30);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 5, boxY + 5, 30, 30);

        // Icon
        ctx.font = '20px Arial';
        ctx.fillText(data.icon, boxX + 10, boxY + 28);

        // Biome name
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.i18n.t(this.currentBiome), boxX + 42, boxY + 25);
    }

    private renderControlsHint(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        const hints = [
            { key: 'WASD', action: 'Move' },
            { key: 'C', action: 'Camera' },
            { key: 'M', action: 'Map' },
            { key: 'B', action: 'Bag' },
            { key: 'T', action: 'Badges' },
        ];

        const startX = 15;
        const startY = canvasHeight - 35;
        let xPos = startX;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.roundRect(ctx, startX - 5, startY - 18, 380, 30, 6);
        ctx.fill();

        hints.forEach((hint, index) => {
            // Key box
            ctx.fillStyle = '#444';
            this.roundRect(ctx, xPos, startY - 15, 35, 22, 4);
            ctx.fill();
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            this.roundRect(ctx, xPos, startY - 15, 35, 22, 4);
            ctx.stroke();

            // Key text
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(hint.key, xPos + 17.5, startY + 2);
            ctx.textAlign = 'left';

            // Action text
            ctx.fillStyle = '#AAA';
            ctx.font = '10px Arial';
            ctx.fillText(hint.action, xPos + 40, startY + 2);

            xPos += 75;
        });
    }

    private renderNotification(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        if (!this.notification) return;

        const alpha = Math.min(1, this.notification.timer);
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const textWidth = ctx.measureText(this.notification.message).width;
        const boxWidth = Math.max(textWidth + 60, 200);
        const boxX = (canvasWidth - boxWidth) / 2;
        const boxY = 120;

        // Glow effect
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15;

        // Background
        ctx.fillStyle = 'rgba(0, 100, 0, 0.9)';
        this.roundRect(ctx, boxX, boxY, boxWidth, 50, 10);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = '#90EE90';
        ctx.lineWidth = 2;
        this.roundRect(ctx, boxX, boxY, boxWidth, 50, 10);
        ctx.stroke();

        // Icon
        ctx.font = '24px Arial';
        ctx.fillText('✨', boxX + 15, boxY + 35);

        // Message
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.notification.message, canvasWidth / 2, boxY + 32);
        
        ctx.restore();
        ctx.textAlign = 'left';
    }

    private renderInteractionPrompt(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        const text = this.i18n.t('press_action');
        
        const boxWidth = 280;
        const boxX = (canvasWidth - boxWidth) / 2;
        const boxY = canvasHeight - 90;

        // Pulsing effect
        const pulse = Math.sin(this.pulseTimer * 3) * 0.2 + 0.8;

        ctx.save();
        ctx.globalAlpha = pulse;

        // Background
        ctx.fillStyle = 'rgba(0, 100, 200, 0.8)';
        this.roundRect(ctx, boxX, boxY, boxWidth, 45, 10);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        this.roundRect(ctx, boxX, boxY, boxWidth, 45, 10);
        ctx.stroke();

        ctx.globalAlpha = 1;

        // Icon
        ctx.font = '22px Arial';
        ctx.fillText('💡', boxX + 15, boxY + 32);

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvasWidth / 2 + 10, boxY + 28);

        // Key hint
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('[SPACE / E]', canvasWidth / 2 + 10, boxY + 42);
        
        ctx.restore();
        ctx.textAlign = 'left';
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

    public setPoints(points: number): void {
        this.points = points;
    }

    public setAnimalsDiscovered(count: number): void {
        this.animalsDiscovered = count;
    }

    public setPhotosTaken(count: number): void {
        this.photosTaken = count;
    }

    public setCurrentBiome(biome: BiomeType): void {
        this.currentBiome = biome;
    }

    public showNotification(message: string, duration: number = 3): void {
        this.notification = { message, timer: duration };
    }

    public setShowInteractionPrompt(show: boolean): void {
        this.showInteractionPrompt = show;
    }

    public setMinimapData(playerX: number, playerY: number, worldWidth: number, worldHeight: number, exploredChunks: Set<string>): void {
        this.minimapData = { playerX, playerY, worldWidth, worldHeight, exploredChunks };
    }

    public setBadgeCount(unlocked: number, total: number): void {
        this.badgeCount = { unlocked, total };
    }
}

