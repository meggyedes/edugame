// LevelManager - Loads and manages individual mini-levels within zones

import type { BiomeType, Position } from '../types/index.js';
import { ZoneManager, type MiniLevel, type Zone, type AnimalSpawn, type Interaction, type PanoramaPoint } from './ZoneManager.js';
import { Animal, type AnimalData } from '../entities/Animal.js';
import { I18n } from '../i18n/translations.js';

// Animal data for spawning in levels
const ANIMAL_DATABASE: Record<string, Omit<AnimalData, 'id'>> = {
    // Beach/Ocean animals
    crab: { name: { nl: 'Krab', en: 'Crab' }, description: { nl: 'Een kleine strandkrab', en: 'A small beach crab' }, biome: 'beach', points: 10, color: '#FF6347', facts: { nl: ['Krabben kunnen zijwaarts lopen!'], en: ['Crabs can walk sideways!'] } },
    seagull: { name: { nl: 'Zeemeeuw', en: 'Seagull' }, description: { nl: 'Een luidruchtige zeemeeuw', en: 'A noisy seagull' }, biome: 'beach', points: 15, color: '#FFFFFF', facts: { nl: ['Zeemeeuwen kunnen zeewater drinken!'], en: ['Seagulls can drink seawater!'] } },
    turtle: { name: { nl: 'Schildpad', en: 'Turtle' }, description: { nl: 'Een zeeschildpad', en: 'A sea turtle' }, biome: 'beach', points: 25, color: '#2E8B57', facts: { nl: ['Schildpadden kunnen meer dan 100 jaar oud worden!'], en: ['Turtles can live over 100 years!'] } },
    starfish: { name: { nl: 'Zeester', en: 'Starfish' }, description: { nl: 'Een kleurrijke zeester', en: 'A colorful starfish' }, biome: 'beach', points: 15, color: '#FF6B6B', facts: { nl: ['Zeesterren hebben geen hersenen!'], en: ['Starfish have no brains!'] } },
    pelican: { name: { nl: 'Pelikaan', en: 'Pelican' }, description: { nl: 'Een grote pelikaan', en: 'A large pelican' }, biome: 'beach', points: 20, color: '#F5F5DC', facts: { nl: ['Een pelikaan kan 11 liter water in zijn snavel houden!'], en: ['A pelican can hold 11 liters of water in its beak!'] } },
    dolphin: { name: { nl: 'Dolfijn', en: 'Dolphin' }, description: { nl: 'Een speelse dolfijn', en: 'A playful dolphin' }, biome: 'beach', points: 30, color: '#708090', facts: { nl: ['Dolfijnen slapen met één oog open!'], en: ['Dolphins sleep with one eye open!'] } },
    whale: { name: { nl: 'Walvis', en: 'Whale' }, description: { nl: 'Een majestueuze walvis', en: 'A majestic whale' }, biome: 'beach', points: 50, color: '#4682B4', facts: { nl: ['Een blauwe walvis is het grootste dier ooit!'], en: ['A blue whale is the largest animal ever!'] } },
    orca: { name: { nl: 'Orka', en: 'Orca' }, description: { nl: 'Een machtige orka', en: 'A mighty orca' }, biome: 'beach', points: 45, color: '#000000', facts: { nl: ['Orkas leven in familiegroepen!'], en: ['Orcas live in family groups!'] } },

    // Jungle animals
    parrot: { name: { nl: 'Papegaai', en: 'Parrot' }, description: { nl: 'Een kleurrijke papegaai', en: 'A colorful parrot' }, biome: 'jungle', points: 20, color: '#FF4500', facts: { nl: ['Papegaaien kunnen menselijke spraak nadoen!'], en: ['Parrots can mimic human speech!'] } },
    monkey: { name: { nl: 'Aap', en: 'Monkey' }, description: { nl: 'Een speelse aap', en: 'A playful monkey' }, biome: 'jungle', points: 20, color: '#8B4513', facts: { nl: ['Apen gebruiken gereedschap!'], en: ['Monkeys use tools!'] } },
    snake: { name: { nl: 'Slang', en: 'Snake' }, description: { nl: 'Een groene boomslang', en: 'A green tree snake' }, biome: 'jungle', points: 30, color: '#32CD32', facts: { nl: ['Slangen ruiken met hun tong!'], en: ['Snakes smell with their tongue!'] } },
    toucan: { name: { nl: 'Toekan', en: 'Toucan' }, description: { nl: 'Een toekan met grote snavel', en: 'A toucan with a large beak' }, biome: 'jungle', points: 25, color: '#FF8C00', facts: { nl: ['De snavel van een toekan is heel licht!'], en: ['A toucan\'s beak is very light!'] } },
    jaguar: { name: { nl: 'Jaguar', en: 'Jaguar' }, description: { nl: 'Een krachtige jaguar', en: 'A powerful jaguar' }, biome: 'jungle', points: 50, color: '#DAA520', facts: { nl: ['Jaguars kunnen door schilden van schildpadden bijten!'], en: ['Jaguars can bite through turtle shells!'] } },
    frog: { name: { nl: 'Kikker', en: 'Frog' }, description: { nl: 'Een giftige pijlgifkikker', en: 'A poison dart frog' }, biome: 'jungle', points: 20, color: '#00CED1', facts: { nl: ['Sommige kikkers zijn zo giftig dat ze een mens kunnen doden!'], en: ['Some frogs are so poisonous they could kill a human!'] } },
    sloth: { name: { nl: 'Luiaard', en: 'Sloth' }, description: { nl: 'Een langzame luiaard', en: 'A slow sloth' }, biome: 'jungle', points: 35, color: '#8B7355', facts: { nl: ['Luiaards slapen tot 20 uur per dag!'], en: ['Sloths sleep up to 20 hours a day!'] } },

    // Desert animals
    camel: { name: { nl: 'Kameel', en: 'Camel' }, description: { nl: 'Een woestijnkameel', en: 'A desert camel' }, biome: 'desert', points: 25, color: '#D2B48C', facts: { nl: ['Kamelen kunnen weken zonder water!'], en: ['Camels can go weeks without water!'] } },
    scorpion: { name: { nl: 'Schorpioen', en: 'Scorpion' }, description: { nl: 'Een woestijnschorpioen', en: 'A desert scorpion' }, biome: 'desert', points: 20, color: '#8B0000', facts: { nl: ['Schorpioenen gloeien onder UV-licht!'], en: ['Scorpions glow under UV light!'] } },
    fox: { name: { nl: 'Fennek', en: 'Fennec Fox' }, description: { nl: 'Een woestijnvos met grote oren', en: 'A desert fox with big ears' }, biome: 'desert', points: 35, color: '#FFF8DC', facts: { nl: ['Fenneks hebben grote oren om warmte af te voeren!'], en: ['Fennec foxes have big ears to release heat!'] } },
    lizard: { name: { nl: 'Hagedis', en: 'Lizard' }, description: { nl: 'Een woestijnhagedis', en: 'A desert lizard' }, biome: 'desert', points: 15, color: '#CD853F', facts: { nl: ['Sommige hagedissen kunnen hun staart afwerpen!'], en: ['Some lizards can detach their tails!'] } },
    meerkat: { name: { nl: 'Stokstaartje', en: 'Meerkat' }, description: { nl: 'Een waakzaam stokstaartje', en: 'An alert meerkat' }, biome: 'desert', points: 20, color: '#C4A484', facts: { nl: ['Stokstaartjes leven in groepen tot 50 dieren!'], en: ['Meerkats live in groups of up to 50!'] } },
    vulture: { name: { nl: 'Gier', en: 'Vulture' }, description: { nl: 'Een gier die rondcirkelt', en: 'A circling vulture' }, biome: 'desert', points: 25, color: '#4A4A4A', facts: { nl: ['Gieren kunnen een kadaver kilometers ver ruiken!'], en: ['Vultures can smell a carcass from miles away!'] } },

    // Arctic animals
    penguin: { name: { nl: 'Pinguïn', en: 'Penguin' }, description: { nl: 'Een schattige pinguïn', en: 'A cute penguin' }, biome: 'tundra', points: 25, color: '#000000', facts: { nl: ['Pinguïns kunnen niet vliegen maar wel zwemmen!'], en: ['Penguins cannot fly but can swim!'] } },
    polar_bear: { name: { nl: 'IJsbeer', en: 'Polar Bear' }, description: { nl: 'Een grote ijsbeer', en: 'A large polar bear' }, biome: 'tundra', points: 50, color: '#FFFAFA', facts: { nl: ['IJsberen hebben eigenlijk zwarte huid!'], en: ['Polar bears actually have black skin!'] } },
    arctic_fox: { name: { nl: 'Poolvos', en: 'Arctic Fox' }, description: { nl: 'Een witte poolvos', en: 'A white arctic fox' }, biome: 'tundra', points: 30, color: '#F0F8FF', facts: { nl: ['Poolvossen veranderen van kleur met de seizoenen!'], en: ['Arctic foxes change color with the seasons!'] } },
    seal: { name: { nl: 'Zeehond', en: 'Seal' }, description: { nl: 'Een grijze zeehond', en: 'A gray seal' }, biome: 'tundra', points: 25, color: '#708090', facts: { nl: ['Zeehonden kunnen 2 uur onder water blijven!'], en: ['Seals can stay underwater for 2 hours!'] } },
    snowy_owl: { name: { nl: 'Sneeuwuil', en: 'Snowy Owl' }, description: { nl: 'Een witte sneeuwuil', en: 'A white snowy owl' }, biome: 'tundra', points: 30, color: '#FFFAFA', facts: { nl: ['Sneeuwuilen jagen overdag!'], en: ['Snowy owls hunt during the day!'] } },
    puffin: { name: { nl: 'Papegaaiduiker', en: 'Puffin' }, description: { nl: 'Een kleurrijke papegaaiduiker', en: 'A colorful puffin' }, biome: 'tundra', points: 30, color: '#000000', facts: { nl: ['Papegaaiduikers kunnen tot 60 visjes tegelijk vangen!'], en: ['Puffins can catch up to 60 fish at once!'] } },

    // Savannah animals
    lion: { name: { nl: 'Leeuw', en: 'Lion' }, description: { nl: 'De koning van de savanne', en: 'The king of the savannah' }, biome: 'forest', points: 45, color: '#DAA520', facts: { nl: ['Leeuwen slapen tot 20 uur per dag!'], en: ['Lions sleep up to 20 hours a day!'] } },
    elephant: { name: { nl: 'Olifant', en: 'Elephant' }, description: { nl: 'Een grote Afrikaanse olifant', en: 'A large African elephant' }, biome: 'forest', points: 40, color: '#808080', facts: { nl: ['Olifanten kunnen zichzelf herkennen in een spiegel!'], en: ['Elephants can recognize themselves in a mirror!'] } },
    giraffe: { name: { nl: 'Giraffe', en: 'Giraffe' }, description: { nl: 'De langste dier ter wereld', en: 'The tallest animal in the world' }, biome: 'forest', points: 35, color: '#DAA520', facts: { nl: ['Giraffen slapen maar 30 minuten per dag!'], en: ['Giraffes only sleep 30 minutes a day!'] } },
    zebra: { name: { nl: 'Zebra', en: 'Zebra' }, description: { nl: 'Een gestreepte zebra', en: 'A striped zebra' }, biome: 'forest', points: 25, color: '#FFFFFF', facts: { nl: ['Elke zebra heeft unieke strepen!'], en: ['Every zebra has unique stripes!'] } },
    hippo: { name: { nl: 'Nijlpaard', en: 'Hippo' }, description: { nl: 'Een groot nijlpaard', en: 'A large hippo' }, biome: 'forest', points: 35, color: '#808080', facts: { nl: ['Nijlpaarden kunnen niet echt zwemmen!'], en: ['Hippos cannot actually swim!'] } },
    rhino: { name: { nl: 'Neushoorn', en: 'Rhino' }, description: { nl: 'Een machtige neushoorn', en: 'A mighty rhino' }, biome: 'forest', points: 40, color: '#696969', facts: { nl: ['Neushoorns hebben een slecht zicht!'], en: ['Rhinos have poor eyesight!'] } },
    cheetah: { name: { nl: 'Cheeta', en: 'Cheetah' }, description: { nl: 'Het snelste landdier', en: 'The fastest land animal' }, biome: 'forest', points: 45, color: '#DAA520', facts: { nl: ['Cheetas kunnen 120 km/u rennen!'], en: ['Cheetahs can run 120 km/h!'] } },
    hyena: { name: { nl: 'Hyena', en: 'Hyena' }, description: { nl: 'Een lachende hyena', en: 'A laughing hyena' }, biome: 'forest', points: 25, color: '#8B7355', facts: { nl: ['Hyenas hebben de sterkste kaak!'], en: ['Hyenas have the strongest jaws!'] } },
    flamingo: { name: { nl: 'Flamingo', en: 'Flamingo' }, description: { nl: 'Een roze flamingo', en: 'A pink flamingo' }, biome: 'forest', points: 25, color: '#FF69B4', facts: { nl: ['Flamingos zijn roze door hun eten!'], en: ['Flamingos are pink because of their food!'] } },
};

