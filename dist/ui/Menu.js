// Main menu UI component
import { I18n } from '../i18n/translations.js';
export class Menu {
    constructor(canvasWidth, canvasHeight) {
        this.buttons = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationTimer = 0;
        this.hasProgress = false; // Whether player has saved progress
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.setupButtons();
        this.setupMouseListener();
    }
    setHasProgress(hasProgress) {
        this.hasProgress = hasProgress;
        this.setupButtons();
    }
    setupButtons() {
        const buttonWidth = 280;
        const buttonHeight = 60;
        const startX = (this.canvasWidth - buttonWidth) / 2;
        const centerY = this.canvasHeight / 2 + 60;
        const gap = 80;
        this.buttons = [];
        // Main play button - always visible
        this.buttons.push({
            text: this.hasProgress
                ? '▶  ' + (this.i18n.getLanguage() === 'nl' ? 'Doorgaan' : 'Continue')
                : '▶  ' + (this.i18n.getLanguage() === 'nl' ? 'Spelen' : 'Play'),
            action: 'start',
            x: startX,
            y: centerY,
            width: buttonWidth,
            height: buttonHeight,
            hovered: false,
            primary: true
        });
        // Language button - smaller, at the bottom
        const langBtnWidth = 160;
        const langBtnHeight = 45;
        this.buttons.push({
            text: `🌐 ${this.i18n.getLanguage() === 'nl' ? 'Nederlands' : 'English'}`,
            action: 'language',
            x: (this.canvasWidth - langBtnWidth) / 2,
            y: this.canvasHeight - 100,
            width: langBtnWidth,
            height: langBtnHeight,
            hovered: false
        });
    }
    setupMouseListener() {
        document.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                this.mouseX = (e.clientX - rect.left) * scaleX;
                this.mouseY = (e.clientY - rect.top) * scaleY;
            }
        });
    }
    update(deltaTime) {
        if (deltaTime) {
            this.animationTimer += deltaTime;
        }
        this.buttons.forEach(button => {
            button.hovered = this.isPointInButton(this.mouseX, this.mouseY, button);
        });
    }
    render(ctx) {
        // Beautiful gradient background
        const gradient = ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        gradient.addColorStop(0, '#0f2027');
        gradient.addColorStop(0.5, '#203a43');
        gradient.addColorStop(1, '#2c5364');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Animated particles
        this.renderParticles(ctx);
        // Decorative nature icons floating
        this.renderFloatingIcons(ctx);
        // Title with shadow
        this.renderTitle(ctx);
        // Character/mascot illustration
        this.renderMascot(ctx);
        // Tagline
        this.renderTagline(ctx);
        // Buttons
        this.buttons.forEach(button => this.renderButton(ctx, button));
        // Version/credits at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('v1.0 • Educational Wildlife Photography Game', this.canvasWidth / 2, this.canvasHeight - 20);
        ctx.textAlign = 'left';
    }
    renderParticles(ctx) {
        ctx.save();
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(this.animationTimer * 0.3 + i * 0.5) * 0.5 + 0.5) * this.canvasWidth;
            const y = (this.animationTimer * 20 + i * 80) % (this.canvasHeight + 100) - 50;
            const size = 2 + Math.sin(i) * 1.5;
            const alpha = 0.1 + Math.sin(this.animationTimer + i) * 0.05;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    renderFloatingIcons(ctx) {
        const icons = ['🦁', '🐘', '🦜', '🐢', '🦋', '🌿', '📷', '🌍'];
        ctx.font = '30px Arial';
        ctx.globalAlpha = 0.15;
        icons.forEach((icon, i) => {
            const baseX = (i * this.canvasWidth / icons.length) + 50;
            const baseY = 100 + (i % 3) * 150;
            const offsetX = Math.sin(this.animationTimer * 0.5 + i) * 20;
            const offsetY = Math.cos(this.animationTimer * 0.3 + i) * 15;
            ctx.fillText(icon, baseX + offsetX, baseY + offsetY);
        });
        ctx.globalAlpha = 1;
    }
    renderTitle(ctx) {
        const centerX = this.canvasWidth / 2;
        const titleY = 120;
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = 'bold 56px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Milo van Zee', centerX + 3, titleY + 3);
        // Main title - gradient effect simulated
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Milo van Zee', centerX, titleY);
        // Subtitle
        ctx.fillStyle = '#87CEEB';
        ctx.font = 'italic 24px Georgia, serif';
        ctx.fillText('World Explorer', centerX, titleY + 40);
    }
    renderMascot(ctx) {
        const centerX = this.canvasWidth / 2;
        const mascotY = this.canvasHeight / 2 - 40;
        // Glowing circle background
        const glowGradient = ctx.createRadialGradient(centerX, mascotY, 0, centerX, mascotY, 80);
        glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, mascotY, 80, 0, Math.PI * 2);
        ctx.fill();
        // Mascot circle
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(centerX, mascotY, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Compass/explorer icon
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🧭', centerX - 2, mascotY + 18);
        // Floating camera icon
        const camOffsetX = Math.sin(this.animationTimer * 2) * 10;
        const camOffsetY = Math.cos(this.animationTimer * 2) * 5;
        ctx.font = '28px Arial';
        ctx.fillText('📷', centerX + 60 + camOffsetX, mascotY - 30 + camOffsetY);
    }
    renderTagline(ctx) {
        const centerX = this.canvasWidth / 2;
        const y = this.canvasHeight / 2 + 30;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const tagline = this.i18n.getLanguage() === 'nl'
            ? '🌿 Ontdek dieren • Maak foto\'s • Leer over de natuur 🌿'
            : '🌿 Discover animals • Take photos • Learn about nature 🌿';
        ctx.fillText(tagline, centerX, y);
    }
    renderButton(ctx, button) {
        ctx.save();
        const isHovered = button.hovered;
        const isPrimary = button.primary;
        // Button shadow
        if (isPrimary) {
            ctx.shadowColor = isHovered ? '#4CAF50' : 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = isHovered ? 20 : 10;
            ctx.shadowOffsetY = 5;
        }
        // Button background
        if (isPrimary) {
            const btnGradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height);
            if (isHovered) {
                btnGradient.addColorStop(0, '#66BB6A');
                btnGradient.addColorStop(1, '#43A047');
            }
            else {
                btnGradient.addColorStop(0, '#4CAF50');
                btnGradient.addColorStop(1, '#388E3C');
            }
            ctx.fillStyle = btnGradient;
        }
        else {
            ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        }
        // Rounded rectangle
        this.roundRect(ctx, button.x, button.y, button.width, button.height, isPrimary ? 15 : 10);
        ctx.fill();
        // Border
        ctx.strokeStyle = isPrimary
            ? (isHovered ? '#81C784' : '#4CAF50')
            : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isPrimary ? 3 : 1;
        this.roundRect(ctx, button.x, button.y, button.width, button.height, isPrimary ? 15 : 10);
        ctx.stroke();
        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = isPrimary ? 'bold 22px Arial' : '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
        ctx.restore();
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
    isPointInButton(x, y, button) {
        return x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height;
    }
    handleClick(x, y) {
        for (const button of this.buttons) {
            if (this.isPointInButton(x, y, button)) {
                return button.action;
            }
        }
        return 'none';
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.setupButtons();
    }
}
//# sourceMappingURL=Menu.js.map