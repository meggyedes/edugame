// Arctic/Tundra Biome - Antarctica (Antarktisz - Sarkvidék)
// Icy landscape with snow, glaciers, and frozen terrain

import { BaseBiome } from './BaseBiome.js';

export class ArcticBiome extends BaseBiome {
    constructor(width: number = 2000, height: number = 800) {
        super({
            name: 'arctic',
            continent: 'antarctica',
            width,
            height,
            groundColor: '#E8F4F8',
            skyColors: ['#1E3A5F', '#3D5A80', '#98C1D9', '#E0FBFC']
        });
    }

    protected renderSky(): void {
        // Aurora borealis inspired gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.6);
        gradient.addColorStop(0, '#1A2F4A');
        gradient.addColorStop(0.2, '#2D4A6A');
        gradient.addColorStop(0.4, '#4A7A9A');
        gradient.addColorStop(0.7, '#7AB8D4');
        gradient.addColorStop(1, '#C8E6F0');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.6);
        
        // Aurora effect
        this.drawAurora();
        
        // Distant pale sun
        this.drawArcticSun(this.config.width * 0.15, this.config.height * 0.18);
    }

    protected renderBackground(): void {
        const random = this.seededRandom(11111);
        
        // Distant mountains/glaciers
        for (let i = 0; i < 8; i++) {
            const x = i * (this.config.width / 6) - 100;
            const height = 100 + random() * 80;
            this.drawIceMountain(x, this.config.height * 0.35, 350, height, '#A8C8D8', '#789CAB');
        }
        
        // Floating icebergs in background
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawDistantIceberg(x, this.config.height * 0.45, 60 + random() * 40);
        }
    }

    protected renderMidground(): void {
        const random = this.seededRandom(22222);
        
        // Mid-distance ice shelf
        this.drawIceShelf(this.config.height * 0.5);
        
        // Ice formations
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            this.drawIceFormation(x, this.config.height * 0.55, 40 + random() * 30);
        }
        
        // Snow drifts
        for (let i = 0; i < 8; i++) {
            const x = i * (this.config.width / 6) - 50;
            this.drawSnowDrift(x, this.config.height * 0.6, 300, 30);
        }
    }

    protected renderForeground(): void {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        
        // Main snow ground
        this.drawSnowGround(groundY);
        
        // Large ice blocks
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawIceBlock(x, groundY + 10, 50 + random() * 40);
        }
        
        // Snow mounds
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            this.drawSnowMound(x, groundY + 5, 80 + random() * 60);
        }
    }

    protected renderDetails(): void {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        
        // Small ice crystals
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            this.drawIceCrystal(x, groundY - 10 + random() * 20);
        }
        
        // Snow particles on ground
        this.drawSnowParticles(groundY);
        
        // Cracks in ice
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            this.drawIceCracks(x, groundY + 20 + random() * 40);
        }
        
        // Sparse tundra vegetation (very minimal)
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawTundraGrass(x, groundY + 10);
        }
        
        // Footprints
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawFootprints(x, groundY + 25 + random() * 30);
        }
    }

    private drawAurora(): void {
        const random = this.seededRandom(99999);
        const auroraY = this.config.height * 0.1;
        
        // Wavy aurora bands
        for (let band = 0; band < 3; band++) {
            const bandY = auroraY + band * 30;
            const colors = ['rgba(0, 255, 128, 0.15)', 'rgba(0, 200, 255, 0.1)', 'rgba(128, 255, 200, 0.12)'];
            
            this.ctx.fillStyle = colors[band]!;
            
            for (let x = 0; x < this.config.width; x += 8) {
                const wave = Math.sin(x * 0.01 + band * 2) * 20 + Math.sin(x * 0.02) * 10;
                const height = 40 + random() * 20;
                this.ctx.fillRect(x, bandY + wave, 8, height);
            }
        }
    }

    private drawArcticSun(x: number, y: number): void {
        // Pale winter sun
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 80);
        gradient.addColorStop(0, 'rgba(255, 255, 240, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 220, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 80, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sun core
        for (let r = 25; r > 0; r -= 4) {
            this.ctx.fillStyle = `rgba(255, 255, ${230 + (25 - r) * 2}, ${0.6 + (25 - r) / 25 * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private drawIceMountain(x: number, y: number, width: number, height: number, lightColor: string, shadowColor: string): void {
        const centerX = x + width / 2;
        
        for (let row = 0; row < height; row += 6) {
            const rowWidth = (width * (height - row)) / height;
            
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 6) {
                // Light on left side, shadow on right
                const color = col < 0 ? lightColor : shadowColor;
                this.drawPixel(centerX + col, y + row, 6, color);
            }
        }
        
        // Snow caps
        for (let row = 0; row < height * 0.3; row += 6) {
            const rowWidth = (width * 0.6 * (height * 0.3 - row)) / (height * 0.3);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 6) {
                this.drawPixel(centerX + col, y + row, 6, '#FFFFFF');
            }
        }
    }

    private drawDistantIceberg(x: number, y: number, size: number): void {
        const colors = ['#E8F4F8', '#D4E8F0', '#C8DCE8'];
        
        // Irregular iceberg shape
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - row / size) * (0.7 + Math.sin(row * 0.2) * 0.3);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                const colorIdx = Math.floor(row / size * colors.length);
                this.drawPixel(x + col, y - row, 4, colors[Math.min(colorIdx, colors.length - 1)]!);
            }
        }
    }

    private drawIceShelf(y: number): void {
        const random = this.seededRandom(12345);
        
        for (let x = 0; x < this.config.width; x += 4) {
            const shelfHeight = 20 + Math.sin(x * 0.01) * 10 + random() * 5;
            
            for (let row = 0; row < shelfHeight; row += 4) {
                const color = row < shelfHeight / 2 ? '#D4E8F0' : '#B8D4E4';
                this.drawPixel(x, y + row, 4, color);
            }
        }
    }

    private drawIceFormation(x: number, y: number, size: number): void {
        // Jagged ice spire
        const spikes = 3;
        
        for (let i = 0; i < spikes; i++) {
            const spikeX = x + (i - 1) * size * 0.4;
            const spikeHeight = size * (0.6 + Math.abs(i - 1) * 0.4);
            
            for (let row = 0; row < spikeHeight; row += 4) {
                const rowWidth = size * 0.3 * (1 - row / spikeHeight);
                for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                    const color = col < 0 ? '#E8F8FF' : '#B8D8E8';
                    this.drawPixel(spikeX + col, y - row, 4, color);
                }
            }
        }
    }

    private drawSnowDrift(x: number, y: number, width: number, height: number): void {
        for (let col = 0; col < width; col += 4) {
            const driftY = Math.sin((col / width) * Math.PI) * height;
            
            for (let row = 0; row < driftY; row += 4) {
                const color = row < driftY * 0.5 ? '#FFFFFF' : '#E8F0F8';
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
    }

    private drawSnowGround(groundY: number): void {
        const layers = [
            { y: groundY - 15, color: '#FFFFFF' },
            { y: groundY, color: '#F0F8FF' },
            { y: groundY + 20, color: '#E8F0F8' },
            { y: groundY + 50, color: '#D8E8F0' }
        ];
        
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 4) {
                const variation = Math.sin(x * 0.015) * 8 + random() * 5;
                for (let dy = 0; dy < 50; dy += 4) {
                    this.drawPixel(x, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }

    private drawIceBlock(x: number, y: number, size: number): void {
        const lightColor = '#E8FFFF';
        const midColor = '#C8E8F8';
        const darkColor = '#A8C8D8';
        
        // Block shape
        for (let row = 0; row < size; row += 4) {
            for (let col = 0; col < size * 1.2; col += 4) {
                let color: string;
                if (row < size * 0.3) {
                    color = lightColor;
                } else if (col < size * 0.6) {
                    color = midColor;
                } else {
                    color = darkColor;
                }
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
    }

    private drawSnowMound(x: number, y: number, width: number): void {
        const height = width * 0.3;
        
        for (let col = 0; col < width; col += 4) {
            const moundY = Math.sin((col / width) * Math.PI) * height;
            
            for (let row = 0; row < moundY; row += 4) {
                const brightness = row / moundY;
                const color = brightness < 0.5 ? '#FFFFFF' : '#F0F8FF';
                this.drawPixel(x + col - width / 2, y - row, 4, color);
            }
        }
    }

    private drawIceCrystal(x: number, y: number): void {
        // Simple sparkle/crystal
        this.drawPixel(x, y, 4, '#E8FFFF');
        this.drawPixel(x - 4, y, 4, '#FFFFFF');
        this.drawPixel(x + 4, y, 4, '#FFFFFF');
        this.drawPixel(x, y - 4, 4, '#FFFFFF');
        this.drawPixel(x, y + 4, 4, '#D8F0FF');
    }

    private drawSnowParticles(groundY: number): void {
        const random = this.seededRandom(77777);
        
        for (let i = 0; i < 100; i++) {
            const x = random() * this.config.width;
            const y = groundY - 20 + random() * 80;
            const size = random() > 0.7 ? 4 : 2;
            this.drawPixel(x, y, size, '#FFFFFF');
        }
    }

    private drawIceCracks(x: number, y: number): void {
        const random = this.seededRandom(x * y);
        let currentX = x;
        let currentY = y;
        
        for (let i = 0; i < 15; i++) {
            this.drawPixel(currentX, currentY, 2, '#A8D0E8');
            currentX += (random() - 0.5) * 8;
            currentY += random() * 6;
            
            if (random() > 0.7) {
                // Branch
                this.drawPixel(currentX + 6, currentY - 4, 2, '#A8D0E8');
            }
        }
    }

    private drawTundraGrass(x: number, y: number): void {
        const random = this.seededRandom(x);
        
        // Very sparse, hardy vegetation
        for (let i = 0; i < 4; i++) {
            const bladeX = x + (random() - 0.5) * 15;
            const bladeHeight = 8 + random() * 8;
            
            for (let j = 0; j < bladeHeight; j += 4) {
                this.drawPixel(bladeX, y - j, 4, '#5D6D5D');
            }
        }
    }

    private drawFootprints(x: number, y: number): void {
        // Penguin/animal footprints
        for (let i = 0; i < 5; i++) {
            const fx = x + i * 20;
            const fy = y + (i % 2) * 8;
            this.drawPixel(fx, fy, 4, '#D0E0E8');
            this.drawPixel(fx + 4, fy - 2, 4, '#D0E0E8');
            this.drawPixel(fx - 4, fy - 2, 4, '#D0E0E8');
        }
    }
}
