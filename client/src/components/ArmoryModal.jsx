import React, { useState } from 'react';
import { X, Flame, Sparkles, Shield, Magnet, RotateCcw, Check, ShoppingCart, Award, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RUNNER_ITEMS = [
  {
    id: 'fumi',
    type: 'consumable',
    name: 'Fumigène Écran de Fumée',
    badge: 'INVINCIBILITÉ 6S',
    icon: '🔥',
    cost: 50,
    desc: 'Allume une torche ardente qui pulvérise tous les obstacles et barrières 1312 sans subir de dégâts.',
    keyHint: 'Touche [F] ou bouton en jeu'
  },
  {
    id: 'signal',
    type: 'consumable',
    name: 'Signal Fusée Éclairante',
    badge: 'AIMANT À PIÈCES 8S',
    icon: '🧨',
    cost: 75,
    desc: 'Tire une fusée de détresse dorée qui attire magnétiquement toutes les pièces sur la piste.',
    keyHint: 'Touche [M] ou bouton en jeu'
  },
  {
    id: 'revive',
    type: 'consumable',
    name: 'Fusée de Détresse (Seconde Chance)',
    badge: 'RÉANIMATION IMMÉDIATE',
    icon: '🚀',
    cost: 150,
    desc: 'Aveugle la police et te ressuscite instantanément au crash avec ton score et ta distance intacts.',
    keyHint: 'Bouton automatique au Game Over'
  }
];

export const TIFO_PYRO_PACKS = [
  {
    id: 'red',
    name: 'Rouge Braise Alger',
    badge: 'PAR DÉFAUT',
    hex: '#E53E3E',
    cost: 0,
    desc: 'Les 4 foyers classiques de fumigènes rouge incandescent avec étincelles dorées.',
    isFree: true
  },
  {
    id: 'green',
    name: 'Vert Émeraude MCA',
    badge: 'FUMÉE VIRAGE INTENSE',
    hex: '#38A169',
    cost: 150,
    desc: 'Dégage une fumée verte étincelante sur toute la tribune pour une ambiance 100% virage vert.',
  },
  {
    id: 'gold',
    name: 'Or Corsaire Yazex',
    badge: 'LUEUR DORÉE RARE',
    hex: '#FFD700',
    cost: 250,
    desc: 'Flammes d’or pur et comètes scintillantes illuminant le port aux couleurs de Yazex.',
  },
  {
    id: 'black',
    name: 'Fumée Noire Toxique',
    badge: 'STROBE & OPAQUE',
    hex: '#111215',
    cost: 350,
    desc: 'Épais nuage noir ultra-opaque montant jusqu’au toit pour un rendu visuel ténébreux.',
  },
  {
    id: 'dual',
    name: 'Le Grand Brasier (12 Foyers)',
    badge: 'MUR DE FEU INTÉGRAL',
    hex: '#FF4500',
    cost: 500,
    desc: 'Embrase 12 foyers continus sur toute la barrière du stade avec salves explosives.',
  }
];

export default function ArmoryModal({ isOpen, onClose, playerData, setPlayerData }) {
  const [activeTab, setActiveTab] = useState('runner'); // 'runner' | 'tifo'
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  if (!isOpen) return null;

  const inventory = playerData.inventory || {
    fumis: 0,
    signals: 0,
    revives: 0,
    unlockedPyro: ['red'],
    activePyro: 'red'
  };

  // Buy Consumable for Runner
  const buyConsumable = (item) => {
    if (playerData.coins < item.cost) return;

    setPlayerData(prev => {
      const inv = prev.inventory || { fumis: 0, signals: 0, revives: 0, unlockedPyro: ['red'], activePyro: 'red' };
      const key = item.id === 'fumi' ? 'fumis' : item.id === 'signal' ? 'signals' : 'revives';
      return {
        ...prev,
        coins: prev.coins - item.cost,
        inventory: {
          ...inv,
          [key]: (inv[key] || 0) + 1
        }
      };
    });

    setPurchaseSuccess(`+1 ${item.name} ajouté à ton inventaire !`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setPurchaseSuccess(null), 2500);
  };

  // Buy / Equip Pyro Pack for Tifo Studio
  const handlePyroAction = (pack) => {
    const isUnlocked = inventory.unlockedPyro?.includes(pack.id) || pack.isFree;

    if (isUnlocked) {
      // Equip directly
      setPlayerData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          activePyro: pack.id
        }
      }));
      setPurchaseSuccess(`Effet "${pack.name}" équipé sur ton Tifo !`);
      setTimeout(() => setPurchaseSuccess(null), 2000);
      return;
    }

    // Purchase & Equip
    if (playerData.coins < pack.cost) return;

    setPlayerData(prev => {
      const inv = prev.inventory || { fumis: 0, signals: 0, revives: 0, unlockedPyro: ['red'], activePyro: 'red' };
      return {
        ...prev,
        coins: prev.coins - pack.cost,
        inventory: {
          ...inv,
          unlockedPyro: [...(inv.unlockedPyro || ['red']), pack.id],
          activePyro: pack.id
        }
      };
    });

    setPurchaseSuccess(`🔥 Pack "${pack.name}" débloqué à vie et équipé !`);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    setTimeout(() => setPurchaseSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#18181b] via-[#121214] to-black border-2 border-pirate-gold/60 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pirate-gold/15 border border-pirate-gold/40 flex items-center justify-center text-xl sm:text-2xl shadow-gold-glow">
              ⚔️
            </div>
            <div>
              <h3 className="font-heading text-xl sm:text-3xl text-white tracking-wider flex items-center gap-2">
                L'ARMURERIE DU VIRAGE
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-mono">
                Équipe ton pirate & débloque les effets pyrotechniques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Balance */}
            <div className="flex items-center gap-1.5 bg-black/80 border border-yellow-500/50 px-3 py-1.5 rounded-xl font-heading text-sm sm:text-base text-yellow-400 shadow-inner">
              <span>🪙</span>
              <span className="font-bold">{playerData.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/60 border border-gray-700 text-gray-400 hover:text-white hover:border-pirate-gold transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Purchase Notification Banner */}
        {purchaseSuccess && (
          <div className="bg-green-600/20 border border-green-500/50 text-green-300 font-mono text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
            <Check size={16} className="text-green-400 shrink-0" />
            <span>{purchaseSuccess}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-2xl border border-pirate-gold/20">
          <button
            onClick={() => setActiveTab('runner')}
            className={`py-2 px-3 rounded-xl font-heading text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'runner'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-fumi-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🏃</span> POWER-UPS RUNNER
          </button>

          <button
            onClick={() => setActiveTab('tifo')}
            className={`py-2 px-3 rounded-xl font-heading text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tifo'
                ? 'bg-gradient-to-r from-pirate-gold to-yellow-500 text-black font-bold shadow-gold-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🔥</span> PYROTECHNIE TIFO
          </button>
        </div>

        {/* TAB 1: RUNNER CONSUMABLES */}
        {activeTab === 'runner' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Articles consommables en jeu</span>
              <span>Stock actuel</span>
            </div>

            {RUNNER_ITEMS.map((item) => {
              const currentStock = item.id === 'fumi' 
                ? inventory.fumis 
                : item.id === 'signal' 
                ? inventory.signals 
                : inventory.revives;
              
              const canAfford = playerData.coins >= item.cost;

              return (
                <div
                  key={item.id}
                  className="bg-black/50 border border-pirate-gold/25 hover:border-pirate-gold/50 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-950/40 to-black border border-red-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading text-base sm:text-lg text-white">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-body leading-relaxed max-w-md">
                        {item.desc}
                      </p>
                      <span className="text-[10px] text-pirate-gold font-mono block">
                        ⌨️ {item.keyHint}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                    <span className="text-xs font-mono text-gray-300">
                      En réserve : <strong className="text-yellow-400 font-bold">{currentStock || 0}</strong>
                    </span>

                    <button
                      onClick={() => buyConsumable(item)}
                      disabled={!canAfford}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-heading text-xs tracking-wider font-bold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-md active:scale-95'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                      }`}
                    >
                      <ShoppingCart size={13} />
                      ACHETER ({item.cost} 🪙)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TIFO STUDIO PYRO PACKS */}
        {activeTab === 'tifo' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Effets de craquage permanents pour le stade</span>
              <span>Statut</span>
            </div>

            {TIFO_PYRO_PACKS.map((pack) => {
              const isUnlocked = inventory.unlockedPyro?.includes(pack.id) || pack.isFree;
              const isEquipped = inventory.activePyro === pack.id;
              const canAfford = playerData.coins >= pack.cost;

              return (
                <div
                  key={pack.id}
                  className={`bg-black/50 border rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isEquipped 
                      ? 'border-yellow-400 shadow-gold-glow bg-black/80' 
                      : 'border-pirate-gold/25 hover:border-pirate-gold/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      style={{ backgroundColor: pack.hex }}
                      className="w-12 h-12 rounded-xl border-2 border-pirate-gold flex items-center justify-center text-xl shrink-0 shadow-lg text-white"
                    >
                      🔥
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading text-base sm:text-lg text-white">
                          {pack.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-pirate-gold/20 text-pirate-gold border border-pirate-gold/30 px-2 py-0.5 rounded-full">
                          {pack.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-body leading-relaxed max-w-md">
                        {pack.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                    <button
                      onClick={() => handlePyroAction(pack)}
                      disabled={!isUnlocked && !canAfford}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-heading text-xs tracking-wider font-bold transition-all ${
                        isEquipped
                          ? 'bg-green-600 text-white cursor-default shadow-md'
                          : isUnlocked
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md'
                          : canAfford
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-fumi-glow'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check size={14} /> ÉQUIPÉ
                        </>
                      ) : isUnlocked ? (
                        <>
                          <Award size={14} /> ÉQUIPER
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={13} /> DÉBLOQUER ({pack.cost} 🪙)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
