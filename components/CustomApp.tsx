
import React, { useState, useMemo } from 'react';
import type { AppState, ShopItem } from '../types';
import { SHOP_ITEMS } from './Shop';
import { PaintBrushIcon, UserIcon, StarIconFilled, HeartIcon, CheckCircleIcon, ArrowUturnLeftIcon, PhotoIcon, ShieldCheckIcon, SparklesIcon, LockClosedIcon } from './Icons';

interface CustomAppProps {
    state: AppState;
    onBack: () => void;
    onEquip: (item: ShopItem) => void;
}

const CustomApp: React.FC<CustomAppProps> = ({ state, onBack, onEquip }) => {
    const [activeTab, setActiveTab] = useState<'theme' | 'identity' | 'persona'>('theme');

    // Gabungkan item toko yang sudah dibeli dengan item default dan custom themes
    const myItems = useMemo(() => {
        // 1. Ambil item dari SHOP_ITEMS yang ada di inventory ATAU item default
        const standardItems = SHOP_ITEMS.filter(item => 
            state.inventory.includes(item.id) || 
            item.id === 'theme_default' || 
            item.price === 0 // Asumsi item gratis otomatis dimiliki
        );

        // 2. Konversi Custom Themes user menjadi format ShopItem
        const customThemeItems: ShopItem[] = (state.customThemes || []).map(ct => ({
            id: ct.id,
            name: ct.name,
            description: 'Tema Kustom Buatanmu',
            price: 0,
            type: 'theme',
            value: ct.id,
            icon: 'PaintBrushIcon'
        }));

        return [...standardItems, ...customThemeItems];
    }, [state.inventory, state.customThemes]);

    // Filter berdasarkan Tab
    const filteredItems = myItems.filter(item => {
        if (activeTab === 'theme') return item.type === 'theme';
        if (activeTab === 'identity') return ['title', 'frame', 'banner'].includes(item.type);
        if (activeTab === 'persona') return item.type === 'persona';
        return false;
    });

    const isEquipped = (item: ShopItem) => {
        if (item.type === 'theme') return state.activeTheme === item.value;
        if (item.type === 'title') return state.userProfile.customTitle === item.value;
        if (item.type === 'frame') return state.userProfile.frameId === item.value;
        if (item.type === 'persona') return state.userProfile.activePersona === item.value;
        if (item.type === 'banner') return state.userProfile.activeBanner === item.value;
        return false;
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'PaintBrushIcon': return <PaintBrushIcon className="w-6 h-6" />;
            case 'UserIcon': return <UserIcon className="w-6 h-6" />;
            case 'StarIconFilled': return <StarIconFilled className="w-6 h-6" />;
            case 'HeartIcon': return <HeartIcon className="w-6 h-6" />;
            case 'ShieldCheckIcon': return <ShieldCheckIcon className="w-6 h-6" />;
            case 'PhotoIcon': return <PhotoIcon className="w-6 h-6" />;
            case 'SparklesIcon': return <SparklesIcon className="w-6 h-6" />;
            case 'LockClosedIcon': return <LockClosedIcon className="w-6 h-6" />;
            default: return <StarIconFilled className="w-6 h-6" />;
        }
    };

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto min-h-screen flex flex-col">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={onBack} 
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowUturnLeftIcon className="w-5 h-5 text-primary-navy" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">Kustomisasi Aplikasi</h1>
                    <p className="text-xs text-secondary-gray">Atur tampilan dan gaya sesuai kepribadianmu.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button 
                    onClick={() => setActiveTab('theme')} 
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'theme' ? 'bg-white text-primary-navy shadow-sm' : 'text-secondary-gray hover:text-gray-600'}`}
                >
                    Tema
                </button>
                <button 
                    onClick={() => setActiveTab('identity')} 
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'identity' ? 'bg-white text-primary-navy shadow-sm' : 'text-secondary-gray hover:text-gray-600'}`}
                >
                    Identitas
                </button>
                <button 
                    onClick={() => setActiveTab('persona')} 
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'persona' ? 'bg-white text-primary-navy shadow-sm' : 'text-secondary-gray hover:text-gray-600'}`}
                >
                    Asisten AI
                </button>
            </div>

            {/* GRID ITEM */}
            {filteredItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Belum ada koleksi di kategori ini.</p>
                    <p className="text-gray-400 text-xs mt-1">Kunjungi Toko untuk membeli item baru.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredItems.map((item) => {
                        const active = isEquipped(item);
                        return (
                            <div 
                                key={item.id} 
                                onClick={() => !active && onEquip(item)}
                                className={`
                                    relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden group
                                    ${active 
                                        ? 'bg-blue-50 border-accent-teal shadow-md' 
                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                    }
                                `}
                            >
                                {/* Icon Box */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4 transition-colors
                                    ${active ? 'bg-accent-teal text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}
                                `}>
                                    {getIcon(item.icon)}
                                </div>

                                {/* Text Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm truncate ${active ? 'text-primary-navy' : 'text-dark-text'}`}>
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-secondary-gray truncate">{item.description}</p>
                                    
                                    {/* Type Badge for Identity Tab */}
                                    {activeTab === 'identity' && (
                                        <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {item.type === 'title' ? 'Gelar' : item.type === 'frame' ? 'Bingkai' : 'Sampul'}
                                        </span>
                                    )}
                                </div>

                                {/* Action Indicator */}
                                <div className="ml-2">
                                    {active ? (
                                        <CheckCircleIcon className="w-6 h-6 text-accent-teal" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-primary-navy"></div>
                                    )}
                                </div>
                                
                                {/* Active Label Background Effect */}
                                {active && (
                                    <div className="absolute inset-0 bg-accent-teal opacity-5 pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default CustomApp;
