// Photo Backgrounds - Pixel art style backgrounds for camera view

export type BackgroundType = 'jungle' | 'desert' | 'arctic' | 'ocean' | 'savannah' | 'forest' | 'beach';

export class PhotoBackgrounds {
    private static instance: PhotoBackgrounds;
    private backgrounds: Map<BackgroundType, HTMLCanvasElement> = new Map();
    private readonly WIDTH = 400;
    private readonly HEIGHT = 300;

    private constructor() {
        this.generateAllBackgrounds();
    }

    public static getInstance(): PhotoBackgrounds {
        if (!PhotoBackgrounds.instance) {
            PhotoBackgrounds.instance = new PhotoBackgrounds();
        }
        return PhotoBackgrounds.instance;
    }

    private generateAllBackgrounds(): void {
        this.backgrounds.set('jungle', this.createJungleBackground());
        this.backgrounds.set('desert', this.createDesertBackground());
        this.backgrounds.set('arctic', this.createArcticBackground());
        this.backgrounds.set('ocean', this.createOceanBackground());
        this.backgrounds.set('savannah', this.createSavannahBackground());
        this.backgrounds.set('forest', this.createForestBackground());
        this.backgrounds.set('beach', this.createBeachBackground());
    }

    public getBackground(type: BackgroundType): HTMLCanvasElement {
        return this.backgrounds.get(type) || this.backgrounds.get('jungle')!;
    }

    // ==================== JUNGLE BACKGROUND ====================
    private createJungleBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sky gradient through trees
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
        skyGradient.addColorStop(0, '#1a472a');
        skyGradient.addColorStop(0.3, '#2d5a3f');
        skyGradient.addColorStop(0.6, '#1a3d2a');
        skyGradient.addColorStop(1, '#0d1f15');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Distant trees (background layer)
        for (let i = 0; i < 8; i++) {
            const x = i * 55 - 20;
            this.drawPixelTree(ctx, x, 80, '#1a3d2a', 0.7);
        }

        // Sun rays through canopy
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(80 + i * 70, 0);
            ctx.lineTo(60 + i * 70, this.HEIGHT);
            ctx.lineTo(100 + i * 70, this.HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Mid-layer trees
        for (let i = 0; i < 6; i++) {
            const x = i * 75 - 10;
            this.drawPixelTree(ctx, x, 120, '#228B22', 0.9);
        }

        // Ferns and bushes
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * this.WIDTH;
            const y = 200 + Math.random() * 60;
            this.drawPixelFern(ctx, x, y);
        }

        // Vines
        for (let i = 0; i < 4; i++) {
            const x = 50 + i * 100;
            this.drawPixelVine(ctx, x, 0, 150);
        }

