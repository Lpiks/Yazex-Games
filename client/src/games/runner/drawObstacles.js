// Stylized 2.5D obstacle renderers for Ultras Runner

function drawFumi(ctx, obs, now) {
  const { x, y, width: w, height: h } = obs;

  // Dynamic 2.5D Lighting Halo
  const glow = ctx.createRadialGradient(x + w / 2, y + 4, 4, x + w / 2, y + 4, 65);
  glow.addColorStop(0, 'rgba(255, 70, 0, 0.45)');
  glow.addColorStop(0.5, 'rgba(229, 62, 62, 0.15)');
  glow.addColorStop(1, 'rgba(255, 70, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 4, 65, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  // Canister body
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 12, w - 8, h - 12, 3);
  ctx.fill();
  ctx.stroke();

  // Metallic highlight & black grip
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 7, y + 13, 3, h - 14);
  ctx.fillStyle = '#18181B';
  ctx.fillRect(x + 4, y + 22, w - 8, 8);

  // Gold collar
  ctx.fillStyle = '#C5A367';
  ctx.fillRect(x + 3, y + 10, w - 6, 4);

  // Flickering flame core
  const flick = Math.sin(now * 0.025) * 3;
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 10);
  ctx.quadraticCurveTo(x + w / 2, y - 10 - flick, x + w - 7, y + 10);
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 7, 4.5 + Math.sin(now * 0.035) * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSignal(ctx, obs) {
  const { x, y, width: w, height: h } = obs;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.08);

  // Rocket glow
  const glow = ctx.createRadialGradient(w / 2, 0, 2, w / 2, 0, 38);
  glow.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
  glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(w / 2, 0, 38, 0, Math.PI * 2);
  ctx.fill();

  // Tail fins
  ctx.fillStyle = '#C5A367';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 8, -h / 2 + 2);
  ctx.lineTo(w / 2 + 4, -h / 2 - 5);
  ctx.lineTo(w / 2 + 2, -h / 2 + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w / 2 - 8, h / 2 - 2);
  ctx.lineTo(w / 2 + 4, h / 2 + 5);
  ctx.lineTo(w / 2 + 2, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body tube
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 10, -h / 2 + 2, w - 12, h - 4, 2);
  ctx.fill();
  ctx.stroke();

  // Gold band
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(-4, -h / 2 + 2, 9, h - 4);

  // Pointed nose cone (facing left toward runner)
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 10, -h / 2 + 2);
  ctx.lineTo(-w / 2 - 4, 0);
  ctx.lineTo(-w / 2 + 10, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Exhaust jet
  const jet = 16 + Math.random() * 10;
  ctx.fillStyle = '#FF6B00';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 2, -5);
  ctx.lineTo(w / 2 + jet, 0);
  ctx.lineTo(w / 2 - 2, 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 2, -2.5);
  ctx.lineTo(w / 2 + jet * 0.55, 0);
  ctx.lineTo(w / 2 - 2, 2.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBarrier(ctx, obs, now) {
  const { x, y, width: w, height: h } = obs;
  const groundY = y + h;

  // Police strobe cycle (red / blue)
  const strobeRed = Math.floor(now / 220) % 2 === 0;
  const beaconCol = strobeRed ? '239, 68, 68' : '59, 130, 246';

  // Strobe halo
  const glow = ctx.createRadialGradient(x + w / 2, y - 2, 2, x + w / 2, y - 2, 48);
  glow.addColorStop(0, `rgba(${beaconCol}, 0.45)`);
  glow.addColorStop(1, `rgba(${beaconCol}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 2, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  // Steel A-frame legs
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 6);
  ctx.lineTo(x + 3, groundY);
  ctx.moveTo(x + w - 8, y + 6);
  ctx.lineTo(x + w - 3, groundY);
  ctx.stroke();

  // Foot pads
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, groundY - 3, 9, 3);
  ctx.fillRect(x + w - 9, groundY - 3, 9, 3);

  // Main barricade board
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 6, w - 4, 28, 3);
  ctx.fill();
  ctx.stroke();

  // Angled white hazard stripes (clipped to board)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 6, w - 4, 28, 3);
  ctx.clip();
  ctx.fillStyle = '#F8FAFC';
  for (let sx = -12; sx < w + 12; sx += 16) {
    ctx.beginPath();
    ctx.moveTo(x + sx, y + 34);
    ctx.lineTo(x + sx + 7, y + 34);
    ctx.lineTo(x + sx + 15, y + 6);
    ctx.lineTo(x + sx + 8, y + 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Center dark badge with 1312
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#C5A367';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x + 11, y + 13, w - 22, 14, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('1312', x + w / 2, y + 20.5);

  // Top steel rail
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(x + 1, y + 4, w - 2, 3);

  // Mounted flashing beacon on top
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(x + w / 2 - 5, y + 1, 10, 4);
  ctx.fillStyle = strobeRed ? '#EF4444' : '#3B82F6';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 1, 4.5, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

export function drawObstacle(ctx, obs, now = Date.now()) {
  if (obs.type === 'fumi') {
    drawFumi(ctx, obs, now);
  } else if (obs.type === 'signal') {
    drawSignal(ctx, obs);
  } else if (obs.type === 'barrier') {
    drawBarrier(ctx, obs, now);
  }
}
