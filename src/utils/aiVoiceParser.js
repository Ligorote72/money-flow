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
 * Utilidad para eliminar tildes y diacríticos manteniendo texto estándar para regex
 */
export function stripAccents(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Clasifica la categoría más probable basada en palabras clave
 */
export function detectCategory(text, type = 'expense') {
  if (type === 'transfer') return 'transfer';
  const t = stripAccents(text);

  if (type === 'income') {
    if (/sueldo|salario|nomina|quincena|mesada/.test(t)) return 'salary';
    if (/freelance|honorarios|trabajo extra|proyecto|cliente|venta|vendi|cosecha|cafe|pesada|recoleccion/.test(t)) return 'freelance';
    return 'other_income';
  }

  const rules = [
    { id: 'food', keywords: ['almuerzo[s]?', 'comida[s]?', 'cena[s]?', 'desayuno[s]?', 'restaurante[s]?', 'mercado[s]?', 'hamburguesa[s]?', 'pizza[s]?', 'cafe[s]?', 'panaderia[s]?', 'supermercado[s]?', 'tienda[s]?', 'onces', 'gaseosa[s]?', 'mecato', 'pan[es]?'] },
    { id: 'transport', keywords: ['taxi[s]?', 'uber', 'didi', 'gasolina', 'bus[es]?', 'pasaje[s]?', 'transmilenio', 'metro', 'peaje[s]?', 'parqueadero[s]?', 'moto[s]?', 'carro[s]?', 'taller', 'aceite', 'llanta[s]?'] },
    { id: 'entertainment', keywords: ['cine', 'fiesta[s]?', 'cerveza[s]?', 'pola[s]?', 'rumba', 'bar[es]?', 'juego[s]?', 'salida[s]?', 'netflix', 'spotify', 'discoteca[s]?', 'paseo[s]?'] },
    { id: 'utilities', keywords: ['luz', 'agua', '\\bgas\\b', 'internet', 'claro', 'tigo', 'movistar', 'recibo[s]?', 'factura[s]?', 'servicio[s]?', 'arriendo[s]?', 'deuda[s]?', 'cuota[s]?', 'prestamo[s]?'] },
    { id: 'health', keywords: ['farmacia[s]?', 'drogueria[s]?', 'medico[s]?', 'medicina[s]?', 'pastilla[s]?', 'cita[s]?', 'dentista[s]?', 'hospital[es]?', 'remedio[s]?'] },
    { id: 'clothing', keywords: ['ropa', 'zapato[s]?', 'camisa[s]?', 'pantalon[es]?', 'chaqueta[s]?', 'tenis', 'vestido[s]?', 'jean[s]?', 'camiseta[s]?'] },
    { id: 'shopping', keywords: ['compra[s]?', 'mall', 'centro comercial', 'computador[es]?', 'celular[es]?', 'laptop[s]?', 'tecnologia', 'audifono[s]?', 'tablet[s]?', 'electronica', 'equipo[s]?'] }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => {
      if (k.startsWith('\\b') || k.endsWith('\\b')) {
        return new RegExp(k, 'i').test(t);
      }
      return new RegExp(`\\b${k}\\b`, 'i').test(t);
    })) {
      return rule.id;
    }
  }

  return 'other_expense';
}

/**
 * Parser principal de intención financiera con inteligencia de saldos
 * @param {string} rawText - Frase dicha o escrita por el usuario
 * @param {object} options - Opciones adicionales como { accountBalances: { cash, bank, savings } }
 */
