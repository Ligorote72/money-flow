import { supabase } from './supabaseClient';

/**
 * Migra los datos de localStorage a Supabase si la base de datos está vacía.
 */
export const migrateToSupabase = async (localData, userId) => {
  const { 
    transactions = [], 
    banks = [], 
    goals = {}, 
    subscriptions = [], 
    debts = [], 
    piggyBanks = [],
    businesses = [],
    businessTransactions = [],
    businessWorkers = []
  } = localData;

  // 1. Verificar si ya hay datos de transacciones
  const { count: txCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (txCount > 0) return false;

  console.log('Migrando datos locales a Supabase para el usuario:', userId);

  // Mapeo de transacciones personales
  const txsToUpsert = transactions.map(tx => ({
    amount: tx.amount,
    description: tx.description,
    category: tx.category,
    type: tx.type,
    date: tx.date,
    account_id: tx.accountId || null,
    to_account_id: tx.toAccountId || null,
    user_id: userId
  }));

  const banksToUpsert = banks.filter(b => b.id && b.id.startsWith('bank_')).map(b => ({
    name: b.name,
    user_id: userId
  }));

  const goalsToUpsert = [];
  if (goals?.income > 0) goalsToUpsert.push({ type: 'income', amount: goals.income, user_id: userId });
  if (goals?.expense > 0) goalsToUpsert.push({ type: 'expense', amount: goals.expense, user_id: userId });

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

  const piggiesToUpsert = (piggyBanks || []).map(p => ({
    name: p.name,
    target: p.target,
    saved: p.saved || 0,
    icon: p.icon || '🐷',
    user_id: userId
  }));

  const businessesToUpsert = (businesses || []).map(b => ({
    id: String(b.id),
    name: b.name,
    type: b.type,
    quick_actions: b.quickActions || [],
    user_id: userId
  }));

  const bizTxsToUpsert = (businessTransactions || []).map(bt => ({
    id: String(bt.id),
    business_id: String(bt.businessId),
    description: bt.description,
    amount: bt.amount,
    type: bt.type,
    date: bt.date,
    user_id: userId
  }));

  const bizWorkersToUpsert = (businessWorkers || []).map(bw => ({
    id: String(bw.id),
    business_id: String(bw.businessId),
    name: bw.name,
    type: bw.type,
    rate: bw.rate || 0,
    user_id: userId
  }));

  // Ejecutar inserciones silenciosas
  try {
    if (txsToUpsert.length > 0) await supabase.from('transactions').insert(txsToUpsert);
    if (banksToUpsert.length > 0) await supabase.from('banks').insert(banksToUpsert);
    if (goalsToUpsert.length > 0) await supabase.from('goals').insert(goalsToUpsert);
    if (subsToUpsert.length > 0) await supabase.from('subscriptions').insert(subsToUpsert);
    if (debtsToUpsert.length > 0) await supabase.from('debts').insert(debtsToUpsert);
    if (piggiesToUpsert.length > 0) await supabase.from('piggy_banks').insert(piggiesToUpsert);
    if (businessesToUpsert.length > 0) await supabase.from('businesses').upsert(businessesToUpsert);
    if (bizTxsToUpsert.length > 0) await supabase.from('business_transactions').upsert(bizTxsToUpsert);
    if (bizWorkersToUpsert.length > 0) await supabase.from('business_workers').upsert(bizWorkersToUpsert);
  } catch (err) {
    console.warn('Nota en migración de datos (algunas tablas pueden no existir aún en Supabase):', err);
  }

  return true;
};

/**
 * Carga todos los datos desde Supabase
 */
export const fetchAllFromSupabase = async (userId) => {
  try {
    const [
      { data: transactions },
      { data: dbBanks },
      { data: dbGoals },
      { data: dbSubs },
      { data: dbDebts },
      { data: dbPiggies },
      { data: dbBusinesses },
      { data: dbBizTxs },
      { data: dbBizWorkers }
    ] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('banks').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('piggy_banks').select('*').eq('user_id', userId),
      supabase.from('businesses').select('*').eq('user_id', userId),
      supabase.from('business_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('business_workers').select('*').eq('user_id', userId)
    ]);

    // Convertir formato de Supabase al formato que espera la App
    const mappedTransactions = (transactions || []).map(tx => ({
      ...tx,
      accountId: tx.account_id,
      toAccountId: tx.to_account_id
    }));

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

    const piggyBanks = (dbPiggies || []).map(p => ({
      id: p.id,
      name: p.name,
      target: Number(p.target),
      saved: Number(p.saved || 0),
      icon: p.icon || '🐷'
    }));

    const businesses = (dbBusinesses || []).map(b => ({
      id: b.id,
      name: b.name,
      type: b.type,
      quickActions: b.quick_actions || []
    }));

    const businessTransactions = (dbBizTxs || []).map(bt => ({
      id: bt.id,
      businessId: bt.business_id,
      description: bt.description,
      amount: Number(bt.amount),
      type: bt.type,
      date: bt.date
    }));

    const businessWorkers = (dbBizWorkers || []).map(bw => ({
      id: bw.id,
      businessId: bw.business_id,
      name: bw.name,
      type: bw.type,
      rate: Number(bw.rate || 0)
    }));

    return { 
      transactions: mappedTransactions, 
      banks, 
      goals,
      debts,
      subscriptions,
      piggyBanks,
      businesses,
      businessTransactions,
      businessWorkers
    };
  } catch (err) {
    console.error('Error fetching all from Supabase:', err);
    return {
      transactions: [],
      banks: [{ id: 'general', name: 'Banco Principal' }],
      goals: { income: 0, expense: 0, categoryBudgets: {} },
      debts: [],
      subscriptions: [],
      piggyBanks: [],
      businesses: [],
      businessTransactions: [],
      businessWorkers: []
    };
  }
};

