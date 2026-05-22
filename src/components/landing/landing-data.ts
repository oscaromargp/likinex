import { Calendar, CreditCard, Target, BarChart3, Bell, FileText, Wallet, Layers, TrendingUp, ShieldCheck, Lightbulb, Heart, MessageSquare } from 'lucide-react';

export const PRIMARY_RGB = '59, 130, 246';

export const features = [
  { icon: Calendar, title: 'Calendario Interactivo', desc: 'Visualiza todos tus pagos en un calendario inteligente con recurrencias automáticas y alertas.' },
  { icon: CreditCard, title: 'Credit Card Engine', desc: 'Controla fechas de corte, pago mínimo, MSI y costo de oportunidad de tus tarjetas.' },
  { icon: Target, title: 'Risk Tolerance', desc: 'Alertas inteligentes por criticidad: servicios críticos vs no críticos con colores automáticos.' },
  { icon: BarChart3, title: 'Cash Flow Forecast', desc: 'Proyección de liquidez a 30 días con cálculo de runway y métricas en tiempo real.' },
  { icon: Bell, title: 'Notificaciones WhatsApp', desc: 'Recordatorios automáticos vía WhatsApp con N8N para no perder ningún pago.' },
  { icon: FileText, title: 'Reportes PDF', desc: 'Estados de cuenta y reportes profesionales listos para descargar e imprimir.' },
];

export const steps = [
  { icon: Wallet, title: 'Conecta', desc: 'Agrega tus cuentas bancarias, tarjetas de crédito y contactos en un solo lugar.' },
  { icon: Layers, title: 'Organiza', desc: 'Clasifica tus ingresos y egresos con categorías inteligentes y recurrencias automáticas.' },
  { icon: TrendingUp, title: 'Visualiza', desc: 'Mira tu flujo de caja, calendario de pagos y métricas en dashboards interactivos.' },
  { icon: ShieldCheck, title: 'Controla', desc: 'Recibe alertas, genera reportes y toma decisiones financieras informadas.' },
];

export const comparisonRows = [
  { feature: 'Dashboard en tiempo real', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Calendario de pagos', likinex: true, excel: false, apps: true, papel: false },
  { feature: 'Proyección de liquidez', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Alertas automáticas', likinex: true, excel: false, apps: true, papel: false },
  { feature: 'Múltiples monedas', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Reportes PDF', likinex: true, excel: false, apps: false, papel: false },
  { feature: 'Modo offline', likinex: false, excel: true, apps: true, papel: true },
  { feature: 'Gratuito (beta)', likinex: true, excel: false, apps: false, papel: true },
];

export const testimonials = [
  { name: 'Carlos M.', role: 'Freelancer', text: 'LikinEX me salvó de un cargo por atraso. La alerta de WhatsApp llegó justo cuando se me había olvidado el pago de la luz.', rating: 5 },
  { name: 'Ana G.', role: 'Contador Público', text: 'La proyección a 30 días me permite planificar mis gastos fijos sin tener que estar en Excel todo el día.', rating: 5 },
  { name: 'Roberto L.', role: 'Pequeño Empresario', text: 'Tener ingresos, egresos y tarjetas en un solo dashboard me ahorra 3 horas a la semana de organización manual.', rating: 5 },
];

export const faqs = [
  { q: '¿Es gratis?', a: 'Sí, actualmente en versión beta gratuita. Próximamente planes premium con funciones avanzadas.' },
  { q: '¿Puedo usarlo sin registro?', a: 'Sí, el modo demo te permite explorar todas las funciones sin crear cuenta ni dar ningún dato.' },
  { q: '¿Mis datos están seguros?', a: 'Usamos Supabase con encriptación de extremo a extremo. Tus datos nunca se comparten con terceros.' },
  { q: '¿Soporta múltiples monedas?', a: 'Sí: MXN, USD, BTC, ETH, USDT y más con conversión automática en tiempo real.' },
  { q: '¿Funciona en mi celular?', a: 'Sí, está optimizado para móvil, tablet y escritorio. Puedes usarlo desde cualquier navegador.' },
  { q: '¿Puedo exportar sus datos?', a: 'Sí, puedes descargar reportes en PDF y exportar tu libro mayor en CSV.' },
];

export const techStack = [
  { name: 'Next.js 16', desc: 'React framework con App Router', icon: '▲', brandBg: '#fff', brandFg: '#000' },
  { name: 'Supabase', desc: 'PostgreSQL, Auth y almacenamiento', icon: '◬', brandBg: '#3ECF8E', brandFg: '#000' },
  { name: 'Tailwind v4', desc: 'Estilos utilitarios responsive', icon: '🌊', brandBg: '#06B6D4', brandFg: '#000' },
  { name: 'TypeScript', desc: 'Tipado estático para código robusto', icon: 'TS', brandBg: '#3178C6', brandFg: '#fff' },
  { name: 'D3.js', desc: 'Gráficas vectoriales interactivas', icon: 'd3', brandBg: '#F9A03C', brandFg: '#000' },
  { name: 'React Query', desc: 'Cache y datos en tiempo real', icon: 'RQ', brandBg: '#FF4154', brandFg: '#fff' },
  { name: 'Framer Motion', desc: 'Animaciones y transiciones', icon: 'FM', brandBg: '#0055FF', brandFg: '#fff' },
  { name: 'Lucide', desc: 'Iconos vectoriales consistentes', icon: '◇', brandBg: '#fff', brandFg: '#000' },
  { name: 'Vercel', desc: 'Hosting serverless continuo', icon: '▲', brandBg: '#fff', brandFg: '#000' },
];

export const screenshots = [
  { src: '/images/dashboard-full.png', label: 'Dashboard Principal', desc: 'Métricas en tiempo real, flujo de caja y próximos pagos' },
  { src: '/images/calendar-view.png', label: 'Calendario de Pagos', desc: 'Visualización mensual con recurrencias y alertas' },
  { src: '/images/forecast-view.png', label: 'Proyección de Liquidez', desc: 'Cash flow forecast a 30 días con gráficas D3' },
  { src: '/images/ledger-view.png', label: 'Libro Mayor', desc: 'Registro completo de ingresos y egresos' },
  { src: '/images/credit-cards-view.png', label: 'Credit Card Engine', desc: 'Control de tarjetas, MSI y costo de oportunidad' },
];

export const feedbackQuestions = [
  { q: '¿Qué función te gustaría que agregáramos?', icon: Lightbulb },
  { q: '¿Qué es lo que más te gusta de LikinEX?', icon: Heart },
  { q: '¿Hay algo que te parezca complicado?', icon: MessageSquare },
];
