import { useState } from 'react';

const EXAMPLE_ADDRESSES = [
    '1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF',  // Known address with real UTXOs
    '3FupZp77ySr7jwoLYEJ9Rx5h60X4nkFnRK',  // P2SH example
];

export default function AddressInput({ onFetch, loading }) {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = address.trim();
        if (!trimmed) {
            setError('Please enter a Bitcoin address.');
            return;
        }
        setError('');
        onFetch(trimmed);
    };

    return (
        <div className="card">
            <div className="card-title">
                <span>🔍</span> Bitcoin Address
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                        id="address-input"
                        className="input-field"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter Bitcoin address (bc1..., 1..., 3...)"
                        autoComplete="off"
                        spellCheck={false}
                        style={{ flex: 1, minWidth: 280 }}
                    />
                    <button
                        id="fetch-utxos-btn"
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Fetching…</> : '⚡ Fetch UTXOs'}
                    </button>
                </div>

                {error && (
                    <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>⚠ {error}</p>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try:</span>
                    {EXAMPLE_ADDRESSES.map((addr) => (
                        <button
                            key={addr}
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setAddress(addr)}
                            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
                        >
                            {addr.slice(0, 12)}…{addr.slice(-6)}
                        </button>
                    ))}
                </div>
            </form>
        </div>
    );
}
