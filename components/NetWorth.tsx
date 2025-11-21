
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AppState, Asset } from '../types';
import { CircleStackIcon, PlusCircleIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from './Icons';
import { CountUp } from './UI';

interface NetWorthProps {
    state: AppState;
    currentCashAsset: number;
    onAddAsset: () => void;
    onEditAsset: (assetId: number) => void;
    onDeleteAsset: (assetId: number) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#2C3E50', '#1ABC9C', '#F1C40F', '#9B59B6']; 
// Navy (Manual), Teal (Cash), Yellow (Gold), Purple (Crypto)

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                <p className="font-semibold mb-1 text-dark-text">{payload[0].name}</p>
                <p style={{ color: payload[0].payload.fill }}>
                    {`${formatCurrency(payload[0].value)} (${(payload[0].payload.percent * 100).toFixed(1)}%)`}
                </p>
            </div>
        );
    }
    return null;
};

// --- LIVE PRICE SIMULATION ENGINE ---
// Base prices (Mock data)
const BASE_PRICES: Record<string, number> = {
    'BTC': 950000000,
    'ETH': 45000000,
    'SOL': 2300000,
    'ANTAM': 1350000, // Per gram
    'UBS': 1335000, // Per gram
};

const NetWorth: React.FC<NetWorthProps> = ({ state, currentCashAsset, onAddAsset, onEditAsset, onDeleteAsset }) => {
    // Local state for live prices
    const [livePrices, setLivePrices] = useState<Record<string, number>>(BASE_PRICES);
    const [priceTrends, setPriceTrends] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});

    // Simulation Effect
    useEffect(() => {
        const simulateMarket = () => {
            setLivePrices(prevPrices => {
                const newPrices: Record<string, number> = {};
                const newTrends: Record<string, 'up' | 'down' | 'neutral'> = {};
                
                Object.keys(prevPrices).forEach(symbol => {
                    const currentPrice = prevPrices[symbol];
                    // Random fluctuation between -0.5% and +0.5%
                    const changePercent = (Math.random() * 0.01) - 0.005; 
                    const newPrice = currentPrice * (1 + changePercent);
                    
                    newPrices[symbol] = newPrice;
                    newTrends[symbol] = newPrice > currentPrice ? 'up' : 'down';
                });
                
                setPriceTrends(newTrends);
                return newPrices;
            });
        };

        // Update every 3 seconds
        const interval = setInterval(simulateMarket, 3000);
        return () => clearInterval(interval);
    }, []);

    // Calculate Asset Values
    const calculatedAssets = useMemo(() => {
        return state.assets.map(asset => {
            let currentValue = asset.pricePerUnit;
            let isLive = false;

            if (asset.type !== 'custom' && asset.symbol && livePrices[asset.symbol]) {
                currentValue = livePrices[asset.symbol];
                isLive = true;
            }

            return {
                ...asset,
                currentPricePerUnit: currentValue,
                totalValue: currentValue * asset.quantity,
                isLive
            };
        });
    }, [state.assets, livePrices]);

    const totalNonCashAssetValue = useMemo(() => {
        return calculatedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    }, [calculatedAssets]);

    const netWorth = currentCashAsset + totalNonCashAssetValue;

    // Group data for Pie Chart
    const pieChartData = useMemo(() => {
        const manualValue = calculatedAssets.filter(a => a.type === 'custom').reduce((sum, a) => sum + a.totalValue, 0);
        const goldValue = calculatedAssets.filter(a => a.type === 'gold').reduce((sum, a) => sum + a.totalValue, 0);
        const cryptoValue = calculatedAssets.filter(a => a.type === 'crypto').reduce((sum, a) => sum + a.totalValue, 0);

        return [
            { name: 'Manual/Properti', value: manualValue, fill: COLORS[0] },
            { name: 'Aset Tunai', value: currentCashAsset, fill: COLORS[1] },
            { name: 'Emas (Live)', value: goldValue, fill: COLORS[2] },
            { name: 'Kripto (Live)', value: cryptoValue, fill: COLORS[3] },
        ].filter(d => d.value > 0);
    }, [calculatedAssets, currentCashAsset]);

    return (
        <main className="p-4 pb-24 animate-fade-in space-y-6">
            <h1 className="text-3xl font-bold text-primary-navy text-center">Aset & Kekayaan Bersih</h1>
            
            <section className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-primary-navy">
                <h2 className="text-sm font-medium text-secondary-gray">Total Nilai Bersih (Real-time)</h2>
                <p className="font-bold text-4xl text-primary-navy mt-1">
                    <CountUp end={netWorth} formatter={formatCurrency} duration={1500} />
                </p>
                {calculatedAssets.some(a => a.isLive) && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-green-600 animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Live Market Active
                    </div>
                )}
            </section>

            <section className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-primary-navy text-center mb-4">Alokasi Aset</h2>
                {pieChartData.length > 0 ? (
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{fontSize: '14px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center text-secondary-gray py-8">
                        <p>Mulai tambahkan aset untuk melihat alokasi kekayaan Anda.</p>
                    </div>
                )}
            </section>
            
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-primary-navy">Inventaris Aset</h2>
                    <button onClick={onAddAsset} className="flex items-center space-x-2 bg-accent-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-teal-dark transition-colors shadow">
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Tambah</span>
                    </button>
                </div>
                
                {state.assets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md space-y-4">
                        <CircleStackIcon className="w-16 h-16 mx-auto text-secondary-gray opacity-50" />
                        <p className="text-secondary-gray">Anda belum menambahkan aset non-tunai.</p>
                        <p className="text-secondary-gray text-sm">Bisa berupa Properti, Emas, atau Aset Digital.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {calculatedAssets.map(asset => (
                            <div key={asset.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-dark-text">{asset.name}</h3>
                                            {asset.isLive && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${asset.type === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-secondary-gray mt-1">
                                            {asset.quantity} unit 
                                            {asset.symbol ? ` (${asset.symbol})` : ''}
                                            <span className="mx-1">•</span> 
                                            @ {formatCurrency(asset.currentPricePerUnit)}
                                            {asset.isLive && asset.symbol && priceTrends[asset.symbol] === 'up' && (
                                                <ArrowTrendingUpIcon className="w-3 h-3 text-green-500 inline ml-1" />
                                            )}
                                            {asset.isLive && asset.symbol && priceTrends[asset.symbol] === 'down' && (
                                                <ArrowTrendingDownIcon className="w-3 h-3 text-red-500 inline ml-1" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`font-bold text-lg ${asset.isLive ? (priceTrends[asset.symbol!] === 'up' ? 'text-green-600' : 'text-red-600') : 'text-primary-navy'} transition-colors duration-500`}>
                                            {formatCurrency(asset.totalValue)}
                                        </p>
                                        {asset.isLive && (
                                            <p className="text-[10px] text-secondary-gray">Market Price</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-3 border-t pt-3">
                                    <button onClick={() => onEditAsset(asset.id)} className="text-sm font-semibold text-secondary-gray hover:text-primary-navy py-1 px-3">Edit</button>
                                    <button onClick={() => onDeleteAsset(asset.id)} className="text-sm font-semibold text-secondary-gray hover:text-danger-red py-1 px-3">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
};

export default NetWorth;
