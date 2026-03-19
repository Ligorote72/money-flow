import React, { useState, useEffect, useMemo } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import BalanceCard from './components/BalanceCard';
import TransactionForm from './components/TransactionForm';
import GoalsSection from './components/GoalsSection';
import AnalysisBreakdown from './components/AnalysisBreakdown';
import AlertBanner from './components/AlertBanner';
import DebtsTab from './components/DebtsTab';
import SettingsTab from './components/SettingsTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import PiggyBankTab from './components/PiggyBankTab';
import WeeklySummary from './components/WeeklySummary';
import { generateAlerts, exportToCSV, formatCurrency } from './utils/helpers';
import { getCategoryById } from './data/categories';
import { supabase } from './utils/supabaseClient';
import { fetchAllFromSupabase, migrateToSupabase, syncTransaction, deleteFromSupabase } from './utils/supabaseSync';
import Login from './components/Login';
import PinLockScreen from './components/PinLockScreen';
import LandingPage from './components/LandingPage';
import BusinessGate from './components/BusinessGate';
import BusinessDashboard from './components/BusinessDashboard';
import { hasLocalPin } from './utils/crypto';

const ACCOUNTS = [
  { id: 'cash',    label: 'Efectivo',   icon: '💵', color: '#34C759' },
  { id: 'bank',    label: 'Banco',      icon: '🏛️', color: '#007AFF' },
  { id: 'savings', label: 'Ahorros',    icon: '🐷', color: '#FF2D55' },
];

