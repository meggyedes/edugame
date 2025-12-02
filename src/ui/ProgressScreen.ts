// Progress screen showing player achievements

import type { GameProgress, Language } from '../types/index.js';
import { I18n } from '../i18n/translations.js';

export class ProgressScreen {
    private i18n: I18n;
    private progress: GameProgress | null = null;
    private canvasWidth: number;
    private canvasHeight: number;
    private backButtonBounds: { x: number; y: number; width: number; height: number };

    constructor(canvasWidth: number, canvasHeight: number) {
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.backButtonBounds = { x: 20, y: 20, width: 100, height: 35 };
    }

    public setProgress(progress: GameProgress): void {
        this.progress = progress;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#1a365d');
        gradient.addColorStop(1, '#2d5a87');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Back button
        this.renderBackButton(ctx);

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.i18n.t('progress'), this.canvasWidth / 2, 80);

        if (!this.progress) {
            ctx.fillStyle = '#FFF';
            ctx.font = '18px Arial';
            ctx.fillText('No progress data', this.canvasWidth / 2, this.canvasHeight / 2);
            ctx.textAlign = 'left';
            return;
        }

        // Stats
        const stats = [
            { icon: '⭐', label: this.i18n.t('total_points'), value: this.progress.totalPoints.toString() },
            { icon: '🦎', label: this.i18n.t('animals_found'), value: `${this.progress.discoveredAnimals.length}/14` },
            { icon: '📷', label: this.i18n.t('photos_collected'), value: this.progress.photos.length.toString() },
            { icon: '🏅', label: this.i18n.t('badges_earned'), value: this.progress.badges.length.toString() },
            { icon: '🗺️', label: this.i18n.t('explored_areas'), value: this.progress.exploredAreas.size.toString() },
        ];

        const startY = 140;
        const cardHeight = 60;
        const cardWidth = 300;
        const cardX = (this.canvasWidth - cardWidth) / 2;

        stats.forEach((stat, index) => {
            const y = startY + index * (cardHeight + 15);
            
            // Card background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(cardX, y, cardWidth, cardHeight);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.strokeRect(cardX, y, cardWidth, cardHeight);

            // Icon
            ctx.font = '28px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(stat.icon, cardX + 15, y + 40);

            // Label
            ctx.fillStyle = '#AAA';
            ctx.font = '14px Arial';
            ctx.fillText(stat.label, cardX + 60, y + 25);

            // Value
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 22px Arial';
            ctx.fillText(stat.value, cardX + 60, y + 48);
        });

        // Progress bar
        this.renderProgressBar(ctx, startY + stats.length * (cardHeight + 15) + 30);

        ctx.textAlign = 'left';
    }

    private renderBackButton(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(this.backButtonBounds.x, this.backButtonBounds.y, this.backButtonBounds.width, this.backButtonBounds.height);
        ctx.strokeStyle = '#81C784';
        ctx.strokeRect(this.backButtonBounds.x, this.backButtonBounds.y, this.backButtonBounds.width, this.backButtonBounds.height);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`← ${this.i18n.t('back')}`, this.backButtonBounds.x + this.backButtonBounds.width / 2, this.backButtonBounds.y + 23);
    }

    private renderProgressBar(ctx: CanvasRenderingContext2D, y: number): void {
        if (!this.progress) return;

        const barWidth = 300;
        const barHeight = 25;
        const barX = (this.canvasWidth - barWidth) / 2;

        // Calculate progress percentage
        const maxAnimals = 14;
        const percentage = (this.progress.discoveredAnimals.length / maxAnimals) * 100;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(barX, y, barWidth, barHeight);

        // Progress fill
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#81C784');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, y, (barWidth * percentage) / 100, barHeight);

        // Border
        ctx.strokeStyle = '#FFF';
        ctx.strokeRect(barX, y, barWidth, barHeight);

        // Percentage text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(percentage)}% Complete`, this.canvasWidth / 2, y + 17);
    }

    public handleClick(x: number, y: number): boolean {
        const b = this.backButtonBounds;
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    }

    public updateSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}

