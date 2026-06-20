import { archetypesData, evaluatePairing } from '../data/archetypesData';

// Pomocná tabulka pro převod Tier hodnocení na body
const TIER_SCORES = {
  'S': 10.0,
  'A': 8.0,
  'B': 6.0,
  'C': 4.0,
  'D': 2.0,
  'F': 0.0,
  'None': 0.0
};

/**
 * Spočítá dynamickou sílu karty s ohledem na 2HG specifické modifikátory.
 */
export function getCard2HGScore(card) {
  let score = TIER_SCORES[card.tier2HG] || TIER_SCORES['None'];
  
  if (!card.description) return score;
  
  const desc = card.description.toLowerCase();
  
  // 1. Efekty cílící na oba oponenty ("each opponent" / "each player" / "each opponent loses")
  if (desc.includes('each opponent') || desc.includes('each player') || desc.includes('opponents control')) {
    score += 2.0;
  }
  
  // 2. Mechanika Teamwork (týmová spolupráce)
  if (desc.includes('teamwork')) {
    score += 1.5;
  }
  
  // 3. Mechanika Support (pokládání žetonů na jiné bytosti, i spoluhráče)
  if (desc.includes('support ') || desc.includes('put a +1/+1 counter on another target') || desc.includes('another creature')) {
    score += 1.0;
  }
  
  // 4. Mechanika Attack Alone (v 2HG extrémně slabá)
  if (desc.includes('attacks alone') || desc.includes('attack alone')) {
    score -= 3.0;
  }
  
  return Math.max(0.1, score);
}

/**
 * Odhadne konvertovanou mana cenu (CMC) karty na základě textu "cost".
 */
