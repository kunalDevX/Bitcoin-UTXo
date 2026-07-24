const NodeCache = require('node-cache');

// TTL in seconds — default 5 minutes
const cache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL) || 300,
    checkperiod: 60,
});

module.exports = cache;
