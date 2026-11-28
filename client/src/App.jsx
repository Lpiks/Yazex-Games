import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import ChallengeTicker from './components/ChallengeTicker';
import PromoModal from './components/PromoModal';
import ArmoryModal from './components/ArmoryModal';
import AuthModal from './components/AuthModal';
import Lobby from './pages/Lobby';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';
import UltrasRunner from './games/runner/UltrasRunner';
import TifoStudio from './games/tifo-studio/TifoStudio';
import TifoArena from './games/tifo-studio/TifoArena';
import { arcadeFetch } from './utils/arcadeApi';

const VIEW_TO_PATH = {
  lobby: '/',
  runner: '/runner',
  'tifo-studio': '/tifo-studio',
  arena: '/arena',
  leaderboard: '/leaderboard',
  rewards: '/rewards',
};

const PATH_TO_VIEW = {
  '/': 'lobby',
  '/runner': 'runner',
  '/tifo-studio': 'tifo-studio',
  '/arena': 'arena',
  '/leaderboard': 'leaderboard',
  '/rewards': 'rewards',
};

export default function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentView = PATH_TO_VIEW[location.pathname] || 'lobby';

  const setCurrentView = useCallback((view) => {
    navigate(VIEW_TO_PATH[view] || '/');
  }, [navigate]);

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const DEFAULT_PLAYER = {
    name: 'Capo_Alger',
    club: 'mca',
    coins: 250,
    lastVisited: Date.now(),
    inventory: {
      fumis: 2,
      signals: 1,
      revives: 1,
      unlockedPyro: ['red'],
      activePyro: 'red',
    },
  };

  const [playerData, setPlayerData] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_player');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastVisited && (Date.now() - parsed.lastVisited > SEVEN_DAYS_MS)) {
          localStorage.removeItem('yazex_player');
          localStorage.removeItem('yazex_highscores');
          return { ...DEFAULT_PLAYER, lastVisited: Date.now() };
        }
        const inventory = {
          fumis: 2,
          signals: 1,
          revives: 1,
          unlockedPyro: ['red'],
          activePyro: 'red',
          ...(parsed.inventory || {}),
        };
        return { ...DEFAULT_PLAYER, ...parsed, inventory, lastVisited: Date.now() };
      }
      return DEFAULT_PLAYER;
    } catch {
      return DEFAULT_PLAYER;
    }
  });

  const [authUser, setAuthUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState({ isActive: false, title: '' });
  const [myTifos, setMyTifos] = useState([]);
  const [arcadeMaintenance, setArcadeMaintenance] = useState({ active: false, message: '' });

  // Check separate Arcade Maintenance mode from Yazix Ship Settings
  useEffect(() => {
    const shopApi = import.meta.env.VITE_SHOP_API_URL || 'http://localhost:5000/api';
    fetch(`${shopApi}/settings/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.success && res.data?.arcadeMaintenanceMode) {
          setArcadeMaintenance({ active: true, message: res.data.arcadeMaintenanceMessage });
        }
      })
      .catch(() => {});
  }, []);

  const [highScores, setHighScores] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_highscores');
      return saved ? JSON.parse(saved) : { runner: 0 };
    } catch {
      return { runner: 0 };
    }
  });

  const [communityTifos, setCommunityTifos] = useState(() => {
    try {
      const saved = localStorage.getItem('yazex_community_tifos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync ?club= & ?lang= params from Yazix Ship
  useEffect(() => {
    const clubParam = searchParams.get('club');
    if (clubParam) {
      setPlayerData((prev) => ({ ...prev, club: clubParam.toLowerCase() }));
    }
    const langParam = searchParams.get('lang');
    if (langParam && ['fr', 'en', 'ar'].includes(langParam)) {
      i18n.changeLanguage(langParam);
      localStorage.setItem('yazex_arcade_lang', langParam);
    }
  }, [searchParams, i18n]);

  // Apply RTL/LTR direction based on active language
  useEffect(() => {
    const isAr = i18n.language?.startsWith('ar');
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'fr';
  }, [i18n.language]);

  // Hydrate authenticated player from backend
  useEffect(() => {
    arcadeFetch('/auth/me')
      .then((res) => {
        if (res.success && res.data) {
          setAuthUser(res.data);
          setPlayerData((prev) => ({
            ...prev,
            name: res.data.pseudo,
            club: res.data.club || prev.club,
            coins: res.data.coins ?? prev.coins,
          }));
          if (res.data.bestRunnerScore > (highScores.runner || 0)) {
            setHighScores((prev) => ({ ...prev, runner: res.data.bestRunnerScore }));
          }
        }
      })
      .catch(() => {
        // Not logged in — keep guest mode
      });
  }, []);

  // Load community Tifos + activeChallenge from backend
  useEffect(() => {
    arcadeFetch('/tifo')
      .then((res) => {
        if (res.success) {
          if (res.activeChallenge) setActiveChallenge(res.activeChallenge);
          if (Array.isArray(res.data)) {
            setCommunityTifos(
              res.data.map((t) => ({
                id: t._id,
                title: t.title,
                author: t.pseudo,
                club: t.club,
                votes: t.votes,
                previewImg: t.previewDataUrl,
                isWinner: t.isWinner,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load player's saved draft/submitted Tifos when logged in
  useEffect(() => {
    if (!authUser) {
      setMyTifos([]);
      return;
    }
    arcadeFetch('/tifo/my')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setMyTifos(res.data);
      })
      .catch(() => {});
  }, [authUser]);

  useEffect(() => {
    try {
      localStorage.setItem('yazex_community_tifos', JSON.stringify(communityTifos.slice(0, 12)));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [communityTifos]);

  const [promoModal, setPromoModal] = useState({
    isOpen: false,
    promoCode: '',
    discountText: '',
    title: '',
  });

  const [isArmoryOpen, setIsArmoryOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem('yazex_player', JSON.stringify({
        ...playerData,
        lastVisited: Date.now(),
      }));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [playerData]);

  useEffect(() => {
    try {
      localStorage.setItem('yazex_highscores', JSON.stringify(highScores));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [highScores]);

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
    setPlayerData((prev) => ({
      ...prev,
      name: user.pseudo,
      club: user.club || prev.club,
      coins: user.coins ?? prev.coins,
    }));
    if (user.bestRunnerScore > (highScores.runner || 0)) {
      setHighScores((prev) => ({ ...prev, runner: user.bestRunnerScore }));
    }
  };

  const handleLogout = async () => {
    try {
      await arcadeFetch('/auth/logout', { method: 'POST' });
    } catch {}
    setAuthUser(null);
  };

  const handleRewardUnlocked = (code, discount, title) => {
    setPromoModal({
      isOpen: true,
      promoCode: code,
      discountText: discount,
      title,
    });
  };

  // Sync Runner score + telemetry + runToken with backend when logged in
  const handleRunnerScore = async (updaterOrPayload) => {
    const payload = typeof updaterOrPayload === 'function'
      ? updaterOrPayload(highScores)
      : (updaterOrPayload || {});
    const runScore = payload.runScore ?? payload.runner ?? 0;
    const runnerScore = Math.max(highScores.runner || 0, payload.runner ?? runScore);
    setHighScores({ runner: runnerScore });
    if (!authUser) return;
    try {
      const res = await arcadeFetch('/game/runner/score', {
        method: 'POST',
        body: JSON.stringify({
          score: runScore,
          coinsEarned: payload.coinsEarned ?? 0,
          jumps: payload.jumps ?? 0,
          ducks: payload.ducks ?? 0,
          runToken: payload.runToken || ''
        }),
      });
      if (res.success && res.data) {
        setAuthUser((prev) => (prev ? { ...prev, ...res.data } : prev));
        if (res.data.newReward) {
          handleRewardUnlocked(
            res.data.newReward.code,
            `Réduction -${res.data.newReward.value}% sur Yazix Ship`,
            'CODE PROMO DÉBLOQUÉ !'
          );
        }
      }
    } catch {}
  };

  const handleTifoSubmit = async (newTifo, mode = 'submit') => {
    if (mode === 'submit' && activeChallenge?.isActive) {
      setCommunityTifos((prev) => [newTifo, ...prev]);
    }
    if (authUser) {
      try {
        const res = await arcadeFetch('/tifo', {
          method: 'POST',
          body: JSON.stringify({
            title: newTifo.title || 'Tifo Virage',
            club: newTifo.club || playerData.club,
            previewDataUrl: newTifo.previewImg || newTifo.previewUrl || '',
            mode,
          }),
        });
        if (res.success && res.data) {
          setMyTifos((prev) => [res.data, ...prev]);
        }
      } catch {}
    } else {
      // Guest fallback: save draft locally in myTifos
      setMyTifos((prev) => [{ _id: String(newTifo.id), title: newTifo.title, club: newTifo.club, previewDataUrl: newTifo.previewImg, status: 'draft' }, ...prev]);
    }
    setTimeout(() => {
      navigate('/arena');
    }, 900);
  };

  const handlePublishDraft = async (tifoId) => {
    if (!authUser) {
      setIsAuthOpen(true);
      return;
    }
    const res = await arcadeFetch(`/tifo/${tifoId}/publish`, { method: 'POST' });
    if (res.success && res.data) {
      setMyTifos((prev) => prev.map((t) => (t._id === tifoId ? res.data : t)));
      setCommunityTifos((prev) => [
        {
          id: res.data._id,
          title: res.data.title,
          author: res.data.pseudo,
          club: res.data.club,
          votes: res.data.votes,
          previewImg: res.data.previewDataUrl,
        },
        ...prev,
      ]);
    }
  };

  const handleVoteTifo = async (id) => {
    if (authUser && typeof id === 'string' && id.length === 24) {
      try {
        const res = await arcadeFetch(`/tifo/${id}/vote`, { method: 'POST' });
        if (res.success) {
          setPlayerData((prev) => ({ ...prev, coins: res.data.coins }));
          return;
        }
      } catch {
        return;
      }
    }
    setPlayerData((prev) => ({ ...prev, coins: prev.coins + 25 }));
  };

  if (arcadeMaintenance.active) {
    return (
      <div className="min-h-screen bg-abyss-black text-pirate-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111216] border-2 border-pirate-gold/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <img src="/logo.jpg" alt="Yazex Arcade" className="w-16 h-16 rounded-full mx-auto border-2 border-pirate-gold object-cover" />
          <h1 className="font-heading text-3xl text-pirate-gold">⚓ ARCADE EN MAINTENANCE</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {arcadeMaintenance.message || 'Yazex Arcade est en cours de mise à jour. L’arène rouvrira très bientôt !'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-abyss-black text-pirate-paper flex flex-col font-body selection:bg-pirate-gold selection:text-pirate-dark">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        playerData={playerData}
        setPlayerData={setPlayerData}
        onOpenArmory={() => setIsArmoryOpen(true)}
        authUser={authUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <ChallengeTicker
        activeChallenge={activeChallenge}
        onJoinTifo={() => navigate('/tifo-studio')}
        onJoinRunner={() => navigate('/runner')}
      />

      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3 sm:pt-8 pb-20 md:pb-8 w-full">
        <Routes>
          <Route
            path="/"
            element={
              <Lobby
                setCurrentView={setCurrentView}
                playerData={playerData}
                highScores={highScores}
                onOpenArmory={() => setIsArmoryOpen(true)}
              />
            }
          />
          <Route
            path="/runner"
            element={
              <UltrasRunner
                onBack={() => navigate('/')}
                onRewardUnlocked={handleRewardUnlocked}
                highScores={highScores}
                setHighScores={handleRunnerScore}
                playerData={playerData}
                setPlayerData={setPlayerData}
                onOpenArmory={() => setIsArmoryOpen(true)}
              />
            }
          />
          <Route
            path="/tifo-studio"
            element={
              <TifoStudio
                onBack={() => navigate('/')}
                onTifoSubmit={handleTifoSubmit}
                initialClub={playerData.club}
                playerData={playerData}
                setPlayerData={setPlayerData}
                onOpenArmory={() => setIsArmoryOpen(true)}
                activeChallenge={activeChallenge}
              />
            }
          />
          <Route
            path="/arena"
            element={
              <TifoArena
                onBack={() => navigate('/')}
                communityTifos={communityTifos}
                onVote={handleVoteTifo}
                activeChallenge={activeChallenge}
                myTifos={myTifos}
                onPublishDraft={handlePublishDraft}
                authUser={authUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            }
          />
          <Route path="/leaderboard" element={<Leaderboard onBack={() => navigate('/')} />} />
          <Route
            path="/rewards"
            element={
              <Rewards
                authUser={authUser}
                setAuthUser={setAuthUser}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBack={() => navigate('/')}
                club={playerData.club}
              />
            }
          />
        </Routes>
      </main>

      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        playerData={playerData}
        setPlayerData={setPlayerData}
      />

      <PromoModal
        isOpen={promoModal.isOpen}
        onClose={() => setPromoModal((prev) => ({ ...prev, isOpen: false }))}
        promoCode={promoModal.promoCode}
        discountText={promoModal.discountText}
        title={promoModal.title}
        club={playerData.club}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultClub={playerData.club}
      />

      <footer className="border-t border-pirate-gold/20 bg-black/90 py-6 sm:py-8 text-center text-xs text-gray-500 font-mono mt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            🏴‍☠️ © 2026 <strong>YAZEX ARCADE</strong> • {t('footer.rights')}
          </p>
          <p className="text-pirate-gold">
            Propulsé par Stepping Stones Agency
          </p>
        </div>
      </footer>
    </div>
  );
}
