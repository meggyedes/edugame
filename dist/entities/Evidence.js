// Evidence system - environmental clues that lead to animals
// All evidence types and their linked animals
export const EVIDENCE_DATABASE = {
    // Beach animals
    crab: [
        { type: 'tracks', name: { nl: 'Kleine krabsporen', en: 'Small crab tracks' }, description: { nl: 'Kleine, zijwaartse sporen in het zand', en: 'Small, sideways tracks in the sand' }, linkedAnimal: 'crab', icon: '👣' },
        { type: 'shell_fragments', name: { nl: 'Schelpresten', en: 'Shell fragments' }, description: { nl: 'Gebroken schelpen van een krab', en: 'Broken shell pieces from a crab' }, linkedAnimal: 'crab', icon: '🐚' }
    ],
    seagull: [
        { type: 'feathers', name: { nl: 'Witte veren', en: 'White feathers' }, description: { nl: 'Witte en grijze veren van een zeevogel', en: 'White and grey feathers from a seabird' }, linkedAnimal: 'seagull', icon: '🪶' },
        { type: 'tracks', name: { nl: 'Vogelsporen', en: 'Bird tracks' }, description: { nl: 'Webvormige voetafdrukken in het zand', en: 'Webbed footprints in the sand' }, linkedAnimal: 'seagull', icon: '👣' }
    ],
    turtle: [
        { type: 'tracks', name: { nl: 'Schildpadsporen', en: 'Turtle tracks' }, description: { nl: 'Brede, sleepachtige sporen naar de zee', en: 'Wide, dragging tracks towards the sea' }, linkedAnimal: 'turtle', icon: '👣' },
        { type: 'shell_fragments', name: { nl: 'Eierschalen', en: 'Eggshells' }, description: { nl: 'Resten van schildpadeitjes', en: 'Remains of turtle eggs' }, linkedAnimal: 'turtle', icon: '🥚' }
    ],
    // Forest animals
    deer: [
        { type: 'footprints', name: { nl: 'Hoevenafdrukken', en: 'Hoof prints' }, description: { nl: 'Tweeledige hoefafdrukken in de modder', en: 'Two-toed hoof prints in the mud' }, linkedAnimal: 'deer', icon: '🦶' },
        { type: 'fur_tuft', name: { nl: 'Hertenhaar', en: 'Deer fur' }, description: { nl: 'Bruine haartjes aan een tak', en: 'Brown fur caught on a branch' }, linkedAnimal: 'deer', icon: '🧶' }
    ],
    rabbit: [
        { type: 'chewed_carrot', name: { nl: 'Aangevreten wortel', en: 'Chewed carrot' }, description: { nl: 'Een half opgegeten wortel', en: 'A half-eaten carrot' }, linkedAnimal: 'rabbit', icon: '🥕' },
        { type: 'burrow', name: { nl: 'Konijnenhol', en: 'Rabbit burrow' }, description: { nl: 'Een klein hol in de grond', en: 'A small hole in the ground' }, linkedAnimal: 'rabbit', icon: '🕳️' },
        { type: 'droppings', name: { nl: 'Keutels', en: 'Droppings' }, description: { nl: 'Kleine ronde keuteltjes', en: 'Small round droppings' }, linkedAnimal: 'rabbit', icon: '💩' }
    ],
    squirrel: [
        { type: 'cracked_nut', name: { nl: 'Gekraakte noot', en: 'Cracked nut' }, description: { nl: 'Een opengebroken hazelnoot', en: 'A cracked hazelnut' }, linkedAnimal: 'squirrel', icon: '🌰' },
        { type: 'scratch_marks', name: { nl: 'Krabsporen', en: 'Scratch marks' }, description: { nl: 'Kleine krabsporen op boomschors', en: 'Small scratch marks on tree bark' }, linkedAnimal: 'squirrel', icon: '🌳' }
    ],
    owl: [
        { type: 'feathers', name: { nl: 'Uilenveren', en: 'Owl feathers' }, description: { nl: 'Zachte, gevlekte veren', en: 'Soft, spotted feathers' }, linkedAnimal: 'owl', icon: '🪶' },
        { type: 'droppings', name: { nl: 'Braakbal', en: 'Owl pellet' }, description: { nl: 'Een bal met onverteerde resten', en: 'A ball of undigested remains' }, linkedAnimal: 'owl', icon: '⚫' }
    ],
    fox: [
        { type: 'footprints', name: { nl: 'Vossensporen', en: 'Fox tracks' }, description: { nl: 'Ovale pootafdrukken in een lijn', en: 'Oval paw prints in a line' }, linkedAnimal: 'fox', icon: '🐾' },
        { type: 'burrow', name: { nl: 'Vossenhol', en: 'Fox den' }, description: { nl: 'Een grote hol onder een boom', en: 'A large den under a tree' }, linkedAnimal: 'fox', icon: '🕳️' },
        { type: 'fur_tuft', name: { nl: 'Rood haar', en: 'Red fur' }, description: { nl: 'Rossig haar aan een struik', en: 'Reddish fur on a bush' }, linkedAnimal: 'fox', icon: '🧶' }
    ],
    wolf: [
        { type: 'footprints', name: { nl: 'Wolvensporen', en: 'Wolf tracks' }, description: { nl: 'Grote pootafdrukken met klauwen', en: 'Large paw prints with claws' }, linkedAnimal: 'wolf', icon: '🐾' },
        { type: 'fur_tuft', name: { nl: 'Grijze vacht', en: 'Grey fur' }, description: { nl: 'Grijze haren op de grond', en: 'Grey hairs on the ground' }, linkedAnimal: 'wolf', icon: '🧶' },
        { type: 'scratch_marks', name: { nl: 'Territoriummarkeringen', en: 'Territory marks' }, description: { nl: 'Krabsporen op een boom', en: 'Scratch marks on a tree' }, linkedAnimal: 'wolf', icon: '🌲' }
    ],
    hedgehog: [
        { type: 'footprints', name: { nl: 'Egelsporen', en: 'Hedgehog tracks' }, description: { nl: 'Kleine vijfvingerige afdrukken', en: 'Small five-toed prints' }, linkedAnimal: 'hedgehog', icon: '👣' },
        { type: 'droppings', name: { nl: 'Egelkeutels', en: 'Hedgehog droppings' }, description: { nl: 'Zwarte, glanzende keutels', en: 'Black, shiny droppings' }, linkedAnimal: 'hedgehog', icon: '💩' }
    ],
    // Jungle animals
    parrot: [
        { type: 'feathers', name: { nl: 'Kleurrijke veren', en: 'Colorful feathers' }, description: { nl: 'Felgekleurde tropische veren', en: 'Brightly colored tropical feathers' }, linkedAnimal: 'parrot', icon: '🪶' },
        { type: 'cracked_nut', name: { nl: 'Gepelde noten', en: 'Peeled nuts' }, description: { nl: 'Door een snavel opengebroken noten', en: 'Nuts cracked open by a beak' }, linkedAnimal: 'parrot', icon: '🥜' }
    ],
    monkey: [
        { type: 'footprints', name: { nl: 'Apensporen', en: 'Monkey tracks' }, description: { nl: 'Handachtige afdrukken', en: 'Hand-like prints' }, linkedAnimal: 'monkey', icon: '🖐️' },
        { type: 'fur_tuft', name: { nl: 'Apenhaar', en: 'Monkey fur' }, description: { nl: 'Bruine haartjes in de bomen', en: 'Brown fur in the trees' }, linkedAnimal: 'monkey', icon: '🧶' }
    ],
    snake: [
        { type: 'shed_skin', name: { nl: 'Slangenhuid', en: 'Snake skin' }, description: { nl: 'Een afgeworpen slangenhuid', en: 'A shed snake skin' }, linkedAnimal: 'snake', icon: '🐍' },
        { type: 'tracks', name: { nl: 'Slingerend spoor', en: 'Slithering trail' }, description: { nl: 'Een golvend spoor in het zand', en: 'A wavy trail in the sand' }, linkedAnimal: 'snake', icon: '〰️' }
    ],
    toucan: [
        { type: 'feathers', name: { nl: 'Zwarte veren', en: 'Black feathers' }, description: { nl: 'Glanzend zwarte tropische veren', en: 'Shiny black tropical feathers' }, linkedAnimal: 'toucan', icon: '🪶' }
    ],
    jaguar: [
        { type: 'claw_marks', name: { nl: 'Klauwsporen', en: 'Claw marks' }, description: { nl: 'Diepe krabsporen op een boom', en: 'Deep scratch marks on a tree' }, linkedAnimal: 'jaguar', icon: '🐾' },
        { type: 'footprints', name: { nl: 'Grote pootafdrukken', en: 'Large paw prints' }, description: { nl: 'Ronde, grote katachtige sporen', en: 'Round, large cat-like tracks' }, linkedAnimal: 'jaguar', icon: '🐾' }
    ],
    frog: [
        { type: 'tracks', name: { nl: 'Kikkerssporen', en: 'Frog tracks' }, description: { nl: 'Kleine natte springsporen', en: 'Small wet hopping tracks' }, linkedAnimal: 'frog', icon: '💧' }
    ],
    // Desert animals
    camel: [
        { type: 'footprints', name: { nl: 'Kameelsporen', en: 'Camel tracks' }, description: { nl: 'Grote, ronde afdrukken in het zand', en: 'Large, round prints in the sand' }, linkedAnimal: 'camel', icon: '🦶' },
        { type: 'fur_tuft', name: { nl: 'Kameelhaar', en: 'Camel hair' }, description: { nl: 'Ruwe, bruine haren', en: 'Coarse, brown hairs' }, linkedAnimal: 'camel', icon: '🧶' }
    ],
    scorpion: [
        { type: 'tracks', name: { nl: 'Schorpioensporen', en: 'Scorpion tracks' }, description: { nl: 'Kleine, veelpotige sporen', en: 'Small, multi-legged tracks' }, linkedAnimal: 'scorpion', icon: '👣' },
        { type: 'burrow', name: { nl: 'Schorpioenhol', en: 'Scorpion burrow' }, description: { nl: 'Een klein hol onder een steen', en: 'A small hole under a rock' }, linkedAnimal: 'scorpion', icon: '🕳️' }
    ],
    lizard: [
        { type: 'shed_skin', name: { nl: 'Hagedissenhuid', en: 'Lizard skin' }, description: { nl: 'Kleine, droge huidschilfers', en: 'Small, dry skin flakes' }, linkedAnimal: 'lizard', icon: '🦎' },
        { type: 'tracks', name: { nl: 'Hagedissensporen', en: 'Lizard tracks' }, description: { nl: 'Kleine vierpotige sporen', en: 'Small four-legged tracks' }, linkedAnimal: 'lizard', icon: '👣' }
    ],
    meerkat: [
        { type: 'burrow', name: { nl: 'Stokstaartjeshol', en: 'Meerkat burrow' }, description: { nl: 'Een netwerk van tunnels', en: 'A network of tunnels' }, linkedAnimal: 'meerkat', icon: '🕳️' },
        { type: 'dig_marks', name: { nl: 'Graafsporen', en: 'Dig marks' }, description: { nl: 'Vers omgewoelde aarde', en: 'Freshly dug earth' }, linkedAnimal: 'meerkat', icon: '⛏️' }
    ],
    // Arctic animals
    penguin: [
        { type: 'footprints', name: { nl: 'Pinguïnsporen', en: 'Penguin tracks' }, description: { nl: 'Waggelende voetsporen in de sneeuw', en: 'Waddling footprints in the snow' }, linkedAnimal: 'penguin', icon: '👣' },
        { type: 'feathers', name: { nl: 'Zwart-witte veren', en: 'Black-white feathers' }, description: { nl: 'Waterdichte veren', en: 'Waterproof feathers' }, linkedAnimal: 'penguin', icon: '🪶' }
    ],
    polar_bear: [
        { type: 'footprints', name: { nl: 'IJsbeerssporen', en: 'Polar bear tracks' }, description: { nl: 'Enorme pootafdrukken in de sneeuw', en: 'Enormous paw prints in the snow' }, linkedAnimal: 'polar_bear', icon: '🐾' },
        { type: 'claw_marks', name: { nl: 'Klauwkrassen', en: 'Claw scratches' }, description: { nl: 'Diepe krassen in het ijs', en: 'Deep scratches in the ice' }, linkedAnimal: 'polar_bear', icon: '❄️' },
        { type: 'eaten_fish', name: { nl: 'Visresten', en: 'Fish remains' }, description: { nl: 'Half opgegeten vis', en: 'Half-eaten fish' }, linkedAnimal: 'polar_bear', icon: '🐟' }
    ],
    arctic_fox: [
        { type: 'footprints', name: { nl: 'Poolvossporen', en: 'Arctic fox tracks' }, description: { nl: 'Kleine pootafdrukken in de sneeuw', en: 'Small paw prints in the snow' }, linkedAnimal: 'arctic_fox', icon: '🐾' },
        { type: 'fur_tuft', name: { nl: 'Witte vacht', en: 'White fur' }, description: { nl: 'Pluizige witte haren', en: 'Fluffy white hairs' }, linkedAnimal: 'arctic_fox', icon: '🧶' }
    ],
    seal: [
        { type: 'tracks', name: { nl: 'Zeehondsporen', en: 'Seal tracks' }, description: { nl: 'Buikglijsporen naar het water', en: 'Belly sliding tracks to water' }, linkedAnimal: 'seal', icon: '👣' },
        { type: 'eaten_fish', name: { nl: 'Visgraten', en: 'Fish bones' }, description: { nl: 'Achtergelaten visresten', en: 'Left behind fish remains' }, linkedAnimal: 'seal', icon: '🐟' }
    ],
    snowy_owl: [
        { type: 'feathers', name: { nl: 'Witte veren', en: 'White feathers' }, description: { nl: 'Grote, zachte witte veren', en: 'Large, soft white feathers' }, linkedAnimal: 'snowy_owl', icon: '🪶' },
        { type: 'droppings', name: { nl: 'Braakbal', en: 'Owl pellet' }, description: { nl: 'Onverteerde botjes en vacht', en: 'Undigested bones and fur' }, linkedAnimal: 'snowy_owl', icon: '⚫' }
    ]
};
export class Evidence {
    constructor(data, x, y) {
        this.discovered = false;
        this.collected = false;
        this.animationFrame = 0;
        this.glowIntensity = 0;
        this.size = { width: 48, height: 48 };
        this.data = data;
        this.position = { x, y };
        this.id = `${data.linkedAnimal}_${data.type}_${x}_${y}`;
    }
    getId() {
        return this.id;
    }
    getData() {
        return this.data;
    }
    getPosition() {
        return this.position;
    }
    getSize() {
        return this.size;
    }
    getLinkedAnimal() {
        return this.data.linkedAnimal;
    }
    isDiscovered() {
        return this.discovered;
    }
    isCollected() {
        return this.collected;
    }
    discover() {
        this.discovered = true;
    }
    collect() {
        this.collected = true;
    }
    update(deltaTime) {
        this.animationFrame += deltaTime * 0.003;
        // Glowing effect for undiscovered evidence
        if (!this.discovered) {
            this.glowIntensity = Math.sin(this.animationFrame * 2) * 0.3 + 0.7;
        }
    }
    render(ctx, cameraX, cameraY) {
        if (this.collected)
            return;
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        ctx.save();
        // Glow effect for undiscovered
        if (!this.discovered) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15 * this.glowIntensity;
        }
        // Background circle
        ctx.fillStyle = this.discovered ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 193, 7, 0.8)';
        ctx.beginPath();
        ctx.arc(screenX + this.size.width / 2, screenY + this.size.height / 2, 24, 0, Math.PI * 2);
        ctx.fill();
        // Border
        ctx.strokeStyle = this.discovered ? '#2E7D32' : '#F57C00';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(this.data.icon, screenX + this.size.width / 2, screenY + this.size.height / 2);
        // Question mark for undiscovered
        if (!this.discovered) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.arc(screenX + this.size.width / 2, screenY + this.size.height / 2, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('?', screenX + this.size.width / 2, screenY + this.size.height / 2);
        }
        ctx.restore();
    }
    renderInteractionPrompt(ctx, cameraX, cameraY, language) {
        if (this.collected)
            return;
        const screenX = this.position.x - cameraX + this.size.width / 2;
        const screenY = this.position.y - cameraY - 20;
        const text = language === 'nl' ? 'Druk E om te onderzoeken' : 'Press E to investigate';
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(screenX - textWidth / 2 - 10, screenY - 10, textWidth + 20, 24);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(text, screenX, screenY + 5);
        ctx.restore();
    }
}
// Helper to generate evidence for an animal
export function generateEvidenceForAnimal(animalId, animalX, animalY) {
    const evidenceList = EVIDENCE_DATABASE[animalId];
    if (!evidenceList)
        return [];
    const result = [];
    evidenceList.forEach((evidenceData, index) => {
        // Spread evidence around the animal's location
        const angle = (index / evidenceList.length) * Math.PI * 2;
        const distance = 150 + Math.random() * 200; // 150-350 pixels away
        const evidenceX = animalX + Math.cos(angle) * distance;
        const evidenceY = animalY + Math.sin(angle) * distance;
        result.push(new Evidence(evidenceData, evidenceX, evidenceY));
    });
    return result;
}
//# sourceMappingURL=Evidence.js.map