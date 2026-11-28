const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Player = require('../models/Player');
const TifoSubmission = require('../models/TifoSubmission');
const ArcadeConfig = require('../models/ArcadeConfig');
const RunHistory = require('../models/RunHistory');
const ArcadeAuditLog = require('../models/ArcadeAuditLog');
const { requireArcadeAdmin } = require('../middleware/auth');
const { mintPromoOnShop } = require('../utils/promoBridge');

router.use(requireArcadeAdmin);

const grantFlexibleReward = async (player, { coins = 0, rewardType = 'none', value = 0, giftName = '', label = '', source = 'arcade_runner' }) => {
    const coinAmount = Math.max(0, Number(coins) || 0);
    if (coinAmount > 0) {
        player.coins += coinAmount;
    }

    let createdReward = null;
    if (rewardType === 'percent' || rewardType === 'fixed') {
        const promo = await mintPromoOnShop({
            discountType: rewardType,
            value: Math.max(1, Number(value) || 10),
            maxUses: 1,
            expiresInDays: 30,
            source,
            ownerPseudo: player.pseudo,
            note: label
        });
        createdReward = {
            code: promo.code,
            rewardType,
            discountType: promo.discountType,
            value: promo.value,
            source,
            label,
            expiresAt: promo.expiresAt
        };
        player.rewards.unshift(createdReward);
    } else if (rewardType === 'free_product') {
        const code = `GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        createdReward = {
            code,
            rewardType: 'free_product',
            discountType: 'free_product',
            value: 0,
            giftName: giftName || 'Cadeau Yazex Ship',
            source,
            label: label || `Cadeau: ${giftName || 'Yazex Ship'}`,
            claimed: false
        };
        player.rewards.unshift(createdReward);
    }

    await player.save();
    return { coinAmount, createdReward };
};

router.get('/overview', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const [totalPlayers, totalTifos, pendingTifos, flaggedRuns, flaggedPlayers, totalRuns] = await Promise.all([
            Player.countDocuments(),
            TifoSubmission.countDocuments(),
            TifoSubmission.countDocuments({ status: 'pending' }),
            RunHistory.countDocuments({ status: 'flagged' }),
            Player.countDocuments({ flaggedSuspicious: true }),
            RunHistory.countDocuments()
        ]);
        res.json({ success: true, data: { totalPlayers, totalTifos, pendingTifos, flaggedRuns, flaggedPlayers, totalRuns, config: cfg } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load overview' });
    }
});

router.get('/players', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        const flaggedOnly = req.query.flagged === 'true';
        const filter = {};
        if (q) {
            const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { pseudo: { $regex: safe, $options: 'i' } },
                { club: { $regex: safe, $options: 'i' } }
            ];
        }
        if (flaggedOnly) filter.flaggedSuspicious = true;

        const players = await Player.find(filter).sort({ createdAt: -1 }).limit(200).lean();
        res.json({ success: true, data: players });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load players' });
    }
});

// Full Player Inspector (profile + runs + tifos)
router.get('/players/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id).lean();
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });

        const [runs, tifos] = await Promise.all([
            RunHistory.find({ player: player._id }).sort({ createdAt: -1 }).limit(50).lean(),
            TifoSubmission.find({ player: player._id }).sort({ createdAt: -1 }).limit(30).lean()
        ]);

        res.json({ success: true, data: { player, runs, tifos } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load player details' });
    }
});

router.patch('/players/:id/ban', async (req, res) => {
    try {
        const isBanned = Boolean(req.body.isBanned);
        const player = await Player.findByIdAndUpdate(
            req.params.id,
            { isBanned, flaggedSuspicious: false },
            { new: true }
        );
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
        await ArcadeAuditLog.create({
            action: isBanned ? 'PLAYER_BAN' : 'PLAYER_UNBAN',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: isBanned ? `Banned @${player.pseudo}` : `Unbanned @${player.pseudo}`
        });
        res.json({ success: true, data: player });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update player' });
    }
});

router.patch('/players/:id/unflag', async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(
            req.params.id,
            { flaggedSuspicious: false },
            { new: true }
        );
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
        await ArcadeAuditLog.create({
            action: 'UNFLAG_PLAYER',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: `Cleared anti-cheat flag for @${player.pseudo}`
        });
        res.json({ success: true, data: player });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to unflag player' });
    }
});

router.patch('/players/:id/reset-scores', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
        const prev = { best: player.bestRunnerScore, weekly: player.weeklyBestScore, daily: player.dailyBestScore };
        player.bestRunnerScore = 0;
        player.weeklyBestScore = 0;
        player.dailyBestScore = 0;
        player.flaggedSuspicious = false;
        await player.save();
        await ArcadeAuditLog.create({
            action: 'SCORE_RESET',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: `Reset all Runner scores for @${player.pseudo} (was ${prev.best}m all-time / ${prev.weekly}m week)`,
            metadata: prev
        });
        res.json({ success: true, data: player });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to reset scores' });
    }
});

router.patch('/players/:id/coins', async (req, res) => {
    try {
        const coins = Math.max(0, Math.floor(Number(req.body.coins) || 0));
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
        const oldCoins = player.coins;
        player.coins = coins;
        await player.save();
        await ArcadeAuditLog.create({
            action: 'COINS_ADJUST',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: `Set @${player.pseudo} coins from ${oldCoins} to ${coins}`,
            metadata: { oldCoins, newCoins: coins }
        });
        res.json({ success: true, data: player });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update coins' });
    }
});

router.patch('/players/:id/reset-password', async (req, res) => {
    try {
        const newPassword = String(req.body.newPassword || '');
        if (newPassword.length < 4) {
            return res.status(400).json({ success: false, error: 'Password must be at least 4 characters.' });
        }
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
        player.password = newPassword;
        await player.save();
        await ArcadeAuditLog.create({
            action: 'PASSWORD_RESET',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: `Admin reset password for @${player.pseudo}`
        });
        res.json({ success: true, message: 'Password reset' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

// Unified Manual Reward to any player
router.post('/players/:id/reward', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, error: 'Player not found' });

        const { coins = 0, rewardType = 'none', value = 0, giftName = '', note = '' } = req.body;
        const result = await grantFlexibleReward(player, {
            coins,
            rewardType,
            value,
            giftName,
            label: note || 'Récompense Admin',
            source: 'arcade_runner'
        });

        await ArcadeAuditLog.create({
            action: 'PLAYER_REWARD',
            targetPseudo: player.pseudo,
            targetId: String(player._id),
            details: `Rewarded @${player.pseudo}: ${result.coinAmount} coins${result.createdReward ? ` + ${result.createdReward.code}` : ''}`,
            metadata: { coinsAwarded: result.coinAmount, promoCode: result.createdReward?.code || null, rewardType, value }
        });

        res.json({
            success: true,
            data: {
                pseudo: player.pseudo,
                coinsAwarded: result.coinAmount,
                promoCode: result.createdReward?.code || null
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Failed to send reward' });
    }
});

// Run History & Anti-Cheat Logs
router.get('/runs', async (req, res) => {
    try {
        const status = req.query.status;
        const q = String(req.query.q || '').trim();
        const filter = {};
        if (status === 'valid' || status === 'flagged') filter.status = status;
        if (q) {
            const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.pseudo = { $regex: safe, $options: 'i' };
        }
        const runs = await RunHistory.find(filter).sort({ createdAt: -1 }).limit(120).lean();
        res.json({ success: true, data: runs });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load run history' });
    }
});

// Permanent Winners & Admin Audit Archive
router.get('/audit', async (req, res) => {
    try {
        const logs = await ArcadeAuditLog.find().sort({ createdAt: -1 }).limit(120).lean();
        res.json({ success: true, data: logs });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load audit logs' });
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const now = new Date(Date.now() + 60 * 60 * 1000);
        const today = now.toISOString().slice(0, 10);
        const [daily, weekly, allTime] = await Promise.all([
            Player.find({ isBanned: false, dailyDate: today, dailyBestScore: { $gt: 0 } })
                .sort({ dailyBestScore: -1 })
                .limit(25)
                .select('pseudo club dailyBestScore flaggedSuspicious')
                .lean(),
            Player.find({ isBanned: false, weeklyBestScore: { $gt: 0 } })
                .sort({ weeklyBestScore: -1 })
                .limit(25)
                .select('pseudo club weeklyBestScore bestRunnerScore flaggedSuspicious')
                .lean(),
            Player.find({ isBanned: false, bestRunnerScore: { $gt: 0 } })
                .sort({ bestRunnerScore: -1 })
                .limit(25)
                .select('pseudo club bestRunnerScore flaggedSuspicious')
                .lean()
        ]);
        res.json({ success: true, data: { daily, weekly, allTime } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

router.post('/runner/crown-winner', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const top = await Player.findOne({ isBanned: false, weeklyBestScore: { $gt: 0 } }).sort({ weeklyBestScore: -1 });
        if (!top) return res.status(400).json({ success: false, error: 'No weekly scores to crown.' });

        const {
            coins = 0,
            rewardType = 'percent',
            value = cfg.weeklyChampionDiscount || 20,
            giftName = '',
            note = ''
        } = req.body;

        const result = await grantFlexibleReward(top, {
            coins,
            rewardType,
            value,
            giftName,
            label: note || `Weekly #1 Champion (${cfg.weekId} · ${top.weeklyBestScore}m)`,
            source: 'arcade_runner'
        });

        await ArcadeAuditLog.create({
            action: 'WEEKLY_CHAMPION',
            targetPseudo: top.pseudo,
            targetId: String(top._id),
            details: `Crowned @${top.pseudo} for ${cfg.weekId} (${top.weeklyBestScore}m)${result.createdReward ? ` · ${result.createdReward.code}` : ''}`,
            metadata: { weekId: cfg.weekId, score: top.weeklyBestScore, promoCode: result.createdReward?.code || null, coinsAwarded: result.coinAmount }
        });

        await Player.updateMany({}, { $set: { weeklyBestScore: 0, weeklyMilestoneClaimed: false } });
        const now = new Date();
        cfg.weekId = `${now.getFullYear()}-W${String(Math.floor(Date.now() / 604800000) % 100).padStart(2, '0')}-${now.getDate()}`;
        await cfg.save();

        res.json({
            success: true,
            data: {
                winnerPseudo: top.pseudo,
                promoCode: result.createdReward?.code || null,
                coinsAwarded: result.coinAmount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Failed to crown winner' });
    }
});

