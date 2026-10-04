/**
 * aiVoiceParser.js - Motor de Inteligencia y Lenguaje Natural Financiero para MoneyFlow
 * Interpreta texto o transcripciones de voz en español y extrae transacciones estructuradas:
 * - Traspasos cruzados (ej. "Le transferí a Carlos 200.000 y me los dio en efectivo")
 * - Gastos en efectivo o banco (ej. "Pagué 15 mil de taxi en efectivo")
 * - Ingresos (ej. "Me consignaron 1 millón de sueldo al banco")
 */

import { CATEGORIES } from '../data/categories.js';

/**
 * Normaliza y extrae un valor numérico a partir de lenguaje natural colombiano/latino
 * Soporta: "200.000", "200000", "200 mil", "50k", "1.5 millones", "1 millón", "50 lucas"
 */
export function extractAmount(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[$]/g, '').trim();

  // Caso: X millones (ej. "1.5 millones", "2 millones", "1,5 millones")
  const millionMatch = clean.match(/([\d]+(?:[.,]\d+)?)\s*(?:millones|millón|millon)/i);
  if (millionMatch) {
    const raw = millionMatch[1].replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val)) return Math.round(val * 1000000);
  }

  // Caso: X mil / lucas / k (ej. "200 mil", "50 lucas", "100k")
  const thousandMatch = clean.match(/([\d]+(?:[.,]\d+)?)\s*(?:mil|k|lucas|barras)/i);
  if (thousandMatch) {
    const raw = thousandMatch[1].replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Caso: Números directos formateados o estándar (ej. "200.000", "15000", "25,000")
  const numMatch = clean.match(/\b\d{1,3}(?:[.,]\d{3})+(?!\d)|\b\d+(?:[.,]\d+)?\b/);
  if (numMatch) {
    let raw = numMatch[0];
    if (raw.includes('.') && raw.includes(',')) {
      raw = raw.replace(/\./g, '').replace(',', '.');
    } else if (raw.includes('.') && raw.split('.')[1]?.length === 3) {
      raw = raw.replace(/\./g, '');
    } else if (raw.includes(',') && raw.split(',')[1]?.length === 3) {
      raw = raw.replace(/,/g, '');
    }
    const val = parseFloat(raw);
    if (!isNaN(val)) return Math.round(val);
  }

  return null;
}

/**
 * Clasifica la categoría más probable basada en palabras clave
 */
export function detectCategory(text, type = 'expense') {
  if (type === 'transfer') return 'transfer';
  const t = text.toLowerCase();

  const rules = [
    { id: 'food', keywords: ['almuerzo', 'comida', 'cena', 'desayuno', 'restaurante', 'mercado', 'hamburguesa', 'pizza', 'café', 'panadería', 'supermercado', 'tienda', 'onces'] },
    { id: 'transport', keywords: ['taxi', 'uber', 'didi', 'gasolina', 'bus', 'pasaje', 'transmilenio', 'metro', 'peaje', 'parqueadero', 'moto'] },
    { id: 'entertainment', keywords: ['cine', 'fiesta', 'cerveza', 'rumba', 'bar', 'juego', 'salida', 'netflix', 'spotify', 'discoteca'] },
    { id: 'utilities', keywords: ['luz', 'agua', 'gas', 'internet', 'claro', 'tigo', 'movistar', 'recibo', 'factura', 'servicios', 'arriendo'] },
    { id: 'health', keywords: ['farmacia', 'droguería', 'médico', 'medicina', 'pastillas', 'cita', 'dentista', 'hospital'] },
    { id: 'shopping', keywords: ['ropa', 'zapatos', 'camisa', 'pantalón', 'compras', 'mall', 'centro comercial'] },
    { id: 'salary', keywords: ['sueldo', 'salario', 'nómina', 'quincena', 'pago'] },
    { id: 'freelance', keywords: ['honorarios', 'trabajo extra', 'cliente', 'proyecto', 'venta'] }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => t.includes(k))) {
      return rule.id;
    }
  }

  return type === 'income' ? 'other_income' : 'other_expense';
}

/**
 * Parser principal de intención financiera
 */
