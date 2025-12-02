// World Map UI - Uses the worldMap.svg image with player marker overlay
import { I18n } from '../i18n/translations.js';
export class WorldMap {
    constructor(canvasWidth, canvasHeight) {
        this.isOpen = false;
        this.mapImage = null;
        this.imageLoaded = false;
        this.mapWidth = 600;
        this.mapHeight = 400;
        this.playerWorldPos = { x: 0, y: 0 };
        this.animationTimer = 0;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.mapX = (canvasWidth - this.mapWidth) / 2;
        this.mapY = (canvasHeight - this.mapHeight) / 2;
        this.loadMapImage();
    }
    loadMapImage() {
        this.mapImage = new Image();
        this.mapImage.onload = () => {
            this.imageLoaded = true;
            console.log('World map image loaded successfully');
        };
        this.mapImage.onerror = () => {
            console.error('Failed to load world map image');
            this.imageLoaded = false;
        };
        this.mapImage.src = './public/images/worldMap.svg';
    }
    open() {
        this.isOpen = true;
    }
    close() {
        this.isOpen = false;
    }
    toggle() {
        this.isOpen = !this.isOpen;
    }
    isMapOpen() {
        return this.isOpen;
    }
    update(deltaTime, playerPos, worldWidth, worldHeight) {
        if (!this.isOpen)
            return;
        this.animationTimer += deltaTime;
        // Calculate player position on map
        this.playerWorldPos = {
            x: (playerPos.x / worldWidth) * this.mapWidth,
            y: (playerPos.y / worldHeight) * this.mapHeight,
        };
    }
    render(ctx) {
        if (!this.isOpen)
            return;
        ctx.save();
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Map container with border (wooden frame)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.mapX - 15, this.mapY - 50, this.mapWidth + 30, this.mapHeight + 80);
        // Inner border
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(this.mapX - 10, this.mapY - 45, this.mapWidth + 20, this.mapHeight + 70);
        // Map title
        ctx.fillStyle = '#FFF8DC';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🗺️ ${this.i18n.t('world_map')}`, this.mapX + this.mapWidth / 2, this.mapY - 20);
        // Render the map image or fallback
        if (this.imageLoaded && this.mapImage) {
            // Draw the SVG map image
            ctx.drawImage(this.mapImage, this.mapX, this.mapY, this.mapWidth, this.mapHeight);
        }
        else {
            // Fallback: draw a simple placeholder
            this.renderFallbackMap(ctx);
        }
        // Render player position marker on top of the map
        this.renderPlayerMarker(ctx);
        // Close button
        this.renderCloseButton(ctx);
        // Instructions
        ctx.fillStyle = '#FFF8DC';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.i18n.t('press_m_close'), this.mapX + this.mapWidth / 2, this.mapY + this.mapHeight + 20);
        ctx.restore();
    }
    renderFallbackMap(ctx) {
        // Blue ocean background
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(this.mapX, this.mapY, this.mapWidth, this.mapHeight);
        // Loading text
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading map...', this.mapX + this.mapWidth / 2, this.mapY + this.mapHeight / 2);
    }
    renderPlayerMarker(ctx) {
        const x = this.mapX + this.playerWorldPos.x;
        const y = this.mapY + this.playerWorldPos.y;
        const pulse = Math.sin(this.animationTimer * 4) * 3;
        // Outer glow ring
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 16 + pulse, 0, Math.PI * 2);
        ctx.fill();
        // Middle ring
        ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 10 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Main marker (red circle)
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        // White border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Inner dot (gold)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        // "Milo" label with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Milo', x + 1, y - 14);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Milo', x, y - 15);
        // Arrow pointing down
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(x, y - 22);
        ctx.lineTo(x - 5, y - 28);
        ctx.lineTo(x + 5, y - 28);
        ctx.closePath();
        ctx.fill();
    }
    renderCloseButton(ctx) {
        const btnX = this.mapX + this.mapWidth - 25;
        const btnY = this.mapY - 40;
        // Button background
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(btnX, btnY, 14, 0, Math.PI * 2);
        ctx.fill();
        // Border
        ctx.strokeStyle = '#922B21';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(btnX, btnY, 14, 0, Math.PI * 2);
        ctx.stroke();
        // X symbol
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', btnX, btnY + 6);
    }
    handleClick(x, y) {
        if (!this.isOpen)
            return false;
        // Check close button
        const btnX = this.mapX + this.mapWidth - 25;
        const btnY = this.mapY - 40;
        const dist = Math.sqrt((x - btnX) ** 2 + (y - btnY) ** 2);
        if (dist < 18) {
            this.close();
            return true;
        }
        // Check if clicking outside map to close
        if (x < this.mapX - 15 || x > this.mapX + this.mapWidth + 15 ||
            y < this.mapY - 50 || y > this.mapY + this.mapHeight + 30) {
            this.close();
            return true;
        }
        return true; // Consume click while map is open
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.mapX = (width - this.mapWidth) / 2;
        this.mapY = (height - this.mapHeight) / 2;
    }
}
//# sourceMappingURL=WorldMap.js.map