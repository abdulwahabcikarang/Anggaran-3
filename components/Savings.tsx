
import React, { useMemo } from 'react';
import type { AppState, SavingsGoal } from '../types';
import { PlusCircleIcon, BuildingLibraryIcon, ArrowUturnLeftIcon, SparklesIcon, HeartIcon, TrashIcon, ArrowDownTrayIcon, ShoppingBagIcon } from './Icons';
import { SKIN_ASSETS, SkinStage } from '../assets';

const formatCurrency = (amount: number) => {
    if (amount >= 100000000000) { 
        return amount.toExponential(2).replace('+', '');
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// --- DEFAULT SVGS ---

const DefaultPlantSvg: React.FC<{ stage: string; className?: string }> = ({ stage, className }) => {
    return (
        <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            {/* STAGE 1: BENIH */}
            {stage === 'stage1' && (
                <g filter="url(#shadow)">
                    {/* Tanah */}
                    <path d="M156 400 Q256 440 356 400 Q356 380 256 380 Q156 380 156 400" fill="#5D4037" />
                    <path d="M176 395 Q256 420 336 395 Q336 385 256 385 Q176 385 176 395" fill="#795548" />
                    {/* Biji */}
                    <path d="M256 390 Q270 390 270 405 Q256 425 242 405 Q242 390 256 390" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                </g>
            )}

            {/* STAGE 2: TUNAS */}
            {stage === 'stage2' && (
                <g filter="url(#shadow)">
                    {/* Tanah */}
                    <path d="M186 420 Q256 440 326 420 Q326 410 256 410 Q186 410 186 420" fill="#5D4037" opacity="0.8"/>
                    {/* Batang */}
                    <path d="M256 415 Q256 380 250 350" stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" />
                    {/* Daun Kiri */}
                    <path d="M250 350 Q220 320 200 340 Q220 370 250 350" fill="url(#leafGrad)" />
                    {/* Daun Kanan */}
                    <path d="M250 350 Q280 320 300 340 Q280 370 250 350" fill="url(#leafGrad)" />
                </g>
            )}

            {/* STAGE 3: BERTUMBUH */}
            {stage === 'stage3' && (
                <g filter="url(#shadow)">
                    {/* Pot Sederhana */}
                    <path d="M220 450 L292 450 L285 380 L227 380 Z" fill="url(#potGrad)" />
                    <rect x="215" y="370" width="82" height="15" rx="2" fill="#b45309" />
                    
                    {/* Tanaman */}
                    <path d="M256 380 Q260 300 256 220" stroke="#16a34a" strokeWidth="8" fill="none" strokeLinecap="round" />
                    {/* Daun-daun */}
                    <path d="M256 320 Q210 290 190 310 Q220 340 256 320" fill="url(#leafGrad)" />
                    <path d="M256 280 Q300 250 320 270 Q290 300 256 280" fill="url(#leafGrad)" />
                    <path d="M256 240 Q210 210 190 230 Q220 260 256 240" fill="url(#leafGrad)" />
                    {/* Pucuk */}
                    <path d="M256 220 Q236 180 256 160 Q276 180 256 220" fill="#86efac" />
                </g>
            )}

            {/* STAGE 4: DEWASA */}
            {stage === 'stage4' && (
                <g filter="url(#shadow)">
                    {/* Pot Bagus */}
                    <path d="M190 460 L322 460 L310 340 L202 340 Z" fill="url(#potGrad)" />
                    <path d="M180 340 L332 340 L332 310 L180 310 Z" fill="#b45309" />
                    <rect x="220" y="360" width="72" height="60" rx="5" fill="#78350f" opacity="0.3" /> {/* Decor on pot */}

                    {/* Batang Utama */}
                    <path d="M256 320 Q256 200 256 150" stroke="#15803d" strokeWidth="12" fill="none" strokeLinecap="round" />
                    
                    {/* Rimbunan Daun */}
                    <g transform="translate(0, -20)">
                        <circle cx="256" cy="150" r="110" fill="url(#leafGrad)" opacity="0.3" />
                        <path d="M256 180 Q180 100 120 160 Q180 240 256 180" fill="#22c55e" />
                        <path d="M256 180 Q332 100 392 160 Q332 240 256 180" fill="#22c55e" />
                        <path d="M256 150 Q190 50 140 100 Q190 180 256 150" fill="#16a34a" />
                        <path d="M256 150 Q322 50 372 100 Q322 180 256 150" fill="#16a34a" />
                        <path d="M256 120 Q220 20 256 10 Q292 20 256 120" fill="#4ade80" />
                        
                        {/* Bunga/Buah */}
                        <circle cx="200" cy="120" r="10" fill="#fbbf24" />
                        <circle cx="312" cy="120" r="10" fill="#fbbf24" />
                        <circle cx="256" cy="80" r="12" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                    </g>
                </g>
            )}
        </svg>
    );
};

const DefaultPetSvg: React.FC<{ stage: string; className?: string }> = ({ stage, className }) => {
    return (
        <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="petBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" /> {/* Orange Cat */}
                    <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
                <filter id="petShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            {/* STAGE 1: TELUR */}
            {stage === 'stage1' && (
                <g filter="url(#petShadow)" transform="translate(0, 50)">
                    <ellipse cx="256" cy="256" rx="85" ry="105" fill="#fef08a" stroke="#eab308" strokeWidth="6"/>
                    <path d="M256 151 A 85 105 0 0 1 341 256" fill="none" stroke="#fff" strokeWidth="10" opacity="0.4" strokeLinecap="round"/>
                    <circle cx="210" cy="220" r="18" fill="#facc15" opacity="0.7"/>
                    <circle cx="290" cy="290" r="12" fill="#facc15" opacity="0.7"/>
                    <circle cx="280" cy="190" r="8" fill="#facc15" opacity="0.7"/>
                </g>
            )}

            {/* STAGE 2: BAYI */}
            {stage === 'stage2' && (
                <g filter="url(#petShadow)" transform="translate(0, 30)">
                    {/* Kepala Bulat */}
                    <circle cx="256" cy="256" r="90" fill="url(#petBody)" />
                    {/* Telinga */}
                    <path d="M190 190 L160 110 L240 170 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="4" strokeLinejoin="round" />
                    <path d="M322 190 L352 110 L272 170 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="4" strokeLinejoin="round" />
                    {/* Wajah Imut */}
                    <circle cx="215" cy="240" r="12" fill="#1f2937" />
                    <circle cx="218" cy="236" r="4" fill="#fff" />
                    <circle cx="297" cy="240" r="12" fill="#1f2937" />
                    <circle cx="300" cy="236" r="4" fill="#fff" />
                    <path d="M246 270 Q256 280 266 270" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
                    {/* Pipi */}
                    <ellipse cx="200" cy="265" rx="8" ry="5" fill="#fca5a5" opacity="0.6"/>
                    <ellipse cx="312" cy="265" rx="8" ry="5" fill="#fca5a5" opacity="0.6"/>
                </g>
            )}

            {/* STAGE 3: REMAJA */}
            {stage === 'stage3' && (
                <g filter="url(#petShadow)">
                    {/* Ekor Goyang */}
                    <path d="M320 360 Q390 320 370 250" stroke="#c2410c" strokeWidth="18" fill="none" strokeLinecap="round">
                        <animate attributeName="d" values="M320 360 Q390 320 370 250; M320 360 Q410 360 370 250; M320 360 Q390 320 370 250" dur="2s" repeatCount="indefinite" />
                    </path>
                    {/* Badan */}
                    <ellipse cx="256" cy="350" rx="80" ry="70" fill="url(#petBody)" />
                    <ellipse cx="256" cy="350" rx="50" ry="40" fill="#fff" opacity="0.2" /> {/* Perut */}
                    
                    {/* Kepala */}
                    <circle cx="256" cy="250" r="80" fill="url(#petBody)" />
                    {/* Telinga */}
                    <path d="M190 190 L160 110 L240 170 Z" fill="#fb923c" />
                    <path d="M322 190 L352 110 L272 170 Z" fill="#fb923c" />
                    {/* Wajah */}
                    <circle cx="220" cy="230" r="10" fill="#1f2937" />
                    <circle cx="292" cy="230" r="10" fill="#1f2937" />
                    <path d="M246 260 Q256 270 266 260" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
                    {/* Kaki Depan */}
                    <ellipse cx="220" cy="410" rx="15" ry="10" fill="#fff" />
                    <ellipse cx="292" cy="410" rx="15" ry="10" fill="#fff" />
                </g>
            )}

            {/* STAGE 4: DEWASA */}
            {stage === 'stage4' && (
                <g filter="url(#petShadow)">
                    {/* Ekor Besar */}
                    <path d="M300 380 Q420 350 400 220" stroke="#ea580c" strokeWidth="25" fill="none" strokeLinecap="round">
                        <animate attributeName="d" values="M300 380 Q420 350 400 220; M300 380 Q440 380 400 200; M300 380 Q420 350 400 220" dur="4s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Badan */}
                    <path d="M196 420 L316 420 L330 280 L182 280 Z" fill="url(#petBody)" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round"/>
                    {/* Kaki-kaki */}
                    <path d="M196 420 Q170 440 210 440" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
                    <path d="M316 420 Q342 440 302 440" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
                    
                    {/* Kepala */}
                    <circle cx="256" cy="230" r="85" fill="url(#petBody)" />
                    <path d="M180 180 L150 90 L240 160 Z" fill="#ea580c" />
                    <path d="M332 180 L362 90 L272 160 Z" fill="#ea580c" />
                    
                    {/* Wajah Detail */}
                    <circle cx="220" cy="220" r="14" fill="#1f2937" />
                    <circle cx="224" cy="216" r="5" fill="#fff" />
                    <circle cx="292" cy="220" r="14" fill="#1f2937" />
                    <circle cx="296" cy="216" r="5" fill="#fff" />
                    <path d="M246 250 Q256 260 266 250" stroke="#1f2937" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M256 240 L246 250 L266 250 Z" fill="#fca5a5" /> {/* Nose */}
                    
                    {/* Kumis */}
                    <line x1="180" y1="240" x2="210" y2="245" stroke="#78350f" strokeWidth="2" opacity="0.5"/>
                    <line x1="180" y1="255" x2="210" y2="255" stroke="#78350f" strokeWidth="2" opacity="0.5"/>
                    <line x1="332" y1="240" x2="302" y2="245" stroke="#78350f" strokeWidth="2" opacity="0.5"/>
                    <line x1="332" y1="255" x2="302" y2="255" stroke="#78350f" strokeWidth="2" opacity="0.5"/>

                    {/* Kalung Emas (Simbol Tabungan) */}
                    <rect x="216" y="305" width="80" height="18" rx="6" fill="#ef4444" />
                    <circle cx="256" cy="320" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                    <path d="M256 315 L256 325 M251 320 L261 320" stroke="#b45309" strokeWidth="2" strokeLinecap="round" /> {/* Plus sign on coin */}
                </g>
            )}
        </svg>
    );
};

// --- IMAGE VISUALIZER COMPONENT (4 STAGES) ---
const ExternalImageVisualizer: React.FC<{
    progress: number;
    isCompleted: boolean;
    visualType: 'plant' | 'pet';
    skinId?: string;
}> = ({ progress, isCompleted, visualType, skinId }) => {
    
    // 1. Determine Stage (4 Tahapan)
    let stageKey: 'stage1' | 'stage2' | 'stage3' | 'stage4';
    let stageLabel = '';

    const isMaxLevel = progress >= 100 || isCompleted;

    if (isMaxLevel) {
        stageKey = 'stage4';
        stageLabel = visualType === 'pet' ? 'Dewasa (Max)' : 'Mekar (Max)';
    } else if (progress >= 75) {
        stageKey = 'stage4';
        stageLabel = visualType === 'pet' ? 'Dewasa' : 'Pohon Besar';
    } else if (progress >= 50) {
        stageKey = 'stage3';
        stageLabel = visualType === 'pet' ? 'Remaja' : 'Bertumbuh';
    } else if (progress >= 25) {
        stageKey = 'stage2';
        stageLabel = visualType === 'pet' ? 'Bayi' : 'Tunas';
    } else {
        stageKey = 'stage1';
        stageLabel = visualType === 'pet' ? 'Telur' : 'Benih';
    }

    // 2. Check for Default Skin Logic
    const isDefaultSkin = (!skinId || skinId === 'default' || (visualType === 'pet' && skinId === 'pet_default'));

    // 3. Get Correct Asset URL (if not default)
    let assets: SkinStage;
    if (skinId && SKIN_ASSETS[skinId]) {
        assets = SKIN_ASSETS[skinId];
    } else {
        assets = visualType === 'pet' ? SKIN_ASSETS['pet_default'] : SKIN_ASSETS['default'];
    }

    const imageUrl = assets[stageKey];

    // 4. Animation & Style Logic based on stage
    // Apply large size scaling (Big Boss Mode) to all premium skins
    const largeSkins = [
        'fox', 'dragon', 'swan', 'turtle', 'robot', 'jellyfish', 
        'anthurium', 'monstera', 'sakura', 'aglonema', 'higanbana', 'wijaya', 'kadupul'
    ];
    const isLargeSkin = skinId && largeSkins.includes(skinId);

    let animationClass = "";
    let sizeClass = "";
    let filterClass = "";

    switch (stageKey) {
        case 'stage1':
            animationClass = "animate-bounce-slow";
            sizeClass = isLargeSkin ? "w-48 h-48" : "w-24 h-24"; // 2x size for Big Skins
            filterClass = "drop-shadow-lg";
            break;
        case 'stage2':
            animationClass = "animate-pulse";
            sizeClass = isLargeSkin ? "w-64 h-64" : "w-32 h-32"; 
            filterClass = "drop-shadow-xl";
            break;
        case 'stage3':
            animationClass = "animate-[float_8s_ease-in-out_infinite]";
            sizeClass = isLargeSkin ? "w-72 h-72" : "w-40 h-40"; 
            filterClass = "drop-shadow-2xl";
            break;
        case 'stage4':
            animationClass = "animate-[float_6s_ease-in-out_infinite]";
            sizeClass = isLargeSkin ? "w-96 h-96" : "w-48 h-48"; 
            filterClass = "drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]";
            break;
    }

    return (
        <div className="relative w-full h-64 flex items-center justify-center rounded-t-xl bg-gradient-to-b from-blue-50/50 to-white overflow-hidden group">
            {/* SPECIAL 100% LIGHT EFFECT - HOLY LIGHT */}
            {isMaxLevel && (
                <>
                    {/* Rotating Sunburst */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-40 z-0 animate-[spinSlow_15s_linear_infinite]">
                        <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.5)_20deg,transparent_40deg,rgba(255,215,0,0.5)_60deg,transparent_80deg,rgba(255,215,0,0.5)_100deg,transparent_120deg,rgba(255,215,0,0.5)_140deg,transparent_160deg,rgba(255,215,0,0.5)_180deg,transparent_200deg,rgba(255,215,0,0.5)_220deg,transparent_240deg,rgba(255,215,0,0.5)_260deg,transparent_280deg,rgba(255,215,0,0.5)_300deg,transparent_320deg,rgba(255,215,0,0.5)_340deg,transparent_360deg)]"></div>
                    </div>
                    {/* Pulsing Aura */}
                    <div className="absolute w-60 h-60 rounded-full bg-yellow-400/20 blur-3xl animate-pulse z-0"></div>
                    
                    {/* Floating Particles */}
                    <SparklesIcon className="absolute top-10 left-10 w-6 h-6 text-yellow-400 animate-bounce z-20" />
                    <SparklesIcon className="absolute bottom-12 right-10 w-4 h-4 text-yellow-500 animate-ping z-20" />
                    <SparklesIcon className="absolute top-20 right-20 w-3 h-3 text-orange-400 animate-pulse z-20" />
                </>
            )}

            {/* Standard Background Glow (Dynamic based on stage) */}
            {!isMaxLevel && (
                <div className={`absolute w-40 h-40 rounded-full blur-3xl opacity-50 transition-all duration-1000 ${
                    stageKey === 'stage4' ? 'bg-yellow-300 scale-150' : 
                    stageKey === 'stage3' ? 'bg-purple-200 scale-125' :
                    stageKey === 'stage2' ? 'bg-green-200 scale-100' : 'bg-gray-200 scale-75'
                }`}></div>
            )}

            {/* The Image OR SVG */}
            {isDefaultSkin ? (
                 visualType === 'plant' ? (
                    <DefaultPlantSvg stage={stageKey} className={`relative z-10 transition-all duration-700 ease-out w-40 h-40 sm:w-48 sm:h-48 ${animationClass} ${filterClass} hover:scale-110`} />
                 ) : (
                    <DefaultPetSvg stage={stageKey} className={`relative z-10 transition-all duration-700 ease-out w-40 h-40 sm:w-48 sm:h-48 ${animationClass} ${filterClass} hover:scale-110`} />
                 )
            ) : (
                <img 
                    src={imageUrl} 
                    alt={`${visualType} ${stageKey}`}
                    className={`relative z-10 object-contain transition-all duration-700 ease-out ${sizeClass} ${animationClass} ${filterClass} hover:scale-110`}
                />
            )}

            {/* Stage Badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-primary-navy shadow-md border border-gray-200 z-20 flex items-center gap-1">
                <span>{stageLabel}</span>
                <span className={`ml-1 ${progress >= 100 ? 'text-green-600' : 'text-accent-teal'}`}>
                    ({Math.floor(progress)}%)
                </span>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes spinSlow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const SavingsGoalCard: React.FC<{
    goal: SavingsGoal;
    onAddSavings: () => void;
    onWithdrawSavings: () => void;
    onViewDetails: () => void;
    onDelete: () => void;
    onUseGoal: () => void; 
}> = ({ goal, onAddSavings, onWithdrawSavings, onViewDetails, onDelete, onUseGoal }) => {
    
    // EVOLUTION LOGIC
    let percentage = 0;
    let growthLabel = '';

    if (!goal.isInfinite && goal.targetAmount) {
        const clampedSaved = Math.max(0, goal.savedAmount);
        percentage = Math.min(100, (clampedSaved / goal.targetAmount) * 100);
        growthLabel = `${Math.floor(percentage)}% Terkumpul`;
    } else {
        // Infinite Goal Logic
        // Scale updated for 4 stages: need more interaction to reach max
        const positiveTxCount = goal.history.filter(h => h.amount > 0).length;
        const negativeTxCount = goal.history.filter(h => h.amount < 0).length;
        const penaltyPerWithdrawal = 10;
        const effectiveGrowthScore = positiveTxCount - (negativeTxCount * penaltyPerWithdrawal);
        const maxScore = 40; // Increased max score for longer game
        const clampedScore = Math.max(0, Math.min(maxScore, effectiveGrowthScore));
        percentage = (clampedScore / maxScore) * 100;
        growthLabel = `Evolusi: ${clampedScore}/${maxScore} Poin`;
    }

    const handleMainClick = () => {
        if (goal.isCompleted) {
            onUseGoal();
        } else {
            onAddSavings();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 relative group transform hover:-translate-y-1">
            {goal.isInfinite && (
                <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur text-indigo-600 text-[10px] font-extrabold px-2 py-1 rounded-md border border-indigo-100 shadow-sm uppercase tracking-wide">
                    Fleksibel
                </div>
            )}

            <div onClick={handleMainClick} className="cursor-pointer relative bg-gray-50">
                 
                 <ExternalImageVisualizer 
                    progress={percentage}
                    isCompleted={goal.isCompleted}
                    visualType={goal.visualType || 'plant'}
                    skinId={goal.skinId}
                 />
                 
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center z-20">
                    <div className={`opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm backdrop-blur-md ${goal.isCompleted ? 'bg-yellow-100/90 text-yellow-800' : 'bg-white/90 text-accent-teal'}`}>
                        {goal.isCompleted ? (
                            <><ShoppingBagIcon className="w-4 h-4" /> Gunakan</>
                        ) : (
                            <><PlusCircleIcon className="w-4 h-4" /> {goal.visualType === 'pet' ? 'Beri Makan' : 'Siram'}</>
                        )}
                    </div>
                 </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-black text-primary-navy truncate w-full tracking-tight" title={goal.name}>{goal.name}</h3>
                </div>

                <div className="mb-5">
                    {goal.isInfinite ? (
                        <div>
                             <p className="text-[10px] text-secondary-gray uppercase tracking-widest font-bold mb-1">Dana Terkumpul</p>
                             <p className="font-black text-2xl text-primary-navy">{formatCurrency(goal.savedAmount)}</p>
                             <p className="text-[10px] text-accent-teal font-medium mt-1 bg-teal-50 inline-block px-2 py-0.5 rounded">{growthLabel}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-black text-primary-navy">{formatCurrency(goal.savedAmount)}</span>
                            </div>
                             <div className="flex justify-between text-xs text-secondary-gray mb-2 font-medium">
                                <span>Target: {formatCurrency(goal.targetAmount || 0)}</span>
                                <span className={goal.isCompleted ? 'text-green-600 font-bold' : ''}>{goal.isCompleted ? 'Selesai!' : 'Sedang Tumbuh'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${goal.isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`} 
                                    style={{ width: `${percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className={`mt-auto pt-4 border-t border-gray-100 grid ${goal.isInfinite ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-[1fr_auto]'} gap-3`}>
                    {goal.isCompleted ? (
                        <button 
                            onClick={onUseGoal}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2.5 px-3 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all text-xs flex items-center justify-center gap-2 animate-pulse"
                        >
                            <ShoppingBagIcon className="w-4 h-4" />
                            CAIRKAN
                        </button>
                    ) : (
                        <button 
                            onClick={onAddSavings} 
                            className="bg-primary-navy text-white font-bold py-2.5 px-3 rounded-xl hover:bg-primary-navy-dark transition-all shadow-md hover:shadow-lg text-xs flex items-center justify-center gap-2"
                        >
                            <PlusCircleIcon className="w-4 h-4" />
                            ISI CELENGAN
                        </button>
                    )}

                    {goal.isInfinite && (
                        <button 
                            onClick={onWithdrawSavings}
                            disabled={goal.savedAmount <= 0}
                            className="bg-white border border-gray-200 text-danger-red font-bold py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            TARIK
                        </button>
                    )}
                    
                    {goal.isInfinite ? (
                        <button 
                            onClick={onDelete} 
                            className="font-bold p-2.5 rounded-xl transition-colors flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"
                            title="Hapus Permanen"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={onViewDetails} 
                            title="Detail Riwayat"
                            className="font-bold p-2.5 rounded-xl transition-colors flex items-center justify-center bg-gray-50 text-secondary-gray hover:bg-gray-100 border border-gray-200"
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
    const totalSaved = useMemo(() => savingsGoals.reduce((acc, g) => acc + g.savedAmount, 0), [savingsGoals]);

    return (
        <main id="savings-page" className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-primary-navy tracking-tight">Kebun & Kandang Uang</h1>
                    <p className="text-secondary-gray text-sm mt-1">Rawat aset digitalmu dengan menabung rutin.</p>
                </div>
                <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <BuildingLibraryIcon className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                        <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Total Disimpan</p>
                        <p className="text-2xl font-black text-green-700">{formatCurrency(totalSaved)}</p>
                    </div>
                </div>
            </div>

            {savingsGoals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200 space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-teal-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <SparklesIcon className="w-16 h-16 text-teal-600 opacity-80 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-primary-navy">Masih Kosong, Nih!</h3>
                        <p className="text-secondary-gray max-w-xs mx-auto mt-2 leading-relaxed">
                            Mulai petualangan finansialmu. Tanam benih pohon uang atau tetaskan telur naga emas sekarang.
                        </p>
                    </div>
                    <button 
                        onClick={onOpenAddGoalModal} 
                        className="inline-flex items-center gap-2 bg-primary-navy text-white font-bold py-4 px-8 rounded-full hover:bg-primary-navy-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Buat Celengan Baru
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
                                onUseGoal={() => onOpenSavingsGoal(goal.id)} 
                            />
                        ))}
                         
                        <button 
                            onClick={onOpenAddGoalModal}
                            className="min-h-[350px] rounded-2xl border-3 border-dashed border-gray-300 hover:border-accent-teal hover:bg-teal-50/50 transition-all duration-300 flex flex-col items-center justify-center text-gray-400 hover:text-accent-teal group"
                        >
                            <div className="w-20 h-20 rounded-full bg-white group-hover:scale-110 flex items-center justify-center mb-4 transition-all shadow-sm border border-gray-200">
                                <PlusCircleIcon className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-lg">Tambah Baru</span>
                            <span className="text-xs font-medium mt-1 opacity-70">Mulai target lain</span>
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Savings;
