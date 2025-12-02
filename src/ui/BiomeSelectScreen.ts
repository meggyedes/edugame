// BiomeSelectScreen - Screen for selecting which biome/level to play
// Shows progress, locked/unlocked status, and completion percentage

import type { Language } from '../types/index.js';
import { I18n } from '../i18n/translations.js';
import { BIOME_LEVELS, type BiomeLevelData } from '../game/BiomeLevel.js';

export class BiomeSelectScreen {
    private i18n: I18n;
    private canvasWidth: number;
    private canvasHeight: number;
    
    // Selection
    private hoveredBiomeIndex: number = -1;
    private selectedBiomeId: string | null = null;
    
    // Biome progress (loaded from storage)
    private biomeProgress: Map<string, { unlocked: boolean; completed: boolean; percentage: number }> = new Map();
    
    // Animation
    private animationTimer: number = 0;
    
    // Mouse
    private mouseX: number = 0;
    private mouseY: number = 0;
    
    // Callbacks
    private onBiomeSelect: ((biomeId: string) => void) | null = null;
    private onBack: (() => void) | null = null;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.initializeProgress();
    }

    private initializeProgress(): void {
        // Initialize progress for each biome
        BIOME_LEVELS.forEach((biome, index) => {
            this.biomeProgress.set(biome.id, {
                unlocked: index === 0,  // Only first biome unlocked by default
                completed: false,
                percentage: 0
            });
        });
    }

    public setOnBiomeSelect(callback: (biomeId: string) => void): void {
        this.onBiomeSelect = callback;
    }

    public setOnBack(callback: () => void): void {
        this.onBack = callback;
    }

    public unlockBiome(biomeId: string): void {
        const progress = this.biomeProgress.get(biomeId);
        if (progress) progress.unlocked = true;
    }

    public updateBiomeProgress(biomeId: string, percentage: number, completed: boolean): void {
        const progress = this.biomeProgress.get(biomeId);
        if (progress) {
            progress.percentage = percentage;
            progress.completed = completed;
            
            // Unlock next biome if this one is completed
            if (completed) {
                const currentIndex = BIOME_LEVELS.findIndex(b => b.id === biomeId);
                if (currentIndex >= 0 && currentIndex < BIOME_LEVELS.length - 1) {
                    const nextBiome = BIOME_LEVELS[currentIndex + 1];
                    this.unlockBiome(nextBiome.id);
                }
            }
        }
    }

    public update(deltaTime: number, mouseX: number, mouseY: number): void {
        this.animationTimer += deltaTime;
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        // Check hover
        this.hoveredBiomeIndex = -1;
        const cardWidth = 180;
        const cardHeight = 220;
        const gap = 30;
        const totalWidth = BIOME_LEVELS.length * cardWidth + (BIOME_LEVELS.length - 1) * gap;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = (this.canvasHeight - cardHeight) / 2;

        for (let i = 0; i < BIOME_LEVELS.length; i++) {
            const cardX = startX + i * (cardWidth + gap);
            
            if (mouseX >= cardX && mouseX <= cardX + cardWidth &&
                mouseY >= startY && mouseY <= startY + cardHeight) {
                this.hoveredBiomeIndex = i;
                break;
            }
        }
    }

    public handleClick(x: number, y: number): boolean {
        const cardWidth = 180;
        const cardHeight = 220;
        const gap = 30;
        const totalWidth = BIOME_LEVELS.length * cardWidth + (BIOME_LEVELS.length - 1) * gap;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = (this.canvasHeight - cardHeight) / 2;

        // Check biome card clicks
        for (let i = 0; i < BIOME_LEVELS.length; i++) {
            const biome = BIOME_LEVELS[i];
            const progress = this.biomeProgress.get(biome.id);
            const cardX = startX + i * (cardWidth + gap);
            
            if (x >= cardX && x <= cardX + cardWidth &&
                y >= startY && y <= startY + cardHeight) {
                
                if (progress?.unlocked) {
                    this.selectedBiomeId = biome.id;
                    this.onBiomeSelect?.(biome.id);
                }
                return true;
            }
        }

        // Check back button
        const backBtnX = 50;
        const backBtnY = this.canvasHeight - 80;
        const backBtnWidth = 120;
        const backBtnHeight = 45;

        if (x >= backBtnX && x <= backBtnX + backBtnWidth &&
            y >= backBtnY && y <= backBtnY + backBtnHeight) {
            this.onBack?.();
            return true;
        }

        return false;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        const lang = this.i18n.getLanguage();

        // Background
        this.renderBackground(ctx);

        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 42px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'nl' ? '🌍 Kies een Bioom' : '🌍 Choose a Biome', this.canvasWidth / 2, 80);

        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillStyle = '#AAA';
        ctx.fillText(
            lang === 'nl' ? 'Ontdek dieren en verzamel foto\'s!' : 'Discover animals and collect photos!',
            this.canvasWidth / 2, 115
        );

        // Render biome cards
        this.renderBiomeCards(ctx, lang);

        // Back button
        this.renderBackButton(ctx, lang);

        // Total progress
        this.renderTotalProgress(ctx, lang);
    }

    private renderBackground(ctx: CanvasRenderingContext2D): void {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#1a3a4a');
        gradient.addColorStop(0.5, '#2d5a4a');
        gradient.addColorStop(1, '#1a3a4a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Decorative circles
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 20; i++) {
            const x = Math.sin(this.animationTimer + i) * 100 + (i * 100);
            const y = Math.cos(this.animationTimer + i) * 50 + (i % 5) * 150;
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x, y, 30 + Math.sin(this.animationTimer * 2 + i) * 10, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    private renderBiomeCards(ctx: CanvasRenderingContext2D, lang: string): void {
        const cardWidth = 180;
        const cardHeight = 220;
        const gap = 30;
        const totalWidth = BIOME_LEVELS.length * cardWidth + (BIOME_LEVELS.length - 1) * gap;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = (this.canvasHeight - cardHeight) / 2;

        BIOME_LEVELS.forEach((biome, index) => {
            const progress = this.biomeProgress.get(biome.id);
            const cardX = startX + index * (cardWidth + gap);
            const isHovered = this.hoveredBiomeIndex === index;
            const isLocked = !progress?.unlocked;

            this.renderBiomeCard(ctx, biome, progress, cardX, startY, cardWidth, cardHeight, isHovered, isLocked, lang);
        });
    }

    private renderBiomeCard(
        ctx: CanvasRenderingContext2D,
        biome: BiomeLevelData,
        progress: { unlocked: boolean; completed: boolean; percentage: number } | undefined,
        x: number, y: number, w: number, h: number,
        isHovered: boolean, isLocked: boolean, lang: string
    ): void {
        ctx.save();

        // Hover effect
        if (isHovered && !isLocked) {
            y -= 10;
            ctx.shadowColor = biome.backgroundColor;
            ctx.shadowBlur = 30;
        }

        // Card shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(ctx, x + 5, y + 5, w, h, 15);
        ctx.fill();

        // Card background
        ctx.fillStyle = isLocked ? '#333' : biome.backgroundColor;
        this.roundRect(ctx, x, y, w, h, 15);
        ctx.fill();

        // Dark overlay for locked
        if (isLocked) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.roundRect(ctx, x, y, w, h, 15);
            ctx.fill();
        }

        // Border
        ctx.strokeStyle = isLocked ? '#444' : (progress?.completed ? '#FFD700' : '#FFF');
        ctx.lineWidth = isHovered ? 4 : 2;
        this.roundRect(ctx, x, y, w, h, 15);
        ctx.stroke();

        // Biome icon
        const biomeIcons: Record<string, string> = {
            beach: '🏖️',
            forest: '🌲',
            jungle: '🌴',
            desert: '🏜️',
            arctic: '❄️'
        };
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.fillText(biomeIcons[biome.id] || '🌍', x + w / 2, y + 70);

        // Lock icon for locked biomes
        if (isLocked) {
            ctx.font = '30px Arial';
            ctx.fillText('🔒', x + w / 2, y + h / 2 + 10);
        }

        // Biome name
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.fillText(biome.name[lang as 'nl' | 'en'], x + w / 2, y + 110);

        // Progress bar (if unlocked)
        if (!isLocked && progress) {
            const barY = y + 135;
            const barWidth = w - 30;
            const barHeight = 12;

            // Bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.roundRect(ctx, x + 15, barY, barWidth, barHeight, 6);
            ctx.fill();

            // Bar fill
            const fillWidth = (progress.percentage / 100) * barWidth;
            if (fillWidth > 0) {
                ctx.fillStyle = progress.completed ? '#FFD700' : '#4CAF50';
                this.roundRect(ctx, x + 15, barY, fillWidth, barHeight, 6);
                ctx.fill();
            }

            // Percentage text
            ctx.font = '12px Arial';
            ctx.fillStyle = '#FFF';
            ctx.fillText(`${progress.percentage}%`, x + w / 2, barY + 28);
        }

        // Animal count
        ctx.font = '11px Arial';
        ctx.fillStyle = isLocked ? '#444' : '#DDD';
        ctx.fillText(
            `${biome.animals.length} ${lang === 'nl' ? 'dieren' : 'animals'}`,
            x + w / 2, y + h - 35
        );

        // Completion star
        if (progress?.completed) {
            ctx.font = '24px Arial';
            ctx.fillText('⭐', x + w - 25, y + 30);
        }

        ctx.restore();
    }

    private renderBackButton(ctx: CanvasRenderingContext2D, lang: string): void {
        const btnX = 50;
        const btnY = this.canvasHeight - 80;
        const btnWidth = 120;
        const btnHeight = 45;

        const isHovered = this.mouseX >= btnX && this.mouseX <= btnX + btnWidth &&
                          this.mouseY >= btnY && this.mouseY <= btnY + btnHeight;

        // Button
        ctx.fillStyle = isHovered ? '#5D4037' : '#3E2723';
        this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 10);
        ctx.fill();
        
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 10);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'nl' ? '← Terug' : '← Back', btnX + btnWidth / 2, btnY + 28);
    }

    private renderTotalProgress(ctx: CanvasRenderingContext2D, lang: string): void {
        // Calculate total progress
        let totalCompleted = 0;
        let totalUnlocked = 0;
        
        this.biomeProgress.forEach(progress => {
            if (progress.completed) totalCompleted++;
            if (progress.unlocked) totalUnlocked++;
        });

        const x = this.canvasWidth - 200;
        const y = this.canvasHeight - 80;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, x, y, 180, 50, 10);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            lang === 'nl' ? 'Voortgang' : 'Progress',
            x + 90, y + 20
        );
        
        ctx.font = '16px Arial';
        ctx.fillText(
            `${totalCompleted} / ${BIOME_LEVELS.length} ⭐`,
            x + 90, y + 40
        );
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

    public updateSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
