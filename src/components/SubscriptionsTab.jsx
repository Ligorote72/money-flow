import React, { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const SubscriptionsTab = ({ subscriptions, onAddSubscription, onDeleteSubscription, onUpdateSubscription, accounts }) => {
  const [editingSub, setEditingSub] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [accountId, setAccountId] = useState('bank');
  const [day, setDay] = useState('1');

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const data = {
      name,
      amount: parseFloat(amount),
      category,
      accountId,
      day: parseInt(day),
      lastProcessed: editingSub ? editingSub.lastProcessed : null
    };

    if (editingSub) {
      onUpdateSubscription(editingSub.id, data);
    } else {
      onAddSubscription({ ...data, id: Date.now().toString() });
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
    if (window.confirm('¿Eliminar esta suscripción?')) {
      onDeleteSubscription(id);
      setMenuOpenId(null);
    }
  };

  return (
    <div className="animate-fade">
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingSub ? 'Editar' : 'Nueva'} Suscripción</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <input type="text" placeholder="Nombre (Netflix, Gym...)" value={name} onChange={e => setName(e.target.value)} required />
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  Monto mensual
                  {amount && <span style={{ color: 'var(--primary)' }}>{formatCurrency(parseFloat(amount))}</span>}
                </label>
                <input type="text" inputMode="numeric" placeholder="Monto" 
                  value={formatInputAmount(amount)} 
                  onChange={e => setAmount(parseInputAmount(e.target.value))} 
                  required />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Día de cobro (1-31)</label>
                <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} required />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Categoría</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {CATEGORIES.filter(c => c.id !== 'salary' && c.id !== 'freelance' && c.id !== 'savings').map(cat => (
                    <button
                      key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '8px', borderRadius: '8px', fontSize: '0.7rem',
                        border: `1px solid ${category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                        background: category === cat.id ? `${cat.color}22` : 'transparent',
                        color: category === cat.id ? cat.color : 'var(--text-dim)',
                        cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Cuenta de pago</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {accounts.map(acc => (
                    <button
                      key={acc.id} type="button" onClick={() => setAccountId(acc.id)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.75rem',
                        border: `1px solid ${accountId === acc.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                        background: accountId === acc.id ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                        color: accountId === acc.id ? 'var(--primary)' : 'var(--text-dim)',
                        cursor: 'pointer'
                      }}
                    >
                      {acc.icon} {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>
                {editingSub ? 'Guardar Cambios' : 'Crear Suscripción'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="varios-grid">
        {subscriptions.map(sub => {
          const cat = CATEGORIES.find(c => c.id === sub.category);
          return (
            <div key={sub.id} className="menu-item" style={{ '--item-color': 'rgba(255,255,255,0.05)', position: 'relative', height: 'auto', minHeight: '160px', padding: '16px' }}>
              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === sub.id ? null : sub.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                >⋮</button>
                {menuOpenId === sub.id && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: '30px', padding: '4px', minWidth: '100px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(sub); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(sub.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️ Borrar</button>
                  </div>
                )}
              </div>

              <div className="icon" style={{ background: `${cat?.color || '#eee'}1a`, color: cat?.color || 'white', fontSize: '1.8rem', marginBottom: '8px' }}>{cat?.icon || '💳'}</div>
              <span className="label" style={{ textAlign: 'center', fontSize: '0.9rem' }}>{sub.name}</span>
              <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--expense)', margin: '4px 0' }}>-{formatCurrency(sub.amount)}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Día {sub.day}</p>
            </div>
          );
        })}

        <button className="menu-item" onClick={() => setShowForm(true)} style={{ '--item-color': 'rgba(255,255,255,0.03)', borderStyle: 'dashed', minHeight: '160px' }}>
          <div className="icon" style={{ background: 'none', border: '2px dashed var(--glass-border)', fontSize: '1.5rem', opacity: 0.5 }}>+</div>
          <span className="label" style={{ opacity: 0.5 }}>Nueva</span>
        </button>
      </div>

      {subscriptions.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No tienes gastos fijos aún.</p>
      )}
    </div>
  );
};

export default SubscriptionsTab;
