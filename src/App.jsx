import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TierList from './components/TierList';
import ArchetypeMatcher from './components/ArchetypeMatcher';
import SealedSimulator from './components/SealedSimulator';
import Calculators from './components/Calculators';
import StrategyGuide from './components/StrategyGuide';
import { Shield, BookOpen, Users, Sword, Calculator, Home, Maximize, Minimize } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Shield size={28} style={{ color: '#ef4444' }} />
          <span className="logo-text">Marvel 2HG Tactician</span>
          <span className="logo-badge">MTG 2026</span>
        </div>
        
        <nav className="nav-links">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home size={16} />
            Úvod
          </button>

          <button 
            className={`nav-button ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <BookOpen size={16} />
            Strategie
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'tierlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('tierlist')}
          >
            <Users size={16} />
            Tier List
          </button>

          <button 
            className={`nav-button ${activeTab === 'matcher' ? 'active' : ''}`}
            onClick={() => setActiveTab('matcher')}
          >
            <Users size={16} />
            Párovač
          </button>

          <button 
            className={`nav-button ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <Sword size={16} />
            Sealed Sim
          </button>

          <button 
            className={`nav-button ${activeTab === 'calculators' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculators')}
          >
            <Calculator size={16} />
            Kalkulačka
          </button>
          
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

      {/* Main Content Viewport */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'guide' && <StrategyGuide />}
        {activeTab === 'tierlist' && <TierList />}
        {activeTab === 'matcher' && <ArchetypeMatcher />}
        {activeTab === 'simulator' && <SealedSimulator />}
        {activeTab === 'calculators' && <Calculators />}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
        color: '#6b7280', 
        fontSize: '0.85rem',
        marginTop: '3rem'
      }}>
        <p style={{ margin: 0 }}>
          MTG Marvel 2HG Tactician — Vytvořeno pro Prerelease Marvel Super Heroes edice.
        </p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
          Tento projekt je neoficiální fanouškovská pomůcka. Magic: The Gathering a Marvel jsou ochranné známky Wizards of the Coast a Marvel Enterprises.
        </p>
      </footer>
    </div>
  );
}

export default App;
