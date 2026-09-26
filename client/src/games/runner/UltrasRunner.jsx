import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, ArrowDown, ArrowUp, Volume2, VolumeX, Sparkles, Award, ArrowLeft, Trophy, Flame, Zap, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UltrasRunner({ onBack, onRewardUnlocked, highScores, setHighScores, playerData, setPlayerData, onOpenArmory }) {
  const canvasRef = useRef(null);
  
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

    // Assets cache
    logoImg: null
  });

  // Load logo image for player sprite
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.jpg';
    img.onerror = () => { img.src = '/logo-circle.png'; };
    img.onload = () => {
      gameRef.current.logoImg = img;
    };
  }, []);

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

  // Particle helper
  const createParticles = (x, y, color, count = 8, speedScale = 1) => {
    for (let i = 0; i < count; i++) {
      gameRef.current.particles.push({
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
      ctx.fillStyle = '#FFEAA7';
      ctx.shadowColor = 'rgba(255, 234, 167, 0.4)';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(width - 120, 80, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

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

        // Progressive speed curve
        g.speed = 6.5 + Math.min(g.distance / 400, 6.0);

        // Update score
        const currentScore = Math.floor(g.distance / 6);
        setScore(currentScore);

        // Check 500 pts Reward Milestone!
        if (currentScore >= 500 && !rewardTriggered) {
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

        if (obs.type === 'fumi') {
          // FUMIGÈNE AU SOL
          // Red metallic canister
          ctx.fillStyle = '#C53030';
          ctx.fillRect(obs.x, obs.y + 12, obs.width, obs.height - 12);
          ctx.fillStyle = '#FFD700'; // Yellow collar
          ctx.fillRect(obs.x + 2, obs.y + 10, obs.width - 4, 4);

          // Intense flame & sparks
          ctx.fillStyle = '#FF4500';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + 8, 8 + Math.sin(Date.now() / 60) * 3, 0, Math.PI * 2);
          ctx.fill();

          // Dynamic 2.5D Lighting Halo
          const glowGrad = ctx.createRadialGradient(
            obs.x + obs.width / 2, obs.y, 4,
            obs.x + obs.width / 2, obs.y, 70
          );
          glowGrad.addColorStop(0, 'rgba(255, 69, 0, 0.4)');
          glowGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(obs.x - 50, obs.y - 40, obs.width + 100, obs.height + 60);

          // Emit smoke particles while running
          if (g.running && Math.random() < 0.4) {
            createParticles(obs.x + obs.width / 2, obs.y + 5, 'rgba(229, 62, 62, 0.7)', 2, 0.5);
          }

        } else if (obs.type === 'signal') {
          // SIGNAL AÉRIEN (FUSÉE DE DÉTRESSE DESCENDANTE)
          // Rocket cylinder
          ctx.save();
          ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
          ctx.rotate(-0.08);

          // Red rocket body with yellow grip
          ctx.fillStyle = '#E53E3E';
          ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
          ctx.fillStyle = '#ECC94B';
          ctx.fillRect(-obs.width / 2 + 6, -obs.height / 2, 10, obs.height);

          // Rocket tail flame
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.moveTo(obs.width / 2, -obs.height / 2 + 2);
          ctx.lineTo(obs.width / 2 + 18 + Math.random() * 8, 0);
          ctx.lineTo(obs.width / 2, obs.height / 2 - 2);
          ctx.fill();

          ctx.restore();

          // Sizzling rocket spark trail
          if (g.running) {
            createParticles(obs.x + obs.width + 10, obs.y + obs.height / 2, '#FFD700', 1, 1.2);
          }

        } else if (obs.type === 'barrier') {
          // BARRIÈRE DE POLICE (Obstacle large)
          ctx.fillStyle = '#2B6CB0'; // Police blue
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          
          // White striped pattern
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(obs.x + 8, obs.y, 8, obs.height);
          ctx.fillRect(obs.x + 28, obs.y, 8, obs.height);

          // "POLICE" Label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('1312', obs.x + 12, obs.y + 25);
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

        // Draw animated gold coin
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#B7791F';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 10;
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

      // --- DRAW PLAYER (YAZEX PIRATE MASCOT) ---
      const p = g.player;
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + (p.isDucking ? 15 : p.height / 2));

      // Duck scale or jump rotation
      if (p.isDucking) {
        ctx.scale(1.2, 0.55); // Flattened for sliding!
      } else if (!p.isGrounded) {
        ctx.rotate(p.velocityY * 0.04); // Jump tilt
      } else {
        // Subtle running bobbing
        ctx.rotate(Math.sin(Date.now() / 80) * 0.06);
      }

      // Check active power-ups
      const now = Date.now();
      const hasSmokeShield = now < (g.smokeShieldUntil || 0);
      const hasCoinMagnet = now < (g.magnetUntil || 0);

      if (hasSmokeShield) {
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 25;
        if (Math.random() < 0.6) {
          createParticles(p.x, p.y + 20, '#FF4500', 3, 0.8);
        }
      } else if (hasCoinMagnet) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 22;
      }

      // Player Base Badge & Border (Guaranteed 100% visible)
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = hasSmokeShield ? '#C53030' : hasCoinMagnet ? '#B7791F' : '#1A1A1B';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = hasSmokeShield ? '#FF4500' : hasCoinMagnet ? '#FFD700' : '#C5A367';
      ctx.stroke();

      if (g.logoImg && g.logoImg.complete && g.logoImg.naturalWidth > 0) {
        // Draw the official circular pirate logo as character sprite
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(g.logoImg, -24, -24, 48, 48);
        ctx.restore();
      } else {
        // Procedural pirate fallback (Skull & Crossbones)
        ctx.fillStyle = '#C5A367';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠️', 0, 2);
      }

      ctx.restore();

      // Loop frame
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, rewardTriggered, onRewardUnlocked, setHighScores, setPlayerData]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 md:pb-12 px-1 sm:px-0">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-pirate-gold hover:text-white font-heading text-xs sm:text-sm tracking-wider transition-colors"
        >
          <ArrowLeft size={16} /> LOBBY
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 bg-gradient-to-r from-pirate-gold/20 to-yellow-600/20 hover:from-pirate-gold/30 hover:to-yellow-600/30 border border-pirate-gold/50 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-mono text-pirate-gold hover:text-white transition-all shadow-gold-glow"
            title="Ouvrir l'Armurerie du Virage"
          >
            <Flame size={13} className="text-red-500 animate-pulse" />
            <span className="font-heading tracking-wider">ARMURERIE</span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/60 border border-pirate-gold/30 px-2.5 sm:px-3.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono">
            <Trophy size={13} className="text-yellow-400" />
            <span>RECORD : <strong>{highScores.runner || 0} PTS</strong></span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-black/60 border border-pirate-gold/30 text-pirate-gold hover:text-white transition-colors"
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
          <div className="bg-black/80 backdrop-blur-md border border-pirate-gold/40 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-4">
            <div className="font-heading text-xs sm:text-2xl text-white tracking-widest">
              SCORE : <span className="text-pirate-gold font-bold">{score}</span>
            </div>
            <div className="w-px h-3.5 sm:h-5 bg-pirate-gold/30" />
            <div className="font-heading text-xs sm:text-xl text-yellow-400 tracking-wider flex items-center gap-1">
              <span>🪙</span> {coins}
            </div>
          </div>

          {/* Reward Goal Progress Bar */}
          <div className="bg-black/80 backdrop-blur-md border border-pirate-gold/40 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-right">
            <span className="text-[9px] sm:text-[11px] font-mono text-gray-300 block">
              {score >= 500 ? "🎉 PROMO DÉVERROUILLÉ !" : `Objectif : ${score}/500 pts`}
            </span>
            <div className="w-20 sm:w-36 h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300"
                style={{ width: `${Math.min((score / 500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* The 2.5D Canvas Component (Fully responsive, aspect-ratio locked, zero horizontal cropping) */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={450}
          className="w-full h-auto aspect-[1000/450] block cursor-pointer bg-black"
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading text-xs sm:text-xl tracking-wider px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl shadow-fumi-glow font-bold uppercase transition-transform hover:scale-105 active:scale-95"
            >
              TOUCHER POUR JOUER
            </button>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
              [TAP / ESPACE] Sauter &nbsp;•&nbsp; [BOUTON BAS] Glisser &nbsp;•&nbsp; [F] Fumigène &nbsp;•&nbsp; [M] Aimant
            </p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-3 sm:p-6 text-center space-y-2 sm:space-y-5 animate-fadeIn">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-red-500 font-heading text-xs sm:text-xl tracking-widest block uppercase animate-pulse">
                KABSA ! INTERCEPTION DU VIRAGE
              </span>
              <h2 className="font-heading text-2xl sm:text-5xl text-white tracking-wider">
                GAME OVER
              </h2>
            </div>

            <div className="flex items-center justify-center gap-6 sm:grid sm:grid-cols-2 sm:gap-6 bg-pirate-dark/80 border border-pirate-gold/30 px-4 py-1.5 sm:p-5 rounded-xl sm:rounded-2xl w-auto sm:w-full max-w-xs shadow-xl">
              <div>
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase font-mono block">Score</span>
                <span className="font-heading text-xl sm:text-3xl text-pirate-gold font-bold">{score}</span>
              </div>
              <div className="w-px h-6 bg-pirate-gold/30 sm:hidden" />
              <div>
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase font-mono block">Pièces</span>
                <span className="font-heading text-xl sm:text-3xl text-yellow-400 font-bold">+{coins}</span>
              </div>
            </div>

            {/* Revive Button or Armory Re-stock prompt */}
            {(playerData?.inventory?.revives || 0) > 0 ? (
              <button
                onClick={handleRevive}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:to-amber-400 text-black font-heading text-xs sm:text-base tracking-wider px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-gold-glow font-bold uppercase transition-all hover:scale-105 animate-pulse"
              >
                <Zap size={16} fill="currentColor" /> TIRER UNE FUSÉE (RÉANIMER x{playerData?.inventory?.revives})
              </button>
            ) : (
              <button
                onClick={onOpenArmory}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-pirate-gold/80 hover:text-white bg-pirate-dark/60 border border-pirate-gold/30 px-3 py-1.5 rounded-lg transition-colors hover:border-pirate-gold"
              >
                <ShoppingCart size={13} className="text-pirate-gold" />
                <span>0 Fusée de secours • Recharger à l'Armurerie</span>
              </button>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={startGame}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white font-heading text-xs sm:text-lg tracking-wider px-4 py-2 sm:px-7 sm:py-3 rounded-xl shadow-fumi-glow font-bold uppercase transition-all hover:scale-105"
              >
                <RotateCcw size={15} /> NOUVELLE PARTIE
              </button>
              
              {score >= 500 && (
                <button
                  onClick={() => onRewardUnlocked('YAZEX500', '-10% SUR YAZEX SHIP', 'PIRATE ULTRAS DÉVERROUILLÉ !')}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-heading text-xs sm:text-lg tracking-wider px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-gold-glow font-bold uppercase transition-all"
                >
                  <Award size={15} /> CODE PROMO
                </button>
              )}
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
              <span className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 rounded bg-black/60 border border-red-500/30 text-gray-300">[F]</span>
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
              <span className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 rounded bg-black/60 border border-yellow-500/30 text-gray-300">[M]</span>
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
          className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl border-2 border-pirate-gold/40 bg-black/70 hover:bg-pirate-dark/80 text-pirate-gold hover:text-white hover:border-pirate-gold transition-all"
        >
          <ShoppingCart size={18} className="text-pirate-gold" />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-bold tracking-wider leading-tight">
              ARMURERIE
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-gray-400 flex items-center gap-1">
              <span>🪙 {playerData?.coins || 0}</span>
              <span className="hidden sm:inline">• Boutique</span>
            </div>
          </div>
        </button>
      </div>

      {/* Touch Screen Mobile On-Screen Controls */}
      <div className="sm:hidden grid grid-cols-2 gap-4 pt-2">
        <button
          onTouchStart={() => handleDuck(true)}
          onTouchEnd={() => handleDuck(false)}
          onMouseDown={() => handleDuck(true)}
          onMouseUp={() => handleDuck(false)}
          className={`py-5 rounded-xl border-2 font-heading text-xl tracking-wider flex items-center justify-center gap-2 transition-all ${
            ducking 
              ? 'bg-yellow-500 text-black border-yellow-400 shadow-gold-glow' 
              : 'bg-black/60 border-pirate-gold/40 text-pirate-gold'
          }`}
        >
          <ArrowDown size={24} /> GLISSER (DUCK)
        </button>

        <button
          onClick={handleJump}
          className="py-5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-2 border-red-400 font-heading text-xl tracking-wider flex items-center justify-center gap-2 shadow-fumi-glow transition-all"
        >
          <ArrowUp size={24} /> SAUTER (JUMP)
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
