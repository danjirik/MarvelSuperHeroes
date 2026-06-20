import fs from 'fs/promises';

async function search(query) {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
  console.log(`Searching for "${query}" on Scryfall:`, url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Marvel2HGTactician/1.0 (danjirik@example.com)'
      }
    });
    if (!res.ok) {
      console.error("Failed, status:", res.status);
      const errText = await res.text();
      console.error("Error text:", errText);
      return;
    }
    const data = await res.json();
    console.log(`Found ${data.total_cards} results.`);
    if (data.data && data.data.length > 0) {
      data.data.slice(0, 3).forEach(c => {
        console.log(` - ${c.name} (set: ${c.set}, lang: ${c.lang})`);
        if (c.image_uris) {
          console.log(`   Image: ${c.image_uris.normal}`);
        } else if (c.card_faces && c.card_faces[0].image_uris) {
          console.log(`   Double-faced Image (front): ${c.card_faces[0].image_uris.normal}`);
        }
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function run() {
  await search("name:\"Abomination, Terrifying Titan\"");
  await search("Show and Tell");
}

run();
