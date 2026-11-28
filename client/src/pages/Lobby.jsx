import React from 'react';
import { Play, Anchor, Palette, Flame, Trophy, Users, ShieldAlert, Award, Star, ArrowRight, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Lobby({ setCurrentView, playerData, highScores, onOpenArmory }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 sm:space-y-10 pb-24 md:pb-16 px-1 sm:px-0">
      
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-pirate-gold/40 bg-gradient-to-br from-pirate-dark via-[#141416] to-black p-5 sm:p-12 shadow-2xl">
        <div className="absolute top-0 end-0 -me-16 -mt-16 w-80 h-80 rounded-full bg-pirate-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 -mb-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pirate-gold/15 border border-pirate-gold/30 text-pirate-gold text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Anchor size={12} /> {t('lobby.season_badge')}
            </div>
            
            <h1 className="font-heading text-3xl sm:text-6xl text-white tracking-wide leading-none">
              {t('lobby.welcome_prefix')} <span className="text-pirate-gold text-glow-gold">YAZEX ARCADE</span>
            </h1>
            
            <p className="text-gray-300 text-xs sm:text-base max-w-2xl font-body leading-relaxed">
              {t('lobby.hero_desc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('runner')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading text-sm sm:text-lg tracking-wider px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-fumi-glow hover:scale-105 transition-all font-bold cursor-pointer"
              >
                <Play size={16} fill="currentColor" /> {t('lobby.launch_runner')}
              </button>
              <button
                onClick={() => setCurrentView('tifo-studio')}
                className="inline-flex items-center gap-2 bg-black/60 hover:bg-black/90 border border-pirate-gold text-pirate-gold font-heading text-sm sm:text-lg tracking-wider px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl hover:shadow-gold-glow transition-all font-bold cursor-pointer"
              >
                <Palette size={16} /> {t('lobby.tifo_studio')}
              </button>
              <button
                onClick={onOpenArmory}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pirate-gold/20 via-yellow-600/20 to-red-600/20 hover:from-pirate-gold/30 hover:to-yellow-600/30 border border-pirate-gold/70 text-pirate-gold hover:text-white font-heading text-sm sm:text-lg tracking-wider px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-gold-glow transition-all font-bold cursor-pointer"
              >
                <Flame size={16} className="text-red-500 animate-pulse" /> {t('lobby.armory_btn')}
              </button>
            </div>
          </div>

          {/* Stats Quick Badges (Flex-aligned so zero RTL/LTR overlap) */}
          <div className="hidden lg:flex shrink-0 items-center gap-6 bg-black/50 border border-pirate-gold/20 p-4 rounded-2xl backdrop-blur-md tabular-nums">
            <div className="text-center">
              <span className="block text-2xl font-heading text-pirate-gold font-bold">
                {(highScores.runner || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">{t('lobby.best_score')}</span>
            </div>
            <div className="w-px h-8 bg-pirate-gold/20" />
            <div className="text-center">
              <span className="block text-2xl font-heading text-red-400 font-bold">
                {t('lobby.top_record')}
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">{t('lobby.beat_record')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 2 Games Grid (Roblox-style cards) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-4">
          <div>
            <h2 className="font-heading text-3xl text-pirate-gold tracking-wider">
              {t('lobby.featured_title')}
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              {t('lobby.featured_sub')}
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('lobby.games_ready')}
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
              <div className="relative z-0 flex items-center gap-6 transform group-hover:scale-105 transition-transform duration-500 px-4">
                <img 
                  src="/logo.jpg" 
                  alt="Yazex Mascot" 
                  className="w-28 h-28 rounded-full border-2 border-pirate-gold shadow-fumi-glow animate-pulse-glow shrink-0"
                  onError={(e) => { e.target.src = '/logo-circle.png'; }}
                />
                <div className="text-start space-y-1">
                  <div className="flex items-center gap-1.5 text-red-500 font-heading text-lg">
                    <Flame size={20} className="animate-bounce" /> {t('lobby.runner_night')}
                  </div>
                  <p className="text-xs text-gray-300 font-mono">
                    {t('lobby.runner_controls')}
                  </p>
                </div>
              </div>

              {/* Tag Pill */}
              <span className="absolute top-4 start-4 z-20 px-3 py-1 rounded-full bg-red-600/80 text-white font-heading text-xs tracking-wider font-bold shadow-md">
                {t('lobby.runner_badge')}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-3xl text-white group-hover:text-red-400 transition-colors tracking-wide">
                  YAZEX ULTRAS RUNNER
                </h3>
                <p className="text-sm text-gray-400 font-body leading-relaxed mt-1">
                  {t('lobby.runner_desc')}
                </p>
              </div>

              <div className="pt-4 border-t border-red-950/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>{t('lobby.fps')}</span>
                  <span className="inline-flex items-center gap-1"><Coins size={12} className="text-yellow-400" /> {t('lobby.collect_coins')}</span>
                  <span className="text-yellow-400 font-bold">{t('lobby.promo_500')}</span>
                </div>
                
                <button
                  onClick={() => setCurrentView('runner')}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-heading text-sm tracking-wider font-bold px-5 py-2.5 rounded-lg shadow-lg group-hover:shadow-fumi-glow transition-all"
                >
                  {t('lobby.play_btn')} <ArrowRight size={16} className="rtl:rotate-180" />
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
              <span className="absolute top-4 start-4 z-20 px-3 py-1 rounded-full bg-pirate-gold/90 text-pirate-dark font-heading text-xs tracking-wider font-bold shadow-md">
                {t('lobby.tifo_badge')}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-3xl text-white group-hover:text-pirate-gold transition-colors tracking-wide">
                  {t('lobby.tifo_card_title')}
                </h3>
                <p className="text-sm text-gray-400 font-body leading-relaxed mt-1">
                  {t('lobby.tifo_desc')}
                </p>
              </div>

              <div className="pt-4 border-t border-pirate-gold/20 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>{t('lobby.tifo_modes')}</span>
                  <span>{t('lobby.tifo_timeline')}</span>
                  <span className="text-yellow-400 font-bold">{t('lobby.tifo_votes')}</span>
                </div>
                
                <button
                  onClick={() => setCurrentView('tifo-studio')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pirate-gold to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-pirate-dark font-heading text-sm tracking-wider font-bold px-5 py-2.5 rounded-lg shadow-lg group-hover:shadow-gold-glow transition-all"
                >
                  {t('lobby.create_btn')} <ArrowRight size={16} className="rtl:rotate-180" />
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
              {t('lobby.community_tag')}
            </span>
            <h4 className="font-heading text-2xl text-white">
              {t('lobby.community_title')}
            </h4>
            <p className="text-xs text-gray-400 font-body max-w-xl">
              {t('lobby.community_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('arena')}
          className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-heading text-base tracking-wider font-bold px-6 py-3 rounded-xl shadow-gold-glow transition-all"
        >
          {t('lobby.community_btn')}
        </button>
      </section>

    </div>
  );
}
