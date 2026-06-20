import { createWorker } from 'tesseract.js';
import Fuse from 'fuse.js';
import { cardsData, basicLandsAndFillers } from '../data/cardsData';

// Zkombinujeme všechny karty (včetně basic lands a fillers) pro kompletní vyhledávání
const allCards = [...cardsData, ...(basicLandsAndFillers || [])];

// Inicializace Fuse.js pro fuzzy vyhledávání podle jména karty
const fuseOptions = {
  keys: ['name'],
  threshold: 0.4, // Tolerance pro překlepy z OCR (nižší číslo = přísnější)
  includeScore: true
};
const fuseInstance = new Fuse(allCards, fuseOptions);

/**
 * Provede fuzzy vyhledávání textu v databázi karet.
 * Vrátí nejlepší nalezenou kartu a míru spolehlivosti.
 */
export function matchCardByName(text) {
  if (!text || text.trim().length < 3) return null;
  
  // Vyčistíme text od nežádoucích znaků
  const cleanedText = text.replace(/[^a-zA-Z0-9\s,.'-]/g, '').trim();
  if (cleanedText.length < 3) return null;

  const results = fuseInstance.search(cleanedText);
  if (results && results.length > 0) {
    const bestMatch = results[0];
    return {
      card: bestMatch.item,
      score: bestMatch.score, // 0 = dokonalá shoda, 1 = žádná shoda
      confidence: Math.round((1 - bestMatch.score) * 100) // v procentech
    };
  }
  return null;
}

/**
 * Detekuje oblasti karet (bounding boxy) v zaslaném canvasu.
 * Používá rychlou klientskou segmentaci obrazu pomocí hran a shlukování.
 */
export function detectCardRegions(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  
  // Zmenšíme obrázek pro vysoký výkon (zpracování v milisekundách)
  const targetW = 300;
  const targetH = Math.round((height / width) * targetW);
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetW;
  tempCanvas.height = targetH;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0, targetW, targetH);
  
  let imgData;
  try {
    imgData = tempCtx.getImageData(0, 0, targetW, targetH);
  } catch (e) {
    console.error("Nemám přístup k pixelům canvasu (CORS):", e);
    return [];
  }
  
  const data = imgData.data;
  const edges = new Uint8Array(targetW * targetH);
  
  // 1. Detekce hran (zjednodušený gradient)
  for (let y = 1; y < targetH - 1; y++) {
    for (let x = 1; x < targetW - 1; x++) {
      const idx = (y * targetW + x) * 4;
      const gray = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
      
      const grayRight = data[idx+4] * 0.299 + data[idx+5] * 0.587 + data[idx+6] * 0.114;
      const grayDown = data[((y+1)*targetW + x)*4] * 0.299 + data[((y+1)*targetW + x)*4+1] * 0.587 + data[((y+1)*targetW + x)*4+2] * 0.114;
      
      const dx = grayRight - gray;
      const dy = grayDown - gray;
      const grad = Math.sqrt(dx*dx + dy*dy);
      
      edges[y * targetW + x] = grad > 22 ? 1 : 0; // Hranový filtr
    }
  }
  
  // 2. Agregace hran do bloků (redukce šumu)
  const blockSize = 8;
  const cols = Math.floor(targetW / blockSize);
  const rows = Math.floor(targetH / blockSize);
  const grid = new Uint8Array(cols * rows);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let edgeCount = 0;
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const px = c * blockSize + dx;
          const py = r * blockSize + dy;
          if (edges[py * targetW + px]) edgeCount++;
        }
      }
      // Pokud je v bloku více než 12 % hranových pixelů, označíme jej jako aktivní
      grid[r * cols + c] = edgeCount > (blockSize * blockSize * 0.12) ? 1 : 0;
    }
  }
  
  // 3. Vyhledání souvislých komponent (Connected Components) v mřížce
  const visited = new Uint8Array(cols * rows);
  const boxes = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (grid[idx] && !visited[idx]) {
        // BFS / záplavový algoritmus pro seskupení bloků
        const queue = [[c, r]];
        visited[idx] = 1;
        let minC = c, maxC = c, minR = r, maxR = r;
        let head = 0;
        
        while (head < queue.length) {
          const [currC, currR] = queue[head++];
          
          const neighbors = [
            [currC+1, currR], [currC-1, currR],
            [currC, currR+1], [currC, currR-1]
          ];
          
          for (const [nc, nr] of neighbors) {
            if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
              const nidx = nr * cols + nc;
              if (grid[nidx] && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nc, nr]);
                if (nc < minC) minC = nc;
                if (nc > maxC) maxC = nc;
                if (nr < minR) minR = nr;
                if (nr > maxR) maxR = nr;
              }
            }
          }
        }
        
        // Výpočet rozměrů detekované karty v původním měřítku
        const scaleX = width / targetW;
        const scaleY = height / targetH;
        
        const boxX = minC * blockSize;
        const boxY = minR * blockSize;
        const boxW = (maxC - minC + 1) * blockSize;
        const boxH = (maxR - minR + 1) * blockSize;
        
        const ratio = boxH / boxW; // Poměr stran (karta na výšku by měla mít ~1.4)
        
        // Odfiltrujeme extrémně malé/velké objekty nebo objekty s nevhodným poměrem
        if (boxW >= 24 && boxH >= 24 && ratio > 0.8 && ratio < 2.0) {
          boxes.push({
            id: `box-${minC}-${minR}`,
            x: Math.round(boxX * scaleX),
            y: Math.round(boxY * scaleY),
            width: Math.round(boxW * scaleX),
            height: Math.round(boxH * scaleY),
            ratio: ratio
          });
        }
      }
    }
  }
  
  return boxes;
}

