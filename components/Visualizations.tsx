
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Treemap, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import type { AppState, Budget, GlobalTransaction } from '../types';
import { LightbulbIcon, SparklesIcon, LockClosedIcon, ShieldCheckIcon, BuildingLibraryIcon, BanknotesIcon, Squares2x2Icon, ExclamationTriangleIcon } from './Icons';
import { CHART_THEMES } from '../constants';

interface VisualizationsProps {
    state: AppState;
    onBack: () => void;
    onAnalyzeChart: (prompt: string) => Promise<string>;
    activePersona?: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} Jt`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)} rb`;
    return amount;
};

const COLORS = ['#2C3E50', '#1ABC9C', '#F1C40F', '#E74C3C', '#3498DB', '#9B59B6', '#E67E22', '#7F8C8D', '#16A085', '#2980B9'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Handle Treemap payload structure which is slightly different
        const data = payload[0].payload;
        const name = data.name || label;
        const value = data.size !== undefined ? data.size : data.value;
        const color = data.fill || payload[0].color;

        return (
            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg z-50 relative">
                <p className="font-semibold mb-1 text-dark-text">{name}</p>
                <p style={{ color: color }}>
                    {formatCurrency(value)}
                </p>
            </div>
        );
    }
    return null;
};

// --- CUSTOM COMPONENTS ---

