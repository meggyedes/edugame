// Forest Biome - Europe (Európa - Erdő)
// Temperate forest with pine and deciduous trees
import { BaseBiome } from './BaseBiome.js';
export class ForestBiome extends BaseBiome {
    constructor(width = 2000, height = 800) {
        super({
            name: 'forest',
            continent: 'europe',
            width,
            height,
            groundColor: '#2D5A27',
            skyColors: ['#87CEEB', '#B0E0E6', '#E0F0FF']
        });
    }
    renderBackground() {
        const random = this.seededRandom(12345);
        const mountainY = this.config.height * 0.25;
        // Distant mountains with trees
        for (let i = 0; i < 8; i++) {
            const x = i * (this.config.width / 7) - 50;
            const peakHeight = 150 + random() * 100;
            this.drawPixelMountainWithTrees(x, mountainY, 350, peakHeight, '#2F4F2F', '#1B3B1B', 6);
        }
    }
    renderMidground() {
        const random = this.seededRandom(23456);
        const treeY = this.config.height * 0.35;
        // Mid-layer dense forest
        for (let i = 0; i < 25; i++) {
            const x = random() * this.config.width;
            const treeHeight = 120 + random() * 60;
            const isPine = random() > 0.4;
            if (isPine) {
                this.drawPixelPineTree(x, treeY + random() * 50, treeHeight, '#1E5631', '#2D7A4A', 4);
            }
            else {
                this.drawPixelDeciduousTree(x, treeY + random() * 50, treeHeight, '#228B22', '#32CD32', 4);
            }
        }
    }
    renderForeground() {
        const random = this.seededRandom(34567);
        const groundY = this.config.height * 0.75;
        // Ground grass layers
        this.drawGrassLayers(groundY);
        // Foreground trees (larger, more detailed)
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            const treeHeight = 180 + random() * 100;
            const isPine = random() > 0.5;
            if (isPine) {
                this.drawPixelPineTree(x, groundY - 20, treeHeight, '#0B3D0B', '#1A5C1A', 4);
            }
            else {
                this.drawPixelDeciduousTree(x, groundY - 20, treeHeight, '#1B5E20', '#2E7D32', 4);
            }
        }
    }
    renderDetails() {
        const random = this.seededRandom(45678);
        const groundY = this.config.height * 0.75;
        // Rocks
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawPixelRock(x, groundY + 10 + random() * 20, 15 + random() * 20);
        }
        // Small bushes
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            this.drawPixelBush(x, groundY + 5, 20 + random() * 15, '#2E7D32');
        }
        // Flowers
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FFFFFF'];
            this.drawPixelFlower(x, groundY + 10 + random() * 30, colors[Math.floor(random() * colors.length)]);
        }
        // Grass blades
        this.drawGrassBlades(groundY);
    }
    drawPixelMountainWithTrees(x, y, width, height, color1, color2, pixelSize) {
        const centerX = x + width / 2;
        // Mountain shape
        for (let row = 0; row < height; row += pixelSize) {
            const rowWidth = (width * (height - row)) / height;
            const startX = centerX - rowWidth / 2;
            for (let col = 0; col < rowWidth; col += pixelSize) {
                const shade = (col / rowWidth > 0.5) ? color2 : color1;
                this.drawPixel(startX + col, y + row, pixelSize, shade);
            }
        }
        // Tree silhouettes on mountain
        const random = this.seededRandom(x * 100);
        for (let i = 0; i < 15; i++) {
            const treeX = x + random() * width;
            const treeY = y + height * 0.3 + random() * height * 0.5;
            this.drawMiniPineTree(treeX, treeY, 20 + random() * 15, '#1B3B1B', pixelSize);
        }
    }
    drawMiniPineTree(x, y, height, color, pixelSize) {
        const layers = 3;
        for (let i = 0; i < layers; i++) {
            const layerY = y - i * (height / layers);
            const layerWidth = (height / 2) * (1 - i * 0.2);
            for (let row = 0; row < height / layers; row += pixelSize) {
                const rowWidth = layerWidth * (1 - row / (height / layers));
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += pixelSize) {
                    this.drawPixel(x + col, layerY - row, pixelSize, color);
                }
            }
        }
    }
    drawPixelPineTree(x, y, height, darkColor, lightColor, pixelSize) {
        // Trunk
        const trunkWidth = height / 10;
        const trunkHeight = height / 4;
        this.drawPixelRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight, '#4A3728', pixelSize);
        this.drawPixelRect(x - trunkWidth / 4, y, trunkWidth / 2, trunkHeight, '#5D4037', pixelSize);
        // Pine layers (triangle shapes)
        const layers = 4;
        for (let i = 0; i < layers; i++) {
            const layerY = y - trunkHeight / 2 - i * (height / (layers + 1));
            const layerHeight = height / (layers + 1) + 20;
            const baseWidth = (height / 2) * (1 - i * 0.15);
            for (let row = 0; row < layerHeight; row += pixelSize) {
                const rowWidth = baseWidth * (1 - row / layerHeight);
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += pixelSize) {
                    const color = col < 0 ? darkColor : lightColor;
                    this.drawPixel(x + col, layerY - row, pixelSize, color);
                }
            }
        }
    }
    drawPixelDeciduousTree(x, y, height, darkColor, lightColor, pixelSize) {
        // Trunk
        const trunkWidth = height / 8;
        const trunkHeight = height / 3;
        this.drawPixelRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight, '#5D4037', pixelSize);
        this.drawPixelRect(x - trunkWidth / 4, y, trunkWidth / 2, trunkHeight, '#795548', pixelSize);
        // Crown (rounded top)
        const crownY = y - trunkHeight / 2;
        const crownRadius = height / 2.5;
        for (let row = 0; row < crownRadius * 2; row += pixelSize) {
            const normalizedRow = (row - crownRadius) / crownRadius;
            const rowWidth = crownRadius * Math.sqrt(1 - normalizedRow * normalizedRow) * 2;
            if (rowWidth > 0) {
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += pixelSize) {
                    const color = (col + normalizedRow * 20) < 0 ? darkColor : lightColor;
                    this.drawPixel(x + col, crownY - row + crownRadius, pixelSize, color);
                }
            }
        }
    }
    drawGrassLayers(groundY) {
        // Multiple grass color layers
        const layers = [
            { y: groundY, color: '#2D5A27', height: 100 },
            { y: groundY + 20, color: '#3D7A37', height: 80 },
            { y: groundY + 40, color: '#4D9A47', height: 60 }
        ];
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 4) {
                const variation = Math.sin(x * 0.02) * 10 + random() * 10;
                this.drawPixel(x, layer.y + variation, 4, layer.color);
                this.drawPixel(x, layer.y + variation + 4, 4, layer.color);
                this.drawPixel(x, layer.y + variation + 8, 4, layer.color);
            }
        });
    }
    drawGrassBlades(groundY) {
        const random = this.seededRandom(56789);
        for (let x = 0; x < this.config.width; x += 8) {
            const bladeHeight = 15 + random() * 25;
            const shade = random() > 0.5 ? '#1B5E20' : '#2E7D32';
            // Blade shape
            for (let i = 0; i < bladeHeight; i += 4) {
                const sway = Math.sin((x + i) * 0.1) * 2;
                this.drawPixel(x + sway, groundY - i, 4, shade);
            }
        }
    }
    drawPixelRock(x, y, size) {
        const colors = ['#696969', '#808080', '#5A5A5A', '#707070'];
        const random = this.seededRandom(x * y);
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.5, 2) * 2);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                this.drawPixel(x + col, y - row, 4, colors[Math.floor(random() * colors.length)]);
            }
        }
    }
    drawPixelBush(x, y, size, color) {
        const random = this.seededRandom(x * 100);
        const darkColor = '#1B5E20';
        for (let i = 0; i < 5; i++) {
            const blobX = x + (random() - 0.5) * size;
            const blobY = y - random() * size / 2;
            const blobSize = size / 3 + random() * 10;
            for (let row = 0; row < blobSize; row += 4) {
                const rowWidth = blobSize * Math.sin((row / blobSize) * Math.PI);
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                    this.drawPixel(blobX + col, blobY + row - blobSize / 2, 4, random() > 0.4 ? color : darkColor);
                }
            }
        }
    }
    drawPixelFlower(x, y, color) {
        // Stem
        this.drawPixel(x, y - 4, 4, '#228B22');
        this.drawPixel(x, y - 8, 4, '#228B22');
        // Petals
        this.drawPixel(x, y - 12, 4, color);
        this.drawPixel(x - 4, y - 12, 4, color);
        this.drawPixel(x + 4, y - 12, 4, color);
        this.drawPixel(x, y - 16, 4, color);
        // Center
        this.drawPixel(x, y - 12, 4, '#FFD700');
    }
}
//# sourceMappingURL=ForestBiome.js.map