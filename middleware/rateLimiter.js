const hits = new Map();

const parseWindowMs = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 15 * 60 * 1000;
};

module.exports = ({ limit = 20, windowMs = parseWindowMs(process.env.RATE_LIMIT_WINDOW_MS) } = {}) => {
    return (req, res, next) => {
        const now = Date.now();
        const key = `${req.ip}:${req.originalUrl}`;
        const current = hits.get(key) || { count: 0, resetAt: now + windowMs };

        if (current.resetAt <= now) {
            current.count = 0;
            current.resetAt = now + windowMs;
        }

        current.count += 1;
        hits.set(key, current);

        res.setHeader('RateLimit-Limit', limit);
        res.setHeader('RateLimit-Remaining', Math.max(limit - current.count, 0));
        res.setHeader('RateLimit-Reset', Math.ceil(current.resetAt / 1000));

        if (current.count > limit) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Too many requests, please try again later'
            });
        }

        next();
    };
};
