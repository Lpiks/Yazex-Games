import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PromoModal({ isOpen, onClose, promoCode, discountText, title }) {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Trigger gold & red celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A367', '#E53E3E', '#FFD700']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Parchment Card Container */}
      <div className="relative w-full max-w-md bg-[#f0e6d2] text-[#2d1b15] rounded-xl border-4 border-double border-[#5d4037] shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
        
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#8d6e63_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none rounded-xl" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-[#5d4037] hover:text-black transition-colors p-1"
        >
          <X size={22} />
        </button>

        {/* Top Header */}
        <div className="text-center relative z-10 space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-700/10 border-2 border-red-700 text-red-700 shadow-md">
            <Sparkles size={28} className="animate-spin-slow" />
          </div>
          <h3 className="font-heading text-3xl text-red-800 tracking-wider">
            {title || "TRÉSOR DÉVERROUILLÉ !"}
          </h3>
          <p className="font-serif text-sm text-[#5d4037] italic">
            Félicitations Corsaire ! Ton exploit au virage a porté ses fruits.
          </p>
        </div>

        {/* The Reward Promo Box */}
        <div className="relative z-10 bg-white/80 border-2 border-dashed border-[#5d4037] rounded-lg p-5 text-center mb-6 shadow-inner">
          <span className="text-xs uppercase font-bold text-[#8d6e63] tracking-widest block mb-1">
            {discountText || "Réduction exclusive sur la boutique :"}
          </span>
          <div className="font-mono text-3xl font-extrabold tracking-widest text-[#2d1b15] py-1 select-all">
            {promoCode || "YAZEX500"}
          </div>
          
          <button
            onClick={handleCopy}
            className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md font-heading text-sm tracking-wider uppercase font-bold transition-all shadow-md ${
              copied 
                ? 'bg-green-700 text-white' 
                : 'bg-[#5d4037] text-[#f0e6d2] hover:bg-[#3e2723]'
            }`}
          >
            {copied ? (
              <>
                <Check size={16} /> CODE COPIÉ !
              </>
            ) : (
              <>
                <Copy size={16} /> COPIER LE CODE
              </>
            )}
          </button>
        </div>

        {/* Action Button to Yazex Shop */}
        <div className="relative z-10 text-center space-y-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-heading text-lg tracking-wider font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all uppercase"
          >
            <span>UTILISER SUR YAZEX SHIP</span>
            <ExternalLink size={18} />
          </a>
          <p className="text-[11px] text-[#8d6e63] font-serif">
            Valable sur toute la collection Ultras & goodies pirates
          </p>
        </div>

        {/* Wax Seal in the bottom right corner */}
        <div className="absolute -bottom-5 -right-5 w-16 h-16 rounded-full bg-red-900 border-4 border-red-950 shadow-xl flex items-center justify-center text-[#e0c097] font-heading text-[10px] rotate-[-12deg] pointer-events-none">
          <div className="border border-[#e0c097]/40 w-11 h-11 rounded-full flex items-center justify-center text-center leading-none tracking-widest">
            YAZEX<br />WIN
          </div>
        </div>

      </div>
    </div>
  );
}
