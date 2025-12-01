
import React, { useState } from 'react';
import { ArrowUturnLeftIcon, ShoppingCartIcon, ClockIcon, PlusCircleIcon, TrashIcon, CheckCircleIcon, SparklesIcon, CalculatorIcon, ReceiptPercentIcon } from './Icons';
import { Budget, ShoppingItem } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { getApiKey, formatNumberInput, getRawNumber, formatCurrency } from '../utils';
import { Modal } from './AppUI';

interface ShoppingListProps {
    onBack: () => void;
    budgets: Budget[];
    onAddTransaction: (desc: string, amount: number, budgetId: number | 'daily') => void;
    // New Props for persistence
    items: ShoppingItem[];
    onAddItem: (item: ShoppingItem) => void;
    onToggleItem: (id: number) => void;
    onDeleteItem: (id: number) => void;
    onUpdateEstimate: (id: number, val: number) => void;
    onClearAll: () => void;
    onClearChecked: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
    onBack, budgets, onAddTransaction, 
    items, onAddItem, onToggleItem, onDeleteItem, onUpdateEstimate, onClearAll, onClearChecked 
}) => {
    const [newItemName, setNewItemName] = useState('');
    const [targetBudgetId, setTargetBudgetId] = useState<number | 'daily'>('daily');
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    
    // Modal States
    const [showSmartInput, setShowSmartInput] = useState(false);
    const [smartInputText, setSmartInputText] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [finalTotal, setFinalTotal] = useState('');

    // --- BASIC ITEM MANAGEMENT ---
    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const newItem: ShoppingItem = {
            id: Date.now(),
            name: newItemName.trim(),
            estimate: 0,
            isChecked: false
        };
        onAddItem(newItem);
        setNewItemName('');
    };

    // --- AI FEATURES ---
    const handleSmartInput = async () => {
        if (!smartInputText.trim()) return;
        setIsAIProcessing(true);
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Extract shopping items from this text: "${smartInputText}". Return a JSON array of strings (names only). Example: ["Beras 5kg", "Telur", "Minyak Goreng"].`;
            const schema = { type: Type.ARRAY, items: { type: Type.STRING } };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });

            const parsedItems: string[] = JSON.parse(response.text || "[]");
            
            parsedItems.forEach(name => {
                onAddItem({
                    id: Date.now() + Math.random(),
                    name: name,
                    estimate: 0,
                    isChecked: false
                });
            });

            setSmartInputText('');
            setShowSmartInput(false);
        } catch (error) {
            console.error("AI Error:", error);
            alert("Gagal memproses input cerdas. Coba lagi.");
        } finally {
            setIsAIProcessing(false);
        }
    };

    const handleAIEstimate = async () => {
        const itemsToEstimate = items.filter(i => i.estimate === 0);
        if (itemsToEstimate.length === 0) return;

        setIsAIProcessing(true);
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const itemNames = itemsToEstimate.map(i => i.name).join(", ");
            const prompt = `Estimate the price in IDR (Indonesian Rupiah) for these items in 2024 Indonesia: ${itemNames}. Return a JSON object where keys are item names and values are estimated prices (numbers). Use standard market prices. Example: {"Beras 5kg": 75000, "Telur 1kg": 28000}.`;
            const schema = { 
                type: Type.OBJECT, 
                properties: itemsToEstimate.reduce((acc, item) => ({ ...acc, [item.name]: { type: Type.NUMBER } }), {}) 
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });

            const estimates: Record<string, number> = JSON.parse(response.text || "{}");
            
            // Apply estimates using the handler for each item
            itemsToEstimate.forEach(item => {
                if (estimates[item.name]) {
                    onUpdateEstimate(item.id, estimates[item.name]);
                }
            });

        } catch (error) {
            console.error("AI Estimate Error:", error);
            alert("Gagal mengestimasi harga. Coba lagi.");
        } finally {
            setIsAIProcessing(false);
        }
    };

    // --- CHECKOUT LOGIC ---
    const checkedItems = items.filter(i => i.isChecked);
    const totalEstimate = checkedItems.reduce((sum, i) => sum + i.estimate, 0);

    const handleOpenCheckout = () => {
        if (checkedItems.length === 0) {
            alert("Pilih setidaknya satu item untuk checkout.");
            return;
        }
        setFinalTotal(formatNumberInput(totalEstimate));
        setShowCheckout(true);
    };

    const handleConfirmCheckout = () => {
        const amount = getRawNumber(finalTotal);
        if (amount <= 0) {
            alert("Masukkan total belanja yang valid.");
            return;
        }

        const itemNames = checkedItems.map(i => i.name).join(", ");
        const description = `[Belanja] ${itemNames}`;
        
        // Save Transaction
        onAddTransaction(description, amount, targetBudgetId);
        
        // Clear only checked items
        onClearChecked();
        
        setShowCheckout(false);
        setFinalTotal('');
    };

    return (
        <main className="min-h-screen flex flex-col bg-transparent animate-fade-in pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onBack} 
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <ArrowUturnLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-primary-navy">Daftar Belanja</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSmartInput(true)} 
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                            title="Input Cerdas AI"
                        >
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Budget Selection Dropdown */}
                <select 
                    value={targetBudgetId} 
                    onChange={(e) => setTargetBudgetId(e.target.value === 'daily' ? 'daily' : Number(e.target.value))}
                    className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-primary-navy rounded-lg px-3 py-2 text-sm font-semibold text-primary-navy outline-none transition-all"
                >
                    <option value="daily">Dana Harian (Non-Budget)</option>
                    {budgets.map(b => (
                        <option key={b.id} value={b.id}>Pos: {b.name}</option>
                    ))}
                </select>
            </header>

            {/* List Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {items.length > 0 && (
                    <div className="flex justify-end mb-2">
                        <button 
                            onClick={onClearAll} 
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                        >
                            <TrashIcon className="w-3 h-3" /> Hapus Semua List
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                        <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">List belanja kosong.</p>
                        <p className="text-xs text-gray-400 mt-1">Ketuk tombol ✨ di atas untuk input ajaib.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className={`flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border transition-all ${item.isChecked ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                            <button 
                                onClick={() => onToggleItem(item.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                            >
                                {item.isChecked && <CheckCircleIcon className="w-4 h-4 text-white" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${item.isChecked ? 'text-gray-400 line-through' : 'text-dark-text'}`}>{item.name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-400">Rp</span>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        className="text-xs font-medium text-primary-navy bg-transparent border-b border-gray-200 focus:border-primary-navy outline-none w-20 px-0 py-0"
                                        placeholder="0"
                                        value={formatNumberInput(item.estimate)}
                                        onChange={(e) => onUpdateEstimate(item.id, getRawNumber(e.target.value))}
                                        disabled={item.isChecked}
                                    />
                                </div>
                            </div>

                            <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-lg pb-8">
                {items.some(i => i.estimate === 0 && !i.isChecked) && (
                    <button 
                        onClick={handleAIEstimate}
                        disabled={isAIProcessing}
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-xs font-bold border border-yellow-200 hover:bg-yellow-100 transition-colors"
                    >
                        {isAIProcessing ? <ClockIcon className="w-4 h-4 animate-spin" /> : <CalculatorIcon className="w-4 h-4" />}
                        {isAIProcessing ? 'Menghitung...' : 'Hitung Estimasi Harga (AI)'}
                    </button>
                )}

                <div className="flex gap-2 mb-3">
                    <input 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        placeholder="Tambah item manual..."
                        className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary-navy outline-none transition-all"
                    />
                    <button 
                        onClick={handleAddItem}
                        disabled={!newItemName.trim()}
                        className="bg-primary-navy text-white p-3 rounded-lg hover:bg-primary-navy-dark transition-colors disabled:opacity-50"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {checkedItems.length > 0 && (
                    <button 
                        onClick={handleOpenCheckout}
                        className="w-full bg-accent-teal text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 hover:bg-accent-teal-dark transition-all flex items-center justify-center gap-2"
                    >
                        <ReceiptPercentIcon className="w-5 h-5" />
                        Selesai Belanja ({checkedItems.length})
                    </button>
                )}
            </div>

            {/* Smart Input Modal */}
            <Modal 
                isOpen={showSmartInput} 
                onClose={() => setShowSmartInput(false)} 
                title="Input Belanja Cerdas"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Ketik daftar belanjaanmu dengan bahasa sehari-hari. AI akan merapikannya untukmu.
                    </p>
                    <textarea 
                        value={smartInputText}
                        onChange={(e) => setSmartInputText(e.target.value)}
                        placeholder="Contoh: Mau beli beras 5 kilo, telur sekilo, kecap manis, sama sabun cuci piring."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy outline-none text-sm"
                    />
                    <button 
                        onClick={handleSmartInput}
                        disabled={isAIProcessing || !smartInputText.trim()}
                        className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isAIProcessing ? 'Memproses...' : <><SparklesIcon className="w-4 h-4 text-yellow-300" /> Buat Daftar</>}
                    </button>
                </div>
            </Modal>

            {/* Checkout Modal */}
            <Modal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                title="Konfirmasi Belanja"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Item Dibeli ({checkedItems.length})</p>
                        <ul className="text-sm space-y-1 text-gray-700">
                            {checkedItems.map(i => (
                                <li key={i.id} className="flex justify-between">
                                    <span>{i.name}</span>
                                    <span className="text-gray-400 text-xs">~{formatCurrency(i.estimate)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-500">Total Estimasi:</span>
                        <span className="font-bold text-gray-700">{formatCurrency(totalEstimate)}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="block text-sm font-bold text-primary-navy mb-2">Total Harga Final (Struk)</label>
                        <input 
                            type="text"
                            inputMode="numeric"
                            value={finalTotal}
                            onChange={(e) => setFinalTotal(formatNumberInput(e.target.value))}
                            className="w-full text-2xl font-bold text-center border-b-2 border-primary-navy focus:outline-none py-2 text-primary-navy"
                            placeholder="Rp 0"
                            autoFocus
                        />
                        <p className="text-center text-xs text-gray-400 mt-2">Nominal ini yang akan dicatat di pengeluaran.</p>
                    </div>

                    <button 
                        onClick={handleConfirmCheckout}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors mt-2"
                    >
                        Simpan Transaksi
                    </button>
                </div>
            </Modal>
        </main>
    );
};

export default ShoppingList;