const SegmentedControl: React.FC<{
    options: { label: string; value: string }[];
    value: string;
    onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
    const activeIndex = options.findIndex(o => o.value === value);
    
    return (
        <div className="relative bg-gray-200 p-1 rounded-xl flex items-center font-medium shadow-inner">
            {/* Sliding Background */}
            <div 
                className="absolute bg-white rounded-lg shadow-sm h-[calc(100%-8px)] transition-all duration-300 ease-out"
                style={{
                    width: `${100 / options.length}%`,
                    left: `${(activeIndex * 100) / options.length}%`,
                }}
            />
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`relative flex-1 py-2 text-xs sm:text-sm text-center z-10 transition-colors duration-300 ${value === opt.value ? 'text-primary-navy font-bold' : 'text-secondary-gray hover:text-gray-600'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

const CustomizedTreemapContent = (props: any) => {
    const { x, y, width, height, name, size, fill, onClick } = props;
    
    // Logic to determine font size based on box size
    const fontSize = Math.min(width / 5, height / 3, 14);
    const showText = width > 40 && height > 30;

    return (
      <g onClick={() => onClick && onClick({ name, transactions: [] /* Logic handled in parent */ })}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fill,
            stroke: '#fff',
            strokeWidth: 2,
            cursor: 'pointer',
          }}
          className="hover:opacity-80 transition-opacity"
        />
        {showText && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight="bold"
            pointerEvents="none" // Let clicks pass to rect
          >
            <tspan x={x + width / 2} dy="-0.5em">{name}</tspan>
            <tspan x={x + width / 2} dy="1.2em" fontSize={fontSize * 0.8} opacity={0.9}>
                {formatShortCurrency(size)}
            </tspan>
          </text>
        )}
      </g>
    );
  };


const ChartExplanationSection: React.FC<{
    onAnalyze: () => void;
    explanation: string;
    isLoading: boolean;
}> = ({ onAnalyze, explanation, isLoading }) => {
    return (
        <div className="mt-4">
             {!explanation && !isLoading && (
                <button 
                    onClick={onAnalyze}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary-navy font-bold py-2 px-4 rounded-lg transition-colors border border-gray-300"
                >
                    <SparklesIcon className="w-5 h-5 text-warning-yellow" />
                    <span>Jelasin Grafik Ini</span>
                </button>
             )}
             
             {isLoading && (
                 <div className="text-center py-3 bg-gray-50 rounded-lg animate-pulse">
                     <span className="text-sm text-secondary-gray">AI sedang menganalisis grafik...</span>
                 </div>
             )}

             {explanation && (
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 relative mt-2">
                     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 border-t border-l border-blue-200 rotate-45"></div>
                     <div className="flex items-start gap-3">
                        <div className="bg-primary-navy rounded-full p-1 flex-shrink-0 mt-0.5">
                             <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm text-dark-text leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                            {explanation}
                        </div>
                     </div>
                 </div>
             )}
        </div>
    );
}

const TransactionDetailModal: React.FC<{
    data: { category: string; transactions: GlobalTransaction[] };
    onClose: () => void;
}> = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <h3 className="text-lg font-bold text-primary-navy">Detail: {data.category}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {data.transactions.length > 0 ? (
                        <ul className="space-y-2">
                            {data.transactions.map(t => (
                                <li key={t.timestamp} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-semibold text-dark-text">{t.desc}</p>
                                        <p className="text-xs text-secondary-gray mt-1">
                                            {new Date(t.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <p className="font-bold text-danger-red flex-shrink-0 ml-4">
                                        -{formatCurrency(t.amount)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-secondary-gray py-4">Tidak ada transaksi untuk ditampilkan.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- FINANCIAL HEALTH CARD COMPONENT ---
const FinancialHealthCard: React.FC<{
    score: number;
    savingsScore: number;
    expenseScore: number;
    budgetScore: number;
    totalIncome: number;
}> = ({ score, savingsScore, expenseScore, budgetScore, totalIncome }) => {
    let scoreColor = 'text-danger-red';
    let progressColor = 'text-danger-red'; // Changed to text class for SVG stroke
    let feedbackTitle = 'Perlu Perhatian Serius';
    let feedbackDesc = 'Kondisi keuanganmu sedang tidak seimbang. Pengeluaran mungkin terlalu besar dibandingkan pemasukan. Evaluasi ulang anggaranmu segera.';
    let feedbackIcon = ExclamationTriangleIcon;
    let feedbackBg = 'bg-red-50 border-danger-red';

    if (score >= 80) {
        scoreColor = 'text-accent-teal';
        progressColor = 'text-accent-teal';
        feedbackTitle = 'Kondisi Keuangan Prima!';
        feedbackDesc = 'Hebat! Kamu memiliki rasio tabungan yang kuat dan pengeluaran yang terkendali. Pertahankan konsistensi ini.';
        feedbackIcon = ShieldCheckIcon;
        feedbackBg = 'bg-teal-50 border-accent-teal';
    } else if (score >= 50) {
        scoreColor = 'text-warning-yellow';
        progressColor = 'text-warning-yellow';
        feedbackTitle = 'Cukup Sehat';
        feedbackDesc = 'Sudah cukup baik, tapi masih ada ruang untuk perbaikan. Coba kurangi pengeluaran tidak perlu untuk meningkatkan skor.';
        feedbackIcon = LightbulbIcon;
        feedbackBg = 'bg-yellow-50 border-warning-yellow';
    }

    const ScoreBar: React.FC<{ label: string, val: number, icon: React.FC<{className?: string}>, max: number, colorClass: string }> = ({ label, val, icon: Icon, max, colorClass }) => (
        <div className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
                <div className="flex items-center gap-1 text-secondary-gray">
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                </div>
                <span className="font-bold text-dark-text">{Math.round(val)} / {max} Poin</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${(val/max)*100}%` }}></div>
            </div>
        </div>
    );

    if (totalIncome === 0) {
         return (
            <section className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h2 className="text-xl font-bold text-primary-navy text-center mb-2">Skor Kesehatan Finansial</h2>
                <p className="text-center text-secondary-gray text-sm">Belum cukup data pemasukan untuk menghitung skor periode ini.</p>
            </section>
         );
    }

    // Calculate stroke offset for radial progress
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <section className="bg-white rounded-xl p-6 shadow-md mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary-navy">Skor Kesehatan Finansial</h2>
                <button className="text-secondary-gray hover:text-primary-navy">
                   <feedbackIcon className={`w-6 h-6 ${scoreColor}`} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
                {/* Circular Score Indicator */}
                <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                     <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="#f3f4f6"
                            strokeWidth="10"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`${progressColor} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                        <span className="text-xs font-bold text-secondary-gray uppercase tracking-wide mt-1">Skor</span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="flex-grow w-full max-w-md">
                    <ScoreBar label="Rasio Tabungan (Bobot 40%)" val={savingsScore} max={40} icon={BuildingLibraryIcon} colorClass="bg-blue-500" />
                    <ScoreBar label="Beban Pengeluaran (Bobot 30%)" val={expenseScore} max={30} icon={BanknotesIcon} colorClass="bg-orange-400" />
                    <ScoreBar label="Disiplin Anggaran (Bobot 30%)" val={budgetScore} max={30} icon={Squares2x2Icon} colorClass="bg-purple-500" />
                </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg border-l-4 ${feedbackBg}`}>
                <p className="font-bold text-sm text-dark-text">{feedbackTitle}</p>
                <p className="text-xs text-secondary-gray mt-1 leading-relaxed">{feedbackDesc}</p>
            </div>
        </section>
    );
};


