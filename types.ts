
import React from 'react';

export interface Transaction {
  desc: string;
  amount: number;
  timestamp: number;
  sourceCategory?: string; // For daily expense overages
}

export interface Budget {
  id: number;
  name: string;
  totalBudget: number;
  history: Transaction[];
  icon?: string;
  color?: string;
  order: number;
  isArchived: boolean;
  isTemporary: boolean;
}

export interface FundTransaction {
  type: 'add' | 'remove';
  desc: string;
  amount: number;
  timestamp: number;
  note?: string;
}

export interface GlobalTransaction extends FundTransaction {
    category?: string;
    icon?: string;
    color?: string;
}

export interface Archive {
  month: string; // YYYY-MM
  transactions: GlobalTransaction[];
}

export interface SavingTransaction {
  amount: number;
  timestamp: number;
  note?: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount?: number;
  isInfinite: boolean;
  savedAmount: number;
  history: SavingTransaction[];
  createdAt: number;
  isCompleted: boolean;
  visualType?: 'plant' | 'pet'; // Determines if it grows a plant or evolves a pet
  skinId?: string; // NEW: Determines specific visual skin (e.g., 'swan', 'anthurium')
}

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    cooldownDays: number;
    createdAt: number;
    image?: string; // Optional base64 image
    status: 'waiting' | 'ready' | 'purchased' | 'cancelled';
}

export interface Subscription {
    id: number;
    name: string;
    price: number;
    cycle: 'monthly' | 'yearly';
    firstBillDate: string; // YYYY-MM-DD
    icon: string;
    isActive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: AppState) => boolean;
  streakKey?: 'dailyStreak' | 'monthlyStreak' | 'noSpendStreak' | 'appOpenStreak' | 'morningTransactionStreak' | 'savingStreak';
  category: string;
  points: number;
  streakTarget?: number;
  progress?: (state: AppState) => { current: number; target: number };
  isTimeLimited?: boolean;
  tierInfo?: { current: number; total: number }; // For tiered/stacked display
}

export interface Asset {
  id: number;
  name: string;
  quantity: number;
  pricePerUnit: number; // Harga beli (atau harga manual jika type='custom')
  type: 'custom' | 'gold' | 'crypto'; // NEW: Tipe aset
  symbol?: string; // NEW: Simbol ticker (misal: 'BTC', 'ANTAM')
}

export interface UserProfile {
    name: string;
    avatar?: string; // base64 image
    customTitle?: string; // Title bought from shop
    frameId?: string; // Frame bought from shop
    activePersona?: string; // NEW: AI Persona
    activeBanner?: string; // NEW: Profile Banner
}

// NEW: Interface untuk Barang Toko
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'theme' | 'title' | 'frame' | 'persona' | 'banner' | 'egg' | 'seed' | 'special' | 'savings_skin' | 'chart_skin';
    category?: string; // NEW: Sub-category for organization (e.g., 'standard', 'special', 'gradient' for themes, 'trend'/'budget' for charts)
    value: string; // CSS class, ID, or config value
    icon: string;
    rarity?: 'rare' | 'legendary' | 'mythical'; // NEW: Rarity tier for savings skins
}

// NEW: Interface untuk Tema Kustom
export interface CustomTheme {
    id: string;
    name: string;
    colors: {
        '--color-primary-navy': string;
        '--color-primary-navy-dark': string;
        '--color-accent-teal': string;
        '--color-accent-teal-dark': string;
        '--color-light-bg': string;
        '--color-dark-text': string;
        '--color-secondary-gray': string;
        '--app-background': string;
        // System Colors Overrides for Dark Mode compatibility
        '--color-white': string;
        '--color-gray-50': string;
        '--color-gray-100': string;
        '--color-gray-200': string;
    };
}

export interface ShoppingItem {
    id: number;
    name: string;
    estimate: number;
    isChecked: boolean;
}

export interface DebtRecord {
    amount: number;
    timestamp: number;
    note?: string;
}

export interface DebtItem {
    id: number;
    type: 'borrowed' | 'lent'; // borrowed = Saya Hutang, lent = Orang Hutang ke Saya (Piutang)
    person: string;
    amount: number; // Total awal
    paid: number; // Total sudah dibayar
    dueDate?: string; // YYYY-MM-DD
    description?: string;
    history: DebtRecord[];
    isPaidOff: boolean;
    createdAt: number;
}

export interface AppState {
  userProfile: UserProfile;
  budgets: Budget[];
  dailyExpenses: Transaction[];
  fundHistory: FundTransaction[];
  archives: Archive[];
  lastArchiveDate: string | null;
  savingsGoals: SavingsGoal[];
  wishlist: WishlistItem[]; 
  subscriptions: Subscription[]; 
  shoppingList: ShoppingItem[]; 
  debts: DebtItem[]; 
  unlockedAchievements: { [id: string]: number }; 
  achievementData?: {
    monthlyStreak?: number;
    dailyStreak?: number;
    noSpendStreak?: number;
    appOpenStreak?: number;
    morningTransactionStreak?: number;
    savingStreak?: number;
    lastStreakCheck?: string; 
  };
  assets: Asset[];
  spentPoints: number; // Total points spent in shop
  inventory: string[]; // List of purchased item IDs
  activeTheme: string; // Current active theme ID
  bonusPoints?: number; // Points added manually (e.g. for trials) - COUNTS FOR LEVEL AND SPEND
  customThemes: CustomTheme[]; 
  redeemedCodes: string[]; 
  redeemedMustika: number; // Mustika from codes/pets - COUNTS FOR SPEND ONLY
  
  // NEW: Daily Bonus System
  collectedSkins: string[]; // IDs of skins from completed savings (e.g. 'dragon', 'swan')
  lastDailyBonusClaim: string | null; // YYYY-MM-DD
  accumulatedXP: number; // XP from plants - COUNTS FOR LEVEL ONLY

  // NEW: Chart Themes
  activeTrendChartTheme?: string; 
  activeBudgetChartTheme?: string;

  // NEW: Level Reward System
  levelRewardsClaimed: number[]; // List of level numbers where reward has been claimed
}

export interface ScannedItem {
  desc: string;
  amount: number;
  budgetId: number | 'daily' | 'none';
}
export type Page = 'dashboard' | 'reports' | 'visualizations' | 'savings' | 'achievements' | 'missions' | 'personalBest' | 'netWorth' | 'wishlist' | 'subscriptions' | 'profile' | 'shop' | 'customApp' | 'shoppingList';
export type ModalType = 'input' | 'funds' | 'addBudget' | 'history' | 'info' | 'menu' | 'editAsset' | 'confirm' | 'scanResult' | 'aiAdvice' | 'smartInput' | 'aiChat' | 'voiceAssistant' | 'voiceResult' | 'addSavingsGoal' | 'addSavings' | 'withdrawSavings' | 'savingsDetail' | 'settings' | 'archivedBudgets' | 'backupRestore' | 'asset' | 'batchInput' | 'addWishlist' | 'redeem' | 'debt' | 'dailyBonus';
