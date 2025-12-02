// VHSCamera - Retro VHS-style camera interface with zoom, focus, and vintage effects
// Used to photograph evidence and animals

import type { Language } from '../types/index.js';
import { I18n } from '../i18n/translations.js';

export interface PhotoResult {
    id: string;
    dataUrl: string;
    timestamp: number;
    subjectType: 'evidence' | 'animal';
    subjectId: string;
    quality: number;  // 0-100 based on focus and framing
    biome: string;
}

export class VHSCamera {
    private i18n: I18n;
    private isActive: boolean = false;
    private canvasWidth: number;
    private canvasHeight: number;
    
    // Camera controls
    private zoomLevel: number = 1.0;  // 1.0 to 3.0
    private focusLevel: number = 0.5;  // 0 = blurry, 1 = sharp
    private targetFocus: number = 0.5;  // What focus SHOULD be for current subject
    private autoFocusEnabled: boolean = false;
    
    // VHS effects
    private scanlineOffset: number = 0;
    private staticIntensity: number = 0;
    private trackingError: number = 0;
    private timestamp: number = Date.now();
    private recordingTime: number = 0;
    private batteryLevel: number = 100;
    
    // Animation
    private animationTimer: number = 0;
    private flashTimer: number = 0;
    private shutterAnimation: number = 0;
    
    // Crosshair position (center of screen by default)
    private crosshairX: number = 0;
    private crosshairY: number = 0;
    
    // Handheld camera offset (world position offset from player)
    private cameraOffsetX: number = 0;
    private cameraOffsetY: number = 0;
    private maxCameraOffset: number = 300;  // Max distance camera can move from player
    private cameraSpeed: number = 200;  // Pixels per second
    
    // Hand shake effect
    private handShakeX: number = 0;
    private handShakeY: number = 0;
    private handShakeIntensity: number = 2;  // Subtle shake
    
    // Photo capture
    private lastPhotoResult: PhotoResult | null = null;
    private photoPreviewTimer: number = 0;

    // Mobile/touch support
    private isMobile: boolean = false;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private lastPinchDistance: number = 0;
    private touchCameraOffsetX: number = 0;
    private touchCameraOffsetY: number = 0;
    private mobileButtonAreas: {
        capture?: { x: number; y: number; radius: number };
        zoomIn?: { x: number; y: number; radius: number };
        zoomOut?: { x: number; y: number; radius: number };
        close?: { x: number; y: number; radius: number };
        movePad?: { x: number; y: number; radius: number };
    } = {};

    constructor(canvasWidth: number, canvasHeight: number) {
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.crosshairX = canvasWidth / 2;
        this.crosshairY = canvasHeight / 2;
        this.isMobile = this.detectMobile();
    }

