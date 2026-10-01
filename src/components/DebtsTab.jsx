import React, { useState, useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import confetti from 'canvas-confetti';
import { HandCoins, Plus, CheckCircle2, Trash2, Edit2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const PaymentOverlay = ({ debt, onFullPayment, onPartialPayment, onClose }) => {
  const [partialAmount, setPartialAmount] = useState('');
  const [isPartial, setIsPartial] = useState(false);

  const c = debt.type === 'owe' ? 'var(--expense)' : 'var(--income)';

  const handlePartial = () => {
    const amt = parseFloat(partialAmount);
    if (!amt || amt <= 0 || amt > debt.amount) return;
    onPartialPayment(debt.id, amt);
    onClose();
  };

  const handleFull = () => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.warn(err);
    }
    onFullPayment();
  };

  return (
    <div className="animate-fade" style={{ 
      position: 'absolute', inset: 0, 
      background: 'rgba(9, 12, 21, 0.95)', borderRadius: '22px', 
      display: 'flex', flexDirection: 'column', padding: '14px', zIndex: 15,
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700' }}>
          {isPartial ? 'Abonar a la cuenta' : '¿Cómo se realizó el pago?'}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
      </div>

      {!isPartial ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <button 
            onClick={handleFull} 
            style={{ 
              background: 'rgba(52,199,89,0.18)', color: '#34c759', 
              border: '1px solid rgba(52,199,89,0.35)', borderRadius: '14px', 
              padding: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            ✅ Pago Total ({formatCurrency(debt.amount)})
          </button>
          <button 
            onClick={() => setIsPartial(true)} 
            style={{ 
              background: 'rgba(255,149,0,0.15)', color: '#ff9500', 
              border: '1px solid rgba(255,149,0,0.35)', borderRadius: '14px', 
              padding: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            💰 Registrar Abono Parcial
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            Saldo actual pendiente: <strong>{formatCurrency(debt.amount)}</strong>
          </p>
          <input 
            type="text" inputMode="numeric" placeholder="$ Monto de abono" autoFocus
            style={{ fontSize: '1rem', padding: '10px', textAlign: 'center' }}
            value={formatInputAmount(partialAmount)} 
            onChange={e => setPartialAmount(parseInputAmount(e.target.value))}
          />
          <button 
            onClick={handlePartial}
            disabled={!partialAmount || parseFloat(partialAmount) <= 0 || parseFloat(partialAmount) > debt.amount}
            className="btn-primary"
            style={{ padding: '11px', fontSize: '0.85rem', width: '100%' }}
          >
            Confirmar Abono
          </button>
          <button onClick={() => setIsPartial(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}>
            ← Volver a opciones
          </button>
        </div>
      )}
    </div>
  );
};

const DebtsTab = ({ debts = [], addDebt, deleteDebt, updateDebt, onTogglePaid, onPartialPayment }) => {
  const [parentList] = useAutoAnimate();
  const [activeFilter, setActiveFilter] = useState('all'); // all, owe, lend, paid
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Form states
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('owe');
  const [description, setDescription] = useState('');

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!person.trim() || !amount) return;

    const data = {
      person: person.trim(),
      amount: parseFloat(amount),
      type,
      description: description.trim() || (type === 'owe' ? `Debo a ${person.trim()}` : `Me debe ${person.trim()}`),
      paid: editingDebt ? editingDebt.paid : false,
      date: editingDebt ? editingDebt.date : new Date().toISOString(),
    };

    if (editingDebt) {
      updateDebt(editingDebt.id, data);
    } else {
      addDebt({ ...data, id: Date.now().toString() });
    }

    resetForm();
  };

  const resetForm = () => {
    setPerson('');
    setAmount('');
    setType('owe');
    setDescription('');
    setShowForm(false);
    setEditingDebt(null);
  };

  const startEdit = (d) => {
    setEditingDebt(d);
    setPerson(d.person);
    setAmount(d.amount.toString());
    setType(d.type);
    setDescription(d.description || '');
    setShowForm(true);
    setMenuOpenId(null);
  };

  // Summaries
  const totalIowe = useMemo(() => debts.filter(d => !d.paid && d.type === 'owe').reduce((a, b) => a + b.amount, 0), [debts]);
  const totalOwedToMe = useMemo(() => debts.filter(d => !d.paid && d.type === 'lend').reduce((a, b) => a + b.amount, 0), [debts]);

  // Filtered list
  const filteredDebts = useMemo(() => {
    if (activeFilter === 'paid') return debts.filter(d => d.paid);
    if (activeFilter === 'owe') return debts.filter(d => !d.paid && d.type === 'owe');
    if (activeFilter === 'lend') return debts.filter(d => !d.paid && d.type === 'lend');
    return debts.filter(d => !d.paid);
  }, [debts, activeFilter]);

  return (
    <div className="animate-fade">
      {/* Resumen Superior */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '0 16px 16px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255,59,48,0.12) 0%, rgba(0,0,0,0.3) 100%)', 
          border: '1px solid rgba(255,59,48,0.25)', borderRadius: '18px', padding: '14px' 
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Debo (Por Pagar)</span>
          <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--expense)', marginTop: '4px' }}>
            {formatCurrency(totalIowe)}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(52,199,89,0.12) 0%, rgba(0,0,0,0.3) 100%)', 
          border: '1px solid rgba(52,199,89,0.25)', borderRadius: '18px', padding: '14px' 
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Me Deben (Por Cobrar)</span>
          <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--income)', marginTop: '4px' }}>
            {formatCurrency(totalOwedToMe)}
          </p>
        </div>
      </div>

      {/* Filter Tabs & New Debt Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px' }}>
        <div className="filter-chips" style={{ padding: 0, margin: 0 }}>
          {[
            { id: 'all', label: 'Pendientes' },
            { id: 'owe', label: 'Debo' },
            { id: 'lend', label: 'Me Deben' },
            { id: 'paid', label: 'Saldadas' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setActiveFilter(f.id)}
              className={`chip-btn ${activeFilter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary" 
          style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
        >
          + Nueva Deuda
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingDebt ? 'Editar' : 'Nueva'} Deuda / Préstamo</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setType('owe')} 
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', 
                    background: type === 'owe' ? 'rgba(255,59,48,0.22)' : 'transparent', 
                    color: type === 'owe' ? 'var(--expense)' : 'var(--text-dim)', 
                    fontWeight: '800', cursor: 'pointer' 
                  }}
                >
                  Debo (Por Pagar)
                </button>
                <button 
                  type="button" 
                  onClick={() => setType('lend')} 
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', 
                    background: type === 'lend' ? 'rgba(52,199,89,0.22)' : 'transparent', 
                    color: type === 'lend' ? 'var(--income)' : 'var(--text-dim)', 
                    fontWeight: '800', cursor: 'pointer' 
                  }}
                >
                  Me Deben (Por Cobrar)
                </button>
              </div>

              <input type="text" placeholder="Nombre de la persona o entidad" value={person} onChange={e => setPerson(e.target.value)} required />
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  Monto de la deuda
                  {amount && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatCurrency(parseFloat(amount))}</span>}
                </label>
                <input type="text" inputMode="numeric" placeholder="$ 0" 
                  value={formatInputAmount(amount)} 
                  onChange={e => setAmount(parseInputAmount(e.target.value))} 
                  required 
                  style={{ fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}
                />
              </div>

              <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Detalle / Motivo (opcional)</label>
                <input type="text" placeholder="Ej: Préstamo personal, Arriendo pendiente..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>
                {editingDebt ? 'Guardar Cambios' : 'Registrar Deuda 🤝'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Deudas */}
      <div ref={parentList} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
        {filteredDebts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '36px 0', fontSize: '0.85rem' }}>
            No hay registros de deudas en esta sección.
          </p>
        ) : (
          filteredDebts.map(debt => {
            const isOwe = debt.type === 'owe';
            const isPaying = payingId === debt.id;
            return (
              <div 
                key={debt.id} 
                className="card" 
                style={{ 
                  margin: 0, padding: '16px', borderRadius: '20px', 
                  border: debt.paid ? '1px solid rgba(52,199,89,0.3)' : '1px solid var(--glass-border)',
                  position: 'relative',
                  opacity: debt.paid ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '14px', 
                      background: isOwe ? 'rgba(255,59,48,0.12)' : 'rgba(52,199,89,0.12)', 
                      border: `1px solid ${isOwe ? 'rgba(255,59,48,0.25)' : 'rgba(52,199,89,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' 
                    }}>
                      {isOwe ? '📤' : '📥'}
                    </div>
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '0.96rem' }}>{debt.person}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {debt.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ 
                      color: isOwe ? 'var(--expense)' : 'var(--income)', 
                      fontWeight: '900', fontSize: '1.05rem' 
                    }}>
                      {formatCurrency(debt.amount)}
                    </span>
                    {!debt.paid ? (
                      <button 
                        onClick={() => setPayingId(debt.id)}
                        style={{ 
                          padding: '4px 10px', borderRadius: '8px', border: 'none', 
                          background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', 
                          fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer' 
                        }}
                      >
                        Saldar / Abonar
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.68rem', color: 'var(--income)', fontWeight: '700' }}>
                        ✓ Saldada
                      </span>
                    )}
                  </div>
                </div>

                {isPaying && (
                  <PaymentOverlay 
                    debt={debt} 
                    onFullPayment={() => { onTogglePaid(debt.id); setPayingId(null); }}
                    onPartialPayment={(id, amt) => { onPartialPayment(id, amt); setPayingId(null); }}
                    onClose={() => setPayingId(null)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DebtsTab;
