import React, { useState, useMemo } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const BusinessDashboard = ({ businesses, addBusiness, transactions, setTransactions, workers = [], setWorkers }) => {
  const [activeBusinessId, setActiveBusinessId] = useState(null);
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  
  // New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizType, setNewBizType] = useState('Finca');
  const [newBizSubtype, setNewBizSubtype] = useState('Café');
  const [newBizCapital, setNewBizCapital] = useState('');

  // Transactions State
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('income');
  
  // Finca Cafetera specific state
  const [activeTab, setActiveTab] = useState('finances'); // finances, workers
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerType, setWorkerType] = useState('recolector');
  const [workerRate, setWorkerRate] = useState(''); // Price per kilo or per day
  const [payWorkerId, setPayWorkerId] = useState(null);
  const [payUnits, setPayUnits] = useState(''); // Kilos or Days

  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    
    const newBiz = {
      id: Date.now().toString(),
      name: newBizName,
      type: newBizType === 'Finca' ? newBizSubtype : newBizType
    };
    addBusiness(newBiz);
    
    // Si hay capital inicial, crear la primera transacción
    if (newBizCapital && parseFloat(newBizCapital) > 0) {
      const initialTx = {
        id: (Date.now() + 1).toString(),
        businessId: newBiz.id,
        description: 'Capital Inicial / Préstamo',
        amount: parseFloat(newBizCapital),
        type: 'income',
        date: new Date().toISOString()
      };
      setTransactions(prev => [initialTx, ...prev]);
    }

    setActiveBusinessId(newBiz.id);
    setIsAddingBusiness(false);
    setNewBizName('');
    setNewBizCapital('');
  };

  const handleAddTx = (e, customDesc, customType, customAmount) => {
    if (e) e.preventDefault();
    const desc = customDesc || txDesc;
    const amountStr = customAmount || txAmount;
    const type = customType || txType;
    
    if (!desc.trim() || !amountStr || !activeBusinessId) return;

    const newTx = {
      id: Date.now().toString(),
      businessId: activeBusinessId,
      description: desc,
      amount: parseFloat(amountStr),
      type: type,
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsAddingTx(false);
    setTxDesc('');
    setTxAmount('');
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!workerName.trim() || !workerRate) return;
    
    const newWorker = {
      id: Date.now().toString(),
      businessId: activeBusinessId,
      name: workerName,
      type: workerType,
      rate: parseFloat(workerRate)
    };
    setWorkers(prev => [...prev, newWorker]);
    setIsAddingWorker(false);
    setWorkerName('');
    setWorkerRate('');
  };

  const handlePayWorker = (e, worker) => {
    e.preventDefault();
    if (!payUnits) return;
    
    const units = parseFloat(payUnits);
    let amount = 0;
    let desc = '';
    
    if (worker.type === 'recolector') {
      amount = units * worker.rate;
      desc = `Nómina: ${worker.name} (${units} Kg)`;
    } else if (worker.type === 'recolector_arroba') {
      amount = units * worker.rate;
      desc = `Nómina: ${worker.name} (${units} @ Arrobas)`;
    } else {
      amount = units * worker.rate;
      desc = `Nómina: ${worker.name} (${units} días)`;
    }
      
    handleAddTx(null, desc, 'expense', amount);
    setPayWorkerId(null);
    setPayUnits('');
  };

  const activeBusiness = businesses.find(b => b.id === activeBusinessId);
  const bizType = useMemo(() => {
    if (!activeBusiness) return 'other';
    const type = activeBusiness.type.toLowerCase();
    if (type.includes('café') || type.includes('cafe') || type.includes('caficultura')) return 'coffee';
    if (type.includes('ganadería') || type.includes('ganaderia') || type.includes('leche') || type.includes('queso')) return 'livestock';
    return 'other';
  }, [activeBusiness]);

  const isFinca = bizType === 'coffee';
  const isLivestock = bizType === 'livestock';

  const activeBizTxs = useMemo(() => transactions.filter(t => t.businessId === activeBusinessId), [transactions, activeBusinessId]);
  const activeWorkers = useMemo(() => (workers || []).filter(w => w.businessId === activeBusinessId), [workers, activeBusinessId]);

  const stats = useMemo(() => {
    const income = activeBizTxs.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = activeBizTxs.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [activeBizTxs]);

  if (businesses.length === 0 || isAddingBusiness) {
    return (
      <div className="animate-fade" style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--primary)' }}>
          {businesses.length === 0 ? 'Crea tu primer Negocio' : 'Registrar Nuevo Negocio'}
        </h2>
        <form onSubmit={handleAddBusiness} style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Nombre del Negocio</label>
            <input type="text" value={newBizName} onChange={e => setNewBizName(e.target.value)} placeholder="Ej: Finca La Esperanza..." required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Categoría del Negocio</label>
            <select value={newBizType} onChange={e => setNewBizType(e.target.value)}>
              <option value="Finca">🚜 Agropecuario (Finca)</option>
              <option value="Servicios">🛠️ Servicios</option>
              <option value="Comercio">🛍️ Comercio / Tienda</option>
              <option value="Gastronomía">🍽️ Gastronomía</option>
              <option value="Digital">💻 Negocio Digital</option>
              <option value="Otro">❓ Otro</option>
            </select>
          </div>

          {newBizType === 'Finca' && (
            <div className="animate-fade" style={{ marginBottom: '16px', background: 'rgba(var(--primary-rgb), 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '12px', display: 'block' }}>¿Qué tipo de Finca manejas?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setNewBizSubtype('Café')}
                  style={{ 
                    padding: '12px', borderRadius: '12px', border: '1px solid',
                    background: newBizSubtype === 'Café' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: newBizSubtype === 'Café' ? '#000' : '#fff',
                    borderColor: newBizSubtype === 'Café' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer'
                  }}>☕ Café</button>
                <button 
                  type="button"
                  onClick={() => setNewBizSubtype('Ganadería')}
                  style={{ 
                    padding: '12px', borderRadius: '12px', border: '1px solid',
                    background: newBizSubtype === 'Ganadería' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: newBizSubtype === 'Ganadería' ? '#000' : '#fff',
                    borderColor: newBizSubtype === 'Ganadería' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer'
                  }}>🐄 Ganadería</button>
                <button 
                  type="button"
                  onClick={() => setNewBizSubtype('Agricultura General')}
                  style={{ 
                    padding: '12px', borderRadius: '12px', border: '1px solid',
                    gridColumn: '1 / -1',
                    background: newBizSubtype === 'Agricultura General' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: newBizSubtype === 'Agricultura General' ? '#000' : '#fff',
                    borderColor: newBizSubtype === 'Agricultura General' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer'
                  }}>🍏 Otros (Frutas/Verduras)</button>
              </div>
            </div>
          )}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Capital Inicial (Opcional)</label>
            <input type="text" inputMode="numeric" placeholder="Ej: $ 1.000.000" 
              value={formatInputAmount(newBizCapital)} 
              onChange={e => setNewBizCapital(parseInputAmount(e.target.value))} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Préstamos o capital propio para empezar.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {businesses.length > 0 && (
              <button type="button" onClick={() => setIsAddingBusiness(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px' }}>
              Crear Negocio
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!activeBusinessId && businesses.length > 0) {
    setActiveBusinessId(businesses[0].id);
  }

  return (
    <div className="animate-fade" style={{ padding: '0 16px' }}>
      {/* Selector de Negocios */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {businesses.map(b => (
          <button key={b.id} onClick={() => { setActiveBusinessId(b.id); setActiveTab('finances'); }}
            style={{ 
              padding: '10px 16px', borderRadius: '12px', border: 'none', whiteSpace: 'nowrap',
              background: b.id === activeBusinessId ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: b.id === activeBusinessId ? 'black' : 'var(--text-main)',
              fontWeight: '600', cursor: 'pointer'
            }}>
            {b.name}
          </button>
        ))}
        <button onClick={() => setIsAddingBusiness(true)}
          style={{ padding: '10px 16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Agregar
        </button>
      </div>

      {activeBusiness && (
        <>
          {/* Tarjeta de Resumen del Negocio */}
          <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Balance</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                    {isFinca ? '🌱 ' : ''}{activeBusiness.type}
                  </span>
                  {!isFinca && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                      👥 {activeBusiness.employees} {activeBusiness.employees === 1 ? 'Trabajador' : 'Trabajadores'}
                    </span>
                  )}
                  {isFinca && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                      👥 {activeWorkers.length} Trabajadores
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '10px 0', letterSpacing: '-0.02em', color: stats.balance >= 0 ? 'white' : 'var(--expense)' }}>
              {formatCurrency(stats.balance)}
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <div style={{ flex: 1, background: 'rgba(52, 199, 89, 0.1)', padding: '12px', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--income)', fontWeight: '600' }}>INGRESOS</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--income)' }}>{formatCurrency(stats.income)}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255, 59, 48, 0.1)', padding: '12px', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--expense)', fontWeight: '600' }}>GASTOS / NÓMINA</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--expense)' }}>{formatCurrency(stats.expense)}</p>
              </div>
            </div>
          </div>

          {/* Sub-navegación para Finca Cafetera */}
          {isFinca && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('finances')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeTab === 'finances' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'finances' ? 'white' : 'var(--text-dim)', fontWeight: '600' }}>
                Finanzas
              </button>
              <button onClick={() => setActiveTab('workers')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeTab === 'workers' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'workers' ? 'white' : 'var(--text-dim)', fontWeight: '600' }}>
                Trabajadores ({activeWorkers.length})
              </button>
            </div>
          )}

          {activeTab === 'finances' && (
            <>
              {/* Botones Rápidos para Finca Cafetera */}
              {isFinca && !isAddingTx && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '600' }}>REGISTRO RÁPIDO CAFÉ</p>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                    <button onClick={() => {setTxType('income'); setTxDesc('Venta Café Pergamino'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(52,199,89,0.3)', background: 'rgba(52,199,89,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>+ Café Pergamino</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Fertilizantes'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Fertilizantes</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Agroquímicos'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Agroquímicos</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Remesa / Mercado'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Remesa</button>
                  </div>
                </div>
              )}

              {/* Botones Rápidos para Ganadería */}
              {isLivestock && !isAddingTx && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '600' }}>REGISTRO RÁPIDO GANADERÍA</p>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                    <button onClick={() => {setTxType('income'); setTxDesc('Venta de Leche'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(52,199,89,0.3)', background: 'rgba(52,199,89,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>+ Venta Leche</button>
                    <button onClick={() => {setTxType('income'); setTxDesc('Venta de Queso'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(52,199,89,0.3)', background: 'rgba(196,251,109,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>+ Venta Queso</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Concentrado / Purina'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Concentrado</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Sal y Suplementos'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Sal</button>
                    <button onClick={() => {setTxType('expense'); setTxDesc('Vacunas / Medicamentos'); setIsAddingTx(true);}} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>- Vacunas</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Movimientos</h3>
                <button onClick={() => setIsAddingTx(!isAddingTx)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}>
                  {isAddingTx ? 'Cancelar' : '+ Manual'}
                </button>
              </div>

              {isAddingTx && (
                <form onSubmit={(e) => handleAddTx(e)} className="animate-fade" style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button type="button" onClick={() => setTxType('income')}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'income' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255,255,255,0.05)', color: txType === 'income' ? 'var(--income)' : 'white', fontWeight: '600' }}>
                      Ingreso
                    </button>
                    <button type="button" onClick={() => setTxType('expense')}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'expense' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.05)', color: txType === 'expense' ? 'var(--expense)' : 'white', fontWeight: '600' }}>
                      Gasto
                    </button>
                  </div>
                  <input type="text" placeholder="Descripción" value={txDesc} onChange={e => setTxDesc(e.target.value)} required style={{ marginBottom: '12px' }} />
                  <input type="text" inputMode="numeric" placeholder="Monto ($)" 
                    value={formatInputAmount(txAmount)} 
                    onChange={e => setTxAmount(parseInputAmount(e.target.value))} 
                    required style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }} />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Guardar</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
                {activeBizTxs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0' }}>No hay movimientos en este negocio aún.</p>
                ) : (
                  activeBizTxs.map(tx => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--surface-color)', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.type === 'income' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                          {tx.type === 'income' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{tx.description}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(tx.date).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: '700' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <button onClick={() => {
                          if(window.confirm('¿Eliminar este movimiento?')) {
                            setTransactions(prev => prev.filter(t => t.id !== tx.id));
                          }
                        }} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.4)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'workers' && isFinca && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Plantilla Trabajadores</h3>
                <button onClick={() => setIsAddingWorker(!isAddingWorker)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}>
                  {isAddingWorker ? 'Cancelar' : '+ Añadir'}
                </button>
              </div>

              {isAddingWorker && (
                <form onSubmit={handleAddWorker} style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                  <input type="text" placeholder="Nombre (Ej: Juan Pérez)" value={workerName} onChange={e => setWorkerName(e.target.value)} required style={{ marginBottom: '12px' }} />
                  <div style={{ marginBottom: '12px' }}>
                    <select value={workerType} onChange={e => setWorkerType(e.target.value)}>
                      <option value="recolector">Recolector (Pago por Kilo)</option>
                      <option value="recolector_arroba">Recolector (Pago por Arroba @)</option>
                      <option value="jornal">Jornal (Pago por Día)</option>
                    </select>
                  </div>
                  <input type="text" inputMode="numeric" placeholder={workerType === 'recolector' ? "Precio x Kilo recolectado ($)" : "Precio del Jornal/Día ($)"} 
                    value={formatInputAmount(workerRate)} 
                    onChange={e => setWorkerRate(parseInputAmount(e.target.value))} 
                    required style={{ marginBottom: '16px' }} />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Guardar Trabajador</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
                {activeWorkers.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0' }}>No tienes trabajadores registrados.</p>
                ) : (
                  activeWorkers.map(w => (
                    <div key={w.id} style={{ padding: '16px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: payWorkerId === w.id ? '16px' : '0' }}>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '1rem' }}>{w.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            {w.type === 'recolector' ? '🧺 Recolector' : w.type === 'recolector_arroba' ? '📦 Recolector (@)' : '⛏️ Jornal'} · {formatCurrency(w.rate)} / {w.type === 'recolector' ? 'Kg' : w.type === 'recolector_arroba' ? '@' : 'Día'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setPayWorkerId(payWorkerId === w.id ? null : w.id)} 
                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--primary)', color: 'black', border: 'none', fontWeight: '600' }}>
                            Pagar
                          </button>
                          <button onClick={() => { if(window.confirm('¿Eliminar trabajador?')) setWorkers(prev => prev.filter(x => x.id !== w.id)); }}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.6)', fontSize: '1.2rem', cursor: 'pointer' }}>
                            ×
                          </button>
                        </div>
                      </div>

                      {payWorkerId === w.id && (
                        <form onSubmit={(e) => handlePayWorker(e, w)} className="animate-fade" style={{ display: 'flex', gap: '10px' }}>
                          <input type="number" step="0.01" placeholder={w.type === 'recolector' ? "Kilos Recolectados" : w.type === 'recolector_arroba' ? "Arrobas (@) Recolectadas" : "Días Trabajados"} value={payUnits} onChange={e => setPayUnits(e.target.value)} required style={{ margin: 0, flex: 1 }} />
                          <button type="submit" style={{ padding: '0 16px', borderRadius: '12px', background: 'rgba(52,199,89,0.2)', color: 'var(--income)', border: 'none', fontWeight: '600' }}>
                            Confirmar
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessDashboard;
