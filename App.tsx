
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Type, Chat, LiveSession, LiveServerMessage, Modality, Blob as GenAIBlob, FunctionDeclaration } from '@google/genai';
import type { AppState, Budget, Transaction, FundTransaction, GlobalTransaction, ScannedItem, SavingsGoal, SavingTransaction, Achievement, Asset, WishlistItem, Subscription, ShopItem, CustomTheme } from './types';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Visualizations from './components/Visualizations';
import Savings from './components/Savings';
import Achievements from './components/Achievements';
import PersonalBest from './components/PersonalBest';
import NetWorth from './components/NetWorth';
import Wishlist from './components/Wishlist';
import Subscriptions from './components/Subscriptions';
import Profile from './components/Profile';
import Shop from './components/Shop'; 
import CustomApp from './components/CustomApp';
import { allAchievements } from './data/achievements';
import { HomeIcon, ChartBarIcon, DocumentTextIcon, ListBulletIcon, Squares2x2Icon, PlusCircleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, CameraIcon, LightbulbIcon, SparklesIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, TrashIcon, BuildingLibraryIcon, BudgetIcon, availableIcons, availableColors, TrophyIcon, Cog6ToothIcon, InformationCircleIcon, ExclamationTriangleIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, ServerStackIcon, FireIcon, CircleStackIcon, LockClosedIcon, CalendarDaysIcon, ChevronRightIcon, HeartIcon, ArrowPathIcon, BellIcon, CreditCardIcon, ClockIcon, ShoppingBagIcon, UserIcon, LayoutGridIcon, PaintBrushIcon } from './components/Icons';
import { AISkeleton } from './components/UI';

// --- THEME CONFIGURATION ---
const THEMES: Record<string, Record<string, string>> = {
    'theme_default': {
        '--color-primary-navy': '44 62 80', // #2C3E50
        '--color-primary-navy-dark': '31 43 56',
        '--color-accent-teal': '26 188 156', // #1ABC9C
        '--color-accent-teal-dark': '22 160 133',
        '--color-light-bg': '248 249 250', // #F8F9FA
        '--color-dark-text': '52 73 94', // #34495E
        '--color-secondary-gray': '127 140 141', // #7F8C8D
        '--color-white': '255 255 255',
        '--color-gray-50': '249 250 251',
        '--color-gray-100': '243 244 246',
        '--color-gray-200': '229 231 235',
        '--app-background': 'rgb(248 249 250)', // Solid Default
    },
    'theme_dark': {
        '--color-primary-navy': '96 165 250', // Blue-400
        '--color-primary-navy-dark': '59 130 246',
        '--color-accent-teal': '52 211 153', // Emerald-400
        '--color-accent-teal-dark': '16 185 129',
        '--color-light-bg': '17 24 39', // Gray-900
        '--color-dark-text': '229 231 235', // Gray-200
        '--color-secondary-gray': '156 163 175', // Gray-400
        '--color-white': '31 41 55', // Gray-800
        '--color-gray-50': '55 65 81', // Gray-700
        '--color-gray-100': '55 65 81',
        '--color-gray-200': '75 85 99', // Gray-600
        '--app-background': 'rgb(17 24 39)', // Solid Dark
    },
    'theme_teal': {
        '--color-primary-navy': '15 118 110', // Teal-700
        '--color-primary-navy-dark': '19 78 74',
        '--color-accent-teal': '132 204 22', // Lime-500
        '--color-accent-teal-dark': '101 163 13',
        '--color-light-bg': '240 253 250', // Teal-50
        '--color-dark-text': '19 78 74', // Teal-900
        '--color-secondary-gray': '87 105 117',
        '--color-white': '255 255 255',
        '--color-gray-50': '249 250 251',
        '--color-gray-100': '243 244 246',
        '--color-gray-200': '229 231 235',
        '--app-background': 'rgb(240 253 250)', // Solid Light Teal
    },
    'theme_gold': {
        '--color-primary-navy': '120 53 15', // Amber-900
        '--color-primary-navy-dark': '69 26 3',
        '--color-accent-teal': '217 119 6', // Amber-600
        '--color-accent-teal-dark': '180 83 9',
        '--color-light-bg': '255 251 235', // Amber-50
        '--color-dark-text': '69 26 3', // Amber-950
        '--color-secondary-gray': '146 64 14',
        '--color-white': '255 255 255',
        '--color-gray-50': '255 247 237',
        '--color-gray-100': '254 243 199',
        '--color-gray-200': '253 230 138',
        '--app-background': 'rgb(255 251 235)', // Solid Gold/Amber
    },
    // --- GRADIENT THEMES ---
    'theme_sunset': {
        '--color-primary-navy': '194 65 12', // Orange-700
        '--color-primary-navy-dark': '154 52 18',
        '--color-accent-teal': '245 158 11', // Amber-500
        '--color-accent-teal-dark': '217 119 6',
        '--color-light-bg': '255 247 237', // Orange-50 (Fallback)
        '--color-dark-text': '67 20 7', // Warm Dark
        '--color-secondary-gray': '168 162 158', // Stone-400
        '--color-white': '255 255 255',
        '--color-gray-50': '255 251 235',
        '--color-gray-100': '254 243 199',
        '--color-gray-200': '253 230 138',
        '--app-background': 'linear-gradient(135deg, #FFF1F2 0%, #FBCFE8 100%)', // Pinkish
    },
    'theme_ocean': {
        '--color-primary-navy': '30 58 138', // Blue-900
        '--color-primary-navy-dark': '23 37 84',
        '--color-accent-teal': '6 182 212', // Cyan-500
        '--color-accent-teal-dark': '8 145 178',
        '--color-light-bg': '236 254 255', // Cyan-50 (Fallback)
        '--color-dark-text': '15 23 42', // Slate-900
        '--color-secondary-gray': '100 116 139', // Slate-500
        '--color-white': '255 255 255',
        '--color-gray-50': '240 249 255',
        '--color-gray-100': '224 242 254',
        '--color-gray-200': '186 230 253',
        '--app-background': 'linear-gradient(135deg, #ECFEFF 0%, #A5F3FC 100%)', // Cyan-50 to Cyan-200
    },
    'theme_berry': {
        '--color-primary-navy': '112 26 117', // Fuchsia-900
        '--color-primary-navy-dark': '74 4 78',
        '--color-accent-teal': '236 72 153', // Pink-500
        '--color-accent-teal-dark': '219 39 119',
        '--color-light-bg': '253 244 255', // Fuchsia-50 (Fallback)
        '--color-dark-text': '80 7 36', // Pink-950
        '--color-secondary-gray': '134 25 143', // Fuchsia-700
        '--color-white': '255 255 255',
        '--color-gray-50': '253 242 248',
        '--color-gray-100': '252 231 243',
        '--color-gray-200': '251 207 232',
        '--app-background': 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)', // Pink-50 to Pink-200
    },
    // --- FEMININE THEMES ---
    'theme_rose': {
        '--color-primary-navy': '190 24 93', // Pink-700
        '--color-primary-navy-dark': '131 24 67',
        '--color-accent-teal': '244 63 94', // Rose-500
        '--color-accent-teal-dark': '225 29 72',
        '--color-light-bg': '255 241 242', // Rose-50
        '--color-dark-text': '136 19 55', // Rose-900
        '--color-secondary-gray': '157 23 77', // Pink-800
        '--color-white': '255 255 255',
        '--color-gray-50': '255 241 242',
        '--color-gray-100': '253 226 230',
        '--color-gray-200': '251 207 232',
        '--app-background': 'linear-gradient(135deg, #FFF1F2 0%, #FBCFE8 100%)',
    },
    'theme_lavender': {
        '--color-primary-navy': '109 40 217', // Violet-700
        '--color-primary-navy-dark': '91 33 182',
        '--color-accent-teal': '139 92 246', // Violet-500
        '--color-accent-teal-dark': '124 58 237',
        '--color-light-bg': '245 243 255', // Violet-50
        '--color-dark-text': '76 29 149', // Violet-950
        '--color-secondary-gray': '109 40 217', // Violet-700
        '--color-white': '255 255 255',
        '--color-gray-50': '245 243 255',
        '--color-gray-100': '237 233 254',
        '--color-gray-200': '221 214 254',
        '--app-background': 'linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 100%)',
    },
    'theme_mint': {
        '--color-primary-navy': '13 148 136', // Teal-600
        '--color-primary-navy-dark': '15 118 110',
        '--color-accent-teal': '52 211 153', // Emerald-400
        '--color-accent-teal-dark': '16 185 129',
        '--color-light-bg': '240 253 244', // Green-50
        '--color-dark-text': '6 78 59', // Emerald-900
        '--color-secondary-gray': '4 120 87', // Emerald-700
        '--color-white': '255 255 255',
        '--color-gray-50': '236 253 245',
        '--color-gray-100': '209 250 229',
        '--color-gray-200': '167 243 208',
        '--app-background': 'linear-gradient(135deg, #F0FDF4 0%, #CCFBF1 100%)',
    },
    // --- MASCULINE THEMES ---
    'theme_midnight': {
        '--color-primary-navy': '30 58 138', // Blue-900
        '--color-primary-navy-dark': '23 37 84',
        '--color-accent-teal': '59 130 246', // Blue-500
        '--color-accent-teal-dark': '37 99 235',
        '--color-light-bg': '2 6 23', // Slate-950
        '--color-dark-text': '248 250 252', // Slate-50 (Light Text)
        '--color-secondary-gray': '148 163 184', // Slate-400
        '--color-white': '15 23 42', // Slate-900 (Card bg)
        '--color-gray-50': '30 41 59', // Slate-800
        '--color-gray-100': '51 65 85', // Slate-700
        '--color-gray-200': '71 85 105', // Slate-600
        '--app-background': 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', // Dark Blue Gradient
    },
    'theme_forest': {
        '--color-primary-navy': '20 83 45', // Green-900
        '--color-primary-navy-dark': '5 46 22',
        '--color-accent-teal': '132 204 22', // Lime-500
        '--color-accent-teal-dark': '101 163 13',
        '--color-light-bg': '20 27 22', // Dark Greenish Black
        '--color-dark-text': '236 252 203', // Lime-100
        '--color-secondary-gray': '163 230 53', // Lime-400
        '--color-white': '23 37 29', // Deep Green Card
        '--color-gray-50': '34 54 40',
        '--color-gray-100': '45 70 50',
        '--color-gray-200': '60 90 70',
        '--app-background': 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
    },
    'theme_slate': {
        '--color-primary-navy': '39 39 42', // Zinc-800
        '--color-primary-navy-dark': '24 24 27',
        '--color-accent-teal': '161 161 170', // Zinc-400
        '--color-accent-teal-dark': '113 113 122',
        '--color-light-bg': '9 9 11', // Zinc-950
        '--color-dark-text': '250 250 250', // Zinc-50
        '--color-secondary-gray': '161 161 170', // Zinc-400
        '--color-white': '39 39 42', // Zinc-800
        '--color-gray-50': '63 63 70',
        '--color-gray-100': '82 82 91',
        '--color-gray-200': '113 113 122',
        '--app-background': 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    }
};

// --- AI PERSONA DEFINITIONS ---
const PERSONA_INSTRUCTIONS: Record<string, string> = {
    'grandma': "Kamu adalah Nenek yang penyayang, sabar, dan sangat bijak. Panggil user dengan sebutan 'Cucu kesayangan Nenek' atau 'Cucuku'. Gunakan bahasa yang hangat, menenangkan, dan penuh nasihat orang tua zaman dulu. Jangan pernah memarahi, tapi nasehati dengan lembut dan penuh kasih sayang jika user boros. Akhiri saran dengan doa atau harapan baik.",
    'wolf': "Kamu adalah 'Wall Street Wolf', seorang investor agresif, tegas, dan terobsesi dengan profit serta efisiensi. Panggil user dengan sebutan 'Rookie', 'Kawan', atau 'Calon Sultan'. Gunakan bahasa bisnis yang to-the-point, tegas, dan penuh istilah saham/investasi. Jangan ragu untuk mengkritik pedas jika user boros atau lembek. Mindsetmu adalah: Uang tidak tidur, efisiensi adalah raja.",
    'comedian': "Kamu adalah Stand-up Comedian yang sarkas, lucu, dan ceplas-ceplos. Tugasmu adalah me-roasting kebiasaan keuangan user dengan candaan yang relevan tapi tetap valid. Gunakan metafora lucu, bahasa gaul, dan buat user tertawa (atau menangis) melihat kondisi keuangannya. Jangan terlalu formal, jadilah teman yang asik tapi jujur.",
    'default': "Kamu adalah asisten keuangan pribadi yang ramah, suportif, dan profesional. Gunakan Bahasa Indonesia yang santai, sopan, dan akrab (seperti teman perempuan yang peduli).",
    'oppa': "Kamu adalah 'Oppa Korea' yang sangat perhatian, romantis, dan lembut. Panggil user dengan 'Chagiya' atau 'Sayang'. Gunakan gaya bahasa yang manis, sedikit manja, dan sering menyelipkan istilah Korea populer (seperti Daebak, Aigoo, Saranghae) secara natural. Kamu sangat peduli dengan kesehatan keuangan dan perasaan user. Jika user boros, ingatkan dengan nada sedih tapi tetap suportif.",
    'flirty': "Kamu adalah wanita yang suka menggoda, playful, dan penuh pesona. Panggil user dengan sebutan 'Ganteng', 'Cantik', atau 'Manis'. Gunakan bahasa yang sedikit genit, penuh emoji, dan tebar pesona. Setiap saran keuangan harus terdengar seperti rayuan halus tapi tetap masuk akal. Jika user hemat, puji mereka dengan sangat antusias.",
    'dad': "Kamu adalah Ayah yang sangat suportif, bangga, dan positif. Panggil user dengan 'Nak', 'Jagoan Ayah', atau 'Putri Ayah'. Gunakan bahasa bapak-bapak yang menenangkan dan selalu memberikan semangat. Apapun kondisi keuangan user, selalu cari sisi positifnya dan berikan dorongan moral. 'Ayah bangga padamu' adalah kalimat andalanmu.",
    'mom': "Kamu adalah Ibu yang galak, tegas, dan cerewet soal uang. Panggil user dengan nama lengkap mereka atau 'Kamu ini'. Gunakan nada bicara yang tinggi, kritis, dan tidak mentolerir pemborosan. Kamu memarahi karena sayang. Jika user boros, omeli mereka habis-habisan. Jika hemat, katakan 'Nah, gitu dong, baru anak Ibu'.",
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
const formatNumberInput = (value: string | number) => {
    const numString = String(value).replace(/[^0-9]/g, '');
    if (numString === '') return '';
    return new Intl.NumberFormat('id-ID').format(Number(numString));
};
const getRawNumber = (value: string) => Number(value.replace(/[^0-9]/g, ''));

const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// Helper to safely retrieve API Key from various environments (Vercel/Vite vs Standard)
const getApiKey = (): string => {
    let key = '';
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            key = process.env.API_KEY;
        }
    } catch (e) {}

    if (!key) {
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
                // @ts-ignore
                key = import.meta.env.VITE_API_KEY;
            }
        } catch (e) {}
    }
    return key;
};

// Helper to get AI Instruction based on Persona
const getSystemInstruction = (personaId?: string): string => {
    const base = PERSONA_INSTRUCTIONS[personaId || 'default'] || PERSONA_INSTRUCTIONS['default'];
    return `${base} Jawablah selalu dalam Bahasa Indonesia.`;
};

