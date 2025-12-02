
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import type { AppState, Budget, Transaction, FundTransaction, GlobalTransaction, ScannedItem, SavingsGoal, SavingTransaction, Achievement, Asset, WishlistItem, Subscription, ShopItem, CustomTheme, ShoppingItem, DebtItem, DebtRecord } from './types';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Visualizations from './components/Visualizations';
import Savings from './components/Savings';
import Achievements from './components/Achievements';
import Missions from './components/Missions';
import PersonalBest from './components/PersonalBest';
import NetWorth from './components/NetWorth';
import Wishlist from './components/Wishlist';
import Subscriptions from './components/Subscriptions';
import Profile from './components/Profile';
import Shop from './components/Shop'; 
import CustomApp from './components/CustomApp';
import ShoppingList from './components/ShoppingList';
import { allAchievements } from './data/achievements';
import { availableIcons, availableColors } from './components/Icons';
import { APP_VERSION, BACKUP_PREFIX, MAX_BACKUPS, THEMES, INITIAL_STATE, VALID_REDEEM_CODES } from './constants';
import { formatCurrency, formatNumberInput, getRawNumber, fileToBase64, getApiKey, getSystemInstruction, encryptData, decryptData } from './utils';
import { Modal, ConfirmModal, DailyBackupToast, NotificationToast, AchievementUnlockedToast, BottomNavBar, MainMenu } from './components/AppUI';
import { 
    InputModalContent, AssetModalContent, BatchInputModalContent, AddBudgetModalContent, 
    AddSavingsGoalModalContent, AddSavingsModalContent, WithdrawSavingsModalContent, 
    SavingsDetailModalContent, FundsManagementModalContent, HistoryModalContent, 
    InfoModalContent, EditAssetModalContent, SettingsModalContent, ArchivedBudgetsModalContent, 
    BackupRestoreModalContent, ScanResultModalContent, VoiceAssistantModalContent, 
    SmartInputModalContent, AIAdviceModalContent, AIChatModalContent, AddWishlistModalContent, RedeemModalContent, DebtManagerModalContent, DailyBonusModalContent
} from './components/AppModals';

type Page = 'dashboard' | 'reports' | 'visualizations' | 'savings' | 'achievements' | 'missions' | 'personalBest' | 'netWorth' | 'wishlist' | 'subscriptions' | 'profile' | 'shop' | 'customApp' | 'shoppingList';
type ModalType = 'input' | 'funds' | 'addBudget' | 'history' | 'info' | 'menu' | 'editAsset' | 'confirm' | 'scanResult' | 'aiAdvice' | 'smartInput' | 'aiChat' | 'voiceAssistant' | 'voiceResult' | 'addSavingsGoal' | 'addSavings' | 'withdrawSavings' | 'savingsDetail' | 'settings' | 'archivedBudgets' | 'backupRestore' | 'asset' | 'batchInput' | 'addWishlist' | 'redeem' | 'debt' | 'dailyBonus';

