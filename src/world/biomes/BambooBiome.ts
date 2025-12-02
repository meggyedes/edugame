// Bamboo/Asian Forest Biome - Asia (Ázsia - Bambuszerdő)
// Misty bamboo forest with Asian aesthetic

import { BaseBiome } from './BaseBiome.js';

export class BambooBiome extends BaseBiome {
    constructor(width: number = 2000, height: number = 800) {
        super({
            name: 'bamboo',
            continent: 'asia',
            width,
            height,
            groundColor: '#3D5A3D',
            skyColors: ['#E8E4D8', '#D4D0C4', '#C0BCB0']
        });
    }

    protected renderSky(): void {
        // Misty, foggy sky typical of bamboo forests
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height * 0.7);
        gradient.addColorStop(0, '#E8E4D8');
        gradient.addColorStop(0.3, '#D8D4C8');
        gradient.addColorStop(0.6, '#C8C4B8');
        gradient.addColorStop(1, '#B8B4A8');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.7);
        
        // Fog layers
        this.drawFogLayers();
        
        // Distant mountains (Chinese painting style)
        this.drawDistantMountains();
    }

    protected renderBackground(): void {
        const random = this.seededRandom(11111);
        
        // Very distant bamboo silhouettes
        for (let i = 0; i < 40; i++) {
            const x = random() * this.config.width;
            this.drawBambooStalk(x, this.config.height * 0.35, 150 + random() * 80, '#8A9A7A', 5, true);
        }
    }

    protected renderMidground(): void {
        const random = this.seededRandom(22222);
        
        // Mid-layer bamboo
        for (let i = 0; i < 50; i++) {
            const x = random() * this.config.width;
            const height = 200 + random() * 100;
            this.drawBambooStalk(x, this.config.height * 0.55, height, '#5A7A4A', 4, false);
        }
        
        // Some ferns and undergrowth
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            this.drawFern(x, this.config.height * 0.58, 40 + random() * 30);
        }
    }

    protected renderForeground(): void {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        
        // Main ground
        this.drawForestGround(groundY);
        
        // Foreground bamboo (larger, more detailed)
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            const height = 300 + random() * 150;
            this.drawBambooStalk(x, groundY - 10, height, '#3A5A2A', 4, false);
        }
        
        // Rocks with moss
        for (let i = 0; i < 6; i++) {
            const x = random() * this.config.width;
            this.drawMossyRock(x, groundY + 10, 40 + random() * 30);
        }
    }

    protected renderDetails(): void {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        
        // Fallen bamboo leaves
        for (let i = 0; i < 60; i++) {
            const x = random() * this.config.width;
            this.drawBambooLeaf(x, groundY + 10 + random() * 40);
        }
        
        // Small ferns and plants
        for (let i = 0; i < 30; i++) {
            const x = random() * this.config.width;
            this.drawSmallFern(x, groundY + 5, 20 + random() * 15);
        }
        
        // Mushrooms (shiitake-like)
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            this.drawMushroom(x, groundY + 15 + random() * 20);
        }
        
        // Water puddles (bamboo forests are often misty/wet)
        for (let i = 0; i < 5; i++) {
            const x = random() * this.config.width;
            this.drawPuddle(x, groundY + 30 + random() * 20);
        }
        
        // Fireflies/particles
        this.drawParticles();
    }

    private drawFogLayers(): void {
        const fogLayers = [
            { y: this.config.height * 0.2, opacity: 0.3 },
            { y: this.config.height * 0.4, opacity: 0.2 },
            { y: this.config.height * 0.6, opacity: 0.15 }
        ];
        
        fogLayers.forEach(layer => {
            this.ctx.fillStyle = `rgba(220, 216, 208, ${layer.opacity})`;
            
            const random = this.seededRandom(layer.y * 100);
            for (let x = 0; x < this.config.width; x += 20) {
                const fogHeight = 40 + random() * 40;
                const waveY = Math.sin(x * 0.01) * 20;
                this.ctx.fillRect(x, layer.y + waveY, 25, fogHeight);
            }
        });
    }

    private drawDistantMountains(): void {
        const colors = ['#A8A498', '#989888', '#888878'];
        
        for (let m = 0; m < 3; m++) {
            const mountainY = this.config.height * (0.15 + m * 0.08);
            const color = colors[m]!;
            
            this.ctx.globalAlpha = 0.6 - m * 0.15;
            
            for (let x = 0; x < this.config.width; x += 6) {
                const peakHeight = 80 + Math.sin(x * 0.005 + m * 2) * 40 + Math.sin(x * 0.02) * 20;
                
                for (let row = 0; row < peakHeight; row += 6) {
                    this.drawPixel(x, mountainY + row, 6, color);
                }
            }
            
            this.ctx.globalAlpha = 1;
        }
    }

    private drawBambooStalk(x: number, y: number, height: number, color: string, pixelSize: number, isSilhouette: boolean): void {
        const stalkWidth = 12;
        const segments = Math.floor(height / 40);
        const random = this.seededRandom(x * y);
        
        // Main stalk
        const lightColor = this.lightenColor(color, 30);
        const darkColor = this.darkenColor(color, 20);
        
        for (let row = 0; row < height; row += pixelSize) {
            // Slight curve
            const curve = Math.sin(row * 0.01) * 5;
            
            for (let col = -stalkWidth / 2; col < stalkWidth / 2; col += pixelSize) {
                const normalizedCol = col / (stalkWidth / 2);
                let stalkColor: string;
                
                if (isSilhouette) {
                    stalkColor = color;
                } else {
                    // Rounded shading
                    if (normalizedCol < -0.5) {
                        stalkColor = darkColor;
                    } else if (normalizedCol > 0.3) {
                        stalkColor = darkColor;
                    } else {
                        stalkColor = normalizedCol < 0 ? lightColor : color;
                    }
                }
                
                this.drawPixel(x + col + curve, y - row, pixelSize, stalkColor);
            }
            
            // Segment joints (nodes)
            if (row > 0 && row % 40 < pixelSize) {
                for (let col = -stalkWidth / 2 - 4; col < stalkWidth / 2 + 4; col += pixelSize) {
                    this.drawPixel(x + col + curve, y - row, pixelSize, isSilhouette ? color : darkColor);
                    this.drawPixel(x + col + curve, y - row - pixelSize, pixelSize, isSilhouette ? color : darkColor);
                }
            }
        }
        
        // Leaves at various heights
        if (!isSilhouette) {
            for (let seg = 1; seg < segments; seg++) {
                if (random() > 0.4) {
                    const leafY = y - seg * 40;
                    const leafSide = random() > 0.5 ? 1 : -1;
                    this.drawBambooLeaves(x, leafY, leafSide, color);
                }
            }
        }
        
        // Top leaves
        this.drawBambooLeaves(x, y - height + 20, 0, isSilhouette ? color : '#4A7A3A');
    }

    private drawBambooLeaves(x: number, y: number, side: number, color: string): void {
        const leafColor = this.lightenColor(color, 15);
        const leaves = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < leaves; i++) {
            const angle = (side === 0) 
                ? (i / leaves - 0.5) * Math.PI * 0.8 
                : side * (0.2 + (i / leaves) * 0.6) * Math.PI / 2;
            
            const leafLength = 20 + Math.random() * 15;
            
            for (let j = 0; j < leafLength; j += 4) {
                const lx = x + Math.cos(angle) * j;
                const ly = y - Math.sin(angle) * j * 0.3 - j * 0.1;
                const width = Math.sin((j / leafLength) * Math.PI) * 3;
                
                this.drawPixel(lx, ly, 4, j < leafLength / 2 ? color : leafColor);
                if (width > 2) {
                    this.drawPixel(lx, ly - 4, 4, leafColor);
                }
            }
        }
    }

    private drawFern(x: number, y: number, size: number): void {
        const fronds = 6;
        
        for (let i = 0; i < fronds; i++) {
            const angle = (i / fronds) * Math.PI - Math.PI / 2;
            const frondLength = size * (0.5 + Math.abs(Math.cos(angle)) * 0.5);
            
            for (let j = 0; j < frondLength; j += 4) {
                const fx = x + Math.cos(angle) * j * 0.7;
                const fy = y - j;
                const color = j < frondLength / 2 ? '#2E5A2E' : '#3E7A3E';
                this.drawPixel(fx, fy, 4, color);
                
                // Leaflets
                if (j > 10 && j % 8 === 0) {
                    this.drawPixel(fx - 6, fy - 2, 4, color);
                    this.drawPixel(fx + 6, fy - 2, 4, color);
                }
            }
        }
    }

    private drawForestGround(groundY: number): void {
        const layers = [
            { y: groundY - 10, color: '#4A6A4A' },
            { y: groundY, color: '#3D5A3D' },
            { y: groundY + 15, color: '#2D4A2D' },
            { y: groundY + 40, color: '#1D3A1D' }
        ];
        
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let lx = 0; lx < this.config.width; lx += 4) {
                const variation = Math.sin(lx * 0.02) * 6 + random() * 5;
                for (let dy = 0; dy < 40; dy += 4) {
                    this.drawPixel(lx, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }

    private drawMossyRock(x: number, y: number, size: number): void {
        const rockColors = ['#5A5A5A', '#6A6A6A', '#4A4A4A'];
        const mossColors = ['#4A7A3A', '#3A6A2A', '#5A8A4A'];
        const random = this.seededRandom(x * y);
        
        // Rock base
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.4, 2) * 1.5);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                const color = rockColors[Math.floor(random() * rockColors.length)]!;
                this.drawPixel(x + col, y - row, 4, color);
            }
        }
        
        // Moss on top
        for (let col = -size / 2; col < size / 2; col += 4) {
            const mossHeight = 8 + random() * 8;
            for (let row = 0; row < mossHeight; row += 4) {
                const color = mossColors[Math.floor(random() * mossColors.length)]!;
                this.drawPixel(x + col, y - size + row, 4, color);
            }
        }
    }

    private drawBambooLeaf(x: number, y: number): void {
        const colors = ['#5A7A4A', '#4A6A3A', '#6A8A5A'];
        const color = colors[Math.floor(Math.random() * colors.length)]!;
        const angle = Math.random() * Math.PI;
        
        for (let i = 0; i < 12; i += 4) {
            const lx = x + Math.cos(angle) * i;
            const ly = y + Math.sin(angle) * i * 0.3;
            this.drawPixel(lx, ly, 4, color);
        }
    }

    private drawSmallFern(x: number, y: number, size: number): void {
        const fronds = 4;
        
        for (let i = 0; i < fronds; i++) {
            const angle = (i / fronds) * Math.PI * 0.8 + Math.PI * 0.1;
            for (let j = 0; j < size; j += 4) {
                const fx = x + Math.cos(angle) * j * 0.5;
                const fy = y - j;
                this.drawPixel(fx, fy, 4, '#3A6A3A');
            }
        }
    }

    private drawMushroom(x: number, y: number): void {
        // Shiitake-style mushroom
        // Stem
        this.drawPixel(x, y - 4, 4, '#D4C4B0');
        this.drawPixel(x, y - 8, 4, '#E4D4C0');
        
        // Cap
        this.drawPixel(x - 8, y - 12, 4, '#8B6914');
        this.drawPixel(x - 4, y - 12, 4, '#9B7924');
        this.drawPixel(x, y - 12, 4, '#9B7924');
        this.drawPixel(x + 4, y - 12, 4, '#9B7924');
        this.drawPixel(x + 8, y - 12, 4, '#8B6914');
        this.drawPixel(x - 4, y - 16, 4, '#7B5904');
        this.drawPixel(x, y - 16, 4, '#8B6914');
        this.drawPixel(x + 4, y - 16, 4, '#7B5904');
    }

    private drawPuddle(x: number, y: number): void {
        const width = 40 + Math.random() * 30;
        
        // Puddle reflection
        this.ctx.fillStyle = 'rgba(100, 130, 100, 0.3)';
        for (let col = 0; col < width; col += 4) {
            const puddleY = Math.sin((col / width) * Math.PI) * 4;
            this.ctx.fillRect(x + col - width / 2, y + puddleY, 4, 4);
        }
        
        // Water highlight
        this.ctx.fillStyle = 'rgba(200, 220, 200, 0.4)';
        this.ctx.fillRect(x - 5, y - 2, 10, 4);
    }

    private drawParticles(): void {
        const random = this.seededRandom(77777);
        
        // Floating particles (dust, pollen, small insects)
        for (let i = 0; i < 40; i++) {
            const px = random() * this.config.width;
            const py = this.config.height * 0.2 + random() * this.config.height * 0.6;
            
            this.ctx.fillStyle = `rgba(255, 255, 220, ${0.3 + random() * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private lightenColor(color: string, amount: number): string {
        const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount);
        const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount);
        const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private darkenColor(color: string, amount: number): string {
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount);
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount);
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
