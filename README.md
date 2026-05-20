# 💰 LikinEX - Advanced Liquidity Orchestrator / Orquestador de Liquidez Avanzado

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Foscaromargp%2Flikinex&project-name=likinex-app&repository-name=likinex-app)

*LikinEX is an open-source "Financial Second Brain" designed to track complex liquidity, recurrent payments, staggered invoices, and enriched contact relationships without the bloat of traditional ERPs.*

*(ES)* *LikinEX es un "Segundo Cerebro Financiero" de código abierto diseñado para rastrear liquidez compleja, pagos recurrentes, facturas escalonadas y relaciones de contacto enriquecidas sin la pesadez de los ERP tradicionales.*

---

## 🌐 Live Demo / Demostración en Vivo

**Try it right now! / ¡Pruébalo ahora mismo!**
👉 **[https://likinex.vercel.app](https://likinex.vercel.app)** 👈

No setup required. The demo mode runs entirely on your local browser (LocalStorage) so you can test all features privately before connecting it to a database!

*(ES)* No requiere configuración. ¡El modo de prueba corre completamente en tu navegador (LocalStorage) para que puedas probar todas las funciones de forma privada antes de conectarlo a una base de datos!

---

## 📸 Screenshots / Capturas de Pantalla

*(Wait for the images to load to see the beautiful UI in action)*

### 1. Unified Dashboard (Panel Unificado)
> Visual overview of your committed capital vs available funds.
![Dashboard Overview](https://raw.githubusercontent.com/oscaromargp/likinex/main/public/screenshots/dashboard.jpg)

### 2. Kanban & Calendar view (Vista de Calendario y Pagos)
> Drag and drop payments, see upcoming deadlines with automatic visual alerts.
![Calendar View](https://raw.githubusercontent.com/oscaromargp/likinex/main/public/screenshots/calendar.jpg)

### 3. Enriched Contacts CRM (Contactos Enriquecidos)
> Keep track of unlimited bank accounts, addresses, emails, and a historical **Reputation Score** for each contact or supplier!
![Contacts CRM](https://raw.githubusercontent.com/oscaromargp/likinex/main/public/screenshots/contacts.jpg)

### 4. Premium Payment Vouchers (Comprobantes Electrónicos de Pago)
> Export beautiful PDF vouchers with pie charts showing partial amortizations and payment history.
![Payment Voucher PDF](https://raw.githubusercontent.com/oscaromargp/likinex/main/public/screenshots/receipt.jpg)

---

## ✨ Key Features / Características Principales

### 🇬🇧 English
- **Zero-Config Demo Mode:** Start instantly using your browser's LocalStorage.
- **Deep Contact Nutrition:** Store multiple banks, CLABEs, phone numbers, and digital footprint for each supplier.
- **Reputation Tracking:** Tag suppliers with Positive/Negative notes so your team knows who to trust.
- **Payment Deadlines vs Ideal Dates:** Understand your real runway by setting tolerance days and forcing justifications for late payments.
- **Bank-Grade PDF Vouchers:** Export a gorgeous, SVG-powered "Electronic Payment Voucher" showing amortization history.
- **Micro-animations & Premium UI:** Built with Tailwind V4, Framer Motion, and Lucide React.

### 🇪🇸 Español
- **Modo Demo Sin Configuración:** Comienza al instante usando el LocalStorage de tu navegador.
- **Nutrición Profunda de Contactos:** Almacena múltiples bancos, CLABEs, teléfonos y huella digital para cada proveedor.
- **Historial de Reputación:** Etiqueta proveedores con notas Positivas/Negativas para que tu equipo sepa en quién confiar.
- **Diferenciación de Prórrogas (Deadlines):** Comprende tu liquidez real fijando días de tolerancia y obligando a justificar los pagos atrasados.
- **Comprobantes PDF Nivel Bancario:** Exporta un hermoso "Comprobante Electrónico de Pago" con gráficos y el historial de amortizaciones.
- **UI Premium y Micro-animaciones:** Construido con Tailwind V4, Framer Motion y Lucide React.

---

## 🚀 How to use it / Cómo usarlo (No code required)

The easiest way to use LikinEX is to deploy it directly to Vercel and use it in "Demo Mode" (Local Storage).

### Option 1: 1-Click Deploy (Vercel)
1. Click the **"Deploy with Vercel"** button at the top of this file.
2. Vercel will clone this repository to your GitHub and build it for free.
3. Open the generated URL and start managing your liquidity immediately.

### Option 2: Run it locally (Desarrollo Local)
If you are a developer and want to run it on your machine:
```bash
git clone https://github.com/oscaromargp/likinex.git
cd likinex
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ⚙️ Connecting to a Database (Optional) / Conexión a Base de Datos (Opcional)

If you want to sync your data across devices, LikinEX supports Supabase natively!

1. Create a free project on [Supabase](https://supabase.com).
2. Copy your URL and Anon Key.
3. Add them as Environment Variables in Vercel (or in a `.env.local` file locally):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. LikinEX will automatically switch from LocalStorage to the Cloud!

---

## 👨‍💻 Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion
- Lucide React Icons
- Supabase (Optional Backend)

---
*Built with love for high-performance financial management. / Construido con amor para la gestión financiera de alto rendimiento.*
