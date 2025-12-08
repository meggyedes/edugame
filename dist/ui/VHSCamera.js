// WildlifeScanner - Modern wildlife tracking camera with scanning interface
// Used to photograph evidence and animals with a futuristic scanner aesthetic
import { I18n } from '../i18n/translations.js';
export class VHSCamera {
    constructor(canvasWidth, canvasHeight) {
        this.isActive = false;
        // Camera controls
        this.zoomLevel = 1.0; // 1.0 to 3.0
        this.focusLevel = 0.5; // 0 = blurry, 1 = sharp
        this.targetFocus = 0.5; // What focus SHOULD be for current subject
        this.autoFocusEnabled = false;
        // Scanner effects
        this.scanlineOffset = 0;
        this.scanProgress = 0; // 0-100 scanning animation
        this.isScanning = false;
        this.scanPulse = 0;
        this.timestamp = Date.now();
        this.recordingTime = 0;
        this.batteryLevel = 100;
        // Target detection
        this.targetDetected = false;
        this.targetType = '';
        this.targetDistance = 0;
        this.targetConfidence = 0;
        // Animation
        this.animationTimer = 0;
        this.flashTimer = 0;
        this.shutterAnimation = 0;
        // Crosshair position (center of screen by default)
        this.crosshairX = 0;
        this.crosshairY = 0;
        // Handheld camera offset (world position offset from player)
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.maxCameraOffsetX = 600; // Max horizontal distance camera can move from player
        this.maxCameraOffsetY = 450; // Max vertical distance camera can move from player
        this.cameraSpeed = 250; // Pixels per second (increased for larger range)
        // Hand shake effect
        this.handShakeX = 0;
        this.handShakeY = 0;
        this.handShakeIntensity = 2; // Subtle shake
        // Photo capture
        this.lastPhotoResult = null;
        this.photoPreviewTimer = 0;
        // Mobile/touch support
        this.isMobile = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastPinchDistance = 0;
        this.touchCameraOffsetX = 0;
        this.touchCameraOffsetY = 0;
        this.mobileButtonAreas = {};
        // Mobile button action flags (read by Game.ts)
        this.triggerMobileCapture = false;
        this.triggerMobileClose = false;
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.crosshairX = canvasWidth / 2;
        this.crosshairY = canvasHeight / 2;
        this.isMobile = this.detectMobile();
        // Set max camera offset based on initial canvas size
        this.maxCameraOffsetX = Math.max(400, canvasWidth * 0.5);
        this.maxCameraOffsetY = Math.max(300, canvasHeight * 0.5);
    }
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1024;
    }
    getIsMobile() {
        return this.isMobile;
    }
    // Touch handlers for mobile camera control
    handleTouchStart(touches) {
        if (!this.isActive)
            return;
        if (touches.length === 1) {
            // Single touch - check if it's on a button first
            const touchX = touches[0].clientX;
            const touchY = touches[0].clientY;
            const button = this.checkMobileButtonTouch(touchX, touchY);
            if (button) {
                // Handle button press
                this.handleMobileButtonPress(button);
                return;
            }
            // Not a button - start pan
            this.touchStartX = touches[0].clientX;
            this.touchStartY = touches[0].clientY;
            this.touchCameraOffsetX = this.cameraOffsetX;
            this.touchCameraOffsetY = this.cameraOffsetY;
        }
        else if (touches.length === 2) {
            // Two finger touch - pinch to zoom
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }
    handleTouchMove(touches) {
        if (!this.isActive)
            return;
        if (touches.length === 1) {
            // Single touch - pan camera
            const dx = touches[0].clientX - this.touchStartX;
            const dy = touches[0].clientY - this.touchStartY;
            // Move camera in opposite direction of touch drag (natural panning)
            this.cameraOffsetX = this.touchCameraOffsetX - dx * 0.5;
            this.cameraOffsetY = this.touchCameraOffsetY - dy * 0.5;
            // Clamp to max offset (separate X/Y for widescreen support)
            this.cameraOffsetX = Math.max(-this.maxCameraOffsetX, Math.min(this.maxCameraOffsetX, this.cameraOffsetX));
            this.cameraOffsetY = Math.max(-this.maxCameraOffsetY, Math.min(this.maxCameraOffsetY, this.cameraOffsetY));
        }
        else if (touches.length === 2) {
            // Two finger touch - pinch to zoom
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            if (this.lastPinchDistance > 0) {
                const scale = currentDistance / this.lastPinchDistance;
                if (scale > 1.02) {
                    this.zoomIn();
                    this.lastPinchDistance = currentDistance;
                }
                else if (scale < 0.98) {
                    this.zoomOut();
                    this.lastPinchDistance = currentDistance;
                }
            }
        }
    }
    handleTouchEnd() {
        this.lastPinchDistance = 0;
    }
    checkMobileButtonTouch(x, y) {
        // Check each button area
        for (const [name, area] of Object.entries(this.mobileButtonAreas)) {
            if (area) {
                const dx = x - area.x;
                const dy = y - area.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= area.radius) {
                    return name;
                }
            }
        }
        return null;
    }
    handleMobileButtonPress(button) {
        switch (button) {
            case 'capture':
                // Photo capture will be handled by returning a signal
                this.triggerMobileCapture = true;
                break;
            case 'zoomIn':
                this.zoomIn();
                break;
            case 'zoomOut':
                this.zoomOut();
                break;
            case 'close':
                this.triggerMobileClose = true;
                break;
            case 'movePad':
                // Movement handled separately in handleTouchMove
                break;
        }
    }
    checkMobileCapture() {
        if (this.triggerMobileCapture) {
            this.triggerMobileCapture = false;
            return true;
        }
        return false;
    }
    checkMobileClose() {
        if (this.triggerMobileClose) {
            this.triggerMobileClose = false;
            return true;
        }
        return false;
    }
    activate() {
        this.isActive = true;
        this.recordingTime = 0;
        // Reset camera offset when activating
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }
    deactivate() {
        this.isActive = false;
        // Reset camera offset
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }
    isActiveMode() {
        return this.isActive;
    }
    update(deltaTime) {
        if (!this.isActive)
            return;
        this.animationTimer += deltaTime;
        this.recordingTime += deltaTime;
        // Scanner effects animation
        this.scanlineOffset = (this.scanlineOffset + deltaTime * 100) % 360;
        this.scanPulse = (Math.sin(this.animationTimer * 3) + 1) / 2; // 0-1 pulsing
        // Scanning progress when target detected
        if (this.targetDetected && this.scanProgress < 100) {
            this.scanProgress = Math.min(100, this.scanProgress + deltaTime * 30);
            this.isScanning = true;
        }
        else if (!this.targetDetected) {
            this.scanProgress = Math.max(0, this.scanProgress - deltaTime * 50);
            this.isScanning = this.scanProgress > 0;
        }
        // Target confidence fluctuation
        if (this.targetDetected) {
            this.targetConfidence = 85 + Math.sin(this.animationTimer * 2) * 10;
        }
        // Handheld shake effect - subtle realistic camera shake
        this.handShakeX = (Math.sin(this.animationTimer * 8) + Math.sin(this.animationTimer * 13)) * this.handShakeIntensity;
        this.handShakeY = (Math.cos(this.animationTimer * 10) + Math.cos(this.animationTimer * 7)) * this.handShakeIntensity;
        // Battery drain (very slow)
        this.batteryLevel = Math.max(0, this.batteryLevel - deltaTime * 0.01);
        // Flash timer countdown
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }
        // Shutter animation
        if (this.shutterAnimation > 0) {
            this.shutterAnimation -= deltaTime * 3;
        }
        // Photo preview countdown
        if (this.photoPreviewTimer > 0) {
            this.photoPreviewTimer -= deltaTime;
        }
        // Focus drift (makes it challenging to keep focus)
        if (!this.autoFocusEnabled) {
            this.focusLevel += (Math.random() - 0.5) * deltaTime * 0.1;
            this.focusLevel = Math.max(0, Math.min(1, this.focusLevel));
        }
    }
    // Handheld camera movement - moves camera view independently from player
    moveCamera(dx, dy, deltaTime) {
        if (!this.isActive)
            return;
        // Apply movement with speed
        this.cameraOffsetX += dx * this.cameraSpeed * deltaTime;
        this.cameraOffsetY += dy * this.cameraSpeed * deltaTime;
        // Clamp to max offset (separate X/Y for widescreen support)
        this.cameraOffsetX = Math.max(-this.maxCameraOffsetX, Math.min(this.maxCameraOffsetX, this.cameraOffsetX));
        this.cameraOffsetY = Math.max(-this.maxCameraOffsetY, Math.min(this.maxCameraOffsetY, this.cameraOffsetY));
    }
    // Get camera offset for rendering
    getCameraOffset() {
        return {
            x: this.cameraOffsetX + this.handShakeX,
            y: this.cameraOffsetY + this.handShakeY
        };
    }
    // Reset camera to center (recenter on player)
    recenterCamera() {
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }
    // Zoom controls
    zoomIn() {
        this.zoomLevel = Math.min(3.0, this.zoomLevel + 0.2);
    }
    zoomOut() {
        this.zoomLevel = Math.max(1.0, this.zoomLevel - 0.2);
    }
    setZoom(level) {
        this.zoomLevel = Math.max(1.0, Math.min(3.0, level));
    }
    getZoom() {
        return this.zoomLevel;
    }
    // Focus controls
    adjustFocus(delta) {
        this.focusLevel = Math.max(0, Math.min(1, this.focusLevel + delta));
    }
    getFocus() {
        return this.focusLevel;
    }
    setTargetFocus(distance) {
        // Distance affects what focus level is "correct"
        // Close subjects need low focus, far subjects need high focus
        this.targetFocus = Math.max(0.2, Math.min(0.9, distance / 500));
    }
    toggleAutoFocus() {
        this.autoFocusEnabled = !this.autoFocusEnabled;
        if (this.autoFocusEnabled) {
            this.focusLevel = this.targetFocus;
        }
    }
    // Calculate photo quality based on focus accuracy
    calculatePhotoQuality() {
        const focusDiff = Math.abs(this.focusLevel - this.targetFocus);
        const focusQuality = Math.max(0, 100 - focusDiff * 200);
        // Zoom affects quality slightly
        const zoomPenalty = (this.zoomLevel - 1) * 5;
        return Math.round(Math.max(10, focusQuality - zoomPenalty));
    }
    // Take a photo - now uses clean capture
    takePhoto(canvas, subjectType, subjectId, biome, cameraX = 0, cameraY = 0) {
        if (!this.isActive)
            return null;
        // Trigger flash and shutter
        this.flashTimer = 0.3;
        this.shutterAnimation = 1;
        // Calculate quality
        const quality = this.calculatePhotoQuality();
        // Capture clean photo (without VHS overlay)
        const cleanDataUrl = this.captureCleanPhoto(canvas, cameraX, cameraY);
        // Create photo result
        const result = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl: cleanDataUrl,
            timestamp: Date.now(),
            subjectType,
            subjectId,
            quality,
            biome
        };
        this.lastPhotoResult = result;
        this.photoPreviewTimer = 2; // Show preview for 2 seconds
        return result;
    }
    // Get world position of crosshair (includes handheld camera offset)
    getWorldCrosshairPosition(cameraX, cameraY) {
        // The crosshair is at the center of the screen
        // Plus the handheld camera offset (how much we've panned the camera)
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        // Add camera offset to world position
        const offset = this.getCameraOffset();
        return {
            x: cameraX + centerX + offset.x,
            y: cameraY + centerY + offset.y
        };
    }
    // Create a clean screenshot without VHS overlay for saving
    captureCleanPhoto(gameCanvas, cameraX, cameraY) {
        // Create a temporary canvas for clean capture
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        // Make it smaller for efficiency (photo size)
        const photoWidth = 400;
        const photoHeight = 300;
        tempCanvas.width = photoWidth;
        tempCanvas.height = photoHeight;
        // Calculate the visible area based on zoom AND camera offset
        const offset = this.getCameraOffset();
        const sourceX = (this.canvasWidth / 2) - (photoWidth / 2 / this.zoomLevel) + offset.x / this.zoomLevel;
        const sourceY = (this.canvasHeight / 2) - (photoHeight / 2 / this.zoomLevel) + offset.y / this.zoomLevel;
        const sourceWidth = photoWidth / this.zoomLevel;
        const sourceHeight = photoHeight / this.zoomLevel;
        // Draw the zoomed portion of the game canvas
        tempCtx.drawImage(gameCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, photoWidth, photoHeight);
        // Add subtle VHS effect to the photo (but not the full overlay)
        this.addPhotoVHSEffect(tempCtx, photoWidth, photoHeight);
        return tempCanvas.toDataURL('image/jpeg', 0.85);
    }
    addPhotoVHSEffect(ctx, w, h) {
        // Subtle scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
        // Slight vignette
        const gradient = ctx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, w / 1.2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        // Date stamp in corner
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.textAlign = 'right';
        const now = new Date();
        ctx.fillText(now.toLocaleDateString('nl-NL'), w - 10, h - 10);
    }
    render(ctx) {
        if (!this.isActive)
            return;
        ctx.save();
        // NO full screen zoom transform - player can move freely
        // Zoom only affects the viewfinder area and photo capture
        // Apply blur based on focus (subtle effect only)
        const blurAmount = Math.abs(this.focusLevel - this.targetFocus) * 5;
        if (blurAmount > 0.5) {
            // Don't apply blur to full screen, only mention it in UI
        }
        ctx.restore();
        // Render VHS overlay on top (NOT full screen blocking)
        this.renderVHSOverlay(ctx);
        // Flash effect
        if (this.flashTimer > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashTimer * 2})`;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        // Photo preview
        if (this.photoPreviewTimer > 0 && this.lastPhotoResult) {
            this.renderPhotoPreview(ctx);
        }
    }
    renderVHSOverlay(ctx) {
        const lang = this.i18n.getLanguage();
        // === MODERN WILDLIFE SCANNER INTERFACE ===
        // Dark vignette around edges (depth of field simulation)
        this.renderVignette(ctx);
        // Scanner frame overlay
        this.renderScannerFrame(ctx);
        // Central targeting reticle with paw icon
        this.renderTargetingReticle(ctx);
        // Top HUD - scanning status and target info
        this.renderTopHUD(ctx, lang);
        // Side panels with data
        this.renderSidePanels(ctx, lang);
        // Bottom control bar
        this.renderBottomControlBar(ctx, lang);
        // Scanning effect overlay
        if (this.isScanning) {
            this.renderScanningEffect(ctx);
        }
        // Mobile touch buttons (only on mobile/tablet)
        if (this.isMobile) {
            this.renderMobileControls(ctx);
        }
    }
    renderVignette(ctx) {
        // Strong bokeh/depth of field vignette
        const gradient = ctx.createRadialGradient(this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.25, this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.7);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    renderScannerFrame(ctx) {
        // Corner brackets (like the image)
        const margin = 40;
        const bracketLength = 60;
        const bracketWidth = 3;
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
        ctx.lineWidth = bracketWidth;
        ctx.lineCap = 'round';
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(margin, margin + bracketLength);
        ctx.lineTo(margin, margin);
        ctx.lineTo(margin + bracketLength, margin);
        ctx.stroke();
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth - margin - bracketLength, margin);
        ctx.lineTo(this.canvasWidth - margin, margin);
        ctx.lineTo(this.canvasWidth - margin, margin + bracketLength);
        ctx.stroke();
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(margin, this.canvasHeight - margin - bracketLength);
        ctx.lineTo(margin, this.canvasHeight - margin);
        ctx.lineTo(margin + bracketLength, this.canvasHeight - margin);
        ctx.stroke();
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth - margin - bracketLength, this.canvasHeight - margin);
        ctx.lineTo(this.canvasWidth - margin, this.canvasHeight - margin);
        ctx.lineTo(this.canvasWidth - margin, this.canvasHeight - margin - bracketLength);
        ctx.stroke();
        // Thin scanning lines at top and bottom
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = margin + 10 + i * 3;
            ctx.beginPath();
            ctx.moveTo(margin + 20, y);
            ctx.lineTo(this.canvasWidth - margin - 20, y);
            ctx.stroke();
        }
    }
    renderTargetingReticle(ctx) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const reticleSize = 100;
        // Outer rotating ring
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.scanlineOffset * Math.PI / 180);
        // Dashed outer circle
        ctx.strokeStyle = this.targetDetected ? 'rgba(0, 255, 100, 0.8)' : 'rgba(0, 200, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, reticleSize + 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        // Inner targeting brackets
        const innerSize = 70;
        const bracketLen = 20;
        ctx.strokeStyle = this.targetDetected ? '#00ff66' : '#00ccff';
        ctx.lineWidth = 3;
        // Pulsing effect
        const pulse = this.targetDetected ? (1 + this.scanPulse * 0.3) : 1;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        // Top bracket
        ctx.beginPath();
        ctx.moveTo(-bracketLen, -innerSize);
        ctx.lineTo(0, -innerSize);
        ctx.lineTo(0, -innerSize + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bracketLen, -innerSize);
        ctx.lineTo(0, -innerSize);
        ctx.stroke();
        // Bottom bracket
        ctx.beginPath();
        ctx.moveTo(-bracketLen, innerSize);
        ctx.lineTo(0, innerSize);
        ctx.lineTo(0, innerSize - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bracketLen, innerSize);
        ctx.lineTo(0, innerSize);
        ctx.stroke();
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(-innerSize, -bracketLen);
        ctx.lineTo(-innerSize, 0);
        ctx.lineTo(-innerSize + 10, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-innerSize, bracketLen);
        ctx.lineTo(-innerSize, 0);
        ctx.stroke();
        // Right bracket
        ctx.beginPath();
        ctx.moveTo(innerSize, -bracketLen);
        ctx.lineTo(innerSize, 0);
        ctx.lineTo(innerSize - 10, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(innerSize, bracketLen);
        ctx.lineTo(innerSize, 0);
        ctx.stroke();
        ctx.restore();
        // Center paw icon
        this.renderPawIcon(ctx, centerX, centerY, 35);
        // Target lock indicator circles
        if (this.targetDetected) {
            ctx.strokeStyle = `rgba(0, 255, 100, ${0.3 + this.scanPulse * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50 + this.scanPulse * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    renderPawIcon(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        // Glow effect
        ctx.shadowColor = this.targetDetected ? '#00ff66' : '#00ccff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.targetDetected ?
            `rgba(0, 255, 100, ${0.6 + this.scanPulse * 0.4})` :
            'rgba(0, 200, 255, 0.7)';
        // Main pad (large oval)
        ctx.beginPath();
        ctx.ellipse(0, 8, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Toe pads (4 circles)
        const toePositions = [
            { x: -size * 0.35, y: -size * 0.25, r: size * 0.2 },
            { x: -size * 0.12, y: -size * 0.45, r: size * 0.18 },
            { x: size * 0.12, y: -size * 0.45, r: size * 0.18 },
            { x: size * 0.35, y: -size * 0.25, r: size * 0.2 },
        ];
        toePositions.forEach(toe => {
            ctx.beginPath();
            ctx.arc(toe.x, toe.y, toe.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    renderTopHUD(ctx, lang) {
        const topY = 60;
        // Left side - SCANNING status
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.roundRect(ctx, 50, topY, 180, 35, 5);
        ctx.fill();
        // Scanning indicator
        const scanText = this.isScanning ?
            (lang === 'nl' ? 'SCANNEN...' : 'SCANNING...') :
            (lang === 'nl' ? 'GEREED' : 'READY');
        ctx.fillStyle = this.isScanning ? '#00ff66' : '#00ccff';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'left';
        // Blinking dot
        if (this.isScanning && Math.floor(this.animationTimer * 3) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(65, topY + 18, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillText(scanText, 80, topY + 23);
        // Right side - Target info box
        if (this.targetDetected) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.roundRect(ctx, this.canvasWidth - 230, topY, 180, 80, 5);
            ctx.fill();
            ctx.strokeStyle = '#00ff66';
            ctx.lineWidth = 1;
            this.roundRect(ctx, this.canvasWidth - 230, topY, 180, 80, 5);
            ctx.stroke();
            ctx.fillStyle = '#00ff66';
            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(lang === 'nl' ? 'DOEL GEVONDEN' : 'TARGET FOUND', this.canvasWidth - 220, topY + 18);
            ctx.fillStyle = '#fff';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(`${lang === 'nl' ? 'Type' : 'Type'}: ${this.targetType || 'Animal'}`, this.canvasWidth - 220, topY + 35);
            ctx.fillText(`${lang === 'nl' ? 'Afstand' : 'Distance'}: ${this.targetDistance}m`, this.canvasWidth - 220, topY + 50);
            ctx.fillText(`${lang === 'nl' ? 'Zekerheid' : 'Confidence'}: ${Math.round(this.targetConfidence)}%`, this.canvasWidth - 220, topY + 65);
        }
    }
    renderSidePanels(ctx, lang) {
        // Left side panel - Zoom & coordinates
        const leftX = 50;
        const panelY = this.canvasHeight / 2 - 80;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.roundRect(ctx, leftX, panelY, 110, 150, 5);
        ctx.fill();
        ctx.fillStyle = '#00ccff';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('ZOOM [X/Y]', leftX + 10, panelY + 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.fillText(`${this.zoomLevel.toFixed(1)}x`, leftX + 10, panelY + 45);
        // Zoom bar (larger)
        ctx.fillStyle = '#333';
        ctx.fillRect(leftX + 10, panelY + 55, 90, 12);
        ctx.fillStyle = '#00ccff';
        ctx.fillRect(leftX + 10, panelY + 55, ((this.zoomLevel - 1) / 2) * 90, 12);
        // Zoom hints
        ctx.fillStyle = '#666';
        ctx.font = '9px "Courier New", monospace';
        ctx.fillText('X: -   Y: +', leftX + 10, panelY + 82);
        // Coordinates
        ctx.fillStyle = '#888';
        const coords = `${Math.round(this.cameraOffsetX)}, ${Math.round(this.cameraOffsetY)}`;
        ctx.fillText(`POS: ${coords}`, leftX + 10, panelY + 100);
        // Time
        const now = new Date();
        ctx.fillText(now.toLocaleTimeString('nl-NL'), leftX + 10, panelY + 118);
        ctx.fillText(now.toLocaleDateString('nl-NL'), leftX + 10, panelY + 135);
    }
    renderBottomControlBar(ctx, lang) {
        const barHeight = 60;
        const barY = this.canvasHeight - barHeight - 20;
        // Semi-transparent bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, 50, barY, this.canvasWidth - 100, barHeight, 10);
        ctx.fill();
        // Left side - Objective
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.roundRect(ctx, 60, barY + 10, 200, 40, 5);
        ctx.fill();
        // Objective icon and text
        ctx.fillStyle = '#888';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯', 85, barY + 38);
        ctx.fillStyle = '#aaa';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'nl' ? 'DOEL: IDENTIFICEER SPOREN' : 'OBJECTIVE: IDENTIFY TRACKS', 110, barY + 35);
        // Center - Main buttons
        const centerX = this.canvasWidth / 2;
        // SCAN button (X)
        const scanBtnX = centerX - 80;
        ctx.fillStyle = 'rgba(0, 150, 200, 0.6)';
        this.roundRect(ctx, scanBtnX, barY + 10, 70, 40, 8);
        ctx.fill();
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 2;
        this.roundRect(ctx, scanBtnX, barY + 10, 70, 40, 8);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ⓧ', scanBtnX + 20, barY + 28);
        ctx.fillText('SCAN', scanBtnX + 35, barY + 42);
        // CAPTURE button (Y)
        const captureBtnX = centerX + 10;
        ctx.fillStyle = 'rgba(200, 50, 50, 0.6)';
        this.roundRect(ctx, captureBtnX, barY + 10, 90, 40, 8);
        ctx.fill();
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 2;
        this.roundRect(ctx, captureBtnX, barY + 10, 90, 40, 8);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('Ⓨ', captureBtnX + 20, barY + 28);
        ctx.fillText(lang === 'nl' ? 'FOTO' : 'CAPTURE', captureBtnX + 55, barY + 42);
        // Right side - Recording indicator
        const recX = this.canvasWidth - 150;
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.roundRect(ctx, recX, barY + 10, 90, 40, 5);
        ctx.fill();
        // REC dot (blinking)
        if (Math.floor(this.animationTimer * 2) % 2 === 0) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(recX + 20, barY + 30, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'left';
        const mins = Math.floor(this.recordingTime / 60);
        const secs = Math.floor(this.recordingTime % 60);
        ctx.fillText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, recX + 35, barY + 35);
    }
    renderScanningEffect(ctx) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        // Scanning line sweeping effect
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((this.scanlineOffset * 2) * Math.PI / 180);
        // Radial scanning line
        const gradient = ctx.createLinearGradient(0, 0, 150, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 100, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(150, 0);
        ctx.stroke();
        ctx.restore();
        // Progress bar at bottom of reticle
        const progressWidth = 100;
        const progressX = centerX - progressWidth / 2;
        const progressY = centerY + 90;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(progressX, progressY, progressWidth, 6);
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(progressX, progressY, (this.scanProgress / 100) * progressWidth, 6);
        // Percentage text
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.scanProgress)}%`, centerX, progressY + 18);
    }
    // New method to set target detection status
    setTargetDetected(detected, type = '', distance = 0) {
        this.targetDetected = detected;
        this.targetType = type;
        this.targetDistance = distance;
        if (!detected) {
            this.scanProgress = 0;
        }
    }
    renderMobileControls(ctx) {
        const btnSize = 60;
        const margin = 20;
        // === LEFT SIDE - Movement pad ===
        const padX = margin + btnSize;
        const padY = this.canvasHeight - margin - btnSize * 2 - 80; // Above bottom bar
        // Virtual joystick background
        ctx.fillStyle = 'rgba(0, 100, 150, 0.4)';
        ctx.beginPath();
        ctx.arc(padX, padY, btnSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Joystick center
        ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(padX + this.touchCameraOffsetX * 0.3, padY + this.touchCameraOffsetY * 0.3, 25, 0, Math.PI * 2);
        ctx.fill();
        // Direction arrows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('▲', padX, padY - 35);
        ctx.fillText('▼', padX, padY + 45);
        ctx.fillText('◀', padX - 40, padY + 5);
        ctx.fillText('▶', padX + 40, padY + 5);
        // === RIGHT SIDE - Action buttons ===
        const rightX = this.canvasWidth - margin - btnSize / 2;
        // Photo/Capture button (large, cyan)
        const captureY = this.canvasHeight - margin - btnSize - 80;
        ctx.fillStyle = 'rgba(0, 150, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, captureY, btnSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📷', rightX, captureY + 7);
        this.mobileButtonAreas.capture = { x: rightX, y: captureY, radius: btnSize / 2 };
        // Zoom IN button (+)
        const zoomInY = captureY - btnSize - 20;
        ctx.fillStyle = 'rgba(0, 100, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, zoomInY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('+', rightX, zoomInY + 8);
        this.mobileButtonAreas.zoomIn = { x: rightX, y: zoomInY, radius: 25 };
        // Zoom OUT button (-)
        const zoomOutY = zoomInY - 60;
        ctx.fillStyle = 'rgba(0, 100, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, zoomOutY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('−', rightX, zoomOutY + 8);
        this.mobileButtonAreas.zoomOut = { x: rightX, y: zoomOutY, radius: 25 };
        // Close/Exit button (top right)
        const closeX = this.canvasWidth - margin - 25;
        const closeY = margin + 80;
        ctx.fillStyle = 'rgba(150, 50, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(closeX, closeY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('✕', closeX, closeY + 7);
        this.mobileButtonAreas.close = { x: closeX, y: closeY, radius: 22 };
        this.mobileButtonAreas.movePad = { x: padX, y: padY, radius: btnSize };
    }
    getFocusIndicatorColor() {
        const focusDiff = Math.abs(this.focusLevel - this.targetFocus);
        if (focusDiff < 0.1)
            return '#00FF00';
        if (focusDiff < 0.25)
            return '#FFFF00';
        return '#FF0000';
    }
    renderPhotoPreview(ctx) {
        if (!this.lastPhotoResult)
            return;
        // Small preview in corner
        const previewWidth = 200;
        const previewHeight = 150;
        const previewX = this.canvasWidth - previewWidth - 60;
        const previewY = this.canvasHeight - previewHeight - 100;
        // Frame
        ctx.fillStyle = '#000';
        ctx.fillRect(previewX - 5, previewY - 5, previewWidth + 10, previewHeight + 30);
        // Photo
        const img = new Image();
        img.src = this.lastPhotoResult.dataUrl;
        if (img.complete) {
            ctx.drawImage(img, previewX, previewY, previewWidth, previewHeight);
        }
        // Quality badge
        const quality = this.lastPhotoResult.quality;
        ctx.fillStyle = quality > 70 ? '#00FF00' : quality > 40 ? '#FFFF00' : '#FF0000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${quality}% Quality`, previewX + previewWidth / 2, previewY + previewHeight + 18);
        // Polaroid-style border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(previewX - 3, previewY - 3, previewWidth + 6, previewHeight + 28);
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
        this.crosshairX = width / 2;
        this.crosshairY = height / 2;
        // Dynamically adjust max camera offset based on screen size
        // Allow camera to pan further on larger screens
        this.maxCameraOffsetX = Math.max(400, width * 0.5); // At least half screen width
        this.maxCameraOffsetY = Math.max(300, height * 0.5); // At least half screen height
    }
}
//# sourceMappingURL=VHSCamera.js.map