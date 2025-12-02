// LevelRenderer - Renders zone-specific backgrounds, terrain and decorations

import type { Zone, MiniLevel } from './ZoneManager.js';
import type { InteractiveObject } from './LevelManager.js';

// Decoration object for rendering
interface Decoration {
    x: number;
    y: number;
    type: string;
    scale: number;
    variant: number;
}

export class LevelRenderer {
    private static instance: LevelRenderer;
    private decorations: Decoration[] = [];
    private currentZone: Zone | null = null;
    private currentLevel: MiniLevel | null = null;

    private constructor() {}

    public static getInstance(): LevelRenderer {
        if (!LevelRenderer.instance) {
            LevelRenderer.instance = new LevelRenderer();
        }
        return LevelRenderer.instance;
    }

    public loadLevel(zone: Zone, level: MiniLevel): void {
        this.currentZone = zone;
        this.currentLevel = level;
        this.generateDecorations();
    }

    private generateDecorations(): void {
        if (!this.currentZone || !this.currentLevel) return;

        this.decorations = [];
        const width = this.currentLevel.width;
        const height = this.currentLevel.height;

        // Generate decorations based on zone theme
        switch (this.currentZone.id) {
            case 'jungle':
                this.generateJungleDecorations(width, height);
                break;
            case 'desert':
                this.generateDesertDecorations(width, height);
                break;
            case 'arctic':
                this.generateArcticDecorations(width, height);
                break;
            case 'ocean':
                this.generateOceanDecorations(width, height);
                break;
            case 'savannah':
                this.generateSavannahDecorations(width, height);
                break;
        }
    }

