// Core game types and interfaces

export type Language = 'nl' | 'en';

export type SceneType = 'menu' | 'gameplay' | 'progress' | 'camera' | 'photoGallery' | 'zoneSelect' | 'biomeSelect';

export type BiomeType = 'beach' | 'jungle' | 'desert' | 'tundra' | 'forest' | 'rainforest' | 'arctic' | 'ocean' | 'coral_reef' | 'deep_ocean' | 'savannah' | 'wetland' | 'mountain';

export type TileType = 'grass' | 'sand' | 'water' | 'snow' | 'dirt' | 'stone' | 'tree' | 'bush';

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Rectangle extends Position, Size {}

export interface Velocity {
    vx: number;
    vy: number;
}

export interface Animal {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    biome: BiomeType;
    position: Position;
    sprite: string;
    points: number;
    discovered: boolean;
    photographed: boolean;
    facts: { nl: string[]; en: string[] };
}

export interface Photo {
    id: string;
    animalId: string;
    animalName: { nl: string; en: string };
    timestamp: number;
    dataUrl: string;
    location: BiomeType;
    points: number;
}

export interface Badge {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    icon: string;
    unlocked: boolean;
    requirement: BadgeRequirement;
}

export interface BadgeRequirement {
    type: 'animals_discovered' | 'photos_taken' | 'biome_complete' | 'total_points';
    count?: number;
    biome?: BiomeType;
}

export interface GameProgress {
    totalPoints: number;
    discoveredAnimals: string[];
    photos: Photo[];
    badges: string[];
    exploredAreas: Set<string>;
    currentBiome: BiomeType;
    language: Language;
    lastPlayed: number;
}

export interface InputState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    action: boolean;
    camera: boolean;
    escape: boolean;
    map: boolean;
    backpack: boolean;
    badges: boolean;
    journal: boolean;
    // Camera controls
    zoomIn: boolean;
    zoomOut: boolean;
    focusUp: boolean;
    focusDown: boolean;
}

export interface JoystickState {
    active: boolean;
    dx: number;
    dy: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    tileSize: number;
    playerSpeed: number;
    worldWidth: number;
    worldHeight: number;
    chunkSize: number;
}

export interface Translations {
    [key: string]: {
        nl: string;
        en: string;
    };
}

export interface Sprite {
    image: HTMLImageElement | null;
    loaded: boolean;
    width: number;
    height: number;
}

export interface AnimationFrame {
    x: number;
    y: number;
    width: number;
    height: number;
    duration: number;
}

export interface Animation {
    frames: AnimationFrame[];
    currentFrame: number;
    elapsed: number;
    loop: boolean;
}

