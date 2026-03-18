export const CATEGORIES = [
  { id: 'food',          label: 'Comida',        icon: '🍔', color: '#FF9F0A' },
  { id: 'transport',     label: 'Transporte',     icon: '🚗', color: '#30D158' },
  { id: 'health',        label: 'Salud',          icon: '💊', color: '#FF375F' },
  { id: 'entertainment', label: 'Entretenimiento',icon: '🎮', color: '#BF5AF2' },
  { id: 'home',          label: 'Hogar',          icon: '🏠', color: '#0A84FF' },
  { id: 'education',     label: 'Educación',      icon: '📚', color: '#32D74B' },
  { id: 'clothing',      label: 'Ropa',           icon: '👕', color: '#FF6961' },
  { id: 'savings',       label: 'Ahorro',         icon: '💰', color: '#FFD60A' },
  { id: 'salary',        label: 'Salario',        icon: '💼', color: '#34C759' },
  { id: 'freelance',     label: 'Freelance',      icon: '💻', color: '#64D2FF' },
  { id: 'other_income',  label: 'Otro Ingreso',   icon: '➕', color: '#30D158' },
  { id: 'other_expense', label: 'Otro Gasto',     icon: '💸', color: '#8E8E93' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find(c => c.id === id) || { id: 'other_expense', label: 'Otro', icon: '💸', color: '#8E8E93' };
