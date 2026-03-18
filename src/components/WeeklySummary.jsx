import React from 'react';
import { formatCurrency } from '../utils/helpers';

const WeeklySummary = ({ transactions }) => {
  const now = new Date();

  // Semana actual (lunes a domingo)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=lunes
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Semana pasada
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

  if (thisWeekTxs.length === 0) return null;

  return (
    <div style={{
      margin: '8px 16px 4px',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.03em' }}>
        ESTA SEMANA
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Gastos</p>
          <p style={{ fontWeight: '700', color: 'var(--expense)', fontSize: '1rem' }}>
            -{formatCurrency(thisExp)}
          </p>
          {expDiff !== null && (
            <p style={{ fontSize: '0.7rem', color: expDiff > 0 ? 'var(--expense)' : 'var(--income)', marginTop: '2px' }}>
              {expDiff > 0 ? '▲' : '▼'} {Math.abs(expDiff).toFixed(0)}% vs semana pasada
            </p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Ingresos</p>
          <p style={{ fontWeight: '700', color: 'var(--income)', fontSize: '1rem' }}>
            +{formatCurrency(thisInc)}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {thisWeekTxs.length} movimiento{thisWeekTxs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
