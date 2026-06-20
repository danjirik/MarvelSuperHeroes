export const archetypesData = [
  {
    id: "UB",
    name: "Dimir (Modro-Černá)",
    theme: "Lízání druhé karty a filtrace (Draw Second Card)",
    tier2HG: "S",
    keyCards: ["Kang, Temporal Tyrant", "Mister Fantastic, Reed Richards", "Doctor Doom"],
    strategy: "Absolutní král formátu. Pomalá, kontrolní povaha dokonale zapadá do 2HG. Lízání karet spouští pasivní odčerpávání životů soupeřů bez nutnosti útočit na zemi. Connive filtruje nepotřebné země."
  },
  {
    id: "BR",
    name: "Rakdos (Černo-Červená)",
    theme: "Synergie padouchů (Villains Matter)",
    tier2HG: "S",
    keyCards: ["Crossbones, Malicious Mercenary", "Doctor Doom", "The Ruinous Wrecking Crew"],
    strategy: "Elitní agresivní platforma. Padouši (Villains) disponují Menace (vyžadují 2 blockery), což vyčerpává obranu oponentů. Má přístup k nejlepším 'each opponent' efektům a bleskovému removalu."
  },
  {
    id: "WU",
    name: "Azorius (Bílo-Modrá)",
    theme: "Týmové tempo a létání (Teamwork Tempo)",
    tier2HG: "A",
    keyCards: ["Captain America, Wings of Freedom", "S.H.I.E.L.D. Deployment Drone", "Murdock's Crusade"],
    strategy: "Využívá letce k obcházení zablokované země a Vigilance bytosti, které útočí a zároveň zůstávají připraveny tapnout se do Teamwork kouzel v oponentově tahu. Skvěle kontroluje bojiště."
  },
  {
    id: "UR",
    name: "Izzet (Modro-Červená)",
    theme: "Akumulace artefaktů (Artifacts)",
    tier2HG: "A",
    keyCards: ["I Am Iron Man", "The Mind Stone", "Mjölnir, Hammer of Thor"],
    strategy: "Generování hodnoty z artefaktových tokenů. Pomalý rozjezd kompenzuje extrémně silným late-game enginem. Dokáže přetvořit neužitečné Clues/Treasure na 4/4 letce a přeletět obranu."
  },
  {
    id: "BG",
    name: "Golgari (Černo-Zelená)",
    theme: "Přeplnění hřbitova (Graveyard / 2+ Creatures)",
    tier2HG: "A",
    keyCards: ["Undercover Skrull", "HYDRA Troopers", "Cruel Alliance"],
    strategy: "Vynikající defenzivní a podpůrný archetyp. Podmínka dvou bytostí v hrobě se v 2HG splní téměř sama. Získává obrovská těla za nízkou cenu, která tvoří neprostupnou zeď na zemi."
  },
  {
    id: "GW",
    name: "Selesnya (Zeleno-Bílá)",
    theme: "Synergie hrdinů (Heroes Matter)",
    tier2HG: "B",
    keyCards: ["Avengers Assemble!", "Hero in Training", "Ka-Zar of the Savage Land"],
    strategy: "Go-wide strategie (stavění širokého stolu). Pozor na to, že plošné buffy (jako Avengers Assemble) posilují pouze vaše jednotky, nikoliv spoluhráčovy. Vyžaduje proaktivní přístup."
  },
  {
    id: "RG",
    name: "Gruul (Červeno-Zelená)",
    theme: "Dominance skrze Power-up (Power-Up Stompy)",
    tier2HG: "B",
    keyCards: ["Hulk, Gamma Goliath", "She-Hulk, Jade Defender", "Go Nuts!"],
    strategy: "Sází na obří bytosti a jejich posilování. V 2HG čelí riziku double removalu od dvou soupeřů. K úspěchu nezbytně potřebuje podporu partnera s protikouzly (counterspells) nebo ochranou."
  },
  {
    id: "GU",
    name: "Simic (Zeleno-Modrá)",
    theme: "Manipulace žetonů (+1/+1 Counters)",
    tier2HG: "B",
    keyCards: ["Undercover Skrull", "Mister Fantastic, Reed Richards", "She-Hulk, Jade Defender"],
    strategy: "Manipulace s +1/+1 žetony a Power-up. Skvěle škáluje do pozdní hry, ale chybí mu rychlé odpovědi a přímé odčerpávání životů. Dobrý partner pro dominantní agresivnější balíky."
  },
  {
    id: "WR",
    name: "Boros (Červeno-Bílá)",
    theme: "Podpora nebytostních kouzel (Spells & Equipment)",
    tier2HG: "B",
    keyCards: ["Lightning Strike", "HULK SMASH!", "Mjölnir, Hammer of Thor"],
    strategy: "Založeno na vybavení (Equipment) a tricích. Sestavení jednoho super-vojáka je zranitelné vůči zničení či exilu od soupeřů. Boros má dobré tempo, ale v 2HG naráží na zablokovanou zem."
  },
  {
    id: "WB",
    name: "Orzhov (Bílo-Černá)",
    theme: "Singularitní agresivita (Attack Alone)",
    tier2HG: "F",
    keyCards: ["Agent 13, Sharon Carter", "Black Widow, Daring Operative", "Take Up the Shield"],
    strategy: "Sebevražedná strategie pro 2HG. Mechaniky nutící útočit jednou bytostí (Attack Alone) naprosto selhávají proti spojeným obráncům dvou hráčů. Tělo je snadno zablokováno a zabito."
  }
];

