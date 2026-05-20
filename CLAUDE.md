@AGENTS.md

## Progress Log

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