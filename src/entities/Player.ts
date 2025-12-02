// Player entity representing Milo van Zee - the young explorer

import type { Position, Size } from '../types/index.js';
import { InputHandler } from '../utils/input.js';

export class Player {
    private position: Position;
    private size: Size;
    private speed: number;
    private direction: 'up' | 'down' | 'left' | 'right';
    private isMoving: boolean;
    private animationFrame: number;
    private animationTimer: number;
    private breathTimer: number;
    private blinkTimer: number;
    private isBlinking: boolean;
    private footstepTimer: number;
    private dustParticles: Array<{ x: number; y: number; life: number; vx: number; vy: number }>;

    constructor(x: number, y: number) {
        this.position = { x, y };
        this.size = { width: 40, height: 56 };
        this.speed = 160;
        this.direction = 'down';
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.breathTimer = 0;
        this.blinkTimer = Math.random() * 3;
        this.isBlinking = false;
        this.footstepTimer = 0;
        this.dustParticles = [];
    }

    public update(deltaTime: number, worldWidth: number, worldHeight: number): void {
        const input = InputHandler.getInstance();
        const movement = input.getMovementVector();
        
        const wasMoving = this.isMoving;
        this.isMoving = movement.x !== 0 || movement.y !== 0;

        if (this.isMoving) {
            // Update position
            const newX = this.position.x + movement.x * this.speed * deltaTime;
            const newY = this.position.y + movement.y * this.speed * deltaTime;

            // Clamp to world bounds
            this.position.x = Math.max(0, Math.min(worldWidth - this.size.width, newX));
            this.position.y = Math.max(0, Math.min(worldHeight - this.size.height, newY));

            // Update direction
            if (Math.abs(movement.x) > Math.abs(movement.y)) {
                this.direction = movement.x > 0 ? 'right' : 'left';
            } else {
                this.direction = movement.y > 0 ? 'down' : 'up';
            }

            // Update walk animation
            this.animationTimer += deltaTime;
            if (this.animationTimer >= 0.12) {
                this.animationFrame = (this.animationFrame + 1) % 8;
                this.animationTimer = 0;
            }

            // Create dust particles when walking
            this.footstepTimer += deltaTime;
            if (this.footstepTimer >= 0.2) {
                this.createDustParticle();
                this.footstepTimer = 0;
            }
        } else {
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        // Breathing animation (subtle)
        this.breathTimer += deltaTime;

        // Blinking
        this.blinkTimer -= deltaTime;
        if (this.blinkTimer <= 0) {
            if (this.isBlinking) {
                this.isBlinking = false;
                this.blinkTimer = 2 + Math.random() * 4;
            } else {
                this.isBlinking = true;
                this.blinkTimer = 0.15;
            }
        }

        // Update dust particles
        this.dustParticles = this.dustParticles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= deltaTime;
            return p.life > 0;
        });
    }

    private createDustParticle(): void {
        const centerX = this.position.x + this.size.width / 2;
        const bottomY = this.position.y + this.size.height;
        
        for (let i = 0; i < 2; i++) {
            this.dustParticles.push({
                x: centerX + (Math.random() - 0.5) * 10,
                y: bottomY - 5,
                life: 0.5 + Math.random() * 0.3,
                vx: (Math.random() - 0.5) * 20,
                vy: -10 - Math.random() * 10,
            });
        }
    }

    public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;

        ctx.save();

        // Draw dust particles
        this.dustParticles.forEach(p => {
            const alpha = p.life / 0.8;
            ctx.fillStyle = `rgba(139, 119, 101, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x - cameraX, p.y - cameraY, 2 + (1 - alpha) * 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(screenX + 20, screenY + 54, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Breathing offset
        const breathOffset = Math.sin(this.breathTimer * 2) * 0.5;

        // Walking bob
        const walkBob = this.isMoving ? Math.sin(this.animationFrame * Math.PI / 2) * 2 : 0;
        const bodyY = screenY + breathOffset - walkBob;

        // Leg animation
        const legPhase = this.animationFrame * Math.PI / 4;
        const leftLegOffset = this.isMoving ? Math.sin(legPhase) * 4 : 0;
        const rightLegOffset = this.isMoving ? Math.sin(legPhase + Math.PI) * 4 : 0;

        // === LEGS ===
        // Left leg
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(screenX + 10, bodyY + 38 + leftLegOffset, 7, 12);
        // Right leg
        ctx.fillRect(screenX + 23, bodyY + 38 + rightLegOffset, 7, 12);

        // Khaki shorts
        ctx.fillStyle = '#C2B280';
        ctx.fillRect(screenX + 8, bodyY + 32, 24, 10);
        // Shorts details
        ctx.strokeStyle = '#A69B6C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 20, bodyY + 32);
        ctx.lineTo(screenX + 20, bodyY + 42);
        ctx.stroke();

        // === SANDALS ===
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 8, bodyY + 49 + leftLegOffset, 10, 4);
        ctx.fillRect(screenX + 22, bodyY + 49 + rightLegOffset, 10, 4);
        // Sandal straps
        ctx.strokeStyle = '#6B3410';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 9, bodyY + 49 + leftLegOffset);
        ctx.lineTo(screenX + 17, bodyY + 52 + leftLegOffset);
        ctx.moveTo(screenX + 23, bodyY + 49 + rightLegOffset);
        ctx.lineTo(screenX + 31, bodyY + 52 + rightLegOffset);
        ctx.stroke();

        // === BODY / SHIRT ===
        // Main shirt (light blue explorer shirt)
        ctx.fillStyle = '#7EC8E3';
        ctx.beginPath();
        ctx.moveTo(screenX + 8, bodyY + 18);
        ctx.lineTo(screenX + 32, bodyY + 18);
        ctx.lineTo(screenX + 34, bodyY + 34);
        ctx.lineTo(screenX + 6, bodyY + 34);
        ctx.closePath();
        ctx.fill();

        // Shirt details - collar
        ctx.fillStyle = '#6BB8D3';
        ctx.beginPath();
        ctx.moveTo(screenX + 14, bodyY + 16);
        ctx.lineTo(screenX + 20, bodyY + 22);
        ctx.lineTo(screenX + 26, bodyY + 16);
        ctx.lineTo(screenX + 23, bodyY + 14);
        ctx.lineTo(screenX + 20, bodyY + 18);
        ctx.lineTo(screenX + 17, bodyY + 14);
        ctx.closePath();
        ctx.fill();

        // Shirt pockets
        ctx.strokeStyle = '#5AA8C3';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 10, bodyY + 22, 6, 5);
        ctx.strokeRect(screenX + 24, bodyY + 22, 6, 5);

        // Shirt buttons
        ctx.fillStyle = '#D4A574';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(screenX + 20, bodyY + 24 + i * 4, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // === ARMS ===
        ctx.fillStyle = '#FFDAB9';
        const armSwing = this.isMoving ? Math.sin(legPhase) * 3 : 0;
        // Left arm
        ctx.fillRect(screenX + 2, bodyY + 18 - armSwing, 6, 14);
        // Right arm
        ctx.fillRect(screenX + 32, bodyY + 18 + armSwing, 6, 14);

        // Hands
        ctx.beginPath();
        ctx.arc(screenX + 5, bodyY + 32 - armSwing, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 35, bodyY + 32 + armSwing, 4, 0, Math.PI * 2);
        ctx.fill();

        // === CAMERA AROUND NECK ===
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(screenX + 5, bodyY + 20, 8, 6);
        // Camera lens
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(screenX + 9, bodyY + 23, 2, 0, Math.PI * 2);
        ctx.fill();
        // Camera strap
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, bodyY + 20);
        ctx.quadraticCurveTo(screenX + 20, bodyY + 15, screenX + 34, bodyY + 20);
        ctx.stroke();

        // === SATCHEL ===
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 28, bodyY + 24, 8, 12);
        ctx.strokeStyle = '#6B3410';
        ctx.strokeRect(screenX + 28, bodyY + 24, 8, 12);
        // Satchel buckle
        ctx.fillStyle = '#D4A574';
        ctx.fillRect(screenX + 30, bodyY + 27, 4, 2);

        // === HEAD ===
        // Neck
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(screenX + 17, bodyY + 10, 6, 8);

        // Head shape
        ctx.fillStyle = '#FFDAB9';
        ctx.beginPath();
        ctx.ellipse(screenX + 20, bodyY + 6, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.ellipse(screenX + 9, bodyY + 6, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(screenX + 31, bodyY + 6, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner ears
        ctx.fillStyle = '#EECBAD';
        ctx.beginPath();
        ctx.ellipse(screenX + 9, bodyY + 6, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(screenX + 31, bodyY + 6, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // === HAIR ===
        ctx.fillStyle = '#8B6914';
        // Main hair
        ctx.beginPath();
        ctx.ellipse(screenX + 20, bodyY + 0, 10, 8, 0, Math.PI, 0);
        ctx.fill();
        // Hair tufts (messy windswept look)
        ctx.beginPath();
        ctx.moveTo(screenX + 12, bodyY - 4);
        ctx.quadraticCurveTo(screenX + 8, bodyY - 8, screenX + 10, bodyY - 2);
        ctx.moveTo(screenX + 28, bodyY - 4);
        ctx.quadraticCurveTo(screenX + 32, bodyY - 7, screenX + 30, bodyY - 2);
        ctx.moveTo(screenX + 20, bodyY - 6);
        ctx.quadraticCurveTo(screenX + 20, bodyY - 10, screenX + 22, bodyY - 4);
        ctx.fill();

        // === EXPLORER HAT ===
        ctx.fillStyle = '#556B2F';
        // Hat brim
        ctx.beginPath();
        ctx.ellipse(screenX + 20, bodyY - 4, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hat top
        ctx.fillRect(screenX + 12, bodyY - 12, 16, 8);
        ctx.beginPath();
        ctx.arc(screenX + 20, bodyY - 12, 8, Math.PI, 0);
        ctx.fill();
        // Hat band
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 12, bodyY - 6, 16, 3);
        // Hat decoration (small feather)
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(screenX + 28, bodyY - 8);
        ctx.quadraticCurveTo(screenX + 34, bodyY - 14, screenX + 30, bodyY - 6);
        ctx.fill();

        // === FACE ===
        // Eye whites
        ctx.fillStyle = '#FFFFFF';
        const eyeOffsetX = this.direction === 'left' ? -2 : this.direction === 'right' ? 2 : 0;
        const eyeOffsetY = this.direction === 'up' ? -1 : this.direction === 'down' ? 1 : 0;
        ctx.beginPath();
        ctx.ellipse(screenX + 15 + eyeOffsetX * 0.5, bodyY + 4, 3, this.isBlinking ? 0.5 : 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(screenX + 25 + eyeOffsetX * 0.5, bodyY + 4, 3, this.isBlinking ? 0.5 : 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isBlinking) {
            // Irises (bright green)
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.arc(screenX + 15 + eyeOffsetX, bodyY + 4 + eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 25 + eyeOffsetX, bodyY + 4 + eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(screenX + 15 + eyeOffsetX, bodyY + 4 + eyeOffsetY, 1, 0, Math.PI * 2);
            ctx.arc(screenX + 25 + eyeOffsetX, bodyY + 4 + eyeOffsetY, 1, 0, Math.PI * 2);
            ctx.fill();

            // Eye sparkle
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX + 14 + eyeOffsetX, bodyY + 3 + eyeOffsetY, 0.5, 0, Math.PI * 2);
            ctx.arc(screenX + 24 + eyeOffsetX, bodyY + 3 + eyeOffsetY, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eyebrows
        ctx.strokeStyle = '#6B4E14';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 12, bodyY);
        ctx.quadraticCurveTo(screenX + 15, bodyY - 1, screenX + 18, bodyY);
        ctx.moveTo(screenX + 22, bodyY);
        ctx.quadraticCurveTo(screenX + 25, bodyY - 1, screenX + 28, bodyY);
        ctx.stroke();

        // Nose
        ctx.fillStyle = '#EECBAD';
        ctx.beginPath();
        ctx.moveTo(screenX + 20, bodyY + 4);
        ctx.lineTo(screenX + 18, bodyY + 9);
        ctx.lineTo(screenX + 22, bodyY + 9);
        ctx.closePath();
        ctx.fill();

        // Friendly smile
        ctx.strokeStyle = '#CD5C5C';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenX + 20, bodyY + 10, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screenX + 11, bodyY + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(screenX + 29, bodyY + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Freckles
        ctx.fillStyle = '#D2691E';
        const freckles = [[13, 6], [15, 8], [25, 6], [27, 8], [19, 7]];
        freckles.forEach(([fx, fy]) => {
            ctx.beginPath();
            ctx.arc(screenX + fx, bodyY + fy, 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    public getPosition(): Position {
        return { ...this.position };
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public getSize(): Size {
        return { ...this.size };
    }

    public getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height,
        };
    }

    public getCenter(): Position {
        return {
            x: this.position.x + this.size.width / 2,
            y: this.position.y + this.size.height / 2,
        };
    }

    public getDirection(): string {
        return this.direction;
    }
}

