import React, { useState, useMemo } from 'react';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, PiggyBank, Calendar, Award, FileSpreadsheet } from 'lucide-react';

const TrendChart = ({ data }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1000);
  const width = 320;
  const height = 90;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * (height - 15) - 10;
    return `${x},${y}`;
  }).join(' ');

  // Gradient area
  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tendencia de Gastos (Últimos 6 meses)
        </p>
        <span style={{ fontSize: '0.7rem', color: '#c4fb6d', fontWeight: '600' }}>Promedio mensual</span>
      </div>
      <div style={{ position: 'relative', height: '90px', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c4fb6d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4fb6d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon fill="url(#trendGrad)" points={areaPoints} />
          <polyline
            fill="none"
            stroke="#c4fb6d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ filter: 'drop-shadow(0 0 6px rgba(196, 251, 109, 0.4))' }}
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d.value / max) * (height - 15) - 10;
            return (
              <circle key={i} cx={x} cy={y} r="4" fill="#090d16" stroke="#c4fb6d" strokeWidth="2.5" />
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '600' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ data, total }) => {
  if (!data || data.length === 0 || total === 0) return null;
  
  let currentAngle = 0;
  const radius = 48;
  const centerX = 50;
  const centerY = 50;

  const slices = data.slice(0, 6).map((d) => {
    const pct = d.amount / total;
    const angle = pct * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = centerX + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = centerY + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    currentAngle += angle;
    return { pathData, color: d.color, id: d.id, label: d.label, amount: d.amount, pct: (pct * 100).toFixed(0) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '20px 0 28px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
          {slices.map((s, i) => (
            <path key={i} d={s.pathData} fill={s.color} stroke="#090d16" strokeWidth="1.5" />
          ))}
          <circle cx="50" cy="50" r="28" fill="#121620" />
          <text x="50" y="48" textAnchor="middle" fill="rgba(255,255,255,0.5)" style={{ fontSize: '6px', fontWeight: '600' }}>
            TOTAL
          </text>
          <text x="50" y="58" textAnchor="middle" fill="#fff" style={{ fontSize: '8px', fontWeight: '800' }}>
            {((total / 1000) >= 1000 ? (total/1000000).toFixed(1) + 'M' : (total/1000).toFixed(0) + 'K')}
          </text>
        </svg>
      </div>

      {/* Mini Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '130px' }}>
        {slices.slice(0, 4).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-dim)', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.label}</span>
            <span style={{ fontWeight: '700', color: '#fff' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisBreakdown = ({ transactions, filterMonth, filterYear, dateFilterType, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState('expense');

  // Trend Data (últimos 6 meses)
  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m];
      const val = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y)
        .reduce((sum, t) => sum + t.amount, 0);
      months.push({ label, value: val });
    }
    return months;
  }, [transactions]);

  // Filtrar por el mes/año o rango seleccionado en el UI
  const currentMonthTxs = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      if (dateFilterType === 'month') {
        return txDate.getMonth() === filterMonth && txDate.getFullYear() === filterYear;
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return txDate >= start && txDate <= end;
      }
    });
  }, [transactions, filterMonth, filterYear, dateFilterType, startDate, endDate]);

  const incomeList  = useMemo(() => currentMonthTxs.filter(t => t.type === 'income'), [currentMonthTxs]);
  const expenseList = useMemo(() => currentMonthTxs.filter(t => t.type === 'expense'), [currentMonthTxs]);

  const totalIncome   = useMemo(() => incomeList.reduce((a, t) => a + t.amount, 0), [incomeList]);
  const totalExpenses = useMemo(() => expenseList.reduce((a, t) => a + t.amount, 0), [expenseList]);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((netSavings / totalIncome) * 100)).toFixed(1) : 0;

  // Promedio diario (días del mes actual o 30 días)
  const daysInPeriod = useMemo(() => {
    const now = new Date();
    if (dateFilterType === 'month') {
      return new Date(filterYear, filterMonth + 1, 0).getDate();
    }
    return 30;
  }, [filterMonth, filterYear, dateFilterType]);

  const dailyAvg = (totalExpenses / daysInPeriod) || 0;

  const displayList  = activeTab === 'income' ? incomeList : expenseList;
  const displayTotal = activeTab === 'income' ? totalIncome : totalExpenses;
  const displayColor = activeTab === 'income' ? 'var(--income)' : 'var(--expense)';

  // Agrupar por categoría
  const categoryBreakdown = useMemo(() => {
    const byCategory = displayList.reduce((acc, tx) => {
      const key = tx.category || 'other_expense';
      if (!acc[key]) acc[key] = 0;
      acc[key] += tx.amount;
      return acc;
    }, {});

    return Object.entries(byCategory)
      .map(([id, amount]) => ({ ...getCategoryById(id), amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [displayList]);

  const topCategory = categoryBreakdown[0];

  return (
    <div className="card animate-fade" style={{ marginTop: '0', padding: '20px' }}>
      {/* Encabezado visible solo al imprimir */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid var(--primary)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Reporte Financiero</h1>
        <p style={{ color: '#666' }}>Documento generado por MoneyFlow</p>
        <p style={{ fontSize: '0.9rem' }}>Periodo: {dateFilterType === 'month' ? `${MONTHS_ES[filterMonth]} ${filterYear}` : `${startDate} a ${endDate}`}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="no-print">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>📊 Inteligencia Financiera</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {dateFilterType === 'month' ? `${MONTHS_ES[filterMonth]} ${filterYear}` : 'Rango personalizado'}
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          style={{ 
            background: 'rgba(196, 251, 109, 0.12)', 
            color: '#c4fb6d', 
            border: '1px solid rgba(196, 251, 109, 0.3)', 
            borderRadius: '12px', 
            padding: '8px 14px', 
            fontSize: '0.78rem', 
            fontWeight: '700', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileSpreadsheet size={15} />
          PDF
        </button>
      </div>

      {/* --- FINTECH KPI CARDS (TREMOR STYLE) --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }} className="no-print">
        {/* KPI 1: Tasa de Ahorro */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(52,199,89,0.1), rgba(0,0,0,0.3))',
          border: '1px solid rgba(52,199,89,0.25)',
          borderRadius: '18px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Tasa Ahorro</span>
            <PiggyBank size={16} color="#34c759" />
          </div>
          <p style={{ fontSize: '1.3rem', fontWeight: '900', color: '#34c759', marginTop: '6px' }}>
            {savingsRate}%
          </p>
          <span style={{ fontSize: '0.65rem', color: netSavings >= 0 ? '#34c759' : '#ff3b30' }}>
            {netSavings >= 0 ? `+${formatCurrency(netSavings)} neto` : `${formatCurrency(netSavings)} déficit`}
          </span>
        </div>

        {/* KPI 2: Gasto Diario Promedio */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,149,0,0.1), rgba(0,0,0,0.3))',
          border: '1px solid rgba(255,149,0,0.25)',
          borderRadius: '18px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Gasto Diario</span>
            <Calendar size={16} color="#ff9500" />
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ff9500', marginTop: '6px' }}>
            {formatCurrency(dailyAvg)}
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            en {daysInPeriod} días
          </span>
        </div>

        {/* KPI 3: Ingresos Totales */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '18px',
          padding: '14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Total Entradas</span>
          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--income)', marginTop: '4px' }}>
            {formatCurrency(totalIncome)}
          </p>
        </div>

        {/* KPI 4: Mayor Categoría */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '18px',
          padding: '14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Mayor Egreso</span>
          <p style={{ fontSize: '0.95rem', fontWeight: '800', color: topCategory?.color || '#fff', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {topCategory ? `${topCategory.icon} ${topCategory.label}` : 'Sin gastos'}
          </p>
        </div>
      </div>

      {/* Gráfico de Tendencia */}
      <TrendChart data={trendData} />

      {/* Gráfico de Torta / Donut */}
      {categoryBreakdown.length > 0 && (
        <DonutChart data={categoryBreakdown} total={displayTotal} />
      )}

      {/* VISTA EN PANTALLA (INTERACTIVA) */}
      <div className="no-print">
        {/* Selector de Tipo */}
        <div style={{
          display: 'flex', gap: '8px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
          padding: '4px', marginBottom: '20px'
        }}>
          <button 
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              background: activeTab === 'expense' ? 'rgba(255,59,48,0.2)' : 'transparent',
              color: activeTab === 'expense' ? 'var(--expense)' : 'var(--text-dim)'
            }} 
            onClick={() => setActiveTab('expense')}
          >
            ↓ Gastos ({formatCurrency(totalExpenses)})
          </button>
          <button 
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              background: activeTab === 'income' ? 'rgba(52,199,89,0.2)' : 'transparent',
              color: activeTab === 'income' ? 'var(--income)' : 'var(--text-dim)'
            }} 
            onClick={() => setActiveTab('income')}
          >
            ↑ Ingresos ({formatCurrency(totalIncome)})
          </button>
        </div>

        {/* Barras por categoría */}
        {categoryBreakdown.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DISTRIBUCIÓN POR CATEGORÍA
            </p>
            {categoryBreakdown.map(cat => {
              const pct = displayTotal > 0 ? (cat.amount / displayTotal) * 100 : 0;
              return (
                <div key={cat.id} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize: '0.85rem', color: cat.color, fontWeight: '700' }}>
                      {formatCurrency(cat.amount)} <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, background: cat.color,
                      borderRadius: '6px', transition: 'width 0.6s ease', boxShadow: `0 0 10px ${cat.color}66`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista de transacciones del periodo */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          MOVIMIENTOS DETALLADOS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0', fontSize: '0.85rem' }}>
              No hay movimientos en este periodo.
            </p>
          ) : (
            displayList.map(tx => {
              const cat = getCategoryById(tx.category);
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '14px', borderLeft: `3px solid ${cat.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.88rem', marginBottom: '2px' }}>{tx.description}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {cat.label} · {new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '800', color: displayColor, fontSize: '0.92rem' }}>
                    {activeTab === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN (PDF COMPLETO) */}
      <div className="print-only">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--income)', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Ingresos Totales: {formatCurrency(totalIncome)}</h2>
            <div style={{ marginTop: '20px' }}>
              {incomeList.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #fafafa' }}>
                  <span style={{ fontSize: '0.9rem' }}>{tx.description}</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--expense)', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Gastos Totales: {formatCurrency(totalExpenses)}</h2>
            <div style={{ marginTop: '20px' }}>
              {expenseList.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #fafafa' }}>
                  <span style={{ fontSize: '0.9rem' }}>{tx.description}</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>Recuerda: Balance del periodo = {formatCurrency(totalIncome - totalExpenses)}</h3>
        </div>
      </div>
    </div>
  );
};

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default AnalysisBreakdown;
