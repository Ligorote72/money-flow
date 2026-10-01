import React, { useState, useMemo, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import ReceiptModal from './ui/ReceiptModal';
import confetti from 'canvas-confetti';
import { 
  Coffee, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  ReceiptText, 
  Calculator, 
  Calendar, 
  Sparkles, 
  Share2, 
  Scale,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const QuickActionModal = ({ action, onSave, onClose }) => {
  const [name, setName] = useState(action?.name || '');
  const [amount, setAmount] = useState(action?.amount?.toString() || '');
  const [type, setType] = useState(action?.type || 'expense');
  const [icon, setIcon] = useState(action?.icon || '☕');

  const icons = ['☕', '🌾', '🚜', '🌱', '🧪', '🛒', '📦', '🧂', '💉', '🛠️', '💰', '📈', '🥛', '🧀'];

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
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
            <button 
              type="button" 
              onClick={() => setType('income')} 
              style={{ 
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', 
                background: type === 'income' ? 'rgba(52,199,89,0.22)' : 'transparent', 
                color: type === 'income' ? '#34c759' : 'var(--text-dim)', 
                fontWeight: '700', cursor: 'pointer' 
              }}
            >
              Ingreso (+)
            </button>
            <button 
              type="button" 
              onClick={() => setType('expense')} 
              style={{ 
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', 
                background: type === 'expense' ? 'rgba(255,59,48,0.22)' : 'transparent', 
                color: type === 'expense' ? '#ff3b30' : 'var(--text-dim)', 
                fontWeight: '700', cursor: 'pointer' 
              }}
            >
              Gasto (-)
            </button>
          </div>

          <input type="text" placeholder="Nombre (Ej: Venta Café Pergamino)" value={name} onChange={e => setName(e.target.value)} required />
          
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              Monto Predeterminado (opcional)
              {amount && parseFloat(amount) > 0 && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatCurrency(parseFloat(amount))}</span>}
            </label>
            <input type="text" inputMode="numeric" placeholder="Monto ($0 para pedir al tocar)" 
              value={formatInputAmount(amount)} 
              onChange={e => setAmount(parseInputAmount(e.target.value))} />
          </div>

          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '10px' }}>Icono</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {icons.map(i => (
                <button
                  key={i} type="button" onClick={() => setIcon(i)}
                  style={{
                    height: '42px', borderRadius: '12px', fontSize: '1.25rem',
                    background: icon === i ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                    border: icon === i ? '1.5px solid var(--primary)' : '1px solid transparent',
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

const BusinessDashboard = ({ 
  businesses = [], 
  addBusiness, 
  deleteBusiness, 
  updateBusiness, 
  transactions = [], 
  setTransactions, 
  workers = [], 
  setWorkers 
}) => {
  const [parentList] = useAutoAnimate();
  const [parentWorkers] = useAutoAnimate();
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
  const [activeTab, setActiveTab] = useState('finances'); // finances, workers, calculator
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerType, setWorkerType] = useState('recolector_arroba');
  const [workerRate, setWorkerRate] = useState('');
  const [payWorkerId, setPayWorkerId] = useState(null);
  const [payUnitsMode, setPayUnitsMode] = useState('@'); // '@' o 'kg' o 'dia'
  const [kgInputValue, setKgInputValue] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('Recolectar');
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // 1. Business Context Memos
  const activeBusiness = useMemo(() => {
    if (activeBusinessId) {
      const found = businesses.find(b => b.id === activeBusinessId);
      if (found) return found;
    }
    return businesses[0] || null;
  }, [businesses, activeBusinessId]);

  useEffect(() => {
    if (!activeBusinessId && businesses.length > 0) {
      setActiveBusinessId(businesses[0].id);
    }
  }, [businesses, activeBusinessId]);

  const bizType = useMemo(() => {
    if (!activeBusiness || !activeBusiness.type) return 'other';
    const type = activeBusiness.type.toLowerCase();
    if (type.includes('café') || type.includes('cafe')) return 'coffee';
    if (type.includes('ganadería') || type.includes('ganaderia')) return 'livestock';
    return 'other';
  }, [activeBusiness]);

  const isFinca = bizType === 'coffee';

  // 2. Data Memos
  const activeBizTxs = useMemo(() => (transactions || []).filter(t => t.businessId === activeBusiness?.id), [transactions, activeBusiness]);
  const activeWorkers = useMemo(() => (workers || []).filter(w => w.businessId === activeBusiness?.id), [workers, activeBusiness]);

  const stats = useMemo(() => {
    const income = activeBizTxs.filter(t => t.type === 'income').reduce((a, b) => a + (b.amount || 0), 0);
    const expense = activeBizTxs.filter(t => t.type === 'expense').reduce((a, b) => a + (b.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [activeBizTxs]);

  const harvestStats = useMemo(() => {
    let totalArrobas = 0;
    let totalHarvestPaid = 0;
    activeBizTxs.forEach(t => {
      if (t.type === 'expense') {
        const m = t.description?.match(/([\d.]+)\s*@/);
        if (m) {
          totalArrobas += parseFloat(m[1]) || 0;
          totalHarvestPaid += t.amount || 0;
        }
      }
    });
    const avgCostPerArroba = totalArrobas > 0 ? (totalHarvestPaid / totalArrobas) : 0;
    return {
      totalArrobas,
      totalHarvestPaid,
      avgCostPerArroba,
      activeWorkerCount: activeWorkers.length
    };
  }, [activeBizTxs, activeWorkers]);

  // Default quick actions if none exist
  useEffect(() => {
    if (activeBusiness && (!activeBusiness.quickActions || activeBusiness.quickActions.length === 0)) {
      const defaultActions = isFinca ? [
        { id: '1', name: 'Venta Café Pergamino', amount: 0, type: 'income', icon: '☕' },
        { id: '2', name: 'Venta Pasilla', amount: 0, type: 'income', icon: '🌾' },
        { id: '3', name: 'Abono / Fertilizante', amount: 0, type: 'expense', icon: '🌱' },
        { id: '4', name: 'Combustible Guadaña', amount: 0, type: 'expense', icon: '🚜' }
      ] : [
        { id: '1', name: 'Venta de Productos', amount: 0, type: 'income', icon: '🛍️' },
        { id: '2', name: 'Pago Proveedor', amount: 0, type: 'expense', icon: '📦' }
      ];
      updateBusiness(activeBusiness.id, { quickActions: defaultActions });
    }
  }, [activeBusiness, isFinca]);

  // 4. Handlers
  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    
    const id = Date.now().toString();
    const type = newBizType === 'Finca' ? newBizSubtype : newBizType;
    
    addBusiness({
      id,
      name: newBizName,
      type,
      dailyRate: 50000,
      arrobaRate: 15000
    });
    
    if (newBizCapital && parseFloat(newBizCapital) > 0) {
      const initialTx = {
        id: (Date.now() + 1).toString(),
        businessId: id,
        description: 'Capital Inicial / Inversión',
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
    
    if (!desc.trim() || !amountStr || !activeBusiness?.id) return;

    const newTx = {
      id: Date.now().toString(),
      businessId: activeBusiness.id,
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
    updateBusiness(activeBusiness.id, { quickActions: updatedActions });
    setShowActionForm(false);
    setEditingAction(null);
  };

  const deleteQuickAction = (actionId) => {
    if (window.confirm('¿Eliminar esta acción rápida?')) {
      const updatedActions = (activeBusiness.quickActions || []).filter(a => a.id !== actionId);
      updateBusiness(activeBusiness.id, { quickActions: updatedActions });
      setMenuOpenId(null);
    }
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!workerName.trim()) return;
    
    const newWorker = {
      id: Date.now().toString(),
      businessId: activeBusiness.id,
      name: workerName.trim(),
      type: workerType
    };
    setWorkers(prev => [...prev, newWorker]);
    setIsAddingWorker(false);
    setWorkerName('');
  };

  if (businesses.length === 0 || isAddingBusiness) {
    return (
      <div className="animate-fade" style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary)' }}>
          {businesses.length === 0 ? '🌱 Registra tu Primer Negocio o Finca' : '🌾 Agregar Nuevo Negocio'}
        </h2>
        <form onSubmit={handleAddBusiness} className="card" style={{ margin: 0, padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600' }}>Nombre del Negocio o Finca</label>
            <input type="text" value={newBizName} onChange={e => setNewBizName(e.target.value)} placeholder="Ej: Finca La Esperanza..." required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600' }}>Categoría Principal</label>
            <select value={newBizType} onChange={e => setNewBizType(e.target.value)}>
              <option value="Finca">🚜 Finca / Agropecuario</option>
              <option value="Comercio">🛍️ Comercio / Tienda</option>
              <option value="Servicios">🛠️ Prestación de Servicios</option>
              <option value="Gastronomía">🍽️ Gastronomía / Restaurante</option>
              <option value="Digital">💻 Negocio Digital / Freelance</option>
              <option value="Otro">❓ Otro</option>
            </select>
          </div>

          {newBizType === 'Finca' && (
            <div style={{ marginBottom: '16px', background: 'rgba(var(--primary-rgb), 0.06)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.15)' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                ☕ Actividad Agrícola
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['Café', 'Ganadería', 'Cacao', 'General'].map(t => (
                  <button key={t} type="button" onClick={() => setNewBizSubtype(t)}
                    style={{ 
                      padding: '12px', borderRadius: '12px', border: '1px solid',
                      background: newBizSubtype === t ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                      color: newBizSubtype === t ? '#090d16' : '#fff',
                      borderColor: newBizSubtype === t ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                      fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
                    }}>
                    {t === 'Café' ? '☕ Café' : t === 'Ganadería' ? '🐄 Ganadería' : t === 'Cacao' ? '🍫 Cacao' : '🍏 Otro Cultivo'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: '600' }}>Capital Inicial Disponible (Opcional)</label>
            <input type="text" inputMode="numeric" placeholder="$ 0" 
              value={formatInputAmount(newBizCapital)} 
              onChange={e => setNewBizCapital(parseInputAmount(e.target.value))} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {businesses.length > 0 && (
              <button type="button" onClick={() => setIsAddingBusiness(false)} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px' }}>
              Crear y Empezar
            </button>
          </div>
        </form>
      </div>
    );
  }

  const quickActions = activeBusiness?.quickActions || [];

  return (
    <div className="animate-fade" style={{ padding: '0 0 20px' }}>
      {/* Selector de Negocios Horizontales */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 14px', scrollbarWidth: 'none' }}>
        {businesses.map(b => (
          <button 
            key={b.id} 
            onClick={() => { setActiveBusinessId(b.id); }}
            style={{ 
              padding: '10px 16px', borderRadius: '14px', border: '1px solid', whiteSpace: 'nowrap',
              background: b.id === activeBusiness?.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              borderColor: b.id === activeBusiness?.id ? 'var(--primary)' : 'var(--glass-border)',
              color: b.id === activeBusiness?.id ? '#090d16' : 'var(--text-main)',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <span>{b.type?.toLowerCase().includes('caf') ? '☕' : '💼'}</span>
            {b.name}
          </button>
        ))}
        <button 
          onClick={() => setIsAddingBusiness(true)}
          style={{ 
            padding: '10px 14px', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.2)', 
            background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', 
            whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.82rem' 
          }}
        >
          + Agregar Finca
        </button>
      </div>

      {activeBusiness && (
        <div style={{ padding: '0 16px' }}>
          {/* Card de Balance del Negocio */}
          <div className="card" style={{ margin: '0 0 16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{activeBusiness.name}</h2>
                  <span style={{ 
                    fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(var(--primary-rgb), 0.12)', 
                    borderRadius: '8px', color: 'var(--primary)', fontWeight: '700', border: '1px solid rgba(var(--primary-rgb), 0.25)' 
                  }}>
                    {activeBusiness.type}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  👥 {activeWorkers.length} {activeWorkers.length === 1 ? 'Trabajador registrado' : 'Trabajadores registrados'}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`¿Eliminar el negocio "${activeBusiness.name}"?`)) {
                    deleteBusiness(activeBusiness.id);
                  }
                }} 
                style={{ background: 'rgba(255,59,48,0.1)', border: 'none', borderRadius: '8px', padding: '6px', color: '#ff3b30', cursor: 'pointer' }}
                title="Eliminar Negocio"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Saldo Neto del Negocio */}
            <div style={{ margin: '14px 0 16px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                Utilidad Neta / Caja
              </span>
              <p style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.03em', color: stats.balance >= 0 ? '#ffffff' : 'var(--expense)' }}>
                {formatCurrency(stats.balance)}
              </p>
            </div>

            {/* Ingresos vs Gastos del Negocio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(52, 199, 89, 0.08)', padding: '12px 14px', borderRadius: '16px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Ventas / Ingresos</span>
                <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--income)', marginTop: '2px' }}>
                  +{formatCurrency(stats.income)}
                </p>
              </div>
              <div style={{ background: 'rgba(255, 59, 48, 0.08)', padding: '12px 14px', borderRadius: '16px', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Costos Operativos</span>
                <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--expense)', marginTop: '2px' }}>
                  -{formatCurrency(stats.expense)}
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas Interiores (Finanzas | Trabajadores & Cosecha) */}
          <div className="glass-tabs">
            <button 
              onClick={() => setActiveTab('finances')} 
              className={`glass-tab ${activeTab === 'finances' ? 'active' : ''}`}
            >
              <Briefcase size={15} />
              Finanzas
            </button>
            <button 
              onClick={() => setActiveTab('workers')} 
              className={`glass-tab ${activeTab === 'workers' ? 'active' : ''}`}
            >
              <Users size={15} />
              Trabajadores & Pagos ({activeWorkers.length})
            </button>
          </div>

          {/* TAB 1: FINANZAS Y REGISTRO RÁPIDO */}
          {activeTab === 'finances' && (
            <div className="animate-fade">
              {/* Botones de Acción Rápida */}
              {!isAddingTx && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      REGISTRO RÁPIDO 1-TOQUE
                    </p>
                  </div>
                  <div className="varios-grid" style={{ padding: 0 }}>
                    {quickActions.map(action => (
                      <div 
                        key={action.id} 
                        className="menu-item" 
                        style={{ height: 'auto', minHeight: '110px', padding: '14px', position: 'relative' }} 
                        onClick={() => handleQuickAction(action)}
                      >
                        <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === action.id ? null : action.id); }} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', padding: '4px' }}
                          >
                            ⋮
                          </button>
                          {menuOpenId === action.id && (
                            <div className="card" style={{ position: 'absolute', right: 0, top: '24px', padding: '4px', zIndex: 20, minWidth: '90px' }}>
                              <button onClick={(e) => { e.stopPropagation(); setEditingAction(action); setShowActionForm(true); setMenuOpenId(null); }} style={{ background: 'none', border: 'none', color: 'white', display: 'block', width: '100%', padding: '8px', fontSize: '0.75rem', textAlign: 'left' }}>✏️ Editar</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteQuickAction(action.id); }} style={{ background: 'none', border: 'none', color: '#ff3b30', display: 'block', width: '100%', padding: '8px', fontSize: '0.75rem', textAlign: 'left' }}>🗑️ Borrar</button>
                            </div>
                          )}
                        </div>
                        <div className="icon" style={{ fontSize: '1.4rem', marginBottom: '6px', background: action.type === 'income' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)' }}>
                          {action.icon}
                        </div>
                        <span className="label" style={{ fontSize: '0.82rem' }}>{action.name}</span>
                        {action.amount > 0 && (
                          <p style={{ fontSize: '0.72rem', color: action.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: '800', marginTop: '2px' }}>
                            {formatCurrency(action.amount)}
                          </p>
                        )}
                      </div>
                    ))}
                    <button 
                      className="menu-item" 
                      onClick={() => { setEditingAction(null); setShowActionForm(true); }} 
                      style={{ minHeight: '110px', border: '1.5px dashed rgba(255,255,255,0.15)', background: 'transparent', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <div className="icon" style={{ background: 'none', border: '1.5px dashed rgba(255,255,255,0.2)', opacity: 0.6 }}>+</div>
                      <span className="label" style={{ opacity: 0.6, fontSize: '0.8rem' }}>Nueva Acción</span>
                    </button>
                  </div>
                </div>
              )}

              {showActionForm && (
                <QuickActionModal action={editingAction} onSave={saveQuickAction} onClose={() => { setShowActionForm(false); setEditingAction(null); }} />
              )}

              {/* Botón y Formulario de Movimiento Manual */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Movimientos del Negocio</h3>
                <button 
                  onClick={() => setIsAddingTx(!isAddingTx)} 
                  className="btn-primary" 
                  style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '0.82rem' }}
                >
                  {isAddingTx ? 'Cancelar' : '+ Manual'}
                </button>
              </div>

              {isAddingTx && (
                <form onSubmit={(e) => handleAddTx(e)} className="card animate-fade" style={{ margin: '0 0 16px', padding: '18px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <button type="button" onClick={() => setTxType('income')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'income' ? 'rgba(52, 199, 89, 0.22)' : 'rgba(255,255,255,0.05)', color: txType === 'income' ? 'var(--income)' : 'white', fontWeight: '700' }}>+ Ingreso</button>
                    <button type="button" onClick={() => setTxType('expense')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: txType === 'expense' ? 'rgba(255, 59, 48, 0.22)' : 'rgba(255,255,255,0.05)', color: txType === 'expense' ? 'var(--expense)' : 'white', fontWeight: '700' }}>- Gasto</button>
                  </div>
                  <input type="text" placeholder="Concepto (Ej: Venta de café, Abono...)" value={txDesc} onChange={e => setTxDesc(e.target.value)} required />
                  <input type="text" inputMode="numeric" placeholder="$ 0" value={formatInputAmount(txAmount)} onChange={e => setTxAmount(parseInputAmount(e.target.value))} required style={{ marginTop: '10px', fontSize: '1.4rem', fontWeight: '800', textAlign: 'center' }} />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '16px' }}>Guardar Movimiento</button>
                </form>
              )}

              {/* Lista de movimientos */}
              <div ref={parentList} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeBizTxs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px 0', fontSize: '0.85rem' }}>
                    No hay movimientos en este negocio aún.
                  </p>
                ) : (
                  activeBizTxs.map(tx => (
                    <div 
                      key={tx.id} 
                      className="card" 
                      style={{ 
                        margin: 0, padding: '12px 14px', display: 'flex', 
                        justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div style={{ 
                          width: '38px', height: '38px', borderRadius: '12px', 
                          background: tx.type === 'income' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 
                        }}>
                          {tx.type === 'income' ? '📈' : '📉'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontWeight: '700', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.description}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {tx.description?.includes(':') && (
                          <button
                            title="Ver Recibo Digital"
                            onClick={() => {
                              const parts = tx.description.split(':');
                              const act = parts[0]?.trim() || 'Pago';
                              const rest = parts[1]?.trim() || '';
                              const matchWorker = rest.match(/^(.*?)\s*\((.*?)\)$/);
                              const workerName = matchWorker ? matchWorker[1] : rest;
                              const qtyUnit = matchWorker ? matchWorker[2] : '';
                              const [qtyVal, unit] = qtyUnit.split(' ');
                              const qtyNum = parseFloat(qtyVal) || 1;
                              const unitLabel = unit || '';
                              const rate = qtyNum > 0 ? (tx.amount / qtyNum) : tx.amount;

                              setCurrentReceipt({
                                id: `REC-${String(tx.id).slice(-6)}`,
                                workerName: workerName || 'Trabajador',
                                workerType: unitLabel.includes('@') ? 'Cogedor (@)' : 'Jornalero',
                                activity: act,
                                quantity: qtyNum,
                                unitLabel: unitLabel || 'Día',
                                rate: rate,
                                total: tx.amount,
                                businessName: activeBusiness?.name || 'Finca Cafetera',
                                date: new Date(tx.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                              });
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              padding: '4px 6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <ReceiptText size={14} color="var(--primary)" />
                          </button>
                        )}
                        <span style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: '800', fontSize: '0.92rem' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <button 
                          onClick={() => { 
                            if(window.confirm('¿Eliminar este movimiento?')) {
                              setTransactions(prev => prev.filter(t => t.id !== tx.id)); 
                            }
                          }} 
                          style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TRABAJADORES, COSECHA & LIQUIDACIÓN */}
          {activeTab === 'workers' && (
            <div className="animate-fade">
              {/* AgroTech Harvest Summary Banner */}
              {isFinca && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(52,199,89,0.14), rgba(0,0,0,0.3))',
                    border: '1px solid rgba(52,199,89,0.25)',
                    borderRadius: '18px',
                    padding: '12px 10px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.2rem', display: 'block' }}>☕</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Cosechadas</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34c759', marginTop: '2px' }}>
                      {harvestStats.totalArrobas.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>@</span>
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,149,0,0.14), rgba(0,0,0,0.3))',
                    border: '1px solid rgba(255,149,0,0.25)',
                    borderRadius: '18px',
                    padding: '12px 6px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.2rem', display: 'block' }}>💰</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Liquidado</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ff9500', marginTop: '4px' }}>
                      {formatCurrency(harvestStats.totalHarvestPaid)}
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(191,90,242,0.14), rgba(0,0,0,0.3))',
                    border: '1px solid rgba(191,90,242,0.25)',
                    borderRadius: '18px',
                    padding: '12px 10px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.2rem', display: 'block' }}>👷</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Personal</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: '900', color: '#bf5af2', marginTop: '2px' }}>
                      {activeWorkers.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Tarifas de la Finca */}
              {isFinca && (
                <div className="card" style={{ margin: '0 0 16px', padding: '16px', background: 'rgba(var(--primary-rgb), 0.04)', border: '1px solid rgba(var(--primary-rgb), 0.15)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '10px' }}>
                    ⚙️ TARIFAS VIGENTES DE LA FINCA
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Precio Día / Jornal</label>
                      <input 
                        type="text" 
                        inputMode="numeric" 
                        placeholder="$ 50.000" 
                        value={formatInputAmount(activeBusiness.dailyRate || '')} 
                        onChange={e => updateBusiness(activeBusiness.id, { dailyRate: parseInputAmount(e.target.value) })} 
                        style={{ fontSize: '0.9rem', padding: '10px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Precio Arroba (@)</label>
                      <input 
                        type="text" 
                        inputMode="numeric" 
                        placeholder="$ 15.000" 
                        value={formatInputAmount(activeBusiness.arrobaRate || '')} 
                        onChange={e => updateBusiness(activeBusiness.id, { arrobaRate: parseInputAmount(e.target.value) })} 
                        style={{ fontSize: '0.9rem', padding: '10px' }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botón y formulario para agregar trabajador */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Nómina y Operarios</h3>
                <button 
                  onClick={() => setIsAddingWorker(!isAddingWorker)} 
                  className="btn-primary" 
                  style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '0.82rem' }}
                >
                  {isAddingWorker ? 'Cancelar' : '+ Nuevo Trabajador'}
                </button>
              </div>

              {isAddingWorker && (
                <form onSubmit={handleAddWorker} className="card animate-fade" style={{ margin: '0 0 16px', padding: '18px' }}>
                  <input type="text" placeholder="Nombre completo del trabajador" value={workerName} onChange={e => setWorkerName(e.target.value)} required />
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginTop: '10px', marginBottom: '6px' }}>Rol predeterminado</label>
                  <select value={workerType} onChange={e => setWorkerType(e.target.value)}>
                    <option value="recolector_arroba">Cogedor de Café (@ Arroba)</option>
                    <option value="jornal">Jornalero (Día)</option>
                    <option value="administrador">Administrador / Mayordomo</option>
                  </select>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '14px' }}>Guardar Trabajador</button>
                </form>
              )}

              {/* Lista de Trabajadores */}
              <div ref={parentWorkers} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeWorkers.length === 0 && !isAddingWorker && (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px 0', fontSize: '0.85rem' }}>
                    No tienes trabajadores registrados en esta finca aún.
                  </p>
                )}

                {activeWorkers.map(w => {
                  const isPaying = payWorkerId === w.id;

                  // Dual calculator logic: Kg to @ or direct @
                  const calculatedUnits = payUnitsMode === 'kg'
                    ? ((parseFloat(kgInputValue) || 0) / 12.5) // 1 arroba = 12.5 kg
                    : (parseFloat(workerRate) || 0);

                  const currentRate = (selectedActivity === 'Recolectar' && (payUnitsMode === '@' || payUnitsMode === 'kg'))
                    ? (activeBusiness.arrobaRate || 15000)
                    : (activeBusiness.dailyRate || 50000);

                  const totalPayAmount = calculatedUnits * currentRate;

                  return (
                    <div 
                      key={w.id} 
                      className="card" 
                      style={{ 
                        margin: 0, padding: '16px', borderRadius: '20px', 
                        border: isPaying ? '1px solid var(--primary)' : '1px solid var(--glass-border)' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '42px', height: '42px', borderRadius: '50%', 
                            background: 'rgba(var(--primary-rgb), 0.12)', 
                            border: '1px solid rgba(var(--primary-rgb), 0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' 
                          }}>
                            👷
                          </div>
                          <div>
                            <p style={{ fontWeight: '800', fontSize: '0.96rem' }}>{w.name}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {w.type === 'recolector_arroba' ? 'Cogedor de Café (@)' : 'Jornalero / Día'}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              if (isPaying) {
                                setPayWorkerId(null);
                              } else {
                                setPayWorkerId(w.id);
                                setSelectedActivity('Recolectar');
                                setPayUnitsMode('@');
                                setWorkerRate('');
                                setKgInputValue('');
                              }
                            }} 
                            style={{ 
                              padding: '8px 16px', borderRadius: '12px', border: 'none',
                              background: isPaying ? 'rgba(255,255,255,0.1)' : 'var(--primary)', 
                              color: isPaying ? 'white' : '#090d16', 
                              fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                            }}
                          >
                            {isPaying ? 'Cerrar' : 'Pagar / Liquidar'}
                          </button>
                          <button 
                            onClick={() => { 
                              if(window.confirm(`¿Eliminar a ${w.name}?`)) {
                                setWorkers(prev => prev.filter(x => x.id !== w.id)); 
                              }
                            }} 
                            style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', padding: '4px', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Panel de Liquidación AgroTech */}
                      {isPaying && (
                        <div className="animate-fade" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          {/* Actividad */}
                          <div style={{ marginBottom: '14px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                              Labor Realizada
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                              {['Recolectar', 'Guadañar', 'Abonar', 'Fumigar'].map(act => (
                                <button 
                                  key={act} 
                                  type="button"
                                  onClick={() => setSelectedActivity(act)}
                                  style={{ 
                                    padding: '8px 4px', borderRadius: '10px', border: '1px solid',
                                    background: selectedActivity === act ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent',
                                    borderColor: selectedActivity === act ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                    color: selectedActivity === act ? 'var(--primary)' : 'white',
                                    fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer'
                                  }}
                                >
                                  {act}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Modo de Medida para Recolección (Kilos con conversión vs Arroba directa vs Día) */}
                          {selectedActivity === 'Recolectar' && (
                            <div style={{ marginBottom: '14px' }}>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Modo de Medición (Báscula)
                              </label>
                              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '12px' }}>
                                <button 
                                  type="button"
                                  onClick={() => setPayUnitsMode('@')} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '9px', border: 'none', 
                                    background: payUnitsMode === '@' ? 'rgba(var(--primary-rgb), 0.25)' : 'transparent', 
                                    color: payUnitsMode === '@' ? 'var(--primary)' : 'white', 
                                    fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' 
                                  }}
                                >
                                  Arrobas Directas (@)
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setPayUnitsMode('kg')} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '9px', border: 'none', 
                                    background: payUnitsMode === 'kg' ? 'rgba(0,122,255,0.25)' : 'transparent', 
                                    color: payUnitsMode === 'kg' ? '#007aff' : 'white', 
                                    fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' 
                                  }}
                                >
                                  ⚖️ Kilos (Kg ➔ @)
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setPayUnitsMode('dia')} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '9px', border: 'none', 
                                    background: payUnitsMode === 'dia' ? 'rgba(255,255,255,0.15)' : 'transparent', 
                                    color: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' 
                                  }}
                                >
                                  Día / Pepeo
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Inputs según el modo */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'flex-end', marginBottom: '14px' }}>
                            <div>
                              {payUnitsMode === 'kg' && selectedActivity === 'Recolectar' ? (
                                <>
                                  <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                    Pesaje en Kilos (Kg)
                                  </label>
                                  <input 
                                    type="number" step="0.5" placeholder="Ej: 125 kg" 
                                    value={kgInputValue}
                                    onChange={e => setKgInputValue(e.target.value)}
                                    style={{ fontSize: '1.2rem', fontWeight: '800', textAlign: 'center' }}
                                  />
                                  <p style={{ fontSize: '0.68rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>
                                    = {calculatedUnits.toFixed(2)} @
                                  </p>
                                </>
                              ) : (
                                <>
                                  <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                    {(selectedActivity === 'Recolectar' && payUnitsMode === '@') ? 'Cantidad de Arrobas (@)' : 'Días Trabajados'}
                                  </label>
                                  <input 
                                    type="number" step="0.25" placeholder="0" 
                                    value={workerRate}
                                    onChange={e => setWorkerRate(e.target.value)}
                                    style={{ fontSize: '1.2rem', fontWeight: '800', textAlign: 'center' }}
                                  />
                                </>
                              )}
                            </div>

                            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                Tarifa: {formatCurrency(currentRate)}
                              </p>
                              <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>Total a Pagar</p>
                              <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--expense)' }}>
                                {formatCurrency(totalPayAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Botón de Confirmación y Generación de Recibo */}
                          <button 
                            type="button"
                            disabled={totalPayAmount <= 0}
                            onClick={() => {
                              const qty = calculatedUnits;
                              const unitLabel = (selectedActivity === 'Recolectar' && (payUnitsMode === '@' || payUnitsMode === 'kg')) ? '@' : 'Días';
                              const desc = `${selectedActivity}: ${w.name} (${qty.toFixed(1)} ${unitLabel})`;
                              handleAddTx(null, desc, 'expense', totalPayAmount);

                              const receiptData = {
                                id: `REC-${Date.now().toString().slice(-6)}`,
                                workerName: w.name,
                                workerType: unitLabel.includes('@') ? 'Cogedor de Café (@)' : 'Jornalero',
                                activity: selectedActivity,
                                quantity: qty.toFixed(1),
                                unitLabel: unitLabel,
                                rate: currentRate,
                                total: totalPayAmount,
                                businessName: activeBusiness?.name || 'Finca Cafetera',
                                date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                notes: payUnitsMode === 'kg' ? `Pesaje original: ${kgInputValue} kg (1 @ = 12.5 kg)` : ''
                              };

                              setCurrentReceipt(receiptData);
                              try {
                                confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
                              } catch (err) {
                                console.warn(err);
                              }

                              setPayWorkerId(null);
                              setWorkerRate('');
                              setKgInputValue('');
                            }}
                            className="btn-primary" 
                            style={{ width: '100%', padding: '14px', fontSize: '0.92rem' }}
                          >
                            Confirmar Pago y Generar Comprobante 🧾
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprobante Digital Modal con WhatsApp Share */}
      <ReceiptModal 
        receipt={currentReceipt} 
        onClose={() => setCurrentReceipt(null)} 
      />
    </div>
  );
};

export default BusinessDashboard;
