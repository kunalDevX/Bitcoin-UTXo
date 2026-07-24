/**
 * Coin Selection Service
 * Implements two deterministic strategies for selecting UTXOs to cover a target amount.
 */

/**
 * Estimate transaction size in bytes.
 * size = (inputs × 148) + (outputs × 34) + 10
 * Outputs = 2 (recipient + change)
 */
const estimateTxSize = (inputCount, outputCount = 2) =>
    inputCount * 148 + outputCount * 34 + 10;

/**
 * Greedy Algorithm — select largest UTXOs first.
 * @param {Array} utxos - array of UTXO objects with .value in satoshis
 * @param {number} targetSatoshis
 * @returns {{ selected: Array, totalInput: number, change: number, txSize: number }}
 */
const greedySelect = (utxos, targetSatoshis) => {
    const sorted = [...utxos].sort((a, b) => b.value - a.value);
    const selected = [];
    let totalInput = 0;

    for (const utxo of sorted) {
        if (totalInput >= targetSatoshis) break;
        selected.push(utxo);
        totalInput += utxo.value;
    }

    if (totalInput < targetSatoshis) {
        return { error: 'Insufficient funds', selected: [], totalInput: 0, change: 0, txSize: 0 };
    }

    const txSize = estimateTxSize(selected.length);
    const change = totalInput - targetSatoshis;

    return { selected, totalInput, change, txSize };
};

/**
 * Minimum Inputs Strategy — use the fewest UTXOs to cover target.
 * Sorts ascending and picks from the largest to use the fewest inputs.
 * @param {Array} utxos
 * @param {number} targetSatoshis
 * @returns {{ selected: Array, totalInput: number, change: number, txSize: number }}
 */
const minimumInputsSelect = (utxos, targetSatoshis) => {
    // Sort descending — same as greedy but we stop exactly at the minimum needed
    const sorted = [...utxos].sort((a, b) => b.value - a.value);
    const selected = [];
    let totalInput = 0;

    for (const utxo of sorted) {
        selected.push(utxo);
        totalInput += utxo.value;
        if (totalInput >= targetSatoshis) break;
    }

    if (totalInput < targetSatoshis) {
        return { error: 'Insufficient funds', selected: [], totalInput: 0, change: 0, txSize: 0 };
    }

    const txSize = estimateTxSize(selected.length);
    const change = totalInput - targetSatoshis;

    return { selected, totalInput, change, txSize };
};

/**
 * Build full optimization result for a given strategy result + fee rate.
 */
const buildOptimizationResult = (result, feeRateSat, label) => {
    if (result.error) return { strategy: label, error: result.error };

    const estimatedFee = Math.round(result.txSize * feeRateSat);
    const netChange = result.change - estimatedFee;

    return {
        strategy: label,
        inputCount: result.selected.length,
        selectedUtxos: result.selected,
        totalInput: result.totalInput,
        totalInputBTC: parseFloat((result.totalInput / 1e8).toFixed(8)),
        txSize: result.txSize,
        estimatedFee,
        estimatedFeeBTC: parseFloat((estimatedFee / 1e8).toFixed(8)),
        change: Math.max(netChange, 0),
        changeBTC: parseFloat((Math.max(netChange, 0) / 1e8).toFixed(8)),
    };
};

module.exports = { greedySelect, minimumInputsSelect, buildOptimizationResult, estimateTxSize };