// Interactive object for puzzles
export interface InteractiveObject {
    id: string;
    type: Interaction['type'];
    x: number;
    y: number;
    width: number;
    height: number;
    isActive: boolean;
    isCompleted: boolean;
    targetId?: string;
    animationTimer: number;
    state: 'idle' | 'activating' | 'active' | 'completed';
}

// Level state during gameplay
export interface LevelState {
    level: MiniLevel;
    zone: Zone;
    animals: Animal[];
    interactives: InteractiveObject[];
    panoramaPoints: PanoramaPoint[];
    photosToken: number;
    rarePhotosToken: number;
    startTime: number;
    isCompleted: boolean;
    objectives: LevelObjective[];
}

export interface LevelObjective {
    id: string;
    description: { nl: string; en: string };
    type: 'photos' | 'rare_photo' | 'panorama' | 'interaction';
    target: number;
    current: number;
    completed: boolean;
}

export class LevelManager {
    private static instance: LevelManager;
    private zoneManager: ZoneManager;
    private i18n: I18n;
    private currentState: LevelState | null = null;

    private constructor() {
        this.zoneManager = ZoneManager.getInstance();
        this.i18n = I18n.getInstance();
    }

    public static getInstance(): LevelManager {
        if (!LevelManager.instance) {
            LevelManager.instance = new LevelManager();
        }
        return LevelManager.instance;
    }

