import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Play, Upload, Palette, Layers, Film, RotateCcw, Send, Check, ArrowLeft, Sliders, Type, Flame, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TIFO_PYRO_PACKS } from '../../components/ArmoryModal';

export const PYRO_CONFIGS = {
  red: {
    name: 'Rouge Braise Alger',
    spots: [{ x: 100, y: 360 }, { x: 220, y: 370 }, { x: 780, y: 370 }, { x: 900, y: 360 }],
    colors: ['rgba(255, 69, 0, 0.85)', 'rgba(229, 62, 62, 0.45)'],
    sparkColors: ['#FFEAA7', '#FF7675', '#FDCB6E'],
    sparkCount: 6,
    sparkHeight: 80
  },
  green: {
    name: 'Vert Émeraude MCA',
    spots: [{ x: 100, y: 360 }, { x: 220, y: 370 }, { x: 780, y: 370 }, { x: 900, y: 360 }],
    colors: ['rgba(46, 204, 113, 0.85)', 'rgba(39, 174, 96, 0.45)'],
    sparkColors: ['#A8E6CF', '#55EFC4', '#FFFFFF'],
    sparkCount: 6,
    sparkHeight: 85
  },
  gold: {
    name: 'Or Corsaire Yazex',
    spots: [{ x: 100, y: 360 }, { x: 220, y: 370 }, { x: 780, y: 370 }, { x: 900, y: 360 }],
    colors: ['rgba(255, 215, 0, 0.9)', 'rgba(217, 119, 6, 0.5)'],
    sparkColors: ['#FFFBEB', '#FDE047', '#F59E0B'],
    sparkCount: 8,
    sparkHeight: 90
  },
  black: {
    name: 'Fumée Noire Toxique',
    spots: [{ x: 100, y: 360 }, { x: 220, y: 370 }, { x: 780, y: 370 }, { x: 900, y: 360 }],
    colors: ['rgba(20, 20, 22, 0.95)', 'rgba(55, 65, 81, 0.65)'],
    sparkColors: ['#E2E8F0', '#94A3B8', '#F1F5F9'],
    sparkCount: 5,
    sparkHeight: 95
  },
  dual: {
    name: 'Grand Brasier (12 Foyers)',
    spots: [
      { x: 80, y: 365 }, { x: 160, y: 368 }, { x: 240, y: 370 }, { x: 320, y: 372 },
      { x: 400, y: 375 }, { x: 480, y: 375 }, { x: 520, y: 375 }, { x: 600, y: 372 },
      { x: 680, y: 370 }, { x: 760, y: 368 }, { x: 840, y: 365 }, { x: 920, y: 365 }
    ],
    colors: ['rgba(255, 69, 0, 0.9)', 'rgba(245, 158, 11, 0.5)'],
    sparkColors: ['#FEF08A', '#F97316', '#EF4444', '#FFFFFF'],
    sparkCount: 10,
    sparkHeight: 110
  }
};

