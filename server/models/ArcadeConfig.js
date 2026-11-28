const mongoose = require('mongoose');

const getDefaultWeekId = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diffDays = Math.floor((now - start) / 86400000);
    const week = Math.ceil((diffDays + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

const arcadeConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'global', unique: true },
    weekId: { type: String, default: getDefaultWeekId },
    dailyTargetScore: { type: Number, default: 500 },
    dailyCoinReward: { type: Number, default: 150 },
    runnerMilestoneEnabled: { type: Boolean, default: false },
    runnerMilestoneScore: { type: Number, default: 1500 },
    runnerMilestoneDiscount: { type: Number, default: 10 },
    weeklyChampionDiscount: { type: Number, default: 20 },
    tifoSubmitCoins: { type: Number, default: 50 },
    tifoVoteCoins: { type: Number, default: 25 },
    activeTifoChallenge: {
        challengeId: { type: String, default: 'round-1' },
        isActive: { type: Boolean, default: false },
        title: { type: String, default: 'Derby Virage Tifo Cup' },
        description: { type: String, default: '' },
        prizeText: { type: String, default: '' },
        deadline: { type: String, default: '' }
    },
    runnerPub: {
        isActive: { type: Boolean, default: false },
        title: { type: String, default: 'Weekly Ultras Runner Challenge' },
        prizeText: { type: String, default: '' },
        deadline: { type: String, default: '' }
    },
    challengeHistory: [{
        challengeId: { type: String, required: true },
        title: { type: String, required: true },
        startedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

arcadeConfigSchema.statics.getSingleton = async function () {
    let cfg = await this.findOne({ key: 'global' });
    if (!cfg) {
        cfg = await this.create({ key: 'global' });
    }
    return cfg;
};

module.exports = mongoose.model('ArcadeConfig', arcadeConfigSchema);
