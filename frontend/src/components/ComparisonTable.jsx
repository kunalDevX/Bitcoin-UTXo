function formatBTC(sats) {
    if (sats === undefined || sats === null) return '—';
    return (sats / 1e8).toFixed(8);
}

function formatSat(sats) {
    return sats?.toLocaleString() ?? '—';
}

function OptimizationCard({ result, isWinner, accentColor, icon }) {
    if (!result) return null;

    if (result.error) {
        return (
            <div className="card" style={{ opacity: 0.6 }}>
                <div className="card-title" style={{ color: accentColor }}>
                    {icon} {result.strategy}
                </div>
                <div className="error-alert">{result.error}</div>
            </div>
        );
    }

    return (
        <div
            className="card"
            style={{
                borderColor: isWinner ? 'var(--green)' : 'var(--border)',
                boxShadow: isWinner ? '0 0 20px rgba(0, 200, 150, 0.1)' : undefined,
            }}
        >
            <div className="card-title" style={{ color: accentColor, justifyContent: 'space-between' }}>
                <span>{icon} {result.strategy}</span>
                {isWinner && (
                    <span className="winner-badge">✓ Best Strategy</span>
                )}
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
                <StatItem label="Inputs Used" value={result.inputCount} />
                <StatItem label="Tx Size" value={`${result.txSize} bytes`} />
                <StatItem
                    label="Estimated Fee"
                    value={`${formatSat(result.estimatedFee)} sat`}
                    sub={`${result.estimatedFeeBTC} BTC`}
                    color="var(--red)"
                />
                <StatItem
                    label="Change Amount"
                    value={`${formatSat(result.change)} sat`}
                    sub={`${result.changeBTC} BTC`}
                    color="var(--green)"
                />
            </div>
        </div>
    );
}

function StatItem({ label, value, sub, color }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid var(--border)',
            }}
        >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text-primary)' }}>
                {value}
            </div>
            {sub && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
            )}
        </div>
    );
}

export default function ComparisonTable({ optimizeData }) {
    if (!optimizeData) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">⚖️</div>
                <div className="empty-state__text">No optimization results yet</div>
                <div className="empty-state__sub">Enter a target amount and run optimization above</div>
            </div>
        );
    }

    const { greedy, minInputs, winner, targetBTC, feeRateUsed } = optimizeData;

    const greedySaved = greedy?.estimatedFee && minInputs?.estimatedFee
        ? minInputs.estimatedFee - greedy.estimatedFee
        : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
                style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    fontSize: 13,
                }}
            >
                <span>🎯 Target: <strong style={{ color: 'var(--accent)' }}>{targetBTC} BTC</strong></span>
                <span>⛽ Fee Rate: <strong style={{ color: 'var(--blue)' }}>{feeRateUsed} sat/vB</strong> (medium priority)</span>
                {greedySaved !== null && (
                    <span>
                        💡 Savings:{' '}
                        <strong style={{ color: greedySaved < 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                            {Math.abs(greedySaved).toLocaleString()} sat
                            {greedySaved < 0 ? ' saved by Greedy' : greedySaved > 0 ? ' saved by Min Inputs' : ' — equal cost'}
                        </strong>
                    </span>
                )}
            </div>

            <div className="grid-2" style={{ gap: 16 }}>
                <OptimizationCard
                    result={greedy}
                    isWinner={winner === 'greedy'}
                    accentColor="var(--accent)"
                    icon="🏆"
                />
                <OptimizationCard
                    result={minInputs}
                    isWinner={winner === 'minInputs'}
                    accentColor="var(--purple)"
                    icon="⚡"
                />
            </div>

            {/* Flat comparison table */}
            {greedy && minInputs && !greedy.error && !minInputs.error && (
                <>
                    <hr className="divider" />
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mode</th>
                                    <th>Inputs Used</th>
                                    <th>Tx Size</th>
                                    <th>Est. Fee (sat)</th>
                                    <th>Change (sat)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={winner === 'greedy' ? 'winner-row' : ''}>
                                    <td>
                                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                            🏆 Greedy (Largest First)
                                        </span>
                                    </td>
                                    <td className="mono">{greedy.inputCount}</td>
                                    <td className="mono">{greedy.txSize} bytes</td>
                                    <td className="mono" style={{ color: 'var(--red)' }}>{greedy.estimatedFee?.toLocaleString()}</td>
                                    <td className="mono" style={{ color: 'var(--green)' }}>{greedy.change?.toLocaleString()}</td>
                                </tr>
                                <tr className={winner === 'minInputs' ? 'winner-row' : ''}>
                                    <td>
                                        <span style={{ color: 'var(--purple)', fontWeight: 600 }}>
                                            ⚡ Minimum Inputs
                                        </span>
                                    </td>
                                    <td className="mono">{minInputs.inputCount}</td>
                                    <td className="mono">{minInputs.txSize} bytes</td>
                                    <td className="mono" style={{ color: 'var(--red)' }}>{minInputs.estimatedFee?.toLocaleString()}</td>
                                    <td className="mono" style={{ color: 'var(--green)' }}>{minInputs.change?.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
