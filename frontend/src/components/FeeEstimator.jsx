function formatBTC(sats) {
    if (sats === undefined || sats === null) return '—';
    return (sats / 1e8).toFixed(8);
}

function FeeRow({ label, feeRate, txSize, feeSat, feeBTC }) {
    const colors = { High: 'var(--red)', Medium: 'var(--accent)', Low: 'var(--green)' };
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                border: '1px solid var(--border)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                    style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: colors[label] || 'var(--text-muted)',
                        display: 'inline-block',
                        boxShadow: `0 0 6px ${colors[label] || 'transparent'}`,
                    }}
                />
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {label} Priority
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {feeRate} sat/vB · {txSize} bytes
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors[label] }}>
                    {feeSat?.toLocaleString()} sat
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {feeBTC} BTC
                </div>
            </div>
        </div>
    );
}

export default function FeeEstimator({ feeData, loading }) {
    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner" />
                <span>Fetching live fee rates…</span>
            </div>
        );
    }

    if (!feeData) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">⛽</div>
                <div className="empty-state__text">Fee data unavailable</div>
                <div className="empty-state__sub">Live rates are loaded after fetching UTXOs</div>
            </div>
        );
    }

    const { rates, estimation } = feeData;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FeeRow
                label="High"
                feeRate={rates.high}
                txSize={estimation.high.txSize}
                feeSat={estimation.high.fee}
                feeBTC={estimation.high.feeBTC}
            />
            <FeeRow
                label="Medium"
                feeRate={rates.medium}
                txSize={estimation.medium.txSize}
                feeSat={estimation.medium.fee}
                feeBTC={estimation.medium.feeBTC}
            />
            <FeeRow
                label="Low"
                feeRate={rates.low}
                txSize={estimation.low.txSize}
                feeSat={estimation.low.fee}
                feeBTC={estimation.low.feeBTC}
            />
            <div
                style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 6,
                }}
            >
                <span>🟢</span>
                <span>Economy rate: {rates.economy} sat/vB · Live via Mempool.space</span>
            </div>
        </div>
    );
}