router.patch('/config', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        if (req.body.dailyTargetScore !== undefined) cfg.dailyTargetScore = Number(req.body.dailyTargetScore);
        if (req.body.dailyCoinReward !== undefined) cfg.dailyCoinReward = Number(req.body.dailyCoinReward);
        if (req.body.runnerMilestoneEnabled !== undefined) cfg.runnerMilestoneEnabled = Boolean(req.body.runnerMilestoneEnabled);
        if (req.body.runnerMilestoneScore !== undefined) cfg.runnerMilestoneScore = Number(req.body.runnerMilestoneScore);
        if (req.body.runnerMilestoneDiscount !== undefined) cfg.runnerMilestoneDiscount = Number(req.body.runnerMilestoneDiscount);
        if (req.body.weeklyChampionDiscount !== undefined) cfg.weeklyChampionDiscount = Number(req.body.weeklyChampionDiscount);
        if (req.body.tifoSubmitCoins !== undefined) cfg.tifoSubmitCoins = Number(req.body.tifoSubmitCoins);
        if (req.body.tifoVoteCoins !== undefined) cfg.tifoVoteCoins = Number(req.body.tifoVoteCoins);
        if (req.body.activeTifoChallenge) {
            cfg.activeTifoChallenge = {
                ...cfg.activeTifoChallenge,
                ...req.body.activeTifoChallenge,
                challengeId: cfg.activeTifoChallenge?.challengeId || 'round-1'
            };
        }
        if (req.body.runnerPub) {
            cfg.runnerPub = {
                ...cfg.runnerPub,
                ...req.body.runnerPub
            };
        }
        await cfg.save();
        res.json({ success: true, data: cfg });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update config' });
    }
});

