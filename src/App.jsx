import React, { useState, useEffect, useMemo } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import BalanceCard from './components/BalanceCard';
import TransactionForm from './components/TransactionForm';
import GoalsSection from './components/GoalsSection';
import AnalysisBreakdown from './components/AnalysisBreakdown';
import DebtsTab from './components/DebtsTab';
import SettingsTab from './components/SettingsTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import PiggyBankTab from './components/PiggyBankTab';
import WeeklySummary from './components/WeeklySummary';
import TransactionList from './components/TransactionList';
import { exportToCSV, formatCurrency } from './utils/helpers';
import { supabase } from './utils/supabaseClient';
import Login from './components/Login';
import PinLockScreen from './components/PinLockScreen';
import LandingPage from './components/LandingPage';
import BusinessGate from './components/BusinessGate';
import BusinessDashboard from './components/BusinessDashboard';
import { hasLocalPin } from './utils/crypto';
import { useFinanceData } from './hooks/useFinanceData';

const ACCOUNTS = [
  { id: 'cash',    label: 'Efectivo',   icon: '💵', color: '#34C759' },
  { id: 'bank',    label: 'Banco',      icon: '🏛️', color: '#007AFF' },
  { id: 'savings', label: 'Ahorros',    icon: '🐷', color: '#FF2D55' },
];

const NAV_TABS = [
  { id: 'home',     label: 'Resumen',    icon: '🏠' },
  { id: 'analysis', label: 'Reportes',   icon: '📊' },
  { id: 'varios',   label: 'Más',        icon: '🍱' },
];

