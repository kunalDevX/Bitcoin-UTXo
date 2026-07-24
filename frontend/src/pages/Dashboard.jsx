import { useState, useCallback } from 'react';
import AddressInput from '../components/AddressInput';
import StatsCards from '../components/StatsCards';
import UtxoTable from '../components/UtxoTable';
import DistributionChart from '../components/DistributionChart';
import FragmentationMeter from '../components/FragmentationMeter';
import FeeEstimator from '../components/FeeEstimator';
import CoinSelector from '../components/CoinSelector';
import ComparisonTable from '../components/ComparisonTable';
import {
    submitAddress,
    fetchUtxos,
    fetchAnalysis,
    fetchFees,
    optimizeUtxos,
} from '../api/utxoApi';

export default function Dashboard() {
    const [address, setAddress] = useState(null);
    const [utxos, setUtxos] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [feeData, setFeeData] = useState(null);
    const [optimizeData, setOptimizeData] = useState(null);
    const [selectedTxids, setSelectedTxids] = useState([]);

    const [fetchLoading, setFetchLoading] = useState(false);
    const [feeLoading, setFeeLoading] = useState(false);
    const [optimizeLoading, setOptimizeLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetch = useCallback(async (addr) => {
        setFetchLoading(true);
        setError(null);
        setUtxos([]);
        setAnalysis(null);
        setOptimizeData(null);
        setSelectedTxids([]);

        try {
            await submitAddress(addr);
            const [utxoRes, analysisRes] = await Promise.all([
                fetchUtxos(addr),
                fetchAnalysis(addr),
            ]);
            setAddress(addr);
            setUtxos(utxoRes.data.utxos || []);
            setAnalysis(utxoRes.data.utxos?.length > 0 ? analysisRes.data.analysis : null);

            // Fetch fee data in parallel
            setFeeLoading(true);
            try {
                const feeRes = await fetchFees(1, 2);
                setFeeData(feeRes.data);
            } catch {
                setFeeData(null);
            } finally {
                setFeeLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch UTXOs.');
        } finally {
            setFetchLoading(false);
        }
    }, []);

    const handleOptimize = useCallback(async (targetBTC) => {
        if (!address) return;
        setOptimizeLoading(true);
        setError(null);
        try {
            const res = await optimizeUtxos(address, targetBTC);
            const data = res.data;
            setOptimizeData(data);

            // Highlight selected UTXOs from the winning strategy
            const winner = data.winner === 'greedy' ? data.greedy : data.minInputs;
            if (winner?.selectedUtxos) {
                setSelectedTxids(winner.selectedUtxos.map((u) => u.txid));
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Optimization failed.');
        } finally {
            setOptimizeLoading(false);
        }
    }, [address]);

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Header */}
            <header
                style={{
                    borderBottom: '1px solid var(--border)',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div className="container" style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                boxShadow: '0 4px 12px rgba(247, 147, 26, 0.4)',
                            }}
                        >
                            ₿
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                UTXO Viewer
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart Bitcoin Optimization</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {address && (
                            <span className="badge badge-green" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                                ● {address.slice(0, 10)}…{address.slice(-6)}
                            </span>
                        )}
                        <span className="badge badge-orange">Mainnet</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container" style={{ padding: '32px 24px' }}>

                {/* Address Input */}
                <div className="section">
                    <AddressInput onFetch={handleFetch} loading={fetchLoading} />
                </div>

                {/* Error */}
                {error && (
                    <div className="section">
                        <div className="error-alert">
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Loading overlay while fetching */}
                {fetchLoading && (
                    <div className="section">
                        <div className="loading-overlay">
                            <div className="spinner" style={{ width: 28, height: 28 }} />
                            <span>Fetching UTXOs from blockchain…</span>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {analysis && !fetchLoading && (
                    <div className="section">
                        <StatsCards analysis={analysis} />
                    </div>
                )}

                {/* Analysis Section — Chart + Fragmentation */}
                {analysis && !fetchLoading && (
                    <div className="section grid-2" style={{ gap: 20 }}>
                        <div className="card">
                            <div className="card-title">📊 UTXO Value Distribution</div>
                            <DistributionChart distribution={analysis.valueDistribution} />
                        </div>
                        <div className="card">
                            <div className="card-title">🧩 Fragmentation Score</div>
                            <FragmentationMeter
                                score={analysis.fragmentationScore}
                                label={analysis.fragmentationLabel}
                            />
                            <hr className="divider" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <MiniStat label="Min UTXO" value={`${(analysis.minValue / 1e8).toFixed(8)} BTC`} />
                                <MiniStat label="Max UTXO" value={`${(analysis.maxValue / 1e8).toFixed(8)} BTC`} />
                                <MiniStat label="Dust Count" value={`${analysis.dustCount} (< 546 sat)`} color={analysis.dustCount > 0 ? 'var(--red)' : 'var(--green)'} />
                                <MiniStat label="Dust %" value={`${analysis.dustPercentage}%`} color={analysis.dustPercentage > 10 ? 'var(--red)' : 'var(--text-primary)'} />
                            </div>
                        </div>
                    </div>
                )}

                {/* UTXO Table */}
                {utxos.length > 0 && !fetchLoading && (
                    <div className="section">
                        <div className="card" style={{ padding: 0 }}>
                            <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div className="card-title" style={{ marginBottom: 0 }}>
                                    📋 UTXO List
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className="badge badge-blue">{utxos.length} UTXOs</span>
                                    {selectedTxids.length > 0 && (
                                        <span className="badge badge-orange">{selectedTxids.length} selected</span>
                                    )}
                                </div>
                            </div>
                            <UtxoTable utxos={utxos} selectedTxids={selectedTxids} />
                        </div>
                    </div>
                )}

                {/* Empty state after fetch */}
                {address && utxos.length === 0 && !fetchLoading && !error && (
                    <div className="section">
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state__icon">🏜️</div>
                                <div className="empty-state__text">No UTXOs found for this address</div>
                                <div className="empty-state__sub">This address has no unspent outputs on the Bitcoin mainnet.</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fee Estimator + Coin Selector */}
                {(address || feeData) && (
                    <div className="section grid-2" style={{ gap: 20 }}>
                        <div className="card">
                            <div className="card-title">⛽ Live Fee Estimator</div>
                            <FeeEstimator feeData={feeData} loading={feeLoading} />
                        </div>
                        <div className="card">
                            <div className="card-title">🪙 Smart Coin Selection</div>
                            <CoinSelector
                                address={address}
                                onOptimize={handleOptimize}
                                loading={optimizeLoading}
                            />
                        </div>
                    </div>
                )}

                {/* Optimization Results */}
                {optimizeLoading && (
                    <div className="section">
                        <div className="loading-overlay">
                            <div className="spinner" style={{ width: 24, height: 24 }} />
                            <span>Running coin selection algorithms…</span>
                        </div>
                    </div>
                )}

                {optimizeData && !optimizeLoading && (
                    <div className="section">
                        <div className="card">
                            <div className="card-title">⚖️ Strategy Comparison</div>
                            <ComparisonTable optimizeData={optimizeData} />
                        </div>
                    </div>
                )}

                {/* Welcome state */}
                {!address && !fetchLoading && (
                    <div className="section" style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>₿</div>
                        <h2 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, var(--accent), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
                            Smart Bitcoin UTXO Viewer
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto 12px' }}>
                            Analyze your Bitcoin UTXOs, estimate fees, and optimize coin selection — all with real blockchain data.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                            {['UTXO Analysis', 'Fee Estimation', 'Coin Selection', 'Fragmentation Score'].map((f) => (
                                <span key={f} className="badge badge-orange" style={{ fontSize: 12, padding: '6px 14px' }}>{f}</span>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Smart Bitcoin UTXO Viewer · Powered by Blockstream & Mempool.space · View-only, no private keys
            </footer>
        </div>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
        </div>
    );
}
