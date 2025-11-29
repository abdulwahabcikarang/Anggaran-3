
import React, { useState, useMemo, useRef } from 'react';
import type { Achievement, AppState } from '../types';
import { BudgetIcon, LockClosedIcon, ClockIcon, TrophyIcon, FireIcon, CalendarDaysIcon, SparklesIcon, RocketLaunchIcon, ArchiveBoxIcon, CheckCircleIcon } from './Icons';

interface AchievementsProps {
    state: AppState;
    allAchievements: Achievement[];
    unlockedAchievements: { [id: string]: number };
    achievementData?: AppState['achievementData'];
    totalPoints: number; // Still kept but mainly for stats, not level card
    userLevel: {
        level: string;
        currentLevelPoints: number;
        nextLevelPoints: number | null;
    };
}

const achievementCategories = ['Dasar', 'Kebiasaan Baik', 'Master Anggaran', 'Tantangan', 'Eksplorasi'];

// --- UI HELPERS ---
const ProgressBar: React.FC<{ current: number; target: number, className?: string, colorClass?: string }> = ({ current, target, className, colorClass = 'bg-accent-teal' }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
    );
};

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

// --- HALL OF FAME COMPONENT ---
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

const Achievements: React.FC<AchievementsProps> = ({ state, allAchievements, unlockedAchievements, achievementData }) => {
    const [activeCategory, setActiveCategory] = useState(achievementCategories[0]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [showHallOfFame, setShowHallOfFame] = useState(false);
    
    // --- LOGIC FOR TIERED STACKING ---
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

    return (
        <main className="p-4 pb-24 animate-fade-in">
            <h1 className="text-3xl font-bold text-primary-navy text-center mb-6">Galeri Lencana</h1>
            
            {/* --- ACHIEVEMENT SECTION --- */}
            <div className="flex justify-between items-center mb-4 px-2 border-l-4 border-primary-navy pl-3">
                <h2 className="text-xl font-bold text-primary-navy">Koleksi</h2>
                
                {/* HALL OF FAME BUTTON */}
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

            {/* HALL OF FAME MODAL */}
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