// --- LIVING BACKGROUND COMPONENT ---
const LivingBackground: React.FC<{ percentage: number }> = ({ percentage }) => {
    let mode: 'storm' | 'rain' | 'cloudy' | 'sunny' = 'sunny';
    
    if (percentage < 0) mode = 'storm';
    else if (percentage < 30) mode = 'rain';
    else if (percentage < 80) mode = 'cloudy';
    else mode = 'sunny';

    return (
        <div className={`fixed inset-0 z-[-1] transition-all duration-1000 overflow-hidden pointer-events-none ${
            mode === 'storm' ? 'bg-slate-900' :
            mode === 'rain' ? 'bg-gray-800' :
            mode === 'cloudy' ? 'bg-gradient-to-b from-blue-300 to-gray-200' :
            'bg-gradient-to-b from-sky-400 to-blue-200'
        }`}>
            {/* SUNNY ELEMENTS */}
            {mode === 'sunny' && (
                <>
                    <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse"></div>
                    <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-100 rounded-full shadow-[0_0_40px_#fde047]"></div>
                    <div className="absolute top-20 left-[-100px] opacity-40 animate-[float_20s_linear_infinite]">
                        <div className="w-32 h-12 bg-white rounded-full blur-md"></div>
                    </div>
                    <div className="absolute top-40 left-[-150px] opacity-30 animate-[float_35s_linear_infinite_reverse]">
                        <div className="w-48 h-16 bg-white rounded-full blur-md"></div>
                    </div>
                </>
            )}

            {/* RAIN ELEMENTS */}
            {(mode === 'rain' || mode === 'storm') && (
                <div className="absolute inset-0 opacity-30">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-blue-200 w-[1px] h-10 animate-[rain_1s_linear_infinite]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                animationDelay: `${Math.random()}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* CLOUDY ELEMENTS (Used in Rain/Storm too but darker) */}
            {(mode !== 'sunny') && (
                <>
                    <div className={`absolute top-0 w-full h-64 bg-gradient-to-b ${mode === 'storm' ? 'from-black/60' : 'from-gray-600/40'} to-transparent`}></div>
                    <div className="absolute top-20 right-[-100px] opacity-60 animate-[float_60s_linear_infinite]">
                        <div className={`w-64 h-24 ${mode === 'storm' ? 'bg-slate-700' : 'bg-gray-100'} rounded-full blur-xl`}></div>
                    </div>
                </>
            )}

            {/* STORM ELEMENTS (LIGHTNING) */}
            {mode === 'storm' && (
                <>
                    {/* Background Flash */}
                    <div className="absolute inset-0 bg-white/20 animate-[lightning_4s_infinite] z-0"></div>
                    {/* Dark overlay for atmosphere */}
                    <div className="absolute top-0 left-0 w-full h-full bg-slate-900/60 z-0"></div>
                    
                    {/* Lightning Bolt 1 (SVG) */}
                    <div className="absolute top-10 left-[20%] opacity-0 animate-[bolt_5s_infinite_1s] z-10">
                         <svg width="100" height="200" viewBox="0 0 100 200" className="drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]" style={{ transform: 'rotate(-10deg)' }}>
                            <path d="M60 0 L0 90 L40 90 L20 200 L90 70 L50 70 L80 0 Z" fill="#fef08a" />
                         </svg>
                    </div>
                    {/* Lightning Bolt 2 (SVG) - Delayed */}
                    <div className="absolute top-20 right-[20%] opacity-0 animate-[bolt_7s_infinite_3s] z-10 scale-75">
                         <svg width="100" height="200" viewBox="0 0 100 200" className="drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]" style={{ transform: 'rotate(10deg)' }}>
                            <path d="M60 0 L0 90 L40 90 L20 200 L90 70 L50 70 L80 0 Z" fill="#fef08a" />
                         </svg>
                    </div>
                </>
            )}

            <style>{`
                @keyframes float {
                    0% { transform: translateX(0px); }
                    50% { transform: translateX(50px); }
                    100% { transform: translateX(0px); }
                }
                @keyframes rain {
                    0% { transform: translateY(-100px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                @keyframes lightning {
                    0%, 90%, 100% { opacity: 0; }
                    92% { opacity: 0.4; }
                    93% { opacity: 0; }
                    94% { opacity: 0.3; }
                    96% { opacity: 0; }
                }
                @keyframes bolt {
                    0%, 90%, 100% { opacity: 0; transform: scale(1); }
                    92% { opacity: 1; transform: scale(1.1); }
                    94% { opacity: 0; transform: scale(1); }
                    96% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

// --- TIME BASED BACKGROUND COMPONENT ---
const TimeBasedBackground: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const hour = time.getHours();
    let phase: 'morning' | 'noon' | 'afternoon' | 'night' = 'night';
    
    if (hour >= 5 && hour < 11) phase = 'morning';
    else if (hour >= 11 && hour < 15) phase = 'noon';
    else if (hour >= 15 && hour < 18) phase = 'afternoon';
    else phase = 'night';

    // Gradients
    const gradients = {
        morning: 'bg-gradient-to-b from-sky-200 to-white', // Sejuk
        noon: 'bg-gradient-to-b from-blue-400 to-sky-300', // Cerah Terik
        afternoon: 'bg-gradient-to-b from-orange-300 to-yellow-100', // Hangat
        night: 'bg-gradient-to-b from-indigo-950 to-slate-900', // Malam
    };

    return (
        <div className={`fixed inset-0 z-[-1] transition-all duration-1000 overflow-hidden pointer-events-none ${gradients[phase]}`}>
            
            {/* SUN / MOON Logic */}
            <div className={`absolute transition-all duration-[2000ms] ease-in-out ${
                phase === 'morning' ? 'top-10 left-[10%] w-24 h-24 bg-yellow-200 opacity-80 blur-xl' :
                phase === 'noon' ? 'top-5 left-[50%] -translate-x-1/2 w-32 h-32 bg-yellow-400 opacity-100 shadow-[0_0_60px_#facc15]' :
                phase === 'afternoon' ? 'top-20 right-[10%] w-28 h-28 bg-orange-400 opacity-90 blur-md' :
                'top-10 right-[15%] w-20 h-20 bg-gray-100 opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.5)]' // Moon
            } rounded-full`}>
                {/* Visual SVG for Sharpness */}
                {phase !== 'night' ? (
                    // Sun SVG
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spinSlow_60s_linear_infinite]">
                        <circle cx="50" cy="50" r="30" fill={phase === 'afternoon' ? '#fb923c' : '#fde047'} />
                        {/* Rays */}
                        <g stroke={phase === 'afternoon' ? '#fb923c' : '#fde047'} strokeWidth="4">
                            <line x1="50" y1="10" x2="50" y2="0" />
                            <line x1="50" y1="90" x2="50" y2="100" />
                            <line x1="10" y1="50" x2="0" y2="50" />
                            <line x1="90" y1="50" x2="100" y2="50" />
                            <line x1="22" y1="22" x2="15" y2="15" />
                            <line x1="78" y1="78" x2="85" y2="85" />
                            <line x1="22" y1="78" x2="15" y2="85" />
                            <line x1="78" y1="22" x2="85" y2="15" />
                        </g>
                    </svg>
                ) : (
                    // Moon SVG (Crescent)
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                        <path d="M50 10 A40 40 0 1 0 50 90 A30 30 0 1 1 50 10" fill="#f1f5f9" />
                    </svg>
                )}
            </div>

            {/* ATMOSPHERE & CLOUDS */}
            {phase === 'morning' && (
                <div className="absolute top-20 right-[-50px] opacity-40 animate-[float_40s_linear_infinite]">
                    <div className="w-48 h-16 bg-white rounded-full blur-xl"></div>
                </div>
            )}
            {phase === 'noon' && (
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div> // Glare
            )}
            {phase === 'afternoon' && (
                <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay"></div> // Warmth
            )}
            {phase === 'night' && (
                <>
                    {/* Stars */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute bg-white rounded-full w-[2px] h-[2px] animate-pulse"
                            style={{
                                top: `${Math.random() * 60}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                        />
                    ))}
                </>
            )}

            <style>{`
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// --- CYBERPUNK BATTERY BACKGROUND ---
const CyberpunkBatteryBackground: React.FC<{ percentage: number }> = ({ percentage }) => {
    let mode: 'high' | 'medium' | 'critical' = 'high';
    
    if (percentage < 20) mode = 'critical';
    else if (percentage < 50) mode = 'medium';
    else mode = 'high';

    const overlayColor = mode === 'critical' ? 'rgba(220, 38, 38, 0.2)' : mode === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    const gridColor = mode === 'critical' ? '#ef4444' : mode === 'medium' ? '#eab308' : '#10b981';

    return (
        <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-950 transition-colors duration-700 ${mode === 'critical' ? 'animate-shake' : ''}`}>
            {/* Grid Overlay */}
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.1,
                    transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
                }}
            ></div>

            {/* Glowing Horizon */}
            <div 
                className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"
                style={{ backgroundColor: overlayColor }}
            ></div>

            {/* Warning Text for Critical */}
            {mode === 'critical' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black text-6xl opacity-10 animate-pulse tracking-widest whitespace-nowrap">
                    LOW POWER
                </div>
            )}

            {/* Glitch Overlay */}
            {mode === 'critical' && (
                <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-glitch"></div>
            )}

            <style>{`
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </div>
    );
};

// --- THERMAL HEAT BACKGROUND ---
const ThermalHeatBackground: React.FC<{ spendingStatus: 'frozen' | 'warm' | 'hot' }> = ({ spendingStatus }) => {
    
    // Background Gradients
    const bgClass = spendingStatus === 'frozen' 
        ? 'bg-gradient-to-b from-slate-900 via-cyan-900 to-blue-900' // Dark frozen look
        : spendingStatus === 'warm' 
            ? 'bg-gradient-to-b from-orange-100 to-yellow-50' 
            : 'bg-gradient-to-b from-red-900 to-orange-900';

    return (
        <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 ${bgClass}`}>
            
            {/* FROZEN PARTICLES (Snow/Ice) */}
            {spendingStatus === 'frozen' && (
                <>
                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                    {/* Generative Snow */}
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-white rounded-full opacity-80"
                            style={{
                                width: Math.random() * 3 + 2 + 'px',
                                height: Math.random() * 3 + 2 + 'px',
                                left: Math.random() * 100 + '%',
                                top: -10 + '%',
                                animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                                filter: 'blur(1px)'
                            }}
                        />
                    ))}
                    {/* Frost Vignette */}
                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(30,64,175,0.5)] pointer-events-none"></div>
                    {/* Cold Fog */}
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-white/10 to-transparent"></div>
                </>
            )}

            {/* WARM PARTICLES (Steam) */}
            {spendingStatus === 'warm' && (
                <>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-white rounded-full opacity-20 blur-xl animate-[rise_4s_ease-in-out_infinite]"
                            style={{
                                width: Math.random() * 40 + 20 + 'px',
                                height: Math.random() * 40 + 20 + 'px',
                                left: Math.random() * 100 + '%',
                                bottom: -20 + '%',
                                animationDuration: Math.random() * 3 + 4 + 's',
                                animationDelay: Math.random() * 2 + 's'
                            }}
                        />
                    ))}
                </>
            )}

            {/* HOT PARTICLES (Embers & Heat) */}
            {spendingStatus === 'hot' && (
                <>
                    <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse"></div>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-yellow-500 rounded-full shadow-[0_0_10px_#fbbf24] animate-[riseFast_2s_linear_infinite]"
                            style={{
                                width: Math.random() * 3 + 1 + 'px',
                                height: Math.random() * 3 + 1 + 'px',
                                left: Math.random() * 100 + '%',
                                bottom: -10 + '%',
                                opacity: Math.random(),
                                animationDuration: Math.random() * 1 + 1 + 's',
                                animationDelay: Math.random() + 's'
                            }}
                        />
                    ))}
                    {/* Heat Haze Simulation (Blur) */}
                    <div className="absolute inset-0 backdrop-blur-[1px]"></div>
                </>
            )}

            <style>{`
                @keyframes fall {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    50% { transform: translateY(50vh) translateX(20px); }
                    100% { transform: translateY(110vh) translateX(-20px); opacity: 0; }
                }
                @keyframes rise {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    20% { opacity: 0.3; }
                    100% { transform: translateY(-80vh) scale(1.5); opacity: 0; }
                }
                @keyframes riseFast {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-100vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const App: React.FC = () => {
    // State management
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
    const [fundsModalTab, setFundsModalTab] = useState<'add' | 'remove'>('add');
    const [internalBackups, setInternalBackups] = useState<{ key: string, timestamp: number }[]>([]);
    const [dailyBackup, setDailyBackup] = useState<{ url: string; filename: string } | null>(null);
    const [notifications, setNotifications] = useState<string[]>([]);
    const backupCreatedToday = useRef(false);
    const [lastImportDate, setLastImportDate] = useState<string | null>(() => localStorage.getItem('lastImportDate'));
    const [lastExportDate, setLastExportDate] = useState<string | null>(() => localStorage.getItem('lastExportDate'));
    const lastClickPos = useRef<{x: number, y: number} | null>(null);
    const [inputModalMode, setInputModalMode] = useState<'use-daily' | 'use-post' | 'edit-post'>('use-daily');
    const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);
    const [currentSavingsGoalId, setCurrentSavingsGoalId] = useState<number | null>(null);
    const [currentAssetId, setCurrentAssetId] = useState<number | null>(null);
    const [historyModalContent, setHistoryModalContent] = useState({ title: '', transactions: [] as any[], type: '', budgetId: undefined as (number | undefined) });
    const [confirmModalContent, setConfirmModalContent] = useState({ message: '' as React.ReactNode, onConfirm: () => {} });
    const [prefillData, setPrefillData] = useState<{ desc: string, amount: string } | null>(null);
    const [subscriptionToPayId, setSubscriptionToPayId] = useState<number | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [smartInputResult, setSmartInputResult] = useState<ScannedItem[]>([]);
    const [isProcessingSmartInput, setIsProcessingSmartInput] = useState(false);
    const [smartInputError, setSmartInputError] = useState<string | null>(null);
    const [aiAdvice, setAiAdvice] = useState<string>('');
    const [isFetchingAdvice, setIsFetchingAdvice] = useState<boolean>(false);
    const [adviceError, setAdviceError] = useState<string | null>(null);
    const [aiDashboardInsight, setAiDashboardInsight] = useState<string>('');
    const [isFetchingDashboardInsight, setIsFetchingDashboardInsight] = useState<boolean>(false);
    const [aiChatSession, setAiChatSession] = useState<Chat | null>(null);
    const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isAiChatLoading, setIsAiChatLoading] = useState<boolean>(false);
    const [aiChatError, setAiChatError] = useState<string | null>(null);
    const [aiSearchResults, setAiSearchResults] = useState<GlobalTransaction[] | null>(null);
    const [isSearchingWithAI, setIsSearchingWithAI] = useState<boolean>(false);
    const [aiSearchError, setAiSearchError] = useState<string | null>(null);
    const [voiceAssistantResult, setVoiceAssistantResult] = useState<ScannedItem[]>([]);
    const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
    const importFileInputRef = useRef<HTMLInputElement>(null);
    const scanFileInputRef = useRef<HTMLInputElement>(null);
    const [deviceBatteryLevel, setDeviceBatteryLevel] = useState(100);
    const [isBackdateMode, setIsBackdateMode] = useState(false); 
    
    // --- BATTERY LISTENER ---
    useEffect(() => {
        if ('getBattery' in navigator) {
             // @ts-ignore
             navigator.getBattery().then((battery) => {
                 setDeviceBatteryLevel(battery.level * 100);
                 // @ts-ignore
                 battery.addEventListener('levelchange', () => {
                     setDeviceBatteryLevel(battery.level * 100);
                 });
             });
        }
    }, []);

    // --- FINANCIAL HEALTH CALCULATION FOR THEME ---
    const { monthlyIncome, totalRemaining, totalDailySpent } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const isCurrentMonth = (ts: number) => {
            const d = new Date(ts);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };

        const monthlyIncome = state.fundHistory
            .filter(t => t.type === 'add' && isCurrentMonth(t.timestamp))
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDailySpent = state.dailyExpenses
            .filter(t => isCurrentMonth(t.timestamp))
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlyGeneralExpense = state.fundHistory
            .filter(t => t.type === 'remove' && isCurrentMonth(t.timestamp))
            .reduce((sum, t) => sum + t.amount, 0);

        const totalUsedFromPosts = state.budgets.reduce((sum, b) => 
            sum + b.history
                .filter(h => isCurrentMonth(h.timestamp))
                .reduce((s, h) => s + h.amount, 0), 0);

        const totalUsedOverall = totalDailySpent + monthlyGeneralExpense + totalUsedFromPosts;
        const totalRemaining = monthlyIncome - totalUsedOverall;

        return { monthlyIncome, totalRemaining, totalDailySpent };
    }, [state.fundHistory, state.budgets, state.dailyExpenses]);

    const financialHealthPercentage = monthlyIncome > 0 ? (totalRemaining / monthlyIncome) * 100 : 100;
    
    // Calculate remaining daily budget proxy for Thermal Theme
    const dailyBudgetLimitEstimate = monthlyIncome > 0 ? (monthlyIncome * 0.5) / 30 : 50000; 
    
    let thermalStatus: 'frozen' | 'warm' | 'hot' = 'frozen';
    if (totalDailySpent === 0) thermalStatus = 'frozen';
    else if (totalDailySpent <= dailyBudgetLimitEstimate) thermalStatus = 'warm';
    else thermalStatus = 'hot';

    // Theme Effect
    useEffect(() => {
        const themeId = state.activeTheme || 'theme_default';
        const root = document.documentElement;
        
        // --- LIVING MOOD LOGIC ---
        if (themeId === 'theme_living_mood') {
            root.style.setProperty('--app-background', 'transparent');
            if (financialHealthPercentage < 0 || financialHealthPercentage < 30) { 
                root.style.setProperty('--color-primary-navy', '255 255 255');
                root.style.setProperty('--color-dark-text', '240 240 240');
                root.style.setProperty('--color-secondary-gray', '200 200 200');
                root.style.setProperty('--color-light-bg', '30 41 59'); 
                root.style.setProperty('--color-white', '15 23 42'); 
                root.style.setProperty('--color-gray-50', '30 41 59'); 
                root.style.setProperty('--color-gray-100', '51 65 85');
                root.style.setProperty('--color-gray-200', '71 85 105');
            } else {
                root.style.setProperty('--color-primary-navy', '44 62 80');
                root.style.setProperty('--color-dark-text', '52 73 94');
                root.style.setProperty('--color-secondary-gray', '100 116 139');
                root.style.setProperty('--color-light-bg', '255 255 255');
                root.style.setProperty('--color-white', '255 255 255');
                root.style.setProperty('--color-gray-50', '255 255 255');
                root.style.setProperty('--color-gray-100', '241 245 249');
                root.style.setProperty('--color-gray-200', '226 232 240');
            }
            return;
        }

        // --- TIME DYNAMIC LOGIC ---
        if (themeId === 'theme_dynamic_time') {
            root.style.setProperty('--app-background', 'transparent');
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 5) { // Night
                root.style.setProperty('--color-primary-navy', '224 231 255');
                root.style.setProperty('--color-dark-text', '241 245 249');
                root.style.setProperty('--color-secondary-gray', '148 163 184');
                root.style.setProperty('--color-light-bg', '15 23 42');
                root.style.setProperty('--color-white', '2 6 23');
                root.style.setProperty('--color-gray-50', '30 41 59'); 
                root.style.setProperty('--color-gray-100', '51 65 85');
                root.style.setProperty('--color-gray-200', '71 85 105');
            } else { // Day
                root.style.setProperty('--color-primary-navy', '30 58 138');
                root.style.setProperty('--color-dark-text', '15 23 42');
                root.style.setProperty('--color-secondary-gray', '71 85 105');
                root.style.setProperty('--color-light-bg', '255 255 255');
                root.style.setProperty('--color-white', '255 255 255');
                root.style.setProperty('--color-gray-50', '248 250 252');
                root.style.setProperty('--color-gray-100', '241 245 249');
                root.style.setProperty('--color-gray-200', '226 232 240');
            }
            return;
        }

        // --- CYBERPUNK BATTERY LOGIC ---
        if (themeId === 'theme_cyberpunk_battery') {
            root.style.setProperty('--app-background', 'transparent');
            // Always Dark Mode for Cyberpunk
            root.style.setProperty('--color-primary-navy', '56 189 248'); // Sky-400 (Neon Cyan)
            root.style.setProperty('--color-primary-navy-dark', '14 165 233');
            root.style.setProperty('--color-accent-teal', '34 211 238'); // Cyan-400
            root.style.setProperty('--color-accent-teal-dark', '6 182 212');
            root.style.setProperty('--color-light-bg', '15 23 42'); // Slate-900
            root.style.setProperty('--color-dark-text', '241 245 249'); // Slate-100
            root.style.setProperty('--color-secondary-gray', '148 163 184');
            root.style.setProperty('--color-white', '2 6 23'); // Slate-950
            root.style.setProperty('--color-gray-50', '30 41 59'); 
            root.style.setProperty('--color-gray-100', '51 65 85');
            root.style.setProperty('--color-gray-200', '71 85 105');
            return;
        }

        // --- THERMAL HEAT LOGIC ---
        if (themeId === 'theme_thermal_heat') {
            root.style.setProperty('--app-background', 'transparent');
            if (thermalStatus === 'hot') {
                root.style.setProperty('--color-primary-navy', '252 165 165'); // Red-300
                root.style.setProperty('--color-dark-text', '254 242 242'); // Red-50
                root.style.setProperty('--color-secondary-gray', '252 165 165');
                root.style.setProperty('--color-light-bg', '69 10 10'); // Red-950
                root.style.setProperty('--color-white', '127 29 29'); // Red-900
                root.style.setProperty('--color-gray-50', '69 10 10'); 
                root.style.setProperty('--color-gray-100', '127 29 29');
                root.style.setProperty('--color-gray-200', '153 27 27');
            } else if (thermalStatus === 'frozen') {
                root.style.setProperty('--color-primary-navy', '186 230 253'); // Sky-200
                root.style.setProperty('--color-dark-text', '240 249 255'); // Sky-50
                root.style.setProperty('--color-secondary-gray', '148 163 184'); // Slate-400
                root.style.setProperty('--color-light-bg', '23 37 84'); // Blue-950
                root.style.setProperty('--color-white', '30 58 138'); // Blue-900
                root.style.setProperty('--color-gray-50', '23 37 84'); 
                root.style.setProperty('--color-gray-100', '30 58 138');
                root.style.setProperty('--color-gray-200', '59 130 246');
            } else {
                root.style.setProperty('--color-primary-navy', '44 62 80');
                root.style.setProperty('--color-dark-text', '52 73 94');
                root.style.setProperty('--color-secondary-gray', '100 116 139');
                root.style.setProperty('--color-light-bg', '255 255 255');
                root.style.setProperty('--color-white', '255 255 255');
                root.style.setProperty('--color-gray-50', '255 255 255');
                root.style.setProperty('--color-gray-100', '241 245 249');
                root.style.setProperty('--color-gray-200', '226 232 240');
            }
            return;
        }

        let themeConfig = THEMES[themeId];
        if (!themeConfig && state.customThemes) {
            const custom = state.customThemes.find(t => t.id === themeId);
            if (custom) themeConfig = custom.colors;
        }
        themeConfig = themeConfig || THEMES['theme_default'];
        Object.entries(themeConfig).forEach(([key, value]) => root.style.setProperty(key, value));
    }, [state.activeTheme, state.customThemes, financialHealthPercentage, thermalStatus]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => { lastClickPos.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousedown', handleClick, true);
        return () => window.removeEventListener('mousedown', handleClick, true);
    }, []);

    const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
        setState(prevState => {
            const newState = updater(prevState);
            const newAchievementData = { ...newState.achievementData };
            
            // Recalculate stats for achievement tracking
            const newMonthlyIncome = newState.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
            const newTotalUsedFromPosts = newState.budgets.reduce((sum, b) => sum + b.history.reduce((s, h) => s + h.amount, 0), 0);
            const newTotalDailySpent = newState.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
            const newMonthlyGeneralExpense = newState.fundHistory.filter(t => t.type === 'remove').reduce((sum, t) => sum + t.amount, 0);
            const newTotalUsedOverall = newMonthlyGeneralExpense + newTotalUsedFromPosts + newTotalDailySpent;
            const newTotalRemaining = newMonthlyIncome - newTotalUsedOverall;
            
            const newTotalAllocated = newState.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
            const newUnallocatedFunds = newMonthlyIncome - newTotalAllocated;
            const newCurrentAvailableFundsTheoretical = newUnallocatedFunds - newMonthlyGeneralExpense - newTotalDailySpent;
            const newCurrentAvailableFunds = Math.min(newCurrentAvailableFundsTheoretical, newTotalRemaining);
            const remainingDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
            const dailyBudgetMax = remainingDays > 0 ? newCurrentAvailableFunds / remainingDays : newCurrentAvailableFunds;
            const dailyBudgetRemaining = dailyBudgetMax;
            
            if (newTotalRemaining < 0) newAchievementData.monthlyStreak = 0;
            if (dailyBudgetRemaining < 0) newAchievementData.dailyStreak = 0;
            newState.achievementData = newAchievementData;
            
            const newlyUnlocked: Achievement[] = [];
            const updatedUnlocked = { ...newState.unlockedAchievements };
            for (const achievement of allAchievements) {
                if (!updatedUnlocked[achievement.id]) {
                    if (achievement.condition(newState)) {
                        updatedUnlocked[achievement.id] = Date.now();
                        newlyUnlocked.push(achievement);
                    }
                }
            }
            if (newlyUnlocked.length > 0) {
                setNewlyUnlockedAchievement(newlyUnlocked[0]);
                setTimeout(() => setNewlyUnlockedAchievement(null), 4000);
                return { ...newState, unlockedAchievements: updatedUnlocked };
            }
            return newState;
        });
    }, []);

    const handleDeleteCustomTheme = (themeId: string) => {
        openConfirm("Hapus tema kustom ini? Data tidak bisa dikembalikan.", () => {
            updateState(prev => {
                const newThemes = prev.customThemes?.filter(t => t.id !== themeId) || [];
                const newActive = prev.activeTheme === themeId ? 'theme_default' : prev.activeTheme;
                return { ...prev, customThemes: newThemes, activeTheme: newActive };
            });
            setActiveModal(null);
        });
    };

    const listInternalBackups = useCallback(() => {
        const backupList: { key: string; timestamp: number }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(BACKUP_PREFIX)) {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (!isNaN(timestamp)) backupList.push({ key, timestamp });
            }
        }
        return backupList.sort((a, b) => b.timestamp - a.timestamp);
    }, []);

    useEffect(() => {
        let loadedState = { ...INITIAL_STATE };
        const savedState = localStorage.getItem(`budgetAppState_v${APP_VERSION}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                 if (Array.isArray(parsed.unlockedAchievements)) {
                    const migrated: { [id: string]: number } = {};
                    parsed.unlockedAchievements.forEach((id: string) => { migrated[id] = Date.now(); });
                    parsed.unlockedAchievements = migrated;
                }
                parsed.achievementData = { ...INITIAL_STATE.achievementData, ...parsed.achievementData };
                parsed.wishlist = parsed.wishlist || [];
                parsed.subscriptions = parsed.subscriptions || [];
                parsed.shoppingList = parsed.shoppingList || []; 
                parsed.debts = parsed.debts || []; 
                parsed.userProfile = parsed.userProfile || { name: 'Pengguna' };
                parsed.spentPoints = parsed.spentPoints || 0;
                parsed.inventory = parsed.inventory || [];
                parsed.activeTheme = parsed.activeTheme || 'theme_default';
                const currentBonus = parsed.bonusPoints || 0;
                const defaultBonus = INITIAL_STATE.bonusPoints || 0;
                parsed.bonusPoints = currentBonus > 0 ? currentBonus : defaultBonus;
                parsed.customThemes = parsed.customThemes || [];
                parsed.redeemedCodes = parsed.redeemedCodes || [];
                parsed.redeemedMustika = parsed.redeemedMustika || 0;
                parsed.collectedSkins = parsed.collectedSkins || [];
                parsed.lastDailyBonusClaim = parsed.lastDailyBonusClaim || null;
                parsed.accumulatedXP = parsed.accumulatedXP || 0;
                parsed.levelRewardsClaimed = parsed.levelRewardsClaimed || []; // Init level rewards array
                
                loadedState = { ...INITIAL_STATE, ...parsed };
            } catch (error) { console.error("Failed to parse state", error); }
        }
        setState(loadedState);
        const backups = listInternalBackups();
        const lastBackupTimestamp = backups.length > 0 ? backups[0].timestamp : 0;
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - lastBackupTimestamp > oneWeekInMs) {
            const newBackupKey = `${BACKUP_PREFIX}${Date.now()}`;
            try { localStorage.setItem(newBackupKey, JSON.stringify(loadedState)); } catch (e) { console.error("Auto backup failed:", e); }
            const updatedBackups = listInternalBackups();
            if (updatedBackups.length > MAX_BACKUPS) { const oldestBackup = updatedBackups[updatedBackups.length - 1]; localStorage.removeItem(oldestBackup.key); }
        }
        setInternalBackups(listInternalBackups());
        if (loadedState.subscriptions && loadedState.subscriptions.length > 0) {
            const alerts: string[] = [];
            const today = new Date(); today.setHours(0,0,0,0);
            const threeDaysFromNow = new Date(today); threeDaysFromNow.setDate(today.getDate() + 3);
            loadedState.subscriptions.forEach((sub: Subscription) => {
                if (!sub.isActive) return;
                let nextDate = new Date(sub.firstBillDate);
                const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), new Date(sub.firstBillDate).getDate());
                if (sub.cycle === 'monthly') {
                    if (currentMonthDate >= today) nextDate = currentMonthDate;
                    else nextDate = new Date(today.getFullYear(), today.getMonth() + 1, new Date(sub.firstBillDate).getDate());
                } else {
                    const currentYearDate = new Date(today.getFullYear(), new Date(sub.firstBillDate).getMonth(), new Date(sub.firstBillDate).getDate());
                    if (currentYearDate >= today) nextDate = currentYearDate;
                    else nextDate = new Date(today.getFullYear() + 1, new Date(sub.firstBillDate).getMonth(), new Date(sub.firstBillDate).getDate());
                }
                if (nextDate >= today && nextDate <= threeDaysFromNow) {
                    const daysLeft = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const dayText = daysLeft === 0 ? 'HARI INI' : daysLeft === 1 ? 'besok' : `${daysLeft} hari lagi`;
                    alerts.push(`Tagihan ${sub.name} jatuh tempo ${dayText}!`);
                }
            });
            setNotifications(alerts);
        }
    }, [listInternalBackups]);

    useEffect(() => { try { localStorage.setItem(`budgetAppState_v${APP_VERSION}`, JSON.stringify(state)); } catch (e) { console.error("Failed to save state", e); } }, [state]);

    // --- LEVEL UP REWARD SYSTEM ---
    const calculateUserLevel = (totalPoints: number) => { 
        const levelNumber = Math.floor(Math.sqrt(totalPoints / 50)) + 1; 
        return { levelNumber }; 
    };

    const unlockedAchIds = Object.keys(state.unlockedAchievements); 
    const achievementPoints = allAchievements.filter(ach => unlockedAchIds.includes(ach.id)).reduce((sum, ach) => sum + (ach.points || 0), 0); 
    
    // Helper to calc quest points
    const calculateQuestPoints = (st: AppState) => {
        const todayStr = new Date().toLocaleDateString('fr-CA'); const now = Date.now(); const oneDay = 24 * 60 * 60 * 1000; const isToday = (ts: number) => new Date(ts).toLocaleDateString('fr-CA') === todayStr; const isThisWeek = (ts: number) => (now - ts) < (7 * oneDay);
        const dailyQuests = [ { completed: true, points: 5 }, { completed: st.dailyExpenses.some(t => isToday(t.timestamp)) || st.fundHistory.some(t => isToday(t.timestamp)) || st.budgets.some(b => b.history.some(h => isToday(h.timestamp))), points: 10 }, { completed: st.dailyExpenses.filter(t => isToday(t.timestamp)).reduce((sum, t) => sum + t.amount, 0) < 50000, points: 15 }, { completed: st.savingsGoals.some(g => g.history.some(h => isToday(h.timestamp))), points: 20 }, { completed: st.wishlist.length > 0, points: 10 } ];
        const dailyCount = dailyQuests.filter(q => q.completed).length; const dailyPoints = dailyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0) + (dailyCount >= 3 ? 50 : 0);
        const uniqueTransactionDays = new Set(); st.dailyExpenses.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }); st.fundHistory.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }); st.budgets.forEach(b => b.history.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }));
        const savingsCount = st.savingsGoals.reduce((count, g) => count + g.history.filter(h => isThisWeek(h.timestamp)).length, 0); const activeBudgetsCount = st.budgets.filter(b => b.history.some(h => isThisWeek(h.timestamp))).length; const addedWishlist = st.wishlist.some(w => isThisWeek(w.createdAt)); const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); const monthlyIncomeQ = st.fundHistory.filter(t => t.type === 'add' && t.timestamp >= startOfMonth.getTime()).reduce((sum, t) => sum + t.amount, 0); const weeklyExpense = st.dailyExpenses.filter(t => isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) + st.fundHistory.filter(t => t.type === 'remove' && isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) + st.budgets.reduce((s, b) => s + b.history.filter(h => isThisWeek(h.timestamp)).reduce((bs, h) => bs + h.amount, 0), 0);
        const weeklyQuests = [ { completed: uniqueTransactionDays.size >= 4, points: 30 }, { completed: savingsCount >= 3, points: 40 }, { completed: addedWishlist, points: 20 }, { completed: activeBudgetsCount >= 4, points: 25 }, { completed: monthlyIncomeQ > 0 && weeklyExpense < (monthlyIncomeQ * 0.25), points: 50 } ];
        const weeklyCount = weeklyQuests.filter(q => q.completed).length; const weeklyPoints = weeklyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0) + (weeklyCount >= 5 ? 150 : 0);
        return dailyPoints + weeklyPoints;
    };

    const questPoints = calculateQuestPoints(state); 
    const grandTotalPoints = achievementPoints + questPoints + (state.bonusPoints || 0) + (state.accumulatedXP || 0); // For Level
    const availableShopPoints = grandTotalPoints + (state.redeemedMustika || 0) - (state.spentPoints || 0); // For Shopping

    // AUTO CLAIM LEVEL UP REWARDS
    useEffect(() => {
        const { levelNumber } = calculateUserLevel(grandTotalPoints);
        const claimed = state.levelRewardsClaimed || [];
        const maxClaimed = claimed.length > 0 ? Math.max(...claimed) : 1;
        
        if (levelNumber > maxClaimed) {
            const newClaimed = [...claimed];
            let rewardTotal = 0;
            // Iterate from next level up to current level
            for (let l = maxClaimed + 1; l <= levelNumber; l++) {
                newClaimed.push(l);
                rewardTotal += 200; // 200 Mustika per level up
            }
            
            if (rewardTotal > 0) {
                // Update State
                setState(prev => ({
                    ...prev,
                    redeemedMustika: (prev.redeemedMustika || 0) + rewardTotal,
                    levelRewardsClaimed: newClaimed
                }));
                // Show notification
                setNotifications(prev => [...prev, `Naik ke Level ${levelNumber}! Hadiah +${rewardTotal} Mustika!`]);
            }
        }
    }, [grandTotalPoints, state.levelRewardsClaimed]);

    // ... [REST OF USE EFFECTS: Backup, etc.] ...
    useEffect(() => {
        if (backupCreatedToday.current) return;
        const hasData = state.budgets.length > 0 || state.dailyExpenses.length > 0 || state.fundHistory.length > 0;
        if (!hasData) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const lastExportDateStr = localStorage.getItem('lastAutoExportDate');
        let shouldCreateBackup = true;
        if (lastExportDateStr) {
            const lastExportDate = new Date(lastExportDateStr); lastExportDate.setHours(0, 0, 0, 0);
            const timeDiff = today.getTime() - lastExportDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            if (daysDiff < 7) shouldCreateBackup = false; // Changed from 4 to 7 days
        }
        if (shouldCreateBackup) {
            try {
                const todayStrForFilename = new Date().toLocaleDateString('fr-CA');
                // Use new secure format for auto backup
                const encrypted = encryptData(state);
                const fileContent = JSON.stringify({
                    app: "Anggaran",
                    version: APP_VERSION,
                    secure: true,
                    payload: encrypted
                }, null, 2);
                
                const dataBlob = new Blob([fileContent], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const filename = `cadangan_anggaran_${todayStrForFilename}.json`;
                setDailyBackup({ url, filename });
                localStorage.setItem('lastAutoExportDate', new Date().toLocaleDateString('fr-CA'));
                backupCreatedToday.current = true;
            } catch (error) { console.error("Failed to create periodic backup:", error); }
        } else { backupCreatedToday.current = true; }
    }, [state]);

    const allTransactions = useMemo((): GlobalTransaction[] => {
        let transactions: GlobalTransaction[] = [];
        state.archives.forEach(archive => transactions.push(...archive.transactions));
        transactions.push(...state.fundHistory);
        transactions.push(...state.dailyExpenses.map(t => ({...t, type: 'remove', category: t.sourceCategory || 'Harian'})));
        state.budgets.forEach(b => { transactions.push(...b.history.map(h => ({...h, type: 'remove' as const, category: b.name}))); });
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }, [state]);

    const currentAsset = useMemo(() => allTransactions.reduce((sum, t) => t.type === 'add' ? sum + t.amount : sum - t.amount, 0), [allTransactions]);

    const { totalUsedOverall, totalAllocated, unallocatedFunds, generalAndDailyExpenses, remainingUnallocated, currentAvailableFunds } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const isCurrentMonth = (ts: number) => {
            const d = new Date(ts);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };

        const monthlyIncome = state.fundHistory
            .filter(t => t.type === 'add' && isCurrentMonth(t.timestamp))
            .reduce((sum, t) => sum + t.amount, 0);

        const totalAllocated = state.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
        
        const totalUsedFromPosts = state.budgets.reduce((sum, b) => 
            sum + b.history.filter(h => isCurrentMonth(h.timestamp)).reduce((s, h) => s + h.amount, 0), 0);
        
        const totalDailySpent = state.dailyExpenses
            .filter(t => isCurrentMonth(t.timestamp))
            .reduce((sum, e) => sum + e.amount, 0);
        
        const monthlyGeneralExpense = state.fundHistory
            .filter(t => t.type === 'remove' && isCurrentMonth(t.timestamp))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalUsedOverall = monthlyGeneralExpense + totalUsedFromPosts + totalDailySpent;
        const unallocatedFunds = monthlyIncome - totalAllocated;
        const generalAndDailyExpenses = monthlyGeneralExpense + totalDailySpent;
        
        const totalRemaining = monthlyIncome - totalUsedOverall;

        const currentAvailableFundsTheoretical = unallocatedFunds - generalAndDailyExpenses;
        const currentAvailableFunds = Math.min(currentAvailableFundsTheoretical, totalRemaining);
        const remainingUnallocated = currentAvailableFunds; 
        
        return { totalUsedOverall, totalAllocated, unallocatedFunds, generalAndDailyExpenses, remainingUnallocated, currentAvailableFunds };
    }, [state.fundHistory, state.budgets, state.dailyExpenses]);
    
    // --- DEBT HANDLERS ---
    const handleAddDebt = (item: Omit<DebtItem, 'id' | 'paid' | 'history' | 'isPaidOff' | 'createdAt'>, syncWallet: boolean) => {
        const newDebt: DebtItem = {
            id: Date.now(),
            ...item,
            paid: 0,
            history: [],
            isPaidOff: false,
            createdAt: Date.now()
        };

        updateState(prev => {
            const newState = { ...prev, debts: [newDebt, ...(prev.debts || [])] };
            if (syncWallet) {
                const type = item.type === 'borrowed' ? 'add' : 'remove';
                const desc = item.type === 'borrowed' 
                    ? `Pinjaman dari ${item.person}` 
                    : `Pinjaman ke ${item.person}`;
                
                newState.fundHistory = [
                    ...prev.fundHistory,
                    { type, desc, amount: item.amount, timestamp: Date.now() }
                ];
            }
            return newState;
        });
    };

    const handleIncreaseDebt = (debtId: number, amount: number, note: string, syncWallet: boolean) => {
        updateState(prev => {
            let debtType: 'borrowed' | 'lent' = 'borrowed';
            let personName = '';

            const debts = prev.debts.map(d => {
                if (d.id === debtId) {
                    debtType = d.type;
                    personName = d.person;
                    return { ...d, amount: d.amount + amount };
                }
                return d;
            });

            let newState = { ...prev, debts };

            if (syncWallet) {
                const type = debtType === 'borrowed' ? 'add' : 'remove';
                const desc = debtType === 'borrowed' 
                    ? `Tambah Hutang: ${personName}` 
                    : `Tambah Piutang: ${personName}`;
                
                newState.fundHistory = [
                    ...prev.fundHistory,
                    { type, desc, amount, timestamp: Date.now() }
                ];
            }
            return newState;
        });
    };

    const handleDebtTransaction = (debtId: number, amount: number, note: string, syncWallet: boolean) => {
        updateState(prev => {
            const debts = prev.debts.map(d => {
                if (d.id === debtId) {
                    const newPaid = d.paid + amount;
                    const isPaidOff = newPaid >= d.amount;
                    const history = [...d.history, { amount, timestamp: Date.now(), note }];
                    return { ...d, paid: newPaid, isPaidOff, history };
                }
                return d;
            });

            let newState = { ...prev, debts };

            if (syncWallet) {
                const debt = prev.debts.find(d => d.id === debtId);
                if (debt) {
                    const type = debt.type === 'borrowed' ? 'remove' : 'add';
                    const desc = debt.type === 'borrowed'
                        ? `Bayar Hutang: ${debt.person}`
                        : `Pelunasan: ${debt.person}`;
                    
                    newState.fundHistory = [
                        ...prev.fundHistory,
                        { type, desc, amount, timestamp: Date.now() }
                    ];
                }
            }
            return newState;
        });
    };

    const handleDeleteDebt = (id: number) => {
        updateState(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
    };

    // --- OTHER HANDLERS ---
    const handleAddBudget = (name: string, amount: number, icon: string, color: string) => {
        updateState(prev => {
            const newBudget: Budget = { id: Date.now(), name, totalBudget: amount, history: [], icon, color, order: prev.budgets.filter(b => !b.isArchived && !b.isTemporary).length, isArchived: false, isTemporary: false };
            return { ...prev, budgets: [...prev.budgets, newBudget] };
        });
        setActiveModal(null);
    };
    const handleEditBudget = (name: string, amount: number, icon: string, color: string) => {
        if (!currentBudgetId) return;
        updateState(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === currentBudgetId ? { ...b, name, totalBudget: amount, icon, color } : b) }));
        setActiveModal(null);
    };
    const handleArchiveBudget = () => {
        if (!currentBudgetId) return;
        openConfirm("Anda yakin ingin mengarsipkan pos ini?", () => {
            updateState(prev => {
                const budgetsToReorder = prev.budgets.filter(b => !b.isArchived && b.id !== currentBudgetId).sort((a, b) => a.order - b.order);
                const newBudgets = prev.budgets.map(b => { if (b.id === currentBudgetId) return { ...b, isArchived: true }; const newOrder = budgetsToReorder.findIndex(bo => bo.id === b.id); if (newOrder !== -1) return { ...b, order: newOrder }; return b; });
                return { ...prev, budgets: newBudgets };
            });
            setActiveModal(null);
        });
    };
    const handleRestoreBudget = (budgetId: number) => {
        updateState(prev => {
            const numActiveBudgets = prev.budgets.filter(b => !b.isArchived).length;
            const newBudgets = prev.budgets.map(b => b.id === budgetId ? { ...b, isArchived: false, order: numActiveBudgets } : b);
            return { ...prev, budgets: newBudgets };
        });
    };
    const handleDeleteBudgetPermanently = (budgetId: number) => { openConfirm(<><strong>Hapus Permanen?</strong><br />Tindakan ini tidak dapat diurungkan.</>, () => { updateState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== budgetId) })); }); };
    const handleReorderBudgets = (reorderedActiveBudgets: Budget[]) => {
        updateState(prev => {
            const activeBudgetMap = new Map(reorderedActiveBudgets.map((b, index) => [b.id, index]));
            const newBudgets = prev.budgets.map(b => { if (activeBudgetMap.has(b.id)) return { ...b, order: activeBudgetMap.get(b.id)! }; return b; });
            return { ...prev, budgets: newBudgets };
        });
    };
    const handleSetBudgetPermanence = (budgetId: number, isTemporary: boolean) => {
        updateState(prev => {
            const updatedBudgets = prev.budgets.map(b => b.id === budgetId ? { ...b, isTemporary } : b);
            const fixedBudgets = updatedBudgets.filter(b => !b.isArchived && !b.isTemporary).sort((a,b) => a.order - b.order);
            const temporaryBudgets = updatedBudgets.filter(b => !b.isArchived && b.isTemporary).sort((a,b) => a.order - b.order);
            const reorderedBudgets = updatedBudgets.map(b => {
                let newOrder = b.order;
                if (!b.isArchived) { if (b.isTemporary) newOrder = temporaryBudgets.findIndex(tb => tb.id === b.id); else newOrder = fixedBudgets.findIndex(fb => fb.id === b.id); }
                return { ...b, order: newOrder };
            });
            return { ...prev, budgets: reorderedBudgets };
        });
    };
    const handleAddTransaction = (desc: string, amount: number, targetId: 'daily' | number, customDate?: string) => {
        const timestamp = customDate ? new Date(customDate).getTime() : Date.now();
        const txDate = new Date(timestamp);
        const newTransaction: Transaction = { desc, amount, timestamp };
        
        if (targetId === 'daily' || targetId === 0) { // Handle 0 as daily too
             updateState(prev => ({ ...prev, dailyExpenses: [...prev.dailyExpenses, newTransaction] })); 
             setActiveModal(null); 
        } else { 
            const budget = state.budgets.find(b => b.id === targetId);
            if (!budget) return;
            
            // FIX: Filter usage by current month/year of the transaction date
            const usedAmount = budget.history
                .filter(item => {
                    const itemDate = new Date(item.timestamp);
                    return itemDate.getMonth() === txDate.getMonth() && itemDate.getFullYear() === txDate.getFullYear();
                })
                .reduce((sum, item) => sum + item.amount, 0);

            const remainingQuota = Math.max(0, budget.totalBudget - usedAmount);
            if (amount > remainingQuota) {
                const overageAmount = amount - remainingQuota;
                const confirmOverage = () => {
                    updateState(prev => {
                        const newBudgets = prev.budgets.map(b => { if (b.id === targetId && remainingQuota > 0) return { ...b, history: [...b.history, { desc, amount: remainingQuota, timestamp }] }; return b; });
                        const newDailyExpenses = [...prev.dailyExpenses, { desc: `[Overage] ${desc}`, amount: overageAmount, timestamp, sourceCategory: budget.name }];
                        return { ...prev, budgets: newBudgets, dailyExpenses: newDailyExpenses };
                    });
                    setActiveModal(null);
                }
                setConfirmModalContent({ message: <>Pengeluaran melebihi kuota bulan ini. Sebesar <strong>{formatCurrency(overageAmount)}</strong> akan diambil dari Dana Tersedia. Lanjutkan?</>, onConfirm: confirmOverage });
                setActiveModal('confirm');
                return;
            } else {
                updateState(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === targetId ? { ...b, history: [...b.history, newTransaction] } : b) }));
                setActiveModal(null);
            }
        }
    };
    const handleSaveScannedItems = (items: ScannedItem[]) => {
        updateState(prev => {
            const newDailyExpenses = [...prev.dailyExpenses];
            const newBudgets = prev.budgets.map(b => ({ ...b, history: [...b.history] }));
            items.forEach(item => {
                if (item.budgetId === 'none' || item.amount <= 0 || !item.desc.trim()) return;
                const timestamp = Date.now();
                const txDate = new Date(timestamp);

                if (item.budgetId === 'daily') newDailyExpenses.push({ desc: item.desc, amount: item.amount, timestamp: timestamp });
                else {
                    const budgetIndex = newBudgets.findIndex(b => b.id === item.budgetId);
                    if (budgetIndex !== -1) {
                        const budget = newBudgets[budgetIndex];
                        
                        // FIX: Filter usage by current month
                        const currentUsed = budget.history
                            .filter(h => {
                                const hDate = new Date(h.timestamp);
                                return hDate.getMonth() === txDate.getMonth() && hDate.getFullYear() === txDate.getFullYear();
                            })
                            .reduce((sum, h) => sum + h.amount, 0);

                        const remainingQuota = Math.max(0, budget.totalBudget - currentUsed);
                        if (item.amount > remainingQuota) {
                            const overageAmount = item.amount - remainingQuota;
                            if (remainingQuota > 0) budget.history.push({ desc: item.desc, amount: remainingQuota, timestamp: timestamp });
                            newDailyExpenses.push({ desc: `[Overage] ${item.desc}`, amount: overageAmount, timestamp: timestamp, sourceCategory: budget.name });
                        } else { budget.history.push({ desc: item.desc, amount: item.amount, timestamp: timestamp }); }
                    } else { newDailyExpenses.push({ desc: item.desc, amount: item.amount, timestamp: timestamp }); }
                }
            });
            return { ...prev, dailyExpenses: newDailyExpenses, budgets: newBudgets };
        });
        setActiveModal(null);
    };
    const handleFundTransaction = (type: 'add' | 'remove', desc: string, amount: number) => {
        const newFundTransaction: FundTransaction = { type, desc, amount, timestamp: Date.now() };
        updateState(prev => ({...prev, fundHistory: [...prev.fundHistory, newFundTransaction]}));
        setActiveModal(null);
    }
    const handleDeleteTransaction = (timestamp: number, type: string, budgetId?: number) => {
        updateState(prev => {
            let newState = {...prev};
            if (type === 'daily') newState.dailyExpenses = prev.dailyExpenses.filter(t => t.timestamp !== timestamp);
            else if (type === 'fund') newState.fundHistory = prev.fundHistory.filter(t => t.timestamp !== timestamp);
            else if (type === 'post' && budgetId) newState.budgets = prev.budgets.map(b => b.id === budgetId ? {...b, history: b.history.filter(h => h.timestamp !== timestamp)} : b);
            return newState;
        });
        setActiveModal(null);
    }
    const handleEditGlobalTransaction = (timestamp: number, newDesc: string, newAmount: number, source: string, sourceId: number | string | undefined, oldDesc: string, oldAmount: number) => {
        updateState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const findAndEdit = (list: any[]) => { const idx = list.findIndex((t: any) => t.timestamp === timestamp && t.desc === oldDesc && t.amount === oldAmount); if (idx !== -1) { list[idx].desc = newDesc; list[idx].amount = newAmount; } };
            if (source === 'fund') findAndEdit(newState.fundHistory);
            else if (source === 'daily') findAndEdit(newState.dailyExpenses);
            else if (source === 'budget' && sourceId) { const budget = newState.budgets.find((b: Budget) => b.id === sourceId); if (budget) findAndEdit(budget.history); }
            else if (source === 'archive' && sourceId) { const archive = newState.archives.find((a: any) => a.month === sourceId); if (archive) findAndEdit(archive.transactions); }
            return newState;
        });
    };
    const handleDeleteGlobalTransaction = (timestamp: number, source: string, sourceId: number | string | undefined, desc: string, amount: number) => {
        updateState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const removeOne = (list: any[]) => { const idx = list.findIndex((t: any) => t.timestamp === timestamp && t.desc === desc && t.amount === amount); if (idx !== -1) { list.splice(idx, 1); return true; } return false; };
            if (source === 'fund' && desc.startsWith('Tabungan: ')) {
                const goalName = desc.substring('Tabungan: '.length);
                const goalIndex = newState.savingsGoals.findIndex((g: SavingsGoal) => g.name === goalName);
                if (goalIndex !== -1) {
                    const goal = newState.savingsGoals[goalIndex];
                    const histIdx = goal.history.findIndex((h: SavingTransaction) => h.timestamp === timestamp && h.amount === amount);
                    if (histIdx !== -1) { goal.history.splice(histIdx, 1); const newSavedAmount = goal.savedAmount - amount; goal.savedAmount = newSavedAmount < 0 ? 0 : newSavedAmount; goal.isCompleted = !goal.isInfinite && goal.targetAmount ? goal.savedAmount >= goal.targetAmount : false; }
                }
            }
            if (source === 'fund') removeOne(newState.fundHistory);
            else if (source === 'daily') removeOne(newState.dailyExpenses);
            else if (source === 'budget' && sourceId) { const budget = newState.budgets.find((b: Budget) => b.id === sourceId); if (budget) removeOne(budget.history); }
            else if (source === 'archive' && sourceId) { const archive = newState.archives.find((a: any) => a.month === sourceId); if (archive) removeOne(archive.transactions); }
            return newState;
        });
    }
    const handleEditAsset = (newAssetAmount: number) => {
        const difference = newAssetAmount - currentAsset;
        if (difference !== 0) {
            const correction: GlobalTransaction = { type: difference > 0 ? 'add' : 'remove', desc: 'Koreksi Saldo', amount: Math.abs(difference), timestamp: Date.now() };
            updateState(prev => { const newArchives = JSON.parse(JSON.stringify(prev.archives)); if (newArchives.length > 0) newArchives[newArchives.length - 1].transactions.push(correction); else newArchives.push({ month: new Date().toISOString().slice(0, 7), transactions: [correction] }); return { ...prev, archives: newArchives }; });
        }
        setActiveModal(null);
    };
    const handleAddAsset = (name: string, quantity: number, pricePerUnit: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => {
        const newAsset: Asset = { id: Date.now(), name, quantity, pricePerUnit, type, symbol };
        updateState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
        setActiveModal(null);
    };
    const handleEditAssetItem = (id: number, name: string, quantity: number, pricePerUnit: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => {
        updateState(prev => ({ ...prev, assets: prev.assets.map(a => a.id === id ? { ...a, name, quantity, pricePerUnit, type, symbol } : a) }));
        setActiveModal(null);
    };
    const handleDeleteAsset = (id: number) => { openConfirm("Anda yakin ingin menghapus aset ini dari daftar?", () => { updateState(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) })); }); };
    const handleAddWishlist = (name: string, price: number, days: number) => {
        const newItem: WishlistItem = { id: Date.now(), name, price, cooldownDays: days, createdAt: Date.now(), status: 'waiting' };
        updateState(prev => ({ ...prev, wishlist: [...(prev.wishlist || []), newItem] }));
        setActiveModal(null);
    };
    const handleFulfillWishlist = (id: number) => {
        const item = state.wishlist.find(i => i.id === id); if (!item) return;
        setPrefillData({ desc: item.name, amount: formatNumberInput(item.price) });
        updateState(prev => ({ ...prev, wishlist: prev.wishlist.map(i => i.id === id ? { ...i, status: 'purchased' } : i) }));
        setInputModalMode('use-daily'); setIsBackdateMode(false); setActiveModal('input');
    };
    const handleCancelWishlist = (id: number) => { updateState(prev => ({ ...prev, wishlist: prev.wishlist.map(i => i.id === id ? { ...i, status: 'cancelled' } : i) })); };
    const handleDeleteWishlist = (id: number) => { updateState(prev => ({ ...prev, wishlist: prev.wishlist.filter(i => i.id !== id) })); };
    const handleConvertWishlistToBudget = (item: WishlistItem) => {
        updateState(prev => {
            const newBudget: Budget = { id: Date.now(), name: item.name, totalBudget: item.price, history: [], icon: 'ShoppingBagIcon', color: '#2C3E50', order: prev.budgets.filter(b => !b.isArchived).length, isArchived: false, isTemporary: false };
            return { ...prev, budgets: [...prev.budgets, newBudget], wishlist: prev.wishlist.map(i => i.id === item.id ? { ...i, status: 'purchased' } : i) };
        });
        setNotifications(prev => [...prev, `Berhasil mengubah "${item.name}" menjadi Pos Anggaran!`]);
    };
    const handleConvertWishlistToSavings = (item: WishlistItem) => {
        updateState(prev => {
            const newGoal: SavingsGoal = { id: Date.now(), name: item.name, targetAmount: item.price, isInfinite: false, savedAmount: 0, history: [], createdAt: Date.now(), isCompleted: false };
            return { ...prev, savingsGoals: [...prev.savingsGoals, newGoal], wishlist: prev.wishlist.map(i => i.id === item.id ? { ...i, status: 'purchased' } : i) };
        });
        setNotifications(prev => [...prev, `Berhasil menjadikan "${item.name}" sebagai Target Tabungan!`]);
    };
    const handleDelayWishlist = (item: WishlistItem) => {
        const now = new Date(); const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); const diffTime = Math.abs(nextMonth.getTime() - now.getTime()); const daysToNextMonth = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updateState(prev => ({ ...prev, wishlist: prev.wishlist.map(i => i.id === item.id ? { ...i, createdAt: Date.now(), cooldownDays: daysToNextMonth } : i) }));
        setNotifications(prev => [...prev, `"${item.name}" ditunda sampai awal bulan depan.`]);
    };
    const handleAddSubscription = (subData: Omit<Subscription, 'id'>) => { const newSub: Subscription = { ...subData, id: Date.now() }; updateState(prev => ({ ...prev, subscriptions: [...(prev.subscriptions || []), newSub] })); };
    const handleEditSubscription = (subData: Subscription) => { updateState(prev => ({ ...prev, subscriptions: prev.subscriptions.map(s => s.id === subData.id ? subData : s) })); };
    const handleDeleteSubscription = (id: number) => { openConfirm("Hapus langganan ini?", () => { updateState(prev => ({ ...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id) })); }); };
    const handleInitiatePaySubscription = (subId: number) => { const sub = state.subscriptions.find(s => s.id === subId); if (!sub) return; setSubscriptionToPayId(subId); setPrefillData({ desc: sub.name, amount: formatNumberInput(sub.price) }); setInputModalMode('use-daily'); setIsBackdateMode(false); setActiveModal('input'); };
    const handleUpdateSubscriptionDate = (subId: number) => {
        updateState(prev => ({
            ...prev,
            subscriptions: prev.subscriptions.map(sub => {
                if (sub.id === subId) {
                    const currentBillDate = new Date(sub.firstBillDate); let nextDate = new Date(currentBillDate); const today = new Date(); let targetDate = currentBillDate < today ? today : currentBillDate;
                    if (sub.cycle === 'monthly') nextDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, currentBillDate.getDate()); else nextDate = new Date(targetDate.getFullYear() + 1, targetDate.getMonth(), currentBillDate.getDate());
                    return { ...sub, firstBillDate: nextDate.toISOString().slice(0, 10) };
                }
                return sub;
            })
        }));
    };

    const handleAddSavingsGoal = (name: string, isInfinite: boolean, targetAmount?: number, visualType?: 'plant' | 'pet', skinId?: string) => {
        const newGoal: SavingsGoal = {
            id: Date.now(),
            name,
            targetAmount: isInfinite ? undefined : targetAmount,
            isInfinite: isInfinite,
            savedAmount: 0,
            history: [],
            createdAt: Date.now(),
            isCompleted: false,
            visualType: visualType || 'plant',
            skinId: skinId || 'default'
        };
        updateState(prev => ({ ...prev, savingsGoals: [...prev.savingsGoals, newGoal] }));
        setActiveModal(null);
    };

    const handleAddSavings = (goalId: number, amount: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId); if (!goal) return;
        if (amount > currentAvailableFunds) { openConfirm(<>Dana tersedia tidak mencukupi. Sisa dana tersedia hanya <strong>{formatCurrency(currentAvailableFunds)}</strong>.</>, () => {}); return; }
        updateState(prev => {
            const transactionTimestamp = Date.now();
            const newFundHistory = [...prev.fundHistory, { type: 'remove' as const, desc: `Tabungan: ${goal.name}`, amount: amount, timestamp: transactionTimestamp }];
            const newSavingsGoals = prev.savingsGoals.map(g => {
                if (g.id === goalId) {
                    const newSavedAmount = g.savedAmount + amount;
                    const newHistory: SavingTransaction = { amount, timestamp: transactionTimestamp };
                    return { ...g, savedAmount: newSavedAmount, history: [...g.history, newHistory], isCompleted: !g.isInfinite && g.targetAmount ? newSavedAmount >= g.targetAmount : false };
                }
                return g;
            });
            return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
        });
        setActiveModal(null);
    };

    const handleWithdrawSavings = (goalId: number, amount: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId); if (!goal) return;
        if (amount > goal.savedAmount) { openConfirm(<>Dana tabungan tidak mencukupi. Terkumpul hanya <strong>{formatCurrency(goal.savedAmount)}</strong>.</>, () => {}); return; }
        
        updateState(prev => {
            const transactionTimestamp = Date.now();
            const newFundHistory = [...prev.fundHistory, { type: 'add' as const, desc: `Tarik Tabungan: ${goal.name}`, amount: amount, timestamp: transactionTimestamp }];
            const newSavingsGoals = prev.savingsGoals.map(g => {
                if (g.id === goalId) {
                    const newSavedAmount = g.savedAmount - amount;
                    const newHistory: SavingTransaction = { amount, timestamp: transactionTimestamp };
                    return { ...g, savedAmount: newSavedAmount, history: [...g.history, newHistory], isCompleted: false };
                }
                return g;
            });
            return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
        });
        setActiveModal(null);
    };

    const handleUseSavingsGoal = (goalId: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (!goal) return;

        openConfirm(<>
            <strong>Gunakan Celengan Ini?</strong><br/><br/>
            Uang sebesar {formatCurrency(goal.savedAmount)} akan dibelanjakan.<br/>
            Celengan akan dihapus dan tercatat sebagai transaksi pengeluaran.
        </>, () => {
            updateState(prev => {
                const timestamp = Date.now();
                const releaseIncome: FundTransaction = {
                    type: 'add',
                    desc: `Pencairan: ${goal.name}`,
                    amount: goal.savedAmount,
                    timestamp: timestamp
                };
                const expense: Transaction = {
                    desc: `[Beli] ${goal.name}`,
                    amount: goal.savedAmount,
                    timestamp: timestamp + 1,
                    sourceCategory: 'Tabungan'
                };
                const newSavingsGoals = prev.savingsGoals.filter(g => g.id !== goalId);
                
                // Add to collection
                const skinId = goal.skinId || (goal.visualType === 'pet' ? 'pet_default' : 'default');
                const collectedSkins = prev.collectedSkins || [];
                const newCollectedSkins = collectedSkins.includes(skinId) ? collectedSkins : [...collectedSkins, skinId];

                return {
                    ...prev,
                    fundHistory: [...prev.fundHistory, releaseIncome],
                    dailyExpenses: [...prev.dailyExpenses, expense],
                    savingsGoals: newSavingsGoals,
                    collectedSkins: newCollectedSkins
                };
            });
            setNotifications(prev => [...prev, `Selamat menikmati ${goal.name}! Skin telah ditambahkan ke koleksi bonus.`]);
            setActiveModal(null);
        });
    };

    const handleOpenSavingsGoal = (goalId: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (goal?.isCompleted) {
            handleUseSavingsGoal(goalId);
        } else {
            setCurrentSavingsGoalId(goalId); 
            setActiveModal('withdrawSavings');
        }
    };

     const handleDeleteSavingsGoal = (goalId: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId); if (!goal) return;
        const message = goal.isInfinite ? `Anda yakin ingin menghapus celengan "${goal.name}"? Dana sebesar ${formatCurrency(goal.savedAmount)} akan dikembalikan.` : `Anda yakin ingin menghapus celengan "${goal.name}"? Dana sebesar ${formatCurrency(goal.savedAmount)} akan dikembalikan ke dana tersedia.`;
        openConfirm(message, () => {
             updateState(prev => {
                const newFundHistory = goal.savedAmount > 0 ? [...prev.fundHistory, { type: 'add' as const, desc: `Batal Tabungan: ${goal.name}`, amount: goal.savedAmount, timestamp: Date.now() }] : prev.fundHistory;
                const newSavingsGoals = prev.savingsGoals.filter(g => g.id !== goalId);
                return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
            });
            setActiveModal(null);
        });
    };
    const handleUpdateProfile = (name: string, avatar: string) => { updateState(prev => ({ ...prev, userProfile: { ...prev.userProfile, name, avatar } })); };
    
    // --- EXPORT WITH ENCRYPTION ---
    const handleExportData = () => {
        // Use new encryption format
        const encrypted = encryptData(state);
        // Wrap in object to identify it as secure file
        const fileContent = JSON.stringify({
            app: "Anggaran",
            version: APP_VERSION,
            secure: true,
            payload: encrypted
        }, null, 2);
        
        const dataBlob = new Blob([fileContent], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a'); link.download = `data_anggaran_${new Date().toISOString().slice(0, 10)}.json`; link.href = url; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        const now = new Date().toISOString(); localStorage.setItem('lastExportDate', now); setLastExportDate(now); setActiveModal(null);
    };
    
    const handleTriggerImport = () => { openConfirm(<><strong>PERINGATAN!</strong><br />Mengimpor data akan menghapus semua data saat ini. Lanjutkan?</>, () => importFileInputRef.current?.click()); };
    
    // --- IMPORT WITH DECRYPTION SUPPORT ---
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result as string;
                let importedState;
                
                try {
                    const json = JSON.parse(text);
                    if (json.secure && json.payload) {
                        // Decrypt secure file
                        importedState = decryptData(json.payload);
                    } else {
                        // Legacy support for plain JSON (backward compatibility)
                        importedState = json;
                    }
                } catch(err) {
                    throw new Error("Format file tidak valid.");
                }

                if (typeof importedState.budgets !== 'object' || typeof importedState.archives !== 'object') throw new Error("Struktur data tidak valid.");
                
                // Merge with initial state to ensure new fields exist
                setState({ ...INITIAL_STATE, ...importedState });
                const now = new Date().toISOString(); localStorage.setItem('lastImportDate', now); setLastImportDate(now); setCurrentPage('dashboard');
                setNotifications(prev => [...prev, "Data berhasil dipulihkan!"]);
            } catch (err) { openConfirm("Gagal memuat file. Pastikan file cadangan valid dan tidak rusak.", () => {}); } finally { if(importFileInputRef.current) importFileInputRef.current.value = ''; }
        };
        reader.readAsText(file);
    };
    
    const handleManualBackup = () => {
        const newBackupKey = `${BACKUP_PREFIX}${Date.now()}`;
        try { localStorage.setItem(newBackupKey, JSON.stringify(state)); const allBackups = listInternalBackups(); if (allBackups.length > MAX_BACKUPS) { const oldestBackup = allBackups[allBackups.length - 1]; localStorage.removeItem(oldestBackup.key); } setInternalBackups(listInternalBackups()); setActiveModal('backupRestore'); } 
        catch (error) { openConfirm(<><strong>Gagal Mencadangkan</strong><br/>Penyimpanan penuh. Hapus beberapa tema kustom atau data lama.</>, () => {}); }
    };
    const handleRestoreBackup = (key: string) => { openConfirm("Memulihkan cadangan ini akan menimpa semua data Anda saat ini. Tindakan ini tidak dapat diurungkan.", () => { const backupData = localStorage.getItem(key); if (backupData) { try { const importedState = JSON.parse(backupData); setState({ ...INITIAL_STATE, ...importedState }); setActiveModal(null); setCurrentPage('dashboard'); } catch (err) { openConfirm("Gagal memuat cadangan. File mungkin rusak.", () => {}); } } else { openConfirm("Gagal menemukan data cadangan.", () => {}); } }); };
    const handleResetMonthlyData = () => { openConfirm('PERINGATAN: Ini akan menghapus semua data bulan ini TANPA diarsipkan. Hanya untuk uji coba. Lanjutkan?', () => { updateState(prev => ({ ...prev, fundHistory: [], dailyExpenses: [], budgets: prev.budgets.map(b => ({...b, history: []})) })); setActiveModal(null); }) }
    const handleResetAllData = () => { openConfirm(<><strong>HAPUS SEMUA DATA?</strong><br/>Tindakan ini tidak dapat diurungkan dan akan menghapus semua anggaran, transaksi, dan pencapaian Anda secara permanen.</>, () => { localStorage.removeItem(`budgetAppState_v${APP_VERSION}`); localStorage.removeItem('lastImportDate'); localStorage.removeItem('lastExportDate'); setLastImportDate(null); setLastExportDate(null); Object.keys(localStorage).filter(key => key.startsWith(BACKUP_PREFIX)).forEach(key => localStorage.removeItem(key)); window.location.reload(); }); };
    const handleManualCloseBook = () => { openConfirm(<><strong>Akhiri Bulan & Tutup Buku?</strong><br/><br/>Tindakan ini akan:<ul className="text-left list-disc pl-6 text-sm mt-2 mb-2"><li>Mengarsipkan semua transaksi bulan ini ke Laporan.</li><li>Mereset Pemasukan, Pengeluaran, dan Sisa Dana menjadi 0.</li><li>Mengosongkan penggunaan semua Pos Anggaran Tetap.</li><li>Mengarsipkan Pos Anggaran Sementara.</li></ul>Data tidak hilang, hanya dipindahkan ke arsip. Mulai lembaran baru?</>, () => { updateState(prev => { const currentMonth = new Date().toISOString().slice(0, 7); const archivedTransactions: GlobalTransaction[] = []; archivedTransactions.push(...prev.fundHistory); prev.dailyExpenses.forEach(t => { archivedTransactions.push({ ...t, type: 'remove', category: t.sourceCategory || 'Harian' }); }); prev.budgets.forEach(b => { b.history.forEach(h => { archivedTransactions.push({ ...h, type: 'remove', category: b.name, icon: b.icon, color: b.color }); }); }); const newBudgets = prev.budgets.map(b => { if (b.isTemporary) { return { ...b, isArchived: true, history: [] }; } else { return { ...b, history: [] }; } }); const newArchive = { month: currentMonth, transactions: archivedTransactions }; return { ...prev, archives: [...prev.archives, newArchive], fundHistory: [], dailyExpenses: [], budgets: newBudgets }; }); setActiveModal(null); }); };
    const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return; setActiveModal('scanResult'); setIsScanning(true); setScanError(null); setScannedItems([]);
        try {
            const base64Data = await fileToBase64(file); const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const imagePart = { inlineData: { mimeType: file.type, data: base64Data } }; const textPart = { text: "Analyze the receipt image and extract only the individual purchased items with their corresponding prices. Exclude any lines that are not items, such as totals, subtotals, taxes, discounts, or store information. All prices must be positive numbers. Ignore any hyphens or stray characters that are not part of the item's name or price. Your response must be a valid JSON array of objects. Each object must contain 'desc' (string) for the item name and 'amount' (number) for the price. Do not include anything else in your response besides the JSON array." }; const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { desc: { type: Type.STRING, description: "Nama barang yang dibeli." }, amount: { type: Type.NUMBER, description: "Harga barang sebagai angka positif. Abaikan karakter non-numerik seperti tanda hubung (-)." } }, required: ["desc", "amount"] } }; const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] }, config: { responseMimeType: 'application/json', responseSchema: schema } }); const resultData = JSON.parse(response.text || "[]");
            if (Array.isArray(resultData)) { const sanitizedData = resultData.map(item => ({ ...item, amount: Math.abs(Number(item.amount) || 0), budgetId: 'none' })).filter(item => item.amount > 0 && item.desc && item.desc.trim() !== ''); setScannedItems(sanitizedData); } else { throw new Error("AI response is not in the expected format."); }
        } catch (error) { console.error("Error scanning receipt:", error); setScanError("Gagal memindai struk. Coba lagi dengan gambar yang lebih jelas."); } finally { setIsScanning(false); if (scanFileInputRef.current) scanFileInputRef.current.value = ''; }
    };
    const handleProcessSmartInput = async (text: string) => {
        if (!text.trim()) { setSmartInputError("Mohon masukkan deskripsi transaksi."); return; } setIsProcessingSmartInput(true); setSmartInputError(null); setSmartInputResult([]);
        try {
            const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const budgetCategories = [...state.budgets.filter(b => !b.isArchived).map(b => b.name), 'Uang Harian']; const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { desc: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING, enum: budgetCategories } }, required: ["desc", "amount", "category"] } }; const prompt = `Analisis teks berikut yang berisi transaksi keuangan dalam Bahasa Indonesia. Ekstrak setiap transaksi individual (deskripsi dan jumlahnya). Untuk setiap transaksi, tentukan kategori anggaran yang paling sesuai dari daftar ini: [${budgetCategories.join(', ')}]. Jika tidak ada yang cocok, gunakan "Uang Harian". Respons Anda HARUS berupa array JSON yang valid dari objek, di mana setiap objek memiliki kunci "desc", "amount", dan "category". Teks: "${text}"`; const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json', responseSchema: schema } }); const resultData = JSON.parse(response.text || "[]");
            if (Array.isArray(resultData)) { const mappedItems: ScannedItem[] = resultData.map(item => { const matchedBudget = state.budgets.find(b => b.name === item.category); let budgetId: ScannedItem['budgetId'] = 'daily'; if (matchedBudget) { budgetId = matchedBudget.id; } return { desc: item.desc, amount: item.amount, budgetId: budgetId }; }); setSmartInputResult(mappedItems); } else { throw new Error("Format respons AI tidak terduga."); }
        } catch (error) { console.error("Error processing smart input:", error); setSmartInputError("Gagal memproses input. Coba lagi dengan format yang lebih sederhana."); } finally { setIsProcessingSmartInput(false); }
    };
    const handleGetAIAdvice = async () => {
        setActiveModal('aiAdvice'); setIsFetchingAdvice(true); setAiAdvice(''); setAdviceError(null);
        try {
            // HELPER: Filter current month
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const isTxInCurrentMonth = (ts: number) => {
                const d = new Date(ts);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            };

            const budgetDetails = state.budgets.map(b => { 
                const used = b.history
                    .filter(h => isTxInCurrentMonth(h.timestamp))
                    .reduce((sum, h) => sum + h.amount, 0); 
                return `* ${b.name}: Terpakai ${formatCurrency(used)} dari kuota ${formatCurrency(b.totalBudget)}`; 
            }).join('\n');

            const prompt = `${getSystemInstruction(state.userProfile.activePersona)} Berikut adalah ringkasan data keuangan pengguna untuk bulan ini dalam Rupiah (IDR):\n* Total Pemasukan: ${formatCurrency(monthlyIncome)}\n* Total Pengeluaran: ${formatCurrency(totalUsedOverall)}\n* Sisa Dana Bulan Ini: ${formatCurrency(totalRemaining)}\nRincian Pengeluaran berdasarkan Pos Anggaran (Bulan Ini):\n${budgetDetails || "Tidak ada pos anggaran yang dibuat."}\nTotal Pengeluaran Harian (di luar pos anggaran): ${formatCurrency(totalDailySpent)}\nSisa Dana yang Tidak Terikat Anggaran: ${formatCurrency(remainingUnallocated)}\nBerdasarkan data ini, berikan analisis singkat dan beberapa saran praktis untuk mengelola keuangan dengan lebih baik. Berikan jawaban dalam format poin-poin (bullet points) menggunakan markdown.`;
            const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setAiAdvice(response.text || "AI tidak memberikan respon.");
        } catch (error) { console.error("Error getting AI advice:", error); setAdviceError("Gagal mendapatkan saran dari AI. Silakan coba lagi nanti."); } finally { setIsFetchingAdvice(false); }
    };
    const handleFetchDashboardInsight = useCallback(async () => {
        setIsFetchingDashboardInsight(true);
        try {
            const now = new Date(); 
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const isTxInCurrentMonth = (ts: number) => {
                const d = new Date(ts);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            };

            const daysPassed = Math.max(1, now.getDate()); 
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); 
            const daysRemaining = lastDayOfMonth - daysPassed;
            
            // Recalculate strictly for this month inside this scope
            const currentMonthIncome = state.fundHistory
                .filter(t => t.type === 'add' && isTxInCurrentMonth(t.timestamp))
                .reduce((sum, t) => sum + t.amount, 0);
            
            const dailySpentThisMonth = state.dailyExpenses
                .filter(t => isTxInCurrentMonth(t.timestamp))
                .reduce((sum, e) => sum + e.amount, 0);

            const generalExpenseThisMonth = state.fundHistory
                .filter(t => t.type === 'remove' && isTxInCurrentMonth(t.timestamp))
                .reduce((sum, t) => sum + t.amount, 0);

            const budgetSpentThisMonth = state.budgets.reduce((sum, b) => 
                sum + b.history
                    .filter(h => isTxInCurrentMonth(h.timestamp))
                    .reduce((s, h) => s + h.amount, 0), 0);

            const totalSpent = dailySpentThisMonth + generalExpenseThisMonth + budgetSpentThisMonth;
            const currentBalance = currentMonthIncome - totalSpent;
            
            const avgDailySpend = totalSpent / daysPassed;
            const projectedAdditionalSpend = avgDailySpend * daysRemaining;
            const projectedEndMonthBalance = currentBalance - projectedAdditionalSpend;
            
            const budgetDetails = state.budgets.map(b => { 
                const used = b.history
                    .filter(h => isTxInCurrentMonth(h.timestamp))
                    .reduce((sum, h) => sum + h.amount, 0); 
                if (used > 0) return `* ${b.name}: Terpakai ${formatCurrency(used)} dari ${formatCurrency(b.totalBudget)}`; 
                return null; 
            }).filter(Boolean).join('\n');

            const prompt = `${getSystemInstruction(state.userProfile.activePersona)} ANALISIS KEUANGAN BULANAN & PREDIKSI: PERIODE: 1 ${now.toLocaleDateString('id-ID', {month: 'long'})} s.d. Hari Ini (${now.getDate()}). DATA SAAT INI (BULAN BERJALAN): - Total Pemasukan: ${formatCurrency(currentMonthIncome)} - Total Pengeluaran (Semua): ${formatCurrency(totalSpent)} - Sisa Uang Riil Saat Ini: ${formatCurrency(currentBalance)} DETAIL PENGELUARAN: ${budgetDetails || "Belum ada data detail pos anggaran."} PROYEKSI AKHIR BULAN (Estimasi): - Rata-rata pengeluaran per hari: ${formatCurrency(avgDailySpend)} - Estimasi sisa uang di akhir bulan: ${formatCurrency(projectedEndMonthBalance)} (Jika pola belanja sama) TUGASMU: Berikan wawasan dalam format poin-poin Markdown yang menarik: 1. **Gambaran Pengeluaran**: Ceritakan singkat kemana uang paling banyak mengalir berdasarkan data bulan ini. 2. **Pendapatku**: Berikan opinimu tentang cara user mengelola uang bulan ini (apakah boros, hemat, atau bahaya). Gunakan gaya bahasamu yang khas! 3. **Terawangan Masa Depan**: Prediksi apakah akhir bulan akan aman (surplus) atau bahaya (minus) jika user terus begini. 4. **Saran**: Satu aksi spesifik yang harus dilakukan sekarang.`;
            const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setAiDashboardInsight(response.text || "Belum ada data yang cukup untuk prediksi.");
        } catch (error) { console.error("Error fetching dashboard insight:", error); setAiDashboardInsight("Lagi ga bisa nerawang nih, cek koneksi dulu ya."); } finally { setIsFetchingDashboardInsight(false); }
    }, [state]);
    const handleAnalyzeChartData = async (prompt: string): Promise<string> => {
        try { const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const enhancedPrompt = `${getSystemInstruction(state.userProfile.activePersona)} ${prompt}`; const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: enhancedPrompt }); return response.text || "Tidak ada analisis."; } 
        catch (error) { console.error("Chart analysis error:", error); return "Waduh, gagal baca grafik nih. Coba lagi nanti ya!"; }
    };
    const getFinancialContextForAI = useCallback(() => {
        const now = new Date(); 
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const isTxInCurrentMonth = (ts: number) => {
            const d = new Date(ts);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };

        const budgetDetails = state.budgets.map(b => { 
            const used = b.history
                .filter(h => isTxInCurrentMonth(h.timestamp))
                .reduce((sum, h) => sum + h.amount, 0); 
            return `* Pos Anggaran "${b.name}": Kuota ${formatCurrency(b.totalBudget)}, Terpakai ${formatCurrency(used)}, Sisa ${formatCurrency(b.totalBudget - used)}`; 
        }).join('\n');

        const recentTransactions = allTransactions
            .filter(t => isTxInCurrentMonth(t.timestamp))
            .slice(0, 10)
            .map(t => `* ${new Date(t.timestamp).toLocaleDateString('id-ID')}: ${t.desc} (${t.type === 'add' ? '+' : '-'} ${formatCurrency(t.amount)}) - Kategori: ${t.category || (t.type === 'add' ? 'Pemasukan' : 'Umum')}`).join(', ');

        return `Tugas Anda adalah menjawab pertanyaan pengguna HANYA berdasarkan data keuangan yang saya berikan di bawah ini. Jangan membuat informasi atau memberikan saran di luar data. Jawab dalam Bahasa Indonesia. Berikut adalah ringkasan data keuangan pengguna untuk bulan ini (${now.toLocaleDateString('id-ID', {month: 'long'})}) dalam IDR: **Ringkasan Umum:** * Total Pemasukan Bulan Ini: ${formatCurrency(monthlyIncome)}, * Total Pengeluaran Keseluruhan Bulan Ini: ${formatCurrency(totalUsedOverall)}, * Sisa Dana Bulan Ini (Pemasukan - Pengeluaran): ${formatCurrency(totalRemaining)}, * Total Dana yang Dialokasikan ke Pos Anggaran: ${formatCurrency(totalAllocated)}, * Dana Tersedia Untuk Pengeluaran Harian/Umum (di luar pos): ${formatCurrency(currentAvailableFunds)}. **Rincian Pos Anggaran (Bulan Ini):** ${budgetDetails || "Tidak ada pos anggaran yang dibuat."}. **Rincian Transaksi Terakhir (Bulan Ini):** ${recentTransactions}. Data sudah lengkap. Anda siap menjawab pertanyaan pengguna.`;
    }, [state, monthlyIncome, totalUsedOverall, totalRemaining, totalAllocated, currentAvailableFunds, allTransactions]);
    const handleOpenAIChat = useCallback(async () => {
        setActiveModal('aiChat'); setAiChatHistory([]); setAiChatError(null); setIsAiChatLoading(true);
        try { const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const contextPrompt = getFinancialContextForAI(); const systemInstruction = getSystemInstruction(state.userProfile.activePersona); const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction }, history: [ { role: 'user', parts: [{ text: contextPrompt }] }, { role: 'model', parts: [{ text: 'Data diterima. Saya siap membantu.' }] } ] }); setAiChatSession(chat); setAiChatHistory([{ role: 'model', text: 'Halo! Saya asisten AI Anda. Silakan tanyakan apa saja tentang data keuangan Anda bulan ini.' }]); } 
        catch (error) { console.error("Error initializing AI Chat:", error); setAiChatError("Gagal memulai sesi chat. Silakan coba lagi."); } finally { setIsAiChatLoading(false); }
    }, [getFinancialContextForAI, state.userProfile.activePersona]);
    const handleSendChatMessage = async (message: string) => {
        if (!aiChatSession) { setAiChatError("Sesi chat tidak aktif. Silakan tutup dan buka kembali."); return; } setAiChatHistory(prev => [...prev, { role: 'user', text: message }]); setIsAiChatLoading(true); setAiChatError(null);
        try { const response = await aiChatSession.sendMessage({ message }); setAiChatHistory(prev => [...prev, { role: 'model', text: response.text || "Maaf, saya tidak mengerti." }]); } catch (error) { console.error("Error sending AI Chat message:", error); setAiChatError("Gagal mengirim pesan. Mohon coba lagi."); } finally { setIsAiChatLoading(false); }
    };
    const handleAiSearch = async (query: string) => {
        setIsSearchingWithAI(true); setAiSearchError(null); setAiSearchResults(null);
        try { const apiKey = getApiKey(); const ai = new GoogleGenAI({ apiKey }); const transactionsForPrompt = allTransactions.map(t => ({ timestamp: t.timestamp, desc: t.desc, amount: t.amount, type: t.type, category: t.category || (t.type === 'add' ? 'Pemasukan' : 'Umum') })); const prompt = `You are a smart search engine for a user's financial transactions. Analyze the user's natural language query and the provided JSON data of all their transactions. Your task is to identify and return ONLY the timestamps of the transactions that precisely match the user's query.\nUser Query: "${query}"\nTransaction Data (JSON):\n${JSON.stringify(transactionsForPrompt)}\nYour response MUST be a valid JSON array containing only the numbers (timestamps) of the matching transactions. For example: [1678886400000, 1678972800000]. If no transactions match, return an empty array [].`; const schema = { type: Type.ARRAY, items: { type: Type.NUMBER } }; const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json', responseSchema: schema } }); const matchingTimestamps = JSON.parse(response.text || "[]") as number[]; const results = allTransactions.filter(t => matchingTimestamps.includes(t.timestamp)); setAiSearchResults(results.sort((a, b) => b.timestamp - a.timestamp)); } 
        catch (error) { console.error("Error with AI Search:", error); setAiSearchError("Gagal melakukan pencarian AI. Coba lagi."); } finally { setIsSearchingWithAI(false); }
    };
    const handleClearAiSearch = () => { setAiSearchResults(null); setAiSearchError(null); };
    
    // Calculate User Level
    const levelInfo = calculateUserLevel(grandTotalPoints);
    const handlePurchase = (item: ShopItem) => { if (availableShopPoints < item.price) { openConfirm(<>Mustika tidak cukup! Kamu butuh <strong>{item.price - availableShopPoints}</strong> Mustika lagi.</>, () => {}); return; } updateState(prev => { const newSpent = (prev.spentPoints || 0) + item.price; const newInventory = [...(prev.inventory || []), item.id]; return { ...prev, spentPoints: newSpent, inventory: newInventory }; }); setNotifications(prev => [...prev, `Berhasil membeli ${item.name}!`]); };
    const handleSpendPoints = (amount: number) => { updateState(prev => ({ ...prev, spentPoints: (prev.spentPoints || 0) + amount })); };
    const handleEquip = (item: ShopItem) => { updateState(prev => { let newProfile = { ...prev.userProfile }; let newActiveTheme = prev.activeTheme; let newTrendChartTheme = prev.activeTrendChartTheme; let newBudgetChartTheme = prev.activeBudgetChartTheme; if (item.type === 'theme' || item.type === 'special') { newActiveTheme = item.value; } else if (item.type === 'chart_skin') { if (item.category === 'trend') newTrendChartTheme = item.value; if (item.category === 'budget') newBudgetChartTheme = item.value; } else if (item.type === 'title') { newProfile.customTitle = item.value; } else if (item.type === 'frame') { newProfile.frameId = item.value; } else if (item.type === 'persona') { newProfile.activePersona = item.value; } else if (item.type === 'banner') { newProfile.activeBanner = item.value; } return { ...prev, userProfile: newProfile, activeTheme: newActiveTheme, activeTrendChartTheme: newTrendChartTheme, activeBudgetChartTheme: newBudgetChartTheme }; }); };
    const handleAddCustomTheme = (theme: CustomTheme, price: number) => { if (availableShopPoints < price) { openConfirm(<>Mustika tidak cukup untuk membuat tema kustom.</>, () => {}); return; } updateState(prev => { const newSpent = (prev.spentPoints || 0) + price; const newThemes = [...(prev.customThemes || []), theme]; return { ...prev, spentPoints: newSpent, customThemes: newThemes, activeTheme: theme.id }; }); setNotifications(prev => [...prev, `Tema Kustom "${theme.name}" berhasil dibuat dan diterapkan!`]); };
    
    // --- REDEEM CODE HANDLER ---
    const handleRedeemCode = (code: string) => {
        const normalizedCode = code.toUpperCase().trim();
        if (state.redeemedCodes && state.redeemedCodes.includes(normalizedCode)) {
            openConfirm("Kode ini sudah pernah digunakan.", () => {});
            return;
        }
        const reward = VALID_REDEEM_CODES[normalizedCode];
        if (reward) {
            updateState(prev => ({
                ...prev,
                redeemedCodes: [...(prev.redeemedCodes || []), normalizedCode],
                redeemedMustika: (prev.redeemedMustika || 0) + reward
            }));
            setNotifications(prev => [...prev, `Berhasil! +${reward} Mustika ditambahkan.`]);
            setActiveModal(null);
        } else {
            openConfirm("Kode tidak valid. Periksa kembali.", () => {});
        }
    };

    // --- DAILY BONUS HANDLER ---
    const handleClaimDailyBonus = (mustikaReward: number, xpReward: number) => {
        updateState(prev => ({
            ...prev,
            redeemedMustika: (prev.redeemedMustika || 0) + mustikaReward,
            accumulatedXP: (prev.accumulatedXP || 0) + xpReward,
            lastDailyBonusClaim: new Date().toLocaleDateString('fr-CA')
        }));
        setNotifications(prev => [...prev, `Bonus Harian Diklaim! +${mustikaReward} Mustika, +${xpReward} XP`]);
        setActiveModal(null);
    };

    // --- SHOPPING LIST HANDLERS ---
    const handleAddShoppingItem = (item: ShoppingItem) => {
        updateState(prev => ({ ...prev, shoppingList: [...prev.shoppingList, item] }));
    };
    const handleToggleShoppingItem = (id: number) => {
        updateState(prev => ({ ...prev, shoppingList: prev.shoppingList.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i) }));
    };
    const handleDeleteShoppingItem = (id: number) => {
        updateState(prev => ({ ...prev, shoppingList: prev.shoppingList.filter(i => i.id !== id) }));
    };
    const handleUpdateShoppingItemEstimate = (id: number, val: number) => {
        updateState(prev => ({ ...prev, shoppingList: prev.shoppingList.map(i => i.id === id ? { ...i, estimate: val } : i) }));
    };
    const handleClearShoppingList = () => {
        openConfirm("Hapus semua daftar belanja?", () => {
            updateState(prev => ({ ...prev, shoppingList: [] }));
        });
    };
    const handleClearCheckedShoppingItems = () => {
        updateState(prev => ({ ...prev, shoppingList: prev.shoppingList.filter(i => !i.isChecked) }));
    };

    const renderPage = () => { switch (currentPage) { 
        case 'reports': return <Reports state={state} onBack={() => setCurrentPage('dashboard')} onEditAsset={() => setActiveModal('editAsset')} onDeleteTransaction={(timestamp, source, sourceId, desc, amount) => openConfirm('Yakin ingin menghapus transaksi ini secara PERMANEN dari seluruh data?', () => handleDeleteGlobalTransaction(timestamp, source, sourceId, desc, amount))} onEditTransaction={handleEditGlobalTransaction} aiSearchResults={aiSearchResults} isSearchingWithAI={isSearchingWithAI} aiSearchError={aiSearchError} onAiSearch={handleAiSearch} onClearAiSearch={handleClearAiSearch} />; 
        case 'visualizations': return <Visualizations state={state} onBack={() => setCurrentPage('dashboard')} onAnalyzeChart={handleAnalyzeChartData} activePersona={state.userProfile.activePersona} />; 
        case 'savings': return <Savings state={state} onOpenAddGoalModal={() => setActiveModal('addSavingsGoal')} onOpenAddSavingsModal={(goalId) => { setCurrentSavingsGoalId(goalId); setActiveModal('addSavings'); }} onOpenDetailModal={(goalId) => { setCurrentSavingsGoalId(goalId); setActiveModal('savingsDetail'); }} onOpenSavingsGoal={handleOpenSavingsGoal} />; 
        case 'achievements': return <Achievements state={state} allAchievements={allAchievements} unlockedAchievements={state.unlockedAchievements} achievementData={state.achievementData} totalPoints={achievementPoints} userLevel={{...levelInfo, level: `Level ${levelInfo.levelNumber}`, currentLevelPoints: 0, nextLevelPoints: null}} />; 
        case 'missions': return <Missions state={state} achievementData={state.achievementData} totalPoints={grandTotalPoints} spendablePoints={availableShopPoints} />;
        case 'personalBest': return <PersonalBest state={state} />; 
        case 'netWorth': return <NetWorth state={state} currentCashAsset={currentAsset} onAddAsset={() => openAssetModal(null)} onEditAsset={(assetId) => openAssetModal(assetId)} onDeleteAsset={handleDeleteAsset} />; 
        case 'wishlist': return <Wishlist wishlist={state.wishlist || []} onAddWishlist={() => setActiveModal('addWishlist')} onFulfillWishlist={handleFulfillWishlist} onCancelWishlist={handleCancelWishlist} onDeleteWishlist={handleDeleteWishlist} onConvertToBudget={handleConvertWishlistToBudget} onConvertToSavings={handleConvertWishlistToSavings} onDelayToNextMonth={handleDelayWishlist} />; 
        case 'subscriptions': return <Subscriptions state={state} onAddSubscription={handleAddSubscription} onDeleteSubscription={handleDeleteSubscription} onEditSubscription={handleEditSubscription} />; 
        case 'profile': return <Profile state={state} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentPage('dashboard')} totalPoints={grandTotalPoints} totalBadges={unlockedAchIds.length} userLevel={{...levelInfo, level: `Level ${levelInfo.levelNumber}`, currentLevelPoints: 0, nextLevelPoints: null}} />; 
        case 'shop': return <Shop state={state} availablePoints={availableShopPoints} onBack={() => setCurrentPage('dashboard')} onPurchase={handlePurchase} onEquip={handleEquip} onAddCustomTheme={handleAddCustomTheme} onSpendPoints={handleSpendPoints} />; 
        case 'customApp': return <CustomApp state={state} onBack={() => setCurrentPage('dashboard')} onEquip={handleEquip} onDeleteCustomTheme={handleDeleteCustomTheme} />; 
        case 'shoppingList': return <ShoppingList 
                onBack={() => setCurrentPage('dashboard')} 
                budgets={state.budgets.filter(b => !b.isArchived)} 
                onAddTransaction={handleAddTransaction} 
                items={state.shoppingList}
                onAddItem={handleAddShoppingItem}
                onToggleItem={handleToggleShoppingItem}
                onDeleteItem={handleDeleteShoppingItem}
                onUpdateEstimate={handleUpdateShoppingItemEstimate}
                onClearAll={handleClearShoppingList}
                onClearChecked={handleClearShoppingList}
            />;
        case 'dashboard': default: return <Dashboard state={state} onUseDailyBudget={openUseDailyBudget} onManageFunds={() => { setFundsModalTab('add'); setActiveModal('funds'); }} onUseBudget={openUseBudget} onEditBudget={openEditBudget} aiInsight={aiDashboardInsight} isFetchingInsight={isFetchingDashboardInsight} onRefreshInsight={handleFetchDashboardInsight} onViewDailyHistory={openDailyHistory} onAddBudget={() => setActiveModal('addBudget')} onReorderBudgets={handleReorderBudgets} onSetBudgetPermanence={handleSetBudgetPermanence} onAddIncome={() => { setFundsModalTab('add'); setActiveModal('funds'); }} onPaySubscription={handleInitiatePaySubscription} onGoToProfile={() => setCurrentPage('profile')} />; 
    } };
    const budgetForInputModal = state.budgets.find(b => b.id === currentBudgetId);
    const savingsGoalForModal = state.savingsGoals.find(g => g.id === currentSavingsGoalId);
    const assetForModal = state.assets.find(a => a.id === currentAssetId);
    const handleInputSubmit = (data: { description: string, amount: number, targetId?: 'daily' | number, icon?: string, color?: string, date?: string }) => { if (subscriptionToPayId && data.targetId !== undefined) { handleAddTransaction(data.description, data.amount, data.targetId, data.date); handleUpdateSubscriptionDate(subscriptionToPayId); setSubscriptionToPayId(null); return; } if (inputModalMode === 'edit-post' && data.icon && data.color) { handleEditBudget(data.description, data.amount, data.icon, data.color); } else if (data.targetId !== undefined) { handleAddTransaction(data.description, data.amount, data.targetId, data.date); } };
    const handleCloseBackupToast = () => { if (dailyBackup) { URL.revokeObjectURL(dailyBackup.url); } setDailyBackup(null); };
    const openUseDailyBudget = () => { setInputModalMode('use-daily'); setIsBackdateMode(false); setActiveModal('input'); };
    const openUseBudget = (budgetId: number) => { setInputModalMode('use-post'); setCurrentBudgetId(budgetId); setIsBackdateMode(false); setActiveModal('input'); };
    const openEditBudget = (budgetId: number) => { setInputModalMode('edit-post'); setCurrentBudgetId(budgetId); setIsBackdateMode(false); setActiveModal('input'); };
    const handleOpenBackdate = () => { setInputModalMode('use-daily'); setIsBackdateMode(true); setActiveModal('input'); };
    const openFundHistory = () => { setHistoryModalContent({ title: 'Riwayat Dana Bulan Ini', transactions: state.fundHistory.slice().reverse(), type: 'fund', budgetId: undefined }); setActiveModal('history'); };
    const openDailyHistory = () => { setHistoryModalContent({ title: 'Riwayat Pengeluaran Harian', transactions: state.dailyExpenses.slice().reverse(), type: 'daily', budgetId: undefined, }); setActiveModal('history'); };
    const openConfirm = (message: React.ReactNode, onConfirm: () => void) => { setConfirmModalContent({ message, onConfirm }); setActiveModal('confirm'); };
    const openAssetModal = (assetId: number | null) => { setCurrentAssetId(assetId); setActiveModal('asset'); }
    const openBatchInput = () => setActiveModal('batchInput');

    return (
        <div className="container mx-auto max-w-3xl font-sans text-dark-text relative">
            {/* RENDER LIVING BACKGROUND ONLY IF THEME IS ACTIVE */}
            {state.activeTheme === 'theme_living_mood' && (
                <LivingBackground percentage={financialHealthPercentage} />
            )}
            {/* RENDER TIME BASED BACKGROUND IF ACTIVE */}
            {state.activeTheme === 'theme_dynamic_time' && (
                <TimeBasedBackground />
            )}
            {/* RENDER CYBERPUNK BACKGROUND IF ACTIVE */}
            {state.activeTheme === 'theme_cyberpunk_battery' && (
                <CyberpunkBatteryBackground percentage={deviceBatteryLevel} />
            )}
            {/* RENDER THERMAL BACKGROUND IF ACTIVE */}
            {state.activeTheme === 'theme_thermal_heat' && (
                <ThermalHeatBackground spendingStatus={thermalStatus} />
            )}

            <input type="file" ref={importFileInputRef} accept=".json" className="hidden" onChange={handleImportData} />
            <input type="file" ref={scanFileInputRef} accept="image/*" className="hidden" onChange={handleImageFileChange} />
            <AchievementUnlockedToast achievement={newlyUnlockedAchievement} />
            <NotificationToast messages={notifications} onClose={() => setNotifications([])} />
            {dailyBackup && <DailyBackupToast backup={dailyBackup} onClose={handleCloseBackupToast} />}
            {renderPage()}
            <BottomNavBar currentPage={currentPage} onNavigate={setCurrentPage} onOpenMenu={() => setActiveModal('menu')} />
            <Modal isOpen={activeModal === 'input'} onClose={() => {setActiveModal(null); setSubscriptionToPayId(null);}} title={inputModalMode === 'edit-post' ? 'Edit Pos Anggaran' : subscriptionToPayId ? 'Bayar Tagihan' : (isBackdateMode ? 'Catat Transaksi Mundur' : 'Gunakan Uang')} originCoords={lastClickPos.current}><InputModalContent mode={inputModalMode} budget={budgetForInputModal} allBudgets={state.budgets.filter(b => !b.isArchived)} onSubmit={handleInputSubmit} onArchive={handleArchiveBudget} prefillData={prefillData} onPrefillConsumed={() => setPrefillData(null)} allowBackdate={isBackdateMode} /></Modal>
            <Modal isOpen={activeModal === 'asset'} onClose={() => setActiveModal(null)} title={currentAssetId ? 'Edit Aset' : 'Tambah Aset Baru'} originCoords={lastClickPos.current}><AssetModalContent assetToEdit={assetForModal} onSubmit={(id, name, quantity, price, type, symbol) => { if(id) handleEditAssetItem(id, name, quantity, price, type, symbol); else handleAddAsset(name, quantity, price, type, symbol); }} /></Modal>
            <Modal isOpen={activeModal === 'addWishlist'} onClose={() => setActiveModal(null)} title="Tambah Keinginan" originCoords={lastClickPos.current}><AddWishlistModalContent onSubmit={handleAddWishlist} /></Modal>
            <Modal isOpen={activeModal === 'batchInput'} onClose={() => setActiveModal(null)} title="Catat Banyak Pengeluaran" size="lg" originCoords={lastClickPos.current}><BatchInputModalContent budgets={state.budgets.filter(b => !b.isArchived)} onSave={handleSaveScannedItems} /></Modal>
            <Modal isOpen={activeModal === 'addBudget'} onClose={() => setActiveModal(null)} title="Buat Pos Anggaran Baru" originCoords={lastClickPos.current}><AddBudgetModalContent onSubmit={handleAddBudget} /></Modal>
            <Modal isOpen={activeModal === 'addSavingsGoal'} onClose={() => setActiveModal(null)} title="Buat Celengan Baru" originCoords={lastClickPos.current}><AddSavingsGoalModalContent onSubmit={handleAddSavingsGoal} inventory={state.inventory} /></Modal>
            <Modal isOpen={activeModal === 'addSavings'} onClose={() => setActiveModal(null)} title={`Tambah Tabungan: ${savingsGoalForModal?.name || ''}`} originCoords={lastClickPos.current}><AddSavingsModalContent goal={savingsGoalForModal} availableFunds={currentAvailableFunds} onSubmit={(amount) => currentSavingsGoalId && handleAddSavings(currentSavingsGoalId, amount)} /></Modal>
            <Modal isOpen={activeModal === 'withdrawSavings'} onClose={() => setActiveModal(null)} title={`Tarik Tabungan: ${savingsGoalForModal?.name || ''}`} originCoords={lastClickPos.current}><WithdrawSavingsModalContent goal={savingsGoalForModal} onSubmit={(amount) => currentSavingsGoalId && handleWithdrawSavings(currentSavingsGoalId, amount)} /></Modal>
            <Modal isOpen={activeModal === 'savingsDetail'} onClose={() => setActiveModal(null)} title={`Detail: ${savingsGoalForModal?.name || ''}`} originCoords={lastClickPos.current}><SavingsDetailModalContent goal={savingsGoalForModal} onDelete={() => currentSavingsGoalId && handleDeleteSavingsGoal(currentSavingsGoalId)} /></Modal>
            <Modal isOpen={activeModal === 'funds'} onClose={() => setActiveModal(null)} title="Kelola Dana Bulan Ini" originCoords={lastClickPos.current}><FundsManagementModalContent onSubmit={handleFundTransaction} onViewHistory={openFundHistory} initialTab={fundsModalTab} /></Modal>
            <Modal isOpen={activeModal === 'history'} onClose={() => setActiveModal(null)} title={historyModalContent.title} originCoords={lastClickPos.current}><HistoryModalContent transactions={historyModalContent.transactions} type={historyModalContent.type} budgetId={historyModalContent.budgetId} onDelete={(timestamp, type, budgetId) => openConfirm("Yakin menghapus transaksi ini? Dana akan dikembalikan.", () => handleDeleteTransaction(timestamp, type, budgetId))} /></Modal>
            <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="Info Keuangan Bulan Ini" originCoords={lastClickPos.current}><InfoModalContent monthlyIncome={monthlyIncome} totalAllocated={totalAllocated} unallocatedFunds={unallocatedFunds} generalAndDailyExpenses={generalAndDailyExpenses} remainingUnallocated={remainingUnallocated} onBackdate={handleOpenBackdate} /></Modal>
            <Modal isOpen={activeModal === 'editAsset'} onClose={() => setActiveModal(null)} title="Koreksi Saldo Aset" originCoords={lastClickPos.current}><EditAssetModalContent currentAsset={currentAsset} onSubmit={handleEditAsset} /></Modal>
            <Modal isOpen={activeModal === 'menu'} onClose={() => setActiveModal(null)} title="Menu & Opsi" originCoords={lastClickPos.current}><MainMenu onNavigate={(page) => { setCurrentPage(page); setActiveModal(null); }} onShowInfo={() => setActiveModal('info')} onManageFunds={() => setActiveModal('funds')} onScanReceipt={() => scanFileInputRef.current?.click()} onSmartInput={() => setActiveModal('smartInput')} onVoiceInput={() => setActiveModal('voiceAssistant')} onAskAI={handleOpenAIChat} onGetAIAdvice={handleGetAIAdvice} onOpenSettings={() => setActiveModal('settings')} onOpenDailyBonus={() => setActiveModal('dailyBonus')} onOpenDebt={() => setActiveModal('debt')} /></Modal>
            <Modal isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} title="Pengaturan & Opsi" originCoords={lastClickPos.current}><SettingsModalContent onExport={() => { setActiveModal(null); handleExportData(); }} onImport={handleTriggerImport} onManageArchived={() => setActiveModal('archivedBudgets')} onManualBackup={handleManualBackup} onManageBackups={() => setActiveModal('backupRestore')} onResetMonthly={handleResetMonthlyData} onResetAll={handleResetAllData} onManualCloseBook={handleManualCloseBook} onRedeemCode={() => setActiveModal('redeem')} lastImportDate={lastImportDate} lastExportDate={lastExportDate} /></Modal>
            <Modal isOpen={activeModal === 'archivedBudgets'} onClose={() => setActiveModal(null)} title="Kelola Anggaran Diarsipkan" originCoords={lastClickPos.current}><ArchivedBudgetsModalContent archivedBudgets={state.budgets.filter(b => b.isArchived)} onRestore={handleRestoreBudget} onDelete={handleDeleteBudgetPermanently} /></Modal>
            <Modal isOpen={activeModal === 'backupRestore'} onClose={() => setActiveModal(null)} title="Cadangan Internal Otomatis" originCoords={lastClickPos.current}><BackupRestoreModalContent backups={internalBackups} onRestore={handleRestoreBackup} /></Modal>
            <Modal isOpen={activeModal === 'scanResult'} onClose={() => setActiveModal(null)} title="Hasil Pindai Struk" originCoords={lastClickPos.current}><ScanResultModalContent isLoading={isScanning} error={scanError} items={scannedItems} budgets={state.budgets.filter(b => !b.isArchived)} onItemsChange={setScannedItems} onSave={() => handleSaveScannedItems(scannedItems)} /></Modal>
            <Modal isOpen={activeModal === 'voiceAssistant'} onClose={() => setActiveModal(null)} title="Asisten Suara Interaktif" size="lg" contentClassName="p-0" originCoords={lastClickPos.current}>{activeModal === 'voiceAssistant' && (<VoiceAssistantModalContent budgets={state.budgets.filter(b => !b.isArchived)} activePersona={state.userProfile.activePersona} onFinish={(items) => { setVoiceAssistantResult(items); setActiveModal('voiceResult'); }} onClose={() => setActiveModal(null)} />)}</Modal>
            <Modal isOpen={activeModal === 'voiceResult'} onClose={() => setActiveModal(null)} title="Konfirmasi Transaksi Suara" originCoords={lastClickPos.current}><ScanResultModalContent isLoading={false} error={null} items={voiceAssistantResult} budgets={state.budgets.filter(b => !b.isArchived)} onItemsChange={setVoiceAssistantResult} onSave={() => { handleSaveScannedItems(voiceAssistantResult); setVoiceAssistantResult([]); }} /></Modal>
            <Modal isOpen={activeModal === 'smartInput'} onClose={() => setActiveModal(null)} title="Input Transaksi Cerdas" originCoords={lastClickPos.current}><SmartInputModalContent isProcessing={isProcessingSmartInput} error={smartInputError} resultItems={smartInputResult} budgets={state.budgets.filter(b => !b.isArchived)} onProcess={handleProcessSmartInput} onSave={() => handleSaveScannedItems(smartInputResult)} onItemsChange={setSmartInputResult} onClearError={() => setSmartInputError(null)} /></Modal>
            <Modal isOpen={activeModal === 'aiAdvice'} onClose={() => setActiveModal(null)} title="Saran Keuangan dari AI" originCoords={lastClickPos.current}><AIAdviceModalContent isLoading={isFetchingAdvice} error={adviceError} advice={aiAdvice} /></Modal>
            <Modal isOpen={activeModal === 'aiChat'} onClose={() => {setActiveModal(null); setAiChatSession(null);}} title="Tanya AI" size="lg" contentClassName="p-0" originCoords={lastClickPos.current}><AIChatModalContent history={aiChatHistory} isLoading={isAiChatLoading} error={aiChatError} onSendMessage={handleSendChatMessage} /></Modal>
            <Modal isOpen={activeModal === 'redeem'} onClose={() => setActiveModal(null)} title="Kode Promo" originCoords={lastClickPos.current}><RedeemModalContent onClose={() => setActiveModal(null)} onRedeem={handleRedeemCode} /></Modal>
            <Modal isOpen={activeModal === 'debt'} onClose={() => setActiveModal(null)} title="Manajemen Hutang" originCoords={lastClickPos.current}><DebtManagerModalContent onClose={() => setActiveModal(null)} debts={state.debts} onAddDebt={handleAddDebt} onDeleteDebt={handleDeleteDebt} onAddTransaction={handleDebtTransaction} onIncreaseDebt={handleIncreaseDebt} /></Modal>
            <Modal isOpen={activeModal === 'dailyBonus'} onClose={() => setActiveModal(null)} title="Bonus Harian" originCoords={lastClickPos.current}><DailyBonusModalContent collectedSkins={state.collectedSkins || []} lastClaimDate={state.lastDailyBonusClaim} onClaim={handleClaimDailyBonus} /></Modal>
            <ConfirmModal isOpen={activeModal === 'confirm'} onClose={() => setActiveModal(null)} onConfirm={() => { confirmModalContent.onConfirm(); setActiveModal(null); }} message={confirmModalContent.message} />
        </div>
    );
};

export default App;
