import React, { useState } from 'react';
import { archetypesData, evaluatePairing } from '../data/archetypesData';
import { Users, Info, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export default function ArchetypeMatcher() {
  const [deckA, setDeckA] = useState('UB');
  const [deckB, setDeckB] = useState('RG');

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

      {/* Selector Grid */}
      <div className="matcher-container">
        
        {/* Player A Deck Select */}
        <div className={`archetype-select-box selected`}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Hráč A (Levá hlava)</label>
          <select 
            value={deckA} 
            onChange={(e) => setDeckA(e.target.value)}
            className="input-field"
            style={{ fontSize: '1.1rem', fontWeight: '700', background: 'rgba(10,10,12,0.9)' }}
          >
            {archetypesData.map(a => (
              <option key={a.id} value={a.id}>{a.name} - Tier {a.tier2HG}</option>
            ))}
          </select>
          {archetypeA && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {getColorsBadges(deckA).map(c => (
                  <span key={c} className={`badge-color ${c}`}>{c}</span>
                ))}
                <span className={`badge-tier ${archetypeA.tier2HG}`} style={{ marginLeft: 'auto' }}>Individual: {archetypeA.tier2HG}</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Téma:</h4>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>{archetypeA.theme}</p>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Strategie:</h4>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4, height: '70px', overflowY: 'auto' }}>{archetypeA.strategy}</p>
            </div>
          )}
        </div>

        {/* VS Separator */}
        <div className="matcher-vs">
          <span>VS</span>
        </div>

        {/* Player B Deck Select */}
        <div className={`archetype-select-box selected`}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Hráč B (Pravá hlava)</label>
          <select 
            value={deckB} 
            onChange={(e) => setDeckB(e.target.value)}
            className="input-field"
            style={{ fontSize: '1.1rem', fontWeight: '700', background: 'rgba(10,10,12,0.9)' }}
          >
            {archetypesData.map(a => (
              <option key={a.id} value={a.id}>{a.name} - Tier {a.tier2HG}</option>
            ))}
          </select>
          {archetypeB && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {getColorsBadges(deckB).map(c => (
                  <span key={c} className={`badge-color ${c}`}>{c}</span>
                ))}
                <span className={`badge-tier ${archetypeB.tier2HG}`} style={{ marginLeft: 'auto' }}>Individual: {archetypeB.tier2HG}</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Téma:</h4>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>{archetypeB.theme}</p>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Strategie:</h4>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4, height: '70px', overflowY: 'auto' }}>{archetypeB.strategy}</p>
            </div>
          )}
        </div>

      </div>

      {/* Match Synergy Result Banner */}
      {pairingResult && (
        <div className="glass-panel" style={{ marginTop: '1rem' }}>
          <div className="result-synergy-banner">
            <div className={`synergy-letter-badge ${pairingResult.tier}`}>
              {pairingResult.tier}
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 800 }}>Týmová kompatibilita</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.1rem 0 0.25rem 0' }}>{pairingResult.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {pairingResult.tier === 'S' && 'Naprosto špičková týmová kombinace, která plně využívá herní pravidla 2HG bez jakéhokoliv konfliktu zdrojů.'}
                {pairingResult.tier === 'A' && 'Skvělá týmová souhra. Balíčky mají rozdělené role a dokáží se navzájem výborně chránit.'}
                {pairingResult.tier === 'B' && 'Standardní spolehlivá kombinace bez barevného konfliktu. Vyžaduje dobrou herní disciplínu.'}
                {pairingResult.tier === 'C' && 'Varování: Jeden ze sdílených barevných tónů oslabí oba balíky. Zvažte úpravy mana základny.'}
                {pairingResult.tier === 'F' && 'Pozor: Tato kombinace je v 2HG silně znevýhodněná, buď kvůli zásadním barevným střetům, nebo nefunkční mechanice.'}
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
            {/* Synergies Column */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '1.1rem' }}>
                <Sparkles size={18} />
                Týmové synergie a výhody
              </h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {pairingResult.synergies.map((syn, idx) => (
                  <li key={idx} style={{ position: 'relative', paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#d1d5db', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                    {syn}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks Column */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '1.1rem' }}>
                <AlertTriangle size={18} />
                Rizika a úskalí
              </h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {pairingResult.risks.map((risk, idx) => (
                  <li key={idx} style={{ position: 'relative', paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#d1d5db', marginBottom: '0.5rem', lineHeight: '1.4' }}>
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
