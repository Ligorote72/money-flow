import React, { useState, useMemo } from 'react';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/helpers';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  Award, 
  FileSpreadsheet, 
  ShieldCheck, 
  Flame, 
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Comparison Bar Chart (Ingresos vs Gastos últimos 6 meses)
const BarComparisonChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);
  const height = 110;

  return (
    <div style={{ 
      marginBottom: '22px', padding: '18px 16px 14px', 
      background: 'rgba(255,255,255,0.025)', borderRadius: '22px', 
      border: '1px solid rgba(255,255,255,0.06)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Comparativa Semestral
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ingresos vs Gastos</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.68rem', fontWeight: '700' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--income)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--income)' }}></span> Entradas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--expense)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--expense)' }}></span> Salidas
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: `${height}px`, paddingTop: '10px' }}>
        {data.map((d, i) => {
          const incHeight = Math.max(4, (d.income / maxVal) * (height - 24));
          const expHeight = Math.max(4, (d.expense / maxVal) * (height - 24));
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${height - 24}px` }}>
                {/* Barra Ingreso */}
                <div 
                  title={`Ingresos: ${formatCurrency(d.income)}`}
                  style={{ 
                    width: '10px', height: `${incHeight}px`, 
                    background: 'linear-gradient(180deg, #34c759 0%, rgba(52,199,89,0.5) 100%)', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }} 
                />
                {/* Barra Gasto */}
                <div 
                  title={`Gastos: ${formatCurrency(d.expense)}`}
                  style={{ 
                    width: '10px', height: `${expHeight}px`, 
                    background: 'linear-gradient(180deg, #ff3b30 0%, rgba(255,59,48,0.5) 100%)', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }} 
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '700' }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Interactive Donut Chart
const DonutChart = ({ data, total }) => {
  const [selectedSlice, setSelectedSlice] = useState(null);

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
    return { pathData, color: d.color, id: d.id, label: d.label, amount: d.amount, icon: d.icon, pct: (pct * 100).toFixed(0) };
  });

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      gap: '20px', margin: '16px 0 24px', flexWrap: 'wrap',
      padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
          {slices.map((s, i) => (
            <path 
              key={i} 
              d={s.pathData} 
              fill={s.color} 
              stroke="#090d16" 
              strokeWidth="1.5"
              style={{ cursor: 'pointer', opacity: selectedSlice && selectedSlice.id !== s.id ? 0.4 : 1, transition: 'opacity 0.2s' }}
              onClick={() => setSelectedSlice(selectedSlice?.id === s.id ? null : s)}
            />
          ))}
          <circle cx="50" cy="50" r="28" fill="#121826" />
          <text x="50" y="47" textAnchor="middle" fill="rgba(255,255,255,0.5)" style={{ fontSize: '5.5px', fontWeight: '700' }}>
            {selectedSlice ? selectedSlice.label.toUpperCase() : 'TOTAL'}
          </text>
          <text x="50" y="58" textAnchor="middle" fill="#fff" style={{ fontSize: '7.5px', fontWeight: '900' }}>
            {selectedSlice 
              ? `${selectedSlice.pct}%`
              : (total >= 1000000 ? `${(total/1000000).toFixed(1)}M` : `${(total/1000).toFixed(0)}K`)
            }
          </text>
        </svg>
      </div>

      {/* Mini Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px', flex: 1 }}>
        {slices.slice(0, 5).map((s, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedSlice(selectedSlice?.id === s.id ? null : s)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer',
              opacity: selectedSlice && selectedSlice.id !== s.id ? 0.4 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-dim)', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {s.icon} {s.label}
            </span>
            <span style={{ fontWeight: '800', color: '#fff' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisBreakdown = ({ transactions = [], filterMonth, filterYear, dateFilterType, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState('expense'); // expense, income

  // Monthly 6-Month Comparison Data
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m];
      
      const inc = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y)
        .reduce((sum, t) => sum + t.amount, 0);

      const exp = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y)
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({ label, income: inc, expense: exp });
    }
    return months;
  }, [transactions]);

  // Filtered period transactions
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

  // Financial Health Score Calculation (0-100)
  const healthScore = useMemo(() => {
    if (totalIncome === 0 && totalExpenses === 0) return 75;
    let score = 50;
    if (netSavings > 0) score += 25;
    if (parseFloat(savingsRate) >= 20) score += 15;
    if (parseFloat(savingsRate) >= 40) score += 10;
    if (totalExpenses > totalIncome) score -= 30;
    return Math.min(100, Math.max(10, score));
  }, [totalIncome, totalExpenses, netSavings, savingsRate]);

  // Daily average
  const daysInPeriod = useMemo(() => {
    if (dateFilterType === 'month') {
      return new Date(filterYear, filterMonth + 1, 0).getDate();
    }
    return 30;
  }, [filterMonth, filterYear, dateFilterType]);

  const dailyAvg = (totalExpenses / daysInPeriod) || 0;

  const displayList  = activeTab === 'income' ? incomeList : expenseList;
  const displayTotal = activeTab === 'income' ? totalIncome : totalExpenses;
  const displayColor = activeTab === 'income' ? 'var(--income)' : 'var(--expense)';

  // Category breakdown
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
    <div className="card animate-fade" style={{ margin: '14px 16px', padding: '22px' }}>
      {/* Encabezado visible solo al imprimir PDF */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid var(--primary)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>MoneyFlow - Reporte Financiero</h1>
        <p style={{ color: '#666' }}>Estado de Ingresos, Egresos y Balance de Caja</p>
        <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
          Periodo: {dateFilterType === 'month' ? `${MONTHS_ES[filterMonth]} ${filterYear}` : `${startDate} a ${endDate}`}
        </p>
      </div>

      {/* Screen Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }} className="no-print">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0 }}>📊 Inteligencia Financiera</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {dateFilterType === 'month' ? `${MONTHS_ES[filterMonth]} ${filterYear}` : 'Periodo personalizado'}
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          style={{ 
            background: 'rgba(var(--primary-rgb), 0.12)', 
            color: 'var(--primary)', 
            border: '1px solid rgba(var(--primary-rgb), 0.3)', 
            borderRadius: '12px', 
            padding: '8px 14px', 
            fontSize: '0.78rem', 
            fontWeight: '800', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileSpreadsheet size={15} />
          Exportar PDF
        </button>
      </div>

      {/* --- FINTECH KPI CARDS --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '18px'
      }} className="no-print">
        {/* KPI 1: Tasa de Ahorro */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(52,199,89,0.12), rgba(0,0,0,0.3))',
          border: '1px solid rgba(52,199,89,0.25)',
          borderRadius: '18px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>Tasa Ahorro</span>
            <PiggyBank size={16} color="#34c759" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#34c759', marginTop: '6px' }}>
            {savingsRate}%
          </p>
          <span style={{ fontSize: '0.68rem', color: netSavings >= 0 ? '#34c759' : '#ff3b30', fontWeight: '600' }}>
            {netSavings >= 0 ? `+${formatCurrency(netSavings)} neto` : `${formatCurrency(netSavings)} déficit`}
          </span>
        </div>

        {/* KPI 2: Salud Financiera */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(196,251,109,0.12), rgba(0,0,0,0.3))',
          border: '1px solid rgba(196,251,109,0.25)',
          borderRadius: '18px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>Salud Score</span>
            <ShieldCheck size={16} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '6px' }}>
            {healthScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span>
          </p>
          <span style={{ fontSize: '0.68rem', color: healthScore >= 70 ? 'var(--primary)' : '#ff9500', fontWeight: '600' }}>
            {healthScore >= 80 ? '🌟 Excelente Control' : healthScore >= 60 ? '⚖️ Estable' : '⚠️ Atención Gastos'}
          </span>
        </div>

        {/* KPI 3: Promedio Diario */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '18px',
          padding: '14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>Gasto Diario</span>
          <p style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ff9500', marginTop: '4px' }}>
            {formatCurrency(dailyAvg)}
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>en {daysInPeriod} días</span>
        </div>

        {/* KPI 4: Mayor Egreso */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '18px',
          padding: '14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>Mayor Rubro</span>
          <p style={{ fontSize: '1rem', fontWeight: '900', color: topCategory?.color || '#fff', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {topCategory ? `${topCategory.icon} ${topCategory.label}` : 'Sin datos'}
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {topCategory ? formatCurrency(topCategory.amount) : ''}
          </span>
        </div>
      </div>

      {/* Gráfico Comparativo Semestral */}
      <BarComparisonChart data={monthlyData} />

      {/* Gráfico Donut de Categorías */}
      {categoryBreakdown.length > 0 && (
        <DonutChart data={categoryBreakdown} total={displayTotal} />
      )}

      {/* Selector de Tipo (Gastos vs Ingresos) */}
      <div className="no-print">
        <div style={{
          display: 'flex', gap: '8px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
          padding: '4px', marginBottom: '18px'
        }}>
          <button 
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              background: activeTab === 'expense' ? 'rgba(255,59,48,0.22)' : 'transparent',
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
              background: activeTab === 'income' ? 'rgba(52,199,89,0.22)' : 'transparent',
              color: activeTab === 'income' ? 'var(--income)' : 'var(--text-dim)'
            }} 
            onClick={() => setActiveTab('income')}
          >
            ↑ Ingresos ({formatCurrency(totalIncome)})
          </button>
        </div>

        {/* Barras de distribución por categoría */}
        {categoryBreakdown.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DISTRIBUCIÓN PORCENTUAL
            </p>
            {categoryBreakdown.map(cat => {
              const pct = displayTotal > 0 ? (cat.amount / displayTotal) * 100 : 0;
              return (
                <div key={cat.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize: '0.85rem', color: cat.color, fontWeight: '800' }}>
                      {formatCurrency(cat.amount)} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, background: cat.color,
                      borderRadius: '6px', transition: 'width 0.5s ease', boxShadow: `0 0 8px ${cat.color}66`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista de movimientos */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          MOVIMIENTOS DEL PERIODO
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0', fontSize: '0.85rem' }}>
              Sin registros en este periodo.
            </p>
          ) : (
            displayList.map(tx => {
              const cat = getCategoryById(tx.category);
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px', borderLeft: `3px solid ${cat.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '2px' }}>{tx.description}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {cat.label} · {new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '800', color: displayColor, fontSize: '0.94rem' }}>
                    {activeTab === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN (PDF) */}
      <div className="print-only">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--income)', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
              Ingresos Totales: {formatCurrency(totalIncome)}
            </h2>
            <div style={{ marginTop: '16px' }}>
              {incomeList.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.85rem' }}>{tx.description}</span>
                  <span style={{ fontWeight: '700' }}>{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--expense)', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
              Gastos Totales: {formatCurrency(totalExpenses)}
            </h2>
            <div style={{ marginTop: '16px' }}>
              {expenseList.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.85rem' }}>{tx.description}</span>
                  <span style={{ fontWeight: '700' }}>{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '30px', padding: '16px', background: '#f5f5f7', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Balance Neto del Periodo: {formatCurrency(totalIncome - totalExpenses)} (Tasa Ahorro: {savingsRate}%)
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AnalysisBreakdown;
