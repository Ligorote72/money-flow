import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Landmark, Wallet, Check } from 'lucide-react';

const INCOME_CATEGORIES  = CATEGORIES.filter(c => ['salary','freelance','other_income','savings'].includes(c.id));
const EXPENSE_CATEGORIES = CATEGORIES.filter(c => !['salary','freelance','other_income'].includes(c.id));

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const TransactionForm = ({ onAddTransaction, editingData = null, onCancelEdit = null, banks = [] }) => {
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [type,        setType]        = useState('expense');
  const [category,    setCategory]    = useState('other_expense');
  const [accountId,   setAccountId]   = useState('cash');
  const [bankId,      setBankId]      = useState('general');
  const [toAccountId, setToAccountId] = useState('bank');
  const [toBankId,    setToBankId]    = useState('general');
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 16));

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('food');
    setAccountId('cash');
    setBankId('general');
    setDate(new Date().toISOString().slice(0, 16));
  };

  useEffect(() => {
    if (editingData) {
      setDescription(editingData.description || '');
      setAmount(editingData.amount ? editingData.amount.toString() : '');
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
      if (editingData.date) {
        try {
          const d = new Date(editingData.date);
          setDate(d.toISOString().slice(0, 16));
        } catch {
          setDate(new Date().toISOString().slice(0, 16));
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
      setCategory(newType === 'income' ? 'salary' : 'food');
    }
  };

  const handleQuickAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    const next = current + addVal;
    setAmount(next.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const selectedLabel = CATEGORIES.find(c => c.id === category)?.label || 'Movimiento';
    
    onAddTransaction({
      id: editingData ? editingData.id : Date.now(),
      description: description.trim() || (type === 'transfer' ? 'Transferencia' : selectedLabel),
      amount: parseFloat(amount),
      type,
      category: type === 'transfer' ? 'transfer' : category,
      accountId: accountId === 'bank' ? bankId : accountId,
      toAccountId: type === 'transfer' ? (toAccountId === 'bank' ? toBankId : toAccountId) : null,
      date: date ? new Date(date).toISOString() : new Date().toISOString()
    });

    if (!editingData) resetForm();
  };

  return (
    <div className="card animate-fade" style={{ margin: 0, padding: '20px', borderRadius: '24px' }}>
      {/* Selector de Tipo (Gasto | Ingreso | Traspaso) */}
      <div style={{
        display: 'flex', gap: '6px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px', padding: '4px', marginBottom: '20px'
      }}>
        {[
          { id: 'expense', label: 'Gasto', icon: <ArrowUpRight size={16} />, color: 'var(--expense)' },
          { id: 'income', label: 'Ingreso', icon: <ArrowDownLeft size={16} />, color: 'var(--income)' },
          { id: 'transfer', label: 'Traspaso', icon: <ArrowLeftRight size={16} />, color: '#007aff' }
        ].map(t => {
          const isActive = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                background: isActive ? `${t.color}25` : 'transparent',
                color: isActive ? t.color : 'var(--text-dim)',
                border: isActive ? `1px solid ${t.color}50` : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Input Monto Principal */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
            Monto a registrar
            {amount && parseFloat(amount) > 0 && (
              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                {formatCurrency(parseFloat(amount))}
              </span>
            )}
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="$ 0"
            value={formatInputAmount(amount)}
            onChange={(e) => setAmount(parseInputAmount(e.target.value))}
            required
            autoFocus
            style={{ 
              fontSize: '1.8rem', fontWeight: '800', 
              color: type === 'income' ? 'var(--income)' : (type === 'expense' ? 'var(--expense)' : 'white'), 
              letterSpacing: '-0.02em', textAlign: 'center', padding: '18px 14px' 
            }}
          />
        </div>

        {/* Chips de monto rápido */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '18px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAddAmount(amt)}
              style={{
                padding: '6px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-dim)',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              +{formatCurrency(amt)}
            </button>
          ))}
        </div>

        {/* Input Descripción */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600' }}>
            Concepto / Descripción <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(opcional)</span>
          </label>
          <input
            type="text"
            placeholder={type === 'income' ? 'Ej: Salario quincena, Venta café...' : 'Ej: Almuerzo, Mercado, Combustible...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Selector de Categorías (para Ingreso o Gasto) */}
        {type !== 'transfer' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Categoría
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '2px'
            }}>
              {categoryList.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      padding: '10px 4px', borderRadius: '14px', border: '1px solid',
                      background: isSelected ? `${cat.color}25` : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.07)',
                      cursor: 'pointer', transition: 'all 0.18s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                    <span style={{ 
                      fontSize: '0.68rem', fontWeight: isSelected ? '700' : '500', 
                      color: isSelected ? 'white' : 'var(--text-dim)',
                      textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' 
                    }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cuenta Origen */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            {type === 'transfer' ? 'Desde (Cuenta Origen)' : 'Cuenta / Método'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'cash', label: 'Efectivo', icon: '💵' },
              { id: 'bank', label: 'Banco', icon: '🏛️' },
              { id: 'savings', label: 'Ahorro', icon: '🐷' }
            ].map(acc => {
              const isSelected = accountId === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccountId(acc.id)}
                  style={{
                    padding: '10px', borderRadius: '12px', border: '1px solid',
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? 'white' : 'var(--text-dim)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.82rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <span>{acc.icon}</span>
                  {acc.label}
                </button>
              );
            })}
          </div>

          {/* Sub-selector de Banco específico si la cuenta es Banco */}
          {accountId === 'bank' && banks && banks.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <select value={bankId} onChange={e => setBankId(e.target.value)}>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cuenta Destino (Solo si es Traspaso) */}
        {type === 'transfer' && (
          <div style={{ marginBottom: '18px' }} className="animate-fade">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              Hacia (Cuenta Destino)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'cash', label: 'Efectivo', icon: '💵' },
                { id: 'bank', label: 'Banco', icon: '🏛️' },
                { id: 'savings', label: 'Ahorro', icon: '🐷' }
              ].map(acc => {
                const isSelected = toAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setToAccountId(acc.id)}
                    style={{
                      padding: '10px', borderRadius: '12px', border: '1px solid',
                      background: isSelected ? 'rgba(0, 122, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? '#007aff' : 'rgba(255,255,255,0.08)',
                      color: isSelected ? 'white' : 'var(--text-dim)',
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: '0.82rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <span>{acc.icon}</span>
                    {acc.label}
                  </button>
                );
              })}
            </div>

            {toAccountId === 'bank' && banks && banks.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <select value={toBankId} onChange={e => setToBankId(e.target.value)}>
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Fecha y Hora */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Fecha del movimiento
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn-secondary"
              style={{ flex: 1, padding: '16px' }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 2, padding: '16px', fontSize: '1rem' }}
          >
            {editingData ? 'Guardar Cambios' : 'Confirmar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