    // Load a level and create all game objects
    public loadLevel(zoneId: string, levelId: string): LevelState | null {
        const zone = this.zoneManager.getZone(zoneId);
        if (!zone) return null;

        const level = zone.levels.find(l => l.id === levelId);
        if (!level) return null;

        // Create animals from spawns
        const animals = this.createAnimals(level);

        // Create interactive objects
        const interactives = this.createInteractives(level);

        // Create objectives
        const objectives = this.createObjectives(level);

        // Create state
        this.currentState = {
            level,
            zone,
            animals,
            interactives,
            panoramaPoints: [...level.panoramaPoints],
            photosToken: 0,
            rarePhotosToken: 0,
            startTime: Date.now(),
            isCompleted: false,
            objectives
        };

        return this.currentState;
    }

    private createAnimals(level: MiniLevel): Animal[] {
        const animals: Animal[] = [];

        level.animals.forEach(spawn => {
            const animalData = ANIMAL_DATABASE[spawn.id];
            if (!animalData) {
                console.warn(`Unknown animal: ${spawn.id}`);
                return;
            }

            // Convert percentage position to actual coordinates
            const x = (spawn.x / 100) * level.width;
            const y = (spawn.y / 100) * level.height;

            const fullData: AnimalData = {
                id: spawn.id,
                ...animalData
            };

            const animal = new Animal(fullData, x, y);
            
            // Mark as rare if specified
            if (spawn.isRare) {
                (animal as any).isRare = true;
            }

            animals.push(animal);
        });

        return animals;
    }