const Visualizations: React.FC<VisualizationsProps> = ({ state, onBack, onAnalyzeChart, activePersona }) => {
    type RangeType = '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'all';
    const [filterRange, setFilterRange] = useState<RangeType>('thisMonth');
    const [detailModalData, setDetailModalData] = useState<{ category: string; transactions: GlobalTransaction[] } | null>(null);

    // AI Analysis States
    const [trendExplanation, setTrendExplanation] = useState('');
    const [isTrendLoading, setIsTrendLoading] = useState(false);
    const [budgetExplanation, setBudgetExplanation] = useState('');
    const [isBudgetLoading, setIsBudgetLoading] = useState(false);
    const [allocationExplanation, setAllocationExplanation] = useState('');
    const [isAllocationLoading, setIsAllocationLoading] = useState(false);

    // --- CHART SKINS LOGIC ---
    const trendThemeId = state.activeTrendChartTheme || 'trend_default';
    const trendTheme = CHART_THEMES[trendThemeId] || CHART_THEMES['trend_default'];

    const budgetThemeId = state.activeBudgetChartTheme || 'budget_default';
    const budgetTheme = CHART_THEMES[budgetThemeId] || CHART_THEMES['budget_default'];

    const getHexLuminance = (hex: string) => {
        const c = hex.substring(1);
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >>  8) & 0xff;
        const b = (rgb >>  0) & 0xff;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const getTickColor = (bgHex: string) => {
        return getHexLuminance(bgHex) < 100 ? '#e5e7eb' : '#94a3b8'; // Light text for dark bg, dark text for light bg
    };

    const trendTickColor = getTickColor(trendTheme.bg);
    const budgetTickColor = getTickColor(budgetTheme.bg);


    const allExpenses = useMemo((): GlobalTransaction[] => {
        let expenses: GlobalTransaction[] = [];
        state.archives.forEach(archive => expenses.push(...archive.transactions.filter(t => t.type === 'remove')));
        expenses.push(...state.fundHistory.filter(t => t.type === 'remove').map(t => ({...t, category: 'Pengeluaran Umum'})));
        state.budgets.forEach(b => {
            expenses.push(...b.history.map(h => ({...h, type: 'remove', category: b.name})));
        });
        expenses.push(...state.dailyExpenses.map(t => ({...t, type: 'remove', category: t.sourceCategory || 'Harian'})));
        return expenses;
    }, [state]);
    
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        
        return allExpenses.filter(t => {
            const tDate = new Date(t.timestamp);
            const tTime = tDate.getTime();

            switch (filterRange) {
                case '7d':
                    return tTime >= (Date.now() - (7 * oneDay));
                case '30d':
                    return tTime >= (Date.now() - (30 * oneDay));
                case 'thisMonth':
                     return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
                case 'lastMonth':
                     // Logic for last month
                     const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                     return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear();
                case 'all':
                    return true;
                default:
                    return true;
            }
        });
    }, [allExpenses, filterRange]);

    // --- FINANCIAL HEALTH CALCULATION (Reused Logic based on Filter) ---
    const healthData = useMemo(() => {
        // Note: Health Score usually needs monthly context, but we'll adapt to the filter or default to this month for global score if 'all' selected
        const currentTxns = filteredExpenses;
        
        // Need income for score
        let incomeTxns = state.fundHistory.filter(t => t.type === 'add');
        // Apply same date filter to income
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        incomeTxns = incomeTxns.filter(t => {
             const tTime = t.timestamp;
             const tDate = new Date(tTime);
             if (filterRange === '7d') return tTime >= (Date.now() - 7*oneDay);
             if (filterRange === '30d') return tTime >= (Date.now() - 30*oneDay);
             if (filterRange === 'thisMonth') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
             if (filterRange === 'lastMonth') {
                 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                 return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
             }
             return true;
        });

        const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);

        // Savings (from fundHistory 'remove' transactions starting with 'Tabungan:')
        let savingsTxns = state.fundHistory.filter(t => t.type === 'remove' && t.desc.startsWith('Tabungan:'));
         // Apply filter
         savingsTxns = savingsTxns.filter(t => {
             const tTime = t.timestamp;
             const tDate = new Date(tTime);
             if (filterRange === '7d') return tTime >= (Date.now() - 7*oneDay);
             if (filterRange === '30d') return tTime >= (Date.now() - 30*oneDay);
             if (filterRange === 'thisMonth') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
             if (filterRange === 'lastMonth') {
                 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                 return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
             }
             return true;
        });
        const totalSavings = savingsTxns.reduce((sum, t) => sum + t.amount, 0);

        // Total Expenses calculated earlier
        const totalExpenses = currentTxns.reduce((sum, t) => sum + t.amount, 0);

        if (totalIncome === 0) return { score: 0, savingsScore: 0, expenseScore: 0, budgetScore: 0, totalIncome: 0 };

        // Scoring Logic
        const savingsRatio = totalSavings / totalIncome;
        let savingsRawScore = Math.min(40, Math.max(0, (savingsRatio / 0.20) * 40));

        const expenseRatio = totalExpenses / totalIncome;
        let expenseRawScore = 0;
        if (expenseRatio <= 0.5) expenseRawScore = 30;
        else if (expenseRatio >= 1.0) expenseRawScore = 0;
        else expenseRawScore = 30 - ((expenseRatio - 0.5) / 0.5) * 30;

        // Budget Discipline
        let budgetRawScore = 30; 
        // Simplified budget score for custom ranges: just check overall ratio
        if (expenseRatio > 1.0) budgetRawScore = 0;
        else if (expenseRatio > 0.9) budgetRawScore = 10;
        
        const totalScore = Math.round(savingsRawScore + expenseRawScore + budgetRawScore);

        return {
            score: totalScore,
            savingsScore: savingsRawScore,
            expenseScore: expenseRawScore,
            budgetScore: budgetRawScore,
            totalIncome
        };

    }, [state, filteredExpenses, filterRange]);


    const treemapData = useMemo(() => {
        const expenseByCategory: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
            if (expense.desc && expense.desc.startsWith('Tabungan:')) return;

            const category = expense.category || 'Lain-lain';
            if (!expenseByCategory[category]) {
                expenseByCategory[category] = 0;
            }
            expenseByCategory[category] += expense.amount;
        });

        return Object.entries(expenseByCategory)
            .map(([name, value], index) => ({ 
                name, 
                size: value, // Treemap uses 'size' usually, or 'value'
                fill: COLORS[index % COLORS.length] 
            }))
            .sort((a, b) => b.size - a.size);
    }, [filteredExpenses]);

    const handleTreemapClick = (data: any) => {
        if (!data || !data.name) return;
        const category = data.name;
        const transactions = filteredExpenses
            .filter(e => (e.category || 'Lain-lain') === category && (!e.desc || !e.desc.startsWith('Tabungan:')))
            .sort((a, b) => b.amount - a.amount);
        setDetailModalData({ category, transactions });
    };

    const trendData = useMemo(() => {
        if (filteredExpenses.length === 0) return [];
        
        // Group by date
        const dailyTotals: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
             if (expense.desc && expense.desc.startsWith('Tabungan:')) return;
             const date = new Date(expense.timestamp).toLocaleDateString('fr-CA');
             dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
        });
        
        // Sort dates
        return Object.keys(dailyTotals).sort().map(date => ({
            day: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            total: dailyTotals[date]
        }));

    }, [filteredExpenses]);

    const budgetComparisonData = useMemo(() => {
        // Only relevant for 'thisMonth' usually, but we can show totals for range
        if (filterRange !== 'thisMonth') return []; 

        const expenseByCategory: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
            const category = expense.category || 'Lain-lain';
            if (!expenseByCategory[category]) expenseByCategory[category] = 0;
            expenseByCategory[category] += expense.amount;
        });

        return state.budgets.map(budget => ({
            name: budget.name,
            Dianggarkan: budget.totalBudget,
            Terpakai: expenseByCategory[budget.name] || 0
        }));
    }, [filteredExpenses, state.budgets, filterRange]);
    
    
    // Reset analysis when filter changes
    useEffect(() => {
        setTrendExplanation('');
        setBudgetExplanation('');
        setAllocationExplanation('');
    }, [filterRange]);


    const analyzeTrend = async () => {
        setIsTrendLoading(true);
        const dataStr = JSON.stringify(trendData);
        const prompt = `Jelasin grafik Tren Pengeluaran Harian ini. Analisis pola, lonjakan, dan berikan kesimpulan. Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setTrendExplanation(result);
        setIsTrendLoading(false);
    };

    const analyzeBudget = async () => {
        setIsBudgetLoading(true);
        const dataStr = JSON.stringify(budgetComparisonData);
        const prompt = `Jelasin grafik Perbandingan Anggaran ini. Fokus dana vs terpakai. Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setBudgetExplanation(result);
        setIsBudgetLoading(false);
    };

    const analyzeAllocation = async () => {
        setIsAllocationLoading(true);
        const dataStr = JSON.stringify(treemapData);
        const prompt = `Jelasin grafik Alokasi Pengeluaran (Treemap) ini. Identifikasi kategori dominan. Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setAllocationExplanation(result);
        setIsAllocationLoading(false);
    };

    const rangeOptions = [
        { label: '7 Hari', value: '7d' },
        { label: '30 Hari', value: '30d' },
        { label: 'Bulan Ini', value: 'thisMonth' },
        { label: 'Bulan Lalu', value: 'lastMonth' },
        { label: 'Semua', value: 'all' },
    ];

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-4xl mx-auto space-y-6">
            <style>{`
                .magma-chart path.recharts-area-area {
                    animation: magmaPulse 4s infinite alternate ease-in-out;
                }
                @keyframes magmaPulse {
                    0% { filter: drop-shadow(0 0 2px #f59e0b); }
                    100% { filter: drop-shadow(0 0 8px #ef4444); }
                }
                .glitch-chart {
                    position: relative;
                }
                .glitch-chart::before {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 2px, 3px 100%;
                    pointer-events: none;
                    z-index: 10;
                }
                .gold-chart .recharts-bar-rectangle path {
                    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
                }
            `}</style>
            
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Visualisasi Pengeluaran</h1>
                <div className="max-w-xl mx-auto">
                    <SegmentedControl 
                        options={rangeOptions}
                        value={filterRange}
                        onChange={setFilterRange}
                    />
                </div>
            </header>

            {/* FINANCIAL HEALTH CARD */}
            <FinancialHealthCard 
                score={healthData.score}
                savingsScore={healthData.savingsScore}
                expenseScore={healthData.expenseScore}
                budgetScore={healthData.budgetScore}
                totalIncome={healthData.totalIncome}
            />

            {/* TREND AREA CHART */}
            <section className={`rounded-xl p-6 shadow-md transition-colors duration-500 ${trendTheme.specialClass || ''}`} style={{ backgroundColor: trendTheme.bg }}>
                <h2 className="text-xl font-bold text-center mb-4" style={{ color: trendTickColor === '#e5e7eb' ? '#fff' : '#2C3E50' }}>Tren Pengeluaran</h2>
                <div className="w-full h-80 relative">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={trendTheme.gradientFrom} stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor={trendTheme.gradientTo} stopOpacity={0}/>
                                    </linearGradient>
                                    <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                    
                                    {/* SPECIAL CHART DEFS */}
                                    {/* Magma Flow - Animated Gradient using SVG animate inside stop is valid in some contexts but Recharts rerenders might reset it. Using CSS anim on path instead for flow effect on stroke/fill is harder. Simple gradient for now. */}
                                    <linearGradient id="magmaFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                                        <stop offset="50%" stopColor="#ef4444" stopOpacity={0.6} />
                                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.2} />
                                    </linearGradient>

                                    {/* Glitch Pattern */}
                                    <pattern id="glitchPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                                        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#003b00" strokeWidth="1" />
                                    </pattern>
                                    
                                    {/* Gold 3D Vertical Bar */}
                                    <linearGradient id="gold3DBar" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#bf953f" />
                                        <stop offset="25%" stopColor="#fcf6ba" />
                                        <stop offset="50%" stopColor="#b38728" />
                                        <stop offset="75%" stopColor="#fbf5b7" /> 
                                        <stop offset="100%" stopColor="#aa771c" />
                                    </linearGradient>
                                    <linearGradient id="gold3DBar2" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#aa771c" />
                                        <stop offset="50%" stopColor="#d4af37" />
                                        <stop offset="100%" stopColor="#aa771c" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={trendTheme.grid || (trendTickColor === '#e5e7eb' ? '#374151' : '#f0f0f0')} vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    tick={{fontSize: 11, fill: trendTickColor}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    tickFormatter={formatShortCurrency} 
                                    tick={{fontSize: 11, fill: trendTickColor}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    content={<CustomTooltip />} 
                                    cursor={{ stroke: trendTheme.stroke, strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke={trendTheme.stroke} 
                                    strokeWidth={3}
                                    fill={trendThemeId === 'trend_glitch' ? 'url(#glitchPattern)' : trendThemeId === 'trend_magma' ? 'url(#magmaFlow)' : "url(#colorTrend)"} 
                                    filter={trendThemeId.includes('neon') ? "url(#neonGlow)" : undefined}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-secondary-gray">
                            <p>Tidak ada data pengeluaran.</p>
                        </div>
                    )}
                </div>
                 {trendData.length > 0 && (
                    <ChartExplanationSection 
                        onAnalyze={analyzeTrend} 
                        explanation={trendExplanation} 
                        isLoading={isTrendLoading} 
                    />
                )}
            </section>

            {/* BUDGET COMPARISON (Only for This Month) */}
            {filterRange === 'thisMonth' && budgetComparisonData.length > 0 && (
                <section className={`rounded-xl p-6 shadow-md transition-colors duration-500 ${budgetTheme.specialClass || ''}`} style={{ backgroundColor: budgetTheme.bg }}>
                    <h2 className="text-xl font-bold text-center mb-4" style={{ color: budgetTickColor === '#e5e7eb' ? '#fff' : '#2C3E50' }}>Perbandingan Anggaran</h2>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetComparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={budgetTickColor === '#e5e7eb' ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: budgetTickColor}} />
                                <YAxis tickFormatter={formatShortCurrency} tick={{fontSize: 12, fill: budgetTickColor}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: budgetTickColor }} />
                                <Bar dataKey="Dianggarkan" fill={budgetTheme.bar1} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Terpakai" fill={budgetTheme.bar2} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <ChartExplanationSection 
                        onAnalyze={analyzeBudget} 
                        explanation={budgetExplanation} 
                        isLoading={isBudgetLoading} 
                    />
                </section>
            )}

            {/* INTERACTIVE TREEMAP */}
            <section className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-primary-navy text-center mb-2">Peta Pengeluaran (Treemap)</h2>
                <p className="text-xs text-center text-secondary-gray mb-4">Klik kotak untuk melihat detail transaksi</p>
                
                <div className="w-full h-96">
                   {treemapData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={treemapData}
                            dataKey="size"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedTreemapContent onClick={handleTreemapClick} />}
                        >
                             <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                   ) : (
                    <div className="flex items-center justify-center h-full text-secondary-gray">
                        <p>Tidak ada data pengeluaran.</p>
                    </div>
                   )}
                </div>

                {/* Legend/List below treemap for clarity */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {treemapData.map((item, index) => (
                         <div key={index} className="flex items-center gap-2 text-xs">
                             <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }}></div>
                             <span className="truncate font-medium text-dark-text">{item.name}</span>
                             <span className="text-secondary-gray">{formatShortCurrency(item.size)}</span>
                         </div>
                    ))}
                </div>
                
                 {treemapData.length > 0 && (
                    <ChartExplanationSection 
                        onAnalyze={analyzeAllocation} 
                        explanation={allocationExplanation} 
                        isLoading={isAllocationLoading} 
                    />
                )}
            </section>
            
            {detailModalData && (
                <TransactionDetailModal data={detailModalData} onClose={() => setDetailModalData(null)} />
            )}
        </main>
    );
};

export default Visualizations;
