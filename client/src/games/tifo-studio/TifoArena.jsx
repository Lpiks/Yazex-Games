import React, { useState } from 'react';
import { Trophy, Flame, Play, Sparkles, Check, ArrowLeft, Heart, Award, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_CONTEST_TIFOS = [
  {
    id: 1,
    title: 'LA CITÉ DES CORSAIRES',
    author: 'Capo_BabElOued',
    club: 'mca',
    type: '3d',
    votes: 1420,
    badge: '🟢🔴 MC Alger',
    previewImg: '/logo.jpg',
    description: 'Bâche centrale peinte à la main avec les sabres pirates en 3D qui s\'élèvent au-dessus des fumigènes.'
  },
  {
    id: 2,
    title: 'BABOUR EL LOUH (HOMMAGE)',
    author: 'Red_Fighter_16',
    club: 'usma',
    type: 'mixte',
    votes: 1285,
    badge: '🔴⚫ USM Alger',
    previewImg: '/logo.jpg',
    description: 'Voile monumental de 35 mètres représentant le navire historique entouré de feuilles rouges et noires.'
  },
  {
    id: 3,
    title: 'L\'AIGLE DES CIMES DU DJURDJURA',
    author: 'Amazigh_Ultras',
    club: 'jsk',
    type: 'voile',
    votes: 940,
    badge: '🟡🟢 JS Kabylie',
    previewImg: '/logo.jpg',
    description: 'Fresque géante en قماش peinte à la mise au carreau avec 40 mètres d\'envergure.'
  },
  {
    id: 4,
    title: 'LE PHARE DE BELCOURT',
    author: 'Fanatic_Red_CRB',
    club: 'crb',
    type: 'chore',
    votes: 810,
    badge: '🔴⚪ CR Belouizdad',
    previewImg: '/logo.jpg',
    description: 'Chorégraphie millimétrée de 12 000 feuilles plastiques formant le V de la victoire.'
  },
];

export default function TifoArena({ onBack, communityTifos = [], onVote }) {
  const [tifos, setTifos] = useState(() => [...communityTifos, ...INITIAL_CONTEST_TIFOS]);
  const [votedIds, setVotedIds] = useState(new Set());
  const [selectedTifo, setSelectedTifo] = useState(null);

  const handleVote = (id) => {
    if (votedIds.has(id)) return;

    setTifos(prev => 
      prev.map(t => (t.id === id ? { ...t, votes: t.votes + 1 } : t))
    );
    setVotedIds(prev => new Set(prev).add(id));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ECC94B', '#E53E3E']
    });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-pirate-gold hover:text-white font-heading text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={18} /> RETOUR AU LOBBY
        </button>

        <span className="text-xs font-mono text-gray-400">
          Saison 2026 • Concours Ouvert
        </span>
      </div>

      {/* Main Contest Trophy Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-500/50 bg-gradient-to-r from-[#181610] via-black to-[#1a1214] p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 font-heading text-xs tracking-wider font-bold uppercase">
              <Trophy size={14} /> GRAND CONCOURS HEBDOMADAIRE DU VIRAGE
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl text-white tracking-wide">
              LA COUPE DU MEILLEUR TIFO DZ
            </h1>
            <p className="text-sm text-gray-300 font-body max-w-xl">
              Vote pour les Tifos les plus créatifs créés par la communauté. Le vainqueur est proclamé en live sur TikTok et gagne le **Trophée Gravé Yazex Ship** et un bon d'achat exclusif !
            </p>
          </div>

          {/* Trophy Display Card */}
          <div className="bg-black/60 border-2 border-yellow-500/60 p-6 rounded-2xl text-center shadow-gold-glow shrink-0">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 mx-auto flex items-center justify-center text-yellow-400 mb-2">
              <Trophy size={36} />
            </div>
            <span className="font-heading text-xl text-yellow-400 block tracking-wider">
              TROPHÉE PIRATE D'OR
            </span>
            <span className="text-xs text-gray-400 font-mono">
              + Veste Série Limitée 1-of-1
            </span>
          </div>
        </div>
      </div>

      {/* Tifos Gallery Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl text-pirate-gold tracking-wider flex items-center gap-2">
            <Flame size={24} className="text-red-500" /> LES TIFOS EN COMPÉTITION
          </h2>
          <span className="text-xs font-mono text-gray-400">
            {tifos.length} Créations en lice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tifos.map((tifo, index) => {
            const hasVoted = votedIds.has(tifo.id);
            return (
              <div 
                key={tifo.id}
                className="group relative rounded-2xl border-2 border-pirate-gold/30 bg-pirate-dark/90 overflow-hidden hover:border-pirate-gold shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header Preview Banner */}
                <div className="relative h-48 bg-black overflow-hidden flex items-center justify-center border-b border-pirate-gold/20">
                  <img 
                    src={tifo.previewImg} 
                    alt={tifo.title} 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                    onError={(e) => { e.target.src = '/logo.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pirate-dark via-transparent to-transparent" />

                  {/* Rank Badge */}
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/80 border border-pirate-gold/50 text-pirate-gold font-heading text-xs tracking-wider font-bold">
                    #{index + 1} EN TÊTE
                  </span>

                  {/* Club Tag */}
                  <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/80 border border-gray-600 text-gray-200 font-mono text-xs font-bold">
                    {tifo.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-2xl text-white group-hover:text-pirate-gold transition-colors tracking-wide">
                      {tifo.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Créé par <strong className="text-gray-200">@{tifo.author}</strong> • Type : <span className="text-yellow-400 uppercase font-bold">{tifo.type}</span>
                      {tifo.pyro && (
                        <span className="ml-2 text-red-400 font-bold">
                          • Pyro: {tifo.pyro.toUpperCase()} 🔥
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-300 font-body mt-2 leading-relaxed">
                      {tifo.description || 'Simulation complète de virage avec chorégraphie et bâche géante قماش.'}
                    </p>
                  </div>

                  {/* Voting Actions Bar */}
                  <div className="pt-4 border-t border-pirate-gold/20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-heading text-xl text-yellow-400">
                      <Flame size={20} className="text-red-500 animate-pulse" />
                      <span>{tifo.votes.toLocaleString()} VOTES</span>
                    </div>

                    <button
                      onClick={() => handleVote(tifo.id)}
                      disabled={hasVoted}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm tracking-wider font-bold shadow-md transition-all ${
                        hasVoted 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-fumi-glow hover:scale-105'
                      }`}
                    >
                      {hasVoted ? <Check size={16} /> : <Flame size={16} />}
                      {hasVoted ? 'A VOTÉ !' : 'VOTER POUR CE TIFO'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
