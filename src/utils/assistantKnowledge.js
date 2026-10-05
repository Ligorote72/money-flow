/**
 * MoneyFlow AI Assistant - Base de Conocimiento Especializada
 * Responde preguntas detalladas sobre cualquier aspecto de la aplicación,
 * permisos, módulos, atajos, seguridad y buenas prácticas financieras.
 */

export const KNOWLEDGE_TOPICS = [
  // 1. Permisos y Micrófono
  {
    id: 'permissions_mic',
    keywords: ['microfono', 'micrófono', 'permiso', 'permisos', 'no me escucha', 'no funciona la voz', 'audio', 'grabar', 'bloqueado el microfono', 'habilitar microfono'],
    title: '🎙️ Permisos de Micrófono y Voz',
    answer: `🎙️ **Cómo habilitar el Micrófono en MoneyFlow:**

1. **En Android (Google Chrome):**
   • Toca el ícono del **candado o controles de página** (a la izquierda de la URL en la barra superior).
   • Selecciona **"Permisos"** o **"Configuración del sitio"**.
   • Busca **"Micrófono"** y cámbialo a **"Permitir"**.
   • Recarga la página y vuelve a presionar el botón del micrófono en el chat.

2. **En iPhone (Safari):**
   • Ve a **Ajustes de tu iPhone** > **Safari** > **Micrófono** > Selecciona **"Permitir"** o **"Preguntar"**.
   • Cuando la app te pregunte *"¿Permitir que use el micrófono?"*, presiona **Permitir**.

3. **Consejo para dictar:**
   • Habla con voz clara a unos 15-20 cm de tu celular. El reconocimiento está optimizado para español colombiano (\`es-CO\`).`
  },

  // 2. Instalar en pantalla de inicio / PWA / Atajo
  {
    id: 'install_shortcut',
    keywords: ['instalar', 'pantalla de inicio', 'atajo', 'descargar', 'icono', 'celular', 'app', 'play store', 'como la instalo', 'dejar en el celular', 'dejar en pantalla'],
    title: '📲 Cómo dejar MoneyFlow y el Chat en tu Pantalla de Inicio',
    answer: `📲 **Instalar como App en tu Pantalla de Inicio (Sin Play Store ni descargas pesadas):**

MoneyFlow es una **PWA (Progressive Web App)** de última generación que se instala directo desde el navegador:

1. **En Android (Chrome):**
   • Toca el botón verde **"📲 Dejar Chat en Pantalla"** arriba en este chat, O:
   • Toca los **3 puntos (⋮)** en la esquina superior derecha de Chrome.
   • Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
   • ¡Listo! Quedará como un ícono de app nativa con acceso directo.

2. **Atajo rápido para entrar directo al Chat:**
   • Si mantienes presionado el ícono de MoneyFlow en tu pantalla, te saldrá el acceso directo **"Chat Asistente IA"**.

3. **En iPhone (Safari):**
   • Toca el botón **Compartir** (el ícono del cuadrado con flecha hacia arriba ⎋ abajo en Safari).
   • Baja y selecciona **"Agregar al inicio"** (ícono con signo +).
   • Toca **"Agregar"** en la esquina superior derecha.`
  },

  // 3. Finca Cafetera / Negocio
  {
    id: 'finca_negocio',
    keywords: ['finca', 'cafe', 'café', 'cosecha', 'recolector', 'recolectores', 'jornal', 'jornales', 'kilos', 'bascula', 'báscula', 'negocio', 'anticipo', 'adelanto', 'nomina', 'nómina'],
    title: '☕ Módulo de Mi Finca / Negocio Cafetero',
    answer: `☕ **Módulo de Finca Cafetera y Negocios:**

Este módulo está especialmente diseñado para productores y emprendedores:

• **⚖️ Báscula de Café:** Registra las pesadas de café cereza o pergamino por recolector o lote. Calcula automáticamente los kilos netos y el valor total según el precio por kilo acordado.
• **👨‍🌾 Jornales y Recolectores:** Lleva la cuenta exacta de días trabajados, jornales pendientes por pagar y adelantos/anticipos entregados a cada trabajador.
• **💰 Liquidación Rápida:** Con 1 solo toque puedes liquidar y pagar jornales o kilos recogidos, descontando automáticamente anticipos.
• **📊 Resumen de Cosecha:** Monitorea el costo total de recolección frente al ingreso recibido por la venta del grano.

📍 *¿Dónde encontrarlo?* Ve a la pestaña **Más** > selecciona **"Mi Finca / Negocio"** (o presiona el botón **Finca @** en el Inicio).`
  },

  // 4. Deudas y Préstamos
  {
    id: 'debts',
    keywords: ['deuda', 'deudas', 'prestamo', 'préstamo', 'me deben', 'debo', 'preste', 'presté', 'cobrar', 'pagar deuda', 'abono'],
    title: '🤝 Control de Deudas y Préstamos',
    answer: `🤝 **Control de Deudas y Préstamos:**

En MoneyFlow puedes gestionar dos tipos de deudas:
1. **Lo que debes (Pasivos):** Dinero que le pediste a un banco, amigo o familiar.
2. **Lo que te deben (Activos por cobrar):** Préstamos que hiciste a otras personas.

• **Abonos y Pagos Parciales:** No necesitas liquidar la deuda completa; puedes registrar abonos (por ejemplo: *"Abonar $50.000 a la deuda con Juan"*) y el saldo restante se recalcula automáticamente.
• **Estado:** Te indica claramente si la deuda está activa, vencida o saldada con su fecha límite.

📍 *¿Dónde encontrarlo?* En el menú **Más** > **"Deudas & Préstamos"**.`
  },

  // 5. Cochinitos de Ahorro / Alcancías
  {
    id: 'piggy_bank',
    keywords: ['cochinito', 'cochinitos', 'ahorro', 'ahorros', 'alcancia', 'alcancía', 'meta de ahorro', 'guardar plata', 'fondo'],
    title: '🐷 Cochinitos de Ahorro y Metas',
    answer: `🐷 **Cochinitos de Ahorro:**

Los cochinitos te permiten apartar dinero virtualmente para proyectos específicos (un viaje, una moto, fondo de emergencia, etc.):

• **Crear un cochinito:** Asígnale un nombre, ícono y monto meta.
• **Meter plata (Fondear):** Transfiere saldo desde tu Efectivo o Banco hacia el cochinito. El dinero queda reservado para esa meta y no te lo gastas por error.
• **Retirar:** Si necesitas usar el ahorro, puedes devolver los fondos a tu cuenta principal en cualquier momento.
• **Barra de Progreso:** Te muestra el porcentaje completado y cuánto te falta para lograr tu meta.

📍 *¿Dónde encontrarlo?* Menú **Más** > **"Cochinitos de Ahorro"**.`
  },

  // 6. Gastos Fijos / Suscripciones
  {
    id: 'subscriptions',
    keywords: ['suscripcion', 'suscripciones', 'gasto fijo', 'gastos fijos', 'arriendo', 'servicios', 'luz', 'agua', 'internet', 'netflix', 'spotify', 'cuota'],
    title: '💳 Gastos Fijos y Suscripciones',
    answer: `💳 **Gestión de Gastos Fijos y Servicios:**

Ideal para no olvidar vencimientos de pagos periódicos:

• Registra arriendos, recibos públicos (agua, luz, gas, internet) y plataformas (Netflix, Spotify, gimnasio).
• **Alertas de Vencimiento:** La app te avisa en la pantalla de inicio cuántos días faltan para el próximo cobro (*"¡Hoy!"*, *"Mañana"*, *"En 3 días"*).
• **Pago en 1 Toque:** Al pagarlo, se registra el gasto en tus movimientos y se programa automáticamente para el próximo mes.

📍 *¿Dónde encontrarlo?* Menú **Más** > **"Gastos Fijos"**.`
  },

  // 7. Presupuestos y Límites Mensuales
  {
    id: 'goals_budget',
    keywords: ['presupuesto', 'presupuestos', 'limite', 'límites', 'meta', 'metas', 'cuanto puedo gastar', 'tope'],
    title: '🎯 Presupuestos y Límites de Gasto',
    answer: `🎯 **Presupuestos Mensuales:**

Te ayuda a no gastar de más en categorías específicas:

• Define límites mensuales (ejemplo: máximo $400.000 en Salidas/Comidas o $200.000 en Transporte).
• A medida que registras gastos, una barra dinámica de color te muestra:
  - 🟢 **Verde:** Gasto bajo control.
  - 🟡 **Amarillo:** Más del 75% consumido.
  - 🔴 **Rojo:** ¡Límite superado!

📍 *¿Dónde encontrarlo?* Menú **Más** > **"Presupuestos"**.`
  },

  // 8. Cuentas y Bancos (Nequi, Bancolombia, Efectivo)
  {
    id: 'accounts_banks',
    keywords: ['cuenta', 'cuentas', 'banco', 'bancos', 'nequi', 'bancolombia', 'daviplata', 'efectivo', 'traspaso', 'transferir', 'mover plata'],
    title: '🏛️ Cuentas, Bancos y Traspasos',
    answer: `🏛️ **Manejo de Cuentas y Bancos:**

MoneyFlow divide tus finanzas en 3 bolsillos principales:
1. **💵 Efectivo:** Plata en mano o billetera.
2. **🏛️ Bancos / Billeteras:** Nequi, Bancolombia, Daviplata, etc. Puedes crear múltiples bancos personalizados con su saldo individual.
3. **🐷 Ahorros:** Fondos reservados en tus cochinitos.

• **Traspasos:** Si sacas plata del cajero o recargas Nequi, usa la opción **"Traspaso"** en el Inicio. Esto transfiere el dinero entre cuentas sin contar como un gasto ni alterar tu patrimonio neto total.`
  },

  // 9. Seguridad, PIN y Biometría
  {
    id: 'security_pin',
    keywords: ['pin', 'seguridad', 'bloqueo', 'clave', 'contraseña', 'huella', 'biometria', 'biometría', 'proteger', 'privacidad'],
    title: '🔒 Seguridad, Bloqueo con PIN y Huella',
    answer: `🔒 **Seguridad y Privacidad en MoneyFlow:**

• **Código PIN de 4 Dígitos:** Puedes activar un candado de seguridad en **Más** > **"Ajustes & Seguridad"**. Cada vez que abras la app te pedirá el PIN.
• **Cifrado Seguro:** El PIN se guarda con hash criptográfico SHA-256 en tu dispositivo, garantizando que nadie pueda interceptarlo.
• **Ocultar Saldos (Modo Privacidad 👁️):** En la esquina superior derecha del Inicio, toca el ícono del ojo para tapar tus cifras monetarias con asteriscos (***) si estás en transporte público o lugares con gente alrededor.`
  },

  // 10. Sincronización en la Nube vs Modo Local
  {
    id: 'cloud_sync',
    keywords: ['nube', 'cloud', 'supabase', 'sincronizacion', 'sincronización', 'guardar', 'copia de seguridad', 'backup', 'se borra', 'cambiar de celular', 'inicio de sesion', 'login'],
    title: '☁️ Sincronización en la Nube y Respaldo',
    answer: `☁️ **Sincronización Cloud con Supabase:**

• **Seguro y en Vivo:** Cuando inicias sesión con tu cuenta, todos tus registros, bancos y metas se sincronizan en los servidores seguros de Supabase Cloud.
• **Múltiples Dispositivos:** Puedes abrir MoneyFlow en tu computador, celular Android o iPhone y verás exactamente los mismos saldos al instante.
• **Modo Sin Conexión (Offline):** Si te quedas sin señal en el campo o en la finca, la app guarda tus movimientos localmente y los sube en cuanto recuperes internet.`
  },

  // 11. Exportar a Excel / CSV
  {
    id: 'export_csv',
    keywords: ['exportar', 'excel', 'csv', 'descargar', 'informe', 'reporte', 'hoja de calculo'],
    title: '📊 Exportación a Excel / CSV',
    answer: `📊 **Cómo exportar tus datos a Excel:**

1. En la pantalla de **Inicio**, mira la barra superior donde está tu saludo.
2. Toca el botón de descarga **⬇️ (Exportar CSV)**.
3. Se generará y descargará automáticamente un archivo \`.csv\` con todas tus transacciones ordenadas por fecha, tipo, categoría, cuenta y monto.
4. Puedes abrirlo directamente en Microsoft Excel, Google Sheets o enviarlo a tu contador.`
  },

  // 12. Cómo dictar con voz / Comandos Inteligentes
  {
    id: 'voice_commands',
    keywords: ['como dictar', 'comandos', 'como hablo', 'ejemplos de voz', 'que le digo', 'como registrar por voz', 'pagos divididos', 'mitad y mitad'],
    title: '🎙️ Ejemplos de Comandos y Dictado por Voz',
    answer: `🎙️ **Ejemplos de cómo hablarle al Asistente:**

La IA entiende jerga colombiana y montos hablados:

• **Gastos simples:**
  *"Gasté 25 mil en almuerzo"*
  *"Pagué 15 lucas de taxi en efectivo"*
  *"Compré 80.000 de gasolina con Nequi"*

• **Ingresos:**
  *"Me pagaron 1 millón de sueldo en Bancolombia"*
  *"Me entraron 450 mil de venta de café"*

• **Pagos divididos (¡Súper útil!):**
  *"Compré 60 mil de mercado, mitad efectivo y mitad Nequi"*
  *(Crea dos registros automáticamente sin que tengas que calcular nada).*

• **Consultas:**
  *"¿Cuánto tengo de saldo?"*
  *"¿Cuánto tengo en bancos y efectivo?"*
  *"Resumen de gastos de este mes"*`
  },

  // 13. Saludos y Presentación
  {
    id: 'greetings',
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'quien eres', 'que eres', 'para que sirves', 'que haces'],
    title: '🤖 Soy MoneyFlow IA, tu Asistente Financiero',
    answer: `👋 **¡Hola! Soy tu Asistente Financiero con Inteligencia Artificial de MoneyFlow.**

Estoy aquí para hacerte la vida fácil:
1. **Registro al instante:** Puedes dictarme por voz o escribirme cualquier gasto, ingreso o pago dividido y lo guardo en tu cuenta en un segundo.
2. **Consultas rápidas:** Pregúntame tus saldos, cuánto te queda en bancos o el resumen de tu mes.
3. **Soporte total:** Conozco cada rincón de la app (Finca cafetera, deudas, cochinitos, presupuestos, permisos, seguridad y Excel).

¿Qué movimiento deseas registrar o qué duda tienes hoy?`
  },

  // 14. Tips de Ahorro y Finanzas
  {
    id: 'savings_tips',
    keywords: ['consejo', 'consejos', 'tip', 'tips', 'como ahorrar', 'ahorrar mas', 'mejorar finanzas', 'reducir gastos', 'gasto hormiga'],
    title: '💡 Consejos Financieros de MoneyFlow',
    answer: `💡 **5 Consejos Clave para tus Finanzas:**

1. **Ataca los 'Gastos Hormiga':** El café diario en la calle, empanadas o suscripciones que no usas suman más de $150.000 al mes. ¡Regístralos todos aquí para hacerlos visibles!
2. **Regla 50 / 30 / 20:**
   • 50% para Necesidades básicas (arriendo, comida, servicios).
   • 30% para Gustos y salidas.
   • 20% para Ahorro en tus **Cochinitos** o pago de deudas.
3. **Aparta el ahorro primero:** No ahorres lo que te sobre después de gastar; apenas recibas tu sueldo o venta de cosecha, aparta tu meta en un Cochinito.
4. **Evita deudas de consumo:** Si vas a comprar algo a crédito, asegúrate de que no supere tus ingresos mensuales proyectados.`
  }
];

