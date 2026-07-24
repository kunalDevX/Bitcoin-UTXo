import { useState } from 'react';

const DUST_THRESHOLD = 546;

function truncateTxid(txid) {
    if (!txid) return '—';
    return `${txid.slice(0, 10)}…${txid.slice(-8)}`;
}

function formatBTC(sats) {
    return (sats / 1e8).toFixed(8);
}

const COLUMNS = [
    { key: 'txid', label: 'Transaction ID' },
    { key: 'vout', label: 'Index' },
    { key: 'value', label: 'Amount (BTC)' },
    { key: 'valueSat', label: 'Amount (sat)' },
    { key: 'blockHeight', label: 'Block Height' },
    { key: 'confirmations', label: 'Confirmations' },
    { key: 'scriptType', label: 'Script Type' },
];

export default function UtxoTable({ utxos = [], selectedTxids = [] }) {
    const [sortKey, setSortKey] = useState('value');
    const [sortAsc, setSortAsc] = useState(false);

    const handleSort = (key) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(false); }
    };

    const sorted = [...utxos].sort((a, b) => {
        let av = a[sortKey] ?? 0;
        let bv = b[sortKey] ?? 0;
        if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortAsc ? av - bv : bv - av;
    });

    if (utxos.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">📭</div>
                <div className="empty-state__text">No UTXOs found</div>
                <div className="empty-state__sub">Enter a Bitcoin address and click Fetch UTXOs</div>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        {COLUMNS.map((col) => (
                            <th key={col.key} onClick={() => handleSort(col.key)}>
                                {col.label} {sortKey === col.key ? (sortAsc ? '↑' : '↓') : ''}
                            </th>
                        ))}
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((utxo) => {
                        const isSelected = selectedTxids.includes(utxo.txid);
                        const isDust = utxo.value < DUST_THRESHOLD;
                        return (
                            <tr key={`${utxo.txid}-${utxo.vout}`} className={isSelected ? 'selected' : ''}>
                                <td>
                                    <span
                                        className="mono"
                                        title={utxo.txid}
                                        style={{ color: 'var(--blue)' }}
                                    >
                                        {truncateTxid(utxo.txid)}
                                    </span>
                                </td>
                                <td className="mono">{utxo.vout}</td>
                                <td className="mono" style={{ color: 'var(--accent)' }}>
                                    {formatBTC(utxo.value)}
                                </td>
                                <td className="mono">{utxo.value?.toLocaleString()}</td>
                                <td className="mono">{utxo.blockHeight ?? '—'}</td>
                                <td>
                                    {utxo.confirmations > 0 ? (
                                        <span className="badge badge-green">{utxo.confirmations} conf</span>
                                    ) : (
                                        <span className="badge badge-orange">Unconfirmed</span>
                                    )}
                                </td>
                                <td>
                                    <span className="badge badge-blue">
                                        {utxo.scriptType || 'Unknown'}
                                    </span>
                                </td>
                                <td>
                                    {isDust ? (
                                        <span className="badge badge-red">⚠ Dust</span>
                                    ) : isSelected ? (
                                        <span className="badge badge-green">✓ Selected</span>
                                    ) : (
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Normal</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