export function getCardCMC(card) {
  if (!card.cost || card.type?.includes('Land')) return 0;
  
  // Odstraníme složené závorky {} a spočítáme čísla + barevné symboly
  const cleanCost = card.cost.replace(/[{}]/g, '');
  let cmc = 0;
  
  // Najdeme čísla (např. {3} -> 3)
  const numbers = cleanCost.match(/\d+/g);
  if (numbers) {
    numbers.forEach(num => {
      cmc += parseInt(num);
    });
  }
  
  // Najdeme jednotlivé barevné / hybridní symboly (např. W, U, B, R, G, R/G)
  // Odstraníme číslice, abychom dostali jen písmena
  const letters = cleanCost.replace(/\d+/g, '');
  // Každý symbol je buď jedno písmeno (W, U, B, R, G) nebo hybrid (R/G)
  // Zjednodušeně spočítáme počet symbolů rozdělením
  const symbols = letters.split('/').join('').length;
  // Pokud letters obsahuje hybridní symboly jako R/G, výše uvedená délka by byla 2,
  // ale ve skutečnosti je to 1 mana symbol. Opravíme to:
  const hybridCount = (letters.match(/\//g) || []).length;
  
  cmc += (symbols - hybridCount);
  
  return cmc;
}

/**
 * Zjistí, zda karta patří do dané barvy (nebo barevné kombinace).
 */
export function isCardInColors(card, allowedColors) {
  if (!card.color || card.color.length === 0) return true; // Bezbarvá
  
  // Pokud karta obsahuje 'Multicolor', musíme prověřit její skutečný manový kód 'cost'
  if (card.color.includes('Multicolor')) {
    const cost = card.cost || '';
    const colorsInCost = [];
    ['W', 'U', 'B', 'R', 'G'].forEach(c => {
      if (cost.includes(c)) colorsInCost.push(c);
    });
    // Karta je hratelná, pokud všechny její barvy v cost jsou v allowedColors
    if (colorsInCost.length === 0) return true;
    return colorsInCost.every(c => allowedColors.includes(c));
  }
  
  // Pro standardní barvy
  return card.color.every(c => allowedColors.includes(c) || c === 'Colorless');
}

/**
 * Hlavní optimalizační funkce. Vezme pool naskenovaných karet a navrhne 2 balíčky.
 */
export function optimizeSealedPool(scannedCards, fullCardsDatabase) {
  if (!scannedCards || scannedCards.length === 0) {
    return { error: 'Prázdný pool karet.' };
  }

  // 1. Zmapujeme naskenovaná data na plnohodnotné objekty z databáze karet
  // a vytvoříme pole instancí (při duplikátech)
  const poolInstances = [];
  scannedCards.forEach((sc, index) => {
    const dbCard = fullCardsDatabase.find(c => c.id === sc.id);
    if (dbCard) {
      const count = sc.count || 1;
      for (let i = 0; i < count; i++) {
        poolInstances.push({
          ...dbCard,
          instanceId: `scanned-${dbCard.id}-${index}-${i}`,
          score2HG: getCard2HGScore(dbCard),
          cmc: getCardCMC(dbCard),
          location: 'Sideboard' // výchozí
        });
      }
    }
  });

  if (poolInstances.length < 30) {
    return { error: 'Příliš málo karet v poolu. Naskenujte alespoň 30 karet.' };
  }

  // 2. Definice 10 možných dvoubarevných kombinací (Guild)
  const guilds = [
    { id: 'WU', name: 'Azorius (W/U)', colors: ['W', 'U'] },
    { id: 'UB', name: 'Dimir (U/B)', colors: ['U', 'B'] },
    { id: 'BR', name: 'Rakdos (B/R)', colors: ['B', 'R'] },
    { id: 'RG', name: 'Gruul (R/G)', colors: ['R', 'G'] },
    { id: 'GW', name: 'Selesnya (G/W)', colors: ['G', 'W'] },
    { id: 'WB', name: 'Orzhov (W/B)', colors: ['W', 'B'] },
    { id: 'UR', name: 'Izzet (U/R)', colors: ['U', 'R'] },
    { id: 'BG', name: 'Golgari (B/G)', colors: ['B', 'G'] },
    { id: 'WR', name: 'Boros (W/R)', colors: ['W', 'R'] },
    { id: 'GU', name: 'Simic (G/U)', colors: ['G', 'U'] }
  ];

  // 3. Projdeme všechny dvojice guild (P1 a P2), které nemají ŽÁDNÝ barevný překryv (nebo minimální)
  let bestCombination = null;
  let highestComboScore = -9999;
  const evaluatedCombos = [];

  for (let i = 0; i < guilds.length; i++) {
    for (let j = i + 1; j < guilds.length; j++) {
      const g1 = guilds[i];
      const g2 = guilds[j];
      
      // Spočítáme překryv barev
      const overlaps = g1.colors.filter(c => g2.colors.includes(c));
      if (overlaps.length > 0) continue; // Pro 2HG striktně vyžadujeme nulový překryv barev

      // Získáme synergie pro toto párování z archetypesData
      const pairingSynergy = evaluatePairing(g1.id, g2.id) || { tier: 'B', title: 'Standardní', synergies: [], risks: [] };
      
      // Vypočítáme sílu každé guildy z aktuálního poolu
      const poolForG1 = poolInstances.filter(c => !c.type?.includes('Land') && isCardInColors(c, g1.colors));
      const poolForG2 = poolInstances.filter(c => !c.type?.includes('Land') && isCardInColors(c, g2.colors));

      // Seřadíme podle 2HG skóre a vezmeme top 23 karet
      poolForG1.sort((a, b) => b.score2HG - a.score2HG);
      poolForG2.sort((a, b) => b.score2HG - a.score2HG);

      const top23_G1 = poolForG1.slice(0, 23);
      const top23_G2 = poolForG2.slice(0, 23);

      // Pokud guilda nemá ani 15 hratelných kouzel v daných barvách, je nehratelná
      if (top23_G1.length < 15 || top23_G2.length < 15) continue;

      const sumG1 = top23_G1.reduce((sum, c) => sum + c.score2HG, 0);
      const sumG2 = top23_G2.reduce((sum, c) => sum + c.score2HG, 0);

      // Převod tieru párování na body
      let pairingBonus = 0;
      if (pairingSynergy.tier === 'S') pairingBonus = 15;
      else if (pairingSynergy.tier === 'A') pairingBonus = 10;
      else if (pairingSynergy.tier === 'B') pairingBonus = 5;
      else if (pairingSynergy.tier === 'C') pairingBonus = 0;
      else if (pairingSynergy.tier === 'F') pairingBonus = -20;

      const totalComboScore = sumG1 + sumG2 + pairingBonus;

      evaluatedCombos.push({
        g1, g2,
        scoreG1: sumG1,
        scoreG2: sumG2,
        pairingBonus,
        totalScore: totalComboScore,
        synergy: pairingSynergy,
        top23_G1,
        top23_G2
      });

      if (totalComboScore > highestComboScore) {
        highestComboScore = totalComboScore;
        bestCombination = evaluatedCombos[evaluatedCombos.length - 1];
      }
    }
  }

  if (!bestCombination) {
    return { error: 'Nepodařilo se najít žádnou stabilní barevnou kombinaci bez překryvu barev. Zkuste naskenovat více karet.' };
  }

  // Seřadíme kombinace podle celkového skóre pro nabídku alternativních voleb
  evaluatedCombos.sort((a, b) => b.totalScore - a.totalScore);
  const top3Combos = evaluatedCombos.slice(0, 3);

  // 4. Sestavíme výsledné balíčky pro nejlepší kombinaci
  const buildFinalDeck = (guild, initialSpells) => {
    // Vezmeme počáteční top spells (až 23)
    let spells = [...initialSpells];
    
    // Rozdělíme užitečné bezbarvé karty, které nebyly v top23, ale mohly by se hodit
    const colorlessPool = poolInstances.filter(c => 
      !c.type?.includes('Land') && 
      (c.color?.includes('Colorless') || !c.color || c.color.length === 0) &&
      !spells.find(s => s.instanceId === c.instanceId)
    );
    
    // Přidáme bezbarvé karty do poolu možných karet pro balíček
    const availableSpells = [...spells, ...colorlessPool];
    availableSpells.sort((a, b) => b.score2HG - a.score2HG);
    
    // Znovu vybereme 23 nejlepších
    spells = availableSpells.slice(0, 23);

    // Křivková optimalizace (Curve smoothing)
    // Ideální distribuce CMC: 1: ~3, 2: ~6, 3: ~6, 4: ~5, 5: ~2, 6+: ~1
    // Pokud máme příliš mnoho drahých karet, zkusíme je vyměnit za levnější z poolu, pokud je rozdíl skóre malý.
    let iterations = 0;
    while (iterations < 5) {
      iterations++;
      const cmcCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };
      spells.forEach(s => {
        const cmc = s.cmc;
        if (cmc <= 1) cmcCounts[1]++;
        else if (cmc === 2) cmcCounts[2]++;
        else if (cmc === 3) cmcCounts[3]++;
        else if (cmc === 4) cmcCounts[4]++;
        else if (cmc === 5) cmcCounts[5]++;
        else cmcCounts['6+']++;
      });

      // Pokud máme více než 7 karet s cenou 4+ a v sideboardu jsou kvalitní 2-dropy/3-dropy
      const highCmcCount = cmcCounts[4] + cmcCounts[5] + cmcCounts['6+'];
      if (highCmcCount > 9) {
        // Najdeme nejslabší drahou kartu v decku
        const expensiveSpellsInDeck = spells
          .filter(s => s.cmc >= 4)
          .sort((a, b) => a.score2HG - b.score2HG);
        
        // Najdeme nejlepší levnou kartu v sideboardu (CMC 2-3)
        const cheapSideboardSpells = poolInstances
          .filter(c => 
            !c.type?.includes('Land') && 
            isCardInColors(c, guild.colors) && 
            c.cmc >= 1 && c.cmc <= 3 && 
            !spells.find(s => s.instanceId === c.instanceId)
          )
          .sort((a, b) => b.score2HG - a.score2HG);

        if (expensiveSpellsInDeck.length > 0 && cheapSideboardSpells.length > 0) {
          const toRemove = expensiveSpellsInDeck[0];
          const toAdd = cheapSideboardSpells[0];
          
          // Vyměníme pouze pokud levná karta není totální odpad (rozdíl skóre < 3 body)
          if (toRemove.score2HG - toAdd.score2HG < 3.0) {
            spells = spells.filter(s => s.instanceId !== toRemove.instanceId);
            spells.push(toAdd);
            continue;
          }
        }
      }
      break;
    }

    // Alokace speciálních ne-základních zemí z poolu
    const nonBasicLandsInPool = poolInstances.filter(c => 
      c.type?.includes('Land') && 
      c.name !== 'Plains' && c.name !== 'Island' && c.name !== 'Swamp' && c.name !== 'Mountain' && c.name !== 'Forest'
    );
    
    const matchedLands = [];
    nonBasicLandsInPool.forEach(land => {
      // Pokud země produkuje nebo podporuje barvy tohoto balíčku, přidáme ji sem
      const desc = land.description?.toLowerCase() || '';
      const colorsSupported = [];
      guild.colors.forEach(col => {
        const colNames = { 'W': 'plains', 'U': 'island', 'B': 'swamp', 'R': 'mountain', 'G': 'forest' };
        if (desc.includes(`add {${col}}`) || desc.includes(colNames[col])) {
          colorsSupported.push(col);
        }
      });
      // Pokud země podporuje alespoň jednu z našich barev (a netříští se s druhým hráčem), přiřadíme ji
      if (colorsSupported.length > 0) {
        matchedLands.push({ ...land, location: guild.id === bestCombination.g1.id ? 'A' : 'B' });
      }
    });

    // Výpočet manových symbolů pro basic lands
    const symbolCounts = {};
    guild.colors.forEach(col => { symbolCounts[col] = 0; });
    
    spells.forEach(s => {
      if (!s.cost) return;
      guild.colors.forEach(col => {
        const matches = s.cost.match(new RegExp(col, 'g'));
        if (matches) {
          symbolCounts[col] += matches.length;
        }
      });
    });

    const totalSymbols = Object.values(symbolCounts).reduce((sum, v) => sum + v, 0);
    const neededLandsCount = Math.max(5, 17 - matchedLands.length);
    const basicLands = [];

    // Databáze basic lands z cardsData
    const basicLandsDb = fullCardsDatabase.filter(c => 
      c.type?.includes('Land') && 
      ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'].includes(c.name)
    );

    guild.colors.forEach((col, idx) => {
      const ratio = totalSymbols > 0 ? (symbolCounts[col] / totalSymbols) : (1 / guild.colors.length);
      let count = Math.round(ratio * neededLandsCount);
      
      // Korekce pro poslední barvu
      if (idx === guild.colors.length - 1) {
        const currentSum = basicLands.length;
        count = neededLandsCount - currentSum;
      }
      
      const colToLandName = { 'W': 'Plains', 'U': 'Island', 'B': 'Swamp', 'R': 'Mountain', 'G': 'Forest' };
      const landName = colToLandName[col];
      const landTemplate = basicLandsDb.find(l => l.name === landName) || {
        name: landName,
        color: [col],
        type: 'Land',
        rarity: 'Common',
        tier2HG: 'C',
        description: `({T}: Add {${col}}.)`
      };

      for (let k = 0; k < count; k++) {
        basicLands.push({
          ...landTemplate,
          instanceId: `generated-basic-${col}-${k}-${guild.id}`,
          location: guild.id === bestCombination.g1.id ? 'A' : 'B'
        });
      }
    });

    // Označíme kouzla příslušným označením balíčku
    const finalSpells = spells.map(s => ({
      ...s,
      location: guild.id === bestCombination.g1.id ? 'A' : 'B'
    }));

    return [...finalSpells, ...matchedLands, ...basicLands];
  };

  const deckACards = buildFinalDeck(bestCombination.g1, bestCombination.top23_G1);
  const deckBCards = buildFinalDeck(bestCombination.g2, bestCombination.top23_G2);

  // Vytvoříme finální aktualizovaný pool, kde jsou karty rozdělené do A, B a Sideboardu
  const finalPool = poolInstances.map(pCard => {
    // Zkusíme najít, zda je karta v decku A
    const inA = deckACards.find(d => d.id === pCard.id && d.instanceId === pCard.instanceId);
    if (inA) return { ...pCard, location: 'A' };
    
    const inB = deckBCards.find(d => d.id === pCard.id && d.instanceId === pCard.instanceId);
    if (inB) return { ...pCard, location: 'B' };

    return { ...pCard, location: 'Sideboard' };
  });

  // Přidáme vygenerované základní země do balíčků, protože v původním poolu nebyly
  const generatedBasicLands = [
    ...deckACards.filter(c => c.instanceId.startsWith('generated-basic')),
    ...deckBCards.filter(c => c.instanceId.startsWith('generated-basic'))
  ];

  const fullOptimizedPool = [...finalPool, ...generatedBasicLands];

  return {
    success: true,
    bestCombo: {
      g1: bestCombination.g1,
      g2: bestCombination.g2,
      synergy: bestCombination.synergy,
      score: bestCombination.totalScore
    },
    alternatives: top3Combos.slice(1).map(c => ({
      g1: c.g1,
      g2: c.g2,
      synergy: c.synergy,
      score: c.totalScore
    })),
    deckA: deckACards,
    deckB: deckBCards,
    fullPool: fullOptimizedPool
  };
}
