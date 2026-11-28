const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Player = require('../models/Player');
const ArcadeConfig = require('../models/ArcadeConfig');
const RunHistory = require('../models/RunHistory');
const ArcadeAuditLog = require('../models/ArcadeAuditLog');
const { protectPlayer } = require('../middleware/auth');
const { mintPromoOnShop } = require('../utils/promoBridge');

// Single-use in-memory run sessions (runToken -> { playerId, startedAt })
const activeRuns = new Map();

const getAlgeriaDateStr = () => {
    const now = new Date(Date.now() + 60 * 60 * 1000); // UTC+1
    return now.toISOString().slice(0, 10);
};

// Issue a single-use Run Token when player starts Ultras Runner
router.post('/runner/start', protectPlayer, (req, res) => {
    const runToken = crypto.randomBytes(16).toString('hex');
    activeRuns.set(runToken, {
        playerId: String(req.player._id),
        startedAt: Date.now()
    });
    // Cleanup stale tokens older than 2 hours
    if (activeRuns.size > 500) {
        const cutoff = Date.now() - 2 * 60 * 60 * 1000;
        for (const [k, v] of activeRuns.entries()) {
            if (v.startedAt < cutoff) activeRuns.delete(k);
        }
    }
    res.json({ success: true, data: { runToken } });
});

// Public Leaderboard (Daily + Weekly + All-Time)
router.get('/leaderboard', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const today = getAlgeriaDateStr();
        const [daily, weekly, allTime] = await Promise.all([
            Player.find({ isBanned: false, dailyDate: today, dailyBestScore: { $gt: 0 } })
                .sort({ dailyBestScore: -1 })
                .limit(25)
                .select('pseudo club dailyBestScore')
                .lean(),
            Player.find({ isBanned: false, weeklyBestScore: { $gt: 0 } })
                .sort({ weeklyBestScore: -1 })
                .limit(25)
                .select('pseudo club weeklyBestScore bestRunnerScore')
                .lean(),
            Player.find({ isBanned: false, bestRunnerScore: { $gt: 0 } })
                .sort({ bestRunnerScore: -1 })
                .limit(25)
                .select('pseudo club bestRunnerScore weeklyBestScore')
                .lean()
        ]);

        res.json({
            success: true,
            data: {
                today,
                weekId: cfg.weekId,
                dailyTargetScore: cfg.dailyTargetScore,
                dailyCoinReward: cfg.dailyCoinReward,
                milestoneEnabled: cfg.runnerMilestoneEnabled,
                milestoneScore: cfg.runnerMilestoneScore,
                milestoneDiscount: cfg.runnerMilestoneDiscount,
                weeklyChampionDiscount: cfg.weeklyChampionDiscount,
                daily,
                weekly,
                allTime
            }
        });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load leaderboard' });
    }
});

