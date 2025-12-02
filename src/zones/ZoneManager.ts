// Zone Manager - Manages the Adventure Zones system
// 5 main zones with 3-4 mini-levels each = ~60 minutes of gameplay

import type { BiomeType, Position } from '../types/index.js';

// Types for the zone system
export interface AnimalSpawn {
    id: string;
    x: number;      // Relative position in level (0-100%)
    y: number;
    isRare: boolean; // Special photo animal
}

export interface Interaction {
    type: 'button' | 'push_rock' | 'bridge' | 'footprints' | 'gate' | 'boat';
    x: number;
    y: number;
    width: number;
    height: number;
    targetId?: string; // What this interaction affects
    completed: boolean;
}

export interface PanoramaPoint {
    x: number;
    y: number;
    radius: number;
    visibleAnimals: string[]; // Animal IDs visible from this point
    bonusXP: number;
    discovered: boolean;
}

export interface MiniLevel {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    width: number;      // Level width in pixels
    height: number;     // Level height in pixels
    startX: number;     // Player start position
    startY: number;
    animals: AnimalSpawn[];
    interactions: Interaction[];
    panoramaPoints: PanoramaPoint[];
    requiredPhotos: number;  // How many photos needed to complete
    completed: boolean;
    unlocked: boolean;
    timeEstimate: number;    // Minutes
}

export interface Zone {
    id: string;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    biome: BiomeType;
    icon: string;           // Emoji icon
    color: string;          // Theme color
    levels: MiniLevel[];
    badgeId: string;        // Badge earned on completion
    unlocked: boolean;
    completed: boolean;
    mapPosition: Position;  // Position on world map
}

export interface ZoneProgress {
    zonesCompleted: string[];
    levelsCompleted: string[];
    currentZone: string | null;
    currentLevel: string | null;
    totalPhotos: number;
    totalTime: number;      // Minutes played
}

export class ZoneManager {
    private static instance: ZoneManager;
    private zones: Zone[] = [];
    private progress: ZoneProgress;
    private currentZone: Zone | null = null;
    private currentLevel: MiniLevel | null = null;

    private constructor() {
        this.progress = {
            zonesCompleted: [],
            levelsCompleted: [],
            currentZone: null,
            currentLevel: null,
            totalPhotos: 0,
            totalTime: 0
        };
        this.initializeZones();
    }

    public static getInstance(): ZoneManager {
        if (!ZoneManager.instance) {
            ZoneManager.instance = new ZoneManager();
        }
        return ZoneManager.instance;
    }

    private initializeZones(): void {
        this.zones = [
            this.createJungleZone(),
            this.createDesertZone(),
            this.createArcticZone(),
            this.createOceanZone(),
            this.createSavannahZone()
        ];

        // First zone is always unlocked
        this.zones[0]!.unlocked = true;
    }

