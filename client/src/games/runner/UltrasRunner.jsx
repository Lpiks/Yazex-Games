import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, ArrowDown, ArrowUp, Volume2, VolumeX, Award, ArrowLeft, Trophy, Flame, Zap, ShoppingCart, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { drawPirateRunner } from './drawPirateRunner';
import { drawObstacle } from './drawObstacles';

export default function UltrasRunner({ onBack, onRewardUnlocked, highScores, setHighScores, playerData, setPlayerData, onOpenArmory }) {
  const canvasRef = useRef(null);
  const touchStartYRef = useRef(null);
  
  // Game states
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rewardTriggered, setRewardTriggered] = useState(false);
  const [ducking, setDucking] = useState(false);

  // In-Game Power-Ups Active States
  const [smokeActive, setSmokeActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);

  // References to keep game loop performant without React re-renders
  const gameRef = useRef({
    running: false,
    speed: 6.5,
    distance: 0,
    coinsCollected: 0,
    lastSpawnTime: 0,
    lastCoinSpawnTime: 0,
    smokeShieldUntil: 0,
    magnetUntil: 0,
    
    // Player object
    player: {
      x: 110,
      y: 280,
      width: 54,
      height: 54,
      velocityY: 0,
      gravity: 0.72,
      jumpForce: -13.5,
      isGrounded: true,
      isDucking: false,
      rotation: 0
    },

    // Parallax background offsets
    bgCityX: 0,
    bgCranesX: 0,
    bgGroundX: 0,

    // Entities
    obstacles: [],
    coinsList: [],
    particles: [],

    // Procedural stride phase (0..1)
    stridePhase: 0,
    clubId: playerData?.club || 'mca',
    lastScore: -1,
    rewardTriggered: false,
  });

  // Keep clubId synced without restarting the game loop
  useEffect(() => {
    gameRef.current.clubId = playerData?.club || 'mca';
  }, [playerData?.club]);

  // Jump action
  const handleJump = useCallback(() => {
    const g = gameRef.current;
    if (gameState !== 'playing') return;
    if (g.player.isGrounded && !g.player.isDucking) {
      g.player.velocityY = g.player.jumpForce;
      g.player.isGrounded = false;
      createParticles(g.player.x + 20, 330, '#C5A367', 6);
    }
  }, [gameState]);

  // Duck action
  const handleDuck = useCallback((isDown) => {
    const g = gameRef.current;
    if (gameState !== 'playing') return;
    g.player.isDucking = isDown;
    setDucking(isDown);
    if (isDown && !g.player.isGrounded) {
      g.player.velocityY += 6;
    }
  }, [gameState]);

  // Particle helper (capped for mobile 60 FPS)
  const createParticles = (x, y, color, count = 8, speedScale = 1) => {
    const particles = gameRef.current.particles;
    if (particles.length > 60) return;
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4 * speedScale - 2,
        vy: (Math.random() - 0.5) * 4 * speedScale - 1,
        radius: Math.random() * 3 + 2,
        color,
        alpha: 1,
        life: 0.03 + Math.random() * 0.03
      });
    }
  };

  // Activate Smoke Shield (Invincibility 6s)
  const activateSmokeShield = useCallback(() => {
    const g = gameRef.current;
    if (gameState !== 'playing' || !g.running) return;
    const inv = playerData?.inventory || {};
    if ((inv.fumis || 0) <= 0) return;

    setPlayerData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        fumis: Math.max(0, (prev.inventory?.fumis || 0) - 1)
      }
    }));

    g.smokeShieldUntil = Date.now() + 6000;
    setSmokeActive(true);
    createParticles(g.player.x + 25, g.player.y + 25, '#FF4500', 20, 2);

    setTimeout(() => {
      setSmokeActive(false);
    }, 6000);
  }, [gameState, playerData, setPlayerData]);

  // Activate Coin Magnet (Magnet Suction 8s)
  const activateCoinMagnet = useCallback(() => {
    const g = gameRef.current;
    if (gameState !== 'playing' || !g.running) return;
    const inv = playerData?.inventory || {};
    if ((inv.signals || 0) <= 0) return;

    setPlayerData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        signals: Math.max(0, (prev.inventory?.signals || 0) - 1)
      }
    }));

    g.magnetUntil = Date.now() + 8000;
    setMagnetActive(true);
    createParticles(g.player.x + 25, g.player.y + 25, '#FFD700', 25, 2);

    setTimeout(() => {
      setMagnetActive(false);
    }, 8000);
  }, [gameState, playerData, setPlayerData]);

  // Activate Revive (Second Chance)
  const handleRevive = useCallback(() => {
    const g = gameRef.current;
    const inv = playerData?.inventory || {};
    if ((inv.revives || 0) <= 0) return;

    setPlayerData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        revives: Math.max(0, (prev.inventory?.revives || 0) - 1)
      }
    }));

    // Clear obstacles close to player to prevent instant re-crash
    g.obstacles = g.obstacles.filter(o => o.x > 500);
    g.player.y = 280;
    g.player.velocityY = 0;
    g.player.isGrounded = true;
    g.player.isDucking = false;

    // 3 seconds grace invulnerability
    g.smokeShieldUntil = Date.now() + 3000;
    setSmokeActive(true);
    setTimeout(() => setSmokeActive(false), 3000);

    g.running = true;
    setGameState('playing');
    createParticles(g.player.x + 25, 280, '#FFD700', 30, 2.5);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }, [playerData, setPlayerData]);

  // Start / Restart game
  const startGame = () => {
    const g = gameRef.current;
    g.running = true;
    g.speed = 6.5;
    g.distance = 0;
    g.coinsCollected = 0;
    g.obstacles = [];
    g.coinsList = [];
    g.particles = [];
    g.player.y = 280;
    g.player.velocityY = 0;
    g.player.isGrounded = true;
    g.player.isDucking = false;
    g.smokeShieldUntil = 0;
    g.magnetUntil = 0;
    g.lastScore = -1;
    g.rewardTriggered = false;
    setSmokeActive(false);
    setMagnetActive(false);
    
    setScore(0);
    setCoins(0);
    setRewardTriggered(false);
    setGameState('playing');
  };

  // Keyboard controls listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameover') {
          startGame();
        } else {
          handleJump();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuck(true);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        activateSmokeShield();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        activateCoinMagnet();
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuck(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState, handleJump, handleDuck, activateSmokeShield, activateCoinMagnet]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      const g = gameRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const groundY = 330;

      // Clear Screen with deep night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#06070a');
      skyGrad.addColorStop(0.7, '#13141f');
      skyGrad.addColorStop(1, '#1e1b24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // --- 2.5D PARALLAX BACKGROUND LAYERS ---
      
      // Layer 1: Moon & Night Skyline of Algiers (Slowest)
      ctx.fillStyle = 'rgba(255, 234, 167, 0.14)';
      ctx.beginPath();
      ctx.arc(width - 120, 80, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFEAA7';
      ctx.beginPath();
      ctx.arc(width - 120, 80, 32, 0, Math.PI * 2);
      ctx.fill();

      // Distant Port Cranes & Silhouettes (Parallax factor: 0.15)
      ctx.fillStyle = 'rgba(20, 24, 38, 0.6)';
      for (let i = 0; i < 6; i++) {
        const xPos = ((i * 240) - (g.bgCityX * 0.15)) % (width + 240);
        const actualX = xPos < -100 ? xPos + width + 300 : xPos;
        // Crane tower
        ctx.fillRect(actualX, 170, 8, 160);
        // Crane arm
        ctx.fillRect(actualX - 30, 170, 90, 6);
        // Cable
        ctx.beginPath();
        ctx.moveTo(actualX + 45, 176);
        ctx.lineTo(actualX + 45, 210);
        ctx.strokeStyle = 'rgba(20, 24, 38, 0.6)';
        ctx.stroke();
      }

      // Layer 2: Shipping Containers & Warehouse Walls (Parallax factor: 0.5)
      for (let i = 0; i < 5; i++) {
        const xPos = ((i * 260) - (g.bgCranesX * 0.5)) % (width + 260);
        const actualX = xPos < -120 ? xPos + width + 280 : xPos;
        // Container block
        ctx.fillStyle = (i % 2 === 0) ? '#241b18' : '#142028';
        ctx.fillRect(actualX, 240, 110, 90);
        // Container stripes
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(actualX + 15, 240, 10, 90);
        ctx.fillRect(actualX + 45, 240, 10, 90);
        ctx.fillRect(actualX + 75, 240, 10, 90);
      }

      // Distant Police Flashing Lights (Atmospheric glow)
      const policeCycle = Math.floor(Date.now() / 350) % 2;
      ctx.fillStyle = policeCycle === 0 ? 'rgba(229, 62, 62, 0.15)' : 'rgba(49, 130, 206, 0.15)';
      ctx.beginPath();
      ctx.arc(width - 320, 290, 80, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3: Asphalt Ground (Fast scrolling)
      ctx.fillStyle = '#111215';
      ctx.fillRect(0, groundY, width, height - groundY);
      
      // Golden Curb Line
      ctx.fillStyle = '#C5A367';
      ctx.fillRect(0, groundY - 2, width, 4);

      // Road dash marks
      ctx.fillStyle = 'rgba(197, 163, 103, 0.25)';
      for (let i = 0; i < 12; i++) {
        const xPos = ((i * 100) - g.bgGroundX) % (width + 100);
        const actualX = xPos < -50 ? xPos + width + 100 : xPos;
        ctx.fillRect(actualX, groundY + 35, 45, 6);
      }

      // --- GAME STATE RUNNING LOGIC ---
      if (g.running) {
        g.distance += 1;
        g.bgCityX += g.speed * 0.2;
        g.bgCranesX += g.speed * 0.5;
        g.bgGroundX += g.speed;
        g.stridePhase = (g.stridePhase + g.speed * 0.0042) % 1;

        // Footstep dust or slide sparks
        const runner = g.player;
        if (runner.isGrounded && !runner.isDucking && (Math.abs(g.stridePhase - 0.08) < 0.028 || Math.abs(g.stridePhase - 0.58) < 0.028)) {
          createParticles(runner.x + runner.width / 2, groundY - 2, 'rgba(197, 163, 103, 0.65)', 2, 0.55);
        } else if (runner.isDucking && Math.random() < 0.45) {
          createParticles(runner.x + 12, groundY - 2, 'rgba(255, 160, 60, 0.75)', 2, 0.75);
        }

        // Progressive speed curve
        g.speed = 6.5 + Math.min(g.distance / 400, 6.0);

        // Update score only when integer value changes
        const currentScore = Math.floor(g.distance / 6);
        if (currentScore !== g.lastScore) {
          g.lastScore = currentScore;
          setScore(currentScore);
        }

        // Check 500 pts Reward Milestone!
        if (currentScore >= 500 && !g.rewardTriggered) {
          g.rewardTriggered = true;
          setRewardTriggered(true);
          onRewardUnlocked('YAZEX500', '-10% SUR YAZEX SHIP', 'PIRATE ULTRAS DÉVERROUILLÉ !');
        }

        // --- PLAYER PHYSICS ---
        const p = g.player;
        p.velocityY += p.gravity;
        p.y += p.velocityY;

        // Ground collision
        const currentHeight = p.isDucking ? 30 : 54;
        if (p.y + currentHeight >= groundY) {
          p.y = groundY - currentHeight;
          p.velocityY = 0;
          p.isGrounded = true;
        }

        // --- SPAWN OBSTACLES ---
        const now = Date.now();
        if (now - g.lastSpawnTime > (1400 - Math.min(g.distance / 5, 600)) + Math.random() * 800) {
          g.lastSpawnTime = now;
          
          // Random obstacle type:
          // 0: Fumigène au sol (Ground)
          // 1: Signal fusée aérien (Air / Aerial)
          // 2: Barrière de police (Ground Wide)
          const roll = Math.random();
          let type = 'fumi';
          if (roll < 0.45) type = 'fumi';
          else if (roll < 0.75) type = 'signal';
          else type = 'barrier';

          if (type === 'fumi') {
            g.obstacles.push({
              type: 'fumi',
              x: width + 40,
              y: groundY - 42,
              width: 32,
              height: 42,
              flicker: 0
            });
          } else if (type === 'signal') {
            // Aerial signal requiring DUCK!
            g.obstacles.push({
              type: 'signal',
              x: width + 50,
              y: groundY - 68, // Flotte au niveau de la tête !
              width: 44,
              height: 22,
              angle: 0.15
            });
          } else {
            // Police Barrier (Wide ground jump)
            g.obstacles.push({
              type: 'barrier',
              x: width + 40,
              y: groundY - 46,
              width: 48,
              height: 46
            });
          }
        }

        // --- SPAWN COINS ---
        if (now - g.lastCoinSpawnTime > 2200 + Math.random() * 2000) {
          g.lastCoinSpawnTime = now;
          const coinY = groundY - (Math.random() > 0.5 ? 40 : 85);
          g.coinsList.push({
            x: width + 20,
            y: coinY,
            radius: 12,
            collected: false
          });
        }
      }

      // --- DRAW & UPDATE OBSTACLES ---
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const obs = g.obstacles[i];
        if (g.running) obs.x -= g.speed;

        drawObstacle(ctx, obs, Date.now());

        if (obs.type === 'fumi' && g.running && Math.random() < 0.4) {
          createParticles(obs.x + obs.width / 2, obs.y + 5, 'rgba(229, 62, 62, 0.7)', 2, 0.5);
        } else if (obs.type === 'signal' && g.running) {
          createParticles(obs.x + obs.width + 10, obs.y + obs.height / 2, '#FFD700', 1, 1.2);
        }

        // --- COLLISION DETECTION (Strict AABB with ducking support) ---
        if (g.running) {
          const p = g.player;
          const pWidth = p.width - 10;
          const pHeight = p.isDucking ? 28 : (p.height - 8);
          const pX = p.x + 5;
          const pY = p.y + 4;

          if (
            pX < obs.x + obs.width &&
            pX + pWidth > obs.x &&
            pY < obs.y + obs.height &&
            pY + pHeight > obs.y
          ) {
            // Check if SMOKE SHIELD is active!
            const now = Date.now();
            if (now < (g.smokeShieldUntil || 0)) {
              // Pulverize obstacle!
              createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#FF4500', 14, 2);
              createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#FFEAA7', 8, 1.5);
              g.obstacles.splice(i, 1);
              continue;
            }

            // HIT! GAME OVER!
            g.running = false;
            const finalScore = Math.floor(g.distance / 6);
            setGameState('gameover');
            // Update high score
            setHighScores(prev => {
              const newBest = Math.max(prev.runner || 0, finalScore);
              return { ...prev, runner: newBest };
            });
            // Update player coins
            setPlayerData(prev => ({
              ...prev,
              coins: prev.coins + g.coinsCollected
            }));
          }
        }

        // Remove off-screen obstacles
        if (obs.x < -80) {
          g.obstacles.splice(i, 1);
        }
      }

      // --- DRAW & UPDATE COINS ---
      for (let i = g.coinsList.length - 1; i >= 0; i--) {
        const c = g.coinsList[i];
        if (g.running) {
          c.x -= g.speed;

          // Check if COIN MAGNET is active!
          const now = Date.now();
          if (now < (g.magnetUntil || 0)) {
            const p = g.player;
            const targetX = p.x + p.width / 2;
            const targetY = p.y + p.height / 2;
            const dx = targetX - c.x;
            const dy = targetY - c.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 450) {
              c.x += (dx / dist) * Math.min(dist * 0.18 + 8, 20);
              c.y += (dy / dist) * Math.min(dist * 0.18 + 8, 20);
            }
          }
        }

        // Draw animated gold coin (no shadowBlur for mobile 60 FPS)
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#B7791F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner coin skull symbol
        ctx.fillStyle = '#975A16';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', c.x, c.y);
        ctx.restore();

        // Coin collection check
        if (g.running) {
          const p = g.player;
          const dist = Math.hypot(p.x + p.width / 2 - c.x, p.y + p.height / 2 - c.y);
          if (dist < c.radius + 24) {
            g.coinsCollected += 1;
            setCoins(g.coinsCollected);
            createParticles(c.x, c.y, '#FFD700', 8, 1);
            g.coinsList.splice(i, 1);
            continue;
          }
        }

        if (c.x < -30) {
          g.coinsList.splice(i, 1);
        }
      }

      // --- DRAW & UPDATE PARTICLES ---
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.life;

        if (pt.alpha <= 0) {
          g.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- DRAW PLAYER (PROCEDURAL PIRATE ULTRAS RUNNER) ---
      const p = g.player;
      const now = Date.now();
      const hasSmokeShield = now < (g.smokeShieldUntil || 0);
      const hasCoinMagnet = now < (g.magnetUntil || 0);

      if (hasSmokeShield && Math.random() < 0.6) {
        createParticles(p.x + 10, p.y + 20, '#FF4500', 3, 0.8);
      }

      drawPirateRunner(ctx, {
        player: p,
        groundY,
        isRunning: g.running,
        stridePhase: g.stridePhase,
        clubId: g.clubId,
        hasSmokeShield,
        hasCoinMagnet,
        now,
      });

      // Loop frame
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, onRewardUnlocked, setHighScores, setPlayerData]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 md:pb-12 px-1 sm:px-0">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 py-2 pr-2 text-pirate-gold hover:text-white font-heading text-xs sm:text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={16} /> LOBBY
        </button>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 bg-gradient-to-r from-pirate-gold/20 to-yellow-600/20 hover:from-pirate-gold/30 hover:to-yellow-600/30 border border-pirate-gold/50 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-pirate-gold hover:text-white transition-all shadow-gold-glow"
            title="Ouvrir l'Armurerie du Virage"
          >
            <Flame size={13} className="text-red-500 animate-pulse" />
            <span className="font-heading tracking-wider">ARMURERIE</span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/60 border border-pirate-gold/30 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono tabular-nums">
            <Trophy size={13} className="text-yellow-400" />
            <span>RECORD : <strong>{(highScores.runner || 0).toLocaleString()} PTS</strong></span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-black/60 border border-pirate-gold/30 text-pirate-gold hover:text-white transition-colors"
            title={soundEnabled ? "Couper le son" : "Activer le son"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-pirate-gold/40 shadow-2xl bg-black select-none">
        
        {/* HUD Overlay (Score & Coins) */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-pirate-gold/40 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-4 tabular-nums">
            <div className="font-heading text-xs sm:text-2xl text-white tracking-widest">
              SCORE : <span className="text-pirate-gold font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="w-px h-3.5 sm:h-5 bg-pirate-gold/30" />
            <div className="font-heading text-xs sm:text-xl text-yellow-400 tracking-wider flex items-center gap-1">
              <Coins size={14} className="text-yellow-400 shrink-0" /> {coins.toLocaleString()}
            </div>
          </div>

          {/* High Score / Record Chase Bar */}
          {(() => {
            const best = highScores.runner || 0;
            const target = Math.max(best, 500);
            const isNewRecord = best > 0 && score > best;
            const pct = Math.min((score / target) * 100, 100);
            return (
              <div className="bg-black/80 backdrop-blur-md border border-pirate-gold/40 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-right tabular-nums">
                <span className={`text-[9px] sm:text-[11px] font-mono block ${isNewRecord ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                  {isNewRecord
                    ? `👑 NOUVEAU RECORD : ${score.toLocaleString()} pts`
                    : best > 0
                      ? `Record : ${score.toLocaleString()} / ${best.toLocaleString()} pts`
                      : `Premier palier : ${score.toLocaleString()} / 500 pts`}
                </span>
                <div className="w-24 sm:w-40 h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${isNewRecord ? 'bg-gradient-to-r from-yellow-400 to-amber-300' : 'bg-gradient-to-r from-red-600 to-yellow-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* The 2.5D Canvas Component (Fully responsive, aspect-ratio locked, touch swipe/tap support) */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={450}
          className="w-full h-auto aspect-[1000/450] block cursor-pointer bg-black touch-none"
          onTouchStart={(e) => {
            touchStartYRef.current = e.touches[0].clientY;
          }}
          onTouchMove={(e) => {
            if (touchStartYRef.current === null || gameState !== 'playing') return;
            const dy = e.touches[0].clientY - touchStartYRef.current;
            if (dy > 24) {
              handleDuck(true);
            }
          }}
          onTouchEnd={() => {
            touchStartYRef.current = null;
            if (ducking) handleDuck(false);
          }}
          onClick={() => {
            if (gameState === 'start' || gameState === 'gameover') startGame();
            else handleJump();
          }}
        />

        {/* Start Game Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3 sm:p-4 text-center space-y-2 sm:space-y-4 animate-fadeIn">
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-pirate-gold shadow-fumi-glow flex items-center justify-center bg-red-600/20">
              <Play size={20} className="text-pirate-gold translate-x-0.5 sm:w-10 sm:h-10 sm:translate-x-1" fill="currentColor" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="font-heading text-lg sm:text-5xl text-white tracking-wider">
                YAZEX ULTRAS RUNNER
              </h2>
              <p className="hidden sm:block text-gray-300 text-xs sm:text-sm max-w-xs sm:max-w-md font-body">
                Saute par-dessus les <strong>Fumigènes</strong>, glisse sous les <strong>Signaux</strong> et esquive la <strong>Police</strong>.
              </p>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading text-sm sm:text-xl tracking-wider px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-fumi-glow font-bold uppercase transition-transform hover:scale-105 active:scale-95"
            >
              TOUCHER POUR JOUER
            </button>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
              <span className="hidden lg:inline">[ESPACE] Sauter &nbsp;•&nbsp; [BAS] Glisser &nbsp;•&nbsp; [F] Fumigène &nbsp;•&nbsp; [M] Aimant</span>
              <span className="lg:hidden">Touchez pour Sauter &nbsp;•&nbsp; Glissez vers le bas ou bouton pour Esquiver</span>
            </p>
          </div>
        )}

        {/* Game Over Overlay (Full-screen modal on mobile to prevent clipping, canvas overlay on desktop) */}
        {gameState === 'gameover' && (
          <div className="fixed inset-0 z-50 sm:absolute sm:inset-0 sm:z-30 bg-black/90 sm:bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-5 sm:p-6 text-center space-y-4 sm:space-y-5 animate-fadeIn">
            <div className="w-full max-w-sm sm:max-w-none bg-pirate-dark/95 sm:bg-transparent border-2 border-pirate-gold/40 sm:border-0 rounded-2xl p-5 sm:p-0 space-y-4 sm:space-y-5 shadow-2xl sm:shadow-none flex flex-col items-center">
              <div className="space-y-1">
                <span className="text-red-500 font-heading text-sm sm:text-xl tracking-widest block uppercase animate-pulse">
                  KABSA ! INTERCEPTION DU VIRAGE
                </span>
                <h2 className="font-heading text-3xl sm:text-5xl text-white tracking-wider">
                  GAME OVER
                </h2>
              </div>

              <div className="flex items-center justify-center gap-6 sm:grid sm:grid-cols-2 sm:gap-6 bg-black/60 sm:bg-pirate-dark/80 border border-pirate-gold/30 px-6 py-3 sm:p-5 rounded-xl sm:rounded-2xl w-full max-w-xs shadow-xl tabular-nums">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-mono block">Score</span>
                  <span className="font-heading text-2xl sm:text-3xl text-pirate-gold font-bold">{score.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-pirate-gold/30 sm:hidden" />
                <div>
                  <span className="text-xs text-gray-400 uppercase font-mono block">Pièces</span>
                  <span className="font-heading text-2xl sm:text-3xl text-yellow-400 font-bold">+{coins.toLocaleString()}</span>
                </div>
              </div>

              {/* Revive Button or Armory Re-stock prompt */}
              {(playerData?.inventory?.revives || 0) > 0 ? (
                <button
                  onClick={handleRevive}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:to-amber-400 text-black font-heading text-sm sm:text-base tracking-wider px-5 py-3 rounded-xl shadow-gold-glow font-bold uppercase transition-all hover:scale-105 animate-pulse"
                >
                  <Zap size={16} fill="currentColor" /> TIRER UNE FUSÉE (RÉANIMER x{playerData?.inventory?.revives})
                </button>
              ) : (
                <button
                  onClick={onOpenArmory}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-pirate-gold/80 hover:text-white bg-black/60 border border-pirate-gold/30 px-3.5 py-2 rounded-lg transition-colors hover:border-pirate-gold"
                >
                  <ShoppingCart size={13} className="text-pirate-gold" />
                  <span>0 Fusée de secours • Recharger à l'Armurerie</span>
                </button>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <button
                  onClick={startGame}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-heading text-sm sm:text-lg tracking-wider px-5 py-3 sm:px-7 rounded-xl shadow-fumi-glow font-bold uppercase transition-all hover:scale-105"
                >
                  <RotateCcw size={16} /> NOUVELLE PARTIE
                </button>
                
                {score >= 500 && (
                  <button
                    onClick={() => onRewardUnlocked('YAZEX500', '-10% SUR YAZEX SHIP', 'PIRATE ULTRAS DÉVERROUILLÉ !')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-heading text-sm sm:text-lg tracking-wider px-5 py-3 sm:px-6 rounded-xl shadow-gold-glow font-bold uppercase transition-all"
                  >
                    <Award size={16} /> CODE PROMO
                  </button>
                )}

                <button
                  onClick={onBack}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black/70 hover:bg-white/10 text-gray-200 hover:text-white border border-pirate-gold/40 font-heading text-sm sm:text-base tracking-wider px-5 py-2.5 sm:py-3 rounded-xl transition-all"
                >
                  <ArrowLeft size={16} /> QUITTER / LOBBY
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Power-Ups HUD Action Dock (Accessible on Mobile and Desktop) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
        {/* Fumigène Button */}
        <button
          onClick={() => {
            if ((playerData?.inventory?.fumis || 0) > 0) {
              activateSmokeShield();
            } else {
              onOpenArmory();
            }
          }}
          disabled={gameState !== 'playing' && (playerData?.inventory?.fumis || 0) > 0}
          className={`relative flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl border-2 font-heading transition-all ${
            smokeActive
              ? 'bg-red-600 text-white border-yellow-400 shadow-fumi-glow animate-pulse scale-[1.02]'
              : (playerData?.inventory?.fumis || 0) > 0
                ? 'bg-black/70 hover:bg-red-950/60 border-red-500/50 text-red-400 hover:border-red-400 cursor-pointer'
                : 'bg-black/40 border-gray-800 text-gray-500 hover:border-pirate-gold/40 cursor-pointer'
          }`}
          title="Bouclier Fumigène (6s d'invincibilité)"
        >
          <Flame size={20} className={smokeActive ? 'animate-bounce text-yellow-300' : 'text-red-500'} />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-bold tracking-wider leading-tight flex items-center gap-1.5">
              <span>FUMIGÈNE</span>
              <span className="hidden lg:inline text-[10px] font-mono px-1 py-0.2 rounded bg-black/60 border border-red-500/30 text-gray-300">[F]</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono">
              {smokeActive ? (
                <span className="text-yellow-300 font-bold">INVINCIBLE !</span>
              ) : (playerData?.inventory?.fumis || 0) > 0 ? (
                <span className="text-gray-300">x{playerData?.inventory?.fumis} dispo</span>
              ) : (
                <span className="text-pirate-gold/80 hover:underline">+ Recharger</span>
              )}
            </div>
          </div>
        </button>

        {/* Signal Magnet Button */}
        <button
          onClick={() => {
            if ((playerData?.inventory?.signals || 0) > 0) {
              activateCoinMagnet();
            } else {
              onOpenArmory();
            }
          }}
          disabled={gameState !== 'playing' && (playerData?.inventory?.signals || 0) > 0}
          className={`relative flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl border-2 font-heading transition-all ${
            magnetActive
              ? 'bg-yellow-500 text-black border-white shadow-gold-glow animate-pulse scale-[1.02]'
              : (playerData?.inventory?.signals || 0) > 0
                ? 'bg-black/70 hover:bg-yellow-950/60 border-yellow-500/50 text-yellow-400 hover:border-yellow-400 cursor-pointer'
                : 'bg-black/40 border-gray-800 text-gray-500 hover:border-pirate-gold/40 cursor-pointer'
          }`}
          title="Signal Éclairant (Aimant à pièces 8s)"
        >
          <Zap size={20} className={magnetActive ? 'animate-bounce text-white' : 'text-yellow-400'} />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-bold tracking-wider leading-tight flex items-center gap-1.5">
              <span>SIGNAL</span>
              <span className="hidden lg:inline text-[10px] font-mono px-1 py-0.2 rounded bg-black/60 border border-yellow-500/30 text-gray-300">[M]</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono">
              {magnetActive ? (
                <span className="text-black font-bold">AIMANT ACTIF !</span>
              ) : (playerData?.inventory?.signals || 0) > 0 ? (
                <span className="text-gray-300">x{playerData?.inventory?.signals} dispo</span>
              ) : (
                <span className="text-pirate-gold/80 hover:underline">+ Recharger</span>
              )}
            </div>
          </div>
        </button>

        {/* Armory Quick Access Button */}
        <button
          onClick={onOpenArmory}
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border-2 border-pirate-gold/40 bg-black/70 hover:bg-pirate-dark/80 text-pirate-gold hover:text-white hover:border-pirate-gold transition-all overflow-hidden"
        >
          <ShoppingCart size={16} className="text-pirate-gold shrink-0 sm:w-[18px] sm:h-[18px]" />
          <div className="text-left min-w-0">
            <div className="text-[11px] sm:text-sm font-bold tracking-wider leading-tight truncate">
              ARMURERIE
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-gray-400 flex items-center gap-1 tabular-nums">
              <Coins size={11} className="text-yellow-400 shrink-0" />
              <span>{(playerData?.coins || 0).toLocaleString()}</span>
              <span className="hidden sm:inline">• Boutique</span>
            </div>
          </div>
        </button>
      </div>

      {/* Touch Screen Mobile & Tablet On-Screen Controls */}
      <div className="lg:hidden grid grid-cols-2 gap-3 pt-2">
        <button
          onTouchStart={() => handleDuck(true)}
          onTouchEnd={() => handleDuck(false)}
          onMouseDown={() => handleDuck(true)}
          onMouseUp={() => handleDuck(false)}
          className={`py-4 px-2 rounded-xl border-2 font-heading text-base tracking-wider flex items-center justify-center gap-1.5 transition-all select-none ${
            ducking 
              ? 'bg-yellow-500 text-black border-yellow-400 shadow-gold-glow' 
              : 'bg-black/60 border-pirate-gold/40 text-pirate-gold'
          }`}
        >
          <ArrowDown size={20} className="shrink-0" />
          <span>GLISSER</span>
        </button>

        <button
          onClick={handleJump}
          className="py-4 px-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-2 border-red-400 font-heading text-base tracking-wider flex items-center justify-center gap-1.5 shadow-fumi-glow transition-all select-none"
        >
          <ArrowUp size={20} className="shrink-0" />
          <span>SAUTER</span>
        </button>
      </div>

      {/* Rules / Legend Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-pirate-gold/20 p-4 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 font-bold shrink-0">
            🔥
          </div>
          <div>
            <strong className="text-white block font-heading text-sm">FUMIGÈNE AU SOL</strong>
            <span className="text-gray-400">Appuie sur SAUT pour bondir par-dessus.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-yellow-500/30 border border-yellow-400 flex items-center justify-center text-yellow-300 font-bold shrink-0">
            🧨
          </div>
          <div>
            <strong className="text-white block font-heading text-sm">SIGNAL AÉRIEN</strong>
            <span className="text-gray-400">Maintiens BAS pour glisser dessous !</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600/30 border border-blue-500 flex items-center justify-center text-blue-300 font-bold shrink-0">
            🚓
          </div>
          <div>
            <strong className="text-white block font-heading text-sm">BARRIÈRE 1312</strong>
            <span className="text-gray-400">Grand saut avec timing chirurgical.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
