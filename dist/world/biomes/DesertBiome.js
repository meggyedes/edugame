// Desert Biome - Australia (Ausztrália - Sivatag)
// Outback desert with red sand, rocks, and sparse vegetation
import { BaseBiome } from './BaseBiome.js';
export class DesertBiome extends BaseBiome {
    constructor(width = 2000, height = 800) {
        super({
            name: 'desert',
            continent: 'australia',
            width,
            height,
            groundColor: '#C2956E',
            skyColors: ['#4A90D9', '#87CEEB', '#B0E0E6']
        });
    }
    renderSky() {
        // Bright blue desert sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.6);
        gradient.addColorStop(0, '#1E90FF');
        gradient.addColorStop(0.3, '#4AA8FF');
        gradient.addColorStop(0.6, '#87CEEB');
        gradient.addColorStop(1, '#E0F0FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.6);
        // Hot sun
        this.drawDesertSun(this.config.width * 0.2, this.config.height * 0.12);
    }
    renderBackground() {
        const random = this.seededRandom(11111);
        // Distant red rock formations (Uluru-style)
        for (let i = 0; i < 4; i++) {
            const x = random() * this.config.width;
            const rockWidth = 200 + random() * 150;
            const rockHeight = 80 + random() * 60;
            this.drawDistantRockFormation(x, this.config.height * 0.4, rockWidth, rockHeight);
        }
        // Distant sand dunes
        for (let i = 0; i < 6; i++) {
            const x = i * (this.config.width / 5);
            this.drawSandDune(x, this.config.height * 0.5, 400, 50, '#D4A574');
        }
    }
    renderMidground() {
        const random = this.seededRandom(22222);
        // Mid-distance dunes
        for (let i = 0; i < 5; i++) {
            const x = i * (this.config.width / 4) - 100;
            this.drawSandDune(x, this.config.height * 0.58, 500, 60, '#C9956A');
        }
        // Sparse desert trees (eucalyptus-like)
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawDesertTree(x, this.config.height * 0.6, 80 + random() * 40);
        }
        // Medium rocks
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            this.drawDesertRock(x, this.config.height * 0.62, 30 + random() * 25, '#A0522D');
        }
    }
    renderForeground() {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        // Main desert ground
        this.drawDesertGround(groundY);
        // Foreground trees
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawDesertTree(x, groundY - 10, 120 + random() * 60);
        }
        // Large foreground rocks
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            this.drawDesertRock(x, groundY + 10, 40 + random() * 30, '#8B4513');
        }
    }
    renderDetails() {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        // Spinifex grass (desert grass clumps)
        for (let i = 0; i < 40; i++) {
            const x = random() * this.config.width;
            this.drawSpinifex(x, groundY + 10 + random() * 30, 15 + random() * 15);
        }
        // Small desert plants
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            this.drawDesertPlant(x, groundY + 15 + random() * 20);
        }
        // Scattered small rocks
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            this.drawSmallRock(x, groundY + 20 + random() * 30);
        }
        // Cracks in the ground
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawGroundCracks(x, groundY + 30 + random() * 30);
        }
        // Animal bones (rare)
        if (random() > 0.7) {
            this.drawBones(random() * this.config.width, groundY + 25);
        }
    }
    drawDesertSun(x, y) {
        // Heat shimmer effect
        const shimmerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 150);
        shimmerGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        shimmerGradient.addColorStop(0.4, 'rgba(255, 255, 150, 0.4)');
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        this.ctx.fillStyle = shimmerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 150, 0, Math.PI * 2);
        this.ctx.fill();
        // Sun core (pixel art style)
        for (let r = 35; r > 0; r -= 4) {
            const intensity = 1 - r / 35;
            const yellow = Math.floor(200 + intensity * 55);
            this.ctx.fillStyle = `rgb(255, ${yellow}, 100)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    drawDistantRockFormation(x, y, width, height) {
        const colors = ['#CD5C5C', '#B8503C', '#A0422D'];
        // Main rock mass
        for (let col = 0; col < width; col += 6) {
            const columnHeight = height * (1 - Math.pow((col - width / 2) / (width / 2), 2)) * (0.7 + Math.sin(col * 0.1) * 0.3);
            for (let row = 0; row < columnHeight; row += 6) {
                const colorIdx = Math.floor(row / height * colors.length);
                const color = colors[Math.min(colorIdx, colors.length - 1)];
                this.drawPixel(x + col, y - row, 6, color);
            }
        }
    }
    drawSandDune(x, y, width, height, color) {
        const lightColor = this.lightenColor(color, 20);
        const darkColor = this.darkenColor(color, 20);
        for (let col = 0; col < width; col += 4) {
            const duneY = Math.sin((col / width) * Math.PI) * height;
            const isLight = col < width * 0.6;
            for (let row = 0; row < duneY; row += 4) {
                const shadedColor = isLight ? lightColor : darkColor;
                this.drawPixel(x + col, y - row, 4, row < duneY * 0.8 ? shadedColor : color);
            }
        }
    }
    drawDesertTree(x, y, height) {
        // Ghost gum / eucalyptus style tree
        const trunkWidth = height / 10;
        const trunkHeight = height * 0.7;
        // White/pale trunk
        this.drawPixelRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight, '#E8DCD0', 4);
        this.drawPixelRect(x - trunkWidth / 4, y - trunkHeight, trunkWidth / 2, trunkHeight, '#F5EFE6', 4);
        // Some bark texture
        const random = this.seededRandom(x * y);
        for (let i = 0; i < 5; i++) {
            const barkY = y - random() * trunkHeight;
            this.drawPixel(x - trunkWidth / 3, barkY, 4, '#C9B8A8');
        }
        // Sparse foliage
        const canopyY = y - trunkHeight;
        const canopyWidth = height * 0.5;
        for (let i = 0; i < 20; i++) {
            const leafX = x + (random() - 0.5) * canopyWidth;
            const leafY = canopyY - random() * height * 0.35;
            const color = random() > 0.4 ? '#6B8E23' : '#556B2F';
            this.drawPixel(leafX, leafY, 4, color);
            this.drawPixel(leafX + 4, leafY, 4, color);
        }
        // Branches
        this.drawPixelRect(x - 20, canopyY + 10, 25, 4, '#D4C4B0', 4);
        this.drawPixelRect(x + 5, canopyY + 5, 20, 4, '#D4C4B0', 4);
    }
    drawDesertRock(x, y, size, baseColor) {
        const lightColor = this.lightenColor(baseColor, 25);
        const darkColor = this.darkenColor(baseColor, 25);
        const random = this.seededRandom(x * y);
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.4, 2) * 1.2) * (0.8 + random() * 0.4);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                let color;
                if (col < -rowWidth / 4) {
                    color = darkColor;
                }
                else if (col > rowWidth / 4) {
                    color = darkColor;
                }
                else {
                    color = row < size / 3 ? lightColor : baseColor;
                }
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
    }
    drawDesertGround(groundY) {
        // Red/orange sand layers
        const layers = [
            { y: groundY - 10, color: '#D4A574' },
            { y: groundY, color: '#C2956E' },
            { y: groundY + 20, color: '#B58560' },
            { y: groundY + 45, color: '#A07550' }
        ];
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 4) {
                const variation = Math.sin(x * 0.008) * 8 + random() * 6;
                for (let dy = 0; dy < 40; dy += 4) {
                    this.drawPixel(x, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }
    drawSpinifex(x, y, size) {
        // Spiky circular desert grass
        const random = this.seededRandom(x * y);
        const blades = 12;
        for (let i = 0; i < blades; i++) {
            const angle = (i / blades) * Math.PI * 2;
            const length = size * (0.6 + random() * 0.4);
            for (let j = 0; j < length; j += 4) {
                const px = x + Math.cos(angle) * j;
                const py = y - Math.sin(angle) * j * 0.3 - j * 0.5;
                const color = j < length / 2 ? '#9ACD32' : '#BDB76B';
                this.drawPixel(px, py, 4, color);
            }
        }
    }
    drawDesertPlant(x, y) {
        const random = this.seededRandom(x);
        // Small succulent or cactus
        if (random() > 0.5) {
            // Small cactus
            this.drawPixel(x, y - 4, 4, '#2E8B57');
            this.drawPixel(x, y - 8, 4, '#3CB371');
            this.drawPixel(x, y - 12, 4, '#2E8B57');
            this.drawPixel(x - 4, y - 8, 4, '#3CB371');
            this.drawPixel(x + 4, y - 8, 4, '#3CB371');
        }
        else {
            // Small shrub
            this.drawPixel(x, y - 4, 4, '#6B8E23');
            this.drawPixel(x - 4, y - 8, 4, '#556B2F');
            this.drawPixel(x + 4, y - 8, 4, '#6B8E23');
            this.drawPixel(x, y - 12, 4, '#556B2F');
        }
    }
    drawSmallRock(x, y) {
        const colors = ['#8B7355', '#A08060', '#6B5344'];
        const random = this.seededRandom(x * y);
        this.drawPixel(x, y, 4, colors[Math.floor(random() * colors.length)]);
        this.drawPixel(x + 4, y, 4, colors[Math.floor(random() * colors.length)]);
        this.drawPixel(x, y - 4, 4, colors[Math.floor(random() * colors.length)]);
    }
    drawGroundCracks(x, y) {
        const random = this.seededRandom(x * y);
        const length = 20 + random() * 30;
        let currentX = x;
        let currentY = y;
        for (let i = 0; i < length; i += 4) {
            this.drawPixel(currentX, currentY, 2, '#8B7355');
            currentX += (random() - 0.4) * 6;
            currentY += random() * 4;
            // Occasional branches
            if (random() > 0.8) {
                this.drawPixel(currentX + 4, currentY - 2, 2, '#8B7355');
                this.drawPixel(currentX + 8, currentY - 4, 2, '#8B7355');
            }
        }
    }
    drawBones(x, y) {
        // Simple bone shapes
        this.drawPixel(x, y, 4, '#F5F5DC');
        this.drawPixel(x + 4, y, 4, '#F5F5DC');
        this.drawPixel(x + 8, y, 4, '#F5F5DC');
        this.drawPixel(x + 12, y, 4, '#F5F5DC');
        this.drawPixel(x - 4, y - 4, 4, '#F5F5DC');
        this.drawPixel(x + 16, y - 4, 4, '#F5F5DC');
    }
    lightenColor(color, amount) {
        const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount);
        const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount);
        const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    darkenColor(color, amount) {
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount);
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount);
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
//# sourceMappingURL=DesertBiome.js.map