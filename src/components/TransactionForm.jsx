import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Landmark, Wallet, Check, X } from 'lucide-react';

const INCOME_CATEGORIES  = CATEGORIES.filter(c => ['salary','freelance','other_income','savings'].includes(c.id));
const EXPENSE_CATEGORIES = CATEGORIES.filter(c => !['salary','freelance','other_income'].includes(c.id));

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const TYPE_CONFIG = {
  expense: {
    id: 'expense',
    label: 'Gasto',
    submitLabel: 'Registrar Gasto',
    color: '#ff3b30',
    bg: 'rgba(255, 59, 48, 0.12)',
    border: 'rgba(255, 59, 48, 0.4)',
    glow: 'rgba(255, 59, 48, 0.22)',
    icon: <ArrowUpRight size={17} strokeWidth={2.5} />
  },
  income: {
    id: 'income',
    label: 'Ingreso',
    submitLabel: 'Registrar Ingreso',
    color: '#34c759',
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.4)',
    glow: 'rgba(52, 199, 89, 0.22)',
    icon: <ArrowDownLeft size={17} strokeWidth={2.5} />
  },
  transfer: {
    id: 'transfer',
    label: 'Traspaso',
    submitLabel: 'Registrar Traspaso',
    color: '#007aff',
    bg: 'rgba(0, 122, 255, 0.12)',
    border: 'rgba(0, 122, 255, 0.4)',
    glow: 'rgba(0, 122, 255, 0.22)',
    icon: <ArrowLeftRight size={17} strokeWidth={2.5} />
  }
};

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

  const currentTheme = TYPE_CONFIG[type] || TYPE_CONFIG.expense;
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
    <form onSubmit={handleSubmit} className="transaction-form animate-fade" style={{ paddingTop: '16px' }}>
      {/* Selector de Tipo (Gasto | Ingreso | Traspaso) Segmented Pills */}
      <div style={{
        display: 'flex', gap: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px', padding: '4px', marginBottom: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {Object.values(TYPE_CONFIG).map(t => {
          const isActive = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: '12px',
                cursor: 'pointer', fontWeight: isActive ? '800' : '600', fontSize: '0.84rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                background: isActive ? t.color : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-dim)',
                border: 'none',
                boxShadow: isActive ? `0 4px 14px ${t.glow}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Input Monto Principal - Caja Hero en color activo */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1.5px solid ${currentTheme.border}`,
          boxShadow: `0 0 20px ${currentTheme.glow}`,
          borderRadius: '20px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-dim)', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            marginBottom: '2px' 
          }}>
            Monto
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="$ 0"
              value={formatInputAmount(amount)}
              onChange={(e) => setAmount(parseInputAmount(e.target.value))}
              required
              style={{ 
                fontSize: '2.2rem', 
                fontWeight: '900', 
                color: currentTheme.color, 
                letterSpacing: '-0.03em', 
                textAlign: 'center', 
                padding: '2px 28px',
                margin: 0,
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                width: '100%',
                outline: 'none',
                caretColor: currentTheme.color
              }}
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount('')}
                title="Borrar monto"
                style={{
                  position: 'absolute', right: '0px',
                  background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-dim)',
                  borderRadius: '50%', width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '12px'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input Descripción */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
          Concepto / Nota <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '400' }}>(opcional)</span>
        </label>
        <input
          type="text"
          placeholder={type === 'income' ? 'Ej: Salario quincena, Venta café...' : (type === 'transfer' ? 'Ej: Para ahorros, Nequi a Banco...' : 'Ej: Almuerzo, Mercado, Combustible...')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ borderRadius: '14px', padding: '11px 14px' }}
        />
      </div>

      {/* Selector de Categorías (para Ingreso o Gasto) */}
      {type !== 'transfer' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
            Categoría
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '7px',
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
                    padding: '8px 3px', borderRadius: '14px',
                    background: isSelected ? `${cat.color}22` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? cat.color : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected ? `0 0 14px ${cat.color}33` : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{ 
                    fontSize: '0.66rem', fontWeight: isSelected ? '800' : '500', 
                    color: isSelected ? '#ffffff' : 'var(--text-dim)',
                    textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '92%' 
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
        <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
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
                  padding: '10px 6px', borderRadius: '13px',
                  background: isSelected ? `${currentTheme.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isSelected ? currentTheme.color : 'rgba(255,255,255,0.06)'}`,
                  color: isSelected ? 'white' : 'var(--text-dim)',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '0.8rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{acc.icon}</span>
                {acc.label}
              </button>
            );
          })}
        </div>

        {/* Sub-selector de Banco específico si la cuenta es Banco */}
        {accountId === 'bank' && banks && banks.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <select value={bankId} onChange={e => setBankId(e.target.value)} style={{ borderRadius: '12px', padding: '8px 12px' }}>
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cuenta Destino (Solo si es Traspaso) */}
      {type === 'transfer' && (
        <div style={{ marginBottom: '16px' }} className="animate-fade">
          <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
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
                    padding: '10px 6px', borderRadius: '13px',
                    background: isSelected ? 'rgba(0, 122, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? '#007aff' : 'rgba(255,255,255,0.06)'}`,
                    color: isSelected ? 'white' : 'var(--text-dim)',
                    fontWeight: isSelected ? '800' : '600',
                    fontSize: '0.8rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.05rem' }}>{acc.icon}</span>
                  {acc.label}
                </button>
              );
            })}
          </div>

          {toAccountId === 'bank' && banks && banks.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <select value={toBankId} onChange={e => setToBankId(e.target.value)} style={{ borderRadius: '12px', padding: '8px 12px' }}>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Fecha y Hora (Compacta) */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Calendar size={13} color="var(--primary)" /> Fecha y Hora
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontSize: '0.86rem', borderRadius: '12px', padding: '8px 12px' }}
        />
      </div>

      {/* Botones de acción principales */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingBottom: '16px' }}>
        {onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn-secondary"
            style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: '700' }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          style={{
            flex: 2, padding: '14px', borderRadius: '14px',
            backgroundColor: currentTheme.color,
            color: '#ffffff',
            border: 'none',
            fontWeight: '850',
            fontSize: '0.96rem',
            boxShadow: `0 8px 24px ${currentTheme.glow}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'transform 0.15s ease'
          }}
          onPointerDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Check size={18} strokeWidth={3} />
          {editingData ? 'Guardar Cambios' : currentTheme.submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
