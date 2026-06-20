import { cardsData } from './cardsData';

// Generuje realistická výchozí 17Lands data na základě 2HG tieru a rarity
export const stats17lands = cardsData.map(card => {
  let gihWR = 52.0; 
  let alsa = 4.5;   
  let iwd = 0.0;    
  
  // Nastavení statistik podle 2HG Tieru
  if (card.tier2HG === 'S') {
    gihWR = 61.5 + (card.id.charCodeAt(0) % 25) / 10; // Deterministická pseudo-náhodnost
    alsa = 1.1 + (card.id.charCodeAt(1) % 5) / 10;
    iwd = 4.5 + (card.id.charCodeAt(2) % 15) / 10;
  } else if (card.tier2HG === 'A') {
    gihWR = 58.0 + (card.id.charCodeAt(0) % 30) / 10;
    alsa = 1.8 + (card.id.charCodeAt(1) % 8) / 10;
    iwd = 2.5 + (card.id.charCodeAt(2) % 15) / 10;
  } else if (card.tier2HG === 'B') {
    gihWR = 55.0 + (card.id.charCodeAt(0) % 28) / 10;
    alsa = 2.8 + (card.id.charCodeAt(1) % 12) / 10;
    iwd = 1.0 + (card.id.charCodeAt(2) % 15) / 10;
  } else if (card.tier2HG === 'C') {
    gihWR = 51.5 + (card.id.charCodeAt(0) % 30) / 10;
    alsa = 4.2 + (card.id.charCodeAt(1) % 18) / 10;
    iwd = -0.5 + (card.id.charCodeAt(2) % 12) / 10;
  } else if (card.tier2HG === 'D') {
    gihWR = 48.0 + (card.id.charCodeAt(0) % 30) / 10;
    alsa = 5.8 + (card.id.charCodeAt(1) % 20) / 10;
    iwd = -2.5 + (card.id.charCodeAt(2) % 15) / 10;
  } else if (card.tier2HG === 'F') {
    gihWR = 44.0 + (card.id.charCodeAt(0) % 35) / 10;
    alsa = 7.2 + (card.id.charCodeAt(1) % 22) / 10;
    iwd = -4.5 + (card.id.charCodeAt(2) % 20) / 10;
  }
  
  // Zohlednění rarity pro průměrné kolo spatření (ALSA)
  if (card.rarity === 'Mythic' || card.rarity === 'Rare') {
    alsa = Math.max(1.0, alsa - 1.2);
  } else if (card.rarity === 'Common') {
    alsa = Math.min(11.5, alsa + 1.2);
  }

  return {
    cardId: card.id,
    name: card.name,
    gihWR: Math.round(gihWR * 10) / 10,
    alsa: Math.round(alsa * 10) / 10,
    iwd: Math.round(iwd * 10) / 10,
    rarity: card.rarity,
    color: card.color,
    tier2HG: card.tier2HG
  };
});
