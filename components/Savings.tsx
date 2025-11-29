
import React, { useMemo } from 'react';
import type { AppState, SavingsGoal } from '../types';
import { PlusCircleIcon, BuildingLibraryIcon, ArrowUturnLeftIcon, SparklesIcon, HeartIcon, TrashIcon, ArrowDownTrayIcon, ShoppingBagIcon } from './Icons';

const formatCurrency = (amount: number) => {
    if (amount >= 100000000000) { // If > 11 digits (100 Billion)
        return amount.toExponential(2).replace('+', '');
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

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
                {Math.floor(growth)}%
            </div>
        </div>
    );
};

// --- HIGH FIDELITY PET VISUALIZER COMPONENT ---
const PetVisualizer: React.FC<{
    progress: number;
    isCompleted: boolean;
    seed: number;
    type: 'finite' | 'infinite';
}> = ({ progress, isCompleted, seed }) => {
    // Determine Stage
    let stage: 'egg' | 'baby' | 'teen' | 'adult' | 'legendary' = 'egg';
    if (progress >= 100 || isCompleted) stage = 'legendary';
    else if (progress >= 80) stage = 'adult';
    else if (progress >= 50) stage = 'teen';
    else if (progress >= 20) stage = 'baby';

    // Procedural Color Palettes based on seed
    const palettes = [
        { name: 'Phoenix', primary: '#FF4500', secondary: '#FFA500', accent: '#FFD700', dark: '#8B0000' }, // Merah Api
        { name: 'Sapphire', primary: '#1E90FF', secondary: '#00BFFF', accent: '#E0FFFF', dark: '#00008B' }, // Biru
        { name: 'Emerald', primary: '#228B22', secondary: '#32CD32', accent: '#98FB98', dark: '#006400' }, // Hijau
        { name: 'Amethyst', primary: '#9370DB', secondary: '#BA55D3', accent: '#E6E6FA', dark: '#4B0082' }, // Ungu
        { name: 'Gold', primary: '#DAA520', secondary: '#FFD700', accent: '#FFFACD', dark: '#8B4513' }, // Emas
    ];
    
    const p = palettes[seed % palettes.length];

    return (
        <div className="relative w-full h-56 flex items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-t from-gray-100 to-white group">
            
            {/* Environment / Background Elements */}
            <div className="absolute bottom-0 w-full h-12 bg-[#e0e0e0] rounded-[50%] blur-xl transform scale-x-150 translate-y-6 opacity-60"></div>
            
            {/* Interactive Elements on Hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <HeartIcon className="w-6 h-6 text-pink-400 animate-bounce" />
            </div>

            <svg width="220" height="200" viewBox="0 0 220 200" className="z-10 drop-shadow-lg">
                <defs>
                    <linearGradient id={`gradBody-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={p.secondary} />
                        <stop offset="100%" stopColor={p.primary} />
                    </linearGradient>
                    <linearGradient id={`gradWing-${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={p.accent} />
                        <stop offset="100%" stopColor={p.secondary} />
                    </linearGradient>
                    <radialGradient id={`gradEye-${seed}`} cx="30%" cy="30%" r="50%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* --- STAGE 1: REALISTIC EGG (0-20%) --- */}
                {stage === 'egg' && (
                    <g className="animate-[wiggle_3s_ease-in-out_infinite] origin-bottom">
                        {/* Shadow */}
                        <ellipse cx="110" cy="175" rx="35" ry="8" fill="black" opacity="0.2" />
                        
                        {/* Egg Shape */}
                        <path 
                            d="M110,40 C140,40 160,100 160,140 C160,170 140,180 110,180 C80,180 60,170 60,140 C60,100 80,40 110,40 Z" 
                            fill={`url(#gradBody-${seed})`}
                            stroke={p.dark}
                            strokeWidth="1"
                        />
                        
                        {/* Highlights & Texture */}
                        <ellipse cx="95" cy="80" rx="10" ry="25" fill="white" opacity="0.3" transform="rotate(-15 95 80)" />
                        <circle cx="130" cy="120" r="5" fill={p.dark} opacity="0.1" />
                        <circle cx="90" cy="150" r="8" fill={p.dark} opacity="0.1" />
                        
                        {/* Cracks appear near end of stage */}
                        {progress > 15 && (
                            <path d="M110,40 L105,60 L115,70 L100,90" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
                        )}
                    </g>
                )}

                {/* --- STAGE 2: CUTE BABY CHICK (20-50%) --- */}
                {stage === 'baby' && (
                    <g className="animate-bounce-slow origin-bottom">
                        {/* Shadow */}
                        <ellipse cx="110" cy="170" rx="30" ry="6" fill="black" opacity="0.2" />

                        {/* Body (Fluffy Ball) */}
                        <circle cx="110" cy="130" r="40" fill={`url(#gradBody-${seed})`} />
                        
                        {/* Tiny Wings */}
                        <path d="M70,130 Q60,120 75,115" fill="none" stroke={p.dark} strokeWidth="3" strokeLinecap="round" className="animate-[flap_0.5s_ease-in-out_infinite]" />
                        <path d="M150,130 Q160,120 145,115" fill="none" stroke={p.dark} strokeWidth="3" strokeLinecap="round" className="animate-[flap_0.5s_ease-in-out_infinite_reverse]" />

                        {/* Big Cute Eyes */}
                        <circle cx="95" cy="120" r="6" fill="black" />
                        <circle cx="125" cy="120" r="6" fill="black" />
                        <circle cx="93" cy="118" r="2.5" fill="white" />
                        <circle cx="123" cy="118" r="2.5" fill="white" />

                        {/* Beak (Open demanding food) */}
                        <path d="M105,135 L115,135 L110,145 Z" fill="#FFA500" stroke="#CC8400" strokeWidth="1" />
                        
                        {/* Feet */}
                        <path d="M100,165 L100,175 M120,165 L120,175" stroke={p.dark} strokeWidth="3" strokeLinecap="round" />
                    </g>
                )}

                {/* --- STAGE 3: TEEN BIRD (50-80%) --- */}
                {stage === 'teen' && (
                    <g transform="translate(10, 10)">
                        {/* Shadow */}
                        <ellipse cx="100" cy="160" rx="30" ry="6" fill="black" opacity="0.2" />

                        {/* Body shape getting more streamlined */}
                        <path 
                            d="M60,120 Q60,90 100,90 Q140,90 140,130 Q140,160 100,160 Q60,160 60,120" 
                            fill={`url(#gradBody-${seed})`} 
                        />

                        {/* Head */}
                        <circle cx="100" cy="80" r="25" fill={`url(#gradBody-${seed})`} />

                        {/* Crest/Hair starting to grow */}
                        <path d="M100,55 Q90,40 105,35 Q110,45 100,55" fill={p.dark} />

                        {/* Wing */}
                        <path 
                            d="M80,120 Q80,160 120,140 Q130,120 80,120" 
                            fill={p.secondary} 
                            stroke={p.dark} 
                            strokeWidth="1" 
                        />

                        {/* Eye & Beak */}
                        <circle cx="90" cy="75" r="4" fill="black" />
                        <circle cx="89" cy="73" r="1.5" fill="white" />
                        <path d="M75,80 L60,85 L75,90 Z" fill="#FFA500" />
                    </g>
                )}

                {/* --- STAGE 4: MAJESTIC ADULT (80-100%) --- */}
                {(stage === 'adult' || stage === 'legendary') && (
                    <g transform="translate(20, 20)">
                        {/* Legendary Aura */}
                        {stage === 'legendary' && (
                            <circle cx="100" cy="80" r="70" fill="url(#gradBody-seed)" opacity="0.2" filter="url(#glow)" className="animate-pulse" />
                        )}

                        {/* Long Decorative Tail */}
                        <g className="origin-top-left animate-[sway_3s_ease-in-out_infinite]">
                            <path d="M60,120 C40,160 20,180 0,160 C10,140 50,120 60,120" fill={p.dark} opacity="0.8" />
                            <path d="M60,120 C50,170 60,190 80,180 C80,150 70,130 60,120" fill={p.secondary} opacity="0.9" />
                        </g>

                        {/* Main Body - Elegant Curve */}
                        <path 
                            d="M60,120 C60,150 140,150 140,100 C140,60 100,60 100,60" 
                            fill={`url(#gradBody-${seed})`}
                            stroke={p.dark}
                            strokeWidth="0.5"
                        />

                        {/* Wing - Detailed */}
                        <path 
                            d="M70,100 C70,140 130,130 150,90 C120,90 90,90 70,100" 
                            fill={`url(#gradWing-${seed})`}
                            stroke={p.dark}
                            strokeWidth="1"
                        />

                        {/* Head */}
                        <path d="M100,60 C80,60 80,90 100,90 C110,90 120,80 120,60" fill={`url(#gradBody-${seed})`} />
                        <circle cx="100" cy="60" r="18" fill={`url(#gradBody-${seed})`} />

                        {/* Eye */}
                        <circle cx="92" cy="55" r="3" fill="black" />
                        <circle cx="91" cy="54" r="1" fill="white" />

                        {/* Beak */}
                        <path d="M84,55 Q70,60 84,65" fill="#FFA500" />

                        {/* Crest / Crown */}
                        {stage === 'legendary' ? (
                            <path d="M100,42 L110,20 L120,42 Z" fill="#FFD700" stroke="#B8860B" filter="url(#glow)" />
                        ) : (
                            <path d="M105,45 Q115,30 120,45" fill={p.dark} />
                        )}

                        {/* Branch */}
                        <path d="M40,135 L180,135" stroke="#8B4513" strokeWidth="6" strokeLinecap="round" />
                        <path d="M120,135 L140,150" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Feet Claws */}
                        <path d="M90,135 L90,140 M100,135 L100,140" stroke="#000" strokeWidth="2" />
                    </g>
                )}
            </svg>

            {/* Custom Animations */}
            <style>{`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-5deg); }
                    75% { transform: rotate(5deg); }
                }
                @keyframes flap {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.6); }
                }
                @keyframes sway {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(5deg); }
                }
            `}</style>
            
            {/* Status Badge */}
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary-navy shadow-sm border border-gray-100 flex items-center gap-1 z-20">
                {stage === 'egg' && 'Fase Telur'}
                {stage === 'baby' && 'Fase Bayi'}
                {stage === 'teen' && 'Fase Remaja'}
                {stage === 'adult' && 'Fase Dewasa'}
                {stage === 'legendary' && <><SparklesIcon className="w-3 h-3 text-yellow-500" /> Legenda</>}
                <span className="ml-1 text-[10px] text-secondary-gray">({Math.floor(progress)}%)</span>
            </div>
        </div>
    );
};

