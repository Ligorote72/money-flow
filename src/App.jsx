import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import BalanceCard from './components/BalanceCard';
import TransactionForm from './components/TransactionForm';
import GoalsSection from './components/GoalsSection';
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
import BusinessGate from './components/BusinessGate';
import VoiceQuickModal from './components/VoiceQuickModal';
import AssistantChat from './components/AssistantChat';
import { hasLocalPin } from './utils/crypto';
import { useFinanceData } from './hooks/useFinanceData';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';

// Code-splitting con lazy loading para optimización de bundle
const AnalysisBreakdown = lazy(() => import('./components/AnalysisBreakdown'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const BusinessDashboard = lazy(() => import('./components/BusinessDashboard'));
import { 
  Home, 
  PieChart, 
  Plus, 
  Coffee, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  ReceiptText,
  Search,
  X,
  Sparkles,
  Mic,
  Bot
} from 'lucide-react';

const ACCOUNTS = [
  { id: 'cash',    label: 'Efectivo',   icon: '💵', color: '#34C759' },
  { id: 'bank',    label: 'Banco',      icon: '🏛️', color: '#007AFF' },
  { id: 'savings', label: 'Ahorros',    icon: '🐷', color: '#FF2D55' },
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
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

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
    updateTransaction,
    deleteTransaction,
    addDebt, deleteDebt, updateDebt, toggleDebtPaid,
    addSubscription, deleteSubscription, updateSubscription,
    addPiggyBank, deletePiggyBank, updatePiggyBank,
    partialPaymentDebt,
    addBank,
    deleteBank,
  } = useFinanceData();

  // Dynamic greeting by hour
  const currentHour = now.getHours();
  const greetingText = currentHour < 12 
    ? 'Buenos días' 
    : currentHour < 18 
      ? 'Buenas tardes' 
      : 'Buenas noches';
  const greetingIcon = currentHour < 12 ? '☀️' : currentHour < 18 ? '🌤️' : '🌙';

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

  // Handle Android / PWA App Shortcuts (e.g. /?action=voice, /?action=expense, /?action=chat, /?tab=chat)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const tab = params.get('tab');
      if (action === 'chat' || tab === 'chat') {
        setShowLanding(false);
        setActiveTab('chat');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (action === 'voice') {
        setShowLanding(false);
        setIsVoiceModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (action === 'expense') {
        setShowLanding(false);
        startEditing({ type: 'expense' });
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (e) {
      console.error('Error handling shortcut action:', e);
    }
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

  const handleApplyVoiceTransaction = (parsed) => {
    if (!parsed) return;
    startEditing({
      amount: parsed.amount,
      type: parsed.type,
      description: parsed.description,
      category: parsed.category,
      accountId: parsed.accountId,
      toAccountId: parsed.toAccountId,
      date: new Date().toISOString()
    });
  };

  const handleDirectSaveVoice = async (parsed) => {
    if (!parsed) return;
    const defaultCat = parsed.type === 'income' ? 'other_income' : (parsed.type === 'transfer' ? 'transfer' : 'other_expense');
    if (parsed.isSplit && parsed.splitCash > 0 && parsed.splitBank > 0) {
      // Registrar porción en Efectivo
      await addTransaction({
        id: Date.now().toString(),
        description: `${parsed.description} (Efectivo)`,
        amount: parsed.splitCash,
        type: parsed.type || 'expense',
        category: parsed.category || defaultCat,
        accountId: 'cash',
        date: new Date().toISOString()
      });
      // Registrar porción en Banco
      await addTransaction({
        id: (Date.now() + 1).toString(),
        description: `${parsed.description} (Banco)`,
        amount: parsed.splitBank,
        type: parsed.type || 'expense',
        category: parsed.category || defaultCat,
        accountId: 'bank',
        date: new Date().toISOString()
      });
    } else {
      await addTransaction({
        id: Date.now().toString(),
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type || 'expense',
        category: parsed.category || defaultCat,
        accountId: parsed.accountId || 'cash',
        toAccountId: parsed.toAccountId,
        date: new Date().toISOString()
      });
    }
  };

  const addBankTransaction = async (txData) => {
    await addTransaction({
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: 'other_expense'
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '14px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(var(--primary-rgb), 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600' }}>Cargando MoneyFlow...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setShowLanding(false);
          setDeferredPrompt(null);
          localStorage.setItem('money-flow-skip-landing', 'true');
        }
      } catch (err) {
        console.error('Error triggering deferred prompt:', err);
      }
    } else {
      setShowLanding(false);
      localStorage.setItem('money-flow-skip-landing', 'true');
    }
  };

  if (showLanding) {
    return (
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(196, 251, 109, 0.2)', borderTopColor: '#c4fb6d', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600' }}>Cargando presentación...</p>
        </div>
      }>
        <LandingPage 
          onInstallClick={handleInstallClick} 
          installPromptReady={!!deferredPrompt} 
          onSkip={() => {
            setShowLanding(false);
            localStorage.setItem('money-flow-skip-landing', 'true');
          }} 
        />
      </Suspense>
    );
  }
  if (!session) return <Login />;
  if (isLocked) return <PinLockScreen onUnlock={() => setIsLocked(false)} onLogout={handleSignOut} />;

  return (
    <div className={`app-container ${hideBalance ? 'hide-balance' : ''}`}>
      {/* Top Header */}
      {activeTab !== 'chat' && (
        <header className="app-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1>{greetingIcon} {username ? `${greetingText}, ${username}` : 'MoneyFlow'}</h1>
              {session ? (
                <span title="Sincronizado con Supabase Cloud" style={{
                  fontSize: '0.68rem',
                  background: 'rgba(52,199,89,0.15)',
                  color: '#34c759',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(52,199,89,0.3)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34c759', display: 'inline-block', boxShadow: '0 0 6px #34c759' }}></span>
                  Cloud
                </span>
              ) : (
                <span title="Modo local" style={{
                  fontSize: '0.68rem',
                  background: 'rgba(255,149,0,0.15)',
                  color: '#ff9500',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  border: '1px solid rgba(255,149,0,0.3)'
                }}>
                  💾 Local
                </span>
              )}
            </div>
            <p>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setHideBalance(h => !h)} className="glass-btn" title="Ocultar Saldo">{hideBalance ? '👁️' : '🙈'}</button>
            <button onClick={() => exportToCSV(transactions)} className="glass-btn" title="Exportar CSV">⬇️</button>
            <button onClick={() => { setActiveTab('varios'); setVariosTab('settings'); }} className="glass-btn" title="Ajustes y PIN">⚙️</button>
          </div>
        </header>
      )}

      {activeTab === 'home' && (
        <>
          <BalanceCard 
            totalBalance={accountBalances.cash + accountBalances.bank + totalPiggySavings} 
            income={totalIncome} expenses={totalExpenses} 
            hideBalance={hideBalance} accountBalances={accountBalances} 
            accounts={ACCOUNTS} username={username} totalPiggySavings={totalPiggySavings} 
            banks={banks} onAddBank={addBank} onDeleteBank={deleteBank} 
            onAdjustSavings={adjustSavingsBalance} onAddBankTransaction={addBankTransaction}
          />

          {/* Quick Action Bar (Acciones Rápidas 1-Toque) */}
          <div className="quick-actions-bar animate-fade">
            <button 
              className="quick-action-btn"
              onClick={() => startEditing({ type: 'income' })}
              title="Registrar Ingreso"
            >
              <div className="quick-action-icon" style={{ background: 'rgba(52, 199, 89, 0.16)', color: '#34c759' }}>
                <ArrowDownLeft size={20} />
              </div>
              <span className="quick-action-label">+ Ingreso</span>
            </button>

            <button 
              className="quick-action-btn"
              onClick={() => startEditing({ type: 'expense' })}
              title="Registrar Gasto"
            >
              <div className="quick-action-icon" style={{ background: 'rgba(255, 59, 48, 0.16)', color: '#ff3b30' }}>
                <ArrowUpRight size={20} />
              </div>
              <span className="quick-action-label">- Gasto</span>
            </button>

            <button 
              className="quick-action-btn"
              onClick={() => startEditing({ type: 'transfer' })}
              title="Transferir entre cuentas"
            >
              <div className="quick-action-icon" style={{ background: 'rgba(0, 122, 255, 0.16)', color: '#007aff' }}>
                <ArrowLeftRight size={19} />
              </div>
              <span className="quick-action-label">Traspaso</span>
            </button>

            <button 
              className="quick-action-btn"
              onClick={() => setIsVoiceModalOpen(true)}
              title="Dictar o Registrar con Voz e IA"
            >
              <div className="quick-action-icon" style={{ 
                background: 'linear-gradient(135deg, rgba(196, 251, 109, 0.25), rgba(0, 122, 255, 0.25))', 
                color: '#c4fb6d', 
                border: '1px solid rgba(196, 251, 109, 0.4)',
                boxShadow: '0 0 12px rgba(196, 251, 109, 0.2)'
              }}>
                <Mic size={20} strokeWidth={2.4} />
              </div>
              <span className="quick-action-label" style={{ color: '#c4fb6d', fontWeight: '800' }}>Voz IA</span>
            </button>

            <button 
              className="quick-action-btn"
              onClick={() => setActiveTab('chat')}
              title="Chat Asistente Financiero IA"
            >
              <div className="quick-action-icon" style={{ 
                background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.22), rgba(0, 122, 255, 0.22))', 
                color: '#34c759', 
                border: '1px solid rgba(52, 199, 89, 0.35)',
                boxShadow: '0 0 12px rgba(52, 199, 89, 0.2)'
              }}>
                <Bot size={20} strokeWidth={2.4} />
              </div>
              <span className="quick-action-label" style={{ color: '#34c759', fontWeight: '800' }}>Chat IA</span>
            </button>

            <button 
              className="quick-action-btn"
              onClick={() => {
                setActiveTab('varios');
                setVariosTab('minegocio');
              }}
              title="Cosecha y Finca Cafetera"
            >
              <div className="quick-action-icon" style={{ background: 'rgba(196, 251, 109, 0.16)', color: '#c4fb6d' }}>
                <Coffee size={20} />
              </div>
              <span className="quick-action-label">Finca @</span>
            </button>
          </div>
        </>
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
                    <span>{p.daysLeft === 0 ? '¡Hoy!' : p.daysLeft === 1 ? 'Mañana' : `En ${p.daysLeft} d`}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de Búsqueda y Filtro de Rango */}
            <div className="search-bar">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Buscar movimientos (ej: mercado, café...)" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsGlobalSearch(!isGlobalSearch)} 
                className={`filter-btn ${isGlobalSearch ? 'active' : ''}`}
                title={isGlobalSearch ? "Buscando en todo el historial" : "Buscando en el mes actual"}
              >
                {isGlobalSearch ? '🌎 Todo' : '📅 Este Mes'}
              </button>
            </div>
            
            <TransactionList 
              transactions={filteredTxs} 
              onEdit={startEditing} 
              onDelete={deleteTransaction} 
              hideBalance={hideBalance} 
              banks={banks} 
              searchQuery={searchQuery}
              onQuickAdd={() => startEditing({ type: 'expense' })}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="animate-fade">
            <WeeklySummary transactions={transactions} />
            <Suspense fallback={<div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Cargando análisis y gráficos...</div>}>
              <AnalysisBreakdown 
                transactions={transactions} 
                filterMonth={filterMonth} 
                filterYear={filterYear} 
                dateFilterType={dateFilterType} 
                startDate={startDate} 
                endDate={endDate} 
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'varios' && (
          <div className="varios-section">
            {variosTab === 'menu' ? (
              <div className="animate-fade">
                <div style={{ padding: '0 16px 14px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900' }}>🎯 Planificación Financiera</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Control de deudas, metas, suscripciones y fincas
                  </p>
                </div>

                <div className="varios-grid">
                  {[
                    { id: 'chat_nav', label: 'Asistente Chat IA', desc: 'Chatea, dicta y consulta saldos', icon: '🤖', color: '#34C759' },
                    { id: 'debts', label: 'Deudas & Préstamos', desc: 'Lo que debes y te deben', icon: '🤝', color: '#34C759' },
                    { id: 'ahorro', label: 'Cochinitos de Ahorro', desc: 'Metas y alcancías', icon: '🐷', color: '#FF9500' },
                    { id: 'subs', label: 'Gastos Fijos', desc: 'Suscripciones y arriendos', icon: '💳', color: '#007AFF' },
                    { id: 'goals', label: 'Presupuestos', desc: 'Límites de gasto del mes', icon: '🎯', color: '#FF2D55' },
                    { id: 'minegocio', label: 'Mi Finca / Negocio', desc: 'Cosecha, báscula y jornales', icon: '☕', color: '#c4fb6d' },
                    { id: 'settings', label: 'Ajustes & Seguridad', desc: 'Temas, PIN y biometría', icon: '⚙️', color: '#8e8e93' },
                  ].map(op => (
                    <button 
                      key={op.id} 
                      onClick={() => op.id === 'chat_nav' ? setActiveTab('chat') : setVariosTab(op.id)} 
                      className="menu-item" 
                      style={{ '--item-color': op.color }}
                    >
                      <div className="icon">{op.icon}</div>
                      <div>
                        <span className="label" style={{ display: 'block' }}>{op.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>{op.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade">
                <div className="varios-header">
                  <button onClick={() => setVariosTab('menu')} className="back-btn">←</button>
                  <h2>
                    {variosTab === 'debts' ? 'Deudas & Préstamos' :
                     variosTab === 'ahorro' ? 'Cochinitos de Ahorro' :
                     variosTab === 'subs' ? 'Gastos Fijos' :
                     variosTab === 'goals' ? 'Presupuesto Mensual' :
                     variosTab === 'minegocio' ? 'Mi Negocio / Finca' : 'Ajustes y Configuración'}
                  </h2>
                </div>

                {variosTab === 'goals' && (
                  <GoalsSection 
                    income={totalIncome} 
                    expenses={totalExpenses} 
                    goals={goals} 
                    onSaveGoals={setGoals} 
                    transactions={filteredTxs} 
                  />
                )}

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
                    <Suspense fallback={<div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Cargando módulo de negocio...</div>}>
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
                    </Suspense>
                  ) : (
                    <BusinessGate onAccessGranted={() => setIsBusinessUnlocked(true)} />
                  )
                )}

                {variosTab === 'settings' && <SettingsTab onSignOut={handleSignOut} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <AssistantChat 
            transactions={transactions}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
            onEditTransaction={startEditing}
            accountBalances={accountBalances}
            banks={banks}
            onBack={() => setActiveTab('home')}
            onInstallClick={() => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
              }
            }}
            installPromptReady={!!deferredPrompt}
          />
        )}
      </main>

      {/* Modal Asistente de Voz / IA */}
      <VoiceQuickModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        onApplyTransaction={handleApplyVoiceTransaction} 
        onDirectSave={handleDirectSaveVoice}
        autoStart={true}
        accountBalances={accountBalances}
        banks={banks}
      />

      {/* Modal de Transacción (Nuevo / Editar) */}
      {(activeTab === 'add_modal' || editingTransaction) && (
        <div className="modal-overlay" onClick={cancelEditing}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-drag-handle" />
            <div className="modal-header">
              <h2>{editingTransaction?.id ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h2>
              <button onClick={cancelEditing} title="Cerrar">✕</button>
            </div>
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              editingData={editingTransaction} 
              onCancelEdit={cancelEditing} 
              accounts={ACCOUNTS} 
              banks={banks} 
              accountBalances={accountBalances}
            />
          </div>
        </div>
      )}

      {/* Modern Floating Island Bottom Nav */}
      <div className={`floating-dock-container ${activeTab === 'add_modal' || editingTransaction || activeTab === 'chat' ? 'dock-hidden' : ''}`}>
        <nav className="floating-dock">
          {/* Tab 1: Inicio */}
          <button 
            onClick={() => setActiveTab('home')} 
            className={`dock-item ${activeTab === 'home' ? 'active' : ''}`}
            title="Inicio"
          >
            <Home size={22} className="dock-icon" />
            <span className="dock-label">Inicio</span>
          </button>

          {/* Tab 2: Reportes */}
          <button 
            onClick={() => setActiveTab('analysis')} 
            className={`dock-item ${activeTab === 'analysis' ? 'active' : ''}`}
            title="Reportes"
          >
            <PieChart size={22} className="dock-icon" />
            <span className="dock-label">Reportes</span>
          </button>

          {/* Center Elevated Action Button: (+) */}
          <button 
            onClick={() => startEditing({ type: 'expense' })} 
            className="dock-center-fab"
            title="Nuevo Movimiento"
          >
            <Plus size={28} strokeWidth={3} />
          </button>

          {/* Tab 3: Chat IA */}
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`dock-item ${activeTab === 'chat' ? 'active' : ''}`}
            title="Chat Asistente IA"
          >
            <Bot size={22} className="dock-icon" />
            <span className="dock-label">Chat IA</span>
          </button>

          {/* Tab 4: Menú / Más */}
          <button 
            onClick={() => {
              setActiveTab('varios');
              setVariosTab('menu');
            }} 
            className={`dock-item ${activeTab === 'varios' ? 'active' : ''}`}
            title="Menú y Ajustes"
          >
            <SlidersHorizontal size={22} className="dock-icon" />
            <span className="dock-label">Más</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
