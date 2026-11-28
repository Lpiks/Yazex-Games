const express = require('express');
const router = express.Router();
const TifoSubmission = require('../models/TifoSubmission');
const ArcadeConfig = require('../models/ArcadeConfig');
const Player = require('../models/Player');
const { protectPlayer } = require('../middleware/auth');

const SAFE_IMAGE_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i;

// Public: Active Tifo Challenge + Runner Pub Banner
router.get('/challenge', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const tifoData = cfg.activeTifoChallenge?.toObject ? cfg.activeTifoChallenge.toObject() : cfg.activeTifoChallenge;
        res.json({
            success: true,
            data: {
                ...tifoData,
                runnerPub: cfg.runnerPub || { isActive: false }
            }
        });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch challenge' });
    }
});

// Protected: Player's own saved Tifos (Drafts & Submitted)
router.get('/my', protectPlayer, async (req, res) => {
    try {
        const tifos = await TifoSubmission.find({ player: req.player._id })
            .sort({ createdAt: -1 })
            .limit(40)
            .select('-voters')
            .lean();
        res.json({ success: true, data: tifos });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load your Tifos' });
    }
});

// Public: List approved/featured Tifo submissions (defaults to current challenge)
router.get('/', async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        const activeId = cfg.activeTifoChallenge?.challengeId || 'round-1';
        const scope = req.query.scope || 'current'; // 'current' | 'winners' | 'all'

        const query = { status: { $in: ['approved', 'featured'] } };
        if (scope === 'current') {
            query.challengeId = activeId;
        } else if (scope === 'winners') {
            query.isWinner = true;
        }

        const tifos = await TifoSubmission.find(query)
            .sort({ isWinner: -1, votes: -1, createdAt: -1 })
            .limit(60)
            .select('-voters')
            .lean();
        res.json({
            success: true,
            data: tifos,
            activeChallenge: cfg.activeTifoChallenge,
            activeChallengeId: activeId
        });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to load Tifo Arena' });
    }
});

// Protected: Save Draft OR Submit Tifo to Active Challenge
router.post('/', protectPlayer, async (req, res) => {
    try {
        const title = String(req.body.title || '').trim().slice(0, 80);
        const previewDataUrl = String(req.body.previewDataUrl || '').trim();
        const mode = req.body.mode === 'draft' ? 'draft' : 'submit';
        if (!title) return res.status(400).json({ success: false, error: 'Tifo title is required.' });
        if (previewDataUrl) {
            if (!SAFE_IMAGE_DATA_URL_RE.test(previewDataUrl) || previewDataUrl.length > 2_500_000) {
                return res.status(400).json({ success: false, error: 'Invalid or oversized Tifo preview image.' });
            }
        }

        const existingCount = await TifoSubmission.countDocuments({ player: req.player._id });
        if (existingCount >= 25) {
            return res.status(400).json({ success: false, error: 'Maximum 25 saved Tifos reached.' });
        }

        const cfg = await ArcadeConfig.getSingleton();
        const isChallengeActive = Boolean(cfg.activeTifoChallenge?.isActive);

        if (mode === 'submit' && !isChallengeActive) {
            return res.status(400).json({
                success: false,
                error: 'Aucun concours actif — sauvegarde ton Tifo dans Mes TIFOs en attendant le prochain challenge.'
            });
        }

        const activeId = cfg.activeTifoChallenge?.challengeId || 'round-1';
        const activeTitle = cfg.activeTifoChallenge?.title || 'Tifo Challenge';

        const tifo = await TifoSubmission.create({
            player: req.player._id,
            pseudo: req.player.pseudo,
            club: req.body.club || req.player.club || 'free',
            title,
            previewDataUrl,
            status: mode === 'draft' ? 'draft' : 'approved',
            challengeId: mode === 'draft' ? '' : activeId,
            challengeTitle: mode === 'draft' ? '' : activeTitle,
            weekId: cfg.weekId
        });

        res.status(201).json({ success: true, data: tifo });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to save Tifo' });
    }
});

// Protected: Publish a saved Draft into the currently active Challenge
router.post('/:id/publish', protectPlayer, async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        if (!cfg.activeTifoChallenge?.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Aucun concours actif pour le moment. Attends le lancement du prochain challenge !'
            });
        }

        const tifo = await TifoSubmission.findOne({ _id: req.params.id, player: req.player._id });
        if (!tifo) return res.status(404).json({ success: false, error: 'Tifo introuvable.' });
        if (tifo.status !== 'draft') {
            return res.status(400).json({ success: false, error: 'Ce Tifo a déjà été soumis.' });
        }

        tifo.status = 'approved';
        tifo.challengeId = cfg.activeTifoChallenge.challengeId || 'round-1';
        tifo.challengeTitle = cfg.activeTifoChallenge.title || 'Tifo Challenge';
        await tifo.save();

        res.json({ success: true, data: tifo });
    } catch {
        res.status(500).json({ success: false, error: 'Impossible de publier ce Tifo.' });
    }
});

// Protected: Vote on a Tifo (locked when no challenge is active)
router.post('/:id/vote', protectPlayer, async (req, res) => {
    try {
        const cfg = await ArcadeConfig.getSingleton();
        if (!cfg.activeTifoChallenge?.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Les votes sont verrouillés jusqu’au lancement du prochain concours.'
            });
        }

        const tifo = await TifoSubmission.findOneAndUpdate(
            {
                _id: req.params.id,
                status: { $in: ['approved', 'featured'] },
                player: { $ne: req.player._id },
                voters: { $ne: req.player._id }
            },
            {
                $addToSet: { voters: req.player._id },
                $inc: { votes: 1 }
            },
            { new: true }
        );

        if (!tifo) {
            const exists = await TifoSubmission.findById(req.params.id).select('player voters status').lean();
            if (!exists) return res.status(404).json({ success: false, error: 'Tifo not found.' });
            if (String(exists.player) === String(req.player._id)) {
                return res.status(400).json({ success: false, error: 'You cannot vote for your own Tifo.' });
            }
            return res.status(400).json({ success: false, error: 'You already voted for this Tifo.' });
        }

        const voteCoins = Math.max(0, Number(cfg.tifoVoteCoins) || 25);
        if (voteCoins > 0) {
            await Player.updateOne({ _id: req.player._id }, { $inc: { coins: voteCoins } });
            req.player.coins += voteCoins;
        }

        res.json({ success: true, data: { votes: tifo.votes, coins: req.player.coins } });
    } catch {
        res.status(500).json({ success: false, error: 'Vote failed.' });
    }
});

module.exports = router;
