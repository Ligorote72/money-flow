import React, { useState, useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import { Calendar, Plus, Trash2, Edit2, CreditCard } from 'lucide-react';

const SubscriptionsTab = ({ subscriptions = [], onAddSubscription, onDeleteSubscription, onUpdateSubscription }) => {
  const [parentList] = useAutoAnimate();
  const [editingSub, setEditingSub] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [accountId, setAccountId] = useState('bank');
  const [day, setDay] = useState('1');

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    const data = {
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      accountId,
      day: parseInt(day) || 1,
      lastProcessed: editingSub ? editingSub.lastProcessed : null
    };

    if (editingSub) {
      onUpdateSubscription(editingSub.id, data);
    } else {
      const newId = String(Date.now());
      onAddSubscription({ ...data, id: newId });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('entertainment');
    setAccountId('bank');
    setDay('1');
    setShowForm(false);
    setEditingSub(null);
  };

  const startEdit = (sub) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCategory(sub.category);
    setAccountId(sub.accountId);
    setDay(sub.day.toString());
    setShowForm(true);
    setMenuOpenId(null);
  };

  const confirmDelete = (id) => {
    if (window.confirm('¿Eliminar esta suscripción o gasto fijo?')) {
      onDeleteSubscription(id);
      setMenuOpenId(null);
    }
  };

  const totalMonthlyCommitment = useMemo(() => {
    return subscriptions.reduce((a, b) => a + (b.amount || 0), 0);
  }, [subscriptions]);

  return (
    <div className="animate-fade">
      {/* Resumen Mensual Comprometido */}
      <div 
        className="card" 
        style={{ 
          margin: '0 16px 16px', padding: '18px 20px', 
          background: 'linear-gradient(135deg, rgba(0,122,255,0.12) 0%, rgba(0,0,0,0.3) 100%)', 
          border: '1px solid rgba(0,122,255,0.25)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
            Compromiso Mensual Fijo
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#007aff', margin: '2px 0 0' }}>
            {formatCurrency(totalMonthlyCommitment)}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary" 
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          + Agregar Fijo
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingSub ? 'Editar' : 'Nueva'} Suscripción / Gasto Fijo</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <input type="text" placeholder="Nombre (Ej: Netflix, Internet, Arriendo...)" value={name} onChange={e => setName(e.target.value)} required />
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  Costo Mensual
                  {amount && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatCurrency(parseFloat(amount))}</span>}
                </label>
                <input type="text" inputMode="numeric" placeholder="$ 0" 
                  value={formatInputAmount(amount)} 
                  onChange={e => setAmount(parseInputAmount(e.target.value))} 
                  required 
                  style={{ fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Día de cobro o corte (1 al 31)</label>
                <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} required />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Categoría</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {CATEGORIES.filter(c => !['salary','freelance','savings'].includes(c.id)).slice(0, 6).map(cat => (
                    <button
                      key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '10px 4px', borderRadius: '12px', border: '1px solid',
                        background: category === cat.id ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(255,255,255,0.04)',
                        borderColor: category === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                        color: category === cat.id ? 'var(--primary)' : 'white',
                        fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', marginTop: '22px' }}>
                {editingSub ? 'Guardar Cambios' : 'Registrar Gasto Fijo 💳'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Suscripciones */}
      <div ref={parentList} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
        {subscriptions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '36px 0', fontSize: '0.85rem' }}>
            No tienes suscripciones o gastos fijos registrados.
          </p>
        ) : (
          subscriptions.map(sub => {
            const cat = getCategoryById(sub.category);
            const today = new Date().getDate();
            const daysLeft = sub.day >= today ? (sub.day - today) : (30 - today + sub.day);

            return (
              <div 
                key={sub.id} 
                className="card" 
                style={{ 
                  margin: 0, padding: '14px 16px', borderRadius: '18px', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '14px', 
                    background: `${cat.color}15`, border: `1px solid ${cat.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' 
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '0.94rem' }}>{sub.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '6px' }}>
                        Día {sub.day} de cada mes
                      </span>
                      <span style={{ fontSize: '0.68rem', color: daysLeft <= 3 ? '#ff9500' : 'var(--text-muted)', fontWeight: '600' }}>
                        {daysLeft === 0 ? '¡Cobra hoy!' : `en ${daysLeft} días`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ color: 'var(--expense)', fontWeight: '900', fontSize: '1.05rem' }}>
                    -{formatCurrency(sub.amount)}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => startEdit(sub)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => confirmDelete(sub.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.4)', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubscriptionsTab;
