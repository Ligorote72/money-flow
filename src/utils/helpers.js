/**
 * Genera y descarga un CSV con el historial de transacciones.
 */
export const exportToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) return;

  const headers = ['Fecha', 'Descripcion', 'Tipo', 'Categoria', 'Monto', 'Cuenta Origen', 'Cuenta Destino'];
  
  const getAccName = (id) => {
    if (!id) return '';
    if (id === 'cash') return 'Efectivo';
    if (id === 'savings') return 'Ahorros';
    if (id === 'bank' || id === 'general') return 'Banco Principal';
    return id; // Podría mejorar pasando la lista de bancos, pero por ahora esto sirve
  };

  const rows = transactions.map(tx => [
    new Date(tx.date).toLocaleDateString('es-ES'),
    `"${tx.description}"`,
    tx.type === 'income' ? 'Ingreso' : (tx.type === 'expense' ? 'Gasto' : 'Traspaso'),
    tx.category || 'Sin categoría',
    tx.amount,
    getAccName(tx.accountId),
    getAccName(tx.toAccountId),
  ]);

  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `moneyflow_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Genera las alertas in-app basadas en metas y transacciones del mes actual.
 */
export const generateAlerts = (transactions, goals) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTxs = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income   = monthTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const alerts = [];

  // Alertas de gastos
  if (goals.expense > 0) {
    const ratio = expenses / goals.expense;
    if (ratio >= 1) {
      alerts.push({
        type: 'danger',
        title: '¡Límite de gastos superado!',
        message: `Llevas $${expenses.toLocaleString()} en gastos y tu límite es $${goals.expense.toLocaleString()}.`,
      });
    } else if (ratio >= 0.8) {
      alerts.push({
        type: 'warning',
        title: 'Cerca del límite de gastos',
        message: `Llevas el ${(ratio * 100).toFixed(0)}% de tu presupuesto (${(1 - ratio) * 100 <= 0 ? 0 : ((1 - ratio) * goals.expense).toFixed(0)} restante).`,
      });
    }
  }

  // Alertas de ingresos
  if (goals.income > 0) {
    if (income >= goals.income) {
      alerts.push({
        type: 'success',
        title: '¡Meta de ingresos alcanzada! 🎉',
        message: `Alcanzaste tu meta de $${goals.income.toLocaleString()} en ingresos este mes.`,
      });
    }
  }

  // Recordatorio de registro
  const lastTx = transactions[0];
  if (lastTx) {
    const daysSince = Math.floor((now - new Date(lastTx.date)) / (1000 * 60 * 60 * 24));
    if (daysSince >= 3) {
      alerts.push({
        type: 'info',
        title: 'Recuerda registrar tus movimientos',
        message: `Han pasado ${daysSince} días desde tu último registro. ¡Mantén tu balance actualizado!`,
      });
    }
  }

  return alerts;
};

/**
 * Formatea un número como moneda en pesos colombianos ($1.750.000)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/,00$/, '').replace('COP', '').trim();
};

/**
 * Formatea un string numérico con puntos de miles para inputs ($ 1.250.000)
 */
export const formatInputAmount = (numStr) => {
  if (!numStr) return '';
  const clean = numStr.toString().replace(/\D/g, '');
  if (!clean) return '';
  return '$ ' + clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Limpia el formato de moneda para obtener el número puro en string
 */
export const parseInputAmount = (formattedValue) => {
  return formattedValue.replace(/\D/g, '');
};
