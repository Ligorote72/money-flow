import React from 'react';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/helpers';

const TransactionList = ({ transactions, onEdit, onDelete, hideBalance, banks }) => {
  const getAccName = (id) => {
    if (id === 'cash') return 'Efectivo';
    if (id === 'savings') return 'Ahorros';
    if (id === 'bank' || id === 'general') return 'Banco Principal';
    const b = banks?.find(b => b.id === id);
    return b ? b.name : id;
  };

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🪙</div>
        <p style={{ lineHeight: 1.6 }}>Sin movimientos registrados.<br/>Pulsa "+" para registrar uno.</p>
      </div>
    );
  }

  const groups = {};
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    if (d.toDateString() === today.toDateString()) dateKey = 'Hoy';
    else if (d.toDateString() === yesterday.toDateString()) dateKey = 'Ayer';
    
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px 0' }}>
      {Object.entries(groups).map(([date, txs]) => (
        <div key={date} style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{date}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {txs.map(tx => {
              const isTransfer = tx.type === 'transfer';
              const cat = isTransfer ? { icon: '🔄', color: 'var(--primary)', label: 'Traspaso' } : getCategoryById(tx.category);

              return (
                <div key={tx.id} className="card animate-fade" onClick={() => onEdit(tx)}
                  style={{ margin: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {cat.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>{tx.description}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                        {isTransfer 
                          ? `${getAccName(tx.accountId)} ➔ ${getAccName(tx.toAccountId)}` 
                          : `${cat.label} · ${getAccName(tx.accountId)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ color: isTransfer ? 'white' : (tx.type === 'income' ? 'var(--income)' : 'var(--expense)'), fontWeight: '800', fontSize: '1.05rem' }}>
                      {hideBalance ? '••••' : `${isTransfer ? '' : (tx.type === 'income' ? '+' : '-')}${formatCurrency(tx.amount)}`}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }} title="Eliminar"
                      style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.3)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
