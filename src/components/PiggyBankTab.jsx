import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const PiggyBankTab = ({ piggyBanks, onAddPiggy, onAddFunds, onDeletePiggy, onUpdatePiggy, availableBalance }) => {
  const [editingPiggy, setEditingPiggy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fundingId, setFundingId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [icon, setIcon] = useState('🚗');

  const icons = ['🚗', '🏠', '🏖️', '📱', '🎓', '🎁', '🚲', '👟', '💍', '🎮', '✈️', '💻', '🍕', '🎉'];

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!name || !goal) return;

    if (editingPiggy) {
      onUpdatePiggy(editingPiggy.id, { name, goal: parseFloat(goal), icon });
      setEditingPiggy(null);
    } else {
      onAddPiggy({
        id: Date.now().toString(),
        name,
        goal: parseFloat(goal),
        icon,
        saved: 0
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setGoal('');
    setIcon('🚗');
    setShowForm(false);
    setEditingPiggy(null);
  };

  const startEdit = (p) => {
    setEditingPiggy(p);
    setName(p.name);
    setGoal(p.goal.toString());
    setIcon(p.icon);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const handleFund = (id) => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0 || amt > availableBalance) return;
    onAddFunds(id, amt);
    setFundingId(null);
    setFundAmount('');
  };

  const confirmDelete = (id) => {
    if (window.confirm('¿Eliminar este cochinito? No se perderán tus transacciones anteriores, pero el cochinito desaparecerá.')) {
      onDeletePiggy(id);
      setMenuOpenId(null);
    }
  };

  const totalSaved = piggyBanks.reduce((a, b) => a + (b.saved || 0), 0);

  return (
    <div className="animate-fade">
      {totalSaved > 0 && (
        <div className="card" style={{ margin: '0 16px 20px', padding: '16px', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Ahorro Total</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(totalSaved)}</span>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingPiggy ? 'Editar' : 'Nuevo'} Cochinito</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <input type="text" placeholder="¿Para qué ahorramos?" value={name} onChange={e => setName(e.target.value)} required />
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  Meta de ahorro
                  {goal && <span style={{ color: 'var(--primary)' }}>{formatCurrency(parseFloat(goal))}</span>}
                </label>
                <input type="text" inputMode="numeric" placeholder="Monto meta" 
                  value={formatInputAmount(goal)} 
                  onChange={e => setGoal(parseInputAmount(e.target.value))} 
                  required />
              </div>

              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '12px' }}>Icono</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {icons.map(i => (
                    <button
                      key={i} type="button" onClick={() => setIcon(i)}
                      style={{
                        height: '40px', borderRadius: '10px', fontSize: '1.2rem',
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

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>
                {editingPiggy ? 'Guardar Cambios' : 'Crear Cochinito'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="varios-grid">
        {piggyBanks.map(piggy => {
          const progress = (piggy.saved / piggy.goal) * 100;
          const isFunding = fundingId === piggy.id;

          return (
            <div key={piggy.id} className="menu-item" style={{ '--item-color': 'rgba(255,255,255,0.05)', position: 'relative', height: 'auto', minHeight: '180px', padding: '16px' }} 
              onClick={(e) => { if (!isFunding) setFundingId(piggy.id); }}>
              
              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === piggy.id ? null : piggy.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                >⋮</button>
                {menuOpenId === piggy.id && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: '30px', padding: '4px', minWidth: '100px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(piggy); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(piggy.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️ Borrar</button>
                  </div>
                )}
              </div>

              <div className="icon" style={{ fontSize: '2rem', marginBottom: '8px' }}>{piggy.icon}</div>
              <span className="label" style={{ textAlign: 'center', fontSize: '0.9rem' }}>{piggy.name}</span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '10px' }}>{formatCurrency(piggy.saved)} / {formatCurrency(piggy.goal)}</p>

              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: progress >= 100 ? 'var(--income)' : 'var(--primary)', transition: 'width 0.3s' }} />
              </div>

              {isFunding && (
                <div className="animate-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '12px', zIndex: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Meter saldo</span>
                    <button onClick={(e) => { e.stopPropagation(); setFundingId(null); setFundAmount(''); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}>×</button>
                  </div>
                  <input 
                    type="text" inputMode="numeric" placeholder="Monto" autoFocus
                    style={{ fontSize: '0.8rem', padding: '8px', marginBottom: '8px' }}
                    value={formatInputAmount(fundAmount)} 
                    onChange={e => setFundAmount(parseInputAmount(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleFund(piggy.id); }}
                    disabled={!fundAmount || parseFloat(fundAmount) <= 0 || parseFloat(fundAmount) > availableBalance}
                    style={{ background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '8px', padding: '6px', fontWeight: '700', fontSize: '0.75rem' }}
                  >Confirmar</button>
                </div>
              )}
            </div>
          );
        })}

        <button className="menu-item" onClick={() => setShowForm(true)} style={{ '--item-color': 'rgba(255,255,255,0.03)', borderStyle: 'dashed', minHeight: '180px' }}>
          <div className="icon" style={{ background: 'none', border: '2px dashed var(--glass-border)', fontSize: '1.5rem', opacity: 0.5 }}>+</div>
          <span className="label" style={{ opacity: 0.5 }}>Nuevo</span>
        </button>
      </div>

      {piggyBanks.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No tienes cochinitos aún. Crea uno para empezar a ahorrar.</p>
      )}
    </div>
  );
};

export default PiggyBankTab;
