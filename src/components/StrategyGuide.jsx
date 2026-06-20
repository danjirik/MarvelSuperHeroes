import React from 'react';
import { BookOpen, Users, Sword, Shield, Award, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';

export default function StrategyGuide() {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

      {/* Audit Rating Changes */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1.25rem' }}>
          <Sword size={20} />
          Klíčové Změny Hodnocení (AI Audit)
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Odborné přehodnocení všech 314 karet ukázalo, že standardní 1v1 žebříčky často podhodnocují širokou interakci a naopak přeceňují lineární duelové strategie:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
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
      <div className="glass-panel" style={{ marginBottom: 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
          <Award size={20} />
          Historické okénko: Pro Tour San Diego 2007
        </h3>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
          Historie turnajového 2HG potvrzuje, že klíčem k vítězství je synergie, nikoliv pouhý individuální power level karet. Jediné oficiální 2HG Pro Tour (San Diego 2007) vyhrál tým (Jacob Van Lunen a Chris Lachmann), který postavil a zkonstruoval balíček kolem <strong>Sliver tribal synergie</strong>. Dokázali využít faktu, že sliver efekty se sdílejí napříč stoly a násobí se, což deklasovalo oponenty hrající izolované „dobré karty“. Pamatujte na to při koordinaci stavby se svým partnerem!
        </p>
      </div>

    </div>
  );
}
