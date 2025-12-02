// GameCamera class for following the player
export class GameCamera {
    constructor(viewWidth, viewHeight, worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 5;
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }
    update(deltaTime) {
        // Smoothly interpolate camera position
        this.x += (this.targetX - this.x) * this.smoothing * deltaTime;
        this.y += (this.targetY - this.y) * this.smoothing * deltaTime;
        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.worldWidth - this.viewWidth, this.x));
        this.y = Math.max(0, Math.min(this.worldHeight - this.viewHeight, this.y));
    }
    follow(target) {
        // Center camera on target
        this.targetX = target.x - this.viewWidth / 2;
        this.targetY = target.y - this.viewHeight / 2;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }
    getX() {
        return Math.floor(this.x);
    }
    getY() {
        return Math.floor(this.y);
    }
    getPosition() {
        return { x: Math.floor(this.x), y: Math.floor(this.y) };
    }
    setViewSize(width, height) {
        this.viewWidth = width;
        this.viewHeight = height;
    }
    updateViewport(width, height) {
        this.viewWidth = width;
        this.viewHeight = height;
    }
    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y,
        };
    }
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y,
        };
    }
    isVisible(x, y, width, height) {
        return (x + width > this.x &&
            x < this.x + this.viewWidth &&
            y + height > this.y &&
            y < this.y + this.viewHeight);
    }
}
//# sourceMappingURL=GameCamera.js.map