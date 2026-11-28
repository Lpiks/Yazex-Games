import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Flame, Play, RotateCcw, Check, ArrowLeft, Eye, X, Coins, Lock, FolderHeart, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { renderTifoFrame, makeDefaultGrid } from './renderTifoFrame';

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
    description: 'Bâche centrale peinte à la main avec les sabres pirates en 3D qui s\'élèvent au-dessus des fumigènes.',
    config: { tifoType: '3d', object3dImage: '/logo.jpg', pyro: 'green' }
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
    description: 'Voile monumental de 35 mètres représentant le navire historique entouré de feuilles rouges et noires.',
    config: { tifoType: 'mixte', grid: makeDefaultGrid('#DC2626', '#18181B'), voileCount: 1, voileLayout: 'center', voileScale: 'normal', voileImage: '/logo.jpg', pyro: 'red' }
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
    description: 'Fresque géante en قماش peinte à la mise au carreau avec 40 mètres d\'envergure.',
    config: { tifoType: 'voile', voileCount: 1, voileLayout: 'full', voileImage: '/logo.jpg', pyro: 'gold' }
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
    description: 'Chorégraphie millimétrée de 12 000 feuilles plastiques formant le V de la victoire.',
    config: { tifoType: 'chore', grid: makeDefaultGrid('#DC2626', '#FFFFFF'), pyro: 'dual' }
  },
];