const NAV_TABS = [
  { id: 'home',     label: 'Inicio',    icon: '🏠' },
  { id: 'add',      label: 'Añadir',    icon: '＋' },
  { id: 'analysis', label: 'Análisis',  icon: '📊' },
  { id: 'varios',   label: 'Varios',    icon: '📦' },
  { id: 'settings', label: 'Ajustes',   icon: '⚙️' },
];

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function AppContent() {
  const { username, hideBalance, setHideBalance } = useSettings();
  const now = new Date();

  const [activeTab, setActiveTab]     = useState('home');
  const [variosTab, setVariosTab]     = useState('menu'); // menu, goals, subs, ahorro, debts, minegocio
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear]   = useState(now.getFullYear());
  const [alerts, setAlerts]           = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [isVariosMenuOpen, setIsVariosMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(hasLocalPin());
  const [isBusinessUnlocked, setIsBusinessUnlocked] = useState(false);
  
  // PWA & Landing Page state
  const [showLanding, setShowLanding] = useState(() => {
    // Si corre como standalone (PWA instalada), no mostrar landing.
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      return false;
    }
    // O si ya decidió saltarla
    const skipped = localStorage.getItem('money-flow-skip-landing');
    return !skipped;
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si detectamos que se instaló
    const handleAppInstalled = () => {
      setShowLanding(false);
      setDeferredPrompt(null);
      localStorage.setItem('money-flow-skip-landing', 'true');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Manejo para iOS: no tienen beforeinstallprompt, se les muestra instruccion en pantalla
    if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) && !deferredPrompt) {
        alert('Para instalar en iOS: Pulsa el botón "Compartir" en Safari y luego "Agregar a inicio".');
        return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar A2HS');
      }
      setDeferredPrompt(null);
    }
  };

  const skipLanding = () => {
    localStorage.setItem('money-flow-skip-landing', 'true');
    setShowLanding(false);
  };

  // Filtros de fecha granulares
  const [dateFilterType, setDateFilterType] = useState('month'); // 'month' o 'range'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [transactions, setTransactions] = useState(() => {
    const s = localStorage.getItem('money-flow-txs');
    return s ? JSON.parse(s) : [];
  });

  const [goals, setGoals] = useState(() => {
    const s = localStorage.getItem('money-flow-goals');
    return s ? JSON.parse(s) : { income: 0, expense: 0, categoryBudgets: {} };
  });

  const [debts, setDebts] = useState(() => {
    const s = localStorage.getItem('money-flow-debts');
    return s ? JSON.parse(s) : [];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const s = localStorage.getItem('money-flow-subs');
    return s ? JSON.parse(s) : [];
  });

  const [piggyBanks, setPiggyBanks] = useState(() => {
    const s = localStorage.getItem('money-flow-piggy');
    return s ? JSON.parse(s) : [];
  });

  const [banks, setBanks] = useState(() => {
    const s = localStorage.getItem('money-flow-banks');
    const defaultBanks = [{ id: 'general', name: 'Banco Principal' }];
    return s ? JSON.parse(s) : defaultBanks;
  });

  const [businesses, setBusinesses] = useState(() => {
    const s = localStorage.getItem('money-flow-businesses');
    return s ? JSON.parse(s) : [];
  });

  const [businessTransactions, setBusinessTransactions] = useState(() => {
    const s = localStorage.getItem('money-flow-business-txs');
    return s ? JSON.parse(s) : [];
  });

  const [businessWorkers, setBusinessWorkers] = useState(() => {
    const s = localStorage.getItem('money-flow-business-workers');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => { localStorage.setItem('money-flow-txs',   JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('money-flow-goals', JSON.stringify(goals));        }, [goals]);
  useEffect(() => { localStorage.setItem('money-flow-debts', JSON.stringify(debts));        }, [debts]);
  useEffect(() => { localStorage.setItem('money-flow-subs',  JSON.stringify(subscriptions));}, [subscriptions]);
  useEffect(() => { localStorage.setItem('money-flow-piggy', JSON.stringify(piggyBanks));    }, [piggyBanks]);
  useEffect(() => { localStorage.setItem('money-flow-banks', JSON.stringify(banks));        }, [banks]);
  useEffect(() => { localStorage.setItem('money-flow-businesses', JSON.stringify(businesses)); }, [businesses]);
  useEffect(() => { localStorage.setItem('money-flow-business-txs', JSON.stringify(businessTransactions)); }, [businessTransactions]);
  useEffect(() => { localStorage.setItem('money-flow-business-workers', JSON.stringify(businessWorkers)); }, [businessWorkers]);

  // --- INTEGRACIÓN AUTH ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- INTEGRACIÓN SUPABASE (DATOS) ---
  useEffect(() => {
    if (!session) return;

    const initSupabase = async () => {
      try {
        const localData = { transactions, banks, goals, subscriptions, debts, piggyBanks };
        // La migración ahora debería asignar el user_id del session.user.id
        await migrateToSupabase(localData, session.user.id);
        
        const dbData = await fetchAllFromSupabase(session.user.id);
        
        if (dbData.transactions.length > 0 || dbData.banks.length > 1) {
          setTransactions(dbData.transactions);
          setBanks(dbData.banks);
          setGoals(dbData.goals);
          setDebts(dbData.debts);
          setSubscriptions(dbData.subscriptions);
          console.log('Datos de usuario sincronizados correctamente.');
        }
      } catch (err) {
        console.error('Error sincronizando datos:', err);
      }
    };

    initSupabase();
  }, [session]);

  // Lógica de Registro Automático de Suscripciones
  useEffect(() => {
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
    let newTransactions = [];
    let updatedSubs = subscriptions.map(sub => {
      // Si el día de cobro ya pasó o es hoy, y no se ha procesado este mes
      if (today.getDate() >= sub.day && sub.lastProcessed !== currentMonthKey) {
        newTransactions.push({
          id: Date.now() + Math.random(),
          description: `Fijo: ${sub.name}`,
          amount: sub.amount,
          type: 'expense',
          category: sub.category,
          accountId: sub.accountId,
          date: today.toISOString()
        });
        return { ...sub, lastProcessed: currentMonthKey };
      }
      return sub;
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
      setSubscriptions(updatedSubs);
      // Opcional: Notificar usuario
    }
  }, []);

  useEffect(() => {
    setAlerts(generateAlerts(transactions, goals));
  }, [transactions, goals]);

  const dismissAlert = (i) => setAlerts(prev => prev.filter((_, idx) => idx !== i));

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const addTransaction  = async (tx) => {
    if (!session) return;
    // Sync con Supabase primero para obtener el UUID si es nuevo
    const dbTx = await syncTransaction(tx, session.user.id);
    const finalTx = dbTx ? {
      ...tx,
      id: dbTx.id,
      accountId: dbTx.account_id,
      toAccountId: dbTx.to_account_id
    } : tx;

    setTransactions(prev => {
      const exists = prev.find(t => t.id === finalTx.id || t.id === tx.id);
      if (exists) {
        return prev.map(t => (t.id === finalTx.id || t.id === tx.id) ? finalTx : t);
      }
      return [finalTx, ...prev];
    });
    
    setEditingTransaction(null);
    setActiveTab('home');
  };

  const addBankTransaction = async (txData) => {
    if (!session) return;
    const finalTx = {
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: 'Otros'
    };
    await addTransaction(finalTx);
  };

  const deleteTransaction = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      // Delete de Supabase (si es UUID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await deleteFromSupabase('transactions', id);
      }
    }
  };

  const startEditing = (tx) => {
    setEditingTransaction(tx);
    setActiveTab('add');
  };

  const cancelEditing = () => {
    setEditingTransaction(null);
    setActiveTab('home');
  };

  const addDebt = async (d) => {
    if (!session) return;
    const { data } = await supabase.from('debts').insert({
      person: d.person,
      amount: d.amount,
      type: d.type,
      paid: d.paid,
      date: d.date,
      user_id: session.user.id
    }).select();
    
    if (data && data[0]) {
      setDebts(prev => [{ ...d, id: data[0].id }, ...prev]);
    } else {
      setDebts(prev => [d, ...prev]);
    }
  };

  const deleteDebt = async (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) await deleteFromSupabase('debts', id);
  };

  const addSubscription = async (s) => {
    if (!session) return;
    const { data } = await supabase.from('subscriptions').insert({
      name: s.name,
      amount: s.amount,
      day: s.day,
      category: s.category,
      account_id: s.accountId,
      last_processed: s.lastProcessed,
      user_id: session.user.id
    }).select();

    if (data && data[0]) {
      setSubscriptions(prev => [{ ...s, id: data[0].id }, ...prev]);
    } else {
      setSubscriptions(prev => [s, ...prev]);
    }
  };

  const deleteSubscription = async (id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) await deleteFromSupabase('subscriptions', id);
  };

  const addPiggy    = (p) => setPiggyBanks(prev => [p, ...prev]);
  const deletePiggy = (id) => setPiggyBanks(prev => prev.filter(p => p.id !== id));

  const addBank = async (name) => {
    if (!session) return;
    
    // Optimistic Update: Generar ID temporal para feedback inmediato
    const tempId = 'temp_' + Date.now();
    const newBank = { id: tempId, name };
    setBanks(prev => [...prev, newBank]);

    try {
      // Intentar insertar con user_id
      let { data, error } = await supabase
        .from('banks')
        .insert({ name, user_id: session.user.id })
        .select();

      // Si falla porque no encuentra 'user_id', intentar sin él (confiando en el default auth.uid() de la DB)
      if (error && error.message.includes("user_id")) {
        console.warn('user_id column not found, retrying without it...');
        const retry = await supabase
          .from('banks')
          .insert({ name })
          .select();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;

      if (data && data[0]) {
        setBanks(prev => prev.map(b => b.id === tempId ? { id: data[0].id, name: data[0].name } : b));
      }
    } catch (err) {
      console.error('Error final al agregar banco:', err);
      alert(`Error al guardar el banco en la nube: ${err.message || 'Error desconocido'}. Se ha mantenido localmente.`);
    }
  };
  const deleteBank = async (id) => {
    if (banks.length <= 1) return alert('Debes tener al menos un banco.');
    setBanks(prev => prev.filter(b => b.id !== id));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) await deleteFromSupabase('banks', id);
  };

  const fundPiggy   = (id, amount) => {
    setPiggyBanks(prev => prev.map(p => p.id === id ? { ...p, saved: p.saved + amount } : p));
    const piggy = piggyBanks.find(p => p.id === id);
    addTransaction({
      id: Date.now() + 3,
      description: `Ahorro: ${piggy?.name || 'Cochinito'}`,
      amount: amount,
      type: 'expense',
      category: 'savings',
      accountId: 'cash', // Por defecto del disponible en caja
      date: new Date().toISOString()
    });
  };

  const adjustSavingsBalance = async (newAmount) => {
    const currentSavings = accountBalances.savings;
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
    // 1. Encontrar la deuda actual
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newPaidState = !debt.paid;

    // 2. Si se está marcando como pagada, registrar el gasto UNA SOLA VEZ
    if (newPaidState) {
      addTransaction({
        id: Date.now() + 1,
        description: `Pago total: ${debt.person}`,
        amount: debt.amount,
        type: 'expense',
        category: debt.type === 'owe' ? 'other_expense' : 'savings',
        date: new Date().toISOString()
      });
    }

    // 3. Actualizar el estado de la deuda
    setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: newPaidState } : d));
  };

  const partialPayDebt = (id, paidAmount) => {
    // 1. Registrar el abono como gasto UNA SOLA VEZ
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    addTransaction({
      id: Date.now() + 2,
      description: `Abono a: ${debt.person}`,
      amount: paidAmount,
      type: 'expense',
      category: debt.type === 'owe' ? 'other_expense' : 'savings',
      date: new Date().toISOString()
    });

    // 2. Actualizar el saldo de la deuda
    setDebts(prev => prev.map(d => {
      if (d.id !== id) return d;
      const remaining = d.amount - paidAmount;
      return remaining <= 0 ? { ...d, paid: true, amount: 0 } : { ...d, amount: remaining };
    }));
  };

  // Filtrar transacciones según el filtro de fecha Y búsqueda
  const filteredTxs = useMemo(() => {
    let txs = transactions.filter(tx => {
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
      txs = txs.filter(tx => 
        tx.description.toLowerCase().includes(q) || 
        getCategoryById(tx.category).label.toLowerCase().includes(q)
      );
    }

    return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterMonth, filterYear, dateFilterType, startDate, endDate, searchQuery]);

  const totalIncome   = filteredTxs.filter(t => t.type === 'income').reduce((a,t) => a + t.amount, 0);
  const totalExpenses = filteredTxs.filter(t => t.type === 'expense').reduce((a,t) => a + t.amount, 0);
  const balance       = totalIncome - totalExpenses;

  // Lógica de Recordatorios de Pagos Próximos
  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const reminders = [];

    // 1. Suscripciones (Gastos Fijos)
    subscriptions.forEach(sub => {
      const day = parseInt(sub.day);
      if (!isNaN(day)) {
        let dueDate = new Date(today.getFullYear(), today.getMonth(), day);
        if (dueDate < today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
        
        const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 7) {
          reminders.push({ id: `sub_${sub.id}`, title: sub.name, amount: sub.amount, type: 'sub', daysLeft: diff });
        }
      }
    });

    // 2. Deudas
    debts.filter(d => d.dueDate).forEach(debt => {
      const dueDate = new Date(debt.dueDate);
      const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 7) {
        reminders.push({ id: `debt_${debt.id}`, title: `${debt.person} (${debt.reason})`, amount: debt.amount, type: 'debt', daysLeft: diff });
      }
    });

    return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions, debts]);
  
  const totalPiggySavings = piggyBanks.reduce((a, p) => a + (p.saved || 0), 0);

  const DateFilterControl = () => (
    <div className="date-filter-control no-print" style={{ padding: '0 16px 16px' }}>
      {/* Selector de Tipo de Filtro */}
      <div style={{ 
        display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px', padding: '4px', marginBottom: '12px' 
      }}>
        <button 
          onClick={() => setDateFilterType('month')}
          style={{
            flex: 1, padding: '8px', borderRadius: '10px', border: 'none',
            fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            background: dateFilterType === 'month' ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
            color: dateFilterType === 'month' ? 'var(--primary)' : 'var(--text-dim)'
          }}
        >📅 Mensual</button>
        <button 
          onClick={() => setDateFilterType('range')}
          style={{
            flex: 1, padding: '8px', borderRadius: '10px', border: 'none',
            fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            background: dateFilterType === 'range' ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
            color: dateFilterType === 'range' ? 'var(--primary)' : 'var(--text-dim)'
          }}
        >📆 Por Fecha</button>
      </div>

      {/* Controles del Filtro Seleccionado */}
      {dateFilterType === 'month' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => {
            if (filterMonth === 0) { setFilterMonth(11); setFilterYear(y => y-1); }
            else setFilterMonth(m => m-1);
          }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>
            ‹
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>
            {MONTHS[filterMonth]} {filterYear}
          </span>
          <button
            disabled={filterMonth === now.getMonth() && filterYear === now.getFullYear()}
            onClick={() => {
              if (filterMonth === 11) { setFilterMonth(0); setFilterYear(y => y+1); }
              else setFilterMonth(m => m+1);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
              color: (filterMonth === now.getMonth() && filterYear === now.getFullYear()) ? 'rgba(255,255,255,0.15)' : 'var(--text-dim)',
            }}
          >›</button>
        </div>
      ) : (
        <div className="animate-fade" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Desde</p>
            <input 
              type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ padding: '8px 10px', width: '100%', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ color: 'var(--text-dim)', marginTop: '18px' }}>—</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Hasta</p>
            <input 
              type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ padding: '8px 10px', width: '100%', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const displayBalance = hideBalance ? '••••••' : formatCurrency(balance);
  const displayIncome  = hideBalance ? '••••' : formatCurrency(totalIncome);
  const displayExpense = hideBalance ? '••••' : formatCurrency(totalExpenses);

  const accountBalances = useMemo(() => {
    const balances = {};
    
    // 1. Balance Virtual Ahorros (Categoría 'savings')
    const savingsTxs = transactions.filter(t => t.category === 'savings');
    const savingsInc = savingsTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const savingsExp = savingsTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    balances['savings'] = savingsInc - savingsExp;

    // 2. Balances de Bancos
    const bankBalances = {};
    banks.forEach(b => {
      // Ingresos/Gastos normales (excluyendo ahorros)
      const bTxs = transactions.filter(t => (t.accountId === b.id || (b.id === 'general' && t.accountId === 'bank')) && t.category !== 'savings');
      const inc = bTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const exp = bTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      
      // Movimientos por TRANSFERENCIAS
      const transOut = transactions.filter(t => t.type === 'transfer' && t.accountId === b.id).reduce((a, t) => a + t.amount, 0);
      const transIn  = transactions.filter(t => t.type === 'transfer' && t.toAccountId === b.id).reduce((a, t) => a + t.amount, 0);

      bankBalances[b.id] = (inc - exp) + (transIn - transOut);
    });
    balances.bankDetails = bankBalances;
    balances.bank = Object.values(bankBalances).reduce((a, b) => a + b, 0);

    // 3. Resto de cuentas (Efectivo)
    ACCOUNTS.forEach(acc => {
      if (acc.id !== 'savings' && acc.id !== 'bank') {
        const accTxs = transactions.filter(t => 
          (t.accountId === acc.id || (!t.accountId && acc.id === 'cash')) && 
          t.category !== 'savings'
        );
        const inc = accTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const exp = accTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
        
        // Transferencias para Efectivo
        const transOut = transactions.filter(t => t.type === 'transfer' && (t.accountId === acc.id || (!t.accountId && acc.id === 'cash'))).reduce((a, t) => a + t.amount, 0);
        const transIn  = transactions.filter(t => t.type === 'transfer' && t.toAccountId === acc.id).reduce((a, t) => a + t.amount, 0);

        balances[acc.id] = (inc - exp) + (transIn - transOut);
      }
    });
    
    return balances;
  }, [transactions, banks]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="spinner">Cargando...</div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <LandingPage 
        onInstallClick={handleInstallClick} 
        installPromptReady={!!deferredPrompt} 
        onSkip={skipLanding}
      />
    );
  }

  if (!session) {
    return <Login />;
  }

  if (isLocked) {
    return <PinLockScreen onUnlock={() => setIsLocked(false)} onLogout={handleSignOut} />;
  }

  return (
    <div className={`app-container ${hideBalance ? 'hide-balance' : ''}`}>
      {/* Header */}
      <header style={{ padding: '22px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>
          💸 {username ? `Hola, ${username} 👋` : 'MoneyFlow'}
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Ocultar/mostrar balance */}
          <button
            onClick={() => setHideBalance(h => !h)}
            title={hideBalance ? 'Mostrar balance' : 'Ocultar balance'}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '7px 10px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.9rem' }}
          >{hideBalance ? '👁️' : '🙈'}</button>
          {/* Exportar */}
          <button onClick={() => exportToCSV(transactions)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '7px 12px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>
            ⬇️
          </button>
          {/* Cerrar Sesión */}
          <button onClick={handleSignOut}
            title="Cerrar Sesión"
            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: '10px', padding: '7px 12px', color: '#ff3b30', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800' }}>
            🚪
          </button>
        </div>
      </header>

      {/* Balance Card */}
      {!(activeTab === 'varios' && variosTab === 'minegocio') && (
        <BalanceCard 
          totalBalance={balance + totalPiggySavings} 
          income={totalIncome} 
          expenses={totalExpenses} 
          hideBalance={hideBalance}
          accountBalances={accountBalances}
          accounts={ACCOUNTS}
          username={username}
          totalPiggySavings={totalPiggySavings}
          banks={banks}
          onAddBank={addBank}
          onDeleteBank={deleteBank}
          onAdjustSavings={adjustSavingsBalance}
          onAddBankTransaction={addBankTransaction}
        />
      )}
      {/* Contenido */}
      <div style={{ flex: 1, paddingBottom: '100px' }}>
        {activeTab === 'home' && (
          <div className="animate-fade">
            {/* Recordatorios de Próximos Pagos Pro */}
            {upcomingPayments.length > 0 && !searchQuery && (
              <div className="no-print" style={{ padding: '0 16px 20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  📅 Próximos Pagos
                </p>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                  {upcomingPayments.map(pay => (
                    <div key={pay.id} style={{ 
                      minWidth: '170px', padding: '14px', borderRadius: '18px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      display: 'flex', flexDirection: 'column', gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem' }}>{pay.type === 'sub' ? '💳' : '🤝'}</span>
                        <span style={{ 
                          fontSize: '0.62rem', padding: '2px 8px', borderRadius: '6px', 
                          fontWeight: '700',
                          background: pay.daysLeft <= 1 ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.08)', 
                          color: pay.daysLeft <= 1 ? '#FF3B30' : 'var(--text-dim)' 
                        }}>
                          {pay.daysLeft === 0 ? 'Hoy' : pay.daysLeft === 1 ? 'Mañana' : `En ${pay.daysLeft} d`}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pay.title}
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>
                        {formatCurrency(pay.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buscador */}
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar movimientos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 35px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.9rem', color: 'white'
                    }}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >×</button>
                  )}
                </div>
                <button
                  onClick={() => setIsGlobalSearch(!isGlobalSearch)}
                  style={{
                    padding: '0 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                    border: '1px solid',
                    borderColor: isGlobalSearch ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    background: isGlobalSearch ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                    color: isGlobalSearch ? 'var(--primary)' : 'var(--text-dim)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {isGlobalSearch ? '🌎 Global' : '📅 Mes'}
                </button>
              </div>
            </div>

            <DateFilterControl />
            <WeeklySummary transactions={transactions} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 0' }}>
              {filteredTxs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🪙</div>
                  <p style={{ lineHeight: 1.6 }}>Sin movimientos en {dateFilterType === 'month' ? `${MONTHS[filterMonth]} ${filterYear}` : 'el rango seleccionado'}.<br/>Ve a "Añadir" para registrar uno.</p>
                </div>
              ) : filteredTxs.map(tx => {
                const isTransfer = tx.type === 'transfer';
                const cat = isTransfer ? { icon: '🔄', color: 'var(--primary)', label: 'Traspaso' } : getCategoryById(tx.category);
                
                // Helper to get account name
                const getAccName = (id) => {
                  if (id === 'cash') return 'Efectivo';
                  if (id === 'savings') return 'Ahorros';
                  if (id === 'bank' || id === 'general') return 'Banco Principal';
                  const b = banks.find(b => b.id === id);
                  return b ? b.name : id;
                };

                return (
                  <div key={tx.id} className="card animate-fade"
                    style={{ margin: 0, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${cat.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {cat.icon}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '2px' }}>{tx.description}</p>
                        <p style={{ fontSize: '0.72rem', color: isTransfer ? 'var(--text-dim)' : cat.color }}>
                          {isTransfer 
                            ? `${getAccName(tx.accountId)} ➔ ${getAccName(tx.toAccountId)}` 
                            : `${cat.label} · ${new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
                          }
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: isTransfer ? 'white' : (tx.type === 'income' ? 'var(--income)' : 'var(--expense)'), fontWeight: '700', fontSize: '0.95rem' }}>
                        {hideBalance ? '••••' : `${isTransfer ? '' : (tx.type === 'income' ? '+' : '-')}${formatCurrency(tx.amount)}`}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => startEditing(tx)} title="Editar"
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px', opacity: 0.6 }}>✏️</button>
                        <button onClick={() => deleteTransaction(tx.id)} title="Eliminar"
                          style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.6)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}>×</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div style={{ padding: '8px 0' }}>
            <TransactionForm 
              onAddTransaction={addTransaction} 
              editingData={editingTransaction}
              onCancelEdit={cancelEditing}
              accounts={ACCOUNTS}
              banks={banks}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <DateFilterControl />
            <AnalysisBreakdown 
              transactions={transactions} 
              filterMonth={filterMonth} 
              filterYear={filterYear} 
              dateFilterType={dateFilterType}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}

        {activeTab === 'varios' && (
          <div style={{ padding: '0 0 20px' }}>
            {variosTab === 'menu' ? (
              <div className="animate-fade" style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { id: 'goals',  label: 'Presupuesto', icon: '🎯', desc: 'Gestiona límites', color: 'rgba(255, 45, 85, 0.15)', text: '#FF2D55' },
                  { id: 'subs',   label: 'Gastos Fijos', icon: '📅', desc: 'Suscripciones', color: 'rgba(0, 122, 255, 0.15)', text: '#007AFF' },
                  { id: 'ahorro', label: 'Cochinitos',  icon: '🐷', desc: 'Alcanza metas', color: 'rgba(255, 149, 0, 0.15)', text: '#FF9500' },
                  { id: 'debts',  label: 'Deudas',     icon: '🤝', desc: 'Compartidas', color: 'rgba(52, 199, 89, 0.15)', text: '#34C759' },
                  { id: 'minegocio', label: 'Mi Negocio', icon: '💼', desc: 'Finanzas empresariales', color: 'rgba(196, 251, 109, 0.15)', text: 'var(--primary)' }
                ].map(op => (
                  <button key={op.id} onClick={() => setVariosTab(op.id)}
                    style={{
                      background: 'var(--surface-color)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '24px',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: op.color, color: op.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                      {op.icon}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: '700', fontSize: '1rem', color: 'white', marginBottom: '4px' }}>{op.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.2' }}>{op.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="animate-fade">
                {/* Header Sub-sección con botón Volver */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 20px', gap: '12px' }}>
                  <button onClick={() => setVariosTab('menu')}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '50%', width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', cursor: 'pointer', fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    ←
                  </button>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                    {variosTab === 'goals' && '🎯 Presupuesto'}
                    {variosTab === 'subs' && '📅 Gastos Fijos'}
                    {variosTab === 'ahorro' && '🐷 Cochinitos'}
                    {variosTab === 'debts' && '🤝 Deudas'}
                    {variosTab === 'minegocio' && '💼 Mi Negocio'}
                  </h2>
                </div>

                {/* Contenido dinámico de Varios */}
                {variosTab === 'goals' && (
                  <div className="animate-fade">
                    <GoalsSection income={totalIncome} expenses={totalExpenses} goals={goals} onSaveGoals={setGoals} transactions={filteredTxs} />
                  </div>
                )}
                
                {variosTab === 'subs' && (
                  <div className="animate-fade">
                    <SubscriptionsTab 
                      subscriptions={subscriptions} 
                      onAddSubscription={addSubscription}
                      onDeleteSubscription={deleteSubscription}
                      accounts={ACCOUNTS}
                    />
                  </div>
                )}

                {variosTab === 'ahorro' && (
                  <div className="animate-fade">
                    <PiggyBankTab 
                      piggyBanks={piggyBanks}
                      onAddPiggy={addPiggy}
                      onAddFunds={fundPiggy}
                      onDeletePiggy={deletePiggy}
                      availableBalance={balance}
                    />
                  </div>
                )}

                {variosTab === 'debts' && (
                  <div className="animate-fade">
                    <DebtsTab 
                      debts={debts} 
                      onAddDebt={addDebt} 
                      onDeleteDebt={deleteDebt} 
                      onTogglePaid={togglePaid} 
                      onPartialPayment={partialPayDebt} 
                      dateFilterType={dateFilterType}
                      startDate={startDate}
                      endDate={endDate}
                      filterMonth={filterMonth}
                      filterYear={filterYear}
                    />
                  </div>
                )}
                
                {variosTab === 'minegocio' && (
                  isBusinessUnlocked ? (
                    <BusinessDashboard 
                      businesses={businesses} 
                      addBusiness={(b) => setBusinesses(prev => [...prev, b])}
                      transactions={businessTransactions}
                      setTransactions={setBusinessTransactions}
                      workers={businessWorkers}
                      setWorkers={setBusinessWorkers}
                    />
                  ) : (
                    <BusinessGate onAccessGranted={() => setIsBusinessUnlocked(true)} />
                  )
                )}
                
                {/* Cierre del condicional variosTab === 'menu' */}
                {variosTab !== 'menu' && <div style={{ paddingBottom: '20px' }}></div>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '8px 0' }}>
            <SettingsTab />
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '500px',
        background: 'rgba(12,12,14,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-around',
        padding: '6px 0 16px', zIndex: 100,
      }}>
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => {
            if (tab.id === 'varios') {
              if (activeTab === 'varios' && variosTab !== 'menu') {
                setVariosTab('menu'); // If already in 'varios' and in a sub-section, go back to 'menu'
              } else if (activeTab !== 'varios') {
                setVariosTab('menu'); // If coming from another tab, always go to 'varios' menu
              }
            }
            if (tab.id !== 'add') setEditingTransaction(null);
            setActiveTab(tab.id);
          }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 6px', position: 'relative' }}>
            {tab.id === 'home' && alerts.length > 0 && (
              <span style={{ position: 'absolute', top: '0px', right: '4px', background: 'var(--expense)', color: 'white', borderRadius: '50%', width: '13px', height: '13px', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {alerts.length}
              </span>
            )}
            <span style={{ fontSize: tab.id === 'add' ? '1.4rem' : '1.2rem', filter: activeTab === tab.id ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'filter 0.2s' }}>
              {tab.id === 'add' && editingTransaction ? '📝' : tab.icon}
            </span>
            <span style={{ fontSize: '0.55rem', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-dim)', fontWeight: activeTab === tab.id ? '700' : '400', transition: 'color 0.2s', marginTop: '2px' }}>
              {tab.id === 'add' && editingTransaction ? 'Editar' : tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