    private generateJungleDecorations(width: number, height: number): void {
        // Dense trees
        for (let i = 0; i < 80; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'jungle_tree',
                scale: 0.8 + Math.random() * 0.6,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Bushes and ferns
        for (let i = 0; i < 60; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'fern',
                scale: 0.6 + Math.random() * 0.4,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Flowers
        for (let i = 0; i < 40; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'jungle_flower',
                scale: 0.5 + Math.random() * 0.3,
                variant: Math.floor(Math.random() * 4)
            });
        }

        // Vines
        for (let i = 0; i < 25; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * (height * 0.3),
                type: 'vine',
                scale: 1 + Math.random() * 0.5,
                variant: Math.floor(Math.random() * 2)
            });
        }
    }

    private generateDesertDecorations(width: number, height: number): void {
        // Cacti
        for (let i = 0; i < 40; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'cactus',
                scale: 0.7 + Math.random() * 0.6,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Sand dunes (large background elements)
        for (let i = 0; i < 15; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'dune',
                scale: 2 + Math.random() * 2,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Rocks
        for (let i = 0; i < 30; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'desert_rock',
                scale: 0.5 + Math.random() * 0.8,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Skulls and bones (for atmosphere)
        for (let i = 0; i < 10; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'skull',
                scale: 0.3 + Math.random() * 0.3,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Palm oases
        for (let i = 0; i < 8; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'palm',
                scale: 0.8 + Math.random() * 0.4,
                variant: Math.floor(Math.random() * 2)
            });
        }
    }

    private generateArcticDecorations(width: number, height: number): void {
        // Ice formations
        for (let i = 0; i < 35; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'ice_crystal',
                scale: 0.6 + Math.random() * 0.8,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Snow mounds
        for (let i = 0; i < 50; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'snow_mound',
                scale: 1 + Math.random() * 1.5,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Icebergs (near edges)
        for (let i = 0; i < 10; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.4,
                type: 'iceberg',
                scale: 1.5 + Math.random() * 1,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Northern lights particles (top of screen)
        for (let i = 0; i < 20; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * (height * 0.2),
                type: 'aurora',
                scale: 2 + Math.random() * 3,
                variant: Math.floor(Math.random() * 3)
            });
        }
    }

    private generateOceanDecorations(width: number, height: number): void {
        // Coral reefs
        for (let i = 0; i < 45; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'coral',
                scale: 0.6 + Math.random() * 0.6,
                variant: Math.floor(Math.random() * 4)
            });
        }

        // Seaweed
        for (let i = 0; i < 60; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'seaweed',
                scale: 0.8 + Math.random() * 0.6,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Shells
        for (let i = 0; i < 30; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: height - Math.random() * (height * 0.3),
                type: 'shell',
                scale: 0.3 + Math.random() * 0.4,
                variant: Math.floor(Math.random() * 4)
            });
        }

        // Bubbles (at various heights)
        for (let i = 0; i < 40; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'bubble',
                scale: 0.3 + Math.random() * 0.5,
                variant: 0
            });
        }

        // Sunken treasure/shipwreck parts
        for (let i = 0; i < 5; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: height - Math.random() * (height * 0.2),
                type: 'treasure',
                scale: 1 + Math.random() * 0.5,
                variant: Math.floor(Math.random() * 2)
            });
        }
    }

    private generateSavannahDecorations(width: number, height: number): void {
        // Acacia trees
        for (let i = 0; i < 25; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'acacia',
                scale: 1 + Math.random() * 0.5,
                variant: Math.floor(Math.random() * 2)
            });
        }

        // Tall grass patches
        for (let i = 0; i < 100; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'tall_grass',
                scale: 0.5 + Math.random() * 0.5,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Rocks
        for (let i = 0; i < 20; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'savannah_rock',
                scale: 0.6 + Math.random() * 1,
                variant: Math.floor(Math.random() * 3)
            });
        }

        // Watering holes
        for (let i = 0; i < 3; i++) {
            this.decorations.push({
                x: 200 + Math.random() * (width - 400),
                y: 200 + Math.random() * (height - 400),
                type: 'watering_hole',
                scale: 2 + Math.random() * 1,
                variant: 0
            });
        }

        // Termite mounds
        for (let i = 0; i < 8; i++) {
            this.decorations.push({
                x: Math.random() * width,
                y: Math.random() * height,
                type: 'termite_mound',
                scale: 0.8 + Math.random() * 0.4,
                variant: Math.floor(Math.random() * 2)
            });
        }
    }

    // Render the background gradient based on zone
    public renderBackground(ctx: CanvasRenderingContext2D, viewX: number, viewY: number, viewWidth: number, viewHeight: number): void {
        if (!this.currentZone || !this.currentLevel) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);

        switch (this.currentZone.id) {
            case 'jungle':
                gradient.addColorStop(0, '#1a472a'); // Dark green sky
                gradient.addColorStop(0.3, '#2d5a3f');
                gradient.addColorStop(1, '#1a3d2a'); // Dark jungle floor
                break;
            case 'desert':
                gradient.addColorStop(0, '#87CEEB'); // Sky blue
                gradient.addColorStop(0.4, '#F4D03F'); // Sand yellow
                gradient.addColorStop(1, '#DAA520'); // Darker sand
                break;
            case 'arctic':
                gradient.addColorStop(0, '#B0E0E6'); // Pale blue
                gradient.addColorStop(0.3, '#E0FFFF'); // Light cyan
                gradient.addColorStop(1, '#F0F8FF'); // Alice blue (snow)
                break;
            case 'ocean':
                gradient.addColorStop(0, '#006994'); // Deep blue (surface)
                gradient.addColorStop(0.5, '#1E90FF'); // Dodger blue
                gradient.addColorStop(1, '#191970'); // Midnight blue (deep)
                break;
            case 'savannah':
                gradient.addColorStop(0, '#87CEEB'); // Sky blue
                gradient.addColorStop(0.3, '#FFE4B5'); // Moccasin
                gradient.addColorStop(1, '#D2B48C'); // Tan (dry grass)
                break;
            default:
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#90EE90');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
    }

    // Render all decorations visible in viewport
    public renderDecorations(ctx: CanvasRenderingContext2D, viewX: number, viewY: number, viewWidth: number, viewHeight: number): void {
        if (!this.currentZone) return;

        // Sort by Y for proper layering
        const visibleDecorations = this.decorations
            .filter(d => 
                d.x >= viewX - 100 && d.x <= viewX + viewWidth + 100 &&
                d.y >= viewY - 100 && d.y <= viewY + viewHeight + 100
            )
            .sort((a, b) => a.y - b.y);

        for (const dec of visibleDecorations) {
            const screenX = dec.x - viewX;
            const screenY = dec.y - viewY;
            
            this.renderDecoration(ctx, dec, screenX, screenY);
        }
    }

    private renderDecoration(ctx: CanvasRenderingContext2D, dec: Decoration, x: number, y: number): void {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dec.scale, dec.scale);

        switch (dec.type) {
            case 'jungle_tree':
                this.drawJungleTree(ctx, dec.variant);
                break;
            case 'fern':
                this.drawFern(ctx, dec.variant);
                break;
            case 'jungle_flower':
                this.drawJungleFlower(ctx, dec.variant);
                break;
            case 'vine':
                this.drawVine(ctx, dec.variant);
                break;
            case 'cactus':
                this.drawCactus(ctx, dec.variant);
                break;
            case 'dune':
                this.drawDune(ctx, dec.variant);
                break;
            case 'desert_rock':
                this.drawDesertRock(ctx, dec.variant);
                break;
            case 'skull':
                this.drawSkull(ctx);
                break;
            case 'palm':
                this.drawPalm(ctx);
                break;
            case 'ice_crystal':
                this.drawIceCrystal(ctx, dec.variant);
                break;
            case 'snow_mound':
                this.drawSnowMound(ctx);
                break;
            case 'iceberg':
                this.drawIceberg(ctx);
                break;
            case 'aurora':
                this.drawAurora(ctx, dec.variant);
                break;
            case 'coral':
                this.drawCoral(ctx, dec.variant);
                break;
            case 'seaweed':
                this.drawSeaweed(ctx, dec.variant);
                break;
            case 'shell':
                this.drawShell(ctx, dec.variant);
                break;
            case 'bubble':
                this.drawBubble(ctx);
                break;
            case 'treasure':
                this.drawTreasure(ctx, dec.variant);
                break;
            case 'acacia':
                this.drawAcacia(ctx);
                break;
            case 'tall_grass':
                this.drawTallGrass(ctx, dec.variant);
                break;
            case 'savannah_rock':
                this.drawSavannahRock(ctx, dec.variant);
                break;
            case 'watering_hole':
                this.drawWateringHole(ctx);
                break;
            case 'termite_mound':
                this.drawTermiteMound(ctx);
                break;
        }

        ctx.restore();
    }

    // JUNGLE DECORATIONS
    private drawJungleTree(ctx: CanvasRenderingContext2D, variant: number): void {
        // Trunk
        ctx.fillStyle = '#4A3728';
        ctx.fillRect(-8, -60, 16, 80);
        
        // Foliage
        ctx.fillStyle = variant === 0 ? '#228B22' : variant === 1 ? '#2E8B57' : '#32CD32';
        ctx.beginPath();
        ctx.arc(0, -70, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-25, -50, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(25, -50, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawFern(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = variant === 0 ? '#228B22' : '#32CD32';
        for (let i = -3; i <= 3; i++) {
            ctx.save();
            ctx.rotate(i * 0.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(5, -15, 0, -30);
            ctx.quadraticCurveTo(-5, -15, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    private drawJungleFlower(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#FF6B6B', '#FFD93D', '#FF69B4', '#9B59B6'];
        ctx.fillStyle = colors[variant] || '#FF6B6B';
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i / 5) * Math.PI * 2);
            ctx.beginPath();
            ctx.ellipse(0, -10, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawVine(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i < 8; i++) {
            const offsetX = Math.sin(i * 0.8) * 15;
            ctx.lineTo(offsetX, i * 20);
        }
        ctx.stroke();

        // Leaves
        ctx.fillStyle = '#32CD32';
        for (let i = 1; i < 7; i++) {
            const offsetX = Math.sin(i * 0.8) * 15;
            ctx.beginPath();
            ctx.ellipse(offsetX + (i % 2 === 0 ? 10 : -10), i * 20, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // DESERT DECORATIONS
    private drawCactus(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = '#228B22';
        
        if (variant === 0) {
            // Saguaro cactus
            ctx.fillRect(-8, -60, 16, 70);
            ctx.fillRect(-35, -40, 20, 10);
            ctx.fillRect(-25, -50, 10, 20);
            ctx.fillRect(15, -30, 20, 10);
            ctx.fillRect(25, -45, 10, 25);
        } else if (variant === 1) {
            // Round cactus
            ctx.beginPath();
            ctx.arc(0, -15, 20, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Prickly pear
            ctx.beginPath();
            ctx.ellipse(0, -20, 20, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-15, -45, 12, 18, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(18, -40, 12, 18, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private drawDune(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = variant === 0 ? '#E6C87A' : '#D4A84B';
        ctx.beginPath();
        ctx.moveTo(-80, 30);
        ctx.quadraticCurveTo(0, -30, 80, 30);
        ctx.fill();
    }

    private drawDesertRock(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = variant === 0 ? '#8B7355' : variant === 1 ? '#A0522D' : '#CD853F';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-15, -25);
        ctx.lineTo(5, -30);
        ctx.lineTo(20, -15);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
    }

    private drawSkull(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(0, -10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-4, 0, 8, 8);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-4, -12, 3, 0, Math.PI * 2);
        ctx.arc(4, -12, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawPalm(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-6, -50, 12, 60);
        
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.translate(0, -55);
            ctx.rotate((i / 6) * Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(30, -10, 50, 15);
            ctx.quadraticCurveTo(30, 0, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    // ARCTIC DECORATIONS
    private drawIceCrystal(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = variant === 0 ? '#E0FFFF' : variant === 1 ? '#B0E0E6' : '#AFEEEE';
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(12, -10);
        ctx.lineTo(8, 0);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, -10);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }

    private drawSnowMound(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#FFFAFA';
        ctx.beginPath();
        ctx.arc(0, 0, 30, Math.PI, 0);
        ctx.fill();
        
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.arc(-10, -5, 15, Math.PI, 0);
        ctx.fill();
    }

    private drawIceberg(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#E0FFFF';
        ctx.beginPath();
        ctx.moveTo(-40, 20);
        ctx.lineTo(-30, -30);
        ctx.lineTo(0, -50);
        ctx.lineTo(35, -25);
        ctx.lineTo(45, 20);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#B0E0E6';
        ctx.beginPath();
        ctx.moveTo(-40, 20);
        ctx.lineTo(-50, 40);
        ctx.lineTo(50, 40);
        ctx.lineTo(45, 20);
        ctx.closePath();
        ctx.fill();
    }

    private drawAurora(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#00FF7F', '#9370DB', '#00CED1'];
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = colors[variant] || '#00FF7F';
        
        ctx.beginPath();
        ctx.moveTo(-60, 0);
        for (let i = 0; i <= 10; i++) {
            const x = -60 + i * 12;
            const y = Math.sin(i * 0.5 + Date.now() * 0.001) * 20;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(60, 30);
        ctx.lineTo(-60, 30);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }

    // OCEAN DECORATIONS
    private drawCoral(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#FF6B6B', '#FF69B4', '#FFA07A', '#FF7F50'];
        ctx.fillStyle = colors[variant] || '#FF6B6B';
        
        // Branch coral
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i - 2) * 0.3);
            ctx.fillRect(-3, 0, 6, -30 - Math.random() * 20);
            ctx.beginPath();
            ctx.arc(0, -30 - Math.random() * 20, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    private drawSeaweed(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#228B22', '#32CD32', '#3CB371'];
        ctx.strokeStyle = colors[variant] || '#228B22';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i < 6; i++) {
            const x = Math.sin(i * 0.8 + Date.now() * 0.002) * 10;
            ctx.lineTo(x, -i * 15);
        }
        ctx.stroke();
    }

    private drawShell(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#FFF8DC', '#FFE4E1', '#F0E68C', '#DDA0DD'];
        ctx.fillStyle = colors[variant] || '#FFF8DC';
        
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 3 + i * 2, 0, Math.PI);
            ctx.stroke();
        }
    }

    private drawBubble(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    private drawTreasure(ctx: CanvasRenderingContext2D, variant: number): void {
        if (variant === 0) {
            // Treasure chest
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-20, -15, 40, 25);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(-18, -5, 36, 3);
            ctx.beginPath();
            ctx.arc(0, -5, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Anchor
            ctx.strokeStyle = '#696969';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(0, 10);
            ctx.moveTo(-15, -20);
            ctx.lineTo(15, -20);
            ctx.moveTo(-20, 10);
            ctx.quadraticCurveTo(-20, 20, 0, 10);
            ctx.quadraticCurveTo(20, 20, 20, 10);
            ctx.stroke();
        }
    }

    // SAVANNAH DECORATIONS
    private drawAcacia(ctx: CanvasRenderingContext2D): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-6, -40, 12, 60);
        
        // Flat canopy
        ctx.fillStyle = '#556B2F';
        ctx.beginPath();
        ctx.ellipse(0, -55, 50, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-20, -50, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(25, -48, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawTallGrass(ctx: CanvasRenderingContext2D, variant: number): void {
        const colors = ['#DAA520', '#BDB76B', '#F0E68C'];
        ctx.strokeStyle = colors[variant] || '#DAA520';
        ctx.lineWidth = 2;
        
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 4, 0);
            ctx.quadraticCurveTo(i * 4 + Math.sin(Date.now() * 0.002) * 5, -15, i * 4, -30);
            ctx.stroke();
        }
    }

    private drawSavannahRock(ctx: CanvasRenderingContext2D, variant: number): void {
        ctx.fillStyle = variant === 0 ? '#A0522D' : variant === 1 ? '#8B7355' : '#CD853F';
        ctx.beginPath();
        ctx.arc(0, -10, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.arc(5, -15, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawWateringHole(ctx: CanvasRenderingContext2D): void {
        // Water
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shore
        ctx.strokeStyle = '#D2B48C';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 65, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Reflection
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-20, -5, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    private drawTermiteMound(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-15, -40);
        ctx.lineTo(-5, -55);
        ctx.lineTo(5, -50);
        ctx.lineTo(15, -35);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        
        // Holes
        ctx.fillStyle = '#4A3728';
        ctx.beginPath();
        ctx.arc(-5, -20, 3, 0, Math.PI * 2);
        ctx.arc(5, -30, 2, 0, Math.PI * 2);
        ctx.arc(0, -10, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Render interactive objects
    public renderInteractives(ctx: CanvasRenderingContext2D, interactives: InteractiveObject[], viewX: number, viewY: number): void {
        for (const obj of interactives) {
            const screenX = obj.x - viewX;
            const screenY = obj.y - viewY;
            
            // Skip if not visible
            if (screenX + obj.width < 0 || screenX > ctx.canvas.width ||
                screenY + obj.height < 0 || screenY > ctx.canvas.height) {
                continue;
            }

            this.renderInteractive(ctx, obj, screenX, screenY);
        }
    }

    private renderInteractive(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        ctx.save();

        switch (obj.type) {
            case 'button':
                this.drawButton(ctx, obj, x, y);
                break;
            case 'push_rock':
                this.drawPushRock(ctx, obj, x, y);
                break;
            case 'bridge':
                this.drawBridge(ctx, obj, x, y);
                break;
            case 'footprints':
                this.drawFootprints(ctx, obj, x, y);
                break;
            case 'gate':
                this.drawGate(ctx, obj, x, y);
                break;
            case 'boat':
                this.drawBoat(ctx, obj, x, y);
                break;
        }

        ctx.restore();
    }

    private drawButton(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        ctx.fillStyle = obj.isCompleted ? '#666666' : '#FF4444';
        ctx.beginPath();
        ctx.arc(x + obj.width / 2, y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (!obj.isCompleted) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', x + obj.width / 2, y + obj.height / 2 + 4);
        }
    }

    private drawPushRock(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        ctx.fillStyle = obj.isCompleted ? '#555555' : '#8B7355';
        ctx.beginPath();
        ctx.ellipse(x + obj.width / 2, y + obj.height / 2, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (!obj.isCompleted) {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(x + obj.width / 3, y + obj.height / 3, obj.width / 6, obj.height / 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    private drawBridge(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        if (obj.isCompleted) {
            // Fixed bridge
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, obj.width, obj.height);
            
            // Planks
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            for (let i = 0; i < obj.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + obj.height);
                ctx.stroke();
            }
        } else {
            // Broken bridge
            ctx.fillStyle = '#8B4513';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(x, y, obj.width / 3, obj.height);
            ctx.fillRect(x + obj.width * 2 / 3, y, obj.width / 3, obj.height);
            ctx.globalAlpha = 1;
            
            // Gap indicator
            ctx.strokeStyle = '#FF6B6B';
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x + obj.width / 3, y, obj.width / 3, obj.height);
            ctx.setLineDash([]);
        }
    }

    private drawFootprints(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        ctx.fillStyle = obj.isCompleted ? '#666666' : '#DAA520';
        ctx.globalAlpha = obj.isCompleted ? 0.3 : 0.7;
        
        // Draw footprint shapes
        for (let i = 0; i < 3; i++) {
            const offsetX = i * 25;
            const offsetY = (i % 2) * 15;
            
            ctx.beginPath();
            ctx.ellipse(x + 10 + offsetX, y + offsetY + 10, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Toes
            for (let t = 0; t < 3; t++) {
                ctx.beginPath();
                ctx.arc(x + 5 + offsetX + t * 5, y + offsetY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
    }

    private drawGate(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        if (obj.isCompleted || obj.isActive) {
            // Open gate
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, 10, obj.height);
            ctx.fillRect(x + obj.width - 10, y, 10, obj.height);
        } else {
            // Closed gate
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, obj.width, obj.height);
            
            // Bars
            ctx.strokeStyle = '#4A4A4A';
            ctx.lineWidth = 3;
            for (let i = 10; i < obj.width; i += 15) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + obj.height);
                ctx.stroke();
            }
            
            // Lock
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + obj.width / 2, y + obj.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private drawBoat(ctx: CanvasRenderingContext2D, obj: InteractiveObject, x: number, y: number): void {
        // Hull
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x, y + obj.height * 0.3);
        ctx.lineTo(x + obj.width * 0.1, y + obj.height);
        ctx.lineTo(x + obj.width * 0.9, y + obj.height);
        ctx.lineTo(x + obj.width, y + obj.height * 0.3);
        ctx.quadraticCurveTo(x + obj.width / 2, y + obj.height * 0.5, x, y + obj.height * 0.3);
        ctx.fill();
        
        // Mast
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + obj.width / 2 - 3, y, 6, obj.height * 0.7);
        
        // Sail
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x + obj.width / 2, y + 5);
        ctx.lineTo(x + obj.width - 10, y + obj.height * 0.4);
        ctx.lineTo(x + obj.width / 2, y + obj.height * 0.6);
        ctx.closePath();
        ctx.fill();
    }

    // Render panorama point indicator
    public renderPanoramaPoints(ctx: CanvasRenderingContext2D, points: { x: number; y: number; radius: number; discovered: boolean }[], viewX: number, viewY: number): void {
        for (const point of points) {
            if (point.discovered) continue;
            
            const screenX = point.x - viewX;
            const screenY = point.y - viewY;
            
            // Pulsing glow effect
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(screenX, screenY, point.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Camera icon
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📷', screenX, screenY);
            
            ctx.globalAlpha = 1;
        }
    }

    public unloadLevel(): void {
        this.decorations = [];
        this.currentZone = null;
        this.currentLevel = null;
    }
}
