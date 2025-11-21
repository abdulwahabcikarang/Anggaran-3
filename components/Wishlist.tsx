
import React, { useState, useEffect } from 'react';
import type { WishlistItem } from '../types';
import { HeartIcon, ClockIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon, ShoppingBagIcon, SparklesIcon } from './Icons';

interface WishlistProps {
    wishlist: WishlistItem[];
    onAddWishlist: () => void;
    onFulfillWishlist: (id: number) => void;
    onCancelWishlist: (id: number) => void;
    onDeleteWishlist: (id: number) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const WishlistCard: React.FC<{
    item: WishlistItem;
    onFulfill: () => void;
    onCancel: () => void;
    onDelete: () => void;
}> = ({ item, onFulfill, onCancel, onDelete }) => {
    const [daysLeft, setDaysLeft] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysPassed = (now - item.createdAt) / msPerDay;
            const remaining = Math.ceil(item.cooldownDays - daysPassed);
            
            setDaysLeft(remaining > 0 ? remaining : 0);
            
            // Progress bar calculation
            const percent = Math.min(100, (daysPassed / item.cooldownDays) * 100);
            setProgress(percent);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [item]);

    const isReady = daysLeft <= 0;

    if (item.status !== 'waiting' && item.status !== 'ready') return null;

    return (
        <div className={`bg-white rounded-xl shadow-md p-4 transition-all duration-300 ${isReady ? 'border-2 border-accent-teal' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${isReady ? 'bg-accent-teal' : 'bg-gray-100'}`}>
                        {isReady ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <ClockIcon className="w-5 h-5 text-secondary-gray" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-dark-text">{item.name}</h3>
                        <p className="font-semibold text-primary-navy">{formatCurrency(item.price)}</p>
                    </div>
                </div>
                {!isReady && (
                    <button onClick={onDelete} className="text-gray-300 hover:text-danger-red">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {isReady ? (
                <div className="mt-4 bg-green-50 p-3 rounded-lg text-center border border-green-100">
                    <p className="font-bold text-accent-teal mb-2">Waktu Pendinginan Selesai!</p>
                    <p className="text-sm text-secondary-gray mb-3">Apakah Anda masih menginginkan barang ini?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onFulfill}
                            className="bg-accent-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-teal-dark transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBagIcon className="w-4 h-4" />
                            Beli
                        </button>
                        <button 
                            onClick={onCancel}
                            className="bg-white border-2 border-accent-teal text-accent-teal font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Gak Jadi
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-secondary-gray mb-1">
                        <span>Menunggu...</span>
                        <span>{daysLeft} hari lagi</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-secondary-gray mt-2 italic text-center">
                        "Tunggu sebentar, pastikan ini bukan impulsif."
                    </p>
                </div>
            )}
        </div>
    );
};

const Wishlist: React.FC<WishlistProps> = ({ wishlist, onAddWishlist, onFulfillWishlist, onCancelWishlist, onDeleteWishlist }) => {
    
    const activeItems = wishlist.filter(i => i.status === 'waiting' || i.status === 'ready');
    const totalSaved = wishlist.filter(i => i.status === 'cancelled').reduce((sum, i) => sum + i.price, 0);
    const savedCount = wishlist.filter(i => i.status === 'cancelled').length;

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

            {activeItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-dark-text">Wishlist Kosong</h3>
                    <p className="mt-2 text-secondary-gray px-6">
                        Lagi pengen sesuatu tapi ragu butuh atau enggak? <br/> Masukkan sini dulu, kita lihat nanti!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {activeItems.map(item => (
                        <WishlistCard 
                            key={item.id} 
                            item={item} 
                            onFulfill={() => onFulfillWishlist(item.id)}
                            onCancel={() => onCancelWishlist(item.id)}
                            onDelete={() => onDeleteWishlist(item.id)}
                        />
                    ))}
                </div>
            )}

            {/* History Section (Optional) */}
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
        </main>
    );
};

export default Wishlist;
