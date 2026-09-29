import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import NumberTicker from './ui/NumberTicker';
import ShineBorder from './ui/ShineBorder';
import { ArrowUpRight, ArrowDownRight, Landmark, PiggyBank, Wallet, Plus, ChevronDown, Trash2, ArrowLeft, X } from 'lucide-react';

const BalanceCard = ({ 
  totalBalance, 
  income, 
  expenses, 
  accounts = [], 
  accountBalances = {}, 
  hideBalance = false, 
  username, 
  totalPiggySavings = 0, 
  banks = [], 
  onAddBank, 
  onDeleteBank, 
  onAdjustSavings, 
  onAddBankTransaction 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [savingsInput, setSavingsInput] = useState('');
  
  // Bank Transaction State
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankTxAmount, setBankTxAmount] = useState('');
  const [bankTxType, setBankTxType] = useState('expense');
  const [bankTxDesc, setBankTxDesc] = useState('');

  const mask = (val) => hideBalance ? '••••••' : formatCurrency(val);

  return (
    <div style={{ margin: '16px' }} className="animate-fade">
      <ShineBorder borderRadius={28} borderWidth={1.5} duration={7} color={['#c4fb6d', '#007AFF', '#34c759']}>
        <div style={{ padding: '24px' }}>
          {/* Header del Balance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' 
              }} />
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Balance Disponible
              </p>
            </div>
            {username && (
              <span style={{ 
                fontSize: '0.85rem', 
                color: 'var(--primary)', 
                fontWeight: '700',
                background: 'rgba(var(--primary-rgb), 0.1)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(var(--primary-rgb), 0.2)'
              }}>
                {username}
              </span>
            )}
          </div>

          {/* Saldo Principal con NumberTicker */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '2.6rem', 
              fontWeight: '800',
              lineHeight: 1.1, 
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <NumberTicker value={totalBalance} hide={hideBalance} />
            </h2>
          </div>

          {/* Tarjetas de Ingresos vs Gastos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              background: 'rgba(52, 199, 89, 0.08)', 
              padding: '12px 14px', 
              borderRadius: '16px',
              border: '1px solid rgba(52, 199, 89, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ 
                  background: 'rgba(52, 199, 89, 0.2)', 
                  borderRadius: '50%', padding: '4px', display: 'flex' 
                }}>
                  <ArrowUpRight size={14} color="#34c759" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '500' }}>Ingresos</span>
              </div>
              <p style={{ color: '#34c759', fontWeight: '700', fontSize: '1.05rem', margin: 0 }}>
                +{hideBalance ? '••••••' : formatCurrency(income)}
              </p>
            </div>

            <div style={{ 
              background: 'rgba(255, 59, 48, 0.08)', 
              padding: '12px 14px', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 59, 48, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ 
                  background: 'rgba(255, 59, 48, 0.2)', 
                  borderRadius: '50%', padding: '4px', display: 'flex' 
                }}>
                  <ArrowDownRight size={14} color="#ff3b30" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '500' }}>Gastos</span>
              </div>
              <p style={{ color: '#ff3b30', fontWeight: '700', fontSize: '1.05rem', margin: 0 }}>
                -{hideBalance ? '••••••' : formatCurrency(expenses)}
              </p>
            </div>
          </div>

          {/* Desglose por Cuentas y Cochinitos */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
            paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            {accounts.map(acc => {
              const isBank = acc.id === 'bank';
              const isSavings = acc.id === 'savings';
              const isClickable = isBank || isSavings;

              return (
                <div 
                  key={acc.id} 
                  onClick={() => {
                    if (isBank) setIsModalOpen(true);
                    if (isSavings) {
                      setSavingsInput(accountBalances.savings?.toString() || '0');
                      setIsSavingsModalOpen(true);
                    }
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', 
                    background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '14px',
                    cursor: isClickable ? 'pointer' : 'default',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{acc.icon}</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0, fontWeight: '500' }}>
                        {acc.label}
                      </p>
                      {isBank && <ChevronDown size={11} color="var(--primary)" />}
                    </div>
                    <p style={{ 
                      fontSize: '0.88rem', fontWeight: '700', margin: 0,
                      color: accountBalances[acc.id] < 0 ? 'var(--expense)' : 'white' 
                    }}>
                      {mask(accountBalances[acc.id] || 0)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Tarjeta de Cochinitos */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              background: 'rgba(var(--primary-rgb), 0.08)', padding: '10px 12px', borderRadius: '14px',
              border: '1px solid rgba(var(--primary-rgb), 0.2)'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🐷</span>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600', margin: 0 }}>Cochinitos</p>
                <p style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white', margin: 0 }}>
                  {mask(totalPiggySavings)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ShineBorder>

      {/* MODAL DE BANCOS */}
      {isModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '400px', maxHeight: '85vh', 
            overflowY: 'auto', background: '#12151c', border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px', borderRadius: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'white', fontWeight: '700' }}>
                  {selectedBankId ? `Movimiento en ${banks.find(b => b.id === selectedBankId)?.name}` : 'Mis Cuentas Bancarias'}
                </h3>
              </div>
              <button 
                onClick={() => { if(selectedBankId) setSelectedBankId(null); else setIsModalOpen(false); }} 
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                {selectedBankId ? <ArrowLeft size={16} /> : <X size={16} />}
              </button>
            </div>

            {!selectedBankId ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {banks.map(b => (
                    <div key={b.id} 
                      onClick={() => setSelectedBankId(b.id)}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'transform 0.15s, background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>{b.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          Saldo: <strong style={{ color: 'var(--primary)' }}>{mask(accountBalances.bankDetails?.[b.id] || 0)}</strong>
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                          Operar +
                        </span>
                        {b.id !== 'general' && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (window.confirm(`¿Eliminar la cuenta ${b.name}?`)) onDeleteBank(b.id); 
                            }} 
                            style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.5)', cursor: 'pointer', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '500' }}>
                    + Registrar nueva cuenta o billetera
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" value={newBankName} onChange={e => setNewBankName(e.target.value)} 
                      placeholder="Ej: Nequi, Bancolombia..." style={{ margin: 0, padding: '12px 14px' }}
                    />
                    <button 
                      onClick={() => {
                        if (newBankName.trim()) {
                          onAddBank(newBankName.trim());
                          setNewBankName('');
                        }
                      }}
                      disabled={!newBankName.trim()}
                      className="btn-primary" style={{ padding: '0 18px', whiteSpace: 'nowrap' }}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-fade">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    onClick={() => setBankTxType('income')} 
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', 
                      borderColor: bankTxType === 'income' ? 'var(--income)' : 'rgba(255,255,255,0.1)', 
                      background: bankTxType === 'income' ? 'rgba(52,199,89,0.15)' : 'transparent', 
                      color: bankTxType === 'income' ? 'var(--income)' : 'var(--text-dim)', fontWeight: '700' 
                    }}
                  >
                    ↑ Ingreso
                  </button>
                  <button 
                    onClick={() => setBankTxType('expense')} 
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', 
                      borderColor: bankTxType === 'expense' ? 'var(--expense)' : 'rgba(255,255,255,0.1)', 
                      background: bankTxType === 'expense' ? 'rgba(255,59,48,0.15)' : 'transparent', 
                      color: bankTxType === 'expense' ? 'var(--expense)' : 'var(--text-dim)', fontWeight: '700' 
                    }}
                  >
                    ↓ Egreso
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                    Concepto / Descripción
                  </label>
                  <input type="text" value={bankTxDesc} onChange={e => setBankTxDesc(e.target.value)} placeholder="Ej: Pago de cosecha, consignación..." />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                    Monto
                  </label>
                  <input 
                    type="text" inputMode="numeric" 
                    value={formatInputAmount(bankTxAmount)} 
                    onChange={e => setBankTxAmount(parseInputAmount(e.target.value))} 
                    placeholder="$ 0" 
                    style={{ fontSize: '1.4rem', fontWeight: '700' }}
                  />
                </div>

                <button 
                  onClick={() => {
                    if (bankTxAmount) {
                      onAddBankTransaction({
                        amount: parseFloat(bankTxAmount),
                        type: bankTxType,
                        description: bankTxDesc.trim() || (bankTxType === 'income' ? 'Ingreso Bancario' : 'Egreso Bancario'),
                        accountId: selectedBankId
                      });
                      setBankTxAmount('');
                      setBankTxDesc('');
                      setSelectedBankId(null);
                      setIsModalOpen(false);
                    }
                  }}
                  disabled={!bankTxAmount}
                  className="btn-primary" style={{ width: '100%', padding: '14px', opacity: !bankTxAmount ? 0.5 : 1 }}
                >
                  Confirmar Movimiento
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTE DE AHORROS */}
      {isSavingsModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', background: '#12151c', border: '1px solid rgba(var(--primary-rgb), 0.25)', padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PiggyBank size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: '700' }}>Ajustar Ahorros</h3>
              </div>
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
                style={{ fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', color: 'var(--primary)' }}
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
