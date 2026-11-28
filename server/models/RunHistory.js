const mongoose = require('mongoose');

const runHistorySchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true,
        index: true
    },
    pseudo: {
        type: String,
        required: true,
        index: true
    },
    club: {
        type: String,
        default: 'free'
    },
    weekId: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    coinsEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    jumps: {
        type: Number,
        default: 0,
        min: 0
    },
    ducks: {
        type: Number,
        default: 0,
        min: 0
    },
    durationSec: {
        type: Number,
        default: 0,
        min: 0
    },
    ptsPerSec: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['valid', 'flagged'],
        default: 'valid',
        index: true
    },
    flagReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

runHistorySchema.index({ createdAt: -1 });
runHistorySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('RunHistory', runHistorySchema);