// 1-click Stop Active Tifo Challenge
router.post('/tifo/stop', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        cfg.activeTifoChallenge.isActive = false;
        await cfg.save();
        res.json({ success: true, data: cfg });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to stop challenge' });
    }
});

// Delete an accidental/unwanted Tifo Challenge Round
router.delete('/tifo/round/:challengeId', async (req, res) => {
    try {
        const { challengeId } = req.params;
        const cfg = await ArcadeConfig.getSingleton();
        await TifoSubmission.deleteMany({ challengeId });
        cfg.challengeHistory = (cfg.challengeHistory || []).filter((c) => c.challengeId !== challengeId);
        if (cfg.activeTifoChallenge?.challengeId === challengeId) {
            cfg.activeTifoChallenge.isActive = false;
        }
        await cfg.save();
        res.json({ success: true, data: cfg });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to delete round' });
    }
});

// Start a brand new Tifo Challenge Round (archives current round into challengeHistory)
router.post('/tifo/new-round', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const prev = cfg.activeTifoChallenge;
        if (prev?.challengeId) {
            const exists = (cfg.challengeHistory || []).some((c) => c.challengeId === prev.challengeId);
            if (!exists) {
                cfg.challengeHistory.unshift({
                    challengeId: prev.challengeId,
                    title: prev.title || prev.challengeId,
                    startedAt: cfg.updatedAt || new Date()
                });
            }
        }

        const newId = `round-${Date.now()}`;
        const newTitle = String(req.body.title || '').trim() || `Tifo Challenge #${(cfg.challengeHistory?.length || 0) + 2}`;
        cfg.activeTifoChallenge = {
            challengeId: newId,
            isActive: true,
            title: newTitle,
            description: String(req.body.description || ''),
            prizeText: String(req.body.prizeText || ''),
            deadline: String(req.body.deadline || '')
        };
        await cfg.save();
        res.json({ success: true, data: cfg });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to start new Tifo round' });
    }
});