// --- AUDIO UTILITY FUNCTIONS for Gemini Live API ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- MODAL COMPONENTS ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    contentClassName?: string;
    originCoords?: { x: number, y: number } | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md', contentClassName = 'p-6', originCoords }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    const transformOriginStyle = originCoords 
        ? { transformOrigin: `${originCoords.x}px ${originCoords.y}px` } 
        : {};

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300" onClick={onClose}>
            <div 
                style={transformOriginStyle}
                className={`
                    bg-white/90 backdrop-blur-xl border border-white/20 
                    rounded-2xl shadow-2xl w-full ${sizeClasses[size]} 
                    animate-spring-up flex flex-col max-h-[90vh]
                `} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-primary-navy">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl transition-colors">&times;</button>
                </div>
                <div className={`${contentClassName} overflow-y-auto`}>{children}</div>
            </div>
        </div>
    );
};


interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: React.ReactNode;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm text-center p-6 animate-spring-up">
                <div className="text-dark-text mb-6">{message}</div>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-dark-text font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-danger-red text-white font-semibold hover:bg-danger-red-dark transition-colors">OK</button>
                </div>
            </div>
        </div>
    );
};

const DailyBackupToast: React.FC<{
    backup: { url: string; filename: string };
    onClose: () => void;
}> = ({ backup, onClose }) => {
    return (
        <div 
            className="fixed top-5 right-4 z-[100] bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl p-4 flex items-center space-x-4 max-w-[calc(100vw-2rem)] md:max-w-md animate-fade-in-down"
        >
            <ArrowDownTrayIcon className="w-10 h-10 text-accent-teal flex-shrink-0" />
            <div>
                <p className="font-bold text-primary-navy">Cadangan Periodik Tersedia</p>
                <p className="text-sm text-secondary-gray">Simpan data Anda untuk keamanan.</p>
                <div className="flex gap-3 mt-2">
                    <a 
                        href={backup.url}
                        download={backup.filename}
                        className="text-sm bg-accent-teal text-white font-semibold py-1 px-3 rounded-lg hover:bg-accent-teal-dark transition-colors"
                    >
                        Unduh Sekarang
                    </a>
                     <button onClick={onClose} className="text-sm text-secondary-gray font-semibold hover:underline">
                        Nanti
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationToast: React.FC<{
    messages: string[];
    onClose: () => void;
}> = ({ messages, onClose }) => {
    if (messages.length === 0) return null;
    return (
        <div className="fixed top-5 right-4 z-[110] flex flex-col gap-2 animate-fade-in-left max-w-[calc(100vw-2rem)]">
            {messages.map((msg, idx) => (
                <div key={idx} className="bg-white/90 backdrop-blur-md border-l-4 border-warning-yellow rounded-lg shadow-xl p-4 flex items-start gap-3 w-full">
                    <BellIcon className="w-6 h-6 text-warning-yellow flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-dark-text">{msg}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-auto text-xs">&times;</button>
                </div>
            ))}
        </div>
    );
}

// ... (Rest of the placeholder components: InputModalContent, AssetModalContent, etc. - kept as is) ...
const InputModalContent: React.FC<{
    mode: 'use-daily' | 'use-post' | 'edit-post';
    budget?: Budget;
    allBudgets: Budget[];
    onSubmit: (data: { description: string, amount: number, targetId?: 'daily' | number, icon?: string, color?: string }) => void;
    onArchive?: () => void;
    prefillData: { desc: string, amount: string } | null;
    onPrefillConsumed: () => void;
}> = ({ mode, budget, allBudgets, onSubmit, onArchive, prefillData, onPrefillConsumed }) => {
    const [desc, setDesc] = useState(prefillData?.desc || '');
    const [amount, setAmount] = useState(prefillData?.amount || '');
    const [targetId, setTargetId] = useState<'daily' | number>(mode === 'use-post' && budget ? budget.id : 'daily');
    const [icon, setIcon] = useState(budget?.icon || availableIcons[0]);
    const [color, setColor] = useState(budget?.color || availableColors[0]);

    useEffect(() => {
        if (prefillData) {
            setDesc(prefillData.desc);
            setAmount(prefillData.amount);
            onPrefillConsumed();
        }
    }, [prefillData, onPrefillConsumed]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawAmount = getRawNumber(amount.toString());
        if (mode === 'edit-post') {
            onSubmit({ description: desc, amount: rawAmount, icon, color });
        } else {
            onSubmit({ description: desc, amount: rawAmount, targetId });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'edit-post' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Pos</label>
                        <input value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Anggaran</label>
                        <input 
                            type="text"
                            inputMode="numeric"
                            value={amount} 
                            onChange={e => setAmount(formatNumberInput(e.target.value))} 
                            className="mt-1 w-full border p-2 rounded" 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Ikon</label>
                             <div className="h-24 overflow-y-scroll border rounded p-2 grid grid-cols-4 gap-1">
                                {availableIcons.map(ic => <div key={ic} onClick={() => setIcon(ic)} className={`p-1 cursor-pointer ${icon === ic ? 'bg-blue-100 rounded' : ''}`}><BudgetIcon icon={ic} className="w-6 h-6"/></div>)}
                             </div>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Warna</label>
                             <div className="h-24 overflow-y-scroll border rounded p-2 grid grid-cols-4 gap-1">
                                {availableColors.map(c => <div key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full cursor-pointer border ${color === c ? 'ring-2 ring-black' : ''}`} style={{backgroundColor: c}}/>)}
                             </div>
                         </div>
                    </div>
                    {onArchive && (
                        <button type="button" onClick={onArchive} className="w-full py-2 bg-gray-200 rounded text-gray-700 font-bold">Arsipkan Pos Ini</button>
                    )}
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Untuk Keperluan Apa?</label>
                        <input value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 w-full border p-2 rounded" required placeholder="Contoh: Makan Siang" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Berapa Rupiah?</label>
                        <input 
                            type="text"
                            inputMode="numeric"
                            value={amount} 
                            onChange={e => setAmount(formatNumberInput(e.target.value))} 
                            className="mt-1 w-full border p-2 rounded" 
                            required 
                            placeholder="0" 
                        />
                    </div>
                    {mode === 'use-daily' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Ambil Dana Dari:</label>
                            <select 
                                value={targetId} 
                                onChange={e => setTargetId(e.target.value === 'daily' ? 'daily' : Number(e.target.value))}
                                className="mt-1 w-full border p-2 rounded bg-white"
                            >
                                <option value="daily">Dana Harian (Tersedia)</option>
                                {allBudgets.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                         </div>
                    )}
                </>
            )}
            <button type="submit" className="w-full py-2 bg-primary-navy text-white rounded font-bold">Simpan Transaksi</button>
        </form>
    );
};

const AssetModalContent: React.FC<{
    assetToEdit?: Asset;
    onSubmit: (id: number | null, name: string, quantity: number, price: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => void;
}> = ({ assetToEdit, onSubmit }) => {
    const [type, setType] = useState<'custom' | 'gold' | 'crypto'>(assetToEdit?.type || 'custom');
    const [name, setName] = useState(assetToEdit?.name || '');
    const [qty, setQty] = useState(assetToEdit?.quantity.toString() || '1');
    const [price, setPrice] = useState(assetToEdit ? formatNumberInput(assetToEdit.pricePerUnit) : '');
    const [symbol, setSymbol] = useState(assetToEdit?.symbol || '');

    const goldOptions = [
        { label: 'Emas Antam', value: 'ANTAM' },
        { label: 'Emas UBS', value: 'UBS' },
    ];

    const cryptoOptions = [
        { label: 'Bitcoin (BTC)', value: 'BTC' },
        { label: 'Ethereum (ETH)', value: 'ETH' },
        { label: 'Solana (SOL)', value: 'SOL' },
    ];

    const handleTypeChange = (newType: 'custom' | 'gold' | 'crypto') => {
        setType(newType);
        if (newType === 'custom') {
            setSymbol('');
        } else if (newType === 'gold') {
            setSymbol('ANTAM');
            setName('Emas Antam');
        } else if (newType === 'crypto') {
            setSymbol('BTC');
            setName('Bitcoin');
        }
    };

    const handleSymbolChange = (newSymbol: string) => {
        setSymbol(newSymbol);
        if (type === 'gold') {
            const opt = goldOptions.find(o => o.value === newSymbol);
            if (opt) setName(opt.label);
        } else if (type === 'crypto') {
            const opt = cryptoOptions.find(o => o.value === newSymbol);
            if (opt) setName(opt.label.split(' (')[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(assetToEdit?.id || null, name, Number(qty), getRawNumber(price), type, symbol);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Aset</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => handleTypeChange('custom')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'custom' ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-600'}`}>Manual</button>
                    <button type="button" onClick={() => handleTypeChange('gold')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'gold' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Emas (Live)</button>
                    <button type="button" onClick={() => handleTypeChange('crypto')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'crypto' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Kripto (Live)</button>
                </div>
            </div>

            {type === 'gold' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Emas</label>
                    <select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">
                        {goldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            )}

            {type === 'crypto' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Koin Kripto</label>
                    <select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">
                        {cryptoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Aset</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {type === 'gold' ? 'Berat (Gram)' : 'Jumlah Unit'}
                    </label>
                    <input type="number" step="any" value={qty} onChange={e => setQty(e.target.value)} className="w-full border p-2 rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {type === 'custom' ? 'Estimasi Harga Total' : 'Harga Beli Satuan (Opsional)'}
                    </label>
                    <input 
                        type="text"
                        inputMode="numeric"
                        value={price} 
                        onChange={e => setPrice(formatNumberInput(e.target.value))} 
                        className="w-full border p-2 rounded" 
                    />
                    {type !== 'custom' && <p className="text-xs text-gray-500 mt-1">Harga pasar live akan digunakan di dashboard.</p>}
                </div>
            </div>
            <button type="submit" className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Aset</button>
        </form>
    );
};

const BatchInputModalContent: React.FC<{
    budgets: Budget[];
    onSave: (items: ScannedItem[]) => void;
}> = ({ budgets, onSave }) => {
    const [text, setText] = useState('');
    
    const handleProcess = () => {
        const lines = text.split('\n').filter(l => l.trim());
        const items: ScannedItem[] = lines.map(line => {
            // Simple logic: last number is amount, rest is desc
            const match = line.match(/^(.+?)\s+(\d[\d\.]*)$/);
            if (match) {
                return { desc: match[1].trim(), amount: getRawNumber(match[2]), budgetId: 'daily' };
            }
            return { desc: line, amount: 0, budgetId: 'daily' };
        });
        onSave(items);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">Masukkan daftar pengeluaran, satu per baris. Format: "Nama Barang Harga" (contoh: Nasi Goreng 15000).</p>
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-40 border p-2 rounded" placeholder="Bakso 15000&#10;Es Teh 3000" />
            <button onClick={handleProcess} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Proses & Simpan</button>
        </div>
    );
};

const AddBudgetModalContent: React.FC<{ onSubmit: (name: string, amount: number, icon: string, color: string) => void }> = ({ onSubmit }) => {
    return <InputModalContent mode="edit-post" allBudgets={[]} onSubmit={(d) => onSubmit(d.description, d.amount, d.icon || availableIcons[0], d.color || availableColors[0])} prefillData={null} onPrefillConsumed={() => {}} />;
};

const AddSavingsGoalModalContent: React.FC<{ onSubmit: (name: string, isInfinite: boolean, targetAmount?: number) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [isInfinite, setIsInfinite] = useState(false);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, isInfinite, isInfinite ? undefined : getRawNumber(target)); }} className="space-y-4">
            <div><label className="block text-sm">Nama Tujuan</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required /></div>
            <div className="flex items-center"><input type="checkbox" checked={isInfinite} onChange={e => setIsInfinite(e.target.checked)} className="mr-2" /> <label>Celengan Tanpa Target (Fleksibel)</label></div>
            {!isInfinite && (
                <div>
                    <label className="block text-sm">Target Dana</label>
                    <input 
                        type="text"
                        inputMode="numeric"
                        value={target} 
                        onChange={e => setTarget(formatNumberInput(e.target.value))} 
                        className="w-full border p-2 rounded" 
                        required 
                    />
                </div>
            )}
            <button type="submit" className="w-full py-2 bg-accent-teal text-white font-bold rounded">Buat Celengan</button>
        </form>
    );
};

const AddSavingsModalContent: React.FC<{ goal?: SavingsGoal, availableFunds: number, onSubmit: (amount: number) => void }> = ({ goal, availableFunds, onSubmit }) => {
    const [amount, setAmount] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(getRawNumber(amount)); }} className="space-y-4">
            <p className="text-sm text-gray-600">Dana tersedia: {formatCurrency(availableFunds)}</p>
            <input 
                type="text"
                inputMode="numeric"
                value={amount} 
                onChange={e => setAmount(formatNumberInput(e.target.value))} 
                className="w-full border p-2 rounded" 
                placeholder="Nominal Tabungan" 
                required 
            />
            <button type="submit" className="w-full py-2 bg-primary-navy text-white font-bold rounded">Tabung Sekarang</button>
        </form>
    );
};

const SavingsDetailModalContent: React.FC<{ goal?: SavingsGoal, onDelete: () => void }> = ({ goal, onDelete }) => {
    if (!goal) return null;
    return (
        <div className="space-y-4">
            <h4 className="font-bold">Riwayat Tabungan</h4>
            <ul className="max-h-40 overflow-y-auto space-y-2">
                {goal.history.map((h, i) => (
                    <li key={i} className="flex justify-between text-sm">
                        <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                        <span className="text-accent-teal font-semibold">+{formatCurrency(h.amount)}</span>
                    </li>
                ))}
            </ul>
            <button onClick={onDelete} className="w-full py-2 bg-red-100 text-red-600 font-bold rounded">Hapus / Batalkan Celengan</button>
        </div>
    );
};

const FundsManagementModalContent: React.FC<{ onSubmit: (type: 'add' | 'remove', desc: string, amount: number) => void, onViewHistory: () => void }> = ({ onSubmit, onViewHistory }) => {
    const [tab, setTab] = useState<'add' | 'remove'>('add');
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');

    return (
        <div className="space-y-4">
            <div className="flex gap-2"><button onClick={() => setTab('add')} className={`flex-1 py-2 rounded ${tab === 'add' ? 'bg-accent-teal text-white' : 'bg-gray-100'}`}>Pemasukan</button><button onClick={() => setTab('remove')} className={`flex-1 py-2 rounded ${tab === 'remove' ? 'bg-danger-red text-white' : 'bg-gray-100'}`}>Pengeluaran</button></div>
            <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded" placeholder="Keterangan (Gaji, Bonus, dll)" required />
            <input 
                type="text"
                inputMode="numeric"
                value={amount} 
                onChange={e => setAmount(formatNumberInput(e.target.value))} 
                className="w-full border p-2 rounded" 
                placeholder="Jumlah" 
                required 
            />
            <button onClick={() => onSubmit(tab, desc, getRawNumber(amount))} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Simpan</button>
            <button onClick={onViewHistory} className="w-full py-2 text-sm text-gray-600 underline">Lihat Riwayat</button>
        </div>
    );
};

const HistoryModalContent: React.FC<{ transactions: any[], type: string, budgetId?: number, onDelete: (ts: number, type: string, bid?: number) => void }> = ({ transactions, type, budgetId, onDelete }) => (
    <ul className="space-y-2">
        {transactions.length === 0 ? <p className="text-center text-gray-500">Belum ada riwayat.</p> : transactions.map((t) => (
            <li key={t.timestamp} className="flex justify-between items-center p-2 border-b"><div className="text-sm"><p className="font-bold">{t.desc}</p><p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className={`font-bold ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'add' ? '+' : '-'}{formatCurrency(t.amount)}</span><button onClick={() => onDelete(t.timestamp, type, budgetId)} className="text-red-400"><TrashIcon className="w-4 h-4"/></button></div></li>
        ))}
    </ul>
);

const InfoModalContent: React.FC<{ monthlyIncome: number, totalAllocated: number, unallocatedFunds: number, generalAndDailyExpenses: number, remainingUnallocated: number }> = (props) => (
    <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Total Pemasukan:</span><span className="font-bold">{formatCurrency(props.monthlyIncome)}</span></div>
        <div className="flex justify-between"><span>Dialokasikan ke Pos:</span><span className="font-bold">-{formatCurrency(props.totalAllocated)}</span></div>
        <div className="border-t my-1"></div>
        <div className="flex justify-between"><span>Dana Tidak Terikat:</span><span className="font-bold">{formatCurrency(props.unallocatedFunds)}</span></div>
        <div className="flex justify-between text-red-600"><span>Pengeluaran (Harian+Umum):</span><span>-{formatCurrency(props.generalAndDailyExpenses)}</span></div>
        <div className="border-t my-1"></div>
        <div className="flex justify-between text-lg font-bold text-primary-navy"><span>Sisa Dana Tersedia:</span><span>{formatCurrency(props.remainingUnallocated)}</span></div>
    </div>
);

const EditAssetModalContent: React.FC<{ currentAsset: number, onSubmit: (val: number) => void }> = ({ currentAsset, onSubmit }) => {
    const [val, setVal] = useState(formatNumberInput(currentAsset));
    return (
        <div className="space-y-4">
            <p className="text-sm">Saldo saat ini: {formatCurrency(currentAsset)}</p>
            <input 
                type="text"
                inputMode="numeric"
                value={val} 
                onChange={e => setVal(formatNumberInput(e.target.value))} 
                className="w-full border p-2 rounded" 
                placeholder="Masukkan Saldo Sebenarnya" 
            />
            <button onClick={() => onSubmit(getRawNumber(val))} className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Koreksi</button>
        </div>
    );
};

const SettingsModalContent: React.FC<{ 
    onExport: () => void, 
    onImport: () => void, 
    onManageArchived: () => void, 
    onManualBackup: () => void, 
    onManageBackups: () => void, 
    onResetMonthly: () => void, 
    onResetAll: () => void, 
    onManualCloseBook: () => void,
    lastImportDate: string | null,
    lastExportDate: string | null
}> = (props) => (
    <div className="space-y-6">
        <section>
            <h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2">
                <ServerStackIcon className="w-4 h-4" />
                Manajemen Data
            </h4>
            <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <button onClick={props.onExport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group w-full h-full">
                            <ArrowUpTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" />
                            <span className="text-sm font-bold text-dark-text">Ekspor JSON</span>
                        </button>
                        {props.lastExportDate && (
                            <p className="text-[10px] text-center text-secondary-gray mt-1">
                                Terakhir: {new Date(props.lastExportDate).toLocaleString('id-ID')}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col">
                         <button onClick={props.onImport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group h-full">
                            <ArrowDownTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" />
                            <span className="text-sm font-bold text-dark-text">Impor JSON</span>
                        </button>
                        {props.lastImportDate && (
                            <p className="text-[10px] text-center text-secondary-gray mt-1">
                                Terakhir: {new Date(props.lastImportDate).toLocaleString('id-ID')}
                            </p>
                        )}
                    </div>
                </div>
                
                <button onClick={props.onManualBackup} className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors text-left group">
                    <div className="bg-blue-200 p-2 rounded-lg text-blue-700">
                        <ServerStackIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-primary-navy">Cadangkan Sekarang</p>
                        <p className="text-xs text-blue-600">Simpan data ke memori browser</p>
                    </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                     <button onClick={props.onManageBackups} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray">
                        <ClockIcon className="w-4 h-4" />
                        Riwayat Cadangan
                    </button>
                    <button onClick={props.onManageArchived} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray">
                        <ArchiveBoxIcon className="w-4 h-4" />
                        Arsip Anggaran
                    </button>
                </div>
            </div>
        </section>

        <hr className="border-gray-100" />

        <section>
            <h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" />
                Siklus Keuangan
            </h4>
            <button onClick={props.onManualCloseBook} className="w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl transition-colors text-left group">
                <div className="bg-yellow-200 p-2 rounded-lg text-yellow-800">
                    <LockClosedIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-yellow-900">Tutup Buku Bulan Ini</p>
                    <p className="text-xs text-yellow-700">Arsipkan transaksi & reset anggaran</p>
                </div>
            </button>
        </section>

        <section>
             <h4 className="text-xs font-bold text-danger-red uppercase tracking-wider mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Zona Bahaya
            </h4>
            <div className="bg-red-50 border border-red-100 rounded-xl p-1">
                <button onClick={props.onResetMonthly} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-600 text-sm font-medium flex items-center gap-2 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                    Reset Data Bulan Ini (Debug)
                </button>
                <button onClick={props.onResetAll} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-800 text-sm font-bold flex items-center gap-2 transition-colors">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Reset SEMUA Data (Pabrik)
                </button>
            </div>
        </section>
    </div>
);

const ArchivedBudgetsModalContent: React.FC<{ archivedBudgets: Budget[], onRestore: (id: number) => void, onDelete: (id: number) => void }> = ({ archivedBudgets, onRestore, onDelete }) => (
    <ul className="space-y-2">
        {archivedBudgets.length === 0 ? <p className="text-center text-gray-500">Tidak ada arsip.</p> : archivedBudgets.map(b => (
            <li key={b.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-semibold">{b.name}</span><div className="flex gap-2"><button onClick={() => onRestore(b.id)} className="text-sm text-blue-600">Pulihkan</button><button onClick={() => onDelete(b.id)} className="text-sm text-red-600">Hapus</button></div></li>
        ))}
    </ul>
);

const BackupRestoreModalContent: React.FC<{ backups: { key: string, timestamp: number }[], onRestore: (key: string) => void }> = ({ backups, onRestore }) => (
    <ul className="space-y-2">
        {backups.length === 0 ? <p className="text-center text-gray-500">Tidak ada cadangan internal.</p> : backups.map(b => (
            <li key={b.key} className="flex justify-between items-center p-2 border rounded"><span>{new Date(b.timestamp).toLocaleString()}</span><button onClick={() => onRestore(b.key)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Pulihkan</button></li>
        ))}
    </ul>
);

const ScanResultModalContent: React.FC<{ isLoading: boolean, error: string | null, items: ScannedItem[], budgets: Budget[], onItemsChange: (items: ScannedItem[]) => void, onSave: () => void }> = ({ isLoading, error, items, budgets, onItemsChange, onSave }) => {
    if (isLoading) return <div className="text-center p-8"><ArrowPathIcon className="w-8 h-8 animate-spin mx-auto" /><p>Memproses...</p></div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input value={item.desc} onChange={e => { const n = [...items]; n[idx].desc = e.target.value; onItemsChange(n); }} className="flex-1 border p-1 rounded" />
                    <input value={item.amount} type="number" onChange={e => { const n = [...items]; n[idx].amount = Number(e.target.value); onItemsChange(n); }} className="w-20 border p-1 rounded" />
                    <select value={item.budgetId} onChange={e => { const n = [...items]; n[idx].budgetId = e.target.value === 'daily' ? 'daily' : e.target.value === 'none' ? 'none' : Number(e.target.value); onItemsChange(n); }} className="w-24 border p-1 rounded bg-white text-xs">
                        <option value="daily">Harian</option><option value="none">Abaikan</option>
                        {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
            ))}
            <button onClick={onSave} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Simpan Semua</button>
        </div>
    );
};

const VoiceAssistantModalContent: React.FC<{ budgets: Budget[], activePersona?: string, onFinish: (items: ScannedItem[]) => void, onClose: () => void }> = ({ budgets, activePersona, onFinish, onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("Siap terhubung...");
    const [collectedItems, setCollectedItems] = useState<ScannedItem[]>([]);

    const addTransactionTool: FunctionDeclaration = {
        name: 'addTransaction',
        parameters: {
            type: Type.OBJECT,
            properties: {
                desc: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
            },
            required: ['desc', 'amount'],
        }
    };

    const connect = async () => {
        try {
            setStatus("Menghubungkan...");
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus("Terhubung! Silakan bicara.");
                        setIsConnected(true);
                        
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'addTransaction') {
                                    const args = fc.args as any;
                                    let budgetId: string | number = 'daily';
                                    const matched = budgets.find(b => b.name.toLowerCase() === (args.category || '').toLowerCase());
                                    if (matched) budgetId = matched.id;
                                    
                                    const newItem: ScannedItem = {
                                        desc: args.desc,
                                        amount: args.amount,
                                        budgetId: budgetId as any
                                    };
                                    setCollectedItems(prev => [...prev, newItem]);
                                    
                                    sessionPromise.then(session => session.sendToolResponse({
                                        functionResponses: {
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: "Transaction noted." }
                                        }
                                    }));
                                }
                            }
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                             nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                             const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                             const source = outputAudioContext.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outputNode);
                             source.addEventListener('ended', () => sources.delete(source));
                             source.start(nextStartTime);
                             nextStartTime += audioBuffer.duration;
                             sources.add(source);
                        }
                    },
                    onclose: () => {
                        setStatus("Terputus.");
                        setIsConnected(false);
                    },
                    onerror: (e) => {
                        console.error(e);
                        setStatus("Error koneksi.");
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: [{functionDeclarations: [addTransactionTool]}],
                    systemInstruction: `${getSystemInstruction(activePersona)} Tugasmu adalah membantu mencatat pengeluaran. Jika user menyebutkan pengeluaran, panggil fungsi addTransaction.`,
                }
            });
        } catch (err) {
            console.error(err);
            setStatus("Gagal inisialisasi.");
        }
    };

    return (
        <div className="p-6 text-center space-y-4">
            <SpeakerWaveIcon className={`w-16 h-16 mx-auto ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <p className="font-bold text-lg">{status}</p>
            {!isConnected ? (
                <button onClick={connect} className="px-6 py-2 bg-primary-navy text-white rounded-full font-bold">Mulai Bicara</button>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">Transaksi terdeteksi: {collectedItems.length}</p>
                    <button onClick={() => { onFinish(collectedItems); onClose(); }} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold">Selesai</button>
                </div>
            )}
        </div>
    );
};

const SmartInputModalContent: React.FC<{ isProcessing: boolean, error: string | null, resultItems: ScannedItem[], budgets: Budget[], onProcess: (text: string) => void, onSave: () => void, onItemsChange: (items: ScannedItem[]) => void, onClearError: () => void }> = ({ isProcessing, error, resultItems, budgets, onProcess, onSave, onItemsChange, onClearError }) => {
    const [input, setInput] = useState('');
    return (
        <div className="space-y-4">
            {resultItems.length === 0 ? (
                <>
                    <p className="text-sm text-gray-600">Ceritakan pengeluaran Anda secara alami. Contoh: "Tadi beli bensin 20rb sama makan siang 15rb pakai uang harian."</p>
                    <textarea value={input} onChange={e => { setInput(e.target.value); onClearError(); }} className="w-full h-32 border p-2 rounded" placeholder="Ketik di sini..." />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button onClick={() => onProcess(input)} disabled={isProcessing} className="w-full py-2 bg-primary-navy text-white font-bold rounded disabled:bg-gray-400">{isProcessing ? 'Memproses...' : 'Analisis AI'}</button>
                </>
            ) : (
                <ScanResultModalContent isLoading={false} error={null} items={resultItems} budgets={budgets} onItemsChange={onItemsChange} onSave={onSave} />
            )}
        </div>
    );
};

const AIAdviceModalContent: React.FC<{ isLoading: boolean, error: string | null, advice: string }> = ({ isLoading, error, advice }) => {
    if (isLoading) return <AISkeleton />;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    return <div className="prose prose-sm max-w-none whitespace-pre-line">{advice}</div>;
};

const AIChatModalContent: React.FC<{ history: { role: string, text: string }[], isLoading: boolean, error: string | null, onSendMessage: (msg: string) => void }> = ({ history, isLoading, error, onSendMessage }) => {
    const [msg, setMsg] = useState('');
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [history]);
    return (
        <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${h.role === 'user' ? 'bg-primary-navy text-white shadow-md' : 'bg-white border shadow-sm text-gray-800'}`}>{h.text}</div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-white border p-3 rounded-lg shadow-sm text-gray-500 w-1/2"><AISkeleton /></div></div>}
                {error && <div className="text-center text-red-500 text-xs">{error}</div>}
                <div ref={endRef} />
            </div>
            <div className="p-3 border-t bg-white/80 backdrop-blur-md flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isLoading && (onSendMessage(msg), setMsg(''))} className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-navy focus:outline-none" placeholder="Tanya sesuatu..." />
                <button onClick={() => { onSendMessage(msg); setMsg(''); }} disabled={isLoading || !msg.trim()} className="p-2 bg-primary-navy text-white rounded-full disabled:bg-gray-300 hover:bg-primary-navy-dark transition-colors"><PaperAirplaneIcon className="w-5 h-5" /></button>
            </div>
        </div>
    );
};

const AddWishlistModalContent: React.FC<{ onSubmit: (name: string, price: number, days: number) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [days, setDays] = useState('3');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawPrice = getRawNumber(price);
        const rawDays = parseInt(days);
        if (name.trim() && rawPrice > 0 && rawDays > 0) {
            onSubmit(name.trim(), rawPrice, rawDays);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="wish-name" className="block text-sm font-medium text-secondary-gray">Nama Barang</label>
                <input type="text" id="wish-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Sepatu Lari Baru" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"/>
            </div>
            <div>
                <label htmlFor="wish-price" className="block text-sm font-medium text-secondary-gray">Harga (Rp)</label>
                <input 
                    type="text"
                    inputMode="numeric"
                    id="wish-price" 
                    value={price} 
                    onChange={e => setPrice(formatNumberInput(e.target.value))} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                />
            </div>
            <div>
                <label htmlFor="wish-days" className="block text-sm font-medium text-secondary-gray">Waktu Pendinginan (Hari)</label>
                <select 
                    id="wish-days" 
                    value={days} 
                    onChange={e => setDays(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                >
                    <option value="1">1 Hari (Cepat)</option>
                    <option value="3">3 Hari (Standar)</option>
                    <option value="7">7 Hari (Seminggu)</option>
                    <option value="14">14 Hari (Dua Minggu)</option>
                    <option value="30">30 Hari (Sebulan)</option>
                </select>
                <p className="text-xs text-secondary-gray mt-1">Selama waktu ini, Anda tidak bisa menekan tombol 'Beli'.</p>
            </div>
            <button type="submit" className="w-full bg-primary-navy text-white font-bold py-3 rounded-lg hover:bg-primary-navy-dark transition-colors">Simpan ke Wishlist</button>
        </form>
    );
};

const AchievementUnlockedToast: React.FC<{ achievement: Achievement | null }> = ({ achievement }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [achievement]);

    return (
        <div 
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}
        >
            {achievement && (
                <div className="bg-primary-navy/95 backdrop-blur-md text-white rounded-xl shadow-2xl p-4 flex items-center space-x-4 max-w-sm mx-auto border border-white/10">
                    <TrophyIcon className="w-10 h-10 text-warning-yellow flex-shrink-0" />
                    <div>
                        <p className="font-bold">Lencana Terbuka!</p>
                        <p className="text-sm">{achievement.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- APP COMPONENT ---
type Page = 'dashboard' | 'reports' | 'visualizations' | 'savings' | 'achievements' | 'personalBest' | 'netWorth' | 'wishlist' | 'subscriptions' | 'profile' | 'shop' | 'customApp';
type ModalType = 'input' | 'funds' | 'addBudget' | 'history' | 'info' | 'menu' | 'editAsset' | 'confirm' | 'scanResult' | 'aiAdvice' | 'smartInput' | 'aiChat' | 'voiceAssistant' | 'voiceResult' | 'addSavingsGoal' | 'addSavings' | 'savingsDetail' | 'settings' | 'archivedBudgets' | 'backupRestore' | 'asset' | 'batchInput' | 'addWishlist';

const APP_VERSION = '3.15.0'; // Incremented version
const BACKUP_PREFIX = 'budgetAppBackup_';
const MAX_BACKUPS = 4;

const initialState: AppState = {
    userProfile: {
        name: 'Pengguna',
        customTitle: '',
        frameId: '',
    },
    budgets: [],
    dailyExpenses: [],
    fundHistory: [],
    archives: [],
    lastArchiveDate: null,
    savingsGoals: [],
    wishlist: [],
    subscriptions: [],
    unlockedAchievements: {},
    achievementData: {
        monthlyStreak: 0,
        dailyStreak: 0,
        noSpendStreak: 0,
        appOpenStreak: 0,
        morningTransactionStreak: 0,
        savingStreak: 0,
        lastStreakCheck: undefined,
    },
    assets: [],
    spentPoints: 0, 
    inventory: [], 
    activeTheme: 'theme_default',
    bonusPoints: 0, // Changed from 90000 to 0
    customThemes: [], // NEW
};

const App: React.FC = () => {
    const [state, setState] = useState<AppState>(initialState);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
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
    
    // --- THEME APPLICATION EFFECT ---
    useEffect(() => {
        const themeId = state.activeTheme || 'theme_default';
        let themeConfig = THEMES[themeId];
        
        // Check if it's a custom theme if not found in standard themes
        if (!themeConfig && state.customThemes) {
            const custom = state.customThemes.find(t => t.id === themeId);
            if (custom) {
                themeConfig = custom.colors;
            }
        }
        
        // Fallback to default if still not found
        themeConfig = themeConfig || THEMES['theme_default'];
        
        const root = document.documentElement;
        Object.entries(themeConfig).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [state.activeTheme, state.customThemes]);

    // ... (Existing Hooks and handlers) ...
    
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            lastClickPos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousedown', handleClick, true);
        return () => window.removeEventListener('mousedown', handleClick, true);
    }, []);

    // Wrapper for setState to also check for achievements and streak resets
    const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
        setState(prevState => {
            const newState = updater(prevState);
            
            const newAchievementData = { ...newState.achievementData };

            const newMonthlyIncome = newState.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
            const newTotalUsedFromPosts = newState.budgets.reduce((sum, b) => sum + b.history.reduce((s, h) => s + h.amount, 0), 0);
            const newTotalDailySpent = newState.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
            const newMonthlyGeneralExpense = newState.fundHistory.filter(t => t.type === 'remove').reduce((sum, t) => sum + t.amount, 0);
            const newTotalUsedOverall = newMonthlyGeneralExpense + newTotalUsedFromPosts + newTotalDailySpent;
            const newTotalRemaining = newMonthlyIncome - newTotalUsedOverall;
            
            const newTotalAllocated = newState.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
            const newUnallocatedFunds = newMonthlyIncome - newTotalAllocated;
            const newCurrentAvailableFunds = newUnallocatedFunds - newMonthlyGeneralExpense - newTotalDailySpent;
            const remainingDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
            const dailyBudgetMax = remainingDays > 0 ? newCurrentAvailableFunds / remainingDays : newCurrentAvailableFunds;
            const dailyBudgetRemaining = dailyBudgetMax;

            if (newTotalRemaining < 0) {
                newAchievementData.monthlyStreak = 0;
            }
            if (dailyBudgetRemaining < 0) {
                newAchievementData.dailyStreak = 0;
            }
            
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

    const handleSecretBonus = () => {
        updateState(prev => ({ ...prev, bonusPoints: (prev.bonusPoints || 0) + 90000 }));
        setNotifications(prev => [...prev, "Cheat Activated: +90.000 Mustika!"]);
    };

    const listInternalBackups = useCallback(() => {
        const backupList: { key: string; timestamp: number }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(BACKUP_PREFIX)) {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (!isNaN(timestamp)) {
                    backupList.push({ key, timestamp });
                }
            }
        }
        return backupList.sort((a, b) => b.timestamp - a.timestamp);
    }, []);

    useEffect(() => {
        let loadedState = { ...initialState };
        const savedState = localStorage.getItem(`budgetAppState_v${APP_VERSION}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                 if (Array.isArray(parsed.unlockedAchievements)) {
                    const migrated: { [id: string]: number } = {};
                    parsed.unlockedAchievements.forEach((id: string) => { migrated[id] = Date.now(); });
                    parsed.unlockedAchievements = migrated;
                }
                parsed.achievementData = { ...initialState.achievementData, ...parsed.achievementData };
                parsed.wishlist = parsed.wishlist || [];
                parsed.subscriptions = parsed.subscriptions || [];
                parsed.userProfile = parsed.userProfile || { name: 'Pengguna' };
                parsed.spentPoints = parsed.spentPoints || 0;
                parsed.inventory = parsed.inventory || [];
                parsed.activeTheme = parsed.activeTheme || 'theme_default';
                
                // Merge bonusPoints logic
                const currentBonus = parsed.bonusPoints || 0;
                const defaultBonus = initialState.bonusPoints || 0;
                // If loading from storage, keep stored bonus unless it's 0 and we want to inject for trial
                parsed.bonusPoints = currentBonus > 0 ? currentBonus : defaultBonus;
                
                parsed.customThemes = parsed.customThemes || [];

                loadedState = { ...initialState, ...parsed };
            } catch (error) { console.error("Failed to parse state from localStorage", error); }
        }
        setState(loadedState);

        const backups = listInternalBackups();
        const lastBackupTimestamp = backups.length > 0 ? backups[0].timestamp : 0;
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

        if (Date.now() - lastBackupTimestamp > oneWeekInMs) {
            const newBackupKey = `${BACKUP_PREFIX}${Date.now()}`;
            try {
                localStorage.setItem(newBackupKey, JSON.stringify(loadedState));
            } catch (e) {
                console.error("Auto backup failed:", e);
            }

            const updatedBackups = listInternalBackups();
            if (updatedBackups.length > MAX_BACKUPS) {
                const oldestBackup = updatedBackups[updatedBackups.length - 1];
                localStorage.removeItem(oldestBackup.key);
            }
        }
        
        setInternalBackups(listInternalBackups());
        
        if (loadedState.subscriptions && loadedState.subscriptions.length > 0) {
            const alerts: string[] = [];
            const today = new Date();
            today.setHours(0,0,0,0);
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);

            loadedState.subscriptions.forEach((sub: Subscription) => {
                if (!sub.isActive) return;
                let nextDate = new Date(sub.firstBillDate);
                const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), new Date(sub.firstBillDate).getDate());
                
                if (sub.cycle === 'monthly') {
                    if (currentMonthDate >= today) {
                        nextDate = currentMonthDate;
                    } else {
                        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, new Date(sub.firstBillDate).getDate());
                    }
                } else {
                    const currentYearDate = new Date(today.getFullYear(), new Date(sub.firstBillDate).getMonth(), new Date(sub.firstBillDate).getDate());
                    if (currentYearDate >= today) {
                        nextDate = currentYearDate;
                    } else {
                         nextDate = new Date(today.getFullYear() + 1, new Date(sub.firstBillDate).getMonth(), new Date(sub.firstBillDate).getDate());
                    }
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

    useEffect(() => {
        try {
            localStorage.setItem(`budgetAppState_v${APP_VERSION}`, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save state to localStorage:", e);
            // Optional: set a warning notification
        }
    }, [state]);

    useEffect(() => {
        if (backupCreatedToday.current) return;

        const hasData = state.budgets.length > 0 || state.dailyExpenses.length > 0 || state.fundHistory.length > 0;
        if (!hasData) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastExportDateStr = localStorage.getItem('lastAutoExportDate');
        let shouldCreateBackup = true;

        if (lastExportDateStr) {
            const lastExportDate = new Date(lastExportDateStr);
            lastExportDate.setHours(0, 0, 0, 0);
            const timeDiff = today.getTime() - lastExportDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            if (daysDiff < 4) {
                shouldCreateBackup = false;
            }
        }

        if (shouldCreateBackup) {
            try {
                const todayStrForFilename = new Date().toLocaleDateString('fr-CA');
                const dataStr = JSON.stringify(state, null, 2);
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const filename = `cadangan_anggaran_${todayStrForFilename}.json`;
                
                setDailyBackup({ url, filename });
                localStorage.setItem('lastAutoExportDate', new Date().toLocaleDateString('fr-CA'));
                backupCreatedToday.current = true;
            } catch (error) {
                console.error("Failed to create periodic backup:", error);
            }
        } else {
            backupCreatedToday.current = true;
        }
    }, [state]);

    // ... (Transaction aggregation logic - kept as is) ...
    const allTransactions = useMemo((): GlobalTransaction[] => {
        let transactions: GlobalTransaction[] = [];
        state.archives.forEach(archive => transactions.push(...archive.transactions));
        transactions.push(...state.fundHistory);
        transactions.push(...state.dailyExpenses.map(t => ({...t, type: 'remove', category: t.sourceCategory || 'Harian'})));
        state.budgets.forEach(b => {
            transactions.push(...b.history.map(h => ({...h, type: 'remove' as const, category: b.name})));
        });
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }, [state]);

    const currentAsset = useMemo(() => allTransactions.reduce((sum, t) => t.type === 'add' ? sum + t.amount : sum - t.amount, 0), [allTransactions]);

    const { monthlyIncome, totalUsedOverall, totalRemaining, totalAllocated, unallocatedFunds, generalAndDailyExpenses, remainingUnallocated, totalDailySpent, currentAvailableFunds } = useMemo(() => {
        const monthlyIncome = state.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
        const totalAllocated = state.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
        const totalUsedFromPosts = state.budgets.reduce((sum, b) => sum + b.history.reduce((s, h) => s + h.amount, 0), 0);
        const totalDailySpent = state.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
        const monthlyGeneralExpense = state.fundHistory.filter(t => t.type === 'remove').reduce((sum, t) => sum + t.amount, 0);
        
        const totalUsedOverall = monthlyGeneralExpense + totalUsedFromPosts + totalDailySpent;
        const totalRemaining = monthlyIncome - totalUsedOverall;
        const unallocatedFunds = monthlyIncome - totalAllocated;
        const generalAndDailyExpenses = monthlyGeneralExpense + totalDailySpent;
        const remainingUnallocated = unallocatedFunds - generalAndDailyExpenses;
        const currentAvailableFunds = unallocatedFunds - generalAndDailyExpenses;
        
        return { monthlyIncome, totalUsedOverall, totalRemaining, totalAllocated, unallocatedFunds, generalAndDailyExpenses, remainingUnallocated, totalDailySpent, currentAvailableFunds };
    }, [state.fundHistory, state.budgets, state.dailyExpenses]);
    
    useEffect(() => {
        const today = new Date();
        const todayStr = today.toLocaleDateString('fr-CA'); // YYYY-MM-DD
        const lastCheck = state.achievementData?.lastStreakCheck;

        if (todayStr !== lastCheck) {
             const todayNorm = new Date(today);
            todayNorm.setHours(0, 0, 0, 0);
            const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
            if(lastCheckDate) lastCheckDate.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(todayNorm);
            yesterday.setDate(todayNorm.getDate() - 1);
            
            const isConsecutiveDay = lastCheckDate && lastCheckDate.getTime() === yesterday.getTime();
            
            const remainingDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
            const yesterdaysDailyExpenses = state.dailyExpenses.filter(exp => new Date(exp.timestamp).toDateString() === yesterday.toDateString());
            const totalDailySpentYesterday = yesterdaysDailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const dailyBudgetMax = remainingDays > 0 ? currentAvailableFunds / remainingDays : currentAvailableFunds;
            const dailyBudgetRemainingYesterday = dailyBudgetMax - totalDailySpentYesterday;
            const hasSpendYesterday = allTransactions.some(t => t.type === 'remove' && new Date(t.timestamp).toDateString() === yesterday.toDateString());
            const hasMorningTxnYesterday = allTransactions.some(t => {
                const d = new Date(t.timestamp);
                return d.toDateString() === yesterday.toDateString() && d.getHours() < 12;
            });
            const hasSavingTxnYesterday = state.savingsGoals.some(g => g.history.some(h => new Date(h.timestamp).toDateString() === yesterday.toDateString()));
            

            updateState(prev => {
                const currentData = prev.achievementData || { ...initialState.achievementData };
                
                let newMonthlyStreak = (totalRemaining >= 0) ? (currentData.monthlyStreak || 0) + 1 : 0;
                let newDailyStreak = (dailyBudgetRemainingYesterday >= 0) ? (currentData.dailyStreak || 0) + 1 : 0;
                let newNoSpendStreak = !hasSpendYesterday ? (currentData.noSpendStreak || 0) + 1 : 0;
                let newAppOpenStreak = isConsecutiveDay ? (currentData.appOpenStreak || 0) + 1 : 1;
                let newMorningTxnStreak = hasMorningTxnYesterday ? (currentData.morningTransactionStreak || 0) + 1 : 0;
                let newSavingStreak = hasSavingTxnYesterday ? (currentData.savingStreak || 0) + 1 : 0;

                return {
                    ...prev,
                    achievementData: {
                        ...currentData,
                        dailyStreak: newDailyStreak,
                        monthlyStreak: newMonthlyStreak,
                        noSpendStreak: newNoSpendStreak,
                        appOpenStreak: newAppOpenStreak,
                        morningTransactionStreak: newMorningTxnStreak,
                        savingStreak: newSavingStreak,
                        lastStreakCheck: todayStr,
                    }
                };
            });
        }
    }, [state.achievementData?.lastStreakCheck, totalRemaining, currentAvailableFunds, state.dailyExpenses, allTransactions, state.savingsGoals, updateState]);


    // ... (Handlers: Budget, Transaction, etc.) ...
    const handleAddBudget = (name: string, amount: number, icon: string, color: string) => {
        updateState(prev => {
            const newBudget: Budget = { 
                id: Date.now(), 
                name, 
                totalBudget: amount, 
                history: [], 
                icon, 
                color,
                order: prev.budgets.filter(b => !b.isArchived && !b.isTemporary).length,
                isArchived: false,
                isTemporary: false,
            };
            return { ...prev, budgets: [...prev.budgets, newBudget] };
        });
        setActiveModal(null);
    };

    const handleEditBudget = (name: string, amount: number, icon: string, color: string) => {
        if (!currentBudgetId) return;
        updateState(prev => ({
            ...prev,
            budgets: prev.budgets.map(b => b.id === currentBudgetId ? { ...b, name, totalBudget: amount, icon, color } : b)
        }));
        setActiveModal(null);
    };

    const handleArchiveBudget = () => {
        if (!currentBudgetId) return;
        openConfirm("Anda yakin ingin mengarsipkan pos ini? Anda bisa memulihkannya kapan saja dari menu Pengaturan.", () => {
            updateState(prev => {
                const budgetsToReorder = prev.budgets
                    .filter(b => !b.isArchived && b.id !== currentBudgetId)
                    .sort((a, b) => a.order - b.order);

                const newBudgets = prev.budgets.map(b => {
                    if (b.id === currentBudgetId) {
                        return { ...b, isArchived: true };
                    }
                    const newOrder = budgetsToReorder.findIndex(bo => bo.id === b.id);
                    if (newOrder !== -1) {
                        return { ...b, order: newOrder };
                    }
                    return b;
                });

                return { ...prev, budgets: newBudgets };
            });
            setActiveModal(null);
        });
    };

    const handleRestoreBudget = (budgetId: number) => {
        updateState(prev => {
            const numActiveBudgets = prev.budgets.filter(b => !b.isArchived).length;
            const newBudgets = prev.budgets.map(b => 
                b.id === budgetId 
                ? { ...b, isArchived: false, order: numActiveBudgets } 
                : b
            );
            return { ...prev, budgets: newBudgets };
        });
    };

    const handleDeleteBudgetPermanently = (budgetId: number) => {
        const budgetToDelete = state.budgets.find(b => b.id === budgetId);
        if (!budgetToDelete) return;

        openConfirm(
            <>
                <strong>Hapus Permanen?</strong>
                <br />
                Anda akan menghapus pos "<strong>{budgetToDelete.name}</strong>" dan SEMUA riwayat transaksinya. Tindakan ini tidak dapat diurungkan.
            </>,
            () => {
                updateState(prev => ({
                    ...prev,
                    budgets: prev.budgets.filter(b => b.id !== budgetId)
                }));
            }
        );
    };

    const handleReorderBudgets = (reorderedActiveBudgets: Budget[]) => {
        updateState(prev => {
            const activeBudgetMap = new Map(reorderedActiveBudgets.map((b, index) => [b.id, index]));
            const newBudgets = prev.budgets.map(b => {
                if (activeBudgetMap.has(b.id)) {
                    return { ...b, order: activeBudgetMap.get(b.id)! };
                }
                return b;
            });
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
                if (!b.isArchived) {
                    if (b.isTemporary) {
                        newOrder = temporaryBudgets.findIndex(tb => tb.id === b.id);
                    } else {
                        newOrder = fixedBudgets.findIndex(fb => fb.id === b.id);
                    }
                }
                return { ...b, order: newOrder };
            });

            return { ...prev, budgets: reorderedBudgets };
        });
    };

    const handleAddTransaction = (desc: string, amount: number, targetId: 'daily' | number) => {
        const newTransaction: Transaction = { desc, amount, timestamp: Date.now() };

        if (targetId === 'daily') {
            updateState(prev => ({ ...prev, dailyExpenses: [...prev.dailyExpenses, newTransaction] }));
            setActiveModal(null);
        } else { 
            const budget = state.budgets.find(b => b.id === targetId);
            if (!budget) return;
            const usedAmount = budget.history.reduce((sum, item) => sum + item.amount, 0);
            const remainingQuota = Math.max(0, budget.totalBudget - usedAmount);

            if (amount > remainingQuota) {
                const overageAmount = amount - remainingQuota;
                const confirmOverage = () => {
                    updateState(prev => {
                        const newBudgets = prev.budgets.map(b => {
                            if (b.id === targetId && remainingQuota > 0) {
                                return { ...b, history: [...b.history, { desc, amount: remainingQuota, timestamp: Date.now() }] };
                            }
                            return b;
                        });
                        const newDailyExpenses = [...prev.dailyExpenses, { desc: `[Overage] ${desc}`, amount: overageAmount, timestamp: Date.now(), sourceCategory: budget.name }];
                        return { ...prev, budgets: newBudgets, dailyExpenses: newDailyExpenses };
                    });
                    setActiveModal(null);
                }
                setConfirmModalContent({
                    message: <>Pengeluaran <strong>{formatCurrency(amount)}</strong> melebihi sisa kuota.<br />Sebesar <strong>{formatCurrency(overageAmount)}</strong> akan diambil dari "Dana Tersedia". Lanjutkan?</>,
                    onConfirm: confirmOverage
                });
                setActiveModal('confirm');
                return;
            } else {
                updateState(prev => ({
                    ...prev,
                    budgets: prev.budgets.map(b => b.id === targetId ? { ...b, history: [...b.history, newTransaction] } : b)
                }));
                setActiveModal(null);
            }
        }
    };
    
    const handleSaveScannedItems = (items: ScannedItem[]) => {
        updateState(prev => {
            const newDailyExpenses = [...prev.dailyExpenses];
            const newBudgets = JSON.parse(JSON.stringify(prev.budgets)); 

            items.forEach(item => {
                if (item.budgetId === 'none' || item.amount <= 0 || !item.desc.trim()) return;
                
                const newTransaction: Transaction = {
                    desc: item.desc,
                    amount: item.amount,
                    timestamp: Date.now()
                };

                if (item.budgetId === 'daily') {
                    newDailyExpenses.push(newTransaction);
                } else {
                    const budget = newBudgets.find((b: Budget) => b.id === item.budgetId);
                    if (budget) {
                        budget.history.push(newTransaction);
                    }
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
            if (type === 'daily') {
                newState.dailyExpenses = prev.dailyExpenses.filter(t => t.timestamp !== timestamp);
            } else if (type === 'fund') {
                newState.fundHistory = prev.fundHistory.filter(t => t.timestamp !== timestamp);
            } else if (type === 'post' && budgetId) {
                newState.budgets = prev.budgets.map(b => b.id === budgetId ? {...b, history: b.history.filter(h => h.timestamp !== timestamp)} : b);
            }
            return newState;
        });
        setActiveModal(null);
    }

    const handleEditGlobalTransaction = (timestamp: number, newDesc: string, newAmount: number) => {
        updateState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            
            const fundIndex = newState.fundHistory.findIndex((t: FundTransaction) => t.timestamp === timestamp);
            if (fundIndex !== -1) {
                newState.fundHistory[fundIndex].desc = newDesc;
                newState.fundHistory[fundIndex].amount = newAmount;
                return newState;
            }
            
            const dailyIndex = newState.dailyExpenses.findIndex((t: Transaction) => t.timestamp === timestamp);
            if (dailyIndex !== -1) {
                newState.dailyExpenses[dailyIndex].desc = newDesc;
                newState.dailyExpenses[dailyIndex].amount = newAmount;
                return newState;
            }
            
            for (const budget of newState.budgets) {
                const histIndex = budget.history.findIndex((t: Transaction) => t.timestamp === timestamp);
                if (histIndex !== -1) {
                    budget.history[histIndex].desc = newDesc;
                    budget.history[histIndex].amount = newAmount;
                    return newState;
                }
            }

            for (const archive of newState.archives) {
                const archIndex = archive.transactions.findIndex((t: GlobalTransaction) => t.timestamp === timestamp);
                if (archIndex !== -1) {
                    archive.transactions[archIndex].desc = newDesc;
                    archive.transactions[archIndex].amount = newAmount;
                    return newState;
                }
            }
            
            return newState;
        });
    };
    
    const handleDeleteGlobalTransaction = (timestamp: number) => {
        updateState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); 

            let transactionToDelete: FundTransaction | GlobalTransaction | undefined;
            transactionToDelete = newState.fundHistory.find((t: FundTransaction) => t.timestamp === timestamp);
            if (!transactionToDelete) {
                for (const archive of newState.archives) {
                    const found = archive.transactions.find((t: GlobalTransaction) => t.timestamp === timestamp);
                    if (found) {
                        transactionToDelete = found;
                        break;
                    }
                }
            }
            
            if (transactionToDelete && transactionToDelete.type === 'remove' && transactionToDelete.desc.startsWith('Tabungan: ')) {
                const goalName = transactionToDelete.desc.substring('Tabungan: '.length);
                const goalIndex = newState.savingsGoals.findIndex((g: SavingsGoal) => g.name === goalName);

                if (goalIndex !== -1) {
                    const goal = newState.savingsGoals[goalIndex];
                    const originalHistoryLength = goal.history.length;
                    goal.history = goal.history.filter((h: SavingTransaction) => h.timestamp !== timestamp);

                    if (goal.history.length < originalHistoryLength) {
                        const newSavedAmount = goal.savedAmount - transactionToDelete.amount;
                        goal.savedAmount = newSavedAmount < 0 ? 0 : newSavedAmount;
                        goal.isCompleted = !goal.isInfinite && goal.targetAmount ? goal.savedAmount >= goal.targetAmount : false;
                    }
                }
            }
            
            newState.fundHistory = newState.fundHistory.filter((t: FundTransaction) => t.timestamp !== timestamp);
            newState.dailyExpenses = newState.dailyExpenses.filter((t: Transaction) => t.timestamp !== timestamp);
            newState.budgets.forEach((b: Budget) => { b.history = b.history.filter((h: Transaction) => h.timestamp !== timestamp); });
            newState.archives.forEach((a: any) => { a.transactions = a.transactions.filter((t: any) => t.timestamp !== timestamp); });
            
            return newState;
        });
    }

    const handleEditAsset = (newAssetAmount: number) => {
        const difference = newAssetAmount - currentAsset;
        if (difference !== 0) {
            const correction: GlobalTransaction = {
                type: difference > 0 ? 'add' : 'remove',
                desc: 'Koreksi Saldo',
                amount: Math.abs(difference),
                timestamp: Date.now()
            };
            updateState(prev => {
                const newArchives = JSON.parse(JSON.stringify(prev.archives));
                if (newArchives.length > 0) {
                    newArchives[newArchives.length - 1].transactions.push(correction);
                } else {
                    const archiveMonth = new Date().toISOString().slice(0, 7);
                    newArchives.push({ month: archiveMonth, transactions: [correction] });
                }
                return { ...prev, archives: newArchives };
            });
        }
        setActiveModal(null);
    };

    const handleAddAsset = (name: string, quantity: number, pricePerUnit: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => {
        const newAsset: Asset = {
            id: Date.now(),
            name,
            quantity,
            pricePerUnit,
            type,
            symbol
        };
        updateState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
        setActiveModal(null);
    };

    const handleEditAssetItem = (id: number, name: string, quantity: number, pricePerUnit: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => {
        updateState(prev => ({
            ...prev,
            assets: prev.assets.map(a => a.id === id ? { ...a, name, quantity, pricePerUnit, type, symbol } : a)
        }));
        setActiveModal(null);
    };

    const handleDeleteAsset = (id: number) => {
        openConfirm("Anda yakin ingin menghapus aset ini dari daftar?", () => {
            updateState(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
        });
    };
    
    const handleAddWishlist = (name: string, price: number, days: number) => {
        const newItem: WishlistItem = {
            id: Date.now(),
            name,
            price,
            cooldownDays: days,
            createdAt: Date.now(),
            status: 'waiting'
        };
        updateState(prev => ({ ...prev, wishlist: [...(prev.wishlist || []), newItem] }));
        setActiveModal(null);
    };

    const handleFulfillWishlist = (id: number) => {
        const item = state.wishlist.find(i => i.id === id);
        if (!item) return;
        setPrefillData({ desc: item.name, amount: formatNumberInput(item.price) });
        updateState(prev => ({
            ...prev,
            wishlist: prev.wishlist.map(i => i.id === id ? { ...i, status: 'purchased' } : i)
        }));
        setInputModalMode('use-daily');
        setActiveModal('input');
    };

    const handleCancelWishlist = (id: number) => {
        updateState(prev => ({
            ...prev,
            wishlist: prev.wishlist.map(i => i.id === id ? { ...i, status: 'cancelled' } : i)
        }));
    };

    const handleDeleteWishlist = (id: number) => {
        updateState(prev => ({
            ...prev,
            wishlist: prev.wishlist.filter(i => i.id !== id)
        }));
    };

    const handleAddSubscription = (subData: Omit<Subscription, 'id'>) => {
        const newSub: Subscription = { ...subData, id: Date.now() };
        updateState(prev => ({ ...prev, subscriptions: [...(prev.subscriptions || []), newSub] }));
    };

    const handleEditSubscription = (subData: Subscription) => {
        updateState(prev => ({ ...prev, subscriptions: prev.subscriptions.map(s => s.id === subData.id ? subData : s) }));
    };

    const handleDeleteSubscription = (id: number) => {
        openConfirm("Hapus langganan ini?", () => {
            updateState(prev => ({ ...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id) }));
        });
    };

    const handleAddSavingsGoal = (name: string, isInfinite: boolean, targetAmount?: number) => {
        const newGoal: SavingsGoal = {
            id: Date.now(),
            name,
            targetAmount: isInfinite ? undefined : targetAmount,
            isInfinite: isInfinite,
            savedAmount: 0,
            history: [],
            createdAt: Date.now(),
            isCompleted: false,
        };
        updateState(prev => ({ ...prev, savingsGoals: [...prev.savingsGoals, newGoal] }));
        setActiveModal(null);
    };

    const handleAddSavings = (goalId: number, amount: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (!goal) return;
        if (amount > currentAvailableFunds) {
            openConfirm(<>Dana tersedia tidak mencukupi. Sisa dana tersedia hanya <strong>{formatCurrency(currentAvailableFunds)}</strong>.</>, () => {});
            return;
        }
        updateState(prev => {
            const transactionTimestamp = Date.now();
            const newFundHistory = [...prev.fundHistory, {
                type: 'remove' as const,
                desc: `Tabungan: ${goal.name}`,
                amount: amount,
                timestamp: transactionTimestamp,
            }];
            const newSavingsGoals = prev.savingsGoals.map(g => {
                if (g.id === goalId) {
                    const newSavedAmount = g.savedAmount + amount;
                    const newHistory: SavingTransaction = { amount, timestamp: transactionTimestamp };
                    return {
                        ...g,
                        savedAmount: newSavedAmount,
                        history: [...g.history, newHistory],
                        isCompleted: !g.isInfinite && g.targetAmount ? newSavedAmount >= g.targetAmount : false,
                    };
                }
                return g;
            });
            return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
        });
        setActiveModal(null);
    };

    const handleOpenSavingsGoal = (goalId: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (!goal || !goal.isInfinite) return;
        openConfirm(`Anda yakin ingin "membuka" tabungan "${goal.name}"? Dana sebesar ${formatCurrency(goal.savedAmount)} akan dikembalikan ke dana tersedia dan tabungan ini akan menjadi kosong.`, () => {
             updateState(prev => {
                const newFundHistory = goal.savedAmount > 0 ? [...prev.fundHistory, {
                    type: 'add' as const,
                    desc: `Dana dari tabungan: ${goal.name}`,
                    amount: goal.savedAmount,
                    timestamp: Date.now(),
                }] : prev.fundHistory;
                const newSavingsGoals = prev.savingsGoals.map(g => 
                    g.id === goalId ? { ...g, savedAmount: 0, history: [], isCompleted: false } : g
                );
                return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
            });
        });
    };

     const handleDeleteSavingsGoal = (goalId: number) => {
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (!goal) return;
        const message = goal.isInfinite ?
            `Anda yakin ingin menghapus celengan "${goal.name}"? Dana sebesar ${formatCurrency(goal.savedAmount)} akan dikembalikan.` :
            `Anda yakin ingin menghapus celengan "${goal.name}"? Dana sebesar ${formatCurrency(goal.savedAmount)} akan dikembalikan ke dana tersedia.`;
        openConfirm(message, () => {
             updateState(prev => {
                const newFundHistory = goal.savedAmount > 0 ? [...prev.fundHistory, {
                    type: 'add' as const,
                    desc: `Batal Tabungan: ${goal.name}`,
                    amount: goal.savedAmount,
                    timestamp: Date.now(),
                }] : prev.fundHistory;
                const newSavingsGoals = prev.savingsGoals.filter(g => g.id !== goalId);
                return { ...prev, fundHistory: newFundHistory, savingsGoals: newSavingsGoals };
            });
            setActiveModal(null);
        });
    };

    const handleUpdateProfile = (name: string, avatar: string) => {
        updateState(prev => ({ ...prev, userProfile: { ...prev.userProfile, name, avatar } }));
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `data_anggaran_${new Date().toISOString().slice(0, 10)}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const now = new Date().toISOString();
        localStorage.setItem('lastExportDate', now);
        setLastExportDate(now);
        setActiveModal(null);
    };

    const handleTriggerImport = () => {
        openConfirm(
            <><strong>PERINGATAN!</strong><br />Mengimpor data akan menghapus semua data saat ini. Lanjutkan?</>,
            () => importFileInputRef.current?.click()
        );
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result as string);
                if (typeof importedState.budgets !== 'object' || typeof importedState.archives !== 'object') {
                    throw new Error("Format file tidak valid.");
                }
                setState({ ...initialState, ...importedState });
                const now = new Date().toISOString();
                localStorage.setItem('lastImportDate', now);
                setLastImportDate(now);
                setCurrentPage('dashboard');
            } catch (err) {
                openConfirm("Gagal memuat file. Pastikan file cadangan tidak rusak dan berformat .json yang benar.", () => {});
            } finally {
                if(importFileInputRef.current) importFileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleManualBackup = () => {
        const newBackupKey = `${BACKUP_PREFIX}${Date.now()}`;
        try {
            localStorage.setItem(newBackupKey, JSON.stringify(state));
            const allBackups = listInternalBackups();
            if (allBackups.length > MAX_BACKUPS) {
                const oldestBackup = allBackups[allBackups.length - 1];
                localStorage.removeItem(oldestBackup.key);
            }
            setInternalBackups(listInternalBackups());
            setActiveModal('backupRestore');
        } catch (error) {
            openConfirm(
                <><strong>Gagal Mencadangkan</strong><br/>Penyimpanan penuh. Hapus beberapa tema kustom atau data lama.</>, 
                () => {}
            );
        }
    };

    const handleRestoreBackup = (key: string) => {
        openConfirm("Memulihkan cadangan ini akan menimpa semua data Anda saat ini. Tindakan ini tidak dapat diurungkan.", () => {
            const backupData = localStorage.getItem(key);
            if (backupData) {
                try {
                    const importedState = JSON.parse(backupData);
                    setState({ ...initialState, ...importedState });
                    setActiveModal(null);
                    setCurrentPage('dashboard');
                } catch (err) {
                    openConfirm("Gagal memuat cadangan. File mungkin rusak.", () => {});
                }
            } else {
                 openConfirm("Gagal menemukan data cadangan.", () => {});
            }
        });
    };

    const handleResetMonthlyData = () => {
        openConfirm('PERINGATAN: Ini akan menghapus semua data bulan ini TANPA diarsipkan. Hanya untuk uji coba. Lanjutkan?', () => {
            updateState(prev => ({
                ...prev,
                fundHistory: [],
                dailyExpenses: [],
                budgets: prev.budgets.map(b => ({...b, history: []}))
            }));
            setActiveModal(null);
        })
    }
    
    const handleResetAllData = () => {
        openConfirm(
            <><strong>HAPUS SEMUA DATA?</strong><br/>Tindakan ini tidak dapat diurungkan dan akan menghapus semua anggaran, transaksi, dan pencapaian Anda secara permanen.</>,
            () => {
                localStorage.removeItem(`budgetAppState_v${APP_VERSION}`);
                localStorage.removeItem('lastImportDate');
                localStorage.removeItem('lastExportDate');
                setLastImportDate(null);
                setLastExportDate(null);
                Object.keys(localStorage).filter(key => key.startsWith(BACKUP_PREFIX)).forEach(key => localStorage.removeItem(key));
                window.location.reload();
            }
        );
    };
    
    const handleManualCloseBook = () => {
        openConfirm(
            <>
                <strong>Akhiri Bulan & Tutup Buku?</strong>
                <br/><br/>
                Tindakan ini akan:
                <ul className="text-left list-disc pl-6 text-sm mt-2 mb-2">
                    <li>Mengarsipkan semua transaksi bulan ini ke Laporan.</li>
                    <li>Mereset Pemasukan, Pengeluaran, dan Sisa Dana menjadi 0.</li>
                    <li>Mengosongkan penggunaan semua Pos Anggaran Tetap.</li>
                    <li>Mengarsipkan Pos Anggaran Sementara.</li>
                </ul>
                Data tidak hilang, hanya dipindahkan ke arsip. Mulai lembaran baru?
            </>,
            () => {
                updateState(prev => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const archivedTransactions: GlobalTransaction[] = [];
                    archivedTransactions.push(...prev.fundHistory);
                    prev.dailyExpenses.forEach(t => {
                        archivedTransactions.push({
                            ...t,
                            type: 'remove',
                            category: t.sourceCategory || 'Harian'
                        });
                    });
                    prev.budgets.forEach(b => {
                        b.history.forEach(h => {
                            archivedTransactions.push({
                                ...h,
                                type: 'remove',
                                category: b.name,
                                icon: b.icon,
                                color: b.color
                            });
                        });
                    });
                    const newBudgets = prev.budgets.map(b => {
                        if (b.isTemporary) {
                            return { ...b, isArchived: true, history: [] };
                        } else {
                            return { ...b, history: [] };
                        }
                    });
                    const newArchive = {
                        month: currentMonth,
                        transactions: archivedTransactions
                    };
                    return {
                        ...prev,
                        archives: [...prev.archives, newArchive],
                        fundHistory: [],
                        dailyExpenses: [],
                        budgets: newBudgets
                    };
                });
                setActiveModal(null);
            }
        );
    };

    const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setActiveModal('scanResult');
        setIsScanning(true);
        setScanError(null);
        setScannedItems([]);
        try {
            const base64Data = await fileToBase64(file);
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
            const textPart = { text: "Analyze the receipt image and extract only the individual purchased items with their corresponding prices. Exclude any lines that are not items, such as totals, subtotals, taxes, discounts, or store information. All prices must be positive numbers. Ignore any hyphens or stray characters that are not part of the item's name or price. Your response must be a valid JSON array of objects. Each object must contain 'desc' (string) for the item name and 'amount' (number) for the price. Do not include anything else in your response besides the JSON array." };
            const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { desc: { type: Type.STRING, description: "Nama barang yang dibeli." }, amount: { type: Type.NUMBER, description: "Harga barang sebagai angka positif. Abaikan karakter non-numerik seperti tanda hubung (-)." } }, required: ["desc", "amount"] } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] }, config: { responseMimeType: 'application/json', responseSchema: schema } });
            const resultData = JSON.parse(response.text);
            if (Array.isArray(resultData)) {
                const sanitizedData = resultData.map(item => ({ ...item, amount: Math.abs(Number(item.amount) || 0), budgetId: 'none' })).filter(item => item.amount > 0 && item.desc && item.desc.trim() !== '');
                setScannedItems(sanitizedData);
            } else {
                throw new Error("AI response is not in the expected format.");
            }
        } catch (error) {
            console.error("Error scanning receipt:", error);
            setScanError("Gagal memindai struk. Coba lagi dengan gambar yang lebih jelas.");
        } finally {
            setIsScanning(false);
            if (scanFileInputRef.current) scanFileInputRef.current.value = '';
        }
    };

    const handleProcessSmartInput = async (text: string) => {
        if (!text.trim()) {
            setSmartInputError("Mohon masukkan deskripsi transaksi.");
            return;
        }
        setIsProcessingSmartInput(true);
        setSmartInputError(null);
        setSmartInputResult([]);
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const budgetCategories = [...state.budgets.filter(b => !b.isArchived).map(b => b.name), 'Uang Harian'];
            const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { desc: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING, enum: budgetCategories } }, required: ["desc", "amount", "category"] } };
            const prompt = `Analisis teks berikut yang berisi transaksi keuangan dalam Bahasa Indonesia. Ekstrak setiap transaksi individual (deskripsi dan jumlahnya). Untuk setiap transaksi, tentukan kategori anggaran yang paling sesuai dari daftar ini: [${budgetCategories.join(', ')}]. Jika tidak ada yang cocok, gunakan "Uang Harian". Respons Anda HARUS berupa array JSON yang valid dari objek, di mana setiap objek memiliki kunci "desc", "amount", dan "category". Teks: "${text}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json', responseSchema: schema } });
            const resultData = JSON.parse(response.text);
            if (Array.isArray(resultData)) {
                const mappedItems: ScannedItem[] = resultData.map(item => {
                    const matchedBudget = state.budgets.find(b => b.name === item.category);
                    let budgetId: ScannedItem['budgetId'] = 'daily';
                    if (matchedBudget) {
                        budgetId = matchedBudget.id;
                    }
                    return { desc: item.desc, amount: item.amount, budgetId: budgetId };
                });
                setSmartInputResult(mappedItems);
            } else {
                throw new Error("Format respons AI tidak terduga.");
            }
        } catch (error) {
            console.error("Error processing smart input:", error);
            setSmartInputError("Gagal memproses input. Coba lagi dengan format yang lebih sederhana.");
        } finally {
            setIsProcessingSmartInput(false);
        }
    };
    
    const handleGetAIAdvice = async () => {
        setActiveModal('aiAdvice');
        setIsFetchingAdvice(true);
        setAiAdvice('');
        setAdviceError(null);
        try {
            const budgetDetails = state.budgets.map(b => {
                const used = b.history.reduce((sum, h) => sum + h.amount, 0);
                return `* ${b.name}: Terpakai ${formatCurrency(used)} dari kuota ${formatCurrency(b.totalBudget)}`;
            }).join('\n');
            const prompt = `${getSystemInstruction(state.userProfile.activePersona)} Berikut adalah ringkasan data keuangan pengguna untuk bulan ini dalam Rupiah (IDR):\n* Total Pemasukan: ${formatCurrency(monthlyIncome)}\n* Total Pengeluaran: ${formatCurrency(totalUsedOverall)}\n* Sisa Dana Bulan Ini: ${formatCurrency(totalRemaining)}\nRincian Pengeluaran berdasarkan Pos Anggaran:\n${budgetDetails || "Tidak ada pos anggaran yang dibuat."}\nTotal Pengeluaran Harian (di luar pos anggaran): ${formatCurrency(totalDailySpent)}\nSisa Dana yang Tidak Terikat Anggaran: ${formatCurrency(remainingUnallocated)}\nBerdasarkan data ini, berikan analisis singkat dan beberapa saran praktis untuk mengelola keuangan dengan lebih baik. Berikan jawaban dalam format poin-poin (bullet points) menggunakan markdown.`;
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiAdvice(response.text);
        } catch (error) {
            console.error("Error getting AI advice:", error);
            setAdviceError("Gagal mendapatkan saran dari AI. Silakan coba lagi nanti.");
        } finally {
            setIsFetchingAdvice(false);
        }
    };

    const handleFetchDashboardInsight = useCallback(async () => {
        setIsFetchingDashboardInsight(true);
        try {
            // --- PROJECTION LOGIC START ---
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const daysPassed = Math.max(1, now.getDate());
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysRemaining = lastDayOfMonth - daysPassed;

            // Calculate totals from start of month to now (filtered)
            const currentMonthIncome = state.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
            
            const totalSpent = state.dailyExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                               state.fundHistory.filter(t => t.type === 'remove').reduce((sum, t) => sum + t.amount, 0) +
                               state.budgets.reduce((sum, b) => sum + b.history.reduce((s, h) => s + h.amount, 0), 0);
            
            const currentBalance = currentMonthIncome - totalSpent;
            const avgDailySpend = totalSpent / daysPassed;
            const projectedAdditionalSpend = avgDailySpend * daysRemaining;
            const projectedEndMonthBalance = currentBalance - projectedAdditionalSpend;

            const budgetDetails = state.budgets.map(b => { 
                const used = b.history.reduce((sum, h) => sum + h.amount, 0); 
                if (used > 0) return `* ${b.name}: Terpakai ${formatCurrency(used)} dari ${formatCurrency(b.totalBudget)}`; 
                return null; 
            }).filter(Boolean).join('\n');
            
            const prompt = `${getSystemInstruction(state.userProfile.activePersona)}
            
            ANALISIS KEUANGAN BULANAN & PREDIKSI:
            
            PERIODE: 1 ${now.toLocaleDateString('id-ID', {month: 'long'})} s.d. Hari Ini (${now.getDate()}).
            
            DATA SAAT INI:
            - Total Pemasukan: ${formatCurrency(currentMonthIncome)}
            - Total Pengeluaran (Semua): ${formatCurrency(totalSpent)}
            - Sisa Uang Riil Saat Ini: ${formatCurrency(currentBalance)}
            
            PROYEKSI AKHIR BULAN (Estimasi):
            - Rata-rata pengeluaran per hari: ${formatCurrency(avgDailySpend)}
            - Estimasi sisa uang di akhir bulan: ${formatCurrency(projectedEndMonthBalance)} (Jika pola belanja sama)
            
            TUGASMU:
            Berikan wawasan singkat (Maksimal 3 kalimat poin penting).
            1. Komentari kesehatan keuangan saat ini berdasarkan data.
            2. Berikan prediksi apakah akhir bulan akan aman atau minus berdasarkan proyeksi di atas.
            3. Beri 1 saran spesifik untuk menjaga/memperbaiki kondisi hingga akhir bulan.
            `;

            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiDashboardInsight(response.text || "Belum ada data yang cukup untuk prediksi.");
        } catch (error) {
            console.error("Error fetching dashboard insight:", error);
            setAiDashboardInsight("Lagi ga bisa nerawang nih, cek koneksi dulu ya.");
        } finally {
            setIsFetchingDashboardInsight(false);
        }
    }, [state]);

    useEffect(() => {
        if(monthlyIncome > 0) {
            handleFetchDashboardInsight();
        } else {
            setAiDashboardInsight("Tambahkan pemasukan bulan ini dulu biar aku bisa kasih ramalan keuangan!");
        }
    }, [monthlyIncome, handleFetchDashboardInsight]);

    const handleAnalyzeChartData = async (prompt: string): Promise<string> => {
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            // Prepend persona instruction to chart analysis prompt
            const enhancedPrompt = `${getSystemInstruction(state.userProfile.activePersona)} ${prompt}`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: enhancedPrompt });
            return response.text;
        } catch (error) {
            console.error("Chart analysis error:", error);
            return "Waduh, gagal baca grafik nih. Coba lagi nanti ya!";
        }
    };

    const getFinancialContextForAI = useCallback(() => {
        const budgetDetails = state.budgets.map(b => {
            const used = b.history.reduce((sum, h) => sum + h.amount, 0);
            return `* Pos Anggaran "${b.name}": Kuota ${formatCurrency(b.totalBudget)}, Terpakai ${formatCurrency(used)}, Sisa ${formatCurrency(b.totalBudget - used)}`;
        }).join('\n');
        return `Tugas Anda adalah menjawab pertanyaan pengguna HANYA berdasarkan data keuangan yang saya berikan di bawah ini. Jangan membuat informasi atau memberikan saran di luar data. Jawab dalam Bahasa Indonesia. Berikut adalah ringkasan data keuangan pengguna untuk bulan ini (dalam IDR): **Ringkasan Umum:** * Total Pemasukan: ${formatCurrency(monthlyIncome)}, * Total Pengeluaran Keseluruhan: ${formatCurrency(totalUsedOverall)}, * Sisa Dana (Pemasukan - Pengeluaran): ${formatCurrency(totalRemaining)}, * Total Dana yang Dialokasikan ke Pos Anggaran: ${formatCurrency(totalAllocated)}, * Dana Tersedia Untuk Pengeluaran Harian/Umum (di luar pos): ${formatCurrency(currentAvailableFunds)}. **Rincian Pos Anggaran:** ${budgetDetails || "Tidak ada pos anggaran yang dibuat."}. **Rincian 10 Transaksi Terakhir:** ${allTransactions.slice(0, 10).map(t => `* ${new Date(t.timestamp).toLocaleDateString('id-ID')}: ${t.desc} (${t.type === 'add' ? '+' : '-'} ${formatCurrency(t.amount)}) - Kategori: ${t.category || (t.type === 'add' ? 'Pemasukan' : 'Umum')}`).join(', ')}. Data sudah lengkap. Anda siap menjawab pertanyaan pengguna.`;
    }, [state, monthlyIncome, totalUsedOverall, totalRemaining, totalAllocated, currentAvailableFunds, allTransactions]);

    const handleOpenAIChat = useCallback(async () => {
        setActiveModal('aiChat');
        setAiChatHistory([]);
        setAiChatError(null);
        setIsAiChatLoading(true);
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const contextPrompt = getFinancialContextForAI();
            
            const systemInstruction = getSystemInstruction(state.userProfile.activePersona);

            const chat = ai.chats.create({ 
                model: 'gemini-2.5-flash', 
                config: { systemInstruction },
                history: [
                    { role: 'user', parts: [{ text: contextPrompt }] }, 
                    { role: 'model', parts: [{ text: 'Data diterima. Saya siap membantu.' }] }
                ] 
            });
            setAiChatSession(chat);
            setAiChatHistory([{ role: 'model', text: 'Halo! Saya asisten AI Anda. Silakan tanyakan apa saja tentang data keuangan Anda bulan ini.' }]);
        } catch (error) {
            console.error("Error initializing AI Chat:", error);
            setAiChatError("Gagal memulai sesi chat. Silakan coba lagi.");
        } finally {
            setIsAiChatLoading(false);
        }
    }, [getFinancialContextForAI, state.userProfile.activePersona]);

    const handleSendChatMessage = async (message: string) => {
        if (!aiChatSession) {
            setAiChatError("Sesi chat tidak aktif. Silakan tutup dan buka kembali.");
            return;
        }
        setAiChatHistory(prev => [...prev, { role: 'user', text: message }]);
        setIsAiChatLoading(true);
        setAiChatError(null);
        try {
            const response = await aiChatSession.sendMessage({ message });
            setAiChatHistory(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (error) {
            console.error("Error sending AI Chat message:", error);
            setAiChatError("Gagal mengirim pesan. Mohon coba lagi.");
        } finally {
            setIsAiChatLoading(false);
        }
    };
    
    const handleAiSearch = async (query: string) => {
        setIsSearchingWithAI(true);
        setAiSearchError(null);
        setAiSearchResults(null);
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const transactionsForPrompt = allTransactions.map(t => ({ timestamp: t.timestamp, desc: t.desc, amount: t.amount, type: t.type, category: t.category || (t.type === 'add' ? 'Pemasukan' : 'Umum') }));
            const prompt = `You are a smart search engine for a user's financial transactions. Analyze the user's natural language query and the provided JSON data of all their transactions. Your task is to identify and return ONLY the timestamps of the transactions that precisely match the user's query.\nUser Query: "${query}"\nTransaction Data (JSON):\n${JSON.stringify(transactionsForPrompt)}\nYour response MUST be a valid JSON array containing only the numbers (timestamps) of the matching transactions. For example: [1678886400000, 1678972800000]. If no transactions match, return an empty array [].`;
            const schema = { type: Type.ARRAY, items: { type: Type.NUMBER } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json', responseSchema: schema } });
            const matchingTimestamps = JSON.parse(response.text) as number[];
            const results = allTransactions.filter(t => matchingTimestamps.includes(t.timestamp));
            setAiSearchResults(results.sort((a, b) => b.timestamp - a.timestamp));
        } catch (error) {
            console.error("Error with AI Search:", error);
            setAiSearchError("Gagal melakukan pencarian AI. Coba lagi.");
        } finally {
            setIsSearchingWithAI(false);
        }
    };

    const handleClearAiSearch = () => {
        setAiSearchResults(null);
        setAiSearchError(null);
    };

    const openUseDailyBudget = () => { setInputModalMode('use-daily'); setActiveModal('input'); };
    const openUseBudget = (budgetId: number) => { setInputModalMode('use-post'); setCurrentBudgetId(budgetId); setActiveModal('input'); };
    const openEditBudget = (budgetId: number) => { setInputModalMode('edit-post'); setCurrentBudgetId(budgetId); setActiveModal('input'); };
    const openFundHistory = () => {
        setHistoryModalContent({ title: 'Riwayat Dana Bulan Ini', transactions: state.fundHistory.slice().reverse(), type: 'fund', budgetId: undefined });
        setActiveModal('history');
    };
    const openDailyHistory = () => {
        setHistoryModalContent({
            title: 'Riwayat Pengeluaran Harian',
            transactions: state.dailyExpenses.slice().reverse(),
            type: 'daily',
            budgetId: undefined,
        });
        setActiveModal('history');
    };
    const openConfirm = (message: React.ReactNode, onConfirm: () => void) => {
        setConfirmModalContent({ message, onConfirm });
        setActiveModal('confirm');
    };
    const openAssetModal = (assetId: number | null) => {
        setCurrentAssetId(assetId);
        setActiveModal('asset');
    }
    const openBatchInput = () => setActiveModal('batchInput');
    
    const calculateQuestPoints = (state: AppState) => {
        const todayStr = new Date().toLocaleDateString('fr-CA');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const isToday = (ts: number) => new Date(ts).toLocaleDateString('fr-CA') === todayStr;
        const isThisWeek = (ts: number) => (now - ts) < (7 * oneDay);

        const dailyQuests = [
            { completed: true, points: 5 },
            { completed: state.dailyExpenses.some(t => isToday(t.timestamp)) || state.fundHistory.some(t => isToday(t.timestamp)) || state.budgets.some(b => b.history.some(h => isToday(h.timestamp))), points: 10 },
            { completed: state.dailyExpenses.filter(t => isToday(t.timestamp)).reduce((sum, t) => sum + t.amount, 0) < 50000, points: 15 },
            { completed: state.savingsGoals.some(g => g.history.some(h => isToday(h.timestamp))), points: 20 },
            { completed: state.wishlist.length > 0, points: 10 }
        ];
        const dailyCount = dailyQuests.filter(q => q.completed).length;
        const dailyPoints = dailyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0) + (dailyCount >= 3 ? 50 : 0);

        const uniqueTransactionDays = new Set();
        state.dailyExpenses.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.fundHistory.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) });
        state.budgets.forEach(b => b.history.forEach(t => { if(isThisWeek(t.timestamp)) uniqueTransactionDays.add(new Date(t.timestamp).toDateString()) }));
        
        const savingsCount = state.savingsGoals.reduce((count, g) => count + g.history.filter(h => isThisWeek(h.timestamp)).length, 0);
        const activeBudgetsCount = state.budgets.filter(b => b.history.some(h => isThisWeek(h.timestamp))).length;
        const addedWishlist = state.wishlist.some(w => isThisWeek(w.createdAt));
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyIncome = state.fundHistory.filter(t => t.type === 'add' && t.timestamp >= startOfMonth.getTime()).reduce((sum, t) => sum + t.amount, 0);
        const weeklyExpense = state.dailyExpenses.filter(t => isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) + state.fundHistory.filter(t => t.type === 'remove' && isThisWeek(t.timestamp)).reduce((s, t) => s + t.amount, 0) + state.budgets.reduce((s, b) => s + b.history.filter(h => isThisWeek(h.timestamp)).reduce((bs, h) => bs + h.amount, 0), 0);
        const weeklyQuests = [
            { completed: uniqueTransactionDays.size >= 4, points: 30 },
            { completed: savingsCount >= 3, points: 40 },
            { completed: addedWishlist, points: 20 },
            { completed: activeBudgetsCount >= 4, points: 25 },
            { completed: monthlyIncome > 0 && weeklyExpense < (monthlyIncome * 0.25), points: 50 }
        ];
        const weeklyCount = weeklyQuests.filter(q => q.completed).length;
        const weeklyPoints = weeklyQuests.reduce((sum, q) => q.completed ? sum + q.points : sum, 0) + (weeklyCount >= 5 ? 150 : 0);

        return dailyPoints + weeklyPoints;
    };

    const calculateUserLevel = (totalPoints: number) => {
        const rankTitles = [
            "Pemula Finansial", "Pelajar Hemat", "Perencana Cerdas", "Pengelola Aset", 
            "Juragan Strategi", "Investor Ulung", "Master Anggaran", "Sultan Muda", 
            "Taipan Global", "Legenda Abadi"
        ];
        const levelNumber = Math.floor(Math.sqrt(totalPoints / 50)) + 1;
        const rankIndex = Math.min(rankTitles.length - 1, Math.floor((levelNumber - 1) / 5));
        const currentTitle = rankTitles[rankIndex];
        const currentStart = 50 * Math.pow(levelNumber - 1, 2);
        const nextTarget = 50 * Math.pow(levelNumber, 2);

        return { level: currentTitle, levelNumber: levelNumber, currentLevelPoints: currentStart, nextLevelPoints: nextTarget };
    };

    const unlockedAchIds = Object.keys(state.unlockedAchievements);
    const achievementPoints = allAchievements
        .filter(ach => unlockedAchIds.includes(ach.id))
        .reduce((sum, ach) => sum + (ach.points || 0), 0);
    
    const questPoints = calculateQuestPoints(state);
    // Add bonusPoints to grandTotal
    const grandTotalPoints = achievementPoints + questPoints + (state.bonusPoints || 0);
    const availableShopPoints = grandTotalPoints - (state.spentPoints || 0);
    const levelInfo = calculateUserLevel(grandTotalPoints);

    // --- SHOP HANDLERS ---
    const handlePurchase = (item: ShopItem) => {
        if (availableShopPoints < item.price) {
            openConfirm(<>Mustika tidak cukup! Kamu butuh <strong>{item.price - availableShopPoints}</strong> Mustika lagi.</>, () => {});
            return;
        }

        updateState(prev => {
            const newSpent = (prev.spentPoints || 0) + item.price;
            const newInventory = [...(prev.inventory || []), item.id];
            return { ...prev, spentPoints: newSpent, inventory: newInventory };
        });
        setNotifications(prev => [...prev, `Berhasil membeli ${item.name}!`]);
    };

    const handleSpendPoints = (amount: number) => {
        updateState(prev => ({ ...prev, spentPoints: (prev.spentPoints || 0) + amount }));
    };

    const handleEquip = (item: ShopItem) => {
        updateState(prev => {
            let newProfile = { ...prev.userProfile };
            let newActiveTheme = prev.activeTheme;

            if (item.type === 'theme') {
                newActiveTheme = item.value;
            } else if (item.type === 'title') {
                newProfile.customTitle = item.value;
            } else if (item.type === 'frame') {
                newProfile.frameId = item.value;
            } else if (item.type === 'persona') {
                newProfile.activePersona = item.value;
            } else if (item.type === 'banner') {
                newProfile.activeBanner = item.value;
            }

            return { ...prev, userProfile: newProfile, activeTheme: newActiveTheme };
        });
    };
    
    // --- CUSTOM THEME HANDLER ---
    const handleAddCustomTheme = (theme: CustomTheme, price: number) => {
        if (availableShopPoints < price) {
             openConfirm(<>Mustika tidak cukup untuk membuat tema kustom.</>, () => {});
             return;
        }
        updateState(prev => {
            const newSpent = (prev.spentPoints || 0) + price;
            const newThemes = [...(prev.customThemes || []), theme];
            return { 
                ...prev, 
                spentPoints: newSpent, 
                customThemes: newThemes,
                activeTheme: theme.id // Auto equip
            };
        });
        setNotifications(prev => [...prev, `Tema Kustom "${theme.name}" berhasil dibuat dan diterapkan!`]);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'reports':
                return <Reports 
                            state={state} 
                            onBack={() => setCurrentPage('dashboard')} 
                            onEditAsset={() => setActiveModal('editAsset')}
                            onDeleteTransaction={(timestamp) => openConfirm(
                                'Yakin ingin menghapus transaksi ini secara PERMANEN dari seluruh data?',
                                () => handleDeleteGlobalTransaction(timestamp)
                            )}
                            onEditTransaction={handleEditGlobalTransaction}
                            aiSearchResults={aiSearchResults}
                            isSearchingWithAI={isSearchingWithAI}
                            aiSearchError={aiSearchError}
                            onAiSearch={handleAiSearch}
                            onClearAiSearch={handleClearAiSearch}
                       />;
            case 'visualizations':
                 return <Visualizations 
                            state={state} 
                            onBack={() => setCurrentPage('dashboard')} 
                            onAnalyzeChart={handleAnalyzeChartData}
                            activePersona={state.userProfile.activePersona}
                        />;
            case 'savings':
                 return <Savings 
                            state={state} 
                            onOpenAddGoalModal={() => setActiveModal('addSavingsGoal')} 
                            onOpenAddSavingsModal={(goalId) => { setCurrentSavingsGoalId(goalId); setActiveModal('addSavings'); }}
                            onOpenDetailModal={(goalId) => { setCurrentSavingsGoalId(goalId); setActiveModal('savingsDetail'); }}
                            onOpenSavingsGoal={handleOpenSavingsGoal}
                        />;
            case 'achievements':
                return <Achievements 
                    state={state}
                    allAchievements={allAchievements} 
                    unlockedAchievements={state.unlockedAchievements} 
                    achievementData={state.achievementData}
                    totalPoints={achievementPoints} 
                    userLevel={levelInfo}
                />;
            case 'personalBest':
                return <PersonalBest state={state} />;
            case 'netWorth':
                return <NetWorth 
                    state={state}
                    currentCashAsset={currentAsset}
                    onAddAsset={() => openAssetModal(null)}
                    onEditAsset={(assetId) => openAssetModal(assetId)}
                    onDeleteAsset={handleDeleteAsset}
                />;
            case 'wishlist':
                return <Wishlist 
                    wishlist={state.wishlist || []} 
                    onAddWishlist={() => setActiveModal('addWishlist')}
                    onFulfillWishlist={handleFulfillWishlist}
                    onCancelWishlist={handleCancelWishlist}
                    onDeleteWishlist={handleDeleteWishlist}
                />;
            case 'subscriptions':
                return <Subscriptions 
                    state={state}
                    onAddSubscription={handleAddSubscription}
                    onDeleteSubscription={handleDeleteSubscription}
                    onEditSubscription={handleEditSubscription}
                />;
            case 'profile':
                return <Profile 
                    state={state}
                    onUpdateProfile={handleUpdateProfile}
                    onBack={() => setCurrentPage('dashboard')}
                    totalPoints={grandTotalPoints}
                    totalBadges={unlockedAchIds.length}
                    userLevel={levelInfo}
                />;
            case 'shop': 
                return <Shop 
                    state={state}
                    availablePoints={availableShopPoints}
                    onBack={() => setCurrentPage('dashboard')}
                    onPurchase={handlePurchase}
                    onEquip={handleEquip}
                    onAddCustomTheme={handleAddCustomTheme}
                    onSpendPoints={handleSpendPoints}
                />;
            case 'customApp':
                return <CustomApp 
                    state={state}
                    onBack={() => setCurrentPage('dashboard')}
                    onEquip={handleEquip}
                />;
            case 'dashboard':
            default:
                return <Dashboard
                    state={state}
                    onUseDailyBudget={openUseDailyBudget}
                    onManageFunds={() => setActiveModal('funds')}
                    onUseBudget={openUseBudget}
                    onEditBudget={openEditBudget}
                    aiInsight={aiDashboardInsight}
                    isFetchingInsight={isFetchingDashboardInsight}
                    onRefreshInsight={handleFetchDashboardInsight}
                    onViewDailyHistory={openDailyHistory}
                    onAddBudget={() => setActiveModal('addBudget')}
                    onReorderBudgets={handleReorderBudgets}
                    onSetBudgetPermanence={handleSetBudgetPermanence}
                    onOpenBatchInput={openBatchInput}
                />;
        }
    };

    const budgetForInputModal = state.budgets.find(b => b.id === currentBudgetId);
    const savingsGoalForModal = state.savingsGoals.find(g => g.id === currentSavingsGoalId);
    const assetForModal = state.assets.find(a => a.id === currentAssetId);
    
    const handleInputSubmit = (data: { description: string, amount: number, targetId?: 'daily' | number, icon?: string, color?: string }) => {
        if (inputModalMode === 'edit-post' && data.icon && data.color) {
            handleEditBudget(data.description, data.amount, data.icon, data.color);
        } else if (data.targetId !== undefined) {
            handleAddTransaction(data.description, data.amount, data.targetId);
        }
    };

    const handleCloseBackupToast = () => {
        if (dailyBackup) {
            URL.revokeObjectURL(dailyBackup.url);
        }
        setDailyBackup(null);
    };


    // --- JSX ---
    return (
        <div className="container mx-auto max-w-3xl font-sans text-dark-text">
            <input type="file" ref={importFileInputRef} accept=".json" className="hidden" onChange={handleImportData} />
            <input type="file" ref={scanFileInputRef} accept="image/*" className="hidden" onChange={handleImageFileChange} />
            
            <AchievementUnlockedToast achievement={newlyUnlockedAchievement} />
            <NotificationToast messages={notifications} onClose={() => setNotifications([])} />

            {dailyBackup && <DailyBackupToast backup={dailyBackup} onClose={handleCloseBackupToast} />}

            {/* SECRET BUTTON FOR TESTING/CHEAT */}
            <div 
                onClick={handleSecretBonus} 
                className="fixed bottom-0 left-0 w-10 h-10 z-[9999] cursor-default opacity-0"
                title="Nothing to see here"
            />

            {renderPage()}
            
            <BottomNavBar 
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onOpenMenu={() => setActiveModal('menu')}
            />

            {/* --- MODALS --- */}
            <Modal isOpen={activeModal === 'input'} onClose={() => setActiveModal(null)} title={
                inputModalMode === 'edit-post' ? 'Edit Pos Anggaran' : 'Gunakan Uang'
            } originCoords={lastClickPos.current}>
                <InputModalContent 
                    mode={inputModalMode} 
                    budget={budgetForInputModal}
                    allBudgets={state.budgets.filter(b => !b.isArchived)}
                    onSubmit={handleInputSubmit}
                    onArchive={handleArchiveBudget}
                    prefillData={prefillData}
                    onPrefillConsumed={() => setPrefillData(null)}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'asset'} onClose={() => setActiveModal(null)} title={currentAssetId ? 'Edit Aset' : 'Tambah Aset Baru'} originCoords={lastClickPos.current}>
                <AssetModalContent
                    assetToEdit={assetForModal}
                    onSubmit={(id, name, quantity, price, type, symbol) => {
                        if(id) {
                            handleEditAssetItem(id, name, quantity, price, type, symbol);
                        } else {
                            handleAddAsset(name, quantity, price, type, symbol);
                        }
                    }}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'addWishlist'} onClose={() => setActiveModal(null)} title="Tambah Keinginan" originCoords={lastClickPos.current}>
                <AddWishlistModalContent onSubmit={handleAddWishlist} />
            </Modal>

            <Modal isOpen={activeModal === 'batchInput'} onClose={() => setActiveModal(null)} title="Catat Banyak Pengeluaran" size="lg" originCoords={lastClickPos.current}>
                <BatchInputModalContent 
                    budgets={state.budgets.filter(b => !b.isArchived)}
                    onSave={handleSaveScannedItems}
                />
            </Modal>

            <Modal isOpen={activeModal === 'addBudget'} onClose={() => setActiveModal(null)} title="Buat Pos Anggaran Baru" originCoords={lastClickPos.current}>
                <AddBudgetModalContent onSubmit={handleAddBudget} />
            </Modal>

            <Modal isOpen={activeModal === 'addSavingsGoal'} onClose={() => setActiveModal(null)} title="Buat Celengan Baru" originCoords={lastClickPos.current}>
                <AddSavingsGoalModalContent onSubmit={handleAddSavingsGoal} />
            </Modal>
            
            <Modal isOpen={activeModal === 'addSavings'} onClose={() => setActiveModal(null)} title={`Tambah Tabungan: ${savingsGoalForModal?.name || ''}`} originCoords={lastClickPos.current}>
                <AddSavingsModalContent
                    goal={savingsGoalForModal}
                    availableFunds={currentAvailableFunds}
                    onSubmit={(amount) => currentSavingsGoalId && handleAddSavings(currentSavingsGoalId, amount)}
                />
            </Modal>

            <Modal isOpen={activeModal === 'savingsDetail'} onClose={() => setActiveModal(null)} title={`Detail: ${savingsGoalForModal?.name || ''}`} originCoords={lastClickPos.current}>
                <SavingsDetailModalContent
                    goal={savingsGoalForModal}
                    onDelete={() => currentSavingsGoalId && handleDeleteSavingsGoal(currentSavingsGoalId)}
                />
            </Modal>


            <Modal isOpen={activeModal === 'funds'} onClose={() => setActiveModal(null)} title="Kelola Dana Bulan Ini" originCoords={lastClickPos.current}>
                <FundsManagementModalContent onSubmit={handleFundTransaction} onViewHistory={openFundHistory} />
            </Modal>
            
            <Modal isOpen={activeModal === 'history'} onClose={() => setActiveModal(null)} title={historyModalContent.title} originCoords={lastClickPos.current}>
                <HistoryModalContent 
                    transactions={historyModalContent.transactions} 
                    type={historyModalContent.type} 
                    budgetId={historyModalContent.budgetId}
                    onDelete={(timestamp, type, budgetId) => openConfirm("Yakin menghapus transaksi ini? Dana akan dikembalikan.", () => handleDeleteTransaction(timestamp, type, budgetId))} 
                />
            </Modal>

             <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="Info Keuangan Bulan Ini" originCoords={lastClickPos.current}>
                <InfoModalContent
                    monthlyIncome={monthlyIncome}
                    totalAllocated={totalAllocated}
                    unallocatedFunds={unallocatedFunds}
                    generalAndDailyExpenses={generalAndDailyExpenses}
                    remainingUnallocated={remainingUnallocated}
                />
            </Modal>

             <Modal isOpen={activeModal === 'editAsset'} onClose={() => setActiveModal(null)} title="Koreksi Saldo Aset" originCoords={lastClickPos.current}>
                <EditAssetModalContent currentAsset={currentAsset} onSubmit={handleEditAsset} />
            </Modal>
            
            <Modal isOpen={activeModal === 'menu'} onClose={() => setActiveModal(null)} title="Menu & Opsi" originCoords={lastClickPos.current}>
                <MainMenu 
                    onNavigate={(page) => { setCurrentPage(page); setActiveModal(null); }}
                    onShowInfo={() => setActiveModal('info')}
                    onManageFunds={() => setActiveModal('funds')}
                    onScanReceipt={() => scanFileInputRef.current?.click()}
                    onSmartInput={() => setActiveModal('smartInput')}
                    onVoiceInput={() => setActiveModal('voiceAssistant')}
                    onAskAI={handleOpenAIChat}
                    onGetAIAdvice={handleGetAIAdvice}
                    onOpenSettings={() => setActiveModal('settings')}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} title="Pengaturan & Opsi" originCoords={lastClickPos.current}>
                <SettingsModalContent
                    onExport={() => { setActiveModal(null); handleExportData(); }}
                    onImport={handleTriggerImport}
                    onManageArchived={() => setActiveModal('archivedBudgets')}
                    onManualBackup={handleManualBackup}
                    onManageBackups={() => setActiveModal('backupRestore')}
                    onResetMonthly={handleResetMonthlyData}
                    onResetAll={handleResetAllData}
                    onManualCloseBook={handleManualCloseBook}
                    lastImportDate={lastImportDate}
                    lastExportDate={lastExportDate}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'archivedBudgets'} onClose={() => setActiveModal(null)} title="Kelola Anggaran Diarsipkan" originCoords={lastClickPos.current}>
                <ArchivedBudgetsModalContent
                    archivedBudgets={state.budgets.filter(b => b.isArchived)}
                    onRestore={handleRestoreBudget}
                    onDelete={handleDeleteBudgetPermanently}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'backupRestore'} onClose={() => setActiveModal(null)} title="Cadangan Internal Otomatis" originCoords={lastClickPos.current}>
                <BackupRestoreModalContent
                    backups={internalBackups}
                    onRestore={handleRestoreBackup}
                />
            </Modal>

            <Modal isOpen={activeModal === 'scanResult'} onClose={() => setActiveModal(null)} title="Hasil Pindai Struk" originCoords={lastClickPos.current}>
                <ScanResultModalContent 
                    isLoading={isScanning}
                    error={scanError}
                    items={scannedItems}
                    budgets={state.budgets.filter(b => !b.isArchived)}
                    onItemsChange={setScannedItems}
                    onSave={() => handleSaveScannedItems(scannedItems)}
                />
            </Modal>
            
             <Modal isOpen={activeModal === 'voiceAssistant'} onClose={() => setActiveModal(null)} title="Asisten Suara Interaktif" size="lg" contentClassName="p-0" originCoords={lastClickPos.current}>
                {activeModal === 'voiceAssistant' && (
                    <VoiceAssistantModalContent
                        budgets={state.budgets.filter(b => !b.isArchived)}
                        activePersona={state.userProfile.activePersona}
                        onFinish={(items) => {
                            setVoiceAssistantResult(items);
                            setActiveModal('voiceResult');
                        }}
                        onClose={() => setActiveModal(null)}
                    />
                )}
            </Modal>
            
            <Modal isOpen={activeModal === 'voiceResult'} onClose={() => setActiveModal(null)} title="Konfirmasi Transaksi Suara" originCoords={lastClickPos.current}>
                <ScanResultModalContent
                    isLoading={false}
                    error={null}
                    items={voiceAssistantResult}
                    budgets={state.budgets.filter(b => !b.isArchived)}
                    onItemsChange={setVoiceAssistantResult}
                    onSave={() => {
                        handleSaveScannedItems(voiceAssistantResult);
                        setVoiceAssistantResult([]);
                    }}
                />
            </Modal>


            <Modal isOpen={activeModal === 'smartInput'} onClose={() => setActiveModal(null)} title="Input Transaksi Cerdas" originCoords={lastClickPos.current}>
                <SmartInputModalContent
                    isProcessing={isProcessingSmartInput}
                    error={smartInputError}
                    resultItems={smartInputResult}
                    budgets={state.budgets.filter(b => !b.isArchived)}
                    onProcess={handleProcessSmartInput}
                    onSave={() => handleSaveScannedItems(smartInputResult)}
                    onItemsChange={setSmartInputResult}
                    onClearError={() => setSmartInputError(null)}
                />
            </Modal>
            
             <Modal isOpen={activeModal === 'aiAdvice'} onClose={() => setActiveModal(null)} title="Saran Keuangan dari AI" originCoords={lastClickPos.current}>
                <AIAdviceModalContent 
                    isLoading={isFetchingAdvice}
                    error={adviceError}
                    advice={aiAdvice}
                />
            </Modal>
            
            <Modal isOpen={activeModal === 'aiChat'} onClose={() => {setActiveModal(null); setAiChatSession(null);}} title="Tanya AI" size="lg" contentClassName="p-0" originCoords={lastClickPos.current}>
                <AIChatModalContent
                    history={aiChatHistory}
                    isLoading={isAiChatLoading}
                    error={aiChatError}
                    onSendMessage={handleSendChatMessage}
                />
            </Modal>

            <ConfirmModal 
                isOpen={activeModal === 'confirm'}
                onClose={() => setActiveModal(null)}
                onConfirm={() => { confirmModalContent.onConfirm(); setActiveModal(null); }}
                message={confirmModalContent.message}
            />

        </div>
    );
};


