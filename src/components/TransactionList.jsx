import React, { useState, useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/helpers';
import { ReceiptText, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Search } from 'lucide-react';
import ReceiptModal from './ui/ReceiptModal';

const TransactionList = ({ 
  transactions = [], 
  onEdit, 
  onDelete, 
  hideBalance, 
  banks = [], 
  searchQuery = '', 
  onQuickAdd 
}) => {
  const [parent] = useAutoAnimate();
  const [filterType, setFilterType] = useState('all'); // all, income, expense, transfer
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const getAccName = (id) => {
    if (id === 'cash') return 'Efectivo';
    if (id === 'savings') return 'Ahorros';
    if (id === 'bank' || id === 'general') return 'Banco Principal';
    const b = banks?.find(b => b.id === id);
    return b ? b.name : id;
  };

  // Helper to highlight matching text in search
  const highlightMatch = (text, query) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  // Filter transactions by type tab (all, income, expense, transfer)
  const displayedTxs = useMemo(() => {
    if (filterType === 'all') return transactions;
    return transactions.filter(tx => tx.type === filterType);
  }, [transactions, filterType]);

  // Group by relative day (Hoy, Ayer, o fecha)
  const groups = useMemo(() => {
    const map = {};
    displayedTxs.forEach(tx => {
      const d = new Date(tx.date);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      if (d.toDateString() === today.toDateString()) dateKey = 'Hoy';
      else if (d.toDateString() === yesterday.toDateString()) dateKey = 'Ayer';
      
      if (!map[dateKey]) map[dateKey] = { txs: [], totalIncome: 0, totalExpense: 0 };
      map[dateKey].txs.push(tx);
      if (tx.type === 'income') map[dateKey].totalIncome += tx.amount;
      if (tx.type === 'expense') map[dateKey].totalExpense += tx.amount;
    });
    return map;
  }, [displayedTxs]);

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 20px 32px', color: 'var(--text-dim)' }} className="animate-fade">
        <div style={{ 
          width: '70px', height: '70px', borderRadius: '50%', 
          background: 'rgba(var(--primary-rgb), 0.1)', 
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', border: '1px solid rgba(var(--primary-rgb), 0.25)'
        }}>
          💎
        </div>
        <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '6px' }}>Sin movimientos registrados</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: '280px', margin: '0 auto 18px', lineHeight: 1.5 }}>
          Comienza a registrar tus ingresos y gastos para ver el análisis de tu dinero.
        </p>
        {onQuickAdd && (
          <button onClick={onQuickAdd} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
            + Registrar Primer Movimiento
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0 16px' }} className="animate-fade">
      {/* Filter Tabs Chips */}
      <div className="filter-chips">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'income', label: 'Ingresos' },
          { id: 'expense', label: 'Gastos' },
          { id: 'transfer', label: 'Traspasos' }
        ].map(chip => (
          <button 
            key={chip.id} 
            onClick={() => setFilterType(chip.id)}
            className={`chip-btn ${filterType === chip.id ? 'active' : ''}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {displayedTxs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: '0.88rem' }}>No hay movimientos en esta categoría.</p>
        </div>
      ) : (
        <div ref={parent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 16px' }}>
          {Object.entries(groups).map(([date, group]) => {
            const dayNet = group.totalIncome - group.totalExpense;
            return (
              <div key={date}>
                {/* Date Header with Daily Net Summary */}
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  marginBottom: '8px', padding: '0 4px' 
                }}>
                  <p style={{ 
                    fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', 
                    textTransform: 'uppercase', letterSpacing: '0.04em' 
                  }}>
                    {date}
                  </p>
                  <span style={{ 
                    fontSize: '0.7rem', fontWeight: '700', 
                    color: dayNet >= 0 ? 'var(--income)' : 'var(--expense)',
                    background: dayNet >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                    padding: '2px 8px', borderRadius: '10px'
                  }}>
                    {hideBalance ? '••••' : (dayNet >= 0 ? `+${formatCurrency(dayNet)}` : formatCurrency(dayNet))}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.txs.map(tx => {
                    const isTransfer = tx.type === 'transfer';
                    const isIncome = tx.type === 'income';
                    const cat = isTransfer 
                      ? { icon: '🔄', color: 'var(--primary)', label: 'Traspaso' } 
                      : getCategoryById(tx.category);

                    return (
                      <div 
                        key={tx.id} 
                        className="card" 
                        onClick={() => onEdit(tx)}
                        style={{ 
                          margin: 0, padding: '14px 16px', display: 'flex', 
                          justifyContent: 'space-between', alignItems: 'center', 
                          cursor: 'pointer', borderRadius: '18px',
                          border: '1px solid var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          <div style={{ 
                            width: '42px', height: '42px', borderRadius: '13px', 
                            background: `${cat.color}18`, 
                            border: `1px solid ${cat.color}35`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '1.25rem', flexShrink: 0 
                          }}>
                            {cat.icon}
                          </div>
                          <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                            <p style={{ 
                              fontWeight: '700', fontSize: '0.92rem', marginBottom: '3px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              color: 'white'
                            }}>
                              {highlightMatch(tx.description || cat.label, searchQuery)}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '600',
                                background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '6px'
                              }}>
                                {isTransfer 
                                  ? `${getAccName(tx.accountId)} ➔ ${getAccName(tx.toAccountId)}` 
                                  : getAccName(tx.accountId)
                                }
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                • {new Date(tx.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <span style={{ 
                            color: isTransfer ? '#fff' : (isIncome ? 'var(--income)' : 'var(--expense)'), 
                            fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.02em' 
                          }}>
                            {hideBalance ? '••••' : `${isTransfer ? '' : (isIncome ? '+' : '-')}${formatCurrency(tx.amount)}`}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Quick Receipt trigger */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceipt({
                                  id: `REC-${String(tx.id).slice(-6)}`,
                                  workerName: tx.description || 'Movimiento',
                                  businessName: 'MoneyFlow Personal',
                                  activity: cat.label,
                                  quantity: 1,
                                  unitLabel: 'Und',
                                  rate: tx.amount,
                                  total: tx.amount,
                                  date: new Date(tx.date).toLocaleString('es-CO'),
                                  notes: `Cuenta: ${getAccName(tx.accountId)}`
                                });
                              }}
                              title="Ver Recibo"
                              style={{ 
                                background: 'rgba(255,255,255,0.06)', border: 'none', 
                                color: 'var(--text-dim)', borderRadius: '6px', 
                                padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                              }}
                            >
                              <ReceiptText size={12} />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (window.confirm('¿Eliminar esta transacción?')) {
                                  onDelete(tx.id);
                                }
                              }} 
                              title="Eliminar"
                              style={{ 
                                background: 'none', border: 'none', 
                                color: 'rgba(255,59,48,0.4)', cursor: 'pointer', 
                                padding: '3px 4px', display: 'flex', alignItems: 'center'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}
    </div>
  );
};

export default TransactionList;
