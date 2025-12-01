
import React, { useState, useEffect, useRef } from 'react';
import { Budget, SavingsGoal, SavingTransaction, ScannedItem, Asset, Subscription, DebtItem, DebtRecord } from '../types';
import { availableIcons, availableColors, BudgetIcon, SpeakerWaveIcon, ArrowPathIcon, PaperAirplaneIcon, TrashIcon, HeartIcon, BuildingLibraryIcon, ClockIcon, ServerStackIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, CalendarDaysIcon, LockClosedIcon, ExclamationTriangleIcon, ArchiveBoxIcon, TicketIcon, HandRaisedIcon, PlusCircleIcon, CheckCircleIcon, SparklesIcon, FireIcon, RocketLaunchIcon, ShieldCheckIcon, StarIconFilled, GiftIcon } from './Icons';
import { formatCurrency, formatNumberInput, getRawNumber, getApiKey, getSystemInstruction, createBlob, decodeAudioData, decode } from '../utils';
import { AISkeleton } from './UI';
import { GoogleGenAI, Type, LiveServerMessage, Modality, FunctionDeclaration } from '@google/genai';
import { SKIN_ASSETS } from '../assets';
import { SHOP_ITEMS } from './Shop';

export const ScanResultModalContent: React.FC<{ isLoading: boolean, error: string | null, items: ScannedItem[], budgets: Budget[], onItemsChange: (items: ScannedItem[]) => void, onSave: () => void }> = ({ isLoading, error, items, budgets, onItemsChange, onSave }) => {
    // ... (No change)
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

// ... (DebtManagerModalContent, AddBudgetModalContent, InputModalContent, AssetModalContent, BatchInputModalContent, AddSavingsGoalModalContent, AddSavingsModalContent, WithdrawSavingsModalContent, SavingsDetailModalContent, FundsManagementModalContent, HistoryModalContent, InfoModalContent, EditAssetModalContent, SettingsModalContent, ArchivedBudgetsModalContent, BackupRestoreModalContent, VoiceAssistantModalContent, SmartInputModalContent, AIAdviceModalContent, AIChatModalContent, AddWishlistModalContent, RedeemModalContent - Unchanged, just ensuring correct export structure)

export const DebtManagerModalContent: React.FC<{ 
    debts: DebtItem[]; 
    onAddDebt: (item: Omit<DebtItem, 'id' | 'paid' | 'history' | 'isPaidOff' | 'createdAt'>, sync: boolean) => void;
    onDeleteDebt: (id: number) => void;
    onAddTransaction: (id: number, amount: number, note: string, sync: boolean) => void;
    onIncreaseDebt?: (id: number, amount: number, note: string, sync: boolean) => void;
    onClose: () => void;
}> = ({ debts, onAddDebt, onDeleteDebt, onAddTransaction, onIncreaseDebt, onClose }) => {
    const [activeTab, setActiveTab] = useState<'borrowed' | 'lent'>('borrowed'); 
    const [view, setView] = useState<'list' | 'add' | 'pay' | 'increase'>('list');
    const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newNote, setNewNote] = useState('');
    const [syncWallet, setSyncWallet] = useState(true);
    const [payAmount, setPayAmount] = useState('');
    const [payNote, setPayNote] = useState('');

    const filteredDebts = debts.filter(d => d.type === activeTab);
    const totalAmount = filteredDebts.reduce((sum, d) => sum + (d.amount - d.paid), 0);

    const handleSaveNew = () => { if (!newName || !newAmount) return; onAddDebt({ type: activeTab, person: newName, amount: getRawNumber(newAmount), description: newNote, dueDate: newDate }, syncWallet); setView('list'); setNewName(''); setNewAmount(''); setNewDate(''); setNewNote(''); };
    const handlePay = () => { if (!selectedDebt || !payAmount) return; onAddTransaction(selectedDebt.id, getRawNumber(payAmount), payNote, syncWallet); setView('list'); setSelectedDebt(null); setPayAmount(''); setPayNote(''); };
    const handleIncrease = () => { if (!selectedDebt || !payAmount || !onIncreaseDebt) return; onIncreaseDebt(selectedDebt.id, getRawNumber(payAmount), payNote, syncWallet); setView('list'); setSelectedDebt(null); setPayAmount(''); setPayNote(''); };
    const openPay = (debt: DebtItem) => { setSelectedDebt(debt); setView('pay'); setPayAmount(''); setSyncWallet(true); };
    const openIncrease = (debt: DebtItem) => { setSelectedDebt(debt); setView('increase'); setPayAmount(''); setSyncWallet(true); };

    if (view === 'add') {
        return ( <div className="space-y-4"><div className="flex items-center gap-2 mb-4"><button onClick={() => setView('list')} className="text-secondary-gray hover:text-primary-navy"><ArrowUpTrayIcon className="w-5 h-5 rotate-[-90deg]" /></button><h3 className="font-bold text-primary-navy">Tambah {activeTab === 'borrowed' ? 'Hutang Baru' : 'Piutang Baru'}</h3></div><div><label className="block text-sm font-medium text-gray-700">Nama Orang / Pihak</label><input value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded" placeholder="Contoh: Budi" /></div><div><label className="block text-sm font-medium text-gray-700">Jumlah {activeTab === 'borrowed' ? 'Pinjaman' : 'Dipinjamkan'}</label><input type="text" inputMode="numeric" value={newAmount} onChange={e => setNewAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Rp" /></div><div><label className="block text-sm font-medium text-gray-700">Jatuh Tempo (Opsional)</label><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border p-2 rounded" /></div><div><label className="block text-sm font-medium text-gray-700">Catatan</label><input value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full border p-2 rounded" placeholder="Keterangan tambahan..." /></div><div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg"><input type="checkbox" checked={syncWallet} onChange={e => setSyncWallet(e.target.checked)} id="syncWallet" className="w-4 h-4 text-primary-navy" /><label htmlFor="syncWallet" className="text-sm text-primary-navy">Catat otomatis di Dana Dompet? <br/><span className="text-xs text-gray-500">({activeTab === 'borrowed' ? 'Menambah Pemasukan' : 'Menambah Pengeluaran'})</span></label></div><button onClick={handleSaveNew} className="w-full bg-primary-navy text-white font-bold py-3 rounded-xl hover:bg-primary-navy-dark transition-colors">Simpan Catatan</button></div> );
    }
    if (view === 'pay' && selectedDebt) { const remaining = selectedDebt.amount - selectedDebt.paid; return ( <div className="space-y-4"><div className="flex items-center gap-2 mb-4"><button onClick={() => setView('list')} className="text-secondary-gray hover:text-primary-navy">Kembali</button><h3 className="font-bold text-primary-navy">{activeTab === 'borrowed' ? 'Bayar Hutang' : 'Terima Pembayaran'}</h3></div><div className="bg-gray-100 p-4 rounded-xl text-center"><p className="text-sm text-secondary-gray">Sisa Tagihan</p><p className="text-2xl font-bold text-primary-navy">{formatCurrency(remaining)}</p><p className="text-sm text-gray-500 mt-1">{selectedDebt.person}</p></div><div><label className="block text-sm font-medium text-gray-700">Jumlah Dibayar</label><input type="text" inputMode="numeric" value={payAmount} onChange={e => setPayAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Rp" /><button onClick={() => setPayAmount(formatNumberInput(remaining))} className="text-xs text-blue-600 mt-1 hover:underline">Bayar Lunas</button></div><div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg"><input type="checkbox" checked={syncWallet} onChange={e => setSyncWallet(e.target.checked)} id="syncPay" className="w-4 h-4 text-primary-navy" /><label htmlFor="syncPay" className="text-sm text-primary-navy">Update Saldo Dompet? <br/><span className="text-xs text-gray-500">({activeTab === 'borrowed' ? 'Kurangi Saldo (Pengeluaran)' : 'Tambah Saldo (Pemasukan)'})</span></label></div><button onClick={handlePay} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">Konfirmasi</button></div> ); }
    if (view === 'increase' && selectedDebt) { return ( <div className="space-y-4"><div className="flex items-center gap-2 mb-4"><button onClick={() => setView('list')} className="text-secondary-gray hover:text-primary-navy">Kembali</button><h3 className="font-bold text-primary-navy">Tambah {activeTab === 'borrowed' ? 'Hutang' : 'Piutang'}</h3></div><div className="bg-gray-100 p-4 rounded-xl text-center"><p className="text-sm text-secondary-gray">Total {activeTab === 'borrowed' ? 'Hutang' : 'Piutang'} Saat Ini</p><p className="text-2xl font-bold text-primary-navy">{formatCurrency(selectedDebt.amount)}</p><p className="text-sm text-gray-500 mt-1">{selectedDebt.person}</p></div><div><label className="block text-sm font-medium text-gray-700">Nominal Tambahan</label><input type="text" inputMode="numeric" value={payAmount} onChange={e => setPayAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Rp" autoFocus /></div><div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg"><input type="checkbox" checked={syncWallet} onChange={e => setSyncWallet(e.target.checked)} id="syncIncrease" className="w-4 h-4 text-primary-navy" /><label htmlFor="syncIncrease" className="text-sm text-primary-navy">Update Saldo Dompet? <br/><span className="text-xs text-gray-500">({activeTab === 'borrowed' ? 'Tambah Pemasukan (Dapat Pinjaman)' : 'Tambah Pengeluaran (Meminjamkan)'})</span></label></div><button onClick={handleIncrease} className="w-full bg-primary-navy text-white font-bold py-3 rounded-xl hover:bg-primary-navy-dark transition-colors">Simpan Tambahan</button></div> ); }

    return ( <div className="flex flex-col h-[500px]"><div className="flex p-1 bg-gray-100 rounded-xl mb-4 flex-shrink-0"><button onClick={() => setActiveTab('borrowed')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'borrowed' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Hutang Saya</button><button onClick={() => setActiveTab('lent')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'lent' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Piutang (Orang)</button></div><div className={`p-4 rounded-xl mb-4 text-white flex-shrink-0 shadow-md ${activeTab === 'borrowed' ? 'bg-red-500' : 'bg-green-600'}`}><p className="text-xs opacity-80 uppercase tracking-wider">{activeTab === 'borrowed' ? 'Total Yang Harus Dibayar' : 'Total Yang Akan Diterima'}</p><p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p></div><div className="flex-1 overflow-y-auto space-y-3 pr-1">{filteredDebts.length === 0 ? (<div className="text-center py-10 text-gray-400"><HandRaisedIcon className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>Tidak ada catatan {activeTab === 'borrowed' ? 'hutang' : 'piutang'}.</p></div>) : (filteredDebts.map(debt => { const remaining = debt.amount - debt.paid; const percentage = Math.min(100, (debt.paid / debt.amount) * 100); const isOverdue = debt.dueDate ? new Date(debt.dueDate) < new Date() && !debt.isPaidOff : false; return ( <div key={debt.id} className={`bg-white border rounded-xl p-3 shadow-sm ${debt.isPaidOff ? 'opacity-60 bg-gray-50' : 'border-gray-200'}`}><div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-dark-text">{debt.person}</h4><p className="text-xs text-secondary-gray">{debt.description || (activeTab === 'borrowed' ? 'Pinjaman' : 'Meminjamkan')}</p>{debt.dueDate && (<div className={`flex items-center gap-1 text-[10px] mt-1 font-bold ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}><CalendarDaysIcon className="w-3 h-3" />{new Date(debt.dueDate).toLocaleDateString()}{isOverdue && !debt.isPaidOff && " (Jatuh Tempo)"}</div>)}</div><div className="text-right"><p className="font-bold text-primary-navy">{formatCurrency(remaining)}</p><p className="text-[10px] text-gray-400">Total: {formatCurrency(debt.amount)}</p></div></div><div className="w-full bg-gray-100 rounded-full h-2 mb-3"><div className={`h-2 rounded-full ${activeTab === 'borrowed' ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${percentage}%` }}></div></div><div className="flex justify-end gap-2"><button onClick={() => onDeleteDebt(debt.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><TrashIcon className="w-4 h-4" /></button>{!debt.isPaidOff && (<><button onClick={() => openIncrease(debt)} className="p-1.5 text-gray-400 hover:text-primary-navy hover:bg-blue-50 rounded transition-colors" title="Tambah Nominal"><PlusCircleIcon className="w-4 h-4" /></button><button onClick={() => openPay(debt)} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm ${activeTab === 'borrowed' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>{activeTab === 'borrowed' ? 'Bayar' : 'Tagih'}</button></>)}{debt.isPaidOff && (<span className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold">Lunas</span>)}</div></div> ); }))}</div><button onClick={() => setView('add')} className="mt-4 w-full py-3 bg-primary-navy text-white font-bold rounded-xl shadow-lg hover:bg-primary-navy-dark transition-all flex items-center justify-center gap-2"><PlusCircleIcon className="w-5 h-5" />Tambah {activeTab === 'borrowed' ? 'Hutang' : 'Piutang'}</button></div> );
};

export const AddBudgetModalContent: React.FC<{ onSubmit: (name: string, amount: number, icon: string, color: string) => void }> = ({ onSubmit }) => {
    return <InputModalContent mode="edit-post" allBudgets={[]} onSubmit={(d) => onSubmit(d.description, d.amount, d.icon || availableIcons[0], d.color || availableColors[0])} prefillData={null} onPrefillConsumed={() => {}} />;
};

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

    useEffect(() => { if (prefillData) { setDesc(prefillData.desc); setAmount(prefillData.amount); onPrefillConsumed(); } }, [prefillData, onPrefillConsumed]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const rawAmount = getRawNumber(amount.toString()); if (mode === 'edit-post') { onSubmit({ description: desc, amount: rawAmount, icon, color }); } else { onSubmit({ description: desc, amount: rawAmount, targetId }); } };

    return ( <form onSubmit={handleSubmit} className="space-y-4">{mode === 'edit-post' ? (<><div><label className="block text-sm font-medium text-gray-700">Nama Pos</label><input value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 w-full border p-2 rounded" required /></div><div><label className="block text-sm font-medium text-gray-700">Total Anggaran</label><input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="mt-1 w-full border p-2 rounded" required /></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium text-gray-700">Ikon</label><div className="h-24 overflow-y-scroll border rounded p-2 grid grid-cols-4 gap-1">{availableIcons.map(ic => <div key={ic} onClick={() => setIcon(ic)} className={`p-1 cursor-pointer ${icon === ic ? 'bg-blue-100 rounded' : ''}`}><BudgetIcon icon={ic} className="w-6 h-6"/></div>)}</div></div><div><label className="block text-sm font-medium text-gray-700">Warna</label><div className="h-24 overflow-y-scroll border rounded p-2 grid grid-cols-4 gap-1">{availableColors.map(c => <div key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full cursor-pointer border ${color === c ? 'ring-2 ring-black' : ''}`} style={{backgroundColor: c}}/>)}</div></div></div>{onArchive && (<button type="button" onClick={onArchive} className="w-full py-2 bg-gray-200 rounded text-gray-700 font-bold">Arsipkan Pos Ini</button>)}</>) : (<><div><label className="block text-sm font-medium text-gray-700">Untuk Keperluan Apa?</label><input value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 w-full border p-2 rounded" required placeholder="Contoh: Makan Siang" /></div><div><label className="block text-sm font-medium text-gray-700">Berapa Rupiah?</label><input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="mt-1 w-full border p-2 rounded" required placeholder="0" /></div>{mode === 'use-daily' && (<div><label className="block text-sm font-medium text-gray-700">Ambil Dana Dari:</label><select value={targetId} onChange={e => setTargetId(e.target.value === 'daily' ? 'daily' : Number(e.target.value))} className="mt-1 w-full border p-2 rounded bg-white"><option value="daily">Dana Harian (Tersedia)</option>{allBudgets.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}</select></div>)}</>)}<button type="submit" className="w-full py-2 bg-primary-navy text-white rounded font-bold">Simpan Transaksi</button></form> );
};

export const AssetModalContent: React.FC<{ assetToEdit?: Asset; onSubmit: (id: number | null, name: string, quantity: number, price: number, type: 'custom' | 'gold' | 'crypto', symbol?: string) => void; }> = ({ assetToEdit, onSubmit }) => {
    const [type, setType] = useState<'custom' | 'gold' | 'crypto'>(assetToEdit?.type || 'custom');
    const [name, setName] = useState(assetToEdit?.name || '');
    const [qty, setQty] = useState(assetToEdit?.quantity.toString() || '1');
    const [price, setPrice] = useState(assetToEdit ? formatNumberInput(assetToEdit.pricePerUnit) : '');
    const [symbol, setSymbol] = useState(assetToEdit?.symbol || '');
    const goldOptions = [{ label: 'Emas Antam', value: 'ANTAM' }, { label: 'Emas UBS', value: 'UBS' }];
    const cryptoOptions = [{ label: 'Bitcoin (BTC)', value: 'BTC' }, { label: 'Ethereum (ETH)', value: 'ETH' }, { label: 'Solana (SOL)', value: 'SOL' }];
    const handleTypeChange = (newType: 'custom' | 'gold' | 'crypto') => { setType(newType); if (newType === 'custom') setSymbol(''); else if (newType === 'gold') { setSymbol('ANTAM'); setName('Emas Antam'); } else if (newType === 'crypto') { setSymbol('BTC'); setName('Bitcoin'); } };
    const handleSymbolChange = (newSymbol: string) => { setSymbol(newSymbol); if (type === 'gold') { const opt = goldOptions.find(o => o.value === newSymbol); if (opt) setName(opt.label); } else if (type === 'crypto') { const opt = cryptoOptions.find(o => o.value === newSymbol); if (opt) setName(opt.label.split(' (')[0]); } };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(assetToEdit?.id || null, name, Number(qty), getRawNumber(price), type, symbol); };
    return ( <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Tipe Aset</label><div className="flex gap-2"><button type="button" onClick={() => handleTypeChange('custom')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'custom' ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-600'}`}>Manual</button><button type="button" onClick={() => handleTypeChange('gold')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'gold' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Emas (Live)</button><button type="button" onClick={() => handleTypeChange('crypto')} className={`flex-1 py-2 text-sm font-bold rounded ${type === 'crypto' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Kripto (Live)</button></div></div>{type === 'gold' && (<div><label className="block text-sm font-medium text-gray-700">Jenis Emas</label><select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">{goldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>)}{type === 'crypto' && (<div><label className="block text-sm font-medium text-gray-700">Koin Kripto</label><select value={symbol} onChange={(e) => handleSymbolChange(e.target.value)} className="w-full border p-2 rounded bg-white">{cryptoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>)}<div><label className="block text-sm font-medium text-gray-700">Nama Aset</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">{type === 'gold' ? 'Berat (Gram)' : 'Jumlah Unit'}</label><input type="number" step="any" value={qty} onChange={e => setQty(e.target.value)} className="w-full border p-2 rounded" required /></div><div><label className="block text-sm font-medium text-gray-700">{type === 'custom' ? 'Estimasi Harga Total' : 'Harga Beli Satuan (Opsional)'}</label><input type="text" inputMode="numeric" value={price} onChange={e => setPrice(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" /></div></div><button type="submit" className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Aset</button></form> );
};

export const BatchInputModalContent: React.FC<{ budgets: Budget[]; onSave: (items: ScannedItem[]) => void; }> = ({ budgets, onSave }) => {
    const [text, setText] = useState('');
    const handleProcess = () => { const lines = text.split('\n').filter(l => l.trim()); const items: ScannedItem[] = lines.map(line => { const match = line.match(/^(.+?)\s+(\d[\d\.]*)$/); if (match) return { desc: match[1].trim(), amount: getRawNumber(match[2]), budgetId: 'daily' }; return { desc: line, amount: 0, budgetId: 'daily' }; }); onSave(items); };
    return ( <div className="space-y-4"><p className="text-sm text-gray-600">Masukkan daftar pengeluaran, satu per baris. Format: "Nama Barang Harga" (contoh: Nasi Goreng 15000).</p><textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-40 border p-2 rounded" placeholder="Bakso 15000&#10;Es Teh 3000" /><button onClick={handleProcess} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Proses & Simpan</button></div> );
};

export const AddSavingsGoalModalContent: React.FC<{ 
    onSubmit: (name: string, isInfinite: boolean, targetAmount?: number, visualType?: 'plant' | 'pet', skinId?: string) => void;
    inventory: string[]; // Pass user inventory
}> = ({ onSubmit, inventory }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [isInfinite, setIsInfinite] = useState(false);
    const [visualType, setVisualType] = useState<'plant' | 'pet'>('plant');
    const [selectedSkin, setSelectedSkin] = useState<string>('default');
    const [step, setStep] = useState(1);

    const handleNext = () => setStep(2);

    const handleFinish = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, isInfinite, isInfinite ? undefined : getRawNumber(target), visualType, selectedSkin);
    };

    const hasSkin = (reqId: string | null) => {
        if (!reqId) return true; // Default items
        return inventory.includes(reqId);
    };

    // --- SKIN CONFIGURATION ---
    const SKIN_OPTIONS = [
        // PLANTS
        { id: 'default', type: 'plant', name: 'Tanaman (Default)', icon: BuildingLibraryIcon, req: null, color: 'text-green-600' },
        { id: 'anthurium', type: 'plant', name: 'Anthurium', icon: SparklesIcon, req: 'skin_plant_anthurium', color: 'text-red-500' },
        { id: 'monstera', type: 'plant', name: 'Monstera', icon: ShieldCheckIcon, req: 'skin_plant_monstera', color: 'text-green-800' },
        { id: 'sakura', type: 'plant', name: 'Sakura', icon: SparklesIcon, req: 'skin_plant_sakura', color: 'text-pink-400' },
        { id: 'aglonema', type: 'plant', name: 'Aglonema', icon: FireIcon, req: 'skin_plant_aglonema', color: 'text-red-600' },
        { id: 'higanbana', type: 'plant', name: 'Higanbana', icon: StarIconFilled, req: 'skin_plant_higanbana', color: 'text-red-700' },
        { id: 'wijaya', type: 'plant', name: 'Wijayakusuma', icon: HeartIcon, req: 'skin_plant_wijaya', color: 'text-purple-600' },
        { id: 'kadupul', type: 'plant', name: 'Kadupul', icon: SparklesIcon, req: 'skin_plant_kadupul', color: 'text-gray-400' },
        
        // PETS
        { id: 'default', type: 'pet', name: 'Pet (Default)', icon: HeartIcon, req: null, color: 'text-orange-500' },
        { id: 'swan', type: 'pet', name: 'Angsa (Swan)', icon: SparklesIcon, req: 'skin_pet_swan', color: 'text-yellow-500' },
        { id: 'dragon', type: 'pet', name: 'Naga Emas', icon: FireIcon, req: 'skin_pet_dragon', color: 'text-red-600' },
        { id: 'robot', type: 'pet', name: 'Robo-Bank', icon: RocketLaunchIcon, req: 'skin_pet_robot', color: 'text-blue-500' },
        { id: 'turtle', type: 'pet', name: 'Kura-kura', icon: ShieldCheckIcon, req: 'skin_pet_turtle', color: 'text-green-500' },
        { id: 'jellyfish', type: 'pet', name: 'Ubur-ubur', icon: SparklesIcon, req: 'skin_pet_jellyfish', color: 'text-purple-500' },
        { id: 'fox', type: 'pet', name: 'Rubah Ekor 9', icon: StarIconFilled, req: 'skin_pet_fox', color: 'text-orange-600' },
    ];

    const availableSkins = SKIN_OPTIONS.filter(s => s.type === visualType && hasSkin(s.req));

    if (step === 1) {
        return (
            <div className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                    <button 
                        onClick={() => { setVisualType('plant'); setSelectedSkin('default'); }} 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${visualType === 'plant' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
                    >
                        Tanaman
                    </button>
                    <button 
                        onClick={() => { setVisualType('pet'); setSelectedSkin('default'); }} 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${visualType === 'pet' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        Peliharaan (Pet)
                    </button>
                </div>

                <h4 className="text-center font-bold text-gray-700 text-sm mb-2">Pilih Tampilan (Skin)</h4>
                
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                    {availableSkins.map(skin => (
                        <div 
                            key={skin.id}
                            onClick={() => setSelectedSkin(skin.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2
                                ${selectedSkin === skin.id 
                                    ? `border-${visualType === 'plant' ? 'green' : 'orange'}-500 bg-${visualType === 'plant' ? 'green' : 'orange'}-50` 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <skin.icon className={`w-6 h-6 ${skin.color}`} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{skin.name}</span>
                            {skin.req && <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">PREMIUM</span>}
                        </div>
                    ))}
                </div>

                <button onClick={handleNext} className="w-full py-3 bg-primary-navy text-white font-bold rounded-xl mt-4">Lanjut</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleFinish} className="space-y-4">
            <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-lg">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-primary-navy underline">Kembali</button>
                <span className="text-xs font-bold text-gray-400">|</span>
                <span className="text-xs font-bold text-accent-teal">
                    {SKIN_OPTIONS.find(s => s.type === visualType && s.id === selectedSkin)?.name || 'Default'}
                </span>
            </div>
            <div><label className="block text-sm font-medium">Nama Tujuan</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded-lg" required placeholder="Misal: Beli Laptop Baru" /></div>
            <div className="flex items-center bg-indigo-50 p-3 rounded-lg"><input type="checkbox" checked={isInfinite} onChange={e => setIsInfinite(e.target.checked)} className="mr-2 w-4 h-4 text-primary-navy" /> <label className="text-sm font-medium text-primary-navy">Celengan Tanpa Target (Fleksibel)</label></div>
            {!isInfinite && (
                <div>
                    <label className="block text-sm font-medium">Target Dana</label>
                    <input 
                        type="text"
                        inputMode="numeric"
                        value={target} 
                        onChange={e => setTarget(formatNumberInput(e.target.value))} 
                        className="w-full border p-2 rounded-lg" 
                        required 
                        placeholder="Rp"
                    />
                </div>
            )}
            <button type="submit" className="w-full py-3 bg-accent-teal text-white font-bold rounded-xl shadow-lg">Buat Celengan</button>
        </form>
    );
};

export const AddSavingsModalContent: React.FC<{ goal?: SavingsGoal, availableFunds: number, onSubmit: (amount: number) => void }> = ({ goal, availableFunds, onSubmit }) => {
    const [amount, setAmount] = useState('');
    return ( <form onSubmit={(e) => { e.preventDefault(); onSubmit(getRawNumber(amount)); }} className="space-y-4"><p className="text-sm text-gray-600">Dana tersedia: {formatCurrency(availableFunds)}</p><input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Nominal Tabungan" required /><button type="submit" className="w-full py-2 bg-primary-navy text-white font-bold rounded">Tabung Sekarang</button></form> );
};

export const WithdrawSavingsModalContent: React.FC<{ goal?: SavingsGoal, onSubmit: (amount: number) => void }> = ({ goal, onSubmit }) => {
    const [amount, setAmount] = useState('');
    if (!goal) return null;
    return ( <form onSubmit={(e) => { e.preventDefault(); onSubmit(getRawNumber(amount)); }} className="space-y-4"><p className="text-sm text-gray-600">Terkumpul saat ini: <strong>{formatCurrency(goal.savedAmount)}</strong></p><p className="text-xs text-red-500 italic">Peringatan: Mengambil tabungan akan menurunkan level evolusi tanaman/pet.</p><input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Nominal Penarikan" required /><button type="submit" className="w-full py-2 bg-danger-red text-white font-bold rounded">Ambil Dana</button></form> );
};

export const SavingsDetailModalContent: React.FC<{ goal?: SavingsGoal, onDelete: () => void }> = ({ goal, onDelete }) => {
    if (!goal) return null;
    return ( <div className="space-y-4"><h4 className="font-bold">Riwayat Transaksi Celengan</h4><ul className="max-h-40 overflow-y-auto space-y-2">{goal.history.map((h, i) => (<li key={i} className="flex justify-between text-sm"><span>{new Date(h.timestamp).toLocaleDateString()}</span><span className={`font-semibold ${h.amount < 0 ? 'text-danger-red' : 'text-accent-teal'}`}>{h.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(h.amount))}</span></li>))}</ul><button onClick={onDelete} className="w-full py-2 bg-red-100 text-red-600 font-bold rounded flex items-center justify-center gap-2"><TrashIcon className="w-4 h-4" /> Hapus Celengan</button></div> );
};

export const FundsManagementModalContent: React.FC<{ onSubmit: (type: 'add' | 'remove', desc: string, amount: number) => void, onViewHistory: () => void, initialTab?: 'add' | 'remove' }> = ({ onSubmit, onViewHistory, initialTab = 'add' }) => {
    const [tab, setTab] = useState<'add' | 'remove'>(initialTab);
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    useEffect(() => { setTab(initialTab); }, [initialTab]);
    return ( <div className="space-y-4"><div className="flex gap-2"><button onClick={() => setTab('add')} className={`flex-1 py-2 rounded ${tab === 'add' ? 'bg-accent-teal text-white' : 'bg-gray-100'}`}>Pemasukan</button><button onClick={() => setTab('remove')} className={`flex-1 py-2 rounded ${tab === 'remove' ? 'bg-danger-red text-white' : 'bg-gray-100'}`}>Pengeluaran</button></div><input value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded" placeholder="Keterangan" required /><input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Jumlah" required /><button onClick={() => onSubmit(tab, desc, getRawNumber(amount))} className="w-full py-2 bg-primary-navy text-white font-bold rounded">Simpan</button><button onClick={onViewHistory} className="w-full py-2 text-sm text-gray-600 underline">Lihat Riwayat</button></div> );
};

export const HistoryModalContent: React.FC<{ transactions: any[], type: string, budgetId?: number, onDelete: (ts: number, type: string, bid?: number) => void }> = ({ transactions, type, budgetId, onDelete }) => (
    <ul className="space-y-2">{transactions.length === 0 ? <p className="text-center text-gray-500">Belum ada riwayat.</p> : transactions.map((t) => (<li key={t.timestamp} className="flex justify-between items-center p-2 border-b"><div className="text-sm"><p className="font-bold">{t.desc}</p><p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className={`font-bold ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'add' ? '+' : '-'}{formatCurrency(t.amount)}</span><button onClick={() => onDelete(t.timestamp, type, budgetId)} className="text-red-400"><TrashIcon className="w-4 h-4"/></button></div></li>))}</ul>
);

export const InfoModalContent: React.FC<{ monthlyIncome: number, totalAllocated: number, unallocatedFunds: number, generalAndDailyExpenses: number, remainingUnallocated: number }> = (props) => (
    <div className="space-y-2 text-sm"><div className="flex justify-between"><span>Total Pemasukan:</span><span className="font-bold">{formatCurrency(props.monthlyIncome)}</span></div><div className="flex justify-between"><span>Dialokasikan ke Pos:</span><span className="font-bold">-{formatCurrency(props.totalAllocated)}</span></div><div className="border-t my-1"></div><div className="flex justify-between"><span>Dana Tidak Terikat:</span><span className="font-bold">{formatCurrency(props.unallocatedFunds)}</span></div><div className="flex justify-between text-red-600"><span>Pengeluaran (Harian+Umum):</span><span>-{formatCurrency(props.generalAndDailyExpenses)}</span></div><div className="border-t my-1"></div><div className="flex justify-between text-lg font-bold text-primary-navy"><span>Sisa Dana Tersedia:</span><span>{formatCurrency(props.remainingUnallocated)}</span></div></div>
);

export const EditAssetModalContent: React.FC<{ currentAsset: number, onSubmit: (val: number) => void }> = ({ currentAsset, onSubmit }) => {
    const [val, setVal] = useState(formatNumberInput(currentAsset));
    return ( <div className="space-y-4"><p className="text-sm">Saldo saat ini: {formatCurrency(currentAsset)}</p><input type="text" inputMode="numeric" value={val} onChange={e => setVal(formatNumberInput(e.target.value))} className="w-full border p-2 rounded" placeholder="Masukkan Saldo Sebenarnya" /><button onClick={() => onSubmit(getRawNumber(val))} className="w-full py-2 bg-accent-teal text-white font-bold rounded">Simpan Koreksi</button></div> );
};

export const SettingsModalContent: React.FC<{ 
    onExport: () => void, onImport: () => void, onManageArchived: () => void, onManualBackup: () => void, onManageBackups: () => void, onResetMonthly: () => void, onResetAll: () => void, onManualCloseBook: () => void, onRedeemCode: () => void, lastImportDate: string | null, lastExportDate: string | null
}> = (props) => (
    <div className="space-y-6">
        <section>
            <h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2"><TicketIcon className="w-4 h-4" />Promosi</h4>
            <button onClick={props.onRedeemCode} className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border border-yellow-200 rounded-xl transition-colors text-left group shadow-sm">
                <div className="bg-white p-2 rounded-lg text-orange-500 shadow-sm"><GiftIcon className="w-5 h-5" /></div>
                <div><p className="font-bold text-orange-900">Tukar Kode Promo</p><p className="text-xs text-orange-700">Dapatkan Mustika gratis</p></div>
            </button>
        </section>
        <hr className="border-gray-100" />
        <section><h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2"><ServerStackIcon className="w-4 h-4" />Manajemen Data</h4><div className="grid grid-cols-1 gap-3"><div className="grid grid-cols-2 gap-3"><div className="flex flex-col"><button onClick={props.onExport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group w-full h-full"><ArrowUpTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" /><span className="text-sm font-bold text-dark-text">Ekspor JSON</span></button>{props.lastExportDate && (<p className="text-[10px] text-center text-secondary-gray mt-1">Terakhir: {new Date(props.lastExportDate).toLocaleString('id-ID')}</p>)}</div><div className="flex flex-col"><button onClick={props.onImport} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl transition-all duration-200 group h-full"><ArrowDownTrayIcon className="w-6 h-6 text-primary-navy group-hover:scale-110 transition-transform mb-2" /><span className="text-sm font-bold text-dark-text">Impor JSON</span></button>{props.lastImportDate && (<p className="text-[10px] text-center text-secondary-gray mt-1">Terakhir: {new Date(props.lastImportDate).toLocaleString('id-ID')}</p>)}</div></div><button onClick={props.onManualBackup} className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors text-left group"><div className="bg-blue-200 p-2 rounded-lg text-blue-700"><ServerStackIcon className="w-5 h-5" /></div><div><p className="text-sm font-bold text-primary-navy">Cadangkan Sekarang</p><p className="text-xs text-blue-600">Simpan data ke memori browser</p></div></button><div className="grid grid-cols-2 gap-3"><button onClick={props.onManageBackups} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray"><ClockIcon className="w-4 h-4" />Riwayat Cadangan</button><button onClick={props.onManageArchived} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-secondary-gray"><ArchiveBoxIcon className="w-4 h-4" />Arsip Anggaran</button></div></div></section><hr className="border-gray-100" /><section><h4 className="text-xs font-bold text-secondary-gray uppercase tracking-wider mb-3 flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4" />Siklus Keuangan</h4><button onClick={props.onManualCloseBook} className="w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl transition-colors text-left group"><div className="bg-yellow-200 p-2 rounded-lg text-yellow-800"><LockClosedIcon className="w-5 h-5" /></div><div><p className="font-bold text-yellow-900">Tutup Buku Bulan Ini</p><p className="text-xs text-yellow-700">Arsipkan transaksi & reset anggaran</p></div></button></section><section><h4 className="text-xs font-bold text-danger-red uppercase tracking-wider mb-3 flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4" />Zona Bahaya</h4><div className="bg-red-50 border border-red-100 rounded-xl p-1"><button onClick={props.onResetMonthly} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-600 text-sm font-medium flex items-center gap-2 transition-colors"><TrashIcon className="w-4 h-4" />Reset Data Bulan Ini (Debug)</button><button onClick={props.onResetAll} className="w-full text-left p-3 rounded-lg hover:bg-red-100 text-red-800 text-sm font-bold flex items-center gap-2 transition-colors"><ExclamationTriangleIcon className="w-4 h-4" />Reset SEMUA Data (Pabrik)</button></div></section></div>
);

export const ArchivedBudgetsModalContent: React.FC<{ archivedBudgets: Budget[], onRestore: (id: number) => void, onDelete: (id: number) => void }> = ({ archivedBudgets, onRestore, onDelete }) => (
    <ul className="space-y-2">{archivedBudgets.length === 0 ? <p className="text-center text-gray-500">Tidak ada arsip.</p> : archivedBudgets.map(b => (<li key={b.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-semibold">{b.name}</span><div className="flex gap-2"><button onClick={() => onRestore(b.id)} className="text-sm text-blue-600">Pulihkan</button><button onClick={() => onDelete(b.id)} className="text-sm text-red-600">Hapus</button></div></li>))}</ul>
);

export const BackupRestoreModalContent: React.FC<{ backups: { key: string, timestamp: number }[], onRestore: (key: string) => void }> = ({ backups, onRestore }) => (
    <ul className="space-y-2">{backups.length === 0 ? <p className="text-center text-gray-500">Tidak ada cadangan internal.</p> : backups.map(b => (<li key={b.key} className="flex justify-between items-center p-2 border rounded"><span>{new Date(b.timestamp).toLocaleString()}</span><button onClick={() => onRestore(b.key)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Pulihkan</button></li>))}</ul>
);

export const VoiceAssistantModalContent: React.FC<{ budgets: Budget[], activePersona?: string, onFinish: (items: ScannedItem[]) => void, onClose: () => void }> = ({ budgets, activePersona, onFinish, onClose }) => {
    // ... (No change)
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("Siap terhubung...");
    const [collectedItems, setCollectedItems] = useState<ScannedItem[]>([]);
    
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (inputContextRef.current) {
            inputContextRef.current.close();
            inputContextRef.current = null;
        }
        if (outputContextRef.current) {
            outputContextRef.current.close();
            outputContextRef.current = null;
        }
        setIsConnected(false);
    };

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const handleFinish = () => {
        cleanup();
        onFinish(collectedItems);
    };

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
            cleanup(); // Ensure clean slate
            setStatus("Menghubungkan...");
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            inputContextRef.current = inputAudioContext;
            
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            outputContextRef.current = outputAudioContext;
            
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus("Terhubung! Silakan bicara.");
                        setIsConnected(true);
                        
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        sourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        processorRef.current = scriptProcessor;
                        
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
            {!isConnected ? (<button onClick={connect} className="px-6 py-2 bg-primary-navy text-white rounded-full font-bold">Mulai Bicara</button>) : (<div className="space-y-2"><p className="text-sm text-gray-600">Transaksi terdeteksi: {collectedItems.length}</p><button onClick={handleFinish} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold">Selesai</button></div>)}
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

export const RedeemModalContent: React.FC<{ onClose: () => void, onRedeem: (code: string) => void }> = ({ onClose, onRedeem }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (code.length < 8) { setError('Kode harus terdiri dari 8 karakter.'); return; } setError(''); onRedeem(code); };
    return (
        <div className="text-center py-4">
            <TicketIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-primary-navy mb-2">Tukar Kode Promo</h3>
            <p className="text-gray-500 text-sm mb-4">Masukkan kode unik untuk mendapatkan Mustika gratis!</p>
            <form onSubmit={handleSubmit} className="space-y-3"><input type="text" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }} placeholder="XXXXXXXX" maxLength={8} className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-accent-teal uppercase placeholder-gray-300" />{error && <p className="text-xs text-red-500">{error}</p>}<button type="submit" disabled={code.length !== 8} className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Klaim Hadiah</button></form>
            <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">Batal</button>
        </div>
    );
};

// --- DAILY BONUS CONTENT ---
export const DailyBonusModalContent: React.FC<{
    collectedSkins: string[];
    lastClaimDate: string | null;
    onClaim: (mustika: number, xp: number) => void;
}> = ({ collectedSkins, lastClaimDate, onClaim }) => {
    
    // 1. Calculate Rewards based on Skin Rarity and Type
    let totalMustika = 0;
    let totalXP = 0;

    const skinRewards = collectedSkins.map(skinId => {
        // Find Shop Item Data for Rarity
        const shopItem = SHOP_ITEMS.find(item => item.value === skinId && item.type === 'savings_skin');
        
        let rarity = shopItem?.rarity || 'common';
        let baseReward = 5; // Default

        if (rarity === 'rare') baseReward = 8;
        else if (rarity === 'legendary') baseReward = 13;
        else if (rarity === 'mythical') baseReward = 20;

        // Determine Type (Pet vs Plant)
        // Heuristic: Check asset ID or shop ID prefixes if standard naming used, or fallback
        // The prompt says: "pet menghasilkan mustika, dan tanaman menghasilkan xp"
        const isPet = skinId.includes('pet') || skinId === 'default' || ['swan', 'dragon', 'robot', 'turtle', 'jellyfish', 'fox'].includes(skinId);
        
        if (isPet) {
            totalMustika += baseReward;
            return { id: skinId, reward: baseReward, type: 'mustika', rarity };
        } else {
            totalXP += baseReward;
            return { id: skinId, reward: baseReward, type: 'xp', rarity };
        }
    });

    const canClaim = lastClaimDate !== new Date().toLocaleDateString('fr-CA');

    return (
        <div className="flex flex-col h-[500px]">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-primary-navy">Koleksi Hasil Panen</h3>
                <p className="text-secondary-gray text-xs">Skin dari celengan yang selesai memberikan passive income setiap hari!</p>
            </div>

            {collectedSkins.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                    <GiftIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Belum ada koleksi.</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Selesaikan celengan hingga 100% dan gunakan dananya untuk mendapatkan skin di sini.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 p-1">
                    {skinRewards.map((item, idx) => {
                        const assets = SKIN_ASSETS[item.id] || SKIN_ASSETS['default'];
                        const image = assets.stage4; // Show max stage
                        
                        let borderColor = 'border-gray-200';
                        let glow = '';
                        if (item.rarity === 'rare') borderColor = 'border-blue-300';
                        if (item.rarity === 'legendary') { borderColor = 'border-yellow-400'; glow = 'shadow-lg shadow-yellow-100'; }
                        if (item.rarity === 'mythical') { borderColor = 'border-purple-500'; glow = 'shadow-lg shadow-purple-200'; }

                        return (
                            <div key={idx} className={`relative bg-white rounded-xl border-2 ${borderColor} ${glow} p-2 flex flex-col items-center shadow-sm`}>
                                <div className="w-full aspect-square flex items-center justify-center mb-2 overflow-hidden rounded-lg bg-gray-50">
                                    <img src={image} alt={item.id} className="w-full h-full object-contain" />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${item.type === 'mustika' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                    {item.type === 'mustika' ? <SparklesIcon className="w-3 h-3" /> : <StarIconFilled className="w-3 h-3" />}
                                    +{item.reward}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-left">
                        <p className="text-xs text-secondary-gray font-bold uppercase">Total Harian</p>
                        <div className="flex gap-3 mt-1">
                            <span className="flex items-center gap-1 font-bold text-indigo-600"><SparklesIcon className="w-4 h-4"/> +{totalMustika}</span>
                            <span className="flex items-center gap-1 font-bold text-green-600"><StarIconFilled className="w-4 h-4"/> +{totalXP}</span>
                        </div>
                    </div>
                    {/* Status Badge */}
                    {!canClaim && collectedSkins.length > 0 && (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
                            Sudah Diklaim
                        </span>
                    )}
                </div>

                <button 
                    onClick={() => onClaim(totalMustika, totalXP)}
                    disabled={!canClaim || collectedSkins.length === 0}
                    className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                        ${canClaim && collectedSkins.length > 0
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-[1.02] hover:shadow-orange-200' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <GiftIcon className="w-6 h-6" />
                    {canClaim ? 'KLAIM BONUS' : 'KEMBALI BESOK'}
                </button>
            </div>
        </div>
    );
};