    private createInteractives(level: MiniLevel): InteractiveObject[] {
        return level.interactions.map((interaction, index) => ({
            id: `interactive_${index}`,
            type: interaction.type,
            x: interaction.x,
            y: interaction.y,
            width: interaction.width,
            height: interaction.height,
            isActive: false,
            isCompleted: interaction.completed,
            targetId: interaction.targetId,
            animationTimer: 0,
            state: interaction.completed ? 'completed' : 'idle'
        }));
    }

    private createObjectives(level: MiniLevel): LevelObjective[] {
        const objectives: LevelObjective[] = [];

        // Main photo objective
        objectives.push({
            id: 'photos',
            description: { 
                nl: `Maak ${level.requiredPhotos} foto's`, 
                en: `Take ${level.requiredPhotos} photos` 
            },
            type: 'photos',
            target: level.requiredPhotos,
            current: 0,
            completed: false
        });

        // Rare animal objective
        const rareCount = level.animals.filter(a => a.isRare).length;
        if (rareCount > 0) {
            objectives.push({
                id: 'rare',
                description: { 
                    nl: 'Vind het zeldzame dier', 
                    en: 'Find the rare animal' 
                },
                type: 'rare_photo',
                target: 1,
                current: 0,
                completed: false
            });
        }

        // Panorama objective
        if (level.panoramaPoints.length > 0) {
            objectives.push({
                id: 'panorama',
                description: { 
                    nl: 'Ontdek het panoramapunt', 
                    en: 'Discover the panorama point' 
                },
                type: 'panorama',
                target: 1,
                current: 0,
                completed: false
            });
        }

        // Interaction objective (if any non-completed interactions)
        const hasInteractions = level.interactions.some(i => !i.completed);
        if (hasInteractions) {
            objectives.push({
                id: 'puzzle',
                description: { 
                    nl: 'Los de puzzel op', 
                    en: 'Solve the puzzle' 
                },
                type: 'interaction',
                target: 1,
                current: 0,
                completed: false
            });
        }

        return objectives;
    }

