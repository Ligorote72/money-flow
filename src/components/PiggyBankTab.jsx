import React, { useState } from 'react';
import { formatCurrency } from '../utils/helpers';

const PiggyBankTab = ({ piggyBanks, onAddPiggy, onAddFunds, onDeletePiggy, availableBalance }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [icon, setIcon] = useState('🚗');
  const [showForm, setShowForm] = useState(false);
  const [fundingId, setFundingId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  const icons = ['🚗', '🏠', '🏖️', '📱', '🎓', '🎁', '🚲', '👟', '💍', '🎮'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !goal) return;

    onAddPiggy({
      id: Date.now(),
      name,
      goal: parseFloat(goal),
      icon,
      saved: 0
    });

    setName('');
    setGoal('');
    setShowForm(false);
  };

  const handleFund = (id) => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0 || amt > availableBalance) return;
    onAddFunds(id, amt);
    setFundingId(null);
    setFundAmount('');
  };

  const totalSaved = piggyBanks.reduce((a, b) => a + (b.saved || 0), 0);

  return (
    <div className="animate-fade">
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Mis Cochinitos 🐷</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            background: showForm ? 'rgba(255,59,48,0.1)' : 'rgba(var(--primary-rgb), 0.15)',
            color: showForm ? 'var(--expense)' : 'var(--primary)',
            border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {showForm ? 'Cerrar' : '+ Cochinito'}
        </button>
      </div>

      {totalSaved > 0 && (
        <div className="card animate-fade" style={{ margin: '0 16px 20px', padding: '16px', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Total Ahorrado en Cochinitos</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(totalSaved)}</span>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ margin: '0 16px 20px' }}>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="¿Para qué ahorramos? (Ej: Viaje)" value={name} onChange={e => setName(e.target.value)} required />
            
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                Meta de ahorro
                {goal && <span style={{ color: 'var(--primary)' }}>{formatCurrency(parseFloat(goal))}</span>}
              </label>
              <input type="number" placeholder="¿Cuánto necesitas?" value={goal} onChange={e => setGoal(e.target.value)} required />
            </div>

            <div style={{ marginTop: '16px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Elegir Icono</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {icons.map(i => (
                  <button
                    key={i} type="button" onClick={() => setIcon(i)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px', fontSize: '1.2rem',
                      background: icon === i ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                      border: icon === i ? '1px solid var(--primary)' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Crear Cochinito</button>
          </form>
        </div>
      )}

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {piggyBanks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', opacity: 0.6 }}>
            <p>Empieza a ahorrar creando tu primer cochinito.</p>
          </div>
        ) : (
          piggyBanks.map(piggy => {
            const progress = (piggy.saved / piggy.goal) * 100;
            const isFunding = fundingId === piggy.id;

            return (
              <div key={piggy.id} className="card" style={{ margin: 0, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.8rem' }}>{piggy.icon}</div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '1rem' }}>{piggy.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {formatCurrency(piggy.saved)} de {formatCurrency(piggy.goal)}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeletePiggy(piggy.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', cursor: 'pointer', fontSize: '1.2rem' }}
                  >×</button>
                </div>

                {/* Barra de progreso */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ 
                    height: '100%', width: `${Math.min(progress, 100)}%`, 
                    background: progress >= 100 ? 'var(--income)' : 'var(--primary)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                {!isFunding ? (
                  <button 
                    onClick={() => setFundingId(piggy.id)}
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(var(--primary-rgb), 0.3)',
                      background: 'rgba(var(--primary-rgb), 0.05)', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    💰 Meter platica
                  </button>
                ) : (
                  <div className="animate-fade" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      ¿Cuánto vas a meter? (Saldo diponible: {formatCurrency(availableBalance)})
                      {fundAmount && <span style={{ color: 'var(--primary)' }}>{formatCurrency(parseFloat(fundAmount))}</span>}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} 
                        placeholder="Monto" style={{ margin: 0, padding: '8px 12px' }} autoFocus
                      />
                      <button 
                        onClick={() => handleFund(piggy.id)}
                        disabled={!fundAmount || parseFloat(fundAmount) <= 0 || parseFloat(fundAmount) > availableBalance}
                        style={{ 
                          padding: '0 16px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'black', fontWeight: '700', cursor: 'pointer'
                        }}
                      >OK</button>
                      <button 
                        onClick={() => setFundingId(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >‹</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PiggyBankTab;
