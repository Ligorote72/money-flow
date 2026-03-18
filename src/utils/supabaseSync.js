import { supabase } from './supabaseClient';

/**
 * Migra los datos de localStorage a Supabase si la base de datos está vacía.
 */
export const migrateToSupabase = async (localData, userId) => {
  const { transactions, banks, goals, subscriptions, debts, piggyBanks } = localData;

  // 1. Verificar si ya hay datos (para no duplicar)
  const { count: txCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (txCount > 0) return false;

  console.log('Migrando datos a Supabase para el usuario:', userId);

  // Mapeo y filtrado de nulos/invalidos si es necesario
  const txsToUpsert = transactions.map(tx => ({
    amount: tx.amount,
    description: tx.description,
    category: tx.category,
    type: tx.type,
    date: tx.date,
    account_id: String(tx.accountId),
    to_account_id: tx.toAccountId ? String(tx.toAccountId) : null,
    user_id: userId
  }));

  const banksToUpsert = banks.filter(b => b.id.startsWith('bank_')).map(b => ({
    name: b.name,
    user_id: userId
  }));

  const goalsToUpsert = [];
  if (goals.income > 0) goalsToUpsert.push({ type: 'income', amount: goals.income, user_id: userId });
  if (goals.expense > 0) goalsToUpsert.push({ type: 'expense', amount: goals.expense, user_id: userId });

  const subsToUpsert = (subscriptions || []).map(s => ({
    name: s.name,
    amount: s.amount,
    day: s.day,
    category: s.category,
    account_id: String(s.accountId),
    last_processed: s.lastProcessed,
    user_id: userId
  }));

  const debtsToUpsert = (debts || []).map(d => ({
    person: d.person,
    amount: d.amount,
    type: d.type,
    paid: d.paid,
    date: d.date,
    user_id: userId
  }));

  // Ejecutar inserciones
  if (txsToUpsert.length > 0) await supabase.from('transactions').insert(txsToUpsert);
  if (banksToUpsert.length > 0) await supabase.from('banks').insert(banksToUpsert);
  if (goalsToUpsert.length > 0) await supabase.from('goals').insert(goalsToUpsert);
  if (subsToUpsert.length > 0) await supabase.from('subscriptions').insert(subsToUpsert);
  if (debtsToUpsert.length > 0) await supabase.from('debts').insert(debtsToUpsert);

  return true;
};

/**
 * Carga todos los datos desde Supabase
 */
export const fetchAllFromSupabase = async (userId) => {
  const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  const { data: dbBanks } = await supabase.from('banks').select('*').eq('user_id', userId);
  const { data: dbGoals } = await supabase.from('goals').select('*').eq('user_id', userId);
  const { data: dbSubs } = await supabase.from('subscriptions').select('*').eq('user_id', userId);
  const { data: dbDebts } = await supabase.from('debts').select('*').eq('user_id', userId);

  // Convertir formato de Supabase al formato que espera la App
  const banks = [
    { id: 'general', name: 'Banco Principal' },
    ...(dbBanks || []).map(b => ({ id: b.id, name: b.name }))
  ];

  const goals = {
    income: dbGoals?.find(g => g.type === 'income')?.amount || 0,
    expense: dbGoals?.find(g => g.type === 'expense')?.amount || 0,
    categoryBudgets: {}
  };

  const debts = (dbDebts || []).map(d => ({
    id: d.id,
    person: d.person,
    amount: Number(d.amount),
    type: d.type,
    paid: d.paid,
    date: d.date
  }));

  const subscriptions = (dbSubs || []).map(s => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    day: s.day,
    category: s.category,
    accountId: s.account_id,
    lastProcessed: s.last_processed
  }));

  return { 
    transactions: transactions || [], 
    banks, 
    goals,
    debts,
    subscriptions
  };
};

/**
 * Helpers para operaciones individuales (Sync)
 */
export const syncTransaction = async (tx, userId) => {
  const payload = {
    amount: tx.amount,
    description: tx.description,
    category: tx.category,
    type: tx.type,
    date: tx.date,
    account_id: String(tx.accountId),
    to_account_id: tx.toAccountId ? String(tx.toAccountId) : null,
    user_id: userId
  };

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.id);

  if (isUUID) {
    const { data } = await supabase.from('transactions').update(payload).eq('id', tx.id).select();
    return data?.[0];
  } else {
    const { data } = await supabase.from('transactions').insert(payload).select();
    return data?.[0];
  }
};

export const deleteFromSupabase = async (table, id) => {
  await supabase.from(table).delete().eq('id', id);
};
