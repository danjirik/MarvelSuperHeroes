import React, { useState } from 'react';

import { cardsData, basicLandsAndFillers } from '../data/cardsData';
import { Sparkles, Trash2, ArrowRight, BookOpen, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';

export default function SealedSimulator() {
  const [cardPool, setCardPool] = useState([]);
  const [boostersOpened, setBoostersOpened] = useState(false);
  const [poolFilterColor, setPoolFilterColor] = useState('All');

  // Accordion state for color groups in sideboard pool
  const [openGroups, setOpenGroups] = useState({
    W: true,
    U: true,
    B: true,
    R: true,
    G: true,
    Multicolor: true,
    Colorless: true,
    Land: true
  });

  // Mobile tooltip state
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleTooltipToggle = (id) => {
    setActiveTooltip(prev => prev === id ? null : id);
  };


  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const getCardGroupKey = (card) => {
    if (card.type && card.type.includes('Land')) return 'Land';
    if (card.color.includes('Multicolor')) return 'Multicolor';
    if (card.color.includes('Colorless')) return 'Colorless';
    if (card.color.includes('W')) return 'W';
    if (card.color.includes('U')) return 'U';
    if (card.color.includes('B')) return 'B';
    if (card.color.includes('R')) return 'R';
    if (card.color.includes('G')) return 'G';
    return 'Colorless';
  };

  const colorGroups = [
    { key: 'W', name: 'Bílá (White)', color: '#f3f4f6' },
    { key: 'U', name: 'Modrá (Blue)', color: '#3b82f6' },
    { key: 'B', name: 'Černá (Black)', color: '#1f2937' },
    { key: 'R', name: 'Červená (Red)', color: '#ef4444' },
    { key: 'G', name: 'Zelená (Green)', color: '#10b981' },
    { key: 'Multicolor', name: 'Vícebarevné (Multicolor)', color: 'linear-gradient(135deg, #fbbf24, #f43f5e, #3b82f6)' },
    { key: 'Colorless', name: 'Bezbarvé (Colorless)', color: '#9ca3af' },
    { key: 'Land', name: 'Země (Lands)', color: '#8b5cf6' }
  ];

  // Open 12 boosters logic
  const open12Boosters = () => {
    const newPool = [];
    
    // Combine full card databases
    const allCards = [...cardsData, ...basicLandsAndFillers];
    
    const rares = allCards.filter(c => c.rarity === 'Rare' || c.rarity === 'Mythic');
    const uncommons = allCards.filter(c => c.rarity === 'Uncommon');
    const commons = allCards.filter(c => c.rarity === 'Common' && c.type !== 'Land');
    const lands = allCards.filter(c => c.type === 'Land');

    // Simulate 12 boosters
    for (let b = 0; b < 12; b++) {
      // 1 Rare/Mythic
      const rare = rares[Math.floor(Math.random() * rares.length)];
      newPool.push({ ...rare, instanceId: `${rare.id}-${b}-rare`, location: 'Sideboard' });
      
      // 3 Uncommons
      for (let u = 0; u < 3; u++) {
        const unc = uncommons[Math.floor(Math.random() * uncommons.length)];
        newPool.push({ ...unc, instanceId: `${unc.id}-${b}-unc-${u}`, location: 'Sideboard' });
      }
      
      // 9 Commons
      for (let c = 0; c < 9; c++) {
        const comm = commons[Math.floor(Math.random() * commons.length)];
        newPool.push({ ...comm, instanceId: `${comm.id}-${b}-comm-${c}`, location: 'Sideboard' });
      }
      
      // 1 Land
      const land = lands[Math.floor(Math.random() * lands.length)];
      newPool.push({ ...land, instanceId: `${land.id}-${b}-land`, location: 'Sideboard' });
    }

    setCardPool(newPool);
    setBoostersOpened(true);
  };

  const moveCard = (instanceId, newLocation) => {
    setCardPool(prev => prev.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, location: newLocation };
      }
      return c;
    }));
  };

  const resetSimulator = () => {
    setCardPool([]);
    setBoostersOpened(false);
  };

  // Grouped lists
  const sideboard = cardPool.filter(c => c.location === 'Sideboard');
  const deckA = cardPool.filter(c => c.location === 'A');
  const deckB = cardPool.filter(c => c.location === 'B');

  // Filtered Sideboard for UI listing
  const filteredSideboard = sideboard.filter(c => {
    if (poolFilterColor === 'All') return true;
    if (poolFilterColor === 'Multicolor') return c.color && c.color.includes('Multicolor');
    if (poolFilterColor === 'Colorless') return c.color && c.color.includes('Colorless');
    return c.color && c.color.includes(poolFilterColor);
  });

  // Calculate mana curve
  const getManaCurve = (deck) => {
    const curve = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 };
    deck.forEach(c => {
      if (c.type === 'Land' || !c.cost) return;
      // parse CMC (rough estimation based on length / digits)
      const numericCost = c.cost.replace(/[^0-9]/g, '');
      const generic = numericCost ? parseInt(numericCost) : 0;
      const colored = c.cost.replace(/[0-9]/g, '').length;
      const cmc = generic + colored;
      
      if (cmc <= 1) curve['1']++;
      else if (cmc === 2) curve['2']++;
      else if (cmc === 3) curve['3']++;
      else if (cmc === 4) curve['4']++;
      else if (cmc === 5) curve['5']++;
      else curve['6+']++;
    });
    return curve;
  };

  const curveA = getManaCurve(deckA);
  const curveB = getManaCurve(deckB);

  // Deck Primary colors
  const getDeckColors = (deck) => {
    const colorsCount = {};
    deck.forEach(c => {
      if (c.type === 'Land' || !c.color) return;
      c.color.forEach(col => {
        colorsCount[col] = (colorsCount[col] || 0) + 1;
      });
    });
    // return colors with at least 1 card
    return Object.keys(colorsCount).filter(col => colorsCount[col] >= 1);
  };

  const colorsA = getDeckColors(deckA);
  const colorsB = getDeckColors(deckB);

  // Validation Warnings
  const warnings = [];
  const overlaps = colorsA.filter(c => colorsB.includes(c));

  if (boostersOpened) {
    if (deckA.length > 0 && deckA.length < 40) {
      warnings.push(`Hráč A má v balíčku jen ${deckA.length} karet (doporučeno minimálně 40 včetně zemí).`);
    }
    if (deckB.length > 0 && deckB.length < 40) {
      warnings.push(`Hráč B má v balíčku jen ${deckB.length} karet (doporučeno minimálně 40 včetně zemí).`);
    }
    if (overlaps.length > 0) {
      const colorNames = { 'W': 'Bílá', 'U': 'Modrá', 'B': 'Černá', 'R': 'Červená', 'G': 'Zelená' };
      const overlapStr = overlaps.map(col => colorNames[col] || col).join(', ');
      warnings.push(`Barevný konflikt! Oba balíčky sdílejí barvy: ${overlapStr}. V 2HG Sealed to oslabuje celkovou sílu, protože si konkurujete o nejlepší karty stejné barvy.`);
    }
  }

  // Count counts of card in sideboard by card ID (to show grouped view in pool)
  const groupedSideboardMap = {};
  filteredSideboard.forEach(card => {
    if (!groupedSideboardMap[card.id]) {
      groupedSideboardMap[card.id] = {
        cardData: card,
        instances: []
      };
    }
    groupedSideboardMap[card.id].instances.push(card);
  });
  
  const groupedSideboard = Object.values(groupedSideboardMap);

  return (
    <div className="sealed-simulator-container">
      {/* Overview Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles style={{ color: '#ef4444' }} />
          Simulátor 2HG Sealed Poolu
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>
          Trénujte stavbu decku. Otevřete 12 Play Boosterů Marvel Super Heroes (celkem 168 karet) a zkuste je rozdělit do dvou samostatných 40karetních balíků. Hlídejte si překryvy barev, mana křivku a synergické vazby.
        </p>
      </div>

      {!boostersOpened ? (
        /* Setup / Open boosters prompt */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BookOpen size={48} style={{ color: '#ef4444', margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>Váš Sealed Pool je prázdný</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Kliknutím na tlačítko níže nasimulujete rozbalení 12 boosterů (12 boosterů x 14 karet). Každý booster obsahuje reálný poměr rarit a typů, včetně legend, padouchů a fixací.
          </p>
          <button className="btn-primary" onClick={open12Boosters} style={{ margin: '0 auto', fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Rozbalit 12 Boosterů
          </button>
        </div>
      ) : (
        /* Active Deckbuilding Workspace */
        <div>
          {/* Action Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={resetSimulator} style={{ flex: '0 0 auto' }}>
                <Trash2 size={16} />
                Resetovat a začít znovu
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>Filtr:</span>
              {['All', 'W', 'U', 'B', 'R', 'G', 'Multicolor', 'Colorless'].map(col => (
                <button 
                  key={col}
                  onClick={() => setPoolFilterColor(col)}
                  className={`nav-button ${poolFilterColor === col ? 'active' : ''}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', minWidth: 'fit-content' }}
                >
                  {col === 'Multicolor' ? 'Multi' : col === 'Colorless' ? 'CL' : col}
                </button>
              ))}
            </div>
          </div>


          {/* Warnings container */}
          {warnings.length > 0 && (
            <div className="deck-warnings" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <AlertTriangle size={18} />
                <span>Asistent stavby – Analýza týmu:</span>
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {warnings.map((w, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{w}</li>)}
              </ul>
            </div>
          )}

          {warnings.length === 0 && deckA.length >= 40 && deckB.length >= 40 && (
            <div className="deck-warnings" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', color: '#34d399', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <CheckCircle size={18} />
                <span>Tým je připraven! Oba balíčky mají dostatek karet a barevná kompozice je bez konfliktů.</span>
              </div>
            </div>
          )}

          {/* Main workspace layout */}
          <div className="sealed-grid">
            
            {/* Sideboard / Pool selection column */}
            <div>
              <div className="sealed-pool-header">
                <h3>Karty v Poolu ({sideboard.length})</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '1100px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {(() => {
                  // Seskupit sideboard do barev
                  const sideboardGroups = {
                    W: [],
                    U: [],
                    B: [],
                    R: [],
                    G: [],
                    Multicolor: [],
                    Colorless: [],
                    Land: []
                  };

                  filteredSideboard.forEach(card => {
                    const groupKey = getCardGroupKey(card);
                    sideboardGroups[groupKey].push(card);
                  });

                  let hasAnyCards = false;

                  const elements = colorGroups.map(group => {
                    const cardsInGroup = sideboardGroups[group.key];
                    if (!cardsInGroup || cardsInGroup.length === 0) return null;
                    
                    hasAnyCards = true;
                    const isGroupOpen = !!openGroups[group.key];

                    // Seskupit duplicity v rámci barvy
                    const groupedInGroupMap = {};
                    cardsInGroup.forEach(c => {
                      if (!groupedInGroupMap[c.id]) {
                        groupedInGroupMap[c.id] = { cardData: c, instances: [] };
                      }
                      groupedInGroupMap[c.id].instances.push(c);
                    });
                    const groupedCards = Object.values(groupedInGroupMap);

                    return (
                      <div key={group.key} className="sealed-pool-group">
                        <div 
                          className="sealed-pool-group-header" 
                          onClick={() => toggleGroup(group.key)}
                        >
                          <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ 
                              display: 'inline-block', 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              background: group.key === 'Multicolor' ? 'linear-gradient(135deg, #fbbf24, #f43f5e, #3b82f6)' : group.color 
                            }}></span>
                            {group.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {cardsInGroup.length}x {isGroupOpen ? '▲' : '▼'}
                          </span>
                        </div>
                        
                        {isGroupOpen && (
                          <div className="sealed-pool-group-content">
                            {groupedCards.map(({ cardData, instances }) => {
                              const count = instances.length;
                              return (
                                <div key={cardData.id} className="compact-card-row">
                                  <div className="card-row-info">
                                    {/* Small Tier Indicator */}
                                    <span className={`badge-tier ${cardData.tier2HG || 'C'}`} style={{ 
                                      fontSize: '0.62rem', 
                                      padding: '0.05rem 0.25rem', 
                                      minWidth: '42px', 
                                      textAlign: 'center',
                                      display: 'inline-block' 
                                    }}>
                                      Tier {cardData.tier2HG || 'C'}
                                    </span>
                                    
                                    {/* Tooltip trigger name */}
                                    <div
                                       className={`card-tooltip-trigger ${activeTooltip === `pool-${cardData.id}-${idx}` ? 'active' : ''}`}
                                       onClick={() => handleTooltipToggle(`pool-${cardData.id}-${idx}`)}
                                     >
                                      <strong style={{ color: '#fff', fontSize: '0.82rem', cursor: 'help' }}>
                                        {cardData.name} {count > 1 && <span style={{ color: '#ec4899', fontWeight: 800 }}>({count}x)</span>}
                                      </strong>
                                      
                                      {/* Tooltip Popup */}
                                      <div className="card-tooltip-content" style={{ width: '260px' }}>
                                        {cardData.imageUrl && (
                                          <div style={{ width: '100%', marginBottom: '0.5rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <img src={cardData.imageUrl} alt={cardData.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                          </div>
                                        )}
                                        <div style={{ 
                                          fontWeight: 800, 
                                          marginBottom: '0.35rem', 
                                          borderBottom: '1px solid rgba(255,255,255,0.08)', 
                                          paddingBottom: '0.25rem', 
                                          display: 'flex', 
                                          justifyContent: 'space-between',
                                          fontSize: '0.85rem'
                                        }}>
                                          <span>{cardData.name}</span>
                                          <span style={{ color: '#a78bfa' }}>{cardData.cost || 'Země'}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                          {cardData.type} — {cardData.rarity}
                                        </p>
                                        {!cardData.imageUrl && (
                                          <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                            {cardData.description}
                                          </p>
                                        )}
                                        <div style={{ 
                                          background: 'rgba(139, 92, 246, 0.08)', 
                                          border: '1px dashed rgba(139, 92, 246, 0.25)', 
                                          borderRadius: '6px', 
                                          padding: '0.5rem', 
                                          fontSize: '0.75rem', 
                                          color: '#c084fc',
                                          lineHeight: 1.35
                                        }}>
                                          <strong style={{ display: 'block', marginBottom: '0.1rem' }}>2HG Taktický audit:</strong> 
                                          {cardData.impact2HG || 'Bez specifických komentářů.'}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cardData.cost || 'Země'}</span>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="card-row-actions">
                                    <button 
                                      className="btn-secondary" 
                                      style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}
                                      onClick={() => moveCard(instances[0].instanceId, 'A')}
                                    >
                                      +A
                                    </button>
                                    <button 
                                      className="btn-secondary" 
                                      style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}
                                      onClick={() => moveCard(instances[0].instanceId, 'B')}
                                    >
                                      +B
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });

                  return hasAnyCards ? elements : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Žádné karty neodpovídají filtru.
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Split Decks display columns */}
            <div>
              <div className="sealed-split-container">
                
                {/* Player A Deck Column */}
                <div className="deck-column">
                  <div className="deck-column-header">
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Balíček Hráče A</h3>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {deckA.length} karet | Barvy: {colorsA.length > 0 ? colorsA.join(', ') : 'Žádné'}
                      </span>
                    </div>
                    {/* Visual bar graph representation */}
                    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'flex-end', height: '24px' }}>
                      {Object.values(curveA).map((val, idx) => (
                        <div 
                          key={idx} 
                          style={{ width: '4px', height: `${Math.min(val * 4, 24)}px`, background: '#3b82f6', borderRadius: '1px' }}
                          title={`Mana CMC ${idx+1}: ${val} karet`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="deck-cards-list">
                    {deckA.map(card => (
                      <div 
                        key={card.instanceId} 
                        className="deck-card-strip"
                        style={{ position: 'relative' }}
                      >
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flex: 1 }}>
                          {card.color && card.color.map(col => (
                            <span key={col} className={`badge-color ${col}`} style={{ width: '12px', height: '12px', fontSize: '0.5rem' }}>{col[0]}</span>
                          ))}
                          
                          {/* Tooltip trigger */}
                          <div
                            className={`card-tooltip-trigger ${activeTooltip === `deckA-${card.instanceId}` ? 'active' : ''}`}
                            style={{ cursor: 'help' }}
                            onClick={() => handleTooltipToggle(`deckA-${card.instanceId}`)}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{card.name}</span>
                            
                            {/* Tooltip Popup */}
                            <div className="card-tooltip-content" style={{ width: '260px', left: '0', transform: 'none' }}>
                              {card.imageUrl && (
                                <div style={{ width: '100%', marginBottom: '0.5rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </div>
                              )}
                              <div style={{ 
                                fontWeight: 800, 
                                marginBottom: '0.35rem', 
                                borderBottom: '1px solid rgba(255,255,255,0.08)', 
                                paddingBottom: '0.25rem', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: '0.85rem'
                              }}>
                                <span>{card.name}</span>
                                <span style={{ color: '#a78bfa' }}>{card.cost || 'Země'}</span>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {card.type} — {card.rarity}
                              </p>
                              {!card.imageUrl && (
                                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                  {card.description}
                                </p>
                              )}
                              {card.impact2HG && (
                                <div style={{ 
                                  background: 'rgba(139, 92, 246, 0.08)', 
                                  border: '1px dashed rgba(139, 92, 246, 0.25)', 
                                  borderRadius: '6px', 
                                  padding: '0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: '#c084fc',
                                  lineHeight: 1.35
                                }}>
                                  <strong style={{ display: 'block', marginBottom: '0.1rem' }}>2HG Taktický audit:</strong> 
                                  {card.impact2HG}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => moveCard(card.instanceId, 'Sideboard')}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.cost || 'Země'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>✖</span>
                        </div>
                      </div>
                    ))}
                    {deckA.length === 0 && (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', marginTop: '4rem' }}>
                        Klikněte na „Přiřadit A“ v poolu karet.
                      </p>
                    )}
                  </div>
                </div>
 
                {/* Player B Deck Column */}
                <div className="deck-column">
                  <div className="deck-column-header">
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Balíček Hráče B</h3>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {deckB.length} karet | Barvy: {colorsB.length > 0 ? colorsB.join(', ') : 'Žádné'}
                      </span>
                    </div>
                    {/* Visual bar graph representation */}
                    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'flex-end', height: '24px' }}>
                      {Object.values(curveB).map((val, idx) => (
                        <div 
                          key={idx} 
                          style={{ width: '4px', height: `${Math.min(val * 4, 24)}px`, background: '#10b981', borderRadius: '1px' }}
                          title={`Mana CMC ${idx+1}: ${val} karet`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="deck-cards-list">
                    {deckB.map(card => (
                      <div 
                        key={card.instanceId} 
                        className="deck-card-strip"
                        style={{ position: 'relative' }}
                      >
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flex: 1 }}>
                          {card.color && card.color.map(col => (
                            <span key={col} className={`badge-color ${col}`} style={{ width: '12px', height: '12px', fontSize: '0.5rem' }}>{col[0]}</span>
                          ))}
                          
                          {/* Tooltip trigger */}
                          <div
                            className={`card-tooltip-trigger ${activeTooltip === `deckB-${card.instanceId}` ? 'active' : ''}`}
                            style={{ cursor: 'help' }}
                            onClick={() => handleTooltipToggle(`deckB-${card.instanceId}`)}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{card.name}</span>
                            
                            {/* Tooltip Popup */}
                            <div className="card-tooltip-content" style={{ width: '260px', left: '0', transform: 'none' }}>
                              {card.imageUrl && (
                                <div style={{ width: '100%', marginBottom: '0.5rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </div>
                              )}
                              <div style={{ 
                                fontWeight: 800, 
                                marginBottom: '0.35rem', 
                                borderBottom: '1px solid rgba(255,255,255,0.08)', 
                                paddingBottom: '0.25rem', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: '0.85rem'
                              }}>
                                <span>{card.name}</span>
                                <span style={{ color: '#a78bfa' }}>{card.cost || 'Země'}</span>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {card.type} — {card.rarity}
                              </p>
                              {!card.imageUrl && (
                                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                  {card.description}
                                </p>
                              )}
                              {card.impact2HG && (
                                <div style={{ 
                                  background: 'rgba(139, 92, 246, 0.08)', 
                                  border: '1px dashed rgba(139, 92, 246, 0.25)', 
                                  borderRadius: '6px', 
                                  padding: '0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: '#c084fc',
                                  lineHeight: 1.35
                                }}>
                                  <strong style={{ display: 'block', marginBottom: '0.1rem' }}>2HG Taktický audit:</strong> 
                                  {card.impact2HG}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => moveCard(card.instanceId, 'Sideboard')}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.cost || 'Země'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>✖</span>
                        </div>
                      </div>
                    ))}
                    {deckB.length === 0 && (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', marginTop: '4rem' }}>
                        Klikněte na „Přiřadit B“ v poolu karet.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile tooltip backdrop overlay */}
      {activeTooltip && (
        <div
          onClick={() => setActiveTooltip(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 299,
            background: 'rgba(0,0,0,0.4)',
            touchAction: 'none',
          }}
        />
      )}
    </div>
  );
}
