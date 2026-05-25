@AGENTS.md

## Progress Log

### 2026-05-25 - Fix Transaction Saving + Sección Cuenta

**Fix: Transacciones no se podían guardar**
- Causa raíz: `mapTransactionToDB` enviaba columnas no existentes en DB (`source_entity`, `destination_entity`, `payment_destination`, `deadline_date`, `late_justification`, `operation_type`, `recurrence_days_of_month`, `recurrence_end_date`, `recurrence_count`)
- Fix: fallback `buildLegacyPayload` mejorado — sólo envía columnas garantizadas (migrations 001+002)
- Fix: captura errores de enum además de "column does not exist"
- DB: Migración `003_add_missing_columns.sql` agrega las 9 columnas faltantes

**Nueva Feature: Sección "Cuenta"**
- Nueva vista `cuenta` en el sidebar (reemplaza TDC Manager del dashboard)
- Nuevo componente `AccountManager.tsx`:
  - Lista visual de tarjetas de crédito (tipo tarjeta bancaria con gradiente)
  - CRUD completo conectado a Supabase
  - Countdown días hasta corte y límite de pago con colores urgencia (rojo/ámbar/verde)
  - Modal registro de pago: monto, fecha, tipo (mínimo/parcial/total)
  - Comprobante: upload de imagen/PDF (base64) o URL externa
  - Historial de pagos por tarjeta con visor de comprobante
- Nuevo hook `useCardPayments.ts` para CRUD de tabla `card_payments`
- Extensión de `CreditCardDB` con campos: `brand`, `credit_limit`, `cut_off_day`, `payment_due_day`, `bank_name`, `color`, `is_active`

**Archivos Modificados:**
- `supabase/migrations/003_add_missing_columns.sql` (nuevo)
- `src/components/AccountManager.tsx` (nuevo)
- `src/hooks/useCardPayments.ts` (nuevo)
- `src/hooks/useCreditCards.ts` — extendido CreditCardDB
- `src/components/dashboard/DashboardSidebar.tsx` — agregado 'cuenta'
- `src/app/app/page.tsx` — fix fallback + vista cuenta + elimina CreditCardManager

**⚠️ Acción requerida por el usuario:**
Ejecutar migración 003 en Supabase Dashboard > SQL Editor:
Ver archivo: `supabase/migrations/003_add_missing_columns.sql`

**Deployment:** https://likinex.vercel.app

---

### 2026-05-20 - Recurrence Modal (Google Calendar style)

**New Feature: Edit Recurring Transactions**
- Created `RecurrenceModal.tsx` component
- When editing date of a recurring transaction, shows modal with options:
  - **"Solo esta transacción"** - only updates the selected occurrence
  - **"Todas las futuras"** - updates the selected + all future occurrences
  - **"Cancelar"** - keeps original date
- Counts future occurrences via `template_id` matching
- Calculates date shifts and applies to all future transactions

**Implementation Details:**
- `countFutureOccurrences()` - counts future occurrences by template_id
- `findFutureOccurrences()` - gets sorted list of future transactions
- `calculateNewDates()` - computes new dates with same day shift
- `performUpdate()` - handles both 'single' and 'all' update modes
- Modal shows occurrence count, old date, new date

**Files Modified:**
- `src/components/RecurrenceModal.tsx` (new)
- `src/components/SideDrawer.tsx` - added recurrence logic and modal integration
- `src/components/Ledger.tsx` - added prop `categories`
- `src/components/NotificationsPanel.tsx` (new)
- `src/app/app/page.tsx` - passes `categories` to SideDrawer and Ledger
- `src/types/index.ts` - extended SmartAlert with title, message, priority

**Deployment:** https://likinex.vercel.app

---

## Pending Features

1. **Categorías en calendario**: Mostrar eventos por categoría en Calendar

2. **Notificaciones push**: Integrar WhatsApp via N8N webhook para alertas de pago

3. **Cashflow projections**: Mostrar proyecciones de flujo de caja futuras