function AppContent() {
  const { username, hideBalance, setHideBalance } = useSettings();
  const now = new Date();

  // Navigation State
  const [activeTab, setActiveTab]     = useState('home');
  const [variosTab, setVariosTab]     = useState('menu');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [isBusinessUnlocked, setIsBusinessUnlocked] = useState(false);
  const [isLocked, setIsLocked] = useState(hasLocalPin());

  // Date Filter State
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear]   = useState(now.getFullYear());
  const [dateFilterType, setDateFilterType] = useState('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Financial Data Hook
  const {
    transactions,
    goals, setGoals,
    debts,
    subscriptions,
    piggyBanks, setPiggyBanks,
    banks,
    businesses, setBusinesses, addBusiness, deleteBusiness, updateBusiness,
    businessTransactions, setBusinessTransactions,
    businessWorkers, setBusinessWorkers,
    session,
    loading,
    alerts,
    addTransaction,
    deleteTransaction,
    addDebt, deleteDebt, updateDebt, toggleDebtPaid,
    addSubscription, deleteSubscription, updateSubscription,
    addPiggyBank, deletePiggyBank, updatePiggyBank,
    addBank,
    deleteBank,
  } = useFinanceData();

  // PWA & Landing Page logic
  const [showLanding, setShowLanding] = useState(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return false;
    return !localStorage.getItem('money-flow-skip-landing');
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handlePrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    const handleInstalled = () => { setShowLanding(false); localStorage.setItem('money-flow-skip-landing', 'true'); };
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const startEditing = (tx) => { setEditingTransaction(tx); setActiveTab('add_modal'); };
  const cancelEditing = () => { setEditingTransaction(null); if (activeTab === 'add_modal') setActiveTab('home'); };

  const handleAddTransaction = async (tx) => {
    await addTransaction(tx);
    setEditingTransaction(null);
    setActiveTab('home');
  };

  const addBankTransaction = async (txData) => {
    await addTransaction({
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: 'Otros'
    });
  };

  const fundPiggy = (id, amount) => {
    setPiggyBanks(prev => prev.map(p => p.id === id ? { ...p, saved: p.saved + amount } : p));
    addTransaction({
      id: Date.now() + 3,
      description: `Ahorro: ${piggyBanks.find(p => p.id === id)?.name || 'Cochinito'}`,
      amount,
      type: 'expense',
      category: 'savings',
      accountId: 'cash',
      date: new Date().toISOString()
    });
  };

  const adjustSavingsBalance = async (newAmount) => {
    const savingsTxs = transactions.filter(t => t.category === 'savings');
    const currentSavings = savingsTxs.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);
    const diff = newAmount - currentSavings;
    if (Math.abs(diff) < 0.01) return;

    await addTransaction({
      id: Date.now(),
      description: 'Ajuste Manual de Ahorros',
      amount: Math.abs(diff),
      type: diff > 0 ? 'income' : 'expense',
      category: 'savings',
      accountId: 'cash',
      date: new Date().toISOString()
    });
  };

  const togglePaid = (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    if (!debt.paid) {
      addTransaction({
        id: Date.now() + 1,
        description: `Pago total: ${debt.person}`,
        amount: debt.amount,
        type: 'expense',
        category: debt.type === 'owe' ? 'other_expense' : 'savings',
        date: new Date().toISOString()
      });
    }
  };

  // Filtered Transactions
  const filteredTxs = useMemo(() => {
    let txs = transactions.filter(tx => {
      if (isGlobalSearch && searchQuery.trim()) return true;
      const txDate = new Date(tx.date);
      if (dateFilterType === 'month') {
        return txDate.getMonth() === filterMonth && txDate.getFullYear() === filterYear;
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      txs = txs.filter(tx => tx.description.toLowerCase().includes(q));
    }

    return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterMonth, filterYear, dateFilterType, startDate, endDate, searchQuery, isGlobalSearch]);

  const accountBalances = useMemo(() => {
    const balances = { bankDetails: {}, cash: 0, bank: 0, savings: 0 };
    const savingsTxs = transactions.filter(t => t.category === 'savings');
    balances.savings = savingsTxs.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);

    banks.forEach(b => {
      const bTxs = transactions.filter(t => (t.accountId === b.id || (b.id === 'general' && t.accountId === 'bank')) && t.category !== 'savings');
      const inc = bTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const exp = bTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      const transOut = transactions.filter(t => t.type === 'transfer' && t.accountId === b.id).reduce((a, t) => a + t.amount, 0);
      const transIn  = transactions.filter(t => t.type === 'transfer' && t.toAccountId === b.id).reduce((a, t) => a + t.amount, 0);
      balances.bankDetails[b.id] = (inc - exp) + (transIn - transOut);
    });
    balances.bank = Object.values(balances.bankDetails).reduce((a, b) => a + b, 0);

    ACCOUNTS.forEach(acc => {
      if (acc.id !== 'savings' && acc.id !== 'bank') {
        const accTxs = transactions.filter(t => (t.accountId === acc.id || (!t.accountId && acc.id === 'cash')) && t.category !== 'savings');
        const inc = accTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const exp = accTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
        const transOut = transactions.filter(t => t.type === 'transfer' && (t.accountId === acc.id || (!t.accountId && acc.id === 'cash'))).reduce((a, t) => a + t.amount, 0);
        const transIn  = transactions.filter(t => t.type === 'transfer' && t.toAccountId === acc.id).reduce((a, t) => a + t.amount, 0);
        balances[acc.id] = (inc - exp) + (transIn - transOut);
      }
    });
    return balances;
  }, [transactions, banks]);

  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = filteredTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const totalPiggySavings = piggyBanks.reduce((a, p) => a + (p.saved || 0), 0);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const reminders = [];
    subscriptions.forEach(sub => {
      let dueDate = new Date(today.getFullYear(), today.getMonth(), sub.day);
      if (dueDate < today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, sub.day);
      const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 7) reminders.push({ id: `sub_${sub.id}`, title: sub.name, amount: sub.amount, type: 'sub', daysLeft: diff });
    });
    return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  if (loading) return <div className="loader">Cargando...</div>;
  if (showLanding) return <LandingPage onInstallClick={() => {}} installPromptReady={!!deferredPrompt} onSkip={() => setShowLanding(false)} />;
  if (!session) return <Login />;
  if (isLocked) return <PinLockScreen onUnlock={() => setIsLocked(false)} onLogout={handleSignOut} />;

  return (
    <div className={`app-container ${hideBalance ? 'hide-balance' : ''}`}>
      <header className="app-header">
        <div>
          <h1>{username ? `Hola, ${username}` : 'MoneyFlow'}</h1>
          <p>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setHideBalance(h => !h)} className="glass-btn">{hideBalance ? '👁️' : '🙈'}</button>
          <button onClick={() => exportToCSV(transactions)} className="glass-btn">⬇️</button>
        </div>
      </header>

      {activeTab === 'home' && (
        <BalanceCard 
          totalBalance={accountBalances.cash + accountBalances.bank + totalPiggySavings} 
          income={totalIncome} expenses={totalExpenses} 
          hideBalance={hideBalance} accountBalances={accountBalances} 
          accounts={ACCOUNTS} username={username} totalPiggySavings={totalPiggySavings} 
          banks={banks} onAddBank={addBank} onDeleteBank={deleteBank} 
          onAdjustSavings={adjustSavingsBalance} onAddBankTransaction={addBankTransaction}
        />
      )}

      <main className="app-main">
        {activeTab === 'home' && (
          <div className="animate-fade">
            {upcomingPayments.length > 0 && !searchQuery && (
              <div className="upcoming-payments">
                {upcomingPayments.map(p => (
                  <div key={p.id} className="payment-card">
                    <p>{p.title}</p>
                    <strong>{formatCurrency(p.amount)}</strong>
                    <span>{p.daysLeft === 0 ? 'Hoy' : p.daysLeft === 1 ? 'Mañana' : `En ${p.daysLeft} d`}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="search-bar">
              <input type="text" placeholder="Buscar movimientos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button onClick={() => setIsGlobalSearch(!isGlobalSearch)} className={isGlobalSearch ? 'active' : ''}>
                {isGlobalSearch ? '🌎 Global' : '📅 Mes'}
              </button>
            </div>
            
            <WeeklySummary transactions={transactions} />
            <TransactionList 
              transactions={filteredTxs} 
              onEdit={startEditing} 
              onDelete={deleteTransaction} 
              hideBalance={hideBalance} 
              banks={banks} 
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <AnalysisBreakdown transactions={transactions} filterMonth={filterMonth} filterYear={filterYear} dateFilterType={dateFilterType} startDate={startDate} endDate={endDate} />
        )}

        {activeTab === 'varios' && (
          <div className="varios-section">
            {variosTab === 'menu' ? (
              <div className="varios-grid">
                {[
                  { id: 'goals', label: 'Presupuesto', icon: '🎯', color: '#FF2D55' },
                  { id: 'subs', label: 'Gastos Fijos', icon: '💳', color: '#007AFF' },
                  { id: 'ahorro', label: 'Cochinitos', icon: '🐷', color: '#FF9500' },
                  { id: 'debts', label: 'Deudas', icon: '🤝', color: '#34C759' },
                  { id: 'minegocio', label: 'Mi Negocio', icon: '💼', color: 'var(--primary)' },
                  { id: 'settings', label: 'Ajustes', icon: '⚙️', color: '#8e8e93' }
                ].map(op => (
                  <button key={op.id} onClick={() => setVariosTab(op.id)} className="menu-item" style={{ '--item-color': op.color }}>
                    <div className="icon">{op.icon}</div>
                    <span className="label">{op.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="animate-fade">
                <div className="varios-header">
                  <button onClick={() => setVariosTab('menu')} className="back-btn">←</button>
                  <h2>{variosTab.charAt(0).toUpperCase() + variosTab.slice(1)}</h2>
                </div>
                {variosTab === 'goals' && <GoalsSection income={totalIncome} expenses={totalExpenses} goals={goals} onSaveGoals={setGoals} transactions={filteredTxs} />}
                {variosTab === 'subs' && (
                  <SubscriptionsTab 
                    subscriptions={subscriptions} 
                    onAddSubscription={addSubscription} 
                    onDeleteSubscription={deleteSubscription} 
                    onUpdateSubscription={updateSubscription}
                    accounts={ACCOUNTS} 
                  />
                )}
                {variosTab === 'ahorro' && (
                  <PiggyBankTab 
                    piggyBanks={piggyBanks} 
                    availableBalance={accountBalances.cash} 
                    onAddFunds={fundPiggy} 
                    onAddPiggy={addPiggyBank} 
                    onDeletePiggy={deletePiggyBank} 
                    onUpdatePiggy={updatePiggyBank} 
                  />
                )}
                {variosTab === 'debts' && (
                  <DebtsTab 
                    debts={debts} 
                    addDebt={addDebt} 
                    deleteDebt={deleteDebt} 
                    updateDebt={updateDebt}
                    onTogglePaid={toggleDebtPaid} 
                    onPartialPayment={partialPaymentDebt}
                  />
                )}
                {variosTab === 'minegocio' && (
                  isBusinessUnlocked ? (
                    <BusinessDashboard 
                      businesses={businesses} 
                      addBusiness={addBusiness}
                      deleteBusiness={deleteBusiness}
                      updateBusiness={updateBusiness}
                      setBusinesses={setBusinesses} 
                      transactions={businessTransactions} 
                      setTransactions={setBusinessTransactions} 
                      workers={businessWorkers} 
                      setWorkers={setBusinessWorkers} 
                    />
                  ) : (
                    <BusinessGate onAccessGranted={() => setIsBusinessUnlocked(true)} />
                  )
                )}
                {variosTab === 'settings' && <SettingsTab onSignOut={handleSignOut} />}
              </div>
            )}
          </div>
        )}
      </main>

      {activeTab === 'home' && <button className="fab" onClick={() => setActiveTab('add_modal')}>+</button>}

      {(activeTab === 'add_modal' || editingTransaction) && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingTransaction ? 'Editar' : 'Nuevo'} Movimiento</h2>
              <button onClick={cancelEditing}>×</button>
            </div>
            <TransactionForm onAddTransaction={handleAddTransaction} editingData={editingTransaction} onCancelEdit={cancelEditing} accounts={ACCOUNTS} banks={banks} />
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'active' : ''}>
            <span className="icon">{tab.icon}</span>
            <span className="label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
