import React, { useState } from 'react';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';
import NumberTicker from './ui/NumberTicker';
import ShineBorder from './ui/ShineBorder';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowDownLeft,
  Landmark, 
  PiggyBank, 
  Wallet, 
  Plus, 
  ChevronDown, 
  Trash2, 
  ArrowLeft, 
  X,
  CreditCard,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const BANK_STYLES = {
  bancolombia: { color: '#FDDA24', bg: 'rgba(253, 218, 36, 0.12)', border: 'rgba(253, 218, 36, 0.3)' },
  nequi: { color: '#E01E78', bg: 'rgba(224, 30, 120, 0.15)', border: 'rgba(224, 30, 120, 0.35)' },
  daviplata: { color: '#ED1C24', bg: 'rgba(237, 28, 36, 0.15)', border: 'rgba(237, 28, 36, 0.35)' },
  bbva: { color: '#004481', bg: 'rgba(0, 68, 129, 0.25)', border: 'rgba(0, 122, 255, 0.4)' },
  nu: { color: '#820AD1', bg: 'rgba(130, 10, 209, 0.2)', border: 'rgba(130, 10, 209, 0.4)' },
  default: { color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)', border: 'rgba(0, 122, 255, 0.3)' }
};

const getBankStyle = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('nequi')) return BANK_STYLES.nequi;
  if (n.includes('bancolombia')) return BANK_STYLES.bancolombia;
  if (n.includes('daviplata') || n.includes('davivienda')) return BANK_STYLES.daviplata;
  if (n.includes('bbva')) return BANK_STYLES.bbva;
  if (n.includes('nu')) return BANK_STYLES.nu;
  return BANK_STYLES.default;
};

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
  const [activeAccountFilter, setActiveAccountFilter] = useState('all'); // all, cash, bank, savings
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

  // Compute displayed balance based on active pill
  const displayedBalance = React.useMemo(() => {
    switch (activeAccountFilter) {
      case 'cash': return accountBalances.cash || 0;
      case 'bank': return accountBalances.bank || 0;
      case 'savings': return totalPiggySavings + (accountBalances.savings || 0);
      default: return totalBalance;
    }
  }, [activeAccountFilter, totalBalance, accountBalances, totalPiggySavings]);

  const netCashflow = income - expenses;

  return (
    <div style={{ margin: '14px 16px' }} className="animate-fade">
      <ShineBorder borderRadius={28} borderWidth={1.5} duration={7} color={['#c4fb6d', '#007AFF', '#34c759']}>
        <div style={{ padding: '22px' }}>
          {/* Top Bar: Label + Account Filter Tabs + User Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' 
              }} />
              <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeAccountFilter === 'cash' ? 'Efectivo en Mano' : 
                 activeAccountFilter === 'bank' ? 'Cuentas Bancarias' : 
                 activeAccountFilter === 'savings' ? 'Ahorros y Metas' : 'Patrimonio Disponible'}
              </p>
            </div>

            {username && (
              <span style={{ 
                fontSize: '0.78rem', 
                color: 'var(--primary)', 
                fontWeight: '700',
                background: 'rgba(var(--primary-rgb), 0.12)',
                padding: '3px 10px',
                borderRadius: '16px',
                border: '1px solid rgba(var(--primary-rgb), 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} />
                {username}
              </span>
            )}
          </div>

          {/* Saldo Principal con NumberTicker */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '2.6rem', 
              fontWeight: '900',
              lineHeight: 1.05, 
              letterSpacing: '-0.035em',
              background: 'linear-gradient(180deg, #FFFFFF 20%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <NumberTicker value={displayedBalance} hide={hideBalance} />
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: '700',
                color: netCashflow >= 0 ? 'var(--income)' : 'var(--expense)',
                background: netCashflow >= 0 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
                padding: '2px 8px',
                borderRadius: '8px'
              }}>
                {netCashflow >= 0 ? `▲ +${formatCurrency(netCashflow)} superávit` : `▼ ${formatCurrency(netCashflow)} déficit`}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>este periodo</span>
            </div>
          </div>

          {/* Tarjetas de Ingresos vs Gastos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.03) 100%)', 
              padding: '12px 14px', 
              borderRadius: '18px',
              border: '1px solid rgba(52, 199, 89, 0.22)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ 
                  background: 'rgba(52, 199, 89, 0.2)', 
                  borderRadius: '50%', padding: '4px', display: 'flex' 
                }}>
                  <ArrowDownLeft size={13} color="#34c759" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: '600' }}>Ingresos</span>
              </div>
              <p style={{ color: '#34c759', fontWeight: '800', fontSize: '1.05rem', margin: 0 }}>
                +{hideBalance ? '••••••' : formatCurrency(income)}
              </p>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.03) 100%)', 
              padding: '12px 14px', 
              borderRadius: '18px',
              border: '1px solid rgba(255, 59, 48, 0.22)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ 
                  background: 'rgba(255, 59, 48, 0.2)', 
                  borderRadius: '50%', padding: '4px', display: 'flex' 
                }}>
                  <ArrowUpRight size={13} color="#ff3b30" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: '600' }}>Gastos</span>
              </div>
              <p style={{ color: '#ff3b30', fontWeight: '800', fontSize: '1.05rem', margin: 0 }}>
                -{hideBalance ? '••••••' : formatCurrency(expenses)}
              </p>
            </div>
          </div>

          {/* Desglose por Cuentas Interactivas (Pills) */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
            paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            {accounts.map(acc => {
              const isBank = acc.id === 'bank';
              const isSavings = acc.id === 'savings';
              const isClickable = isBank || isSavings;
              const isSelected = activeAccountFilter === acc.id;

              return (
                <div 
                  key={acc.id} 
                  onClick={() => {
                    if (isSelected) {
                      setActiveAccountFilter('all');
                    } else {
                      setActiveAccountFilter(acc.id);
                    }
                    if (isBank) setIsModalOpen(true);
                    if (isSavings) {
                      setSavingsInput(accountBalances.savings?.toString() || '0');
                      setIsSavingsModalOpen(true);
                    }
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', 
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.12)' : 'rgba(255,255,255,0.04)', 
                    padding: '10px 12px', borderRadius: '16px',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>{acc.icon}</span>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary)' : 'var(--text-dim)', margin: 0, fontWeight: '600' }}>
                        {acc.label}
                      </p>
                      {isBank && <ChevronDown size={12} color="var(--primary)" />}
                    </div>
                    <p style={{ 
                      fontSize: '0.88rem', fontWeight: '800', margin: '1px 0 0',
                      color: accountBalances[acc.id] < 0 ? 'var(--expense)' : 'white' 
                    }}>
                      {mask(accountBalances[acc.id] || 0)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Cochinitos Card */}
            <div 
              onClick={() => setActiveAccountFilter(activeAccountFilter === 'savings' ? 'all' : 'savings')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                background: activeAccountFilter === 'savings' ? 'rgba(255, 149, 0, 0.18)' : 'rgba(var(--primary-rgb), 0.06)', 
                padding: '10px 12px', borderRadius: '16px',
                border: activeAccountFilter === 'savings' ? '1px solid #ff9500' : '1px solid rgba(var(--primary-rgb), 0.18)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>🐷</span>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>Cochinitos</p>
                <p style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white', margin: '1px 0 0' }}>
                  {mask(totalPiggySavings)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ShineBorder>

      {/* MODAL DE BANCOS (Bancolombia, Nequi, etc.) */}
      {isModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9, 12, 21, 0.88)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '420px', maxHeight: '85vh', 
            overflowY: 'auto', background: '#111622', border: '1px solid rgba(255,255,255,0.12)',
            padding: '24px', borderRadius: '28px', margin: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: '800' }}>
                  {selectedBankId ? `Operar en ${banks.find(b => b.id === selectedBankId)?.name}` : 'Mis Cuentas Bancarias'}
                </h3>
              </div>
              <button 
                onClick={() => { if(selectedBankId) setSelectedBankId(null); else setIsModalOpen(false); }} 
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                {selectedBankId ? <ArrowLeft size={16} /> : <X size={16} />}
              </button>
            </div>

            {!selectedBankId ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {banks.map(b => {
                    const bStyle = getBankStyle(b.name);
                    const bBalance = accountBalances.bankDetails?.[b.id] || 0;
                    return (
                      <div key={b.id} 
                        onClick={() => setSelectedBankId(b.id)}
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          padding: '14px 16px', background: bStyle.bg, borderRadius: '18px',
                          cursor: 'pointer', border: `1px solid ${bStyle.border}`,
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '38px', height: '38px', borderRadius: '12px', 
                            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            <CreditCard size={18} color={bStyle.color} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '800', fontSize: '0.96rem', color: 'white', marginBottom: '2px' }}>{b.name}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                              Saldo: <strong style={{ color: bStyle.color }}>{mask(bBalance)}</strong>
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: '700', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '10px' }}>
                            Mover ➔
                          </span>
                          {banks.length > 1 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm(`¿Eliminar la cuenta "${b.name}"?`)) onDeleteBank(b.id);
                              }}
                              style={{ background: 'none', border: 'none', color: 'rgba(255,59,48,0.4)', padding: '4px', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario para agregar banco */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newBankName.trim()) return;
                  onAddBank(newBankName.trim());
                  setNewBankName('');
                }} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '8px' }}>
                    + Agregar Banco o Billetera (Nequi, Daviplata, Nu...)
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Ej: Nequi, Daviplata, BBVA..." 
                      value={newBankName} 
                      onChange={e => setNewBankName(e.target.value)} 
                      style={{ margin: 0, padding: '12px 14px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0 16px', borderRadius: '14px', whiteSpace: 'nowrap' }}>
                      Guardar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Sub-formulario de movimiento directo para el banco seleccionado */
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!bankTxAmount || parseFloat(bankTxAmount) <= 0) return;
                onAddBankTransaction({
                  description: bankTxDesc.trim() || (bankTxType === 'income' ? 'Depósito en Banco' : 'Retiro de Banco'),
                  amount: parseFloat(bankTxAmount),
                  type: bankTxType,
                  accountId: selectedBankId
                });
                setBankTxAmount('');
                setBankTxDesc('');
                setSelectedBankId(null);
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setBankTxType('income')} 
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                      background: bankTxType === 'income' ? 'rgba(52,199,89,0.2)' : 'rgba(255,255,255,0.05)', 
                      color: bankTxType === 'income' ? 'var(--income)' : 'var(--text-dim)', 
                      fontWeight: '700', cursor: 'pointer' 
                    }}
                  >
                    + Depositar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBankTxType('expense')} 
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                      background: bankTxType === 'expense' ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.05)', 
                      color: bankTxType === 'expense' ? 'var(--expense)' : 'var(--text-dim)', 
                      fontWeight: '700', cursor: 'pointer' 
                    }}
                  >
                    - Retirar
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Monto</label>
                  <input 
                    type="text" 
                    inputMode="numeric" 
                    placeholder="$ 0" 
                    value={formatInputAmount(bankTxAmount)} 
                    onChange={e => setBankTxAmount(parseInputAmount(e.target.value))} 
                    required 
                    style={{ fontSize: '1.4rem', fontWeight: '800', textAlign: 'center' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Nota o Concepto</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Pago de cliente, Transferencia..." 
                    value={bankTxDesc} 
                    onChange={e => setBankTxDesc(e.target.value)} 
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                  Confirmar Operación
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTE DE AHORROS */}
      {isSavingsModalOpen && (
        <div className="animate-fade" style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9, 12, 21, 0.88)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '380px', 
            background: '#111622', border: '1px solid rgba(255,255,255,0.12)',
            padding: '24px', borderRadius: '28px', margin: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PiggyBank size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'white', fontWeight: '800' }}>Ajustar Saldo Ahorro</h3>
              </div>
              <button onClick={() => setIsSavingsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.4 }}>
              Ingresa el saldo real acumulado en tu cuenta de ahorro. Se creará automáticamente un ajuste.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              onAdjustSavings(parseFloat(savingsInput) || 0);
              setIsSavingsModalOpen(false);
            }}>
              <input 
                type="text" 
                inputMode="numeric" 
                placeholder="$ 0" 
                value={formatInputAmount(savingsInput)} 
                onChange={e => setSavingsInput(parseInputAmount(e.target.value))} 
                required 
                style={{ fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', marginBottom: '20px' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                Actualizar Saldo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
