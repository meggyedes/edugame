// Base class for all biome backgrounds

export interface BiomeConfig {
    name: string;
    continent: string;
    width: number;
    height: number;
    groundColor: string;
    skyColors: string[];
}

export abstract class BaseBiome {
    protected config: BiomeConfig;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected isGenerated: boolean = false;

    constructor(config: BiomeConfig) {
        this.config = config;
        this.canvas = document.createElement('canvas');
        this.canvas.width = config.width;
        this.canvas.height = config.height;
        this.ctx = this.canvas.getContext('2d')!;
    }

    public generate(): void {
        if (this.isGenerated) return;
        
        this.renderSky();
        this.renderBackground();
        this.renderMidground();
        this.renderForeground();
        this.renderGround();
        this.renderDetails();
        
        this.isGenerated = true;
    }

    protected abstract renderBackground(): void;
    protected abstract renderMidground(): void;
    protected abstract renderForeground(): void;
    protected abstract renderDetails(): void;

    protected renderSky(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.6);
        this.config.skyColors.forEach((color, i) => {
            gradient.addColorStop(i / (this.config.skyColors.length - 1), color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.6);
    }

    protected renderGround(): void {
        const groundY = this.config.height * 0.75;
        const groundHeight = this.config.height - groundY;

        // Base ground
        this.ctx.fillStyle = this.config.groundColor;
        this.ctx.fillRect(0, groundY, this.config.width, groundHeight);
    }

    // Pixel art helper - draw a pixel block
    protected drawPixel(x: number, y: number, size: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }

    // Draw pixelated rectangle
    protected drawPixelRect(x: number, y: number, w: number, h: number, color: string, pixelSize: number = 4): void {
        this.ctx.fillStyle = color;
        for (let px = 0; px < w; px += pixelSize) {
            for (let py = 0; py < h; py += pixelSize) {
                this.ctx.fillRect(Math.floor(x + px), Math.floor(y + py), pixelSize, pixelSize);
            }
        }
    }

    // Seeded random for consistent generation
    protected seededRandom(seed: number): () => number {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    public render(targetCtx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
        if (!this.isGenerated) {
            this.generate();
        }
        targetCtx.drawImage(this.canvas, -offsetX, -offsetY);
    }

    public getCanvas(): HTMLCanvasElement {
        if (!this.isGenerated) {
            this.generate();
        }
        return this.canvas;
    }

    public getName(): string {
        return this.config.name;
    }

    public getContinent(): string {
        return this.config.continent;
    }

    public getWidth(): number {
        return this.config.width;
    }

    public getHeight(): number {
        return this.config.height;
    }
}
