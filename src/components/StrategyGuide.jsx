import React, { useState } from 'react';
import { BookOpen, Users, Sword, Shield, Award, ArrowUpRight, ArrowDownRight, Lightbulb, Sparkles } from 'lucide-react';
import { archetypesData } from '../data/archetypesData';

export default function StrategyGuide() {
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('msh_2hg_checklist');
      return saved ? JSON.parse(saved) : [false, false, false, false, false, false];
    } catch {
      return [false, false, false, false, false, false];
    }
  });

  const toggleChecklist = (index) => {
    const updated = checkedItems.map((item, idx) => idx === index ? !item : item);
    setCheckedItems(updated);
    try {
      localStorage.setItem('msh_2hg_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const checklistItems = [
    {
      title: "Bezplatný 2HG Mulligan",
      desc: "Pamatuji, že první mulligan v 2HG je ZDARMA (kreslím zpět 7 karet). Pokud mám špatnou startovní ruku, okamžitě mulliganuji."
    },
    {
      title: "Koordinace barev Sealed poolu",
      desc: "S partnerem nesdílíme stejné barvy (vyjma malé splash s fixací), abychom si nekradli nejlepší bomby ze společných 12 boosterů."
    },
    {
      title: "Pravidlo 15 jedů (Poison)",
      desc: "Vím, že v 2HG prohráváme až při obdržení 15 jedových (poison) žetonů, takže nemusíme panikařit hned při prvním útoku."
    },
    {
      title: "Koordinované spojené blokování",
      desc: "Během bojové fáze komunikujeme a spojujeme naše obránce k bezpečnému zničení větších hrozeb soupeře."
    },
    {
      title: "Dvojnásobný stack a instanty",
      desc: "Neplýtváme dvěma counterspelly nebo removalem na jednu hrozbu. Vždy se před zahráním kouzla zeptám partnera."
    },
    {
      title: "Pozor na 'Each Opponent' efekty",
      desc: "Pamatuji, že efekty jako Crossbones nebo Doctor Doom ubírají našemu týmu 4 životy místo 2. Jsou naší prioritou pro removal."
    }
  ];

  const checkedCount = checkedItems.filter(Boolean).length;
  const percentReady = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="strategy-guide-container">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen style={{ color: '#8b5cf6' }} />
          Taktický Průvodce & Metagame pro 2HG
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>
          Důkladný rozbor taktických zásad, rozdělení týmových rolí a pravidlových nuancí formátu Two-Headed Giant založený na auditu 314 karet edice Marvel Super Heroes.
        </p>
      </div>

      {/* Grid: Rules & Roles */}
      <div className="grid-2col" style={{ marginBottom: '1.5rem' }}>

        
        {/* Rules realities */}
        <div className="glass-panel" style={{ height: '100%' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
            <Shield size={20} />
            Pravidlová Realita 2HG
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            V 2HG mají týmy sdílený tah, společnou combat fázi a společný life total 30. Nicméně herní zdroje jako mana, ruka a permanenty zůstávají striktně odděleny.
          </p>
          
          <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <li style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <strong>Kombinovaný combat:</strong> Útok a blok probíhají společně. Jakýkoliv letec, deathtouch blocker nebo menace útočník chrání nebo ohrožuje oba hráče naráz. Duelové combat triky ztrácejí hodnotu, zatímco široké blockery a plošné efekty (Anthemy) získávají na síle.
            </li>
            <li style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
              <strong>Matematika životů:</strong> Zranění, ztráty i zisky životů se dějí po hráčích, ale promítají se do společného fondu. Efekt typu „each opponent loses 2 life“ způsobí týmu okamžitou ztrátu 4 životů, což zrychluje tempo hry na polovinu tahů!
            </li>
            <li style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <strong>Separace zdrojů:</strong> Nemůžete platit manu za kouzla svého partnera a vaše permanenty neposilují jeho armádu (pokud kouzlo neříká „creatures your team controls“). Musíte koordinovat, kdo hraje hrozby a kdo drží protikouzla.
            </li>
          </ul>
        </div>

        {/* Team roles */}
        <div className="glass-panel" style={{ height: '100%' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
            <Users size={20} />
            Doporučené Rozdělení Rolí v Týmu
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Nejúspěšnější 2HG týmy nestaví dva identické balíčky. Místo toho rozdělují své strategické role na „tlačnou hlavu“ a „ochranáře“:
          </p>

          <div className="grid-2col-inner">

            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '10px' }}>
              <h4 style={{ color: '#60a5fa', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sword size={14} />
                Hráč A: Board Engine
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0, color: '#9ca3af' }}>
                Zaměřuje se na go-wide hordy, tokeny, anthemy a pasivní drain (např. Rakdos Villains, Selesnya Heroes nebo Simic counters). Jeho úkolem je budovat stůl a vytvářet konstantní tlak.
              </p>
            </div>
            
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: '1rem', borderRadius: '10px' }}>
              <h4 style={{ color: '#a78bfa', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Shield size={14} />
                Hráč B: Interakce
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0, color: '#9ca3af' }}>
                Klasický control / tempo deck (např. Azorius nebo Dimir). Drží stack pomocí counterspellů, čistí stůl instantním removalem a chrání partnerův engine v klíčovém „lethálním“ kole.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px dashed rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Lightbulb size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.1rem' }} />
            <p style={{ fontSize: '0.8rem', margin: 0, color: '#d1d5db' }}>
              <strong>Tip pro stavbu Sealed:</strong> Vyhněte se sdílení barev mezi oběma balíčky. Z jednoho 12-booster poolu byste si navzájem konkurovali o nejlepší karty, což by fatálně oslabilo oba balíky.
            </p>
          </div>
        </div>

      </div>

      {/* 10 Guilds / Archetypes Section */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', marginBottom: '1.25rem' }}>
          <Sparkles size={20} />
          Rozbor 10 Dvoubarevných Archetypů (Cechů) v Edici
        </h3>
        <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Každá z 10 dvoubarevných kombinací v edici Marvel Super Heroes reprezentuje konkrétní téma, má specifické mechanické zaměření a v prostředí Two-Headed Giant se chová odlišně. Zde je jejich podrobný přehled:
        </p>

        <div className="grid-auto" style={{ gap: '1.25rem' }}>
          {archetypesData.map((arch) => {
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
              <div 
                key={arch.id} 
                className={`mtg-card-item glow-${arch.tier2HG}`}
                style={{ 
                  padding: '1.25rem',
                  background: 'rgba(15, 15, 22, 0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                {/* Header: Name, Colors and Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, margin: 0 }}>
                    {arch.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    {getColorsBadges(arch.id).map(c => (
                      <span key={c} className={`badge-color ${c}`} style={{ width: '16px', height: '16px', fontSize: '0.6rem' }}>{c}</span>
                    ))}
                    <span className={`badge-tier ${arch.tier2HG}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>
                      Tier {arch.tier2HG}
                    </span>
                  </div>
                </div>

                {/* Theme */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <strong style={{ color: '#a78bfa' }}>Téma:</strong> {arch.theme}
                </div>

                {/* Key Cards */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#9ca3af' }}>Klíčové karty:</strong>{' '}
                  <span style={{ fontStyle: 'italic', color: '#d1d5db' }}>{arch.keyCards.join(', ')}</span>
                </div>

                {/* Strategy & 2HG Role */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45, marginTop: 'auto' }}>
                  {arch.strategy}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Rating Changes */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1.25rem' }}>
          <Sword size={20} />
          Klíčové Změny Hodnocení (AI Audit)
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Odborné přehodnocení všech 314 karet ukázalo, že standardní 1v1 žebříčky často podhodnocují širokou interakci a naopak přeceňují lineární duelové strategie:
        </p>

        <div className="grid-auto">

          {/* Upgrades */}
          <div style={{ background: 'rgba(16, 185, 129, 0.01)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', paddingBottom: '0.75rem' }}>
              <ArrowUpRight size={20} style={{ strokeWidth: 3 }} />
              Největší Upgrady (Posílení)
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Item 1 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Warleader’s Call</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    A ➔ S
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Posiluje celou vaši armádu a každý ETB trigger udílí poškození oběma soupeřům současně. Dokonalý finisher.
                </p>
              </div>

              {/* Item 2 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Universal Answers</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    C ➔ A
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Jednomanové a dvoumanové univerzální odpovědi (<em style={{ color: '#a78bfa' }}>Path to Exile, Beast Within, Counterspell</em>) na cokoliv jsou v 2HG k nezaplacení kvůli nutnosti reagovat na širokou paletu bomb.
                </p>
              </div>

              {/* Item 3 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Construct a Cosmic Cube</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    C ➔ A
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Pomalý rozjezd v 2HG nevadí, a finální odměna kontroly nad tahem oponenta v týmové hře ochromí oba protihráče najednou.
                </p>
              </div>
            </div>
          </div>

          {/* Downgrades */}
          <div style={{ background: 'rgba(239, 68, 68, 0.01)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: '#f87171', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '0.75rem' }}>
              <ArrowDownRight size={20} style={{ strokeWidth: 3 }} />
              Největší Downgrady (Oslabení)
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Item 1 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Agent 13, Sharon Carter</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    B ➔ D
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Těží z mechaniky „attacks alone“. V 2HG, kde soupeři blokují společně, je útok jedinou bytostí bez evasion téměř vždy sebevražda.
                </p>
              </div>

              {/* Item 2 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Show and Tell</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    A ➔ C
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Příliš symetrický efekt. Pokud jej zahrajete, položí kartu zdarma jeden váš spoluhráč, ale zároveň oba soupeři. Dáváte oponentům obří výhodu.
                </p>
              </div>

              {/* Item 3 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Bedlam</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    C ➔ D
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Zákaz blokování zní pro agresivní deck skvěle, ale v 2HG tím vystavujete svůj sdílený pool 30 životů brutálnímu protiútoku od dvou oponentů naráz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Precedent */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
          <Award size={20} />
          Historické okénko: Pro Tour San Diego 2007
        </h3>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
          Historie turnajového 2HG potvrzuje, že klíčem k vítězství je synergie, nikoliv pouhý individuální power level karet. Jediné oficiální 2HG Pro Tour (San Diego 2007) vyhrál tým (Jacob Van Lunen a Chris Lachmann), který postavil a zkonstruoval balíček kolem <strong>Sliver tribal synergie</strong>. Dokázali využít faktu, že sliver efekty se sdílejí napříč stoly a násobí se, což deklasovalo oponenty hrající izolované „dobré karty“. Pamatujte na to při koordinaci stavby se svým partnerem!
        </p>
      </div>

      {/* Interactive 2HG Win Checklist */}
      <div className="glass-panel" style={{ marginBottom: 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.75rem' }}>
          <Award size={20} style={{ color: '#10b981' }} />
          🏆 Checklist pro zítřejší výhru (2HG Cheat Sheet)
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
          Odškrtněte si zásadní body taktické přípravy, které vás a vašeho partnera zítra dovedou k vítězství na Prerelease turnaji!
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            <span>Stupeň připravenosti týmu:</span>
            <span style={{ color: percentReady === 100 ? '#34d399' : '#f59e0b', fontWeight: 800 }}>
              {percentReady}% PŘIPRAVEN
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ 
              height: '100%', 
              width: `${percentReady}%`, 
              background: percentReady === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #8b5cf6, #ec4899)', 
              transition: 'width 0.3s ease' 
            }} />
          </div>
        </div>

        {/* Checklist list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {checklistItems.map((item, idx) => (
            <label 
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                padding: '0.85rem',
                background: checkedItems[idx] ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255,255,255,0.01)',
                border: checkedItems[idx] ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(255,255,255,0.03)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input 
                type="checkbox"
                checked={checkedItems[idx]}
                onChange={() => toggleChecklist(idx)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '0.15rem',
                  accentColor: '#10b981',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ 
                  fontSize: '0.9rem', 
                  color: checkedItems[idx] ? '#34d399' : '#fff',
                  textDecoration: checkedItems[idx] ? 'line-through' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {item.title}
                </strong>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: checkedItems[idx] ? '#9ca3af' : 'var(--text-secondary)',
                  lineHeight: 1.4
                }}>
                  {item.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
