
import React, { useState, useEffect } from 'react';
import type { WishlistItem } from '../types';
import { HeartIcon, ClockIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon, ShoppingBagIcon, SparklesIcon, BuildingLibraryIcon, CalendarDaysIcon, ArrowUturnLeftIcon, ArchiveBoxIcon } from './Icons';

interface WishlistProps {
    wishlist: WishlistItem[];
    onAddWishlist: () => void;
    onFulfillWishlist: (id: number) => void;
    onCancelWishlist: (id: number) => void;
    onDeleteWishlist: (id: number) => void;
    onConvertToBudget: (item: WishlistItem) => void;
    onConvertToSavings: (item: WishlistItem) => void;
    onDelayToNextMonth: (item: WishlistItem) => void;
}

const formatCurrency = (amount: number) => {
    if (amount >= 100000000000) { // If > 11 digits (100 Billion)
        return amount.toExponential(2).replace('+', '');
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const WishlistCard: React.FC<{
    item: WishlistItem;
    onClick: () => void;
}> = ({ item, onClick }) => {
    const [daysLeft, setDaysLeft] = useState(0);
    const [progress, setProgress] = useState(0);
    const [ageInDays, setAgeInDays] = useState(0);
    const [daysSinceReady, setDaysSinceReady] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysPassed = (now - item.createdAt) / msPerDay;
            
            setAgeInDays(Math.floor(daysPassed));

            if (item.cooldownDays === -1) {
                // Infinite Item
                setDaysLeft(-1);
                setProgress(0);
                setDaysSinceReady(0);
            } else {
                const remaining = Math.ceil(item.cooldownDays - daysPassed);
                setDaysLeft(remaining > 0 ? remaining : 0);
                const percent = Math.min(100, (daysPassed / item.cooldownDays) * 100);
                setProgress(percent);

                if (remaining <= 0) {
                    setDaysSinceReady(Math.floor(daysPassed - item.cooldownDays));
                }
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [item]);

    const isReady = item.cooldownDays !== -1 && daysLeft <= 0;
    const isInfinite = item.cooldownDays === -1;
    // Stale if ready and ignored for more than 7 days
    const isStale = isReady && daysSinceReady > 7;

    let borderClass = 'border-gray-100';
    let bgClass = 'bg-white';
    let opacityClass = 'opacity-100';

    if (isStale) {
        borderClass = 'border-gray-300 border-dashed';
        bgClass = 'bg-gray-50';
        opacityClass = 'opacity-80'; // Faded look
    } else if (isReady) {
        borderClass = 'border-2 border-accent-teal';
    }

    return (
        <div onClick={onClick} className={`${bgClass} rounded-xl shadow-sm p-4 transition-all duration-300 cursor-pointer hover:shadow-md border ${borderClass} ${opacityClass} relative overflow-hidden`}>
            {/* Stale Cobweb Effect (Visual Only) */}
            {isStale && (
                <div className="absolute -top-4 -right-4 text-gray-100 transform rotate-12 pointer-events-none">
                    <ArchiveBoxIcon className="w-24 h-24" />
                </div>
            )}

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isStale ? 'bg-gray-200 text-gray-500' : isReady ? 'bg-accent-teal text-white' : isInfinite ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-100 text-secondary-gray'}`}>
                        {isStale ? <ArchiveBoxIcon className="w-5 h-5" /> : isReady ? <CheckCircleIcon className="w-5 h-5" /> : isInfinite ? <HeartIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${isStale ? 'text-secondary-gray line-through decoration-gray-300' : 'text-dark-text'}`}>{item.name}</h3>
                        <p className={`font-semibold ${isStale ? 'text-gray-400' : 'text-primary-navy'}`}>{formatCurrency(item.price)}</p>
                    </div>
                </div>
                
                {/* Age Indicator */}
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-secondary-gray border border-gray-200">
                    {ageInDays === 0 ? 'Baru saja' : `${ageInDays} hari`}
                </span>
            </div>

            {isStale ? (
                <div className="mt-3 bg-gray-200 p-2 rounded text-center">
                    <p className="text-xs font-bold text-gray-600">
                        Sudah dianggurin {daysSinceReady} hari. <br/>
                        <span className="font-normal">Masih butuh atau cuma lapar mata?</span>
                    </p>
                </div>
            ) : isReady ? (
                <div className="mt-3 bg-green-50 p-2 rounded text-center">
                    <p className="text-xs font-bold text-green-700">Waktu Pendinginan Selesai! Klik untuk aksi.</p>
                </div>
            ) : isInfinite ? (
                <div className="mt-2">
                    <p className="text-xs text-indigo-400 italic">Keinginan Abadi (Tanpa Batas Waktu)</p>
                </div>
            ) : (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-secondary-gray mb-1">
                        <span>Menunggu...</span>
                        <span>{daysLeft} hari lagi</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const WishlistActionModal: React.FC<{
    item: WishlistItem | null;
    onClose: () => void;
    onDelay: () => void;
    onBudget: () => void;
    onSavings: () => void;
    onCancel: () => void;
}> = ({ item, onClose, onDelay, onBudget, onSavings, onCancel }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-spring-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-primary-navy text-white relative flex-shrink-0">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-blue-200 text-sm mt-1">{formatCurrency(item.price)}</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">&times;</button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3 overflow-y-auto">
                    <p className="text-center text-secondary-gray text-xs mb-2">Mau diapakan barang ini?</p>
                    
                    <button onClick={onDelay} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 text-left group">
                        <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg group-hover:bg-yellow-200 transition-colors">
                            <CalendarDaysIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-dark-text text-sm">Tunda ke Awal Bulan Depan</span>
                            <span className="block text-[10px] text-secondary-gray">Reset timer ke tanggal 1</span>
                        </div>
                    </button>

                    <button onClick={onBudget} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 text-left group">
                        <div className="bg-blue-200 text-blue-700 p-2 rounded-lg group-hover:bg-blue-300 transition-colors">
                            <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-dark-text text-sm">Jadikan Pos Anggaran</span>
                            <span className="block text-[10px] text-secondary-gray">Siap dibelanjakan bulan ini</span>
                        </div>
                    </button>

                    <button onClick={onSavings} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-100 text-left group">
                        <div className="bg-teal-200 text-teal-700 p-2 rounded-lg group-hover:bg-teal-300 transition-colors">
                            <BuildingLibraryIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-dark-text text-sm">Masuk Celengan</span>
                            <span className="block text-[10px] text-secondary-gray">Tabung pelan-pelan</span>
                        </div>
                    </button>

                    <button onClick={onCancel} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100 text-left group">
                        <div className="bg-red-200 text-red-700 p-2 rounded-lg group-hover:bg-red-300 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-dark-text text-sm">Batalkan Wish</span>
                            <span className="block text-[10px] text-secondary-gray">Gak jadi beli, uang selamat!</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Wishlist: React.FC<WishlistProps> = ({ wishlist, onAddWishlist, onFulfillWishlist, onCancelWishlist, onDeleteWishlist, onConvertToBudget, onConvertToSavings, onDelayToNextMonth }) => {
    
    const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

    const activeItems = wishlist.filter(i => i.status === 'waiting' || i.status === 'ready');
    const totalSaved = wishlist.filter(i => i.status === 'cancelled').reduce((sum, i) => sum + i.price, 0);
    const savedCount = wishlist.filter(i => i.status === 'cancelled').length;

    // SORTING LOGIC:
    // 1. Ready items first
    // 2. Waiting items sorted by remaining time (closest first)
    // 3. Infinite items last
    const sortedActiveItems = [...activeItems].sort((a, b) => {
        const now = Date.now();
        const msPerDay = 1000 * 60 * 60 * 24;

        const getRemaining = (item: WishlistItem) => {
            if (item.cooldownDays === -1) return 999999; // Infinite is effectively very far away
            const passed = (now - item.createdAt) / msPerDay;
            return item.cooldownDays - passed;
        };

        const remA = getRemaining(a);
        const remB = getRemaining(b);

        return remA - remB;
    });

    const handleAction = (action: 'delay' | 'budget' | 'savings' | 'cancel') => {
        if (!selectedItem) return;
        if (action === 'delay') onDelayToNextMonth(selectedItem);
        if (action === 'budget') onConvertToBudget(selectedItem);
        if (action === 'savings') onConvertToSavings(selectedItem);
        if (action === 'cancel') onCancelWishlist(selectedItem.id);
        setSelectedItem(null);
    };

    return (
        <main className="p-4 pb-24 animate-fade-in max-w-3xl mx-auto">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold text-primary-navy">Wishlist Anti-Impulsif</h1>
                <p className="text-secondary-gray text-sm mt-1">Tahan keinginan sesaat, selamatkan dompetmu.</p>
            </header>

            <section className="bg-gradient-to-r from-primary-navy to-blue-800 rounded-xl shadow-lg p-6 text-white mb-6 relative overflow-hidden">
                <SparklesIcon className="absolute -top-4 -right-4 w-24 h-24 text-white opacity-10" />
                <div className="relative z-10">
                    <p className="text-blue-100 font-medium mb-1">Total Uang Diselamatkan</p>
                    <h2 className="text-4xl font-bold">{formatCurrency(totalSaved)}</h2>
                    <p className="text-sm text-blue-200 mt-2">Dari {savedCount} keinginan yang dibatalkan.</p>
                </div>
            </section>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary-navy">Daftar Keinginan</h2>
                <button 
                    onClick={onAddWishlist} 
                    className="flex items-center gap-2 bg-accent-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-teal-dark transition-colors shadow"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Tambah Baru</span>
                </button>
            </div>

            {sortedActiveItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-dark-text">Wishlist Kosong</h3>
                    <p className="mt-2 text-secondary-gray px-6">
                        Lagi pengen sesuatu tapi ragu butuh atau enggak? <br/> Masukkan sini dulu, kita lihat nanti!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedActiveItems.map(item => (
                        <WishlistCard 
                            key={item.id} 
                            item={item} 
                            onClick={() => setSelectedItem(item)}
                        />
                    ))}
                </div>
            )}

            {/* History Section */}
            {savedCount > 0 && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-bold text-secondary-gray mb-4">Riwayat Kemenangan (Dibatalkan)</h3>
                    <ul className="space-y-2">
                        {wishlist.filter(i => i.status === 'cancelled').slice(0, 5).map(item => (
                            <li key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg opacity-75">
                                <span className="text-secondary-gray line-through decoration-danger-red">{item.name}</span>
                                <span className="font-medium text-accent-teal">+{formatCurrency(item.price)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <WishlistActionModal 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)}
                onDelay={() => handleAction('delay')}
                onBudget={() => handleAction('budget')}
                onSavings={() => handleAction('savings')}
                onCancel={() => handleAction('cancel')}
            />
        </main>
    );
};

export default Wishlist;
