
import React, { useMemo } from 'react';
import type { AppState, SavingsGoal } from '../types';
import { PlusCircleIcon, BuildingLibraryIcon, ArrowUturnLeftIcon, SparklesIcon } from './Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// --- PLANT VISUALIZATION COMPONENT ---
const PlantVisualizer: React.FC<{
    progress: number; // 0 to 100
    isCompleted: boolean;
    seed: number; // Used to randomize curves slightly
    type: 'finite' | 'infinite';
}> = ({ progress, isCompleted, seed, type }) => {
    // Normalize progress (clamp between 0 and 100)
    const growth = Math.min(100, Math.max(0, progress));
    
    // Procedural constants based on seed
    const curveDir = seed % 2 === 0 ? 1 : -1; // Curving left or right
    const leafAngleVar = (seed % 20) - 10; 

    // Height of the plant (max 150 units)
    const plantHeight = (growth / 100) * 120;
    
    // Number of leaves: roughly 1 leaf per 15% progress, max 8-10
    const leafCount = Math.floor(growth / 15);

    const renderLeaves = () => {
        const leaves = [];
        for (let i = 0; i < leafCount; i++) {
            const yPos = 150 - (i * (120 / 8)) - 20; // Distribute leaves up the stem
            const side = i % 2 === 0 ? 1 : -1;
            const scale = 0.5 + (i * 0.05); // Leaves get slightly bigger/smaller logic
            
            // Leaf SVG path (simple quadratic bezier shape)
            const leafPath = `M0,0 Q${15 * side},${-10} ${30 * side},${-5} Q${15 * side},${10} 0,0`;
            
            leaves.push(
                <path 
                    key={i}
                    d={leafPath}
                    fill={isCompleted ? "#27AE60" : "#2ECC71"} // Darker green if completed
                    stroke="#1E8449"
                    strokeWidth="1"
                    transform={`translate(100, ${yPos}) rotate(${(-20 * side) + leafAngleVar}) scale(${scale})`}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                />
            );
        }
        return leaves;
    };

    return (
        <div className="relative w-full h-52 flex items-end justify-center overflow-hidden rounded-t-xl bg-gradient-to-t from-blue-50 to-white">
            {/* Background Sun/Aura if completed */}
            {isCompleted && (
                <div className="absolute top-4 right-10 w-16 h-16 bg-yellow-200 rounded-full opacity-50 blur-xl animate-pulse"></div>
            )}

            <svg width="200" height="200" viewBox="0 0 200 200" className="z-10">
                {/* Pot */}
                <defs>
                    <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B4513" />
                        <stop offset="50%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#8B4513" />
                    </linearGradient>
                </defs>
                <path d="M70 170 L130 170 L120 200 L80 200 Z" fill="url(#potGradient)" stroke="#5D4037" strokeWidth="2" />
                <rect x="65" y="165" width="70" height="10" rx="2" fill="#A0522D" stroke="#5D4037" />

                {/* Seedling Stage (always visible if > 0) */}
                {growth > 0 && (
                    <>
                        {/* Stem */}
                        <path 
                            d={`M100 170 Q${100 + (20 * curveDir)} ${170 - (plantHeight / 2)} 100 ${170 - plantHeight}`} 
                            stroke={isCompleted ? "#1E8449" : "#27AE60"} 
                            strokeWidth={Math.max(2, growth / 20)} 
                            fill="none" 
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        
                        {/* Leaves */}
                        {renderLeaves()}

                        {/* Flower (Only if completed or > 95%) */}
                        {(isCompleted || growth >= 95) && (
                            <g transform={`translate(100, ${170 - plantHeight})`} className="animate-bounce-slow">
                                <circle cx="0" cy="0" r="8" fill="#F1C40F" />
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                                    <ellipse 
                                        key={i}
                                        cx="0" 
                                        cy="-12" 
                                        rx="6" 
                                        ry="10" 
                                        fill={seed % 2 === 0 ? "#E74C3C" : "#9B59B6"} // Random flower color Red or Purple
                                        transform={`rotate(${deg})`} 
                                    />
                                ))}
                            </g>
                        )}
                        
                         {/* Bud (If approaching goal) */}
                         {!isCompleted && growth > 70 && growth < 95 && (
                            <circle cx="100" cy={170 - plantHeight} r="6" fill="#2ECC71" stroke="#1E8449" />
                        )}
                    </>
                )}

                {/* Empty State / Soil */}
                {growth === 0 && (
                    <circle cx="100" cy="170" r="3" fill="#5D4037" />
                )}
            </svg>
            
            {/* Progress Badge Overlay */}
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary-navy shadow-sm border border-gray-100">
                {type === 'infinite' ? 'Level ' + Math.floor(growth/10) : Math.floor(growth) + '%'}
            </div>
        </div>
    );
};

