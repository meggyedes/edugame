// Zone Select Screen - World map where player chooses zones
import { ZoneManager } from '../zones/ZoneManager.js';
import { I18n } from '../i18n/translations.js';
export class ZoneSelectScreen {
    constructor(canvasWidth, canvasHeight) {
        this.selectedZone = null;
        this.hoveredZone = null;
        this.hoveredLevel = null;
        this.animationTimer = 0;
        this.showLevelSelect = false;
        this.onSelectCallback = null;
        this.scrollOffset = 0;
        this.zoneManager = ZoneManager.getInstance();
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    setOnSelect(callback) {
        this.onSelectCallback = callback;
    }
    update(deltaTime, mouseX, mouseY) {
        this.animationTimer += deltaTime;
        if (this.showLevelSelect && this.selectedZone) {
            this.updateLevelHover(mouseX, mouseY);
        }
        else {
            this.updateZoneHover(mouseX, mouseY);
        }
    }
    updateZoneHover(mouseX, mouseY) {
        this.hoveredZone = null;
        const zones = this.zoneManager.getZones();
        zones.forEach((zone, index) => {
            const pos = this.getZonePosition(index);
            const dist = Math.sqrt(Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2));
            if (dist < 50) {
                this.hoveredZone = zone.id;
            }
        });
    }
    updateLevelHover(mouseX, mouseY) {
        if (!this.selectedZone)
            return;
        this.hoveredLevel = null;
        const panelX = this.canvasWidth / 2 - 200;
        const startY = 180;
        const levelHeight = 70;
        this.selectedZone.levels.forEach((level, index) => {
            const y = startY + index * levelHeight - this.scrollOffset;
            if (mouseX >= panelX && mouseX <= panelX + 400 &&
                mouseY >= y && mouseY <= y + 60) {
                this.hoveredLevel = level.id;
            }
        });
    }
    getZonePosition(index) {
        // Arrange zones in a circle/arc pattern on the world map
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2 + 30;
        const radius = Math.min(this.canvasWidth, this.canvasHeight) * 0.3;
        const positions = [
            { x: centerX - radius * 0.8, y: centerY - radius * 0.3 }, // Jungle (left)
            { x: centerX + radius * 0.3, y: centerY - radius * 0.5 }, // Desert (top right)
            { x: centerX, y: centerY - radius * 0.8 }, // Arctic (top)
            { x: centerX + radius * 0.8, y: centerY + radius * 0.1 }, // Ocean (right)
            { x: centerX - radius * 0.2, y: centerY + radius * 0.5 } // Savannah (bottom)
        ];
        return positions[index] || { x: centerX, y: centerY };
    }
    render(ctx) {
        // Background - world map style
        this.renderBackground(ctx);
        if (this.showLevelSelect && this.selectedZone) {
            this.renderLevelSelect(ctx);
        }
        else {
            this.renderZoneMap(ctx);
        }
    }
    renderBackground(ctx) {
        // Dark blue oceanic background
        const gradient = ctx.createRadialGradient(this.canvasWidth / 2, this.canvasHeight / 2, 0, this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth);
        gradient.addColorStop(0, '#1a4a6e');
        gradient.addColorStop(1, '#0a1628');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Decorative grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvasWidth; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvasHeight);
            ctx.stroke();
        }
        for (let y = 0; y < this.canvasHeight; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvasWidth, y);
            ctx.stroke();
        }
        // Compass rose in corner
        this.renderCompass(ctx, 60, this.canvasHeight - 60);
    }
    renderCompass(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.animationTimer * 0.1);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        // Compass points
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((i / 8) * Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(0, i % 2 === 0 ? -35 : -25);
            ctx.stroke();
            ctx.restore();
        }
        // N marker
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', 0, -40);
        ctx.restore();
    }
    renderZoneMap(ctx) {
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌍 ' + this.i18n.t('choose_zone'), this.canvasWidth / 2, 50);
        // Subtitle with progress
        const progress = this.zoneManager.getProgress();
        ctx.fillStyle = '#87CEEB';
        ctx.font = '16px Arial';
        ctx.fillText(`${progress.zonesCompleted.length}/5 ${this.i18n.t('zones_completed')}`, this.canvasWidth / 2, 80);
        const zones = this.zoneManager.getZones();
        // Draw connections between zones
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i < zones.length - 1; i++) {
            const pos1 = this.getZonePosition(i);
            const pos2 = this.getZonePosition(i + 1);
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        // Draw zones
        zones.forEach((zone, index) => {
            this.renderZoneNode(ctx, zone, index);
        });
        // Instructions
        ctx.fillStyle = '#AAA';
        ctx.font = '14px Arial';
        ctx.fillText(this.i18n.t('click_zone'), this.canvasWidth / 2, this.canvasHeight - 30);
    }
    renderZoneNode(ctx, zone, index) {
        const pos = this.getZonePosition(index);
        const isHovered = this.hoveredZone === zone.id;
        const isLocked = !zone.unlocked;
        const isComplete = zone.completed;
        const baseRadius = 45;
        const radius = isHovered ? baseRadius + 8 : baseRadius;
        const pulse = Math.sin(this.animationTimer * 3) * 3;
        // Glow effect for unlocked zones
        if (!isLocked) {
            ctx.shadowColor = zone.color;
            ctx.shadowBlur = isHovered ? 30 : 15;
        }
        // Circle background
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isHovered ? pulse : 0), 0, Math.PI * 2);
        if (isLocked) {
            ctx.fillStyle = '#333';
        }
        else if (isComplete) {
            ctx.fillStyle = zone.color;
        }
        else {
            const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
            gradient.addColorStop(0, zone.color);
            gradient.addColorStop(1, this.darkenColor(zone.color, 0.3));
            ctx.fillStyle = gradient;
        }
        ctx.fill();
        // Border
        ctx.strokeStyle = isComplete ? '#FFD700' : (isLocked ? '#555' : '#FFF');
        ctx.lineWidth = isComplete ? 4 : 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Icon
        ctx.font = `${isHovered ? 36 : 32}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(isLocked ? '🔒' : zone.icon, pos.x, pos.y + 10);
        // Zone name
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.font = `bold ${isHovered ? 16 : 14}px Arial`;
        ctx.fillText(zone.name[this.i18n.getLanguage()], pos.x, pos.y + radius + 20);
        // Progress indicator
        if (!isLocked && !isComplete) {
            const completedLevels = zone.levels.filter(l => l.completed).length;
            ctx.fillStyle = '#AAA';
            ctx.font = '12px Arial';
            ctx.fillText(`${completedLevels}/${zone.levels.length}`, pos.x, pos.y + radius + 36);
        }
        // Completion star
        if (isComplete) {
            ctx.font = '24px Arial';
            ctx.fillText('⭐', pos.x + radius - 5, pos.y - radius + 15);
        }
    }
    renderLevelSelect(ctx) {
        if (!this.selectedZone)
            return;
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Panel background
        const panelWidth = 450;
        const panelHeight = Math.min(500, this.canvasHeight - 100);
        const panelX = (this.canvasWidth - panelWidth) / 2;
        const panelY = 80;
        // Panel with zone color
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        gradient.addColorStop(0, this.darkenColor(this.selectedZone.color, 0.7));
        gradient.addColorStop(1, this.darkenColor(this.selectedZone.color, 0.9));
        ctx.fillStyle = gradient;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        // Border
        ctx.strokeStyle = this.selectedZone.color;
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.stroke();
        // Zone header
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.selectedZone.icon} ${this.selectedZone.name[this.i18n.getLanguage()]}`, this.canvasWidth / 2, panelY + 40);
        // Description
        ctx.fillStyle = '#AAA';
        ctx.font = '14px Arial';
        ctx.fillText(this.selectedZone.description[this.i18n.getLanguage()], this.canvasWidth / 2, panelY + 65);
        // Levels list
        const startY = panelY + 100;
        const levelHeight = 70;
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX, startY, panelWidth, panelHeight - 130);
        ctx.clip();
        this.selectedZone.levels.forEach((level, index) => {
            this.renderLevelItem(ctx, level, panelX + 25, startY + index * levelHeight - this.scrollOffset, panelWidth - 50);
        });
        ctx.restore();
        // Back button
        this.renderBackButton(ctx, panelX + 20, panelY + panelHeight - 50);
        // Scroll hint if needed
        if (this.selectedZone.levels.length * levelHeight > panelHeight - 130) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.fillText('↕ ' + this.i18n.t('scroll'), this.canvasWidth / 2, panelY + panelHeight - 15);
        }
    }
    renderLevelItem(ctx, level, x, y, width) {
        const isHovered = this.hoveredLevel === level.id;
        const isLocked = !level.unlocked;
        const isComplete = level.completed;
        // Background
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)';
        this.roundRect(ctx, x, y, width, 60, 8);
        ctx.fill();
        if (isLocked) {
            ctx.fillStyle = '#555';
        }
        else if (isComplete) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y, width, 60, 8);
            ctx.stroke();
        }
        // Level number
        ctx.fillStyle = isLocked ? '#444' : (isComplete ? '#4CAF50' : '#FFD700');
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        const icon = isLocked ? '🔒' : (isComplete ? '✅' : '▶️');
        ctx.fillText(icon, x + 15, y + 38);
        // Level name
        ctx.fillStyle = isLocked ? '#666' : '#FFF';
        ctx.font = `bold ${isHovered ? 16 : 15}px Arial`;
        ctx.fillText(level.name[this.i18n.getLanguage()], x + 55, y + 25);
        // Description
        ctx.fillStyle = isLocked ? '#555' : '#AAA';
        ctx.font = '12px Arial';
        ctx.fillText(level.description[this.i18n.getLanguage()], x + 55, y + 42);
        // Time estimate
        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`⏱️ ${level.timeEstimate} min`, x + width - 10, y + 52);
        // Animals count
        const rareCount = level.animals.filter(a => a.isRare).length;
        ctx.fillText(`🦎 ${level.animals.length} (⭐${rareCount})`, x + width - 10, y + 25);
    }
    renderBackButton(ctx, x, y) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.roundRect(ctx, x, y, 100, 35, 5);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, 100, 35, 5);
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('← ' + this.i18n.t('back'), x + 50, y + 23);
    }
    handleClick(x, y) {
        if (this.showLevelSelect && this.selectedZone) {
            // Check back button
            const panelX = (this.canvasWidth - 450) / 2;
            const panelY = 80;
            const panelHeight = Math.min(500, this.canvasHeight - 100);
            if (x >= panelX + 20 && x <= panelX + 120 &&
                y >= panelY + panelHeight - 50 && y <= panelY + panelHeight - 15) {
                this.showLevelSelect = false;
                this.selectedZone = null;
                return true;
            }
            // Check level clicks
            if (this.hoveredLevel) {
                const level = this.selectedZone.levels.find(l => l.id === this.hoveredLevel);
                if (level && level.unlocked && this.onSelectCallback) {
                    this.onSelectCallback(this.selectedZone.id, level.id);
                    return true;
                }
            }
        }
        else {
            // Check zone clicks
            if (this.hoveredZone) {
                const zone = this.zoneManager.getZone(this.hoveredZone);
                if (zone && zone.unlocked) {
                    this.selectedZone = zone;
                    this.showLevelSelect = true;
                    this.scrollOffset = 0;
                    return true;
                }
            }
        }
        return false;
    }
    handleScroll(deltaY) {
        if (this.showLevelSelect && this.selectedZone) {
            const maxScroll = Math.max(0, this.selectedZone.levels.length * 70 - 350);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + deltaY * 0.5));
        }
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    reset() {
        this.showLevelSelect = false;
        this.selectedZone = null;
        this.hoveredZone = null;
        this.hoveredLevel = null;
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
    darkenColor(hex, factor) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.floor((num >> 16) * (1 - factor));
        const g = Math.floor(((num >> 8) & 0x00FF) * (1 - factor));
        const b = Math.floor((num & 0x0000FF) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
//# sourceMappingURL=ZoneSelectScreen.js.map