/**
 * Připraví (předzpracuje) canvas ořezu karty pro OCR detekci.
 * Zvýší kontrast a převede obrázek na černo-bílý (thresholding).
 */
export function preprocessCardTitleCanvas(sourceCanvas, box) {
  // Budeme ořezávat pouze horní část karty (titulek), což je typicky horních 15 %
  // To drasticky zvyšuje rychlost a přesnost OCR.
  const titleH = Math.round(box.height * 0.15);
  const titleW = box.width;
  
  const ocrCanvas = document.createElement('canvas');
  ocrCanvas.width = titleW;
  ocrCanvas.height = titleH;
  const ocrCtx = ocrCanvas.getContext('2d');
  
  // Vykreslíme ořezaný název karty
  ocrCtx.drawImage(
    sourceCanvas,
    box.x, box.y, titleW, titleH, // zdroj (source)
    0, 0, titleW, titleH           // cíl (destination)
  );
  
  // Úprava pixelů pro lepší OCR čitelnost
  const imgData = ocrCtx.getImageData(0, 0, titleW, titleH);
  const data = imgData.data;
  
  // Spočítáme průměrný jas
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
  }
  const avgBrightness = totalBrightness / (data.length / 4);
  
  // Aplikujeme adaptivní binarizaci
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const gray = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // Zvýšíme kontrast (černobílé oříznutí s přizpůsobením jasu)
    const val = gray > avgBrightness ? 255 : 0;
    data[i] = val;
    data[i+1] = val;
    data[i+2] = val;
  }
  
  ocrCtx.putImageData(imgData, 0, 0);
  return ocrCanvas;
}

/**
 * Spustí OCR detekci nad jedním ořezem karty a spáruje výsledek s databází.
 */
export async function scanCardRegion(cardCanvas, worker) {
  try {
    const { data: { text } } = await worker.recognize(cardCanvas);
    if (!text || text.trim().length < 3) return null;
    
    // Vyhledáme kartu v naší DB
    const match = matchCardByName(text);
    return {
      rawText: text.trim(),
      match: match
    };
  } catch (err) {
    console.error("Chyba při běhu OCR na kartě:", err);
    return null;
  }
}