const SavingsGoalCard: React.FC<{
    goal: SavingsGoal;
    onAddSavings: () => void;
    onViewDetails: () => void;
    onOpenGoal: () => void;
}> = ({ goal, onAddSavings, onViewDetails, onOpenGoal }) => {
    // Calculate Visual Progress
    // If Infinite, we set a "Visual Target" (e.g., 5 Million IDR = Full Grown Tree for visualization purposes)
    const visualTarget = goal.isInfinite ? 5000000 : (goal.targetAmount || 1);
    const rawPercentage = (goal.savedAmount / visualTarget) * 100;
    const percentage = Math.min(100, rawPercentage);

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
            {/* Visual Garden Area */}
            <div onClick={onAddSavings} className="cursor-pointer group relative">
                 <PlantVisualizer 
                    progress={percentage} 
                    isCompleted={goal.isCompleted} 
                    seed={goal.id} // Use ID as seed for consistency
                    type={goal.isInfinite ? 'infinite' : 'finite'}
                 />
                 {/* Hover overlay to indicate action */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-accent-teal font-bold text-sm">
                        <PlusCircleIcon className="w-4 h-4" /> Siram (Tabung)
                    </div>
                 </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-dark-text truncate w-full" title={goal.name}>{goal.name}</h3>
                </div>

                <div className="mb-4">
                    {goal.isInfinite ? (
                        <div>
                             <p className="text-xs text-secondary-gray uppercase tracking-wider mb-1">Dana Terkumpul</p>
                             <p className="font-bold text-2xl text-primary-navy">{formatCurrency(goal.savedAmount)}</p>
                             <p className="text-[10px] text-gray-400 mt-1">Celengan Fleksibel</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-bold text-primary-navy">{formatCurrency(goal.savedAmount)}</span>
                            </div>
                             <div className="flex justify-between text-xs text-secondary-gray mb-2">
                                <span>Target: {formatCurrency(goal.targetAmount || 0)}</span>
                                <span>{goal.isCompleted ? 'Selesai' : 'Sedang Tumbuh'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-100">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${goal.isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Action Area */}
                <div className="mt-auto pt-3 border-t border-gray-50 grid grid-cols-[1fr_auto] gap-3">
                    <button 
                        onClick={onAddSavings} 
                        disabled={goal.isCompleted} 
                        className="w-full bg-primary-navy text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-navy-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm text-sm flex items-center justify-center gap-2"
                    >
                        {goal.isCompleted ? <SparklesIcon className="w-4 h-4" /> : <PlusCircleIcon className="w-4 h-4" />}
                        {goal.isCompleted ? 'Tercapai' : 'Tabung'}
                    </button>
                    
                    {goal.isInfinite ? (
                        <button onClick={onOpenGoal} title="Buka Celengan" className="bg-yellow-100 text-yellow-700 font-bold p-2.5 rounded-lg hover:bg-yellow-200 transition-colors">
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={onViewDetails} title="Riwayat" className="bg-gray-100 text-secondary-gray font-bold p-2.5 rounded-lg hover:bg-gray-200 hover:text-dark-text transition-colors">
                            <BuildingLibraryIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface SavingsProps {
    state: AppState;
    onOpenAddGoalModal: () => void;
    onOpenAddSavingsModal: (goalId: number) => void;
    onOpenDetailModal: (goalId: number) => void;
    onOpenSavingsGoal: (goalId: number) => void;
}

const Savings: React.FC<SavingsProps> = ({ state, onOpenAddGoalModal, onOpenAddSavingsModal, onOpenDetailModal, onOpenSavingsGoal }) => {
    const { savingsGoals } = state;
    
    // Total stats for the header
    const totalSaved = useMemo(() => savingsGoals.reduce((acc, g) => acc + g.savedAmount, 0), [savingsGoals]);

    return (
        <main id="savings-page" className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-navy">Kebun Tabungan</h1>
                    <p className="text-secondary-gray text-sm">Siram celenganmu dengan uang agar tumbuh subur.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <BuildingLibraryIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-secondary-gray">Total Disimpan</p>
                        <p className="font-bold text-primary-navy">{formatCurrency(totalSaved)}</p>
                    </div>
                </div>
            </div>

            {savingsGoals.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-200 space-y-4">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BuildingLibraryIcon className="w-10 h-10 text-green-600 opacity-80" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-navy">Kebun Masih Kosong</h3>
                    <p className="text-secondary-gray max-w-xs mx-auto">Mulai tanam benih impianmu sekarang. Buat celengan pertamamu!</p>
                    <button onClick={onOpenAddGoalModal} className="mt-4 bg-accent-teal text-white font-bold py-3 px-6 rounded-full hover:bg-accent-teal-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        + Tanam Bibit Baru
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {savingsGoals.map(goal => (
                            <SavingsGoalCard 
                                key={goal.id} 
                                goal={goal}
                                onAddSavings={() => onOpenAddSavingsModal(goal.id)}
                                onViewDetails={() => onOpenDetailModal(goal.id)}
                                onOpenGoal={() => onOpenSavingsGoal(goal.id)}
                            />
                        ))}
                         
                         {/* Add New Card (Visual Placeholder) */}
                        <button 
                            onClick={onOpenAddGoalModal}
                            className="min-h-[320px] rounded-xl border-2 border-dashed border-gray-300 hover:border-accent-teal hover:bg-teal-50 transition-all duration-300 flex flex-col items-center justify-center text-secondary-gray hover:text-accent-teal group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mb-3 transition-colors shadow-sm">
                                <PlusCircleIcon className="w-8 h-8" />
                            </div>
                            <span className="font-bold">Tanam Bibit Baru</span>
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Savings;
