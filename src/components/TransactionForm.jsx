import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const INCOME_CATEGORIES  = CATEGORIES.filter(c => ['salary','freelance','other_income','savings'].includes(c.id));
const EXPENSE_CATEGORIES = CATEGORIES.filter(c => !['salary','freelance','other_income'].includes(c.id));

const TransactionForm = ({ onAddTransaction, editingData = null, onCancelEdit = null, accounts = [], banks = [] }) => {
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [type,        setType]        = useState('expense');
  const [category,    setCategory]    = useState('other_expense');
  const [accountId,   setAccountId]   = useState('cash');
  const [bankId,      setBankId]      = useState('general');
  const [toAccountId, setToAccountId] = useState('bank');
  const [toBankId,    setToBankId]    = useState('general');

  // Sincronizar con datos de edición si llegan
  useEffect(() => {
    if (editingData) {
      setDescription(editingData.description || '');
      setAmount(editingData.amount.toString() || '');
      setType(editingData.type || 'expense');
      setCategory(editingData.category || 'other_expense');
      setAccountId(editingData.accountId?.startsWith('bank_') || editingData.accountId === 'general' ? 'bank' : editingData.accountId || 'cash');
      if (editingData.accountId?.startsWith('bank_') || editingData.accountId === 'general') {
        setBankId(editingData.accountId);
      }
      if (editingData.type === 'transfer') {
        setToAccountId(editingData.toAccountId?.startsWith('bank_') || editingData.toAccountId === 'general' ? 'bank' : editingData.toAccountId || 'bank');
        if (editingData.toAccountId?.startsWith('bank_') || editingData.toAccountId === 'general') {
          setToBankId(editingData.toAccountId);
        }
      }
    } else {
      resetForm();
    }
  }, [editingData]);

  const categoryList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType !== 'transfer') {
      setCategory(newType === 'income' ? 'other_income' : 'other_expense');
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('other_expense');
    setAccountId('cash');
    setBankId('general');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const selectedLabel = CATEGORIES.find(c => c.id === category)?.label || 'Movimiento';
    
    onAddTransaction({
      id: editingData ? editingData.id : Date.now(),
      description: description.trim() || (type === 'transfer' ? 'Transferencia' : selectedLabel),
      amount: parseFloat(amount),
      type,
      category: type === 'transfer' ? 'transfer' : category,
      accountId: accountId === 'bank' ? bankId : accountId,
      toAccountId: type === 'transfer' ? (toAccountId === 'bank' ? toBankId : toAccountId) : null,
      date: editingData ? editingData.date : new Date().toISOString()
    });

    if (!editingData) resetForm();
  };

  return (
    <div className="card animate-fade" style={{ marginTop: '0' }}>
      <h3 style={{ marginBottom: '16px' }}>
        {editingData ? '📝 Editar Transacción' : '✨ Nueva Transacción'}
      </h3>

      {/* Toggle tipo */}
      <div style={{
        display: 'flex', gap: '8px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '14px', padding: '4px', marginBottom: '16px'
      }}>
        {['expense','income','transfer'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
              transition: 'all 0.2s ease',
              background: type === t
                ? (t === 'income' ? 'rgba(52,199,89,0.22)' : t === 'expense' ? 'rgba(255,59,48,0.22)' : 'rgba(0,122,255,0.22)')
                : 'transparent',
              color: type === t
                ? (t === 'income' ? 'var(--income)' : t === 'expense' ? 'var(--expense)' : 'var(--primary)')
                : 'var(--text-dim)',
            }}
          >
            {t === 'income' ? '↑ Ingreso' : t === 'expense' ? '↓ Gasto' : '🔄 Traspaso'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Descripción <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>(opcional)</span></label>
          <input
            type="text"
            placeholder="Ej: Almuerzo, Salario..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
            Monto 
            {amount && <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatCurrency(parseFloat(amount))}</span>}
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="$ 0"
            value={formatInputAmount(amount)}
            onChange={(e) => setAmount(parseInputAmount(e.target.value))}
            required
            style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.02em' }}
          />
        </div>

        {type !== 'transfer' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
              Categoría
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categoryList.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    if (cat.id === 'savings') setAccountId('savings');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                    background: category === cat.id ? `${cat.color}22` : 'transparent',
                    color: category === cat.id ? cat.color : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: category === cat.id ? '600' : '400',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
            {type === 'transfer' ? 'Cuenta Origen' : 'Cuenta / Bolsillo'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {accounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccountId(acc.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${accountId === acc.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                  background: accountId === acc.id ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                  color: accountId === acc.id ? 'var(--primary)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: accountId === acc.id ? '600' : '400',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                {acc.icon} {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Destino - SOLO PARA TRANSFERENCIAS */}
        {type === 'transfer' && (
          <div className="animate-fade">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                Cuenta Destino
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {accounts.filter(a => a.id !== 'savings').map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setToAccountId(acc.id)}
                    style={{
                      padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem',
                      border: `1px solid ${toAccountId === acc.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                      background: toAccountId === acc.id ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                      color: toAccountId === acc.id ? 'var(--primary)' : 'var(--text-dim)',
                      cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: toAccountId === acc.id ? '600' : '400'
                    }}
                  >
                    {acc.icon} {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {toAccountId === 'bank' && banks && banks.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '14px', borderRadius: '14px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Banco Destino</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {banks.map(b => (
                    <button key={b.id} type="button" onClick={() => setToBankId(b.id)}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                        background: toBankId === b.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: toBankId === b.id ? 'black' : 'var(--text-dim)', fontWeight: toBankId === b.id ? '700' : '400'
                      }}
                    >{b.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          {editingData && (
            <button type="button" onClick={onCancelEdit} style={{
              flex: 1, padding: '12px', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer'
            }}>Cancelar</button>
          )}
          <button type="submit" className="btn-primary" style={{ flex: editingData ? 2 : 1 }}>
            {editingData ? 'Actualizar Cambios' : `Guardar ${type === 'income' ? 'Ingreso' : 'Gasto'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
