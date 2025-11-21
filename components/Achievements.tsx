
import React, { useState, useMemo } from 'react';
import type { Achievement, AppState } from '../types';
import { BudgetIcon, LockClosedIcon, ClockIcon, TrophyIcon, FireIcon, CalendarDaysIcon, CheckCircleIcon, SparklesIcon } from './Icons';

interface AchievementsProps {
    state: AppState;
    allAchievements: Achievement[];
    unlockedAchievements: { [id: string]: number };
    achievementData?: AppState['achievementData'];
    totalPoints: number;
    userLevel: {
        level: string;
        currentLevelPoints: number;
        nextLevelPoints: number | null;
    };
}

const achievementCategories = ['Dasar', 'Kebiasaan Baik', 'Master Anggaran', 'Tantangan', 'Eksplorasi'];

// --- NEW ICONS FOR QUESTS ---
const StarIconFilled: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);

const ProgressBar: React.FC<{ current: number; target: number, className?: string, colorClass?: string }> = ({ current, target, className, colorClass = 'bg-accent-teal' }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
    );
};

const QuestItem: React.FC<{ label: string; isCompleted: boolean; points: number; subtext?: string }> = ({ label, isCompleted, points, subtext }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg border mb-2 transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 opacity-80'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {isCompleted && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="min-w-0">
                <span className={`block text-sm font-medium truncate ${isCompleted ? 'text-green-800' : 'text-secondary-gray'}`}>{label}</span>
                {subtext && <span className="block text-[10px] text-gray-400">{subtext}</span>}
            </div>
        </div>
        <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-indigo-600 flex-shrink-0">+{points}</span>
            <SparklesIcon className="w-3 h-3 text-indigo-400" />
        </div>
    </div>
);

