
import React, { useState, useRef } from 'react';
import type { AppState, ShopItem, CustomTheme } from '../types';
import { ShoppingBagIcon, SparklesIcon, LockClosedIcon, CheckCircleIcon, PaintBrushIcon, UserIcon, StarIconFilled, HeartIcon, ShieldCheckIcon, Squares2x2Icon, LightbulbIcon, ArrowPathIcon, PhotoIcon, SpeakerWaveIcon, BuildingLibraryIcon, CameraIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon } from './Icons';
import { GoogleGenAI, Type } from '@google/genai';

// --- DATA BARANG DAGANGAN (SHOP ITEMS) ---
export const SHOP_ITEMS: ShopItem[] = [
    // --- THEMES ---
    { id: 'theme_default', name: 'Standar Navy', description: 'Tampilan klasik profesional.', price: 0, type: 'theme', value: 'theme_default', icon: 'PaintBrushIcon' },
    { id: 'theme_dark', name: 'Mode Gelap', description: 'Elegan dan nyaman di mata.', price: 500, type: 'theme', value: 'theme_dark', icon: 'PaintBrushIcon' },
    { id: 'theme_teal', name: 'Teal Fresh', description: 'Nuansa hijau segar.', price: 300, type: 'theme', value: 'theme_teal', icon: 'PaintBrushIcon' },
    { id: 'theme_gold', name: 'Sultan Gold', description: 'Kemewahan para jutawan.', price: 2000, type: 'theme', value: 'theme_gold', icon: 'PaintBrushIcon' },
    
    // --- GRADIENT THEMES ---
    { id: 'theme_sunset', name: 'Senja (Sunset)', description: 'Gradasi oranye hangat.', price: 1200, type: 'theme', value: 'theme_sunset', icon: 'PaintBrushIcon' },
    { id: 'theme_ocean', name: 'Samudra (Ocean)', description: 'Kedalaman biru laut.', price: 1200, type: 'theme', value: 'theme_ocean', icon: 'PaintBrushIcon' },
    { id: 'theme_berry', name: 'Beri (Berry)', description: 'Sentuhan pink & ungu.', price: 1200, type: 'theme', value: 'theme_berry', icon: 'PaintBrushIcon' },

    // --- FEMININE THEMES ---
    { id: 'theme_rose', name: 'Rose Gold', description: 'Sentuhan pink mewah.', price: 1500, type: 'theme', value: 'theme_rose', icon: 'HeartIcon' },
    { id: 'theme_lavender', name: 'Lavender Soft', description: 'Ungu lembut menenangkan.', price: 1500, type: 'theme', value: 'theme_lavender', icon: 'SparklesIcon' },
    { id: 'theme_mint', name: 'Minty Fresh', description: 'Hijau pastel ceria.', price: 1500, type: 'theme', value: 'theme_mint', icon: 'SparklesIcon' },

    // --- MASCULINE THEMES ---
    { id: 'theme_midnight', name: 'Midnight Pro', description: 'Mode gelap biru deep.', price: 1800, type: 'theme', value: 'theme_midnight', icon: 'LockClosedIcon' },
    { id: 'theme_forest', name: 'Ranger Green', description: 'Nuansa hutan taktis.', price: 1800, type: 'theme', value: 'theme_forest', icon: 'ShieldCheckIcon' },
    { id: 'theme_slate', name: 'Slate Monochrome', description: 'Hitam putih minimalis.', price: 1800, type: 'theme', value: 'theme_slate', icon: 'Squares2x2Icon' },

    // --- TITLES (Reduced to 25% price) ---
    { id: 'title_hemat', name: 'Si Hemat', description: 'Gelar penjaga dompet.', price: 37, type: 'title', value: 'Si Hemat', icon: 'UserIcon' },
    { id: 'title_boss', name: 'Big Boss', description: 'Tunjukkan siapa bosnya.', price: 125, type: 'title', value: 'Big Boss', icon: 'UserIcon' },
    { id: 'title_investor', name: 'Investor Ulung', description: 'Fokus masa depan.', price: 200, type: 'title', value: 'Investor Ulung', icon: 'UserIcon' },
    { id: 'title_sultan', name: 'Sultan Muda', description: 'Gelar tertinggi.', price: 750, type: 'title', value: 'Sultan Muda', icon: 'UserIcon' },

    // --- FRAMES (Reduced to 25% price) ---
    { id: 'frame_wood', name: 'Bingkai Kayu', description: 'Sederhana dan natural.', price: 50, type: 'frame', value: 'border-yellow-700', icon: 'StarIconFilled' },
    { id: 'frame_silver', name: 'Bingkai Perak', description: 'Berkilau dan berkelas.', price: 150, type: 'frame', value: 'border-gray-300 ring-2 ring-gray-100', icon: 'StarIconFilled' },
    { id: 'frame_gold', name: 'Bingkai Emas', description: 'Bingkai para juara.', price: 375, type: 'frame', value: 'border-yellow-400 ring-4 ring-yellow-200', icon: 'StarIconFilled' },
    { id: 'frame_diamond', name: 'Diamond Aura', description: 'Bingkai neon futuristik.', price: 1250, type: 'frame', value: 'border-cyan-400 ring-4 ring-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.8)]', icon: 'StarIconFilled' },

    // --- AI PERSONAS ---
    { id: 'persona_default', name: 'Asisten Standar', description: 'Ramah & Profesional.', price: 0, type: 'persona', value: 'default', icon: 'UserIcon' },
    { id: 'persona_grandma', name: 'Nenek Penyayang', description: 'Nasihat bijak & lembut.', price: 800, type: 'persona', value: 'grandma', icon: 'HeartIcon' },
    { id: 'persona_wolf', name: 'Wall Street Wolf', description: 'Agresif & fokus profit.', price: 1000, type: 'persona', value: 'wolf', icon: 'ArrowPathIcon' },
    { id: 'persona_comedian', name: 'Si Komika', description: 'Saran penuh candaan.', price: 1200, type: 'persona', value: 'comedian', icon: 'SparklesIcon' },
    // NEW PERSONAS
    { id: 'persona_oppa', name: 'Oppa Korea', description: 'Manis, romantis & perhatian.', price: 1500, type: 'persona', value: 'oppa', icon: 'StarIconFilled' },
    { id: 'persona_flirty', name: 'Si Penggoda', description: 'Playful & penuh pesona.', price: 1500, type: 'persona', value: 'flirty', icon: 'HeartIcon' },
    { id: 'persona_dad', name: 'Ayah Suportif', description: 'Selalu bangga padamu.', price: 1000, type: 'persona', value: 'dad', icon: 'ShieldCheckIcon' },
    { id: 'persona_mom', name: 'Ibu Galak', description: 'Tegas, cerewet & disiplin.', price: 1000, type: 'persona', value: 'mom', icon: 'ExclamationTriangleIcon' },
];

