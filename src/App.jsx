import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TierList from './components/TierList';
import ArchetypeMatcher from './components/ArchetypeMatcher';
import SealedSimulator from './components/SealedSimulator';
import Calculators from './components/Calculators';
import StrategyGuide from './components/StrategyGuide';
import CardScanner from './components/CardScanner';
import StatsDashboard from './components/StatsDashboard';
import { Shield, BookOpen, Users, Sword, Calculator, Home, Maximize, Minimize, Camera, BarChart2 } from 'lucide-react';

const NAV_TABS = [
  { id: 'dashboard', label: 'Úvod',     icon: Home },
  { id: 'guide',     label: 'Strategie', icon: BookOpen },
  { id: 'tierlist',  label: 'Tier List', icon: Users },
  { id: 'matcher',   label: 'Párovač',   icon: Users },
  { id: 'scanner',   label: 'Skener',    icon: Camera },
  { id: 'stats',     label: 'Statistiky',icon: BarChart2 },
  { id: 'simulator', label: 'Sealed',    icon: Sword },
  { id: 'calculators',label:'Kalkulačka',icon: Calculator },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [importedPool, setImportedPool] = useState(null);


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Error enabling fullscreen:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("Error disabling fullscreen:", err));
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Navigation Header */}
      <header className="navbar desktop-nav">
        <div className="logo-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Shield size={28} style={{ color: '#ef4444' }} />
          <span className="logo-text">Marvel 2HG Tactician</span>
          <span className="logo-badge">MTG 2026</span>
        </div>
        
        <nav className="nav-links">
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-button ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          
          <button 
            className="nav-button fullscreen-toggle"
            onClick={toggleFullscreen}
            style={{ 
              marginLeft: '0.75rem', 
              background: 'rgba(139, 92, 246, 0.1)', 
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#c084fc'
            }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Okno' : 'Fullscreen'}
          </button>
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header className="mobile-topbar">
        <div className="logo-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Shield size={22} style={{ color: '#ef4444' }} />
          <span className="logo-text" style={{ fontSize: '1.1rem' }}>Marvel 2HG</span>
        </div>
        <button 
          className="nav-button fullscreen-toggle"
          onClick={toggleFullscreen}
          style={{ 
            padding: '0.4rem 0.75rem',
            background: 'rgba(139, 92, 246, 0.1)', 
            border: '1px solid rgba(139, 92, 246, 0.25)',
            color: '#c084fc',
            fontSize: '0.75rem'
          }}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </header>

      {/* Main Content Viewport */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'guide' && <StrategyGuide />}
        {activeTab === 'tierlist' && <TierList />}
        {activeTab === 'matcher' && <ArchetypeMatcher />}
        {activeTab === 'scanner' && (
          <CardScanner onImportToSimulator={(pool) => {
            setImportedPool(pool);
            setActiveTab('simulator');
          }} />
        )}
        {activeTab === 'stats' && <StatsDashboard />}
        {activeTab === 'simulator' && (
          <SealedSimulator 
            initialPool={importedPool} 
            clearInitialPool={() => setImportedPool(null)} 
          />
        )}
        {activeTab === 'calculators' && <Calculators />}
      </main>

      {/* Footer (hidden on mobile) */}
      <footer className="app-footer">
        <p style={{ margin: 0 }}>
          MTG Marvel 2HG Tactician — Vytvořeno pro Prerelease Marvel Super Heroes edice.
        </p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
          Tento projekt je neoficiální fanouškovská pomůcka. Magic: The Gathering a Marvel jsou ochranné známky Wizards of the Coast a Marvel Enterprises.
        </p>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-nav">
        {NAV_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`mobile-tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