const AchievementCard: React.FC<{
    achievement: Achievement;
    isUnlocked: boolean;
    progress?: { current: number; target: number };
    onClick: () => void;
}> = ({ achievement, isUnlocked, progress, onClick }) => {
    return (
        <div onClick={onClick} className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${isUnlocked ? 'bg-white shadow-md hover:shadow-lg border border-gray-100' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}>
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isUnlocked ? 'bg-gradient-to-br from-teal-400 to-accent-teal shadow-lg shadow-teal-200' : 'bg-gray-200'}`}>
                <BudgetIcon 
                    icon={achievement.icon} 
                    className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}
                />
                {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center">
                        <LockClosedIcon className="w-6 h-6 text-white/80" />
                    </div>
                )}
            </div>
            <div className={`flex-grow ${!isUnlocked ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-dark-text pr-2">{achievement.name}</h3>
                    {achievement.isTimeLimited && <ClockIcon className="w-5 h-5 text-secondary-gray flex-shrink-0" title="Lencana Terbatas Waktu"/>}
                </div>
                <p className="text-xs text-secondary-gray mt-1 line-clamp-2">{achievement.description}</p>
                {!isUnlocked && progress && progress.target > 1 && (
                     <div className="mt-3">
                        <ProgressBar current={progress.current} target={progress.target} />
                        <p className="text-[10px] text-secondary-gray text-right mt-1 font-mono">{progress.current.toLocaleString()} / {progress.target.toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AchievementDetailModal: React.FC<{
    achievement: Achievement;
    isUnlocked: boolean;
    unlockedTimestamp?: number;
    progress?: { current: number; target: number };
    onClose: () => void;
}> = ({ achievement, isUnlocked, unlockedTimestamp, progress, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-6 animate-spring-up" onClick={e => e.stopPropagation()}>
                <div className={`relative mx-auto w-24 h-24 mb-6 rounded-full flex items-center justify-center shadow-xl ${isUnlocked ? 'bg-gradient-to-br from-teal-400 to-accent-teal' : 'bg-gray-200'}`}>
                    <BudgetIcon icon={achievement.icon} className={`w-12 h-12 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                     {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                            <LockClosedIcon className="w-10 h-10 text-white/80" />
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-primary-navy mb-2">{achievement.name}</h3>
                <p className="text-secondary-gray text-sm leading-relaxed">{achievement.description}</p>
                
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold">
                    <SparklesIcon className="w-4 h-4" />
                    +{achievement.points} Mustika
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                    {isUnlocked && unlockedTimestamp ? (
                        <div>
                            <p className="font-semibold text-dark-text text-sm">Didapatkan pada:</p>
                            <p className="text-secondary-gray text-xs mt-1">{new Date(unlockedTimestamp).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-semibold text-dark-text text-sm mb-2">Progress Saat Ini:</p>
                            {progress ? (
                                <div className="px-4">
                                    <p className="text-primary-navy text-xl font-bold mb-2">{progress.current.toLocaleString()} <span className="text-gray-400 text-sm font-normal">/ {progress.target.toLocaleString()}</span></p>
                                    <ProgressBar current={progress.current} target={progress.target} className="h-3"/>
                                </div>
                            ) : (
                                <p className="text-xs text-secondary-gray italic">Lakukan aktivitas terkait untuk memulai.</p>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="mt-8 w-full bg-gray-100 text-primary-navy font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors">Tutup</button>
            </div>
        </div>
    );
}

const Achievements: React.FC<AchievementsProps> = ({ state, allAchievements, unlockedAchievements, achievementData, totalPoints, userLevel }) => {
    const [activeCategory, setActiveCategory] = useState(achievementCategories[0]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const filteredAchievements = useMemo(() => {
        return allAchievements.filter(ach => ach.category === activeCategory);
    }, [allAchievements, activeCategory]);

    // --- QUEST LOGIC ---
    const questStatus = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('fr-CA');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Helper: Check if timestamp is today
        const isToday = (ts: number) => new Date(ts).toLocaleDateString('fr-CA') === todayStr;
        
        // Helper: Check if timestamp is within last 7 days
        const isThisWeek = (ts: number) => (now - ts) < (7 * oneDay);

        // --- DAILY QUESTS ---
        const dailyQuests = [
            {
                label: "Login & Cek Aplikasi",
                points: 5,
                completed: true // Automatically completed if viewing this page
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
                completed: state.wishlist.length > 0 // Assumption: engagement with wishlist feature
            }
        ];

        // --- WEEKLY CALCS ---
        // 1. Active Days (Distinct days with transactions in last 7 days)
        const uniqueTransactionDays = new Set();
        state.dailyExpenses.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.fundHistory.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.budgets.forEach(b => b.history.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }));
        const activeDaysCount = uniqueTransactionDays.size;

        // 2. Savings Count
        const savingsCount = state.savingsGoals.reduce((count, g) => count + g.history.filter(h => isThisWeek(h.timestamp)).length, 0);

        // 3. Used Budgets Count
        const activeBudgetsCount = state.budgets.filter(b => b.history.some(h => isThisWeek(h.timestamp))).length;

        // 4. Added Wishlist
        const addedWishlist = state.wishlist.some(w => isThisWeek(w.createdAt));

        // 5. Expense < 1/4 Income
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyIncome = state.fundHistory
            .filter(t => t.type === 'add' && t.timestamp >= startOfMonth.getTime())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const weeklyExpense = 
            state.dailyExpenses.filter(t => isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) +
            state.fundHistory.filter(t => t.type === 'remove' && isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) +
            state.budgets.reduce((s, b) => s + b.history.filter(h => isThisWeek(h.timestamp)).reduce((bs, h) => bs + h.amount, 0), 0);
        
        const isFinancePositive = monthlyIncome > 0 && weeklyExpense < (monthlyIncome * 0.25);


        // --- WEEKLY QUESTS ---
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
        const dailyBonusPoints = dailyBonusUnlocked ? 50 : 0;
        const currentDailyPoints = dailyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0);

        const weeklyCompletedCount = weeklyQuests.filter(q => q.completed).length;
        const weeklyBonusUnlocked = weeklyCompletedCount >= 5;
        const weeklyBonusPoints = weeklyBonusUnlocked ? 150 : 0;
        const currentWeeklyPoints = weeklyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0);

        return {
            daily: dailyQuests,
            dailyProgress: dailyCompletedCount,
            dailyBonusUnlocked,
            dailyTotalPoints: currentDailyPoints + dailyBonusPoints,
            weekly: weeklyQuests,
            weeklyProgress: weeklyCompletedCount,
            weeklyBonusUnlocked,
            weeklyTotalPoints: currentWeeklyPoints + weeklyBonusPoints
        };

    }, [state, achievementData]);

    // Combined Total Points (Achievements + Quests) = Mustika Balance
    const grandTotalPoints = totalPoints + questStatus.dailyTotalPoints + questStatus.weeklyTotalPoints;
    
    const levelInfo = (() => {
        // Recalculate level based on grand total (visual only, logic copied from App.tsx)
        const levels = [
            { name: 'Pemula Finansial', points: 0 },
            { name: 'Pengelola Cerdas', points: 150 },
            { name: 'Pakar Anggaran', points: 400 },
            { name: 'Sultan Finansial', points: 750 },
            { name: 'Master Keuangan', points: 1200 },
            { name: 'Legenda Anggaran', points: 2000 },
        ];
        let currentLevel = levels[0];
        let currentLevelIndex = 0;
        let nextLevel = null;
        for (let i = 0; i < levels.length; i++) {
            if (grandTotalPoints >= levels[i].points) {
                currentLevel = levels[i];
                currentLevelIndex = i;
                nextLevel = levels[i + 1] || null;
            } else {
                if (!nextLevel) nextLevel = levels[i];
                break;
            }
        }
        return { 
            level: currentLevel.name, 
            levelNumber: currentLevelIndex + 1,
            currentStart: currentLevel.points, 
            nextTarget: nextLevel ? nextLevel.points : null 
        };
    })();

    // Level Progress Calculation
    const levelProgressCurrent = grandTotalPoints - levelInfo.currentStart;
    const levelProgressTarget = levelInfo.nextTarget ? levelInfo.nextTarget - levelInfo.currentStart : 1;


    return (
        <main className="p-4 pb-24 animate-fade-in">
            <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Pusat Misi & Lencana</h1>

            {/* --- LEVEL CARD --- */}
            <section className="bg-white rounded-2xl shadow-lg p-5 mb-8 relative overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-1">Level Kamu</p>
                            <div className="flex flex-col">
                                <h2 className="text-4xl font-extrabold text-primary-navy leading-none tracking-tight">
                                    LV {levelInfo.levelNumber}
                                </h2>
                                <span className="text-sm font-bold text-accent-teal mt-1">{levelInfo.level}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {/* MUSTIKA CURRENCY DISPLAY */}
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm mb-1">
                                <div className="bg-indigo-500 rounded-full p-1 shadow-inner">
                                    <SparklesIcon className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-bold text-indigo-800 text-sm">{grandTotalPoints} Mustika</span>
                            </div>
                            <span className="text-[10px] text-secondary-gray font-medium">Total XP: {grandTotalPoints}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold text-secondary-gray mb-1">
                            <span>{levelInfo.currentStart} XP</span>
                            {levelInfo.nextTarget ? <span>Target: {levelInfo.nextTarget} XP</span> : <span>Max Level</span>}
                        </div>
                        <ProgressBar 
                            current={levelProgressCurrent} 
                            target={levelProgressTarget} 
                            className="h-4 border border-gray-100" 
                            colorClass="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                        />
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-secondary-gray font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-full">
                                {levelInfo.nextTarget 
                                    ? `Kurang ${levelInfo.nextTarget - grandTotalPoints} XP lagi untuk naik level` 
                                    : 'Kamu sudah mencapai level maksimal!'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- QUEST BOARD --- */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* DAILY QUESTS */}
                <section className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
                    <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FireIcon className="w-5 h-5 text-orange-500" />
                            <h3 className="font-bold text-orange-800">Misi Harian</h3>
                        </div>
                        <div className="text-xs font-bold bg-white px-2 py-1 rounded text-orange-600 border border-orange-200 shadow-sm">
                            {questStatus.dailyProgress}/5 Selesai
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-secondary-gray mb-3">Selesaikan minimal 3 misi untuk bonus poin!</p>
                        <div className="space-y-1">
                            {questStatus.daily.map((q, i) => (
                                <QuestItem key={i} label={q.label} isCompleted={q.completed} points={q.points} />
                            ))}
                        </div>
                        
                        {/* Daily Bonus Status */}
                        <div className={`mt-4 p-3 rounded-lg flex items-center justify-between ${questStatus.dailyBonusUnlocked ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5" />
                                <span className="text-sm font-bold">Bonus Harian</span>
                            </div>
                            <span className="text-sm font-bold">{questStatus.dailyBonusUnlocked ? '+50 Mustika' : 'Terkunci'}</span>
                        </div>
                    </div>
                </section>

                {/* WEEKLY QUESTS */}
                <section className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <StarIconFilled className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-indigo-800">Misi Mingguan</h3>
                        </div>
                        <div className="text-xs font-bold bg-white px-2 py-1 rounded text-indigo-600 border border-indigo-200 shadow-sm">
                            {questStatus.weeklyProgress}/5 Selesai
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-secondary-gray mb-3">Sapu bersih semua misi untuk Jackpot poin!</p>
                        <div className="space-y-1">
                            {questStatus.weekly.map((q, i) => (
                                <QuestItem key={i} label={q.label} isCompleted={q.completed} points={q.points} subtext={q.subtext} />
                            ))}
                        </div>

                        {/* Weekly Bonus Status */}
                        <div className={`mt-4 p-3 rounded-lg flex items-center justify-between ${questStatus.weeklyBonusUnlocked ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                            <div className="flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5" />
                                <span className="text-sm font-bold">Jackpot Mingguan</span>
                            </div>
                            <span className="text-sm font-bold">{questStatus.weeklyBonusUnlocked ? '+150 Mustika' : 'Terkunci'}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* --- ACHIEVEMENT LIST --- */}
            <h2 className="text-xl font-bold text-primary-navy mb-4 px-2 border-l-4 border-primary-navy pl-3">Koleksi Lencana</h2>
            
            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 no-scrollbar">
                {achievementCategories.map(category => (
                    <button 
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap transition-all duration-300 ${activeCategory === category ? 'bg-primary-navy text-white shadow-md transform scale-105' : 'bg-white text-secondary-gray hover:bg-gray-50 border border-gray-200'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                {filteredAchievements.map(ach => {
                    let progress: { current: number; target: number } | undefined = undefined;
                    if (ach.progress) {
                        progress = ach.progress(state);
                    } else if (ach.streakKey && ach.streakTarget) {
                        progress = { current: achievementData?.[ach.streakKey] || 0, target: ach.streakTarget };
                    }
                    
                    return (
                        <AchievementCard 
                            key={ach.id}
                            achievement={ach}
                            isUnlocked={!!unlockedAchievements[ach.id]}
                            progress={progress}
                            onClick={() => setSelectedAchievement(ach)}
                        />
                    );
                })}
            </div>

            {selectedAchievement && (
                <AchievementDetailModal
                    achievement={selectedAchievement}
                    isUnlocked={!!unlockedAchievements[selectedAchievement.id]}
                    unlockedTimestamp={unlockedAchievements[selectedAchievement.id]}
                    progress={
                        selectedAchievement.progress ? selectedAchievement.progress(state) :
                        (selectedAchievement.streakKey && selectedAchievement.streakTarget ? { current: achievementData?.[selectedAchievement.streakKey] || 0, target: selectedAchievement.streakTarget } : undefined)
                    }
                    onClose={() => setSelectedAchievement(null)}
                />
            )}
        </main>
    );
};

export default Achievements;
