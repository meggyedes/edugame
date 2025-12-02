// Jungle/Rainforest Biome - South America (Dél-Amerika - Esőerdő)
// Dense tropical rainforest with vines and exotic plants

import { BaseBiome } from './BaseBiome.js';

export class JungleBiome extends BaseBiome {
    constructor(width: number = 2000, height: number = 800) {
        super({
            name: 'jungle',
            continent: 'south_america',
            width,
            height,
            groundColor: '#1B4D1B',
            skyColors: ['#4A90A4', '#6BB3C9', '#87CEEB']
        });
    }

    protected renderBackground(): void {
        const random = this.seededRandom(11111);
        
        // Misty background mountains
        for (let i = 0; i < 5; i++) {
            const x = i * (this.config.width / 4) - 100;
            const height = 200 + random() * 100;
            this.drawMistyMountain(x, this.config.height * 0.2, 500, height, '#2D5A4A', 0.5);
        }
        
        // Dense back layer of trees
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            const treeHeight = 150 + random() * 80;
            this.drawJungleTree(x, this.config.height * 0.35, treeHeight, '#1B4D3E', '#2D6A4F', 5, true);
        }
    }

    protected renderMidground(): void {
        const random = this.seededRandom(22222);
        
        // Mid layer trees with more detail
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            const treeHeight = 200 + random() * 100;
            this.drawJungleTree(x, this.config.height * 0.5, treeHeight, '#145A32', '#1E8449', 4, true);
        }
        
        // Large ferns
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawLargeFern(x, this.config.height * 0.55, 60 + random() * 40);
        }
    }

    protected renderForeground(): void {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        
        // Ground layers
        this.drawJungleGround(groundY);
        
        // Foreground massive trees
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            const treeHeight = 280 + random() * 120;
            this.drawJungleTree(x, groundY - 10, treeHeight, '#0B3D2E', '#145A32', 4, true);
        }
        
        // Vines hanging from trees
        for (let i = 0; i < 25; i++) {
            const x = random() * this.config.width;
            const startY = this.config.height * 0.1 + random() * 100;
            this.drawVine(x, startY, 150 + random() * 200);
        }
    }

    protected renderDetails(): void {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        
        // Exotic flowers
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            const flowerType = Math.floor(random() * 3);
            this.drawExoticFlower(x, groundY + random() * 30, flowerType);
        }
        
        // Small plants and ferns
        for (let i = 0; i < 40; i++) {
            const x = random() * this.config.width;
            this.drawSmallFern(x, groundY + 10, 20 + random() * 15);
        }
        
        // Mushrooms
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawMushroom(x, groundY + 15 + random() * 20);
        }
        
        // Fallen logs
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawFallenLog(x, groundY + 20);
        }
    }

    private drawMistyMountain(x: number, y: number, width: number, height: number, color: string, opacity: number): void {
        this.ctx.globalAlpha = opacity;
        
        const centerX = x + width / 2;
        for (let row = 0; row < height; row += 6) {
            const rowWidth = (width * (height - row)) / height;
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 6) {
                this.drawPixel(centerX + col, y + row, 6, color);
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    private drawJungleTree(x: number, y: number, height: number, darkColor: string, lightColor: string, pixelSize: number, hasCanopy: boolean): void {
        // Thick trunk with buttress roots
        const trunkWidth = height / 6;
        const trunkHeight = height / 2;
        
        // Buttress roots
        for (let i = 0; i < 3; i++) {
            const rootX = x + (i - 1) * trunkWidth * 0.8;
            const rootHeight = trunkHeight / 3;
            for (let row = 0; row < rootHeight; row += pixelSize) {
                const rootWidth = (trunkWidth / 2) * (1 - row / rootHeight);
                for (let col = -rootWidth / 2; col < rootWidth / 2; col += pixelSize) {
                    this.drawPixel(rootX + col, y - row, pixelSize, '#3E2723');
                }
            }
        }
        
        // Main trunk
        this.drawPixelRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight, '#4E342E', pixelSize);
        this.drawPixelRect(x - trunkWidth / 3, y - trunkHeight, trunkWidth / 3, trunkHeight, '#5D4037', pixelSize);
        
        if (hasCanopy) {
            // Large spreading canopy
            const canopyY = y - trunkHeight;
            const canopyWidth = height * 0.8;
            const canopyHeight = height * 0.6;
            
            // Multiple canopy layers
            for (let layer = 0; layer < 3; layer++) {
                const layerY = canopyY - layer * (canopyHeight / 4);
                const layerWidth = canopyWidth * (1 - layer * 0.2);
                
                for (let row = 0; row < canopyHeight / 3; row += pixelSize) {
                    const rowWidth = layerWidth * (1 - Math.abs(row - canopyHeight / 6) / (canopyHeight / 3));
                    for (let col = -rowWidth / 2; col < rowWidth / 2; col += pixelSize) {
                        const color = (col < 0 || row < canopyHeight / 6) ? darkColor : lightColor;
                        this.drawPixel(x + col, layerY - row, pixelSize, color);
                    }
                }
            }
        }
    }

    private drawLargeFern(x: number, y: number, size: number): void {
        const fronds = 7;
        
        for (let i = 0; i < fronds; i++) {
            const angle = (i / fronds) * Math.PI - Math.PI / 2;
            const frondLength = size * (0.6 + Math.abs(Math.cos(angle)) * 0.4);
            
            for (let j = 0; j < frondLength; j += 4) {
                const px = x + Math.cos(angle) * j;
                const py = y - Math.sin(angle) * j * 0.5 - j * 0.3;
                const color = j < frondLength / 2 ? '#1B5E20' : '#2E7D32';
                this.drawPixel(px, py, 4, color);
                
                // Leaflets
                if (j > 10 && j % 8 === 0) {
                    this.drawPixel(px - 4, py - 2, 4, color);
                    this.drawPixel(px + 4, py - 2, 4, color);
                }
            }
        }
    }

    private drawVine(x: number, startY: number, length: number): void {
        const random = this.seededRandom(x * startY);
        let currentX = x;
        
        for (let i = 0; i < length; i += 4) {
            currentX += (random() - 0.5) * 6;
            const color = random() > 0.3 ? '#2E7D32' : '#1B5E20';
            this.drawPixel(currentX, startY + i, 4, color);
            
            // Occasional leaves on vine
            if (random() > 0.9) {
                this.drawPixel(currentX - 8, startY + i, 4, '#4CAF50');
                this.drawPixel(currentX - 4, startY + i - 4, 4, '#4CAF50');
            }
        }
    }

    private drawJungleGround(groundY: number): void {
        // Multiple layers of ground vegetation
        const layers = [
            { y: groundY - 20, color: '#145A32' },
            { y: groundY, color: '#1B4D1B' },
            { y: groundY + 10, color: '#0D3D1B' },
            { y: groundY + 30, color: '#0A2F14' }
        ];
        
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 4) {
                const variation = Math.sin(x * 0.03) * 8 + random() * 8;
                for (let dy = 0; dy < 30; dy += 4) {
                    this.drawPixel(x, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }

    private drawExoticFlower(x: number, y: number, type: number): void {
        const colors = [
            { petals: '#FF4081', center: '#FFD700' }, // Pink orchid
            { petals: '#FF5722', center: '#FFC107' }, // Orange bird of paradise
            { petals: '#9C27B0', center: '#E1BEE7' }  // Purple passion flower
        ];
        
        const flower = colors[type]!;
        
        // Stem
        this.drawPixel(x, y - 4, 4, '#2E7D32');
        this.drawPixel(x, y - 8, 4, '#2E7D32');
        this.drawPixel(x, y - 12, 4, '#2E7D32');
        
        // Large petals
        this.drawPixel(x, y - 20, 4, flower.petals);
        this.drawPixel(x - 8, y - 16, 4, flower.petals);
        this.drawPixel(x + 8, y - 16, 4, flower.petals);
        this.drawPixel(x - 4, y - 16, 4, flower.petals);
        this.drawPixel(x + 4, y - 16, 4, flower.petals);
        this.drawPixel(x, y - 24, 4, flower.petals);
        
        // Center
        this.drawPixel(x, y - 16, 4, flower.center);
    }

    private drawSmallFern(x: number, y: number, size: number): void {
        const fronds = 5;
        for (let i = 0; i < fronds; i++) {
            const angle = (i / fronds) * Math.PI * 0.8 + Math.PI * 0.1;
            for (let j = 0; j < size; j += 4) {
                const px = x + Math.cos(angle) * j * 0.8;
                const py = y - j;
                this.drawPixel(px, py, 4, '#2E7D32');
            }
        }
    }

    private drawMushroom(x: number, y: number): void {
        // Stem
        this.drawPixel(x, y - 4, 4, '#E0E0E0');
        this.drawPixel(x, y - 8, 4, '#E0E0E0');
        
        // Cap
        this.drawPixel(x - 8, y - 12, 4, '#D32F2F');
        this.drawPixel(x - 4, y - 12, 4, '#D32F2F');
        this.drawPixel(x, y - 12, 4, '#D32F2F');
        this.drawPixel(x + 4, y - 12, 4, '#D32F2F');
        this.drawPixel(x + 8, y - 12, 4, '#D32F2F');
        this.drawPixel(x - 4, y - 16, 4, '#D32F2F');
        this.drawPixel(x, y - 16, 4, '#D32F2F');
        this.drawPixel(x + 4, y - 16, 4, '#D32F2F');
        
        // White spots
        this.drawPixel(x - 4, y - 12, 4, '#FFFFFF');
        this.drawPixel(x + 4, y - 16, 4, '#FFFFFF');
    }

    private drawFallenLog(x: number, y: number): void {
        const length = 80;
        const height = 20;
        
        for (let col = 0; col < length; col += 4) {
            for (let row = 0; row < height; row += 4) {
                const color = row < height / 2 ? '#5D4037' : '#3E2723';
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
        
        // Moss on log
        for (let col = 0; col < length; col += 8) {
            this.drawPixel(x + col, y - height, 4, '#4CAF50');
            this.drawPixel(x + col + 4, y - height - 4, 4, '#388E3C');
        }
    }
}
