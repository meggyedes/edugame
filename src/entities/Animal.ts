// Animal entity class

import type { Position, Size, BiomeType, Language } from '../types/index.js';
import { SpriteLoader } from '../utils/SpriteLoader.js';

export interface AnimalData {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    biome: BiomeType;
    points: number;
    color: string;
    facts: { nl: string[]; en: string[] };
}

export class Animal {
    private id: string;
    private name: { nl: string; en: string };
    private description: { nl: string; en: string };
    private biome: BiomeType;
    private position: Position;
    private size: Size;
    private points: number;
    private discovered: boolean;
    private photographed: boolean;
    private color: string;
    private facts: { nl: string[]; en: string[] };
    private animationTimer: number;
    private animationFrame: number;
    private moveTimer: number;
    private moveDirection: { x: number; y: number };
    private isMoving: boolean;
    private startPosition: Position;
    private roamRadius: number;
    private spriteLoader: SpriteLoader;
    private facingLeft: boolean = false;

    constructor(data: AnimalData, x: number, y: number) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.biome = data.biome;
        this.position = { x, y };
        this.startPosition = { x, y };
        this.size = { width: 360, height: 360 }; // Extra large for maximum visibility
        this.points = data.points;
        this.discovered = false;
        this.photographed = false;
        this.color = data.color;
        this.facts = data.facts;
        this.animationTimer = 0;
        this.animationFrame = 0;
        this.moveTimer = Math.random() * 3;
        this.moveDirection = { x: 0, y: 0 };
        this.isMoving = false;
        this.roamRadius = 80;
        this.spriteLoader = SpriteLoader.getInstance();
    }

    public update(deltaTime: number): void {
        // Simple wandering behavior
        this.moveTimer -= deltaTime;
        
        if (this.moveTimer <= 0) {
            this.isMoving = !this.isMoving;
            if (this.isMoving) {
                this.moveDirection = {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                };
                // Update facing direction for sprite
                if (this.moveDirection.x < -0.1) {
                    this.facingLeft = true;
                } else if (this.moveDirection.x > 0.1) {
                    this.facingLeft = false;
                }
                this.moveTimer = 1 + Math.random() * 2;
            } else {
                this.moveTimer = 2 + Math.random() * 3;
            }
        }

        if (this.isMoving) {
            const speed = 20;
            this.position.x += this.moveDirection.x * speed * deltaTime;
            this.position.y += this.moveDirection.y * speed * deltaTime;

            // Stay within roam radius
            const dx = this.position.x - this.startPosition.x;
            const dy = this.position.y - this.startPosition.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.roamRadius) {
                this.moveDirection.x = -dx / dist;
                this.moveDirection.y = -dy / dist;
            }
        }

        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 0.3) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }
    }

    public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        const bounce = this.isMoving ? Math.sin(this.animationTimer * 10) * 2 : 0;

        ctx.save();

        // Try to render sprite first
        if (this.spriteLoader.isReady()) {
            const spriteDrawn = this.spriteLoader.drawSprite(
                ctx,
                this.id,
                screenX - this.size.width / 2,
                screenY - this.size.height / 2 + bounce,
                5.625, // Scale up for maximum visibility (7.5x from original)
                this.facingLeft
            );
            
            if (spriteDrawn) {
                // Draw shadow under sprite
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(screenX, screenY + this.size.height / 2 - 5, this.size.width / 3, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                
                // Draw discovered indicator
                if (this.discovered) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.beginPath();
                    ctx.arc(screenX + this.size.width / 3, screenY - this.size.height / 3, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#FFF';
                    ctx.font = 'bold 8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓', screenX + this.size.width / 3, screenY - this.size.height / 3 + 3);
                }
                
                ctx.restore();
                return;
            }
        }

        // Fallback to procedural rendering if sprite not available
        // Apply 7.5x scale for maximum visibility
        const scale = 7.5;
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);
        ctx.translate(-screenX / scale, -screenY / scale);
        
        // Adjust coordinates for scaled rendering
        const scaledX = screenX / scale;
        const scaledY = screenY / scale;
        const scaledBounce = bounce / scale;
        
        // Draw detailed animal based on ID
        switch (this.id) {
            case 'crab':
                this.renderCrab(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'seagull':
                this.renderSeagull(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'turtle':
                this.renderTurtle(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'starfish':
                this.renderStarfish(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'pelican':
                this.renderPelican(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'parrot':
                this.renderParrot(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'monkey':
                this.renderMonkey(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'snake':
                this.renderSnake(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'toucan':
                this.renderToucan(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'jaguar':
                this.renderJaguar(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'frog':
                this.renderFrog(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'camel':
                this.renderCamel(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'scorpion':
                this.renderScorpion(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'fox':
                this.renderFox(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'lizard':
                this.renderLizard(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'meerkat':
                this.renderMeerkat(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'penguin':
                this.renderPenguin(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'polar_bear':
                this.renderPolarBear(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'arctic_fox':
                this.renderArcticFox(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'seal':
                this.renderSeal(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'snowy_owl':
                this.renderSnowyOwl(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'deer':
                this.renderDeer(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'rabbit':
                this.renderRabbit(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'owl':
                this.renderOwl(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'squirrel':
                this.renderSquirrel(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'hedgehog':
                this.renderHedgehog(ctx, scaledX, scaledY, scaledBounce);
                break;
            case 'wolf':
                this.renderWolf(ctx, scaledX, scaledY, scaledBounce);
                break;
            default:
                this.renderGeneric(ctx, scaledX, scaledY, scaledBounce);
        }
        ctx.restore();

        // Highlight if discovered but not photographed
        if (this.discovered && !this.photographed) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 2, screenY - 2, this.size.width + 4, this.size.height + 4);
        }

        ctx.restore();
    }

    // ==================== BEACH ANIMALS ====================

    private renderCrab(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 16 + bounce;

        // Body (oval shape)
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell pattern
        ctx.fillStyle = '#CD5C5C';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 1, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Claws
        ctx.fillStyle = '#FF6347';
        // Left claw
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy - 2, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 16, cy - 5, 3, 2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        // Right claw
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy - 2, 5, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 16, cy - 5, 3, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Legs (3 on each side)
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const legOffset = i * 4 - 4;
            // Left legs
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy + legOffset);
            ctx.lineTo(cx - 12, cy + legOffset + 6);
            ctx.stroke();
            // Right legs
            ctx.beginPath();
            ctx.moveTo(cx + 8, cy + legOffset);
            ctx.lineTo(cx + 12, cy + legOffset + 6);
            ctx.stroke();
        }

        // Eyes on stalks
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 9, 2, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 9, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 7);
        ctx.lineTo(cx - 4, cy - 9);
        ctx.moveTo(cx + 4, cy - 7);
        ctx.lineTo(cx + 4, cy - 9);
        ctx.stroke();
    }

    private renderSeagull(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;
        const wingFlap = this.animationFrame * 6 - 3;

        // Body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#B0C4DE';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy);
        ctx.quadraticCurveTo(cx - 12, cy - 8 + wingFlap, cx - 6, cy + 6);
        ctx.closePath();
        ctx.fill();
        // Right wing  
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy);
        ctx.quadraticCurveTo(cx - 12, cy - 8 - wingFlap, cx - 6, cy + 6);
        ctx.closePath();
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 4);
        ctx.lineTo(cx + 18, cy - 3);
        ctx.lineTo(cx + 14, cy - 2);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = '#B0C4DE';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.lineTo(cx - 16, cy - 2);
        ctx.lineTo(cx - 16, cy + 4);
        ctx.closePath();
        ctx.fill();
    }

    private renderTurtle(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 16 + bounce;

        // Shell
        ctx.fillStyle = '#2E8B57';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell pattern
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3CB371';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#8FBC8F';
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flippers
        ctx.fillStyle = '#8FBC8F';
        // Front flippers
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy - 10, 4, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy + 10, 4, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Back flippers
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 6, 3, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 6, 3, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 16, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== JUNGLE ANIMALS ====================

    private renderParrot(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;

        // Tail feathers
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 8);
        ctx.lineTo(cx - 18, cy + 16);
        ctx.lineTo(cx - 14, cy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 6);
        ctx.lineTo(cx - 16, cy + 18);
        ctx.lineTo(cx - 12, cy + 6);
        ctx.closePath();
        ctx.fill();

        // Body
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy, 5, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(cx + 4, cy - 10, 7, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 10);
        ctx.quadraticCurveTo(cx + 16, cy - 12, cx + 12, cy - 6);
        ctx.lineTo(cx + 8, cy - 8);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 11, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 7, cy - 11, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderMonkey(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;
        const armSwing = this.animationFrame * 4 - 2;

        // Tail
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 6);
        ctx.quadraticCurveTo(cx - 18, cy + 2, cx - 16, cy - 8);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        // Left arm
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 12, cy - 6 + armSwing);
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 12, cy - 6 - armSwing);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 12);
        ctx.lineTo(cx - 6, cy + 18);
        ctx.moveTo(cx + 4, cy + 12);
        ctx.lineTo(cx + 6, cy + 18);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 6, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 8, 3, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 8, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 2, 0, Math.PI);
        ctx.stroke();
    }

    private renderSnake(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14;
        const wave = Math.sin(this.animationTimer * 4) * 3;

        // Snake body (wavy)
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 8);
        ctx.quadraticCurveTo(cx - 5, cy + wave, cx, cy + 4);
        ctx.quadraticCurveTo(cx + 5, cy - wave, cx + 8, cy - 2);
        ctx.quadraticCurveTo(cx + 10, cy - 6 + wave, cx + 6, cy - 10);
        ctx.stroke();

        // Pattern
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 8);
        ctx.quadraticCurveTo(cx - 5, cy + wave, cx, cy + 4);
        ctx.quadraticCurveTo(cx + 5, cy - wave, cx + 8, cy - 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Head
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy - 12, 5, 4, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 13, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 13, 1, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 12);
        ctx.lineTo(cx + 14, cy - 11);
        ctx.moveTo(cx + 13, cy - 11);
        ctx.lineTo(cx + 15, cy - 10);
        ctx.lineTo(cx + 15, cy - 12);
        ctx.stroke();
    }

    // ==================== DESERT ANIMALS ====================

    private renderCamel(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 16 + bounce;

        // Legs
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(cx - 8, cy + 2, 4, 12);
        ctx.fillRect(cx + 4, cy + 2, 4, 12);

        // Body
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hump
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy - 8, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.fillRect(cx + 8, cy - 14, 5, 14);

        // Head
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy - 16, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Ear
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 20, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 16, cy - 17, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(cx + 18, cy - 14, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderScorpion(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 16 + bounce;
        const tailWave = Math.sin(this.animationTimer * 3) * 2;

        // Body segments
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.quadraticCurveTo(cx - 16, cy - 6, cx - 14, cy - 14 + tailWave);
        ctx.stroke();

        // Stinger
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 14 + tailWave);
        ctx.lineTo(cx - 12, cy - 18 + tailWave);
        ctx.lineTo(cx - 16, cy - 14 + tailWave);
        ctx.closePath();
        ctx.fill();

        // Pincers
        ctx.fillStyle = '#8B0000';
        // Left pincer
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 6, 5, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 8);
        ctx.lineTo(cx + 18, cy - 10);
        ctx.lineTo(cx + 16, cy - 6);
        ctx.closePath();
        ctx.fill();
        // Right pincer
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy + 6, 5, 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy + 8);
        ctx.lineTo(cx + 18, cy + 10);
        ctx.lineTo(cx + 16, cy + 6);
        ctx.closePath();
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const legX = cx - 4 + i * 3;
            ctx.beginPath();
            ctx.moveTo(legX, cy - 4);
            ctx.lineTo(legX - 4, cy - 10);
            ctx.moveTo(legX, cy + 4);
            ctx.lineTo(legX - 4, cy + 10);
            ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 2, 1, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy + 2, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderFox(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;

        // Tail
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 4);
        ctx.quadraticCurveTo(cx - 20, cy, cx - 18, cy + 10);
        ctx.quadraticCurveTo(cx - 14, cy + 8, cx - 10, cy + 6);
        ctx.closePath();
        ctx.fill();
        // Tail tip
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx - 18, cy + 8, 3, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy + 4, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillRect(cx - 8, cy + 8, 3, 8);
        ctx.fillRect(cx + 2, cy + 8, 3, 8);

        // Head
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 2, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy - 6);
        ctx.lineTo(cx + 6, cy - 16);
        ctx.lineTo(cx + 10, cy - 8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 8);
        ctx.lineTo(cx + 14, cy - 16);
        ctx.lineTo(cx + 18, cy - 6);
        ctx.closePath();
        ctx.fill();

        // Inner ears
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(cx + 6, cy - 8);
        ctx.lineTo(cx + 7, cy - 13);
        ctx.lineTo(cx + 9, cy - 8);
        ctx.closePath();
        ctx.fill();

        // Snout
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + 2, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 16, cy + 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== TUNDRA ANIMALS ====================

    private renderPenguin(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;
        const waddle = Math.sin(this.animationTimer * 6) * 2;

        // Body (black back)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(cx + waddle, cy + 2, 9, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // White belly
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx + waddle, cy + 4, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings/flippers
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(cx - 9 + waddle, cy + 2, 3, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9 + waddle, cy + 2, 3, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(cx + waddle, cy - 10, 7, 0, Math.PI * 2);
        ctx.fill();

        // Face patch (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx + waddle, cy - 8, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Orange patches on cheeks
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(cx - 5 + waddle, cy - 10, 2, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 + waddle, cy - 10, 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(cx + waddle, cy - 8);
        ctx.lineTo(cx - 2 + waddle, cy - 5);
        ctx.lineTo(cx + 2 + waddle, cy - 5);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 2 + waddle, cy - 11, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 2 + waddle, cy - 11, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Feet
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(cx - 4 + waddle, cy + 14, 4, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4 + waddle, cy + 14, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderPolarBear(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 16;
        const cy = y + 16 + bounce;

        // Body
        ctx.fillStyle = '#FFFAFA';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy + 2, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillRect(cx - 14, cy + 8, 5, 10);
        ctx.fillRect(cx - 4, cy + 8, 5, 10);
        ctx.fillRect(cx + 4, cy + 6, 5, 10);

        // Head
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 4, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.beginPath();
        ctx.ellipse(cx + 18, cy - 2, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 10, 4, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy - 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner ears
        ctx.fillStyle = '#DDD';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 10, 2, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy - 10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 22, cy - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.beginPath();
        ctx.arc(cx + 14, cy - 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy);
        ctx.lineTo(cx + 18, cy + 2);
        ctx.stroke();
    }

    // ==================== FOREST ANIMALS ====================

    private renderDeer(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;

        // Body
        ctx.fillStyle = '#8B6914';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy + 4, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(cx - 10, cy + 8, 3, 12);
        ctx.fillRect(cx - 4, cy + 10, 3, 10);
        ctx.fillRect(cx + 4, cy + 8, 3, 12);

        // Neck
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(cx + 10, cy - 12);
        ctx.lineTo(cx + 14, cy - 12);
        ctx.lineTo(cx + 12, cy + 2);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 16, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antlers
        ctx.strokeStyle = '#5D4E37';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Left antler
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 18);
        ctx.lineTo(cx + 4, cy - 26);
        ctx.moveTo(cx + 6, cy - 22);
        ctx.lineTo(cx + 2, cy - 24);
        ctx.stroke();
        // Right antler
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy - 18);
        ctx.lineTo(cx + 20, cy - 26);
        ctx.moveTo(cx + 18, cy - 22);
        ctx.lineTo(cx + 22, cy - 24);
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#8B6914';
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy - 16, 2, 4, -0.5, 0, Math.PI * 2);
        ctx.ellipse(cx + 18, cy - 16, 2, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(cx + 16, cy - 14, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 18, cy - 14, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 17, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy + 2, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderRabbit(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;
        const hopOffset = this.animationFrame * 3;

        // Body
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4 - hopOffset, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Back legs
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy + 10 - hopOffset, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx + 2, cy + 10 - hopOffset, 5, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Front legs
        ctx.fillRect(cx + 4, cy + 6 - hopOffset, 3, 6);

        // Head
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 4 - hopOffset, 7, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy - 16 - hopOffset, 3, 8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 12, cy - 16 - hopOffset, 3, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner ears
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy - 16 - hopOffset, 1.5, 5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 12, cy - 16 - hopOffset, 1.5, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 2 - hopOffset, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(cx + 14, cy - 3 - hopOffset, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 5 - hopOffset, 2, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#8B8B83';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 2 - hopOffset);
        ctx.lineTo(cx + 18, cy - 4 - hopOffset);
        ctx.moveTo(cx + 12, cy - 1 - hopOffset);
        ctx.lineTo(cx + 18, cy - hopOffset);
        ctx.moveTo(cx + 12, cy - hopOffset);
        ctx.lineTo(cx + 18, cy + 2 - hopOffset);
        ctx.stroke();

        // Tail
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 4 - hopOffset, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderOwl(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;
        const blink = Math.sin(this.animationTimer * 2) > 0.9;

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly pattern
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 2, 4, 10, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy + 2, 4, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 9, 0, Math.PI * 2);
        ctx.fill();

        // Ear tufts
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 14);
        ctx.lineTo(cx - 10, cy - 22);
        ctx.lineTo(cx - 4, cy - 16);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 14);
        ctx.lineTo(cx + 10, cy - 22);
        ctx.lineTo(cx + 4, cy - 16);
        ctx.closePath();
        ctx.fill();

        // Face disk
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 11, 4, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 11, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        if (!blink) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 11, 2, 0, Math.PI * 2);
            ctx.arc(cx + 3, cy - 11, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy - 11);
            ctx.lineTo(cx, cy - 11);
            ctx.moveTo(cx, cy - 11);
            ctx.lineTo(cx + 6, cy - 11);
            ctx.stroke();
        }

        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx - 2, cy - 4);
        ctx.lineTo(cx + 2, cy - 4);
        ctx.closePath();
        ctx.fill();

        // Feet
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy + 16, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4, cy + 16, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== NEW BEACH ANIMALS ====================

    private renderStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 18 + bounce;
        const rotation = this.animationTimer * 0.2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        ctx.fillStyle = '#FF6B6B';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-4, -14);
            ctx.lineTo(0, -12);
            ctx.lineTo(4, -14);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(Math.PI * 2 / 5);
        }

        // Center
        ctx.fillStyle = '#FF8888';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    private renderPelican(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 16 + bounce;

        // Body
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy + 2, 8, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 8, 7, 0, Math.PI * 2);
        ctx.fill();

        // Pouch
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 6);
        ctx.quadraticCurveTo(cx - 20, cy + 4, cx - 14, cy + 2);
        ctx.lineTo(cx - 8, cy - 4);
        ctx.closePath();
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 10);
        ctx.lineTo(cx - 22, cy - 6);
        ctx.lineTo(cx - 8, cy - 4);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 9, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== NEW JUNGLE ANIMALS ====================

    private renderToucan(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 14 + bounce;

        // Body
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + 4, 10, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // White chest
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 6, 8, 0, Math.PI * 2);
        ctx.fill();

        // Beak (multicolored)
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 8);
        ctx.quadraticCurveTo(cx - 28, cy - 4, cx - 10, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 6);
        ctx.lineTo(cx - 22, cy - 4);
        ctx.lineTo(cx - 10, cy - 2);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderJaguar(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 14 + bounce;

        // Body
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spots
        ctx.fillStyle = '#000';
        const spots = [[-4, 2], [4, 0], [-2, 8], [6, 6], [-6, -2]];
        spots.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(cx + sx, cy + sy, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Head
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 10, 3, 0, Math.PI * 2);
        ctx.arc(cx - 5, cy - 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 2, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 13, cy - 6, 2, 0, Math.PI * 2);
        ctx.arc(cx - 7, cy - 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy + 4);
        ctx.quadraticCurveTo(cx + 22, cy, cx + 18, cy - 6);
        ctx.stroke();
    }

    private renderFrog(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 18 + bounce;
        const hop = this.isMoving ? Math.sin(this.animationTimer * 8) * 4 : 0;

        // Back legs
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy + 4 - hop, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx + 8, cy + 4 - hop, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.ellipse(cx, cy - hop, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Poison spots
        ctx.fillStyle = '#FF4500';
        const poisonSpots = [[-4, -2], [4, -2], [0, 4]];
        poisonSpots.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(cx + sx, cy + sy - hop, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Eyes
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 8 - hop, 5, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 8 - hop, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 8 - hop, 2, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 8 - hop, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== NEW DESERT ANIMALS ====================

    private renderLizard(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 18 + bounce;
        const wiggle = Math.sin(this.animationTimer * 4) * 2;

        // Tail
        ctx.strokeStyle = '#CD853F';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy);
        ctx.quadraticCurveTo(cx + 20, cy + wiggle, cx + 28, cy);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#CD853F';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 10, cy + 8);
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 10, cy + 8);
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 10, cy - 6);
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 10, cy - 6);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 14, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderMeerkat(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 14 + bounce;

        // Body (standing upright)
        ctx.fillStyle = '#C4A484';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#C4A484';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 12, 2, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye patches
        ctx.fillStyle = '#3D2914';
        ctx.beginPath();
        ctx.ellipse(cx - 3, cy - 8, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 3, cy - 8, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 9, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 9, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== NEW TUNDRA ANIMALS ====================

    private renderArcticFox(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 16 + bounce;

        // Body
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 4, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears (big)
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 8);
        ctx.lineTo(cx - 18, cy - 20);
        ctx.lineTo(cx - 10, cy - 10);
        ctx.closePath();
        ctx.moveTo(cx - 6, cy - 8);
        ctx.lineTo(cx - 2, cy - 20);
        ctx.lineTo(cx - 8, cy - 10);
        ctx.closePath();
        ctx.fill();

        // Inner ears
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 10);
        ctx.lineTo(cx - 16, cy - 16);
        ctx.lineTo(cx - 12, cy - 11);
        ctx.closePath();
        ctx.moveTo(cx - 6, cy - 10);
        ctx.lineTo(cx - 4, cy - 16);
        ctx.lineTo(cx - 7, cy - 11);
        ctx.closePath();
        ctx.fill();

        // Tail
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + 2, 8, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 5, 2, 0, Math.PI * 2);
        ctx.arc(cx - 6, cy - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 16, cy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderSeal(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 18 + bounce;
        const wobble = Math.sin(this.animationTimer * 2) * 2;

        // Body
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.ellipse(cx, cy + wobble, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 + wobble, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail flipper
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + wobble, 6, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 4 + wobble, 7, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 16, cy - 2 + wobble);
            ctx.lineTo(cx - 22, cy - 4 + i * 3 + wobble);
            ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 14, cy - 6 + wobble, 2, 0, Math.PI * 2);
        ctx.arc(cx - 10, cy - 6 + wobble, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 17, cy - 2 + wobble, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderSnowyOwl(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 14 + bounce;
        const blink = Math.sin(this.animationTimer * 2) > 0.9;

        // Body
        ctx.fillStyle = '#FFFAFA';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spots
        ctx.fillStyle = '#A9A9A9';
        const spots = [[-4, 2], [4, 4], [-2, 8], [2, 0]];
        spots.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(cx + sx, cy + sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Wings
        ctx.fillStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 2, 4, 10, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy + 2, 4, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFFAFA';
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 9, 0, Math.PI * 2);
        ctx.fill();

        // Face disk
        ctx.fillStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 11, 4, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 11, 4, 0, Math.PI * 2);
        ctx.fill();

        if (!blink) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx - 4, cy - 11, 2, 0, Math.PI * 2);
            ctx.arc(cx + 4, cy - 11, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Beak
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx - 2, cy - 4);
        ctx.lineTo(cx + 2, cy - 4);
        ctx.closePath();
        ctx.fill();
    }

    // ==================== NEW FOREST ANIMALS ====================

    private renderSquirrel(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 16 + bounce;

        // Tail (fluffy)
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy + 4);
        ctx.quadraticCurveTo(cx + 20, cy - 10, cx + 12, cy - 16);
        ctx.quadraticCurveTo(cx + 6, cy - 12, cx + 8, cy + 4);
        ctx.fill();

        // Body
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 8, 6, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 12, 3, 0, Math.PI * 2);
        ctx.arc(cx - 2, cy - 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Acorn (holding)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy + 6, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy + 3, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderHedgehog(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 18 + bounce;

        // Spines
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 1.4 - Math.PI * 0.2;
            const spineX = cx + Math.cos(angle) * 12;
            const spineY = cy - 4 + Math.sin(angle) * 8;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 6, cy - 4 + Math.sin(angle) * 4);
            ctx.lineTo(spineX, spineY);
            ctx.lineTo(cx + Math.cos(angle + 0.2) * 6, cy - 4 + Math.sin(angle + 0.2) * 4);
            ctx.closePath();
            ctx.fill();
        }

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy + 2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 12, cy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 2, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4, cy + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderWolf(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 18;
        const cy = y + 14 + bounce;

        // Body
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + 4, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy + 4);
        ctx.quadraticCurveTo(cx + 22, cy, cx + 20, cy + 8);
        ctx.quadraticCurveTo(cx + 18, cy + 10, cx + 14, cy + 6);
        ctx.closePath();
        ctx.fill();

        // Legs
        ctx.fillRect(cx - 6, cy + 10, 4, 8);
        ctx.fillRect(cx + 4, cy + 10, 4, 8);

        // Head
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 2, 8, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.ellipse(cx - 16, cy, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 6);
        ctx.lineTo(cx - 18, cy - 16);
        ctx.lineTo(cx - 10, cy - 8);
        ctx.closePath();
        ctx.moveTo(cx - 6, cy - 6);
        ctx.lineTo(cx - 2, cy - 16);
        ctx.lineTo(cx - 8, cy - 8);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 4, 2, 0, Math.PI * 2);
        ctx.arc(cx - 6, cy - 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 4, 1, 0, Math.PI * 2);
        ctx.arc(cx - 6, cy - 4, 1, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 19, cy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== GENERIC FALLBACK ====================

    private renderGeneric(ctx: CanvasRenderingContext2D, x: number, y: number, bounce: number): void {
        const cx = x + 14;
        const cy = y + 14 + bounce;

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    public renderInteractionPrompt(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, language: Language): void {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - 20, screenY - 30, 70, 20);
        ctx.fillStyle = '#FFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const text = language === 'nl' ? 'Druk E' : 'Press E';
        ctx.fillText(text, screenX + this.size.width / 2, screenY - 16);
        ctx.restore();
    }

    public getId(): string { return this.id; }
    public getName(language: Language): string { return this.name[language]; }
    public getDescription(language: Language): string { return this.description[language]; }
    public getBiome(): BiomeType { return this.biome; }
    public getPosition(): Position { return { ...this.position }; }
    public getSize(): Size { return { ...this.size }; }
    public getPoints(): number { return this.points; }
    public isDiscovered(): boolean { return this.discovered; }
    public isPhotographed(): boolean { return this.photographed; }
    public getFacts(language: Language): string[] { return this.facts[language]; }
    
    public discover(): void { this.discovered = true; }
    public photograph(): void { this.photographed = true; }

    public getRandomFact(language: Language): string {
        const facts = this.facts[language];
        return facts[Math.floor(Math.random() * facts.length)] || '';
    }

    public getBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.position.x, y: this.position.y, width: this.size.width, height: this.size.height };
    }
}

