// Shared 2.5D Stadium Tifo Renderer (used by TifoStudio & TifoArena)

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

export function getCoveredColumnsForConfig({ tifoType, voileCount = 1, voileLayout = 'center', voileScale = 'normal' }) {
  if (tifoType === 'chore' || tifoType === '3d') return new Set();

  const covered = new Set();
  if (voileCount === 1) {
    if (voileLayout === 'full') {
      for (let c = 0; c < 24; c++) covered.add(c);
    } else if (voileLayout === 'left') {
      for (let c = 0; c < 12; c++) covered.add(c);
    } else if (voileLayout === 'right') {
      for (let c = 12; c < 24; c++) covered.add(c);
    } else {
      const span = voileScale === 'large' ? 16 : voileScale === 'compact' ? 8 : 12;
      const start = Math.floor((24 - span) / 2);
      for (let c = start; c < start + span; c++) covered.add(c);
    }
  } else {
    if (voileLayout === 'dual-wings') {
      for (let c = 0; c < 7; c++) covered.add(c);
      for (let c = 17; c < 24; c++) covered.add(c);
    } else {
      for (let c = 5; c < 19; c++) covered.add(c);
    }
  }
  return covered;
}

export function makeDefaultGrid(c1 = '#E53E3E', c2 = '#38A169') {
  const initial = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 24; c++) {
      row.push(c % 2 === 0 ? c1 : c2);
    }
    initial.push(row);
  }
  return initial;
}

