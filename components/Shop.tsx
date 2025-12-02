
import React, { useState, useRef, useMemo } from 'react';
import type { AppState, ShopItem, CustomTheme } from '../types';
import { ShoppingBagIcon, SparklesIcon, LockClosedIcon, CheckCircleIcon, PaintBrushIcon, UserIcon, StarIconFilled, HeartIcon, ShieldCheckIcon, Squares2x2Icon, LightbulbIcon, ArrowPathIcon, PhotoIcon, SpeakerWaveIcon, BuildingLibraryIcon, CameraIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon, FireIcon, RocketLaunchIcon, CircleStackIcon, PencilSquareIcon, ClockIcon, ChartBarIcon, ReceiptPercentIcon } from './Icons';
import { GoogleGenAI, Type } from '@google/genai';
import { SKIN_ASSETS } from '../assets';

// --- DATA BARANG DAGANGAN (SHOP ITEMS) ---
export const SHOP_ITEMS: ShopItem[] = [
    // --- CHART SKINS (New Category) ---
    { id: 'trend_neon', name: 'Neon Cyber', description: 'Glow ungu futuristik untuk grafik tren.', price: 1000, type: 'chart_skin', category: 'trend', value: 'trend_neon', icon: 'ChartBarIcon' },
    { id: 'trend_sunset', name: 'Sunset Blaze', description: 'Gradasi oranye api yang hangat.', price: 1000, type: 'chart_skin', category: 'trend', value: 'trend_sunset', icon: 'ChartBarIcon' },
    { id: 'trend_matrix', name: 'Matrix Code', description: 'Tampilan terminal hacker hijau hitam.', price: 1200, type: 'chart_skin', category: 'trend', value: 'trend_matrix', icon: 'ChartBarIcon' },
    { id: 'trend_ocean', name: 'Deep Ocean', description: 'Biru laut yang menenangkan.', price: 500, type: 'chart_skin', category: 'trend', value: 'trend_ocean', icon: 'ChartBarIcon' },
    { id: 'trend_glitch', name: 'Cyber Glitch', description: 'Efek glitch matriks hijau-hitam dengan scanlines.', price: 1800, type: 'chart_skin', category: 'trend', value: 'trend_glitch', icon: 'ChartBarIcon' }, // SPECIAL
    { id: 'trend_magma', name: 'Magma Flow', description: 'Aliran lahar panas yang bergerak.', price: 1800, type: 'chart_skin', category: 'trend', value: 'trend_magma', icon: 'ChartBarIcon' }, // NEW SPECIAL
    { id: 'trend_default', name: 'Standar Biru', description: 'Tampilan bawaan.', price: 0, type: 'chart_skin', category: 'trend', value: 'trend_default', icon: 'ChartBarIcon' },

    { id: 'budget_glass', name: 'Glassmorphism', description: 'Efek kaca modern untuk batang anggaran.', price: 1000, type: 'chart_skin', category: 'budget', value: 'budget_glass', icon: 'ChartBarIcon' },
    { id: 'budget_rainbow', name: 'Rainbow Blocks', description: 'Warna-warni cerah setiap batang.', price: 1000, type: 'chart_skin', category: 'budget', value: 'budget_rainbow', icon: 'ChartBarIcon' },
    { id: 'budget_holo', name: 'Holographic', description: 'Efek hologram cyan berkedip.', price: 1200, type: 'chart_skin', category: 'budget', value: 'budget_holo', icon: 'ChartBarIcon' },
    { id: 'budget_pastel', name: 'Soft Pastel', description: 'Warna lembut yang enak dipandang.', price: 500, type: 'chart_skin', category: 'budget', value: 'budget_pastel', icon: 'ChartBarIcon' },
    { id: 'budget_gold', name: 'Royal Gold 3D', description: 'Batang emas murni 3D dengan kilauan mewah.', price: 1800, type: 'chart_skin', category: 'budget', value: 'budget_gold', icon: 'ChartBarIcon' }, // SPECIAL
    { id: 'budget_default', name: 'Standar Outline', description: 'Tampilan bawaan.', price: 0, type: 'chart_skin', category: 'budget', value: 'budget_default', icon: 'ChartBarIcon' },

    // --- SPECIAL THEMES (Price Adjusted: 3000) ---
    { id: 'theme_living_mood', name: 'Living Mood (Hidup)', description: 'Background bereaksi real-time terhadap kesehatan finansialmu (Cerah/Hujan/Badai).', price: 3000, type: 'theme', category: 'special', value: 'theme_living_mood', icon: 'SparklesIcon' },
    { id: 'theme_dynamic_time', name: 'Waktu Dinamis', description: 'Background mengikuti waktu dunia nyata (Pagi/Siang/Sore/Malam).', price: 3000, type: 'theme', category: 'special', value: 'theme_dynamic_time', icon: 'ClockIcon' },
    { id: 'theme_cyberpunk_battery', name: 'Cyberpunk Battery', description: 'Indikator Baterai Asli! Tampilan mengikuti sisa baterai HP-mu.', price: 3000, type: 'theme', category: 'special', value: 'theme_cyberpunk_battery', icon: 'SparklesIcon' },
    { id: 'theme_thermal_heat', name: 'Thermal Heat', description: 'Suhu belanja harian. Beku saat hemat, Mendidih saat boros.', price: 3000, type: 'theme', category: 'special', value: 'theme_thermal_heat', icon: 'FireIcon' },

    // --- SAVINGS SKINS (CELENGAN) ---
    // RARE (750)
    { id: 'skin_pet_swan', name: 'Pet Angsa (Swan)', description: 'Telur emas yang akan menetas menjadi angsa mahkota nan anggun.', price: 750, type: 'savings_skin', value: 'swan', icon: 'HeartIcon', rarity: 'rare' },
    { id: 'skin_pet_robot', name: 'Robo-Bank 3000', description: 'Teknologi masa depan untuk mengamankan aset digitalmu.', price: 750, type: 'savings_skin', value: 'robot', icon: 'RocketLaunchIcon', rarity: 'rare' },
    { id: 'skin_plant_anthurium', name: 'Tanaman Anturium', description: 'Tanaman hias merah merona yang melambangkan kekayaan dan cinta.', price: 750, type: 'savings_skin', value: 'anthurium', icon: 'SparklesIcon', rarity: 'rare' },
    { id: 'skin_plant_aglonema', name: 'Aglonema', description: 'Sri Rejeki pembawa hoki. Daun merahnya mempesona.', price: 750, type: 'savings_skin', value: 'aglonema', icon: 'FireIcon', rarity: 'rare' },

    // LEGENDARY (1250)
    { id: 'skin_pet_jellyfish', name: 'Ubur-ubur Kosmik', description: 'Berenang di lautan bintang. Menenangkan dan indah.', price: 1250, type: 'savings_skin', value: 'jellyfish', icon: 'SparklesIcon', rarity: 'legendary' },
    { id: 'skin_pet_turtle', name: 'Kura-kura Permata', description: 'Lambat tapi pasti. Tempurungnya dipenuhi kristal berharga.', price: 1250, type: 'savings_skin', value: 'turtle', icon: 'ShieldCheckIcon', rarity: 'legendary' },
    { id: 'skin_plant_monstera', name: 'Monstera Deliciousa', description: 'Si janda bolong yang estetik. Daunnya semakin besar dan membelah.', price: 1250, type: 'savings_skin', value: 'monstera', icon: 'ShieldCheckIcon', rarity: 'legendary' },
    { id: 'skin_plant_higanbana', name: 'Higanbana', description: 'Red Spider Lily. Bunga kematian yang memikat dan misterius.', price: 1250, type: 'savings_skin', value: 'higanbana', icon: 'StarIconFilled', rarity: 'legendary' },
    { id: 'skin_plant_sakura', name: 'Pohon Sakura', description: 'Bawa nuansa Jepang. Mekar penuh dengan bunga pink yang indah.', price: 1250, type: 'savings_skin', value: 'sakura', icon: 'SparklesIcon', rarity: 'legendary' },

    // MYTHICAL (2000)
    { id: 'skin_pet_dragon', name: 'Naga Emas (Dragon)', description: 'Penjaga harta karun legendaris. Simbol keberuntungan tertinggi.', price: 2000, type: 'savings_skin', value: 'dragon', icon: 'FireIcon', rarity: 'mythical' },
    { id: 'skin_pet_fox', name: 'Rubah Ekor 9 (Kitsune)', description: 'Roh rubah mistis yang ekornya bertambah seiring tabunganmu.', price: 2000, type: 'savings_skin', value: 'fox', icon: 'StarIconFilled', rarity: 'mythical' },
    { id: 'skin_plant_wijaya', name: 'Wijayakusuma', description: 'Sang Ratu Malam. Kaktus langka yang bunganya sangat megah.', price: 2000, type: 'savings_skin', value: 'wijaya', icon: 'HeartIcon', rarity: 'mythical' },
    { id: 'skin_plant_kadupul', name: 'Bunga Kadupul', description: 'Bunga termahal di dunia. Legenda yang mekar sesaat.', price: 2000, type: 'savings_skin', value: 'kadupul', icon: 'SparklesIcon', rarity: 'mythical' },
    

    // --- GRADIENT THEMES (Fixed Price: 1500) ---
    { id: 'theme_sunset', name: 'Senja (Sunset)', description: 'Gradasi oranye hangat.', price: 1500, type: 'theme', category: 'gradient', value: 'theme_sunset', icon: 'PaintBrushIcon' },
    { id: 'theme_ocean', name: 'Samudra (Ocean)', description: 'Kedalaman biru laut.', price: 1500, type: 'theme', category: 'gradient', value: 'theme_ocean', icon: 'PaintBrushIcon' },
    { id: 'theme_berry', name: 'Beri (Berry)', description: 'Sentuhan pink & ungu.', price: 1500, type: 'theme', category: 'gradient', value: 'theme_berry', icon: 'PaintBrushIcon' },

    // --- STANDARD THEMES (Max 1200) ---
    { id: 'theme_default', name: 'Standar Navy', description: 'Tampilan klasik profesional.', price: 0, type: 'theme', category: 'standard', value: 'theme_default', icon: 'PaintBrushIcon' },
    { id: 'theme_dark', name: 'Mode Gelap', description: 'Elegan dan nyaman di mata.', price: 500, type: 'theme', category: 'standard', value: 'theme_dark', icon: 'PaintBrushIcon' },
    { id: 'theme_teal', name: 'Teal Fresh', description: 'Nuansa hijau segar.', price: 300, type: 'theme', category: 'standard', value: 'theme_teal', icon: 'PaintBrushIcon' },
    { id: 'theme_gold', name: 'Sultan Gold', description: 'Kemewahan para jutawan.', price: 1200, type: 'theme', category: 'standard', value: 'theme_gold', icon: 'PaintBrushIcon' },
    { id: 'theme_rose', name: 'Rose Gold', description: 'Sentuhan pink mewah.', price: 1100, type: 'theme', category: 'standard', value: 'theme_rose', icon: 'HeartIcon' },
    { id: 'theme_lavender', name: 'Lavender Soft', description: 'Ungu lembut menenangkan.', price: 1100, type: 'theme', category: 'standard', value: 'theme_lavender', icon: 'SparklesIcon' },
    { id: 'theme_mint', name: 'Minty Fresh', description: 'Hijau pastel ceria.', price: 1100, type: 'theme', category: 'standard', value: 'theme_mint', icon: 'SparklesIcon' },
    { id: 'theme_midnight', name: 'Midnight Pro', description: 'Mode gelap biru deep.', price: 1200, type: 'theme', category: 'standard', value: 'theme_midnight', icon: 'LockClosedIcon' },
    { id: 'theme_forest', name: 'Ranger Green', description: 'Nuansa hutan taktis.', price: 1200, type: 'theme', category: 'standard', value: 'theme_forest', icon: 'ShieldCheckIcon' },
    { id: 'theme_slate', name: 'Slate Monochrome', description: 'Hitam putih minimalis.', price: 1200, type: 'theme', category: 'standard', value: 'theme_slate', icon: 'Squares2x2Icon' },

    // --- TITLES (Standard Pricing) ---
    { id: 'title_hemat', name: 'Si Hemat', description: 'Gelar penjaga dompet.', price: 150, type: 'title', value: 'Si Hemat', icon: 'UserIcon' },
    { id: 'title_boss', name: 'Big Boss', description: 'Tunjukkan siapa bosnya.', price: 500, type: 'title', value: 'Big Boss', icon: 'UserIcon' },
    { id: 'title_investor', name: 'Investor Ulung', description: 'Fokus masa depan.', price: 800, type: 'title', value: 'Investor Ulung', icon: 'UserIcon' },
    { id: 'title_sultan', name: 'Sultan Muda', description: 'Gelar tertinggi.', price: 2000, type: 'title', value: 'Sultan Muda', icon: 'UserIcon' },

    // --- FRAMES (Standard Pricing) ---
    { id: 'frame_wood', name: 'Bingkai Kayu', description: 'Sederhana dan natural.', price: 200, type: 'frame', value: 'border-yellow-700', icon: 'StarIconFilled' },
    { id: 'frame_silver', name: 'Bingkai Perak', description: 'Berkilau dan berkelas.', price: 600, type: 'frame', value: 'border-gray-300 ring-2 ring-gray-100', icon: 'StarIconFilled' },
    { id: 'frame_gold', name: 'Bingkai Emas', description: 'Bingkai para juara.', price: 1500, type: 'frame', value: 'border-yellow-400 ring-4 ring-yellow-200', icon: 'StarIconFilled' },
    { id: 'frame_diamond', name: 'Diamond Aura', description: 'Bingkai neon futuristik.', price: 2000, type: 'frame', value: 'border-cyan-400 ring-4 ring-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.8)]', icon: 'StarIconFilled' },

    // --- AI PERSONAS ---
    { id: 'persona_default', name: 'Asisten Standar', description: 'Ramah & Profesional.', price: 0, type: 'persona', value: 'default', icon: 'UserIcon' },
    { id: 'persona_grandma', name: 'Nenek Penyayang', description: 'Nasihat bijak & lembut.', price: 800, type: 'persona', value: 'grandma', icon: 'HeartIcon' },
    { id: 'persona_wolf', name: 'Wall Street Wolf', description: 'Agresif & fokus profit.', price: 1000, type: 'persona', value: 'wolf', icon: 'ArrowPathIcon' },
    { id: 'persona_comedian', name: 'Si Komika', description: 'Saran penuh candaan.', price: 1200, type: 'persona', value: 'comedian', icon: 'SparklesIcon' },
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

const hexToRgbString = (hex: string): string => {
    const defaultColor = '255 255 255';
    if (!hex) return defaultColor;
    
    let clean = hex.trim();
    if (clean.startsWith('#')) clean = clean.substring(1);
    
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `${r} ${g} ${b}`;
    }
    return defaultColor;
}

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
    const [activeTab, setActiveTab] = useState<'theme' | 'chart' | 'title' | 'frame' | 'persona' | 'savings_skin' | 'lab'>('theme');
    const [skinRarityFilter, setSkinRarityFilter] = useState<'all' | 'rare' | 'legendary' | 'mythical'>('all');
    const [themeFilter, setThemeFilter] = useState<'standard' | 'gradient' | 'special'>('standard');
    
    // Lab State
    const [labMode, setLabMode] = useState<'text' | 'image' | 'manual'>('text');
    const [themeConcept, setThemeConcept] = useState('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTheme, setGeneratedTheme] = useState<CustomTheme | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Unlock State
    const [isLabRevealed, setIsLabRevealed] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Manual Builder State
    const [manualName, setManualName] = useState('');
    const [manualPrimary, setManualPrimary] = useState('#2C3E50');
    const [manualAccent, setManualAccent] = useState('#1ABC9C');
    const [manualCardBg, setManualCardBg] = useState('#FFFFFF');
    const [manualBgType, setManualBgType] = useState<'solid' | 'image'>('solid');
    const [manualBgColor, setManualBgColor] = useState('#F8F9FA');

    // --- DISCOUNT LOGIC (Item of the Week) ---
    const currentWeek = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    }, []);

    const discountedItemId = useMemo(() => {
        // Only select from paid items
        const paidItems = SHOP_ITEMS.filter(i => i.price > 0 && i.type !== 'savings_skin'); // Exclude skins for simplicity or include all
        if (paidItems.length === 0) return null;
        const index = currentWeek % paidItems.length;
        return paidItems[index].id;
    }, [currentWeek]);

    // --- NEW UNLOCK LOGIC ---
    const specialThemes = useMemo(() => SHOP_ITEMS.filter(i => i.type === 'theme' && i.category === 'special'), []);
    const ownedSpecialThemes = specialThemes.filter(i => state.inventory.includes(i.id));
    const isLabRequirementMet = ownedSpecialThemes.length >= 4;
    
    const THEME_GEN_PRICE = 500; // Increased from 75
    const THEME_INSTALL_PRICE = 20;

    const customThemeItems: ShopItem[] = (state.customThemes || []).map(ct => ({
        id: ct.id,
        name: ct.name,
        description: 'Tema Kustom Buatanmu',
        price: 0,
        type: 'theme',
        category: 'custom',
        value: ct.id,
        icon: 'PaintBrushIcon'
    }));

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (activeTab === 'theme') {
            if (item.type !== 'theme') return false;
            // if (themeFilter === 'all') return true; // Removed 'all' filter
            return item.category === themeFilter;
        }
        if (activeTab === 'chart') {
            return item.type === 'chart_skin';
        }
        if (activeTab === 'savings_skin') {
            if (item.type !== 'savings_skin') return false;
            if (skinRarityFilter === 'all') return true;
            return item.rarity === skinRarityFilter;
        }
        return item.type === activeTab;
    });
    
    const itemsToDisplay = (activeTab === 'theme') 
        ? (themeFilter === 'standard' ? [...customThemeItems, ...filteredItems] : filteredItems)
        : filteredItems;

    const isOwned = (itemId: string) => state.inventory.includes(itemId) || itemId === 'theme_default' || itemId.startsWith('custom_') || itemId === 'trend_default' || itemId === 'budget_default';
    const isEquipped = (item: ShopItem) => {
        if (item.type === 'theme' || item.type === 'special') return state.activeTheme === item.value;
        if (item.type === 'title') return state.userProfile.customTitle === item.value;
        if (item.type === 'frame') return state.userProfile.frameId === item.value;
        if (item.type === 'persona') return state.userProfile.activePersona === item.value;
        if (item.type === 'banner') return state.userProfile.activeBanner === item.value;
        if (item.type === 'chart_skin') {
            if (item.category === 'trend') return state.activeTrendChartTheme === item.value;
            if (item.category === 'budget') return state.activeBudgetChartTheme === item.value;
        }
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
        if (!isLabRequirementMet) return;
        setIsUnlocking(true);
        setTimeout(() => {
            setIsLabRevealed(true);
            setIsUnlocking(false);
        }, 1500);
    };

    const handlePreviewManualTheme = () => {
        if (!manualName.trim()) {
            setGenError('Nama tema wajib diisi!');
            return;
        }
        setGenError(null);

        const primaryRgb = hexToRgbString(manualPrimary);
        const primaryDarkRgb = adjustColorBrightness(primaryRgb, -30);
        const accentRgb = hexToRgbString(manualAccent);
        const accentDarkRgb = adjustColorBrightness(accentRgb, -30);
        const cardBgRgb = hexToRgbString(manualCardBg);
        
        const isCardDark = getLuminance(cardBgRgb) < 140;
        const contrastText = isCardDark ? '255 255 255' : '0 0 0';
        const secondaryText = isCardDark ? '156 163 175' : '107 114 128';

        let appBg = '';
        if (manualBgType === 'solid') {
            appBg = `rgb(${hexToRgbString(manualBgColor)})`;
        } else {
            appBg = uploadedImage ? `url('${uploadedImage}') center center / cover no-repeat fixed` : `rgb(${cardBgRgb})`;
        }

        const newTheme: CustomTheme = {
            id: `custom_${Date.now()}`,
            name: manualName,
            colors: {
                '--color-primary-navy': primaryRgb,
                '--color-primary-navy-dark': primaryDarkRgb,
                '--color-accent-teal': accentRgb,
                '--color-accent-teal-dark': accentDarkRgb,
                '--color-light-bg': cardBgRgb,
                '--color-dark-text': contrastText,
                '--color-secondary-gray': secondaryText,
                '--app-background': appBg,
                '--color-white': cardBgRgb,
                '--color-gray-50': adjustColorBrightness(cardBgRgb, isCardDark ? 20 : -10),
                '--color-gray-100': adjustColorBrightness(cardBgRgb, isCardDark ? 30 : -20),
                '--color-gray-200': adjustColorBrightness(cardBgRgb, isCardDark ? 40 : -30)
            }
        };
        setGeneratedTheme(newTheme);
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
                Return ONLY valid JSON with RGB color numbers (e.g. "255 255 255").
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
        if (availablePoints < THEME_INSTALL_PRICE) {
             setGenError(`Kurang Mustika! Butuh ${THEME_INSTALL_PRICE} untuk memasang.`);
             return;
        }
        if (onSpendPoints) onSpendPoints(THEME_INSTALL_PRICE);

        if (generatedTheme && onAddCustomTheme) {
            onAddCustomTheme(generatedTheme, 0); 
            setGeneratedTheme(null);
            setThemeConcept('');
            setUploadedImage(null);
            setManualName('');
            setManualPrimary('#2C3E50');
            setManualAccent('#1ABC9C');
            setManualCardBg('#FFFFFF');
            setManualBgType('solid');
            setManualBgColor('#F8F9FA');
            setActiveTab('theme');
        }
    };

    const getGradientByType = (type: string) => {
        switch(type) {
            case 'theme': return 'from-blue-500 to-cyan-400';
            case 'chart_skin': return 'from-indigo-500 to-blue-600';
            case 'title': return 'from-purple-500 to-pink-500';
            case 'frame': return 'from-amber-400 to-orange-500';
            case 'persona': return 'from-emerald-400 to-teal-500';
            case 'savings_skin': return 'from-pink-500 to-rose-500';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    return (
        <main className="h-screen flex flex-col bg-transparent overflow-hidden">
            {/* GLASSMORPHIC HEADER */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20 px-6 py-4 shadow-sm flex justify-between items-center">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-secondary-gray">
                    <ArrowUturnLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-extrabold text-primary-navy tracking-tight">TOKO MUSTIKA</h1>
                <div className="w-8"></div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto pb-32 scroll-smooth no-scrollbar">
                <div className="p-6 space-y-8 max-w-3xl mx-auto">
                    
                    {/* WALLET CARD (Holographic Style) */}
                    <div className="relative w-full h-48 rounded-[2rem] overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.01] duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 animate-gradient-xy"></div>
                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase">
                                    Member VIP
                                </div>
                                <SparklesIcon className="w-8 h-8 text-yellow-300 drop-shadow-glow animate-pulse" />
                            </div>
                            <div>
                                <p className="text-indigo-100 text-sm font-bold mb-1 uppercase tracking-wide opacity-80">Saldo Tersedia</p>
                                <h2 className="text-5xl font-black tracking-tighter drop-shadow-lg">
                                    {formatPoints(availablePoints)}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* MODERN TABS */}
                    <div className="overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
                        <nav className="flex gap-2 min-w-max">
                            {[
                                { id: 'theme', label: 'Tema', icon: PaintBrushIcon },
                                { id: 'chart', label: 'Grafik', icon: ChartBarIcon },
                                { id: 'title', label: 'Gelar', icon: UserIcon },
                                { id: 'frame', label: 'Bingkai', icon: CircleStackIcon },
                                { id: 'persona', label: 'Asisten AI', icon: SpeakerWaveIcon },
                                { id: 'savings_skin', label: 'Skin Celengan', icon: BuildingLibraryIcon },
                                { id: 'lab', label: 'Studio AI', icon: LightbulbIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                                        ${activeTab === tab.id 
                                        ? 'bg-primary-navy text-white shadow-lg shadow-primary-navy/20 scale-105' 
                                        : 'bg-white text-secondary-gray hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-yellow-300' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* FILTER SUB-NAV FOR SAVINGS SKINS */}
                    {activeTab === 'savings_skin' && (
                        <div className="flex flex-wrap justify-center gap-2 animate-fade-in-down">
                            <button onClick={() => setSkinRarityFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${skinRarityFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>All</button>
                            <button onClick={() => setSkinRarityFilter('rare')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${skinRarityFilter === 'rare' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50'}`}>Rare</button>
                            <button onClick={() => setSkinRarityFilter('legendary')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${skinRarityFilter === 'legendary' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-yellow-50'}`}>Legendary</button>
                            <button onClick={() => setSkinRarityFilter('mythical')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${skinRarityFilter === 'mythical' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-purple-50'}`}>Mythical</button>
                        </div>
                    )}

                    {/* FILTER SUB-NAV FOR THEMES */}
                    {activeTab === 'theme' && (
                        <div className="flex flex-wrap justify-center gap-2 animate-fade-in-down">
                            <button onClick={() => setThemeFilter('standard')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${themeFilter === 'standard' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50'}`}>Standar</button>
                            <button onClick={() => setThemeFilter('gradient')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${themeFilter === 'gradient' ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-pink-50'}`}>Gradasi</button>
                            <button onClick={() => setThemeFilter('special')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${themeFilter === 'special' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-indigo-50'}`}>Spesial</button>
                        </div>
                    )}

                    {/* CONTENT AREA */}
                    {activeTab === 'lab' ? (
                        // --- AI LAB / STUDIO MODE ---
                        <div className="bg-gray-900 rounded-[2.5rem] p-1 shadow-2xl border border-gray-800 overflow-hidden text-gray-100 min-h-[500px]">
                            {/* Studio Header */}
                            <div className="bg-gray-800/50 p-8 text-center border-b border-gray-700 relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                                    STUDIO TEMA AI
                                </h2>
                                <p className="text-gray-400 text-sm font-medium">Racik tema eksklusif dari imajinasi, foto, atau manual.</p>
                            </div>

                            {!isLabRequirementMet ? (
                                // LOCKED STUDIO
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
                                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-700 relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                        <LockClosedIcon className="w-10 h-10 text-gray-500" />
                                        <div className="absolute -bottom-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">TERKUNCI</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Akses Eksklusif</h3>
                                    <p className="text-gray-400 mb-6 text-sm max-w-xs">
                                        Miliki 4 Tema Spesial untuk membuka fitur ini.
                                    </p>
                                    
                                    <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Progress ({ownedSpecialThemes.length}/4)</p>
                                        <div className="space-y-3">
                                            {specialThemes.map(theme => {
                                                const isOwned = state.inventory.includes(theme.id);
                                                return (
                                                    <div key={theme.id} className="flex items-center justify-between text-sm">
                                                        <span className={isOwned ? 'text-white font-bold' : 'text-gray-500 font-medium'}>{theme.name}</span>
                                                        {isOwned 
                                                            ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                            : <LockClosedIcon className="w-4 h-4 text-gray-600" />
                                                        }
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => { setActiveTab('theme'); setThemeFilter('special'); }}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-900/50"
                                    >
                                        Beli Tema Spesial
                                    </button>
                                </div>
                            ) : !isLabRevealed ? (
                                // UNLOCKABLE STATE
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
                                    <div 
                                        onClick={handleUnlockLab}
                                        className={`w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 border-4 border-yellow-200 relative shadow-[0_0_50px_rgba(234,179,8,0.6)] cursor-pointer transform transition-all duration-300 hover:scale-110 active:scale-95 ${isUnlocking ? 'animate-shake' : 'animate-pulse'}`}
                                    >
                                        <LockClosedIcon className={`w-14 h-14 text-yellow-950 transition-opacity duration-500 ${isUnlocking ? 'opacity-0' : 'opacity-100'}`} />
                                        {isUnlocking && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <SparklesIcon className="w-20 h-20 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 text-white drop-shadow-md">STUDIO SIAP</h3>
                                    <p className="text-yellow-200 mb-6 text-sm max-w-xs font-medium">
                                        Ketuk tombol di atas untuk masuk.
                                    </p>
                                </div>
                            ) : (
                                // UNLOCKED STUDIO CONTENT
                                <div className="p-6 space-y-6 animate-fade-in">
                                    {/* Mode Toggle */}
                                    <div className="flex bg-gray-800 p-1.5 rounded-2xl gap-1">
                                        <button onClick={() => setLabMode('text')} className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${labMode === 'text' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Tulis Konsep</button>
                                        <button onClick={() => setLabMode('image')} className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${labMode === 'image' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Upload Foto</button>
                                        <button onClick={() => setLabMode('manual')} className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${labMode === 'manual' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Manual</button>
                                    </div>

                                    {/* Inputs */}
                                    {labMode === 'text' && (
                                        <textarea value={themeConcept} onChange={(e) => setThemeConcept(e.target.value)} placeholder="Contoh: Cyberpunk neon city, deep purple atmosphere..." className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-32 resize-none" />
                                    )}
                                    {labMode === 'image' && (
                                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 hover:border-purple-500 transition-all group relative overflow-hidden">
                                            {uploadedImage ? <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" /> : <CameraIcon className="w-10 h-10 text-gray-600 group-hover:text-purple-400 mb-2 transition-colors" />}
                                            <span className="relative z-10 text-sm font-medium text-gray-400 group-hover:text-white">{uploadedImage ? 'Ganti Gambar' : 'Pilih dari Galeri'}</span>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                                        </div>
                                    )}
                                    {labMode === 'manual' && (
                                        <div className="space-y-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                                            <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Nama Tema</label><input value={manualName} onChange={e => setManualName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm" placeholder="Contoh: Merah Putih" /></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Warna Utama</label><div className="flex gap-2 items-center"><input type="color" value={manualPrimary} onChange={e => setManualPrimary(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" /></div></div>
                                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Warna Aksen</label><div className="flex gap-2 items-center"><input type="color" value={manualAccent} onChange={e => setManualAccent(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" /></div></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Warna Kartu</label><div className="flex gap-2 items-center"><input type="color" value={manualCardBg} onChange={e => setManualCardBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" /></div></div>
                                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Tipe Background</label><select value={manualBgType} onChange={(e) => setManualBgType(e.target.value as 'solid' | 'image')} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-1.5 text-white text-xs"><option value="solid">Warna Solid</option><option value="image">Upload Gambar</option></select></div>
                                            </div>
                                            {manualBgType === 'solid' ? (<div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Warna Background</label><div className="flex gap-2 items-center"><input type="color" value={manualBgColor} onChange={e => setManualBgColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div></div>) : (<div onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-all relative overflow-hidden">{uploadedImage ? <img src={uploadedImage} alt="Bg" className="w-full h-full object-cover opacity-60" /> : <span className="text-xs text-gray-500">Pilih Background</span>}<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} /></div>)}
                                        </div>
                                    )}

                                    {genError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{genError}</p>}

                                    <button onClick={labMode === 'manual' ? handlePreviewManualTheme : handleGenerateTheme} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {labMode === 'manual' ? <PencilSquareIcon className="w-5 h-5 text-yellow-200"/> : (isGenerating ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5 text-yellow-200"/>)}
                                        {isGenerating ? 'Sedang Meracik...' : (labMode === 'manual' ? 'Lihat Preview (Gratis)' : `Generate (${THEME_GEN_PRICE} Mustika)`)}
                                    </button>

                                    {/* Preview & Install */}
                                    {generatedTheme && (
                                        <div className="mt-8 border-t border-gray-800 pt-6 animate-fade-in-up">
                                            <h3 className="text-center text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">PREVIEW HASIL</h3>
                                            <div className="relative mx-auto w-64 h-[450px] bg-black rounded-[2.5rem] border-4 border-gray-800 shadow-2xl overflow-hidden">
                                                <div className="w-full h-full flex flex-col" style={{ background: generatedTheme.colors['--app-background'], backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: generatedTheme.colors['--color-gray-50'] }}>
                                                    <div className="p-4 backdrop-blur-md" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-light-bg']} / 0.8)` }}><div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-primary-navy']})` }}></div><div className="h-4 w-32 rounded mb-1" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-primary-navy']})` }}></div><div className="h-2 w-20 rounded" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-secondary-gray']})` }}></div></div>
                                                    <div className="flex-1 p-4 flex items-center justify-center"><div className="bg-white/90 p-4 rounded-xl shadow-lg w-full backdrop-blur-sm" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-light-bg']} / 0.9)` }}><h4 className="font-bold mb-2" style={{ color: `rgb(${generatedTheme.colors['--color-primary-navy-dark']})` }}>{generatedTheme.name}</h4><p className="text-xs mb-3" style={{ color: `rgb(${generatedTheme.colors['--color-dark-text']})` }}>Contoh tampilan kartu.</p><div className="h-8 rounded-lg w-full" style={{ backgroundColor: `rgb(${generatedTheme.colors['--color-accent-teal']})` }}></div></div></div>
                                                </div>
                                            </div>
                                            <button onClick={handleSaveCustomTheme} className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/30 transition-colors flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5" />Pasang Tema ({THEME_INSTALL_PRICE} Mustika)</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // --- STANDARD SHOP GRID ---
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                            {itemsToDisplay.map((item) => {
                                const isDiscounted = item.id === discountedItemId;
                                const originalPrice = item.price;
                                const currentPrice = isDiscounted ? Math.floor(originalPrice * 0.8) : originalPrice;
                                
                                const owned = isOwned(item.id) || currentPrice === 0;
                                const equipped = isEquipped(item);
                                const canAfford = availablePoints >= currentPrice;
                                const gradientClass = getGradientByType(item.type);
                                const isSavingsSkin = item.type === 'savings_skin';
                                
                                // Get skin image
                                let skinImage = null;
                                if (isSavingsSkin) {
                                    const assetKey = item.value; 
                                    const assets = SKIN_ASSETS[assetKey] || (item.value.includes('pet') ? SKIN_ASSETS['pet_default'] : SKIN_ASSETS['default']);
                                    skinImage = assets.stage1;
                                }

                                // Rarity Badge Logic
                                let badge = null;
                                if (isSavingsSkin && item.rarity) {
                                    const colors = {
                                        rare: 'bg-blue-500 text-white',
                                        legendary: 'bg-yellow-500 text-white',
                                        mythical: 'bg-purple-600 text-white'
                                    };
                                    const labels = { rare: 'RARE', legendary: 'LEGEND', mythical: 'MYTHICAL' };
                                    // @ts-ignore
                                    if(colors[item.rarity]) {
                                        // @ts-ignore
                                        badge = <span className={`absolute top-3 left-3 ${colors[item.rarity]} text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-20`}>{labels[item.rarity]}</span>;
                                    }
                                } else if (item.category === 'special') {
                                    badge = <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-20">SPECIAL</span>;
                                } else if (isDiscounted && !owned) {
                                    badge = <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-20 animate-pulse">20% OFF</span>;
                                }

                                // --- CHART SKIN CATEGORY BADGE ---
                                let chartLabel = null;
                                if (item.type === 'chart_skin') {
                                    if (item.category === 'trend') chartLabel = 'Grafik Tren';
                                    if (item.category === 'budget') chartLabel = 'Grafik Anggaran';
                                }

                                return (
                                    <div key={item.id} className="group relative bg-white rounded-3xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-100">
                                        
                                        {/* Visual Container */}
                                        <div className={`relative h-32 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center overflow-hidden mb-3`}>
                                            {badge}
                                            
                                            {/* Top Right Status Badge */}
                                            {equipped && !isSavingsSkin && (
                                                <div className="absolute top-3 right-3 bg-white/90 text-green-600 p-1.5 rounded-full shadow-md z-20" title="Sedang Dipakai">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                            {(!equipped || isSavingsSkin) && owned && (
                                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-bold z-20 border border-white/20">
                                                    MILIKMU
                                                </div>
                                            )}

                                            {/* Chart Type Label */}
                                            {chartLabel && (
                                                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded text-[9px] font-bold z-20 backdrop-blur-sm border border-white/10">
                                                    {chartLabel}
                                                </div>
                                            )}

                                            {/* Icon/Image */}
                                            {isSavingsSkin && skinImage ? (
                                                <img src={skinImage} alt={item.name} className="w-24 h-24 object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-inner group-hover:scale-105 transition-transform">
                                                    {item.type === 'theme' || item.type === 'special' ? <PaintBrushIcon className="w-8 h-8 text-white drop-shadow" /> :
                                                    item.type === 'chart_skin' ? <ChartBarIcon className="w-8 h-8 text-white drop-shadow" /> :
                                                    item.type === 'title' ? <UserIcon className="w-8 h-8 text-white drop-shadow" /> :
                                                    item.type === 'frame' ? <StarIconFilled className="w-8 h-8 text-white drop-shadow" /> :
                                                    item.type === 'persona' ? <SpeakerWaveIcon className="w-8 h-8 text-white drop-shadow" /> :
                                                    <PhotoIcon className="w-8 h-8 text-white drop-shadow" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="px-1 flex flex-col flex-1">
                                            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.name}</h3>
                                            <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                                            
                                            <div className="mt-auto">
                                                {/* Always Show Price */}
                                                <div className="flex items-center gap-1 mb-2">
                                                    <SparklesIcon className="w-3 h-3 text-yellow-500" />
                                                    {isDiscounted && !owned && (
                                                        <span className="text-[10px] font-bold text-gray-400 line-through mr-1">
                                                            {formatPoints(originalPrice)}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-bold ${owned ? 'text-gray-400' : (isDiscounted ? 'text-red-500' : 'text-primary-navy')}`}>
                                                        {formatPoints(currentPrice)}
                                                    </span>
                                                </div>

                                                {/* Action Button */}
                                                {owned ? (
                                                    <button 
                                                        onClick={() => !isSavingsSkin && onEquip(item)}
                                                        disabled={equipped || isSavingsSkin}
                                                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm
                                                            ${(equipped || isSavingsSkin)
                                                                ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200' 
                                                                : 'bg-primary-navy text-white hover:bg-primary-navy-dark'
                                                            }`}
                                                    >
                                                        {isSavingsSkin ? 'Tersedia' : equipped ? 'Dipakai' : 'Pakai'}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => onPurchase({ ...item, price: currentPrice })}
                                                        disabled={!canAfford}
                                                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm
                                                            ${canAfford 
                                                                ? 'bg-white border border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white' 
                                                                : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {canAfford ? 'Beli' : 'Kurang'}
                                                    </button>
                                                )}
                                            </div>
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
