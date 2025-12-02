// Backpack UI - Contains items like the world map, journal, etc.
import { I18n } from '../i18n/translations.js';
export class Backpack {
    constructor(canvasWidth, canvasHeight) {
        this.isOpen = false;
        this.items = [];
        this.hoveredItem = -1;
        this.animationTimer = 0;
        this.openAnimation = 0;
        // Callbacks
        this.onOpenMap = null;
        this.onOpenGallery = null;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.initializeItems();
    }
    initializeItems() {
        this.items = [
            {
                id: 'map',
                name: { nl: 'Wereldkaart', en: 'World Map' },
                icon: '🗺️',
                description: { nl: 'Bekijk je ontdekkingen op de wereldkaart', en: 'View your discoveries on the world map' },
                action: () => { if (this.onOpenMap)
                    this.onOpenMap(); this.close(); }
            },
            {
                id: 'camera',
                name: { nl: 'Fotocamera', en: 'Camera' },
                icon: '📷',
                description: { nl: "Bekijk je foto's", en: 'View your photos' },
                action: () => { if (this.onOpenGallery)
                    this.onOpenGallery(); this.close(); }
            },
            {
                id: 'journal',
                name: { nl: 'Dagboek', en: 'Journal' },
                icon: '📓',
                description: { nl: 'Lees over ontdekte dieren', en: 'Read about discovered animals' },
                action: () => { }
            },
            {
                id: 'compass',
                name: { nl: 'Kompas', en: 'Compass' },
                icon: '🧭',
                description: { nl: 'Vind je weg', en: 'Find your way' },
                action: () => { }
            },
            {
                id: 'binoculars',
                name: { nl: 'Verrekijker', en: 'Binoculars' },
                icon: '🔭',
                description: { nl: 'Kijk verder weg', en: 'See further away' },
                action: () => { }
            },
            {
                id: 'snacks',
                name: { nl: 'Snacks', en: 'Snacks' },
                icon: '🍎',
                description: { nl: 'Energie voor onderweg', en: 'Energy for the road' },
                action: () => { }
            },
        ];
    }
    setOnOpenMap(callback) {
        this.onOpenMap = callback;
    }
    setOnOpenGallery(callback) {
        this.onOpenGallery = callback;
    }
    open() {
        this.isOpen = true;
        this.openAnimation = 0;
    }
    close() {
        this.isOpen = false;
    }
    toggle() {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    }
    isBackpackOpen() {
        return this.isOpen;
    }
    update(deltaTime, mouseX, mouseY) {
        this.animationTimer += deltaTime;
        if (this.isOpen) {
            this.openAnimation = Math.min(1, this.openAnimation + deltaTime * 5);
            this.updateHoveredItem(mouseX, mouseY);
        }
        else {
            this.openAnimation = Math.max(0, this.openAnimation - deltaTime * 5);
        }
    }
    updateHoveredItem(mouseX, mouseY) {
        this.hoveredItem = -1;
        const itemSize = 70;
        const padding = 15;
        const cols = 3;
        const totalWidth = cols * itemSize + (cols - 1) * padding;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = this.canvasHeight / 2 - 60;
        this.items.forEach((item, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (itemSize + padding);
            const y = startY + row * (itemSize + padding);
            if (mouseX >= x && mouseX <= x + itemSize &&
                mouseY >= y && mouseY <= y + itemSize) {
                this.hoveredItem = index;
            }
        });
    }
    render(ctx) {
        if (this.openAnimation <= 0)
            return;
        ctx.save();
        ctx.globalAlpha = this.openAnimation;
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Backpack container
        const containerWidth = 320;
        const containerHeight = 280;
        const containerX = (this.canvasWidth - containerWidth) / 2;
        const containerY = (this.canvasHeight - containerHeight) / 2 - 20;
        // Scale animation
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        ctx.scale(this.openAnimation, this.openAnimation);
        ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);
        // Backpack background (leather look)
        const gradient = ctx.createLinearGradient(containerX, containerY, containerX, containerY + containerHeight);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = gradient;
        // Rounded rectangle
        this.roundRect(ctx, containerX, containerY, containerWidth, containerHeight, 15);
        ctx.fill();
        // Stitching effect
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        this.roundRect(ctx, containerX + 8, containerY + 8, containerWidth - 16, containerHeight - 16, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        // Buckle at top
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(containerX + containerWidth / 2 - 25, containerY - 10, 50, 20);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(containerX + containerWidth / 2 - 15, containerY - 5, 30, 10);
        // Title
        ctx.fillStyle = '#FFF8DC';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🎒 ${this.i18n.t('backpack')}`, this.canvasWidth / 2, containerY + 35);
        // Items grid
        const itemSize = 70;
        const padding = 15;
        const cols = 3;
        const totalWidth = cols * itemSize + (cols - 1) * padding;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = containerY + 60;
        this.items.forEach((item, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (itemSize + padding);
            const y = startY + row * (itemSize + padding);
            const isHovered = this.hoveredItem === index;
            // Item slot background
            ctx.fillStyle = isHovered ? 'rgba(255, 215, 0, 0.3)' : 'rgba(139, 69, 19, 0.5)';
            this.roundRect(ctx, x, y, itemSize, itemSize, 8);
            ctx.fill();
            // Item slot border
            ctx.strokeStyle = isHovered ? '#FFD700' : '#D2691E';
            ctx.lineWidth = isHovered ? 3 : 2;
            this.roundRect(ctx, x, y, itemSize, itemSize, 8);
            ctx.stroke();
            // Item icon
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            const bounce = isHovered ? Math.sin(this.animationTimer * 8) * 3 : 0;
            ctx.fillText(item.icon, x + itemSize / 2, y + itemSize / 2 + 10 + bounce);
            // Item name
            ctx.fillStyle = '#FFF8DC';
            ctx.font = '9px Arial';
            ctx.fillText(item.name[this.i18n.getLanguage()], x + itemSize / 2, y + itemSize - 5);
        });
        // Hovered item description
        if (this.hoveredItem >= 0) {
            const item = this.items[this.hoveredItem];
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(containerX + 10, containerY + containerHeight - 45, containerWidth - 20, 35);
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.description[this.i18n.getLanguage()], this.canvasWidth / 2, containerY + containerHeight - 22);
        }
        // Close instruction
        ctx.fillStyle = '#FFF8DC';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.i18n.t('press_b_close'), this.canvasWidth / 2, containerY + containerHeight + 20);
        ctx.restore();
    }
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    handleClick(x, y) {
        if (!this.isOpen)
            return false;
        const itemSize = 70;
        const padding = 15;
        const cols = 3;
        const totalWidth = cols * itemSize + (cols - 1) * padding;
        const startX = (this.canvasWidth - totalWidth) / 2;
        const startY = this.canvasHeight / 2 - 60;
        for (let index = 0; index < this.items.length; index++) {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const itemX = startX + col * (itemSize + padding);
            const itemY = startY + row * (itemSize + padding);
            if (x >= itemX && x <= itemX + itemSize &&
                y >= itemY && y <= itemY + itemSize) {
                this.items[index].action();
                return true;
            }
        }
        // Click outside to close
        const containerWidth = 320;
        const containerHeight = 280;
        const containerX = (this.canvasWidth - containerWidth) / 2;
        const containerY = (this.canvasHeight - containerHeight) / 2 - 20;
        if (x < containerX || x > containerX + containerWidth ||
            y < containerY || y > containerY + containerHeight) {
            this.close();
        }
        return true;
    }
    // Render backpack button on HUD
    renderButton(ctx, x, y) {
        const size = 45;
        const bounce = Math.sin(this.animationTimer * 2) * 2;
        // Button background
        ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        // Border
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎒', x + size / 2, y + size / 2 + 8 + bounce);
        // Key hint
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('B', x + size / 2, y + size + 12);
        return { x, y, width: size, height: size };
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
//# sourceMappingURL=Backpack.js.map