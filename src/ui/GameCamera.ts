// GameCamera class for following the player

import type { Position } from '../types/index.js';

export class GameCamera {
    private x: number = 0;
    private y: number = 0;
    private targetX: number = 0;
    private targetY: number = 0;
    private viewWidth: number;
    private viewHeight: number;
    private worldWidth: number;
    private worldHeight: number;
    private smoothing: number = 5;

    constructor(viewWidth: number, viewHeight: number, worldWidth: number, worldHeight: number) {
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    public update(deltaTime: number): void {
        // Smoothly interpolate camera position
        this.x += (this.targetX - this.x) * this.smoothing * deltaTime;
        this.y += (this.targetY - this.y) * this.smoothing * deltaTime;

        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.worldWidth - this.viewWidth, this.x));
        this.y = Math.max(0, Math.min(this.worldHeight - this.viewHeight, this.y));
    }

    public follow(target: Position): void {
        // Center camera on target
        this.targetX = target.x - this.viewWidth / 2;
        this.targetY = target.y - this.viewHeight / 2;
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }

    public getX(): number {
        return Math.floor(this.x);
    }

    public getY(): number {
        return Math.floor(this.y);
    }

    public getPosition(): Position {
        return { x: Math.floor(this.x), y: Math.floor(this.y) };
    }

    public setViewSize(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
    }

    public updateViewport(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
    }

    public setWorldSize(width: number, height: number): void {
        this.worldWidth = width;
        this.worldHeight = height;
    }

    public screenToWorld(screenX: number, screenY: number): Position {
        return {
            x: screenX + this.x,
            y: screenY + this.y,
        };
    }

    public worldToScreen(worldX: number, worldY: number): Position {
        return {
            x: worldX - this.x,
            y: worldY - this.y,
        };
    }

    public isVisible(x: number, y: number, width: number, height: number): boolean {
        return (
            x + width > this.x &&
            x < this.x + this.viewWidth &&
            y + height > this.y &&
            y < this.y + this.viewHeight
        );
    }
}
