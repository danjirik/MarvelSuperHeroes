import React, { useState } from 'react';
import { archetypesData, evaluatePairing } from '../data/archetypesData';
import { Users, Info, ShieldAlert, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ArchetypeMatcher() {
  const [deckA, setDeckA] = useState('UB');
  const [deckB, setDeckB] = useState('RG');
  const [showDetailsA, setShowDetailsA] = useState(false);
  const [showDetailsB, setShowDetailsB] = useState(false);

  const archetypeA = archetypesData.find(a => a.id === deckA);
  const archetypeB = archetypesData.find(a => a.id === deckB);
  
  const pairingResult = evaluatePairing(deckA, deckB);

  const getColorsBadges = (id) => {
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

  const recommendedPairings = [
    {
      deckA: 'UB',
      deckB: 'RG',
      tier: 'S',
      title: 'Gruul + Dimir (Doplňková Asymetrie)',
      desc: 'Gruul drží zemi a upoutává pozornost obřími tvory (Hulk). Dimir mezitím bezpečně líže karty a pasivně odčerpává životy soupeřů (Kang, Dr. Doom) bez nutnosti útočit.'
    },
    {
      deckA: 'UR',
      deckB: 'BG',
      tier: 'S',
      title: 'Izzet + Golgari (Artefaktová Letka & Pevný Val)',
      desc: 'Golgari drží pozemní obranu a využívá levné, silné blockery těžící ze hřbitova. Izzet má volné ruce k budování masivní karetní a artefaktové výhody a útočení vzduchem.'
    },
    {
      deckA: 'BR',
      deckB: 'GW',
      tier: 'A',
      title: 'Rakdos + Selesnya (Hrdinové & Padouši)',
      desc: 'Selesnya zaplaví stůl hrdiny a tokeny pro neprůchodnou obranu. Rakdos v bezpečí sesílá padouchy s Menace a spouští asymetrické ETB efekty (Crossbones).'
    },
    {
      deckA: 'BR',
      deckB: 'WU',
      tier: 'A',
      title: 'Rakdos + Azorius (Týmová Kontrola)',
      desc: 'Azorius drží vzduch a bezpečně využívá Teamwork kouzla, zatímco Rakdos provádí bleskový removal a tlačí na životy soupeřů.'
    }
  ];

  // Helper for styling result banner dynamically
  const getBannerStyle = (tier) => {
    switch (tier) {
      case 'S': return { borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.08)' };
      case 'A': return { borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.08)' };
      case 'B': return { borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' };
      case 'C': return { borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' };
      case 'F': return { borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' };
      default: return {};
    }
  };

  return (
    <div className="matcher-container-wrapper">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users style={{ color: '#3b82f6' }} />
          Párovač Archetypů a Týmová Synergie
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>
          Zvolte herní archetypy pro oba hráče ve vašem týmu. Aplikace automaticky analyzuje, zda se vaše strategie vzájemně doplňují, zda nedochází k barevnému překryvu (který v Limited 2HG Sealed poškozuje kvalitu obou balíků), a ukáže vám taktické tipy a hrozby.
        </p>
      </div>

      {/* Recommended Pairings List */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', marginBottom: '1rem', fontSize: '1.2rem' }}>
          <Sparkles size={20} style={{ color: '#a78bfa' }} />
          Doporučené Týmové Kombinace (S & A-Tier)
        </h3>
        <div className="grid-auto">

          {recommendedPairings.map((pair, idx) => (
            <button 
              key={idx}
              className={`mtg-card-item glow-${pair.tier}`}
              style={{ 
                padding: '1rem', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(15, 15, 22, 0.85)',
                fontFamily: 'inherit'
              }}
              onClick={() => {
                setDeckA(pair.deckA);
                setDeckB(pair.deckB);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span className={`badge-tier ${pair.tier}`} style={{ fontSize: '0.7rem' }}>Synergie {pair.tier}</span>
                <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                  {getColorsBadges(pair.deckA).map(c => (
                    <span key={c} className={`badge-color ${c}`} style={{ width: '14px', height: '14px', fontSize: '0.55rem' }}>{c}</span>
                  ))}
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>+</span>
                  {getColorsBadges(pair.deckB).map(c => (
                    <span key={c} className={`badge-color ${c}`} style={{ width: '14px', height: '14px', fontSize: '0.55rem' }}>{c}</span>
                  ))}
                </div>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{pair.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, lineHeight: 1.35 }}>{pair.desc}</p>
              <div style={{ marginTop: 'auto', textAlign: 'right', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', width: '100%' }}>
                Načíst do párovače
                <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selector Grid */}
      <div className="matcher-container">
        
        {/* Player A Deck Select */}
        <div className="archetype-select-box selected" style={{ padding: '1.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Hráč A (Levá hlava)</label>
          <select 
            value={deckA} 
            onChange={(e) => setDeckA(e.target.value)}
            className="input-field"
            style={{ fontSize: '1rem', fontWeight: '700', background: 'rgba(10,10,12,0.9)', marginBottom: '0.5rem' }}
          >
            {archetypesData.map(a => (
              <option key={a.id} value={a.id}>{a.name} - Tier {a.tier2HG}</option>
            ))}
          </select>
          
          {archetypeA && (
            <div>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {getColorsBadges(deckA).map(c => (
                  <span key={c} className={`badge-color ${c}`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>{c}</span>
                ))}
                <span className={`badge-tier ${archetypeA.tier2HG}`} style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem', marginLeft: 'auto' }}>
                  Solo: {archetypeA.tier2HG}
                </span>
                
                <button 
                  onClick={() => setShowDetailsA(!showDetailsA)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    borderRadius: '4px',
                    marginLeft: '0.5rem'
                  }}
                >
                  <Info size={12} />
                  {showDetailsA ? 'Skrýt info' : 'Info'}
                </button>
              </div>

              {showDetailsA && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.15rem' }}>Téma:</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{archetypeA.theme}</p>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.15rem' }}>Strategie:</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{archetypeA.strategy}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VS Separator */}
        <div className="matcher-vs">
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>VS</span>
        </div>

        {/* Player B Deck Select */}
        <div className="archetype-select-box selected" style={{ padding: '1.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Hráč B (Pravá hlava)</label>
          <select 
            value={deckB} 
            onChange={(e) => setDeckB(e.target.value)}
            className="input-field"
            style={{ fontSize: '1rem', fontWeight: '700', background: 'rgba(10,10,12,0.9)', marginBottom: '0.5rem' }}
          >
            {archetypesData.map(a => (
              <option key={a.id} value={a.id}>{a.name} - Tier {a.tier2HG}</option>
            ))}
          </select>
          
          {archetypeB && (
            <div>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {getColorsBadges(deckB).map(c => (
                  <span key={c} className={`badge-color ${c}`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>{c}</span>
                ))}
                <span className={`badge-tier ${archetypeB.tier2HG}`} style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem', marginLeft: 'auto' }}>
                  Solo: {archetypeB.tier2HG}
                </span>
                
                <button 
                  onClick={() => setShowDetailsB(!showDetailsB)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    borderRadius: '4px',
                    marginLeft: '0.5rem'
                  }}
                >
                  <Info size={12} />
                  {showDetailsB ? 'Skrýt info' : 'Info'}
                </button>
              </div>

              {showDetailsB && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.15rem' }}>Téma:</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{archetypeB.theme}</p>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.15rem' }}>Strategie:</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{archetypeB.strategy}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Match Synergy Result Banner */}
      {pairingResult && (
        <div className="glass-panel" style={{ marginTop: '1rem', ...getBannerStyle(pairingResult.tier) }}>
          <div className="result-synergy-banner" style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <div className={`synergy-letter-badge ${pairingResult.tier}`} style={{ flexShrink: 0 }}>
              {pairingResult.tier}
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 800 }}>Týmová kompatibilita</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.1rem 0 0.25rem 0' }}>{pairingResult.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e7eb' }}>
                {pairingResult.tier === 'S' && 'Naprosto špičková týmová kombinace, která plně využívá herní pravidla 2HG bez jakéhokoliv konfliktu zdrojů.'}
                {pairingResult.tier === 'A' && 'Skvělá týmová souhra. Balíčky mají rozdělené role a dokáží se navzájem výborně chránit.'}
                {pairingResult.tier === 'B' && 'Standardní spolehlivá kombinace bez barevného konfliktu. Vyžaduje dobrou herní disciplínu.'}
                {pairingResult.tier === 'C' && 'Varování: Jeden ze sdílených barevných tónů oslabí oba balíky. Zvažte úpravy mana základny.'}
                {pairingResult.tier === 'F' && 'Pozor: Tato kombinace je v 2HG silně znevýhodněná, buď kvůli zásadním barevným střetům, nebo nefunkční mechanice.'}
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid-2col" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>

            {/* Synergies Column */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '1.1rem', marginBottom: '1rem' }}>
                <Sparkles size={18} />
                Týmové synergie a výhody
              </h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {pairingResult.synergies.map((syn, idx) => (
                  <li key={idx} style={{ position: 'relative', paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#d1d5db', marginBottom: '0.6rem', lineHeight: '1.45' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                    {syn}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks Column */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '1.1rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} style={{ color: '#f87171' }} />
                Rizika a úskalí
              </h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {pairingResult.risks.map((risk, idx) => (
                  <li key={idx} style={{ position: 'relative', paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#d1d5db', marginBottom: '0.6rem', lineHeight: '1.45' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
