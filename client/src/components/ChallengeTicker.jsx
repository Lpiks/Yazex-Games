import React from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ChallengeTicker({ activeChallenge, onJoinTifo, onJoinRunner }) {
  const { t } = useTranslation();
  const tifoActive = Boolean(activeChallenge?.isActive);
  const runnerActive = Boolean(activeChallenge?.runnerPub?.isActive);
  if (!tifoActive && !runnerActive) return null;

  const parts = [];
  if (tifoActive) {
    parts.push(
      `🎨 TIFO: ${activeChallenge.title || 'TIFO CHALLENGE LIVE'}`,
      activeChallenge.prizeText ? `🏆 ${activeChallenge.prizeText}` : null,
      activeChallenge.deadline ? `⏳ ${activeChallenge.deadline}` : null
    );
  }
  if (runnerActive) {
    const rp = activeChallenge.runnerPub;
    parts.push(
      `🏃 RUNNER: ${rp.title || 'WEEKLY RUNNER CHALLENGE'}`,
      rp.prizeText ? `🎁 ${rp.prizeText}` : null,
      rp.deadline ? `⏳ ${rp.deadline}` : null
    );
  }

  const dispatchText = parts.filter(Boolean).join('   •   ');
  const deadlineText = (tifoActive ? activeChallenge.deadline : activeChallenge.runnerPub?.deadline) || '';

  return (
    <button
      type="button"
      onClick={tifoActive ? onJoinTifo : onJoinRunner}
      className="group relative block w-full h-9 bg-gradient-to-r from-[#120d08] via-[#1c140a] to-[#120d08] border-b border-pirate-gold/40 overflow-hidden shadow-md text-left"
    >
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-1.5 px-3 bg-gradient-to-r from-[#120d08] via-[#120d08] to-transparent">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/20 border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-wider">
          <Flame size={11} className="animate-pulse text-red-500" />
          LIVE
        </span>
      </div>

      <div className="h-full flex items-center overflow-hidden px-20">
        <div className="animate-pirate-marquee items-center gap-6 text-xs font-heading tracking-wider text-pirate-gold">
          <span>{dispatchText}</span>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center gap-2 px-3 bg-gradient-to-l from-[#120d08] via-[#120d08] to-transparent">
        {deadlineText && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-300 font-mono">
            <Clock size={11} className="text-pirate-gold" />
            {deadlineText}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded bg-pirate-gold text-black text-[10px] sm:text-[11px] font-bold uppercase tracking-wider group-hover:bg-yellow-400 transition-colors">
          {t('ticker.cta')} <ArrowRight size={12} />
        </span>
      </div>
    </button>
  );
}
