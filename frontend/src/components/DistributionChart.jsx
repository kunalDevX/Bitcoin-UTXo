import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const COLORS = ['#ff4d6a', '#f7931a', '#4dabf7', '#9d79f5', '#00c896'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#1a2040',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: 13,
            }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
                <p style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {payload[0].value} {payload[0].value === 1 ? 'UTXO' : 'UTXOs'}
                </p>
            </div>
        );
    }
    return null;
};

export default function DistributionChart({ distribution = [] }) {
    if (!distribution || distribution.every((d) => d.count === 0)) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">📈</div>
                <div className="empty-state__text">No distribution data</div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={distribution}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                barCategoryGap="30%"
            >
                <XAxis
                    dataKey="label"
                    tick={{ fill: '#8a93b0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#8a93b0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {distribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
