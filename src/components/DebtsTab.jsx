import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

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

  return (
    <div className="animate-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '12px', zIndex: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{isPartial ? 'Abonar' : '¿Cómo fue el pago?'}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>×</button>
      </div>

      {!isPartial ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <button onClick={onFullPayment} style={{ background: `${c}22`, color: c, border: `1px solid ${c}40`, borderRadius: '12px', padding: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>✅ Pago Total</button>
          <button onClick={() => setIsPartial(true)} style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A', border: '1px solid #FF9F0A40', borderRadius: '12px', padding: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>💰 Pago Parcial</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>Máx: {formatCurrency(debt.amount)}</p>
          <input 
            type="text" inputMode="numeric" placeholder="Monto" autoFocus
            style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center' }}
            value={formatInputAmount(partialAmount)} 
            onChange={e => setPartialAmount(parseInputAmount(e.target.value))}
          />
          <button 
            onClick={handlePartial}
            disabled={!partialAmount || parseFloat(partialAmount) <= 0 || parseFloat(partialAmount) > debt.amount}
            style={{ background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '0.8rem' }}
          >Confirmar</button>
          <button onClick={() => setIsPartial(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem' }}>Volver</button>
        </div>
      )}
    </div>
  );
};

const DebtsTab = ({ debts, addDebt, deleteDebt, updateDebt, onTogglePaid, onPartialPayment }) => {
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
    if (!person || !amount) return;

    const data = {
      person: person.trim(),
      amount: parseFloat(amount),
      type,
      description: description.trim() || `Deuda con ${person.trim()}`,
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

  const confirmDelete = (id) => {
    if (window.confirm('¿Eliminar este registro de deuda?')) {
      deleteDebt(id);
      setMenuOpenId(null);
    }
  };

  const activeDebts = debts.filter(d => !d.paid);
  const paidDebts = debts.filter(d => d.paid);

  const owedToMe = activeDebts.filter(d => d.type === 'owed').reduce((a, d) => a + d.amount, 0);
  const iOwe = activeDebts.filter(d => d.type === 'owe').reduce((a, d) => a + d.amount, 0);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', gap: '10px', padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Me deben</p>
          <p style={{ fontWeight: '800', color: '#34c759', fontSize: '0.95rem' }}>{formatCurrency(owedToMe)}</p>
        </div>
        <div style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Debo</p>
          <p style={{ fontWeight: '800', color: '#ff3b30', fontSize: '0.95rem' }}>{formatCurrency(iOwe)}</p>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingDebt ? 'Editar' : 'Nueva'} Deuda</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setType('owe')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: type === 'owe' ? 'rgba(255,59,48,0.2)' : 'transparent', color: type === 'owe' ? '#ff3b30' : 'var(--text-dim)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Les debo</button>
                <button type="button" onClick={() => setType('owed')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: type === 'owed' ? 'rgba(52,199,89,0.2)' : 'transparent', color: type === 'owed' ? '#34c759' : 'var(--text-dim)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Me deben</button>
              </div>

              <input type="text" placeholder="Persona" value={person} onChange={e => setPerson(e.target.value)} required />
              
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

              <input type="text" placeholder="Descripción (opcional)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginTop: '12px' }} />

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', marginTop: '24px' }}>
                {editingDebt ? 'Guardar Cambios' : 'Registrar Deuda'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="varios-grid">
        {activeDebts.map(debt => {
          const c = debt.type === 'owe' ? '#ff3b30' : '#34c759';
          return (
            <div key={debt.id} className="menu-item" style={{ '--item-color': 'rgba(255,255,255,0.05)', position: 'relative', height: 'auto', minHeight: '160px', padding: '16px' }}
              onClick={() => setPayingId(debt.id)}>
              
              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === debt.id ? null : debt.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                >⋮</button>
                {menuOpenId === debt.id && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: '30px', padding: '4px', minWidth: '100px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(debt); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(debt.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', width: '100%', textAlign: 'left', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️ Borrar</button>
                  </div>
                )}
              </div>

              <div className="icon" style={{ background: `${c}15`, color: c, fontSize: '1.6rem', marginBottom: '8px' }}>
                {debt.type === 'owe' ? '💸' : '💰'}
              </div>
              <span className="label" style={{ textAlign: 'center', fontSize: '0.9rem' }}>{debt.person}</span>
              <p style={{ fontSize: '0.85rem', fontWeight: '800', color: c, margin: '4px 0' }}>{formatCurrency(debt.amount)}</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>{debt.description}</p>

              {payingId === debt.id && (
                <PaymentOverlay 
                  debt={debt} 
                  onFullPayment={() => { onTogglePaid(debt.id); setPayingId(null); }}
                  onPartialPayment={onPartialPayment}
                  onClose={() => setPayingId(null)}
                />
              )}
            </div>
          );
        })}

        <button className="menu-item" onClick={() => setShowForm(true)} style={{ '--item-color': 'rgba(255,255,255,0.03)', borderStyle: 'dashed', minHeight: '160px' }}>
          <div className="icon" style={{ background: 'none', border: '2px dashed var(--glass-border)', fontSize: '1.5rem', opacity: 0.5 }}>+</div>
          <span className="label" style={{ opacity: 0.5 }}>Nueva</span>
        </button>
      </div>

      {paidDebts.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <details>
            <summary style={{ color: 'var(--text-dim)', fontSize: '0.8rem', cursor: 'pointer' }}>Ver {paidDebts.length} deudas pagadas</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {paidDebts.map(debt => (
                <div key={debt.id} className="card" style={{ margin: 0, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                  <span style={{ fontSize: '0.8rem' }}>{debt.person} · {formatCurrency(debt.amount)}</span>
                  <button onClick={() => deleteDebt(debt.id)} style={{ background: 'none', border: 'none', color: 'var(--expense)' }}>🗑️</button>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DebtsTab;
