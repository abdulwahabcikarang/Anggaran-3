
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { AppState } from '../types';
import { FireIcon, SparklesIcon, CheckCircleIcon, StarIconFilled, TrophyIcon } from './Icons';
import { calculateLevelInfo } from '../utils';

interface MissionsProps {
    state: AppState;
    achievementData?: AppState['achievementData'];
    totalPoints: number;
    spendablePoints: number; // NEW PROP for the badge display
}

// --- HELPER COMPONENTS ---
const ProgressBar: React.FC<{ current: number; target: number, className?: string, colorClass?: string }> = ({ current, target, className, colorClass = 'bg-accent-teal' }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
    );
};

const QuestItem: React.FC<{ label: string; isCompleted: boolean; points: number; subtext?: string }> = ({ label, isCompleted, points, subtext }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl border mb-2 transition-all duration-300 ${isCompleted ? 'bg-green-50 border-green-200 translate-x-1' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
                {isCompleted && <CheckCircleIcon className="w-4 h-4 text-white" />}
            </div>
            <div className="min-w-0">
                <span className={`block text-sm font-bold truncate ${isCompleted ? 'text-green-800' : 'text-secondary-gray'}`}>{label}</span>
                {subtext && <span className="block text-[10px] text-gray-400">{subtext}</span>}
            </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-indigo-50'}`}>
            <span className={`text-xs font-extrabold ${isCompleted ? 'text-green-700' : 'text-indigo-600'}`}>+{points}</span>
            <SparklesIcon className={`w-3 h-3 ${isCompleted ? 'text-green-600' : 'text-indigo-400'}`} />
        </div>
    </div>
);

const FlyingParticles: React.FC<{ trigger: number, targetRef: React.RefObject<HTMLDivElement> }> = ({ trigger, targetRef }) => {
    const [particles, setParticles] = useState<{id: number, x: number, y: number, tx: number, ty: number}[]>([]);
    
    useEffect(() => {
        if (trigger === 0 || !targetRef.current) return;

        const rect = targetRef.current.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        const newParticles = Array.from({ length: 12 }).map((_, i) => ({
            id: Date.now() + i,
            x: window.innerWidth / 2 + (Math.random() * 100 - 50), 
            y: window.innerHeight / 2 + (Math.random() * 100 - 50),
            tx: targetX,
            ty: targetY
        }));

        setParticles(newParticles);

        const timer = setTimeout(() => {
            setParticles([]);
        }, 1000); 

        return () => clearTimeout(timer);
    }, [trigger]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            {particles.map((p, i) => (
                <div
                    key={p.id}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg"
                    style={{
                        left: 0,
                        top: 0,
                        transform: `translate(${p.x}px, ${p.y}px)`,
                        animation: `flyToTarget 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                        animationDelay: `${i * 0.05}s`,
                        // @ts-ignore 
                        '--tx': `${p.tx - p.x}px`,
                        '--ty': `${p.ty - p.y}px`
                    }}
                />
            ))}
            <style>{`
                @keyframes flyToTarget {
                    0% { opacity: 1; transform: translate(var(--start-x), var(--start-y)) scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; transform: translate(calc(var(--tx) + 0px), calc(var(--ty) + 0px)) scale(0.2); }
                }
            `}</style>
        </div>
    );
};

function usePrevious(value: number) {
  const ref = useRef<number>(0);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Missions: React.FC<MissionsProps> = ({ state, achievementData, totalPoints, spendablePoints }) => {
    const mustikaBadgeRef = useRef<HTMLDivElement>(null);

    // --- QUEST LOGIC (Calculated here for display) ---
    const questStatus = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('fr-CA');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const isToday = (ts: number) => new Date(ts).toLocaleDateString('fr-CA') === todayStr;
        const isThisWeek = (ts: number) => (now - ts) < (7 * oneDay);

        // --- DAILY QUESTS ---
        const dailyQuests = [
            {
                label: "Login & Cek Aplikasi",
                points: 5,
                completed: true 
            },
            {
                label: "Catat 1 Transaksi",
                points: 10,
                completed: state.dailyExpenses.some(t => isToday(t.timestamp)) || state.fundHistory.some(t => isToday(t.timestamp)) || state.budgets.some(b => b.history.some(h => isToday(h.timestamp)))
            },
            {
                label: "Si Hemat (Harian < 50rb)",
                points: 15,
                completed: state.dailyExpenses.filter(t => isToday(t.timestamp)).reduce((sum, t) => sum + t.amount, 0) < 50000
            },
            {
                label: "Isi Celengan",
                points: 20,
                completed: state.savingsGoals.some(g => g.history.some(h => isToday(h.timestamp)))
            },
            {
                label: "Cek Wishlist",
                points: 10,
                completed: state.wishlist.length > 0 
            }
        ];

        // --- WEEKLY CALCS ---
        const uniqueTransactionDays = new Set();
        state.dailyExpenses.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.fundHistory.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.budgets.forEach(b => b.history.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }));
        const activeDaysCount = uniqueTransactionDays.size;

        const savingsCount = state.savingsGoals.reduce((count, g) => count + g.history.filter(h => isThisWeek(h.timestamp)).length, 0);
        const activeBudgetsCount = state.budgets.filter(b => b.history.some(h => isThisWeek(h.timestamp))).length;
        const addedWishlist = state.wishlist.some(w => isThisWeek(w.createdAt));

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyIncome = state.fundHistory
            .filter(t => t.type === 'add' && t.timestamp >= startOfMonth.getTime())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const weeklyExpense = 
            state.dailyExpenses.filter(t => isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) +
            state.fundHistory.filter(t => t.type === 'remove' && isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) +
            state.budgets.reduce((s, b) => s + b.history.filter(h => isThisWeek(h.timestamp)).reduce((bs, h) => bs + h.amount, 0), 0);
        
        const isFinancePositive = monthlyIncome > 0 && weeklyExpense < (monthlyIncome * 0.25);

        const weeklyQuests = [
            {
                label: "4 Hari Catat Transaksi",
                points: 30,
                completed: activeDaysCount >= 4,
                subtext: `${activeDaysCount}/4 hari`
            },
            {
                label: "3x Isi Celengan",
                points: 40,
                completed: savingsCount >= 3,
                subtext: `${savingsCount}/3 kali`
            },
            {
                label: "Tambah Wishlist Baru",
                points: 20,
                completed: addedWishlist
            },
            {
                label: "Isi 4 Pos Anggaran",
                points: 25,
                completed: activeBudgetsCount >= 4,
                subtext: `${activeBudgetsCount}/4 pos`
            },
            {
                label: "Pengeluaran < 25% Pemasukan",
                points: 50,
                completed: isFinancePositive,
                subtext: "Minggu ini vs Bulan ini"
            }
        ];

        const dailyCompletedCount = dailyQuests.filter(q => q.completed).length;
        const dailyBonusUnlocked = dailyCompletedCount >= 3;
        
        const weeklyCompletedCount = weeklyQuests.filter(q => q.completed).length;
        const weeklyBonusUnlocked = weeklyCompletedCount >= 5;
        
        return {
            daily: dailyQuests,
            dailyProgress: dailyCompletedCount,
            dailyBonusUnlocked,
            weekly: weeklyQuests,
            weeklyProgress: weeklyCompletedCount,
            weeklyBonusUnlocked,
        };

    }, [state, achievementData]);

    const prevPoints = usePrevious(spendablePoints); // Trigger animation on balance change
    const [particleTrigger, setParticleTrigger] = useState(0);

    useEffect(() => {
        if (spendablePoints > prevPoints && prevPoints !== 0) {
            setParticleTrigger(Date.now());
        }
    }, [spendablePoints, prevPoints]);

    const levelInfo = useMemo(() => calculateLevelInfo(totalPoints), [totalPoints]);

    const levelProgressCurrent = totalPoints - levelInfo.currentStartXP;
    const levelProgressTarget = levelInfo.nextTargetXP - levelInfo.currentStartXP;

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Misi Harian</h1>
            
            {/* Particle System */}
            <FlyingParticles trigger={particleTrigger} targetRef={mustikaBadgeRef} />

            {/* --- LEVEL CARD --- */}
            <section className="bg-white rounded-3xl shadow-lg p-6 mb-8 relative overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-extrabold text-secondary-gray uppercase tracking-widest mb-1">LEVEL SAAT INI</p>
                            <div className="flex flex-col">
                                <h2 className="text-5xl font-black text-primary-navy leading-none tracking-tighter drop-shadow-sm">
                                    {levelInfo.levelNumber}
                                </h2>
                                <span className="text-sm font-bold text-accent-teal mt-1 bg-teal-50 px-2 py-0.5 rounded-lg inline-block w-max">
                                    {levelInfo.levelTitle}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {/* MUSTIKA CURRENCY DISPLAY WITH REF */}
                            <div ref={mustikaBadgeRef} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full shadow-lg shadow-indigo-200 mb-1 z-20 relative transform transition-transform hover:scale-105">
                                <div className="bg-white/20 rounded-full p-1">
                                    <SparklesIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
                                </div>
                                <span className="font-bold text-white text-base">{spendablePoints}</span>
                            </div>
                            <span className="text-[10px] text-secondary-gray font-bold mt-1">TOTAL MUSTIKA</span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="flex justify-between text-xs font-bold text-secondary-gray mb-2">
                            <span>{levelInfo.currentStartXP} XP</span>
                            <span>{levelInfo.nextTargetXP} XP</span>
                        </div>
                        <ProgressBar 
                            current={levelProgressCurrent} 
                            target={levelProgressTarget} 
                            className="h-5 border-2 border-white shadow-inner bg-gray-100" 
                            colorClass="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                        />
                        <div className="text-center mt-3">
                            <p className="text-[10px] font-bold text-secondary-gray uppercase tracking-wider">
                                Kurang <span className="text-primary-navy text-sm">{levelInfo.nextTargetXP - totalPoints} XP</span> lagi untuk naik level
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- QUEST BOARD --- */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* DAILY QUESTS */}
                <section className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden flex flex-col h-full">
                    <div className="bg-gradient-to-r from-orange-50 to-white p-4 border-b border-orange-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-100 p-1.5 rounded-lg">
                                <FireIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-bold text-orange-900">Misi Harian</h3>
                        </div>
                        <div className="text-xs font-bold bg-white px-3 py-1 rounded-full text-orange-600 border border-orange-200 shadow-sm">
                            {questStatus.dailyProgress}/5 Selesai
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="space-y-2 mb-4">
                            {questStatus.daily.map((q, i) => (
                                <QuestItem key={i} label={q.label} isCompleted={q.completed} points={q.points} />
                            ))}
                        </div>
                        
                        {/* Daily Bonus Status */}
                        <div className={`mt-auto p-4 rounded-xl flex items-center justify-between border-2 transition-all duration-300 ${questStatus.dailyBonusUnlocked ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-200' : 'bg-gray-50 border-dashed border-gray-200 text-gray-400'}`}>
                            <div className="flex items-center gap-2">
                                <TrophyIcon className={`w-5 h-5 ${questStatus.dailyBonusUnlocked ? 'text-yellow-300' : 'text-gray-300'}`} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Bonus Harian</span>
                                    <span className="text-sm font-black">{questStatus.dailyBonusUnlocked ? 'KLAIM OTOMATIS' : 'Selesaikan 3 Misi'}</span>
                                </div>
                            </div>
                            <span className="text-lg font-black">{questStatus.dailyBonusUnlocked ? '+50' : '0'}</span>
                        </div>
                    </div>
                </section>

                {/* WEEKLY QUESTS */}
                <section className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden flex flex-col h-full">
                    <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-100 p-1.5 rounded-lg">
                                <StarIconFilled className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-indigo-900">Misi Mingguan</h3>
                        </div>
                        <div className="text-xs font-bold bg-white px-3 py-1 rounded-full text-indigo-600 border border-indigo-200 shadow-sm">
                            {questStatus.weeklyProgress}/5 Selesai
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="space-y-2 mb-4">
                            {questStatus.weekly.map((q, i) => (
                                <QuestItem key={i} label={q.label} isCompleted={q.completed} points={q.points} subtext={q.subtext} />
                            ))}
                        </div>

                        {/* Weekly Bonus Status */}
                        <div className={`mt-auto p-4 rounded-xl flex items-center justify-between border-2 transition-all duration-300 ${questStatus.weeklyBonusUnlocked ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200' : 'bg-gray-50 border-dashed border-gray-200 text-gray-400'}`}>
                            <div className="flex items-center gap-2">
                                <TrophyIcon className={`w-5 h-5 ${questStatus.weeklyBonusUnlocked ? 'text-yellow-300' : 'text-gray-300'}`} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Jackpot Mingguan</span>
                                    <span className="text-sm font-black">{questStatus.weeklyBonusUnlocked ? 'KLAIM OTOMATIS' : 'Selesaikan 5 Misi'}</span>
                                </div>
                            </div>
                            <span className="text-lg font-black">{questStatus.weeklyBonusUnlocked ? '+150' : '0'}</span>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Missions;