router.get('/tifos', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const activeId = cfg.activeTifoChallenge?.challengeId || 'round-1';
        const filterId = req.query.challengeId || activeId;

        const query = filterId === 'all' ? {} : { challengeId: filterId };
        const tifos = await TifoSubmission.find(query)
            .sort({ isWinner: -1, votes: -1, createdAt: -1 })
            .limit(100)
            .lean();

        const rounds = [
            { challengeId: activeId, title: `${cfg.activeTifoChallenge?.title || 'Current Round'} (Active)` },
            ...(cfg.challengeHistory || []).map((c) => ({ challengeId: c.challengeId, title: c.title }))
        ];

        res.json({ success: true, data: tifos, rounds, activeChallengeId: activeId });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load Tifos' });
    }
});

router.patch('/tifos/:id', async (req, res) => {
    try {
        const tifo = await TifoSubmission.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!tifo) return res.status(404).json({ success: false, error: 'Tifo not found' });
        res.json({ success: true, data: tifo });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update Tifo' });
    }
});

router.post('/tifos/:id/winner', async (req, res) => {
    try {
        const tifo = await TifoSubmission.findById(req.params.id);
        if (!tifo) return res.status(404).json({ success: false, error: 'Tifo not found' });

        const player = await Player.findById(tifo.player);
        const { coins = 0, rewardType = 'percent', value = 20, giftName = '', note = '' } = req.body;

        let result = { coinAmount: 0, createdReward: null };
        if (player) {
            result = await grantFlexibleReward(player, {
                coins,
                rewardType,
                value,
                giftName,
                label: note || `Tifo Winner: ${tifo.title}`,
                source: 'arcade_tifo'
            });
        }

        tifo.isWinner = true;
        tifo.status = 'featured';
        await tifo.save();

        res.json({
            success: true,
            data: {
                promoCode: result.createdReward?.code || null,
                coinsAwarded: result.coinAmount,
                winnerPseudo: tifo.pseudo
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Failed to award Tifo winner' });
    }
});

router.delete('/tifos/:id', async (req, res) => {
    try {
        await TifoSubmission.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to delete Tifo' });
    }
});

module.exports = router;
