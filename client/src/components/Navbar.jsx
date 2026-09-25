import React, { useState } from 'react';
import { Trophy, Flame, Play, Shield, Coins, Sparkles, ExternalLink } from 'lucide-react';

const ALGERIAN_CLUBS = [
  { id: 'mca', name: 'MC Alger', colors: 'from-green-600 to-red-600', badge: '🟢🔴' },
  { id: 'usma', name: 'USM Alger', colors: 'from-red-600 to-black', badge: '🔴⚫' },
  { id: 'crb', name: 'CR Belouizdad', colors: 'from-red-600 to-white', badge: '🔴⚪' },
  { id: 'jsk', name: 'JS Kabylie', colors: 'from-yellow-400 to-green-600', badge: '🟡🟢' },
  { id: 'ess', name: 'ES Sétif', colors: 'from-black to-white', badge: '⚫⚪' },
  { id: 'csc', name: 'CS Constantine', colors: 'from-green-600 to-black', badge: '🟢⚫' },
  { id: 'mco', name: 'MC Oran', colors: 'from-red-600 to-white', badge: '🔴⚪' },
];

export default function Navbar({ currentView, setCurrentView, playerData, setPlayerData }) {
  const [showClubPicker, setShowClubPicker] = useState(false);

  const selectedClub = ALGERIAN_CLUBS.find(c => c.id === playerData.club) || ALGERIAN_CLUBS[0];

  return (
    <header className="sticky top-0 z-50 bg-pirate-dark/90 backdrop-blur-md border-b border-pirate-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => setCurrentView('lobby')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pirate-gold shadow-gold-glow group-hover:scale-105 transition-transform">
            <img 
              src="/logo.jpg" 
              alt="Yazex Logo" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/logo-circle.png'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl tracking-wider text-pirate-gold group-hover:text-yellow-400 transition-colors">
                YAZEX ARCADE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-red-600/30 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full">
                ULTRAS DZ
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden sm:block">
              Le Hub Gaming des Virages & Corsaires
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-pirate-gold/20">
          <button
            onClick={() => setCurrentView('lobby')}
            className={`px-4 py-2 rounded-lg font-heading text-sm tracking-wide transition-all ${
              currentView === 'lobby' 
                ? 'bg-pirate-gold text-pirate-dark shadow-gold-glow font-bold' 
                : 'text-gray-300 hover:text-pirate-gold'
            }`}
          >
            LOBBY
          </button>
          <button
            onClick={() => setCurrentView('runner')}
            className={`px-4 py-2 rounded-lg font-heading text-sm tracking-wide flex items-center gap-2 transition-all ${
              currentView === 'runner' 
                ? 'bg-red-600 text-white shadow-fumi-glow font-bold' 
                : 'text-gray-300 hover:text-red-400'
            }`}
          >
            <Flame size={16} /> ULTRAS RUNNER
          </button>
          <button
            onClick={() => setCurrentView('tifo-studio')}
            className={`px-4 py-2 rounded-lg font-heading text-sm tracking-wide flex items-center gap-2 transition-all ${
              currentView === 'tifo-studio' 
                ? 'bg-pirate-gold text-pirate-dark shadow-gold-glow font-bold' 
                : 'text-gray-300 hover:text-pirate-gold'
            }`}
          >
            <Sparkles size={16} /> TIFO STUDIO
          </button>
          <button
            onClick={() => setCurrentView('arena')}
            className={`px-4 py-2 rounded-lg font-heading text-sm tracking-wide flex items-center gap-2 transition-all ${
              currentView === 'arena' 
                ? 'bg-yellow-500 text-black shadow-gold-glow font-bold' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            <Trophy size={16} /> CONCOURS TIFO
          </button>
        </nav>

        {/* Player Profile & Stats */}
        <div className="flex items-center gap-3">
          
          {/* Club Allegiance Pill */}
          <div className="relative">
            <button
              onClick={() => setShowClubPicker(!showClubPicker)}
              className="flex items-center gap-2 bg-black/60 border border-pirate-gold/40 px-3 py-1.5 rounded-full hover:border-pirate-gold transition-colors text-xs font-bold"
              title="Changer d'allégeance de virage"
            >
              <span className="text-base">{selectedClub.badge}</span>
              <span className="hidden sm:inline text-pirate-paper">{selectedClub.name}</span>
            </button>

            {/* Dropdown Club Picker */}
            {showClubPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-pirate-dark border-2 border-pirate-gold rounded-xl p-2 shadow-2xl z-50 animate-fadeIn">
                <p className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 tracking-wider border-b border-pirate-gold/20 mb-1">
                  Choisis ton Virage :
                </p>
                {ALGERIAN_CLUBS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setPlayerData({ ...playerData, club: c.id });
                      setShowClubPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                      playerData.club === c.id 
                        ? 'bg-pirate-gold/20 text-pirate-gold border border-pirate-gold/40' 
                        : 'text-gray-300 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span>{c.badge}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Treasure Coins Counter */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-yellow-500/40 px-3 py-1.5 rounded-full text-xs font-bold text-yellow-400 shadow-inner">
            <Coins size={15} className="text-yellow-400 animate-bounce" />
            <span>{playerData.coins.toLocaleString()}</span>
          </div>

          {/* External Link to Main Shop */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-pirate-gold to-yellow-500 text-pirate-dark font-heading text-xs tracking-wider font-bold px-3.5 py-2 rounded-lg shadow-gold-glow hover:brightness-110 transition-all"
            title="Aller sur la boutique officielle Yazex Ship"
          >
            <span>BOUTIQUE</span>
            <ExternalLink size={13} />
          </a>

        </div>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-black/80 border-t border-pirate-gold/20 py-2">
        <button
          onClick={() => setCurrentView('lobby')}
          className={`text-xs font-heading tracking-wide py-1 px-2 rounded ${
            currentView === 'lobby' ? 'text-pirate-gold font-bold' : 'text-gray-400'
          }`}
        >
          LOBBY
        </button>
        <button
          onClick={() => setCurrentView('runner')}
          className={`text-xs font-heading tracking-wide py-1 px-2 rounded flex items-center gap-1 ${
            currentView === 'runner' ? 'text-red-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Flame size={12} /> RUNNER
        </button>
        <button
          onClick={() => setCurrentView('tifo-studio')}
          className={`text-xs font-heading tracking-wide py-1 px-2 rounded flex items-center gap-1 ${
            currentView === 'tifo-studio' ? 'text-pirate-gold font-bold' : 'text-gray-400'
          }`}
        >
          <Sparkles size={12} /> TIFO
        </button>
        <button
          onClick={() => setCurrentView('arena')}
          className={`text-xs font-heading tracking-wide py-1 px-2 rounded flex items-center gap-1 ${
            currentView === 'arena' ? 'text-yellow-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Trophy size={12} /> CONCOURS
        </button>
      </div>
    </header>
  );
}
