// Procedural 2.5D Pirate Ultras Runner character renderer

const CLUB_PALETTES = {
  mca:  { primary: '#15803D', secondary: '#DC2626', accent: '#C5A367', pants: '#18181B' },
  usma: { primary: '#B91C1C', secondary: '#18181B', accent: '#C5A367', pants: '#0F1014' },
  crb:  { primary: '#DC2626', secondary: '#F1F5F9', accent: '#C5A367', pants: '#18181B' },
  jsk:  { primary: '#CA8A04', secondary: '#15803D', accent: '#FEF08A', pants: '#18181B' },
  ess:  { primary: '#27272A', secondary: '#F8FAFC', accent: '#C5A367', pants: '#09090B' },
  csc:  { primary: '#15803D', secondary: '#18181B', accent: '#C5A367', pants: '#18181B' },
  mco:  { primary: '#DC2626', secondary: '#F8FAFC', accent: '#FACC15', pants: '#18181B' },
};

// 8-keyframe biomechanical sprint cycle:
// Front Contact -> Load -> Mid-Stance -> Push-Off -> Flight -> Back Tuck -> Swing-Through -> High-Knee Drive
const THIGH_KEYS = [ 0.72,  0.32, -0.18, -0.78, -0.55,  0.05,  0.65,  0.92];
const KNEE_KEYS  = [ 0.16,  0.42,  0.28,  0.22,  1.25,  1.65,  1.45,  0.68];
const SHOE_KEYS  = [-0.28,  0.02,  0.05,  0.48,  0.65,  0.35, -0.05, -0.22];
const ARM_KEYS   = [-0.75, -0.25,  0.25,  0.72,  0.60,  0.10, -0.45, -0.82];
const ELB_KEYS   = [ 1.15,  1.30,  1.45,  1.55,  1.45,  1.30,  1.15,  1.05];

function sampleCycle(u, keys) {
  const n = keys.length;
  const pos = (((u % 1) + 1) % 1) * n;
  const i0 = Math.floor(pos) % n;
  const i1 = (i0 + 1) % n;
  const frac = pos - Math.floor(pos);
  const smooth = (1 - Math.cos(frac * Math.PI)) * 0.5;
  return keys[i0] + (keys[i1] - keys[i0]) * smooth;
}

