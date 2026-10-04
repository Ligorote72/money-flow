import { parseFinancialVoiceCommand } from '../src/utils/aiVoiceParser.js';

console.log('--- TEST 1: Sin efectivo, suficiente en banco ---');
const res1 = parseFinancialVoiceCommand('Gasté 500 mil pesos en pagar el computador', { 
  accountBalances: { cash: 0, bank: 1000000 } 
});
console.log('Result 1:', {
  amount: res1.amount,
  category: res1.category,
  accountId: res1.accountId,
  smartNotice: res1.smartNotice,
  requiresClarification: res1.requiresClarification
});

console.log('\n--- TEST 2: Ambos tienen saldo suficiente ---');
const res2 = parseFinancialVoiceCommand('Gasté 500 mil pesos en el computador', { 
  accountBalances: { cash: 500000, bank: 1000000 } 
});
console.log('Result 2:', {
  amount: res2.amount,
  category: res2.category,
  accountId: res2.accountId,
  smartNotice: res2.smartNotice,
  requiresClarification: res2.requiresClarification
});

console.log('\n--- TEST 3: División por voz (Split) ---');
const res3 = parseFinancialVoiceCommand('Pagué 500 mil en el computador, 200 en efectivo y el resto en banco');
console.log('Result 3:', {
  amount: res3.amount,
  isSplit: res3.isSplit,
  splitCash: res3.splitCash,
  splitBank: res3.splitBank,
  category: res3.category,
  summary: res3.summary
});

console.log('\n--- TEST 4: Caso del Usuario (me entraron $500,000 en efectivo con saldo negativo) ---');
const res4 = parseFinancialVoiceCommand('me entraron $500,000 en efectivo', {
  accountBalances: { cash: -500000, bank: 1369600 }
});
console.log('Result 4:', {
  type: res4.type,
  amount: res4.amount,
  accountId: res4.accountId,
  category: res4.category,
  smartNotice: res4.smartNotice,
  summary: res4.summary
});

console.log('\n--- TEST 5: Ingreso a Banco ---');
const res5 = parseFinancialVoiceCommand('me consignaron 1 millón de sueldo al banco', {
  accountBalances: { cash: 100000, bank: 500000 }
});
console.log('Result 5:', {
  type: res5.type,
  amount: res5.amount,
  accountId: res5.accountId,
  category: res5.category,
  summary: res5.summary
});

console.log('\n--- TEST 6: Ingreso Dividido ---');
const res6 = parseFinancialVoiceCommand('recibí 600 mil, mitad efectivo mitad banco', {
  accountBalances: { cash: 100000, bank: 500000 }
});
console.log('Result 6:', {
  type: res6.type,
  amount: res6.amount,
  isSplit: res6.isSplit,
  splitCash: res6.splitCash,
  splitBank: res6.splitBank,
  summary: res6.summary
});
