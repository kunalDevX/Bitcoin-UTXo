const axios = require('axios');
const mongoose = require('mongoose');
const Utxo = require('../models/Utxo');
const Address = require('../models/Address');
const cache = require('../config/cache');

const MEMPOOL_API = process.env.MEMPOOL_API || 'https://mempool.space/api';
const BLOCKSTREAM_API = process.env.BLOCKSTREAM_API || 'https://blockstream.info/api';

/**
 * Determine script type label from Blockstream/Mempool scriptpubkey_type field.
 */
const detectScriptType = (type) => {
    const map = {
        p2pkh: 'P2PKH',
        p2sh: 'P2SH',
        v0_p2wpkh: 'P2WPKH',
        v0_p2wsh: 'P2WSH',
        v1_p2tr: 'P2TR (Taproot)',
    };
    return map[type] || type || 'Unknown';
};

/**
 * Check if Mongoose is currently connected.
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Throw a clean error for upstream API 4xx responses.
 */
const upstreamError = (response, apiName) => {
    const text =
        typeof response?.data === 'string'
            ? response.data
            : response?.data?.message || response?.statusText || 'Bad request';
    const err = new Error(`${apiName}: ${text}`);
    err.status = response?.status === 404 ? 404 : 400;
    return err;
};

/**
 * Fetch raw UTXOs + current block height.
 * Primary: Mempool.space. Fallback: Blockstream.
 */
const fetchFromAPI = async (address) => {
    // Helper to attempt one API base
    const tryAPI = async (base, name) => {
        const [utxoRes, tipRes] = await Promise.all([
            axios.get(`${base}/address/${address}/utxo`, { timeout: 12000 }),
            axios.get(`${base}/blocks/tip/height`, { timeout: 8000 }),
        ]);
        return {
            rawUtxos: utxoRes.data,
            tipHeight: parseInt(tipRes.data, 10) || 0,
        };
    };

    // Primary: Mempool.space
    try {
        return await tryAPI(MEMPOOL_API, 'Mempool.space');
    } catch (err) {
        if (err.response && err.response.status < 500) {
            const body = err.response.data;
            const msg = typeof body === 'string' ? body : body?.message || '';
            // If Mempool.space rejects due to >500 UTXOs limit, fall back to Blockstream
            if (/too many unspent/i.test(msg)) {
                console.warn('[ERROR] Mempool.space: ' + msg + ' Falling back to Blockstream...');
            } else {
                // Other 4xx — bad address or address not found; surface real message, don't retry
                throw upstreamError(err.response, 'Mempool.space');
            }
        } else {
            // 5xx / network error — try Blockstream as fallback
            console.warn('Mempool.space failed, trying Blockstream:', err.message);
        }
    }

    // Fallback: Blockstream
    try {
        return await tryAPI(BLOCKSTREAM_API, 'Blockstream');
    } catch (err2) {
        if (err2.response && err2.response.status < 500) {
            throw upstreamError(err2.response, 'Blockstream');
        }
        throw new Error(`All Bitcoin APIs failed. Please try again later.`);
    }
};

/**
 * Fetch UTXOs from API and optionally persist to MongoDB.
 */
const fetchAndStoreUtxos = async (address) => {
    const { rawUtxos, tipHeight } = await fetchFromAPI(address);

    const utxoDocs = rawUtxos.map((u) => ({
        txid: u.txid,
        vout: u.vout,
        value: u.value, // satoshis
        blockHeight: u.status?.block_height || null,
        confirmations:
            u.status?.confirmed && u.status?.block_height
                ? tipHeight - u.status.block_height + 1
                : 0,
        scriptType: detectScriptType(u.status?.scriptpubkey_type),
        address,
    }));

    // Persist to MongoDB only when connected
    if (isDbConnected()) {
        try {
            const ops = utxoDocs.map((doc) => ({
                updateOne: {
                    filter: { address: doc.address, txid: doc.txid, vout: doc.vout },
                    update: { $set: doc },
                    upsert: true,
                },
            }));
            if (ops.length > 0) await Utxo.bulkWrite(ops);

            // Remove UTXOs no longer returned by the API (spent)
            const activeTxids = rawUtxos.map((u) => u.txid);
            if (activeTxids.length > 0) {
                await Utxo.deleteMany({ address, txid: { $nin: activeTxids } });
            } else {
                await Utxo.deleteMany({ address });
            }

            await Address.findOneAndUpdate(
                { address },
                { address, lastFetched: new Date(), utxoCount: utxoDocs.length },
                { upsert: true, new: true }
            );
        } catch (dbErr) {
            console.warn('DB write skipped (MongoDB unavailable):', dbErr.message);
        }
    }

    // Refresh cache
    cache.del(`utxos_${address}`);
    cache.set(`utxos_${address}`, utxoDocs);

    return utxoDocs;
};

/**
 * Get UTXOs: in-memory cache → MongoDB (if up) → live API fetch
 */
const getUtxos = async (address) => {
    const cacheKey = `utxos_${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    if (isDbConnected()) {
        try {
            const dbUtxos = await Utxo.find({ address }).lean();
            if (dbUtxos && dbUtxos.length > 0) {
                cache.set(cacheKey, dbUtxos);
                return dbUtxos;
            }
        } catch (dbErr) {
            console.warn('DB read skipped:', dbErr.message);
        }
    }

    return fetchAndStoreUtxos(address);
};

module.exports = { fetchAndStoreUtxos, getUtxos };
