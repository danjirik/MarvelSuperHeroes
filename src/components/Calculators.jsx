import React, { useState } from 'react';
import { Shield, Zap, Flame, Users, BookOpen, Calculator } from 'lucide-react';

export default function Calculators() {
  // Black Widow states
  const [widowGraveCount, setWidowGraveCount] = useState(5);
  const [widowHit, setWidowHit] = useState(true);

  // General each opponent states
  const [activeCard, setActiveCard] = useState('crossbones');
  const [triggerCount, setTriggerCount] = useState(3);

  // Teamwork states
  const [teamworkTarget, setTeamworkTarget] = useState(3);
  const [myTotalPower, setMyTotalPower] = useState(5);
  const [teammateTotalPower, setTeammateTotalPower] = useState(4);

  // Academy states
  const [expandedMech, setExpandedMech] = useState('teamwork');
  const [subTab, setSubTab] = useState('calcs'); // 'calcs' | 'academy'

  // Math for Black Widow
  const calculateWidowDamage = () => {
    if (!widowHit) return { standard: 0, twoHG: 0 };
    const baseDamage = 3; // Black Widow has 3 power
    const standard = widowGraveCount + baseDamage;
    const twoHG = (widowGraveCount * 2) + baseDamage;
    return { standard, twoHG };
  };

  const widowResult = calculateWidowDamage();

  // Math for each opponent
  const getCardDetails = () => {
    switch (activeCard) {
      case 'crossbones':
        return {
          name: 'Crossbones, Malicious Mercenary',
          perTrigger1v1: 2,
          perTrigger2HG: 4,
          desc: 'Každý oponent ztratí 2 životy při příchodu Villaina.'
        };
      case 'doom':
        return {
          name: 'Doctor Doom',
          perTrigger1v1: 2,
          perTrigger2HG: 4,
          desc: 'Každý oponent ztratí 2 životy při zahození země.'
        };
      case 'nico':
        return {
          name: 'Nico Minoru, Runaway',
          perTrigger1v1: 2,
          perTrigger2HG: 4,
          desc: 'Každý oponent ztratí 2 životy při seslání kouzla z exilu.'
        };
      default:
        return { name: '', perTrigger1v1: 0, perTrigger2HG: 0, desc: '' };
    }
  };

  const cardDetails = getCardDetails();
  const opponent1v1Total = triggerCount * cardDetails.perTrigger1v1;
  const opponent2HGTotal = triggerCount * cardDetails.perTrigger2HG;

  // Math for Teamwork
  const teamworkStatus = () => {
    const mySufficient = myTotalPower >= teamworkTarget;
    const teammateSufficient = teammateTotalPower >= teamworkTarget;
    
    if (mySufficient) {
      return {
        possible: true,
        byWho: 'Hráč A (vy)',
        myRemainingBlockers: Math.max(0, myTotalPower - teamworkTarget),
        teammateRemainingBlockers: teammateTotalPower,
        advice: 'Výborně! Můžete tapnout své jednotky na aktivaci Teamworku a váš partner (Hráč B) si ponechá všechny své blockery připravené pro obranu týmu. Tím eliminujete riziko otevření obou hlav!'
      };
    } else if (teammateSufficient) {
      return {
        possible: true,
        byWho: 'Hráč B (spoluhráč)',
        myRemainingBlockers: myTotalPower,
        teammateRemainingBlockers: Math.max(0, teammateTotalPower - teamworkTarget),
        advice: 'Tuto aktivaci může provést váš spoluhráč. Vy si ponecháte plnou obranu na zemi, zatímco on tapne své bytosti na zaplacení kouzla. Tým zůstává chráněn.'
      };
    } else if (myTotalPower + teammateTotalPower >= teamworkTarget) {
      return {
        possible: false, 
        byWho: 'Nelze (společně nelze platit)',
        myRemainingBlockers: myTotalPower,
        teammateRemainingBlockers: teammateTotalPower,
        advice: 'Pozor! Pravidla MTG neumožňují sčítat sílu bytostí od obou hráčů pro zaplacení Teamwork ceny jednoho kouzla. Bytosti musí tapnout pouze jeden z hráčů!'
      };
    } else {
      return {
        possible: false,
        byWho: 'Nikdo nemá dostatek síly',
        myRemainingBlockers: myTotalPower,
        teammateRemainingBlockers: teammateTotalPower,
        advice: 'Nemáte na stole dostatek síly. Počkejte na vyvolání dalších bytostí nebo posilte ty stávající.'
      };
    }
  };

  const teamworkResult = teamworkStatus();

  return (
    <div className="calculators-container">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calculator style={{ color: '#f59e0b' }} />
          2HG Nástroje a Akademie mechanik
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-secondary)' }}>
          Vizualizujte asymetrické škálování poškození v 2HG a otestujte si pravidla a interakce mechanik v modelových scénářích.
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        background: 'rgba(255,255,255,0.02)', 
        padding: '0.35rem', 
        borderRadius: '10px', 
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '1.5rem'
      }}>
        <button 
          onClick={() => setSubTab('calcs')}
          className={`nav-button ${subTab === 'calcs' ? 'active' : ''}`}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', borderRadius: '8px', justifyContent: 'center' }}
        >
          <Calculator size={16} />
          Taktické kalkulačky poškození
        </button>
        <button 
          onClick={() => setSubTab('academy')}
          className={`nav-button ${subTab === 'academy' ? 'active' : ''}`}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', borderRadius: '8px', justifyContent: 'center' }}
        >
          <BookOpen size={16} />
          Akademie 2HG mechanik
        </button>
      </div>

      {/* Content based on sub-tab */}
      {subTab === 'calcs' ? (
        /* Calculators View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="grid-auto">

            {/* Black Widow Calculator */}
            <div className="calc-box" style={{ margin: 0 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontSize: '1.15rem' }}>
                <Flame size={18} />
                Simulátor: Black Widow, Daring Operative
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Výpočet životního zvratu (life swing) při úspěšném útoku Black Widow.
              </p>

              <div className="slider-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Počet bytostí ve vašem hřbitově:</span>
                  <span style={{ fontWeight: 800, color: '#ec4899' }}>{widowGraveCount}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={widowGraveCount} 
                  onChange={(e) => setWidowGraveCount(parseInt(e.target.value))}
                />
              </div>

              <div style={{ margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={widowHit} 
                    onChange={(e) => setWidowHit(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#ec4899' }}
                  />
                  Prorazila obranu a udělila combat damage?
                </label>
              </div>

              <div className="calc-result" style={{ borderColor: 'rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ztráta životů v 1v1:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{widowResult.standard} životů</div>
                </div>
                <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>vs</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase' }}>Ztráta životů v 2HG (Tým):</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>{widowResult.twoHG} životů</div>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.45, margin: '0.75rem 0 0 0' }}>
                <strong>Jak to funguje:</strong> V 2HG oponenti sdílejí životy, ale jsou to stále dva oponenti. Efekt „each opponent loses X life“ se tak spustí pro každého z nich, což odebírá ze společného poolu 2X životů, ke kterým se přičtou 3 zranění z útoku. Útok při {widowGraveCount} bytostech v hrobě tak ubere <strong>{widowResult.twoHG} životů</strong> z celkových 30!
              </p>
            </div>

            {/* Each Opponent General Calc */}
            <div className="calc-box" style={{ margin: 0 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '1.15rem' }}>
                <Zap size={18} />
                Asymetrie „Each Opponent“
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Zjistěte dopad opakovaných plošných efektů na sdílené životy týmu.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                {['crossbones', 'doom', 'nico'].map(c => (
                  <button
                    key={c}
                    className={`nav-button ${activeCard === c ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
                    onClick={() => setActiveCard(c)}
                  >
                    {c === 'crossbones' ? 'Crossbones' : c === 'doom' ? 'Dr. Doom' : 'Nico Minoru'}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                {cardDetails.desc}
              </p>

              <div className="slider-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Počet aktivací / spouštěčů za tah:</span>
                  <span style={{ fontWeight: 800, color: '#ef4444' }}>{triggerCount}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={triggerCount} 
                  onChange={(e) => setTriggerCount(parseInt(e.target.value))}
                />
              </div>

              <div className="calc-result" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ztráta v 1v1:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>-{opponent1v1Total} životů</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase' }}>Celkem v 2HG (Tým):</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>-{opponent2HGTotal} životů</div>
                </div>
              </div>
            </div>
          </div>

          {/* Teamwork Tax Calculator */}
          <div className="calc-box" style={{ margin: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '1.15rem' }}>
              <Users size={18} />
              Teamwork Kalkulátor obrany
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Může jeden hráč zaplatit Teamwork cenu a jaké blockery týmu zůstanou?
            </p>
            
            <div className="grid-auto" style={{ marginTop: '1rem' }}>

              <div className="slider-container" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span>Cílová Teamwork hodnota kouzla:</span>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>{teamworkTarget}</span>
                </div>
                <input type="range" min="1" max="6" value={teamworkTarget} onChange={(e) => setTeamworkTarget(parseInt(e.target.value))} />
              </div>

              <div className="slider-container" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span>Celková síla vašich odtapnutých bytostí:</span>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>{myTotalPower}</span>
                </div>
                <input type="range" min="0" max="10" value={myTotalPower} onChange={(e) => setMyTotalPower(parseInt(e.target.value))} />
              </div>

              <div className="slider-container" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span>Celková síla spoluhráčových bytostí:</span>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>{teammateTotalPower}</span>
                </div>
                <input type="range" min="0" max="10" value={teammateTotalPower} onChange={(e) => setTeammateTotalPower(parseInt(e.target.value))} />
              </div>
            </div>

            <div className="calc-result" style={{ 
              borderColor: teamworkResult.possible ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)', 
              background: teamworkResult.possible ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginTop: '1.25rem'
            }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9rem' }}>
                <span>Aktivovatelné: {teamworkResult.possible ? 'ANO' : 'NE'}</span>
                <span style={{ color: teamworkResult.possible ? '#34d399' : '#f87171' }}>{teamworkResult.byWho}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#d1d5db', margin: 0, lineHeight: 1.45 }}>
                {teamworkResult.advice}
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Mechanics Academy View */
        <div className="glass-panel" style={{ margin: 0 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.35rem' }}>
            <BookOpen style={{ color: '#8b5cf6' }} />
            Akademie 2HG mechanik
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Teamwork Mechanic */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <div 
                className="collapsible-header" 
                onClick={() => setExpandedMech(expandedMech === 'teamwork' ? '' : 'teamwork')}
                style={{ padding: '0.5rem 0' }}
              >
                <h3 style={{ margin: 0, color: expandedMech === 'teamwork' ? '#a78bfa' : '#fff', fontSize: '1.1rem' }}>Teamwork (Týmová spolupráce)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedMech === 'teamwork' ? 'Zavřít ▲' : 'Otevřít ▼'}</span>
              </div>
              <div className={`collapsible-content ${expandedMech === 'teamwork' ? 'expanded' : ''}`}>
                <div style={{ padding: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Popis:</strong> Umožňuje při sesílání instantu nebo sorcery tapnout libovolný počet vlastních bytostí se sílou rovnou nebo větší než Teamwork X pro získání posíleného efektu.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2HG Výhoda:</strong> V 1v1 je tato mechanika nebezpečná, protože tapnutím bytostí přicházíte o blockery. V 2HG se ale bráníte jako tým. Jeden hráč může tapnout všechna svá těla k zaplacení Teamwork ceny, zatímco druhý drží blockery. Obrana týmu tím nijak netrpí.
                  </p>
                  <p style={{ margin: 0, color: '#a78bfa', fontWeight: 600 }}>
                    <strong>Klíčová karta:</strong> <em>Murdock's Crusade</em> exilující jak velkou bytost, tak nepříjemné očarování za rozumnou manovou cenu.
                  </p>
                </div>
              </div>
            </div>

            {/* Power-up Mechanic */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', paddingTop: '0.5rem' }}>
              <div 
                className="collapsible-header" 
                onClick={() => setExpandedMech(expandedMech === 'powerup' ? '' : 'powerup')}
                style={{ padding: '0.5rem 0' }}
              >
                <h3 style={{ margin: 0, color: expandedMech === 'powerup' ? '#a78bfa' : '#fff', fontSize: '1.1rem' }}>Power-up (Posílení)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedMech === 'powerup' ? 'Zavřít ▲' : 'Otevřít ▼'}</span>
              </div>
              <div className={`collapsible-content ${expandedMech === 'powerup' ? 'expanded' : ''}`}>
                <div style={{ padding: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Popis:</strong> Aktivovaná schopnost na bytostech, která jim dává permanentní +1/+1 žetony a doplňkové bonusy. Lze ji použít jen jednou. Má slevu, pokud se aktivuje v kole vstupu na stůl.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2HG Výhoda:</strong> 2HG hry jsou znatelně delší a stůl se často zablokuje. Power-up je ideální uplatnění pro přebytečnou manu v pozdní fázi hry (mana sink), které pomůže přetlačit statickou obranu.
                  </p>
                  <p style={{ margin: 0, color: '#a78bfa', fontWeight: 600 }}>
                    <strong>Klíčová karta:</strong> <em>She-Hulk, Jade Defender</em> – skvělý blocker, který se s Power-upem mění v útočnou zbraň a navíc zničí klíčový artefakt/očarování.
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Mechanic */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', paddingTop: '0.5rem' }}>
              <div 
                className="collapsible-header" 
                onClick={() => setExpandedMech(expandedMech === 'plan' ? '' : 'plan')}
                style={{ padding: '0.5rem 0' }}
              >
                <h3 style={{ margin: 0, color: expandedMech === 'plan' ? '#a78bfa' : '#fff', fontSize: '1.1rem' }}>Plan (Plán)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedMech === 'plan' ? 'Zavřít ▲' : 'Otevřít ▼'}</span>
              </div>
              <div className={`collapsible-content ${expandedMech === 'plan' ? 'expanded' : ''}`}>
                <div style={{ padding: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Popis:</strong> Očarování, která akumulují žetony pokaždé, když splníte specifický úkol. Po dosažení limitu se obětují pro masivní spuštění výhody.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2HG Výhoda:</strong> V Limited 1v1 jsou takto pomalé a drahé karty často trestány agresivními soupeři. 30 životů a dvojité pole blockerů v 2HG ale dává Plan kartám přesně ten čas, který potřebují ke splnění.
                  </p>
                  <p style={{ margin: 0, color: '#a78bfa', fontWeight: 600 }}>
                    <strong>Klíčová karta:</strong> <em>Doom Reigns Supreme</em> – na pátém stupni vám umožní hrát kouzla z exilu oponentů zcela zdarma, což okamžitě ukončí hru.
                  </p>
                </div>
              </div>
            </div>

            {/* Connive & MDFC Mechanic */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', paddingTop: '0.5rem' }}>
              <div 
                className="collapsible-header" 
                onClick={() => setExpandedMech(expandedMech === 'connive' ? '' : 'connive')}
                style={{ padding: '0.5rem 0' }}
              >
                <h3 style={{ margin: 0, color: expandedMech === 'connive' ? '#a78bfa' : '#fff', fontSize: '1.1rem' }}>Connive a Modální oboustranné karty</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedMech === 'connive' ? 'Zavřít ▲' : 'Otevřít ▼'}</span>
              </div>
              <div className={`collapsible-content ${expandedMech === 'connive' ? 'expanded' : ''}`}>
                <div style={{ padding: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Popis:</strong> Connive lízne kartu a zahodí kartu (pokud zahodíte ne-zemi, získáte +1/+1 counter). MDFCs (Modal Double-Faced Cards) lze zahrát buď jako levnější postavu/efekt, nebo jako velkou pozdní bombu.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2HG Výhoda:</strong> Konzistence je v 2HG klíčová. Connive pomáhá čistit ruku a hledat removaly na oponentovy bomby. MDFCs zabraňují špatným startům (mulliganům) a dávají týmu flexibilitu reagovat na jakoukoliv situaci.
                  </p>
                  <p style={{ margin: 0, color: '#a78bfa', fontWeight: 600 }}>
                    <strong>Klíčová karta:</strong> <em>Bruce Banner // Hulk, Gamma Goliath</em> – flexibilní postava s brutální Enrage mechanikou na zadní straně Hulka.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
