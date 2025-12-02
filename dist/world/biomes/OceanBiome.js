// Ocean/Coral Reef Biome - Oceania/Pacific (Óceánia - Korallzátony)
// Underwater coral reef with colorful marine environment
import { BaseBiome } from './BaseBiome.js';
export class OceanBiome extends BaseBiome {
    constructor(width = 2000, height = 800) {
        super({
            name: 'ocean',
            continent: 'oceania',
            width,
            height,
            groundColor: '#2E5A6E',
            skyColors: ['#001830', '#003366', '#006699', '#0099CC']
        });
    }
    renderSky() {
        // Deep ocean gradient (this is underwater, so "sky" is water above)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height);
        gradient.addColorStop(0, '#001428');
        gradient.addColorStop(0.2, '#002850');
        gradient.addColorStop(0.4, '#004070');
        gradient.addColorStop(0.6, '#006090');
        gradient.addColorStop(0.8, '#0080A8');
        gradient.addColorStop(1, '#00A0C0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        // Light rays from surface
        this.drawLightRays();
        // Bubbles
        this.drawBubbles();
    }
    renderBackground() {
        const random = this.seededRandom(11111);
        // Distant underwater mountains/rocks
        for (let i = 0; i < 5; i++) {
            const x = i * (this.config.width / 4) - 100;
            const height = 150 + random() * 100;
            this.drawUnderwaterMountain(x, this.config.height * 0.4, 400, height, '#1A4A5A');
        }
        // Background seaweed
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            this.drawSeaweed(x, this.config.height * 0.45, 80 + random() * 60, '#1A5A4A', 5);
        }
    }
    renderMidground() {
        const random = this.seededRandom(22222);
        // Coral formations (mid-distance)
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            const coralType = Math.floor(random() * 4);
            this.drawCoral(x, this.config.height * 0.58, 60 + random() * 40, coralType, 0.7);
        }
        // Mid-layer seaweed
        for (let i = 0; i < 15; i++) {
            const x = random() * this.config.width;
            this.drawSeaweed(x, this.config.height * 0.6, 100 + random() * 80, '#2A7A5A', 4);
        }
        // Sea anemones
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            this.drawAnemone(x, this.config.height * 0.62, 30 + random() * 20);
        }
    }
    renderForeground() {
        const random = this.seededRandom(33333);
        const groundY = this.config.height * 0.75;
        // Sandy ocean floor
        this.drawOceanFloor(groundY);
        // Large foreground corals
        for (let i = 0; i < 10; i++) {
            const x = random() * this.config.width;
            const coralType = Math.floor(random() * 4);
            this.drawCoral(x, groundY - 10, 80 + random() * 60, coralType, 1);
        }
        // Large seaweed
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            this.drawSeaweed(x, groundY, 150 + random() * 100, '#2E8B57', 4);
        }
        // Rocks
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawUnderwaterRock(x, groundY + 10, 30 + random() * 25);
        }
    }
    renderDetails() {
        const random = this.seededRandom(44444);
        const groundY = this.config.height * 0.75;
        // Starfish
        for (let i = 0; i < 8; i++) {
            const x = random() * this.config.width;
            this.drawStarfish(x, groundY + 15 + random() * 30);
        }
        // Shells
        for (let i = 0; i < 12; i++) {
            const x = random() * this.config.width;
            this.drawShell(x, groundY + 20 + random() * 25);
        }
        // Small coral bits
        for (let i = 0; i < 25; i++) {
            const x = random() * this.config.width;
            this.drawSmallCoral(x, groundY + 5 + random() * 20);
        }
        // Swimming particles (plankton)
        this.drawPlankton();
        // More bubbles in foreground
        this.drawForegroundBubbles(groundY);
    }
    drawLightRays() {
        this.ctx.save();
        for (let i = 0; i < 8; i++) {
            const x = i * (this.config.width / 6) + 50;
            const gradient = this.ctx.createLinearGradient(x, 0, x + 100, this.config.height * 0.7);
            gradient.addColorStop(0, 'rgba(150, 220, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(150, 220, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x + 150, this.config.height * 0.7);
            this.ctx.lineTo(x + 50, this.config.height * 0.7);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    drawBubbles() {
        const random = this.seededRandom(88888);
        for (let i = 0; i < 50; i++) {
            const x = random() * this.config.width;
            const y = random() * this.config.height;
            const size = 4 + random() * 8;
            this.ctx.fillStyle = `rgba(180, 220, 255, ${0.2 + random() * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            // Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(x - size / 4, y - size / 4, size / 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    drawUnderwaterMountain(x, y, width, height, color) {
        const centerX = x + width / 2;
        for (let row = 0; row < height; row += 6) {
            const rowWidth = (width * (height - row)) / height;
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 6) {
                this.drawPixel(centerX + col, y + row, 6, color);
            }
        }
    }
    drawSeaweed(x, y, height, color, pixelSize) {
        const random = this.seededRandom(x * y);
        const strands = 3 + Math.floor(random() * 3);
        for (let s = 0; s < strands; s++) {
            const strandX = x + (s - strands / 2) * 10;
            let currentX = strandX;
            for (let i = 0; i < height; i += pixelSize) {
                // Wavy motion
                currentX = strandX + Math.sin((i + random() * 100) * 0.05) * 15;
                const shade = i < height / 2 ? color : this.lightenColor(color, 20);
                this.drawPixel(currentX, y - i, pixelSize, shade);
            }
            // Leafy bits
            for (let i = height * 0.3; i < height; i += height / 5) {
                const leafX = strandX + Math.sin(i * 0.05) * 15;
                this.drawPixel(leafX - 8, y - i, pixelSize, color);
                this.drawPixel(leafX + 8, y - i, pixelSize, color);
            }
        }
    }
    drawCoral(x, y, size, type, opacity) {
        this.ctx.globalAlpha = opacity;
        const colors = [
            { main: '#FF6B6B', accent: '#FF8E8E' }, // Red coral
            { main: '#FFB347', accent: '#FFCC80' }, // Orange coral
            { main: '#9B59B6', accent: '#BB7DCB' }, // Purple coral
            { main: '#FF69B4', accent: '#FFB6C1' } // Pink coral
        ];
        const coral = colors[type];
        switch (type) {
            case 0: // Brain coral
                this.drawBrainCoral(x, y, size, coral.main, coral.accent);
                break;
            case 1: // Branching coral
                this.drawBranchingCoral(x, y, size, coral.main, coral.accent);
                break;
            case 2: // Fan coral
                this.drawFanCoral(x, y, size, coral.main, coral.accent);
                break;
            case 3: // Tube coral
                this.drawTubeCoral(x, y, size, coral.main, coral.accent);
                break;
        }
        this.ctx.globalAlpha = 1;
    }
    drawBrainCoral(x, y, size, color, accent) {
        // Rounded coral with brain-like texture
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * Math.sin((row / size) * Math.PI);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                const useAccent = Math.sin(col * 0.3) * Math.cos(row * 0.3) > 0;
                this.drawPixel(x + col, y - row, 4, useAccent ? accent : color);
            }
        }
    }
    drawBranchingCoral(x, y, size, color, accent) {
        // Tree-like branching structure
        const branches = 5;
        for (let b = 0; b < branches; b++) {
            const angle = (b / branches - 0.5) * Math.PI * 0.8;
            const branchLength = size * (0.6 + Math.abs(b - branches / 2) / branches * 0.4);
            for (let i = 0; i < branchLength; i += 4) {
                const bx = x + Math.sin(angle) * i;
                const by = y - i;
                this.drawPixel(bx, by, 4, i % 8 === 0 ? accent : color);
                // Sub-branches
                if (i > branchLength * 0.3 && i % 12 === 0) {
                    this.drawPixel(bx - 8, by - 4, 4, accent);
                    this.drawPixel(bx + 8, by - 4, 4, accent);
                }
            }
        }
    }
    drawFanCoral(x, y, size, color, accent) {
        // Fan-shaped coral
        const fanWidth = size * 1.5;
        for (let col = -fanWidth / 2; col < fanWidth / 2; col += 4) {
            const colHeight = size * (1 - Math.pow(col / (fanWidth / 2), 2));
            for (let row = 0; row < colHeight; row += 4) {
                const useAccent = row % 8 === 0;
                this.drawPixel(x + col, y - row, 4, useAccent ? accent : color);
            }
        }
        // Stem
        this.drawPixelRect(x - 4, y, 8, 15, this.darkenColor(color, 30), 4);
    }
    drawTubeCoral(x, y, size, color, accent) {
        // Multiple tube-like structures
        const tubes = 4;
        for (let t = 0; t < tubes; t++) {
            const tx = x + (t - tubes / 2) * 15;
            const tubeHeight = size * (0.5 + t / tubes * 0.5);
            // Tube body
            for (let row = 0; row < tubeHeight; row += 4) {
                this.drawPixel(tx - 4, y - row, 4, color);
                this.drawPixel(tx, y - row, 4, accent);
                this.drawPixel(tx + 4, y - row, 4, color);
            }
            // Tube opening
            this.drawPixel(tx - 8, y - tubeHeight, 4, accent);
            this.drawPixel(tx - 4, y - tubeHeight - 4, 4, accent);
            this.drawPixel(tx, y - tubeHeight - 4, 4, this.darkenColor(color, 20));
            this.drawPixel(tx + 4, y - tubeHeight - 4, 4, accent);
            this.drawPixel(tx + 8, y - tubeHeight, 4, accent);
        }
    }
    drawAnemone(x, y, size) {
        const colors = ['#FF6B9D', '#FF8FB1', '#FFB4C8'];
        const tentacles = 12;
        // Base
        this.drawPixelRect(x - size / 3, y, size / 1.5, size / 4, '#8B4060', 4);
        // Tentacles
        for (let t = 0; t < tentacles; t++) {
            const angle = (t / tentacles) * Math.PI - Math.PI / 2;
            const tentacleLength = size * (0.6 + Math.sin(t * 2) * 0.3);
            for (let i = 0; i < tentacleLength; i += 4) {
                const tx = x + Math.cos(angle) * i * 0.6;
                const ty = y - i;
                const color = colors[i % colors.length];
                this.drawPixel(tx, ty, 4, color);
            }
        }
    }
    drawOceanFloor(groundY) {
        const layers = [
            { y: groundY - 10, color: '#4A8090' },
            { y: groundY, color: '#3A7080' },
            { y: groundY + 20, color: '#2E6070' },
            { y: groundY + 50, color: '#2A5060' }
        ];
        layers.forEach(layer => {
            const random = this.seededRandom(layer.y * 100);
            for (let lx = 0; lx < this.config.width; lx += 4) {
                const variation = Math.sin(lx * 0.01) * 8 + random() * 5;
                for (let dy = 0; dy < 50; dy += 4) {
                    this.drawPixel(lx, layer.y + variation + dy, 4, layer.color);
                }
            }
        });
    }
    drawUnderwaterRock(x, y, size) {
        const colors = ['#3D5A5A', '#4A6A6A', '#2D4A4A'];
        const random = this.seededRandom(x * y);
        for (let row = 0; row < size; row += 4) {
            const rowWidth = size * (1 - Math.pow(row / size - 0.4, 2) * 1.5);
            for (let col = -rowWidth / 2; col < rowWidth / 2; col += 4) {
                this.drawPixel(x + col, y - row, 4, colors[Math.floor(random() * colors.length)]);
            }
        }
        // Algae on rock
        for (let i = 0; i < 3; i++) {
            this.drawPixel(x - size / 3 + i * 8, y - size + 4, 4, '#2E8B57');
        }
    }
    drawStarfish(x, y) {
        const colors = ['#FF6347', '#FF7F50', '#FFA500'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        // 5-pointed star
        const arms = 5;
        for (let a = 0; a < arms; a++) {
            const angle = (a / arms) * Math.PI * 2 - Math.PI / 2;
            for (let i = 0; i < 12; i += 4) {
                const ax = x + Math.cos(angle) * i;
                const ay = y + Math.sin(angle) * i;
                this.drawPixel(ax, ay, 4, color);
            }
        }
        // Center
        this.drawPixel(x, y, 4, this.darkenColor(color, 20));
    }
    drawShell(x, y) {
        const colors = ['#F5DEB3', '#DEB887', '#D2B48C'];
        const random = this.seededRandom(x * y);
        // Spiral shell
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI;
            const radius = 4 + i;
            const sx = x + Math.cos(angle) * radius;
            const sy = y + Math.sin(angle) * radius * 0.5;
            this.drawPixel(sx, sy, 4, colors[i % colors.length]);
        }
    }
    drawSmallCoral(x, y) {
        const colors = ['#FF69B4', '#FFB6C1', '#FF6B6B', '#FFB347'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Small coral tuft
        this.drawPixel(x, y - 4, 4, color);
        this.drawPixel(x - 4, y - 8, 4, color);
        this.drawPixel(x + 4, y - 8, 4, color);
        this.drawPixel(x, y - 12, 4, color);
    }
    drawPlankton() {
        const random = this.seededRandom(55555);
        for (let i = 0; i < 80; i++) {
            const x = random() * this.config.width;
            const y = random() * this.config.height;
            this.ctx.fillStyle = `rgba(200, 255, 255, ${0.3 + random() * 0.4})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }
    drawForegroundBubbles(groundY) {
        const random = this.seededRandom(66666);
        for (let i = 0; i < 20; i++) {
            const x = random() * this.config.width;
            const y = groundY - 50 + random() * 100;
            const size = 6 + random() * 10;
            this.ctx.fillStyle = 'rgba(180, 220, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            // Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(x - size / 4, y - size / 4, size / 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
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
//# sourceMappingURL=OceanBiome.js.map