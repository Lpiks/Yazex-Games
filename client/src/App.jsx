import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PromoModal from './components/PromoModal';
import ArmoryModal from './components/ArmoryModal';
import Lobby from './pages/Lobby';
import UltrasRunner from './games/runner/UltrasRunner';
import TifoStudio from './games/tifo-studio/TifoStudio';
import TifoArena from './games/tifo-studio/TifoArena';

export default function App() {
  // Navigation State: 'lobby' | 'runner' | 'tifo-studio' | 'arena'
  const [currentView, setCurrentView] = useState('lobby');

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

  const DEFAULT_PLAYER = {
    name: 'Capo_Alger',
    club: 'mca',
    coins: 250,
    lastVisited: Date.now(),
    inventory: {
      fumis: 2,           // 2 starting smoke shields (invincibility)
      signals: 1,         // 1 starting coin magnet
      revives: 1,         // 1 starting revive flare
      unlockedPyro: ['red'], // unlocked Tifo pyro skins
      activePyro: 'red'   // currently equipped pyro skin
    }
  };

  // Player State (Persisted in localStorage avec expiration glissante de 7 jours)
  const [playerData, setPlayerData] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_player');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Vérification de la fenêtre d'inactivité des 7 jours
        if (parsed.lastVisited && (Date.now() - parsed.lastVisited > SEVEN_DAYS_MS)) {
          // Plus de 7 jours sans visiter le site -> Purge & Reset
          localStorage.removeItem('yazex_player');
          localStorage.removeItem('yazex_highscores');
          return { ...DEFAULT_PLAYER, lastVisited: Date.now() };
        }
        // Visite active dans les 7 jours -> Sauvegarde des pièces et actualisation du chrono
        const inventory = {
          fumis: 2,
          signals: 1,
          revives: 1,
          unlockedPyro: ['red'],
          activePyro: 'red',
          ...(parsed.inventory || {})
        };
        return { ...DEFAULT_PLAYER, ...parsed, inventory, lastVisited: Date.now() };
      }
      return DEFAULT_PLAYER;
    } catch {
      return DEFAULT_PLAYER;
    }
  });

  // High Scores State
  const [highScores, setHighScores] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_highscores');
      return saved ? JSON.parse(saved) : { runner: 0 };
    } catch {
      return { runner: 0 };
    }
  });

  // Community Tifos state
  const [communityTifos, setCommunityTifos] = useState([]);

  // Promo Reward Modal State
  const [promoModal, setPromoModal] = useState({
    isOpen: false,
    promoCode: '',
    discountText: '',
    title: ''
  });

  // Ultras Armory Modal State
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);

  // Save changes to localStorage avec horodatage glissant
  useEffect(() => {
    try {
      localStorage.setItem('yazex_player', JSON.stringify({
        ...playerData,
        lastVisited: Date.now()
      }));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [playerData]);

  useEffect(() => {
    try {
      localStorage.setItem('yazex_highscores', JSON.stringify(highScores));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [highScores]);

  // Handler when player unlocks a reward milestone
  const handleRewardUnlocked = (code, discount, title) => {
    setPromoModal({
      isOpen: true,
      promoCode: code,
      discountText: discount,
      title: title
    });
  };

  // Handler when player submits a Tifo from studio
  const handleTifoSubmit = (newTifo) => {
    setCommunityTifos((prev) => [newTifo, ...prev]);
    // Switch to Arena after brief delay so user sees their Tifo in the contest!
    setTimeout(() => {
      setCurrentView('arena');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-abyss-black text-pirate-paper flex flex-col font-body selection:bg-pirate-gold selection:text-pirate-dark">
      {/* Persistent Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        playerData={playerData}
        setPlayerData={setPlayerData}
        onOpenArmory={() => setIsArmoryOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3 sm:pt-8 pb-20 md:pb-8 w-full">
        {currentView === 'lobby' && (
          <Lobby
            setCurrentView={setCurrentView}
            playerData={playerData}
            highScores={highScores}
            onOpenArmory={() => setIsArmoryOpen(true)}
          />
        )}

        {currentView === 'runner' && (
          <UltrasRunner
            onBack={() => setCurrentView('lobby')}
            onRewardUnlocked={handleRewardUnlocked}
            highScores={highScores}
            setHighScores={setHighScores}
            playerData={playerData}
            setPlayerData={setPlayerData}
            onOpenArmory={() => setIsArmoryOpen(true)}
          />
        )}

        {currentView === 'tifo-studio' && (
          <TifoStudio
            onBack={() => setCurrentView('lobby')}
            onTifoSubmit={handleTifoSubmit}
            initialClub={playerData.club}
            playerData={playerData}
            setPlayerData={setPlayerData}
            onOpenArmory={() => setIsArmoryOpen(true)}
          />
        )}

        {currentView === 'arena' && (
          <TifoArena
            onBack={() => setCurrentView('lobby')}
            communityTifos={communityTifos}
            onVote={(id) => {
              // Reward voter with 25 coins!
              setPlayerData(prev => ({ ...prev, coins: prev.coins + 25 }));
            }}
          />
        )}
      </main>

      {/* Ultras Armory Modal (Power-Ups & Pyro Shop) */}
      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        playerData={playerData}
        setPlayerData={setPlayerData}
      />

      {/* E-Commerce Reward Promo Modal */}
      <PromoModal
        isOpen={promoModal.isOpen}
        onClose={() => setPromoModal(prev => ({ ...prev, isOpen: false }))}
        promoCode={promoModal.promoCode}
        discountText={promoModal.discountText}
        title={promoModal.title}
      />

      {/* Footer */}
      <footer className="border-t border-pirate-gold/20 bg-black/90 py-6 sm:py-8 text-center text-xs text-gray-500 font-mono mt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            🏴‍☠️ © 2026 <strong>YAZEX ARCADE</strong> • Conçu avec passion pour la culture des virages algériens.
          </p>
          <p className="text-pirate-gold">
            Propulsé par Stepping Stones Agency
          </p>
        </div>
      </footer>
    </div>
  );
}
