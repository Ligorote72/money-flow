import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Sparkles, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Building2, 
  RotateCcw,
  Smartphone,
  HelpCircle,
  BarChart3,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseFinancialVoiceCommand } from '../utils/aiVoiceParser';
import { findKnowledgeAnswer } from '../utils/assistantKnowledge';
import { handleAssistantActionRequest } from '../utils/assistantActionHandler';

const SUGGESTIONS = [
  '🎙️ "Gasté 25 mil en almuerzo en efectivo"',
  '🔄 "Pasa el gasto de 500 al banco"',
  '💰 "¿Cuál es mi saldo actual?"',
  '☕ "¿Cómo funciona el módulo de Finca?"',
  '📲 "¿Cómo dejo este Chat en mi pantalla de inicio?"',
  '🤝 "¿Cómo gestiono las deudas y préstamos?"',
  '🎙️ "¿Cómo habilito el permiso de micrófono?"',
  '🐷 "¿Cómo funcionan los cochinitos de ahorro?"',
  '🔒 "¿Cómo activo el PIN de seguridad?"',
  '💳 "¿Cómo registro gastos fijos o suscripciones?"',
  '📊 "¿Cómo exporto mis datos a Excel?"',
  '📈 "Resumen de gastos de este mes"'
];

const AssistantChat = ({ 
  transactions = [], 
  onAddTransaction, 
  onUpdateTransaction,
  onDeleteTransaction, 
  onEditTransaction,
  accountBalances = { cash: 0, bank: 0 },
  banks = [],
  onBack,
  onInstallClick,
  installPromptReady
}) => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('moneyflow_assistant_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: '👋 ¡Hola Diego! Soy tu Asistente Financiero con Inteligencia Artificial de MoneyFlow.\n\nPuedes dictarme tus gastos e ingresos (¡incluso pagos divididos!), consultar tus saldos o hacerme CUALQUIER pregunta sobre la aplicación (módulo de Finca Cafetera, deudas, cochinitos, presupuestos, permisos o cómo anclar este chat a tu celular).',
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const cashBalance = accountBalances?.cash || 0;
  const bankBalance = accountBalances?.bank || 0;
  const totalBalance = cashBalance + bankBalance;

  // Guardar historial en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('moneyflow_assistant_history', JSON.stringify(messages.slice(-30)));
    } catch (e) {}
  }, [messages]);

  // Scroll automático hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  // Configurar reconocimiento de voz Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-CO';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setInputText(currentText);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permiso de micrófono no otorgado en el navegador.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir el mensaje.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      setSpeechError('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Error iniciando micrófono:', err);
      }
    }
  };

  // Generar resumen mensual de transacciones
  const calculateMonthlySummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let incomeMonth = 0;
    let expenseMonth = 0;
    const catMap = {};

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          incomeMonth += amt;
        } else if (t.type === 'expense') {
          expenseMonth += amt;
          catMap[t.category] = (catMap[t.category] || 0) + amt;
        }
      }
    });

    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      incomeMonth,
      expenseMonth,
      balanceMonth: incomeMonth - expenseMonth,
      topCategories
    };
  };

  // Procesar mensaje del usuario
  const handleSendMessage = async (textToSend = inputText) => {
    const cleanText = (textToSend || '').trim();
    if (!cleanText) return;

    // Agregar mensaje del usuario al chat
    const userMsgId = 'user-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: cleanText,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const lower = cleanText.toLowerCase();

    // 0. SOLICITUDES Y ACCIONES OPERATIVAS (Reasignar cuentas, corregir movimientos, traspasos, nivelar saldo)
    const actionResult = handleAssistantActionRequest(cleanText, { transactions, accountBalances, banks });
    if (actionResult) {
      if (actionResult.action === 'reassign_account') {
        const { targetTx, newAccountId, oldAccountId, amount, description } = actionResult;
        if (onUpdateTransaction) {
          await onUpdateTransaction(targetTx.id, { accountId: newAccountId });
        }
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              type: 'action_success_card',
              title: '✅ Movimiento Reasignado con Éxito',
              message: `El gasto de **$${amount.toLocaleString('es-CO')}** (_${description}_) se reasignó para descontarse de **${newAccountId === 'bank' ? '🏛️ Bancos / Cuentas' : '💵 Efectivo'}** en lugar de ${oldAccountId === 'bank' ? 'Bancos' : 'Efectivo'}.\n\nTus saldos han sido actualizados correctamente.`,
              undoAction: async () => {
                if (onUpdateTransaction) await onUpdateTransaction(targetTx.id, { accountId: oldAccountId });
              },
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 300);
        return;
      }

      if (actionResult.action === 'transfer_balance') {
        const { fromAccount, toAccount, amount, reason } = actionResult;
        const transferTx = {
          id: Date.now().toString(),
          description: reason || `Traspaso: ${fromAccount === 'bank' ? 'Banco' : 'Efectivo'} a ${toAccount === 'bank' ? 'Banco' : 'Efectivo'}`,
          amount,
          type: 'transfer',
          category: 'transfer',
          accountId: fromAccount,
          toAccountId: toAccount,
          date: new Date().toISOString()
        };
        await onAddTransaction(transferTx);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              type: 'action_success_card',
              title: '✅ Traspaso Realizado con Éxito',
              message: `Se transfirieron **$${amount.toLocaleString('es-CO')}** desde **${fromAccount === 'bank' ? '🏛️ Bancos' : '💵 Efectivo'}** hacia **${toAccount === 'bank' ? '🏛️ Bancos' : '💵 Efectivo'}**.\n\n${reason ? `📌 _${reason}_\n\n` : ''}Tus saldos han sido nivelados correctamente.`,
              undoAction: async () => {
                if (onDeleteTransaction) await onDeleteTransaction(transferTx.id, true);
              },
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 300);
        return;
      }

      if (actionResult.action === 'delete_transaction') {
        const { targetTx, amount, description } = actionResult;
        if (onDeleteTransaction) {
          await onDeleteTransaction(targetTx.id, true);
        }
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              type: 'action_success_card',
              title: '🗑️ Movimiento Eliminado',
              message: `Se eliminó el registro de **$${amount.toLocaleString('es-CO')}** (_${description}_).\n\nTus saldos han sido restaurados.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 300);
        return;
      }
    }

    // 1. Comando Consulta de Saldo / Balance (Solo si es pregunta directa, no una acción)
    const isActionVerb = /\b(pasa|pasar|mueve|mover|cambia|cambiar|transfiere|transferir|reasigna|reasignar|elimina|borra|nivela|ajusta)\b/i.test(lower);
    const isBalanceInquiry = !isActionVerb && (
      lower.includes('cuanto tengo') || 
      lower.includes('cuánto tengo') || 
      lower.includes('cual es mi saldo') || 
      lower.includes('cuál es mi saldo') || 
      lower === 'saldo' || 
      lower === 'mi saldo' || 
      lower === 'balance' ||
      /^ver (?:mi )?saldo/i.test(lower)
    );

    if (isBalanceInquiry) {
      const summary = calculateMonthlySummary();
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            type: 'balance_card',
            data: {
              cash: cashBalance,
              bank: bankBalance,
              total: totalBalance,
              incomeMonth: summary.incomeMonth,
              expenseMonth: summary.expenseMonth,
              balanceMonth: summary.balanceMonth
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 350);
      return;
    }

    // 2. Comando Resumen Mensual
    if (lower.includes('resumen') || lower.includes('mes') || lower.includes('gastado este mes')) {
      const summary = calculateMonthlySummary();
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            type: 'summary_card',
            data: summary,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 350);
      return;
    }

    // 3. Consulta Especializada en la Base de Conocimiento de MoneyFlow (Cualquier pregunta de la App)
    const knowledgeAnswer = findKnowledgeAnswer(cleanText);
    if (knowledgeAnswer) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            type: 'knowledge_card',
            title: knowledgeAnswer.title,
            answer: knowledgeAnswer.answer,
            topicId: knowledgeAnswer.topicId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 250);
      return;
    }

    // 4. Procesamiento Financiero Inteligente con IA (Gastos, Ingresos, Traspasos, Pagos Divididos)
    const parsed = parseFinancialVoiceCommand(cleanText, { accountBalances });

    if (parsed && parsed.amount > 0) {
      try {
        const createdTxs = [];
        const defaultCat = parsed.type === 'income' ? 'other_income' : (parsed.type === 'transfer' ? 'transfer' : 'other_expense');

        if (parsed.isSplit && parsed.splitCash > 0 && parsed.splitBank > 0) {
          const tx1 = {
            id: Date.now().toString(),
            description: `${parsed.description} (Efectivo)`,
            amount: parsed.splitCash,
            type: parsed.type || 'expense',
            category: parsed.category || defaultCat,
            accountId: 'cash',
            date: new Date().toISOString()
          };
          const tx2 = {
            id: (Date.now() + 1).toString(),
            description: `${parsed.description} (Banco)`,
            amount: parsed.splitBank,
            type: parsed.type || 'expense',
            category: parsed.category || defaultCat,
            accountId: 'bank',
            date: new Date().toISOString()
          };

          await onAddTransaction(tx1);
          await onAddTransaction(tx2);
          createdTxs.push(tx1, tx2);
        } else {
          const tx = {
            id: Date.now().toString(),
            description: parsed.description,
            amount: parsed.amount,
            type: parsed.type || 'expense',
            category: parsed.category || defaultCat,
            accountId: parsed.accountId || 'cash',
            toAccountId: parsed.toAccountId,
            date: new Date().toISOString()
          };
          await onAddTransaction(tx);
          createdTxs.push(tx);
        }

        // Efecto visual de confeti si es ingreso
        if (parsed.type === 'income') {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
        }

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              type: 'transaction_card',
              parsed,
              createdTxs,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 300);

      } catch (err) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              type: 'text',
              text: `⚠️ Reconocí el monto ($${parsed.amount.toLocaleString('es-CO')}), pero ocurrió un error al guardar: ${err.message}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 300);
      }
    } else {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            type: 'knowledge_card',
            title: '🤖 Asistente Inteligente MoneyFlow',
            answer: `He analizado tu mensaje: _"${cleanText}"_.\n\n` +
                    `• **Para registrar un movimiento:** Recuerda decir el monto (ejemplo: *"Gasté 20 mil en almuerzo"* o *"Me entraron 500 mil de cosecha"*).\n` +
                    `• **Para resolver dudas:** Puedes preguntarme sobre la Finca Cafetera, deudas, cochinitos de ahorro, presupuestos, permisos de micrófono, PIN o cómo anclar este chat en tu pantalla.`,
            topicId: 'general_help',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 300);
    }
  };

  const handleUndoTransaction = async (txList) => {
    if (!txList || txList.length === 0) return;
    for (const t of txList) {
      if (t.id) await onDeleteTransaction(t.id);
    }

    setMessages(prev => [
      ...prev,
      {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        type: 'text',
        text: '↩️ **Movimiento deshecho exitosamente.** Tus saldos han sido restaurados.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      maxHeight: '100dvh',
      background: '#090d16',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. Header Superior */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ position: 'relative' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #c4fb6d, #34c759)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090d16'
            }}>
              <Bot size={24} strokeWidth={2.4} />
            </div>
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#34c759',
              border: '2px solid #090d16'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>MoneyFlow IA</h2>
              <Sparkles size={14} color="#c4fb6d" />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Asistente de Voz y Finanzas • En línea
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Botón de acceso directo en pantalla */}
          <button
            onClick={() => {
              if (installPromptReady && onInstallClick) {
                onInstallClick();
              }
              setShowInstallGuide(true);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(196, 251, 109, 0.12)',
              border: '1px solid rgba(196, 251, 109, 0.35)',
              color: '#c4fb6d',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Dejar Chat en la Pantalla de Inicio"
          >
            <Smartphone size={14} />
            <span>📲 Dejar en Pantalla</span>
          </button>
        </div>
      </header>

      {/* Banner Destacado: Dejar directamente el chat en la pantalla de inicio */}
      <div style={{
        margin: '10px 14px 4px 14px',
        padding: '10px 14px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.18), rgba(196, 251, 109, 0.1))',
        border: '1px solid rgba(52, 199, 89, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        zIndex: 15,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(52, 199, 89, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c4fb6d',
            flexShrink: 0
          }}>
            <Smartphone size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#c4fb6d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ¿Abrir Chat en 1 toque desde tu celular?
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Fíjalo como acceso directo en tu pantalla de inicio
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (installPromptReady && onInstallClick) {
              onInstallClick();
            }
            setShowInstallGuide(true);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            background: '#34c759',
            color: '#090d16',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.76rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(52,199,89,0.3)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Smartphone size={14} />
          Dejar en Pantalla
        </button>
      </div>

      {/* Modal Guía Completa para agregar a pantalla de inicio */}
      {showInstallGuide && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#131b2e',
            border: '1px solid rgba(196, 251, 109, 0.35)',
            borderRadius: '22px',
            padding: '24px',
            maxWidth: '390px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📲</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#c4fb6d', fontWeight: 900 }}>
              Dejar Chat en Pantalla de Inicio
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Abre directamente este Asistente con 1 solo toque desde tu celular sin abrir menús:
            </p>

            {/* Opción 1: Botón nativo si está disponible */}
            {installPromptReady && (
              <button
                onClick={() => {
                  if (onInstallClick) onInstallClick();
                  setShowInstallGuide(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #34c759, #c4fb6d)',
                  color: '#090d16',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 15px rgba(52,199,89,0.3)'
                }}
              >
                <Smartphone size={18} />
                Instalar Ahora Automáticamente
              </button>
            )}

            {/* Pasos para Android */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              padding: '12px 14px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <strong style={{ color: '#34c759', display: 'block', marginBottom: '4px' }}>
                🤖 En Android (Google Chrome):
              </strong>
              1. Toca los <b>3 puntos (⋮)</b> arriba a la derecha en Chrome.<br/>
              2. Toca <b>"Agregar a la pantalla principal"</b> o <b>"Instalar aplicación"</b>.<br/>
              3. ¡Listo! Te quedará un ícono directo en tu pantalla.<br/>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                💡 Tip: Mantén presionado el ícono en tu pantalla para abrir directo el <b>"Chat Asistente IA"</b>.
              </span>
            </div>

            {/* Pasos para iPhone */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              padding: '12px 14px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
                🍏 En iPhone (Safari):
              </strong>
              1. Toca el botón <b>Compartir</b> (el cuadrado con flecha hacia arriba ⎋ abajo).<br/>
              2. Baja y selecciona <b>"Agregar al inicio"</b> (+).<br/>
              3. Toca <b>"Agregar"</b> arriba a la derecha.
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              ¡Cerrar Guía!
            </button>
          </div>
        </div>
      )}

      {/* 2. Área Central de Conversación */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* Burbuja Texto Usuario */}
            {msg.sender === 'user' && (
              <div style={{
                maxWidth: '82%',
                padding: '12px 16px',
                borderRadius: '18px 18px 4px 18px',
                background: 'linear-gradient(135deg, rgba(196,251,109,0.22), rgba(52,199,89,0.18))',
                border: '1px solid rgba(196,251,109,0.3)',
                color: '#fff',
                fontSize: '0.92rem',
                lineHeight: 1.45,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {msg.text}
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textAlign: 'right' }}>
                  {msg.timestamp}
                </div>
              </div>
            )}

            {/* Mensajes del Asistente Bot */}
            {msg.sender === 'bot' && (
              <div style={{ maxWidth: '88%', width: msg.type !== 'text' ? '100%' : 'auto' }}>
                
                {/* 1. Texto estándar */}
                {msg.type === 'text' && (
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: '#131b2e',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                  }}>
                    {msg.text}
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                      {msg.timestamp}
                    </div>
                  </div>
                )}

                {/* 2. Tarjeta Comprobante de Transacción */}
                {msg.type === 'transaction_card' && (
                  <div style={{
                    background: '#131b2e',
                    border: `1px solid ${msg.parsed.type === 'income' ? 'rgba(52,199,89,0.4)' : 'rgba(255,69,58,0.4)'}`,
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: msg.parsed.type === 'income' ? '#34c759' : '#ff453a',
                        textTransform: 'uppercase'
                      }}>
                        {msg.parsed.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {msg.parsed.type === 'income' ? 'Ingreso Registrado' : 'Gasto Registrado'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{msg.timestamp}</span>
                    </div>

                    <div style={{
                      fontSize: '1.6rem',
                      fontWeight: 900,
                      color: msg.parsed.type === 'income' ? '#34c759' : '#fff',
                      margin: '4px 0 10px 0'
                    }}>
                      {msg.parsed.type === 'income' ? '+' : '-'} ${msg.parsed.amount.toLocaleString('es-CO')}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginLeft: '6px' }}>COP</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Concepto:</span>
                        <span style={{ fontWeight: 600 }}>{msg.parsed.description}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Categoría:</span>
                        <span style={{ fontWeight: 600, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                          {msg.parsed.category || 'General'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Medio de Pago:</span>
                        <span style={{ fontWeight: 600, color: '#c4fb6d' }}>
                          {msg.parsed.isSplit
                            ? `Dividido (Efectivo: $${msg.parsed.splitCash.toLocaleString('es-CO')} / Banco: $${msg.parsed.splitBank.toLocaleString('es-CO')})`
                            : (msg.parsed.accountId === 'cash' ? '💵 Efectivo' : '🏦 ' + (msg.parsed.accountId || 'Banco'))
                          }
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => handleUndoTransaction(msg.createdTxs)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          background: 'rgba(255,69,58,0.12)',
                          border: '1px solid rgba(255,69,58,0.3)',
                          color: '#ff453a',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                        Deshacer
                      </button>

                      <button
                        onClick={() => {
                          if (msg.createdTxs?.[0] && onEditTransaction) {
                            onEditTransaction(msg.createdTxs[0]);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#e2e8f0',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={13} />
                        Editar
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Tarjeta Saldo / Balance */}
                {msg.type === 'balance_card' && (
                  <div style={{
                    background: '#131b2e',
                    border: '1px solid rgba(196,251,109,0.3)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Wallet size={16} color="#c4fb6d" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c4fb6d' }}>Tu Saldo Actual</span>
                    </div>

                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
                      ${msg.data.total.toLocaleString('es-CO')}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>COP Total</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>💵 Efectivo</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '2px', color: msg.data.cash < 0 ? '#ff453a' : '#fff' }}>
                          ${msg.data.cash.toLocaleString('es-CO')}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>🏦 Bancos / Cuentas</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '2px' }}>
                          ${msg.data.bank.toLocaleString('es-CO')}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                      📅 Este mes: <span style={{ color: '#34c759', fontWeight: 700 }}>+${msg.data.incomeMonth.toLocaleString('es-CO')}</span> en ingresos y <span style={{ color: '#ff453a', fontWeight: 700 }}>-${msg.data.expenseMonth.toLocaleString('es-CO')}</span> en gastos.
                    </div>
                  </div>
                )}

                {/* 4. Tarjeta Resumen Mensual */}
                {msg.type === 'summary_card' && (
                  <div style={{
                    background: '#131b2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <BarChart3 size={16} color="#60a5fa" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa' }}>Resumen del Mes</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94a3b8' }}>Ingresos totales:</span>
                      <span style={{ fontWeight: 800, color: '#34c759' }}>+${msg.data.incomeMonth.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94a3b8' }}>Gastos totales:</span>
                      <span style={{ fontWeight: 800, color: '#ff453a' }}>-${msg.data.expenseMonth.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.88rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>Balance neto:</span>
                      <span style={{ fontWeight: 900, color: msg.data.balanceMonth >= 0 ? '#34c759' : '#ff453a' }}>
                        ${msg.data.balanceMonth.toLocaleString('es-CO')}
                      </span>
                    </div>

                    {msg.data.topCategories.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>
                          Mayores Gastos:
                        </div>
                        {msg.data.topCategories.map(([cat, val], idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1' }}>• {cat}</span>
                            <span style={{ fontWeight: 700 }}>${val.toLocaleString('es-CO')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Tarjeta de Respuesta Especializada / Base de Conocimiento */}
                {msg.type === 'knowledge_card' && (
                  <div style={{
                    background: 'linear-gradient(145deg, #131b2e, #0e1626)',
                    border: '1px solid rgba(196, 251, 109, 0.3)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    color: '#e2e8f0',
                    lineHeight: 1.55
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c4fb6d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} />
                        {msg.title || 'Respuesta Especializada'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{msg.timestamp}</span>
                    </div>

                    <div style={{ fontSize: '0.86rem', whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
                      {msg.answer}
                    </div>

                    {/* Botón rápido interactivo para atajo en pantalla de inicio */}
                    {(msg.topicId === 'install_shortcut' || (msg.answer && msg.answer.includes('Pantalla de Inicio'))) && (
                      <button
                        onClick={() => {
                          if (installPromptReady && onInstallClick) {
                            onInstallClick();
                          }
                          setShowInstallGuide(true);
                        }}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '10px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #c4fb6d, #34c759)',
                          color: '#090d16',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Smartphone size={16} />
                        📲 Dejar Chat en Pantalla de Inicio
                      </button>
                    )}
                  </div>
                )}

                {/* 6. Tarjeta de Éxito en Solicitud / Acción Operativa */}
                {msg.type === 'action_success_card' && (
                  <div style={{
                    background: 'linear-gradient(145deg, #131b2e, #0e1f36)',
                    border: '1px solid rgba(52, 199, 89, 0.45)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                    color: '#e2e8f0',
                    lineHeight: 1.55
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34c759', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} />
                        {msg.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{msg.timestamp}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap', color: '#cbd5e1', marginBottom: msg.undoAction ? '12px' : '0' }}>
                      {msg.message}
                    </div>

                    {msg.undoAction && (
                      <button
                        onClick={async () => {
                          await msg.undoAction();
                          setMessages(prev => [
                            ...prev,
                            {
                              id: 'bot-' + Date.now(),
                              sender: 'bot',
                              type: 'text',
                              text: '↩️ **Acción deshecha:** Los cambios han sido revertidos y tus cuentas están como antes.',
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#e2e8f0',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RotateCcw size={13} />
                        Deshacer Acción
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Barra de Sugerencias Rápidas */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 14px',
        background: 'rgba(15,23,42,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        scrollbarWidth: 'none'
      }}>
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => {
              const query = sug.replace(/^[^\w\s¿?]+|\"|\'/g, '').trim();
              handleSendMessage(query);
            }}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* 4. Barra de Entrada Inferior con Micrófono y Texto */}
      <div style={{
        padding: '12px 14px 16px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        zIndex: 20
      }}>
        {speechError && (
          <div style={{ color: '#ff453a', fontSize: '0.75rem', marginBottom: '6px', textAlign: 'center' }}>
            {speechError}
          </div>
        )}

        {isListening && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#c4fb6d',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '8px',
            animation: 'pulse 1.5s infinite'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff453a' }} />
            <span>Escuchando tu voz... Habla ahora (ej: "Gasté 15 mil en almuerzo")</span>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          {/* Botón de Micrófono Ergonómico */}
          <button
            type="button"
            onClick={toggleListening}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: isListening 
                ? 'linear-gradient(135deg, #ff453a, #ff9f0a)' 
                : 'linear-gradient(135deg, #c4fb6d, #34c759)',
              border: 'none',
              color: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isListening 
                ? '0 0 20px rgba(255, 69, 58, 0.6)' 
                : '0 4px 14px rgba(196, 251, 109, 0.35)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={isListening ? 'Detener micrófono' : 'Hablar con el Asistente'}
          >
            {isListening ? <MicOff size={22} color="#fff" /> : <Mic size={22} />}
          </button>

          {/* Campo de Texto */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Escuchando tu voz...' : 'Escribe o dicta: ej. Gasté 20 mil...'}
              style={{
                width: '100%',
                boxBoxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: inputText.trim() 
                ? 'linear-gradient(135deg, #c4fb6d, #34c759)' 
                : 'rgba(255,255,255,0.06)',
              border: 'none',
              color: inputText.trim() ? '#090d16' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantChat;
