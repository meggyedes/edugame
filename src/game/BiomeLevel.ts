// BiomeLevel - Each biome is a separate level with its own animals and evidence
// Player must photograph all evidence before the animal appears

import type { BiomeType, Language } from '../types/index.js';
import { Animal, type AnimalData } from '../entities/Animal.js';
import { Evidence, EVIDENCE_DATABASE, type EvidenceData } from '../entities/Evidence.js';

export interface BiomeLevelData {
    id: string;
    biome: BiomeType;
    name: { nl: string; en: string };
    description: { nl: string; en: string };
    width: number;
    height: number;
    backgroundColor: string;
    animals: string[];  // Animal IDs that live in this biome
    requiredEvidence: number;  // How many evidence photos needed to reveal animal
    unlocked: boolean;
    completed: boolean;
}

export interface AnimalProgress {
    animalId: string;
    evidencePhotographed: string[];  // Evidence types that have been photographed
    animalRevealed: boolean;  // True when all evidence collected
    animalPhotographed: boolean;  // True when animal itself is photographed
}

// Biome level definitions
export const BIOME_LEVELS: BiomeLevelData[] = [
    {
        id: 'beach',
        biome: 'beach',
        name: { nl: 'Strand', en: 'Beach' },
        description: { nl: 'Ontdek de dieren van het strand!', en: 'Discover the animals of the beach!' },
        width: 2000,
        height: 1200,
        backgroundColor: '#F5DEB3',
        animals: ['crab', 'seagull', 'turtle', 'starfish', 'pelican'],
        requiredEvidence: 2,  // Need 2 evidence photos per animal
        unlocked: true,  // First level is always unlocked
        completed: false
    },
    {
        id: 'forest',
        biome: 'forest',
        name: { nl: 'Bos', en: 'Forest' },
        description: { nl: 'Verken het mysterieuze bos!', en: 'Explore the mysterious forest!' },
        width: 2400,
        height: 1400,
        backgroundColor: '#228B22',
        animals: ['deer', 'rabbit', 'owl', 'squirrel', 'hedgehog', 'fox', 'wolf'],
        requiredEvidence: 2,
        unlocked: false,
        completed: false
    },
    {
        id: 'jungle',
        biome: 'jungle',
        name: { nl: 'Jungle', en: 'Jungle' },
        description: { nl: 'Waag je in de wilde jungle!', en: 'Venture into the wild jungle!' },
        width: 2600,
        height: 1600,
        backgroundColor: '#2E8B57',
        animals: ['parrot', 'monkey', 'snake', 'toucan', 'jaguar', 'frog'],
        requiredEvidence: 3,  // Harder - need 3 evidence
        unlocked: false,
        completed: false
    },
    {
        id: 'desert',
        biome: 'desert',
        name: { nl: 'Woestijn', en: 'Desert' },
        description: { nl: 'Overleef de hete woestijn!', en: 'Survive the hot desert!' },
        width: 2400,
        height: 1400,
        backgroundColor: '#EDC9AF',
        animals: ['camel', 'scorpion', 'fox', 'lizard', 'meerkat'],
        requiredEvidence: 3,
        unlocked: false,
        completed: false
    },
    {
        id: 'arctic',
        biome: 'arctic',
        name: { nl: 'Noordpool', en: 'Arctic' },
        description: { nl: 'Trotseer de ijzige kou!', en: 'Brave the icy cold!' },
        width: 2200,
        height: 1300,
        backgroundColor: '#E0FFFF',
        animals: ['penguin', 'polar_bear', 'arctic_fox', 'seal', 'snowy_owl'],
        requiredEvidence: 3,
        unlocked: false,
        completed: false
    }
];

export class BiomeLevel {
    private levelData: BiomeLevelData;
    private animals: Animal[] = [];
    private evidence: Evidence[] = [];
    private animalProgress: Map<string, AnimalProgress> = new Map();
    private decorations: any[] = [];

    constructor(levelData: BiomeLevelData) {
        this.levelData = levelData;
        this.initializeLevel();
    }

    private initializeLevel(): void {
        // Initialize progress for each animal
        this.levelData.animals.forEach(animalId => {
            this.animalProgress.set(animalId, {
                animalId,
                evidencePhotographed: [],
                animalRevealed: false,
                animalPhotographed: false
            });
        });

        // Spawn evidence for each animal (but NOT the animals yet)
        this.spawnEvidence();
        
        // Generate decorations based on biome
        this.generateDecorations();
    }

