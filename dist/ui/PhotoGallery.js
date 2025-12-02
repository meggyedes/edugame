// Photo gallery screen for viewing captured photos
import { I18n } from '../i18n/translations.js';
export class PhotoGallery {
    constructor(canvasWidth, canvasHeight) {
        this.photos = [];
        this.scrollOffset = 0;
        this.selectedPhoto = null;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.backButtonBounds = { x: 20, y: 20, width: 100, height: 35 };
    }
    setPhotos(photos) {
        this.photos = photos;
    }
    render(ctx) {
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#2d3436');
        gradient.addColorStop(1, '#636e72');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Back button
        this.renderBackButton(ctx);
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`📷 ${this.i18n.t('gallery')}`, this.canvasWidth / 2, 80);
        if (this.photos.length === 0) {
            ctx.fillStyle = '#AAA';
            ctx.font = '16px Arial';
            ctx.fillText(this.i18n.t('no_photos'), this.canvasWidth / 2, this.canvasHeight / 2);
            ctx.textAlign = 'left';
            return;
        }
        // Photo grid
        const photoSize = 120;
        const padding = 20;
        const cols = Math.floor((this.canvasWidth - 40) / (photoSize + padding));
        const startX = (this.canvasWidth - cols * (photoSize + padding) + padding) / 2;
        const startY = 120;
        this.photos.forEach((photo, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (photoSize + padding);
            const y = startY + row * (photoSize + padding + 30) - this.scrollOffset;
            if (y + photoSize < 100 || y > this.canvasHeight)
                return;
            // Photo frame
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x - 5, y - 5, photoSize + 10, photoSize + 10);
            // Photo placeholder (actual photo would be loaded from dataUrl)
            ctx.fillStyle = this.getBiomeColor(photo.location);
            ctx.fillRect(x, y, photoSize, photoSize);
            // Animal icon
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🦎', x + photoSize / 2, y + photoSize / 2 + 15);
            // Animal name
            ctx.fillStyle = '#FFF';
            ctx.font = '12px Arial';
            const name = photo.animalName[this.i18n.getLanguage()];
            ctx.fillText(name, x + photoSize / 2, y + photoSize + 20);
            // Points
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.fillText(`+${photo.points} ⭐`, x + photoSize / 2, y + photoSize + 35);
        });
        ctx.textAlign = 'left';
    }
    getBiomeColor(biome) {
        const colors = {
            beach: '#87CEEB',
            jungle: '#228B22',
            desert: '#DEB887',
            tundra: '#E0FFFF',
            forest: '#2E8B57',
        };
        return colors[biome] || '#666';
    }
    renderBackButton(ctx) {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(this.backButtonBounds.x, this.backButtonBounds.y, this.backButtonBounds.width, this.backButtonBounds.height);
        ctx.strokeStyle = '#81C784';
        ctx.strokeRect(this.backButtonBounds.x, this.backButtonBounds.y, this.backButtonBounds.width, this.backButtonBounds.height);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`← ${this.i18n.t('back')}`, this.backButtonBounds.x + this.backButtonBounds.width / 2, this.backButtonBounds.y + 23);
    }
    handleClick(x, y) {
        const b = this.backButtonBounds;
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    }
    scroll(deltaY) {
        this.scrollOffset = Math.max(0, this.scrollOffset + deltaY * 0.5);
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
//# sourceMappingURL=PhotoGallery.js.map