    public getCurrentState(): LevelState | null {
        return this.currentState;
    }

    public getAnimals(): Animal[] {
        return this.currentState?.animals || [];
    }

    public getInteractives(): InteractiveObject[] {
        return this.currentState?.interactives || [];
    }

    public getPanoramaPoints(): PanoramaPoint[] {
        return this.currentState?.panoramaPoints || [];
    }

    public getLevelWidth(): number {
        return this.currentState?.level.width || 1600;
    }

    public getLevelHeight(): number {
        return this.currentState?.level.height || 1200;
    }

    public getPlayerStart(): Position {
        if (!this.currentState) return { x: 100, y: 100 };
        return {
            x: this.currentState.level.startX,
            y: this.currentState.level.startY
        };
    }

    // Record a photo taken
    public recordPhoto(animalId: string, isRare: boolean): void {
        if (!this.currentState) return;

        this.currentState.photosToken++;
        if (isRare) {
            this.currentState.rarePhotosToken++;
        }

        // Update objectives
        const photoObj = this.currentState.objectives.find(o => o.type === 'photos');
        if (photoObj) {
            photoObj.current++;
            if (photoObj.current >= photoObj.target) {
                photoObj.completed = true;
            }
        }

        if (isRare) {
            const rareObj = this.currentState.objectives.find(o => o.type === 'rare_photo');
            if (rareObj) {
                rareObj.current++;
                rareObj.completed = true;
            }
        }

        this.checkLevelComplete();
    }

    // Record panorama discovery
    public recordPanorama(pointIndex: number): number {
        if (!this.currentState) return 0;

        const point = this.currentState.panoramaPoints[pointIndex];
        if (!point || point.discovered) return 0;

        point.discovered = true;

        const panoramaObj = this.currentState.objectives.find(o => o.type === 'panorama');
        if (panoramaObj) {
            panoramaObj.current++;
            panoramaObj.completed = true;
        }

        this.checkLevelComplete();
        return point.bonusXP;
    }

