const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const rewardSchema = new mongoose.Schema({
    code: { type: String, required: true },
    rewardType: { type: String, enum: ['percent', 'fixed', 'free_product'], default: 'percent' },
    discountType: { type: String, enum: ['percent', 'fixed', 'free_product'], default: 'percent' },
    value: { type: Number, default: 0 },
    giftName: { type: String, default: '' },
    source: { type: String, default: 'arcade_runner' },
    label: { type: String, default: '' },
    claimed: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    earnedAt: { type: Date, default: Date.now }
}, { _id: false });

const playerSchema = new mongoose.Schema({
    pseudo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 24
    },
    pseudoLower: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        select: false
    },
    club: {
        type: String,
        default: 'free',
        trim: true
    },
    coins: {
        type: Number,
        default: 150,
        min: 0
    },
    inventory: [{ type: String }],
    bestRunnerScore: {
        type: Number,
        default: 0,
        min: 0
    },
    weeklyBestScore: {
        type: Number,
        default: 0,
        min: 0
    },
    dailyBestScore: {
        type: Number,
        default: 0,
        min: 0
    },
    dailyDate: {
        type: String,
        default: ''
    },
    dailyCoinsClaimed: {
        type: Boolean,
        default: false
    },
    weeklyMilestoneClaimed: {
        type: Boolean,
        default: false
    },
    flaggedSuspicious: {
        type: Boolean,
        default: false
    },
    rewards: [rewardSchema],
    isBanned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

playerSchema.pre('save', async function (next) {
    if (this.isModified('pseudo')) {
        this.pseudoLower = this.pseudo.toLowerCase();
    }
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

playerSchema.methods.matchPassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

playerSchema.index({ dailyBestScore: -1 });
playerSchema.index({ weeklyBestScore: -1 });
playerSchema.index({ bestRunnerScore: -1 });

module.exports = mongoose.model('Player', playerSchema);
