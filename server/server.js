const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.ARCADE_SECRET)) {
    console.error('FATAL: JWT_SECRET and ARCADE_SECRET must be set in production.');
    process.exit(1);
}

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) sanitizeObject(obj[i]);
        return obj;
    }
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else {
            sanitizeObject(obj[key]);
        }
    }
    return obj;
};

const sanitizeNoSql = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
};

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 180,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please slow down.' }
});

const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Admin rate limit exceeded.' }
});

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5174',
        process.env.SHOP_CLIENT_URL || 'http://localhost:5173'
    ],
    credentials: true
}));
app.use('/api/tifo', express.json({ limit: '5mb' }));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use(sanitizeNoSql);
app.use('/api', apiLimiter);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yazex_arcade')
    .then(() => console.log('Yazex Arcade MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    });

app.get('/', (req, res) => res.send('Yazex Arcade API running'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));
app.use('/api/tifo', require('./routes/tifoRoutes'));
app.use('/api/admin', adminLimiter, require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Yazex Arcade server running on port ${PORT}`));