    private detectMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || window.innerWidth <= 1024;
    }

    public getIsMobile(): boolean {
        return this.isMobile;
    }

    // Touch handlers for mobile camera control
    public handleTouchStart(touches: TouchList): void {
        if (!this.isActive) return;
        
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
        } else if (touches.length === 2) {
            // Two finger touch - pinch to zoom
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    public handleTouchMove(touches: TouchList): void {
        if (!this.isActive) return;
        
        if (touches.length === 1) {
            // Single touch - pan camera
            const dx = touches[0].clientX - this.touchStartX;
            const dy = touches[0].clientY - this.touchStartY;
            
            // Move camera in opposite direction of touch drag (natural panning)
            this.cameraOffsetX = this.touchCameraOffsetX - dx * 0.5;
            this.cameraOffsetY = this.touchCameraOffsetY - dy * 0.5;
            
            // Clamp to max offset
            this.cameraOffsetX = Math.max(-this.maxCameraOffset, Math.min(this.maxCameraOffset, this.cameraOffsetX));
            this.cameraOffsetY = Math.max(-this.maxCameraOffset, Math.min(this.maxCameraOffset, this.cameraOffsetY));
        } else if (touches.length === 2) {
            // Two finger touch - pinch to zoom
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (this.lastPinchDistance > 0) {
                const scale = currentDistance / this.lastPinchDistance;
                if (scale > 1.02) {
                    this.zoomIn();
                    this.lastPinchDistance = currentDistance;
                } else if (scale < 0.98) {
                    this.zoomOut();
                    this.lastPinchDistance = currentDistance;
                }
            }
        }
    }

    public handleTouchEnd(): void {
        this.lastPinchDistance = 0;
    }

    private checkMobileButtonTouch(x: number, y: number): string | null {
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

    private handleMobileButtonPress(button: string): void {
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

    // Mobile button action flags (read by Game.ts)
    private triggerMobileCapture: boolean = false;
    private triggerMobileClose: boolean = false;

    public checkMobileCapture(): boolean {
        if (this.triggerMobileCapture) {
            this.triggerMobileCapture = false;
            return true;
        }
        return false;
    }

    public checkMobileClose(): boolean {
        if (this.triggerMobileClose) {
            this.triggerMobileClose = false;
            return true;
        }
        return false;
    }

    public activate(): void {
        this.isActive = true;
        this.recordingTime = 0;
        // Reset camera offset when activating
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }

    public deactivate(): void {
        this.isActive = false;
        // Reset camera offset
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }

    public isActiveMode(): boolean {
        return this.isActive;
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return;

        this.animationTimer += deltaTime;
        this.recordingTime += deltaTime;
        
        // VHS effects animation
        this.scanlineOffset = (this.scanlineOffset + deltaTime * 50) % 4;
        this.staticIntensity = Math.random() * 0.03;  // Subtle static
        this.trackingError = Math.sin(this.animationTimer * 0.5) * 2;  // Slight tracking wobble
        
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
    public moveCamera(dx: number, dy: number, deltaTime: number): void {
        if (!this.isActive) return;
        
        // Apply movement with speed
        this.cameraOffsetX += dx * this.cameraSpeed * deltaTime;
        this.cameraOffsetY += dy * this.cameraSpeed * deltaTime;
        
        // Clamp to max offset
        this.cameraOffsetX = Math.max(-this.maxCameraOffset, Math.min(this.maxCameraOffset, this.cameraOffsetX));
        this.cameraOffsetY = Math.max(-this.maxCameraOffset, Math.min(this.maxCameraOffset, this.cameraOffsetY));
    }

    // Get camera offset for rendering
    public getCameraOffset(): { x: number; y: number } {
        return {
            x: this.cameraOffsetX + this.handShakeX,
            y: this.cameraOffsetY + this.handShakeY
        };
    }

    // Reset camera to center (recenter on player)
    public recenterCamera(): void {
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }

    // Zoom controls
    public zoomIn(): void {
        this.zoomLevel = Math.min(3.0, this.zoomLevel + 0.2);
    }

    public zoomOut(): void {
        this.zoomLevel = Math.max(1.0, this.zoomLevel - 0.2);
    }

    public setZoom(level: number): void {
        this.zoomLevel = Math.max(1.0, Math.min(3.0, level));
    }

    public getZoom(): number {
        return this.zoomLevel;
    }

    // Focus controls
    public adjustFocus(delta: number): void {
        this.focusLevel = Math.max(0, Math.min(1, this.focusLevel + delta));
    }

    public getFocus(): number {
        return this.focusLevel;
    }

    public setTargetFocus(distance: number): void {
        // Distance affects what focus level is "correct"
        // Close subjects need low focus, far subjects need high focus
        this.targetFocus = Math.max(0.2, Math.min(0.9, distance / 500));
    }

    public toggleAutoFocus(): void {
        this.autoFocusEnabled = !this.autoFocusEnabled;
        if (this.autoFocusEnabled) {
            this.focusLevel = this.targetFocus;
        }
    }

    // Calculate photo quality based on focus accuracy
    public calculatePhotoQuality(): number {
        const focusDiff = Math.abs(this.focusLevel - this.targetFocus);
        const focusQuality = Math.max(0, 100 - focusDiff * 200);
        
        // Zoom affects quality slightly
        const zoomPenalty = (this.zoomLevel - 1) * 5;
        
        return Math.round(Math.max(10, focusQuality - zoomPenalty));
    }

    // Take a photo - now uses clean capture
    public takePhoto(canvas: HTMLCanvasElement, subjectType: 'evidence' | 'animal', subjectId: string, biome: string, cameraX: number = 0, cameraY: number = 0): PhotoResult | null {
        if (!this.isActive) return null;

        // Trigger flash and shutter
        this.flashTimer = 0.3;
        this.shutterAnimation = 1;

        // Calculate quality
        const quality = this.calculatePhotoQuality();

        // Capture clean photo (without VHS overlay)
        const cleanDataUrl = this.captureCleanPhoto(canvas, cameraX, cameraY);

        // Create photo result
        const result: PhotoResult = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl: cleanDataUrl,
            timestamp: Date.now(),
            subjectType,
            subjectId,
            quality,
            biome
        };

        this.lastPhotoResult = result;
        this.photoPreviewTimer = 2;  // Show preview for 2 seconds

        return result;
    }

    // Get world position of crosshair (includes handheld camera offset)
    public getWorldCrosshairPosition(cameraX: number, cameraY: number): { x: number; y: number } {
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
    public captureCleanPhoto(gameCanvas: HTMLCanvasElement, cameraX: number, cameraY: number): string {
        // Create a temporary canvas for clean capture
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        
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
        tempCtx.drawImage(
            gameCanvas,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, photoWidth, photoHeight
        );
        
        // Add subtle VHS effect to the photo (but not the full overlay)
        this.addPhotoVHSEffect(tempCtx, photoWidth, photoHeight);
        
        return tempCanvas.toDataURL('image/jpeg', 0.85);
    }

    private addPhotoVHSEffect(ctx: CanvasRenderingContext2D, w: number, h: number): void {
        // Subtle scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
        
        // Slight vignette
        const gradient = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w/1.2);
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

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) return;

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

    private renderVHSOverlay(ctx: CanvasRenderingContext2D): void {
        // === DIGITAL CAMERA FRAME (like holding a compact camera) ===
        
        const screenPadding = 60;  // Camera body thickness
        const cornerRadius = 15;
        
        // Camera body - dark gray/black frame around the screen
        ctx.fillStyle = '#1a1a1a';
        
        // Top camera body
        ctx.fillRect(0, 0, this.canvasWidth, screenPadding);
        
        // Bottom camera body (thicker for buttons)
        ctx.fillRect(0, this.canvasHeight - screenPadding - 20, this.canvasWidth, screenPadding + 20);
        
        // Left camera body
        ctx.fillRect(0, 0, screenPadding - 20, this.canvasHeight);
        
        // Right camera body (thicker for grip)
        ctx.fillRect(this.canvasWidth - screenPadding - 30, 0, screenPadding + 30, this.canvasHeight);
        
        // Inner bevel/frame around LCD screen
        const lcdX = screenPadding - 15;
        const lcdY = screenPadding + 5;
        const lcdW = this.canvasWidth - screenPadding * 2 - 20;
        const lcdH = this.canvasHeight - screenPadding * 2 - 30;
        
        // LCD screen border (slight bevel effect)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        this.roundRect(ctx, lcdX - 3, lcdY - 3, lcdW + 6, lcdH + 6, 8);
        ctx.stroke();
        
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        this.roundRect(ctx, lcdX - 1, lcdY - 1, lcdW + 2, lcdH + 2, 6);
        ctx.stroke();
        
        // Camera brand/model text on top
        ctx.fillStyle = '#888';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('MILO-CAM', 15, 25);
        ctx.font = '9px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('DIGITAL', 15, 38);
        
        // Right side - camera grip texture
        this.renderCameraGrip(ctx);
        
        // Right side - camera buttons
        this.renderCameraButtons(ctx);
        
        // Bottom - navigation wheel and controls
        this.renderBottomControls(ctx);
        
        // LCD Screen overlay elements
        this.renderLCDOverlay(ctx, lcdX, lcdY, lcdW, lcdH);
        
        // Viewfinder brackets (on LCD)
        this.renderViewfinder(ctx);
        
        // Mobile touch buttons (only on mobile/tablet)
        if (this.isMobile) {
            this.renderMobileControls(ctx);
        }
    }

    private renderMobileControls(ctx: CanvasRenderingContext2D): void {
        const btnSize = 60;
        const margin = 20;
        
        // === LEFT SIDE - Movement pad ===
        const padX = margin + btnSize;
        const padY = this.canvasHeight - margin - btnSize * 2;
        
        // Virtual joystick background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(padX, padY, btnSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Joystick center (shows current touch position)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(padX + this.touchCameraOffsetX * 0.3, padY + this.touchCameraOffsetY * 0.3, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction arrows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('▲', padX, padY - 35);
        ctx.fillText('▼', padX, padY + 45);
        ctx.fillText('◀', padX - 40, padY + 5);
        ctx.fillText('▶', padX + 40, padY + 5);
        
        // === RIGHT SIDE - Action buttons ===
        const rightX = this.canvasWidth - margin - btnSize / 2;
        
        // Photo/Capture button (large, red)
        const captureY = this.canvasHeight - margin - btnSize;
        ctx.fillStyle = 'rgba(200, 50, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, captureY, btnSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Camera icon
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📷', rightX, captureY + 7);
        
        // Store button position for touch detection
        this.mobileButtonAreas.capture = { x: rightX, y: captureY, radius: btnSize / 2 };
        
        // Zoom IN button (+)
        const zoomInY = captureY - btnSize - 20;
        ctx.fillStyle = 'rgba(50, 150, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, zoomInY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('+', rightX, zoomInY + 8);
        this.mobileButtonAreas.zoomIn = { x: rightX, y: zoomInY, radius: 25 };
        
        // Zoom OUT button (-)
        const zoomOutY = zoomInY - 60;
        ctx.fillStyle = 'rgba(50, 100, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(rightX, zoomOutY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.9)';
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
        
        // Movement pad area
        this.mobileButtonAreas.movePad = { x: padX, y: padY, radius: btnSize };
    }

    private renderCameraGrip(ctx: CanvasRenderingContext2D): void {
        const gripX = this.canvasWidth - 45;
        const gripY = 80;
        const gripHeight = 150;
        
        // Grip texture (rubber-like pattern)
        ctx.fillStyle = '#222';
        for (let y = gripY; y < gripY + gripHeight; y += 8) {
            ctx.fillRect(gripX, y, 30, 4);
        }
        
        // Grip highlight
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(gripX - 2, gripY - 5, 35, gripHeight + 10);
    }

    private renderCameraButtons(ctx: CanvasRenderingContext2D): void {
        const btnX = this.canvasWidth - 35;
        
        // Shutter button (red circle at top)
        ctx.fillStyle = '#cc3333';
        ctx.beginPath();
        ctx.arc(btnX, 45, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner shutter button
        ctx.fillStyle = '#ff5555';
        ctx.beginPath();
        ctx.arc(btnX, 45, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Zoom rocker (below grip)
        const zoomY = 260;
        ctx.fillStyle = '#333';
        ctx.fillRect(btnX - 15, zoomY, 30, 50);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX - 15, zoomY, 30, 50);
        
        // W (wide) label
        ctx.fillStyle = '#888';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('W', btnX, zoomY + 15);
        
        // T (tele) label
        ctx.fillText('T', btnX, zoomY + 45);
        
        // Zoom level indicator
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`${this.zoomLevel.toFixed(1)}x`, btnX, zoomY + 30);
    }

    private renderBottomControls(ctx: CanvasRenderingContext2D): void {
        const bottomY = this.canvasHeight - 50;
        
        // Navigation wheel (D-pad style)
        const wheelX = this.canvasWidth / 2;
        const wheelY = bottomY + 10;
        const wheelSize = 35;
        
        // Outer ring
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner button
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Direction indicators
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('▲', wheelX, wheelY - 20);
        ctx.fillText('▼', wheelX, wheelY + 27);
        ctx.fillText('◄', wheelX - 25, wheelY + 4);
        ctx.fillText('►', wheelX + 25, wheelY + 4);
        
        // Menu button (left of wheel)
        ctx.fillStyle = '#333';
        ctx.fillRect(wheelX - 80, wheelY - 12, 30, 24);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(wheelX - 80, wheelY - 12, 30, 24);
        ctx.fillStyle = '#888';
        ctx.font = '8px Arial';
        ctx.fillText('MENU', wheelX - 65, wheelY + 4);
        
        // Playback button (right of wheel)
        ctx.fillStyle = '#333';
        ctx.fillRect(wheelX + 50, wheelY - 12, 30, 24);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(wheelX + 50, wheelY - 12, 30, 24);
        ctx.fillStyle = '#888';
        ctx.fillText('▶', wheelX + 65, wheelY + 4);
    }

    private renderLCDOverlay(ctx: CanvasRenderingContext2D, lcdX: number, lcdY: number, lcdW: number, lcdH: number): void {
        const lang = this.i18n.getLanguage();
        
        // Top info bar (semi-transparent)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(lcdX, lcdY, lcdW, 28);
        
        // Bottom info bar
        ctx.fillRect(lcdX, lcdY + lcdH - 35, lcdW, 35);
        
        // === TOP BAR INFO ===
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        
        // Photo mode indicator
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('P', lcdX + 10, lcdY + 18);
        
        // Image size
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('12M', lcdX + 35, lcdY + 18);
        
        // Quality
        ctx.fillStyle = '#ff9900';
        ctx.fillText('FINE', lcdX + 70, lcdY + 18);
        
        // Flash off indicator
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('⚡', lcdX + 110, lcdY + 18);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lcdX + 105, lcdY + 22);
        ctx.lineTo(lcdX + 120, lcdY + 8);
        ctx.stroke();
        
        // Battery indicator (top right)
        ctx.textAlign = 'right';
        const batteryX = lcdX + lcdW - 10;
        const batteryY = lcdY + 10;
        
        // Battery outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(batteryX - 25, batteryY, 20, 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(batteryX - 5, batteryY + 3, 3, 4);
        
        // Battery fill
        const batteryFill = (this.batteryLevel / 100) * 16;
        ctx.fillStyle = this.batteryLevel > 20 ? '#00ff00' : '#ff0000';
        ctx.fillRect(batteryX - 23, batteryY + 2, batteryFill, 6);
        
        // Shots remaining
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('999', batteryX - 35, lcdY + 18);
        
        // === BOTTOM BAR INFO ===
        ctx.textAlign = 'left';
        
        // Zoom indicator
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${this.zoomLevel.toFixed(1)}x`, lcdX + 10, lcdY + lcdH - 18);
        
        // Focus indicator
        const focusColor = this.getFocusIndicatorColor();
        ctx.fillStyle = focusColor;
        ctx.fillText('●', lcdX + 60, lcdY + lcdH - 18);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('AF', lcdX + 75, lcdY + lcdH - 18);
        
        // Quality percentage
        const quality = this.calculatePhotoQuality();
        ctx.textAlign = 'center';
        ctx.fillStyle = quality > 70 ? '#00ff00' : quality > 40 ? '#ffcc00' : '#ff0000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${quality}%`, lcdX + lcdW / 2, lcdY + lcdH - 15);
        
        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px Arial';
        const hint = lang === 'nl' ? 'WASD: Kamera | X/Y: Zoom | Klik: Foto' 
                                   : 'WASD: Camera | X/Y: Zoom | Click: Photo';
        ctx.fillText(hint, lcdX + lcdW / 2, lcdY + lcdH - 3);
        
        // ISO/Date (right side of bottom bar)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        const now = new Date();
        ctx.fillText(`ISO AUTO`, lcdX + lcdW - 10, lcdY + lcdH - 22);
        ctx.fillText(now.toLocaleDateString('nl-NL'), lcdX + lcdW - 10, lcdY + lcdH - 8);
        
        // Recording time (if recording)
        if (this.recordingTime > 0) {
            ctx.textAlign = 'left';
            const recVisible = Math.floor(this.animationTimer * 2) % 2 === 0;
            if (recVisible) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(lcdX + lcdW - 50, lcdY + 40, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            const mins = Math.floor(this.recordingTime / 60);
            const secs = Math.floor(this.recordingTime % 60);
            ctx.fillText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, lcdX + lcdW - 40, lcdY + 44);
        }
    }

    private renderViewfinder(ctx: CanvasRenderingContext2D): void {
        const centerX = this.canvasWidth / 2 - 10;  // Slightly offset for camera body
        const centerY = this.canvasHeight / 2;
        const size = 80;

        // Focus brackets (white, like real digital cameras)
        ctx.strokeStyle = this.getFocusIndicatorColor();
        ctx.lineWidth = 2;

        const cornerLength = 15;
        
        // Top-left bracket
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY - size + cornerLength);
        ctx.lineTo(centerX - size, centerY - size);
        ctx.lineTo(centerX - size + cornerLength, centerY - size);
        ctx.stroke();

        // Top-right bracket
        ctx.beginPath();
        ctx.moveTo(centerX + size - cornerLength, centerY - size);
        ctx.lineTo(centerX + size, centerY - size);
        ctx.lineTo(centerX + size, centerY - size + cornerLength);
        ctx.stroke();

        // Bottom-left bracket
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY + size - cornerLength);
        ctx.lineTo(centerX - size, centerY + size);
        ctx.lineTo(centerX - size + cornerLength, centerY + size);
        ctx.stroke();

        // Bottom-right bracket
        ctx.beginPath();
        ctx.moveTo(centerX + size - cornerLength, centerY + size);
        ctx.lineTo(centerX + size, centerY + size);
        ctx.lineTo(centerX + size, centerY + size - cornerLength);
        ctx.stroke();

        // Center focus point (small square)
        ctx.strokeStyle = this.getFocusIndicatorColor();
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 8, centerY - 8, 16, 16);
        
        // Additional focus points (like real cameras have multiple AF points)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(centerX - 50, centerY - 8, 12, 12);  // Left
        ctx.strokeRect(centerX + 38, centerY - 8, 12, 12);  // Right
        ctx.strokeRect(centerX - 8, centerY - 45, 12, 12);  // Top
        ctx.strokeRect(centerX - 8, centerY + 33, 12, 12);  // Bottom
    }

    private getFocusIndicatorColor(): string {
        const focusDiff = Math.abs(this.focusLevel - this.targetFocus);
        if (focusDiff < 0.1) return '#00FF00';  // Green = good focus
        if (focusDiff < 0.25) return '#FFFF00';  // Yellow = okay
        return '#FF0000';  // Red = bad focus
    }

    private renderPhotoPreview(ctx: CanvasRenderingContext2D): void {
        if (!this.lastPhotoResult) return;

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

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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

    public updateSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.crosshairX = width / 2;
        this.crosshairY = height / 2;
    }
}
