import React, { useState } from 'react';
import { cardsData } from '../data/cardsData';
import { Search, Filter, Info, ShieldAlert } from 'lucide-react';

export default function TierList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedMechanic, setSelectedMechanic] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');

  // Available filters options
  const colors = ['All', 'W', 'U', 'B', 'R', 'G', 'Multicolor', 'Colorless'];
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Mythic'];
  const tiers = ['All', 'S', 'A', 'B', 'C', 'F'];
  const mechanics = ['All', 'Teamwork', 'Power-up', 'Plan', 'Connive', 'MDFC'];

  // Filter logic
  const filteredCards = cardsData.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColor = selectedColor === 'All' || 
                         (selectedColor === 'Multicolor' && card.color.includes('Multicolor')) ||
                         (selectedColor === 'Colorless' && card.color.includes('Colorless')) ||
                         (card.color.includes(selectedColor));
                         
    const matchesRarity = selectedRarity === 'All' || card.rarity === selectedRarity;
    const matchesTier = selectedTier === 'All' || card.tier2HG === selectedTier;
    const matchesMechanic = selectedMechanic === 'All' || card.mechanics.includes(selectedMechanic);
    const matchesSource = selectedSource === 'All' || 
                          (selectedSource === 'MSH' && !card.isSourceMaterial) ||
                          (selectedSource === 'MAR' && card.isSourceMaterial);

    return matchesSearch && matchesColor && matchesRarity && matchesTier && matchesMechanic && matchesSource;
  });

  return (
    <div className="tierlist-container">
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ color: '#8b5cf6' }} />
          Interaktivní 2HG Tier List karet
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>
          Procházejte hodnocení klíčových karet edice Marvel Super Heroes upravené speciálně pro turnajové 2HG prostředí. S-Tier reprezentuje zápas vyhrávající bomby, F-Tier naopak pasti, kterým se raději vyhněte.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Vyhledat kartu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          </div>

          {/* Color Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Barva</label>
            <select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(10,10,12,0.8)' }}
            >
              {colors.map(c => <option key={c} value={c}>{c === 'All' ? 'Všechny barvy' : c}</option>)}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Rarita</label>
            <select 
              value={selectedRarity} 
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(10,10,12,0.8)' }}
            >
              {rarities.map(r => <option key={r} value={r}>{r === 'All' ? 'Všechny rarity' : r}</option>)}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>2HG Hodnocení</label>
            <select 
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(10,10,12,0.8)' }}
            >
              {tiers.map(t => <option key={t} value={t}>{t === 'All' ? 'Všechny tiery' : `Tier ${t}`}</option>)}
            </select>
          </div>

          {/* Mechanic Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Mechanika</label>
            <select 
              value={selectedMechanic} 
              onChange={(e) => setSelectedMechanic(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(10,10,12,0.8)' }}
            >
              {mechanics.map(m => <option key={m} value={m}>{m === 'All' ? 'Všechny mechaniky' : m}</option>)}
            </select>
          </div>

          {/* Set / Source Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Edice / Zdroj</label>
            <select 
              value={selectedSource} 
              onChange={(e) => setSelectedSource(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(10,10,12,0.8)' }}
            >
              <option value="All">Všechny (MSH + MAR)</option>
              <option value="MSH">Marvel Super Heroes (MSH)</option>
              <option value="MAR">Source Material (MAR)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid-cards">
          {filteredCards.map(card => (
            <div 
              key={card.id} 
              className={`mtg-card-item glow-${card.tier2HG}`}
            >
              {/* Header */}
              <div className="mtg-card-header">
                <span className="mtg-card-title">{card.name}</span>
                <span className="mtg-card-cost">{card.cost}</span>
              </div>

              {/* Meta information */}
              <div className="mtg-card-meta">
                <span className={`badge-tier ${card.tier2HG}`}>
                  Tier {card.tier2HG}
                </span>
                
                {card.color.map(col => (
                  <span key={col} className={`badge-color ${col}`}>
                    {col === 'Multicolor' ? 'M' : col === 'Colorless' ? 'C' : col}
                  </span>
                ))}

                <span className="mtg-card-type">{card.type}</span>
                {card.isSourceMaterial && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                    Source Material
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mtg-card-description">
                {card.description}
                {card.mechanics[0] !== 'None' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {card.mechanics.map(mech => (
                      <span key={mech} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.25rem', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {mech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 2HG Impact section */}
              <div className="mtg-card-2hg-impact">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#c084fc', marginBottom: '0.25rem' }}>
                  {card.tier2HG === 'F' ? <ShieldAlert size={14} style={{ color: '#ef4444' }} /> : <Info size={14} />}
                  <span>{card.tier2HG === 'F' ? 'Proč v 2HG selhává:' : 'Dopad v 2HG:'}</span>
                </div>
                {card.impact2HG}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: 0 }}>Nebyly nalezeny žádné karty odpovídající vybraným filtrům.</p>
        </div>
      )}
    </div>
  );
}
