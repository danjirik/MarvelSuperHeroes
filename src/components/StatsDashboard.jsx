import React, { useState, useEffect } from 'react';
import { stats17lands } from '../data/stats17lands';
import { cardsData } from '../data/cardsData';
import { getCard2HGScore } from '../utils/deckOptimizer';
import { BarChart2, Search, ArrowUpDown, RefreshCw, CheckCircle2, AlertTriangle, Info, HelpCircle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export default function StatsDashboard() {
  const [activeStats, setActiveStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColor, setFilterColor] = useState('All');
  const [filterRarity, setFilterRarity] = useState('All');
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);

  const handleCardClick = (cardName) => {
    const card = cardsData.find(c => c.name === cardName);
    if (card) {
      setSelectedCardForModal(card);
    }
  };
  
  // Řazení tabulky
  const [sortConfig, setSortConfig] = useState({ key: 'gihWR', direction: 'desc' });
  
  // Stav synchronizace z URL
  const [syncUrl, setSyncUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState({ type: '', message: '' }); // 'success' | 'error' | 'loading'
  const [isSynced, setIsSynced] = useState(false);

  // Načtení dat při startu (vyhodnotí localStorage vs lokální stats17lands)
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const saved = localStorage.getItem('online_17lands_stats');
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Nepodařilo se parsovat online 17lands data:", e);
      }
    }
    
    // Spojíme výchozí statistiky s online staženými hodnotami
    const merged = stats17lands.map(local => {
      const online = parsed[local.name] || parsed[local.cardId];
      const gihWR = online && online.gihWR !== undefined ? online.gihWR : local.gihWR;
      const alsa = online && online.alsa !== undefined ? online.alsa : local.alsa;
      const iwd = online && online.iwd !== undefined ? online.iwd : local.iwd;
      
      const dbCard = cardsData.find(c => c.name === local.name) || {};
      const score2HG = getCard2HGScore(dbCard, true, {
        [local.name]: { gihWR }
      });
      
      return {
        ...local,
        gihWR,
        alsa,
        iwd,
        score2HG
      };
    });
    setActiveStats(merged);
    setIsSynced(!!saved);
  };

  // Funkce pro online synchronizaci
  const handleOnlineSync = async () => {
    if (!syncUrl || syncUrl.trim().length < 5) {
      setSyncStatus({ type: 'error', message: 'Zadejte platnou URL adresu JSON souboru.' });
      return;
    }

    setSyncStatus({ type: 'loading', message: 'Stahuji data...' });

    try {
      const response = await fetch(syncUrl);
      if (!response.ok) throw new Error(`HTTP chyba ${response.status}`);
      
      const data = await response.json();
      
      // Validace datové struktury: Očekáváme buď pole objektů se strukturou { name, gihWR, alsa, iwd }
      // nebo mapu/objekt { "Název Karty": { gihWR, alsa, iwd } }
      let formattedData = {};

      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.name) {
            formattedData[item.name] = {
              gihWR: item.gihWR || item.winRate,
              alsa: item.alsa || item.pickOrder,
              iwd: item.iwd
            };
          }
        });
      } else if (typeof data === 'object') {
        formattedData = data;
      }

      // Ověříme, zda jsme dostali alespoň nějaká data
      if (Object.keys(formattedData).length === 0) {
        throw new Error('JSON soubor neobsahuje kompatibilní formát statistik karet.');
      }

      // Uložíme do localStorage
      localStorage.setItem('online_17lands_stats', JSON.stringify(formattedData));
      loadStats();
      setSyncStatus({ type: 'success', message: `Úspěšně synchronizováno ${Object.keys(formattedData).length} záznamů.` });
    } catch (err) {
      console.error("Chyba při stahování dat:", err);
      setSyncStatus({ 
        type: 'error', 
        message: `Chyba stahování: ${err.message}. Ujistěte se, že server podporuje CORS a JSON je validní.` 
      });
    }
  };

  const resetStatsToDefault = () => {
    if (window.confirm("Opravdu chcete vymazat online data a vrátit se k výchozím statistikám?")) {
      localStorage.removeItem('online_17lands_stats');
      loadStats();
      setSyncUrl('');
      setSyncStatus({ type: 'success', message: 'Statistiky byly obnoveny na výchozí hodnoty.' });
    }
  };

  // Seřazení tabulky
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedStats = () => {
    const sorted = [...activeStats];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Speciální řazení pro barvy a rarity (převedeme na string)
      if (Array.isArray(aVal)) aVal = aVal.join(',');
      if (Array.isArray(bVal)) bVal = bVal.join(',');

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  // Filtrování tabulky
  const filteredStats = getSortedStats().filter(card => {
    // 1. Fulltext search
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filtrování podle barvy
    const matchesColor = filterColor === 'All' 
      ? true 
      : filterColor === 'Multicolor'
        ? card.color.includes('Multicolor')
        : filterColor === 'Colorless'
          ? card.color.includes('Colorless')
          : card.color.includes(filterColor) && !card.color.includes('Multicolor');
          
    // 3. Filtrování podle rarity
    const matchesRarity = filterRarity === 'All' ? true : card.rarity === filterRarity;

    return matchesSearch && matchesColor && matchesRarity;
  });

  // Výpočet průměrného Win Rate pro jednotlivé barvy pro graf
  const getColorWinRates = () => {
    const colors = ['W', 'U', 'B', 'R', 'G'];
    const rates = {};
    
    colors.forEach(col => {
      const cardsInColor = activeStats.filter(c => c.color.includes(col) && !c.color.includes('Multicolor'));
      const sum = cardsInColor.reduce((acc, card) => acc + card.gihWR, 0);
      rates[col] = cardsInColor.length > 0 ? (sum / cardsInColor.length) : 50;
    });
    
    return rates;
  };

  const colorRates = getColorWinRates();

  // 2HG Adjustment Helpers
  const get2HGAdjustment = (card) => {
    if (!card.description) return 0;
    const desc = card.description.toLowerCase();
    let adj = 0;
    if (desc.includes('each opponent') || desc.includes('each player') || desc.includes('opponents control')) {
      adj += 2.0;
    }
    if (desc.includes('teamwork')) {
      adj += 1.5;
    }
    if (desc.includes('support ') || desc.includes('put a +1/+1 counter on another target') || desc.includes('another creature')) {
      adj += 1.0;
    }
    if (desc.includes('attacks alone') || desc.includes('attack alone')) {
      adj -= 3.0;
    }
    return adj;
  };

  const getAdjustmentReason = (card) => {
    if (!card.description) return '';
    const desc = card.description.toLowerCase();
    const reasons = [];
    if (desc.includes('each opponent') || desc.includes('each player') || desc.includes('opponents control')) {
      reasons.push('Více soupeřů');
    }
    if (desc.includes('teamwork')) {
      reasons.push('Teamwork');
    }
    if (desc.includes('support ') || desc.includes('put a +1/+1 counter on another target') || desc.includes('another creature')) {
      reasons.push('Podpora');
    }
    if (desc.includes('attacks alone') || desc.includes('attack alone')) {
      reasons.push('Útočí sám');
    }
    return reasons.join(', ');
  };

  // Získání Gems a Traps z cardsData
  const getGemsAndTraps = () => {
    if (activeStats.length === 0) return { gems: [], traps: [] };
    const scored = cardsData.map(card => {
      const stat = activeStats.find(s => s.name === card.name) || { gihWR: 50.0 };
      const adj = get2HGAdjustment(card);
      return {
        ...card,
        gihWR: stat.gihWR,
        adjustment: adj
      };
    });

    const gemsList = scored
      .filter(c => c.adjustment > 0)
      .sort((a, b) => b.adjustment - a.adjustment || b.gihWR - a.gihWR)
      .slice(0, 6);

    const trapsList = scored
      .filter(c => c.adjustment < 0)
      .sort((a, b) => a.adjustment - b.adjustment || a.gihWR - b.gihWR)
      .slice(0, 6);

    return { gems: gemsList, traps: trapsList };
  };

  const { gems, traps } = getGemsAndTraps();

  return (
    <div className="stats-dashboard-container" style={{ paddingBottom: '4rem' }}>
      
      {/* 1. Hlavní panel a vysvětlení statistik */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={26} style={{ color: '#8b5cf6' }} />
          Herní Statistiky edice (17Lands limited)
        </h2>
        <p style={{ margin: '0.25rem 0 1.25rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Statistiky úspěšnosti jednotlivých karet vycházející ze zápasů na MTG Arena. Tyto hodnoty určují globální sílu karet a lze je použít jako základní váhy pro optimalizátor Sealed balíčků.
        </p>

        {/* Informační box o zkratkách */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>GIH WR</span>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Games in Hand Win Rate</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Procento výher zápasů, ve kterých měl hráč tuto kartu v průběhu hry v ruce. Klíčový ukazatel síly.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.8rem', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>ALSA</span>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Average Last Seen At</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Průměrné kolo draftu, ve kterém byla karta spatřena. Ukazuje, jak moc ji komunita prioritizuje.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 'bold', color: '#8b5cf6', fontSize: '0.8rem', background: 'rgba(139,92,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>IWD</span>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Improvement When Drawn</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zvýšení šance na výhru, pokud kartu líznete, oproti stavu, kdy zůstala v balíčku.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Zóna pro synchronizaci dat z online URL */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Aktualizace statistik z internetu</h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Máte vlastní JSON soubor s nejnovějšími daty o výhrách (např. z GitHub Gist)? Vložte odkaz a stáhněte si aktuální data.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="https://gist.githubusercontent.com/.../stats.json"
            value={syncUrl}
            onChange={(e) => setSyncUrl(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <button className="cta-button" onClick={handleOnlineSync} style={{ background: '#8b5cf6', flexShrink: 0 }}>
            <RefreshCw size={16} />
            Synchronizovat
          </button>
          
          {isSynced && (
            <button className="nav-button" onClick={resetStatsToDefault} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              Vynulovat data
            </button>
          )}
        </div>

        {/* Status stahování */}
        {syncStatus.message && (
          <div style={{ 
            marginTop: '0.85rem', 
            padding: '0.6rem 0.85rem', 
            borderRadius: '6px', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: syncStatus.type === 'success' ? 'rgba(16,185,129,0.08)' : syncStatus.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            border: syncStatus.type === 'success' ? '1px solid rgba(16,185,129,0.2)' : syncStatus.type === 'error' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
            color: syncStatus.type === 'success' ? '#10b981' : syncStatus.type === 'error' ? '#f87171' : '#fbbf24'
          }}>
            {syncStatus.type === 'success' && <CheckCircle2 size={15} />}
            {syncStatus.type === 'error' && <AlertTriangle size={15} />}
            {syncStatus.type === 'loading' && <RefreshCw className="animate-spin" size={15} />}
            <span>{syncStatus.message}</span>
          </div>
        )}
      </div>

      {/* 3. Barvy Performance - Grafy */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Výkonnost monobarevných karet podle statistik (Průměrný GIH WR)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '600px' }}>
          {Object.keys(colorRates).map(col => {
            const val = colorRates[col];
            const colNames = { W: 'Bílá (White)', U: 'Modrá (Blue)', B: 'Černá (Black)', R: 'Červená (Red)', G: 'Zelená (Green)' };
            const colClasses = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };
            
            return (
              <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className={`badge-color ${colClasses[col]}`} style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{colNames[col]}</span>
                </div>
                
                <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  {/* Win rate bar graf */}
                  <div style={{ 
                    width: `${((val - 45) / 20) * 100}%`, // normalizace na rozsah 45%-65%
                    height: '100%', 
                    background: col === 'W' ? '#e2e8f0' : col === 'U' ? '#3b82f6' : col === 'B' ? '#4b5563' : col === 'R' ? '#ef4444' : '#10b981',
                    borderRadius: '8px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', width: '45px', textAlign: 'right' }}>
                  {val.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3.5. 2HG Specifické Analýzy (Synergie a Pasti) */}
      {gems.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem' }}>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
            2HG Specifické Synergie a Pasti v sadě
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Některé mechaniky získávají v 2HG na síle (např. efekty cílící na všechny soupeře nebo týmová spolupráce), zatímco jiné jsou výrazně slabší než v běžné hře 1v1 (např. útok o samotě). Zde je automatická analýza největších rozdílů.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Sloupec Skokani (Gems) */}
            <div style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                <ArrowUpRight size={16} />
                Top 2HG Skokani (Hidden Gems)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {gems.map(card => (
                  <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card.name)}
                    className="clickable-card-row"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>{card.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getAdjustmentReason(card)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>WR {card.gihWR.toFixed(1)}%</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>+{card.adjustment.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sloupec Pasti (Traps) */}
            <div style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                <ArrowDownRight size={16} />
                Top 2HG Pasti (Format Traps)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {traps.map(card => (
                  <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card.name)}
                    className="clickable-card-row"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>{card.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getAdjustmentReason(card)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>WR {card.gihWR.toFixed(1)}%</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ef4444' }}>{card.adjustment.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tabulka statistik karet */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        
        {/* Filtry tabulky */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {/* Vyhledávací pole */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Vyhledat kartu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Filtr barev */}
          <select 
            className="search-input" 
            value={filterColor} 
            onChange={(e) => setFilterColor(e.target.value)}
          >
            <option value="All">Všechny barvy</option>
            <option value="W">Bílá</option>
            <option value="U">Modrá</option>
            <option value="B">Černá</option>
            <option value="R">Červená</option>
            <option value="G">Zelená</option>
            <option value="Multicolor">Vícebarevné</option>
            <option value="Colorless">Bezbarvé</option>
          </select>

          {/* Filtr rarity */}
          <select 
            className="search-input" 
            value={filterRarity} 
            onChange={(e) => setFilterRarity(e.target.value)}
          >
            <option value="All">Všechny rarity</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Mythic">Mythic</option>
          </select>
        </div>

        {/* Tabulka */}
        <div className="tier-table-container">
          <table className="tier-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                  Karta <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('color')} style={{ cursor: 'pointer', width: '100px' }}>
                  Barva <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('rarity')} style={{ cursor: 'pointer', width: '110px' }}>
                  Rarita <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('gihWR')} style={{ cursor: 'pointer', textAlign: 'right', width: '110px' }}>
                  GIH WR (%) <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('score2HG')} style={{ cursor: 'pointer', textAlign: 'right', width: '110px' }}>
                  2HG Skóre <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('alsa')} style={{ cursor: 'pointer', textAlign: 'right', width: '90px' }}>
                  ALSA <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('iwd')} style={{ cursor: 'pointer', textAlign: 'right', width: '90px' }}>
                  IWD (%) <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
                <th onClick={() => requestSort('tier2HG')} style={{ cursor: 'pointer', textAlign: 'center', width: '90px' }}>
                  Tier <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map(card => (
                <tr key={card.cardId}>
                  <td 
                    onClick={() => handleCardClick(card.name)}
                    className="clickable-card-name"
                    style={{ fontWeight: 'bold', color: '#fff' }}
                  >
                    {card.name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {card.color.map(col => (
                        <span key={col} className={`badge-color ${col}`} style={{ width: '14px', height: '14px', fontSize: '0.55rem' }}>{col[0]}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: card.rarity === 'Mythic' ? '#f43f5e' : card.rarity === 'Rare' ? '#fbbf24' : card.rarity === 'Uncommon' ? '#60a5fa' : '#9ca3af' 
                    }}>
                      {card.rarity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: card.gihWR >= 58 ? '#10b981' : card.gihWR <= 51 ? '#f87171' : '#fff' }}>
                    {card.gihWR.toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#c084fc' }}>
                    {card.score2HG ? card.score2HG.toFixed(1) : '0.0'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{card.alsa.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', color: card.iwd > 0 ? '#10b981' : card.iwd < 0 ? '#f87171' : 'var(--text-secondary)' }}>
                    {card.iwd > 0 ? `+${card.iwd.toFixed(1)}%` : `${card.iwd.toFixed(1)}%`}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800,
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '4px',
                      background: card.tier2HG === 'S' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: card.tier2HG === 'S' ? '#c084fc' : card.tier2HG === 'A' ? '#60a5fa' : card.tier2HG === 'B' ? '#34d399' : '#9ca3af'
                    }}>
                      {card.tier2HG}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nebyly nalezeny žádné karty odpovídající filtrům.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal pro detailní náhled karty */}
      {selectedCardForModal && (
        <div 
          onClick={() => setSelectedCardForModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0e0e12',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              gap: '1rem',
              animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCardForModal(null)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                zIndex: 10
              }}
            >
              &times;
            </button>

            {/* Image Preview Container */}
            {selectedCardForModal.imageUrl ? (
              <div style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                borderRadius: '8px', 
                overflow: 'hidden',
                background: '#121217',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.6)'
              }}>
                <img 
                  src={selectedCardForModal.imageUrl} 
                  alt={selectedCardForModal.name} 
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '380px', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <div style={{
                height: '180px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                Žádný obrázek k dispozici
              </div>
            )}

            {/* Content info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {selectedCardForModal.name}
                </h4>
                <code style={{ fontSize: '0.9rem', color: '#c084fc', background: 'rgba(139, 92, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {selectedCardForModal.cost || 'Země'}
                </code>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span className={`badge-tier ${selectedCardForModal.tier2HG}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>
                  Tier {selectedCardForModal.tier2HG}
                </span>

                <span style={{ 
                  fontSize: '0.75rem', 
                  color: selectedCardForModal.rarity === 'Mythic' ? '#f43f5e' : selectedCardForModal.rarity === 'Rare' ? '#fbbf24' : selectedCardForModal.rarity === 'Uncommon' ? '#60a5fa' : '#9ca3af',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px'
                }}>
                  {selectedCardForModal.rarity}
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedCardForModal.type}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: '0.85rem', color: '#d1d5db', lineHeight: '1.45', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>Pravidla / Text:</span>
                {selectedCardForModal.description || 'Bez textu.'}
              </div>

              {/* 2HG Analysis */}
              <div style={{ fontSize: '0.82rem', color: '#fff', lineHeight: '1.4', background: 'rgba(139, 92, 246, 0.03)', border: '1px dashed rgba(139, 92, 246, 0.15)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>2HG Audit / Hodnocení:</span>
                {selectedCardForModal.impact2HG}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
