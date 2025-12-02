// Animal facts database - kid-friendly information about each animal

export interface AnimalFacts {
    name: { nl: string; en: string };
    scientificName: string;
    habitat: { nl: string; en: string };
    diet: { nl: string; en: string };
    funFacts: { nl: string[]; en: string[] };
    size: { nl: string; en: string };
    lifespan: { nl: string; en: string };
}

export const ANIMAL_FACTS: Record<string, AnimalFacts> = {
    // Beach animals
    crab: {
        name: { nl: 'Krab', en: 'Crab' },
        scientificName: 'Brachyura',
        habitat: { nl: 'Stranden, rotskusten en de zeebodem', en: 'Beaches, rocky shores and the sea floor' },
        diet: { nl: 'Algen, wormen, kleine vissen en schelpdieren', en: 'Algae, worms, small fish and shellfish' },
        funFacts: {
            nl: ['Krabben lopen zijwaarts!', 'Ze hebben 10 poten', 'Hun schild heet een "carapace"'],
            en: ['Crabs walk sideways!', 'They have 10 legs', 'Their shell is called a "carapace"']
        },
        size: { nl: '2-40 cm breed', en: '2-40 cm wide' },
        lifespan: { nl: '3-30 jaar', en: '3-30 years' }
    },
    seagull: {
        name: { nl: 'Zeemeeuw', en: 'Seagull' },
        scientificName: 'Larus',
        habitat: { nl: 'Kusten, havens en steden bij de zee', en: 'Coasts, harbors and cities by the sea' },
        diet: { nl: 'Vis, krabben, afval en brood', en: 'Fish, crabs, garbage and bread' },
        funFacts: {
            nl: ['Meeuwen kunnen zout water drinken!', 'Ze leven in grote groepen', 'Ze zijn heel slim'],
            en: ['Seagulls can drink salt water!', 'They live in large groups', 'They are very clever']
        },
        size: { nl: '40-65 cm lang', en: '40-65 cm long' },
        lifespan: { nl: '10-15 jaar', en: '10-15 years' }
    },
    turtle: {
        name: { nl: 'Zeeschildpad', en: 'Sea Turtle' },
        scientificName: 'Cheloniidae',
        habitat: { nl: 'Tropische en subtropische oceanen', en: 'Tropical and subtropical oceans' },
        diet: { nl: 'Zeegras, kwallen en sponzen', en: 'Seagrass, jellyfish and sponges' },
        funFacts: {
            nl: ['Ze kunnen 100 jaar oud worden!', 'Ze leggen eieren op het strand', 'Ze kunnen hun adem 7 uur inhouden'],
            en: ['They can live to 100 years!', 'They lay eggs on the beach', 'They can hold their breath for 7 hours']
        },
        size: { nl: '60 cm - 2 meter', en: '60 cm - 2 meters' },
        lifespan: { nl: '50-100 jaar', en: '50-100 years' }
    },
    starfish: {
        name: { nl: 'Zeester', en: 'Starfish' },
        scientificName: 'Asteroidea',
        habitat: { nl: 'Zeebodems wereldwijd', en: 'Sea floors worldwide' },
        diet: { nl: 'Mosselen, oesters en kleine dieren', en: 'Mussels, oysters and small animals' },
        funFacts: {
            nl: ['Ze kunnen een verloren arm laten teruggroeien!', 'Ze hebben geen hersenen', 'Sommige hebben 40 armen'],
            en: ['They can regrow a lost arm!', 'They have no brain', 'Some have 40 arms']
        },
        size: { nl: '10-30 cm', en: '10-30 cm' },
        lifespan: { nl: '5-35 jaar', en: '5-35 years' }
    },
    pelican: {
        name: { nl: 'Pelikaan', en: 'Pelican' },
        scientificName: 'Pelecanus',
        habitat: { nl: 'Kusten en meren', en: 'Coasts and lakes' },
        diet: { nl: 'Vis - tot 4 kg per dag!', en: 'Fish - up to 4 kg per day!' },
        funFacts: {
            nl: ['Hun keelzak kan 11 liter water bevatten!', 'Ze vissen in groepen', 'Ze zijn uitstekende vliegers'],
            en: ['Their throat pouch can hold 11 liters!', 'They fish in groups', 'They are excellent flyers']
        },
        size: { nl: '1-1.8 meter', en: '1-1.8 meters' },
        lifespan: { nl: '15-25 jaar', en: '15-25 years' }
    },

    // Forest animals
    deer: {
        name: { nl: 'Hert', en: 'Deer' },
        scientificName: 'Cervidae',
        habitat: { nl: 'Bossen en graslanden', en: 'Forests and grasslands' },
        diet: { nl: 'Gras, bladeren, noten en bessen', en: 'Grass, leaves, nuts and berries' },
        funFacts: {
            nl: ['Alleen mannetjes hebben geweien', 'Ze verliezen elk jaar hun gewei', 'Baby\'s hebben witte vlekken'],
            en: ['Only males have antlers', 'They lose their antlers every year', 'Babies have white spots']
        },
        size: { nl: '1-1.5 meter hoog', en: '1-1.5 meters tall' },
        lifespan: { nl: '10-20 jaar', en: '10-20 years' }
    },
    rabbit: {
        name: { nl: 'Konijn', en: 'Rabbit' },
        scientificName: 'Oryctolagus cuniculus',
        habitat: { nl: 'Bossen, weilanden en tuinen', en: 'Forests, meadows and gardens' },
        diet: { nl: 'Gras, klaver, wortels en groenten', en: 'Grass, clover, carrots and vegetables' },
        funFacts: {
            nl: ['Ze kunnen 360 graden om zich heen kijken!', 'Hun tanden groeien altijd door', 'Ze leven in grote families'],
            en: ['They can see 360 degrees around them!', 'Their teeth never stop growing', 'They live in big families']
        },
        size: { nl: '30-50 cm lang', en: '30-50 cm long' },
        lifespan: { nl: '8-12 jaar', en: '8-12 years' }
    },
    squirrel: {
        name: { nl: 'Eekhoorn', en: 'Squirrel' },
        scientificName: 'Sciurus',
        habitat: { nl: 'Bossen en parken met veel bomen', en: 'Forests and parks with many trees' },
        diet: { nl: 'Noten, zaden, bessen en paddenstoelen', en: 'Nuts, seeds, berries and mushrooms' },
        funFacts: {
            nl: ['Ze verstoppen duizenden noten per jaar!', 'Hun staart helpt met balans', 'Ze kunnen 6 meter ver springen'],
            en: ['They hide thousands of nuts per year!', 'Their tail helps with balance', 'They can jump 6 meters far']
        },
        size: { nl: '20-30 cm (+ staart)', en: '20-30 cm (+ tail)' },
        lifespan: { nl: '5-10 jaar', en: '5-10 years' }
    },
    owl: {
        name: { nl: 'Uil', en: 'Owl' },
        scientificName: 'Strigiformes',
        habitat: { nl: 'Bossen, parken en oude gebouwen', en: 'Forests, parks and old buildings' },
        diet: { nl: 'Muizen, ratten en kleine vogels', en: 'Mice, rats and small birds' },
        funFacts: {
            nl: ['Ze kunnen hun hoofd 270° draaien!', 'Ze vliegen bijna geruisloos', 'Ze slikken prooi in één keer door'],
            en: ['They can rotate their head 270°!', 'They fly almost silently', 'They swallow prey in one piece']
        },
        size: { nl: '20-70 cm', en: '20-70 cm' },
        lifespan: { nl: '10-25 jaar', en: '10-25 years' }
    },
    fox: {
        name: { nl: 'Vos', en: 'Fox' },
        scientificName: 'Vulpes vulpes',
        habitat: { nl: 'Bossen, velden en soms steden', en: 'Forests, fields and sometimes cities' },
        diet: { nl: 'Konijnen, muizen, bessen en afval', en: 'Rabbits, mice, berries and garbage' },
        funFacts: {
            nl: ['Ze gebruiken het aardmagnetisme om te jagen!', 'Ze zijn familie van honden', 'Ze leven alleen, niet in roedels'],
            en: ['They use Earth\'s magnetic field to hunt!', 'They are related to dogs', 'They live alone, not in packs']
        },
        size: { nl: '60-90 cm lang', en: '60-90 cm long' },
        lifespan: { nl: '3-6 jaar in het wild', en: '3-6 years in the wild' }
    },
    wolf: {
        name: { nl: 'Wolf', en: 'Wolf' },
        scientificName: 'Canis lupus',
        habitat: { nl: 'Bossen, bergen en toendra', en: 'Forests, mountains and tundra' },
        diet: { nl: 'Herten, elanden en kleinere dieren', en: 'Deer, elk and smaller animals' },
        funFacts: {
            nl: ['Ze leven in families die "roedels" heten', 'Hun gehuil is tot 16 km ver te horen', 'Ze zijn de voorouders van honden'],
            en: ['They live in families called "packs"', 'Their howl can be heard 16 km away', 'They are the ancestors of dogs']
        },
        size: { nl: '1-1.5 meter lang', en: '1-1.5 meters long' },
        lifespan: { nl: '6-13 jaar', en: '6-13 years' }
    },
    hedgehog: {
        name: { nl: 'Egel', en: 'Hedgehog' },
        scientificName: 'Erinaceus europaeus',
        habitat: { nl: 'Tuinen, hagen en bosranden', en: 'Gardens, hedges and forest edges' },
        diet: { nl: 'Insecten, slakken en wormen', en: 'Insects, snails and worms' },
        funFacts: {
            nl: ['Ze hebben 5000-7000 stekels!', 'Ze rollen zich op als een bal', 'Ze houden een winterslaap'],
            en: ['They have 5000-7000 spines!', 'They roll into a ball', 'They hibernate in winter']
        },
        size: { nl: '20-30 cm lang', en: '20-30 cm long' },
        lifespan: { nl: '3-7 jaar', en: '3-7 years' }
    },

    // Jungle animals
    parrot: {
        name: { nl: 'Papegaai', en: 'Parrot' },
        scientificName: 'Psittaciformes',
        habitat: { nl: 'Tropische regenwouden', en: 'Tropical rainforests' },
        diet: { nl: 'Zaden, noten, fruit en bloemen', en: 'Seeds, nuts, fruit and flowers' },
        funFacts: {
            nl: ['Ze kunnen menselijke spraak nadoen!', 'Sommige worden 80 jaar oud', 'Ze leven in grote groepen'],
            en: ['They can imitate human speech!', 'Some live to 80 years', 'They live in large flocks']
        },
        size: { nl: '10-100 cm', en: '10-100 cm' },
        lifespan: { nl: '20-80 jaar', en: '20-80 years' }
    },
    monkey: {
        name: { nl: 'Aap', en: 'Monkey' },
        scientificName: 'Primates',
        habitat: { nl: 'Tropische bossen en jungle', en: 'Tropical forests and jungle' },
        diet: { nl: 'Fruit, bladeren, insecten en noten', en: 'Fruit, leaves, insects and nuts' },
        funFacts: {
            nl: ['Ze gebruiken gereedschap!', 'Ze leven in sociale groepen', 'Sommige hebben grijpstaarten'],
            en: ['They use tools!', 'They live in social groups', 'Some have prehensile tails']
        },
        size: { nl: '15 cm - 1 meter', en: '15 cm - 1 meter' },
        lifespan: { nl: '15-40 jaar', en: '15-40 years' }
    },
    snake: {
        name: { nl: 'Slang', en: 'Snake' },
        scientificName: 'Serpentes',
        habitat: { nl: 'Overal behalve Antarctica', en: 'Everywhere except Antarctica' },
        diet: { nl: 'Muizen, vogels, eieren en kikkers', en: 'Mice, birds, eggs and frogs' },
        funFacts: {
            nl: ['Ze ruiken met hun tong!', 'Ze hebben geen oogleden', 'Ze vervellen hun huid meerdere keren per jaar'],
            en: ['They smell with their tongue!', 'They have no eyelids', 'They shed their skin several times a year']
        },
        size: { nl: '10 cm - 10 meter', en: '10 cm - 10 meters' },
        lifespan: { nl: '10-30 jaar', en: '10-30 years' }
    },
    toucan: {
        name: { nl: 'Toekan', en: 'Toucan' },
        scientificName: 'Ramphastidae',
        habitat: { nl: 'Tropische regenwouden van Zuid-Amerika', en: 'Tropical rainforests of South America' },
        diet: { nl: 'Fruit, bessen en kleine dieren', en: 'Fruit, berries and small animals' },
        funFacts: {
            nl: ['Hun snavel kan 20 cm lang zijn!', 'De snavel is hol en licht', 'Ze slapen met hun snavel op hun rug'],
            en: ['Their beak can be 20 cm long!', 'The beak is hollow and light', 'They sleep with their beak on their back']
        },
        size: { nl: '40-65 cm', en: '40-65 cm' },
        lifespan: { nl: '15-20 jaar', en: '15-20 years' }
    },
    jaguar: {
        name: { nl: 'Jaguar', en: 'Jaguar' },
        scientificName: 'Panthera onca',
        habitat: { nl: 'Regenwouden en moerassen', en: 'Rainforests and swamps' },
        diet: { nl: 'Herten, krokodillen en schildpadden', en: 'Deer, crocodiles and turtles' },
        funFacts: {
            nl: ['Ze zijn de sterkste grote kat!', 'Ze houden van zwemmen', 'Elke jaguar heeft unieke vlekken'],
            en: ['They are the strongest big cat!', 'They love swimming', 'Each jaguar has unique spots']
        },
        size: { nl: '1.2-1.9 meter', en: '1.2-1.9 meters' },
        lifespan: { nl: '12-15 jaar', en: '12-15 years' }
    },
    frog: {
        name: { nl: 'Kikker', en: 'Frog' },
        scientificName: 'Anura',
        habitat: { nl: 'Natte gebieden: moerassen, vijvers, jungle', en: 'Wet areas: swamps, ponds, jungle' },
        diet: { nl: 'Insecten, wormen en kleine dieren', en: 'Insects, worms and small animals' },
        funFacts: {
            nl: ['Ze drinken door hun huid!', 'Sommige zijn giftig', 'Ze kunnen 20x hun lichaamslengte springen'],
            en: ['They drink through their skin!', 'Some are poisonous', 'They can jump 20x their body length']
        },
        size: { nl: '1-30 cm', en: '1-30 cm' },
        lifespan: { nl: '5-15 jaar', en: '5-15 years' }
    },

    // Desert animals
    camel: {
        name: { nl: 'Kameel', en: 'Camel' },
        scientificName: 'Camelus',
        habitat: { nl: 'Woestijnen van Afrika en Azië', en: 'Deserts of Africa and Asia' },
        diet: { nl: 'Cactussen, gras en bladeren', en: 'Cacti, grass and leaves' },
        funFacts: {
            nl: ['Ze slaan vet op in hun bulten, geen water!', 'Ze kunnen 200 liter water drinken', 'Ze kunnen een week zonder water'],
            en: ['They store fat in their humps, not water!', 'They can drink 200 liters of water', 'They can go a week without water']
        },
        size: { nl: '2-2.3 meter hoog', en: '2-2.3 meters tall' },
        lifespan: { nl: '40-50 jaar', en: '40-50 years' }
    },
    scorpion: {
        name: { nl: 'Schorpioen', en: 'Scorpion' },
        scientificName: 'Scorpiones',
        habitat: { nl: 'Woestijnen en droge gebieden', en: 'Deserts and dry areas' },
        diet: { nl: 'Insecten, spinnen en kleine dieren', en: 'Insects, spiders and small animals' },
        funFacts: {
            nl: ['Ze gloeien onder UV-licht!', 'Ze kunnen een jaar zonder eten', 'Baby\'s rijden op mama\'s rug'],
            en: ['They glow under UV light!', 'They can survive a year without food', 'Babies ride on mom\'s back']
        },
        size: { nl: '2-20 cm', en: '2-20 cm' },
        lifespan: { nl: '3-8 jaar', en: '3-8 years' }
    },
    lizard: {
        name: { nl: 'Hagedis', en: 'Lizard' },
        scientificName: 'Lacertilia',
        habitat: { nl: 'Woestijnen, bossen en rotsen', en: 'Deserts, forests and rocks' },
        diet: { nl: 'Insecten, spinnen en planten', en: 'Insects, spiders and plants' },
        funFacts: {
            nl: ['Sommige kunnen hun staart afwerpen!', 'Ze zijn koudbloedig', 'Er zijn meer dan 6000 soorten'],
            en: ['Some can drop their tail!', 'They are cold-blooded', 'There are over 6000 species']
        },
        size: { nl: '5 cm - 3 meter', en: '5 cm - 3 meters' },
        lifespan: { nl: '3-50 jaar', en: '3-50 years' }
    },
    meerkat: {
        name: { nl: 'Stokstaartje', en: 'Meerkat' },
        scientificName: 'Suricata suricatta',
        habitat: { nl: 'Woestijnen en graslanden van Afrika', en: 'Deserts and grasslands of Africa' },
        diet: { nl: 'Insecten, schorpioenen en hagedissen', en: 'Insects, scorpions and lizards' },
        funFacts: {
            nl: ['Ze staan op wacht voor gevaar!', 'Ze leven in grote families tot 50 dieren', 'Ze zijn immuun voor gif'],
            en: ['They stand guard for danger!', 'They live in families up to 50', 'They are immune to some venoms']
        },
        size: { nl: '25-35 cm', en: '25-35 cm' },
        lifespan: { nl: '12-14 jaar', en: '12-14 years' }
    },

    // Arctic animals
    penguin: {
        name: { nl: 'Pinguïn', en: 'Penguin' },
        scientificName: 'Spheniscidae',
        habitat: { nl: 'Antarctica en koude kustgebieden', en: 'Antarctica and cold coastal areas' },
        diet: { nl: 'Vis, inktvis en krill', en: 'Fish, squid and krill' },
        funFacts: {
            nl: ['Ze kunnen niet vliegen maar wel zwemmen!', 'Ze huddlen samen voor warmte', 'Papa\'s broeden de eieren uit'],
            en: ['They cannot fly but can swim!', 'They huddle together for warmth', 'Dads incubate the eggs']
        },
        size: { nl: '40 cm - 1.2 meter', en: '40 cm - 1.2 meters' },
        lifespan: { nl: '15-20 jaar', en: '15-20 years' }
    },
    polar_bear: {
        name: { nl: 'IJsbeer', en: 'Polar Bear' },
        scientificName: 'Ursus maritimus',
        habitat: { nl: 'Arctische ijsvlakten', en: 'Arctic ice sheets' },
        diet: { nl: 'Zeehonden, vis en walrussen', en: 'Seals, fish and walruses' },
        funFacts: {
            nl: ['Hun vacht is eigenlijk doorzichtig!', 'Ze hebben zwarte huid', 'Ze kunnen 100 km zwemmen'],
            en: ['Their fur is actually transparent!', 'They have black skin', 'They can swim 100 km']
        },
        size: { nl: '2-3 meter lang', en: '2-3 meters long' },
        lifespan: { nl: '25-30 jaar', en: '25-30 years' }
    },
    arctic_fox: {
        name: { nl: 'Poolvos', en: 'Arctic Fox' },
        scientificName: 'Vulpes lagopus',
        habitat: { nl: 'Arctische toendra', en: 'Arctic tundra' },
        diet: { nl: 'Lemmingen, vogels en vis', en: 'Lemmings, birds and fish' },
        funFacts: {
            nl: ['Hun vacht verandert van kleur per seizoen!', 'Ze kunnen -50°C overleven', 'Ze hebben de warmste vacht van alle dieren'],
            en: ['Their fur changes color by season!', 'They can survive -50°C', 'They have the warmest fur of all animals']
        },
        size: { nl: '45-70 cm', en: '45-70 cm' },
        lifespan: { nl: '3-6 jaar', en: '3-6 years' }
    },
    seal: {
        name: { nl: 'Zeehond', en: 'Seal' },
        scientificName: 'Phocidae',
        habitat: { nl: 'Koude zeeën en ijsschotsen', en: 'Cold seas and ice floes' },
        diet: { nl: 'Vis, inktvis en krill', en: 'Fish, squid and krill' },
        funFacts: {
            nl: ['Ze kunnen 2 uur onder water blijven!', 'Ze slapen in het water', 'Baby zeehondjes zijn wit'],
            en: ['They can stay underwater for 2 hours!', 'They sleep in the water', 'Baby seals are white']
        },
        size: { nl: '1-3 meter', en: '1-3 meters' },
        lifespan: { nl: '25-35 jaar', en: '25-35 years' }
    },
    snowy_owl: {
        name: { nl: 'Sneeuwuil', en: 'Snowy Owl' },
        scientificName: 'Bubo scandiacus',
        habitat: { nl: 'Arctische toendra', en: 'Arctic tundra' },
        diet: { nl: 'Lemmingen, konijnen en vogels', en: 'Lemmings, rabbits and birds' },
        funFacts: {
            nl: ['Ze zijn overdag actief, niet \'s nachts!', 'Mannetjes zijn bijna helemaal wit', 'Ze kunnen tot 300 lemmingen per jaar eten'],
            en: ['They are active during the day, not at night!', 'Males are almost completely white', 'They can eat up to 300 lemmings per year']
        },
        size: { nl: '50-70 cm', en: '50-70 cm' },
        lifespan: { nl: '10-15 jaar', en: '10-15 years' }
    }
};
