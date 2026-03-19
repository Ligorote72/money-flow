import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { fetchAllFromSupabase, migrateToSupabase, syncTransaction, deleteFromSupabase } from '../utils/supabaseSync';
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

  // Auth session
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

  // Supabase Sync
  useEffect(() => {
    if (!session) return;

    const initSupabase = async () => {
      try {
        const localData = { transactions, banks, goals, subscriptions, debts, piggyBanks };
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

  // Alerts generation
  useEffect(() => {
    setAlerts(generateAlerts(transactions, goals));
  }, [transactions, goals]);

  // Actions
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

  const updateDebt = async (id, updates) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      await supabase.from('debts').update(updates).eq('id', id);
    }
  };

  const toggleDebtPaid = async (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newPaid = !debt.paid;
    updateDebt(id, { paid: newPaid });
  };

  const partialPaymentDebt = async (id, amount) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || amount <= 0 || amount > debt.amount) return;

    const newAmount = debt.amount - amount;
    const isPaid = newAmount <= 0.01;

    await updateDebt(id, { amount: newAmount, paid: isPaid });

    await addTransaction({
      id: Date.now().toString(),
      description: `Abono a deuda: ${debt.person}`,
      amount: amount,
      type: 'expense',
      category: debt.type === 'owe' ? 'other_expense' : 'savings',
      date: new Date().toISOString()
    });
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

  const updateSubscription = async (id, updates) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      await supabase.from('subscriptions').update(updates).eq('id', id);
    }
  };

  const addBank = async (name) => {
    if (!session) return;
    const tempId = 'temp_' + Date.now();
    setBanks(prev => [...prev, { id: tempId, name }]);
    try {
      const { data, error } = await supabase.from('banks').insert({ name, user_id: session.user.id }).select();
      if (error) throw error;
      if (data && data[0]) {
        setBanks(prev => prev.map(b => b.id === tempId ? { id: data[0].id, name: data[0].name } : b));
      }
    } catch (err) {
      console.error('Error adding bank:', err);
    }
  };

  const deleteBank = async (id) => {
    if (banks.length <= 1) return alert('Debes tener al menos un banco.');
    setBanks(prev => prev.filter(b => b.id !== id));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) await deleteFromSupabase('banks', id);
  };

  const addPiggyBank = async (p) => {
    if (!session) return;
    const { data } = await supabase.from('piggy_banks').insert({
      name: p.name,
      goal: p.goal,
      saved: p.saved,
      icon: p.icon,
      user_id: session.user.id
    }).select();

    if (data && data[0]) {
      setPiggyBanks(prev => [...prev, { ...p, id: data[0].id }]);
    } else {
      setPiggyBanks(prev => [...prev, p]);
    }
  };

  const deletePiggyBank = async (id) => {
    setPiggyBanks(prev => prev.filter(p => p.id !== id));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) await deleteFromSupabase('piggy_banks', id);
  };

  const updatePiggyBank = async (id, updates) => {
    setPiggyBanks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      await supabase.from('piggy_banks').update(updates).eq('id', id);
    }
  };

  const addBusiness = async (b) => {
    const defaults = {
      quickActions: []
    };
    
    if (b.type.toLowerCase().includes('café') || b.type.toLowerCase().includes('cafe')) {
      defaults.quickActions = [
        { id: 'q1', name: 'Venta Café Pergamino', amount: 0, type: 'income', icon: '☕' },
        { id: 'q2', name: 'Fertilizantes', amount: 0, type: 'expense', icon: '🌱' },
        { id: 'q3', name: 'Agroquímicos', amount: 0, type: 'expense', icon: '🧪' },
        { id: 'q4', name: 'Remesa / Mercado', amount: 0, type: 'expense', icon: '🛒' },
      ];
    } else if (b.type.toLowerCase().includes('ganadería') || b.type.toLowerCase().includes('ganaderia')) {
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
      try {
        await supabase.from('businesses').insert({
          ...business,
          user_id: session.user.id
        });
      } catch (err) {
        console.error('Error syncing business to Supabase:', err);
      }
    }
  };

  const deleteBusiness = async (id) => {
    if (window.confirm('¿Eliminar este negocio y todos sus datos?')) {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      setBusinessTransactions(prev => prev.filter(t => t.businessId !== id));
      setBusinessWorkers(prev => prev.filter(w => w.businessId !== id));
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        try {
          await deleteFromSupabase('businesses', id);
        } catch (err) {
          console.error('Error deleting business from Supabase:', err);
        }
      }
    }
  };

  const updateBusiness = async (id, updates) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      try {
        await supabase.from('businesses').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating business in Supabase:', err);
      }
    }
  };

  return {
    transactions, setTransactions,
    goals, setGoals,
    debts, setDebts,
    addDebt, deleteDebt, updateDebt, toggleDebtPaid,
    subscriptions, setSubscriptions,
    addSubscription, deleteSubscription, updateSubscription,
    piggyBanks, setPiggyBanks,
    addPiggyBank, deletePiggyBank, updatePiggyBank,
    banks, setBanks,
    businesses, setBusinesses, addBusiness, deleteBusiness, updateBusiness,
    businessTransactions, setBusinessTransactions,
    businessWorkers, setBusinessWorkers,
    session, setSession,
    loading, setLoading,
    alerts, setAlerts,
    addTransaction,
    deleteTransaction,
    deleteDebt,
    toggleDebtPaid,
    partialPaymentDebt,
    addBank,
    deleteBank,
  };
}
