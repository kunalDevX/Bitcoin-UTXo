const DUST_THRESHOLD = 546; // satoshis

/**
 * Analyze a list of UTXOs and return summary statistics.
 * @param {Array} utxos - Array of UTXO objects (value in satoshis)
 * @returns {Object} analysis result
 */
const analyzeUtxos = (utxos) => {
    if (!utxos || utxos.length === 0) {
        return {
            totalBalance: 0,
            totalBalanceBTC: 0,
            count: 0,
            avgValue: 0,
            avgValueBTC: 0,
            minValue: 0,
            maxValue: 0,
            dustCount: 0,
            dustPercentage: 0,
            fragmentationScore: 0,
            fragmentationLabel: 'None',
            valueDistribution: [],
        };
    }

    const values = utxos.map((u) => u.value);
    const totalBalance = values.reduce((acc, v) => acc + v, 0);
    const count = utxos.length;
    const avgValue = Math.round(totalBalance / count);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const dustCount = values.filter((v) => v < DUST_THRESHOLD).length;
    const dustPercentage = parseFloat(((dustCount / count) * 100).toFixed(2));

    // Fragmentation Score (0-100)
    // High count of small UTXOs → High score
    // Formula: normalize count and reciprocal of avg value
    const normalizedCount = Math.min(count / 100, 1); // cap at 100 UTXOs = 1.0
    const normalizedSize =
        totalBalance > 0 ? 1 - Math.min(avgValue / (totalBalance / 10), 1) : 0;
    const rawScore = (normalizedCount * 0.5 + normalizedSize * 0.5) * 100;
    const fragmentationScore = parseFloat(rawScore.toFixed(1));

    let fragmentationLabel = 'Low';
    if (fragmentationScore >= 70) fragmentationLabel = 'High';
    else if (fragmentationScore >= 40) fragmentationLabel = 'Medium';

    // Value distribution buckets (for chart)
    const buckets = [
        { label: '< 1K sat', min: 0, max: 1000 },
        { label: '1K–10K', min: 1000, max: 10000 },
        { label: '10K–100K', min: 10000, max: 100000 },
        { label: '100K–1M', min: 100000, max: 1000000 },
        { label: '> 1M sat', min: 1000000, max: Infinity },
    ];

    const valueDistribution = buckets.map((b) => ({
        label: b.label,
        count: values.filter((v) => v >= b.min && v < b.max).length,
    }));

    return {
        totalBalance,
        totalBalanceBTC: parseFloat((totalBalance / 1e8).toFixed(8)),
        count,
        avgValue,
        avgValueBTC: parseFloat((avgValue / 1e8).toFixed(8)),
        minValue,
        maxValue,
        dustCount,
        dustPercentage,
        fragmentationScore,
        fragmentationLabel,
        valueDistribution,
    };
};

module.exports = { analyzeUtxos };