    private spawnEvidence(): void {
        this.levelData.animals.forEach(animalId => {
            const evidenceList = EVIDENCE_DATABASE[animalId];
            if (!evidenceList) return;

            // Only spawn required number of evidence types
            const selectedEvidence = evidenceList.slice(0, this.levelData.requiredEvidence);
            
            selectedEvidence.forEach((evidenceData, index) => {
                // Spread evidence across the level
                const x = 200 + Math.random() * (this.levelData.width - 400);
                const y = 200 + Math.random() * (this.levelData.height - 400);
                
                const evidence = new Evidence(evidenceData, x, y);
                this.evidence.push(evidence);
            });
        });

        console.log(`Spawned ${this.evidence.length} evidence items in ${this.levelData.id}`);
    }

    private generateDecorations(): void {
        // Generate biome-specific decorations
        const decorationCount = Math.floor((this.levelData.width * this.levelData.height) / 50000);
        
        for (let i = 0; i < decorationCount; i++) {
            this.decorations.push({
                type: this.getRandomDecorationType(),
                x: Math.random() * this.levelData.width,
                y: Math.random() * this.levelData.height,
                size: 0.8 + Math.random() * 0.4,
                variant: Math.floor(Math.random() * 3)
            });
        }
    }

    private getRandomDecorationType(): string {
        const decorationsByBiome: Record<string, string[]> = {
            beach: ['palm', 'umbrella', 'shell', 'rock', 'seaweed'],
            forest: ['tree', 'bush', 'mushroom', 'rock', 'log'],
            jungle: ['palm', 'vine', 'tropical_plant', 'rock', 'fallen_tree'],
            desert: ['cactus', 'rock', 'skull', 'tumbleweed', 'dune'],
            arctic: ['ice_crystal', 'snow_pile', 'ice_rock', 'frozen_tree', 'igloo']
        };

        const types = decorationsByBiome[this.levelData.biome] || ['rock'];
        return types[Math.floor(Math.random() * types.length)];
    }

    // Called when player photographs evidence
    public onEvidencePhotographed(evidence: Evidence): boolean {
        const animalId = evidence.getLinkedAnimal();
        const progress = this.animalProgress.get(animalId);
        
        if (!progress) return false;
        
        // Check if already photographed
        if (progress.evidencePhotographed.includes(evidence.getData().type)) {
            return false;
        }

        // Add to photographed list
        progress.evidencePhotographed.push(evidence.getData().type);
        evidence.collect();

        // Check if all evidence collected → reveal animal
        if (progress.evidencePhotographed.length >= this.levelData.requiredEvidence) {
            progress.animalRevealed = true;
            this.spawnAnimal(animalId);
            return true;  // Animal revealed!
        }

        return false;
    }

    private spawnAnimal(animalId: string): void {
        // Get animal data from the database
        const animalData = this.getAnimalData(animalId);
        if (!animalData) return;

        // Spawn at random location in the level
        const x = 300 + Math.random() * (this.levelData.width - 600);
        const y = 300 + Math.random() * (this.levelData.height - 600);
        
        const animal = new Animal(animalData, x, y);
        this.animals.push(animal);
        
        console.log(`Animal ${animalId} revealed and spawned!`);
    }