export function renderTifoFrame(ctx, width, height, config, { isPlaying = false, simTime = 0, isPlacingPyro = false } = {}) {
  const {
    tifoType = 'mixte',
    grid = makeDefaultGrid(),
    voileCount = 1,
    voileLayout = 'center',
    voileScale = 'normal',
    voileImage = '/logo.jpg',
    voileImage2 = '/logo-circle.png',
    object3dImage = '/logo.jpg',
    pyro = 'red',
    pyroSpots = null,
  } = config || {};

  const activePyroCfg = PYRO_CONFIGS[pyro] || PYRO_CONFIGS.red;
  const effectivePyroSpots = pyroSpots ?? activePyroCfg.spots;

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

  // Tribune Concrete Structure
  const standX = 60;
  const standWidth = width - 120;
  ctx.fillStyle = '#181920';
  ctx.fillRect(standX, 90, standWidth, 310);
  ctx.strokeStyle = '#C5A367';
  ctx.lineWidth = 2;
  ctx.strokeRect(standX, 90, standWidth, 310);

  // 1. CHOREOGRAPHY LAYER (Feuilles)
  const showChore = tifoType === 'chore' || tifoType === 'mixte';
  const choreoLift = !isPlaying ? 1 : Math.min(Math.max((simTime - 2) / 2, 0), 1);
  const coveredCols = getCoveredColumnsForConfig({ tifoType, voileCount, voileLayout, voileScale });

  if (showChore) {
    const cellW = (width - 160) / 24;
    const cellH = 22;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 24; c++) {
        if (coveredCols.has(c)) continue;

        const x = 80 + c * cellW;
        const y = 110 + r * 28;

        ctx.fillStyle = grid[r]?.[c] || '#1A1A1B';
        ctx.globalAlpha = choreoLift;
        ctx.fillRect(x + 1, y, cellW - 2, cellH);

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + cellW / 2, y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // 2. VOILE LAYER
  const showVoile = tifoType === 'voile' || tifoType === 'mixte';
  if (showVoile) {
    const voileProgress = !isPlaying ? 1 : Math.min(simTime / 4, 1);
    const voilesToDraw = [];

    if (voileCount === 1) {
      if (voileLayout === 'full') {
        voilesToDraw.push({ x: standX + 10, w: standWidth - 20, imgSrc: voileImage });
      } else if (voileLayout === 'left') {
        voilesToDraw.push({ x: standX + 15, w: standWidth * 0.48, imgSrc: voileImage });
      } else if (voileLayout === 'right') {
        const w = standWidth * 0.48;
        voilesToDraw.push({ x: standX + standWidth - w - 15, w, imgSrc: voileImage });
      } else {
        const factor = voileScale === 'large' ? 0.70 : voileScale === 'compact' ? 0.35 : 0.52;
        const w = standWidth * factor;
        voilesToDraw.push({ x: width / 2 - w / 2, w, imgSrc: voileImage });
      }
    } else {
      if (voileLayout === 'dual-wings') {
        const w = standWidth * 0.31;
        voilesToDraw.push({ x: standX + 15, w, imgSrc: voileImage });
        voilesToDraw.push({ x: standX + standWidth - w - 15, w, imgSrc: voileImage2 });
      } else {
        const gap = 16;
        const totalW = standWidth * 0.60;
        const w = (totalW - gap) / 2;
        const startX = width / 2 - totalW / 2;
        voilesToDraw.push({ x: startX, w, imgSrc: voileImage });
        voilesToDraw.push({ x: startX + w + gap, w, imgSrc: voileImage2 });
      }
    }

    voilesToDraw.forEach((v) => {
      const voileHeight = 260 * voileProgress;
      const voileY = 380 - voileHeight;

      if (voileHeight > 5) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 25;

        ctx.fillStyle = '#1c1b18';
        ctx.fillRect(v.x, voileY, v.w, voileHeight);

        ctx.beginPath();
        ctx.rect(v.x, voileY, v.w, voileHeight);
        ctx.clip();

        const img = new Image();
        img.src = v.imgSrc;
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, v.x + 10, voileY + 10, v.w - 20, 240);
        }

        for (let f = v.x; f < v.x + v.w; f += 22) {
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(f, voileY, 6, voileHeight);
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(f + 6, voileY, 6, voileHeight);
        }

        ctx.strokeStyle = '#C5A367';
        ctx.lineWidth = 3;
        ctx.strokeRect(v.x, voileY, v.w, voileHeight);
        ctx.restore();

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

  // 3. 3D MOBILE OBJECT LAYER
  if (tifoType === '3d') {
    const objectProgress = !isPlaying ? 1 : Math.min(Math.max((simTime - 1) / 4, 0), 1);
    const objSize = 160;
    const objX = width / 2 - objSize / 2;
    const objY = 380 - 240 * objectProgress;

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

  // 4. PYROTECHNICS (Craquage at t >= 7s)
  if (isPlaying && simTime >= 7) {
    const pyroIntensity = Math.min((simTime - 7) / 2, 1);

    effectivePyroSpots.forEach((spot) => {
      const glow = ctx.createRadialGradient(spot.x, spot.y, 5, spot.x, spot.y, 90 * pyroIntensity);
      glow.addColorStop(0, activePyroCfg.colors[0]);
      glow.addColorStop(0.5, activePyroCfg.colors[1]);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 90 * pyroIntensity, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < activePyroCfg.sparkCount; s++) {
        const sparkColor = activePyroCfg.sparkColors[s % activePyroCfg.sparkColors.length];
        ctx.fillStyle = sparkColor;
        ctx.beginPath();
        ctx.arc(
          spot.x + (Math.random() - 0.5) * 45,
          spot.y - Math.random() * activePyroCfg.sparkHeight * pyroIntensity,
          Math.random() * 3 + 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  } else if (isPlacingPyro && !isPlaying) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(65, 95, 870, 290);
    ctx.setLineDash([]);

    effectivePyroSpots.forEach((spot, idx) => {
      ctx.fillStyle = 'rgba(229, 62, 62, 0.35)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E53E3E';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1), spot.x, spot.y + 0.5);
    });
    ctx.restore();
  }

  // Pitch Grass
  const grassGrad = ctx.createLinearGradient(0, 390, 0, height);
  grassGrad.addColorStop(0, '#1c4d25');
  grassGrad.addColorStop(1, '#0e2b14');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 390, width, height - 390);

  // Pitch touchline
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 410, width - 80, 40);
}
