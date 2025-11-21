
import type { AppState, FundTransaction, Transaction, SavingTransaction, GlobalTransaction } from '../types';
import type { Achievement } from '../types';

export const allAchievements: Achievement[] = [
    // --- Kategori: Dasar ---
    {
        id: 'first-transaction',
        name: 'Langkah Pertama',
        description: 'Mencatat transaksi pertama Anda.',
        icon: 'ShoppingCartIcon',
        category: 'Dasar',
        points: 10,
        condition: (state: AppState) => {
            const allTransactionsCount =
                state.fundHistory.length +
                state.dailyExpenses.length +
                state.budgets.reduce((sum, b) => sum + b.history.length, 0);
            return allTransactionsCount > 0;
        },
        progress: (state) => ({
            current: state.fundHistory.length + state.dailyExpenses.length + state.budgets.reduce((sum, b) => sum + b.history.length, 0),
            target: 1
        })
    },
    {
        id: 'first-budget',
        name: 'Perencana Andal',
        description: 'Membuat pos anggaran pertama.',
        icon: 'ListBulletIcon',
        category: 'Dasar',
        points: 10,
        condition: (state: AppState) => state.budgets.length > 0,
        progress: (state) => ({ current: state.budgets.length, target: 1 })
    },
    {
        id: 'first-saving-goal',
        name: 'Mimpi Besar',
        description: 'Membuat celengan (tujuan menabung) pertama.',
        icon: 'BuildingLibraryIcon',
        category: 'Dasar',
        points: 15,
        condition: (state: AppState) => state.savingsGoals.length > 0,
        progress: (state) => ({ current: state.savingsGoals.length, target: 1 })
    },
    {
        id: 'super-saver',
        name: 'Penabung Sejati',
        description: 'Berhasil mencapai target di salah satu celengan.',
        icon: 'TrophyIcon',
        category: 'Dasar',
        points: 50,
        condition: (state: AppState) => state.savingsGoals.some(g => g.isCompleted)
    },
    {
        id: 'over-budget',
        name: 'Belajar dari Kesalahan',
        description: 'Pengeluaran melebihi kuota di salah satu pos anggaran.',
        icon: 'LightbulbIcon',
        category: 'Dasar',
        points: 5,
        condition: (state: AppState) => {
            return state.budgets.some(b => {
                const used = b.history.reduce((sum, h) => sum + h.amount, 0);
                return b.totalBudget > 0 && used > b.totalBudget;
            });
        }
    },

    // --- Kategori: Kebiasaan Baik ---
    {
        id: 'daily-streak-7',
        name: 'Disiplin Harian',
        description: 'Dana harian tidak minus selama 7 hari berturut-turut.',
        icon: 'CalendarDaysIcon',
        category: 'Kebiasaan Baik',
        points: 25,
        condition: (state: AppState) => (state.achievementData?.dailyStreak ?? 0) >= 7,
        streakKey: 'dailyStreak',
        streakTarget: 7
    },
    {
        id: 'daily-streak-30',
        name: 'Master Harian',
        description: 'Dana harian tidak minus selama 30 hari berturut-turut.',
        icon: 'CalendarDaysIcon',
        category: 'Kebiasaan Baik',
        points: 75,
        condition: (state: AppState) => (state.achievementData?.dailyStreak ?? 0) >= 30,
        streakKey: 'dailyStreak',
        streakTarget: 30
    },
    {
        id: 'monthly-streak-14',
        name: 'Momentum Keuangan',
        description: 'Dana bulanan tidak minus selama 14 hari berturut-turut.',
        icon: 'ChartBarIcon',
        category: 'Kebiasaan Baik',
        points: 30,
        condition: (state: AppState) => (state.achievementData?.monthlyStreak ?? 0) >= 14,
        streakKey: 'monthlyStreak',
        streakTarget: 14
    },
    {
        id: 'monthly-streak-30',
        name: 'Pakar Anggaran',
        description: 'Dana bulanan tidak minus selama 30 hari berturut-turut.',
        icon: 'ChartBarIcon',
        category: 'Kebiasaan Baik',
        points: 80,
        condition: (state: AppState) => (state.achievementData?.monthlyStreak ?? 0) >= 30,
        streakKey: 'monthlyStreak',
        streakTarget: 30
    },
    {
        id: 'monthly-streak-90',
        name: 'Raja Keuangan',
        description: 'Dana bulanan tidak minus selama 90 hari berturut-turut.',
        icon: 'TrophyIcon',
        category: 'Kebiasaan Baik',
        points: 150,
        condition: (state: AppState) => (state.achievementData?.monthlyStreak ?? 0) >= 90,
        streakKey: 'monthlyStreak',
        streakTarget: 90
    },
    {
        id: 'no-spend-day',
        name: 'Hari Tanpa Belanja',
        description: 'Berhasil melewati satu hari tanpa transaksi pengeluaran.',
        icon: 'CalendarDaysIcon',
        category: 'Kebiasaan Baik',
        points: 15,
        condition: (state: AppState) => (state.achievementData?.noSpendStreak ?? 0) >= 1,
        streakKey: 'noSpendStreak',
        streakTarget: 1
    },
    {
        id: 'habit-app-open-7',
        name: 'Rutinitas Emas',
        description: 'Membuka aplikasi 7 hari berturut-turut.',
        icon: 'CalendarDaysIcon',
        category: 'Kebiasaan Baik',
        points: 20,
        condition: (state: AppState) => (state.achievementData?.appOpenStreak ?? 0) >= 7,
        streakKey: 'appOpenStreak',
        streakTarget: 7
    },
    {
        id: 'habit-app-open-30',
        name: 'Pengguna Berdedikasi',
        description: 'Membuka aplikasi 30 hari berturut-turut.',
        icon: 'CalendarDaysIcon',
        category: 'Kebiasaan Baik',
        points: 60,
        condition: (state: AppState) => (state.achievementData?.appOpenStreak ?? 0) >= 30,
        streakKey: 'appOpenStreak',
        streakTarget: 30
    },
    {
        id: 'habit-morning-person-5',
        name: 'Burung Pagi',
        description: 'Mencatat pengeluaran sebelum jam 12 siang selama 5 hari berturut-turut.',
        icon: 'SunIcon',
        category: 'Kebiasaan Baik',
        points: 25,
        condition: (state: AppState) => (state.achievementData?.morningTransactionStreak ?? 0) >= 5,
        streakKey: 'morningTransactionStreak',
        streakTarget: 5
    },
     {
        id: 'milestone-saving-marathon',
        name: 'Sprinter Tabungan',
        description: 'Menambah tabungan di celengan setiap hari selama satu minggu penuh.',
        icon: 'ArrowPathIcon',
        category: 'Kebiasaan Baik',
        points: 40,
        condition: (state: AppState) => (state.achievementData?.savingStreak ?? 0) >= 7,
        streakKey: 'savingStreak',
        streakTarget: 7
    },

    // --- Kategori: Master Anggaran ---
    {
        id: 'budget-master',
        name: 'Kolektor Pos',
        description: 'Memiliki 5 atau lebih pos anggaran.',
        icon: 'Squares2x2Icon',
        category: 'Master Anggaran',
        points: 20,
        condition: (state: AppState) => state.budgets.length >= 5,
        progress: (state) => ({ current: state.budgets.length, target: 5 })
    },
     {
        id: 'budget-portfolio-manager',
        name: 'Manajer Portofolio',
        description: 'Memiliki 10 atau lebih pos anggaran aktif.',
        icon: 'Squares2x2Icon',
        category: 'Master Anggaran',
        points: 40,
        condition: (state: AppState) => state.budgets.length >= 10,
        progress: (state) => ({ current: state.budgets.length, target: 10 })
    },
    {
        id: 'budget-all-surplus',
        name: 'Surplus di Mana-mana',
        description: 'Menyelesaikan bulan dengan sisa dana positif di semua pos anggaran.',
        icon: 'BanknotesIcon',
        category: 'Master Anggaran',
        points: 50,
        condition: (state: AppState) => {
            if (state.budgets.length === 0) return false;
            return state.budgets.every(b => {
                const used = b.history.reduce((sum, h) => sum + h.amount, 0);
                return (b.totalBudget - used) >= 0;
            });
        }
    },
    {
        id: 'budget-architect',
        name: 'Arsitek Keuangan',
        description: 'Mengalokasikan 100% pemasukan ke pos anggaran.',
        icon: 'BuildingLibraryIcon',
        category: 'Master Anggaran',
        points: 30,
        condition: (state: AppState) => {
            const monthlyIncome = state.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
            if (monthlyIncome === 0) return false;
            const totalAllocated = state.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
            return totalAllocated >= monthlyIncome;
        },
        progress: (state) => {
            const monthlyIncome = state.fundHistory.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
            const totalAllocated = state.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
            return { current: totalAllocated, target: monthlyIncome };
        }
    },
    {
        id: 'budget-emergency-fund',
        name: 'Benteng Pertahanan',
        description: 'Membuat pos "Dana Darurat" dengan kuota minimal Rp 1.000.000.',
        icon: 'ShieldCheckIcon',
        category: 'Master Anggaran',
        points: 60,
        condition: (state: AppState) => state.budgets.some(b => b.name.toLowerCase().includes('dana darurat') && b.totalBudget >= 1000000)
    },
     {
        id: 'finance-early-retirement',
        name: 'Visioner Masa Depan',
        description: 'Membuat pos anggaran dengan nama "Pensiun" atau "Dana Hari Tua".',
        icon: 'RocketLaunchIcon',
        category: 'Master Anggaran',
        points: 25,
        condition: (state: AppState) => state.budgets.some(b => b.name.toLowerCase().includes('pensiun') || b.name.toLowerCase().includes('hari tua'))
    },
    {
        id: 'finance-no-leaks',
        name: 'Keran Tertutup Rapat',
        description: 'Pengeluaran umum/harian kurang dari 5% total pengeluaran bulanan.',
        icon: 'LockClosedIcon',
        category: 'Master Anggaran',
        points: 40,
        condition: (state: AppState) => {
            const totalUsedFromPosts = state.budgets.reduce((sum, b) => sum + b.history.reduce((s, h) => s + h.amount, 0), 0);
            const totalDailySpent = state.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
            const monthlyGeneralExpense = state.fundHistory.filter(t => t.type === 'remove').reduce((sum, t) => sum + t.amount, 0);
            const totalUsedOverall = monthlyGeneralExpense + totalUsedFromPosts + totalDailySpent;
            if (totalUsedOverall === 0) return false;
            const generalAndDaily = totalDailySpent + monthlyGeneralExpense;
            return (generalAndDaily / totalUsedOverall) < 0.05;
        }
    },
];
