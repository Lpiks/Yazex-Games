const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

const safeEqual = (a, b) => {
    const bufA = Buffer.from(String(a || ''), 'utf8');
    const bufB = Buffer.from(String(b || ''), 'utf8');
    if (bufA.length === 0 || bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

const protectPlayer = async (req, res, next) => {
    try {
        const token = req.cookies?.arcade_jwt;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Please log in with your pseudo.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const player = await Player.findById(decoded.id);
        if (!player) {
            return res.status(401).json({ success: false, error: 'Player account not found.' });
        }
        if (player.isBanned) {
            return res.status(403).json({ success: false, error: 'This account has been suspended.' });
        }
        req.player = player;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }
};

const requireArcadeAdmin = (req, res, next) => {
    const expected = process.env.ARCADE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'yazex-arcade-dev-secret');
    const provided = req.headers['x-arcade-admin-key'];
    if (!expected || !safeEqual(provided, expected)) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
};

module.exports = { protectPlayer, requireArcadeAdmin };
