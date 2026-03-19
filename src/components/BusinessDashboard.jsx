import React, { useState, useMemo } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const QuickActionModal = ({ action, onSave, onClose }) => {
  const [name, setName] = useState(action?.name || '');
  const [amount, setAmount] = useState(action?.amount?.toString() || '');
  const [type, setType] = useState(action?.type || 'expense');
  const [icon, setIcon] = useState(action?.icon || '📦');

  const icons = ['☕', '🥛', '🧀', '🌱', '🧪', '🛒', '📦', '🧂', '💉', '🌾', '🚜', '🛠️', '💰', '📈'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      id: action?.id || Date.now().toString(), 
      name, 
      amount: parseFloat(amount) || 0, 
      type, 
      icon 
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{action ? 'Editar' : 'Nueva'} Acción Rápida</h2>
          <button onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
            <button type="button" onClick={() => setType('income')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: type === 'income' ? 'rgba(52,199,89,0.2)' : 'transparent', color: type === 'income' ? '#34c759' : 'var(--text-dim)', fontWeight: '700', cursor: 'pointer' }}>Ingreso (+)</button>
            <button type="button" onClick={() => setType('expense')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: type === 'expense' ? 'rgba(255,59,48,0.2)' : 'transparent', color: type === 'expense' ? '#ff3b30' : 'var(--text-dim)', fontWeight: '700', cursor: 'pointer' }}>Gasto (-)</button>
          </div>

          <input type="text" placeholder="Nombre (Ej: Venta Café)" value={name} onChange={e => setName(e.target.value)} required />
          
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              Monto Predeterminado (opcional)
              {amount && parseFloat(amount) > 0 && <span style={{ color: 'var(--primary)' }}>{formatCurrency(parseFloat(amount))}</span>}
            </label>
            <input type="text" inputMode="numeric" placeholder="Monto (0 para preguntar)" 
              value={formatInputAmount(amount)} 
              onChange={e => setAmount(parseInputAmount(e.target.value))} />
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

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>Guardar Acción</button>
        </form>
      </div>
    </div>
  );
};