    // ==================== JUNGLE ZONE ====================
    private createJungleZone(): Zone {
        return {
            id: 'jungle',
            name: { nl: 'Regenwoud', en: 'Rainforest' },
            description: { 
                nl: 'Ontdek de geheimen van het tropische regenwoud!', 
                en: 'Discover the secrets of the tropical rainforest!' 
            },
            biome: 'jungle',
            icon: '🌴',
            color: '#228B22',
            badgeId: 'jungle_explorer',
            unlocked: false,
            completed: false,
            mapPosition: { x: 150, y: 200 },
            levels: [
                {
                    id: 'jungle_waterfall',
                    name: { nl: 'Waterval Pad', en: 'Waterfall Trail' },
                    description: { nl: 'Volg het pad naar de verborgen waterval', en: 'Follow the path to the hidden waterfall' },
                    width: 1600,
                    height: 1200,
                    startX: 100,
                    startY: 600,
                    animals: [
                        { id: 'parrot', x: 30, y: 20, isRare: false },
                        { id: 'monkey', x: 50, y: 40, isRare: false },
                        { id: 'frog', x: 70, y: 60, isRare: false },
                        { id: 'toucan', x: 80, y: 25, isRare: false },
                        { id: 'snake', x: 45, y: 75, isRare: false },
                        { id: 'jaguar', x: 85, y: 80, isRare: true } // Rare!
                    ],
                    interactions: [
                        { type: 'bridge', x: 400, y: 500, width: 120, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 1400, y: 300, radius: 100, visibleAnimals: ['parrot', 'toucan', 'monkey'], bonusXP: 50, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: true,
                    timeEstimate: 3
                },
                {
                    id: 'jungle_temple',
                    name: { nl: 'Verborgen Tempel', en: 'Hidden Temple' },
                    description: { nl: 'Vind de oude tempel in het oerwoud', en: 'Find the ancient temple in the jungle' },
                    width: 1800,
                    height: 1400,
                    startX: 900,
                    startY: 1200,
                    animals: [
                        { id: 'monkey', x: 20, y: 30, isRare: false },
                        { id: 'snake', x: 60, y: 50, isRare: false },
                        { id: 'frog', x: 40, y: 70, isRare: false },
                        { id: 'parrot', x: 75, y: 20, isRare: false },
                        { id: 'toucan', x: 50, y: 15, isRare: true }
                    ],
                    interactions: [
                        { type: 'gate', x: 850, y: 400, width: 100, height: 80, completed: false },
                        { type: 'button', x: 600, y: 450, width: 40, height: 40, targetId: 'gate', completed: false }
                    ],
                    panoramaPoints: [
                        { x: 900, y: 200, radius: 120, visibleAnimals: ['monkey', 'parrot'], bonusXP: 40, discovered: false }
                    ],
                    requiredPhotos: 3,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'jungle_canopy',
                    name: { nl: 'Boomkruin Brug', en: 'Canopy Bridge' },
                    description: { nl: 'Loop over de hangbruggen hoog in de bomen', en: 'Walk across the suspension bridges high in the trees' },
                    width: 2000,
                    height: 1000,
                    startX: 100,
                    startY: 500,
                    animals: [
                        { id: 'toucan', x: 25, y: 30, isRare: false },
                        { id: 'parrot', x: 45, y: 40, isRare: false },
                        { id: 'monkey', x: 65, y: 35, isRare: false },
                        { id: 'monkey', x: 85, y: 45, isRare: false },
                        { id: 'sloth', x: 55, y: 25, isRare: true }
                    ],
                    interactions: [
                        { type: 'bridge', x: 500, y: 480, width: 200, height: 40, completed: false },
                        { type: 'bridge', x: 1000, y: 520, width: 200, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 1800, y: 300, radius: 150, visibleAnimals: ['toucan', 'parrot', 'monkey', 'sloth'], bonusXP: 75, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'jungle_river',
                    name: { nl: 'Rivieroversteek', en: 'River Crossing' },
                    description: { nl: 'Steek de wilde rivier over met een boot', en: 'Cross the wild river with a boat' },
                    width: 1600,
                    height: 1400,
                    startX: 800,
                    startY: 1300,
                    animals: [
                        { id: 'frog', x: 30, y: 60, isRare: false },
                        { id: 'snake', x: 50, y: 40, isRare: false },
                        { id: 'turtle', x: 70, y: 70, isRare: false },
                        { id: 'parrot', x: 20, y: 20, isRare: false },
                        { id: 'jaguar', x: 80, y: 15, isRare: true }
                    ],
                    interactions: [
                        { type: 'boat', x: 750, y: 700, width: 100, height: 60, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 800, y: 100, radius: 100, visibleAnimals: ['jaguar', 'parrot'], bonusXP: 60, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                }
            ]
        };
    }

    // ==================== DESERT ZONE ====================
    private createDesertZone(): Zone {
        return {
            id: 'desert',
            name: { nl: 'Woestijn', en: 'Desert' },
            description: { 
                nl: 'Trotseer de hitte van de woestijn!', 
                en: 'Brave the heat of the desert!' 
            },
            biome: 'desert',
            icon: '🏜️',
            color: '#EDC9AF',
            badgeId: 'desert_explorer',
            unlocked: false,
            completed: false,
            mapPosition: { x: 350, y: 180 },
            levels: [
                {
                    id: 'desert_oasis',
                    name: { nl: 'Oase Pad', en: 'Oasis Path' },
                    description: { nl: 'Vind de verfrissende oase', en: 'Find the refreshing oasis' },
                    width: 1800,
                    height: 1200,
                    startX: 100,
                    startY: 600,
                    animals: [
                        { id: 'camel', x: 50, y: 50, isRare: false },
                        { id: 'scorpion', x: 30, y: 70, isRare: false },
                        { id: 'lizard', x: 60, y: 40, isRare: false },
                        { id: 'meerkat', x: 75, y: 60, isRare: false },
                        { id: 'fox', x: 85, y: 30, isRare: true }
                    ],
                    interactions: [
                        { type: 'push_rock', x: 600, y: 400, width: 60, height: 60, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 1600, y: 500, radius: 120, visibleAnimals: ['camel', 'meerkat', 'fox'], bonusXP: 50, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: true,
                    timeEstimate: 4
                },
                {
                    id: 'desert_dunes',
                    name: { nl: 'Zandduinen', en: 'Sand Dune Ridge' },
                    description: { nl: 'Beklim de hoge zandduinen', en: 'Climb the tall sand dunes' },
                    width: 2000,
                    height: 1000,
                    startX: 100,
                    startY: 800,
                    animals: [
                        { id: 'scorpion', x: 25, y: 60, isRare: false },
                        { id: 'lizard', x: 45, y: 45, isRare: false },
                        { id: 'camel', x: 70, y: 50, isRare: false },
                        { id: 'meerkat', x: 55, y: 70, isRare: false },
                        { id: 'vulture', x: 80, y: 20, isRare: true }
                    ],
                    interactions: [
                        { type: 'footprints', x: 300, y: 700, width: 800, height: 50, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 1800, y: 200, radius: 100, visibleAnimals: ['camel', 'vulture'], bonusXP: 45, discovered: false }
                    ],
                    requiredPhotos: 3,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 3
                },
                {
                    id: 'desert_ruins',
                    name: { nl: 'Zonneruïnes', en: 'Ruins of the Sun' },
                    description: { nl: 'Ontdek de oude ruïnes', en: 'Discover the ancient ruins' },
                    width: 1600,
                    height: 1400,
                    startX: 800,
                    startY: 1300,
                    animals: [
                        { id: 'scorpion', x: 40, y: 50, isRare: false },
                        { id: 'lizard', x: 60, y: 30, isRare: false },
                        { id: 'snake', x: 50, y: 70, isRare: false },
                        { id: 'meerkat', x: 30, y: 40, isRare: false },
                        { id: 'fox', x: 70, y: 20, isRare: true }
                    ],
                    interactions: [
                        { type: 'gate', x: 750, y: 300, width: 100, height: 100, completed: false },
                        { type: 'button', x: 400, y: 500, width: 40, height: 40, targetId: 'gate', completed: false }
                    ],
                    panoramaPoints: [
                        { x: 800, y: 150, radius: 130, visibleAnimals: ['fox', 'lizard', 'meerkat'], bonusXP: 55, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                }
            ]
        };
    }

    // ==================== ARCTIC ZONE ====================
    private createArcticZone(): Zone {
        return {
            id: 'arctic',
            name: { nl: 'Arctisch Gebied', en: 'Arctic' },
            description: { 
                nl: 'Verken de ijzige poolgebieden!', 
                en: 'Explore the icy polar regions!' 
            },
            biome: 'tundra',
            icon: '❄️',
            color: '#87CEEB',
            badgeId: 'arctic_explorer',
            unlocked: false,
            completed: false,
            mapPosition: { x: 300, y: 50 },
            levels: [
                {
                    id: 'arctic_lake',
                    name: { nl: 'Bevroren Meer', en: 'Frozen Lake' },
                    description: { nl: 'Glijd over het bevroren meer', en: 'Slide across the frozen lake' },
                    width: 1600,
                    height: 1200,
                    startX: 800,
                    startY: 1100,
                    animals: [
                        { id: 'penguin', x: 50, y: 50, isRare: false },
                        { id: 'seal', x: 30, y: 40, isRare: false },
                        { id: 'arctic_fox', x: 70, y: 60, isRare: false },
                        { id: 'snowy_owl', x: 60, y: 20, isRare: false },
                        { id: 'polar_bear', x: 80, y: 30, isRare: true }
                    ],
                    interactions: [],
                    panoramaPoints: [
                        { x: 800, y: 200, radius: 150, visibleAnimals: ['penguin', 'seal', 'polar_bear'], bonusXP: 60, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: true,
                    timeEstimate: 3
                },
                {
                    id: 'arctic_caves',
                    name: { nl: 'IJsgrotten', en: 'Ice Caves' },
                    description: { nl: 'Verken de glinsterende ijsgrotten', en: 'Explore the glittering ice caves' },
                    width: 1400,
                    height: 1600,
                    startX: 700,
                    startY: 1500,
                    animals: [
                        { id: 'arctic_fox', x: 40, y: 40, isRare: false },
                        { id: 'snowy_owl', x: 60, y: 25, isRare: false },
                        { id: 'seal', x: 50, y: 70, isRare: false },
                        { id: 'penguin', x: 30, y: 55, isRare: false },
                        { id: 'polar_bear', x: 70, y: 15, isRare: true }
                    ],
                    interactions: [
                        { type: 'push_rock', x: 650, y: 800, width: 80, height: 80, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 700, y: 200, radius: 100, visibleAnimals: ['polar_bear', 'snowy_owl'], bonusXP: 50, discovered: false }
                    ],
                    requiredPhotos: 3,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'arctic_cliffs',
                    name: { nl: 'Besneeuwde Kliffen', en: 'Snowy Cliffs' },
                    description: { nl: 'Beklim de gevaarlijke kliffen', en: 'Climb the dangerous cliffs' },
                    width: 1200,
                    height: 1800,
                    startX: 600,
                    startY: 1700,
                    animals: [
                        { id: 'snowy_owl', x: 50, y: 15, isRare: false },
                        { id: 'arctic_fox', x: 30, y: 40, isRare: false },
                        { id: 'penguin', x: 70, y: 60, isRare: false },
                        { id: 'seal', x: 60, y: 80, isRare: false },
                        { id: 'puffin', x: 40, y: 10, isRare: true }
                    ],
                    interactions: [
                        { type: 'bridge', x: 550, y: 900, width: 100, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 600, y: 100, radius: 120, visibleAnimals: ['snowy_owl', 'puffin', 'arctic_fox'], bonusXP: 65, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                }
            ]
        };
    }

    // ==================== OCEAN ZONE ====================
    private createOceanZone(): Zone {
        return {
            id: 'ocean',
            name: { nl: 'Oceaan & Eilanden', en: 'Ocean & Islands' },
            description: { 
                nl: 'Duik in de onderwaterwereld!', 
                en: 'Dive into the underwater world!' 
            },
            biome: 'beach',
            icon: '🌊',
            color: '#1E90FF',
            badgeId: 'ocean_explorer',
            unlocked: false,
            completed: false,
            mapPosition: { x: 500, y: 250 },
            levels: [
                {
                    id: 'ocean_reef',
                    name: { nl: 'Koraalrif', en: 'Coral Reef' },
                    description: { nl: 'Ontdek het kleurrijke koraalrif', en: 'Discover the colorful coral reef' },
                    width: 2000,
                    height: 1200,
                    startX: 100,
                    startY: 600,
                    animals: [
                        { id: 'turtle', x: 40, y: 50, isRare: false },
                        { id: 'crab', x: 25, y: 70, isRare: false },
                        { id: 'starfish', x: 60, y: 60, isRare: false },
                        { id: 'dolphin', x: 80, y: 40, isRare: false },
                        { id: 'whale', x: 90, y: 30, isRare: true }
                    ],
                    interactions: [],
                    panoramaPoints: [
                        { x: 1800, y: 400, radius: 150, visibleAnimals: ['dolphin', 'turtle', 'whale'], bonusXP: 70, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: true,
                    timeEstimate: 3
                },
                {
                    id: 'ocean_shipwreck',
                    name: { nl: 'Scheepswrak Baai', en: 'Shipwreck Bay' },
                    description: { nl: 'Verken het oude scheepswrak', en: 'Explore the old shipwreck' },
                    width: 1600,
                    height: 1400,
                    startX: 800,
                    startY: 1300,
                    animals: [
                        { id: 'crab', x: 35, y: 55, isRare: false },
                        { id: 'starfish', x: 55, y: 70, isRare: false },
                        { id: 'turtle', x: 45, y: 40, isRare: false },
                        { id: 'seagull', x: 70, y: 20, isRare: false },
                        { id: 'dolphin', x: 80, y: 50, isRare: true }
                    ],
                    interactions: [
                        { type: 'push_rock', x: 750, y: 600, width: 70, height: 70, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 800, y: 200, radius: 100, visibleAnimals: ['seagull', 'dolphin'], bonusXP: 45, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'ocean_turtle_beach',
                    name: { nl: 'Schildpadstrand', en: 'Turtle Beach' },
                    description: { nl: 'Zie de schildpadden hun eieren leggen', en: 'Watch the turtles lay their eggs' },
                    width: 1800,
                    height: 1000,
                    startX: 100,
                    startY: 500,
                    animals: [
                        { id: 'turtle', x: 30, y: 60, isRare: false },
                        { id: 'turtle', x: 50, y: 65, isRare: false },
                        { id: 'crab', x: 40, y: 75, isRare: false },
                        { id: 'seagull', x: 60, y: 30, isRare: false },
                        { id: 'pelican', x: 80, y: 25, isRare: true }
                    ],
                    interactions: [
                        { type: 'footprints', x: 200, y: 600, width: 600, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 1600, y: 300, radius: 120, visibleAnimals: ['turtle', 'pelican', 'seagull'], bonusXP: 55, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 3
                },
                {
                    id: 'ocean_pier',
                    name: { nl: 'Stormachtige Pier', en: 'Stormy Pier' },
                    description: { nl: 'Trotseer de storm op de pier', en: 'Brave the storm on the pier' },
                    width: 1400,
                    height: 1600,
                    startX: 700,
                    startY: 1500,
                    animals: [
                        { id: 'seagull', x: 50, y: 30, isRare: false },
                        { id: 'crab', x: 40, y: 70, isRare: false },
                        { id: 'pelican', x: 60, y: 25, isRare: false },
                        { id: 'starfish', x: 35, y: 80, isRare: false },
                        { id: 'orca', x: 70, y: 50, isRare: true }
                    ],
                    interactions: [
                        { type: 'bridge', x: 650, y: 800, width: 100, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 700, y: 150, radius: 100, visibleAnimals: ['orca', 'pelican', 'seagull'], bonusXP: 65, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                }
            ]
        };
    }

    // ==================== SAVANNAH ZONE ====================
    private createSavannahZone(): Zone {
        return {
            id: 'savannah',
            name: { nl: 'Savanne', en: 'Savannah' },
            description: { 
                nl: 'Safari door de Afrikaanse savanne!', 
                en: 'Safari through the African savannah!' 
            },
            biome: 'forest', // We'll use forest biome styling adapted for savannah
            icon: '🦁',
            color: '#DAA520',
            badgeId: 'savannah_explorer',
            unlocked: false,
            completed: false,
            mapPosition: { x: 400, y: 350 },
            levels: [
                {
                    id: 'savannah_plains',
                    name: { nl: 'Grasvlaktes', en: 'Tall Grass Plains' },
                    description: { nl: 'Zoek dieren in het hoge gras', en: 'Find animals in the tall grass' },
                    width: 2000,
                    height: 1200,
                    startX: 100,
                    startY: 600,
                    animals: [
                        { id: 'lion', x: 60, y: 40, isRare: false },
                        { id: 'zebra', x: 40, y: 55, isRare: false },
                        { id: 'giraffe', x: 75, y: 35, isRare: false },
                        { id: 'elephant', x: 85, y: 50, isRare: false },
                        { id: 'cheetah', x: 50, y: 25, isRare: true }
                    ],
                    interactions: [],
                    panoramaPoints: [
                        { x: 1800, y: 400, radius: 150, visibleAnimals: ['lion', 'elephant', 'giraffe', 'cheetah'], bonusXP: 80, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: true,
                    timeEstimate: 3
                },
                {
                    id: 'savannah_baobab',
                    name: { nl: 'Baobab Vallei', en: 'Baobab Valley' },
                    description: { nl: 'Ontdek de reuzenachtige baobabs', en: 'Discover the giant baobab trees' },
                    width: 1600,
                    height: 1400,
                    startX: 800,
                    startY: 1300,
                    animals: [
                        { id: 'elephant', x: 50, y: 45, isRare: false },
                        { id: 'giraffe', x: 30, y: 35, isRare: false },
                        { id: 'zebra', x: 70, y: 55, isRare: false },
                        { id: 'hippo', x: 45, y: 70, isRare: false },
                        { id: 'lion', x: 60, y: 20, isRare: true }
                    ],
                    interactions: [
                        { type: 'push_rock', x: 750, y: 700, width: 80, height: 80, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 800, y: 200, radius: 120, visibleAnimals: ['elephant', 'giraffe', 'lion'], bonusXP: 60, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'savannah_elephant',
                    name: { nl: 'Olifantenpad', en: 'Elephant Road' },
                    description: { nl: 'Volg de olifantenkudde', en: 'Follow the elephant herd' },
                    width: 2200,
                    height: 1000,
                    startX: 100,
                    startY: 500,
                    animals: [
                        { id: 'elephant', x: 30, y: 50, isRare: false },
                        { id: 'elephant', x: 45, y: 55, isRare: false },
                        { id: 'zebra', x: 60, y: 45, isRare: false },
                        { id: 'rhino', x: 75, y: 50, isRare: false },
                        { id: 'hippo', x: 85, y: 60, isRare: true }
                    ],
                    interactions: [
                        { type: 'footprints', x: 200, y: 500, width: 1000, height: 50, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 2000, y: 300, radius: 130, visibleAnimals: ['elephant', 'rhino', 'hippo'], bonusXP: 70, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                },
                {
                    id: 'savannah_sunset',
                    name: { nl: 'Zonsondergang Rotsen', en: 'Sunset Rocks' },
                    description: { nl: 'Geniet van de zonsondergang', en: 'Enjoy the sunset view' },
                    width: 1400,
                    height: 1200,
                    startX: 700,
                    startY: 1100,
                    animals: [
                        { id: 'lion', x: 50, y: 30, isRare: false },
                        { id: 'hyena', x: 35, y: 50, isRare: false },
                        { id: 'flamingo', x: 70, y: 65, isRare: false },
                        { id: 'zebra', x: 25, y: 40, isRare: false },
                        { id: 'cheetah', x: 60, y: 20, isRare: true }
                    ],
                    interactions: [
                        { type: 'bridge', x: 650, y: 600, width: 100, height: 40, completed: false }
                    ],
                    panoramaPoints: [
                        { x: 700, y: 150, radius: 140, visibleAnimals: ['lion', 'cheetah', 'flamingo', 'hyena'], bonusXP: 85, discovered: false }
                    ],
                    requiredPhotos: 4,
                    completed: false,
                    unlocked: false,
                    timeEstimate: 4
                }
            ]
        };
    }

    // ==================== PUBLIC METHODS ====================

    public getZones(): Zone[] {
        return this.zones;
    }

    public getZone(zoneId: string): Zone | undefined {
        return this.zones.find(z => z.id === zoneId);
    }

    public getCurrentZone(): Zone | null {
        return this.currentZone;
    }

    public getCurrentLevel(): MiniLevel | null {
        return this.currentLevel;
    }

    public setCurrentZone(zoneId: string): boolean {
        const zone = this.getZone(zoneId);
        if (zone && zone.unlocked) {
            this.currentZone = zone;
            this.progress.currentZone = zoneId;
            return true;
        }
        return false;
    }

    public setCurrentLevel(levelId: string): boolean {
        if (!this.currentZone) return false;
        
        const level = this.currentZone.levels.find(l => l.id === levelId);
        if (level && level.unlocked) {
            this.currentLevel = level;
            this.progress.currentLevel = levelId;
            return true;
        }
        return false;
    }

    public completeLevel(levelId: string): void {
        if (!this.currentZone) return;

        const level = this.currentZone.levels.find(l => l.id === levelId);
        if (level) {
            level.completed = true;
            
            if (!this.progress.levelsCompleted.includes(levelId)) {
                this.progress.levelsCompleted.push(levelId);
            }

            // Unlock next level in zone
            const levelIndex = this.currentZone.levels.indexOf(level);
            if (levelIndex < this.currentZone.levels.length - 1) {
                this.currentZone.levels[levelIndex + 1]!.unlocked = true;
            }

            // Check if zone is complete
            const allComplete = this.currentZone.levels.every(l => l.completed);
            if (allComplete) {
                this.completeZone(this.currentZone.id);
            }
        }
    }

    public completeZone(zoneId: string): void {
        const zone = this.getZone(zoneId);
        if (zone) {
            zone.completed = true;
            
            if (!this.progress.zonesCompleted.includes(zoneId)) {
                this.progress.zonesCompleted.push(zoneId);
            }

            // Unlock next zone
            const zoneIndex = this.zones.indexOf(zone);
            if (zoneIndex < this.zones.length - 1) {
                this.zones[zoneIndex + 1]!.unlocked = true;
            }
        }
    }

    public getProgress(): ZoneProgress {
        return this.progress;
    }

    public getTotalLevels(): number {
        return this.zones.reduce((sum, z) => sum + z.levels.length, 0);
    }

    public getCompletedLevels(): number {
        return this.progress.levelsCompleted.length;
    }

    public isWorldComplete(): boolean {
        return this.zones.every(z => z.completed);
    }

    public getEstimatedTotalTime(): number {
        return this.zones.reduce((sum, z) => 
            sum + z.levels.reduce((lSum, l) => lSum + l.timeEstimate, 0), 0);
    }

    public saveProgress(): void {
        localStorage.setItem('zoneProgress', JSON.stringify(this.progress));
        localStorage.setItem('zones', JSON.stringify(this.zones));
    }

    public loadProgress(): void {
        const savedProgress = localStorage.getItem('zoneProgress');
        const savedZones = localStorage.getItem('zones');
        
        if (savedProgress) {
            this.progress = JSON.parse(savedProgress);
        }
        if (savedZones) {
            this.zones = JSON.parse(savedZones);
        }
    }
}