/**
 * Encuentra la mejor respuesta de la base de conocimiento para una consulta dada.
 * @param {string} userQuery
 * @returns {object|null} { title, answer, topicId } o null si es transacción
 */
export function findKnowledgeAnswer(userQuery = '') {
  const clean = userQuery.toLowerCase().trim();
  if (!clean) return null;

  let bestTopic = null;
  let highestScore = 0;

  for (const topic of KNOWLEDGE_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (clean.includes(kw)) {
        // Puntuación según longitud de la coincidencia para favorecer frases exactas
        score += kw.length > 5 ? 3 : 1.5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }

  // Si tiene suficiente coincidencia
  if (bestTopic && highestScore >= 1.5) {
    return {
      topicId: bestTopic.id,
      title: bestTopic.title,
      answer: bestTopic.answer
    };
  }

  // Detección de preguntas generales sobre la app (ej: "¿cómo funciona?", "¿qué puedo hacer?")
  const isQuestion = clean.startsWith('como') || 
                     clean.startsWith('cómo') || 
                     clean.startsWith('que') || 
                     clean.startsWith('qué') || 
                     clean.startsWith('donde') || 
                     clean.startsWith('dónde') || 
                     clean.startsWith('para que') || 
                     clean.startsWith('por que') || 
                     clean.endsWith('?');

  if (isQuestion && !/\d/.test(clean)) {
    // Es una pregunta sin números de dinero: dar respuesta de ayuda integral
    return {
      topicId: 'general_help',
      title: '💡 Guía Completa de MoneyFlow',
      answer: `🤖 **MoneyFlow cuenta con todas estas herramientas:**\n\n` +
        `• 🎙️ **Voz y Chat IA:** Puedes dictar gastos, ingresos y pagos divididos en segundos.\n` +
        `• ☕ **Mi Finca / Negocio:** Báscula de café, jornales de recolectores y liquidación.\n` +
        `• 🤝 **Deudas & Préstamos:** Control de lo que debes y te deben con abonos parciales.\n` +
        `• 🐷 **Cochinitos de Ahorro:** Metas con barras de progreso.\n` +
        `• 💳 **Gastos Fijos:** Recordatorios de servicios y arriendos.\n` +
        `• 🎯 **Presupuestos:** Límites de gastos por categoría.\n` +
        `• 🔒 **PIN y Seguridad:** Candado con clave de 4 dígitos y modo ocultar saldos.\n` +
        `• 📊 **Exportar CSV:** Descarga todo a Excel con un clic.\n\n` +
        `*¿Sobre cuál de estos temas deseas que te explique más a fondo?*`
    };
  }

  return null;
}
