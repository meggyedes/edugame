// Tundra/Northern Forest Biome - North America (Észak-Amerika - Tundra)
// Cold northern wilderness with evergreens, snow patches, and wildlife

import { BaseBiome } from './BaseBiome.js';

export class TundraBiome extends BaseBiome {
    constructor(width: number = 2000, height: number = 800) {
        super({
            name: 'tundra',
            continent: 'north_america',
            width,
            height,
            groundColor: '#4A5D4A',
            skyColors: ['#6B8E9F', '#89ABC4', '#A8C8DD', '#C8E0EE']
        });
    }

    protected renderSky(): void {
        // Cold northern sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.65);
        gradient.addColorStop(0, '#4A6A7F');
        gradient.addColorStop(0.3, '#6A8A9F');
        gradient.addColorStop(0.6, '#8AACBF');
        gradient.addColorStop(1, '#AAC8D8');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.65);
        
        // Northern sun (pale)
        this.drawNorthernSun(this.config.width * 0.75, this.config.height * 0.15);
        
        // Clouds
        this.drawClouds();
    }

    protected renderBackground(): void {
        const random = this.seededRandom(11111);
        
        // Snow-capped mountains
        for (let i = 0; i < 6; i++) {
            const x = i * (this.config.width / 5) - 100;
            const height = 120 + random() * 80;
            this.drawSnowMountain(x, this.config.height * 0.3, 400, height);
        }
        
        // Distant evergreen forest
        for (let i = 0; i < 35; i++) {
            const x = random() * this.config.width;
            const treeHeight = 80 + random() * 40;
            this.drawSpruceTree(x, this.config.height * 0.4, treeHeight, '#2A4A3A', '#3A5A4A', 5);
        }
    }

    protected renderMidground(): void {
        const random = this.seededRandom(22222);
        
        // Mid-distance trees
        for (let i = 0; i < 25; i++) {
            const x = random() * this.config.width;
            const treeHeight = 120 + random() * 60;
            this.drawSpruceTree(x, this.config.height * 0.55, treeHeight, '#1A3A2A', '#2A4A3A', 4);
        }
        
        // Snow patches
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawSnowPatch(x, this.config.height * 0.58, 100 + random() * 80);
        }
        
        // Bare birch trees (occasional)
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            this.drawBirchTree(x, this.config.height * 0.56, 100 + random() * 50);
        }
    }

    protected renderForeground(): void {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        
        // Main ground with snow patches
        this.drawTundraGround(groundY);
        
        // Foreground spruce trees
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            const treeHeight = 180 + random() * 100;
            this.drawSpruceTree(x, groundY - 10, treeHeight, '#0A2A1A', '#1A3A2A', 4);
        }
        
        // Large rocks
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            this.drawTundraRock(x, groundY + 10, 40 + random() * 30);
        }
        
        // Dead/fallen trees
        for (let i = 0; i < 3; i++) {
            const x = random() * this.config.width;
            this.drawFallenTree(x, groundY + 15);
        }
    }

    protected renderDetails(): void {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        
        // Hardy tundra plants
        for (let i = 0; i < 25; i++) {
            const x = random() * this.config.width;
            this.drawTundraPlant(x, groundY + 10 + random() * 20);
        }
        
        // Snow accumulation
        this.drawSnowAccumulation(groundY);
        
        // Berry bushes
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawBerryBush(x, groundY + 5, 20 + random() * 15);
        }
        
        // Small stones
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            this.drawSmallStone(x, groundY + 15 + random() * 35);
        }
        
        // Animal tracks in snow
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            this.drawAnimalTracks(x, groundY + 25 + random() * 30);
        }
    }

    private drawNorthernSun(x: number, y: number): void {
        // Pale northern sun
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 60);
        gradient.addColorStop(0, 'rgba(255, 250, 230, 0.9)');
        gradient.addColorStop(0.4, 'rgba(255, 245, 220, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 240, 210, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core
        for (let r = 20; r > 0; r -= 4) {
            this.ctx.fillStyle = `rgba(255, ${250 - r}, ${230 - r * 2}, ${0.7 + r / 40})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private drawClouds(): void {
        const random = this.seededRandom(12345);
        
        for (let i = 0; i < 5; i++) {
            const cx = random() * this.config.width;
            const cy = this.config.height * 0.1 + random() * this.config.height * 0.15;
            const cloudWidth = 100 + random() * 150;
            
            this.ctx.fillStyle = 'rgba(220, 230, 240, 0.6)';
            
            for (let j = 0; j < 5; j++) {
                const blobX = cx + (j - 2) * (cloudWidth / 5);
                const blobY = cy + (random() - 0.5) * 20;
                const blobSize = 20 + random() * 30;
                
                this.ctx.beginPath();
                this.ctx.arc(blobX, blobY, blobSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    private drawSnowMountain(x: number, y: number, width: number, height: number): void {
        const centerX = x + width / 2;
        
        // Mountain body
        for (let row = 0; row < height; row += 6) {
            const rowWidth = (width * (height - row)) / height;
            
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 6) {
                // Rock color at base, snow at top
                const isSnow = row < height * 0.5;
                const isLight = col < 0;
                
                let color: string;
                if (isSnow) {
                    color = isLight ? '#F0F8FF' : '#D8E8F0';
                } else {
                    color = isLight ? '#6A7A8A' : '#4A5A6A';
                }
                
                this.drawPixel(centerX + col, y + row, 6, color);
            }
        }
    }

    private drawSpruceTree(x: number, y: number, height: number, darkColor: string, lightColor: string, pixelSize: number): void {
        // Trunk
        const trunkWidth = height / 12;
        const trunkHeight = height / 5;
        this.drawPixelRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight, '#3E2723', pixelSize);
        
        // Conical foliage
        const layers = 5;
        for (let layer = 0; layer < layers; layer++) {
            const layerY = y - trunkHeight / 2 - layer * (height / (layers + 1));
            const layerHeight = height / (layers + 1) + 15;
            const baseWidth = (height / 2.5) * (1 - layer * 0.12);
            
            for (let row = 0; row < layerHeight; row += pixelSize) {
                const rowWidth = baseWidth * (1 - row / layerHeight);
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += pixelSize) {
                    const color = col < 0 ? darkColor : lightColor;
                    this.drawPixel(x + col, layerY - row, pixelSize, color);
                }
            }
        }
        
        // Snow on branches
        for (let layer = 0; layer < layers; layer++) {
            const layerY = y - trunkHeight / 2 - layer * (height / (layers + 1));
            const baseWidth = (height / 2.5) * (1 - layer * 0.12);
            
            // Snow patches
            for (let col = -baseWidth / 2; col < baseWidth / 2; col += pixelSize * 3) {
                if (Math.random() > 0.5) {
                    this.drawPixel(x + col, layerY, pixelSize, '#FFFFFF');
                }
            }
        }
    }

    private drawBirchTree(x: number, y: number, height: number): void {
        // White birch trunk
        const trunkWidth = 8;
        
        for (let row = 0; row < height; row += 4) {
            const curve = Math.sin(row * 0.02) * 3;
            this.drawPixel(x + curve - 2, y - row, 4, '#F5F5F5');
            this.drawPixel(x + curve + 2, y - row, 4, '#E8E8E8');
            
            // Black bark marks
            if (row % 20 < 4) {
                this.drawPixel(x + curve - 4, y - row, 4, '#3A3A3A');
                this.drawPixel(x + curve + 6, y - row, 4, '#3A3A3A');
            }
        }
        
        // Sparse branches at top
        const branchY = y - height * 0.7;
        this.drawPixelRect(x - 15, branchY, 12, 4, '#E8E8E8', 4);
        this.drawPixelRect(x + 5, branchY - 15, 12, 4, '#E8E8E8', 4);
    }

    private drawSnowPatch(x: number, y: number, width: number): void {
        const height = width * 0.2;
        
        for (let col = 0; col < width; col += 4) {
            const patchY = Math.sin((col / width) * Math.PI) * height;
            
            for (let row = 0; row < patchY; row += 4) {
                const color = row < patchY * 0.7 ? '#FFFFFF' : '#E8F0F8';
                this.drawPixel(x + col - width / 2, y - row, 4, color);
            }
        }
    }

    private drawTundraGround(groundY: number): void {
        // Mix of vegetation and snow
        const layers = [
            { y: groundY - 10, color: '#5A6D5A' },
            { y: groundY, color: '#4A5D4A' },
            { y: groundY + 20, color: '#3A4D3A' },
            { y: groundY + 50, color: '#2A3D2A' }
        ];
        
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let lx = 0; lx < this.config.width; lx += 4) {
                const variation = Math.sin(lx * 0.015) * 6 + random() * 5;
                for (let dy = 0; dy < 50; dy += 4) {
                    this.drawPixel(lx, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
        
        // Snow patches on ground
        const random = this.seededRandom(99999);
        for (let i = 0; i < 15; i++) {
            const px = random() * this.config.width;
            const pWidth = 30 + random() * 50;
            
            for (let col = 0; col < pWidth; col += 4) {
                const patchHeight = Math.sin((col / pWidth) * Math.PI) * 8;
                for (let row = 0; row < patchHeight; row += 4) {
                    this.drawPixel(px + col - pWidth / 2, groundY + random() * 20 - row, 4, '#F0F8FF');
                }
            }
        }
    }

    private drawTundraRock(x: number, y: number, size: number): void {
        const colors = ['#5A6A6A', '#6A7A7A', '#4A5A5A', '#5A6A70'];
        const random = this.seededRandom(x * y);
        
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.4, 2) * 1.5);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                this.drawPixel(x + col, y - row, 4, colors[Math.floor(random() * colors.length)]!);
            }
        }
        
        // Lichen on rock
        for (let i = 0; i < 3; i++) {
            const lx = x - size / 3 + random() * size * 0.6;
            const ly = y - size * 0.6 + random() * size * 0.3;
            this.drawPixel(lx, ly, 4, '#8A9A6A');
        }
    }

    private drawFallenTree(x: number, y: number): void {
        const length = 100;
        const height = 15;
        
        // Log
        for (let col = 0; col < length; col += 4) {
            for (let row = 0; row < height; row += 4) {
                const color = row < height / 2 ? '#5D4037' : '#3E2723';
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
        
        // Moss/lichen
        for (let col = 0; col < length; col += 8) {
            this.drawPixel(x + col, y - height, 4, '#6A8A5A');
            if (Math.random() > 0.5) {
                this.drawPixel(x + col + 4, y - height - 4, 4, '#5A7A4A');
            }
        }
        
        // Snow on log
        for (let col = 0; col < length; col += 12) {
            this.drawPixel(x + col, y - height + 4, 4, '#F0F8FF');
        }
    }

    private drawTundraPlant(x: number, y: number): void {
        const random = this.seededRandom(x);
        
        // Hardy low-growing plants
        for (let i = 0; i < 5; i++) {
            const lx = x + (random() - 0.5) * 15;
            const height = 8 + random() * 10;
            
            for (let j = 0; j < height; j += 4) {
                this.drawPixel(lx, y - j, 4, '#4A6A4A');
            }
        }
    }

    private drawSnowAccumulation(groundY: number): void {
        const random = this.seededRandom(88888);
        
        for (let x = 0; x < this.config.width; x += 8) {
            if (random() > 0.7) {
                const snowHeight = 4 + random() * 8;
                for (let j = 0; j < snowHeight; j += 4) {
                    this.drawPixel(x, groundY - 5 - j, 4, '#FFFFFF');
                }
            }
        }
    }

    private drawBerryBush(x: number, y: number, size: number): void {
        // Bush foliage
        const random = this.seededRandom(x * y);
        
        for (let i = 0; i < 8; i++) {
            const bx = x + (random() - 0.5) * size;
            const by = y - random() * size * 0.8;
            this.drawPixel(bx, by, 4, '#3A5A3A');
        }
        
        // Berries
        const berryColors = ['#C41E3A', '#8B0000', '#DC143C'];
        for (let i = 0; i < 4; i++) {
            const bx = x + (random() - 0.5) * size * 0.8;
            const by = y - 5 - random() * size * 0.5;
            this.drawPixel(bx, by, 4, berryColors[Math.floor(random() * berryColors.length)]!);
        }
    }

    private drawSmallStone(x: number, y: number): void {
        const colors = ['#6A7A7A', '#7A8A8A', '#5A6A6A'];
        const color = colors[Math.floor(Math.random() * colors.length)]!;
        
        this.drawPixel(x, y, 4, color);
        if (Math.random() > 0.5) {
            this.drawPixel(x + 4, y, 4, color);
        }
    }

    private drawAnimalTracks(x: number, y: number): void {
        // Paw prints in snow (wolf/bear style)
        for (let i = 0; i < 4; i++) {
            const tx = x + i * 25;
            const ty = y + (i % 2) * 10;
            
            // Main pad
            this.drawPixel(tx, ty, 4, '#E0E8F0');
            // Toe prints
            this.drawPixel(tx - 4, ty - 4, 4, '#E0E8F0');
            this.drawPixel(tx + 4, ty - 4, 4, '#E0E8F0');
            this.drawPixel(tx - 2, ty - 8, 4, '#E0E8F0');
            this.drawPixel(tx + 2, ty - 8, 4, '#E0E8F0');
        }
    }
}
