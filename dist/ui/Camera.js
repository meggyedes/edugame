// Camera mechanic for taking photos with pixel art backgrounds
import { I18n } from '../i18n/translations.js';
import { PhotoBackgrounds } from './PhotoBackgrounds.js';
export class CameraMechanic {
    constructor(canvasWidth, canvasHeight) {
        this.isActive = false;
        this.flashTimer = 0;
        this.crosshairX = 0;
        this.crosshairY = 0;
        // Viewfinder animation
        this.focusAnimation = 0;
        this.zoomLevel = 1.0;
        this.breathingOffset = 0;
        // Current biome for background
        this.currentBiome = 'jungle';
        // Photo preview
        this.showPhotoPreview = false;
        this.previewPhoto = null;
        this.previewTimer = 0;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.crosshairX = canvasWidth / 2;
        this.crosshairY = canvasHeight / 2;
        this.setupMouseListener();
    }
    setupMouseListener() {
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive)
                return;
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                this.crosshairX = e.clientX - rect.left;
                this.crosshairY = e.clientY - rect.top;
            }
        });
    }
    activate() {
        this.isActive = true;
        this.focusAnimation = 0;
        this.zoomLevel = 0.9;
    }
    deactivate() {
        this.isActive = false;
        this.showPhotoPreview = false;
    }
    isActiveMode() {
        return this.isActive;
    }
    setBiome(biome) {
        // Map BiomeType to BackgroundType
        const biomeMap = {
            'jungle': 'jungle',
            'rainforest': 'jungle',
            'desert': 'desert',
            'arctic': 'arctic',
            'tundra': 'arctic',
            'ocean': 'ocean',
            'coral_reef': 'ocean',
            'deep_ocean': 'ocean',
            'savannah': 'savannah',
            'forest': 'forest',
            'beach': 'beach',
            'wetland': 'jungle',
            'mountain': 'arctic',
        };
        this.currentBiome = biomeMap[biome] || 'jungle';
    }
    update(deltaTime) {
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }
        // Focus animation
        this.focusAnimation += deltaTime * 3;
        // Zoom smoothing
        this.zoomLevel += (1.0 - this.zoomLevel) * 0.1;
        // Camera breathing effect
        this.breathingOffset = Math.sin(Date.now() * 0.002) * 2;
        // Photo preview timer
        if (this.showPhotoPreview) {
            this.previewTimer -= deltaTime;
            if (this.previewTimer <= 0) {
                this.showPhotoPreview = false;
            }
        }
    }
    render(ctx) {
        if (!this.isActive)
            return;
        // ========== CAMERA VIEWFINDER FRAME ==========
        this.drawViewfinderFrame(ctx);
        // ========== FOCUS BRACKETS ==========
        this.drawFocusBrackets(ctx);
        // ========== CROSSHAIR ==========
        this.drawCrosshair(ctx);
        // ========== CAMERA INFO OVERLAY ==========
        this.drawCameraInfo(ctx);
        // ========== FOCUS INDICATOR ==========
        this.drawFocusIndicator(ctx);
        // ========== RULE OF THIRDS GRID ==========
        this.drawRuleOfThirds(ctx);
        // ========== FLASH EFFECT ==========
        if (this.flashTimer > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashTimer * 2})`;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        // ========== PHOTO PREVIEW ==========
        if (this.showPhotoPreview && this.previewPhoto) {
            this.drawPhotoPreview(ctx);
        }
    }
    drawViewfinderFrame(ctx) {
        // Dark vignette edges
        const gradient = ctx.createRadialGradient(this.canvasWidth / 2, this.canvasHeight / 2, Math.min(this.canvasWidth, this.canvasHeight) * 0.3, this.canvasWidth / 2, this.canvasHeight / 2, Math.max(this.canvasWidth, this.canvasHeight) * 0.8);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Camera frame borders
        const borderWidth = 60;
        const innerPadding = 20;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        // Top
        ctx.fillRect(0, 0, this.canvasWidth, borderWidth);
        // Bottom
        ctx.fillRect(0, this.canvasHeight - borderWidth - 40, this.canvasWidth, borderWidth + 40);
        // Left
        ctx.fillRect(0, borderWidth, innerPadding, this.canvasHeight - borderWidth * 2 - 40);
        // Right
        ctx.fillRect(this.canvasWidth - innerPadding, borderWidth, innerPadding, this.canvasHeight - borderWidth * 2 - 40);
        // Corner decorations (camera style)
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        const cornerSize = 30;
        // Top-left corner marks
        ctx.beginPath();
        ctx.moveTo(innerPadding + cornerSize, borderWidth);
        ctx.lineTo(innerPadding, borderWidth);
        ctx.lineTo(innerPadding, borderWidth + cornerSize);
        ctx.stroke();
        // Top-right corner marks
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth - innerPadding - cornerSize, borderWidth);
        ctx.lineTo(this.canvasWidth - innerPadding, borderWidth);
        ctx.lineTo(this.canvasWidth - innerPadding, borderWidth + cornerSize);
        ctx.stroke();
        // Bottom-left corner marks
        ctx.beginPath();
        ctx.moveTo(innerPadding + cornerSize, this.canvasHeight - borderWidth - 40);
        ctx.lineTo(innerPadding, this.canvasHeight - borderWidth - 40);
        ctx.lineTo(innerPadding, this.canvasHeight - borderWidth - 40 - cornerSize);
        ctx.stroke();
        // Bottom-right corner marks
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth - innerPadding - cornerSize, this.canvasHeight - borderWidth - 40);
        ctx.lineTo(this.canvasWidth - innerPadding, this.canvasHeight - borderWidth - 40);
        ctx.lineTo(this.canvasWidth - innerPadding, this.canvasHeight - borderWidth - 40 - cornerSize);
        ctx.stroke();
    }
    drawFocusBrackets(ctx) {
        const bracketSize = 60 + Math.sin(this.focusAnimation) * 5;
        const offset = this.breathingOffset;
        const cx = this.crosshairX;
        const cy = this.crosshairY;
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        // Four corner brackets around crosshair
        const positions = [
            { x: cx - bracketSize + offset, y: cy - bracketSize + offset, rot: 0 },
            { x: cx + bracketSize + offset, y: cy - bracketSize - offset, rot: Math.PI / 2 },
            { x: cx + bracketSize - offset, y: cy + bracketSize + offset, rot: Math.PI },
            { x: cx - bracketSize - offset, y: cy + bracketSize - offset, rot: -Math.PI / 2 }
        ];
        positions.forEach(pos => {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.rot);
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 0);
            ctx.lineTo(15, 0);
            ctx.stroke();
            ctx.restore();
        });
    }
    drawCrosshair(ctx) {
        const cx = this.crosshairX;
        const cy = this.crosshairY;
        const offset = this.breathingOffset * 0.5;
        // Center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx + offset, cy + offset, 3, 0, Math.PI * 2);
        ctx.fill();
        // Crosshair lines with gaps
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        const lineLength = 25;
        const gap = 12;
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(cx - gap - lineLength + offset, cy + offset);
        ctx.lineTo(cx - gap + offset, cy + offset);
        ctx.moveTo(cx + gap + offset, cy + offset);
        ctx.lineTo(cx + gap + lineLength + offset, cy + offset);
        // Vertical lines
        ctx.moveTo(cx + offset, cy - gap - lineLength + offset);
        ctx.lineTo(cx + offset, cy - gap + offset);
        ctx.moveTo(cx + offset, cy + gap + offset);
        ctx.lineTo(cx + offset, cy + gap + lineLength + offset);
        ctx.stroke();
        // Outer circle (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.stroke();
    }
    drawCameraInfo(ctx) {
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 14px monospace';
        // REC indicator (blinking)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(35, 35, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('● REC', 50, 40);
        }
        // Zoom level
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';
        ctx.fillText(`ZOOM: ${(this.zoomLevel * 100).toFixed(0)}%`, this.canvasWidth - 100, 35);
        // Biome indicator
        ctx.fillStyle = '#00FF00';
        ctx.fillText(`📍 ${this.currentBiome.toUpperCase()}`, 30, this.canvasHeight - 60);
        // Photo hint
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[ SPACE ] ${this.i18n.t('press_camera')}`, this.canvasWidth / 2, this.canvasHeight - 25);
        ctx.textAlign = 'left';
        // Camera settings (simulated)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px monospace';
        ctx.fillText('ISO: AUTO', this.canvasWidth - 100, this.canvasHeight - 80);
        ctx.fillText('f/2.8', this.canvasWidth - 100, this.canvasHeight - 65);
    }
    drawFocusIndicator(ctx) {
        // Focus bar
        const barWidth = 100;
        const barHeight = 8;
        const barX = this.canvasWidth - 120;
        const barY = 50;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        // Focus level (animated)
        const focusLevel = 0.5 + Math.sin(this.focusAnimation * 0.5) * 0.3;
        ctx.fillStyle = focusLevel > 0.7 ? '#00FF00' : '#FFFF00';
        ctx.fillRect(barX, barY, barWidth * focusLevel, barHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.fillText('FOCUS', barX, barY - 3);
    }
    drawRuleOfThirds(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        const viewLeft = 20;
        const viewRight = this.canvasWidth - 20;
        const viewTop = 60;
        const viewBottom = this.canvasHeight - 100;
        const viewWidth = viewRight - viewLeft;
        const viewHeight = viewBottom - viewTop;
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(viewLeft + viewWidth / 3, viewTop);
        ctx.lineTo(viewLeft + viewWidth / 3, viewBottom);
        ctx.moveTo(viewLeft + (viewWidth * 2) / 3, viewTop);
        ctx.lineTo(viewLeft + (viewWidth * 2) / 3, viewBottom);
        // Horizontal lines
        ctx.moveTo(viewLeft, viewTop + viewHeight / 3);
        ctx.lineTo(viewRight, viewTop + viewHeight / 3);
        ctx.moveTo(viewLeft, viewTop + (viewHeight * 2) / 3);
        ctx.lineTo(viewRight, viewTop + (viewHeight * 2) / 3);
        ctx.stroke();
    }
    drawPhotoPreview(ctx) {
        if (!this.previewPhoto)
            return;
        // Animate in
        const progress = Math.min(1, (2 - this.previewTimer) / 0.3);
        const slideOffset = (1 - progress) * 200;
        // Preview position (bottom right)
        const previewWidth = 200;
        const previewHeight = 150;
        const x = this.canvasWidth - previewWidth - 30 + slideOffset;
        const y = this.canvasHeight - previewHeight - 120;
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + 5, y + 5, previewWidth, previewHeight);
        // White border (Polaroid style)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 10, y - 10, previewWidth + 20, previewHeight + 40);
        // Photo
        ctx.drawImage(this.previewPhoto, x, y, previewWidth, previewHeight);
        // "Captured!" text
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📸 ' + this.i18n.t('photo_taken'), x + previewWidth / 2, y + previewHeight + 18);
        ctx.textAlign = 'left';
    }
    takePhoto(canvas, animal, biome) {
        if (!this.isActive || !animal)
            return null;
        // Flash effect
        this.flashTimer = 0.5;
        // Set biome for background
        this.setBiome(biome);
        // Create photo with pixel art background
        const photoCanvas = this.createPhotoWithBackground(canvas, animal, biome);
        // Show preview
        this.previewPhoto = photoCanvas;
        this.showPhotoPreview = true;
        this.previewTimer = 2.5; // 2.5 seconds
        // Create photo data
        const photo = {
            id: `photo_${Date.now()}`,
            animalId: animal.getId(),
            animalName: {
                nl: animal.getName('nl'),
                en: animal.getName('en'),
            },
            timestamp: Date.now(),
            dataUrl: photoCanvas.toDataURL('image/png'),
            location: biome,
            points: animal.getPoints(),
        };
        return photo;
    }
    createPhotoWithBackground(gameCanvas, animal, biome) {
        const photoCanvas = document.createElement('canvas');
        const photoWidth = 400;
        const photoHeight = 300;
        photoCanvas.width = photoWidth;
        photoCanvas.height = photoHeight;
        const ctx = photoCanvas.getContext('2d');
        // Get the pixel art background for current biome
        const backgrounds = PhotoBackgrounds.getInstance();
        const background = backgrounds.getBackground(this.currentBiome);
        // Draw background
        ctx.drawImage(background, 0, 0, photoWidth, photoHeight);
        // Add slight overlay for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, photoWidth, photoHeight);
        // Extract and draw the area around the crosshair from game canvas
        const captureSize = 200;
        const sourceX = Math.max(0, Math.min(gameCanvas.width - captureSize, this.crosshairX - captureSize / 2));
        const sourceY = Math.max(0, Math.min(gameCanvas.height - captureSize, this.crosshairY - captureSize / 2));
        // Create a cropped image from game canvas around crosshair
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = captureSize;
        tempCanvas.height = captureSize;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(gameCanvas, sourceX, sourceY, captureSize, captureSize, 0, 0, captureSize, captureSize);
        // Draw the cropped game content (mainly the animal) centered on the background
        // Using an elliptical mask for artistic effect
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(photoWidth / 2, photoHeight / 2 + 20, 140, 100, 0, 0, Math.PI * 2);
        ctx.clip();
        // Draw with semi-transparency to blend with background
        ctx.globalAlpha = 0.85;
        ctx.drawImage(tempCanvas, 0, 0, captureSize, captureSize, photoWidth / 2 - 140, photoHeight / 2 - 80, 280, 200);
        ctx.globalAlpha = 1;
        ctx.restore();
        // Add photo effects
        this.addPhotoEffects(ctx, photoWidth, photoHeight);
        // Add timestamp
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        const date = new Date();
        ctx.fillText(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, photoWidth - 10, photoHeight - 10);
        ctx.textAlign = 'left';
        // Add biome label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(8, photoHeight - 32, 85, 22);
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`📍 ${this.currentBiome.toUpperCase()}`, 12, photoHeight - 16);
        // Add animal name
        const animalName = animal.getName(this.i18n.getLanguage());
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.textAlign = 'center';
        const nameWidth = ctx.measureText(animalName).width + 20;
        ctx.fillRect(photoWidth / 2 - nameWidth / 2, 10, nameWidth, 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(animalName, photoWidth / 2, 30);
        // Quality stars based on points
        const points = animal.getPoints();
        const stars = Math.min(5, Math.ceil(points / 30));
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px Arial';
        ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), photoWidth / 2, 48);
        ctx.textAlign = 'left';
        return photoCanvas;
    }
    addPhotoEffects(ctx, width, height) {
        // Vignette effect
        const gradient = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.7);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        // Film grain effect (subtle)
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1;
        // Photo border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, width - 8, height - 8);
    }
    getCrosshairPosition() {
        return { x: this.crosshairX, y: this.crosshairY };
    }
    getWorldCrosshairPosition(cameraX, cameraY) {
        return {
            x: this.crosshairX + cameraX,
            y: this.crosshairY + cameraY,
        };
    }
    updateSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.crosshairX = width / 2;
        this.crosshairY = height / 2;
    }
}
//# sourceMappingURL=Camera.js.map