import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper delay function to respect Scryfall rate limit
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const cardsDataPath = path.join(__dirname, 'src', 'data', 'cardsData.js');
  const targetDir = path.join(__dirname, 'public', 'images', 'cards');
  
  // Ensure target folder exists
  await fs.mkdir(targetDir, { recursive: true });
  
  console.log("Loading cardsData...");
  // Import cardsData dynamically
  const { cardsData, basicLandsAndFillers } = await import('./src/data/cardsData.js');
  
  console.log(`Loaded ${cardsData.length} regular cards and ${basicLandsAndFillers.length} basic lands/fillers.`);
  
  const allCards = [...cardsData, ...basicLandsAndFillers];
  const updatedCardsMap = new Map();
  
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    const { id, name } = card;
    const destPath = path.join(targetDir, `${id}.jpg`);
    const publicPath = `/images/cards/${id}.jpg`;
    
    // Set default public path initially
    updatedCardsMap.set(id, publicPath);
    
    // Check if file already exists
    try {
      await fs.access(destPath);
      skipCount++;
      if (i % 20 === 0 || i === allCards.length - 1) {
        console.log(`[${i + 1}/${allCards.length}] Skipping existing: ${name}`);
      }
      continue;
    } catch {
      // File does not exist, download it
    }
    
    console.log(`[${i + 1}/${allCards.length}] Downloading: ${name} (ID: ${id})`);
    
    let imageUrl = null;
    
    // Try by ID first
    try {
      const url = `https://api.scryfall.com/cards/${id}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Marvel2HGTactician/1.0 (danjirik@example.com)' }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.image_uris && data.image_uris.normal) {
          imageUrl = data.image_uris.normal;
        } else if (data.card_faces && data.card_faces[0].image_uris) {
          imageUrl = data.card_faces[0].image_uris.normal;
        }
      }
    } catch (err) {
      console.warn(`  Failed fetching by ID ${id}:`, err.message);
    }
    
    // Try by Name as fallback if ID query failed or didn't yield image
    if (!imageUrl) {
      try {
        console.log(`  Fallback: Searching by exact name "${name}"`);
        const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Marvel2HGTactician/1.0 (danjirik@example.com)' }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.image_uris && data.image_uris.normal) {
            imageUrl = data.image_uris.normal;
          } else if (data.card_faces && data.card_faces[0].image_uris) {
            imageUrl = data.card_faces[0].image_uris.normal;
          }
        }
      } catch (err) {
        console.warn(`  Failed fetching by name fallback:`, err.message);
      }
    }
    
    if (imageUrl) {
      try {
        // Download image file
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          await fs.writeFile(destPath, Buffer.from(buffer));
          successCount++;
          console.log(`  Success! Saved to public/images/cards/${id}.jpg`);
        } else {
          console.error(`  Failed to download image from URL: ${imageUrl}`);
          failCount++;
        }
      } catch (err) {
        console.error(`  Error downloading image:`, err.message);
        failCount++;
      }
    } else {
      console.error(`  Could not find image URL for card: ${name}`);
      failCount++;
    }
    
    // Rate limit: wait 100ms between calls as requested by Scryfall API guidelines
    await delay(100);
  }
  
  console.log(`Download round complete. Success: ${successCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
  
  // Now rebuild the cardsData.js file to include imageUrl
  console.log("Updating cardsData.js database...");
  
  const updatedCardsData = cardsData.map(c => ({
    ...c,
    imageUrl: updatedCardsMap.get(c.id) || `/images/cards/${c.id}.jpg`
  }));
  
  const updatedBasicLands = basicLandsAndFillers.map(c => ({
    ...c,
    imageUrl: updatedCardsMap.get(c.id) || `/images/cards/${c.id}.jpg`
  }));
  
  const newFileContent = `export const cardsData = ${JSON.stringify(updatedCardsData, null, 2)};\n\nexport const basicLandsAndFillers = ${JSON.stringify(updatedBasicLands, null, 2)};\n`;
  
  await fs.writeFile(cardsDataPath, newFileContent, 'utf-8');
  console.log("cardsData.js successfully updated with imageUrl properties!");
}

run().catch(err => {
  console.error("Fatal error:", err);
});
