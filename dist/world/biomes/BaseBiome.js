// Base class for all biome backgrounds
export class BaseBiome {
    constructor(config) {
        this.isGenerated = false;
        this.config = config;
        this.canvas = document.createElement('canvas');
        this.canvas.width = config.width;
        this.canvas.height = config.height;
        this.ctx = this.canvas.getContext('2d');
    }
    generate() {
        if (this.isGenerated)
            return;
        this.renderSky();
        this.renderBackground();
        this.renderMidground();
        this.renderForeground();
        this.renderGround();
        this.renderDetails();
        this.isGenerated = true;
    }
    renderSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.6);
        this.config.skyColors.forEach((color, i) => {
            gradient.addColorStop(i / (this.config.skyColors.length - 1), color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.6);
    }
    renderGround() {
        const groundY = this.config.height * 0.75;
        const groundHeight = this.config.height - groundY;
        // Base ground
        this.ctx.fillStyle = this.config.groundColor;
        this.ctx.fillRect(0, groundY, this.config.width, groundHeight);
    }
    // Pixel art helper - draw a pixel block
    drawPixel(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }
    // Draw pixelated rectangle
    drawPixelRect(x, y, w, h, color, pixelSize = 4) {
        this.ctx.fillStyle = color;
        for (let px = 0; px < w; px += pixelSize) {
            for (let py = 0; py < h; py += pixelSize) {
                this.ctx.fillRect(Math.floor(x + px), Math.floor(y + py), pixelSize, pixelSize);
            }
        }
    }
    // Seeded random for consistent generation
    seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    render(targetCtx, offsetX, offsetY) {
        if (!this.isGenerated) {
            this.generate();
        }
        targetCtx.drawImage(this.canvas, -offsetX, -offsetY);
    }
    getCanvas() {
        if (!this.isGenerated) {
            this.generate();
        }
        return this.canvas;
    }
    getName() {
        return this.config.name;
    }
    getContinent() {
        return this.config.continent;
    }
    getWidth() {
        return this.config.width;
    }
    getHeight() {
        return this.config.height;
    }
}
//# sourceMappingURL=BaseBiome.js.map