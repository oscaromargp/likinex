# Reporte de Análisis Relacional y Limitaciones del Modelo - LikinEx

Este reporte detalla un análisis exhaustivo del modelo de datos de **LikinEX**, identificando las discrepancias entre la estructura actual de la base de datos (Supabase), los tipos de TypeScript definidos y la lógica de negocio que actualmente la aplicación *no realiza* o maneja de forma incompleta debido a la falta de relaciones formalizadas.

---

## 1. Relaciones No Modeladas e Inconsistencias Críticas

### A. Falta de Integridad Referencial en Entidades y Categorías
* **Inconsistencia:** En la tabla `transactions`, los campos `entity` (`VARCHAR(255)`) y `category` (`VARCHAR(100)`) son columnas de texto plano. Sin embargo, existen tablas dedicadas para `entities` y `categories`.
* **Impacto:**
  * No hay llaves foráneas (`FOREIGN KEY`) que apunten a `entities.id` ni a `categories.id`.
  * Si un usuario cambia el nombre o elimina una Entidad/Categoría en la sección de Configuración, las transacciones existentes **mantienen el valor de texto antiguo**, rompiendo la coherencia de datos.
  * No se pueden realizar Cascade Deletes de transacciones cuando una entidad deja de existir.

### B. Ausencia de la Tabla de Plantillas (Templates)
* **Inconsistencia:** La tabla `transactions` cuenta con la columna `template_id UUID`, y en la interfaz de TypeScript se define la interfaz `TransactionTemplate`. Sin embargo, **no existe ninguna tabla de plantillas de transacciones en la base de datos** (`001_initial_schema.sql`).
* **Impacto:**
  * No hay forma de almacenar plantillas base para transacciones recurrentes en el servidor.
  * La proyección del calendario y flujo de caja tiene que deducirse recorriendo y calculando fechas dinámicamente en el lado del cliente, lo que degrada el rendimiento a medida que crece el historial.

### C. Desconexión entre Tarjetas de Crédito y Transacciones
* **Inconsistencia:** La tabla `credit_cards` almacena información de tarjetas de crédito (saldos, pago mínimo, MSI), pero la tabla `transactions` no tiene una relación formal (`credit_card_id`) para registrar compras o abonos a una tarjeta específica.
* **Impacto:**
  * El saldo actual (`current_balance`) de una tarjeta de crédito no puede calcularse dinámicamente a partir de sus transacciones asociadas. El usuario debe actualizar de forma manual y estática el saldo en el modal de configuración de la tarjeta.
  * Las compras diferidas a Meses Sin Intereses (MSI) no están asociadas directamente a la tarjeta, lo que imposibilita la amortización automática mensual en el motor de flujo de caja.

### D. Relación de Pagos Parciales (Abonos) vs Estado de la Transacción
* **Inconsistencia:** Aunque existe la tabla `payment_records` vinculada a `transactions` para registrar abonos de pago, no hay una relación lógica automatizada.
* **Impacto:**
  * El estado (`status: pending / settled`) de una transacción no se actualiza automáticamente según la suma acumulada de sus `payment_records`. 
  * Por ejemplo, si una transacción es de $1,000 MXN y se añade un registro de pago por $1,000 MXN, la transacción sigue marcada como "Pendiente" a menos que el usuario la cambie manualmente a "Liquidada".

### E. Configuración de Alertas y Criticidad no Persistente
* **Inconsistencia:** En la interfaz de TypeScript existen tolerancias y criticidades de servicios (`ServiceTolerance`), pero no existen tablas en la base de datos Supabase para persistir estos ajustes por usuario.
* **Impacto:**
  * Las reglas de tolerancia (ejemplo: CFE tiene 2 días de tolerancia, suscripciones tienen 7 días) están hardcodeadas en el frontend (`DEFAULT_TOLERANCES`). Un usuario no puede personalizar ni guardar sus propias tolerancias.

---

## 2. Lo que la Aplicación NO Hace Actualmente (Oportunidades de Mejora)

1. **Amortización de MSI:** No deduce mensualmente de forma automática la mensualidad de los MSI del saldo disponible ni genera las transacciones de pago automáticas.
2. **Conciliación de Saldos:** No hay integración bancaria real (ej. vía Syncfy o Fintoc) ni carga de archivos bancarios oficiales (CSV/OFX) para conciliar transacciones reales con las proyectadas.
3. **Historial de Puntuación Financiera:** El cálculo de la puntuación de puntualidad se hace al vuelo en la UI. No se almacena un histórico de "Credit Score de Proveedor", impidiendo ver gráficos de comportamiento de pago a lo largo del tiempo.
4. **Validación de Límites de Gasto:** No existen alertas automáticas cuando los egresos planificados de una categoría superan un presupuesto mensual previamente establecido.

---

## 3. Propuesta de Corrección de Base de Datos (Esquema Corregido)

Para solventar estas limitaciones en futuras iteraciones, se propone la creación de la siguiente estructura relacional formal:

```sql
-- 1. Asegurar integridad en Entidades
ALTER TABLE transactions 
  DROP COLUMN entity,
  ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE SET NULL;

-- 2. Asegurar integridad en Categorías
ALTER TABLE transactions 
  DROP COLUMN category,
  ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 3. Crear tabla de Plantillas real
CREATE TABLE IF NOT EXISTS transaction_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    recurrence recurrence_type NOT NULL DEFAULT 'none',
    recurrence_day INTEGER,
    payment_method payment_method,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Vincular Transacciones a Tarjetas de Crédito
ALTER TABLE transactions 
  ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- 5. Crear tabla de Tolerancia de Servicios personalizable
CREATE TABLE IF NOT EXISTS service_tolerances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    tolerance_days INTEGER NOT NULL DEFAULT 2,
    criticality VARCHAR(20) NOT NULL DEFAULT 'critical'
);
```