const TIFO_TYPES = [
  { id: 'chore', name: '1. Chorégraphie', desc: 'Mosaïque de feuilles & cartons colorés levés par la tribune', icon: '🟥🟩' },
  { id: 'voile', name: '2. Voile Géant (قماش)', desc: 'Bâche monumentale peinte à la main qui monte jusqu\'au toit', icon: '🏴‍☠️' },
  { id: 'mixte', name: '3. Mixte', desc: 'Voile monumental entouré d\'ailes ou de cœurs chorégraphiés', icon: '✨' },
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

// 5x3 Bitmap Font for Ultras Text Stamper
const PIXEL_FONT = {
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J': [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
  'K': [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
  'O': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  'Q': [[0,1,0],[1,0,1],[1,0,1],[1,1,1],[0,1,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S': [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'V': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
  'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
};

export default function TifoStudio({ onBack, onTifoSubmit, initialClub = 'mca', playerData, setPlayerData, onOpenArmory }) {
  const canvasRef = useRef(null);

  // Studio configuration states
  const [tifoType, setTifoType] = useState('mixte'); // 'chore' | 'voile' | 'mixte' | '3d'
  const [selectedColor, setSelectedColor] = useState('#E53E3E');
  const [tifoTitle, setTifoTitle] = useState('LE GRAND CRAQUAGE DE LA BAIE');
  
  // Voile modular architecture
  const [voileCount, setVoileCount] = useState(1); // 1 or 2
  const [voileLayout, setVoileLayout] = useState('center'); // 1 voile: 'center' | 'full' | 'left' | 'right' ; 2 voiles: 'dual-wings' | 'dual-center'
  const [voileScale, setVoileScale] = useState('normal'); // 'compact' | 'normal' | 'large'
  const [voileImage, setVoileImage] = useState('/logo.jpg');
  const [voileImage2, setVoileImage2] = useState('/logo-circle.png');
  const [object3dImage, setObject3dImage] = useState('/logo.jpg');

  // Capo Text Stamper & Drag-to-paint
  const [capoText, setCapoText] = useState('MCA');
  const [isPainting, setIsPainting] = useState(false);

  // Simulation playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0); // 0 to 15 seconds
  const [submitted, setSubmitted] = useState(false);

  // Choreography Grid: 24 columns x 10 rows
  const [grid, setGrid] = useState(() => {
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

  // Calculate covered stand columns according to active voile setup
  const getCoveredColumns = useCallback(() => {
    if (tifoType === 'chore' || tifoType === '3d') return new Set();

    const covered = new Set();
    if (voileCount === 1) {
      if (voileLayout === 'full') {
        for (let c = 0; c < 24; c++) covered.add(c);
      } else if (voileLayout === 'left') {
        for (let c = 0; c < 12; c++) covered.add(c);
      } else if (voileLayout === 'right') {
        for (let c = 12; c < 24; c++) covered.add(c);
      } else { // 'center'
        const span = voileScale === 'large' ? 16 : voileScale === 'compact' ? 8 : 12;
        const start = Math.floor((24 - span) / 2);
        for (let c = start; c < start + span; c++) covered.add(c);
      }
    } else { // 2 Voiles
      if (voileLayout === 'dual-wings') {
        // Wings covered, center exposed!
        for (let c = 0; c < 7; c++) covered.add(c);
        for (let c = 17; c < 24; c++) covered.add(c);
      } else { // 'dual-center'
        for (let c = 5; c < 19; c++) covered.add(c);
      }
    }
    return covered;
  }, [tifoType, voileCount, voileLayout, voileScale]);

  // Paint a single cell if exposed
  const paintCell = (r, c) => {
    const covered = getCoveredColumns();
    if (covered.has(c)) return; // Protected under the voile
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = selectedColor;
      return next;
    });
  };

  // Preset generators (only applies to exposed columns)
  const applyPreset = (pattern) => {
    const covered = getCoveredColumns();
    setGrid(prev => {
      return prev.map((row, r) => 
        row.map((col, c) => {
          if (covered.has(c)) return col;
          if (pattern === 'stripes') return c % 2 === 0 ? '#E53E3E' : '#38A169';
          if (pattern === 'h-stripes') return r % 2 === 0 ? '#E53E3E' : '#FFFFFF';
          if (pattern === 'checkers') return (r + c) % 2 === 0 ? '#FFFFFF' : '#E53E3E';
          if (pattern === 'fill') return selectedColor;
          if (pattern === 'clear') return '#1A1A1B';
          return col;
        })
      );
    });
  };

  // Stamp Capo Text (Centered in available stand columns)
  const stampCapoText = () => {
    const text = capoText.trim().toUpperCase().slice(0, 5);
    if (!text) return;

    const covered = getCoveredColumns();
    // Find contiguous exposed columns
    const exposed = [];
    for (let c = 0; c < 24; c++) {
      if (!covered.has(c)) exposed.push(c);
    }
    if (exposed.length < 5) return;

    // Total width of text: 3 cols per char + 1 col gap between chars
    const charWidth = 3;
    const gap = 1;
    const totalTextWidth = text.length * charWidth + (text.length - 1) * gap;

    // Find center in the largest contiguous block of exposed columns
    const minC = exposed[0];
    const maxC = exposed[exposed.length - 1];
    const blockCenter = Math.floor((minC + maxC) / 2);
    const startCol = Math.max(minC, Math.floor(blockCenter - totalTextWidth / 2));
    const startRow = 2; // Vertical center on rows 2..6

    setGrid(prev => {
      const next = prev.map(row => [...row]);
      let currentCol = startCol;

      for (let ch of text) {
        const glyph = PIXEL_FONT[ch] || PIXEL_FONT[' '];
        for (let gr = 0; gr < 5; gr++) {
          for (let gc = 0; gc < 3; gc++) {
            const targetR = startRow + gr;
            const targetC = currentCol + gc;
            if (targetR < 10 && targetC < 24 && !covered.has(targetC)) {
              if (glyph[gr][gc] === 1) {
                next[targetR][targetC] = selectedColor;
              }
            }
          }
        }
        currentCol += charWidth + gap;
      }
      return next;
    });
  };

  // Custom image upload handler
  const handleImageUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'voile1') setVoileImage(event.target.result);
        else if (target === 'voile2') setVoileImage2(event.target.result);
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
    const standX = 60;
    const standWidth = width - 120;
    ctx.fillStyle = '#181920';
    ctx.fillRect(standX, 90, standWidth, 310);
    ctx.strokeStyle = '#C5A367';
    ctx.lineWidth = 2;
    ctx.strokeRect(standX, 90, standWidth, 310);

    // 1. RENDER CHOREOGRAPHY LAYER (Feuilles)
    const showChore = (tifoType === 'chore' || tifoType === 'mixte');
    let choreoLift = !isPlaying ? 1 : Math.min(Math.max((simTime - 2) / 2, 0), 1);
    const coveredCols = getCoveredColumns();

    if (showChore) {
      const cellW = (width - 160) / 24;
      const cellH = 22;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 24; c++) {
          if (coveredCols.has(c)) continue; // Hidden beneath the voile!

          const x = 80 + c * cellW;
          const y = 110 + r * 28;

          ctx.fillStyle = grid[r][c];
          ctx.globalAlpha = choreoLift;
          ctx.fillRect(x + 1, y, cellW - 2, cellH);

          // Supporter silhouette behind sheet
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // 2. RENDER VOILE LAYER (قماش Monumental: 1 ou 2 Voiles)
    const showVoile = (tifoType === 'voile' || tifoType === 'mixte');
    if (showVoile) {
      let voileProgress = !isPlaying ? 1 : Math.min(simTime / 4, 1);
      const voilesToDraw = [];

      if (voileCount === 1) {
        if (voileLayout === 'full') {
          voilesToDraw.push({ x: standX + 10, w: standWidth - 20, imgSrc: voileImage });
        } else if (voileLayout === 'left') {
          voilesToDraw.push({ x: standX + 15, w: standWidth * 0.48, imgSrc: voileImage });
        } else if (voileLayout === 'right') {
          const w = standWidth * 0.48;
          voilesToDraw.push({ x: standX + standWidth - w - 15, w: w, imgSrc: voileImage });
        } else { // center
          const factor = voileScale === 'large' ? 0.70 : voileScale === 'compact' ? 0.35 : 0.52;
          const w = standWidth * factor;
          voilesToDraw.push({ x: width / 2 - w / 2, w: w, imgSrc: voileImage });
        }
      } else { // 2 Voiles
        if (voileLayout === 'dual-wings') {
          const w = standWidth * 0.31;
          voilesToDraw.push({ x: standX + 15, w: w, imgSrc: voileImage });
          voilesToDraw.push({ x: standX + standWidth - w - 15, w: w, imgSrc: voileImage2 });
        } else { // dual-center
          const gap = 16;
          const totalW = standWidth * 0.60;
          const w = (totalW - gap) / 2;
          const startX = width / 2 - totalW / 2;
          voilesToDraw.push({ x: startX, w: w, imgSrc: voileImage });
          voilesToDraw.push({ x: startX + w + gap, w: w, imgSrc: voileImage2 });
        }
      }

      // Draw each voile onto the stand
      voilesToDraw.forEach((v) => {
        const voileHeight = 260 * voileProgress;
        const voileY = 380 - voileHeight;

        if (voileHeight > 5) {
          ctx.save();
          // Drop Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 25;

          // Bâche Background with cloth texture tint
          ctx.fillStyle = '#1c1b18';
          ctx.fillRect(v.x, voileY, v.w, voileHeight);

          // Clip to draw uploaded image onto the cloth
          ctx.beginPath();
          ctx.rect(v.x, voileY, v.w, voileHeight);
          ctx.clip();

          const img = new Image();
          img.src = v.imgSrc;
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, v.x + 10, voileY + 10, v.w - 20, (260 - 20));
          }

          // Fabric vertical folds simulation (Realistic creases)
          for (let f = v.x; f < v.x + v.w; f += 22) {
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(f, voileY, 6, voileHeight);
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(f + 6, voileY, 6, voileHeight);
          }

          // Bâche Border Ropes & Golden Trim
          ctx.strokeStyle = '#C5A367';
          ctx.lineWidth = 3;
          ctx.strokeRect(v.x, voileY, v.w, voileHeight);

          ctx.restore();

          // Traction cables connected to the roof
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(v.x + 15, 90);
          ctx.lineTo(v.x + 15, voileY);
          ctx.moveTo(v.x + v.w - 15, 90);
          ctx.lineTo(v.x + v.w - 15, voileY);
          ctx.stroke();
        }
      });
    }

    // 3. RENDER 3D MOBILE / FLOATING OBJECT LAYER
    const show3d = (tifoType === '3d');
    if (show3d) {
      let objectProgress = !isPlaying ? 1 : Math.min(Math.max((simTime - 1) / 4, 0), 1);
      const objSize = 160;
      const objX = width / 2 - objSize / 2;
      const objY = 380 - (240 * objectProgress);

      if (objectProgress > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 20;

        const objImg = new Image();
        objImg.src = object3dImage;
        if (objImg.complete && objImg.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(objX + objSize / 2, objY + objSize / 2, objSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(objImg, objX, objY, objSize, objSize);
          ctx.restore();

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
      const activeEffectId = playerData?.inventory?.activePyro || 'red';
      const pyroCfg = PYRO_CONFIGS[activeEffectId] || PYRO_CONFIGS.red;

      pyroCfg.spots.forEach((spot) => {
        const glow = ctx.createRadialGradient(spot.x, spot.y, 5, spot.x, spot.y, 90 * pyroIntensity);
        glow.addColorStop(0, pyroCfg.colors[0]);
        glow.addColorStop(0.5, pyroCfg.colors[1]);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, 90 * pyroIntensity, 0, Math.PI * 2);
        ctx.fill();

        for (let s = 0; s < pyroCfg.sparkCount; s++) {
          const sparkColor = pyroCfg.sparkColors[s % pyroCfg.sparkColors.length];
          ctx.fillStyle = sparkColor;
          ctx.beginPath();
          ctx.arc(
            spot.x + (Math.random() - 0.5) * 45,
            spot.y - Math.random() * pyroCfg.sparkHeight * pyroIntensity,
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

  }, [tifoType, grid, voileCount, voileLayout, voileScale, voileImage, voileImage2, object3dImage, isPlaying, simTime, getCoveredColumns, playerData]);

  const handleSubmit = () => {
    setSubmitted(true);
    onTifoSubmit({
      id: Date.now(),
      title: tifoTitle,
      type: tifoType,
      pyro: playerData?.inventory?.activePyro || 'red',
      author: 'Capo_Alger',
      club: initialClub,
      votes: 1,
      createdAt: 'À l\'instant',
      previewImg: voileImage
    });
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const coveredCols = getCoveredColumns();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 px-2 sm:px-0">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pirate-gold/20 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-pirate-gold hover:text-white font-heading text-xs sm:text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={16} /> RETOUR AU LOBBY
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="text"
            value={tifoTitle}
            onChange={(e) => setTifoTitle(e.target.value)}
            placeholder="Nom de ton Tifo..."
            className="bg-black/60 border border-pirate-gold/40 text-pirate-paper font-heading text-xs sm:text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-pirate-gold max-w-[200px] sm:max-w-xs"
          />

          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-heading text-xs sm:text-sm tracking-wider font-bold shadow-gold-glow transition-all ${
              submitted 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
            }`}
          >
            {submitted ? <Check size={16} /> : <Send size={16} />}
            {submitted ? 'SOUMIS !' : 'SOUMETTRE AU VOTE'}
          </button>
        </div>
      </div>

      {/* Main 2.5D Stadium Stage Display */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-pirate-gold shadow-2xl bg-black">
        
        {/* Simulation Timeline HUD Bar */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between bg-black/80 backdrop-blur-md border border-pirate-gold/30 px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={startSimulation}
              disabled={isPlaying}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-heading text-[11px] sm:text-sm tracking-wider px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg shadow-fumi-glow font-bold transition-all shrink-0"
            >
              <Play size={12} fill="currentColor" className="sm:w-3.5 sm:h-3.5 shrink-0" />
              {isPlaying ? (
                <>
                  <span className="sm:hidden">SIMU ({simTime}s)</span>
                  <span className="hidden sm:inline">SIMULATION ({simTime}s)</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">LANCER (15s)</span>
                  <span className="hidden sm:inline">LANCER LE MATCH (15s)</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => { setIsPlaying(false); setSimTime(0); }}
              className="p-1 sm:p-1.5 rounded-lg bg-black/60 text-gray-400 hover:text-white border border-gray-700 shrink-0"
              title="Réinitialiser"
            >
              <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-gray-300">
              <span>0-4s : Déploiement Voile</span>
              <span>4-7s : Levée Choré</span>
              <span className="text-red-400 font-bold">7-15s : Craquage Pyro 🔥</span>
            </div>

            <button
              onClick={onOpenArmory}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-pirate-gold/40 hover:border-pirate-gold text-pirate-gold text-[10px] sm:text-xs font-mono transition-all shadow-gold-glow shrink-0 cursor-pointer"
              title="Changer d'effet pyrotechnique à l'Armurerie"
            >
              <Flame size={12} className="text-red-500 animate-pulse" />
              <span className="font-heading">PYRO: {(PYRO_CONFIGS[playerData?.inventory?.activePyro || 'red'] || PYRO_CONFIGS.red).name}</span>
            </button>
          </div>
        </div>

        {/* The 2.5D Stadium Canvas */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={480}
          className="w-full h-auto aspect-[1000/480] block"
        />

        {/* Live Timeline Scrubber */}
        <div className="h-2 bg-gray-900 w-full relative">
          <div 
            className="h-full bg-gradient-to-r from-pirate-gold via-red-500 to-yellow-400 transition-all"
            style={{ width: `${(simTime / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Editor Controls & Tooling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tifo Mode Selector & Pyro Packs */}
        <div className="space-y-4">
          <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="font-heading text-xl text-pirate-gold tracking-wider flex items-center gap-2">
              <Layers size={18} /> 1. TYPE DE TIFO
            </h3>

            <div className="space-y-2">
              {TIFO_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTifoType(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    tifoType === t.id
                      ? 'bg-black/70 border-pirate-gold shadow-gold-glow'
                      : 'bg-black/30 border-pirate-gold/20 hover:border-pirate-gold/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.icon}</span>
                    <span className="font-heading text-sm text-white">{t.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-body leading-relaxed">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Pyrotechnics Pack Selector */}
          <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-pirate-gold/20 pb-2">
              <h3 className="font-heading text-lg text-pirate-gold tracking-wider flex items-center gap-2">
                <Flame size={17} className="text-red-500 animate-pulse" /> 2. CRAQUAGE VIRAGE
              </h3>
              <button
                onClick={onOpenArmory}
                className="text-[11px] font-mono text-pirate-gold/80 hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <ShoppingCart size={12} /> Armurerie
              </button>
            </div>

            <p className="text-[11px] text-gray-400 font-body leading-relaxed">
              Effet pyrotechnique déployé à la 7e seconde lors du coup d'envoi.
            </p>

            <div className="space-y-1.5">
              {TIFO_PYRO_PACKS.map((pack) => {
                const isUnlocked = (playerData?.inventory?.unlockedPyro || ['red']).includes(pack.id) || pack.isFree;
                const isActive = (playerData?.inventory?.activePyro || 'red') === pack.id;

                return (
                  <button
                    key={pack.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setPlayerData(prev => ({
                          ...prev,
                          inventory: {
                            ...prev.inventory,
                            activePyro: pack.id
                          }
                        }));
                      } else {
                        onOpenArmory();
                      }
                    }}
                    className={`w-full text-left p-2 rounded-xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-black/80 border-pirate-gold shadow-gold-glow'
                        : isUnlocked
                          ? 'bg-black/30 border-gray-800 hover:border-pirate-gold/50 cursor-pointer'
                          : 'bg-black/20 border-gray-900 opacity-60 hover:opacity-100 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0 shadow-sm" 
                        style={{ backgroundColor: pack.hex }}
                      />
                      <div>
                        <span className="font-heading text-xs text-white block leading-tight">
                          {pack.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {pack.badge}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className="text-[9px] font-mono font-bold text-pirate-gold px-1.5 py-0.5 rounded bg-pirate-gold/20 border border-pirate-gold/50">
                          ÉQUIPÉ
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-mono text-gray-400 hover:text-white">
                          Choisir
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-yellow-400 flex items-center gap-1">
                          🪙 {pack.cost}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right: Dynamic Tooling & Compact Grid */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* SECTION A: Voile Modular Controls (If Voile or Mixte) */}
          {(tifoType === 'voile' || tifoType === 'mixte') && (
            <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pirate-gold/20 pb-3">
                <h4 className="font-heading text-lg text-white tracking-wide flex items-center gap-2">
                  <Sliders size={18} className="text-pirate-gold" /> CONFIGURATION DU VOILE (قماش)
                </h4>

                {/* 1 or 2 Voiles Selector */}
                <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-pirate-gold/30">
                  <button
                    onClick={() => { setVoileCount(1); setVoileLayout('center'); }}
                    className={`px-3 py-1 rounded-lg font-heading text-xs transition-all ${
                      voileCount === 1 
                        ? 'bg-pirate-gold text-black font-bold shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1 VOILE UNIQUE
                  </button>
                  <button
                    onClick={() => { setVoileCount(2); setVoileLayout('dual-wings'); }}
                    className={`px-3 py-1 rounded-lg font-heading text-xs transition-all ${
                      voileCount === 2 
                        ? 'bg-pirate-gold text-black font-bold shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    2 VOILES (DUO)
                  </button>
                </div>
              </div>

              {/* Layout Presets */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-gray-400 block">Disposition sur la tribune :</span>
                
                {voileCount === 1 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'center', label: 'Centré (Classique)', icon: '🏛️' },
                      { id: 'full', label: 'Plein Virage (100%)', icon: '🏟️' },
                      { id: 'left', label: 'Flanc Gauche', icon: '⬅️' },
                      { id: 'right', label: 'Flanc Droit', icon: '➡️' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setVoileLayout(p.id)}
                        className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                          voileLayout === p.id 
                            ? 'bg-pirate-gold/20 border-pirate-gold text-pirate-gold font-bold shadow-md' 
                            : 'bg-black/40 border-gray-800 text-gray-300 hover:border-pirate-gold/40'
                        }`}
                      >
                        <span>{p.icon}</span> {p.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'dual-wings', label: 'Ailes Latérales (Gauche + Droite)', icon: '🎭', hint: 'Centre libre pour feuilles' },
                      { id: 'dual-center', label: 'Duo Côte à Côte (Centre)', icon: '👥', hint: 'Deux voiles qui se complètent' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setVoileLayout(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          voileLayout === p.id 
                            ? 'bg-pirate-gold/20 border-pirate-gold text-pirate-gold shadow-md' 
                            : 'bg-black/40 border-gray-800 text-gray-300 hover:border-pirate-gold/40'
                        }`}
                      >
                        <div className="font-heading text-xs flex items-center gap-1.5">
                          <span>{p.icon}</span> {p.label}
                        </div>
                        <span className="text-[10px] text-gray-400 block font-mono mt-0.5">{p.hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voile Width/Scale slider if 1 Voile Center */}
              {voileCount === 1 && voileLayout === 'center' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-mono text-gray-400 shrink-0">Largeur du voile :</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'compact', label: 'Compact (35%)' },
                      { id: 'normal', label: 'Classique (50%)' },
                      { id: 'large', label: 'Large (70%)' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setVoileScale(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                          voileScale === s.id
                            ? 'bg-yellow-500 text-black font-bold border-yellow-400 shadow-sm'
                            : 'bg-black/40 border-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploads (1 or 2 Voiles) */}
              <div className={`grid gap-3 pt-2 ${voileCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Voile 1 */}
                <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-pirate-gold/20">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-pirate-gold bg-black shrink-0">
                    <img src={voileImage} alt="Voile 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[11px] font-heading text-pirate-gold block uppercase truncate">
                      {voileCount === 2 ? 'Voile A (Flanc Gauche)' : 'Bâche Principale (قماش)'}
                    </span>
                    <label className="inline-flex items-center gap-1.5 bg-pirate-gold/20 hover:bg-pirate-gold text-pirate-gold hover:text-black font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors border border-pirate-gold/40">
                      <Upload size={12} /> CHANGER L'IMAGE
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'voile1')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Voile 2 (If Duo) */}
                {voileCount === 2 && (
                  <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-pirate-gold/20">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-pirate-gold bg-black shrink-0">
                      <img src={voileImage2} alt="Voile 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[11px] font-heading text-yellow-400 block uppercase truncate">
                        Voile B (Flanc Droit)
                      </span>
                      <label className="inline-flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors border border-yellow-500/40">
                        <Upload size={12} /> CHANGER L'IMAGE
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'voile2')} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION B: Choreography Grid (Compact 130px, Zero Guesswork) */}
          {(tifoType === 'chore' || tifoType === 'mixte') && (
            <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-5 space-y-3.5 shadow-xl">
              
              {/* Header with Presets & Ultras Text */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pirate-gold/20 pb-3">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-pirate-gold" />
                  <h4 className="font-heading text-lg text-white tracking-wide">
                    GRILLE DES FEUILLES
                  </h4>
                  <span className="text-[10px] font-mono bg-black/60 text-gray-400 border border-pirate-gold/20 px-2 py-0.5 rounded-full">
                    {240 - (coveredCols.size * 10)} cartons actifs
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'stripes', label: 'Bandes Vert.' },
                    { id: 'h-stripes', label: 'Bandes Horiz.' },
                    { id: 'checkers', label: 'Damier' },
                    { id: 'fill', label: 'Tout Remplir' },
                    { id: 'clear', label: 'Effacer' },
                  ].map(pr => (
                    <button
                      key={pr.id}
                      onClick={() => applyPreset(pr.id)}
                      className="text-[11px] font-mono bg-black/60 border border-pirate-gold/30 px-2 py-1 rounded hover:bg-pirate-gold hover:text-black transition-colors"
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capo Ultras Text Stamper */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-pirate-gold/20">
                <div className="flex items-center gap-2">
                  <Type size={16} className="text-yellow-400 shrink-0" />
                  <span className="text-xs font-mono text-gray-300">Écrire en tribune :</span>
                  <input
                    type="text"
                    value={capoText}
                    maxLength={5}
                    onChange={(e) => setCapoText(e.target.value.toUpperCase())}
                    placeholder="MCA"
                    className="bg-black border border-pirate-gold/40 text-pirate-gold font-heading text-sm px-2.5 py-1 rounded-lg uppercase w-20 text-center tracking-widest focus:outline-none focus:border-pirate-gold"
                  />
                  <button
                    onClick={stampCapoText}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-heading text-xs tracking-wider px-3 py-1.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
                  >
                    POSER LE TEXTE
                  </button>
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-1.5">
                  {PALETTE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        selectedColor === c.hex ? 'scale-125 border-pirate-gold shadow-gold-glow' : 'border-black/50'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stand Visual Section Indicator (Blueprint) */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-1">
                <span>◀ AILE GAUCHE</span>
                <span className="text-pirate-gold font-bold">
                  {voileLayout === 'full' 
                    ? 'TOUTE LA TRIBUNE EST RECOUVERTE PAR LA BÂCHE' 
                    : voileCount === 2 && voileLayout === 'dual-wings'
                    ? 'ZONE FEUILLES AU CŒUR DU VIRAGE (ENTRE LES 2 VOILES)'
                    : 'GLISSER LE DOIGT POUR PEINDRE COMME UN PINCEAU'}
                </span>
                <span>AILE DROITE ▶</span>
              </div>

              {/* COMPACT PIXEL GRID (130px max, 24 cols CSS) */}
              <div 
                className="bg-black/90 p-2 sm:p-3 rounded-xl border border-pirate-gold/40 shadow-inner select-none overflow-hidden"
                onPointerLeave={() => setIsPainting(false)}
                onPointerUp={() => setIsPainting(false)}
              >
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
                    gap: '2px' 
                  }}
                  className="w-full"
                >
                  {grid.map((row, r) => 
                    row.map((color, c) => {
                      const isCovered = coveredCols.has(c);
                      return (
                        <div
                          key={`${r}-${c}`}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setIsPainting(true);
                            paintCell(r, c);
                          }}
                          onPointerEnter={() => {
                            if (isPainting) paintCell(r, c);
                          }}
                          style={{ 
                            backgroundColor: isCovered ? '#0b0c10' : color,
                          }}
                          className={`h-3 sm:h-3.5 rounded-[2px] transition-all relative ${
                            isCovered 
                              ? 'opacity-25 border border-dashed border-gray-700 cursor-not-allowed' 
                              : 'cursor-pointer hover:scale-125 hover:z-20 shadow-sm'
                          }`}
                          title={isCovered ? `Feuille (${r},${c}) - Sous la bâche` : `Feuille (${r},${c})`}
                        >
                          {isCovered && r === 4 && (
                            <div className="absolute inset-0 flex items-center justify-center text-[7px] text-pirate-gold pointer-events-none">
                              •
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SECTION C: 3D Mobile Rig Controls */}
          {tifoType === '3d' && (
            <div className="bg-pirate-dark border border-pirate-gold/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <h4 className="font-heading text-lg text-white tracking-wide flex items-center gap-2">
                <Film size={18} className="text-pirate-gold" /> OBJET 3D SUSPENDU SUR CÂBLES
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-pirate-gold bg-black shrink-0">
                  <img src={object3dImage} alt="3D Object" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 bg-yellow-500 text-black font-heading text-xs tracking-wider px-4 py-2.5 rounded-lg cursor-pointer hover:bg-yellow-400 font-bold transition-all shadow-md">
                    <Upload size={14} /> UPLOADER L'OBJET (PNG DÉCOUPÉ)
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, '3d')} className="hidden" />
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