    // Get animal data - this should match the data in World.ts
    private getAnimalData(animalId: string): AnimalData | null {
        const allAnimals: Record<string, AnimalData> = {
            // Beach
            crab: { id: 'crab', name: { nl: 'Krab', en: 'Crab' }, description: { nl: 'Een kleine strandkrab', en: 'A small beach crab' }, biome: 'beach', points: 10, color: '#FF6347',
                facts: { nl: ['Krabben kunnen zijwaarts lopen!', 'Krabben hebben 10 poten.'], en: ['Crabs can walk sideways!', 'Crabs have 10 legs.'] } },
            seagull: { id: 'seagull', name: { nl: 'Zeemeeuw', en: 'Seagull' }, description: { nl: 'Een luidruchtige zeemeeuw', en: 'A noisy seagull' }, biome: 'beach', points: 15, color: '#FFFFFF',
                facts: { nl: ['Zeemeeuwen kunnen zeewater drinken!'], en: ['Seagulls can drink seawater!'] } },
            turtle: { id: 'turtle', name: { nl: 'Schildpad', en: 'Turtle' }, description: { nl: 'Een zeeschildpad', en: 'A sea turtle' }, biome: 'beach', points: 25, color: '#2E8B57',
                facts: { nl: ['Schildpadden kunnen meer dan 100 jaar oud worden!'], en: ['Turtles can live over 100 years!'] } },
            starfish: { id: 'starfish', name: { nl: 'Zeester', en: 'Starfish' }, description: { nl: 'Een kleurrijke zeester', en: 'A colorful starfish' }, biome: 'beach', points: 15, color: '#FF6B6B',
                facts: { nl: ['Zeesterren hebben geen hersenen!'], en: ['Starfish have no brains!'] } },
            pelican: { id: 'pelican', name: { nl: 'Pelikaan', en: 'Pelican' }, description: { nl: 'Een grote pelikaan', en: 'A large pelican' }, biome: 'beach', points: 20, color: '#F5F5DC',
                facts: { nl: ['De keelzak van een pelikaan kan 11 liter bevatten!'], en: ['A pelican\'s pouch can hold 11 liters!'] } },
            
            // Forest
            deer: { id: 'deer', name: { nl: 'Hert', en: 'Deer' }, description: { nl: 'Een bosshert', en: 'A forest deer' }, biome: 'forest', points: 20, color: '#CD853F',
                facts: { nl: ['Herten verliezen elk jaar hun gewei!'], en: ['Deer lose their antlers every year!'] } },
            rabbit: { id: 'rabbit', name: { nl: 'Konijn', en: 'Rabbit' }, description: { nl: 'Een wild konijn', en: 'A wild rabbit' }, biome: 'forest', points: 10, color: '#A0522D',
                facts: { nl: ['Konijnen kunnen 360 graden zien!'], en: ['Rabbits can see 360 degrees!'] } },
            owl: { id: 'owl', name: { nl: 'Uil', en: 'Owl' }, description: { nl: 'Een wijze bosuil', en: 'A wise forest owl' }, biome: 'forest', points: 25, color: '#8B8682',
                facts: { nl: ['Uilen kunnen hun hoofd 270 graden draaien!'], en: ['Owls can rotate their heads 270 degrees!'] } },
            squirrel: { id: 'squirrel', name: { nl: 'Eekhoorn', en: 'Squirrel' }, description: { nl: 'Een rode eekhoorn', en: 'A red squirrel' }, biome: 'forest', points: 15, color: '#D2691E',
                facts: { nl: ['Eekhoorns planten duizenden bomen!'], en: ['Squirrels plant thousands of trees!'] } },
            hedgehog: { id: 'hedgehog', name: { nl: 'Egel', en: 'Hedgehog' }, description: { nl: 'Een stekelige egel', en: 'A spiky hedgehog' }, biome: 'forest', points: 15, color: '#8B4513',
                facts: { nl: ['Egels hebben 5000 tot 7000 stekels!'], en: ['Hedgehogs have 5000 to 7000 spines!'] } },
            fox: { id: 'fox', name: { nl: 'Vos', en: 'Fox' }, description: { nl: 'Een slimme vos', en: 'A clever fox' }, biome: 'forest', points: 25, color: '#FF6600',
                facts: { nl: ['Vossen kunnen geluiden van 40 meter horen!'], en: ['Foxes can hear sounds from 40 meters!'] } },
            wolf: { id: 'wolf', name: { nl: 'Wolf', en: 'Wolf' }, description: { nl: 'Een grijze wolf', en: 'A gray wolf' }, biome: 'forest', points: 35, color: '#696969',
                facts: { nl: ['Wolven huilen om te communiceren!'], en: ['Wolves howl to communicate!'] } },
            
            // Jungle
            parrot: { id: 'parrot', name: { nl: 'Papegaai', en: 'Parrot' }, description: { nl: 'Een kleurrijke papegaai', en: 'A colorful parrot' }, biome: 'jungle', points: 20, color: '#FF4500',
                facts: { nl: ['Papegaaien kunnen menselijke spraak nadoen!'], en: ['Parrots can mimic human speech!'] } },
            monkey: { id: 'monkey', name: { nl: 'Aap', en: 'Monkey' }, description: { nl: 'Een speelse aap', en: 'A playful monkey' }, biome: 'jungle', points: 20, color: '#8B4513',
                facts: { nl: ['Apen gebruiken gereedschap!'], en: ['Monkeys use tools!'] } },
            snake: { id: 'snake', name: { nl: 'Slang', en: 'Snake' }, description: { nl: 'Een groene boomslang', en: 'A green tree snake' }, biome: 'jungle', points: 30, color: '#32CD32',
                facts: { nl: ['Slangen ruiken met hun tong!'], en: ['Snakes smell with their tongue!'] } },
            toucan: { id: 'toucan', name: { nl: 'Toekan', en: 'Toucan' }, description: { nl: 'Een toekan met grote snavel', en: 'A toucan with a large beak' }, biome: 'jungle', points: 25, color: '#FF8C00',
                facts: { nl: ['De snavel van een toekan is heel licht!'], en: ['A toucan\'s beak is very light!'] } },
            jaguar: { id: 'jaguar', name: { nl: 'Jaguar', en: 'Jaguar' }, description: { nl: 'Een krachtige jaguar', en: 'A powerful jaguar' }, biome: 'jungle', points: 40, color: '#DAA520',
                facts: { nl: ['Jaguars zijn uitstekende zwemmers!'], en: ['Jaguars are excellent swimmers!'] } },
            frog: { id: 'frog', name: { nl: 'Kikker', en: 'Frog' }, description: { nl: 'Een giftige pijlgifkikker', en: 'A poison dart frog' }, biome: 'jungle', points: 20, color: '#00CED1',
                facts: { nl: ['Sommige kikkers zijn extreem giftig!'], en: ['Some frogs are extremely poisonous!'] } },
            
            // Desert
            camel: { id: 'camel', name: { nl: 'Kameel', en: 'Camel' }, description: { nl: 'Een woestijnkameel', en: 'A desert camel' }, biome: 'desert', points: 25, color: '#D2B48C',
                facts: { nl: ['Kamelen kunnen weken zonder water!'], en: ['Camels can go weeks without water!'] } },
            scorpion: { id: 'scorpion', name: { nl: 'Schorpioen', en: 'Scorpion' }, description: { nl: 'Een woestijnschorpioen', en: 'A desert scorpion' }, biome: 'desert', points: 20, color: '#8B0000',
                facts: { nl: ['Schorpioenen gloeien onder UV-licht!'], en: ['Scorpions glow under UV light!'] } },
            lizard: { id: 'lizard', name: { nl: 'Hagedis', en: 'Lizard' }, description: { nl: 'Een woestijnhagedis', en: 'A desert lizard' }, biome: 'desert', points: 15, color: '#CD853F',
                facts: { nl: ['Sommige hagedissen kunnen hun staart afwerpen!'], en: ['Some lizards can detach their tails!'] } },
            meerkat: { id: 'meerkat', name: { nl: 'Stokstaartje', en: 'Meerkat' }, description: { nl: 'Een waakzaam stokstaartje', en: 'An alert meerkat' }, biome: 'desert', points: 20, color: '#C4A484',
                facts: { nl: ['Stokstaartjes leven in groepen tot 50!'], en: ['Meerkats live in groups of up to 50!'] } },
            
            // Arctic
            penguin: { id: 'penguin', name: { nl: 'Pinguïn', en: 'Penguin' }, description: { nl: 'Een schattige pinguïn', en: 'A cute penguin' }, biome: 'arctic', points: 25, color: '#000000',
                facts: { nl: ['Pinguïns kunnen niet vliegen maar wel zwemmen!'], en: ['Penguins cannot fly but can swim!'] } },
            polar_bear: { id: 'polar_bear', name: { nl: 'IJsbeer', en: 'Polar Bear' }, description: { nl: 'Een grote ijsbeer', en: 'A large polar bear' }, biome: 'arctic', points: 40, color: '#FFFAFA',
                facts: { nl: ['IJsberen hebben eigenlijk zwarte huid!'], en: ['Polar bears actually have black skin!'] } },
            arctic_fox: { id: 'arctic_fox', name: { nl: 'Poolvos', en: 'Arctic Fox' }, description: { nl: 'Een witte poolvos', en: 'A white arctic fox' }, biome: 'arctic', points: 30, color: '#F0F8FF',
                facts: { nl: ['Poolvossen veranderen van kleur!'], en: ['Arctic foxes change color!'] } },
            seal: { id: 'seal', name: { nl: 'Zeehond', en: 'Seal' }, description: { nl: 'Een grijze zeehond', en: 'A gray seal' }, biome: 'arctic', points: 25, color: '#708090',
                facts: { nl: ['Zeehonden kunnen 2 uur onder water!'], en: ['Seals can stay underwater for 2 hours!'] } },
            snowy_owl: { id: 'snowy_owl', name: { nl: 'Sneeuwuil', en: 'Snowy Owl' }, description: { nl: 'Een witte sneeuwuil', en: 'A white snowy owl' }, biome: 'arctic', points: 30, color: '#FFFAFA',
                facts: { nl: ['Sneeuwuilen jagen overdag!'], en: ['Snowy owls hunt during the day!'] } }
        };

        return allAnimals[animalId] || null;
    }

