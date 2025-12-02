// World class managing the game map and biomes

import type { BiomeType, Position } from '../types/index.js';
import { Animal, type AnimalData } from '../entities/Animal.js';
import { Evidence, generateEvidenceForAnimal } from '../entities/Evidence.js';

interface Tile {
    type: string;
    biome: BiomeType;
    color: string;
}

interface Decoration {
    type: string;
    x: number;
    y: number;
    size: number;
    variant: number;
}

export class World {
    private width: number;
    private height: number;
    private tileSize: number;
    private tiles: Tile[][];
    private animals: Animal[];
    private evidence: Evidence[];  // NEW: Evidence system
    private decorations: Decoration[];
    private exploredChunks: Set<string>;
    private chunkSize: number;
    private animationTimer: number = 0;

    constructor(width: number, height: number, tileSize: number = 32) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        this.animals = [];
        this.evidence = [];  // NEW
        this.decorations = [];
        this.exploredChunks = new Set();
        this.chunkSize = 10;
        this.generateWorld();
        this.generateDecorations();
        this.spawnAnimals();
        this.spawnEvidence();  // NEW: Generate evidence
    }

    private generateWorld(): void {
        const tilesX = Math.ceil(this.width / this.tileSize);
        const tilesY = Math.ceil(this.height / this.tileSize);

        for (let y = 0; y < tilesY; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < tilesX; x++) {
                const biome = this.getBiomeAt(x, y, tilesX, tilesY);
                this.tiles[y][x] = this.createTile(biome, x, y);
            }
        }
    }

    private getBiomeAt(x: number, y: number, tilesX: number, tilesY: number): BiomeType {
        const relX = x / tilesX;
        const relY = y / tilesY;

        // Create biome zones
        if (relY < 0.2) return 'tundra';
        if (relY > 0.8) return 'beach';
        if (relX < 0.3) return 'jungle';
        if (relX > 0.7) return 'desert';
        return 'forest';
    }

    private createTile(biome: BiomeType, x: number, y: number): Tile {
        const colors: Record<BiomeType, string[]> = {
            beach: ['#F5DEB3', '#DEB887', '#D2B48C', '#C2B280'],
            jungle: ['#228B22', '#2E8B57', '#3CB371', '#32CD32'],
            rainforest: ['#1E7B1E', '#228B22', '#2E7D32', '#33691E'],
            desert: ['#EDC9AF', '#DEB887', '#D2691E', '#F4A460'],
            tundra: ['#E0FFFF', '#F0FFFF', '#DCDCDC', '#B0C4DE'],
            arctic: ['#E0FFFF', '#FFFFFF', '#B0E0E6', '#ADD8E6'],
            ocean: ['#4169E1', '#1E90FF', '#00BFFF', '#87CEEB'],
            coral_reef: ['#40E0D0', '#48D1CC', '#00CED1', '#20B2AA'],
            deep_ocean: ['#00008B', '#191970', '#000080', '#0000CD'],
            savannah: ['#DAA520', '#F4A460', '#DEB887', '#D2B48C'],
            forest: ['#228B22', '#2E8B57', '#006400', '#8B4513'],
            wetland: ['#6B8E23', '#556B2F', '#808000', '#2E8B57'],
            mountain: ['#708090', '#778899', '#696969', '#A9A9A9'],
        };
        const biomeColors = colors[biome];
        const noise = (Math.sin(x * 0.5) + Math.cos(y * 0.5) + 2) / 4;
        const colorIndex = Math.floor(noise * biomeColors.length) % biomeColors.length;
        
        return { type: 'ground', biome, color: biomeColors[colorIndex]! };
    }

    private generateDecorations(): void {
        const tilesX = Math.ceil(this.width / this.tileSize);
        const tilesY = Math.ceil(this.height / this.tileSize);

        // Generate decorations based on biome
        for (let y = 0; y < tilesY; y += 2) {
            for (let x = 0; x < tilesX; x += 2) {
                const tile = this.tiles[y]?.[x];
                if (!tile) continue;

                // Random chance to spawn decoration
                if (Math.random() > 0.3) continue;

                const worldX = x * this.tileSize + Math.random() * this.tileSize;
                const worldY = y * this.tileSize + Math.random() * this.tileSize;
                const variant = Math.floor(Math.random() * 3);
                const size = 0.8 + Math.random() * 0.4;

                switch (tile.biome) {
                    case 'forest':
                        this.decorations.push({
                            type: Math.random() > 0.3 ? 'tree' : (Math.random() > 0.5 ? 'bush' : 'rock'),
                            x: worldX, y: worldY, size, variant
                        });
                        break;
                    case 'jungle':
                        this.decorations.push({
                            type: Math.random() > 0.2 ? 'palm' : (Math.random() > 0.5 ? 'tropical_plant' : 'vine'),
                            x: worldX, y: worldY, size, variant
                        });
                        break;
                    case 'desert':
                        this.decorations.push({
                            type: Math.random() > 0.4 ? 'cactus' : (Math.random() > 0.5 ? 'desert_rock' : 'skull'),
                            x: worldX, y: worldY, size, variant
                        });
                        break;
                    case 'tundra':
                        this.decorations.push({
                            type: Math.random() > 0.3 ? 'snow_tree' : (Math.random() > 0.5 ? 'ice_crystal' : 'snowman'),
                            x: worldX, y: worldY, size, variant
                        });
                        break;
                    case 'beach':
                        this.decorations.push({
                            type: Math.random() > 0.4 ? 'beach_umbrella' : (Math.random() > 0.5 ? 'shell' : 'starfish'),
                            x: worldX, y: worldY, size, variant
                        });
                        break;
                }
            }
        }

        // Sort decorations by Y for proper depth rendering
        this.decorations.sort((a, b) => a.y - b.y);
    }

    private spawnAnimals(): void {
        const animalData: AnimalData[] = [
            // Beach animals
            { id: 'crab', name: { nl: 'Krab', en: 'Crab' }, description: { nl: 'Een kleine strandkrab', en: 'A small beach crab' }, biome: 'beach', points: 10, color: '#FF6347',
              facts: { nl: ['Krabben kunnen zijwaarts lopen!', 'Krabben hebben 10 poten.', 'Een krab kan een schaartje verliezen en een nieuwe laten groeien!', 'Sommige krabben kunnen 100 jaar oud worden.'], 
                       en: ['Crabs can walk sideways!', 'Crabs have 10 legs.', 'A crab can lose a claw and grow a new one!', 'Some crabs can live up to 100 years.'] } },
            { id: 'seagull', name: { nl: 'Zeemeeuw', en: 'Seagull' }, description: { nl: 'Een luidruchtige zeemeeuw', en: 'A noisy seagull' }, biome: 'beach', points: 15, color: '#FFFFFF',
              facts: { nl: ['Zeemeeuwen kunnen zeewater drinken!', 'Ze hebben een speciale klier om zout uit te scheiden.', 'Meeuwen kunnen 30 jaar oud worden.'], 
                       en: ['Seagulls can drink seawater!', 'They have a special gland to excrete salt.', 'Seagulls can live up to 30 years.'] } },
            { id: 'turtle', name: { nl: 'Schildpad', en: 'Turtle' }, description: { nl: 'Een zeeschildpad', en: 'A sea turtle' }, biome: 'beach', points: 25, color: '#2E8B57',
              facts: { nl: ['Schildpadden kunnen meer dan 100 jaar oud worden!', 'Ze navigeren met het aardmagnetisch veld.', 'Zeeschildpadden huilen om zout kwijt te raken.', 'Ze kunnen hun adem 7 uur inhouden!'], 
                       en: ['Turtles can live over 100 years!', 'They navigate using Earth\'s magnetic field.', 'Sea turtles cry to get rid of salt.', 'They can hold their breath for 7 hours!'] } },
            { id: 'starfish', name: { nl: 'Zeester', en: 'Starfish' }, description: { nl: 'Een kleurrijke zeester', en: 'A colorful starfish' }, biome: 'beach', points: 15, color: '#FF6B6B',
              facts: { nl: ['Zeesterren hebben geen hersenen!', 'Ze kunnen een arm verliezen en laten hergroeien.', 'Sommige hebben tot 40 armen!'], 
                       en: ['Starfish have no brains!', 'They can lose an arm and regrow it.', 'Some have up to 40 arms!'] } },
            { id: 'pelican', name: { nl: 'Pelikaan', en: 'Pelican' }, description: { nl: 'Een grote pelikaan', en: 'A large pelican' }, biome: 'beach', points: 20, color: '#F5F5DC',
              facts: { nl: ['De keelzak van een pelikaan kan 11 liter water bevatten!', 'Ze zijn al 30 miljoen jaar op aarde.'], 
                       en: ['A pelican\'s pouch can hold 11 liters of water!', 'They\'ve been on Earth for 30 million years.'] } },

            // Jungle animals
            { id: 'parrot', name: { nl: 'Papegaai', en: 'Parrot' }, description: { nl: 'Een kleurrijke papegaai', en: 'A colorful parrot' }, biome: 'jungle', points: 20, color: '#FF4500',
              facts: { nl: ['Papegaaien kunnen menselijke spraak nadoen!', 'Ze kunnen links- of rechtshandig zijn.', 'Sommige papegaaien leven 80 jaar!'], 
                       en: ['Parrots can mimic human speech!', 'They can be left or right-handed.', 'Some parrots live up to 80 years!'] } },
            { id: 'monkey', name: { nl: 'Aap', en: 'Monkey' }, description: { nl: 'Een speelse aap', en: 'A playful monkey' }, biome: 'jungle', points: 20, color: '#8B4513',
              facts: { nl: ['Apen gebruiken gereedschap!', 'Ze lachen net als mensen.', 'Apen hebben vingerafdrukken zoals wij.'], 
                       en: ['Monkeys use tools!', 'They laugh just like humans.', 'Monkeys have fingerprints like us.'] } },
            { id: 'snake', name: { nl: 'Slang', en: 'Snake' }, description: { nl: 'Een groene boomslang', en: 'A green tree snake' }, biome: 'jungle', points: 30, color: '#32CD32',
              facts: { nl: ['Slangen ruiken met hun tong!', 'Ze hebben geen oogleden.', 'Sommige slangen kunnen vliegen door te glijden!'], 
                       en: ['Snakes smell with their tongue!', 'They have no eyelids.', 'Some snakes can fly by gliding!'] } },
            { id: 'toucan', name: { nl: 'Toekan', en: 'Toucan' }, description: { nl: 'Een toekan met grote snavel', en: 'A toucan with a large beak' }, biome: 'jungle', points: 25, color: '#FF8C00',
              facts: { nl: ['De snavel van een toekan is heel licht!', 'Ze gebruiken hun snavel om af te koelen.', 'Toekans slapen met hun snavel op hun rug.'], 
                       en: ['A toucan\'s beak is very light!', 'They use their beak to cool down.', 'Toucans sleep with their beak on their back.'] } },
            { id: 'jaguar', name: { nl: 'Jaguar', en: 'Jaguar' }, description: { nl: 'Een krachtige jaguar', en: 'A powerful jaguar' }, biome: 'jungle', points: 40, color: '#DAA520',
              facts: { nl: ['Jaguars kunnen door schilden van schildpadden bijten!', 'Ze zijn uitstekende zwemmers.', 'Hun vlekkenpatroon is uniek, net als vingerafdrukken.'], 
                       en: ['Jaguars can bite through turtle shells!', 'They are excellent swimmers.', 'Their spot pattern is unique, like fingerprints.'] } },
            { id: 'frog', name: { nl: 'Kikker', en: 'Frog' }, description: { nl: 'Een giftige pijlgifkikker', en: 'A poison dart frog' }, biome: 'jungle', points: 20, color: '#00CED1',
              facts: { nl: ['Sommige kikkers zijn zo giftig dat ze een mens kunnen doden!', 'Hun kleuren waarschuwen roofdieren.', 'Kikkers drinken niet - ze absorberen water door hun huid.'], 
                       en: ['Some frogs are so poisonous they could kill a human!', 'Their colors warn predators.', 'Frogs don\'t drink - they absorb water through their skin.'] } },

            // Desert animals
            { id: 'camel', name: { nl: 'Kameel', en: 'Camel' }, description: { nl: 'Een woestijnkameel', en: 'A desert camel' }, biome: 'desert', points: 25, color: '#D2B48C',
              facts: { nl: ['Kamelen kunnen weken zonder water!', 'Hun bulten bevatten vet, geen water.', 'Kamelen kunnen hun neusgaten sluiten tegen zand.', 'Ze kunnen 200 liter water in 10 minuten drinken!'], 
                       en: ['Camels can go weeks without water!', 'Their humps contain fat, not water.', 'Camels can close their nostrils against sand.', 'They can drink 200 liters in 10 minutes!'] } },
            { id: 'scorpion', name: { nl: 'Schorpioen', en: 'Scorpion' }, description: { nl: 'Een woestijnschorpioen', en: 'A desert scorpion' }, biome: 'desert', points: 20, color: '#8B0000',
              facts: { nl: ['Schorpioenen gloeien onder UV-licht!', 'Ze kunnen een jaar zonder eten.', 'Ze zijn al 400 miljoen jaar op aarde!'], 
                       en: ['Scorpions glow under UV light!', 'They can survive a year without food.', 'They\'ve been on Earth for 400 million years!'] } },
            { id: 'fox', name: { nl: 'Fennek', en: 'Fennec Fox' }, description: { nl: 'Een woestijnvos met grote oren', en: 'A desert fox with big ears' }, biome: 'desert', points: 30, color: '#FFF8DC',
              facts: { nl: ['Fenneks hebben grote oren om warmte af te voeren!', 'Ze kunnen overleven zonder te drinken.', 'Hun voetzolen zijn bedekt met bont tegen heet zand.'], 
                       en: ['Fennec foxes have big ears to release heat!', 'They can survive without drinking.', 'Their foot pads are covered in fur against hot sand.'] } },
            { id: 'lizard', name: { nl: 'Hagedis', en: 'Lizard' }, description: { nl: 'Een woestijnhagedis', en: 'A desert lizard' }, biome: 'desert', points: 15, color: '#CD853F',
              facts: { nl: ['Sommige hagedissen kunnen hun staart afwerpen!', 'Ze vangen water op met hun huid.', 'Hagedissen kunnen op hun achterpoten rennen.'], 
                       en: ['Some lizards can detach their tails!', 'They catch water on their skin.', 'Lizards can run on their back legs.'] } },
            { id: 'meerkat', name: { nl: 'Stokstaartje', en: 'Meerkat' }, description: { nl: 'Een waakzaam stokstaartje', en: 'An alert meerkat' }, biome: 'desert', points: 20, color: '#C4A484',
              facts: { nl: ['Stokstaartjes leven in groepen tot 50 dieren!', 'Ze hebben een schildwacht die op gevaar let.', 'Ze zijn immuun voor gif van slangen en schorpioenen.'], 
                       en: ['Meerkats live in groups of up to 50!', 'They have a sentry that watches for danger.', 'They are immune to snake and scorpion venom.'] } },

            // Tundra animals
            { id: 'penguin', name: { nl: 'Pinguïn', en: 'Penguin' }, description: { nl: 'Een schattige pinguïn', en: 'A cute penguin' }, biome: 'tundra', points: 25, color: '#000000',
              facts: { nl: ['Pinguïns kunnen niet vliegen maar wel zwemmen!', 'Ze kunnen 20 minuten onder water blijven.', 'Pinguïns trouwen voor het leven!', 'Ze kunnen 30 km per uur zwemmen.'], 
                       en: ['Penguins cannot fly but can swim!', 'They can stay underwater for 20 minutes.', 'Penguins mate for life!', 'They can swim 30 km per hour.'] } },
            { id: 'polar_bear', name: { nl: 'IJsbeer', en: 'Polar Bear' }, description: { nl: 'Een grote ijsbeer', en: 'A large polar bear' }, biome: 'tundra', points: 40, color: '#FFFAFA',
              facts: { nl: ['IJsberen hebben eigenlijk zwarte huid!', 'Hun vacht is doorzichtig, niet wit.', 'Ze kunnen 100 km zwemmen zonder te rusten.', 'Hun lever is giftig door vitamine A!'], 
                       en: ['Polar bears actually have black skin!', 'Their fur is transparent, not white.', 'They can swim 100 km without resting.', 'Their liver is toxic from vitamin A!'] } },
            { id: 'arctic_fox', name: { nl: 'Poolvos', en: 'Arctic Fox' }, description: { nl: 'Een witte poolvos', en: 'A white arctic fox' }, biome: 'tundra', points: 30, color: '#F0F8FF',
              facts: { nl: ['Poolvossen veranderen van kleur met de seizoenen!', 'Ze hebben de warmste vacht van alle dieren.', 'Ze kunnen -70°C overleven!'], 
                       en: ['Arctic foxes change color with the seasons!', 'They have the warmest fur of any animal.', 'They can survive -70°C!'] } },
            { id: 'seal', name: { nl: 'Zeehond', en: 'Seal' }, description: { nl: 'Een grijze zeehond', en: 'A gray seal' }, biome: 'tundra', points: 25, color: '#708090',
              facts: { nl: ['Zeehonden kunnen 2 uur onder water blijven!', 'Ze slapen in het water.', 'Hun snorharen kunnen vis voelen bewegen.'], 
                       en: ['Seals can stay underwater for 2 hours!', 'They sleep in the water.', 'Their whiskers can feel fish moving.'] } },
            { id: 'snowy_owl', name: { nl: 'Sneeuwuil', en: 'Snowy Owl' }, description: { nl: 'Een witte sneeuwuil', en: 'A white snowy owl' }, biome: 'tundra', points: 30, color: '#FFFAFA',
              facts: { nl: ['Sneeuwuilen jagen overdag, anders dan andere uilen!', 'Ze kunnen 5 km ver zien.', 'Ze eten tot 1600 lemmingen per jaar.'], 
                       en: ['Snowy owls hunt during the day, unlike other owls!', 'They can see 5 km away.', 'They eat up to 1600 lemmings per year.'] } },

            // Forest animals
            { id: 'deer', name: { nl: 'Hert', en: 'Deer' }, description: { nl: 'Een bosshert', en: 'A forest deer' }, biome: 'forest', points: 20, color: '#CD853F',
              facts: { nl: ['Herten verliezen elk jaar hun gewei!', 'Het gewei kan 1 cm per dag groeien.', 'Herten kunnen 3 meter hoog springen.'], 
                       en: ['Deer lose their antlers every year!', 'Antlers can grow 1 cm per day.', 'Deer can jump 3 meters high.'] } },
            { id: 'rabbit', name: { nl: 'Konijn', en: 'Rabbit' }, description: { nl: 'Een wild konijn', en: 'A wild rabbit' }, biome: 'forest', points: 10, color: '#A0522D',
              facts: { nl: ['Konijnen kunnen 360 graden zien!', 'Ze eten hun eigen keutels om voeding te krijgen.', 'Hun tanden stoppen nooit met groeien.'], 
                       en: ['Rabbits can see 360 degrees!', 'They eat their own droppings to get nutrients.', 'Their teeth never stop growing.'] } },
            { id: 'owl', name: { nl: 'Uil', en: 'Owl' }, description: { nl: 'Een wijze bosuil', en: 'A wise forest owl' }, biome: 'forest', points: 25, color: '#8B8682',
              facts: { nl: ['Uilen kunnen hun hoofd 270 graden draaien!', 'Ze kunnen geluiden horen onder de sneeuw.', 'Hun vleugels zijn geluiddempend.'], 
                       en: ['Owls can rotate their heads 270 degrees!', 'They can hear sounds under the snow.', 'Their wings are soundproof.'] } },
            { id: 'squirrel', name: { nl: 'Eekhoorn', en: 'Squirrel' }, description: { nl: 'Een rode eekhoorn', en: 'A red squirrel' }, biome: 'forest', points: 15, color: '#D2691E',
              facts: { nl: ['Eekhoorns planten duizenden bomen door vergeten noten!', 'Ze kunnen van 6 meter hoog vallen zonder zich te bezeren.', 'Hun tanden zijn oranje!'], 
                       en: ['Squirrels plant thousands of trees from forgotten nuts!', 'They can fall 6 meters without getting hurt.', 'Their teeth are orange!'] } },
            { id: 'hedgehog', name: { nl: 'Egel', en: 'Hedgehog' }, description: { nl: 'Een stekelige egel', en: 'A spiky hedgehog' }, biome: 'forest', points: 15, color: '#8B4513',
              facts: { nl: ['Egels hebben 5000 tot 7000 stekels!', 'Ze rollen zich op in een bal voor bescherming.', 'Egels zijn immuun voor slangengif.'], 
                       en: ['Hedgehogs have 5000 to 7000 spines!', 'They roll into a ball for protection.', 'Hedgehogs are immune to snake venom.'] } },
            { id: 'wolf', name: { nl: 'Wolf', en: 'Wolf' }, description: { nl: 'Een grijze boswolf', en: 'A gray forest wolf' }, biome: 'forest', points: 35, color: '#696969',
              facts: { nl: ['Wolven huilen om met hun roedel te communiceren!', 'Ze kunnen 65 km per uur rennen.', 'Een wolf kan 9 kg vlees in één keer eten!'], 
                       en: ['Wolves howl to communicate with their pack!', 'They can run 65 km per hour.', 'A wolf can eat 9 kg of meat at once!'] } },
        ];

        // Spawn multiple animals per biome
        animalData.forEach(data => {
            const positions = this.getBiomePositions(data.biome, 3);
            positions.forEach(pos => {
                this.animals.push(new Animal(data, pos.x, pos.y));
            });
        });
    }

    private getBiomePositions(biome: BiomeType, count: number): Position[] {
        const positions: Position[] = [];
        const tilesX = Math.ceil(this.width / this.tileSize);
        const tilesY = Math.ceil(this.height / this.tileSize);

        for (let i = 0; i < count; i++) {
            for (let attempts = 0; attempts < 100; attempts++) {
                const tileX = Math.floor(Math.random() * tilesX);
                const tileY = Math.floor(Math.random() * tilesY);
                if (this.tiles[tileY]?.[tileX]?.biome === biome) {
                    positions.push({ x: tileX * this.tileSize + Math.random() * this.tileSize, y: tileY * this.tileSize + Math.random() * this.tileSize });
                    break;
                }
            }
        }
        return positions;
    }

    // NEW: Generate evidence around animals
    private spawnEvidence(): void {
        this.animals.forEach(animal => {
            const pos = animal.getPosition();
            const animalEvidence = generateEvidenceForAnimal(animal.getId(), pos.x, pos.y);
            this.evidence.push(...animalEvidence);
        });
        
        console.log(`Spawned ${this.evidence.length} evidence items`);
    }

    public update(deltaTime: number): void {
        this.animationTimer += deltaTime;
        this.animals.forEach(animal => animal.update(deltaTime));
        this.evidence.forEach(ev => ev.update(deltaTime));  // NEW: Update evidence
    }

    public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, viewWidth: number, viewHeight: number): void {
        const startTileX = Math.max(0, Math.floor(cameraX / this.tileSize) - 1);
        const startTileY = Math.max(0, Math.floor(cameraY / this.tileSize) - 1);
        const endTileX = Math.min(this.tiles[0]?.length || 0, Math.ceil((cameraX + viewWidth) / this.tileSize) + 1);
        const endTileY = Math.min(this.tiles.length, Math.ceil((cameraY + viewHeight) / this.tileSize) + 1);

        // Render ground tiles
        for (let y = startTileY; y < endTileY; y++) {
            for (let x = startTileX; x < endTileX; x++) {
                const tile = this.tiles[y]?.[x];
                if (tile) {
                    const screenX = x * this.tileSize - cameraX;
                    const screenY = y * this.tileSize - cameraY;
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    
                    // Add subtle tile texture
                    this.renderTileTexture(ctx, screenX, screenY, tile.biome);
                }
            }
        }

        // Render decorations
        this.decorations.forEach(dec => {
            const screenX = dec.x - cameraX;
            const screenY = dec.y - cameraY;
            
            // Only render visible decorations
            if (screenX > -50 && screenX < viewWidth + 50 && screenY > -50 && screenY < viewHeight + 50) {
                this.renderDecoration(ctx, dec, screenX, screenY);
            }
        });
    }

    private renderTileTexture(ctx: CanvasRenderingContext2D, x: number, y: number, biome: BiomeType): void {
        ctx.globalAlpha = 0.1;
        switch (biome) {
            case 'beach':
                // Sand dots
                ctx.fillStyle = '#DEB887';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(x + 8 + i * 10, y + 16, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'forest':
            case 'jungle':
                // Grass texture
                ctx.strokeStyle = '#1a5f1a';
                ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + 4 + i * 8, y + 28);
                    ctx.lineTo(x + 6 + i * 8, y + 22);
                    ctx.stroke();
                }
                break;
            case 'tundra':
                // Snow sparkle
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(x + 16, y + 16, 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        ctx.globalAlpha = 1;
    }

    private renderDecoration(ctx: CanvasRenderingContext2D, dec: Decoration, x: number, y: number): void {
        const s = dec.size * 20;
        ctx.save();

        switch (dec.type) {
            case 'tree':
                this.renderTree(ctx, x, y, s);
                break;
            case 'bush':
                this.renderBush(ctx, x, y, s);
                break;
            case 'rock':
                this.renderRock(ctx, x, y, s, '#808080');
                break;
            case 'palm':
                this.renderPalm(ctx, x, y, s);
                break;
            case 'tropical_plant':
                this.renderTropicalPlant(ctx, x, y, s);
                break;
            case 'vine':
                this.renderVine(ctx, x, y, s);
                break;
            case 'cactus':
                this.renderCactus(ctx, x, y, s);
                break;
            case 'desert_rock':
                this.renderRock(ctx, x, y, s, '#C2B280');
                break;
            case 'skull':
                this.renderSkull(ctx, x, y, s);
                break;
            case 'snow_tree':
                this.renderSnowTree(ctx, x, y, s);
                break;
            case 'ice_crystal':
                this.renderIceCrystal(ctx, x, y, s);
                break;
            case 'snowman':
                this.renderSnowman(ctx, x, y, s);
                break;
            case 'beach_umbrella':
                this.renderBeachUmbrella(ctx, x, y, s);
                break;
            case 'shell':
                this.renderShell(ctx, x, y, s);
                break;
            case 'starfish':
                this.renderStarfish(ctx, x, y, s);
                break;
        }

        ctx.restore();
    }

    // ==================== FOREST DECORATIONS ====================

    private renderTree(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - s * 0.15, y - s * 0.3, s * 0.3, s * 0.8);
        
        // Foliage layers
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 1.2);
        ctx.lineTo(x - s * 0.5, y - s * 0.4);
        ctx.lineTo(x + s * 0.5, y - s * 0.4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2E8B57';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.9);
        ctx.lineTo(x - s * 0.6, y - s * 0.1);
        ctx.lineTo(x + s * 0.6, y - s * 0.1);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3CB371';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.6);
        ctx.lineTo(x - s * 0.7, y + s * 0.2);
        ctx.lineTo(x + s * 0.7, y + s * 0.2);
        ctx.closePath();
        ctx.fill();
    }

    private renderBush(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = '#2E8B57';
        ctx.beginPath();
        ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
        ctx.arc(x - s * 0.3, y + s * 0.1, s * 0.3, 0, Math.PI * 2);
        ctx.arc(x + s * 0.3, y + s * 0.1, s * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Flowers
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(x - s * 0.2, y - s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.arc(x + s * 0.1, y + s * 0.15, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderRock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string): void {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y + s * 0.2);
        ctx.lineTo(x - s * 0.3, y - s * 0.2);
        ctx.lineTo(x + s * 0.1, y - s * 0.3);
        ctx.lineTo(x + s * 0.4, y - s * 0.1);
        ctx.lineTo(x + s * 0.3, y + s * 0.2);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(x - s * 0.1, y - s * 0.15, s * 0.1, s * 0.05, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== JUNGLE DECORATIONS ====================

    private renderPalm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - s * 0.1, y + s * 0.3);
        ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.3, x - s * 0.05, y - s * 0.8);
        ctx.lineTo(x + s * 0.1, y - s * 0.8);
        ctx.quadraticCurveTo(x + s * 0.2, y - s * 0.3, x + s * 0.1, y + s * 0.3);
        ctx.closePath();
        ctx.fill();

        // Trunk lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const ty = y + s * 0.2 - i * s * 0.2;
            ctx.beginPath();
            ctx.moveTo(x - s * 0.08, ty);
            ctx.lineTo(x + s * 0.12, ty);
            ctx.stroke();
        }

        // Palm leaves
        ctx.fillStyle = '#228B22';
        const leafCount = 6;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            ctx.save();
            ctx.translate(x, y - s * 0.8);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(s * 0.3, -s * 0.3, s * 0.7, -s * 0.1);
            ctx.quadraticCurveTo(s * 0.3, -s * 0.1, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        // Coconuts
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(x - s * 0.1, y - s * 0.7, s * 0.08, 0, Math.PI * 2);
        ctx.arc(x + s * 0.1, y - s * 0.72, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderTropicalPlant(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Large leaves
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI - Math.PI / 2;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.3, s * 0.15, s * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Flower
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(x, y - s * 0.1, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y - s * 0.1, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderVine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.5);
        ctx.quadraticCurveTo(x + s * 0.3, y, x, y + s * 0.5);
        ctx.stroke();

        // Leaves on vine
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 4; i++) {
            const ly = y - s * 0.3 + i * s * 0.25;
            ctx.beginPath();
            ctx.ellipse(x + (i % 2 === 0 ? s * 0.15 : -s * 0.1), ly, s * 0.1, s * 0.06, i % 2 === 0 ? 0.3 : -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==================== DESERT DECORATIONS ====================

    private renderCactus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = '#2E8B57';
        
        // Main body
        ctx.fillRect(x - s * 0.15, y - s * 0.6, s * 0.3, s * 0.9);
        
        // Top
        ctx.beginPath();
        ctx.arc(x, y - s * 0.6, s * 0.15, 0, Math.PI, true);
        ctx.fill();

        // Arms
        ctx.fillRect(x - s * 0.5, y - s * 0.3, s * 0.35, s * 0.1);
        ctx.fillRect(x - s * 0.5, y - s * 0.4, s * 0.1, s * 0.2);
        ctx.beginPath();
        ctx.arc(x - s * 0.45, y - s * 0.4, s * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(x + s * 0.15, y - s * 0.15, s * 0.35, s * 0.1);
        ctx.fillRect(x + s * 0.4, y - s * 0.35, s * 0.1, s * 0.25);
        ctx.beginPath();
        ctx.arc(x + s * 0.45, y - s * 0.35, s * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Spines
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const sy = y - s * 0.5 + i * s * 0.15;
            ctx.beginPath();
            ctx.moveTo(x - s * 0.15, sy);
            ctx.lineTo(x - s * 0.22, sy);
            ctx.moveTo(x + s * 0.15, sy);
            ctx.lineTo(x + s * 0.22, sy);
            ctx.stroke();
        }

        // Flower on top
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x, y - s * 0.75, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderSkull(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = '#F5F5DC';
        // Skull
        ctx.beginPath();
        ctx.arc(x, y - s * 0.1, s * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Jaw
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.15, s * 0.18, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye sockets
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.ellipse(x - s * 0.1, y - s * 0.12, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
        ctx.ellipse(x + s * 0.1, y - s * 0.12, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - s * 0.05, y + s * 0.08);
        ctx.lineTo(x + s * 0.05, y + s * 0.08);
        ctx.closePath();
        ctx.fill();
    }

    // ==================== TUNDRA DECORATIONS ====================

    private renderSnowTree(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Trunk
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - s * 0.1, y - s * 0.2, s * 0.2, s * 0.5);

        // Snow-covered layers
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 1.1);
        ctx.lineTo(x - s * 0.35, y - s * 0.5);
        ctx.lineTo(x + s * 0.35, y - s * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.8);
        ctx.lineTo(x - s * 0.45, y - s * 0.15);
        ctx.lineTo(x + s * 0.45, y - s * 0.15);
        ctx.closePath();
        ctx.fill();

        // Snow on top
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 1.15);
        ctx.lineTo(x - s * 0.2, y - s * 0.8);
        ctx.lineTo(x + s * 0.2, y - s * 0.8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x - s * 0.25, y - s * 0.5, s * 0.15, s * 0.05, -0.3, 0, Math.PI * 2);
        ctx.ellipse(x + s * 0.2, y - s * 0.55, s * 0.12, s * 0.04, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderIceCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = 'rgba(135, 206, 250, 0.7)';
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 1;

        // Main crystal
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.5);
        ctx.lineTo(x - s * 0.15, y);
        ctx.lineTo(x, y + s * 0.2);
        ctx.lineTo(x + s * 0.15, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Side crystals
        ctx.beginPath();
        ctx.moveTo(x - s * 0.1, y - s * 0.2);
        ctx.lineTo(x - s * 0.3, y - s * 0.3);
        ctx.lineTo(x - s * 0.15, y - s * 0.1);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + s * 0.1, y - s * 0.15);
        ctx.lineTo(x + s * 0.25, y - s * 0.35);
        ctx.lineTo(x + s * 0.18, y - s * 0.05);
        ctx.closePath();
        ctx.fill();

        // Sparkle
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x - s * 0.05, y - s * 0.3, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderSnowman(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Bottom ball
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y + s * 0.1, s * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Middle ball
        ctx.beginPath();
        ctx.arc(x, y - s * 0.25, s * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(x, y - s * 0.55, s * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Hat
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(x - s * 0.2, y - s * 0.75, s * 0.4, s * 0.08);
        ctx.fillRect(x - s * 0.12, y - s * 0.95, s * 0.24, s * 0.22);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - s * 0.06, y - s * 0.58, s * 0.03, 0, Math.PI * 2);
        ctx.arc(x + s * 0.06, y - s * 0.58, s * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // Nose (carrot)
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.52);
        ctx.lineTo(x + s * 0.12, y - s * 0.5);
        ctx.lineTo(x, y - s * 0.48);
        ctx.closePath();
        ctx.fill();

        // Buttons
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.04, 0, Math.PI * 2);
        ctx.arc(x, y - s * 0.15, s * 0.04, 0, Math.PI * 2);
        ctx.arc(x, y, s * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Arms (sticks)
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.22, y - s * 0.25);
        ctx.lineTo(x - s * 0.45, y - s * 0.35);
        ctx.moveTo(x + s * 0.22, y - s * 0.25);
        ctx.lineTo(x + s * 0.45, y - s * 0.35);
        ctx.stroke();
    }

    // ==================== BEACH DECORATIONS ====================

    private renderBeachUmbrella(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        // Pole
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.3);
        ctx.lineTo(x, y - s * 0.5);
        ctx.stroke();

        // Umbrella top
        const colors = ['#FF6B6B', '#FFF', '#FF6B6B', '#FFF', '#FF6B6B', '#FFF', '#FF6B6B', '#FFF'];
        const segments = colors.length;
        for (let i = 0; i < segments; i++) {
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(x, y - s * 0.5);
            ctx.arc(x, y - s * 0.5, s * 0.6, Math.PI + (i / segments) * Math.PI, Math.PI + ((i + 1) / segments) * Math.PI);
            ctx.closePath();
            ctx.fill();
        }

        // Umbrella edge
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.5, s * 0.6, Math.PI, 0);
        ctx.stroke();
    }

    private renderShell(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = '#FFE4C4';
        ctx.beginPath();
        ctx.ellipse(x, y, s * 0.25, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell ridges
        ctx.strokeStyle = '#DEB887';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const offset = -s * 0.15 + i * s * 0.075;
            ctx.beginPath();
            ctx.ellipse(x + offset * 0.5, y, s * 0.2 - i * 0.03, s * 0.12 - i * 0.02, 0, 0, Math.PI);
            ctx.stroke();
        }
    }

    private renderStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        
        const points = 5;
        const outerRadius = s * 0.3;
        const innerRadius = s * 0.12;
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#CD5C5C';
        ctx.beginPath();
        ctx.arc(x, y, s * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Dots on arms
        ctx.fillStyle = '#FF7F50';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * s * 0.15, y + Math.sin(angle) * s * 0.15, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    public getAnimals(): Animal[] { return this.animals; }
    public getEvidence(): Evidence[] { return this.evidence; }  // NEW
    public getWidth(): number { return this.width; }
    public getHeight(): number { return this.height; }
    public getTileSize(): number { return this.tileSize; }

    public getBiomeAtPosition(x: number, y: number): BiomeType {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.tiles[tileY]?.[tileX]?.biome || 'forest';
    }

    public markChunkExplored(x: number, y: number): void {
        const chunkX = Math.floor(x / (this.tileSize * this.chunkSize));
        const chunkY = Math.floor(y / (this.tileSize * this.chunkSize));
        this.exploredChunks.add(`${chunkX},${chunkY}`);
    }

    public getExploredChunks(): Set<string> { return this.exploredChunks; }
}

