
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { AppState, GlobalTransaction } from '../types';
import { SparklesIcon, CalendarDaysIcon, ListBulletIcon, ChevronLeftIcon, ChevronRightIcon, BudgetIcon, TrashIcon, LockClosedIcon, ArrowDownTrayIcon, DocumentTextIcon, CheckCircleIcon, ArrowUturnLeftIcon } from './Icons';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
    state: AppState;
    onBack: () => void;
    onEditAsset: () => void;
    onDeleteTransaction: (timestamp: number) => void;
    onEditTransaction: (timestamp: number, desc: string, amount: number) => void;
    aiSearchResults: GlobalTransaction[] | null;
    isSearchingWithAI: boolean;
    aiSearchError: string | null;
    onAiSearch: (query: string) => void;
    onClearAiSearch: () => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatNumberInput = (value: string | number) => {
    const numString = String(value).replace(/[^0-9]/g, '');
    if (numString === '') return '';
    return new Intl.NumberFormat('id-ID').format(Number(numString));
};
const getRawNumber = (value: string) => Number(value.replace(/[^0-9]/g, ''));
const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}jt`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}rb`;
    return amount;
};

const Chip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
            active 
            ? 'bg-primary-navy text-white border-primary-navy shadow-sm' 
            : 'bg-white/60 text-secondary-gray border-gray-200 hover:bg-white'
        }`}
    >
        {label}
    </button>
);

// New Micro-Chart Component
const SimpleSparkline = ({ data, color, width = 60, height = 20 }: { data: number[], color: string, width?: number, height?: number }) => {
    if (data.length < 2 || data.every(d => d === 0)) return null;

    const max = Math.max(...data);
    const min = 0;
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-end" title="Tren pengeluaran 7 hari terakhir">
             <svg width={width} height={height} className="overflow-visible">
                <polyline 
                    points={points} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="opacity-80"
                />
                {/* Dot at the end */}
                <circle 
                    cx={width} 
                    cy={height - ((data[data.length-1] - min) / range) * height} 
                    r="2" 
                    fill={color} 
                />
            </svg>
        </div>
    );
};

const Reports: React.FC<ReportsProps> = ({ 
    state, onBack, onEditAsset, onDeleteTransaction, onEditTransaction,
    aiSearchResults, isSearchingWithAI, aiSearchError, onAiSearch, onClearAiSearch 
}) => {
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    
    // Focus Mode State
    const [expandedTxId, setExpandedTxId] = useState<number | null>(null);
    
    const monthPickerRef = useRef<HTMLDivElement>(null);

    // For hiding header on scroll
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
        return () => {
            document.removeEventListener('mousedown', handleClick, true);
        };
    }, []);

    useEffect(() => {
        const container = scrollableContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const currentScrollY = container.scrollTop;
            if (Math.abs(currentScrollY - lastScrollY.current) < 20) return;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsHeaderVisible(false); 
            } else if (currentScrollY < lastScrollY.current) {
                setIsHeaderVisible(true); 
            }
            lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
        };
        
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);

    }, [viewMode]);


    const allTransactions = useMemo((): GlobalTransaction[] => {
        let transactions: GlobalTransaction[] = [];
        state.archives.forEach(archive => transactions.push(...archive.transactions));
        transactions.push(...state.fundHistory);
        transactions.push(...state.dailyExpenses.map(t => {
            const overageBudget = t.sourceCategory ? state.budgets.find(b => b.name === t.sourceCategory) : null;
            return {
                ...t,
                type: 'remove',
                category: t.sourceCategory || 'Harian',
                icon: overageBudget?.icon,
                color: overageBudget?.color
            };
        }));
        state.budgets.forEach(b => {
            transactions.push(...b.history.map(h => ({...h, type: 'remove' as const, category: b.name, icon: b.icon, color: b.color })));
        });
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }, [state]);

    // Create a map of DateString -> TotalExpense for Sparklines
    const dailyExpenseMap = useMemo(() => {
        const map: { [date: string]: number } = {};
        allTransactions.forEach(t => {
            if (t.type === 'remove') {
                const date = new Date(t.timestamp).toLocaleDateString('fr-CA');
                map[date] = (map[date] || 0) + t.amount;
            }
        });
        return map;
    }, [allTransactions]);

    const totalAsset = useMemo(() => allTransactions.reduce((sum, t) => t.type === 'add' ? sum + t.amount : sum - t.amount, 0), [allTransactions]);

    const monthOptions = useMemo(() => {
        const options = new Set(allTransactions.map(t => new Date(t.timestamp).toISOString().slice(0, 7)));
        return [...options].sort().reverse();
    }, [allTransactions]);
    
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allTransactions.forEach(t => {
            if (t.category) cats.add(t.category);
        });
        return Array.from(cats).sort();
    }, [allTransactions]);

    const transactionsToDisplay = useMemo(() => {
        if (aiSearchResults !== null) {
            return aiSearchResults;
        }

        let filtered = allTransactions.filter(t => {
            const monthMatch = selectedMonth === 'all' || new Date(t.timestamp).toISOString().startsWith(selectedMonth);
            return monthMatch;
        });
        
        if (filterCategory !== 'Semua') {
            if (filterCategory === 'Pemasukan') {
                filtered = filtered.filter(t => t.type === 'add');
            } else if (filterCategory === 'Pengeluaran') {
                filtered = filtered.filter(t => t.type === 'remove');
            } else {
                filtered = filtered.filter(t => t.category === filterCategory);
            }
        }

        if (searchQuery.trim()) {
            const lowercasedQuery = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(t => 
                t.desc.toLowerCase().includes(lowercasedQuery) ||
                (t.category && t.category.toLowerCase().includes(lowercasedQuery))
            );
        }

        return filtered;
    }, [allTransactions, selectedMonth, aiSearchResults, searchQuery, filterCategory]);
    
    const summaryExpense = useMemo(() => {
        return transactionsToDisplay.reduce((sum, t) => (t.type === 'remove' ? sum + t.amount : sum), 0);
    }, [transactionsToDisplay]);

    const summaryIncome = useMemo(() => {
        return transactionsToDisplay.reduce((sum, t) => (t.type === 'add' ? sum + t.amount : sum), 0);
    }, [transactionsToDisplay]);

    // AMBIENT BACKGROUND LOGIC
    const ambientBgClass = useMemo(() => {
        const balance = summaryIncome - summaryExpense;
        if (balance >= 0) {
            // Surplus: Teal to Blue (Calm)
            return "bg-gradient-to-b from-teal-50 via-blue-50 to-white";
        } else {
            // Deficit/High Spend: Orange to Pink (Alert)
            return "bg-gradient-to-b from-orange-50 via-red-50 to-white";
        }
    }, [summaryIncome, summaryExpense]);

    const groupedTransactions = useMemo(() => {
        const groups: { [date: string]: { transactions: GlobalTransaction[], dailyTotal: number } } = {};

        transactionsToDisplay.forEach(t => {
            const date = new Date(t.timestamp).toLocaleDateString('fr-CA'); // YYYY-MM-DD
            if (!groups[date]) {
                groups[date] = { transactions: [], dailyTotal: 0 };
            }
            groups[date].transactions.push(t);
            if (t.type === 'remove') {
                groups[date].dailyTotal += t.amount;
            }
        });

        return groups;
    }, [transactionsToDisplay]);

    const handleAiSearchClick = () => {
        if (searchQuery.trim()) {
            onAiSearch(searchQuery);
        }
    };
    
    const calendarTransactionsByDate = useMemo(() => {
        const groups: { [date: string]: { income: number, expense: number, transactions: GlobalTransaction[] } } = {};
        allTransactions.forEach(t => {
            const date = new Date(t.timestamp).toLocaleDateString('fr-CA'); // YYYY-MM-DD
            if (!groups[date]) {
                groups[date] = { income: 0, expense: 0, transactions: [] };
            }
            if (t.type === 'add') groups[date].income += t.amount;
            else groups[date].expense += t.amount;
            groups[date].transactions.push(t);
        });
        return groups;
    }, [allTransactions]);

    const changeMonth = (offset: number) => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); 
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setSelectedDate(null);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const title = `Laporan Keuangan - ${displayMonthText}`;
        const timestamp = new Date().toLocaleString('id-ID');

        // --- HEADER ---
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text("Anggaran 3", 14, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(title, 14, 30);
        
        doc.setFontSize(10);
        doc.text(`Dibuat pada: ${timestamp}`, 14, 38);

        // --- SUMMARY SECTION ---
        const summaryData = [
            ['Total Pemasukan', formatCurrency(summaryIncome)],
            ['Total Pengeluaran', formatCurrency(summaryExpense)],
            ['Selisih (Net)', formatCurrency(summaryIncome - summaryExpense)]
        ];

        autoTable(doc, {
            startY: 45,
            head: [['Ringkasan', 'Jumlah']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 100 },
                1: { halign: 'right' }
            },
            margin: { left: 14, right: 14 }
        });

        // --- TRANSACTIONS TABLE ---
        const tableBody = transactionsToDisplay.map(t => [
            new Date(t.timestamp).toLocaleDateString('id-ID'),
            t.desc,
            t.category || '-',
            t.type === 'add' ? formatCurrency(t.amount) : '-',
            t.type === 'remove' ? formatCurrency(t.amount) : '-'
        ]);

        autoTable(doc, {
            // @ts-ignore 
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Tanggal', 'Keterangan', 'Kategori', 'Pemasukan', 'Pengeluaran']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [26, 188, 156] }, 
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 25 },
                3: { halign: 'right', textColor: [22, 160, 133] }, 
                4: { halign: 'right', textColor: [231, 76, 60] }  
            },
             margin: { left: 14, right: 14 }
        });

        doc.save(`Laporan_${selectedMonth}.pdf`);
    };

    // --- FOCUS MODE ITEM ---
    const TimelineItem: React.FC<{
        t: GlobalTransaction, 
        isLast: boolean, 
        isExpanded: boolean,
        onToggle: () => void,
        onDelete: (ts: number) => void, 
        onSaveEdit: (ts: number, desc: string, amount: number) => void
    }> = ({t, isLast, isExpanded, onToggle, onDelete, onSaveEdit}) => {
         const color = t.color || (t.type === 'add' ? '#1ABC9C' : '#E74C3C');
         
         // Edit State
         const [editDesc, setEditDesc] = useState(t.desc);
         const [editAmount, setEditAmount] = useState(formatNumberInput(t.amount));

         useEffect(() => {
             if(isExpanded) {
                 setEditDesc(t.desc);
                 setEditAmount(formatNumberInput(t.amount));
             }
         }, [isExpanded, t]);

         const handleSave = (e: React.MouseEvent) => {
             e.stopPropagation();
             onSaveEdit(t.timestamp, editDesc, getRawNumber(editAmount));
             onToggle(); // Collapse after save
         };

         return (
            <div className="relative pl-4 sm:pl-8 py-2 group">
                {/* Timeline Dot */}
                <div 
                    className={`absolute left-[-5px] top-5 w-3 h-3 rounded-full border-2 border-white ring-2 z-10 transition-all duration-300 ${isExpanded ? 'scale-150 ring-primary-navy' : 'ring-transparent group-hover:scale-125'}`}
                    style={{ borderColor: color, backgroundColor: color }}
                />
                
                {/* Time Label */}
                 <div className="absolute left-[-60px] top-4 w-12 text-right text-xs font-medium text-secondary-gray hidden sm:block">
                    {new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
    
                {/* Card */}
                <div 
                    onClick={!isExpanded ? onToggle : undefined}
                    className={`
                        bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                        ${isExpanded 
                            ? 'shadow-xl border-primary-navy ring-1 ring-primary-navy/10 scale-[1.02] z-10' 
                            : 'shadow-sm border-gray-100 hover:shadow-md hover:border-blue-200'
                        }
                    `}
                >
                     <div className="p-4">
                        {isExpanded ? (
                            <div className="animate-fade-in space-y-3 cursor-default" onClick={e => e.stopPropagation()}>
                                <div>
                                    <label className="text-xs font-bold text-secondary-gray uppercase">Keterangan</label>
                                    <input 
                                        value={editDesc} 
                                        onChange={e => setEditDesc(e.target.value)}
                                        className="w-full border-b border-gray-300 focus:border-primary-navy focus:outline-none py-1 font-semibold text-dark-text"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary-gray uppercase">Jumlah</label>
                                    <input 
                                        value={editAmount} 
                                        onChange={e => setEditAmount(formatNumberInput(e.target.value))}
                                        inputMode="numeric"
                                        className="w-full border-b border-gray-300 focus:border-primary-navy focus:outline-none py-1 font-semibold text-dark-text"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={onToggle} className="px-3 py-1.5 rounded text-sm text-gray-500 hover:bg-gray-100 font-medium">
                                        Batal
                                    </button>
                                    <button onClick={() => onDelete(t.timestamp)} className="px-3 py-1.5 rounded text-sm text-danger-red hover:bg-red-50 font-medium flex items-center gap-1">
                                        <TrashIcon className="w-4 h-4" /> Hapus
                                    </button>
                                    <button onClick={handleSave} className="px-4 py-1.5 rounded bg-primary-navy text-white text-sm font-bold hover:bg-primary-navy-dark flex items-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4" /> Simpan
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="sm:hidden text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-secondary-gray">
                                            {new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <h4 className="font-bold text-dark-text truncate text-sm sm:text-base">{t.desc}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-secondary-gray">
                                        {t.icon ? <BudgetIcon icon={t.icon} className="w-3 h-3" /> : <ListBulletIcon className="w-3 h-3"/>}
                                        <span>{t.category || (t.type === 'add' ? 'Pemasukan' : 'Umum')}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`font-bold text-sm sm:text-base ${t.type === 'add' ? 'text-accent-teal' : 'text-danger-red'}`}>
                                        {t.type === 'add' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </span>
                                </div>
                             </div>
                        )}
                     </div>
                </div>
            </div>
        );
    };

    const displayMonthText = selectedMonth === 'all' 
        ? 'Semua Waktu' 
        : new Date(selectedMonth + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const totalAssetSection = (
        <section className="mt-6 pb-32">
             <div onClick={onEditAsset} className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-white transition-colors">
                 <div>
                    <h2 className="text-sm font-bold text-primary-navy">Total Aset Likuid</h2>
                    <p className="text-xs text-secondary-gray">Dana Umum + Dompet</p>
                 </div>
                 <p className="text-xl font-bold text-primary-navy">{formatCurrency(totalAsset)}</p>
            </div>
        </section>
    );

    return (
        <main className={`h-full flex flex-col animate-fade-in ${ambientBgClass}`}>
            {/* Fixed Header */}
            <div className={`z-40 p-4 sticky top-0 transition-all duration-300 ease-in-out ${isHeaderVisible ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-4">
                    <div className="flex items-center gap-3">
                         <button onClick={onBack} className="p-2 rounded-full bg-white/50 hover:bg-white shadow-sm">
                            <ArrowUturnLeftIcon className="w-5 h-5 text-primary-navy" />
                         </button>
                         <h1 className="text-2xl font-bold text-primary-navy">Laporan</h1>
                    </div>
                    
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="bg-white/60 p-1 rounded-lg flex space-x-1 shadow-sm">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary-navy text-white shadow' : 'text-secondary-gray hover:bg-white'}`}><ListBulletIcon className="w-5 h-5" /></button>
                            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-primary-navy text-white shadow' : 'text-secondary-gray hover:bg-white'}`}><CalendarDaysIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="relative" ref={monthPickerRef}>
                            <button
                                onClick={() => setIsMonthPickerOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-200 transition-all"
                            >
                                <span className="text-sm font-bold text-primary-navy">
                                    {selectedMonth === 'all' 
                                        ? 'Semua' 
                                        : new Date(selectedMonth + '-02').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                                    }
                                </span>
                                <CalendarDaysIcon className="w-4 h-4 text-secondary-gray" />
                            </button>
                            {isMonthPickerOpen && (
                                <div className="absolute z-50 mt-2 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto animate-fade-in-up">
                                    <button 
                                        onClick={() => { setSelectedMonth('all'); setIsMonthPickerOpen(false); }}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium border-b border-gray-50"
                                    >
                                        Semua Waktu
                                    </button>
                                    {monthOptions.map(month => (
                                        <button 
                                            key={month} 
                                            onClick={() => { setSelectedMonth(month); setIsMonthPickerOpen(false); }}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-secondary-gray hover:text-primary-navy"
                                        >
                                            {new Date(month + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            
                {viewMode === 'list' && (
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isHeaderVisible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                            <Chip label="Semua" active={filterCategory === 'Semua'} onClick={() => setFilterCategory('Semua')} />
                            <Chip label="Pemasukan" active={filterCategory === 'Pemasukan'} onClick={() => setFilterCategory('Pemasukan')} />
                            <Chip label="Pengeluaran" active={filterCategory === 'Pengeluaran'} onClick={() => setFilterCategory('Pengeluaran')} />
                            {categories.map(cat => (
                                <Chip key={cat} label={cat} active={filterCategory === cat} onClick={() => setFilterCategory(cat)} />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <input 
                                    type="text" 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    placeholder="Cari transaksi..." 
                                    className="w-full pl-4 pr-10 py-2.5 bg-white/60 border border-transparent focus:bg-white focus:border-primary-navy/30 rounded-xl focus:outline-none focus:ring-0 transition-all shadow-sm text-sm"
                                    disabled={isSearchingWithAI}
                                />
                                {searchQuery && (
                                    <button onClick={() => {setSearchQuery(''); onClearAiSearch();}} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                        &times;
                                    </button>
                                )}
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAiSearchClick}
                                className="bg-primary-navy text-white p-2.5 rounded-xl hover:bg-primary-navy-dark transition-colors disabled:opacity-50 shadow-md" 
                                disabled={isSearchingWithAI || !searchQuery.trim()}
                            >
                                <SparklesIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {aiSearchError && <p className="text-xs text-danger-red mt-1">{aiSearchError}</p>}
                    </div>
                )}
            </div>
            
            {viewMode === 'list' && (
                <div className="flex-grow flex flex-col overflow-hidden">
                    {isSearchingWithAI && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy mx-auto"></div>
                            <p className="mt-2 text-secondary-gray text-sm">AI sedang mencari...</p>
                        </div>
                    )}

                    <div ref={scrollableContainerRef} className="flex-grow overflow-y-auto px-4 no-scrollbar">
                        {Object.keys(groupedTransactions).length === 0 && !isSearchingWithAI ? (
                            <div className="flex flex-col items-center justify-center h-64 text-secondary-gray">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <ListBulletIcon className="w-10 h-10 opacity-20" />
                                </div>
                                <h3 className="text-lg font-semibold text-dark-text">Belum Ada Data</h3>
                                <p className="text-sm opacity-60">Transaksi Anda akan muncul di sini.</p>
                            </div>
                        ) : (
                            Object.keys(groupedTransactions).map((date) => {
                                const group = groupedTransactions[date];
                                const aDate = new Date(date + 'T00:00:00');
                                
                                // Generate last 7 days data for sparkline
                                const sparklineData = [];
                                for (let i = 6; i >= 0; i--) {
                                    const d = new Date(aDate);
                                    d.setDate(d.getDate() - i);
                                    const dStr = d.toLocaleDateString('fr-CA');
                                    sparklineData.push(dailyExpenseMap[dStr] || 0);
                                }

                                return (
                                <div key={date} className="mb-6">
                                    {/* Timeline Header (Sticky Date) */}
                                    <div className="sticky top-0 z-20 py-2 mb-2 flex justify-between items-end bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm border-b border-gray-100">
                                        <div className="flex items-baseline gap-2 pl-2">
                                            <span className="text-2xl font-bold text-primary-navy">{aDate.getDate()}</span>
                                            <div>
                                                <div className="font-bold text-dark-text text-sm leading-none">{aDate.toLocaleDateString('id-ID', { month: 'long' })}</div>
                                                <div className="text-[10px] text-secondary-gray uppercase tracking-wide">{aDate.toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Sparkline & Total */}
                                        <div className="flex items-end gap-4 pr-2">
                                            <SimpleSparkline data={sparklineData} color="#E74C3C" />
                                            {group.dailyTotal > 0 && (
                                                <div className="text-right">
                                                    <span className="text-[10px] text-secondary-gray block uppercase tracking-wider">Keluar</span>
                                                    <span className="font-bold text-danger-red text-sm">-{formatShortCurrency(group.dailyTotal)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Timeline Container */}
                                    <div className="ml-2 sm:ml-16 border-l-2 border-gray-200/60 space-y-1 pb-2">
                                        {group.transactions.map((t, idx) => (
                                            <TimelineItem 
                                                key={t.timestamp} 
                                                t={t} 
                                                isLast={idx === group.transactions.length - 1}
                                                isExpanded={expandedTxId === t.timestamp}
                                                onToggle={() => setExpandedTxId(prev => prev === t.timestamp ? null : t.timestamp)}
                                                onDelete={onDeleteTransaction}
                                                onSaveEdit={onEditTransaction}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )})
                        )}

                        {/* Footer Summary - Static now */}
                        <div className="mt-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-xs text-secondary-gray uppercase font-bold">Pengeluaran</p>
                                    <p className="text-lg font-bold text-danger-red">{formatCurrency(summaryExpense)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-secondary-gray uppercase font-bold">Pemasukan</p>
                                    <p className="text-lg font-bold text-accent-teal">{formatCurrency(summaryIncome)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleDownloadPDF}
                                disabled={transactionsToDisplay.length === 0}
                                className="w-full flex items-center justify-center gap-2 bg-primary-navy text-white font-bold py-3 rounded-xl hover:bg-primary-navy-dark transition-colors disabled:bg-gray-300 text-sm shadow-lg shadow-primary-navy/20"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span>Unduh PDF Laporan</span>
                            </button>
                        </div>

                        {/* Total Asset Section */}
                        {totalAssetSection}
                    </div>
                </div>
            )}

            {viewMode === 'calendar' && (
               <div className="p-6 overflow-y-auto">
                   <CalendarView 
                       currentDate={calendarDate}
                       transactionsByDate={calendarTransactionsByDate}
                       selectedDate={selectedDate}
                       onDateClick={(date) => setSelectedDate(prev => prev === date ? null : date)}
                       onChangeMonth={changeMonth}
                       onDeleteTransaction={onDeleteTransaction}
                       onEditTransaction={(t) => onEditTransaction(t.timestamp, t.desc, t.amount)} 
                       TransactionItem={({t, onDelete}) => (
                           <TimelineItem 
                                t={t} 
                                isLast={false} 
                                isExpanded={expandedTxId === t.timestamp}
                                onToggle={() => setExpandedTxId(prev => prev === t.timestamp ? null : t.timestamp)}
                                onDelete={onDelete} 
                                onSaveEdit={onEditTransaction}
                           />
                       )}
                   />
                   {/* Total Asset Section for Calendar View */}
                   {totalAssetSection}
               </div>
            )}
        </main>
    );
};


const CalendarView: React.FC<{
    currentDate: Date;
    transactionsByDate: { [key: string]: { income: number, expense: number, transactions: GlobalTransaction[] }};
    selectedDate: string | null;
    onDateClick: (date: string) => void;
    onChangeMonth: (offset: number) => void;
    onDeleteTransaction: (timestamp: number) => void;
    onEditTransaction: (t: GlobalTransaction) => void;
    TransactionItem: React.FC<{t: GlobalTransaction, onDelete: (ts: number) => void, onEdit: (t: GlobalTransaction) => void}>;
}> = ({ currentDate, transactionsByDate, selectedDate, onDateClick, onChangeMonth, onDeleteTransaction, onEditTransaction, TransactionItem }) => {
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ key: `prev-${i}`, isCurrentMonth: false });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({ 
                key: dateStr, 
                day, 
                date: dateStr, 
                isCurrentMonth: true, 
                data: transactionsByDate[dateStr] 
            });
        }
        return days;
    }, [currentDate, transactionsByDate]);

    const today = new Date().toLocaleDateString('fr-CA');

    const getHeatmapColor = (income: number, expense: number) => {
        if (income === 0 && expense === 0) return 'bg-white border-gray-200';
        if (income > expense) return 'bg-green-100 border-green-300';
        const netExpense = expense - income;
        if (netExpense < 50000) return 'bg-red-50 border-red-200';
        if (netExpense < 200000) return 'bg-red-100 border-red-300';
        return 'bg-red-200 border-red-400';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <button onClick={() => onChangeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-6 h-6 text-primary-navy" /></button>
                <h3 className="text-lg font-bold text-primary-navy">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => onChangeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-6 h-6 text-primary-navy" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-secondary-gray">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(dayInfo => {
                    if (!dayInfo.isCurrentMonth) return <div key={dayInfo.key} className="h-20 sm:h-24"></div>;
                    
                    const isSelected = selectedDate === dayInfo.date;
                    const isToday = today === dayInfo.date;
                    const income = dayInfo.data?.income || 0;
                    const expense = dayInfo.data?.expense || 0;
                    
                    const bgClass = isSelected 
                        ? 'bg-primary-navy text-white ring-2 ring-primary-navy border-transparent shadow-lg transform scale-105 z-10'
                        : getHeatmapColor(income, expense);

                    return (
                        <div 
                            key={dayInfo.key} 
                            onClick={() => onDateClick(dayInfo.date!)}
                            className={`relative h-20 sm:h-24 p-1 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between
                                ${bgClass}
                                ${isToday && !isSelected ? 'ring-2 ring-accent-teal border-transparent' : ''}
                                hover:shadow-md
                            `}
                        >
                            <span className={`text-sm font-bold ml-1 mt-1 ${isSelected ? 'text-white' : (isToday ? 'text-accent-teal' : 'text-dark-text')}`}>{dayInfo.day}</span>
                            {dayInfo.data && (
                                <div className="flex flex-col items-end pr-1 pb-1">
                                    {income > 0 && <p className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-green-300' : 'text-accent-teal'}`}>+{formatShortCurrency(income)}</p>}
                                    {expense > 0 && <p className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-red-300' : 'text-danger-red'}`}>-{formatShortCurrency(expense)}</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="mt-8 animate-fade-in bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <h4 className="font-bold text-primary-navy mb-4 pb-2 border-b flex justify-between items-center">
                        <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <span className="text-xs font-normal text-secondary-gray">Detail Harian</span>
                    </h4>
                     <div className="max-h-80 overflow-y-auto space-y-2 pl-2">
                        {(transactionsByDate[selectedDate]?.transactions || []).length > 0 ? (
                           [...transactionsByDate[selectedDate].transactions].sort((a,b) => b.timestamp - a.timestamp).map(t => (
                            <TransactionItem key={t.timestamp} t={t} onDelete={onDeleteTransaction} onEdit={onEditTransaction} />
                           ))
                        ) : (
                            <p className="text-center text-secondary-gray py-4">Tidak ada transaksi pada tanggal ini.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
