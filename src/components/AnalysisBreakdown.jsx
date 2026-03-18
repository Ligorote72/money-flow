import React, { useState } from 'react';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/helpers';

const TrendChart = ({ data }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1000);
  const width = 300;
  const height = 80;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ marginBottom: '24px', padding: '0 4px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Tendencia de Gastos (6 meses)
      </p>
      <div style={{ position: 'relative', height: '80px', width: '100%', padding: '0 10px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ filter: 'drop-shadow(0 0 5px rgba(var(--primary-rgb), 0.5))' }}
          />
          {data.map((d, i) => (
            <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - (d.value / max) * height} r="4" fill="var(--primary)" />
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};
const PieChart = ({ data, total }) => {
  if (!data || data.length === 0 || total === 0) return null;
  
  let currentAngle = 0;
  const radius = 50;
  const centerX = 50;
  const centerY = 50;

  const slices = data.map((d, i) => {
    const pct = d.amount / total;
    const angle = pct * 360;
    
    // Calcular coordenadas
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = centerX + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = centerY + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    currentAngle += angle;
    return { pathData, color: d.color, id: d.id, label: d.label };
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
      <svg viewBox="0 0 100 100" style={{ width: '180px', height: '180px', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>
        {slices.map((s, i) => (
          <path key={i} d={s.pathData} fill={s.color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" style={{ transition: 'all 0.3s' }} />
        ))}
        {/* Agujero central para efecto Donut (opcional) */}
        <circle cx="50" cy="50" r="28" fill="#141416" />
        <text x="50" y="52" textAnchor="middle" fill="white" style={{ fontSize: '8px', fontWeight: '800' }}>
          {((total / 1000) >= 1000 ? (total/1000000).toFixed(1) + 'M' : (total/1000).toFixed(0) + 'K')}
        </text>
      </svg>
    </div>
  );
};

const AnalysisBreakdown = ({ transactions, filterMonth, filterYear, dateFilterType, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState('expense');

  // Trend Data (últimos 6 meses)
  const trendData = React.useMemo(() => {
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

  // Datos del periodo pasado para comparación
  const prevPeriodStats = React.useMemo(() => {
    let prevTxs = [];
    if (dateFilterType === 'month') {
      const pm = filterMonth === 0 ? 11 : filterMonth - 1;
      const py = filterMonth === 0 ? filterYear - 1 : filterYear;
      prevTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === pm && d.getFullYear() === py;
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - diff - 86400000);
      const prevEnd = new Date(start.getTime() - 86400000);
      prevTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= prevStart && d <= prevEnd;
      });
    }
    const inc = prevTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const exp = prevTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return { income: inc, expense: exp };
  }, [transactions, filterMonth, filterYear, dateFilterType, startDate, endDate]);

  // Filtrar por el mes/año o rango seleccionado en el UI
  const currentMonthTxs = transactions.filter(t => {
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

  const incomeList  = currentMonthTxs.filter(t => t.type === 'income');
  const expenseList = currentMonthTxs.filter(t => t.type === 'expense');

  const totalIncome   = incomeList.reduce((a, t) => a + t.amount, 0);
  const totalExpenses = expenseList.reduce((a, t) => a + t.amount, 0);

  const displayList  = activeTab === 'income' ? incomeList : expenseList;
  const displayTotal = activeTab === 'income' ? totalIncome : totalExpenses;
  const displayColor = activeTab === 'income' ? 'var(--income)' : 'var(--expense)';

  // Agrupar por categoría
  const byCategory = displayList.reduce((acc, tx) => {
    const key = tx.category || 'other_expense';
    if (!acc[key]) acc[key] = 0;
    acc[key] += tx.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(byCategory)
    .map(([id, amount]) => ({ ...getCategoryById(id), amount }))
    .sort((a, b) => b.amount - a.amount);

  const tabStyle = (tab) => ({
    flex: 1, padding: '10px', border: 'none', borderRadius: '12px',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s ease',
    background: activeTab === tab
      ? (tab === 'income' ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)')
      : 'transparent',
    color: activeTab === tab
      ? (tab === 'income' ? 'var(--income)' : 'var(--expense)')
      : 'var(--text-dim)',
  });

  return (
    <div className="card animate-fade" style={{ marginTop: '0' }}>
      {/* Encabezado visible solo al imprimir */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid var(--primary)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Reporte Financiero</h1>
        <p style={{ color: '#666' }}>Documento generado por Money Flow</p>
        <p style={{ fontSize: '0.9rem' }}>Periodo: {dateFilterType === 'month' ? `${MONTHS_ES[filterMonth]} ${filterYear}` : `${startDate} a ${endDate}`}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="no-print">
        <h3 style={{ fontSize: '1rem', margin: 0 }}>📊 Análisis de Movimientos</h3>
        <button 
          onClick={() => window.print()}
          style={{ 
            background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', 
            border: 'none', borderRadius: '10px', padding: '8px 14px', 
            fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' 
          }}
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Gráfico de Tendencia */}
      <TrendChart data={trendData} />

      {/* Gráfico de Torta / Donut */}
      {categoryBreakdown.length > 0 && (
        <PieChart data={categoryBreakdown} total={displayTotal} />
      )}

      {/* VISTA EN PANTALLA (INTERACTIVA) */}
      <div className="no-print">
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '8px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '14px',
          padding: '4px', marginBottom: '20px'
        }}>
          <button style={tabStyle('income')}  onClick={() => setActiveTab('income')}>↑ Ingresos</button>
          <button style={tabStyle('expense')} onClick={() => setActiveTab('expense')}>↓ Gastos</button>
        </div>

        {/* Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Total {activeTab === 'income' ? 'ingresos' : 'gastos'}
          </span>
          <span style={{ fontWeight: '700', color: displayColor, fontSize: '1.2rem' }}>
            {formatCurrency(displayTotal)}
          </span>
        </div>

        {/* Insight Comparativo */}
        {(() => {
          const prevTotal = activeTab === 'income' ? prevPeriodStats.income : prevPeriodStats.expense;
          if (prevTotal === 0 || displayTotal === 0) return null;
          const diff = ((displayTotal - prevTotal) / prevTotal) * 100;
          const isBetter = activeTab === 'income' ? diff > 0 : diff < 0;
          
          return (
            <div style={{ 
              padding: '12px 14px', borderRadius: '14px', marginBottom: '24px',
              background: isBetter ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.08)',
              border: `1px solid ${isBetter ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)'}`,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{isBetter ? '✨' : '⚠️'}</span>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>
                {activeTab === 'income' 
                  ? (diff > 0 ? `Tus ingresos subieron un ${diff.toFixed(0)}% vs el periodo anterior.` : `Tus ingresos bajaron un ${Math.abs(diff).toFixed(0)}% vs el periodo anterior.`)
                  : (diff < 0 ? `¡Genial! Has gastado un ${Math.abs(diff).toFixed(0)}% menos que el periodo anterior.` : `Has gastado un ${diff.toFixed(0)}% más que el periodo anterior.`)
                }
              </p>
            </div>
          );
        })()}

        {/* Barras por categoría */}
        {categoryBreakdown.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '600' }}>
              POR CATEGORÍA
            </p>
            {categoryBreakdown.map(cat => {
              const pct = displayTotal > 0 ? (cat.amount / displayTotal) * 100 : 0;
              return (
                <div key={cat.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.82rem' }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize: '0.82rem', color: cat.color, fontWeight: '600' }}>
                      {formatCurrency(cat.amount)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, background: cat.color,
                      borderRadius: '6px', transition: 'width 0.6s ease', boxShadow: `0 0 8px ${cat.color}55`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista de transacciones */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '10px', fontWeight: '600' }}>
          MOVIMIENTOS EN {dateFilterType === 'month' ? ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][filterMonth] : 'EL RANGO SELECCIONADO'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
              No hay {activeTab === 'income' ? 'ingresos' : 'gastos'} registrados aún.
            </p>
          ) : (
            displayList.map(tx => {
              const cat = getCategoryById(tx.category);
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px', borderLeft: `3px solid ${cat.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.88rem', marginBottom: '2px' }}>{tx.description}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {cat.label} · {new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', color: displayColor, fontSize: '0.92rem' }}>
                    {formatCurrency(tx.amount)}
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
          {/* Columna Ingresos */}
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
          
          {/* Columna Gastos */}
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
