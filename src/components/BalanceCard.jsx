import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const BalanceCard = ({ totalBalance, income, expenses, accounts = [], accountBalances = {}, hideBalance = false, username, totalPiggySavings = 0, banks = [], onAddBank, onDeleteBank, onAdjustSavings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [savingsInput, setSavingsInput] = useState('');

  const mask = (val) => hideBalance ? '••••••' : formatCurrency(val);

  return (
    <div className="card animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Balance Total</p>
        <span style={{ fontSize: '1.6rem', color: 'var(--primary)', fontWeight: '700', opacity: 0.9 }}>
          {username ? `${username}` : ''}
        </span>
      </div>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', transition: 'opacity 0.2s', letterSpacing: '-0.02em' }}>
        {mask(totalBalance)}
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Ingresos</p>
          <p style={{ color: 'var(--income)', fontWeight: '600' }}>+{mask(income)}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Gastos</p>
          <p style={{ color: 'var(--expense)', fontWeight: '600' }}>-{mask(expenses)}</p>
        </div>
      </div>

      {/* Desglose por cuentas */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
        paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        {accounts.map(acc => (
          <div 
            key={acc.id} 
            onClick={() => {
              if (acc.id === 'bank') setIsModalOpen(true);
              if (acc.id === 'savings') {
                setSavingsInput(accountBalances.savings.toString());
                setIsSavingsModalOpen(true);
              }
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '12px',
              cursor: (acc.id === 'bank' || acc.id === 'savings') ? 'pointer' : 'default',
              border: (acc.id === 'bank' || acc.id === 'savings') ? '1px solid rgba(255,255,255,0.05)' : 'none',
              transition: 'transform 0.2s'
            }}
            className={acc.id === 'bank' ? 'hover-scale' : ''}
          >
            <span style={{ fontSize: '1rem' }}>{acc.icon}</span>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', position: 'relative' }}>
                {acc.label}
                {acc.id === 'bank' && <span style={{ fontSize: '0.5rem', marginLeft: '4px', opacity: 0.5 }}>▼</span>}
              </p>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: accountBalances[acc.id] < 0 ? 'var(--expense)' : 'white' }}>
                {mask(accountBalances[acc.id])}
              </p>
            </div>
          </div>
        ))}
        {/* Card de Cochinitos dentro del grid */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(var(--primary-rgb), 0.1)', padding: '8px 10px', borderRadius: '12px',
          border: '1px solid rgba(var(--primary-rgb), 0.15)'
        }}>
          <span style={{ fontSize: '1rem' }}>💰</span>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600' }}>Cochinitos</p>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>
              {mask(totalPiggySavings)}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE BANCOS */}
      {isModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '400px', maxHeight: '80vh', 
            overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Mis Bancos 🏛️</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {banks.map(b => (
                <div key={b.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px'
                }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{b.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Saldo: {mask(accountBalances.bankDetails?.[b.id] || 0)}</p>
                  </div>
                  <button onClick={() => onDeleteBank(b.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.5)', cursor: 'pointer' }}>🗑️</button>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>+ Agregar nuevo banco</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" value={newBankName} onChange={e => setNewBankName(e.target.value)} 
                  placeholder="Nombre del banco..." style={{ margin: 0, padding: '10px 14px' }}
                />
                <button 
                  onClick={() => {
                    if (newBankName.trim()) {
                      onAddBank(newBankName.trim());
                      setNewBankName('');
                    }
                  }}
                  disabled={!newBankName.trim()}
                  className="btn-primary" style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                >Añadir</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE AJUSTE DE AHORROS */}
      {isSavingsModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', background: 'var(--bg-card)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>💰 Ajustar Ahorros</h3>
              <button onClick={() => setIsSavingsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: '1.4' }}>
              Ingresa el saldo total actual que tienes en tus ahorros. El sistema creará un movimiento de ajuste automáticamente.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nuevo Saldo</label>
              <input 
                type="text" inputMode="numeric"
                value={formatInputAmount(savingsInput)} 
                onChange={e => setSavingsInput(parseInputAmount(e.target.value))}
                placeholder="$ 0"
                style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', color: 'var(--primary)' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsSavingsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onAdjustSavings(parseFloat(savingsInput) || 0);
                  setIsSavingsModalOpen(false);
                }}
                className="btn-primary" style={{ flex: 1.5, padding: '12px' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