    // Called when player photographs an animal
    public onAnimalPhotographed(animal: Animal): boolean {
        const animalId = animal.getId();
        const progress = this.animalProgress.get(animalId);
        
        if (!progress || !progress.animalRevealed) return false;
        
        progress.animalPhotographed = true;
        return true;
    }

    // Check if level is complete (all animals photographed)
    public isLevelComplete(): boolean {
        for (const progress of this.animalProgress.values()) {
            if (!progress.animalPhotographed) return false;
        }
        return true;
    }

    // Get completion percentage
    public getCompletionPercentage(): number {
        let total = 0;
        let completed = 0;

        for (const progress of this.animalProgress.values()) {
            // Evidence progress
            total += this.levelData.requiredEvidence;
            completed += progress.evidencePhotographed.length;
            
            // Animal photo
            total += 1;
            if (progress.animalPhotographed) completed += 1;
        }

        return Math.round((completed / total) * 100);
    }

    // Getters
    public getLevelData(): BiomeLevelData { return this.levelData; }
    public getAnimals(): Animal[] { return this.animals; }
    public getEvidence(): Evidence[] { return this.evidence; }
    public getDecorations(): any[] { return this.decorations; }
    public getAnimalProgress(animalId: string): AnimalProgress | undefined { return this.animalProgress.get(animalId); }
    public getAllProgress(): Map<string, AnimalProgress> { return this.animalProgress; }
    public getWidth(): number { return this.levelData.width; }
    public getHeight(): number { return this.levelData.height; }
    public getBiomeType(): string { return this.levelData.biome; }

