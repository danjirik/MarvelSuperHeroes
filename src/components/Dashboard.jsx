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
          <h1 className="hero-h1" style={{ marginBottom: '0.5rem', lineHeight: 1.1 }}>

            MTG Marvel 2HG Tactician
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#d1d5db', maxWidth: '800px', marginBottom: '1.5rem' }}>
            Připravte se na turnaje formátu Two-Headed Giant (2HG) pro crossover edici Magic: The Gathering – Marvel Super Heroes. Analyzujte karty, simulujte sealed pooly a optimalizujte synergie vašeho týmu.
          </p>
          <div className="btn-row">

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
        
        <div className="grid-auto" style={{ marginTop: '1.5rem' }}>

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
      <div className="grid-auto" style={{ marginTop: '2rem' }}>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveTab('guide')}
        >
          <BookOpen size={36} style={{ color: '#a78bfa', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Taktický průvodce</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}>Prostudujte metagame, rozdělení rolí a pravidla 2HG.</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveTab('tierlist')}
        >
          <Users size={36} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Tier List karet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}>Hodnocení 314 karet s detailními 2HG auditními komentáři.</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveTab('matcher')}
        >
          <Users size={36} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Párovač archetypů</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}>Analyzujte kompatibilitu dvou balíčků a odhalte rizika.</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveTab('simulator')}
        >
          <Sword size={36} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Sealed Simulator</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}>Trénujte stavbu ze 12 boosterů s asistencí mana křivek.</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveTab('calculators')}
        >
          <Zap size={36} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Kalkulačka a Akademie</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}>Pravidla 2HG mechanik a interaktivní výpočty poškození.</p>
        </div>
      </div>
    </div>
  );
}
