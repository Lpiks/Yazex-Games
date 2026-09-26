import React, { useState } from 'react';
import { Trophy, Flame, Play, Shield, Coins, Sparkles, ExternalLink, Home, X } from 'lucide-react';

const ALGERIAN_CLUBS = [
  { id: 'mca', name: 'MC Alger', colors: 'from-green-600 to-red-600', badge: '🟢🔴' },
  { id: 'usma', name: 'USM Alger', colors: 'from-red-600 to-black', badge: '🔴⚫' },
  { id: 'crb', name: 'CR Belouizdad', colors: 'from-red-600 to-white', badge: '🔴⚪' },
  { id: 'jsk', name: 'JS Kabylie', colors: 'from-yellow-400 to-green-600', badge: '🟡🟢' },
  { id: 'ess', name: 'ES Sétif', colors: 'from-black to-white', badge: '⚫⚪' },
  { id: 'csc', name: 'CS Constantine', colors: 'from-green-600 to-black', badge: '🟢⚫' },
  { id: 'mco', name: 'MC Oran', colors: 'from-red-600 to-white', badge: '🔴⚪' },
];

export default function Navbar({ currentView, setCurrentView, playerData, setPlayerData, onOpenArmory }) {
  const [showClubPicker, setShowClubPicker] = useState(false);

  const selectedClub = ALGERIAN_CLUBS.find(c => c.id === playerData.club) || ALGERIAN_CLUBS[0];

  const totalInventoryCount = 
    (playerData?.inventory?.fumis || 0) + 
    (playerData?.inventory?.signals || 0) + 
    (playerData?.inventory?.revives || 0);

  // Formatter for coins on small displays (e.g. 12.8k)
  const formatCoins = (amt) => {
    if (amt >= 100000) return `${(amt / 1000).toFixed(0)}k`;
    if (amt >= 10000) return `${(amt / 1000).toFixed(1)}k`;
    return amt.toLocaleString();
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0d]/90 backdrop-blur-xl border-b border-pirate-gold/20 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-[68px] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. Left: Brand & Pirate Crest */}
          <div 
            onClick={() => setCurrentView('lobby')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-pirate-gold shadow-gold-glow group-hover:scale-105 transition-transform shrink-0 bg-black">
              <img 
                src="/logo.jpg" 
                alt="Yazex Logo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/logo-circle.png'; }}
              />
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-heading text-base sm:text-xl lg:text-2xl tracking-wider text-pirate-gold group-hover:text-yellow-400 transition-colors">
                YAZEX ARCADE
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest bg-red-600/25 text-red-400 border border-red-500/40 px-1 sm:px-1.5 py-0.5 rounded shadow-sm">
                DZ
              </span>
            </div>
          </div>

          {/* 2. Middle: Desktop / Tablet Segmented Cockpit (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-pirate-gold/25 shadow-inner">
            <button
              onClick={() => setCurrentView('lobby')}
              className={`h-9 px-3 lg:px-4 rounded-xl font-heading text-xs tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                currentView === 'lobby' 
                  ? 'bg-gradient-to-r from-pirate-gold/25 to-yellow-600/20 text-pirate-gold border border-pirate-gold/50 shadow-gold-glow font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={14} className={currentView === 'lobby' ? 'text-pirate-gold' : 'text-gray-400'} />
              <span>LOBBY</span>
            </button>

            <button
              onClick={() => setCurrentView('runner')}
              className={`h-9 px-3 lg:px-4 rounded-xl font-heading text-xs tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                currentView === 'runner' 
                  ? 'bg-gradient-to-r from-red-600/30 to-red-900/30 text-red-400 border border-red-500/50 shadow-fumi-glow font-bold' 
                  : 'text-gray-400 hover:text-red-400 hover:bg-white/5'
              }`}
            >
              <Flame size={14} className={currentView === 'runner' ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
              <span className="hidden lg:inline">ULTRAS </span>
              <span>RUNNER</span>
            </button>

            <button
              onClick={() => setCurrentView('tifo-studio')}
              className={`h-9 px-3 lg:px-4 rounded-xl font-heading text-xs tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                currentView === 'tifo-studio' 
                  ? 'bg-gradient-to-r from-pirate-gold/25 to-yellow-600/20 text-pirate-gold border border-pirate-gold/50 shadow-gold-glow font-bold' 
                  : 'text-gray-400 hover:text-pirate-gold hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} className={currentView === 'tifo-studio' ? 'text-yellow-400 animate-spin-slow' : 'text-gray-400'} />
              <span>TIFO STUDIO</span>
            </button>

            <button
              onClick={() => setCurrentView('arena')}
              className={`h-9 px-3 lg:px-4 rounded-xl font-heading text-xs tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                currentView === 'arena' 
                  ? 'bg-gradient-to-r from-yellow-500/25 to-amber-600/20 text-yellow-300 border border-yellow-500/50 shadow-gold-glow font-bold' 
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-white/5'
              }`}
            >
              <Trophy size={14} className={currentView === 'arena' ? 'text-yellow-400' : 'text-gray-400'} />
              <span>CONCOURS</span>
            </button>
          </nav>

          {/* 3. Right: Player Profile Capsule & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Unified Player Glass Capsule [Club | Coins] */}
            <div className="relative flex items-center bg-black/70 backdrop-blur-md border border-pirate-gold/30 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-inner">
              
              {/* Club Allegiance Trigger */}
              <button
                onClick={() => setShowClubPicker(!showClubPicker)}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl hover:bg-white/5 transition-all text-xs font-bold text-pirate-paper cursor-pointer"
                title="Changer d'allégeance de virage"
              >
                <span className="text-sm leading-none">{selectedClub.badge}</span>
                <span className="hidden sm:inline font-mono text-[11px] text-gray-200">{selectedClub.name}</span>
              </button>

              {/* Vertical Divider */}
              <div className="w-px h-4 bg-pirate-gold/25 mx-0.5" />

              {/* Treasure Coins Counter */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-mono font-bold text-yellow-400">
                <Coins size={13} className="text-yellow-400 shrink-0" />
                <span className="hidden sm:inline">{playerData.coins.toLocaleString()}</span>
                <span className="sm:hidden">{formatCoins(playerData.coins)}</span>
              </div>

              {/* Dropdown Club Picker */}
              {showClubPicker && (
                <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-[#111215] border border-pirate-gold/60 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn backdrop-blur-xl">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-pirate-gold/20 mb-1">
                    <p className="text-[10px] uppercase font-bold text-pirate-gold tracking-wider">
                      Choisis ton Virage :
                    </p>
                    <button onClick={() => setShowClubPicker(false)} className="text-gray-400 hover:text-white p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                  {ALGERIAN_CLUBS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setPlayerData({ ...playerData, club: c.id });
                        setShowClubPicker(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                        playerData.club === c.id 
                          ? 'bg-pirate-gold/20 text-pirate-gold border border-pirate-gold/40' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{c.badge}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Armory Button (Ruby Embers Theme) */}
            <button
              onClick={onOpenArmory}
              className="relative flex items-center gap-1.5 bg-gradient-to-r from-red-950/60 via-red-900/35 to-black/60 hover:from-red-900/60 hover:to-black/80 border border-red-500/40 hover:border-red-400 px-2 sm:px-3 py-1.5 rounded-xl font-heading text-xs text-red-300 hover:text-white transition-all shadow-md group cursor-pointer shrink-0"
              title="Ouvrir l'Armurerie du Virage"
            >
              <span className="text-sm">⚔️</span>
              <span className="hidden sm:inline font-heading tracking-wider font-bold">ARMURERIE</span>
              {totalInventoryCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-gold-glow animate-pulse" />
              )}
            </button>

            {/* Yazex Ship Official Store Button */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-pirate-gold to-yellow-500 hover:from-yellow-400 hover:to-pirate-gold text-pirate-dark font-heading text-xs tracking-wider font-bold px-3 py-1.5 rounded-xl shadow-gold-glow hover:scale-105 transition-all cursor-pointer shrink-0"
              title="Boutique officielle Yazex Ship"
            >
              <span>SHOP</span>
              <ExternalLink size={12} />
            </a>

          </div>

        </div>
      </header>

      {/* FIXED MOBILE DOCK BOTTOM NAVIGATION BAR (Ergonomie Pouce) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d10]/95 backdrop-blur-xl border-t border-pirate-gold/25 h-16 flex items-center justify-around px-2 shadow-2xl pb-safe">
        <button
          onClick={() => setCurrentView('lobby')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'lobby' 
              ? 'text-pirate-gold font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home size={18} className={currentView === 'lobby' ? 'text-pirate-gold' : ''} />
          <span className="text-[10px] font-heading tracking-wider mt-0.5">LOBBY</span>
        </button>

        <button
          onClick={() => setCurrentView('runner')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'runner' 
              ? 'text-red-500 font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame size={18} className={currentView === 'runner' ? 'text-red-500 animate-pulse' : ''} />
          <span className="text-[10px] font-heading tracking-wider mt-0.5">RUNNER</span>
        </button>

        <button
          onClick={() => setCurrentView('tifo-studio')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'tifo-studio' 
              ? 'text-pirate-gold font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles size={18} className={currentView === 'tifo-studio' ? 'text-pirate-gold animate-spin-slow' : ''} />
          <span className="text-[10px] font-heading tracking-wider mt-0.5">TIFO</span>
        </button>

        <button
          onClick={() => setCurrentView('arena')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'arena' 
              ? 'text-yellow-400 font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Trophy size={18} className={currentView === 'arena' ? 'text-yellow-400' : ''} />
          <span className="text-[10px] font-heading tracking-wider mt-0.5">CONCOURS</span>
        </button>

        {/* Mobile Armory Quick Access Button */}
        <button
          onClick={onOpenArmory}
          className="flex flex-col items-center justify-center flex-1 py-1 text-gray-400 hover:text-yellow-400 transition-all cursor-pointer"
        >
          <div className="relative">
            <span className="text-lg leading-none">⚔️</span>
            {totalInventoryCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
                {totalInventoryCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-heading tracking-wider mt-0.5">ARMURERIE</span>
        </button>
      </div>
    </>
  );
}
