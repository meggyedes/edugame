// TilesetRenderer - Renders game backgrounds using tileset images

export type BiomeType = 'forest' | 'jungle' | 'desert' | 'tundra';

interface TilesetConfig {
    imagePath: string;
    tileSize: number;  // Size of each tile in the tileset
    // Which tiles to use for ground, decorations etc.
    groundTiles: number[];  // Tile indices for ground
    treeTiles: number[];    // Tile indices for trees/decorations
    waterTiles: number[];   // Tile indices for water
}

const TILESET_CONFIGS: Record<BiomeType, TilesetConfig> = {
    forest: {
        imagePath: '/public/tilesets/forest.png',
        tileSize: 16,
        groundTiles: [0, 1, 2, 16, 17, 18],  // Grass tiles
        treeTiles: [32, 33, 48, 49],          // Tree tiles
        waterTiles: [64, 65, 80, 81]          // Water tiles
    },
    jungle: {
        imagePath: '/public/tilesets/jungle.png',
        tileSize: 16,
        groundTiles: [0, 1, 2, 16, 17, 18],
        treeTiles: [32, 33, 48, 49],
        waterTiles: [64, 65, 80, 81]
    },
    desert: {
        imagePath: '/public/tilesets/desert.png',
        tileSize: 16,
        groundTiles: [0, 1, 2, 16, 17, 18],  // Sand tiles
        treeTiles: [32, 33, 48, 49],          // Cactus/rocks
        waterTiles: [64, 65, 80, 81]          // Oasis water
    },
    tundra: {
        imagePath: '/public/tilesets/tundra.png',
        tileSize: 16,
        groundTiles: [0, 1, 2, 16, 17, 18],  // Snow tiles
        treeTiles: [32, 33, 48, 49],          // Pine trees
        waterTiles: [64, 65, 80, 81]          // Ice/frozen water
    }
};

export class TilesetRenderer {
    private tilesets: Map<BiomeType, HTMLImageElement> = new Map();
    private loadedTilesets: Set<BiomeType> = new Set();
    private currentBiome: BiomeType = 'forest';
    private tileSize = 16;
    private scaleFactor = 4;  // Scale up 16px tiles to 64px for visibility
    
    // Pre-generated tile map for the level
    private tileMap: number[][] = [];
    private mapWidth = 0;
    private mapHeight = 0;

    constructor() {
        this.loadAllTilesets();
    }

    private loadAllTilesets(): void {
        const biomes: BiomeType[] = ['forest', 'jungle', 'desert', 'tundra'];
        
        biomes.forEach(biome => {
            const img = new Image();
            img.onload = () => {
                this.tilesets.set(biome, img);
                this.loadedTilesets.add(biome);
                console.log(`✅ Tileset loaded: ${biome}`);
            };
            img.onerror = () => {
                console.warn(`⚠️ Failed to load tileset: ${biome}`);
            };
            img.src = TILESET_CONFIGS[biome].imagePath;
        });
    }

    public setBiome(biome: BiomeType): void {
        this.currentBiome = biome;
        // Regenerate tile map when biome changes
        if (this.mapWidth > 0 && this.mapHeight > 0) {
            this.generateTileMap(this.mapWidth, this.mapHeight);
        }
    }

    public generateTileMap(worldWidth: number, worldHeight: number): void {
        const scaledTileSize = this.tileSize * this.scaleFactor;
        this.mapWidth = Math.ceil(worldWidth / scaledTileSize);
        this.mapHeight = Math.ceil(worldHeight / scaledTileSize);
        
        // Generate a pseudo-random but deterministic tile map
        this.tileMap = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.tileMap[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                // Use simple hash for deterministic "randomness"
                const hash = (x * 7 + y * 13) % 100;
                
                if (hash < 70) {
                    // 70% ground tiles
                    this.tileMap[y][x] = hash % 6;  // Ground tile variation
                } else if (hash < 90) {
                    // 20% decoration tiles (trees, rocks)
                    this.tileMap[y][x] = 100 + (hash % 4);  // Mark as decoration
                } else {
                    // 10% special tiles
                    this.tileMap[y][x] = 200 + (hash % 4);  // Mark as special
                }
            }
        }
    }

    public render(
        ctx: CanvasRenderingContext2D,
        cameraX: number,
        cameraY: number,
        screenWidth: number,
        screenHeight: number
    ): void {
        const tileset = this.tilesets.get(this.currentBiome);
        
        if (!tileset || !this.loadedTilesets.has(this.currentBiome)) {
            // Fallback: render colored background while loading
            this.renderFallbackBackground(ctx, screenWidth, screenHeight);
            return;
        }

        const config = TILESET_CONFIGS[this.currentBiome];
        const scaledTileSize = this.tileSize * this.scaleFactor;
        
        // Calculate which tiles are visible
        const startTileX = Math.floor(cameraX / scaledTileSize);
        const startTileY = Math.floor(cameraY / scaledTileSize);
        const endTileX = Math.ceil((cameraX + screenWidth) / scaledTileSize);
        const endTileY = Math.ceil((cameraY + screenHeight) / scaledTileSize);
        
        // Calculate offset for smooth scrolling
        const offsetX = -(cameraX % scaledTileSize);
        const offsetY = -(cameraY % scaledTileSize);
        
        // Get tileset dimensions
        const tilesPerRow = Math.floor(tileset.width / config.tileSize);
        
        ctx.imageSmoothingEnabled = false;  // Pixel-perfect rendering
        
        // Render visible tiles
        for (let ty = startTileY; ty <= endTileY; ty++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                // Wrap around or clamp tile coordinates
                const mapX = Math.abs(tx % this.mapWidth);
                const mapY = Math.abs(ty % this.mapHeight);
                
                if (this.tileMap[mapY] === undefined) continue;
                
                const tileValue = this.tileMap[mapY][mapX] ?? 0;
                
                // Get actual tile index from tileset
                let tileIndex: number;
                if (tileValue < 100) {
                    // Ground tile
                    tileIndex = config.groundTiles[tileValue % config.groundTiles.length];
                } else if (tileValue < 200) {
                    // Decoration tile
                    tileIndex = config.treeTiles[(tileValue - 100) % config.treeTiles.length];
                } else {
                    // Special tile (water, etc.)
                    tileIndex = config.waterTiles[(tileValue - 200) % config.waterTiles.length];
                }
                
                // Calculate source position in tileset
                const srcX = (tileIndex % tilesPerRow) * config.tileSize;
                const srcY = Math.floor(tileIndex / tilesPerRow) * config.tileSize;
                
                // Calculate screen position
                const screenX = (tx - startTileX) * scaledTileSize + offsetX;
                const screenY = (ty - startTileY) * scaledTileSize + offsetY;
                
                // Draw the tile
                ctx.drawImage(
                    tileset,
                    srcX, srcY,
                    config.tileSize, config.tileSize,
                    screenX, screenY,
                    scaledTileSize, scaledTileSize
                );
            }
        }
    }

    private renderFallbackBackground(
        ctx: CanvasRenderingContext2D,
        screenWidth: number,
        screenHeight: number
    ): void {
        // Biome-specific fallback colors
        const colors: Record<BiomeType, string> = {
            forest: '#228B22',
            jungle: '#006400',
            desert: '#EDC9AF',
            tundra: '#E8E8E8'
        };
        
        ctx.fillStyle = colors[this.currentBiome];
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        
        // Add some texture with dots
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % screenWidth;
            const y = (i * 53) % screenHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    public isLoaded(): boolean {
        return this.loadedTilesets.has(this.currentBiome);
    }

    public getCurrentBiome(): BiomeType {
        return this.currentBiome;
    }
}
