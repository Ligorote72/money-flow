import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  fetchAllFromSupabase, 
  migrateToSupabase, 
  syncTransaction, 
  deleteFromSupabase,
  syncBusiness,
  deleteBusinessFromSupabase,
  syncBusinessTransaction,
  deleteBusinessTxFromSupabase,
  syncBusinessWorker,
  deleteBusinessWorkerFromSupabase
} from '../utils/supabaseSync';
import { generateAlerts } from '../utils/helpers';

export function useFinanceData() {
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

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // LocalStorage persistence
  useEffect(() => { localStorage.setItem('money-flow-txs', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('money-flow-goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('money-flow-debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('money-flow-subs', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('money-flow-piggy', JSON.stringify(piggyBanks)); }, [piggyBanks]);
  useEffect(() => { localStorage.setItem('money-flow-banks', JSON.stringify(banks)); }, [banks]);
  useEffect(() => { localStorage.setItem('money-flow-businesses', JSON.stringify(businesses)); }, [businesses]);
  useEffect(() => { localStorage.setItem('money-flow-business-txs', JSON.stringify(businessTransactions)); }, [businessTransactions]);
  useEffect(() => { localStorage.setItem('money-flow-business-workers', JSON.stringify(businessWorkers)); }, [businessWorkers]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      console.warn('Supabase session fetch timed out, proceeding without session.');
      setLoading(false);
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(loadingTimeout);
        setSession(session);
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(loadingTimeout);
        console.error('Error getting Supabase session:', error);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Sync bidireccional
  useEffect(() => {
    if (!session) return;

    const initSupabase = async () => {
      try {
        const localData = { 
          transactions, 
          banks, 
          goals, 
          subscriptions, 
          debts, 
          piggyBanks,
          businesses,
          businessTransactions,
          businessWorkers
        };
        await migrateToSupabase(localData, session.user.id);
        const dbData = await fetchAllFromSupabase(session.user.id);
        
        if (dbData.transactions && dbData.transactions.length > 0) {
          setTransactions(dbData.transactions);
        }
        if (dbData.banks && dbData.banks.length > 1) {
          setBanks(dbData.banks);
        }
        if (dbData.debts && dbData.debts.length > 0) {
          setDebts(dbData.debts);
        }
        if (dbData.subscriptions && dbData.subscriptions.length > 0) {
          setSubscriptions(dbData.subscriptions);
        }
        if (dbData.goals && (dbData.goals.income > 0 || dbData.goals.expense > 0)) {
          setGoals(dbData.goals);
        }
        if (dbData.piggyBanks && dbData.piggyBanks.length > 0) {
          setPiggyBanks(dbData.piggyBanks);
        }
        if (dbData.businesses && dbData.businesses.length > 0) {
          setBusinesses(dbData.businesses);
        }
        if (dbData.businessTransactions && dbData.businessTransactions.length > 0) {
          setBusinessTransactions(dbData.businessTransactions);
        }
        if (dbData.businessWorkers && dbData.businessWorkers.length > 0) {
          setBusinessWorkers(dbData.businessWorkers);
        }
        console.log('Datos de usuario y negocios sincronizados con Supabase correctamente.');
      } catch (err) {
        console.error('Error sincronizando datos con Supabase:', err);
      }
    };

    initSupabase();
  }, [session]);

  // Generación de alertas
  useEffect(() => {
    setAlerts(generateAlerts(transactions, goals));
  }, [transactions, goals]);

  // Transacciones personales
  const addTransaction = async (tx) => {
    if (!session) return;
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
  };

  const deleteTransaction = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) await deleteFromSupabase('transactions', id);
    }
  };

  // Deudas
  const addDebt = async (d) => {
    if (!session) {
      setDebts(prev => [d, ...prev]);
      return;
    }
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
    if (session) {
      await deleteFromSupabase('debts', id);
    }
  };

  const updateDebt = async (id, updates) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    if (session) {
      await supabase.from('debts').update(updates).eq('id', id);
    }
  };

  const toggleDebtPaid = async (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newPaid = !debt.paid;
    setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: newPaid } : d));
    if (session) {
      await supabase.from('debts').update({ paid: newPaid }).eq('id', id);
    }
  };

  const partialPaymentDebt = async (id, paymentAmount) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newAmount = Math.max(0, debt.amount - paymentAmount);
    const newPaid = newAmount === 0;
    setDebts(prev => prev.map(d => d.id === id ? { ...d, amount: newAmount, paid: newPaid } : d));
    if (session) {
      await supabase.from('debts').update({ amount: newAmount, paid: newPaid }).eq('id', id);
    }
  };

  // Suscripciones
  const addSubscription = async (s) => {
    if (!session) {
      setSubscriptions(prev => [...prev, s]);
      return;
    }
    const { data } = await supabase.from('subscriptions').insert({
      name: s.name,
      amount: s.amount,
      day: s.day,
      category: s.category,
      account_id: String(s.accountId),
      last_processed: s.lastProcessed,
      user_id: session.user.id
    }).select();

    if (data && data[0]) {
      setSubscriptions(prev => [...prev, { ...s, id: data[0].id }]);
    } else {
      setSubscriptions(prev => [...prev, s]);
    }
  };

  const deleteSubscription = async (id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    if (session) {
      await deleteFromSupabase('subscriptions', id);
    }
  };

  const updateSubscription = async (id, updates) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (session) {
      const payload = { ...updates };
      if (payload.accountId) {
        payload.account_id = String(payload.accountId);
        delete payload.accountId;
      }
      if (payload.lastProcessed) {
        payload.last_processed = payload.lastProcessed;
        delete payload.lastProcessed;
      }
      await supabase.from('subscriptions').update(payload).eq('id', id);
    }
  };

  // Bancos
  const addBank = async (bankName) => {
    const tempId = `bank_${Date.now()}`;
    const newBank = { id: tempId, name: bankName };
    setBanks(prev => [...prev, newBank]);

    if (session) {
      const { data } = await supabase.from('banks').insert({
        name: bankName,
        user_id: session.user.id
      }).select();
      if (data && data[0]) {
        setBanks(prev => prev.map(b => b.id === tempId ? { id: data[0].id, name: data[0].name } : b));
      }
    }
  };

  const deleteBank = async (id) => {
    setBanks(prev => prev.filter(b => b.id !== id));
    if (session && !id.startsWith('bank_')) {
      await deleteFromSupabase('banks', id);
    }
  };

  // Cochinitos / Alcancías
  const addPiggyBank = async (p) => {
    setPiggyBanks(prev => [...prev, p]);
    if (session) {
      const { data } = await supabase.from('piggy_banks').insert({
        name: p.name,
        target: p.target,
        saved: p.saved || 0,
        icon: p.icon || '🐷',
        user_id: session.user.id
      }).select();
      if (data && data[0]) {
        setPiggyBanks(prev => prev.map(item => item.id === p.id ? { ...item, id: data[0].id } : item));
      }
    }
  };

  const deletePiggyBank = async (id) => {
    setPiggyBanks(prev => prev.filter(p => p.id !== id));
    if (session) {
      await deleteFromSupabase('piggy_banks', id);
    }
  };

  const updatePiggyBank = async (id, updates) => {
    setPiggyBanks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (session) {
      await supabase.from('piggy_banks').update(updates).eq('id', id);
    }
  };

  // Negocios (Fincas, etc.)
  const addBusiness = async (b) => {
    const defaults = { quickActions: [] };
    if (b.type && (b.type.toLowerCase().includes('café') || b.type.toLowerCase().includes('cafe'))) {
      defaults.quickActions = [
        { id: 'q1', name: 'Venta Café Pergamino', amount: 0, type: 'income', icon: '☕' },
        { id: 'q2', name: 'Fertilizantes', amount: 0, type: 'expense', icon: '🌱' },
        { id: 'q3', name: 'Agroquímicos', amount: 0, type: 'expense', icon: '🧪' },
        { id: 'q4', name: 'Remesa / Mercado', amount: 0, type: 'expense', icon: '🛒' },
      ];
    } else if (b.type && (b.type.toLowerCase().includes('ganadería') || b.type.toLowerCase().includes('ganaderia'))) {
      defaults.quickActions = [
        { id: 'q1', name: 'Venta de Leche', amount: 0, type: 'income', icon: '🥛' },
        { id: 'q2', name: 'Venta de Queso', amount: 0, type: 'income', icon: '🧀' },
        { id: 'q3', name: 'Concentrado', amount: 0, type: 'expense', icon: '📦' },
        { id: 'q4', name: 'Sal y Suplementos', amount: 0, type: 'expense', icon: '🧂' },
      ];
    }

    const business = { ...defaults, ...b };
    setBusinesses(prev => [...prev, business]);
    
    if (session) {
      await syncBusiness(business, session.user.id);
    }
  };

  const deleteBusiness = async (id) => {
    if (window.confirm('¿Eliminar este negocio y todos sus datos?')) {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      setBusinessTransactions(prev => prev.filter(t => t.businessId !== id));
      setBusinessWorkers(prev => prev.filter(w => w.businessId !== id));
      
      if (session) {
        await deleteBusinessFromSupabase(id);
      }
    }
  };

  const updateBusiness = async (id, updates) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    if (session) {
      const biz = businesses.find(b => b.id === id);
      if (biz) {
        await syncBusiness({ ...biz, ...updates }, session.user.id);
      }
    }
  };

  // Movimientos de Negocio
  const addBusinessTransaction = async (btx) => {
    setBusinessTransactions(prev => [btx, ...prev]);
    if (session) {
      await syncBusinessTransaction(btx, session.user.id);
    }
  };

  const deleteBusinessTransaction = async (id) => {
    setBusinessTransactions(prev => prev.filter(t => t.id !== id));
    if (session) {
      await deleteBusinessTxFromSupabase(id);
    }
  };

  // Manejador reactivo para setBusinessTransactions cuando se agrega o elimina un elemento
  const handleSetBusinessTransactions = (updater) => {
    if (typeof updater === 'function') {
      setBusinessTransactions(prev => {
        const next = updater(prev);
        if (session) {
          if (next.length > prev.length) {
            const newTx = next[0];
            syncBusinessTransaction(newTx, session.user.id);
          } else if (next.length < prev.length) {
            const nextIds = new Set(next.map(t => t.id));
            const deleted = prev.filter(t => !nextIds.has(t.id));
            deleted.forEach(t => deleteBusinessTxFromSupabase(t.id));
          }
        }
        return next;
      });
    } else {
      setBusinessTransactions(updater);
    }
  };

  // Trabajadores de Finca / Negocio
  const addBusinessWorker = async (worker) => {
    setBusinessWorkers(prev => [...prev, worker]);
    if (session) {
      await syncBusinessWorker(worker, session.user.id);
    }
  };

  const deleteBusinessWorker = async (id) => {
    setBusinessWorkers(prev => prev.filter(w => w.id !== id));
    if (session) {
      await deleteBusinessWorkerFromSupabase(id);
    }
  };

  // Manejador reactivo para setBusinessWorkers cuando se agrega o elimina un elemento
  const handleSetBusinessWorkers = (updater) => {
    if (typeof updater === 'function') {
      setBusinessWorkers(prev => {
        const next = updater(prev);
        if (session) {
          if (next.length > prev.length) {
            const newWorker = next[next.length - 1];
            syncBusinessWorker(newWorker, session.user.id);
          } else if (next.length < prev.length) {
            const nextIds = new Set(next.map(w => w.id));
            const deleted = prev.filter(w => !nextIds.has(w.id));
            deleted.forEach(w => deleteBusinessWorkerFromSupabase(w.id));
          }
        }
        return next;
      });
    } else {
      setBusinessWorkers(updater);
    }
  };

  return {
    transactions, setTransactions,
    goals, setGoals,
    debts, setDebts,
    addDebt, deleteDebt, updateDebt, toggleDebtPaid, partialPaymentDebt,
    subscriptions, setSubscriptions,
    addSubscription, deleteSubscription, updateSubscription,
    piggyBanks, setPiggyBanks,
    addPiggyBank, deletePiggyBank, updatePiggyBank,
    banks, setBanks,
    businesses, setBusinesses, addBusiness, deleteBusiness, updateBusiness,
    businessTransactions, setBusinessTransactions: handleSetBusinessTransactions,
    addBusinessTransaction, deleteBusinessTransaction,
    businessWorkers, setBusinessWorkers: handleSetBusinessWorkers,
    addBusinessWorker, deleteBusinessWorker,
    session, setSession,
    loading, setLoading,
    alerts, setAlerts,
    addTransaction,
    deleteTransaction,
    addBank,
    deleteBank,
  };
}
