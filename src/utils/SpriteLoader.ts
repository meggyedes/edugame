// SpriteLoader - Loads and manages sprite sheets

export interface SpriteDefinition {
    id: string;
    x: number;      // X position in sprite sheet
    y: number;      // Y position in sprite sheet
    width: number;  // Width of sprite
    height: number; // Height of sprite
}

export class SpriteLoader {
    private static instance: SpriteLoader;
    private spriteSheet: HTMLImageElement | null = null;
    private isLoaded: boolean = false;
    private sprites: Map<string, SpriteDefinition> = new Map();

    // Sprite sheet dimensions (approximate based on the image)
    private readonly SPRITE_WIDTH = 64;
    private readonly SPRITE_HEIGHT = 64;
    private readonly COLS = 10;

    private constructor() {
        this.loadSpriteSheet();
        this.defineSpritePositions();
    }

    public static getInstance(): SpriteLoader {
        if (!SpriteLoader.instance) {
            SpriteLoader.instance = new SpriteLoader();
        }
        return SpriteLoader.instance;
    }

    private loadSpriteSheet(): void {
        this.spriteSheet = new Image();
        this.spriteSheet.onload = () => {
            this.isLoaded = true;
            console.log('Animal sprite sheet loaded successfully!');
        };
        this.spriteSheet.onerror = () => {
            console.error('Failed to load animal sprite sheet');
        };
        this.spriteSheet.src = './public/images/sprite-sheet.png';
    }

    private defineSpritePositions(): void {
        // Row 1: Leopard, Sloth, Toucan, Parrot, Frog(small), Monkey, Tapir, Frog(big), Snake, Ant
        this.addSprite('jaguar', 0, 0);
        this.addSprite('sloth', 1, 0);
        this.addSprite('toucan', 2, 0);
        this.addSprite('parrot', 3, 0);
        this.addSprite('frog', 4, 0);
        this.addSprite('monkey', 5, 0);
        this.addSprite('tapir', 6, 0);
        this.addSprite('tree_frog', 7, 0);
        this.addSprite('snake', 8, 0);
        this.addSprite('ant', 9, 0);

        // Row 2: Fox, Camel, Scorpion, Meerkat, Vulture, Rabbit, Snake2, Lizard
        this.addSprite('fox', 0, 1);
        this.addSprite('camel', 1, 1);
        this.addSprite('scorpion', 2, 1);
        this.addSprite('meerkat', 3, 1);
        this.addSprite('vulture', 4, 1);
        this.addSprite('rabbit', 5, 1);
        this.addSprite('desert_snake', 6, 1);
        this.addSprite('lizard', 7, 1);

        // Row 3: Polar bear, Arctic fox, Snowy owl, Deer, Walrus, Seal, Puffin, Bison
        this.addSprite('polar_bear', 0, 2);
        this.addSprite('arctic_fox', 1, 2);
        this.addSprite('snowy_owl', 2, 2);
        this.addSprite('deer', 3, 2);
        this.addSprite('walrus', 4, 2);
        this.addSprite('seal', 5, 2);
        this.addSprite('puffin', 6, 2);
        this.addSprite('bison', 7, 2);

        // Row 4: Turtle, Dolphin, Crab, Pelican, Penguin, Whale, Starfish
        this.addSprite('turtle', 0, 3);
        this.addSprite('dolphin', 1, 3);
        this.addSprite('crab', 2, 3);
        this.addSprite('pelican', 3, 3);
        this.addSprite('penguin', 4, 3);
        this.addSprite('whale', 5, 3);
        this.addSprite('starfish', 6, 3);

        // Row 5: Lion, Elephant, Giraffe, Zebra, Hippo, Rhino, Hyena, Flamingo, Cheetah
        this.addSprite('lion', 0, 4);
        this.addSprite('elephant', 1, 4);
        this.addSprite('giraffe', 2, 4);
        this.addSprite('zebra', 3, 4);
        this.addSprite('hippo', 4, 4);
        this.addSprite('rhino', 5, 4);
        this.addSprite('hyena', 6, 4);
        this.addSprite('flamingo', 7, 4);
        this.addSprite('cheetah', 8, 4);

        // Row 6: Fox2, Deer2, Sloth2, Owl, Hedgehog, Badger, Boar, Squirrel, Eagle
        this.addSprite('red_fox', 0, 5);
        this.addSprite('forest_deer', 1, 5);
        this.addSprite('forest_sloth', 2, 5);
        this.addSprite('owl', 3, 5);
        this.addSprite('hedgehog', 4, 5);
        this.addSprite('badger', 5, 5);
        this.addSprite('boar', 6, 5);
        this.addSprite('squirrel', 7, 5);
        this.addSprite('eagle', 8, 5);

        // Row 7: Snow leopard, Panda, Butterfly, Penguin2, Orca, Komodo
        this.addSprite('snow_leopard', 0, 6);
        this.addSprite('panda', 1, 6);
        this.addSprite('butterfly', 2, 6);
        this.addSprite('emperor_penguin', 3, 6);
        this.addSprite('orca', 4, 6);
        this.addSprite('komodo', 5, 6);

        // Map existing game animal IDs to sprite IDs
        this.addSpriteAlias('seagull', 'pelican'); // Use pelican for seagull
        this.addSpriteAlias('wolf', 'hyena'); // Use hyena for wolf temporarily
    }

    private addSprite(id: string, col: number, row: number): void {
        this.sprites.set(id, {
            id,
            x: col * this.SPRITE_WIDTH,
            y: row * this.SPRITE_HEIGHT,
            width: this.SPRITE_WIDTH,
            height: this.SPRITE_HEIGHT
        });
    }

    private addSpriteAlias(aliasId: string, targetId: string): void {
        const target = this.sprites.get(targetId);
        if (target) {
            this.sprites.set(aliasId, { ...target, id: aliasId });
        }
    }

    public isReady(): boolean {
        return this.isLoaded && this.spriteSheet !== null;
    }

    public getSprite(id: string): SpriteDefinition | null {
        return this.sprites.get(id) || null;
    }

    public drawSprite(
        ctx: CanvasRenderingContext2D,
        spriteId: string,
        destX: number,
        destY: number,
        scale: number = 1,
        flipX: boolean = false
    ): boolean {
        if (!this.isLoaded || !this.spriteSheet) {
            return false;
        }

        const sprite = this.sprites.get(spriteId);
        if (!sprite) {
            return false;
        }

        const destWidth = sprite.width * scale;
        const destHeight = sprite.height * scale;

        ctx.save();

        if (flipX) {
            ctx.translate(destX + destWidth, destY);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.spriteSheet,
                sprite.x, sprite.y,
                sprite.width, sprite.height,
                0, 0,
                destWidth, destHeight
            );
        } else {
            ctx.drawImage(
                this.spriteSheet,
                sprite.x, sprite.y,
                sprite.width, sprite.height,
                destX, destY,
                destWidth, destHeight
            );
        }

        ctx.restore();
        return true;
    }

    public getSpriteSheet(): HTMLImageElement | null {
        return this.spriteSheet;
    }
}
