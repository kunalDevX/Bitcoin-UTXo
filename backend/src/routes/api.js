const express = require('express');
const router = express.Router();

const { validateAddress } = require('../middleware/validate');
const { fetchAndStoreUtxos } = require('../services/utxoService');
const { getUtxos } = require('../services/utxoService');
const { analyzeUtxos } = require('../services/analysisService');
const {
    greedySelect,
    minimumInputsSelect,
    buildOptimizationResult,
} = require('../services/coinSelectionService');
const { getFullFeeEstimation, getFeerate } = require('../services/feeService');
const { validateBitcoinAddress } = require('../utils/addressValidator');

// POST /api/address - register & fetch UTXOs for an address
router.post('/address', validateAddress('body'), async (req, res, next) => {
    try {
        const address = req.body.address.trim();
        const utxos = await fetchAndStoreUtxos(address);
        res.json({
            success: true,
            message: `Fetched ${utxos.length} UTXOs for ${address}`,
            count: utxos.length,
            address,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/utxos/:address - return stored UTXOs
router.get('/utxos/:address', validateAddress('params'), async (req, res, next) => {
    try {
        const address = req.params.address.trim();
        const utxos = await getUtxos(address);
        res.json({ success: true, address, count: utxos.length, utxos });
    } catch (err) {
        next(err);
    }
});

// GET /api/analysis/:address - return full analysis
router.get('/analysis/:address', validateAddress('params'), async (req, res, next) => {
    try {
        const address = req.params.address.trim();
        const utxos = await getUtxos(address);
        const analysis = analyzeUtxos(utxos);
        res.json({ success: true, address, analysis });
    } catch (err) {
        next(err);
    }
});

// POST /api/optimize - run coin selection for both strategies
router.post('/optimize', async (req, res, next) => {
    try {
        const { address, targetBTC } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, error: 'address is required.' });
        }

        const validation = validateBitcoinAddress(address.trim());
        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.message });
        }

        const targetNum = parseFloat(targetBTC);
        if (isNaN(targetNum) || targetNum <= 0) {
            return res.status(400).json({ success: false, error: 'targetBTC must be a positive number.' });
        }

        const targetSatoshis = Math.round(targetNum * 1e8);
        const utxos = await getUtxos(address.trim());

        if (!utxos || utxos.length === 0) {
            return res.status(404).json({ success: false, error: 'No UTXOs found for this address. Please fetch UTXOs first.' });
        }

        // Get current fee rate (medium priority)
        const rates = await getFeerate();
        const feeRateSat = rates.halfHourFee || 5; // sat/vB fallback

        const greedyResult = greedySelect(utxos, targetSatoshis);
        const minInputsResult = minimumInputsSelect(utxos, targetSatoshis);

        const greedy = buildOptimizationResult(greedyResult, feeRateSat, 'Greedy (Largest First)');
        const minInputs = buildOptimizationResult(minInputsResult, feeRateSat, 'Minimum Inputs');

        // Determine winner
        let winner = null;
        if (!greedy.error && !minInputs.error) {
            winner = greedy.estimatedFee <= minInputs.estimatedFee ? 'greedy' : 'minInputs';
        } else if (!greedy.error) {
            winner = 'greedy';
        } else if (!minInputs.error) {
            winner = 'minInputs';
        }

        res.json({
            success: true,
            address,
            targetBTC: targetNum,
            targetSatoshis,
            feeRateUsed: feeRateSat,
            greedy,
            minInputs,
            winner,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/fee - live fee rates + estimate
router.get('/fee', async (req, res, next) => {
    try {
        const inputs = parseInt(req.query.inputs) || 1;
        const outputs = parseInt(req.query.outputs) || 2;
        const estimation = await getFullFeeEstimation(inputs, outputs);
        res.json({ success: true, ...estimation });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
