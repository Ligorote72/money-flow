import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const DEBT_TYPES = [
  { id: 'owe',  label: 'Les debo', color: '#FF3B30' },
  { id: 'owed', label: 'Me deben', color: '#34C759' },
];

// Mini panel de pago que aparece debajo de la deuda
const PaymentPanel = ({ debt, onFullPayment, onPartialPayment, onCancel }) => {
  const [mode, setMode]         = useState(null); // null | 'partial'
  const [partialAmount, setPartialAmount] = useState('');

  const c = debt.type === 'owe' ? '#FF3B30' : '#34C759';

  const handlePartial = () => {
    const amt = parseFloat(partialAmount);
    if (!amt || amt <= 0 || amt > debt.amount) return;
    onPartialPayment(debt.id, amt);
  };

  return (
    <div style={{
      marginTop: '6px', padding: '12px 14px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      {mode === null ? (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
            ¿Cómo fue el pago?
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={onFullPayment}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                background: `${c}22`, color: c,
                cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              }}
            >✅ Pago total</button>
            <button
              onClick={() => setMode('partial')}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                background: 'rgba(255,159,10,0.15)', color: '#FF9F0A',
                cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              }}
            >💰 Pago parcial</button>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', background: 'transparent',
                color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >Cancelar</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            ¿Cuánto abonó? (máx {formatCurrency(debt.amount)})
            {partialAmount && <span style={{ color: '#FF9F0A', fontWeight: '600' }}>{formatCurrency(parseFloat(partialAmount))}</span>}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Monto abonado"
              value={formatInputAmount(partialAmount)}
              onChange={e => setPartialAmount(parseInputAmount(e.target.value))}
              style={{ flex: 1, margin: 0, padding: '10px 12px', fontSize: '0.9rem' }}
              autoFocus
            />
            <button
              onClick={handlePartial}
              disabled={!partialAmount || parseFloat(partialAmount) <= 0}
              style={{
                padding: '10px 16px', border: 'none', borderRadius: '10px',
                background: 'rgba(255,159,10,0.2)', color: '#FF9F0A',
                cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              }}
            >Aplicar</button>
            <button
              onClick={() => setMode(null)}
              style={{
                padding: '10px', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', background: 'transparent',
                color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >‹</button>
          </div>
        </>
      )}
    </div>
  );
};

const DebtsTab = ({ debts, onAddDebt, onDeleteDebt, onTogglePaid, onPartialPayment, dateFilterType, startDate, endDate, filterMonth, filterYear }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [person, setPerson]           = useState('');
  const [type, setType]               = useState('owe');
  const [showForm, setShowForm]       = useState(false);
  const [payingId, setPayingId]       = useState(null); // id de deuda con panel abierto

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !person) return;
    onAddDebt({
      id: Date.now(),
      description: description.trim() || `Deuda con ${person}`,
      person: person.trim(),
      amount: parseFloat(amount),
      type,
      paid: false,
      date: new Date().toISOString(),
    });
    setDescription(''); setAmount(''); setPerson('');
    setShowForm(false);
  };

  // Aplicar filtro de fecha (Mensual o Rango)
  const filteredDebts = debts.filter(d => {
    const dDate = new Date(d.date || d.id);
    if (dateFilterType === 'month') {
      return dDate.getMonth() === filterMonth && dDate.getFullYear() === filterYear;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return dDate >= start && dDate <= end;
    }
  });

  const owedToMe    = filteredDebts.filter(d => d.type === 'owed' && !d.paid).reduce((a, d) => a + d.amount, 0);
  const iOwe        = filteredDebts.filter(d => d.type === 'owe'  && !d.paid).reduce((a, d) => a + d.amount, 0);
  const activeDebts = filteredDebts.filter(d => !d.paid);
  const paidDebts   = filteredDebts.filter(d =>  d.paid);

  return (
    <div className="card animate-fade" style={{ marginTop: '0' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>🤝 Deudas y Préstamos</h3>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Me deben', value: owedToMe, color: '#34C759' },
          { label: 'Debo',     value: iOwe,     color: '#FF3B30' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, padding: '12px', borderRadius: '14px',
            background: `${item.color}15`, border: `1px solid ${item.color}30`, textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{item.label}</p>
            <p style={{ fontWeight: '700', color: item.color, fontSize: '1rem' }}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Botón agregar / Formulario */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
          + Registrar deuda
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            {DEBT_TYPES.map(t => (
              <button key={t.id} type="button" onClick={() => setType(t.id)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s',
                background: type === t.id ? `${t.color}22` : 'transparent',
                color: type === t.id ? t.color : 'var(--text-dim)',
              }}>{t.label}</button>
            ))}
          </div>
          <input type="text" placeholder="Persona *" value={person} onChange={e => setPerson(e.target.value)} required />
          <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
            Monto *
            {amount && <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatCurrency(parseFloat(amount))}</span>}
          </label>
          <input type="text" inputMode="numeric" placeholder="Monto *" 
            value={formatInputAmount(amount)} 
            onChange={e => setAmount(parseInputAmount(e.target.value))} 
            required />
          <input type="text" placeholder="Descripción (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{
              flex: 1, padding: '12px', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer',
            }}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>Guardar</button>
          </div>
        </form>
      )}

      {/* Lista activa */}
      {activeDebts.length === 0 && !showForm && (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
          No hay deudas activas 🎉
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeDebts.map(debt => {
          const c = debt.type === 'owe' ? '#FF3B30' : '#34C759';
          return (
            <div key={debt.id}>
              <div style={{
                padding: '13px 14px', borderRadius: '14px',
                background: payingId === debt.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${c}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.2s',
              }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{debt.person}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{debt.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: c, fontWeight: '700' }}>{formatCurrency(debt.amount)}</span>
                  {/* × abre el panel de pago */}
                  <button
                    onClick={() => setPayingId(payingId === debt.id ? null : debt.id)}
                    title="Registrar pago"
                    style={{
                      background: payingId === debt.id ? 'rgba(255,59,48,0.15)' : 'none',
                      border: 'none', color: payingId === debt.id ? '#FF3B30' : 'rgba(255,59,48,0.6)',
                      cursor: 'pointer', fontSize: '1.1rem', padding: '4px 6px',
                      borderRadius: '8px', transition: 'all 0.2s',
                    }}
                  >×</button>
                </div>
              </div>

              {/* Panel de opciones de pago */}
              {payingId === debt.id && (
                <PaymentPanel
                  debt={debt}
                  onFullPayment={() => { onTogglePaid(debt.id); setPayingId(null); }}
                  onPartialPayment={(id, amt) => { onPartialPayment(id, amt); setPayingId(null); }}
                  onCancel={() => setPayingId(null)}
                />
              )}
            </div>
          );
        })}

        {/* Historial pagadas */}
        {paidDebts.length > 0 && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer', padding: '6px 0' }}>
              Ver {paidDebts.length} deuda(s) pagada(s)
            </summary>
            {paidDebts.map(debt => (
              <div key={debt.id} style={{
                padding: '10px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', opacity: 0.5,
                display: 'flex', justifyContent: 'space-between', marginTop: '6px',
              }}>
                <p style={{ fontSize: '0.85rem', textDecoration: 'line-through' }}>{debt.person} · {debt.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem' }}>{formatCurrency(debt.amount)}</span>
                  <button onClick={() => onDeleteDebt(debt.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.4)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                </div>
              </div>
            ))}
          </details>
        )}
      </div>
    </div>
  );
};

export default DebtsTab;