interface ShopProps {
    state: AppState;
    availablePoints: number;
    onBack: () => void;
    onPurchase: (item: ShopItem) => void;
    onEquip: (item: ShopItem) => void;
    onAddCustomTheme?: (theme: CustomTheme, price: number) => void;
    onSpendPoints?: (amount: number) => void;
}

const formatPoints = (pts: number) => new Intl.NumberFormat('id-ID').format(pts);

// Helper to safely retrieve API Key
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

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const compressImage = (base64Data: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Data;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 640; 
            const scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6)); 
            } else {
                resolve(base64Data);
            }
        };
        img.onerror = () => {
            console.warn("Image compression failed, using original.");
            resolve(base64Data);
        };
    });
};

// --- COLOR UTILS ---
const sanitizeColorToRgb = (colorInput: string, defaultColor: string = '255 255 255'): string => {
    if (!colorInput) return defaultColor;
    let clean = colorInput.trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try {
            const arr = JSON.parse(clean);
            if (Array.isArray(arr) && arr.length === 3) return `${arr[0]} ${arr[1]} ${arr[2]}`;
        } catch (e) {}
    }
    if (clean.startsWith('#')) {
        clean = clean.substring(1);
    }
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `${r} ${g} ${b}`;
    }
    const nums = clean.match(/\d+/g);
    if (nums && nums.length === 3) {
        return `${nums[0]} ${nums[1]} ${nums[2]}`;
    }
    return defaultColor;
};

