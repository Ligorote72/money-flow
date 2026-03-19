import React, { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const SubscriptionsTab = ({ subscriptions, onAddSubscription, onDeleteSubscription, accounts }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [accountId, setAccountId] = useState('bank');
  const [day, setDay] = useState('1');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAddSubscription({
      id: Date.now(),
      name,
      amount: parseFloat(amount),
      category,
      accountId,
      day: parseInt(day),
      lastProcessed: null // Para saber si se registró este mes
    });

    setName('');
    setAmount('');
    setShowForm(false);
  };

  return (
    <div className="animate-fade">
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Deducciones Automáticas</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            background: showForm ? 'rgba(255,59,48,0.1)' : 'rgba(var(--primary-rgb), 0.15)',
            color: showForm ? 'var(--expense)' : 'var(--primary)',
            border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {showForm ? 'Cerrar' : '+ Suscripción'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ margin: '0 16px 20px' }}>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Nombre (Ej: Netflix, Gym...)" value={name} onChange={e => setName(e.target.value)} required />
            
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                Monto
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIES.filter(c => c.id !== 'salary' && c.id !== 'freelance').map(cat => (
                  <button
                    key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem',
                      border: `1px solid ${category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                      background: category === cat.id ? `${cat.color}22` : 'transparent',
                      color: category === cat.id ? cat.color : 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Pagar con</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {accounts.map(acc => (
                  <button
                    key={acc.id} type="button" onClick={() => setAccountId(acc.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.75rem',
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

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Guardar Suscripción</button>
          </form>
        </div>
      )}

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', opacity: 0.6 }}>
            <p>No tienes gastos fijos registrados.</p>
          </div>
        ) : (
          subscriptions.map(sub => {
            const cat = CATEGORIES.find(c => c.id === sub.category);
            const acc = accounts.find(a => a.id === sub.accountId);
            return (
              <div key={sub.id} className="card" style={{ margin: 0, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${cat?.color || '#eee'}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    {cat?.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{sub.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Día {sub.day} · via {acc?.label}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--expense)' }}>
                    -{formatCurrency(sub.amount)}
                  </span>
                  <button onClick={() => onDeleteSubscription(sub.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.4)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
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
