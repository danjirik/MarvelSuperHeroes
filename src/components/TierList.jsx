import React, { useState, useEffect } from 'react';
import { cardsData } from '../data/cardsData';
import { stats17lands } from '../data/stats17lands';
import { Search, Filter, Info, ShieldAlert, ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react';

export default function TierList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedMechanic, setSelectedMechanic] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showImages, setShowImages] = useState(false);
  const [showWinRate, setShowWinRate] = useState(false);
  const [statsMap, setStatsMap] = useState({});

  useEffect(() => {
    // Načteme online data z localStorage pro synchronizaci
    const saved = localStorage.getItem('online_17lands_stats');
    let onlineMap = {};
    if (saved) {
      try {
        onlineMap = JSON.parse(saved);
      } catch (e) {
        console.error("Selhalo načtení online statistik v Tier Listu:", e);
      }
    }
    
    // Namapujeme data karet
    const map = {};
    stats17lands.forEach(item => {
      const onlineItem = onlineMap[item.name];
      map[item.name] = {
        gihWR: onlineItem && onlineItem.gihWR !== undefined ? onlineItem.gihWR : item.gihWR
      };
    });
    setStatsMap(map);
  }, []);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(24);
  
  // Expanded descriptions state
  const [expandedCards, setExpandedCards] = useState({});

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedColor, selectedRarity, selectedTier, selectedMechanic, selectedSource]);

  // Available filters options
  const colors = ['All', 'W', 'U', 'B', 'R', 'G', 'Multicolor', 'Colorless'];
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Mythic'];
  const tiers = ['All', 'S', 'A', 'B', 'C', 'D', 'F'];
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

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  const visibleCards = filteredCards.slice(0, visibleCount);

  return (
    <div className="tierlist-container">
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ color: '#8b5cf6' }} />
          Interaktivní 2HG Tier List
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>
          Procházejte hodnocení všech 314 karet upravené speciálně pro turnajové 2HG prostředí. S-Tier reprezentuje zápas vyhrávající bomby, D-Tier naopak pasti, kterým se raději vyhněte.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="grid-filters">

          
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

      {/* Results stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        padding: '0 0.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Zobrazeno <strong style={{ color: '#fff' }}>{Math.min(visibleCards.length, filteredCards.length)}</strong> z <strong style={{ color: '#fff' }}>{filteredCards.length}</strong> nalezených karet
        </span>
        
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '0.5rem', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={showWinRate} 
              onChange={(e) => setShowWinRate(e.target.checked)}
              style={{ accentColor: '#8b5cf6', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            Zobrazit Win Rate (17Lands)
          </label>

          {viewMode === 'grid' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '0.5rem', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={showImages} 
                onChange={(e) => setShowImages(e.target.checked)}
                style={{ accentColor: '#8b5cf6', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              Zobrazit obrázky
            </label>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            background: 'rgba(255,255,255,0.02)', 
            padding: '0.25rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.05)' 
          }}>
            <button 
              onClick={() => setViewMode('grid')}
              className={`nav-button ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <LayoutGrid size={14} />
              Mřížka
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`nav-button ${viewMode === 'table' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <List size={14} />
              Tabulka
            </button>
          </div>
        </div>
      </div>

      {/* Cards List Viewport */}
      {visibleCards.length > 0 ? (
        <div>
          {viewMode === 'grid' ? (
            /* Grid layout */
            <div className="grid-cards">
              {visibleCards.map(card => {
                const isExpanded = !!expandedCards[card.id];
                const hasLongText = card.impact2HG && card.impact2HG.length > 95;
                const displayText = hasLongText && !isExpanded 
                  ? card.impact2HG.slice(0, 95) + '...' 
                  : card.impact2HG;

                return (
                  <div 
                    key={card.id} 
                    className={`mtg-card-item glow-${card.tier2HG}`}
                    style={{ minHeight: '220px' }}
                  >
                    {/* Card Image header */}
                    {showImages && card.imageUrl && (
                      <div style={{ 
                        width: '100%', 
                        height: 'auto', 
                        overflow: 'hidden', 
                        borderRadius: '8px', 
                        marginBottom: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        background: '#121217'
                      }}>
                        <img 
                          src={card.imageUrl} 
                          alt={card.name} 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            display: 'block' 
                          }} 
                        />
                      </div>
                    )}

                    {/* Header */}
                    <div className="mtg-card-header">
                      <span className="mtg-card-title" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{card.name}</span>
                      <span className="mtg-card-cost" style={{ fontSize: '0.75rem' }}>{card.cost || 'Země'}</span>
                    </div>

                    {/* Meta information */}
                    <div className="mtg-card-meta" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                      <span className={`badge-tier ${card.tier2HG}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>
                        Tier {card.tier2HG}
                      </span>
                      
                      {showWinRate && statsMap[card.name] && (
                        <span className="badge-tier" style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.1rem 0.4rem', 
                          background: 'rgba(16, 185, 129, 0.15)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)', 
                          color: '#34d399', 
                          fontWeight: 700 
                        }}>
                          WR {statsMap[card.name].gihWR.toFixed(1)}%
                        </span>
                      )}
                      
                      {card.color.map(col => (
                        <span key={col} className={`badge-color ${col}`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                          {col === 'Multicolor' ? 'M' : col === 'Colorless' ? 'C' : col[0]}
                        </span>
                      ))}

                      <span className="mtg-card-type" style={{ fontSize: '0.7rem' }}>{card.type}</span>
                      {card.isSourceMaterial && (
                        <span style={{ fontSize: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.05rem 0.25rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                          Source
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {!showImages && (
                      <div className="mtg-card-description" style={{ fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                        {card.description}
                        {card.mechanics[0] !== 'None' && (
                          <div style={{ marginTop: '0.4rem' }}>
                            {card.mechanics.map(mech => (
                              <span key={mech} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.03)', fontSize: '0.65rem', padding: '0.05rem 0.3rem', borderRadius: '4px', marginRight: '0.25rem', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)' }}>
                                {mech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2HG Impact section */}
                    <div className="mtg-card-2hg-impact" style={{ marginTop: 'auto', background: 'rgba(139, 92, 246, 0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', color: '#c084fc', marginBottom: '0.2rem' }}>
                        {card.tier2HG === 'D' || card.tier2HG === 'F' ? <ShieldAlert size={12} style={{ color: '#ef4444' }} /> : <Info size={12} />}
                        <span>{card.tier2HG === 'D' || card.tier2HG === 'F' ? 'Proč v 2HG selhává:' : '2HG Taktický audit:'}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#d1d5db', lineHeight: '1.4' }}>
                        {displayText}
                        {hasLongText && (
                          <button 
                            onClick={() => toggleCard(card.id)}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: '#a78bfa', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              cursor: 'pointer', 
                              padding: 0, 
                              marginLeft: '0.35rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.1rem'
                            }}
                          >
                            {isExpanded ? 'méně ▲' : 'více ▼'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table layout */
            <div className="tier-table-container">
              <table className="tier-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Název karty</th>
                    <th>Cena</th>
                    <th>Barva</th>
                    <th>Rarita</th>
                    <th>Typ</th>
                    <th style={{ textAlign: 'center' }}>{showWinRate ? 'Tier / WR' : '2HG Tier'}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCards.map(card => {
                    const isExpanded = !!expandedCards[card.id];
                    return (
                      <React.Fragment key={card.id}>
                        {/* Main row */}
                        <tr 
                          onClick={() => toggleCard(card.id)}
                          style={{ cursor: 'pointer', background: isExpanded ? 'rgba(139, 92, 246, 0.04)' : 'transparent' }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#fff' }}>{card.name}</strong>
                            {card.isSourceMaterial && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.05rem 0.25rem', borderRadius: '4px', fontWeight: 700 }}>
                                Source
                              </span>
                            )}
                          </td>
                          <td><code style={{ fontSize: '0.85rem' }}>{card.cost || '—'}</code></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                              {card.color.map(col => (
                                <span key={col} className={`badge-color ${col}`} style={{ width: '16px', height: '16px', fontSize: '0.6rem' }}>
                                  {col === 'Multicolor' ? 'M' : col === 'Colorless' ? 'C' : col[0]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.rarity}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.type}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <span className={`badge-tier ${card.tier2HG}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', display: 'inline-block', minWidth: '55px' }}>
                                Tier {card.tier2HG}
                              </span>
                              {showWinRate && statsMap[card.name] && (
                                <span style={{ 
                                  fontSize: '0.72rem', 
                                  fontWeight: 'bold', 
                                  padding: '0.05rem 0.3rem', 
                                  borderRadius: '4px', 
                                  background: 'rgba(16, 185, 129, 0.12)', 
                                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                                  color: '#34d399', 
                                  minWidth: '55px', 
                                  textAlign: 'center' 
                                }}>
                                  {statsMap[card.name].gihWR.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="row-expanded-data">
                            <td></td>
                            <td colSpan="6">
                              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start', padding: '0.5rem 0' }}>
                                {/* Card image preview */}
                                {card.imageUrl && (
                                  <div style={{ 
                                    flexShrink: 0, 
                                    width: '160px', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                  }}>
                                    <img 
                                      src={card.imageUrl} 
                                      alt={card.name} 
                                      style={{ width: '100%', height: 'auto', display: 'block' }} 
                                    />
                                  </div>
                                )}

                                {/* Card details */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {/* Oracle-like card text */}
                                  {!card.imageUrl && (
                                    <div>
                                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.15rem' }}>Text karty</span>
                                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{card.description}</p>
                                    </div>
                                  )}

                                  {/* Mechanics badges */}
                                  {card.mechanics[0] !== 'None' && (
                                    <div>
                                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>Mechaniky</span>
                                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        {card.mechanics.map(mech => (
                                          <span key={mech} style={{ background: 'rgba(255,255,255,0.04)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)' }}>
                                            {mech}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 2HG Audit details */}
                                  <div style={{ 
                                    background: 'rgba(139, 92, 246, 0.03)', 
                                    border: '1px dashed rgba(139, 92, 246, 0.15)', 
                                    borderRadius: '8px', 
                                    padding: '0.85rem' 
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', color: '#c084fc', marginBottom: '0.25rem' }}>
                                      {card.tier2HG === 'D' || card.tier2HG === 'F' ? <ShieldAlert size={12} style={{ color: '#ef4444' }} /> : <Info size={12} />}
                                      <span>{card.tier2HG === 'D' || card.tier2HG === 'F' ? 'PROČ V 2HG SELHÁVÁ:' : '2HG TAKTICKÝ AUDIT / SYNERGIE:'}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#fff', lineHeight: '1.45' }}>
                                      {card.impact2HG}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Load More Button */}
          {filteredCards.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={handleLoadMore} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Načíst další (+24)
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: 0 }}>Nebyly nalezeny žádné karty odpovídající vybraným filtrům.</p>
        </div>
      )}
    </div>
  );
}
