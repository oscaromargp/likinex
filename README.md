# 💰 LikinEX - El Orquestador de Liquidez

![LikinEX Banner](https://via.placeholder.com/1200x400/020617/10B981?text=LikinEX+-+El+Orquestador+de+Liquidez)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-white?style=flat&logo=framer)](https://www.framer.com/motion/)

**Segundo Cerebro Financiero para Gestión de Liquidez de Alta Complejidad**

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Vista Previa](#-vista-previa)
- [Tech Stack](#-tech-stack)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración de Supabase](#-configuración-de-supabase)
- [Configuración de n8n (Automatización)](#-configuración-de-n8n-automatización)
- [Entidades y Datos](#-entidades-y-datos)
- [Ciclo de Transacción](#-ciclo-de-transacción)
- [Desarrollo](#-desarrollo)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Funcionalidades Principales

| Característica | Descripción |
|----------------|-------------|
| **Calendario Interactivo** | Visualización del flujo de dinero con recurrencias automáticas |
| **Libro Mayor** | Tabla avanzada con filtros por entidad, estado, fecha y monto |
| **Métricas en Tiempo Real** | Cálculo de Committed vs. Settled cash flow |
| **Seguridad por Entidades** | 7 cuentas segregadas con seguimiento individual |
| **Drawer de Gestión** | Seguimiento de follow-ups, pagos, adjuntos y cambios de precio |

### 🔄 Tipos de Recurrencia

- **Semanal** (ej: Todos los viernes)
- **Mensual** (ej: Día 15 de cada mes)
- **Bimestral** (ej: CFE cada 2 meses)
- **Trimestral** (ej: Gas natural cada 3 meses)
- **Trienal** (ej: Dominios web cada 3 años)

### ⚠️ Sistema de Alertas

- Transacciones pendientes con menos de 72 horas
- Anomalías detectadas (ej: CFE > $10,000 MXN)
- Recordatorios de seguimiento configurables

---

## 👁️ Vista Previa

### Dashboard Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LikinEX - El Orquestador de Liquidez                                       │
├──────────┬──────────────────────────────────────────────────────────────────┤
│          │                                                                       │
│ Dashboard │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ Calendario│  │Comprometido│ │Liquidado │ │Pendiente │ │Disponible│           │
│ Transac. │  │  $245,000 │ │  $198,500 │ │ $46,500  │ │ $198,500 │           │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│          │                                                                       │
│ Config.  │  ┌─────────────────────────────┐ ┌──────────────────────────┐    │
│          │  │       CALENDARIO            │ │  TRANSACCIONES RECIENTES │    │
│          │  │  ┌────────────────────┐   │ │  CFE Electricidad      $2,450   │
│          │  │  │ Lu Ma Mi Ju Vi Sa Do│   │ │  Telmex Internet       $899    │
│          │  │  │       ●  ●  ●        │   │ │  Gas Natural          $1,200   │
│          │  │  └────────────────────┘   │ │  Dominios Web          $450    │
│          │  └─────────────────────────────┘ └──────────────────────────┘    │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Landing Page

Visítala en: `/landing/index.html`

---

## 🛠️ Tech Stack

| Tecnología | Propósito |
|------------|-----------|
| **Next.js 16** | Framework React con App Router |
| **TypeScript** | Tipado estático seguro |
| **Tailwind CSS 4** | Estilizado con utility classes |
| **Framer Motion** | Animaciones fluidas |
| **Supabase** | Backend-as-a-Service (Auth + DB + Storage) |
| **Lucide React** | Iconos profesionales |
| **date-fns** | Manipulación de fechas |

---

## 📁 Estructura del Proyecto

```
LikinEX/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal de la app
│   │   ├── layout.tsx        # Layout raíz con fuentes
│   │   └── globals.css      # Estilos globales
│   ├── components/
│   │   ├── Calendar.tsx      # Calendario interactivo
│   │   ├── Ledger.tsx        # Tabla de transacciones
│   │   ├── SideDrawer.tsx    # Panel lateral de gestión
│   │   └── MetricsCards.tsx  # Tarjetas de métricas
│   ├── lib/
│   │   ├── supabase.ts       # Cliente de Supabase
│   │   ├── mockData.ts       # Datos de ejemplo
│   │   └── utils.ts          # Utilidades
│   ├── types/
│   │   └── index.ts          # Definiciones de tipos
│   └── hooks/                # Hooks personalizados (futuro)
├── landing/
│   └── index.html           # Landing page standalone
├── public/                  # Archivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/likinex.git
cd likinex
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

5. **Abrir en navegador**

- App: http://localhost:3000
- Landing: http://localhost:3000/landing

---

## 🔥 Configuración de Supabase

### Tablas Necesarias

```sql
-- Transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID,
  entity TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  recurrence TEXT DEFAULT 'none',
  recurrence_day INT,
  payment_method TEXT,
  notes TEXT,
  follow_up TIMESTAMP,
  attachment_url TEXT,
  price_change DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plantillas
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  recurrence TEXT DEFAULT 'none',
  recurrence_day INT,
  payment_method TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adjuntos
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bucket de Almacenamiento

Crea un bucket llamado `receipts` en Supabase Storage para guardar los PDFs de comprobantes.

### Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios autenticados
CREATE POLICY "Usuarios pueden ver sus transacciones"
ON transactions FOR SELECT
TO authenticated
USING (true);

-- Política de inserción
CREATE POLICY "Usuarios pueden insertar transacciones"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## 🤖 Configuración de n8n (Automatización)

### Objetivo

Automatizar la ingestión de facturas CFE/Telmex directamente desde el email.

### Flujo de n8n

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   IMAP     │───▶│  OpenAI     │───▶│   HTTP      │───▶│  Supabase   │
│ (Email)    │    │ (Extract)   │    │  (Webhook)  │    │   (Push)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Nodos

1. **IMAP Email** - Configura tu email para recibir facturas
2. **OpenAI** - Extrae datos: monto, fecha, entidad, descripción
3. **HTTP Request** - Envía a webhook de la app o directamente a Supabase

### Ejemplo de webhook

```
POST https://tu-app.vercel.app/api/webhooks/n8n
Content-Type: application/json

{
  "entity": "oscaromargp",
  "description": "CFE Electricidad",
  "amount": 2450.00,
  "due_date": "2024-06-15",
  "recurrence": "bimonthly",
  "source": "n8n-auto"
}
```

---

## 🏦 Entidades y Datos

| Entidad | Descripción | Color |
|---------|-------------|-------|
| `oscaromargp` | Cuenta principal Oscaromar GP | Emerald |
| `centenario` | Cuenta Centenario | Indigo |
| `tulum` | Cuenta Tulum | Pink |
| `paypaps` | PayPal/PayPals | Blue |
| `bnrecords` | BN Records | Amber |
| `pardesantos` | Pardesantos | Cyan |
| `zxyw` | XYZW Genérica | Violet |

---

## 🔄 Ciclo de Transacción

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Template    │────▶│   Instance   │────▶│  Settlement  │
│  (Plantilla) │     │  (Instancia) │     │  (Liquidado)│
└──────────────┘     └──────────────┘     └──────────────┘
      │                    │                      │
      ▼                    ▼                      ▼
  Crear plantilla    Pago programado o        Confirmar y cerrar
                     automático
```

### Estados

- **pending** - Pendiente de pago
- **settled** - Liquidado/completado
- **cancelled** - Cancelado

---

## 🧑‍💻 Desarrollo

### Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

---

## 🗺️ Roadmap

### Fase 1 (Actual)
- ✅ Dashboard con métricas
- ✅ Calendario interactivo
- ✅ Libro mayor con filtros
- ✅ SideDrawer para gestión

### Fase 2
- [ ] Autenticación de usuarios
- [ ] Sincronización con Supabase
- [ ] Subir archivos/PDFs

### Fase 3
- [ ] Integración n8n para automatización
- [ ] Notificaciones push
- [ ] Reportes avanzados

### Fase 4
- [ ] App móvil (React Native/Expo)
- [ ] Integración con bancos
- [ ] IA para predicción de flujo

---

## 📜 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

> *"Porque Dios es el que en vosotros produce así el querer como el hacer, por su buena voluntad."*
> — Filipenses 2:13

Todo lo que aquí existe nació primero como un deseo en el corazón. Cada proyecto, cada línea, cada idea que toma forma — es un regalo de Aquel que nos dio tanto el sueño como la fuerza de alcanzarlo.

**A Dios, toda la gloria.**

---

<div align="center">

**Construido con ❤️ usando Next.js, TypeScript y Tailwind CSS**

[Ver en GitHub](https://github.com/oscaromargp/likinex)

</div>