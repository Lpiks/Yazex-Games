import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Play, Upload, Palette, Layers, Film, RotateCcw, Send, Check, Eye, ArrowLeft, Flame, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

const TIFO_TYPES = [
  { id: 'chore', name: '1. Chorégraphie', desc: 'Mosaïque de feuilles & cartons colorés levés par la tribune', icon: '🟥🟩' },
  { id: 'voile', name: '2. Voile Géant (قماش)', desc: 'Bâche monumentale peinte à la main qui monte jusqu\'au toit', icon: '🏴‍☠️' },
  { id: 'mixte', name: '3. Mixte', desc: 'Voile monumental au centre entouré d\'ailes chorégraphiées', icon: '✨' },
  { id: '3d', name: '4. 3D Mobile Animé', desc: 'Éléments suspendus sur câbles avec mise en scène multi-étapes', icon: '🚀' },
];

const PALETTE_COLORS = [
  { name: 'Rouge', hex: '#E53E3E' },
  { name: 'Vert', hex: '#38A169' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#1A1A1B' },
  { name: 'Jaune', hex: '#ECC94B' },
  { name: 'Bleu', hex: '#3182CE' },
];

export default function TifoStudio({ onBack, onTifoSubmit, initialClub = 'mca' }) {
  const canvasRef = useRef(null);

  // Studio configuration states
  const [tifoType, setTifoType] = useState('mixte'); // 'chore' | 'voile' | 'mixte' | '3d'
  const [selectedColor, setSelectedColor] = useState('#E53E3E');
  const [tifoTitle, setTifoTitle] = useState('LE GRAND CRAQUAGE DE LA BAIE');
  const [voileImage, setVoileImage] = useState('/logo.jpg');
  const [object3dImage, setObject3dImage] = useState('/logo.jpg');

  // Simulation playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0); // 0 to 15 seconds
  const [submitted, setSubmitted] = useState(false);

  // Choreography Grid: 24 columns x 10 rows
  const [grid, setGrid] = useState(() => {
    // Initial pattern (Stripes)
    const initial = [];
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 24; c++) {
        row.push(c % 2 === 0 ? '#E53E3E' : '#38A169');
      }
      initial.push(row);
    }
    return initial;
  });

  // Handle cell click on the choreography grid
  const handleCellClick = (r, c) => {
    const newGrid = grid.map((row, rIdx) => 
      row.map((col, cIdx) => (rIdx === r && cIdx === c ? selectedColor : col))
    );
    setGrid(newGrid);
  };

  // Preset generators
  const applyPreset = (pattern) => {
    const newGrid = [];
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 24; c++) {
        if (pattern === 'stripes') {
          row.push(c % 2 === 0 ? '#E53E3E' : '#38A169');
        } else if (pattern === 'checkers') {
          row.push((r + c) % 2 === 0 ? '#FFFFFF' : '#E53E3E');
        } else if (pattern === 'target') {
          row.push(r > 2 && r < 7 && c > 6 && c < 17 ? '#ECC94B' : '#1A1A1B');
        }
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  // Custom image upload handler
  const handleImageUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'voile') setVoileImage(event.target.result);
        else setObject3dImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Launch 15-second stadium simulation
  const startSimulation = () => {
    setIsPlaying(true);
    setSimTime(0);
  };

  // Simulation timer
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime((prev) => {
          if (prev >= 15) {
            setIsPlaying(false);
            // Confetti finish!
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
            return 15;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Canvas 2.5D Stadium Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background: Night Stadium Atmosphere
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Stadium Floodlights (Top beams)
    const beamGrad = ctx.createLinearGradient(0, 0, 0, height);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    beamGrad.addColorStop(0.5, 'rgba(197, 163, 103, 0.08)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, width, height);

    // Light poles
    ctx.fillStyle = '#FFEAA7';
    ctx.shadowColor = '#FFEAA7';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(80, 40, 16, 0, Math.PI * 2);
    ctx.arc(width - 80, 40, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Tribune Concrete Structure (Tiered Curve)
    ctx.fillStyle = '#181920';
    ctx.fillRect(60, 90, width - 120, 310);
    ctx.strokeStyle = '#C5A367';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 90, width - 120, 310);

    // 1. RENDER CHOREOGRAPHY LAYER (Feuilles)
    const showChore = (tifoType === 'chore' || tifoType === 'mixte');
    // Choreo lift factor based on simulation time
    // If not playing, show at full state. If playing, lifts at t=2s!
    let choreoLift = !isPlaying ? 1 : Math.min(Math.max((simTime - 2) / 2, 0), 1);

    if (showChore) {
      const cellW = (width - 160) / 24;
      const cellH = 22;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 24; c++) {
          // If mixte, skip central 10 columns where the voile rises!
          if (tifoType === 'mixte' && c >= 7 && c <= 16) continue;

          const x = 80 + c * cellW;
          const y = 110 + r * 28;

          ctx.fillStyle = grid[r][c];
          ctx.globalAlpha = choreoLift;
          ctx.fillRect(x + 1, y, cellW - 2, cellH);

          // Subtle supporter head behind the sheet
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // 2. RENDER VOILE LAYER (قماش Monumental)
    const showVoile = (tifoType === 'voile' || tifoType === 'mixte');
    if (showVoile) {
      // Voile rise animation: starts at t=0s, reaches top at t=4s
      let voileProgress = !isPlaying ? 1 : Math.min(simTime / 4, 1);
      
      const voileWidth = (tifoType === 'voile') ? width - 200 : 360;
      const voileHeight = 260 * voileProgress;
      const voileX = width / 2 - voileWidth / 2;
      const voileY = 380 - voileHeight;

      if (voileHeight > 5) {
        ctx.save();
        // Drop Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 25;

        // Bâche Background with cloth texture tint
        ctx.fillStyle = '#1c1b18';
        ctx.fillRect(voileX, voileY, voileWidth, voileHeight);

        // Clip to draw uploaded image onto the cloth
        ctx.beginPath();
        ctx.rect(voileX, voileY, voileWidth, voileHeight);
        ctx.clip();

        const img = new Image();
        img.src = voileImage;
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, voileX + 15, voileY + 15, voileWidth - 30, (260 - 30));
        }

        // Fabric vertical folds simulation (Realistic قماش creases)
        for (let f = voileX; f < voileX + voileWidth; f += 25) {
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(f, voileY, 6, voileHeight);
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(f + 6, voileY, 6, voileHeight);
        }

        // Bâche Border Ropes & Golden Trim
        ctx.strokeStyle = '#C5A367';
        ctx.lineWidth = 3;
        ctx.strokeRect(voileX, voileY, voileWidth, voileHeight);

        ctx.restore();

        // Traction cables connected to the roof
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(voileX + 20, 90);
        ctx.lineTo(voileX + 20, voileY);
        ctx.moveTo(voileX + voileWidth - 20, 90);
        ctx.lineTo(voileX + voileWidth - 20, voileY);
        ctx.stroke();
      }
    }

    // 3. RENDER 3D MOBILE / FLOATING OBJECT LAYER
    const show3d = (tifoType === '3d');
    if (show3d) {
      // 3D Object rises on cables from t=1s to t=5s
      let objectProgress = !isPlaying ? 1 : Math.min(Math.max((simTime - 1) / 4, 0), 1);
      const objSize = 160;
      const objX = width / 2 - objSize / 2;
      const objY = 380 - (240 * objectProgress);

      if (objectProgress > 0) {
        ctx.save();
        // High floating shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 20;

        // Render floating cutout asset
        const objImg = new Image();
        objImg.src = object3dImage;
        if (objImg.complete && objImg.naturalWidth > 0) {
          // Circular badge or cutout
          ctx.save();
          ctx.beginPath();
          ctx.arc(objX + objSize / 2, objY + objSize / 2, objSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(objImg, objX, objY, objSize, objSize);
          ctx.restore();

          // Golden floating halo ring
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(objX + objSize / 2, objY + objSize / 2, objSize / 2 + 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // 3D Suspension Rig Cables
        ctx.strokeStyle = '#ECC94B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(objX, 80);
        ctx.lineTo(objX + 20, objY);
        ctx.moveTo(objX + objSize, 80);
        ctx.lineTo(objX + objSize - 20, objY);
        ctx.stroke();
      }
    }

    // 4. PYROTECHNICS & FUMIGÈNES (Craquage at t >= 7s)
    if (isPlaying && simTime >= 7) {
      const pyroIntensity = Math.min((simTime - 7) / 2, 1);
      
      // Left and right flank smoke bursts
      const smokeSpots = [
        { x: 100, y: 360 },
        { x: width - 100, y: 360 },
        { x: 220, y: 370 },
        { x: width - 220, y: 370 }
      ];

      smokeSpots.forEach((spot) => {
        // Red / Orange radiant glow
        const glow = ctx.createRadialGradient(spot.x, spot.y, 5, spot.x, spot.y, 90 * pyroIntensity);
        glow.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
        glow.addColorStop(0.5, 'rgba(229, 62, 62, 0.4)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, 90 * pyroIntensity, 0, Math.PI * 2);
        ctx.fill();

        // Sparks flying
        for (let s = 0; s < 6; s++) {
          ctx.fillStyle = '#FFEAA7';
          ctx.beginPath();
          ctx.arc(
            spot.x + (Math.random() - 0.5) * 40,
            spot.y - Math.random() * 80 * pyroIntensity,
            Math.random() * 3 + 1,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
    }

    // Pitch Grass (Bottom strip)
    const grassGrad = ctx.createLinearGradient(0, 390, 0, height);
    grassGrad.addColorStop(0, '#1c4d25');
    grassGrad.addColorStop(1, '#0e2b14');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 390, width, height - 390);

    // Pitch touchline
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 410, width - 80, 40);

  }, [tifoType, grid, voileImage, object3dImage, isPlaying, simTime]);

  const handleSubmit = () => {
    setSubmitted(true);
    onTifoSubmit({
      id: Date.now(),
      title: tifoTitle,
      type: tifoType,
      author: 'Capo_Alger',
      club: initialClub,
      votes: 1,
      createdAt: 'À l\'instant',
      previewImg: voileImage
    });
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pirate-gold/20 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-pirate-gold hover:text-white font-heading text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={18} /> RETOUR AU LOBBY
        </button>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tifoTitle}
            onChange={(e) => setTifoTitle(e.target.value)}
            placeholder="Nom de ton Tifo..."
            className="bg-black/60 border border-pirate-gold/40 text-pirate-paper font-heading text-base px-4 py-2 rounded-xl focus:outline-none focus:border-pirate-gold"
          />

          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm tracking-wider font-bold shadow-gold-glow transition-all ${
              submitted 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
            }`}
          >
            {submitted ? <Check size={18} /> : <Send size={18} />}
            {submitted ? 'SOUMIS AU CONCOURS !' : 'SOUMETTRE AU VOTE'}
          </button>
        </div>
      </div>

      {/* Main 2.5D Stadium Stage Display */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-pirate-gold shadow-2xl bg-black">
        
        {/* Simulation Timeline HUD Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between bg-black/70 backdrop-blur-md border border-pirate-gold/30 px-5 py-3 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={startSimulation}
              disabled={isPlaying}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-heading text-sm tracking-wider px-4 py-2 rounded-lg shadow-fumi-glow font-bold transition-all"
            >
              <Play size={16} fill="currentColor" /> {isPlaying ? `SIMULATION (${simTime}s)` : 'LANCER LE MATCH (15s)'}
            </button>
            
            <button
              onClick={() => { setIsPlaying(false); setSimTime(0); }}
              className="p-2 rounded-lg bg-black/60 text-gray-400 hover:text-white border border-gray-700"
              title="Réinitialiser"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-xs text-gray-300">
            <span>0-4s : Déploiement Voile</span>
            <span>4-7s : Levée Choré</span>
            <span className="text-red-400 font-bold">7-15s : Craquage Pyro 🔥</span>
          </div>
        </div>

        {/* The 2.5D Stadium Canvas */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={480}
          className="w-full h-auto aspect-[10/4.8] block"
        />

        {/* Live Timeline Scrubber */}
        <div className="h-2 bg-gray-900 w-full relative">
          <div 
            className="h-full bg-gradient-to-r from-pirate-gold via-red-500 to-yellow-400 transition-all"
            style={{ width: `${(simTime / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Editor Controls & Tooling (4 Tifo Types) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Mode Selector */}
        <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-heading text-2xl text-pirate-gold tracking-wider flex items-center gap-2">
            <Layers size={20} /> 1. TYPE DE TIFO
          </h3>

          <div className="space-y-3">
            {TIFO_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTifoType(t.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  tifoType === t.id 
                    ? 'bg-pirate-gold/20 border-pirate-gold text-white shadow-gold-glow' 
                    : 'bg-black/40 border-pirate-gold/20 text-gray-400 hover:border-pirate-gold/50'
                }`}
              >
                <div className="flex items-center gap-2 font-heading text-base text-pirate-gold">
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </div>
                <p className="text-xs text-gray-400 font-body mt-1 leading-relaxed">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Dynamic Mode Tooling */}
        <div className="lg:col-span-2 bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-6 space-y-6 shadow-xl">
          
          {/* Tooling for Chorégraphie */}
          {(tifoType === 'chore' || tifoType === 'mixte') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-xl text-white tracking-wide flex items-center gap-2">
                  <Palette size={18} className="text-pirate-gold" /> GRILLE DES FEUILLES
                </h4>
                
                {/* Presets */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => applyPreset('stripes')} 
                    className="text-xs font-mono bg-black/60 border border-pirate-gold/30 px-2.5 py-1 rounded hover:text-pirate-gold"
                  >
                    Rayures
                  </button>
                  <button 
                    onClick={() => applyPreset('checkers')} 
                    className="text-xs font-mono bg-black/60 border border-pirate-gold/30 px-2.5 py-1 rounded hover:text-pirate-gold"
                  >
                    Damier
                  </button>
                  <button 
                    onClick={() => applyPreset('target')} 
                    className="text-xs font-mono bg-black/60 border border-pirate-gold/30 px-2.5 py-1 rounded hover:text-pirate-gold"
                  >
                    Cible
                  </button>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">Couleur active :</span>
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor === c.hex ? 'scale-125 border-pirate-gold shadow-md' : 'border-black/50'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Mini Interactive Pixel Grid */}
              <div className="bg-black/60 p-3 rounded-xl border border-pirate-gold/20 overflow-x-auto">
                <div className="grid grid-cols-24 gap-1 min-w-[500px]">
                  {grid.map((row, r) => 
                    row.map((color, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        style={{ backgroundColor: color }}
                        className="h-4 rounded-sm cursor-pointer hover:opacity-75 transition-opacity"
                        title={`Feuille (${r},${c})`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tooling for Voile Géant (قماش) */}
          {(tifoType === 'voile' || tifoType === 'mixte') && (
            <div className="space-y-4 pt-4 border-t border-pirate-gold/20">
              <h4 className="font-heading text-xl text-white tracking-wide flex items-center gap-2">
                <Upload size={18} className="text-pirate-gold" /> VISUEL DE LA BÂCHE GÉANTE (قماش)
              </h4>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-pirate-gold bg-black shrink-0">
                  <img src={voileImage} alt="Voile Preview" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 bg-pirate-gold text-pirate-dark font-heading text-xs tracking-wider px-4 py-2.5 rounded-lg cursor-pointer hover:bg-yellow-400 font-bold transition-all shadow-md">
                    <Upload size={14} /> CHOISIR UNE IMAGE / DESSIN IA
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'voile')} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-gray-400 font-serif">
                    Format recommandé : PNG / JPG horizontal. L'image sera automatiquement texturée avec les plis réalistes du قماش.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tooling for 3D Mobile */}
          {tifoType === '3d' && (
            <div className="space-y-4">
              <h4 className="font-heading text-xl text-white tracking-wide flex items-center gap-2">
                <Film size={18} className="text-pirate-gold" /> OBJET 3D SUSPENDU SUR CÂBLES
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-pirate-gold bg-black shrink-0">
                  <img src={object3dImage} alt="3D Object Preview" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 bg-yellow-500 text-black font-heading text-xs tracking-wider px-4 py-2.5 rounded-lg cursor-pointer hover:bg-yellow-400 font-bold transition-all shadow-md">
                    <Upload size={14} /> UPLOADER L'OBJET (PNG DÉCOUPÉ)
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, '3d')} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-gray-400 font-serif">
                    Exemples : Maillot officiel, Mascotte pirate, Trophée Coupe, Aigle. L'objet monte en 3D sur câbles pendant le décompte du virage.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