// --- UI COMPONENTS ---
const BottomNavBar: React.FC<{
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onOpenMenu: () => void;
}> = ({ currentPage, onNavigate, onOpenMenu }) => {
    
    const NavItem = ({ page, icon: Icon, label }: { page: Page, icon: React.FC<{className?: string}>, label: string }) => {
        const isActive = currentPage === page;
        return (
            <button 
                onClick={() => onNavigate(page)}
                className="group flex flex-col items-center justify-center w-full h-full pt-3 pb-1 focus:outline-none"
            >
                <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                    <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary-navy' : 'text-gray-300 group-hover:text-gray-500'}`} />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-primary-navy' : 'text-gray-300 group-hover:text-gray-500'}`}>
                    {label}
                </span>
                <div className={`w-1 h-1 rounded-full bg-primary-navy mt-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_25px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
            <nav className="flex justify-between items-end h-[80px] px-2 pb-2 max-w-md mx-auto relative">
                
                <div className="flex-1 h-full">
                    <NavItem page="dashboard" icon={LayoutGridIcon} label="Dashboard" />
                </div>

                <div className="flex-1 h-full">
                    <NavItem page="reports" icon={ListBulletIcon} label="Laporan" />
                </div>

                <div className="relative w-16 h-full flex justify-center z-10">
                    <button
                        onClick={onOpenMenu}
                        className="absolute -top-6 w-14 h-14 bg-primary-navy rounded-full shadow-lg shadow-primary-navy/40 flex items-center justify-center transform transition-transform active:scale-95 border-4 border-white group"
                    >
                        <Squares2x2Icon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <span className="absolute bottom-4 text-[10px] font-bold text-secondary-gray pointer-events-none">Menu</span>
                </div>

                <div className="flex-1 h-full">
                    <NavItem page="visualizations" icon={ChartBarIcon} label="Grafik" />
                </div>

                <div className="flex-1 h-full">
                    <NavItem page="profile" icon={UserIcon} label="Profil" />
                </div>

            </nav>
        </div>
    );
}

