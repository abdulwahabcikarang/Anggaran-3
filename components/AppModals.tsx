
import React, { useState, useEffect, useRef } from 'react';
import { Budget, SavingsGoal, SavingTransaction, ScannedItem, Asset, Subscription } from '../types';
import { availableIcons, availableColors, BudgetIcon, SpeakerWaveIcon, ArrowPathIcon, PaperAirplaneIcon, TrashIcon, HeartIcon, BuildingLibraryIcon, ClockIcon, ServerStackIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, CalendarDaysIcon, LockClosedIcon, ExclamationTriangleIcon, ArchiveBoxIcon } from './Icons';
import { formatCurrency, formatNumberInput, getRawNumber, getApiKey, getSystemInstruction, createBlob, decodeAudioData, decode } from '../utils';
import { AISkeleton } from './UI';
import { GoogleGenAI, Type, LiveServerMessage, Modality, FunctionDeclaration } from '@google/genai';

// --- BASE COMPONENTS (Defined first to be used by others) ---

export const ScanResultModalContent: React.FC<{ isLoading: boolean, error: string | null, items: ScannedItem[], budgets: Budget[], onItemsChange: (items: ScannedItem[]) => void, onSave: () => void }> = ({ isLoading, error, items, budgets, onItemsChange, onSave }) => {
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

// --- FEATURE MODAL CONTENTS ---

export const InputModalContent: React.FC<{
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

export const AssetModalContent: React.FC<{
    assetToEdit?: Asset;
    onSubmit: (id: number | null, name: string, quantity: number, price: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => void;
}> = ({ assetToEdit, onSubmit }) => {
    const [type, setType] = useState<'custom' | 'gold' | 'crypto'>(assetToEdit?.type || 'custom');
    const [name, setName] = useState(assetToEdit?.name || '');
    const [qty, setQty] = useState(assetToEdit?.quantity.toString() || '1');
    const [price, setPrice] = useState(assetToEdit ? formatNumberInput(assetToEdit.pricePerUnit) : '');
    const [symbol, setSymbol] = useState(assetToEdit?.symbol || '');

    const goldOptions = [{ label: 'Emas Antam', value: 'ANTAM' }, { label: 'Emas UBS', value: 'UBS' }];
    const cryptoOptions = [{ label: 'Bitcoin (BTC)', value: 'BTC' }, { label: 'Ethereum (ETH)', value: 'ETH' }, { label: 'Solana (SOL)', value: 'SOL' }];

    const handleTypeChange = (newType: 'custom' | 'gold' | 'crypto') => {
        setType(newType);
        if (newType === 'custom') setSymbol('');
        else if (newType === 'gold') { setSymbol('ANTAM'); setName('Emas Antam'); }
        else if (newType === 'crypto') { setSymbol('BTC'); setName('Bitcoin'); }
    };

    const handleSymbolChange = (newSymbol: string) => {
        setSymbol(newSymbol);
        if (type === 'gold') { const opt = goldOptions.find(o => o.value === newSymbol); if (opt) setName(opt.label); }
        else if (type === 'crypto') { const opt = cryptoOptions.find(o => o.value === newSymbol); if (opt) setName(opt.label.split(' (')[0]); }
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
            {type === 'gold' && (<div><label className="block text-sm font-medium text-gray-700">Jenis Emas</label><select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">{goldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>)}
            {type === 'crypto' && (<div><label className="block text-sm font-medium text-gray-700">Koin Kripto</label><select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">{cryptoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>)}
            <div><label className="block text-sm font-medium text-gray-700">Nama Aset</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">{type === 'gold' ? 'Berat (Gram)' : 'Jumlah Unit'}</label><input type="number" step="any" value={qty} onChange={e => setQty(e.target.value)} className="w-full border p-2 rounded" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">{type === 'custom' ? 'Estimasi Harga Total' : 'Harga Beli Satuan (Opsional)'}</label><input type="text" inputMode="numeric" value={price} onChange={e => setPrice(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" /></div>
            </div>
            <button type="submit" className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Aset</button>
        </form>
    );
};

export const BatchInputModalContent: React.FC<{ budgets: Budget[]; onSave: (items: ScannedItem[]) => void; }> = ({ budgets, onSave }) => {
    const [text, setText] = useState('');
    const handleProcess = () => {
        const lines = text.split('\n').filter(l => l.trim());
        const items: ScannedItem[] = lines.map(line => {
            const match = line.match(/^(.+?)\s+(\d[\d\.]*)$/);
            if (match) return { desc: match[1].trim(), amount: getRawNumber(match[2]), budgetId: 'daily' };
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

export const AddBudgetModalContent: React.FC<{ onSubmit: (name: string, amount: number, icon: string, color: string) => void }> = ({ onSubmit }) => {
    return <InputModalContent mode="edit-post" allBudgets={[]} onSubmit={(d) => onSubmit(d.description, d.amount, d.icon || availableIcons[0], d.color || availableColors[0])} prefillData={null} onPrefillConsumed={() => {}} />;
};

export const AddSavingsGoalModalContent: React.FC<{ onSubmit: (name: string, isInfinite: boolean, targetAmount?: number, visualType?: 'plant' | 'pet') => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [isInfinite, setIsInfinite] = useState(false);
    const [visualType, setVisualType] = useState<'plant' | 'pet'>('plant');
    const [step, setStep] = useState(1);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFinish = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, isInfinite, isInfinite ? undefined : getRawNumber(target), visualType);
    };

    if (step === 1) {
        return (
            <div className="space-y-4">
                <h4 className="text-center font-bold text-gray-700">Pilih Jenis Celengan</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div 
                        onClick={() => setVisualType('plant')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${visualType === 'plant' ? 'border-accent-teal bg-teal-50 ring-2 ring-teal-200' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-2">
                            <BuildingLibraryIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-center font-bold text-primary-navy">Kebun Impian</p>
                        <p className="text-center text-xs text-gray-500 mt-1">Tanam benih yang akan tumbuh menjadi bunga indah.</p>
                    </div>

                    <div 
                        onClick={() => setVisualType('pet')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${visualType === 'pet' ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-2">
                            <HeartIcon className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-center font-bold text-primary-navy">Evolusi Pet</p>
                        <p className="text-center text-xs text-gray-500 mt-1">Tetaskan telur yang akan berevolusi menjadi hewan legendaris.</p>
                    </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-2 bg-primary-navy text-white font-bold rounded-lg">Lanjut</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleFinish} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-primary-navy underline">Kembali</button>
                <span className="text-xs font-bold text-gray-400">|</span>
                <span className="text-xs font-bold text-accent-teal">Tipe: {visualType === 'plant' ? 'Tanaman' : 'Pet'}</span>
            </div>
            <div><label className="block text-sm">Nama Tujuan</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required placeholder="Misal: Beli Laptop Baru" /></div>
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

export const AddSavingsModalContent: React.FC<{ goal?: SavingsGoal, availableFunds: number, onSubmit: (amount: number) => void }> = ({ goal, availableFunds, onSubmit }) => {
    const [amount, setAmount] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(getRawNumber(amount)); }} className="space-y-4">
            <p className="text-sm text-gray-600">Dana tersedia: {formatCurrency(availableFunds)}</p>
            <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Nominal Tabungan" required />
            <button type="submit" className="w-full py-2 bg-primary-navy text-white font-bold rounded">Tabung Sekarang</button>
        </form>
    );
};

export const WithdrawSavingsModalContent: React.FC<{ goal?: SavingsGoal, onSubmit: (amount: number) => void }> = ({ goal, onSubmit }) => {
    const [amount, setAmount] = useState('');
    if (!goal) return null;
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(getRawNumber(amount)); }} className="space-y-4">
            <p className="text-sm text-gray-600">Terkumpul saat ini: <strong>{formatCurrency(goal.savedAmount)}</strong></p>
            <p className="text-xs text-red-500 italic">Peringatan: Mengambil tabungan akan menurunkan level evolusi tanaman/pet.</p>
            <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Nominal Penarikan" required />
            <button type="submit" className="w-full py-2 bg-danger-red text-white font-bold rounded">Ambil Dana</button>
        </form>
    );
};

export const SavingsDetailModalContent: React.FC<{ goal?: SavingsGoal, onDelete: () => void }> = ({ goal, onDelete }) => {
    if (!goal) return null;
    return (
        <div className="space-y-4">
            <h4 className="font-bold">Riwayat Transaksi Celengan</h4>
            <ul className="max-h-40 overflow-y-auto space-y-2">
                {goal.history.map((h, i) => (
                    <li key={i} className="flex justify-between text-sm">
                        <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                        <span className={`font-semibold ${h.amount < 0 ? 'text-danger-red' : 'text-accent-teal'}`}>
                            {h.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(h.amount))}
                        </span>
                    </li>
                ))}
            </ul>
            <button onClick={onDelete} className="w-full py-2 bg-red-100 text-red-600 font-bold rounded flex items-center justify-center gap-2">
                <TrashIcon className="w-4 h-4" /> Hapus Celengan
            </button>
        </div>
    );
};

export const FundsManagementModalContent: React.FC<{ onSubmit: (type: 'add' | 'remove', desc: string, amount: number) => void, onViewHistory: () => void, initialTab?: 'add' | 'remove' }> = ({ onSubmit, onViewHistory, initialTab = 'add' }) => {
    const [tab, setTab] = useState<'add' | 'remove'>(initialTab);
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    useEffect(() => { setTab(initialTab); }, [initialTab]);
    return (
        <div className="space-y-4">
            <div className="flex gap-2"><button onClick={() => setTab('add')} className={`flex-1 py-2 rounded ${tab === 'add' ? 'bg-accent-teal text-white' : 'bg-gray-100'}`}>Pemasukan</button><button onClick={() => setTab('remove')} className={`flex-1 py-2 rounded ${tab === 'remove' ? 'bg-danger-red text-white' : 'bg-gray-100'}`}>Pengeluaran</button></div>
            <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded" placeholder="Keterangan" required />
            <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Jumlah" required />
            <button onClick={() => onSubmit(tab, desc, getRawNumber(amount))} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Simpan</button>
            <button onClick={onViewHistory} className="w-full py-2 text-sm text-gray-600 underline">Lihat Riwayat</button>
        </div>
    );
};

export const HistoryModalContent: React.FC<{ transactions: any[], type: string, budgetId?: number, onDelete: (ts: number, type: string, bid?: number) => void }> = ({ transactions, type, budgetId, onDelete }) => (
    <ul className="space-y-2">
        {transactions.length === 0 ? <p className="text-center text-gray-500">Belum ada riwayat.</p> : transactions.map((t) => (
            <li key={t.timestamp} className="flex justify-between items-center p-2 border-b"><div className="text-sm"><p className="font-bold">{t.desc}</p><p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className={`font-bold ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'add' ? '+' : '-'}{formatCurrency(t.amount)}</span><button onClick={() => onDelete(t.timestamp, type, budgetId)} className="text-red-400"><TrashIcon className="w-4 h-4"/></button></div></li>
        ))}
    </ul>
);

export const InfoModalContent: React.FC<{ monthlyIncome: number, totalAllocated: number, unallocatedFunds: number, generalAndDailyExpenses: number, remainingUnallocated: number }> = (props) => (
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

export const EditAssetModalContent: React.FC<{ currentAsset: number, onSubmit: (val: number) => void }> = ({ currentAsset, onSubmit }) => {
    const [val, setVal] = useState(formatNumberInput(currentAsset));
    return (
        <div className="space-y-4">
            <p className="text-sm">Saldo saat ini: {formatCurrency(currentAsset)}</p>
            <input type="text" inputMode="numeric" value={val} onChange={e => setVal(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Masukkan Saldo Sebenarnya" />
            <button onClick={() => onSubmit(getRawNumber(val))} className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Koreksi</button>
        </div>
    );
};

export const SettingsModalContent: React.FC<{ 
    onExport: () => void, onImport: () => void, onManageArchived: () => void, onManualBackup: () => void, onManageBackups: () => void, onResetMonthly: () => void, onResetAll: () => void, onManualCloseBook: () => void, lastImportDate: string | null, lastExportDate: string | null
}> = (props) => (
    <div className="space-y-6">
        <section>
            <h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2"><ServerStackIcon className="w-4 h-4" />Manajemen Data</h4>
            <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col"><button onClick={props.onExport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group w-full h-full"><ArrowUpTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" /><span className="text-sm font-bold text-dark-text">Ekspor JSON</span></button>{props.lastExportDate && (<p className="text-[10px] text-center text-secondary-gray mt-1">Terakhir: {new Date(props.lastExportDate).toLocaleString('id-ID')}</p>)}</div>
                    <div className="flex flex-col"><button onClick={props.onImport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group h-full"><ArrowDownTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" /><span className="text-sm font-bold text-dark-text">Impor JSON</span></button>{props.lastImportDate && (<p className="text-[10px] text-center text-secondary-gray mt-1">Terakhir: {new Date(props.lastImportDate).toLocaleString('id-ID')}</p>)}</div>
                </div>
                <button onClick={props.onManualBackup} className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors text-left group"><div className="bg-blue-200 p-2 rounded-lg text-blue-700"><ServerStackIcon className="w-5 h-5" /></div><div><p className="text-sm font-bold text-primary-navy">Cadangkan Sekarang</p><p className="text-xs text-blue-600">Simpan data ke memori browser</p></div></button>
                <div className="grid grid-cols-2 gap-3"><button onClick={props.onManageBackups} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray"><ClockIcon className="w-4 h-4" />Riwayat Cadangan</button><button onClick={props.onManageArchived} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray"><ArchiveBoxIcon className="w-4 h-4" />Arsip Anggaran</button></div>
            </div>
        </section>
        <hr className="border-gray-100" />
        <section><h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4" />Siklus Keuangan</h4><button onClick={props.onManualCloseBook} className="w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl transition-colors text-left group"><div className="bg-yellow-200 p-2 rounded-lg text-yellow-800"><LockClosedIcon className="w-5 h-5" /></div><div><p className="font-bold text-yellow-900">Tutup Buku Bulan Ini</p><p className="text-xs text-yellow-700">Arsipkan transaksi & reset anggaran</p></div></button></section>
        <section><h4 className="text-xs font-bold text-danger-red uppercase tracking-wider mb-3 flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4" />Zona Bahaya</h4><div className="bg-red-50 border border-red-100 rounded-xl p-1"><button onClick={props.onResetMonthly} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-600 text-sm font-medium flex items-center gap-2 transition-colors"><TrashIcon className="w-4 h-4" />Reset Data Bulan Ini (Debug)</button><button onClick={props.onResetAll} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-800 text-sm font-bold flex items-center gap-2 transition-colors"><ExclamationTriangleIcon className="w-4 h-4" />Reset SEMUA Data (Pabrik)</button></div></section>
    </div>
);

export const ArchivedBudgetsModalContent: React.FC<{ archivedBudgets: Budget[], onRestore: (id: number) => void, onDelete: (id: number) => void }> = ({ archivedBudgets, onRestore, onDelete }) => (
    <ul className="space-y-2">
        {archivedBudgets.length === 0 ? <p className="text-center text-gray-500">Tidak ada arsip.</p> : archivedBudgets.map(b => (
            <li key={b.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-semibold">{b.name}</span><div className="flex gap-2"><button onClick={() => onRestore(b.id)} className="text-sm text-blue-600">Pulihkan</button><button onClick={() => onDelete(b.id)} className="text-sm text-red-600">Hapus</button></div></li>
        ))}
    </ul>
);

export const BackupRestoreModalContent: React.FC<{ backups: { key: string, timestamp: number }[], onRestore: (key: string) => void }> = ({ backups, onRestore }) => (
    <ul className="space-y-2">
        {backups.length === 0 ? <p className="text-center text-gray-500">Tidak ada cadangan internal.</p> : backups.map(b => (
            <li key={b.key} className="flex justify-between items-center p-2 border rounded"><span>{new Date(b.timestamp).toLocaleString()}</span><button onClick={() => onRestore(b.key)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Pulihkan</button></li>
        ))}
    </ul>
);

// --- DEPENDENT COMPONENTS (Must be defined AFTER ScanResultModalContent) ---

export const VoiceAssistantModalContent: React.FC<{ budgets: Budget[], activePersona?: string, onFinish: (items: ScannedItem[]) => void, onClose: () => void }> = ({ budgets, activePersona, onFinish, onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("Siap terhubung...");
    const [collectedItems, setCollectedItems] = useState<ScannedItem[]>([]);
    const addTransactionTool: FunctionDeclaration = {
        name: 'addTransaction',
        parameters: {
            type: Type.OBJECT,
            properties: { desc: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING } },
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
                                    const newItem: ScannedItem = { desc: args.desc, amount: args.amount, budgetId: budgetId as any };
                                    setCollectedItems(prev => [...prev, newItem]);
                                    sessionPromise.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Transaction noted." } } }));
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
                    onclose: () => { setStatus("Terputus."); setIsConnected(false); },
                    onerror: (e) => { console.error(e); setStatus("Error koneksi."); }
                },
                config: { responseModalities: [Modality.AUDIO], tools: [{functionDeclarations: [addTransactionTool]}], systemInstruction: `${getSystemInstruction(activePersona)} Tugasmu adalah membantu mencatat pengeluaran. Jika user menyebutkan pengeluaran, panggil fungsi addTransaction.` }
            });
        } catch (err) { console.error(err); setStatus("Gagal inisialisasi."); }
    };
    return (
        <div className="p-6 text-center space-y-4">
            <SpeakerWaveIcon className={`w-16 h-16 mx-auto ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <p className="font-bold text-lg">{status}</p>
            {!isConnected ? (<button onClick={connect} className="px-6 py-2 bg-primary-navy text-white rounded-full font-bold">Mulai Bicara</button>) : (<div className="space-y-2"><p className="text-sm text-gray-600">Transaksi terdeteksi: {collectedItems.length}</p><button onClick={() => { onFinish(collectedItems); onClose(); }} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold">Selesai</button></div>)}
        </div>
    );
};

export const SmartInputModalContent: React.FC<{ isProcessing: boolean, error: string | null, resultItems: ScannedItem[], budgets: Budget[], onProcess: (text: string) => void, onSave: () => void, onItemsChange: (items: ScannedItem[]) => void, onClearError: () => void }> = ({ isProcessing, error, resultItems, budgets, onProcess, onSave, onItemsChange, onClearError }) => {
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

export const AIAdviceModalContent: React.FC<{ isLoading: boolean, error: string | null, advice: string }> = ({ isLoading, error, advice }) => {
    if (isLoading) return <AISkeleton />;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    return <div className="prose prose-sm max-w-none whitespace-pre-line">{advice}</div>;
};

export const AIChatModalContent: React.FC<{ history: { role: string, text: string }[], isLoading: boolean, error: string | null, onSendMessage: (msg: string) => void }> = ({ history, isLoading, error, onSendMessage }) => {
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

export const AddWishlistModalContent: React.FC<{ onSubmit: (name: string, price: number, days: number) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [deadlineMode, setDeadlineMode] = useState<'manual' | 'nextMonth' | 'infinite'>('manual');
    const [manualDays, setManualDays] = useState('3');
    const calculateDaysUntilNextMonth = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diffTime = Math.abs(nextMonth.getTime() - now.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawPrice = getRawNumber(price);
        let finalDays = 0;
        if (deadlineMode === 'manual') finalDays = parseInt(manualDays);
        else if (deadlineMode === 'nextMonth') finalDays = calculateDaysUntilNextMonth();
        else if (deadlineMode === 'infinite') finalDays = -1;
        if (name.trim() && rawPrice > 0 && (finalDays > 0 || finalDays === -1)) onSubmit(name.trim(), rawPrice, finalDays);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="wish-name" className="block text-sm font-medium text-secondary-gray">Nama Barang</label><input type="text" id="wish-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Sepatu Lari Baru" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"/></div>
            <div><label htmlFor="wish-price" className="block text-sm font-medium text-secondary-gray">Harga (Rp)</label><input type="text" inputMode="numeric" id="wish-price" value={price} onChange={e => setPrice(formatNumberInput(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"/></div>
            <div>
                <label className="block text-sm font-medium text-secondary-gray mb-2">Waktu Pendinginan</label>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2"><button type="button" onClick={() => setDeadlineMode('manual')} className={`flex-1 py-2 px-2 rounded text-xs font-bold border ${deadlineMode === 'manual' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-secondary-gray border-gray-300'}`}>Manual</button><button type="button" onClick={() => setDeadlineMode('nextMonth')} className={`flex-1 py-2 px-2 rounded text-xs font-bold border ${deadlineMode === 'nextMonth' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-secondary-gray border-gray-300'}`}>Awal Bulan Depan</button><button type="button" onClick={() => setDeadlineMode('infinite')} className={`flex-1 py-2 px-2 rounded text-xs font-bold border ${deadlineMode === 'infinite' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-secondary-gray border-gray-300'}`}>Tanpa Batas</button></div>
                    {deadlineMode === 'manual' && (<div className="mt-1"><input type="number" min="1" value={manualDays} onChange={e => setManualDays(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-center" placeholder="Jumlah Hari"/><p className="text-xs text-secondary-gray mt-1 text-center">Masukkan jumlah hari pendinginan.</p></div>)}
                    {deadlineMode === 'nextMonth' && (<p className="text-xs text-accent-teal mt-1 text-center font-semibold">Otomatis diset {calculateDaysUntilNextMonth()} hari lagi.</p>)}
                    {deadlineMode === 'infinite' && (<p className="text-xs text-secondary-gray mt-1 text-center italic">Item akan selalu ada di wishlist sampai Anda memutuskan.</p>)}
                </div>
            </div>
            <button type="submit" className="w-full bg-primary-navy text-white font-bold py-3 rounded-lg hover:bg-primary-navy-dark transition-colors">Simpan ke Wishlist</button>
        </form>
    );
};
