
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Achievement, AppState } from '../types';
import { BudgetIcon, LockClosedIcon, ClockIcon, TrophyIcon, FireIcon, CalendarDaysIcon, CheckCircleIcon, SparklesIcon, ArrowPathIcon, ShieldCheckIcon, RocketLaunchIcon, HeartIcon, ArchiveBoxIcon } from './Icons';

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

// --- ICONS & UI HELPERS ---
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

// --- GEM FILTER COMPONENT ---
const GemFilter: React.FC<{ activeCategory: string, onSelect: (cat: string) => void }> = ({ activeCategory, onSelect }) => {
    const gems = [
        { id: 'Dasar', color: 'from-gray-400 to-gray-600', shadow: 'shadow-gray-300', icon: LockClosedIcon, label: 'Dasar' }, // Iron/Stone
        { id: 'Kebiasaan Baik', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-300', icon: CalendarDaysIcon, label: 'Kebiasaan' }, // Sapphire
        { id: 'Master Anggaran', color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-300', icon: TrophyIcon, label: 'Master' }, // Amethyst
        { id: 'Tantangan', color: 'from-red-400 to-red-600', shadow: 'shadow-red-300', icon: FireIcon, label: 'Tantangan' }, // Ruby
        { id: 'Eksplorasi', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-300', icon: RocketLaunchIcon, label: 'Eksplorasi' }, // Emerald
    ];

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                {gems.map((gem) => {
                    const isActive = activeCategory === gem.id;
                    return (
                        <button
                            key={gem.id}
                            onClick={() => onSelect(gem.id)}
                            className={`relative group flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'hover:bg-white hover:scale-105'}`}
                        >
                            {/* Gem Body */}
                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300
                                bg-gradient-to-br ${gem.color}
                                ${isActive ? `ring-2 ring-offset-2 ring-${gem.color.split('-')[1]}-400 ${gem.shadow}` : 'opacity-70 grayscale-[0.5] group-hover:grayscale-0'}
                            `}>
                                <gem.icon className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                            
                            {/* Label */}
                            <span className={`text-[9px] font-bold mt-1 transition-colors ${isActive ? 'text-primary-navy' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {gem.label}
                            </span>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-primary-navy rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- HOLO CARD COMPONENT ---
const HoloEffectCard: React.FC<{ children: React.ReactNode; isUnlocked: boolean; onClick: () => void }> = ({ children, isUnlocked, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [bgPosition, setBgPosition] = useState('');
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !isUnlocked) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        
        const bgX = (x / rect.width) * 100;
        const bgY = (y / rect.height) * 100;
        setBgPosition(`${bgX}% ${bgY}%`);
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setOpacity(0);
    };

    return (
        <div 
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-xl transition-all duration-200 ease-out cursor-pointer h-full ${isUnlocked ? 'shadow-md hover:shadow-xl' : ''}`}
            style={{ transform, transformStyle: 'preserve-3d' }}
        >
            {children}
            {isUnlocked && (
                <div 
                    className="absolute inset-0 rounded-xl pointer-events-none z-10 mix-blend-soft-light"
                    style={{
                        background: `radial-gradient(circle at ${bgPosition}, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)`,
                        opacity: opacity,
                        transition: 'opacity 0.2s ease-out'
                    }}
                />
            )}
            {isUnlocked && (
                <div 
                    className="absolute inset-0 rounded-xl pointer-events-none z-0 opacity-10 bg-gradient-to-br from-transparent via-white to-transparent"
                    style={{
                        background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.6) ${parseFloat(bgPosition || '0') / 2}%, transparent 80%)`
                    }}
                />
            )}
        </div>
    );
};

const AchievementCard: React.FC<{
    achievement: Achievement;
    isUnlocked: boolean;
    progress?: { current: number; target: number };
    onClick: () => void;
    tierInfo?: { current: number, total: number }; // For stacked view
}> = ({ achievement, isUnlocked, progress, onClick, tierInfo }) => {
    
    // Determine Tier Colors based on current tier index
    let tierBadgeColor = 'bg-gray-100 text-gray-600';
    let tierLabel = '';
    
    if (tierInfo) {
        if (tierInfo.current === 1) {
            tierBadgeColor = 'bg-orange-100 text-orange-700 border-orange-200'; // Bronze-ish
            tierLabel = 'Perunggu';
        } else if (tierInfo.current === 2) {
            tierBadgeColor = 'bg-gray-200 text-gray-700 border-gray-300'; // Silver
            tierLabel = 'Perak';
        } else if (tierInfo.current >= 3) {
            tierBadgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Gold
            tierLabel = 'Emas';
        }
    }

    return (
        <HoloEffectCard isUnlocked={isUnlocked} onClick={onClick}>
            <div className={`relative flex items-start space-x-4 p-4 rounded-xl h-full border ${isUnlocked ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent'}`}>
                {/* Tier Badge Overlay */}
                {tierInfo && (
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${tierBadgeColor}`}>
                        {tierLabel}
                    </div>
                )}

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
                <div className={`flex-grow ${!isUnlocked ? 'opacity-60' : ''} pr-2`}>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-dark-text pr-2 text-sm">{achievement.name}</h3>
                        {achievement.isTimeLimited && !tierInfo && <ClockIcon className="w-4 h-4 text-secondary-gray flex-shrink-0" title="Lencana Terbatas Waktu"/>}
                    </div>
                    <p className="text-xs text-secondary-gray mt-1 line-clamp-2">{achievement.description}</p>
                    
                    {/* Stacked View Indicator */}
                    {tierInfo && (
                        <div className="mt-2 flex gap-1">
                            {Array.from({ length: tierInfo.total }).map((_, i) => {
                                const isPastTier = i < tierInfo.current - 1;
                                const isCurrentTier = i === tierInfo.current - 1;
                                
                                let barColor = 'bg-gray-200';
                                if (isPastTier) {
                                    barColor = 'bg-accent-teal'; // Completed previous tiers
                                } else if (isCurrentTier) {
                                    barColor = isUnlocked ? 'bg-accent-teal' : 'bg-teal-200'; // Current tier status
                                }
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 flex-1 rounded-full ${barColor}`}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {!isUnlocked && progress && progress.target > 1 && (
                        <div className="mt-3">
                            <ProgressBar current={progress.current} target={progress.target} />
                            <p className="text-[10px] text-secondary-gray text-right mt-1 font-mono">{progress.current.toLocaleString()} / {progress.target.toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </HoloEffectCard>
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

// --- HALL OF FAME COMPONENT (Suggestion 5) ---
const HallOfFameModal: React.FC<{
    unlockedAchievements: { [id: string]: number };
    allAchievements: Achievement[];
    onClose: () => void;
}> = ({ unlockedAchievements, allAchievements, onClose }) => {
    
    // Create a sorted list of unlocked achievements
    const sortedUnlocked = useMemo(() => {
        return Object.entries(unlockedAchievements)
            .map(([id, timestamp]) => {
                const ach = allAchievements.find(a => a.id === id);
                return ach ? { ...ach, unlockedAt: timestamp } : null;
            })
            .filter((a): a is Achievement & { unlockedAt: number } => a !== null)
            .sort((a, b) => b.unlockedAt - a.unlockedAt); // Newest first
    }, [unlockedAchievements, allAchievements]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col animate-spring-up overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-primary-navy p-6 text-white relative overflow-hidden flex-shrink-0">
                    <TrophyIcon className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-10 rotate-12" />
                    <h2 className="text-2xl font-bold relative z-10">Hall of Fame</h2>
                    <p className="text-blue-200 text-sm relative z-10">Jurnal sejarah pencapaian legendarismu.</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 text-2xl">&times;</button>
                </div>

                {/* Timeline Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {sortedUnlocked.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <LockClosedIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Belum ada lencana yang terbuka.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                            {sortedUnlocked.map((ach, index) => (
                                <div key={index} className="relative pl-8">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[9px] top-0 bg-white border-2 border-accent-teal w-4 h-4 rounded-full shadow-sm z-10"></div>
                                    
                                    {/* Date Label */}
                                    <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-wider mb-1 block">
                                        {new Date(ach.unlockedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>

                                    {/* Card */}
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 text-accent-teal">
                                            <BudgetIcon icon={ach.icon} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-text text-sm">{ach.name}</h4>
                                            <p className="text-[10px] text-secondary-gray line-clamp-1">{ach.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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

const Achievements: React.FC<AchievementsProps> = ({ state, allAchievements, unlockedAchievements, achievementData, totalPoints, userLevel }) => {
    const [activeCategory, setActiveCategory] = useState(achievementCategories[0]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [showHallOfFame, setShowHallOfFame] = useState(false);
    
    const mustikaBadgeRef = useRef<HTMLDivElement>(null);
    
    // --- LOGIC FOR TIERED STACKING (SUGGESTION 2) ---
    // This processes the filtered list to group achievements by 'streakKey'
    const stackedAchievements = useMemo(() => {
        // 1. Filter by current category first
        const categoryAchievements = allAchievements.filter(ach => ach.category === activeCategory);
        
        // 2. Group by streakKey
        const groups: { [key: string]: Achievement[] } = {};
        const standalone: Achievement[] = [];

        categoryAchievements.forEach(ach => {
            if (ach.streakKey) {
                if (!groups[ach.streakKey]) groups[ach.streakKey] = [];
                groups[ach.streakKey].push(ach);
            } else {
                standalone.push(ach);
            }
        });

        // 3. Process groups to find which ONE to show
        const processedGroups: Achievement[] = [];

        Object.values(groups).forEach(group => {
            // Sort by points (assuming higher points = higher tier) or we could use streakTarget
            const sortedGroup = group.sort((a, b) => (a.points || 0) - (b.points || 0));
            
            // Find the first LOCKED achievement
            const nextLockedIndex = sortedGroup.findIndex(ach => !unlockedAchievements[ach.id]);
            
            if (nextLockedIndex !== -1) {
                // Case: In progress. Show the next locked one.
                processedGroups.push({
                    ...sortedGroup[nextLockedIndex],
                    tierInfo: { current: nextLockedIndex + 1, total: sortedGroup.length }
                });
            } else {
                // Case: All unlocked. Show the MAX level one (last one).
                const maxAch = sortedGroup[sortedGroup.length - 1];
                processedGroups.push({
                    ...maxAch,
                    tierInfo: { current: sortedGroup.length, total: sortedGroup.length }
                });
            }
        });

        // 4. Combine standalone and processed groups
        return [...standalone, ...processedGroups].sort((a,b) => {
            return (a.points || 0) - (b.points || 0);
        });

    }, [allAchievements, activeCategory, unlockedAchievements]);


    // --- QUEST LOGIC ---
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

    const grandTotalPoints = totalPoints + questStatus.dailyTotalPoints + questStatus.weeklyTotalPoints;
    
    const prevPoints = usePrevious(grandTotalPoints);
    const [particleTrigger, setParticleTrigger] = useState(0);

    useEffect(() => {
        if (grandTotalPoints > prevPoints && prevPoints !== 0) {
            setParticleTrigger(Date.now());
        }
    }, [grandTotalPoints, prevPoints]);

    const levelInfo = (() => {
        const rankTitles = [
            "Pemula Finansial", "Pelajar Hemat", "Perencana Cerdas", "Pengelola Aset", 
            "Juragan Strategi", "Investor Ulung", "Master Anggaran", "Sultan Muda", 
            "Taipan Global", "Legenda Abadi"
        ];
        const levelNumber = Math.floor(Math.sqrt(grandTotalPoints / 50)) + 1;
        const rankIndex = Math.min(rankTitles.length - 1, Math.floor((levelNumber - 1) / 5));
        const currentTitle = rankTitles[rankIndex];
        const currentStart = 50 * Math.pow(levelNumber - 1, 2);
        const nextTarget = 50 * Math.pow(levelNumber, 2);

        return { level: currentTitle, levelNumber: levelNumber, currentStart: currentStart, nextTarget: nextTarget };
    })();

    const levelProgressCurrent = grandTotalPoints - levelInfo.currentStart;
    const levelProgressTarget = levelInfo.nextTarget - levelInfo.currentStart;

    return (
        <main className="p-4 pb-24 animate-fade-in">
            <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Pusat Misi & Lencana</h1>
            
            {/* Particle System */}
            <FlyingParticles trigger={particleTrigger} targetRef={mustikaBadgeRef} />

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
                            {/* MUSTIKA CURRENCY DISPLAY WITH REF */}
                            <div ref={mustikaBadgeRef} className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm mb-1 z-20 relative">
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
                            <span>Target: {levelInfo.nextTarget} XP</span>
                        </div>
                        <ProgressBar 
                            current={levelProgressCurrent} 
                            target={levelProgressTarget} 
                            className="h-4 border border-gray-100" 
                            colorClass="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                        />
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-secondary-gray font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-full">
                                Kurang {levelInfo.nextTarget - grandTotalPoints} XP lagi untuk naik level
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

            {/* --- ACHIEVEMENT SECTION --- */}
            <div className="flex justify-between items-center mb-4 px-2 border-l-4 border-primary-navy pl-3">
                <h2 className="text-xl font-bold text-primary-navy">Koleksi Lencana</h2>
                
                {/* HALL OF FAME BUTTON (SUGGESTION 5) */}
                <button 
                    onClick={() => setShowHallOfFame(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-secondary-gray hover:text-primary-navy hover:border-primary-navy px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    Hall of Fame
                </button>
            </div>
            
            {/* GEM FILTER */}
            <GemFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
            
            <div className="grid md:grid-cols-2 gap-4">
                {stackedAchievements.map(ach => {
                    let progress: { current: number; target: number } | undefined = undefined;
                    if (ach.progress) {
                        progress = ach.progress(state);
                    } else if (ach.streakKey && ach.streakTarget) {
                        progress = { current: achievementData?.[ach.streakKey] || 0, target: ach.streakTarget };
                    }
                    
                    // Only check unlocked status for THIS specific tier card
                    const isUnlocked = !!unlockedAchievements[ach.id];
                    
                    return (
                        <AchievementCard 
                            key={ach.id}
                            achievement={ach}
                            isUnlocked={isUnlocked}
                            progress={progress}
                            onClick={() => setSelectedAchievement(ach)}
                            tierInfo={ach.tierInfo}
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

            {/* HALL OF FAME MODAL (SUGGESTION 5) */}
            {showHallOfFame && (
                <HallOfFameModal 
                    unlockedAchievements={unlockedAchievements}
                    allAchievements={allAchievements}
                    onClose={() => setShowHallOfFame(false)}
                />
            )}
        </main>
    );
};

export default Achievements;
