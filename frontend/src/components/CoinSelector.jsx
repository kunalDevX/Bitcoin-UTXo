import { useState } from 'react';

export default function CoinSelector({ address, onOptimize, loading }) {
    const [targetBTC, setTargetBTC] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = parseFloat(targetBTC);
        if (isNaN(val) || val <= 0) {
            setError('Please enter a valid positive BTC amount.');
            return;
        }
        setError('');
        onOptimize(val);
    };

    return (
        <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                Run both <strong style={{ color: 'var(--accent)' }}>Greedy (Largest First)</strong> and{' '}
                <strong style={{ color: 'var(--purple)' }}>Minimum Inputs</strong> strategies to find the
                best coin selection for your target send amount.
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label
                            htmlFor="target-btc"
                            style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}
                        >
                            Target Send Amount (BTC)
                        </label>
                        <input
                            id="target-btc"
                            className="input-number"
                            type="number"
                            step="0.00000001"
                            min="0.00000001"
                            value={targetBTC}
                            onChange={(e) => setTargetBTC(e.target.value)}
                            placeholder="e.g. 0.001"
                        />
                    </div>
                    <div style={{ paddingTop: 24 }}>
                        <button
                            id="optimize-btn"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !address}
                        >
                            {loading ? (
                                <><span className="spinner" style={{ width: 16, height: 16 }} /> Optimizing…</>
                            ) : (
                                '⚡ Run Optimization'
                            )}
                        </button>
                    </div>
                </div>
                {error && (
                    <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>⚠ {error}</p>
                )}
                {!address && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
                        ℹ Fetch UTXOs for an address first.
                    </p>
                )}
            </form>
        </div>
    );
}
