import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react';

const WeeklySummary = ({ transactions = [] }) => {
  const now = new Date();

  // Current week (Monday to Sunday)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Monday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Last week
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);

  const thisWeekTxs = transactions.filter(t => new Date(t.date) >= startOfWeek);
  const lastWeekTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= startOfLastWeek && d <= endOfLastWeek;
  });

  const sumExpenses = (txs) => txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const sumIncome   = (txs) => txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);

  const thisExp  = sumExpenses(thisWeekTxs);
  const lastExp  = sumExpenses(lastWeekTxs);
  const thisInc  = sumIncome(thisWeekTxs);

  const expDiff = lastExp > 0 ? ((thisExp - lastExp) / lastExp) * 100 : null;
  const daysPassed = Math.max(1, dayOfWeek + 1);
  const dailyAverageThisWeek = thisExp / daysPassed;

  if (thisWeekTxs.length === 0) return null;

  return (
    <div 
      className="card animate-fade" 
      style={{
        margin: '6px 16px 14px',
        padding: '16px 18px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="var(--primary)" />
          <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Rendimiento Esta Semana
          </p>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Día {daysPassed} de 7
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Gastos de la semana */}
        <div style={{ background: 'rgba(255, 59, 48, 0.06)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 59, 48, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>Gastos Semana</span>
          <p style={{ fontWeight: '800', color: 'var(--expense)', fontSize: '1.05rem', margin: '2px 0' }}>
            -{formatCurrency(thisExp)}
          </p>
          {expDiff !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {expDiff > 0 ? <TrendingUp size={12} color="#ff3b30" /> : <TrendingDown size={12} color="#34c759" />}
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: expDiff > 0 ? '#ff3b30' : '#34c759' }}>
                {Math.abs(expDiff).toFixed(0)}% vs anterior
              </span>
            </div>
          )}
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            ~{formatCurrency(dailyAverageThisWeek)}/día
          </p>
        </div>

        {/* Ingresos de la semana */}
        <div style={{ background: 'rgba(52, 199, 89, 0.06)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(52, 199, 89, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>Ingresos Semana</span>
          <p style={{ fontWeight: '800', color: 'var(--income)', fontSize: '1.05rem', margin: '2px 0' }}>
            +{formatCurrency(thisInc)}
          </p>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {thisWeekTxs.length} movimiento{thisWeekTxs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