export function parseFinancialVoiceCommand(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  // 1. DETECCIÓN DE TRASPASOS / TRANSFERENCIAS CRUZADAS
  // Ejemplos:
  // "Le transferí a Juan 200.000 y me pasó en efectivo"
  // "Pasé 50 mil de mi cuenta a efectivo"
  // "Saqué 100 mil del cajero a efectivo"
  // "Cambié 200 mil de efectivo al banco"
  const isTransferIndicative = 
    lower.includes('transferí') || 
    lower.includes('transferi') || 
    lower.includes('traspaso') ||
    lower.includes('pasé') || 
    lower.includes('pase') ||
    lower.includes('cajero') ||
    lower.includes('retiré') ||
    lower.includes('retire') ||
    lower.includes('cambié') ||
    lower.includes('cambie') ||
    (lower.includes('cuenta') && lower.includes('efectivo')) ||
    (lower.includes('banco') && lower.includes('efectivo'));

  if (isTransferIndicative) {
    let accountId = 'bank';
    let toAccountId = 'cash';

    // Inversión: De efectivo a banco
    if (
      lower.includes('de efectivo a cuenta') || 
      lower.includes('de efectivo al banco') ||
      lower.includes('consigné a mi cuenta') ||
      lower.includes('consigne a mi cuenta')
    ) {
      accountId = 'cash';
      toAccountId = 'bank';
    }

    // Limpieza de descripción
    let desc = text;
    // Si menciona a alguien (ej. "Le transferí a Carlos 200 mil...")
    const personMatch = text.match(/(?:a|para)\s+([A-ZÁÉÍÓÚa-záéíóú]+)/i);
    const person = personMatch ? personMatch[1] : '';

    if (person && !['mi', 'la', 'el', 'cuenta', 'banco', 'efectivo'].includes(person.toLowerCase())) {
      desc = `Traspaso con ${person} (Efectivo ⇄ Cuenta)`;
    } else {
      desc = accountId === 'bank' && toAccountId === 'cash' 
        ? 'Retiro / Cambio a Efectivo' 
        : 'Consignación a Cuenta';
    }

    return {
      type: 'transfer',
      amount,
      accountId,
      toAccountId,
      category: 'transfer',
      description: desc,
      confidence: 0.95,
      summary: `Traspaso: -$${amount.toLocaleString('es-CO')} de ${accountId === 'bank' ? 'Banco' : 'Efectivo'} ➔ +$${amount.toLocaleString('es-CO')} en ${toAccountId === 'cash' ? 'Efectivo' : 'Banco'}`
    };
  }

  // 2. DETECCIÓN DE INGRESOS
  const isIncomeIndicative = 
    lower.includes('me pagaron') || 
    lower.includes('me consignaron') || 
    lower.includes('recibí') || 
    lower.includes('recibi') || 
    lower.includes('cobré') || 
    lower.includes('cobre') || 
    lower.includes('ingreso') ||
    lower.includes('sueldo') ||
    lower.includes('nómina') ||
    lower.includes('quincena');

  if (isIncomeIndicative) {
    const accountId = lower.includes('efectivo') ? 'cash' : 'bank';
    const category = detectCategory(lower, 'income');
    return {
      type: 'income',
      amount,
      accountId,
      category,
      description: text,
      confidence: 0.9,
      summary: `Ingreso: +$${amount.toLocaleString('es-CO')} a ${accountId === 'cash' ? 'Efectivo' : 'Banco'}`
    };
  }

  // 3. DETECCIÓN DE GASTOS (Por defecto en lenguaje cotidiano)
  // Ej: "Pagué 15.000 del almuerzo en efectivo"
  const accountId = lower.includes('efectivo') ? 'cash' : (lower.includes('tarjeta') || lower.includes('cuenta') || lower.includes('banco') ? 'bank' : 'cash');
  const category = detectCategory(lower, 'expense');

  return {
    type: 'expense',
    amount,
    accountId,
    category,
    description: text,
    confidence: 0.88,
    summary: `Gasto: -$${amount.toLocaleString('es-CO')} desde ${accountId === 'cash' ? 'Efectivo' : 'Banco'}`
  };
}