const SavingsGoalCard: React.FC<{
    goal: SavingsGoal;
    onAddSavings: () => void;
    onWithdrawSavings: () => void;
    onViewDetails: () => void;
    onDelete: () => void;
    onUseGoal: () => void; // New prop for using completed goal
}> = ({ goal, onAddSavings, onWithdrawSavings, onViewDetails, onDelete, onUseGoal }) => {
    
    // EVOLUTION LOGIC
    let percentage = 0;
    let growthLabel = '';

    if (!goal.isInfinite && goal.targetAmount) {
        // --- 1. TARGETED GOAL: PERCENTAGE BASED ---
        const clampedSaved = Math.max(0, goal.savedAmount);
        percentage = Math.min(100, (clampedSaved / goal.targetAmount) * 100);
        growthLabel = `${Math.floor(percentage)}% Terkumpul`;
    } else {
        // --- 2. INFINITE GOAL: COUNT BASED ---
        const positiveTxCount = goal.history.filter(h => h.amount > 0).length;
        const negativeTxCount = goal.history.filter(h => h.amount < 0).length;
        
        const penaltyPerWithdrawal = 10;
        const effectiveGrowthScore = positiveTxCount - (negativeTxCount * penaltyPerWithdrawal);
        const maxScore = 30; // 30 deposits to max out
        const clampedScore = Math.max(0, Math.min(maxScore, effectiveGrowthScore));
        
        percentage = (clampedScore / maxScore) * 100;
        growthLabel = `Evolusi: ${clampedScore}/${maxScore} Poin`;
    }

    const isPet = goal.visualType === 'pet';

    // Handle Click behavior: If completed, offer Use, otherwise Add Savings
    const handleMainClick = () => {
        if (goal.isCompleted) {
            onUseGoal();
        } else {
            onAddSavings();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100 relative">
            {/* Infinite Label Badge */}
            {goal.isInfinite && (
                <div className="absolute top-2 left-2 z-20 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-200 shadow-sm">
                    Fleksibel
                </div>
            )}

            {/* Visual Area */}
            <div onClick={handleMainClick} className="cursor-pointer group relative">
                 {isPet ? (
                     <PetVisualizer 
                        progress={percentage} 
                        isCompleted={goal.isCompleted} 
                        seed={goal.id} 
                        type={goal.isInfinite ? 'infinite' : 'finite'}
                     />
                 ) : (
                     <PlantVisualizer 
                        progress={percentage} 
                        isCompleted={goal.isCompleted} 
                        seed={goal.id}
                        type={goal.isInfinite ? 'infinite' : 'finite'}
                     />
                 )}
                 
                 {/* Hover overlay to indicate action */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className={`opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm ${goal.isCompleted ? 'bg-yellow-100 text-yellow-700' : 'bg-white/90 text-accent-teal'}`}>
                        {goal.isCompleted ? (
                            <><ShoppingBagIcon className="w-4 h-4" /> Gunakan</>
                        ) : (
                            <><PlusCircleIcon className="w-4 h-4" /> {isPet ? 'Beri Makan' : 'Siram'}</>
                        )}
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
                             <p className="text-[10px] text-gray-400 mt-1">{growthLabel}</p>
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
                <div className={`mt-auto pt-3 border-t border-gray-50 grid ${goal.isInfinite ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-[1fr_auto]'} gap-2`}>
                    
                    {/* 1. Main Action Button (Use if completed, Add if not) */}
                    {goal.isCompleted ? (
                        <button 
                            onClick={onUseGoal}
                            className="bg-yellow-500 text-white font-bold py-2 px-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md text-xs flex items-center justify-center gap-1 animate-pulse"
                        >
                            <ShoppingBagIcon className="w-3 h-3" />
                            Gunakan!
                        </button>
                    ) : (
                        <button 
                            onClick={onAddSavings} 
                            className="bg-primary-navy text-white font-bold py-2 px-2 rounded-lg hover:bg-primary-navy-dark transition-colors shadow-sm text-xs flex items-center justify-center gap-1"
                        >
                            <PlusCircleIcon className="w-3 h-3" />
                            Isi (+)
                        </button>
                    )}

                    {/* 2. Partial Withdraw (ONLY FOR INFINITE) */}
                    {goal.isInfinite && (
                        <button 
                            onClick={onWithdrawSavings}
                            disabled={goal.savedAmount <= 0}
                            className="bg-white border border-gray-200 text-danger-red font-bold py-2 px-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1"
                        >
                            <ArrowDownTrayIcon className="w-3 h-3" />
                            Ambil (-)
                        </button>
                    )}
                    
                    {/* 3. Menu / Delete */}
                    {goal.isInfinite ? (
                        <button 
                            onClick={onDelete} 
                            className="font-bold p-2 rounded-lg transition-colors flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200"
                            title="Tarik Semua & Hapus Celengan"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={onViewDetails} 
                            title="Detail & Opsi Hapus"
                            className="font-bold p-2 rounded-lg transition-colors flex items-center justify-center bg-gray-100 text-secondary-gray hover:bg-gray-200"
                        >
                            <BuildingLibraryIcon className="w-4 h-4" />
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
                    <h1 className="text-3xl font-bold text-primary-navy">Kebun & Kandang Tabungan</h1>
                    <p className="text-secondary-gray text-sm">Rawat tanaman atau peliharaanmu dengan menabung rutin.</p>
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
                    <h3 className="text-xl font-bold text-primary-navy">Belum Ada Koleksi</h3>
                    <p className="text-secondary-gray max-w-xs mx-auto">Mulai tanam benih atau tetaskan telur impianmu sekarang!</p>
                    <button onClick={onOpenAddGoalModal} className="mt-4 bg-accent-teal text-white font-bold py-3 px-6 rounded-full hover:bg-accent-teal-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        + Buat Celengan Baru
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
                                onWithdrawSavings={() => onOpenSavingsGoal(goal.id)}
                                onViewDetails={() => onOpenDetailModal(goal.id)}
                                onDelete={() => onOpenDetailModal(goal.id)}
                                onUseGoal={() => onOpenSavingsGoal(goal.id)} // Reuse modal flow or create specific handler if passed
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
                            <span className="font-bold">Tambah Baru</span>
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Savings;