    // Check if player is in a panorama point
    public checkPanoramaPoint(playerX: number, playerY: number): { index: number; point: PanoramaPoint } | null {
        if (!this.currentState) return null;

        for (let i = 0; i < this.currentState.panoramaPoints.length; i++) {
            const point = this.currentState.panoramaPoints[i]!;
            if (point.discovered) continue;

            const dist = Math.sqrt(
                Math.pow(playerX - point.x, 2) + 
                Math.pow(playerY - point.y, 2)
            );

            if (dist < point.radius) {
                return { index: i, point };
            }
        }

        return null;
    }

    // Interact with an object
    public interact(objectId: string): InteractiveObject | null {
        if (!this.currentState) return null;

        const obj = this.currentState.interactives.find(i => i.id === objectId);
        if (!obj || obj.isCompleted) return null;

        obj.state = 'activating';
        obj.isActive = true;

        // Handle different interaction types
        switch (obj.type) {
            case 'button':
                // Find target and activate it
                if (obj.targetId) {
                    const target = this.currentState.interactives.find(
                        i => i.type === 'gate' || i.id === obj.targetId
                    );
                    if (target) {
                        target.state = 'active';
                        target.isActive = true;
                        setTimeout(() => {
                            target.state = 'completed';
                            target.isCompleted = true;
                        }, 500);
                    }
                }
                obj.state = 'completed';
                obj.isCompleted = true;
                break;

            case 'push_rock':
            case 'bridge':
            case 'boat':
                setTimeout(() => {
                    obj.state = 'completed';
                    obj.isCompleted = true;
                }, 1000);
                break;

            case 'gate':
                // Gates are opened by buttons
                break;

            case 'footprints':
                obj.state = 'active';
                setTimeout(() => {
                    obj.state = 'completed';
                    obj.isCompleted = true;
                }, 2000);
                break;
        }

        // Check if all interactions completed
        const allDone = this.currentState.interactives.every(i => i.isCompleted || i.type === 'gate');
        if (allDone) {
            const puzzleObj = this.currentState.objectives.find(o => o.type === 'interaction');
            if (puzzleObj) {
                puzzleObj.current = 1;
                puzzleObj.completed = true;
            }
        }

        this.checkLevelComplete();
        return obj;
    }

    // Find interactive near player
    public findNearbyInteractive(playerX: number, playerY: number, range: number = 60): InteractiveObject | null {
        if (!this.currentState) return null;

        for (const obj of this.currentState.interactives) {
            if (obj.isCompleted && obj.type !== 'boat') continue;

            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            const dist = Math.sqrt(Math.pow(playerX - centerX, 2) + Math.pow(playerY - centerY, 2));

            if (dist < range) {
                return obj;
            }
        }

        return null;
    }

    // Update interactives animation
    public update(deltaTime: number): void {
        if (!this.currentState) return;

        for (const obj of this.currentState.interactives) {
            obj.animationTimer += deltaTime;
        }
    }

    private checkLevelComplete(): void {
        if (!this.currentState) return;

        // Level is complete when required photos are taken
        const photoObj = this.currentState.objectives.find(o => o.type === 'photos');
        if (photoObj && photoObj.completed) {
            this.currentState.isCompleted = true;
            this.zoneManager.completeLevel(this.currentState.level.id);
        }
    }

    public isLevelComplete(): boolean {
        return this.currentState?.isCompleted || false;
    }

    public getObjectives(): LevelObjective[] {
        return this.currentState?.objectives || [];
    }

    public getCompletionPercentage(): number {
        if (!this.currentState) return 0;
        
        const completed = this.currentState.objectives.filter(o => o.completed).length;
        const total = this.currentState.objectives.length;
        
        return Math.round((completed / total) * 100);
    }

    public getPlayTime(): number {
        if (!this.currentState) return 0;
        return Math.floor((Date.now() - this.currentState.startTime) / 1000);
    }

    public unloadLevel(): void {
        this.currentState = null;
    }
}