// Submit Runner Score with Run Token & Anti-Cheat Physics Validation
router.post('/runner/score', protectPlayer, async (req, res) => {
    try {
        const score = Math.max(0, Math.min(250000, Math.floor(Number(req.body.score) || 0)));
        const coinsEarned = Math.max(0, Math.min(2000, Math.floor(Number(req.body.coinsEarned) || 0)));
        const jumps = Math.max(0, Math.floor(Number(req.body.jumps) || 0));
        const ducks = Math.max(0, Math.floor(Number(req.body.ducks) || 0));
        const runToken = String(req.body.runToken || '');

        const player = req.player;
        const cfg = await ArcadeConfig.getSingleton();

        // Anti-cheat: require valid single-use runToken & realistic elapsed time/telemetry
        const session = runToken ? activeRuns.get(runToken) : null;
        if (!session || session.playerId !== String(player._id)) {
            if (score > 20) {
                player.flaggedSuspicious = true;
                await player.save();
                await RunHistory.create({
                    player: player._id,
                    pseudo: player.pseudo,
                    club: player.club,
                    weekId: cfg.weekId,
                    score,
                    coinsEarned,
                    jumps,
                    ducks,
                    durationSec: 0,
                    ptsPerSec: 0,
                    status: 'flagged',
                    flagReason: 'Missing or invalid runToken'
                });
                await ArcadeAuditLog.create({
                    action: 'ANTI_CHEAT_FLAG',
                    targetPseudo: player.pseudo,
                    targetId: String(player._id),
                    details: `Rejected run (${score}m) — missing or invalid runToken`,
                    metadata: { score, coinsEarned, jumps, ducks }
                });
            }
            return res.status(400).json({ success: false, error: 'Invalid or expired run session.' });
        }
        activeRuns.delete(runToken);

        const elapsedSec = Math.max(1, Number(((Date.now() - session.startedAt) / 1000).toFixed(1)));
        const ptsPerSec = Number((score / elapsedSec).toFixed(1));
        const maxPlausibleScore = Math.ceil(elapsedSec * 45) + 50;
        const maxPlausibleCoins = Math.ceil(elapsedSec * 5) + 25;
        const suspiciousNoInput = score > 300 && (jumps + ducks) === 0;
        const suspiciousSpeed = score > maxPlausibleScore;
        const suspiciousCoins = coinsEarned > maxPlausibleCoins;

        if (suspiciousNoInput || suspiciousSpeed || suspiciousCoins) {
            const reasons = [];
            if (suspiciousNoInput) reasons.push('No jumps/ducks above 300m');
            if (suspiciousSpeed) reasons.push(`Speed ${ptsPerSec} pts/s > max`);
            if (suspiciousCoins) reasons.push(`Coins ${coinsEarned} > max ${maxPlausibleCoins}`);
            const flagReason = reasons.join(' · ');

            player.flaggedSuspicious = true;
            await player.save();
            await RunHistory.create({
                player: player._id,
                pseudo: player.pseudo,
                club: player.club,
                weekId: cfg.weekId,
                score,
                coinsEarned,
                jumps,
                ducks,
                durationSec: elapsedSec,
                ptsPerSec,
                status: 'flagged',
                flagReason
            });
            await ArcadeAuditLog.create({
                action: 'ANTI_CHEAT_FLAG',
                targetPseudo: player.pseudo,
                targetId: String(player._id),
                details: `Flagged run (${score}m in ${elapsedSec}s): ${flagReason}`,
                metadata: { score, coinsEarned, jumps, ducks, elapsedSec, ptsPerSec }
            });
            return res.status(400).json({
                success: false,
                error: 'Run rejected by anti-cheat verification.'
            });
        }

        const today = getAlgeriaDateStr();
        if (player.dailyDate !== today) {
            player.dailyDate = today;
            player.dailyBestScore = 0;
            player.dailyCoinsClaimed = false;
        }

        player.coins += coinsEarned;
        if (score > player.dailyBestScore) player.dailyBestScore = score;
        if (score > player.bestRunnerScore) player.bestRunnerScore = score;
        if (score > player.weeklyBestScore) player.weeklyBestScore = score;

        await RunHistory.create({
            player: player._id,
            pseudo: player.pseudo,
            club: player.club,
            weekId: cfg.weekId,
            score,
            coinsEarned,
            jumps,
            ducks,
            durationSec: elapsedSec,
            ptsPerSec,
            status: 'valid'
        });

        // Daily Target Coin Bonus (once per day)
        let dailyCoinsBonus = 0;
        if (cfg.dailyTargetScore > 0 && score >= cfg.dailyTargetScore && !player.dailyCoinsClaimed) {
            dailyCoinsBonus = Number(cfg.dailyCoinReward) || 150;
            player.coins += dailyCoinsBonus;
            player.dailyCoinsClaimed = true;
        }

        // Optional Weekly Milestone Promo (only if enabled by Admin)
        let newReward = null;
        if (cfg.runnerMilestoneEnabled && score >= cfg.runnerMilestoneScore && !player.weeklyMilestoneClaimed) {
            try {
                const promo = await mintPromoOnShop({
                    discountType: 'percent',
                    value: cfg.runnerMilestoneDiscount,
                    maxUses: 1,
                    expiresInDays: 14,
                    source: 'arcade_runner',
                    ownerPseudo: player.pseudo,
                    note: `Runner ${cfg.weekId} milestone (${score}m)`
                });
                newReward = {
                    code: promo.code,
                    rewardType: 'percent',
                    discountType: promo.discountType,
                    value: promo.value,
                    source: promo.source,
                    label: `Runner ${cfg.weekId} Milestone (${score}m)`,
                    expiresAt: promo.expiresAt
                };
                player.rewards.unshift(newReward);
                player.weeklyMilestoneClaimed = true;
            } catch (err) {
                console.error('Promo mint failed:', err.message);
            }
        }

        await player.save();
        res.json({
            success: true,
            data: {
                coins: player.coins,
                dailyCoinsBonus,
                dailyBestScore: player.dailyBestScore,
                bestRunnerScore: player.bestRunnerScore,
                weeklyBestScore: player.weeklyBestScore,
                weeklyMilestoneClaimed: player.weeklyMilestoneClaimed,
                newReward,
                rewards: player.rewards
            }
        });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to save run' });
    }
});