export default function TifoArena({ onBack, communityTifos = [], onVote, activeChallenge, myTifos = [], onPublishDraft, authUser, onOpenAuth }) {
  const { t } = useTranslation();
  const isChallengeOpen = Boolean(activeChallenge?.isActive);
  const [publishingId, setPublishingId] = useState(null);
  const [publishError, setPublishError] = useState('');
  const [tifos, setTifos] = useState(() => [...communityTifos, ...INITIAL_CONTEST_TIFOS]);
  const [votedIds, setVotedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_voted_tifos');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [selectedTifo, setSelectedTifo] = useState(null);
  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const modalCanvasRef = useRef(null);

  useEffect(() => {
    setTifos((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const fresh = communityTifos.filter((t) => !existingIds.has(t.id));
      return fresh.length > 0 ? [...fresh, ...prev] : prev;
    });
  }, [communityTifos]);

  useEffect(() => {
    if (!selectedTifo) {
      setIsSimPlaying(false);
      setSimTime(0);
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedTifo(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTifo]);

  // 15-second simulation timer inside modal
  useEffect(() => {
    if (!isSimPlaying) return;
    const interval = setInterval(() => {
      setSimTime((prev) => {
        if (prev >= 15) {
          setIsSimPlaying(false);
          return 15;
        }
        return Number((prev + 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSimPlaying]);

  const activeTifoConfig = selectedTifo
    ? (selectedTifo.config || {
        tifoType: selectedTifo.type || 'mixte',
        pyro: selectedTifo.pyro || 'red',
        pyroSpots: selectedTifo.pyroSpots || null,
      })
    : null;

  // Render stadium frame on modal canvas whenever selectedTifo / simTime changes
  useEffect(() => {
    if (!activeTifoConfig || !modalCanvasRef.current) return;
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    renderTifoFrame(ctx, canvas.width, canvas.height, activeTifoConfig, {
      isPlaying: isSimPlaying,
      simTime,
    });
  }, [selectedTifo, activeTifoConfig, isSimPlaying, simTime]);

  const handleVote = (id) => {
    if (!isChallengeOpen) return;
    if (votedIds.has(id)) return;

    setTifos(prev => 
      prev.map(t => (t.id === id ? { ...t, votes: t.votes + 1 } : t))
    );
    setSelectedTifo((prev) => (prev && prev.id === id ? { ...prev, votes: prev.votes + 1 } : prev));

    setVotedIds(prev => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem('yazex_voted_tifos', JSON.stringify([...next]));
      } catch {
        // Ignore storage errors
      }
      return next;
    });

    if (onVote) onVote(id);

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
      <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 py-2 pr-3 text-pirate-gold hover:text-white font-heading text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={18} /> RETOUR AU LOBBY
        </button>

        <span className={`text-xs font-mono ${isChallengeOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isChallengeOpen ? `Concours Ouvert • ${activeChallenge?.title || 'Saison 2026'}` : '🔒 Concours Verrouillé'}
        </span>
      </div>

      {/* Mes TIFOs Sauvegardés (Drafts -> Push to Vote when Challenge Opens) */}
      <div className="bg-[#111216] border border-pirate-gold/30 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-pirate-gold flex items-center gap-2">
              <FolderHeart size={22} /> MES TIFOS SAUVEGARDÉS
            </h2>
            <p className="text-xs text-gray-400">
              Prépare tes créations dans le Studio et envoie-les au vote dès qu&apos;un concours est lancé.
            </p>
          </div>
          {!authUser && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-pirate-gold text-black font-bold text-xs uppercase hover:bg-yellow-400"
            >
              Connexion pour sauvegarder
            </button>
          )}
        </div>

        {publishError && <p className="text-xs text-red-400">{publishError}</p>}

        {myTifos.length === 0 ? (
          <p className="text-xs text-gray-500">Aucun Tifo sauvegardé pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTifos.map((mt) => {
              const isDraft = mt.status === 'draft';
              return (
                <div key={mt._id} className="bg-black/50 border border-gray-800 rounded-xl p-3 flex flex-col gap-3">
                  {mt.previewDataUrl && (
                    <img src={mt.previewDataUrl} alt={mt.title} className="w-full h-32 object-cover rounded-lg border border-gray-800 bg-black" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-white truncate">{mt.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      isDraft ? 'bg-gray-800 text-gray-300' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {isDraft ? 'Brouillon' : 'Soumis'}
                    </span>
                  </div>
                  {isDraft && (
                    <button
                      disabled={!isChallengeOpen || publishingId === mt._id}
                      onClick={async () => {
                        setPublishError('');
                        setPublishingId(mt._id);
                        try {
                          await onPublishDraft(mt._id);
                        } catch (err) {
                          setPublishError(err.message);
                        } finally {
                          setPublishingId(null);
                        }
                      }}
                      className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isChallengeOpen
                          ? 'bg-pirate-gold text-black hover:bg-yellow-400'
                          : 'bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isChallengeOpen ? <Rocket size={14} /> : <Lock size={14} />}
                      <span>{isChallengeOpen ? (publishingId === mt._id ? 'Envoi...' : 'Pousser au Concours') : 'En attente d’un concours'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lock Banner OR Active Contest */}
      {!isChallengeOpen ? (
        <div className="bg-[#111216] border-2 border-pirate-gold/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
          <Lock className="mx-auto text-pirate-gold" size={44} />
          <h2 className="font-heading text-2xl sm:text-3xl text-pirate-gold">{t('arena.locked_title')}</h2>
          <p className="text-sm text-gray-300 max-w-lg mx-auto">
            {t('arena.locked_desc')}
          </p>
        </div>
      ) : (
        <>

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
              Vote pour les Tifos les plus créatifs créés par la communauté. Le vainqueur est proclamé en live sur TikTok et gagne le <strong className="text-yellow-400">Trophée Gravé Yazex Ship</strong> et un bon d'achat exclusif !
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
                {/* Header Preview Banner (Click to inspect full Tifo) */}
                <button
                  type="button"
                  onClick={() => setSelectedTifo(tifo)}
                  className="relative h-48 w-full bg-black overflow-hidden flex items-center justify-center border-b border-pirate-gold/20 text-left cursor-pointer"
                >
                  <img 
                    src={tifo.previewImg} 
                    alt={tifo.title} 
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    onError={(e) => { e.target.src = '/logo.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pirate-dark via-transparent to-transparent" />

                  {/* Rank Badge */}
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/80 border border-pirate-gold/50 text-pirate-gold font-heading text-xs tracking-wider font-bold tabular-nums">
                    #{index + 1} EN TÊTE
                  </span>

                  {/* Club Tag */}
                  {tifo.badge && (
                    <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/80 border border-gray-600 text-gray-200 font-mono text-xs font-bold">
                      {tifo.badge}
                    </span>
                  )}

                  {/* Inspect Pill */}
                  <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-pirate-gold/40 text-pirate-gold font-heading text-xs tracking-wider">
                    <Eye size={13} /> VOIR LE TIFO
                  </span>
                </button>

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
                  <div className="pt-4 border-t border-pirate-gold/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-heading text-xl text-yellow-400 tabular-nums">
                      <Flame size={20} className="text-red-500 animate-pulse" />
                      <span>{tifo.votes.toLocaleString()} {tifo.votes === 1 ? 'VOTE' : 'VOTES'}</span>
                    </div>

                    <button
                      onClick={() => handleVote(tifo.id)}
                      disabled={hasVoted}
                      className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-heading text-sm tracking-wider font-bold shadow-md transition-all ${
                        hasVoted 
                          ? 'bg-green-600 text-white cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-fumi-glow hover:scale-105'
                      }`}
                    >
                      {hasVoted ? <Check size={16} /> : <Flame size={16} />}
                      {hasVoted ? 'A VOTÉ !' : 'VOTER (+25)'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Full Tifo Preview Modal */}
      {selectedTifo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setSelectedTifo(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#111216] border-2 border-pirate-gold/60 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-pirate-gold/20">
              <div>
                <h3 className="font-heading text-xl sm:text-2xl text-white tracking-wide">{selectedTifo.title}</h3>
                <p className="text-xs font-mono text-gray-400">
                  @{selectedTifo.author} • {selectedTifo.badge || 'Virage DZ'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTifo(null)}
                aria-label="Fermer l'aperçu"
                className="p-2 rounded-xl bg-black/60 border border-gray-700 text-gray-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative bg-black aspect-[1000/480] w-full overflow-hidden">
              {isSimPlaying || simTime > 0 || selectedTifo.config ? (
                <canvas
                  ref={modalCanvasRef}
                  width={1000}
                  height={480}
                  className="w-full h-full block"
                />
              ) : (
                <img
                  src={selectedTifo.previewImg}
                  alt={selectedTifo.title}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = '/logo.jpg'; }}
                />
              )}

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <button
                  type="button"
                  onClick={() => {
                    setSimTime(0);
                    setIsSimPlaying(true);
                  }}
                  disabled={isSimPlaying}
                  className="pointer-events-auto inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-black/80 text-white font-heading text-xs sm:text-sm tracking-wider px-3.5 py-2 rounded-xl shadow-fumi-glow border border-pirate-gold/40 transition-all"
                >
                  {isSimPlaying ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                  <span>{isSimPlaying ? `SIMULATION (${simTime}s / 15s)` : simTime >= 15 ? 'REJOUER LA VIDÉO (15s)' : 'VOIR LA VIDÉO (15s)'}</span>
                </button>
              </div>
            </div>

            <div className="h-1.5 bg-gray-900 w-full">
              <div
                className="h-full bg-gradient-to-r from-pirate-gold via-red-500 to-yellow-400 transition-all"
                style={{ width: `${(simTime / 15) * 100}%` }}
              />
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-pirate-gold/20">
              <p className="text-xs text-gray-300 font-body">
                {selectedTifo.description || 'Simulation complète de virage.'}
              </p>
              <button
                onClick={() => handleVote(selectedTifo.id)}
                disabled={votedIds.has(selectedTifo.id)}
                className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm tracking-wider font-bold transition-all ${
                  votedIds.has(selectedTifo.id)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-fumi-glow'
                }`}
              >
                {votedIds.has(selectedTifo.id) ? <Check size={16} /> : <Flame size={16} />}
                <span>{votedIds.has(selectedTifo.id) ? 'A VOTÉ !' : 'VOTER (+25'}</span>
                {!votedIds.has(selectedTifo.id) && <Coins size={14} />}
                {!votedIds.has(selectedTifo.id) && <span>)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
