import React from 'react';
import { Play, Sparkles, Flame, Trophy, Users, ShieldAlert, Award, Star, ArrowRight } from 'lucide-react';

export default function Lobby({ setCurrentView, playerData, highScores }) {
  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-pirate-gold/40 bg-gradient-to-br from-pirate-dark via-[#141416] to-black p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-pirate-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pirate-gold/15 border border-pirate-gold/30 text-pirate-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Saison 2026 : Virage & Piraterie Ouverte
          </div>
          
          <h1 className="font-heading text-4xl sm:text-6xl text-white tracking-wide leading-none">
            BIENVENUE SUR <span className="text-pirate-gold text-glow-gold">YAZEX ARCADE</span>
          </h1>
          
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Le repaire gaming officiel des supporters et corsaires. Cours dans les ruelles du port en esquivant la police et les signaux, ou prends les commandes de la tribune pour concevoir le Tifo qui fera vibrer toute l'Algérie.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setCurrentView('runner')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading text-lg tracking-wider px-6 py-3 rounded-xl shadow-fumi-glow hover:scale-105 transition-all font-bold"
            >
              <Play size={18} fill="currentColor" /> LANCER ULTRAS RUNNER
            </button>
            <button
              onClick={() => setCurrentView('tifo-studio')}
              className="inline-flex items-center gap-2 bg-black/60 hover:bg-black/90 border border-pirate-gold text-pirate-gold font-heading text-lg tracking-wider px-6 py-3 rounded-xl hover:shadow-gold-glow transition-all font-bold"
            >
              <Sparkles size={18} /> OUVRIR TIFO STUDIO
            </button>
          </div>
        </div>

        {/* Floating Quick Badges */}
        <div className="hidden lg:flex absolute right-12 bottom-12 items-center gap-6 bg-black/50 border border-pirate-gold/20 p-4 rounded-2xl backdrop-blur-md">
          <div className="text-center">
            <span className="block text-2xl font-heading text-pirate-gold font-bold">
              {highScores.runner || 0}
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">Meilleur Score</span>
          </div>
          <div className="w-px h-8 bg-pirate-gold/20" />
          <div className="text-center">
            <span className="block text-2xl font-heading text-red-400 font-bold">
              500 PTS
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">Objectif Code Promo</span>
          </div>
        </div>
      </section>

      {/* The 2 Games Grid (Roblox-style cards) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-4">
          <div>
            <h2 className="font-heading text-3xl text-pirate-gold tracking-wider">
              🎮 EXPÉRIENCES EN VEDETTE
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Sélectionne ton défi et entre dans l'arène
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            2 Jeux Prêts
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Yazex Ultras Runner */}
          <div className="group relative rounded-2xl border-2 border-red-900/50 bg-gradient-to-b from-[#1c1214] to-black overflow-hidden hover:border-red-500 shadow-2xl transition-all duration-300 flex flex-col justify-between">
            {/* Top Image Preview Banner */}
            <div className="relative h-56 bg-black overflow-hidden flex items-center justify-center border-b border-red-900/40">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1214] via-transparent to-transparent z-10" />
              {/* Background Atmospheric Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/30 via-transparent to-transparent" />
              
              {/* Animated Scene Elements */}
              <div className="relative z-0 flex items-center gap-6 transform group-hover:scale-105 transition-transform duration-500">
                <img 
                  src="/logo.jpg" 
                  alt="Yazex Mascot" 
                  className="w-28 h-28 rounded-full border-2 border-pirate-gold shadow-fumi-glow animate-pulse-glow"
                  onError={(e) => { e.target.src = '/logo-circle.png'; }}
                />
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-red-500 font-heading text-lg">
                    <Flame size={20} className="animate-bounce" /> CRAQUAGE NOCTURNE
                  </div>
                  <p className="text-xs text-gray-300 font-mono">
                    🏃 Saute les fumis • 🦆 Baisse-toi sous les signaux • 🚓 Esquive la police
                  </p>
                </div>
              </div>

              {/* Tag Pill */}
              <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-red-600/80 text-white font-heading text-xs tracking-wider font-bold shadow-md">
                ARCADE 2.5D HAUTE VITESSE
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-3xl text-white group-hover:text-red-400 transition-colors tracking-wide">
                  YAZEX ULTRAS RUNNER
                </h3>
                <p className="text-sm text-gray-400 font-body leading-relaxed mt-1">
                  Inspiré du mythique jeu Chrome Dino, revisité à 100% pour la culture des virages algériens. Traverse les quais du port d'Alger à pleine vitesse, ramasse les pièces d'or et débloque ton coupon promo à 500 points !
                </p>
              </div>

              <div className="pt-4 border-t border-red-950/60 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>⚡ 60 FPS</span>
                  <span>🪙 Pièces à ramasser</span>
                  <span className="text-yellow-400 font-bold">🎁 Promo à 500 pts</span>
                </div>
                
                <button
                  onClick={() => setCurrentView('runner')}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-heading text-sm tracking-wider font-bold px-5 py-2.5 rounded-lg shadow-lg group-hover:shadow-fumi-glow transition-all"
                >
                  JOUER <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Tifo Studio & Arena */}
          <div className="group relative rounded-2xl border-2 border-pirate-gold/40 bg-gradient-to-b from-[#181612] to-black overflow-hidden hover:border-pirate-gold shadow-2xl transition-all duration-300 flex flex-col justify-between">
            {/* Top Image Preview Banner */}
            <div className="relative h-56 bg-black overflow-hidden flex items-center justify-center border-b border-pirate-gold/30">
              <div className="absolute inset-0 bg-gradient-to-t from-[#181612] via-transparent to-transparent z-10" />
              {/* Background Atmospheric Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />
              
              {/* Mockup Preview Graphic */}
              <div className="relative z-0 flex items-center gap-4 text-center transform group-hover:scale-105 transition-transform duration-500">
                <div className="w-40 h-28 bg-black/60 border-2 border-pirate-gold/50 rounded-lg p-2 shadow-gold-glow flex flex-col justify-between">
                  <div className="h-4 bg-gradient-to-r from-red-600 via-white to-green-600 rounded text-[9px] font-bold text-black flex items-center justify-center">
                    TIFO 3D SIMULATION
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 bg-pirate-gold/40 rounded mx-auto" />
                    <div className="h-1.5 w-1/2 bg-pirate-gold/40 rounded mx-auto" />
                  </div>
                  <div className="flex justify-around text-[9px] text-pirate-gold font-bold">
                    <span>Voile قماش</span>
                    <span>Choré</span>
                    <span>3D</span>
                  </div>
                </div>
              </div>

              {/* Tag Pill */}
              <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-pirate-gold/90 text-pirate-dark font-heading text-xs tracking-wider font-bold shadow-md">
                STUDIO CRÉATIF & CONCOURS
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-3xl text-white group-hover:text-pirate-gold transition-colors tracking-wide">
                  TIFO STUDIO & ARENA
                </h3>
                <p className="text-sm text-gray-400 font-body leading-relaxed mt-1">
                  Mets en scène le spectacle du virage. Crée ta chorégraphie feuille par feuille, uploade tes visuels sur une bâche قماش monumentale, anime des objets 3D sur câbles, et soumets ton œuvre au grand vote de la communauté !
                </p>
              </div>

              <div className="pt-4 border-t border-pirate-gold/20 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>🎨 4 Modes Tifo</span>
                  <span>⏱️ Timeline 15s</span>
                  <span className="text-yellow-400 font-bold">🗳️ Votes & Trophée</span>
                </div>
                
                <button
                  onClick={() => setCurrentView('tifo-studio')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pirate-gold to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-pirate-dark font-heading text-sm tracking-wider font-bold px-5 py-2.5 rounded-lg shadow-lg group-hover:shadow-gold-glow transition-all"
                >
                  CRÉER <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Community & Competition Teaser */}
      <section className="bg-gradient-to-r from-black via-pirate-dark to-black border-2 border-pirate-gold/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0 shadow-gold-glow">
            <Trophy size={32} />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
              Événement Communautaire Actif
            </span>
            <h4 className="font-heading text-2xl text-white">
              LE GRAND CONCOURS DES TIFOS DE VIRAGE
            </h4>
            <p className="text-xs text-gray-400 font-body max-w-xl">
              Les supporters votent pour les meilleures créations de la semaine. Le gagnant est annoncé sur TikTok & Instagram et remporte un trophée gravé exclusif Yazex Ship !
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('arena')}
          className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-heading text-base tracking-wider font-bold px-6 py-3 rounded-xl shadow-gold-glow transition-all"
        >
          VOIR LES TIFOS & VOTER
        </button>
      </section>

    </div>
  );
}