// Get player's unlocked rewards (enriched with live usage status from Yazix Ship)
router.get('/rewards', protectPlayer, async (req, res) => {
    const rewards = (req.player.rewards || []).map((r) => (r.toObject ? r.toObject() : { ...r }));
    const promoCodes = rewards
        .filter((r) => r.rewardType !== 'free_product' && r.code)
        .map((r) => String(r.code).trim().toUpperCase());

    if (promoCodes.length > 0) {
        try {
            const shopApiUrl = process.env.SHOP_API_URL || 'http://localhost:5000';
            const secret = process.env.ARCADE_SECRET || 'yazex-arcade-dev-secret';
            const statusRes = await axios.post(
                `${shopApiUrl}/api/promos/arcade-status`,
                { codes: promoCodes },
                { headers: { 'x-arcade-secret': secret }, timeout: 4000 }
            );
            const statusMap = statusRes.data?.data || {};
            for (const rw of rewards) {
                const st = statusMap[String(rw.code || '').trim().toUpperCase()];
                if (st) {
                    rw.used = Boolean(st.used);
                    rw.expired = Boolean(st.expired);
                    rw.active = Boolean(st.active);
                }
            }
        } catch {
            // Keep stored rewards if shop API is temporarily unreachable
        }
    }

    res.json({ success: true, data: rewards });
});

// Claim a Free Product gift -> sends 0 DA Gift Order straight to Yazix Ship
router.post('/rewards/:code/claim-gift', protectPlayer, async (req, res) => {
    try {
        const code = String(req.params.code || '').trim().toUpperCase();
        const { name, phone, wilaya, address, consentAccepted } = req.body;

        if (!consentAccepted) {
            return res.status(400).json({ success: false, error: 'Veuillez accepter les CGV et la Politique de Confidentialité.' });
        }
        if (!name || !/^(05|06|07)[0-9]{8}$/.test(String(phone || '').trim()) || !wilaya || !address) {
            return res.status(400).json({ success: false, error: 'Nom, téléphone algérien (05/06/07), wilaya et adresse requis.' });
        }

        const lockedPlayer = await Player.findOneAndUpdate(
            {
                _id: req.player._id,
                rewards: { $elemMatch: { code, rewardType: 'free_product', claimed: false } }
            },
            { $set: { 'rewards.$.claimed': true } },
            { new: true }
        );
        if (!lockedPlayer) {
            const exists = (req.player.rewards || []).find((r) => r.code === code && r.rewardType === 'free_product');
            if (!exists) return res.status(404).json({ success: false, error: 'Cadeau introuvable.' });
            return res.status(400).json({ success: false, error: 'Ce cadeau a déjà été réclamé.' });
        }

        const reward = lockedPlayer.rewards.find((r) => r.code === code && r.rewardType === 'free_product');
        const shopApiUrl = process.env.SHOP_API_URL || 'http://localhost:5000';
        const secret = process.env.ARCADE_SECRET || 'yazex-arcade-dev-secret';

        try {
            await axios.post(
                `${shopApiUrl}/api/orders/gift`,
                {
                    client: { name: name.trim(), phone: phone.trim(), wilaya: wilaya.trim(), commune: 'N/A', address: address.trim() },
                    giftCode: reward.code,
                    giftName: reward.giftName || reward.label || 'Arcade Gift',
                    ownerPseudo: req.player.pseudo
                },
                { headers: { 'x-arcade-secret': secret }, timeout: 8000 }
            );
        } catch (shopErr) {
            await Player.updateOne(
                { _id: req.player._id, 'rewards.code': code },
                { $set: { 'rewards.$.claimed': false } }
            );
            throw shopErr;
        }

        res.json({ success: true, data: { rewards: lockedPlayer.rewards } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.response?.data?.error || 'Impossible de réclamer le cadeau.' });
    }
});

// Authoritative server-side Armory catalog (never trust client price)
const ARMORY_CATALOG = {
    fumi: 50,
    signal: 75,
    revive: 150,
    red: 0,
    green: 150,
    gold: 250,
    black: 350,
    dual: 500
};

// Buy Armory item / spend coins
router.post('/armory/buy', protectPlayer, async (req, res) => {
    try {
        const itemId = String(req.body.itemId || '').trim();
        if (!itemId || !Object.prototype.hasOwnProperty.call(ARMORY_CATALOG, itemId)) {
            return res.status(400).json({ success: false, error: 'Invalid Armory item.' });
        }

        const cost = ARMORY_CATALOG[itemId];
        const player = req.player;

        if (player.inventory.includes(itemId)) {
            return res.json({ success: true, data: { coins: player.coins, inventory: player.inventory } });
        }
        if (player.coins < cost) {
            return res.status(400).json({ success: false, error: 'Not enough coins.' });
        }

        player.coins -= cost;
        player.inventory.push(itemId);
        await player.save();
        res.json({ success: true, data: { coins: player.coins, inventory: player.inventory } });
    } catch {
        res.status(500).json({ success: false, error: 'Purchase failed.' });
    }
});

module.exports = router;