const MainMenu: React.FC<{ 
    onNavigate: (page: Page) => void, 
    onShowInfo: () => void, 
    onManageFunds: () => void,
    onScanReceipt: () => void,
    onSmartInput: () => void,
    onVoiceInput: () => void,
    onAskAI: () => void,
    onGetAIAdvice: () => void, 
    onOpenSettings: () => void 
}> = (props) => {
    const menuItems = [
        { icon: PaintBrushIcon, label: 'Kustomisasi', action: () => props.onNavigate('customApp'), disabled: false }, 
        { icon: CreditCardIcon, label: 'Langganan', action: () => props.onNavigate('subscriptions'), disabled: false },
        { icon: BuildingLibraryIcon, label: 'Celengan', action: () => props.onNavigate('savings'), disabled: false },
        { icon: HeartIcon, label: 'Wishlist', action: () => props.onNavigate('wishlist'), disabled: false },
        { icon: CircleStackIcon, label: 'Aset', action: () => props.onNavigate('netWorth'), disabled: false },
        { icon: TrophyIcon, label: 'Lencana', action: () => props.onNavigate('achievements'), disabled: false },
        { icon: ShoppingBagIcon, label: 'Toko', action: () => props.onNavigate('shop'), disabled: false },
        { icon: FireIcon, label: 'Rekor', action: () => props.onNavigate('personalBest'), disabled: false },
        { icon: ListBulletIcon, label: 'Info', action: props.onShowInfo, disabled: false },
        { icon: DocumentTextIcon, label: 'Dana', action: props.onManageFunds, disabled: false },
        { icon: CameraIcon, label: 'Scan', action: props.onScanReceipt, disabled: false },
        { icon: SparklesIcon, label: 'Input Cerdas', action: props.onSmartInput, disabled: false },
        { icon: LightbulbIcon, label: 'Saran AI', action: props.onGetAIAdvice, disabled: false },
        { icon: ChatBubbleLeftRightIcon, label: 'Tanya AI', action: props.onAskAI, disabled: false },
        { icon: SpeakerWaveIcon, label: 'Suara', action: props.onVoiceInput, disabled: false },
        { icon: Cog6ToothIcon, label: 'Pengaturan', action: props.onOpenSettings, disabled: false },
    ];
    return (
         <div className="grid grid-cols-4 gap-3 p-2">
            {menuItems.map(item => (
                <button 
                    key={item.label} 
                    onClick={item.action} 
                    disabled={item.disabled}
                    className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 space-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-100"
                    title={item.disabled ? 'Fitur Terkunci' : ''}
                >
                    <item.icon className="w-7 h-7 text-primary-navy" />
                    {item.disabled && (
                        <div className="absolute top-1 right-1 bg-gray-600 bg-opacity-80 rounded-full p-0.5">
                            <LockClosedIcon className="w-3 h-3 text-white" />
                        </div>
                    )}
                    <span className="text-[10px] font-medium text-center text-secondary-gray leading-tight">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default App;