function drawSegment(ctx, x1, y1, x2, y2, w, fill, highlight = null) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  ctx.fillStyle = fill;
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-w * 0.3, -w / 2, len + w * 0.6, w, w / 2);
  ctx.fill();
  ctx.stroke();

  if (highlight) {
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.roundRect(0, -w * 0.36, len, w * 0.22, 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLeg(ctx, hipX, hipY, thighAng, kneeBend, shoeAng, scale, c, isBack) {
  const L1 = 15 * scale;
  const L2 = 15 * scale;
  const kx = hipX + Math.sin(thighAng) * L1;
  const ky = hipY + Math.cos(thighAng) * L1;
  const shinAng = thighAng - kneeBend;
  const fx = kx + Math.sin(shinAng) * L2;
  const fy = ky + Math.cos(shinAng) * L2;

  const pantsCol = isBack ? '#0F1014' : c.pants;
  const rim = isBack ? null : 'rgba(255,255,255,0.08)';
  drawSegment(ctx, hipX, hipY, kx, ky, 9.5 * scale, pantsCol, rim);
  drawSegment(ctx, kx, ky, fx, fy, 8 * scale, pantsCol, rim);

  // Sneaker
  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(shoeAng);
  ctx.fillStyle = isBack ? '#7F1D1D' : c.secondary;
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-4.5 * scale, -3 * scale, 16 * scale, 7.5 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(-3.5 * scale, 2.5 * scale, 14 * scale, 2.2 * scale);

  ctx.fillStyle = '#C5A367';
  ctx.fillRect(-3 * scale, -1.2 * scale, 4 * scale, 2.6 * scale);
  ctx.restore();
}

function drawArm(ctx, shX, shY, upperAng, elbowBend, scale, col, isBack) {
  const L1 = 12.5 * scale;
  const L2 = 11.5 * scale;
  const ex = shX + Math.sin(upperAng) * L1;
  const ey = shY + Math.cos(upperAng) * L1;
  const foreAng = upperAng + elbowBend;
  const hx = ex + Math.sin(foreAng) * L2;
  const hy = ey + Math.cos(foreAng) * L2;

  const rim = isBack ? null : 'rgba(255,255,255,0.14)';
  drawSegment(ctx, shX, shY, ex, ey, 7.5 * scale, col, rim);
  drawSegment(ctx, ex, ey, hx, hy, 6.5 * scale, col, rim);

  ctx.fillStyle = isBack ? '#B47B48' : '#D99B66';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(hx, hy, 4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Classic Ultras Gaiter Runner (preserved for fallback / future skin toggle).
 */
export function drawClassicPirateRunner(ctx, {
  player,
  groundY,
  isRunning,
  stridePhase,
  clubId = 'mca',
  hasSmokeShield = false,
  hasCoinMagnet = false,
  now = Date.now(),
}) {
  const c = CLUB_PALETTES[clubId] || CLUB_PALETTES.mca;
  const scale = 1.0;
  const cx = player.x + player.width / 2;
  const isDuck = player.isDucking;
  const isJump = !player.isGrounded;
  const isIdle = !isRunning && player.isGrounded && !isDuck;

  // Vertical hip position anchored to player physics
  const airLift = (groundY - (player.y + (isDuck ? 30 : player.height)));
  const bob = (isRunning && !isJump && !isDuck)
    ? Math.sin(stridePhase * Math.PI * 4 - 0.8) * 3.5
    : (isIdle ? Math.sin(now / 160) * 1.2 : 0);

  const hipX = cx;
  const hipY = (isDuck ? groundY - 10 : groundY - 32) - Math.max(0, airLift) + bob;

  ctx.save();

  // Power-up Aura
  if (hasSmokeShield || hasCoinMagnet) {
    const auraColor = hasSmokeShield ? '255, 69, 0' : '255, 215, 0';
    const grad = ctx.createRadialGradient(hipX, hipY - 12, 8, hipX, hipY - 12, 52);
    grad.addColorStop(0, `rgba(${auraColor}, 0.5)`);
    grad.addColorStop(0.6, 'rgba(197, 163, 103, 0.22)');
    grad.addColorStop(1, `rgba(${auraColor}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hipX, hipY - 12, 52, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground shadow
  const shadowScale = Math.max(0.4, 1 - airLift / 140);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.48 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(hipX + (isDuck ? 5 : 2), groundY + 1, (isDuck ? 26 : 17) * shadowScale, 3.5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kinematics per state
  let lean = 0.26;
  let legA_thigh = 0, legA_knee = 0, legA_shoe = 0;
  let legB_thigh = 0, legB_knee = 0, legB_shoe = 0;
  let armA_up = 0, armA_elb = 0, armB_up = 0, armB_elb = 0;

  if (isDuck) {
    lean = -0.68;
    legA_thigh = 1.45; legA_knee = 0.08; legA_shoe = -0.25;
    legB_thigh = 0.75; legB_knee = 1.55; legB_shoe = 0.3;
    armA_up = -1.1; armA_elb = 0.4;
    armB_up = 1.05; armB_elb = 0.45;
  } else if (isJump) {
    lean = 0.16 + Math.max(-0.15, Math.min(0.2, player.velocityY * 0.015));
    legA_thigh = 0.98; legA_knee = 1.48; legA_shoe = 0.2;
    legB_thigh = 0.48; legB_knee = 1.38; legB_shoe = 0.35;
    armA_up = -1.25; armA_elb = 0.85;
    armB_up = 0.72; armB_elb = 1.15;
  } else if (isRunning) {
    const u = stridePhase % 1;
    const uOpp = (u + 0.5) % 1;
    legA_thigh = sampleCycle(u, THIGH_KEYS);
    legA_knee  = sampleCycle(u, KNEE_KEYS);
    legA_shoe  = sampleCycle(u, SHOE_KEYS);

    legB_thigh = sampleCycle(uOpp, THIGH_KEYS);
    legB_knee  = sampleCycle(uOpp, KNEE_KEYS);
    legB_shoe  = sampleCycle(uOpp, SHOE_KEYS);

    armA_up  = sampleCycle(u, ARM_KEYS);
    armA_elb = sampleCycle(u, ELB_KEYS);
    armB_up  = sampleCycle(uOpp, ARM_KEYS);
    armB_elb = sampleCycle(uOpp, ELB_KEYS);
  } else {
    lean = 0.05;
    legA_thigh = 0.14; legA_knee = 0.1; legA_shoe = 0;
    legB_thigh = -0.14; legB_knee = 0.1; legB_shoe = 0;
    armA_up = -0.2; armA_elb = 0.55;
    armB_up = 0.25; armB_elb = 0.45;
  }

  const torsoH = 24 * scale;
  const shX = hipX + Math.sin(lean) * torsoH;
  const shY = hipY - Math.cos(lean) * torsoH;

  // Double-Ribbon Flowing Ultras Scarf
  const waveT = now * 0.015;
  const w1 = Math.sin(waveT) * 5;
  const w2 = Math.cos(waveT * 0.85) * 7;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 8.5;
  ctx.beginPath();
  ctx.moveTo(shX - 2, shY + 2);
  ctx.bezierCurveTo(shX - 15, shY + w1, shX - 28, shY + 4 + w2, shX - 40, shY + 1 - w1);
  ctx.stroke();
  ctx.strokeStyle = c.secondary;
  ctx.lineWidth = 5.5;
  ctx.stroke();
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.strokeStyle = c.primary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(shX - 2, shY + 4);
  ctx.bezierCurveTo(shX - 12, shY + 7 - w2 * 0.6, shX - 22, shY + 10 + w1 * 0.7, shX - 32, shY + 8 + w2);
  ctx.stroke();
  ctx.restore();

  // 1. Back Arm & Back Leg
  drawArm(ctx, shX - 2, shY + 3, armB_up, armB_elb, scale, c.secondary, true);
  drawLeg(ctx, hipX - 2, hipY, legB_thigh, legB_knee, legB_shoe, scale, c, true);

  // 2. Torso (Streetwear Hoodie + Draped Hood)
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(lean);

  ctx.fillStyle = '#111216';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-8 * scale, -torsoH + 2, 6.5 * scale, 4.5 * scale, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.roundRect(-10 * scale, -torsoH - 2, 20 * scale, torsoH + 4, 5.5 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(5 * scale, -torsoH, 2.8 * scale, torsoH - 2);

  // Club Chevron
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.moveTo(-9 * scale, -torsoH * 0.74);
  ctx.lineTo(0, -torsoH * 0.5);
  ctx.lineTo(9 * scale, -torsoH * 0.74);
  ctx.lineTo(9 * scale, -torsoH * 0.44);
  ctx.lineTo(0, -torsoH * 0.2);
  ctx.lineTo(-9 * scale, -torsoH * 0.44);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.fillRect(-9 * scale, -3 * scale, 18 * scale, 2.8 * scale);
  ctx.beginPath();
  ctx.arc(4 * scale, -torsoH * 0.8, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Front Leg
  drawLeg(ctx, hipX + 2, hipY, legA_thigh, legA_knee, legA_shoe, scale, c, false);

  // 4. Head + Ultras Gaiter Mask + Pirate Tricorne
  const headBob = (isRunning && !isJump && !isDuck) ? Math.sin(stridePhase * Math.PI * 4) * 1.1 : 0;
  const headX = shX + Math.sin(lean) * 10 * scale;
  const headY = shY - Math.cos(lean) * 10 * scale + headBob;

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(lean * 0.25);

  ctx.fillStyle = '#D99B66';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ultras Gaiter Mask
  ctx.fillStyle = c.secondary;
  ctx.beginPath();
  ctx.arc(0, 0, 9.5 * scale, 0.08, Math.PI - 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye & Brow
  ctx.fillStyle = '#050507';
  ctx.beginPath();
  ctx.arc(4.5 * scale, -2.2 * scale, 1.6 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(1.8 * scale, -5 * scale);
  ctx.lineTo(7.5 * scale, -3.5 * scale);
  ctx.stroke();

  // Bandana
  ctx.fillStyle = c.accent;
  ctx.fillRect(-9.5 * scale, -6.8 * scale, 19 * scale, 3 * scale);

  // Pirate Tricorne Hat
  ctx.fillStyle = '#141418';
  ctx.strokeStyle = '#C5A367';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-15 * scale, -4.5 * scale);
  ctx.quadraticCurveTo(-7 * scale, -16.5 * scale, 2 * scale, -19.5 * scale);
  ctx.quadraticCurveTo(12 * scale, -14.5 * scale, 16 * scale, -4.5 * scale);
  ctx.quadraticCurveTo(0, -7 * scale, -15 * scale, -4.5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Skull
  ctx.fillStyle = '#C5A367';
  ctx.beginPath();
  ctx.arc(3.5 * scale, -11.5 * scale, 2.7 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(2.2 * scale, -9.8 * scale, 2.6 * scale, 1.8 * scale);
  ctx.fillStyle = '#141418';
  ctx.fillRect(2.3 * scale, -12 * scale, 1 * scale, 1 * scale);
  ctx.fillRect(4 * scale, -12 * scale, 1 * scale, 1 * scale);
  ctx.restore();

  // 5. Front Arm
  drawArm(ctx, shX + 2, shY + 3, armA_up, armA_elb, scale, c.primary, false);

  ctx.restore();
}

function drawMascotArm(ctx, shX, shY, upperAng, elbowBend, scale, sleeveColor, isBack) {
  const L1 = 12.5 * scale;
  const L2 = 11.5 * scale;
  const ex = shX + Math.sin(upperAng) * L1;
  const ey = shY + Math.cos(upperAng) * L1;
  const foreAng = upperAng + elbowBend;
  const hx = ex + Math.sin(foreAng) * L2;
  const hy = ey + Math.cos(foreAng) * L2;

  const col = isBack ? '#0B0B0E' : sleeveColor;
  const rim = isBack ? null : 'rgba(255,255,255,0.14)';
  drawSegment(ctx, shX, shY, ex, ey, 6 * scale, col, rim);
  drawSegment(ctx, ex, ey, hx, hy, 5.2 * scale, col, rim);

  // Gold cuff
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(foreAng);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(-2.7 * scale, -3.3 * scale, 5.4 * scale, 1.7 * scale);
  ctx.restore();

  // Yellow Mascot Hand (empty)
  ctx.save();
  ctx.translate(hx, hy);
  const hGrad = ctx.createRadialGradient(-0.8 * scale, -0.8 * scale, 0.3 * scale, 0, 0, 3.5 * scale);
  hGrad.addColorStop(0, isBack ? '#F59E0B' : '#FFE45E');
  hGrad.addColorStop(1, isBack ? '#B45309' : '#E08E00');
  ctx.fillStyle = hGrad;
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 3.3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawAnimatedShield(ctx, cx, cy, rx, ry, now, isMagnetOnly) {
  ctx.save();
  const pulse = 1 + Math.sin(now * 0.008) * 0.04;
  const rX = rx * pulse;
  const rY = ry * pulse;

  const aura = ctx.createRadialGradient(cx, cy, rX * 0.35, cx, cy, rX * 1.25);
  aura.addColorStop(0, 'rgba(255, 160, 0, 0)');
  aura.addColorStop(0.65, isMagnetOnly ? 'rgba(234, 179, 8, 0.16)' : 'rgba(255, 90, 0, 0.16)');
  aura.addColorStop(0.9, 'rgba(251, 191, 36, 0.28)');
  aura.addColorStop(1, 'rgba(255, 69, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rX * 1.25, rY * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();

  const rot = now * 0.004;
  for (let i = 0; i < 3; i++) {
    const start = rot + (i * Math.PI * 2) / 3;
    ctx.strokeStyle = (i === 0 || isMagnetOnly) ? 'rgba(253, 224, 71, 0.9)' : 'rgba(249, 115, 22, 0.85)';
    ctx.lineWidth = i === 0 ? 2.4 : 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rX, rY, 0, start, start + 1.25);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the Yazex Pirate Smiley Mascot Runner onto the 2D canvas.
 */
export function drawPirateRunner(ctx, {
  player,
  groundY,
  isRunning,
  stridePhase,
  clubId = 'mca',
  hasSmokeShield = false,
  hasCoinMagnet = false,
  now = Date.now(),
}) {
  const c = CLUB_PALETTES[clubId] || CLUB_PALETTES.mca;
  const scale = 1.0;
  const cx = player.x + player.width / 2;
  const isDuck = player.isDucking;
  const isJump = !player.isGrounded;
  const isIdle = !isRunning && player.isGrounded && !isDuck;

  const airLift = groundY - (player.y + (isDuck ? 30 : player.height));
  const bob = (isRunning && !isJump && !isDuck)
    ? Math.sin(stridePhase * Math.PI * 4 - 0.8) * 3.2
    : (isIdle ? Math.sin(now / 160) * 1.2 : 0);

  const hipX = cx;
  const hipY = (isDuck ? groundY - 10 : groundY - 30) - Math.max(0, airLift) + bob;

  ctx.save();

  // Ground Shadow
  const shadowScale = Math.max(0.4, 1 - airLift / 140);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.48 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(hipX + (isDuck ? 5 : 2), groundY + 1, (isDuck ? 26 : 18) * shadowScale, 3.5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated Shield / Magnet Aura
  if (hasSmokeShield || hasCoinMagnet) {
    drawAnimatedShield(ctx, hipX, hipY - 10 * scale, 32 * scale, 40 * scale, now, !hasSmokeShield);
  }

  // Kinematics per state
  let lean = 0.22;
  let legA_thigh = 0, legA_knee = 0, legA_shoe = 0;
  let legB_thigh = 0, legB_knee = 0, legB_shoe = 0;
  let armA_up = 0, armA_elb = 0, armB_up = 0, armB_elb = 0;

  if (isDuck) {
    lean = -0.66;
    legA_thigh = 1.45; legA_knee = 0.08; legA_shoe = -0.25;
    legB_thigh = 0.75; legB_knee = 1.55; legB_shoe = 0.3;
    armA_up = -1.1; armA_elb = 0.4;
    armB_up = 1.05; armB_elb = 0.45;
  } else if (isJump) {
    lean = 0.16 + Math.max(-0.15, Math.min(0.2, player.velocityY * 0.015));
    legA_thigh = 0.98; legA_knee = 1.48; legA_shoe = 0.2;
    legB_thigh = 0.48; legB_knee = 1.38; legB_shoe = 0.35;
    armA_up = -1.25; armA_elb = 0.85;
    armB_up = 0.72; armB_elb = 1.15;
  } else if (isRunning) {
    const u = stridePhase % 1;
    const uOpp = (u + 0.5) % 1;
    legA_thigh = sampleCycle(u, THIGH_KEYS);
    legA_knee  = sampleCycle(u, KNEE_KEYS);
    legA_shoe  = sampleCycle(u, SHOE_KEYS);
    legB_thigh = sampleCycle(uOpp, THIGH_KEYS);
    legB_knee  = sampleCycle(uOpp, KNEE_KEYS);
    legB_shoe  = sampleCycle(uOpp, SHOE_KEYS);
    armA_up  = sampleCycle(u, ARM_KEYS);
    armA_elb = sampleCycle(u, ELB_KEYS);
    armB_up  = sampleCycle(uOpp, ARM_KEYS);
    armB_elb = sampleCycle(uOpp, ELB_KEYS);
  } else {
    lean = 0.04;
    legA_thigh = 0.12; legA_knee = 0.08; legA_shoe = 0;
    legB_thigh = -0.12; legB_knee = 0.08; legB_shoe = 0;
    armA_up = -0.18; armA_elb = 0.48;
    armB_up = 0.22; armB_elb = 0.40;
  }

  const torsoH = 24 * scale;
  const shX = hipX + Math.sin(lean) * torsoH;
  const shY = hipY - Math.cos(lean) * torsoH;

  // Gravity-aware Flowing Red Sash
  const waveT = now * 0.014;
  ctx.save();
  ctx.lineCap = 'round';
  if (isIdle) {
    const sway = Math.sin(waveT * 0.4) * 2;
    ctx.strokeStyle = '#050507';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(hipX - 6 * scale, hipY - 1 * scale);
    ctx.quadraticCurveTo(hipX - 10 * scale + sway, hipY + 10 * scale, hipX - 8 * scale + sway, hipY + 20 * scale);
    ctx.stroke();
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    const w1 = Math.sin(waveT) * 4.5;
    const w2 = Math.cos(waveT * 0.85) * 6;
    ctx.strokeStyle = '#050507';
    ctx.lineWidth = 7.2;
    ctx.beginPath();
    ctx.moveTo(hipX - 4 * scale, hipY - 2 * scale);
    ctx.bezierCurveTo(hipX - 15 * scale, hipY + w1, hipX - 26 * scale, hipY + 5 + w2, hipX - 36 * scale, hipY + 2 - w1);
    ctx.stroke();
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4.6;
    ctx.stroke();
    ctx.strokeStyle = '#C5A367';
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
  ctx.restore();

  // 1. Back Arm & Back Leg
  drawMascotArm(ctx, shX - 2, shY + 3, armB_up, armB_elb, scale, '#141418', true);
  drawLeg(ctx, hipX - 2, hipY, legB_thigh, legB_knee, legB_shoe, scale, c, true);

  // 2. Torso: Athletic Captain Jacket + Club Jersey V + Red Sash & Gold Buckle
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(lean);

  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-9.5 * scale, -torsoH - 2, 19 * scale, torsoH + 4, 5 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(4.8 * scale, -torsoH, 2.4 * scale, torsoH - 2);

  // Bold Club Jersey Chevron
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.moveTo(-8.5 * scale, -torsoH * 0.78);
  ctx.lineTo(0.5 * scale, -torsoH * 0.48);
  ctx.lineTo(8.5 * scale, -torsoH * 0.78);
  ctx.lineTo(8.5 * scale, -torsoH * 0.44);
  ctx.lineTo(0.5 * scale, -torsoH * 0.14);
  ctx.lineTo(-8.5 * scale, -torsoH * 0.44);
  ctx.closePath();
  ctx.fill();

  // Gold Coat Collar & Brass Buttons
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5.5 * scale, -torsoH - 1);
  ctx.lineTo(1 * scale, -torsoH * 0.62);
  ctx.lineTo(6.5 * scale, -torsoH - 1);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(4.8 * scale, -torsoH * 0.74, 1.2 * scale, 0, Math.PI * 2);
  ctx.arc(4.8 * scale, -torsoH * 0.54, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Red Sash + Gold Buckle
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-9.2 * scale, -3.6 * scale, 18.4 * scale, 3.4 * scale);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(1.5 * scale, -4.1 * scale, 4.0 * scale, 4.0 * scale);
  ctx.fillStyle = '#18181B';
  ctx.fillRect(2.5 * scale, -3.1 * scale, 2.0 * scale, 2.0 * scale);
  ctx.restore();

  // 3. Front Leg
  drawLeg(ctx, hipX + 2, hipY, legA_thigh, legA_knee, legA_shoe, scale, c, false);

  // 4. Head: Yellow Smiley Mascot + Eyepatch + Clean Smile + Snug Skull Tricorne
  const headBob = (isRunning && !isJump && !isDuck) ? Math.sin(stridePhase * Math.PI * 4) * 1.1 : 0;
  const headX = shX + Math.sin(lean) * 10 * scale;
  const headY = shY - Math.cos(lean) * 10 * scale + headBob;

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(lean * 0.22);

  const hGrad = ctx.createRadialGradient(-2 * scale, -2.5 * scale, 1.5 * scale, 0, 0, 10.2 * scale);
  hGrad.addColorStop(0, '#FFE866');
  hGrad.addColorStop(0.7, '#FFB300');
  hGrad.addColorStop(1, '#CC7000');
  ctx.fillStyle = hGrad;
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9.8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Diagonal Eyepatch Strap
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(-9.2 * scale, -3.8 * scale);
  ctx.lineTo(8.5 * scale, -5.8 * scale);
  ctx.stroke();

  // Distinct Black Eyepatch
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.ellipse(-2.0 * scale, -2.2 * scale, 2.7 * scale, 2.2 * scale, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Expressive Oval Eye + Glint
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.ellipse(5.2 * scale, -2.0 * scale, 1.5 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(5.6 * scale, -2.8 * scale, 0.55 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Clean White Smile
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4.2 * scale, 2.4 * scale);
  ctx.quadraticCurveTo(1.8 * scale, 4.2 * scale, 7.6 * scale, 1.8 * scale);
  ctx.quadraticCurveTo(2.0 * scale, 8.8 * scale, -4.2 * scale, 2.4 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snug Pirate Tricorne Hat
  ctx.fillStyle = '#181412';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-15.5 * scale, -3.8 * scale);
  ctx.quadraticCurveTo(-7 * scale, -16.5 * scale, 2 * scale, -19 * scale);
  ctx.quadraticCurveTo(12 * scale, -14.5 * scale, 16.5 * scale, -3.8 * scale);
  ctx.quadraticCurveTo(0, -6.5 * scale, -15.5 * scale, -3.8 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Clean White Skull & Crossbones
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4 * scale;
  ctx.beginPath();
  ctx.moveTo(-0.5 * scale, -13.8 * scale);
  ctx.lineTo(5.2 * scale, -8.8 * scale);
  ctx.moveTo(-0.5 * scale, -8.8 * scale);
  ctx.lineTo(5.2 * scale, -13.8 * scale);
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(2.3 * scale, -11.4 * scale, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.arc(1.5 * scale, -11.6 * scale, 0.6 * scale, 0, Math.PI * 2);
  ctx.arc(3.1 * scale, -11.6 * scale, 0.6 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Front Arm (Empty Yellow Hand)
  drawMascotArm(ctx, shX + 2, shY + 3, armA_up, armA_elb, scale, '#18181B', false);

  ctx.restore();
}
