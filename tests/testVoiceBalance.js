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
