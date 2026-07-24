function formatBTC(satoshis) {
    return (satoshis / 1e8).toFixed(8);
}

function formatSats(sats) {
    return sats?.toLocaleString() ?? '0';
}

const STAT_CARDS = (analysis) => [
    {
        id: 'total-balance',
        icon: '₿',
        label: 'Total Balance',
        value: `${formatBTC(analysis.totalBalance)} BTC`,
        sub: `${formatSats(analysis.totalBalance)} sat`,
        accent: 'var(--accent)',
    },
    {
        id: 'utxo-count',
        icon: '📦',
        label: 'UTXO Count',
        value: analysis.count,
        sub: 'unspent outputs',
        accent: 'var(--blue)',
    },
    {
        id: 'avg-value',
        icon: '⚖️',
        label: 'Avg UTXO Size',
        value: `${formatBTC(analysis.avgValue)} BTC`,
        sub: `${formatSats(analysis.avgValue)} sat`,
        accent: 'var(--purple)',
    },
    {
        id: 'dust-count',
        icon: '🌫️',
        label: 'Dust Outputs',
        value: analysis.dustCount,
        sub: `${analysis.dustPercentage}% of total (< 546 sat)`,
        accent: analysis.dustCount > 0 ? 'var(--red)' : 'var(--green)',
    },
    {
        id: 'fragmentation',
        icon: '📊',
        label: 'Fragmentation',
        value: `${analysis.fragmentationScore}/100`,
        sub: analysis.fragmentationLabel,
        accent:
            analysis.fragmentationScore >= 70
                ? 'var(--red)'
                : analysis.fragmentationScore >= 40
                    ? 'var(--accent)'
                    : 'var(--green)',
    },
];

export default function StatsCards({ analysis }) {
    if (!analysis) return null;
    const cards = STAT_CARDS(analysis);
    return (
        <div className="grid-5">
            {cards.map((c) => (
                <div key={c.id} id={c.id} className="stat-card">
                    <div className="stat-card__icon">{c.icon}</div>
                    <div className="stat-card__label">{c.label}</div>
                    <div className="stat-card__value" style={{ color: c.accent }}>
                        {c.value}
                    </div>
                    <div className="stat-card__sub">{c.sub}</div>
                </div>
            ))}
        </div>
    );
}
