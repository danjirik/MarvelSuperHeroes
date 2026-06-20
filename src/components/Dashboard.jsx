import React from 'react';
import { Shield, Users, Sword, Zap, BookOpen } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="glass-panel hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="logo-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            Edice 2026 - MSH
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>
            MTG Marvel 2HG Tactician
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#d1d5db', maxWidth: '800px', marginBottom: '1.5rem' }}>
            Připravte se na turnaje formátu Two-Headed Giant (2HG) pro crossover edici Magic: The Gathering – Marvel Super Heroes. Analyzujte karty, simulujte sealed pooly a optimalizujte synergie vašeho týmu.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setActiveTab('simulator')}>
              <Sword size={18} />
              Spustit Sealed Simulator
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('tierlist')}>
              <Users size={18} />
              Prohlížet Tier List
            </button>
          </div>
        </div>
      </div>

      {/* Formát 2HG specifikace */}
      <div className="glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield className="text-purple-400" style={{ color: '#a78bfa' }} />
          Jak Marvel edice mění pravidla 2HG?
        </h2>
        <p>
          Two-Headed Giant (2HG) je týmový formát, kde dva hráči sdílejí společný pool 30 životů a hrají své tahy současně. Zdvojená obranná linie a společné rozhodování radikálně mění hodnotu jednotlivých mechanik a karet:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} />
              Efekty „Each Opponent“
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
              Klíčový zlom. Karta, která nutí „každého oponenta“ ztratit životy nebo utrpět poškození, to v 2HG dělá <strong>dvakrát</strong>. Karta jako <em>Doctor Doom</em> nebo <em>Crossbones</em> tak uděluje dvojnásobné poškození do společných životů soupeřů a stává se prioritní bombou.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} />
              Snadnější Teamwork
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
              Teamwork vyžaduje tapnutí bytostí s určitou silou. V 1v1 to znamená otevření obrany. V 2HG může jeden hráč tapnout celou svou armádu na aktivaci Teamworku, zatímco jeho partner drží robustní obranu a blokuje za oba hráče.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} />
              Plán (Plan) má čas
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
              Karty s mechanikou Plan vyžadují čas na nasbírání žetonů před spuštěním ultimátního efektu. S 30 sdílenými životy a dvěma sadami blockerů hry trvají déle a Plan karty tak téměř vždy dospějí ke svému drtivému finále.
            </p>
          </div>
        </div>
      </div>

      {/* Rychlý rozcestník */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }} onClick={() => setActiveTab('guide')}>
          <BookOpen size={32} style={{ color: '#a78bfa', marginBottom: '0.75rem' }} />
          <h3>Taktický průvodce</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Prostudujte metagame, rozdělení rolí a pravidla 2HG.</p>
        </div>

        <div className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }} onClick={() => setActiveTab('tierlist')}>
          <Users size={32} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
          <h3>Tier List karet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Prohlédněte si hodnocení jednotlivých karet s 2HG kontextem.</p>
        </div>

        <div className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }} onClick={() => setActiveTab('matcher')}>
          <Users size={32} style={{ color: '#3b82f6', marginBottom: '0.75rem' }} />
          <h3>Párovač archetypů</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Vyberte dva archetypy a zjistěte jejich synergii a rizika.</p>
        </div>

        <div className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }} onClick={() => setActiveTab('simulator')}>
          <Sword size={32} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h3>Sealed Simulator</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Otevřete 12 boosterů a rozdělte karty do dvou 40-karetních balíků.</p>
        </div>

        <div className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }} onClick={() => setActiveTab('calculators')}>
          <Zap size={32} style={{ color: '#f59e0b', marginBottom: '0.75rem' }} />
          <h3>Akademie a Kalkulačka</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Spočítejte si poškození a prostudujte pravidla 2HG mechanik.</p>
        </div>
      </div>
    </div>
  );
}
