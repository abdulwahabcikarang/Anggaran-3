
import React, { useState, useMemo, useEffect } from 'react';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import type { AppState, Budget, GlobalTransaction } from '../types';
import { LightbulbIcon, SparklesIcon, LockClosedIcon } from './Icons';

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

    const pieChartData = useMemo(() => {
        const expenseByCategory: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
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
            .filter(e => (e.category || 'Lain-lain') === category)
            .sort((a, b) => b.amount - a.amount); // Sort by amount descending
        setDetailModalData({ category, transactions });
    };

    const trendData = useMemo(() => {
        if (selectedMonth === 'all') return [];

        const dailyTotals: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
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