const BusinessDashboard = ({ businesses, addBusiness, deleteBusiness, updateBusiness, transactions, setTransactions, workers = [], setWorkers }) => {
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
  
  // Quick Actions State
  const [editingAction, setEditingAction] = useState(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Finca Cafetera specific state
  const [activeTab, setActiveTab] = useState('finances'); // finances, workers
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerType, setWorkerType] = useState('recolector');
  const [workerRate, setWorkerRate] = useState('');
  const [payWorkerId, setPayWorkerId] = useState(null);
  const [payUnits, setPayUnits] = useState('');

  const activeBusiness = businesses.find(b => b.id === activeBusinessId);

  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    
    const id = Date.now().toString();
    const type = newBizType === 'Finca' ? newBizSubtype : newBizType;
    
    addBusiness({
      id,
      name: newBizName,
      type
    });
    
    if (newBizCapital && parseFloat(newBizCapital) > 0) {
      const initialTx = {
        id: (Date.now() + 1).toString(),
        businessId: id,
        description: 'Capital Inicial / Préstamo',
        amount: parseFloat(newBizCapital),
        type: 'income',
        date: new Date().toISOString()
      };
      setTransactions(prev => [initialTx, ...prev]);
    }

    setActiveBusinessId(id);
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

  const handleQuickAction = (action) => {
    if (action.amount > 0) {
      handleAddTx(null, action.name, action.type, action.amount);
    } else {
      setTxType(action.type);
      setTxDesc(action.name);
      setIsAddingTx(true);
    }
  };

  const saveQuickAction = (action) => {
    const currentActions = activeBusiness.quickActions || [];
    let updatedActions;
    if (editingAction) {
      updatedActions = currentActions.map(a => a.id === action.id ? action : a);
    } else {
      updatedActions = [...currentActions, action];
    }
    updateBusiness(activeBusinessId, { quickActions: updatedActions });
    setShowActionForm(false);
    setEditingAction(null);
  };

  const deleteQuickAction = (actionId) => {
    if (window.confirm('¿Eliminar esta acción rápida?')) {
      const updatedActions = (activeBusiness.quickActions || []).filter(a => a.id !== actionId);
      updateBusiness(activeBusinessId, { quickActions: updatedActions });
      setMenuOpenId(null);
    }
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
    let amount = units * worker.rate;
    let desc = `Nómina: ${worker.name} (${units} ${worker.type === 'recolector' ? 'Kg' : worker.type === 'recolector_arroba' ? '@' : 'días'})`;
      
    handleAddTx(null, desc, 'expense', amount);
    setPayWorkerId(null);
    setPayUnits('');
  };

  const bizType = useMemo(() => {
    if (!activeBusiness) return 'other';
    const type = activeBusiness.type.toLowerCase();
    if (type.includes('café') || type.includes('cafe')) return 'coffee';
    if (type.includes('ganadería') || type.includes('ganaderia')) return 'livestock';
    return 'other';
  }, [activeBusiness]);

  const isFinca = bizType === 'coffee';
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
            <div style={{ marginBottom: '16px', background: 'rgba(var(--primary-rgb), 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '12px', display: 'block' }}>¿Qué tipo de Finca manejas?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['Café', 'Ganadería', 'Agricultura General'].map(t => (
                  <button key={t} type="button" onClick={() => setNewBizSubtype(t)}
                    style={{ 
                      padding: '12px', borderRadius: '12px', border: '1px solid',
                      background: newBizSubtype === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: newBizSubtype === t ? '#000' : '#fff',
                      borderColor: newBizSubtype === t ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                      gridColumn: t === 'Agricultura General' ? '1 / -1' : 'auto'
                    }}>{t === 'Café' ? '☕ Café' : t === 'Ganadería' ? '🐄 Ganadería' : '🍏 Otros'}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Capital Inicial (Opcional)</label>
            <input type="text" inputMode="numeric" placeholder="Ej: $ 1.000.000" 
              value={formatInputAmount(newBizCapital)} 
              onChange={e => setNewBizCapital(parseInputAmount(e.target.value))} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {businesses.length > 0 && (
              <button type="button" onClick={() => setIsAddingBusiness(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            )}
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px' }}>Crear Negocio</button>
          </div>
        </form>
      </div>
    );
  }

  if (!activeBusinessId && businesses.length > 0) {
    setActiveBusinessId(businesses[0].id);
  }

  const quickActions = activeBusiness?.quickActions || [];

  return (
    <div className="animate-fade" style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {businesses.map(b => (
          <button key={b.id} onClick={() => { setActiveBusinessId(b.id); setActiveTab('finances'); }}
            style={{ 
              padding: '10px 16px', borderRadius: '12px', border: 'none', whiteSpace: 'nowrap',
              background: b.id === activeBusinessId ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: b.id === activeBusinessId ? 'black' : 'var(--text-main)',
              fontWeight: '600', cursor: 'pointer'
            }}>{b.name}</button>
        ))}
        <button onClick={() => setIsAddingBusiness(true)}
          style={{ padding: '10px 16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Agregar</button>
      </div>

      {activeBusiness && (
        <>
          <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Balance</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-dim)' }}>{activeBusiness.type}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-dim)' }}>👥 {isFinca ? activeWorkers.length : 0} Trab.</span>
                  <button onClick={() => deleteBusiness(activeBusinessId)} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '10px 0', color: stats.balance >= 0 ? 'white' : 'var(--expense)' }}>{formatCurrency(stats.balance)}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <div style={{ flex: 1, background: 'rgba(52, 199, 89, 0.1)', padding: '12px', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--income)', fontWeight: '600' }}>INGRESOS</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--income)' }}>{formatCurrency(stats.income)}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255, 59, 48, 0.1)', padding: '12px', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--expense)', fontWeight: '600' }}>GASTOS</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--expense)' }}>{formatCurrency(stats.expense)}</p>
              </div>
            </div>
          </div>

          {isFinca && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '14px' }}>
              <button onClick={() => setActiveTab('finances')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'finances' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'finances' ? 'white' : 'var(--text-dim)', fontWeight: '600' }}>Finanzas</button>
              <button onClick={() => setActiveTab('workers')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'workers' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'workers' ? 'white' : 'var(--text-dim)', fontWeight: '600' }}>Trabajadores ({activeWorkers.length})</button>
            </div>
          )}

          {activeTab === 'finances' && (
            <>
              {!isAddingTx && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '600' }}>REGISTRO RÁPIDO</p>
                  <div className="varios-grid">
                    {quickActions.map(action => (
                      <div key={action.id} className="menu-item" style={{ height: 'auto', minHeight: '120px', padding: '12px', position: 'relative' }} onClick={() => handleQuickAction(action)}>
                        <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === action.id ? null : action.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer' }}>⋮</button>
                          {menuOpenId === action.id && (
                            <div className="card" style={{ position: 'absolute', right: 0, top: '24px', padding: '4px', zIndex: 20 }}>
                              <button onClick={(e) => { e.stopPropagation(); setEditingAction(action); setShowActionForm(true); setMenuOpenId(null); }} style={{ background: 'none', border: 'none', color: 'white', display: 'block', width: '100%', padding: '8px', fontSize: '0.75rem', textAlign: 'left' }}>✏️ Editar</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteQuickAction(action.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', display: 'block', width: '100%', padding: '8px', fontSize: '0.75rem', textAlign: 'left' }}>🗑️ Borrar</button>
                            </div>
                          )}
                        </div>
                        <div className="icon" style={{ fontSize: '1.5rem', marginBottom: '8px', background: action.type === 'income' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)' }}>{action.icon}</div>
                        <span className="label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>{action.name}</span>
                        {action.amount > 0 && <p style={{ fontSize: '0.7rem', color: action.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: '700' }}>{formatCurrency(action.amount)}</p>}
                      </div>
                    ))}
                    <button className="menu-item" onClick={() => { setEditingAction(null); setShowActionForm(true); }} style={{ minHeight: '120px', border: '2px dashed rgba(255,255,255,0.1)', background: 'transparent' }}>
                      <div className="icon" style={{ background: 'none', border: '2px dashed rgba(255,255,255,0.2)', opacity: 0.5 }}>+</div>
                      <span className="label" style={{ opacity: 0.5 }}>Nuevo</span>
                    </button>
                  </div>
                </div>
              )}

              {showActionForm && (
                <QuickActionModal action={editingAction} onSave={saveQuickAction} onClose={() => { setShowActionForm(false); setEditingAction(null); }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Movimientos</h3>
                <button onClick={() => setIsAddingTx(!isAddingTx)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}>{isAddingTx ? 'Cancelar' : '+ Manual'}</button>
              </div>

              {isAddingTx && (
                <form onSubmit={(e) => handleAddTx(e)} className="animate-fade" style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button type="button" onClick={() => setTxType('income')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'income' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255,255,255,0.05)', color: txType === 'income' ? 'var(--income)' : 'white', fontWeight: '600' }}>Ingreso</button>
                    <button type="button" onClick={() => setTxType('expense')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'expense' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.05)', color: txType === 'expense' ? 'var(--expense)' : 'white', fontWeight: '600' }}>Gasto</button>
                  </div>
                  <input type="text" placeholder="Descripción" value={txDesc} onChange={e => setTxDesc(e.target.value)} required />
                  <input type="text" inputMode="numeric" placeholder="Monto" value={formatInputAmount(txAmount)} onChange={e => setTxAmount(parseInputAmount(e.target.value))} required style={{ marginTop: '12px', fontSize: '1.2rem', fontWeight: '800' }} />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>Guardar</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
                {activeBizTxs.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--surface-color)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.type === 'income' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tx.type === 'income' ? '📈' : '📉'}</div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tx.description}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: '700' }}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                      <button onClick={() => { if(window.confirm('¿Eliminar?')) setTransactions(prev => prev.filter(t => t.id !== tx.id)); }} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', cursor: 'pointer' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'workers' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Trabajadores</h3>
                <button onClick={() => setIsAddingWorker(!isAddingWorker)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}>{isAddingWorker ? 'Cancelar' : '+ Añadir'}</button>
              </div>
              {isAddingWorker && (
                <form onSubmit={handleAddWorker} style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                  <input type="text" placeholder="Nombre" value={workerName} onChange={e => setWorkerName(e.target.value)} required />
                  <select value={workerType} onChange={e => setWorkerType(e.target.value)} style={{ marginTop: '12px' }}>
                    <option value="recolector">Kg Recolectado</option>
                    <option value="recolector_arroba">@ Arroba</option>
                    <option value="jornal">Día (Jornal)</option>
                  </select>
                  <input type="text" inputMode="numeric" placeholder="Precio ($)" value={formatInputAmount(workerRate)} onChange={e => setWorkerRate(parseInputAmount(e.target.value))} required style={{ marginTop: '12px' }} />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>Guardar</button>
                </form>
              )}
              {activeWorkers.map(w => (
                <div key={w.id} style={{ padding: '16px', background: 'var(--surface-color)', borderRadius: '16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '700' }}>{w.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{w.type} · {formatCurrency(w.rate)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setPayWorkerId(payWorkerId === w.id ? null : w.id)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--primary)', color: 'black', fontWeight: '600' }}>Pagar</button>
                      <button onClick={() => { if(window.confirm('¿Eliminar?')) setWorkers(prev => prev.filter(x => x.id !== w.id)); }} style={{ color: 'var(--expense)', background: 'none', border: 'none' }}>×</button>
                    </div>
                  </div>
                  {payWorkerId === w.id && (
                    <form onSubmit={(e) => handlePayWorker(e, w)} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <input type="number" step="0.01" placeholder="Unidades" value={payUnits} onChange={e => setPayUnits(e.target.value)} required style={{ flex: 1 }} />
                      <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>OK</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessDashboard;