/**
 * Sincronización de transacciones personales
 */
export const syncTransaction = async (tx, userId) => {
  const payload = {
    amount: tx.amount,
    description: tx.description,
    category: tx.category,
    type: tx.type,
    date: tx.date,
    account_id: tx.accountId || null,
    to_account_id: tx.toAccountId || null,
    user_id: userId
  };

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.id);

  if (isUUID) {
    const { data, error } = await supabase.from('transactions').update(payload).eq('id', tx.id).select();
    if (error) {
      console.error('Error updating transaction in Supabase:', error.message);
      return null;
    }
    return data?.[0];
  } else {
    const { data, error } = await supabase.from('transactions').insert(payload).select();
    if (error) {
      console.error('Error inserting transaction in Supabase:', error.message);
      return null;
    }
    return data?.[0];
  }
};

/**
 * Sincronización de Negocios (Fincas, comercio, etc.)
 */
export const syncBusiness = async (biz, userId) => {
  const payload = {
    id: String(biz.id),
    name: biz.name,
    type: biz.type,
    quick_actions: biz.quickActions || [],
    user_id: userId
  };
  const { data, error } = await supabase.from('businesses').upsert(payload).select();
  if (error) console.error('Error syncing business with Supabase:', error.message);
  return data?.[0];
};

export const deleteBusinessFromSupabase = async (bizId) => {
  await Promise.all([
    supabase.from('businesses').delete().eq('id', String(bizId)),
    supabase.from('business_transactions').delete().eq('business_id', String(bizId)),
    supabase.from('business_workers').delete().eq('business_id', String(bizId))
  ]);
};

/**
 * Sincronización de Movimientos de Negocio
 */
export const syncBusinessTransaction = async (btx, userId) => {
  const payload = {
    id: String(btx.id),
    business_id: String(btx.businessId),
    description: btx.description,
    amount: btx.amount,
    type: btx.type,
    date: btx.date,
    user_id: userId
  };
  const { data, error } = await supabase.from('business_transactions').upsert(payload).select();
  if (error) console.error('Error syncing business transaction:', error.message);
  return data?.[0];
};

export const deleteBusinessTxFromSupabase = async (id) => {
  await supabase.from('business_transactions').delete().eq('id', String(id));
};

/**
 * Sincronización de Trabajadores de Finca / Negocio
 */
export const syncBusinessWorker = async (worker, userId) => {
  const payload = {
    id: String(worker.id),
    business_id: String(worker.businessId),
    name: worker.name,
    type: worker.type,
    rate: worker.rate || 0,
    user_id: userId
  };
  const { data, error } = await supabase.from('business_workers').upsert(payload).select();
  if (error) console.error('Error syncing worker with Supabase:', error.message);
  return data?.[0];
};

export const deleteBusinessWorkerFromSupabase = async (id) => {
  await supabase.from('business_workers').delete().eq('id', String(id));
};

export const deleteFromSupabase = async (table, id) => {
  await supabase.from(table).delete().eq('id', id);
};
