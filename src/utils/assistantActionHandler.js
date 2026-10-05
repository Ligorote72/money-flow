/**
 * MoneyFlow AI Assistant - Manejador de Solicitudes Operativas
 * Procesa comandos de acción en lenguaje natural colombiano:
 * 1. Reasignar cuenta de una transacción (ej: "pasa el saldo de 500 a banco", "el último gasto fue de banco no de efectivo")
 * 2. Traspasos entre cuentas (ej: "pasa 500 del banco a efectivo", "transfiere 200 mil a nequi")
 * 3. Nivelar saldos negativos (ej: "nivela el saldo de efectivo con plata del banco", "cubre el negativo")
 * 4. Eliminar / Anular movimientos (ej: "borra el último gasto", "elimina el movimiento de 500")
 */

import { extractAmount } from './aiVoiceParser';

export function handleAssistantActionRequest(userText = '', { transactions = [], accountBalances = { cash: 0, bank: 0 }, banks = [], quickActionIds = [] }) {
  const lower = userText.toLowerCase().trim();

  // 1. Detectar si el mensaje es una SOLICITUD / ACCIÓN
  const isActionVerb = /\b(pasa|pasar|pásalo|pasalo|pásame|pasame|mueve|mover|muévelo|muevelo|cambia|cambiar|cámbialo|cambialo|cámbiale|cambiale|transfiere|transferir|reasigna|reasignar|corrige|corregir|elimina|eliminar|borra|borrar|anula|anular|nivela|nivelar|ajusta|ajustar|cubre|cubrir)\b/i.test(lower);
  
  if (!isActionVerb) return null;

  // Extraer montos potenciales (ej: 500, 500 mil, 500000, menos 500)
  let extractedAmount = null;
  const numMatch = lower.match(/(?:menos\s+)?(\d+(?:[.,]\d+)?)\s*(?:mil|k|lucas|barras|millones?|millón)?/i);
  if (numMatch) {
    extractedAmount = extractAmount(numMatch[0]);
    if (extractedAmount > 0 && extractedAmount < 1000) {
      // Si el usuario dijo "500" y tiene un saldo de -500.000 o transacciones de 500.000, normalizar a 500.000
      const has500kTxs = transactions.some(t => Math.abs(t.amount - 500000) < 1);
      const has500kCash = Math.abs(Math.abs(accountBalances.cash) - 500000) < 1;
      if (has500kTxs || has500kCash || extractedAmount >= 50) {
        extractedAmount = extractedAmount * 1000;
      }
    }
  }

  // Detectar cuentas origen y destino
  const mentionsBank = /\b(banco|bancos|nequi|bancolombia|daviplata|cuenta|cuentas)\b/i.test(lower);
  const mentionsCash = /\b(efectivo|mano|bolsillo|plata en mano)\b/i.test(lower);

  // =========================================================================
  // CASO A: REASIGNACIÓN DE CUENTA DE UN GASTO O MOVIMIENTO
  // Ej: "pasa el saldo de menos 500 a como si hubieran gastado del banco"
  // Ej: "cambia el gasto de 500 a banco"
  // Ej: "el último gasto fue de banco, no de efectivo"
  // =========================================================================
  const isReassignRequest = /\b(como si|gastado del|gastó del|gaste del|era de|fue de|cambia|cámbialo|reasigna|pasa el gasto|pasa el saldo de)\b/i.test(lower);

  if (isReassignRequest || (mentionsBank && (lower.includes('pasa') || lower.includes('cambia')))) {
    // Buscar la transacción que el usuario quiere reasignar
    let targetTx = null;

    if (extractedAmount && extractedAmount > 0) {
      // Buscar transacción con monto exacto o cercano
      targetTx = transactions.find(t => Math.abs(t.amount - extractedAmount) < 1 && t.type === 'expense');
      if (!targetTx) {
        targetTx = transactions.find(t => Math.abs(t.amount - extractedAmount) < 1);
      }
    }

    // Si no encontró por monto específico pero dijo "el último gasto"
    if (!targetTx && (lower.includes('último') || lower.includes('ultimo'))) {
      targetTx = transactions.find(t => t.type === 'expense') || transactions[0];
    }

    // Si encontramos una transacción específica para reasignar
    if (targetTx) {
      const newAccountId = mentionsBank ? 'bank' : (mentionsCash ? 'cash' : 'bank');
      const oldAccountId = targetTx.accountId || 'cash';

      return {
        action: 'reassign_account',
        targetTx,
        newAccountId,
        oldAccountId,
        amount: targetTx.amount,
        description: targetTx.description
      };
    }

    // Si no hay transacción previa exacta pero el usuario tiene saldo negativo en efectivo (ej: -$500.000)
    // y pide "pasa el saldo de menos 500 a banco" -> podemos hacer un traspaso o nivelación directa
    if (accountBalances.cash < 0 && mentionsBank) {
      const amountToTransfer = extractedAmount || Math.abs(accountBalances.cash);
      return {
        action: 'transfer_balance',
        fromAccount: 'bank',
        toAccount: 'cash',
        amount: amountToTransfer,
        reason: 'Nivelar saldo negativo de Efectivo con fondos de Banco'
      };
    }
  }

  // =========================================================================
  // CASO B: TRASPASO DIRECTO ENTRE CUENTAS
  // Ej: "pasa 500 del banco a efectivo"
  // Ej: "transfiere 200 mil de efectivo a banco"
  // =========================================================================
  const isTransferRequest = /\b(transfiere|transferir|traspasa|traspaso|pasa|mover|mueve)\b/i.test(lower) && extractedAmount > 0;

  if (isTransferRequest) {
    let fromAccount = 'cash';
    let toAccount = 'bank';

    // Determinar dirección: "del banco al efectivo" vs "de efectivo a banco"
    if (/\b(?:del|desde)\s+(?:el\s+)?banco/i.test(lower) || /\ba\s+(?:el\s+)?efectivo/i.test(lower)) {
      fromAccount = 'bank';
      toAccount = 'cash';
    } else if (/\b(?:del|desde)\s+(?:el\s+)?efectivo/i.test(lower) || /\ba\s+(?:el\s+)?banco/i.test(lower)) {
      fromAccount = 'cash';
      toAccount = 'bank';
    } else if (mentionsBank && lower.includes('efectivo')) {
      // Si efectivo está negativo, asumir que transfiere de banco a efectivo para cubrirlo
      if (accountBalances.cash < 0) {
        fromAccount = 'bank';
        toAccount = 'cash';
      }
    }

    return {
      action: 'transfer_balance',
      fromAccount,
      toAccount,
      amount: extractedAmount,
      reason: `Traspaso de ${fromAccount === 'bank' ? 'Banco' : 'Efectivo'} a ${toAccount === 'bank' ? 'Banco' : 'Efectivo'}`
    };
  }

  // =========================================================================
  // CASO C: NIVELAR / CUBRIR SALDO NEGATIVO
  // Ej: "nivela el saldo", "cubre el negativo con el banco"
  // =========================================================================
  const isLevelRequest = /\b(nivela|nivelar|cubre|cubrir|balancea|balancear|arregla el saldo)\b/i.test(lower);

  if (isLevelRequest) {
    if (accountBalances.cash < 0) {
      const amountNeeded = Math.abs(accountBalances.cash);
      return {
        action: 'transfer_balance',
        fromAccount: 'bank',
        toAccount: 'cash',
        amount: amountNeeded,
        reason: 'Nivelar saldo negativo de Efectivo con fondos de Banco'
      };
    } else if (accountBalances.bank < 0) {
      const amountNeeded = Math.abs(accountBalances.bank);
      return {
        action: 'transfer_balance',
        fromAccount: 'cash',
        toAccount: 'bank',
        amount: amountNeeded,
        reason: 'Nivelar saldo negativo de Banco con fondos de Efectivo'
      };
    }
  }

  // =========================================================================
  // CASO D: ELIMINAR O ANULAR UN MOVIMIENTO
  // Ej: "elimina el último gasto", "borra el movimiento de 500"
  // =========================================================================
  const isDeleteRequest = /\b(elimina|eliminar|borra|borrar|anula|anular)\b/i.test(lower) && !/\b(boton|botones|botón|acceso|accesos)\b/i.test(lower);

  if (isDeleteRequest) {
    let targetTx = null;
    if (extractedAmount && extractedAmount > 0) {
      targetTx = transactions.find(t => Math.abs(t.amount - extractedAmount) < 1);
    } else if (lower.includes('último') || lower.includes('ultimo')) {
      targetTx = transactions[0];
    }

    if (targetTx) {
      return {
        action: 'delete_transaction',
        targetTx,
        amount: targetTx.amount,
        description: targetTx.description
      };
    }
  }

  // =========================================================================
  // CASO E: PERSONALIZAR BOTONES DE ACCESO RÁPIDO
  // Ej: "quita el botón de finca", "agrega el botón de deudas", "pon cochinito en accesos rápidos"
  // =========================================================================
  const isQuickActionRequest = /\b(acceso|accesos|boton|botones|botón|barra)\b/i.test(lower) || 
                               /\b(quita|quitar|elimina|eliminar|saca|sacar|borra|agrega|agregar|pon|poner|añade|añadir|restaura|restaurar)\b.*\b(finca|deuda|deudas|cochinito|cochinitos|traspaso|ingreso|gasto|gastos|voz|chat|suscripciones|fijos|metas|presupuesto)\b/i.test(lower);

  if (isQuickActionRequest) {
    const ACTION_MAP = {
      finca: 'minegocio',
      cafe: 'minegocio',
      cosecha: 'minegocio',
      deuda: 'debts',
      deudas: 'debts',
      prestamo: 'debts',
      cochinito: 'ahorro',
      cochinitos: 'ahorro',
      alcancia: 'ahorro',
      ahorro: 'ahorro',
      fijo: 'subs',
      fijos: 'subs',
      suscripcion: 'subs',
      suscripciones: 'subs',
      meta: 'goals',
      metas: 'goals',
      presupuesto: 'goals',
      traspaso: 'transfer',
      transferencia: 'transfer',
      ingreso: 'income',
      gasto: 'expense',
      voz: 'voice',
      chat: 'chat'
    };

    const ACTION_LABELS = {
      minegocio: 'Finca @',
      debts: 'Deudas & Préstamos',
      ahorro: 'Cochinitos de Ahorro',
      subs: 'Gastos Fijos',
      goals: 'Presupuestos',
      transfer: 'Traspaso',
      income: '+ Ingreso',
      expense: '- Gasto',
      voice: 'Voz IA',
      chat: 'Chat IA'
    };

    // Restaurar por defecto
    if (lower.includes('restaura') || lower.includes('reinicia') || lower.includes('por defecto') || lower.includes('original')) {
      const defaultIds = ['income', 'expense', 'transfer', 'voice', 'chat', 'minegocio'];
      return {
        action: 'customize_quick_actions',
        newIds: defaultIds,
        message: '🔄 **Accesos Rápidos Restaurados:** Se han reestablecido los botones originales por defecto (+ Ingreso, - Gasto, Traspaso, Voz IA, Chat IA, Finca @).'
      };
    }

    // Identificar qué botón se quiere modificar
    let matchedKey = null;
    for (const [kw, id] of Object.entries(ACTION_MAP)) {
      if (lower.includes(kw)) {
        matchedKey = id;
        break;
      }
    }

    if (matchedKey) {
      const isRemove = /\b(quita|quitar|elimina|eliminar|saca|sacar|borra|borrar|no quiero)\b/i.test(lower);
      const isAdd = /\b(agrega|agregar|pon|poner|añade|añadir|incluye|incluir)\b/i.test(lower);
      const currentList = quickActionIds && quickActionIds.length > 0 ? [...quickActionIds] : ['income', 'expense', 'transfer', 'voice', 'chat', 'minegocio'];
      const targetLabel = ACTION_LABELS[matchedKey] || matchedKey;

      if (isRemove) {
        const filtered = currentList.filter(id => id !== matchedKey);
        return {
          action: 'customize_quick_actions',
          newIds: filtered,
          message: `🗑️ **Botón Eliminado:** Se ha quitado el botón **"${targetLabel}"** de tu barra de accesos rápidos en el Inicio.`
        };
      }

      if (isAdd) {
        if (!currentList.includes(matchedKey)) {
          currentList.push(matchedKey);
        }
        return {
          action: 'customize_quick_actions',
          newIds: currentList,
          message: `✨ **Botón Agregado:** Se ha añadido el botón **"${targetLabel}"** a tu barra de accesos rápidos en el Inicio.`
        };
      }
    }
  }

  return null;
}
