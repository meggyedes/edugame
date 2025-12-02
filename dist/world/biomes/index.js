// Biome System - Export all biomes
// 7 Continents = 7 Biomes
export { BaseBiome } from './BaseBiome.js';
export { ForestBiome } from './ForestBiome.js';
export { JungleBiome } from './JungleBiome.js';
export { SavannahBiome } from './SavannahBiome.js';
export { DesertBiome } from './DesertBiome.js';
export { ArcticBiome } from './ArcticBiome.js';
export { OceanBiome } from './OceanBiome.js';
export { BambooBiome } from './BambooBiome.js';
export { TundraBiome } from './TundraBiome.js';
import { ForestBiome } from './ForestBiome.js';
import { JungleBiome } from './JungleBiome.js';
import { SavannahBiome } from './SavannahBiome.js';
import { DesertBiome } from './DesertBiome.js';
import { ArcticBiome } from './ArcticBiome.js';
import { OceanBiome } from './OceanBiome.js';
import { BambooBiome } from './BambooBiome.js';
import { TundraBiome } from './TundraBiome.js';
export const CONTINENTS = [
    {
        id: 'europe',
        name: { nl: 'Europa', en: 'Europe' },
        biome: 'forest',
        description: {
            nl: 'Gematigde bossen met diverse flora en fauna',
            en: 'Temperate forests with diverse flora and fauna'
        },
        animals: ['Red Fox', 'European Deer', 'Hedgehog', 'Owl', 'Wild Boar'],
        color: '#228B22'
    },
    {
        id: 'south_america',
        name: { nl: 'Zuid-Amerika', en: 'South America' },
        biome: 'jungle',
        description: {
            nl: 'Tropische regenwouden vol exotische dieren',
            en: 'Tropical rainforests full of exotic animals'
        },
        animals: ['Jaguar', 'Toucan', 'Poison Dart Frog', 'Sloth', 'Anaconda'],
        color: '#006400'
    },
    {
        id: 'africa',
        name: { nl: 'Afrika', en: 'Africa' },
        biome: 'savannah',
        description: {
            nl: 'Uitgestrekte savanne met iconische wilde dieren',
            en: 'Vast savannah with iconic wildlife'
        },
        animals: ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'Cheetah'],
        color: '#DAA520'
    },
    {
        id: 'australia',
        name: { nl: 'Australië', en: 'Australia' },
        biome: 'desert',
        description: {
            nl: 'Droge outback met unieke buideldieren',
            en: 'Dry outback with unique marsupials'
        },
        animals: ['Kangaroo', 'Koala', 'Platypus', 'Wombat', 'Emu'],
        color: '#CD853F'
    },
    {
        id: 'antarctica',
        name: { nl: 'Antarctica', en: 'Antarctica' },
        biome: 'arctic',
        description: {
            nl: 'IJzige poolgebied met koude-aangepaste dieren',
            en: 'Icy polar region with cold-adapted animals'
        },
        animals: ['Emperor Penguin', 'Leopard Seal', 'Orca', 'Albatross', 'Antarctic Krill'],
        color: '#B0E0E6'
    },
    {
        id: 'oceania',
        name: { nl: 'Oceanië', en: 'Oceania' },
        biome: 'ocean',
        description: {
            nl: 'Prachtige koraalriffen en oceaanleven',
            en: 'Beautiful coral reefs and ocean life'
        },
        animals: ['Clownfish', 'Sea Turtle', 'Manta Ray', 'Dolphin', 'Octopus'],
        color: '#4169E1'
    },
    {
        id: 'asia',
        name: { nl: 'Azië', en: 'Asia' },
        biome: 'bamboo',
        description: {
            nl: 'Mysterieuze bamboebossen en berggebieden',
            en: 'Mysterious bamboo forests and mountain regions'
        },
        animals: ['Giant Panda', 'Red Panda', 'Tiger', 'Snow Leopard', 'Golden Monkey'],
        color: '#6B8E23'
    },
    {
        id: 'north_america',
        name: { nl: 'Noord-Amerika', en: 'North America' },
        biome: 'tundra',
        description: {
            nl: 'Noordelijke wildernis met indrukwekkende roofdieren',
            en: 'Northern wilderness with impressive predators'
        },
        animals: ['Grizzly Bear', 'Moose', 'Bald Eagle', 'Wolf', 'Bison'],
        color: '#2E8B57'
    }
];
/**
 * BiomeManager - Manages all biome instances and provides easy access
 */
export class BiomeManager {
    constructor(width = 2000, height = 800) {
        this.biomes = new Map();
        this.currentBiome = null;
        this.defaultWidth = width;
        this.defaultHeight = height;
        this.initializeBiomes();
    }
    initializeBiomes() {
        this.biomes.set('forest', new ForestBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('jungle', new JungleBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('savannah', new SavannahBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('desert', new DesertBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('arctic', new ArcticBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('ocean', new OceanBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('bamboo', new BambooBiome(this.defaultWidth, this.defaultHeight));
        this.biomes.set('tundra', new TundraBiome(this.defaultWidth, this.defaultHeight));
    }
    /**
     * Get a biome by name
     */
    getBiome(name) {
        return this.biomes.get(name);
    }
    /**
     * Get biome for a specific continent
     */
    getBiomeByContinent(continentId) {
        const continent = CONTINENTS.find(c => c.id === continentId);
        if (continent) {
            return this.biomes.get(continent.biome);
        }
        return undefined;
    }
    /**
     * Set the current active biome
     */
    setCurrentBiome(name) {
        const biome = this.biomes.get(name);
        if (biome) {
            this.currentBiome = biome;
            return true;
        }
        return false;
    }
    /**
     * Set current biome by continent
     */
    setCurrentBiomeByContinent(continentId) {
        const biome = this.getBiomeByContinent(continentId);
        if (biome) {
            this.currentBiome = biome;
            return true;
        }
        return false;
    }
    /**
     * Get the current active biome
     */
    getCurrentBiome() {
        return this.currentBiome;
    }
    /**
     * Generate all biomes (pre-render for better performance)
     */
    generateAllBiomes() {
        this.biomes.forEach(biome => {
            biome.generate();
        });
    }
    /**
     * Render the current biome
     */
    render(ctx, offsetX, offsetY) {
        if (this.currentBiome) {
            this.currentBiome.render(ctx, offsetX, offsetY);
        }
    }
    /**
     * Get all available biome names
     */
    getBiomeNames() {
        return Array.from(this.biomes.keys());
    }
    /**
     * Get all continent information
     */
    getContinents() {
        return CONTINENTS;
    }
    /**
     * Get continent info by ID
     */
    getContinentInfo(continentId) {
        return CONTINENTS.find(c => c.id === continentId);
    }
    /**
     * Get current biome dimensions
     */
    getCurrentBiomeDimensions() {
        if (this.currentBiome) {
            return {
                width: this.currentBiome.getWidth(),
                height: this.currentBiome.getHeight()
            };
        }
        return null;
    }
}
//# sourceMappingURL=index.js.map