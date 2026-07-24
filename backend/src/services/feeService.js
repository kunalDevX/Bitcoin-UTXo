const axios = require('axios');
const cache = require('../config/cache');

const MEMPOOL_API = process.env.MEMPOOL_API || 'https://mempool.space/api';
const { estimateTxSize } = require('./coinSelectionService');

/**
 * Fetch real-time fee rates from Mempool.space
 * Returns: { fastestFee, halfHourFee, hourFee, economyFee, minimumFee } (sat/vB)
 */
const getFeerate = async () => {
    const cacheKey = 'fee_rates';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${MEMPOOL_API}/v1/fees/recommended`, { timeout: 8000 });
    const rates = response.data;

    // Cache for 60 seconds
    cache.set(cacheKey, rates, 60);
    return rates;
};

/**
 * Calculate fee for given inputs, outputs, fee rate
 */
const calculateFee = (inputCount, feeRateSatPerVB, outputCount = 2) => {
    const txSize = estimateTxSize(inputCount, outputCount);
    return {
        txSize,
        fee: Math.round(txSize * feeRateSatPerVB),
        feeBTC: parseFloat(((txSize * feeRateSatPerVB) / 1e8).toFixed(8)),
    };
};

/**
 * Get full fee estimation for display (low/medium/high)
 */
const getFullFeeEstimation = async (inputCount = 1, outputCount = 2) => {
    const rates = await getFeerate();

    return {
        rates: {
            high: rates.fastestFee,
            medium: rates.halfHourFee,
            low: rates.hourFee,
            economy: rates.economyFee,
        },
        estimation: {
            high: calculateFee(inputCount, rates.fastestFee, outputCount),
            medium: calculateFee(inputCount, rates.halfHourFee, outputCount),
            low: calculateFee(inputCount, rates.hourFee, outputCount),
        },
    };
};

module.exports = { getFeerate, calculateFee, getFullFeeEstimation };
