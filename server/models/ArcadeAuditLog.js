const mongoose = require('mongoose');

const arcadeAuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        index: true
        // e.g. 'WEEKLY_CHAMPION', 'TIFO_WINNER', 'PLAYER_REWARD', 'PLAYER_BAN', 'PLAYER_UNBAN', 'SCORE_RESET', 'COINS_ADJUST', 'PASSWORD_RESET', 'ANTI_CHEAT_FLAG'
    },
    targetPseudo: {
        type: String,
        default: ''
    },
    targetId: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

arcadeAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ArcadeAuditLog', arcadeAuditLogSchema);
