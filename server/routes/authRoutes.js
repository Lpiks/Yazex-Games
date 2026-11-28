const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Player = require('../models/Player');
const { protectPlayer } = require('../middleware/auth');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    message: { success: false, error: 'Too many auth attempts. Please wait a bit.' }
});

const setAuthCookie = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('arcade_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
};

const sanitizePlayer = (p) => ({
    id: p._id,
    pseudo: p.pseudo,
    club: p.club,
    coins: p.coins,
    inventory: p.inventory,
    bestRunnerScore: p.bestRunnerScore,
    weeklyBestScore: p.weeklyBestScore,
    weeklyMilestoneClaimed: p.weeklyMilestoneClaimed,
    rewards: p.rewards || []
});

router.post('/register', authLimiter, async (req, res) => {
    try {
        const pseudo = String(req.body.pseudo || '').trim();
        const password = String(req.body.password || '');
        const club = String(req.body.club || 'free').trim();

        if (pseudo.length < 3 || pseudo.length > 24) {
            return res.status(400).json({ success: false, error: 'Pseudo must be 3–24 characters.' });
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(pseudo)) {
            return res.status(400).json({ success: false, error: 'Pseudo can only contain letters, numbers, _ and -.' });
        }
        if (password.length < 4) {
            return res.status(400).json({ success: false, error: 'Password must be at least 4 characters.' });
        }

        const exists = await Player.findOne({ pseudoLower: pseudo.toLowerCase() });
        if (exists) {
            return res.status(400).json({ success: false, error: 'This pseudo is already taken.' });
        }

        const player = await Player.create({
            pseudo,
            pseudoLower: pseudo.toLowerCase(),
            password,
            club
        });

        setAuthCookie(res, player._id);
        res.status(201).json({ success: true, data: sanitizePlayer(player) });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Registration failed.' });
    }
});

router.post('/login', authLimiter, async (req, res) => {
    try {
        const pseudo = String(req.body.pseudo || '').trim();
        const password = String(req.body.password || '');

        if (!pseudo || !password) {
            return res.status(400).json({ success: false, error: 'Pseudo and password are required.' });
        }

        const player = await Player.findOne({ pseudoLower: pseudo.toLowerCase() }).select('+password');
        if (!player || !(await player.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid pseudo or password.' });
        }
        if (player.isBanned) {
            return res.status(403).json({ success: false, error: 'Account suspended.' });
        }

        setAuthCookie(res, player._id);
        res.json({ success: true, data: sanitizePlayer(player) });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Login failed.' });
    }
});

router.post('/logout', (req, res) => {
    res.cookie('arcade_jwt', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true });
});

router.get('/me', protectPlayer, (req, res) => {
    res.json({ success: true, data: sanitizePlayer(req.player) });
});

router.patch('/club', protectPlayer, async (req, res) => {
    try {
        req.player.club = String(req.body.club || 'free').trim();
        await req.player.save();
        res.json({ success: true, data: sanitizePlayer(req.player) });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update club.' });
    }
});

module.exports = router;
