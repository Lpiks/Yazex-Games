const mongoose = require('mongoose');

const tifoSubmissionSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    pseudo: {
        type: String,
        required: true
    },
    club: {
        type: String,
        default: 'free'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    previewDataUrl: {
        type: String,
        default: ''
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'featured', 'rejected'],
        default: 'approved'
    },
    isWinner: {
        type: Boolean,
        default: false
    },
    challengeId: {
        type: String,
        default: 'round-1'
    },
    challengeTitle: {
        type: String,
        default: 'Derby Virage Tifo Cup'
    },
    weekId: {
        type: String,
        default: ''
    }
}, { timestamps: true });

tifoSubmissionSchema.index({ challengeId: 1, status: 1, votes: -1 });

tifoSubmissionSchema.index({ status: 1, votes: -1, createdAt: -1 });

module.exports = mongoose.model('TifoSubmission', tifoSubmissionSchema);