export const evaluatePairing = (deckA_id, deckB_id) => {
  if (!deckA_id || !deckB_id) return null;
  
  // Sort keys to normalize search
  const key = [deckA_id, deckB_id].sort().join("-");
  
  // Extract colors
  const getColors = (id) => {
    switch (id) {
      case "UB": return ["U", "B"];
      case "BR": return ["B", "R"];
      case "WU": return ["W", "U"];
      case "UR": return ["U", "R"];
      case "BG": return ["B", "G"];
      case "GW": return ["G", "W"];
      case "RG": return ["R", "G"];
      case "GU": return ["G", "U"];
      case "WR": return ["W", "R"];
      case "WB": return ["W", "B"];
      default: return [];
    }
  };
  
  const colorsA = getColors(deckA_id);
  const colorsB = getColors(deckB_id);
  
  // Count overlaps
  const overlaps = colorsA.filter(c => colorsB.includes(c));
  
  // Premium custom pairings
  const premiums = {
    "RG-UB": {
      tier: "S",
      title: "Dokonalá doplňková asymetrie (Gruul + Dimir)",
      synergies: [
        "Gruul vyvolává masivní hrozby (Hulk), které přitahují veškerou pozornost a blokují pozemní útoky soupeřů.",
        "Dimir mezitím bezpečně filtruje karty a pasivně odčerpává životy soupeřů (Kang, Doctor Doom) bez nutnosti útočit.",
        "Nulový překryv barev maximalizuje kvalitu obou balíků z 12-booster Sealed poolu."
      ],
      risks: [
        "Pokud Gruul nepoloží včas velké nestvůry, Dimir sám neudrží agresivní nápor oponentů."
      ]
    },
    "BG-UR": {
      tier: "S",
      title: "Ekonomický motor a pevná zeď (Golgari + Izzet)",
      synergies: [
        "Golgari drží pozemní obranu a využívá levné, silné blockery těžící ze hřbitova (Undercover Skrull, HYDRA Troopers).",
        "Izzet má volné ruce k budování masivní karetní a artefaktové výhody (The Mind Stone) a útočení vzduchem.",
        "Komplementární křivky a žádný překryv barev."
      ],
      risks: [
        "Nedostatek přímého tlaku na životy v rané fázi hry může dát čas soupeřovým Plan kartám."
      ]
    },
    "BR-GW": {
      tier: "A",
      title: "Marvelovská občanská válka (Rakdos + Selesnya)",
      synergies: [
        "Selesnya zaplaví stůl hrdiny a tokeny, čímž vytvoří neprůchodnou obrannou čáru.",
        "Rakdos v bezpečí sesílá padouchy a spouští asymetrické ETB a combat efekty (Crossbones, Black Widow) pro drtivé životní rány.",
        "Nulový překryv barev."
      ],
      risks: [
        "Plošná posílení Selesnye (Avengers Assemble!) nepomáhají Rakdosu, což vyžaduje přesné časování útoků."
      ]
    },
    "BR-WU": {
      tier: "A",
      title: "Týmová kontrola a destrukce (Rakdos + Azorius)",
      synergies: [
        "Azorius drží vzduch a využívá Teamwork (Murdock's Crusade) k odstraňování hrozeb s tichým krytím.",
        "Rakdos provádí bleskový removal (Dark Deed) a tlačí na životy skrz asymetrické mechaniky.",
        "Doporučuje se rozdělit černou/červenou a bílou/modrou, žádné barvy se nebudou překrývat."
      ],
      risks: [
        "Oba balíčky chtějí hrát spíše reaktivně v soupeřových tahách, což může někdy zpomalit vlastní vývoj stolu."
      ]
    }
  };
  
  if (premiums[key]) {
    return premiums[key];
  }
  
  // Orzhov (WB) warning
  if (deckA_id === "WB" || deckB_id === "WB") {
    return {
      tier: "F",
      title: "Nefunkční kompozice s Orzhovem",
      synergies: [
        "Oba balíčky mohou sice hrát jiné silné karty, ale mechanika 'Attack Alone' je v 2HG téměř nepoužitelná."
      ],
      risks: [
        "Klíčový spouštěč Orzhovu (útočení osamoceně) je snadno blokován zdvojenou obranou dvou hráčů.",
        "Vysoké riziko ztráty tempa a nefunkčnosti herního plánu."
      ]
    };
  }
  
  // Check heavy overlap (sharing 2 colors, meaning it's the exact same deck or variant)
  if (overlaps.length === 2) {
    return {
      tier: "F",
      title: "Kritický překryv barev (Stejné barvy)",
      synergies: [
        "Žádné. Balíčky sdílejí přesně stejné dvě barvy."
      ],
      risks: [
        "V 2HG Sealed stavíte ze společného poolu 12 boosterů. Stavět dva balíky ve stejných barvách znamená, že budete mít extrémní nedostatek hratelných karet a slabou mana křivku.",
        "Zcela se vyhněte tomuto párování!"
      ]
    };
  }
  
  // Mild overlap (sharing 1 color)
  if (overlaps.length === 1) {
    const sharedColor = overlaps[0];
    const colorNames = { "W": "Bílou", "U": "Modrou", "B": "Černou", "R": "Červenou", "G": "Zelenou" };
    return {
      tier: "C",
      title: "Částečný překryv barev",
      synergies: [
        "Dvě odlišné strategie, které mohou mít dobrou taktickou koordinaci."
      ],
      risks: [
        `Oba balíky sdílejí ${colorNames[sharedColor]} barvu. Budete muset rozdělit klíčové karty této barvy mezi sebe, což oslabí obě strany.`,
        "Doporučujeme jednomu hráči tuto barvu omezit pouze na malou splash s fixací."
      ]
    };
  }
  
  // Default good non-overlapping pairing
  return {
    tier: "B",
    title: "Standardní bezkonfliktní párování",
    synergies: [
      "Nulový překryv barev zaručuje, že oba balíky dostanou ty nejlepší karty ve svých barvách ze Sealed poolu.",
      "Čisté rozdělení rolí a nezávislý vývoj many."
    ],
    risks: [
      "Chybí zde specifické prémiové synergie mezi tématy balíčků (např. go-wide se stompy se doplňuje méně efektivně než kontrol se stompy)."
    ]
  };
};
