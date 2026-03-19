import React, { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatInputAmount, parseInputAmount } from '../utils/helpers';

const GoalBar = ({ label, current, goal, color }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = goal - current;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          {formatCurrency(current)} / {formatCurrency(goal)}
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${percentage}%`, background: color,
          borderRadius: '8px', transition: 'width 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
          boxShadow: `0 0 10px ${color}55`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{percentage.toFixed(0)}% completado</span>
        <span style={{ fontSize: '0.75rem', color: remaining >= 0 ? color : 'var(--expense)' }}>
          {remaining >= 0 ? `Faltan ${formatCurrency(remaining)}` : '¡Meta superada!'}
        </span>
      </div>
    </div>
  );
};

const GoalsSection = ({ income, expenses, goals, onSaveGoals, transactions }) => {
  const [editing, setEditing]           = useState(false);
  const [incomeGoal, setIncomeGoal]     = useState(goals.income  || '');
  const [expenseGoal, setExpenseGoal]   = useState(goals.expense || '');
  const [catBudgets, setCatBudgets]     = useState(goals.categoryBudgets || {});
  const [editingCats, setEditingCats]   = useState(false);

  const handleSave = () => {
    onSaveGoals({ income: parseFloat(incomeGoal) || 0, expense: parseFloat(expenseGoal) || 0, categoryBudgets: catBudgets });
    setEditing(false);
  };

  const savingsRate = goals.income > 0
    ? (((goals.income - expenses) / goals.income) * 100).toFixed(1)
    : null;

  // Gasto real por categoría
  const spentByCategory = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category || 'other_expense'] = (acc[t.category || 'other_expense'] || 0) + t.amount;
      return acc;
    }, {});

  const budgetedCategories = CATEGORIES.filter(c =>
    catBudgets[c.id] > 0 || c.id === 'food' || c.id === 'transport' || c.id === 'entertainment'
  );

  return (
    <div className="card animate-fade" style={{ marginTop: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem' }}>🎯 Metas Financieras</h3>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            background: editing ? 'rgba(255,255,255,0.1)' : 'rgba(196,251,109,0.15)',
            border: 'none',
            color: editing ? 'var(--text-dim)' : 'var(--primary)',
            borderRadius: '10px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
          }}
        >{editing ? 'Cancelar' : 'Editar'}</button>
      </div>

      {editing ? (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Meta de Ingresos (mes)</label>
            <input type="text" inputMode="numeric" placeholder="ej: $ 3.000.000" 
              value={formatInputAmount(incomeGoal)} 
              onChange={e => setIncomeGoal(parseInputAmount(e.target.value))} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Límite de Gastos (mes)</label>
            <input type="text" inputMode="numeric" placeholder="ej: $ 1.500.000" 
              value={formatInputAmount(expenseGoal)} 
              onChange={e => setExpenseGoal(parseInputAmount(e.target.value))} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            Guardar Metas
          </button>
        </div>
      ) : (
        <>
          {goals.income > 0
            ? <GoalBar label="Meta de Ingresos" current={income} goal={goals.income} color="var(--income)" />
            : <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px' }}>Toca "Editar" para definir tu meta de ingresos.</p>
          }
          {goals.expense > 0
            ? <GoalBar label="Límite de Gastos" current={expenses} goal={goals.expense} color={expenses > goals.expense ? 'var(--expense)' : '#f5a623'} />
            : <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px' }}>Toca "Editar" para definir tu límite de gastos.</p>
          }
          {savingsRate !== null && (
            <div style={{
              background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)',
              borderRadius: '12px', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>💰 Tasa de ahorro estimada</span>
              <span style={{ fontWeight: '700', color: 'var(--income)', fontSize: '1rem' }}>{savingsRate}%</span>
            </div>
          )}

          {/* Presupuesto por categoría */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>Presupuesto por categoría</p>
              <button
                onClick={() => setEditingCats(e => !e)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
              >{editingCats ? 'Listo' : 'Editar'}</button>
            </div>

            {editingCats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CATEGORIES.filter(c => c.id !== 'salary' && c.id !== 'freelance' && c.id !== 'other_income').map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem', width: '24px' }}>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: '0.85rem' }}>{cat.label}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="$ 0"
                      value={formatInputAmount(catBudgets[cat.id] || '')}
                      onChange={e => setCatBudgets(prev => ({ ...prev, [cat.id]: parseInputAmount(e.target.value) }))}
                      style={{ width: '130px', margin: 0, padding: '8px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
                <button className="btn-primary" style={{ marginTop: '8px' }} onClick={() => {
                  onSaveGoals({ ...goals, categoryBudgets: catBudgets });
                  setEditingCats(false);
                }}>Guardar presupuestos</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(goals.categoryBudgets || {}).filter(([, v]) => v > 0).length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    Toca "Editar" para asignar límites por categoría.
                  </p>
                ) : (
                  Object.entries(goals.categoryBudgets || {})
                    .filter(([, budget]) => budget > 0)
                    .map(([catId, budget]) => {
                      const cat = CATEGORIES.find(c => c.id === catId);
                      const spent = spentByCategory[catId] || 0;
                      const pct = Math.min((spent / budget) * 100, 100);
                      return (
                        <div key={catId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '0.82rem' }}>{cat?.icon} {cat?.label}</span>
                            <span style={{ fontSize: '0.78rem', color: spent > budget ? 'var(--expense)' : 'var(--text-dim)' }}>
                              {formatCurrency(spent)} / {formatCurrency(budget)}
                            </span>
                          </div>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: spent > budget ? 'var(--expense)' : (cat?.color || 'var(--primary)'),
                              borderRadius: '6px', transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GoalsSection;
