export default function FragmentationMeter({ score = 0, label = 'None' }) {
    const color =
        score >= 70 ? 'var(--red)' : score >= 40 ? 'var(--accent)' : 'var(--green)';

    const gradientId = 'frag-gradient';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Score display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>
                        {score}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        / 100 score
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div
                        className="badge"
                        style={{
                            background: color === 'var(--red)' ? 'var(--red-soft)' : color === 'var(--accent)' ? 'var(--accent-soft)' : 'var(--green-soft)',
                            color,
                            fontSize: 14,
                            padding: '6px 14px',
                        }}
                    >
                        {label} Fragmentation
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                        {score < 40 ? 'Wallet is well consolidated' : score < 70 ? 'Consider consolidating UTXOs' : 'High fragmentation — consolidate now'}
                    </div>
                </div>
            </div>

            {/* Bar */}
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${score}%`,
                        background: `linear-gradient(90deg, var(--green), ${color})`,
                    }}
                />
            </div>

            {/* Scale labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>0 — Low</span>
                <span>40</span>
                <span>70</span>
                <span>100 — High</span>
            </div>
        </div>
    );
}