const getLuminance = (rgbString: string): number => {
    const rgb = rgbString.split(' ').map(Number);
    if (rgb.length !== 3) return 255; 
    const [r, g, b] = rgb;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastTextColor = (bgRgbString: string): string => {
    const lum = getLuminance(bgRgbString);
    return lum > 140 ? '0 0 0' : '255 255 255';
};

const adjustColorBrightness = (bgRgbString: string, adjustment: number): string => {
    const rgb = bgRgbString.split(' ').map(Number);
    if (rgb.length !== 3) return bgRgbString;
    return rgb.map(c => Math.min(255, Math.max(0, c + adjustment))).join(' ');
};

const Shop: React.FC<ShopProps> = ({ state, availablePoints, onBack, onPurchase, onEquip, onAddCustomTheme, onSpendPoints }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'theme' | 'title' | 'frame' | 'special' | 'lab'>('all');
    
    // Lab State
    const [labMode, setLabMode] = useState<'text' | 'image'>('text');
    const [themeConcept, setThemeConcept] = useState('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTheme, setGeneratedTheme] = useState<CustomTheme | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLabUnlocked = state.inventory.includes('feature_ai_lab');
    const LAB_UNLOCK_PRICE = 4000;
    const THEME_GEN_PRICE = 25;

    const customThemeItems: ShopItem[] = (state.customThemes || []).map(ct => ({
        id: ct.id,
        name: ct.name,
        description: 'Tema Kustom Buatanmu',
        price: 0,
        type: 'theme',
        value: ct.id,
        icon: 'PaintBrushIcon'
    }));

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (activeTab === 'all') return true;
        if (activeTab === 'special') return ['persona', 'banner'].includes(item.type);
        return item.type === activeTab;
    });
    
    const itemsToDisplay = (activeTab === 'theme' || activeTab === 'all') ? [...filteredItems, ...customThemeItems] : filteredItems;

    const isOwned = (itemId: string) => state.inventory.includes(itemId) || itemId === 'theme_default' || itemId.startsWith('custom_');
    const isEquipped = (item: ShopItem) => {
        if (item.type === 'theme') return state.activeTheme === item.value;
        if (item.type === 'title') return state.userProfile.customTitle === item.value;
        if (item.type === 'frame') return state.userProfile.frameId === item.value;
        if (item.type === 'persona') return state.userProfile.activePersona === item.value;
        if (item.type === 'banner') return state.userProfile.activeBanner === item.value;
        return false;
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const rawBase64 = await fileToBase64(e.target.files[0]);
                const compressed = await compressImage(rawBase64);
                setUploadedImage(compressed);
                setGeneratedTheme(null);
            } catch (err) {
                setGenError("Gagal memproses gambar.");
            }
        }
    };

    const handleUnlockLab = () => {
        if (availablePoints < LAB_UNLOCK_PRICE) return;
        const unlockItem: ShopItem = {
            id: 'feature_ai_lab',
            name: 'Akses Desainer Tema AI',
            description: 'Fitur Premium',
            price: LAB_UNLOCK_PRICE,
            type: 'special',
            value: 'unlock',
            icon: 'SparklesIcon'
        };
        onPurchase(unlockItem);
    };

    const handleGenerateTheme = async () => {
        if (availablePoints < THEME_GEN_PRICE) {
            setGenError(`Mustika kurang! Butuh ${THEME_GEN_PRICE} Mustika.`);
            return;
        }
        if (labMode === 'text' && !themeConcept.trim()) {
            setGenError('Tulis konsep tema dulu, dong!');
            return;
        }
        if (labMode === 'image' && !uploadedImage) {
            setGenError('Pilih gambar dari galeri dulu!');
            return;
        }

        if (onSpendPoints) onSpendPoints(THEME_GEN_PRICE);

        setIsGenerating(true);
        setGenError(null);
        setGeneratedTheme(null);

        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            
            const paletteSchema = {
                type: Type.OBJECT,
                properties: {
                    primaryNavy: { type: Type.STRING },
                    primaryNavyDark: { type: Type.STRING },
                    accentTeal: { type: Type.STRING },
                    accentTealDark: { type: Type.STRING },
                    lightBg: { type: Type.STRING },
                    darkText: { type: Type.STRING },
                    secondaryGray: { type: Type.STRING },
                },
                required: ["primaryNavy", "primaryNavyDark", "accentTeal", "accentTealDark", "lightBg", "darkText", "secondaryGray"]
            };

            let colors;
            let finalImageUrl = '';
            let themeName = '';

            if (labMode === 'text') {
                const palettePrompt = `Create a unique color palette for a UI theme based on this concept: "${themeConcept}".
                Return ONLY valid JSON with RGB color numbers (e.g., "255 255 255").
                Ensure the colors are harmonious with the concept.`;

                const imagePrompt = `A high-quality, aesthetic mobile wallpaper representing the concept: ${themeConcept}. Artistic, clean, suitable for app background. No text.`;

                const [paletteResponse, imageResponse] = await Promise.all([
                    ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: palettePrompt,
                        config: { responseMimeType: 'application/json', responseSchema: paletteSchema }
                    }),
                    ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: imagePrompt }] }
                    })
                ]);

                colors = JSON.parse(paletteResponse.text || "{}");
                
                const parts = imageResponse.candidates?.[0]?.content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                            finalImageUrl = await compressImage(dataUrl);
                            break;
                        }
                    }
                }
                if (!finalImageUrl) throw new Error("Gagal membuat gambar.");
                themeName = themeConcept;

            } else {
                finalImageUrl = uploadedImage!;
                themeName = "Tema dari Galeri";

                const analysisPrompt = `Analyze this image and create a UI color palette.
                Return ONLY valid JSON with RGB color numbers (e.g. "255 255 255") for these keys:
                - primaryNavy: Dominant strong/dark color
                - primaryNavyDark: Darker version of primary
                - accentTeal: Vibrant accent color found in image
                - accentTealDark: Darker accent
                - lightBg: Dominant atmospheric/background color
                - darkText: High contrast text color relative to lightBg
                - secondaryGray: Secondary text color`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: 'image/jpeg', data: finalImageUrl.split(',')[1] } },
                            { text: analysisPrompt }
                        ]
                    },
                    config: { responseMimeType: 'application/json', responseSchema: paletteSchema }
                });
                colors = JSON.parse(response.text || "{}");
            }

            const cardBgColor = sanitizeColorToRgb(colors.lightBg, '255 255 255');
            const isCardDark = getLuminance(cardBgColor) < 140;
            const contrastText = getContrastTextColor(cardBgColor); 
            const secondaryText = isCardDark ? '156 163 175' : '107 114 128'; 

            const newTheme: CustomTheme = {
                id: `custom_${Date.now()}`,
                name: themeName.length > 20 ? themeName.substring(0, 20) + '...' : themeName,
                colors: {
                    '--color-primary-navy': sanitizeColorToRgb(colors.primaryNavy, '44 62 80'),
                    '--color-primary-navy-dark': sanitizeColorToRgb(colors.primaryNavyDark, '31 43 56'),
                    '--color-accent-teal': sanitizeColorToRgb(colors.accentTeal, '26 188 156'),
                    '--color-accent-teal-dark': sanitizeColorToRgb(colors.accentTealDark, '22 160 133'),
                    '--color-light-bg': cardBgColor,
                    '--color-dark-text': contrastText,
                    '--color-secondary-gray': secondaryText,
                    '--app-background': `url('${finalImageUrl}') center center / cover no-repeat fixed`,
                    '--color-white': cardBgColor,
                    '--color-gray-50': adjustColorBrightness(cardBgColor, isCardDark ? 20 : -10),
                    '--color-gray-100': adjustColorBrightness(cardBgColor, isCardDark ? 30 : -20),
                    '--color-gray-200': adjustColorBrightness(cardBgColor, isCardDark ? 40 : -30)
                }
            };
            
            setGeneratedTheme(newTheme);

        } catch (err: any) {
            console.error(err);
            setGenError(err.message || 'Gagal meracik tema.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveCustomTheme = () => {
        if (generatedTheme && onAddCustomTheme) {
            onAddCustomTheme(generatedTheme, 0);
            setGeneratedTheme(null);
            setThemeConcept('');
            setUploadedImage(null);
            setActiveTab('theme');
        }
    };

    const getGradientByType = (type: string) => {
        switch(type) {
            case 'theme': return 'from-blue-500 to-cyan-400';
            case 'title': return 'from-purple-500 to-pink-500';
            case 'frame': return 'from-amber-400 to-orange-500';
            case 'persona': return 'from-emerald-400 to-teal-500';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    return (
        <main className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* GLASSMORPHIC HEADER */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20 px-6 py-4 shadow-sm flex justify-between items-center">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-secondary-gray">
                    <ArrowUturnLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-extrabold text-primary-navy tracking-tight">TOKO MUSTIKA</h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto pb-32 scroll-smooth no-scrollbar">
                <div className="p-6 space-y-8 max-w-3xl mx-auto">
                    
                    {/* WALLET CARD (Holographic Style) */}
                    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
                        {/* Animated Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 animate-gradient-xy"></div>
                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium tracking-wider">
                                    MEMBER VIP
                                </div>
                                <SparklesIcon className="w-8 h-8 text-yellow-300 drop-shadow-glow animate-pulse" />
                            </div>
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wide">Saldo Mustika</p>
                                <h2 className="text-5xl font-black tracking-tighter drop-shadow-md">
                                    {formatPoints(availablePoints)}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION PILLS */}
                    <nav className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                        {[
                            { id: 'all', label: 'Semua', icon: Squares2x2Icon },
                            { id: 'theme', label: 'Tema', icon: PaintBrushIcon },
                            { id: 'title', label: 'Gelar', icon: UserIcon },
                            { id: 'frame', label: 'Bingkai', icon: StarIconFilled },
                            { id: 'special', label: 'Spesial', icon: SparklesIcon },
                            { id: 'lab', label: 'Lab AI', icon: LightbulbIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap shadow-sm
                                    ${activeTab === tab.id 
                                    ? 'bg-primary-navy text-white shadow-primary-navy/30 scale-105 ring-2 ring-primary-navy ring-offset-2' 
                                    : 'bg-white text-secondary-gray hover:bg-gray-100'}`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-yellow-300' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* CONTENT AREA */}
                    {activeTab === 'lab' ? (
                        // --- AI LAB / STUDIO MODE ---
                        <div className="bg-gray-900 rounded-3xl p-1 shadow-2xl border border-gray-800 overflow-hidden text-gray-100 min-h-[500px]">
                            {/* Studio Header */}
                            <div className="bg-gray-800/50 p-6 text-center border-b border-gray-700 relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                                    STUDIO TEMA AI
                                </h2>
                                <p className="text-gray-400 text-sm">Racik tema eksklusif dari imajinasi atau fotomu.</p>
                            </div>

                            {!isLabUnlocked ? (
                                // LOCKED STUDIO
                                <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
                                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-700 relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                        <LockClosedIcon className="w-10 h-10 text-gray-500" />
                                        <div className="absolute -bottom-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">PREMIUM</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Akses Terbatas</h3>
                                    <p className="text-gray-400 mb-8 text-sm max-w-xs">Buka studio ini untuk menciptakan tema tanpa batas selamanya.</p>
                                    <button 
                                        onClick={handleUnlockLab}
                                        disabled={availablePoints < LAB_UNLOCK_PRICE}
                                        className="w-full max-w-xs bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                    >
                                        <LockClosedIcon className="w-5 h-5" />
                                        Buka Akses ({formatPoints(LAB_UNLOCK_PRICE)})
                                    </button>
                                </div>
                            ) : (
                                // UNLOCKED STUDIO
                                <div className="p-6 space-y-6">
                                    {/* Input Mode Toggle */}
                                    <div className="flex bg-gray-800 p-1.5 rounded-xl">
                                        <button onClick={() => setLabMode('text')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${labMode === 'text' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                                            Tulis Konsep
                                        </button>
                                        <button onClick={() => setLabMode('image')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${labMode === 'image' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                                            Upload Foto
                                        </button>
                                    </div>

                                    {/* Input Area */}
                                    {labMode === 'text' ? (
                                        <textarea 
                                            value={themeConcept}
                                            onChange={(e) => setThemeConcept(e.target.value)}
                                            placeholder="Contoh: Cyberpunk neon city, deep purple atmosphere..."
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-32 resize-none"
                                        />
                                    ) : (
                                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 hover:border-purple-500 transition-all group relative overflow-hidden">
                                            {uploadedImage ? (
                                                <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                            ) : (
                                                <CameraIcon className="w-10 h-10 text-gray-600 group-hover:text-purple-400 mb-2 transition-colors" />
                                            )}
                                            <span className="relative z-10 text-sm font-medium text-gray-400 group-hover:text-white">{uploadedImage ? 'Ganti Gambar' : 'Pilih dari Galeri'}</span>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                                        </div>
                                    )}

                                    {genError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{genError}</p>}

                                    <button 
                                        onClick={handleGenerateTheme}
                                        disabled={isGenerating}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5 text-yellow-200"/>}
                                        {isGenerating ? 'Sedang Meracik...' : `Generate (${THEME_GEN_PRICE} Mustika)`}
                                    </button>

                                    {/* RESULT PREVIEW */}
                                    {generatedTheme && (
                                        <div className="mt-8 border-t border-gray-800 pt-6 animate-fade-in-up">
                                            <h3 className="text-center text-gray-400 text-sm uppercase font-bold tracking-widest mb-4">PREVIEW HASIL</h3>
                                            
                                            {/* Phone Mockup */}
                                            <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[2.5rem] border-4 border-gray-800 shadow-2xl overflow-hidden">
                                                {/* Mockup Screen Content */}
                                                <div 
                                                    className="w-full h-full flex flex-col"
                                                    style={{ 
                                                        background: generatedTheme.colors['--app-background'],
                                                        backgroundSize: 'cover'
                                                    }}
                                                >
                                                    {/* Mock App Header */}
                                                    <div className="p-4 backdrop-blur-md" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-light-bg']} / 0.8)` }}>
                                                        <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-primary-navy']})` }}></div>
                                                        <div className="h-4 w-32 rounded mb-1" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-primary-navy']})` }}></div>
                                                        <div className="h-2 w-20 rounded" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-secondary-gray']})` }}></div>
                                                    </div>
                                                    
                                                    {/* Mock App Body */}
                                                    <div className="flex-1 p-4 flex items-center justify-center">
                                                        <div className="bg-white/90 p-4 rounded-xl shadow-lg w-full backdrop-blur-sm">
                                                            <h4 className="font-bold mb-2" style={{ color: `rgb(${generatedTheme.colors['--color-primary-navy-dark']})` }}>{generatedTheme.name}</h4>
                                                            <p className="text-xs mb-3" style={{ color: `rgb(${generatedTheme.colors['--color-dark-text']})` }}>Contoh tampilan kartu.</p>
                                                            <div className="h-8 rounded-lg w-full" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-accent-teal']})` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleSaveCustomTheme}
                                                className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/30 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                                Simpan & Pakai (GRATIS)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // --- STANDARD SHOP GRID ---
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {itemsToDisplay.map((item) => {
                                const owned = isOwned(item.id) || item.price === 0;
                                const equipped = isEquipped(item);
                                const canAfford = availablePoints >= item.price;
                                const gradientClass = getGradientByType(item.type);

                                return (
                                    <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:-translate-y-1">
                                        
                                        {/* Item Visual Area */}
                                        <div className={`relative h-32 bg-gradient-to-br ${gradientClass} flex items-center justify-center p-6`}>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-inner">
                                                {item.type === 'theme' && <PaintBrushIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                                {item.type === 'title' && <UserIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                                {item.type === 'frame' && <StarIconFilled className="w-8 h-8 text-white drop-shadow-md" />}
                                                {item.type === 'persona' && <SpeakerWaveIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                                {item.type === 'banner' && <PhotoIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                            </div>
                                            
                                            {/* Status Badges */}
                                            {equipped && (
                                                <div className="absolute top-2 right-2 bg-white/90 text-green-600 p-1.5 rounded-full shadow-sm" title="Sedang Dipakai">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                            {!equipped && owned && (
                                                <div className="absolute top-2 right-2 bg-black/30 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
                                                    MILIKMU
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1 justify-between">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-dark-text text-sm leading-tight mb-1">{item.name}</h3>
                                                <p className="text-[10px] text-secondary-gray leading-relaxed line-clamp-2">{item.description}</p>
                                            </div>

                                            {/* Action Button */}
                                            {owned ? (
                                                <button 
                                                    onClick={() => onEquip(item)}
                                                    disabled={equipped}
                                                    className={`w-full py-2 rounded-lg font-bold text-xs transition-colors
                                                        ${equipped 
                                                            ? 'bg-gray-100 text-gray-400 cursor-default' 
                                                            : 'bg-primary-navy text-white hover:bg-primary-navy-dark shadow-md'
                                                        }`}
                                                >
                                                    {equipped ? 'Dipakai' : 'Pakai'}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onPurchase(item)}
                                                    disabled={!canAfford}
                                                    className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all
                                                        ${canAfford 
                                                            ? 'bg-white border-2 border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white' 
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {canAfford ? (
                                                        <>Beli <span className="font-extrabold">{formatPoints(item.price)}</span></>
                                                    ) : (
                                                        <span>Kurang {formatPoints(item.price - availablePoints)}</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Shop;