    // Get evidence markers for rendering (simplified format)
    public getEvidenceMarkers(): { type: string; x: number; y: number; photographed: boolean; animalId: string }[] {
        return this.evidence.map(ev => ({
            type: ev.getData().type,
            x: ev.getPosition().x,
            y: ev.getPosition().y,
            photographed: ev.isCollected(),
            animalId: ev.getLinkedAnimal()
        }));
    }

    // Get revealed animals for rendering
    public getRevealedAnimals(): { id: string; name: string; x: number; y: number; photographed: boolean; revealed: boolean }[] {
        const revealed: { id: string; name: string; x: number; y: number; photographed: boolean; revealed: boolean }[] = [];
        
        for (const animal of this.animals) {
            const progress = this.animalProgress.get(animal.getId());
            if (progress && progress.animalRevealed) {
                const pos = animal.getPosition();
                revealed.push({
                    id: animal.getId(),
                    name: animal.getName('en'),
                    x: pos.x,
                    y: pos.y,
                    photographed: progress.animalPhotographed,
                    revealed: true
                });
            }
        }
        
        return revealed;
    }

    // Get progress summary
    public getProgress(): { evidenceCollected: number; totalEvidence: number; animalsRevealed: number; animalsPhotographed: number; totalAnimals: number } {
        let evidenceCollected = 0;
        let animalsRevealed = 0;
        let animalsPhotographed = 0;

        for (const progress of this.animalProgress.values()) {
            evidenceCollected += progress.evidencePhotographed.length;
            if (progress.animalRevealed) animalsRevealed++;
            if (progress.animalPhotographed) animalsPhotographed++;
        }

        return {
            evidenceCollected,
            totalEvidence: this.levelData.animals.length * this.levelData.requiredEvidence,
            animalsRevealed,
            animalsPhotographed,
            totalAnimals: this.levelData.animals.length
        };
    }

    public update(deltaTime: number): void {
        // Update animals
        this.animals.forEach(animal => animal.update(deltaTime));
        
        // Update evidence
        this.evidence.forEach(ev => ev.update(deltaTime));
    }
}
