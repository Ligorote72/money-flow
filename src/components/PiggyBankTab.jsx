import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import confetti from 'canvas-confetti';
import { Sparkles, Plus, Trash2, Edit2, PiggyBank as PiggyIcon } from 'lucide-react';

const PiggyBankTab = ({ piggyBanks = [], onAddPiggy, onAddFunds, onDeletePiggy, onUpdatePiggy, availableBalance = 0 }) => {
  const [parentGrid] = useAutoAnimate();
  const [editingPiggy, setEditingPiggy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fundingId, setFundingId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [icon, setIcon] = useState('🚗');

  const icons = ['🚗', '🏠', '🏖️', '📱', '🎓', '🎁', '🚲', '👟', '💍', '🎮', '✈️', '💻', '☕', '🌾', '🚜', '💰'];

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!name || !goal) return;

    if (editingPiggy) {
      onUpdatePiggy(editingPiggy.id, { name: name.trim(), goal: parseFloat(goal), icon });
      setEditingPiggy(null);
    } else {
      onAddPiggy({
        id: Date.now().toString(),
        name: name.trim(),
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

  const handleFund = (id, currentSaved, currentGoal) => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0 || amt > availableBalance) return;
    onAddFunds(id, amt);

    if (currentSaved + amt >= currentGoal) {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (err) {
        console.warn(err);
      }
    }

    setFundingId(null);
    setFundAmount('');
  };

  const confirmDelete = (id) => {
    if (window.confirm('¿Eliminar este cochinito de ahorro?')) {
      onDeletePiggy(id);
      setMenuOpenId(null);
    }
  };

  const totalSaved = piggyBanks.reduce((a, b) => a + (b.saved || 0), 0);
  const totalGoals = piggyBanks.reduce((a, b) => a + (b.goal || 0), 0);

  return (
    <div className="animate-fade">
      {/* Banner Resumen */}
      <div 
        className="card" 
        style={{ 
          margin: '0 16px 18px', padding: '18px 20px', 
          background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(0,0,0,0.3) 100%)', 
          border: '1px solid rgba(var(--primary-rgb), 0.25)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
            Ahorro Total en Cochinitos
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', margin: '2px 0 0' }}>
            {formatCurrency(totalSaved)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meta Conjunta</span>
          <p style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', margin: '2px 0 0' }}>
            {formatCurrency(totalGoals)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingPiggy ? 'Editar' : 'Nuevo'} Cochinito de Ahorro</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <input type="text" placeholder="¿Cuál es tu meta? (Ej: Moto, Viaje, Finca...)" value={name} onChange={e => setName(e.target.value)} required />
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  Meta de ahorro deseada
                  {goal && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatCurrency(parseFloat(goal))}</span>}
                </label>
                <input type="text" inputMode="numeric" placeholder="$ 0" 
                  value={formatInputAmount(goal)} 
                  onChange={e => setGoal(parseInputAmount(e.target.value))} 
                  required 
                  style={{ fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}
                />
              </div>

              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '10px' }}>Icono representativo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                  {icons.map(i => (
                    <button
                      key={i} type="button" onClick={() => setIcon(i)}
                      style={{
                        height: '40px', borderRadius: '12px', fontSize: '1.25rem',
                        background: icon === i ? 'rgba(var(--primary-rgb), 0.25)' : 'rgba(255,255,255,0.05)',
                        border: icon === i ? '1.5px solid var(--primary)' : '1px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>
                {editingPiggy ? 'Guardar Cambios' : 'Crear Cochinito 🐷'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Cochinitos */}
      <div ref={parentGrid} className="varios-grid">
        {piggyBanks.map(piggy => {
          const progress = piggy.goal > 0 ? (piggy.saved / piggy.goal) * 100 : 0;
          const isFunding = fundingId === piggy.id;
          const isCompleted = progress >= 100;

          return (
            <div 
              key={piggy.id} 
              className="menu-item" 
              style={{ 
                '--item-color': 'rgba(255,255,255,0.04)', 
                position: 'relative', height: 'auto', minHeight: '180px', padding: '16px',
                border: isCompleted ? '1px solid rgba(52,199,89,0.4)' : '1px solid var(--glass-border)'
              }} 
              onClick={() => { if (!isFunding) setFundingId(piggy.id); }}
            >
              {/* Menu Opciones */}
              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === piggy.id ? null : piggy.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' }}
                >
                  ⋮
                </button>
                {menuOpenId === piggy.id && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: '28px', padding: '4px', minWidth: '95px', zIndex: 20 }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(piggy); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(piggy.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>🗑️ Borrar</button>
                  </div>
                )}
              </div>

              <div className="icon" style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {piggy.icon}
              </div>
              <span className="label" style={{ fontSize: '0.92rem' }}>{piggy.name}</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                {formatCurrency(piggy.saved)} / {formatCurrency(piggy.goal)}
              </p>

              {/* Barra de Progreso */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', width: `${Math.min(progress, 100)}%`, 
                  background: isCompleted ? 'linear-gradient(90deg, #34c759, #30d158)' : 'linear-gradient(90deg, var(--primary), #34c759)', 
                  transition: 'width 0.4s ease',
                  boxShadow: isCompleted ? '0 0 10px #34c759' : '0 0 8px var(--primary)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '6px', fontSize: '0.68rem' }}>
                <span style={{ color: isCompleted ? 'var(--income)' : 'var(--primary)', fontWeight: '800' }}>
                  {progress.toFixed(0)}%
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isCompleted ? '¡Meta lograda! 🎉' : `Falta ${formatCurrency(Math.max(0, piggy.goal - piggy.saved))}`}
                </span>
              </div>

              {/* Overlay de Aporte de Saldo */}
              {isFunding && (
                <div className="animate-fade" style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'rgba(9, 12, 21, 0.94)', borderRadius: '22px', 
                  display: 'flex', flexDirection: 'column', padding: '14px', zIndex: 15,
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700' }}>Aportar a este cochinito</span>
                    <button onClick={(e) => { e.stopPropagation(); setFundingId(null); setFundAmount(''); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                  </div>
                  <div>
                    <input 
                      type="text" inputMode="numeric" placeholder="$ Monto" autoFocus
                      style={{ fontSize: '1rem', padding: '10px', textAlign: 'center', margin: '6px 0' }}
                      value={formatInputAmount(fundAmount)} 
                      onChange={e => setFundAmount(parseInputAmount(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[20000, 50000, 100000].map(quick => (
                        <button
                          key={quick}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFundAmount(quick.toString()); }}
                          style={{
                            flex: 1, padding: '4px', fontSize: '0.65rem', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', cursor: 'pointer'
                          }}
                        >
                          +{quick/1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleFund(piggy.id, piggy.saved, piggy.goal); }}
                    disabled={!fundAmount || parseFloat(fundAmount) <= 0}
                    className="btn-primary"
                    style={{ padding: '10px', fontSize: '0.82rem', width: '100%' }}
                  >
                    Confirmar Aporte
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Botón Nuevo Cochinito */}
        <button 
          className="menu-item" 
          onClick={() => setShowForm(true)} 
          style={{ '--item-color': 'rgba(255,255,255,0.02)', borderStyle: 'dashed', minHeight: '180px', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="icon" style={{ background: 'none', border: '1.5px dashed var(--glass-border)', fontSize: '1.5rem', opacity: 0.6 }}>+</div>
          <span className="label" style={{ opacity: 0.6, fontSize: '0.85rem' }}>Nuevo Cochinito</span>
        </button>
      </div>
    </div>
  );
};

export default PiggyBankTab;
