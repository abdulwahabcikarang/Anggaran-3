
import React, { useState, useMemo, useEffect } from 'react';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import type { AppState, Budget, GlobalTransaction } from '../types';
import { LightbulbIcon, SparklesIcon, LockClosedIcon, ShieldCheckIcon, BuildingLibraryIcon, BanknotesIcon, Squares2x2Icon, ExclamationTriangleIcon } from './Icons';

interface VisualizationsProps {
    state: AppState;
    onBack: () => void;
    onAnalyzeChart: (prompt: string) => Promise<string>;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} Jt`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)} rb`;
    return amount;
};


const COLORS = ['#2C3E50', '#1ABC9C', '#F1C40F', '#E74C3C', '#3498DB', '#9B59B6', '#E67E22', '#7F8C8D'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                <p className="font-semibold mb-1 text-dark-text">{label || payload[0].name}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color || pld.fill }}>
                        {`${pld.name}: ${formatCurrency(pld.value)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
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
                    <h3 className="text-lg font-bold text-primary-navy">Detail Transaksi: {data.category}</h3>
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


const Visualizations: React.FC<VisualizationsProps> = ({ state, onBack, onAnalyzeChart }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [detailModalData, setDetailModalData] = useState<{ category: string; transactions: GlobalTransaction[] } | null>(null);

    // AI Analysis States
    const [trendExplanation, setTrendExplanation] = useState('');
    const [isTrendLoading, setIsTrendLoading] = useState(false);
    
    const [budgetExplanation, setBudgetExplanation] = useState('');
    const [isBudgetLoading, setIsBudgetLoading] = useState(false);

    const [allocationExplanation, setAllocationExplanation] = useState('');
    const [isAllocationLoading, setIsAllocationLoading] = useState(false);


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
    
    const monthOptions = useMemo(() => {
        const options = new Set(allExpenses.map(t => new Date(t.timestamp).toISOString().slice(0, 7)));
        // Get current month if no other data exists
        if (options.size === 0) {
            options.add(new Date().toISOString().slice(0, 7));
        }
        return ['all', ...[...options].sort().reverse()];
    }, [allExpenses]);
    
    const filteredExpenses = useMemo(() => {
         return selectedMonth === 'all' 
            ? allExpenses 
            : allExpenses.filter(e => new Date(e.timestamp).toISOString().startsWith(selectedMonth));
    }, [allExpenses, selectedMonth]);

    // --- FINANCIAL HEALTH CALCULATION ---
    const healthData = useMemo(() => {
        const isAllTime = selectedMonth === 'all';
        const currentMonthPrefix = selectedMonth;

        // 1. Calculate Income
        const incomeTxns = state.fundHistory.filter(t => t.type === 'add' && (isAllTime || new Date(t.timestamp).toISOString().startsWith(currentMonthPrefix)));
        const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);

        // 2. Calculate Savings
        // LOGIC: Savings are identified by transactions in fundHistory that are 'remove' type AND start with 'Tabungan:'
        const savingsTxns = state.fundHistory.filter(t => t.type === 'remove' && t.desc.startsWith('Tabungan:') && (isAllTime || new Date(t.timestamp).toISOString().startsWith(currentMonthPrefix)));
        const totalSavings = savingsTxns.reduce((sum, t) => sum + t.amount, 0);

        // 3. Calculate Total Expenses (General + Budget + Daily) - EXCLUDING Savings transactions
        // General (excluding savings)
        const generalExpenseTxns = state.fundHistory.filter(t => t.type === 'remove' && !t.desc.startsWith('Tabungan:') && (isAllTime || new Date(t.timestamp).toISOString().startsWith(currentMonthPrefix)));
        const generalExpenses = generalExpenseTxns.reduce((sum, t) => sum + t.amount, 0);
        // Budget Usage
        const budgetTxns = state.budgets.flatMap(b => b.history).filter(t => (isAllTime || new Date(t.timestamp).toISOString().startsWith(currentMonthPrefix)));
        const budgetExpenses = budgetTxns.reduce((sum, t) => sum + t.amount, 0);
        // Daily
        const dailyTxns = state.dailyExpenses.filter(t => (isAllTime || new Date(t.timestamp).toISOString().startsWith(currentMonthPrefix)));
        const dailyExpenses = dailyTxns.reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = generalExpenses + budgetExpenses + dailyExpenses;

        if (totalIncome === 0) {
            return { score: 0, savingsScore: 0, expenseScore: 0, budgetScore: 0, totalIncome: 0 };
        }

        // --- SCORING LOGIC ---

        // 1. Savings Ratio (Weight 40%)
        // Target: 20% Savings = 100% Score.
        // Raw Ratio
        const savingsRatio = totalSavings / totalIncome;
        // Normalized Score (0.2 -> 40 points)
        let savingsRawScore = (savingsRatio / 0.20) * 40; 
        savingsRawScore = Math.min(40, Math.max(0, savingsRawScore));

        // 2. Expense Burden (Weight 30%)
        // Target: < 50% Expense = 100% Score. > 100% Expense = 0% Score.
        const expenseRatio = totalExpenses / totalIncome;
        let expenseRawScore = 0;
        if (expenseRatio <= 0.5) {
            expenseRawScore = 30; // Perfect score for this component
        } else if (expenseRatio >= 1.0) {
            expenseRawScore = 0;
        } else {
            // Linear interpolation between 0.5 (30 pts) and 1.0 (0 pts)
            // Formula: 30 - ((Ratio - 0.5) / 0.5) * 30
            expenseRawScore = 30 - ((expenseRatio - 0.5) / 0.5) * 30;
        }

        // 3. Budget Discipline (Weight 30%)
        let budgetRawScore = 30; // Default to max if no budgets
        if (state.budgets.length > 0) {
            let overBudgetCount = 0;
            state.budgets.forEach(b => {
                const usage = b.history
                    .filter(h => isAllTime || new Date(h.timestamp).toISOString().startsWith(currentMonthPrefix))
                    .reduce((s, h) => s + h.amount, 0);
                if (b.totalBudget > 0 && usage > b.totalBudget) {
                    overBudgetCount++;
                }
            });
            budgetRawScore = ((state.budgets.length - overBudgetCount) / state.budgets.length) * 30;
        }

        const totalScore = Math.round(savingsRawScore + expenseRawScore + budgetRawScore);

        return {
            score: totalScore,
            savingsScore: savingsRawScore,
            expenseScore: expenseRawScore,
            budgetScore: budgetRawScore,
            totalIncome
        };

    }, [state, selectedMonth]);


    const pieChartData = useMemo(() => {
        const expenseByCategory: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
            // Exclude savings from pie chart to show spending only
            if (expense.desc && expense.desc.startsWith('Tabungan:')) return;

            const category = expense.category || 'Lain-lain';
            if (!expenseByCategory[category]) {
                expenseByCategory[category] = 0;
            }
            expenseByCategory[category] += expense.amount;
        });

        return Object.entries(expenseByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    const handlePieClick = (data: any) => {
        if (!data || !data.name) return;
        const category = data.name;
        const transactions = filteredExpenses
            .filter(e => (e.category || 'Lain-lain') === category && (!e.desc || !e.desc.startsWith('Tabungan:')))
            .sort((a, b) => b.amount - a.amount); // Sort by amount descending
        setDetailModalData({ category, transactions });
    };

    const trendData = useMemo(() => {
        if (selectedMonth === 'all') return [];

        const dailyTotals: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
            // Exclude savings
            if (expense.desc && expense.desc.startsWith('Tabungan:')) return;

            const date = new Date(expense.timestamp).toLocaleDateString('fr-CA'); // YYYY-MM-DD format
            if (!dailyTotals[date]) {
                dailyTotals[date] = 0;
            }
            dailyTotals[date] += expense.amount;
        });

        const daysInMonth = new Date(Number(selectedMonth.slice(0,4)), Number(selectedMonth.slice(5,7)), 0).getDate();
        const data = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${selectedMonth}-${String(i).padStart(2, '0')}`;
            data.push({
                day: String(i),
                total: dailyTotals[dateStr] || 0,
            });
        }
        return data;
    }, [filteredExpenses, selectedMonth]);

    const budgetComparisonData = useMemo(() => {
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
    }, [filteredExpenses, state.budgets]);
    
    const titleText = selectedMonth === 'all' 
                    ? 'Semua Waktu' 
                    : new Date(selectedMonth + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Reset analysis when month changes
    useEffect(() => {
        setTrendExplanation('');
        setBudgetExplanation('');
        setAllocationExplanation('');
    }, [selectedMonth]);


    const analyzeTrend = async () => {
        setIsTrendLoading(true);
        const dataStr = JSON.stringify(trendData.filter(d => d.total > 0));
        const prompt = `Jelasin grafik Tren Pengeluaran Harian ini dengan pas (tidak kepanjangan, tidak kedekitan). Analisis pola pengeluaran, soroti tanggal dengan lonjakan tinggi, dan berikan kesimpulan tentang kebiasaan belanja. Buat ringkas namun tetap menjelaskan detail penting. Gunakan bahasa teman perempuan yang friendly (panggil 'Kak' atau 'Kamu', jangan 'bro'). Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setTrendExplanation(result);
        setIsTrendLoading(false);
    };

    const analyzeBudget = async () => {
        setIsBudgetLoading(true);
        const dataStr = JSON.stringify(budgetComparisonData);
        const prompt = `Jelasin grafik Perbandingan Anggaran ini dengan proporsional (tidak terlalu panjang). Fokus analisis pada perbandingan dana vs terpakai. Sebutkan kategori yang boros dan yang hemat secara spesifik. Berikan detail yang perlu saja agar informatif tapi tidak lelah dibaca. Gunakan bahasa teman perempuan yang friendly (panggil 'Kak' atau 'Kamu', jangan 'bro'). Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setBudgetExplanation(result);
        setIsBudgetLoading(false);
    };

    const analyzeAllocation = async () => {
        setIsAllocationLoading(true);
        const dataStr = JSON.stringify(pieChartData);
        const prompt = `Jelasin grafik Alokasi Pengeluaran ini dengan seimbang. Identifikasi kategori dominan dan analisis apakah proporsinya sehat. Berikan penjelasan yang padat berisi (insightful) tanpa terlalu panjang lebar. Gunakan bahasa teman perempuan yang friendly (panggil 'Kak' atau 'Kamu', jangan 'bro'). Data: ${dataStr}`;
        const result = await onAnalyzeChart(prompt);
        setAllocationExplanation(result);
        setIsAllocationLoading(false);
    };

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-4xl mx-auto space-y-6">
            <style>{`
                .clickable-pie .recharts-pie-sector {
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .clickable-pie .recharts-pie-sector:hover {
                    opacity: 0.8;
                }
            `}</style>
            
            <header>
                <h1 className="text-3xl font-bold text-primary-navy text-center">Visualisasi Pengeluaran</h1>
                <div className="mt-4 max-w-md mx-auto">
                    <label htmlFor="month-filter-visual" className="block text-sm font-medium text-secondary-gray mb-1">Pilih Periode Laporan</label>
                    <select id="month-filter-visual" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        {monthOptions.map(month => (
                            <option key={month} value={month}>
                                {month === 'all' ? 'Semua Waktu' : new Date(month + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
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

            {selectedMonth !== 'all' && (
                <section className="bg-white rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-primary-navy text-center mb-4">{`Tren Pengeluaran Harian (${titleText})`}</h2>
                    <div className="w-full h-80">
                        {trendData.length > 0 && trendData.some(d => d.total > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis tickFormatter={formatShortCurrency} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" name="Total Pengeluaran" stroke="#2C3E50" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-full text-secondary-gray">
                                <p>Tidak ada data pengeluaran pada periode ini.</p>
                            </div>
                        )}
                    </div>
                     {trendData.length > 0 && trendData.some(d => d.total > 0) && (
                        <ChartExplanationSection 
                            onAnalyze={analyzeTrend} 
                            explanation={trendExplanation} 
                            isLoading={isTrendLoading} 
                        />
                    )}
                </section>
            )}

            {budgetComparisonData.length > 0 && (
                <section className="bg-white rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-primary-navy text-center mb-4">{`Perbandingan Anggaran (${titleText})`}</h2>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetComparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={formatShortCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Dianggarkan" fill="#3498DB" />
                                <Bar dataKey="Terpakai" fill="#E67E22" />
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

            <section className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-primary-navy text-center mb-4">{`Alokasi Pengeluaran (${titleText})`}</h2>
                <div className="w-full h-80 mb-6">
                   {pieChartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart className="clickable-pie">
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={handlePieClick}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: '14px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                   ) : (
                    <div className="flex items-center justify-center h-full text-secondary-gray">
                        <p>Tidak ada data pengeluaran pada periode ini.</p>
                    </div>
                   )}
                </div>

                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Terpakai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pieChartData.length > 0 ? pieChartData.map((item, index) => (
                            <tr key={index} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-dark-text whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4 text-right font-semibold text-primary-navy">{formatCurrency(item.value)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={2} className="text-center py-4">Tidak ada data.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 {pieChartData.length > 0 && (
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
