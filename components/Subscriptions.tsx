
import React, { useState, useMemo } from 'react';
import type { AppState, Subscription } from '../types';
import { PlusCircleIcon, CreditCardIcon, CalendarDaysIcon, BellIcon, TrashIcon, ExclamationTriangleIcon, BudgetIcon, availableIcons } from './Icons';

interface SubscriptionsProps {
    state: AppState;
    onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
    onDeleteSubscription: (id: number) => void;
    onEditSubscription: (sub: Subscription) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// --- HELPER FUNCTIONS ---
const getNextPaymentDate = (firstBillDate: string, cycle: 'monthly' | 'yearly', targetMonth?: number, targetYear?: number) => {
    const start = new Date(firstBillDate);
    const now = new Date();
    
    // Use provided target or current date
    let current = new Date(targetYear || now.getFullYear(), targetMonth !== undefined ? targetMonth : now.getMonth(), 1);
    
    // If calculating for display in list (next absolute payment)
    if (targetMonth === undefined) {
        current = new Date();
    }

    let nextDate = new Date(start);

    if (cycle === 'monthly') {
        // Set to current month/year but keep the day
        nextDate.setFullYear(current.getFullYear());
        nextDate.setMonth(current.getMonth());
        
        // Handle end of month overflow (e.g. Jan 31 -> Feb 28)
        const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
        if (start.getDate() > daysInMonth) {
            nextDate.setDate(daysInMonth);
        } else {
            nextDate.setDate(start.getDate());
        }

        // If strictly looking for next payment from today, and date passed, move to next month
        if (targetMonth === undefined && nextDate < new Date(new Date().setHours(0,0,0,0))) {
             nextDate.setMonth(nextDate.getMonth() + 1);
        }

    } else { // Yearly
        nextDate.setFullYear(current.getFullYear());
        // If date passed in current year, move to next
        if (targetMonth === undefined && nextDate < new Date(new Date().setHours(0,0,0,0))) {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
    }
    
    return nextDate;
};

// Duplicated helper for consistent formatting within this component if needed, 
// though ideally should be shared. Re-implementing simply here to match requested behavior.
const formatNumberInput = (value: string | number) => {
    const numString = String(value).replace(/[^0-9]/g, '');
    if (numString === '') return '';
    return new Intl.NumberFormat('id-ID').format(Number(numString));
};
const getRawNumber = (value: string) => Number(value.replace(/[^0-9]/g, ''));

const Subscriptions: React.FC<SubscriptionsProps> = ({ state, onAddSubscription, onDeleteSubscription, onEditSubscription }) => {
    const [view, setView] = useState<'list' | 'calendar'>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [date, setDate] = useState('');
    const [icon, setIcon] = useState('CreditCardIcon');

    const openModal = (sub?: Subscription) => {
        if (sub) {
            setEditingSub(sub);
            setName(sub.name);
            setPrice(formatNumberInput(sub.price));
            setCycle(sub.cycle);
            setDate(sub.firstBillDate);
            setIcon(sub.icon);
        } else {
            setEditingSub(null);
            setName('');
            setPrice('');
            setCycle('monthly');
            setDate(new Date().toISOString().slice(0, 10));
            setIcon('CreditCardIcon');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subData = {
            name,
            price: getRawNumber(price),
            cycle,
            firstBillDate: date,
            icon,
            isActive: true
        };

        if (editingSub) {
            onEditSubscription({ ...subData, id: editingSub.id });
        } else {
            onAddSubscription(subData);
        }
        setIsModalOpen(false);
    };

    const annualCost = useMemo(() => {
        return state.subscriptions.reduce((sum, sub) => {
            return sum + (sub.cycle === 'monthly' ? sub.price * 12 : sub.price);
        }, 0);
    }, [state.subscriptions]);

    const monthlyProjection = Math.round(annualCost / 12);

    // --- CALENDAR DATA PREP ---
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null); // Empty slots
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [daysInMonth, firstDayOfMonth]);

    const dueDatesThisMonth = useMemo(() => {
        const map: { [day: number]: Subscription[] } = {};
        state.subscriptions.forEach(sub => {
            const nextDate = getNextPaymentDate(sub.firstBillDate, sub.cycle, currentMonth, currentYear);
            // Only include if it actually falls in this month/year logic (mostly for yearly)
            if (nextDate.getMonth() === currentMonth && nextDate.getFullYear() === currentYear) {
                const day = nextDate.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(sub);
            }
        });
        return map;
    }, [state.subscriptions, currentMonth, currentYear]);

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Manajer Langganan</h1>

            {/* SHOCK CARD */}
            <section className="bg-gradient-to-br from-primary-navy to-gray-800 text-white rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-300 text-sm font-medium mb-1">Total Biaya Tahunan</p>
                            <h2 className="text-3xl font-bold">{formatCurrency(annualCost)}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-300 text-sm font-medium mb-1">Estimasi Bulanan</p>
                            <p className="text-xl font-semibold text-accent-teal">{formatCurrency(monthlyProjection)}</p>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div className="bg-accent-teal h-full rounded-full" style={{ width: '100%' }}></div> {/* Just a visual bar */}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 italic">
                            *Berdasarkan {state.subscriptions.length} langganan aktif. Hati-hati dengan "latte factor"!
                        </p>
                    </div>
                </div>
                <CreditCardIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-5" />
            </section>

            <div className="flex justify-between items-center mb-4">
                 <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
                    <button onClick={() => setView('calendar')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${view === 'calendar' ? 'bg-white shadow text-primary-navy' : 'text-secondary-gray'}`}>Kalender</button>
                    <button onClick={() => setView('list')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-primary-navy' : 'text-secondary-gray'}`}>Daftar</button>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-primary-navy text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-navy-dark text-sm">
                    <PlusCircleIcon className="w-5 h-5" />
                    Tambah
                </button>
            </div>

            {view === 'calendar' ? (
                <section className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-primary-navy">
                            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                        <BellIcon className="w-5 h-5 text-secondary-gray" />
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-secondary-gray">
                        {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            if (day === null) return <div key={`empty-${idx}`} className="h-14 bg-gray-50 rounded-lg"></div>;
                            
                            const subsDue = dueDatesThisMonth[day];
                            const isToday = day === new Date().getDate();

                            return (
                                <div key={day} className={`relative h-14 border rounded-lg p-1 flex flex-col items-center justify-between ${isToday ? 'border-accent-teal bg-teal-50' : 'border-gray-100'}`}>
                                    <span className={`text-xs font-semibold ${isToday ? 'text-accent-teal' : 'text-dark-text'}`}>{day}</span>
                                    {subsDue && (
                                        <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                                            {subsDue.slice(0, 3).map((sub, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-danger-red" title={sub.name}></div>
                                            ))}
                                            {subsDue.length > 3 && <div className="w-2 h-2 text-[6px] text-gray-500 leading-none">+</div>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Upcoming List below calendar */}
                    <div className="mt-6 space-y-3">
                        <h4 className="font-bold text-sm text-secondary-gray">Tagihan Bulan Ini</h4>
                        {Object.keys(dueDatesThisMonth).length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Tidak ada tagihan bulan ini.</p>
                        ) : (
                            (Object.entries(dueDatesThisMonth) as [string, Subscription[]][])
                                .sort((a,b) => Number(a[0]) - Number(b[0]))
                                .map(([day, subs]) => (
                                <div key={day} className="flex gap-3 items-start">
                                    <div className="bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-primary-navy">
                                        {day}
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        {subs.map(sub => (
                                            <div key={sub.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                                <div>
                                                    <p className="font-semibold text-sm text-dark-text">{sub.name}</p>
                                                    <p className="text-xs text-secondary-gray">{sub.cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}</p>
                                                </div>
                                                <p className="font-bold text-sm text-danger-red">-{formatCurrency(sub.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            ) : (
                <div className="space-y-4">
                    {state.subscriptions.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-md">
                            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                            <p className="text-gray-500">Belum ada langganan tersimpan.</p>
                        </div>
                    ) : (
                        state.subscriptions.map(sub => (
                            <div key={sub.id} onClick={() => openModal(sub)} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-navy">
                                        <BudgetIcon icon={sub.icon} className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-text">{sub.name}</h3>
                                        <p className="text-xs text-secondary-gray">
                                            {formatCurrency(sub.price)} / {sub.cycle === 'monthly' ? 'Bulan' : 'Tahun'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-accent-teal">
                                        Next: {getNextPaymentDate(sub.firstBillDate, sub.cycle).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* EDIT/ADD MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary-navy">{editingSub ? 'Edit Langganan' : 'Langganan Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Layanan</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" placeholder="Netflix, Spotify, dll" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Biaya</label>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    value={price} 
                                    onChange={e => setPrice(formatNumberInput(e.target.value))} 
                                    className="w-full border p-2 rounded" 
                                    placeholder="Rp" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Siklus</label>
                                    <select value={cycle} onChange={e => setCycle(e.target.value as any)} className="w-full border p-2 rounded bg-white">
                                        <option value="monthly">Bulanan</option>
                                        <option value="yearly">Tahunan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mulai Tanggal</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                                <div className="h-20 overflow-y-auto border rounded p-2 grid grid-cols-6 gap-2">
                                    {availableIcons.map(ic => (
                                        <div key={ic} onClick={() => setIcon(ic)} className={`p-1 rounded cursor-pointer flex justify-center ${icon === ic ? 'bg-accent-teal text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                            <BudgetIcon icon={ic} className="w-5 h-5" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {editingSub && (
                                    <button type="button" onClick={() => { onDeleteSubscription(editingSub.id); setIsModalOpen(false); }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button type="submit" className="flex-grow py-2 bg-primary-navy text-white font-bold rounded-lg hover:bg-primary-navy-dark">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Subscriptions;