        // Flowers
        const flowerColors = ['#FF6B6B', '#FFD93D', '#FF69B4', '#9B59B6'];
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.WIDTH;
            const y = 220 + Math.random() * 50;
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)]!;
            this.drawPixelFlower(ctx, x, y);
        }

        // Foreground leaves (frame)
        this.drawJungleFrame(ctx);

        return canvas;
    }

    private drawPixelTree(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number): void {
        const s = scale * 4; // pixel size
        ctx.fillStyle = '#4A3728';
        // Trunk
        for (let py = 0; py < 15; py++) {
            ctx.fillRect(x + 8 * s, y + py * s, 4 * s, s);
        }
        // Foliage
        ctx.fillStyle = color;
        for (let py = -8; py < 4; py++) {
            for (let px = -6; px < 7; px++) {
                if (Math.abs(px) + Math.abs(py) < 9 + Math.random() * 2) {
                    ctx.fillRect(x + (10 + px) * s, y + py * s, s, s);
                }
            }
        }
    }

    private drawPixelFern(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * 0.4;
            for (let j = 0; j < 8; j++) {
                const px = x + Math.sin(angle) * j * 4;
                const py = y - j * 3;
                ctx.fillRect(px, py, 4, 4);
                if (j > 2) {
                    ctx.fillRect(px - 4, py + 2, 4, 3);
                    ctx.fillRect(px + 4, py + 2, 4, 3);
                }
            }
        }
    }

    private drawPixelVine(ctx: CanvasRenderingContext2D, x: number, startY: number, length: number): void {
        ctx.fillStyle = '#228B22';
        for (let y = startY; y < startY + length; y += 4) {
            const offset = Math.sin(y * 0.1) * 8;
            ctx.fillRect(x + offset, y, 4, 4);
            if (y % 20 === 0) {
                ctx.fillRect(x + offset + 4, y, 8, 6);
            }
        }
    }

    private drawPixelFlower(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Petals
        const offsets = [[-4, 0], [4, 0], [0, -4], [0, 4]];
        offsets.forEach(([ox, oy]) => {
            ctx.fillRect(x + ox!, y + oy!, 4, 4);
        });
        // Center
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x, y, 4, 4);
    }

    private drawJungleFrame(ctx: CanvasRenderingContext2D): void {
        // Large leaves at corners
        ctx.fillStyle = '#228B22';
        // Top left
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(0, i * 8, 40 - i * 6, 8);
        }
        // Top right
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(this.WIDTH - 40 + i * 6, i * 8, 40 - i * 6, 8);
        }
        // Bottom corners
        ctx.fillStyle = '#1a472a';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(0, this.HEIGHT - 30 + i * 8, 30 - i * 6, 8);
            ctx.fillRect(this.WIDTH - 30 + i * 6, this.HEIGHT - 30 + i * 8, 30 - i * 6, 8);
        }
    }

    // ==================== DESERT BACKGROUND ====================
    private createDesertBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT * 0.5);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.7, '#F4D03F');
        skyGradient.addColorStop(1, '#EDC9AF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(320, 50, 30, 0, Math.PI * 2);
        ctx.fill();

        // Distant dunes
        ctx.fillStyle = '#D4A84B';
        this.drawPixelDune(ctx, -50, 120, 200);
        this.drawPixelDune(ctx, 100, 140, 180);
        this.drawPixelDune(ctx, 280, 110, 220);

        // Sand ground
        const sandGradient = ctx.createLinearGradient(0, 150, 0, this.HEIGHT);
        sandGradient.addColorStop(0, '#EDC9AF');
        sandGradient.addColorStop(1, '#DAA520');
        ctx.fillStyle = sandGradient;
        ctx.fillRect(0, 150, this.WIDTH, this.HEIGHT - 150);

        // Cacti
        this.drawPixelCactus(ctx, 50, 200);
        this.drawPixelCactus(ctx, 320, 180);
        this.drawPixelCactus(ctx, 180, 220);

        // Rocks
        this.drawPixelRock(ctx, 280, 250, '#8B7355');
        this.drawPixelRock(ctx, 100, 260, '#A0522D');

        // Sand details (small dots)
        ctx.fillStyle = '#E6C87A';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.WIDTH;
            const y = 180 + Math.random() * 100;
            ctx.fillRect(x, y, 2, 2);
        }

        return canvas;
    }

    private drawPixelDune(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
        for (let i = 0; i < width; i += 4) {
            const height = Math.sin((i / width) * Math.PI) * 60;
            ctx.fillRect(x + i, y - height, 4, height + 200);
        }
    }

    private drawPixelCactus(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#228B22';
        // Main body
        for (let py = 0; py < 50; py += 4) {
            ctx.fillRect(x, y - py, 16, 4);
        }
        // Left arm
        ctx.fillRect(x - 16, y - 30, 16, 4);
        for (let py = 0; py < 20; py += 4) {
            ctx.fillRect(x - 16, y - 30 - py, 4, 4);
        }
        // Right arm
        ctx.fillRect(x + 16, y - 20, 16, 4);
        for (let py = 0; py < 16; py += 4) {
            ctx.fillRect(x + 28, y - 20 - py, 4, 4);
        }
    }

    private drawPixelRock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        ctx.fillStyle = color;
        const shape = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
        ];
        shape.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) ctx.fillRect(x + px * 6, y + py * 6, 6, 6);
            });
        });
    }

    // ==================== ARCTIC BACKGROUND ====================
    private createArcticBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sky gradient with aurora
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
        skyGradient.addColorStop(0, '#1a1a3e');
        skyGradient.addColorStop(0.3, '#4a6fa5');
        skyGradient.addColorStop(0.5, '#87CEEB');
        skyGradient.addColorStop(1, '#E0FFFF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Aurora borealis
        this.drawPixelAurora(ctx);

        // Distant mountains/icebergs
        ctx.fillStyle = '#B0E0E6';
        this.drawPixelMountain(ctx, 0, 100, 120);
        this.drawPixelMountain(ctx, 150, 80, 100);
        this.drawPixelMountain(ctx, 300, 90, 130);

        // Snow ground
        ctx.fillStyle = '#FFFAFA';
        ctx.fillRect(0, 180, this.WIDTH, this.HEIGHT - 180);

        // Ice formations
        this.drawPixelIce(ctx, 80, 200);
        this.drawPixelIce(ctx, 280, 190);

        // Snow mounds
        ctx.fillStyle = '#F0F8FF';
        this.drawPixelSnowMound(ctx, 50, 250);
        this.drawPixelSnowMound(ctx, 200, 260);
        this.drawPixelSnowMound(ctx, 320, 240);

        // Snowflakes
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.WIDTH;
            const y = Math.random() * this.HEIGHT;
            ctx.fillRect(x, y, 3, 3);
        }

        return canvas;
    }

    private drawPixelAurora(ctx: CanvasRenderingContext2D): void {
        const colors = ['#00FF7F', '#9370DB', '#00CED1'];
        colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            for (let x = 0; x < this.WIDTH; x += 4) {
                const y = 30 + i * 20 + Math.sin(x * 0.05 + i) * 15;
                const height = 20 + Math.sin(x * 0.03) * 10;
                ctx.fillRect(x, y, 4, height);
            }
        });
        ctx.globalAlpha = 1;
    }

    private drawPixelMountain(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
        for (let i = 0; i < width; i += 4) {
            const progress = i / width;
            const height = progress < 0.5 
                ? progress * 2 * 80 
                : (1 - progress) * 2 * 80;
            ctx.fillRect(x + i, y + 80 - height, 4, height + 100);
        }
        // Snow cap
        ctx.fillStyle = '#FFFFFF';
        for (let i = width * 0.3; i < width * 0.7; i += 4) {
            const progress = (i - width * 0.3) / (width * 0.4);
            const height = (1 - Math.abs(progress - 0.5) * 2) * 20;
            ctx.fillRect(x + i, y + 80 - height - 60, 4, height);
        }
    }

    private drawPixelIce(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#E0FFFF';
        const shape = [
            [0, 0, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 0],
        ];
        shape.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    ctx.fillRect(x + px * 8, y + py * 8, 8, 8);
                }
            });
        });
        // Highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 8, y + 8, 8, 8);
    }

    private drawPixelSnowMound(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        for (let i = 0; i < 60; i += 4) {
            const height = Math.sin((i / 60) * Math.PI) * 20;
            ctx.fillRect(x + i, y - height, 4, height + 50);
        }
    }

    // ==================== OCEAN BACKGROUND ====================
    private createOceanBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Underwater gradient
        const waterGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
        waterGradient.addColorStop(0, '#006994');
        waterGradient.addColorStop(0.3, '#1E90FF');
        waterGradient.addColorStop(0.7, '#4169E1');
        waterGradient.addColorStop(1, '#191970');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Light rays
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#87CEEB';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(50 + i * 70, 0);
            ctx.lineTo(30 + i * 70, this.HEIGHT);
            ctx.lineTo(70 + i * 70, this.HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Coral reef
        this.drawPixelCoral(ctx, 30, 240, '#FF6B6B');
        this.drawPixelCoral(ctx, 100, 260, '#FF69B4');
        this.drawPixelCoral(ctx, 300, 250, '#FFA07A');
        this.drawPixelCoral(ctx, 350, 270, '#FF7F50');

        // Seaweed
        this.drawPixelSeaweed(ctx, 60, this.HEIGHT);
        this.drawPixelSeaweed(ctx, 180, this.HEIGHT);
        this.drawPixelSeaweed(ctx, 280, this.HEIGHT);
        this.drawPixelSeaweed(ctx, 370, this.HEIGHT);

        // Sandy bottom
        ctx.fillStyle = '#F4D03F';
        ctx.fillRect(0, this.HEIGHT - 30, this.WIDTH, 30);

        // Shells
        this.drawPixelShell(ctx, 150, this.HEIGHT - 20);
        this.drawPixelShell(ctx, 250, this.HEIGHT - 15);

        // Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.WIDTH;
            const y = Math.random() * this.HEIGHT;
            const size = 4 + Math.random() * 8;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas;
    }

    private drawPixelCoral(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        ctx.fillStyle = color;
        for (let branch = 0; branch < 4; branch++) {
            const angle = (branch - 1.5) * 0.4;
            for (let i = 0; i < 8; i++) {
                const px = x + Math.sin(angle) * i * 5 + branch * 12;
                const py = y - i * 6;
                ctx.fillRect(px, py, 6, 6);
            }
        }
    }

    private drawPixelSeaweed(ctx: CanvasRenderingContext2D, x: number, bottomY: number): void {
        ctx.fillStyle = '#228B22';
        for (let y = bottomY; y > bottomY - 100; y -= 4) {
            const offset = Math.sin((bottomY - y) * 0.1) * 10;
            ctx.fillRect(x + offset, y, 6, 4);
        }
    }

    private drawPixelShell(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(x, y, 12, 8);
        ctx.fillRect(x + 2, y - 4, 8, 4);
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x + 4, y + 2, 4, 4);
    }

    // ==================== SAVANNAH BACKGROUND ====================
    private createSavannahBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sunset sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT * 0.5);
        skyGradient.addColorStop(0, '#FF6B35');
        skyGradient.addColorStop(0.3, '#F7C59F');
        skyGradient.addColorStop(0.6, '#FFE66D');
        skyGradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(300, 80, 40, 0, Math.PI * 2);
        ctx.fill();

        // Distant hills
        ctx.fillStyle = '#BDB76B';
        this.drawPixelHill(ctx, 0, 130, 150);
        this.drawPixelHill(ctx, 120, 140, 180);
        this.drawPixelHill(ctx, 280, 120, 160);

        // Grass ground
        const grassGradient = ctx.createLinearGradient(0, 150, 0, this.HEIGHT);
        grassGradient.addColorStop(0, '#DAA520');
        grassGradient.addColorStop(1, '#D2B48C');
        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, 150, this.WIDTH, this.HEIGHT - 150);

        // Acacia trees
        this.drawPixelAcacia(ctx, 80, 180);
        this.drawPixelAcacia(ctx, 300, 160);

        // Tall grass
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * this.WIDTH;
            const y = 200 + Math.random() * 80;
            this.drawPixelTallGrass(ctx, x, y);
        }

        // Termite mound
        this.drawPixelTermiteMound(ctx, 200, 250);

        return canvas;
    }

    private drawPixelHill(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
        for (let i = 0; i < width; i += 4) {
            const height = Math.sin((i / width) * Math.PI) * 40;
            ctx.fillRect(x + i, y - height, 4, height + 150);
        }
    }

    private drawPixelAcacia(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 20, y, 8, 60);
        
        // Flat canopy
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(x, y - 20, 50, 12);
        ctx.fillRect(x - 10, y - 12, 70, 8);
        ctx.fillRect(x + 5, y - 28, 40, 8);
    }

    private drawPixelTallGrass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#DAA520';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + i * 3, y - 15 - Math.random() * 10, 2, 20);
        }
    }

    private drawPixelTermiteMound(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#A0522D';
        const shape = [
            [0, 0, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
        ];
        shape.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) ctx.fillRect(x + px * 6, y + py * 6, 6, 6);
            });
        });
    }

    // ==================== FOREST BACKGROUND ====================
    private createForestBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sky through trees
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.4, '#90EE90');
        skyGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Pine trees background
        for (let i = 0; i < 8; i++) {
            this.drawPixelPineTree(ctx, i * 55 - 20, 60, '#1a472a', 0.6);
        }

        // Pine trees midground
        for (let i = 0; i < 6; i++) {
            this.drawPixelPineTree(ctx, i * 75 + 10, 100, '#228B22', 0.8);
        }

        // Forest floor
        ctx.fillStyle = '#3CB371';
        ctx.fillRect(0, 220, this.WIDTH, this.HEIGHT - 220);

        // Mushrooms
        this.drawPixelMushroom(ctx, 100, 250, '#FF6347');
        this.drawPixelMushroom(ctx, 200, 260, '#FFD700');
        this.drawPixelMushroom(ctx, 320, 245, '#FF6347');

        // Bushes
        for (let i = 0; i < 5; i++) {
            this.drawPixelBush(ctx, 30 + i * 80, 240 + Math.random() * 20);
        }

        return canvas;
    }

    private drawPixelPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number): void {
        const s = scale * 4;
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 6 * s, y + 12 * s, 4 * s, 10 * s);
        
        // Foliage layers
        ctx.fillStyle = color;
        for (let layer = 0; layer < 4; layer++) {
            const width = (8 - layer * 1.5) * s;
            const layerY = y + layer * 4 * s;
            ctx.fillRect(x + 8 * s - width / 2, layerY, width, 5 * s);
        }
    }

    private drawPixelMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, capColor: string): void {
        // Stem
        ctx.fillStyle = '#FFFAF0';
        ctx.fillRect(x + 4, y, 8, 16);
        // Cap
        ctx.fillStyle = capColor;
        ctx.fillRect(x, y - 8, 16, 10);
        ctx.fillRect(x + 2, y - 12, 12, 4);
        // Dots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y - 6, 3, 3);
        ctx.fillRect(x + 10, y - 4, 3, 3);
    }

    private drawPixelBush(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x, y, 30, 20);
        ctx.fillRect(x + 5, y - 8, 20, 10);
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x + 8, y + 4, 14, 12);
    }

    // ==================== BEACH BACKGROUND ====================
    private createBeachBackground(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;
        const ctx = canvas.getContext('2d')!;

        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.HEIGHT * 0.5);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(320, 60, 35, 0, Math.PI * 2);
        ctx.fill();

        // Clouds
        this.drawPixelCloud(ctx, 50, 40);
        this.drawPixelCloud(ctx, 200, 60);

        // Ocean
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(0, 120, this.WIDTH, 60);
        
        // Waves
        ctx.fillStyle = '#1E90FF';
        for (let x = 0; x < this.WIDTH; x += 8) {
            const waveY = 140 + Math.sin(x * 0.05) * 5;
            ctx.fillRect(x, waveY, 8, 4);
        }

        // Beach
        const sandGradient = ctx.createLinearGradient(0, 180, 0, this.HEIGHT);
        sandGradient.addColorStop(0, '#F4D03F');
        sandGradient.addColorStop(1, '#EDC9AF');
        ctx.fillStyle = sandGradient;
        ctx.fillRect(0, 180, this.WIDTH, this.HEIGHT - 180);

        // Palm tree
        this.drawPixelPalm(ctx, 50, 200);

        // Beach items
        this.drawPixelShell(ctx, 150, 260);
        this.drawPixelShell(ctx, 300, 250);
        
        // Starfish
        this.drawPixelStarfish(ctx, 220, 270);

        // Beach umbrella
        this.drawPixelUmbrella(ctx, 320, 220);

        return canvas;
    }

    private drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, 40, 16);
        ctx.fillRect(x + 8, y - 8, 24, 12);
        ctx.fillRect(x - 8, y + 4, 16, 12);
        ctx.fillRect(x + 32, y + 4, 16, 12);
    }

    private drawPixelPalm(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 12; i++) {
            ctx.fillRect(x + Math.sin(i * 0.3) * 3, y - i * 8, 12, 8);
        }
        
        // Leaves
        ctx.fillStyle = '#228B22';
        for (let leaf = 0; leaf < 6; leaf++) {
            const angle = (leaf / 6) * Math.PI * 2;
            for (let i = 0; i < 10; i++) {
                const lx = x + 6 + Math.cos(angle) * i * 5;
                const ly = y - 90 + Math.sin(angle) * i * 3 + i;
                ctx.fillRect(lx, ly, 6, 4);
            }
        }
        
        // Coconuts
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y - 85, 8, 8);
        ctx.fillRect(x + 10, y - 82, 8, 8);
    }

    private drawPixelStarfish(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = '#FF6B6B';
        // Center
        ctx.fillRect(x + 6, y + 6, 8, 8);
        // Arms
        ctx.fillRect(x + 8, y, 4, 8);      // top
        ctx.fillRect(x + 8, y + 12, 4, 8); // bottom
        ctx.fillRect(x, y + 8, 8, 4);      // left
        ctx.fillRect(x + 12, y + 8, 8, 4); // right
        ctx.fillRect(x + 2, y + 2, 6, 6);  // top-left
    }

    private drawPixelUmbrella(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 22, y, 4, 60);
        
        // Canopy
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x, y - 10, 50, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y - 10, 12, 16);
        ctx.fillRect(x + 36, y - 10, 8, 16);
    }
}
