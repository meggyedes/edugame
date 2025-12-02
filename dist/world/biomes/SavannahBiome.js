// Savannah Biome - Africa (Afrika - Szavanna)
// Open grassland with acacia trees and warm sunset colors
import { BaseBiome } from './BaseBiome.js';
export class SavannahBiome extends BaseBiome {
    constructor(width = 2000, height = 800) {
        super({
            name: 'savannah',
            continent: 'africa',
            width,
            height,
            groundColor: '#C4A44D',
            skyColors: ['#FF7F50', '#FFB347', '#FFD700', '#87CEEB']
        });
    }
    renderSky() {
        // Warm sunset gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.7);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.2, '#FF8C42');
        gradient.addColorStop(0.4, '#FFB347');
        gradient.addColorStop(0.7, '#FFE4B5');
        gradient.addColorStop(1, '#FFF8DC');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.7);
        // Sun
        this.drawSun(this.config.width * 0.8, this.config.height * 0.15);
    }
    renderBackground() {
        const random = this.seededRandom(11111);
        // Distant hills
        for (let i = 0; i < 6; i++) {
            const x = i * (this.config.width / 5) - 100;
            const hillHeight = 60 + random() * 40;
            this.drawDistantHill(x, this.config.height * 0.45, 400, hillHeight, '#D4A76A');
        }
        // Very distant acacia silhouettes
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawAcaciaTree(x, this.config.height * 0.42, 60 + random() * 30, '#8B7355', '#8B7355', 4, true);
        }
    }
    renderMidground() {
        const random = this.seededRandom(22222);
        // Mid-distance hills
        for (let i = 0; i < 4; i++) {
            const x = i * (this.config.width / 3) - 50;
            const hillHeight = 40 + random() * 30;
            this.drawDistantHill(x, this.config.height * 0.55, 500, hillHeight, '#C9A857');
        }
        // Mid-distance acacia trees
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            const treeHeight = 100 + random() * 50;
            this.drawAcaciaTree(x, this.config.height * 0.58, treeHeight, '#5D4037', '#4E7A4E', 4, false);
        }
        // Tall grass patches
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            this.drawTallGrass(x, this.config.height * 0.6, 40 + random() * 30, '#B8A042');
        }
    }
    renderForeground() {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        // Main ground
        this.drawSavannahGround(groundY);
        // Foreground acacia trees (larger)
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            const treeHeight = 180 + random() * 80;
            this.drawAcaciaTree(x, groundY - 10, treeHeight, '#3E2723', '#2E5A2E', 4, false);
        }
        // Termite mounds
        for (let i = 0; i < 4; i++) {
            const x = random() * this.config.width;
            this.drawTermiteMound(x, groundY + 10, 30 + random() * 20);
        }
    }
    renderDetails() {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        // Tall golden grass throughout
        this.drawGoldenGrass(groundY);
        // Rocks
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            this.drawSavannahRock(x, groundY + 10 + random() * 20, 15 + random() * 25);
        }
        // Small shrubs
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawDryShrub(x, groundY + 5, 15 + random() * 10);
        }
        // Animal tracks (optional detail)
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawAnimalTracks(x, groundY + 30 + random() * 30);
        }
    }
    drawSun(x, y) {
        // Sun glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 100);
        gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 100, 50, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 80, 50, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 100, 0, Math.PI * 2);
        this.ctx.fill();
        // Sun core
        for (let r = 40; r > 0; r -= 4) {
            const intensity = (40 - r) / 40;
            const color = `rgb(${255}, ${200 + intensity * 55}, ${50 + intensity * 100})`;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    drawDistantHill(x, y, width, height, color) {
        for (let col = 0; col < width; col += 4) {
            const hillY = Math.sin((col / width) * Math.PI) * height;
            for (let row = 0; row < hillY; row += 4) {
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
    }
    drawAcaciaTree(x, y, height, trunkColor, leafColor, pixelSize, isSilhouette) {
        // Trunk (thin and tall)
        const trunkWidth = height / 12;
        const trunkHeight = height * 0.6;
        // Slight curve in trunk
        for (let row = 0; row < trunkHeight; row += pixelSize) {
            const curve = Math.sin(row / trunkHeight * Math.PI * 0.3) * 5;
            this.drawPixelRect(x + curve - trunkWidth / 2, y - row, trunkWidth, pixelSize, trunkColor, pixelSize);
        }
        // Flat umbrella canopy
        const canopyY = y - trunkHeight;
        const canopyWidth = height * 0.9;
        const canopyHeight = height * 0.25;
        // Draw flat-topped canopy (iconic acacia shape)
        for (let layer = 0; layer < 3; layer++) {
            const layerY = canopyY - layer * (canopyHeight / 3);
            const layerWidth = canopyWidth * (1 - layer * 0.15);
            const layerHeight = canopyHeight / 4;
            for (let col = -layerWidth / 2; col < layerWidth / 2; col += pixelSize) {
                const edgeFade = Math.min(1, (layerWidth / 2 - Math.abs(col)) / 30);
                if (edgeFade > 0.3) {
                    for (let row = 0; row < layerHeight; row += pixelSize) {
                        const color = isSilhouette ? trunkColor : (row < layerHeight / 2 ? leafColor : this.darkenColor(leafColor, 20));
                        this.drawPixel(x + col, layerY - row, pixelSize, color);
                    }
                }
            }
        }
        // Add some branches if not silhouette
        if (!isSilhouette) {
            const branchY = y - trunkHeight * 0.4;
            this.drawPixelRect(x - canopyWidth * 0.3, branchY, canopyWidth * 0.15, pixelSize * 2, trunkColor, pixelSize);
            this.drawPixelRect(x + canopyWidth * 0.15, branchY - 10, canopyWidth * 0.15, pixelSize * 2, trunkColor, pixelSize);
        }
    }
    drawTallGrass(x, y, height, color) {
        const random = this.seededRandom(x * y);
        const blades = 8;
        for (let i = 0; i < blades; i++) {
            const bladeX = x + (random() - 0.5) * 30;
            const bladeHeight = height * (0.6 + random() * 0.4);
            const sway = (random() - 0.5) * 10;
            for (let j = 0; j < bladeHeight; j += 4) {
                const swayOffset = (j / bladeHeight) * sway;
                this.drawPixel(bladeX + swayOffset, y - j, 4, j < bladeHeight * 0.7 ? color : this.lightenColor(color, 30));
            }
            // Seed head at top
            if (random() > 0.5) {
                this.drawPixel(bladeX + sway, y - bladeHeight - 4, 4, '#D4C098');
                this.drawPixel(bladeX + sway, y - bladeHeight - 8, 4, '#D4C098');
            }
        }
    }
    drawSavannahGround(groundY) {
        // Dry earth layers
        const layers = [
            { y: groundY - 10, color: '#C9A857' },
            { y: groundY, color: '#C4A44D' },
            { y: groundY + 15, color: '#B8944D' },
            { y: groundY + 40, color: '#A8843D' }
        ];
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 4) {
                const variation = Math.sin(x * 0.01) * 5 + random() * 5;
                for (let dy = 0; dy < 40; dy += 4) {
                    this.drawPixel(x, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }
    drawTermiteMound(x, y, height) {
        const colors = ['#8B7355', '#A08060', '#8B7355'];
        for (let row = 0; row < height; row += 4) {
            const rowWidth = height * 0.6 * (1 - row / height);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                const colorIdx = Math.floor(Math.abs(col) / 10) % colors.length;
                this.drawPixel(x + col, y - row, 4, colors[colorIdx]);
            }
        }
        // Holes
        this.drawPixel(x, y - height * 0.3, 4, '#3E2723');
        this.drawPixel(x - 4, y - height * 0.5, 4, '#3E2723');
    }
    drawGoldenGrass(groundY) {
        const random = this.seededRandom(55555);
        for (let x = 0; x < this.config.width; x += 6) {
            const bladeHeight = 20 + random() * 35;
            const sway = (random() - 0.5) * 8;
            const colors = ['#C4A44D', '#D4B45D', '#B8944D', '#DAC47D'];
            for (let j = 0; j < bladeHeight; j += 4) {
                const swayOffset = (j / bladeHeight) * sway;
                const color = colors[Math.floor(random() * colors.length)];
                this.drawPixel(x + swayOffset, groundY - j, 4, color);
            }
        }
    }
    drawSavannahRock(x, y, size) {
        const colors = ['#8B7355', '#A08060', '#6B5344', '#7A6350'];
        const random = this.seededRandom(x * y);
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.5, 2) * 1.5);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                this.drawPixel(x + col, y - row, 4, colors[Math.floor(random() * colors.length)]);
            }
        }
    }
    drawDryShrub(x, y, size) {
        const random = this.seededRandom(x * 100);
        const branches = 6;
        for (let i = 0; i < branches; i++) {
            const angle = (i / branches) * Math.PI - Math.PI / 2;
            const length = size * (0.5 + random() * 0.5);
            for (let j = 0; j < length; j += 4) {
                const px = x + Math.cos(angle) * j;
                const py = y - Math.sin(angle) * j - j * 0.2;
                this.drawPixel(px, py, 4, '#6B5344');
            }
        }
        // Some dry leaves
        for (let i = 0; i < 5; i++) {
            const lx = x + (random() - 0.5) * size;
            const ly = y - random() * size * 0.8;
            this.drawPixel(lx, ly, 4, '#8B7355');
        }
    }
    drawAnimalTracks(x, y) {
        // Simple paw/hoof prints
        for (let i = 0; i < 4; i++) {
            const tx = x + i * 15;
            const ty = y + (i % 2) * 8;
            this.drawPixel(tx, ty, 4, '#8B7355');
            this.drawPixel(tx + 4, ty - 2, 4, '#8B7355');
        }
    }
    darkenColor(color, amount) {
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount);
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount);
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    lightenColor(color, amount) {
        const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount);
        const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount);
        const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
//# sourceMappingURL=SavannahBiome.js.map