export function parseFinancialVoiceCommand(rawText, options = {}) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();
  const lower = stripAccents(text);
  const balances = options.accountBalances || null;

  const totalAmount = extractAmount(text);
  if (!totalAmount || totalAmount <= 0) return null;

  // 1. DETECCIÓN DE DIVISIÓN DE PAGO (SPLIT PAYMENT) POR VOZ
  // Ejemplos:
  // "Pagué 500 mil, 200 en efectivo y el resto en banco"
  // "500 mil pesos, 200 en efectivo y 300 en cuenta"
  // "Pagué 100 mil, mitad efectivo mitad banco"
  let isSplit = false;
  let splitCash = 0;
  let splitBank = 0;

  if (lower.includes('mitad efectivo') || lower.includes('mitad banco') || lower.includes('mitad y mitad')) {
    isSplit = true;
    splitCash = Math.round(totalAmount / 2);
    splitBank = totalAmount - splitCash;
  } else {
    // Buscar si menciona cuánto en efectivo y cuánto en banco/cuenta
    const cashPartMatch = lower.match(/(?:(?:gaste|pague|puse|recibi|entraron)?\s*(\d[\d\s.,]*(?:mil|k|lucas|millones|millon)?)\s*(?:en|de|con)?\s*(?:efectivo|plata))/i);
    const bankPartMatch = lower.match(/(?:(?:gaste|pague|puse|recibi|entraron)?\s*(\d[\d\s.,]*(?:mil|k|lucas|millones|millon)?)\s*(?:en|de|por|con)?\s*(?:banco|cuenta|tarjeta|transferencia|nequi|daviplata))/i);

    if (cashPartMatch && bankPartMatch) {
      let cAmt = extractAmount(cashPartMatch[1]);
      let bAmt = extractAmount(bankPartMatch[1]);
      if (cAmt && totalAmount >= 1000 && cAmt < 1000 && cAmt * 1000 <= totalAmount) cAmt *= 1000;
      if (bAmt && totalAmount >= 1000 && bAmt < 1000 && bAmt * 1000 <= totalAmount) bAmt *= 1000;
      if (cAmt && bAmt) {
        isSplit = true;
        splitCash = cAmt;
        splitBank = bAmt;
      }
    } else if (cashPartMatch && (lower.includes('el resto en banco') || lower.includes('el resto por cuenta') || lower.includes('el resto por transferencia') || lower.includes('resto en cuenta') || lower.includes('resto en banco'))) {
      let cAmt = extractAmount(cashPartMatch[1]);
      if (cAmt && totalAmount >= 1000 && cAmt < 1000 && cAmt * 1000 <= totalAmount) cAmt *= 1000;
      if (cAmt && cAmt < totalAmount) {
        isSplit = true;
        splitCash = cAmt;
        splitBank = totalAmount - cAmt;
      }
    } else if (bankPartMatch && (lower.includes('el resto en efectivo') || lower.includes('el resto en plata') || lower.includes('resto en efectivo'))) {
      let bAmt = extractAmount(bankPartMatch[1]);
      if (bAmt && totalAmount >= 1000 && bAmt < 1000 && bAmt * 1000 <= totalAmount) bAmt *= 1000;
      if (bAmt && bAmt < totalAmount) {
        isSplit = true;
        splitBank = bAmt;
        splitCash = totalAmount - bAmt;
      }
    }
  }

  // 2. DETECCIÓN DE TRASPASOS / TRANSFERENCIAS CRUZADAS (Solo si NO es pago dividido)
  const isTransferIndicative = !isSplit && (
    lower.includes('transferi') || 
    lower.includes('traspaso') ||
    lower.includes('pase de') || 
    lower.includes('cajero') ||
    lower.includes('retire') ||
    lower.includes('cambie') ||
    (lower.includes('de mi cuenta a efectivo') || lower.includes('de cuenta a efectivo')) ||
    (lower.includes('de efectivo a mi cuenta') || lower.includes('de efectivo a cuenta'))
  );

  if (isTransferIndicative) {
    let accountId = 'bank';
    let toAccountId = 'cash';

    // Inversión: De efectivo a banco
    if (
      lower.includes('de efectivo a cuenta') || 
      lower.includes('de efectivo al banco') ||
      lower.includes('consigne a mi cuenta')
    ) {
      accountId = 'cash';
      toAccountId = 'bank';
    }

    let desc = text;
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
      amount: totalAmount,
      accountId,
      toAccountId,
      category: 'transfer',
      description: desc,
      confidence: 0.95,
      summary: `Traspaso: -$${totalAmount.toLocaleString('es-CO')} de ${accountId === 'bank' ? 'Banco' : 'Efectivo'} ➔ +$${totalAmount.toLocaleString('es-CO')} en ${toAccountId === 'cash' ? 'Efectivo' : 'Banco'}`
    };
  }

  // 3. DETECCIÓN DE INGRESOS
  const isIncomeIndicative = 
    /\b(me entraron|me entro|entraron|entro)\b/i.test(lower) ||
    /\b(me llegaron|me llego|llegaron|llego)\b/i.test(lower) ||
    /\b(me pagaron|pagaron|me cancelaron|cancelaron)\b/i.test(lower) ||
    /\b(me consignaron|consignaron|consignacion)\b/i.test(lower) ||
    /\b(me depositaron|depositaron|deposito)\b/i.test(lower) ||
    /\b(me giraron|giraron|giro recibido)\b/i.test(lower) ||
    /\b(recibi|recibido|recibo)\b/i.test(lower) ||
    /\b(gane|ganancia|ganancias)\b/i.test(lower) ||
    /\b(cobre|cobro|cobrado)\b/i.test(lower) ||
    /\b(ingreso|ingresos)\b/i.test(lower) ||
    /\b(sueldo|salario|nomina|quincena|mesada)\b/i.test(lower) ||
    /\b(venta de|vendi|ventas)\b/i.test(lower) ||
    /\b(me dieron|me regalaron|me pasaron plata|me prestaron)\b/i.test(lower) ||
    /\b(me transfirieron|me transfirio)\b/i.test(lower) ||
    /\b(cosecha|pesada de cafe|pesada)\b/i.test(lower);

  if (isIncomeIndicative) {
    const hasExplicitCash = /\b(en efectivo|con efectivo|en plata|al efectivo|a efectivo|a la mano|de contado|en billetes)\b/i.test(lower);
    const hasExplicitBank = /\b(al banco|en el banco|en banco|en cuenta|a la cuenta|a mi cuenta|en mi cuenta|por nequi|a nequi|al nequi|por daviplata|a daviplata|al daviplata|por bancolombia|a bancolombia|al bancolombia|por transferencia|en tarjeta|a la tarjeta)\b/i.test(lower);

    let accountId = 'cash';
    let smartNotice = null;
    let requiresClarification = false;

    const cashBalance = balances ? (balances.cash || 0) : null;
    const bankBalance = balances ? (balances.bank || 0) : null;

    if (isSplit && splitCash > 0 && splitBank > 0) {
      smartNotice = `💡 Ingreso dividido: +$${splitCash.toLocaleString('es-CO')} en Efectivo y +$${splitBank.toLocaleString('es-CO')} en Banco.`;
    } else if (hasExplicitCash) {
      accountId = 'cash';
      if (cashBalance !== null && cashBalance < 0) {
        const after = cashBalance + totalAmount;
        smartNotice = `💡 Este ingreso en efectivo cubrirá tu saldo negativo (pasará de $${cashBalance.toLocaleString('es-CO')} a $${after.toLocaleString('es-CO')}).`;
      }
    } else if (hasExplicitBank) {
      accountId = 'bank';
      if (bankBalance !== null && bankBalance < 0) {
        const after = bankBalance + totalAmount;
        smartNotice = `💡 Este ingreso en banco cubrirá tu saldo negativo (pasará de $${bankBalance.toLocaleString('es-CO')} a $${after.toLocaleString('es-CO')}).`;
      }
    } else {
      // Si el usuario no especificó cuenta para el ingreso:
      requiresClarification = true;
      if (cashBalance !== null && cashBalance < 0) {
        accountId = 'cash';
        smartNotice = `💡 Sugerido Efectivo para cubrir tu saldo negativo actual ($${cashBalance.toLocaleString('es-CO')}).`;
      } else {
        accountId = 'cash';
        smartNotice = `¿Deseas ingresarlo en Efectivo o en Banco / Cuentas?`;
      }
    }

    const category = detectCategory(lower, 'income');

    return {
      type: 'income',
      amount: totalAmount,
      accountId,
      category,
      description: text,
      confidence: 0.95,
      isSplit,
      splitCash,
      splitBank,
      smartNotice,
      requiresClarification,
      cashBalance,
      bankBalance,
      summary: isSplit
        ? `Ingreso Dividido: $${totalAmount.toLocaleString('es-CO')} (+$${splitCash.toLocaleString('es-CO')} Efectivo + $${splitBank.toLocaleString('es-CO')} Banco)`
        : `Ingreso: +$${totalAmount.toLocaleString('es-CO')} a ${accountId === 'cash' ? 'Efectivo' : 'Banco'}`
    };
  }

  // 4. DETECCIÓN DE GASTOS Y ASIGNACIÓN INTELIGENTE DE CUENTA
  const hasExplicitCash = /\b((?:en|con|de|del|desde)\s*(?:el\s*|mi\s*|la\s*)?(?:efectivo|plata|bolsillo|billetes|fisico)|a la mano|de contado)\b/i.test(lower);
  const hasExplicitBank = /\b((?:con|por|en|de|del|a la|desde)\s*(?:la\s*|mi\s*|el\s*)?(?:tarjeta|nequi|daviplata|bancolombia|banco|cuenta|transferencia))\b/i.test(lower);

  let accountId = 'cash';
  let smartNotice = null;
  let requiresClarification = false;

  const cashBalance = balances ? (balances.cash || 0) : null;
  const bankBalance = balances ? (balances.bank || 0) : null;

  if (hasExplicitCash) {
    accountId = 'cash';
    if (cashBalance !== null && cashBalance < totalAmount) {
      smartNotice = `⚠️ Mencionaste Efectivo, pero tu saldo actual es de $${cashBalance.toLocaleString('es-CO')}.`;
    }
  } else if (hasExplicitBank) {
    accountId = 'bank';
    if (bankBalance !== null && bankBalance < totalAmount) {
      smartNotice = `⚠️ Mencionaste Banco/Cuenta, pero tu saldo actual es de $${bankBalance.toLocaleString('es-CO')}.`;
    }
  } else {
    // El usuario NO especificó cuenta -> LÓGICA DE SALDOS REALES
    if (balances !== null) {
      if (cashBalance <= 0 && bankBalance >= totalAmount) {
        // Caso: Sin efectivo, pero con fondos en el banco
        accountId = 'bank';
        smartNotice = `💡 Asignado a Banco: no tienes saldo en efectivo ($${cashBalance.toLocaleString('es-CO')}) y en banco tienes $${bankBalance.toLocaleString('es-CO')}.`;
      } else if (cashBalance < totalAmount && bankBalance >= totalAmount) {
        // Caso: Efectivo insuficiente, banco suficiente
        accountId = 'bank';
        smartNotice = `💡 Asignado a Banco: tu efectivo ($${cashBalance.toLocaleString('es-CO')}) no cubre los $${totalAmount.toLocaleString('es-CO')}.`;
        requiresClarification = true;
      } else if (bankBalance < totalAmount && cashBalance >= totalAmount) {
        // Caso: Banco insuficiente, efectivo suficiente
        accountId = 'cash';
        smartNotice = `💡 Asignado a Efectivo: tu banco ($${bankBalance.toLocaleString('es-CO')}) no cubre el valor total.`;
      } else if (cashBalance > 0 && bankBalance > 0) {
        // Ambos tienen fondos
        requiresClarification = true;
        accountId = cashBalance >= totalAmount ? 'cash' : 'bank';
        smartNotice = `¿Deseas pagarlo en Efectivo, Banco o Dividirlo en ambas?`;
      } else {
        accountId = 'cash';
      }
    } else {
      accountId = 'cash';
    }
  }

  const category = detectCategory(lower, 'expense');

  return {
    type: 'expense',
    amount: totalAmount,
    accountId,
    category,
    description: text,
    confidence: 0.9,
    isSplit,
    splitCash,
    splitBank,
    smartNotice,
    requiresClarification,
    cashBalance,
    bankBalance,
    summary: isSplit 
      ? `Gasto Dividido: $${totalAmount.toLocaleString('es-CO')} ($${splitCash.toLocaleString('es-CO')} Efectivo + $${splitBank.toLocaleString('es-CO')} Banco)`
      : `Gasto: -$${totalAmount.toLocaleString('es-CO')} desde ${accountId === 'cash' ? 'Efectivo' : 'Banco'}`
  };
}
