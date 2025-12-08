// BackpackMenu - Dropdown menu system when clicking the backpack
// Contains: Camera, Microphone, Journal, Map, etc.
import { I18n } from '../i18n/translations.js';
export class BackpackMenu {
    constructor(canvasWidth, canvasHeight) {
        this.isOpen = false;
        // Items
        this.items = [];
        this.hoveredItemIndex = -1;
        // Animation
        this.openAnimation = 0;
        this.animationTimer = 0;
        // Position (top-left)
        this.backpackX = 20;
        this.backpackY = 20;
        this.backpackSize = 60;
        // Dropdown dimensions
        this.dropdownWidth = 200;
        this.itemHeight = 50;
        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        // Callbacks
        this.onCameraClick = null;
        this.onJournalClick = null;
        this.onMapClick = null;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.initializeItems();
    }
    initializeItems() {
        this.items = [
            {
                id: 'camera',
                name: { nl: 'Camera', en: 'Camera' },
                icon: '📷',
                description: { nl: 'Maak foto\'s van dieren en sporen', en: 'Take photos of animals and evidence' },
                unlocked: true,
                onSelect: () => this.onCameraClick?.()
            },
            {
                id: 'journal',
                name: { nl: 'Dagboek', en: 'Journal' },
                icon: '📓',
                description: { nl: 'Bekijk je foto\'s en ontdekkingen', en: 'View your photos and discoveries' },
                unlocked: true,
                onSelect: () => this.onJournalClick?.()
            },
            {
                id: 'map',
                name: { nl: 'Kaart', en: 'Map' },
                icon: '🗺️',
                description: { nl: 'Bekijk de wereldkaart', en: 'View the world map' },
                unlocked: true,
                onSelect: () => this.onMapClick?.()
            },
            {
                id: 'binoculars',
                name: { nl: 'Verrekijker', en: 'Binoculars' },
                icon: '🔭',
                description: { nl: 'Spot dieren van veraf', en: 'Spot animals from afar' },
                unlocked: false,
                onSelect: () => { }
            },
            {
                id: 'microphone',
                name: { nl: 'Microfoon', en: 'Microphone' },
                icon: '🎤',
                description: { nl: 'Neem diergeluiden op', en: 'Record animal sounds' },
                unlocked: false,
                onSelect: () => { }
            },
            {
                id: 'notebook',
                name: { nl: 'Notitieboek', en: 'Notebook' },
                icon: '📝',
                description: { nl: 'Schrijf je observaties op', en: 'Write down your observations' },
                unlocked: false,
                onSelect: () => { }
            }
        ];
    }
    // Set callbacks
    setOnCameraClick(callback) {
        this.onCameraClick = callback;
    }
    setOnJournalClick(callback) {
        this.onJournalClick = callback;
    }
    setOnMapClick(callback) {
        this.onMapClick = callback;
    }
    unlockItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item)
            item.unlocked = true;
    }
    toggle() {
        this.isOpen = !this.isOpen;
    }
    open() {
        this.isOpen = true;
    }
    close() {
        this.isOpen = false;
    }
    isMenuOpen() {
        return this.isOpen;
    }
    update(deltaTime, mouseX, mouseY) {
        this.animationTimer += deltaTime;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        // Open/close animation
        if (this.isOpen) {
            this.openAnimation = Math.min(1, this.openAnimation + deltaTime * 8);
        }
        else {
            this.openAnimation = Math.max(0, this.openAnimation - deltaTime * 8);
        }
        // Check hover on items
        this.hoveredItemIndex = -1;
        if (this.isOpen && this.openAnimation > 0.5) {
            const dropdownY = this.backpackY + this.backpackSize + 10;
            for (let i = 0; i < this.items.length; i++) {
                const itemY = dropdownY + i * this.itemHeight;
                if (mouseX >= this.backpackX &&
                    mouseX <= this.backpackX + this.dropdownWidth &&
                    mouseY >= itemY &&
                    mouseY <= itemY + this.itemHeight) {
                    this.hoveredItemIndex = i;
                    break;
                }
            }
        }
    }
    handleClick(x, y) {
        // Check backpack button click
        if (x >= this.backpackX && x <= this.backpackX + this.backpackSize &&
            y >= this.backpackY && y <= this.backpackY + this.backpackSize) {
            this.toggle();
            return true;
        }
        // Check item clicks when open
        if (this.isOpen && this.openAnimation > 0.5) {
            const dropdownY = this.backpackY + this.backpackSize + 10;
            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                const itemY = dropdownY + i * this.itemHeight;
                if (x >= this.backpackX &&
                    x <= this.backpackX + this.dropdownWidth &&
                    y >= itemY &&
                    y <= itemY + this.itemHeight) {
                    if (item.unlocked) {
                        item.onSelect();
                        this.close();
                    }
                    return true;
                }
            }
            // Click outside dropdown closes it
            this.close();
            return true;
        }
        return false;
    }
    isClickOnBackpack(x, y) {
        return x >= this.backpackX && x <= this.backpackX + this.backpackSize &&
            y >= this.backpackY && y <= this.backpackY + this.backpackSize;
    }
    render(ctx) {
        const lang = this.i18n.getLanguage();
        // Render backpack button
        this.renderBackpackButton(ctx, lang);
        // Render dropdown if open
        if (this.openAnimation > 0) {
            this.renderDropdown(ctx, lang);
        }
    }
    renderBackpackButton(ctx, lang) {
        const isHovered = this.mouseX >= this.backpackX &&
            this.mouseX <= this.backpackX + this.backpackSize &&
            this.mouseY >= this.backpackY &&
            this.mouseY <= this.backpackY + this.backpackSize;
        // Button shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(ctx, this.backpackX + 3, this.backpackY + 3, this.backpackSize, this.backpackSize, 12);
        ctx.fill();
        // Button background
        const gradient = ctx.createLinearGradient(this.backpackX, this.backpackY, this.backpackX, this.backpackY + this.backpackSize);
        if (isHovered || this.isOpen) {
            gradient.addColorStop(0, '#A0522D');
            gradient.addColorStop(1, '#6B3E26');
        }
        else {
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(1, '#5D3A1A');
        }
        ctx.fillStyle = gradient;
        this.roundRect(ctx, this.backpackX, this.backpackY, this.backpackSize, this.backpackSize, 12);
        ctx.fill();
        // Border
        ctx.strokeStyle = '#DEB887';
        ctx.lineWidth = 3;
        this.roundRect(ctx, this.backpackX, this.backpackY, this.backpackSize, this.backpackSize, 12);
        ctx.stroke();
        // Backpack icon (pixel art style)
        this.renderBackpackIcon(ctx, this.backpackX + this.backpackSize / 2, this.backpackY + this.backpackSize / 2);
        // Hint text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('B', this.backpackX + this.backpackSize / 2, this.backpackY + this.backpackSize - 5);
    }
    renderBackpackIcon(ctx, cx, cy) {
        // Main bag body
        ctx.fillStyle = '#654321';
        ctx.fillRect(cx - 15, cy - 5, 30, 22);
        // Top flap
        ctx.fillStyle = '#7B5544';
        ctx.fillRect(cx - 12, cy - 12, 24, 10);
        // Buckle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(cx - 5, cy - 6, 10, 5);
        // Pocket
        ctx.fillStyle = '#553322';
        ctx.fillRect(cx - 8, cy + 3, 16, 10);
    }
    renderDropdown(ctx, lang) {
        ctx.save();
        ctx.globalAlpha = this.openAnimation;
        const dropdownY = this.backpackY + this.backpackSize + 10;
        const totalHeight = this.items.length * this.itemHeight + 10;
        // Scale animation
        ctx.translate(this.backpackX, dropdownY);
        ctx.scale(1, this.openAnimation);
        ctx.translate(-this.backpackX, -dropdownY);
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(ctx, this.backpackX + 5, dropdownY + 5, this.dropdownWidth, totalHeight, 10);
        ctx.fill();
        // Background
        ctx.fillStyle = '#2C1810';
        this.roundRect(ctx, this.backpackX, dropdownY, this.dropdownWidth, totalHeight, 10);
        ctx.fill();
        // Border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        this.roundRect(ctx, this.backpackX, dropdownY, this.dropdownWidth, totalHeight, 10);
        ctx.stroke();
        // Leather texture hint
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < totalHeight; i += 15) {
            ctx.beginPath();
            ctx.moveTo(this.backpackX + 5, dropdownY + i);
            ctx.lineTo(this.backpackX + this.dropdownWidth - 5, dropdownY + i);
            ctx.stroke();
        }
        // Render items
        this.items.forEach((item, index) => {
            this.renderItem(ctx, item, index, dropdownY, lang);
        });
        ctx.restore();
    }
    renderItem(ctx, item, index, dropdownY, lang) {
        const itemY = dropdownY + 5 + index * this.itemHeight;
        const isHovered = this.hoveredItemIndex === index;
        const isLocked = !item.unlocked;
        // Item background
        if (isHovered && !isLocked) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
            this.roundRect(ctx, this.backpackX + 5, itemY, this.dropdownWidth - 10, this.itemHeight - 5, 5);
            ctx.fill();
        }
        // Icon background
        ctx.fillStyle = isLocked ? '#444' : '#5D4037';
        ctx.beginPath();
        ctx.arc(this.backpackX + 30, itemY + this.itemHeight / 2 - 2, 18, 0, Math.PI * 2);
        ctx.fill();
        // Icon
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.fillText(isLocked ? '🔒' : item.icon, this.backpackX + 30, itemY + this.itemHeight / 2 - 2);
        // Name
        ctx.font = isLocked ? '14px Arial' : 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.fillText(item.name[lang], this.backpackX + 55, itemY + 18);
        // Description
        ctx.font = '10px Arial';
        ctx.fillStyle = isLocked ? '#444' : '#AAA';
        const desc = isLocked ?
            this.i18n.t('not_unlocked_yet') :
            item.description[lang];
        ctx.fillText(desc, this.backpackX + 55, itemY + 34);
    }
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
//# sourceMappingURL=BackpackMenu.js.map