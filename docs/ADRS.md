# ADR-001: Modelo Extendido de Transacción

## Status
Accepted (Fase 1)

## Context
Hoy `entity` en Transaction es un campo único. No distingue entre quién paga y quién recibe. Para flujo entre entidades (bnrecords → oscaromargp), necesitamos origen + destino.

## Decision
Extender Transaction con:
- `source_entity: string` — quién PAGA (reemplaza `entity`)
- `destination_entity?: string` — quién RECIBE (solo para transferencias/ingresos)
- `type` se expande: `'expense' | 'income' | 'transfer'`

Reglas:
- **Gasto**: solo `source_entity` → dinero sale de esa entidad
- **Ingreso**: solo `destination_entity` → dinero llega a esa entidad
- **Transferencia**: ambos seteados → sale de source, llega a destination
- `entity` se mantiene como alias calculado (`source_entity || destination_entity`)

## Consecuencias
- Dashboard por entidad: filtra donde `source_entity = X OR destination_entity = X`
- SideDrawer: nuevo campo "Entidad destino" para transfers
- Backward compatible: migración suave desde `entity` → `source_entity`

---

# ADR-002: Dashboard por Entidad + Consolidado

## Status
Accepted (Fase 1)

## Decision
- Selector de entidad en el header del dashboard (junto a alertas/notificaciones)
- Por defecto: **Consolidado** (todas las entidades)
- Al seleccionar una entidad: todos los widgets filtran por esa entidad
- Transferencias: aparecen como **gasto** en la entidad origen, **ingreso** en la entidad destino
- El selector persiste en localStorage

## Componentes afectados
- `AccountBalances` — ya acepta `selectedEntity`
- `WeeklyPulse` — ya acepta `selectedEntity`
- `MetricsCards` — necesita filtro
- `CashFlowForecast` — necesita filtro
- `Ledger` — necesita filtro
- `CalendarComponent` — necesita filtro

---

# ADR-003: Fix Entity Duplicado en SideDrawer

## Bug
Al crear/editar transacción, el dropdown de entidad muestra entidades repetidas.

## Causa
El SideDrawer recibe `entities` del padre pero también tiene su propio listado interno. Se renderizan duplicados.

## Fix
- SideDrawer debe recibir `entities` como prop y mostrarlas sin duplicar
- Eliminar lista interna hardcodeada

---

# ADR-004: Recurrencia Flexible (Fase 3)

## Context
`semi_monthly` fuerza [1, 15]. Necesitamos días custom (5, 20), fin de recurrencia.

## Decision (pospuesta a Fase 3)
- `recurrence` sigue siendo string pero se añade:
  - `recurrence_days_of_month: number[]` — días específicos
  - `recurrence_end_date: string | null`
  - `recurrence_count: number | null`
- El proyector (`generateProjections`) se actualiza para usar estos campos
