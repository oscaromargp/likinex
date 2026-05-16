import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SEED_SECRET = process.env.MIGRATION_SECRET || 'likinex-migrate-2026';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  const transactions = [
    { user_id: userId, entity: 'zxyw', description: 'VPS N8N Entry (zxyw.site)', amount: 167.33, due_date: formatDate(new Date(currentYear, currentMonth, 1)), status: 'pending', recurrence: 'monthly', recurrence_day: 1, payment_method: 'transfer', category: 'vps', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'centenario', description: 'Servicio de Alberca', amount: 1800, due_date: formatDate(new Date(currentYear, currentMonth, 5)), status: 'pending', recurrence: 'monthly', recurrence_day: 5, payment_method: 'cash', category: 'servicio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'centenario', description: 'Limpieza General (Doña Maria de la Paz)', amount: 1000, due_date: formatDate(new Date(currentYear, currentMonth, 9)), status: 'pending', recurrence: 'weekly', recurrence_day: 5, payment_method: 'cash', category: 'limpieza', notes: 'Pago semanal los viernes', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'oscaromargp', description: 'CFE Personal', amount: 800, due_date: formatDate(new Date(currentYear, currentMonth, 10)), status: 'pending', recurrence: 'bimonthly', recurrence_day: 10, payment_method: 'transfer', category: 'servicios_basicos', notes: 'Un mes sí y un mes no', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'centenario', description: 'Telmex (6126881450)', amount: 725, due_date: formatDate(new Date(currentYear, currentMonth, 12)), paid_date: formatDate(new Date(currentYear, currentMonth, 12)), status: 'settled', recurrence: 'monthly', recurrence_day: 12, payment_method: 'card', category: 'telefonia', created_at: '2024-01-01', updated_at: '2024-05-12' },
    { user_id: userId, entity: 'pardesantos', description: 'Plan Emprendedor (pardesantos.mx)', amount: 202.25, due_date: formatDate(new Date(currentYear, currentMonth, 13)), status: 'pending', recurrence: 'monthly', recurrence_day: 13, payment_method: 'card', category: 'suscription', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'paypaps', description: 'Telcel PayPaps (6242124001)', amount: 203, due_date: formatDate(new Date(currentYear, currentMonth, 14)), paid_date: formatDate(new Date(currentYear, currentMonth, 14)), status: 'settled', recurrence: 'monthly', recurrence_day: 14, payment_method: 'card', category: 'telefonia', created_at: '2024-01-01', updated_at: '2024-05-14' },
    { user_id: userId, entity: 'oscaromargp', description: 'Pensión Alimenticia - 1ra Quincena', amount: 4000, due_date: formatDate(new Date(currentYear, currentMonth, 15)), status: 'pending', recurrence: 'monthly', recurrence_day: 15, payment_method: 'transfer', category: 'pension', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'paypaps', description: 'Google Workspace (paypaps.com)', amount: 841.67, due_date: formatDate(new Date(currentYear, currentMonth, 16)), status: 'pending', recurrence: 'monthly', recurrence_day: 16, payment_method: 'card', category: 'suscription', notes: 'Estimado según último registro de marzo', created_at: '2024-03-01', updated_at: '2024-03-01' },
    { user_id: userId, entity: 'paypaps', description: 'Tarjeta Nu', amount: -63.88, due_date: formatDate(new Date(currentYear, currentMonth, 18)), status: 'pending', recurrence: 'monthly', recurrence_day: 18, payment_method: 'card', category: 'tarjeta', notes: 'Monto para no generar intereses según estado de cuenta de mayo', created_at: '2024-05-01', updated_at: '2024-05-01' },
    { user_id: userId, entity: 'oscaromargp', description: 'Renta', amount: 7500, due_date: formatDate(new Date(currentYear, currentMonth, 24)), status: 'pending', recurrence: 'monthly', recurrence_day: 24, payment_method: 'transfer', category: 'renta', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'tulum', description: 'Telmex Tulum (9842317467)', amount: 899, due_date: formatDate(new Date(currentYear, currentMonth, 24)), status: 'pending', recurrence: 'monthly', recurrence_day: 24, payment_method: 'card', category: 'telefonia', notes: 'Vencimiento 24 de mayo 2026', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'oscaromargp', description: 'Google One (2 TB)', amount: 0, due_date: formatDate(new Date(currentYear, currentMonth, 28)), status: 'pending', recurrence: 'monthly', recurrence_day: 28, payment_method: 'card', category: 'suscription', notes: 'Monto variable', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'oscaromargp', description: 'Pensión Alimenticia - 2da Quincena', amount: 4000, due_date: formatDate(new Date(currentYear, currentMonth + 1, 0)), status: 'pending', recurrence: 'monthly', recurrence_day: 31, payment_method: 'transfer', category: 'pension', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'oscaromargp', description: 'Gas (Trimestral)', amount: 1000, due_date: formatDate(new Date(currentYear, currentMonth + 2, 5)), status: 'pending', recurrence: 'quarterly', recurrence_day: 5, payment_method: 'transfer', category: 'servicios_basicos', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'centenario', description: 'CFE Centenario (Servicio 006201005068)', amount: 7676, due_date: formatDate(new Date(currentYear, currentMonth + 1, 26)), status: 'pending', recurrence: 'bimonthly', recurrence_day: 26, payment_method: 'transfer', category: 'servicios_basicos', notes: 'Último pago con vencimiento 26 abril 2026', created_at: '2024-01-01', updated_at: '2024-04-26' },
    { user_id: userId, entity: 'tulum', description: 'CFE Tulum (Servicio 812260104181)', amount: 15444, due_date: formatDate(new Date(currentYear, currentMonth + 1, 4)), status: 'pending', recurrence: 'bimonthly', recurrence_day: 4, payment_method: 'transfer', category: 'servicios_basicos', notes: 'Último pago con vencimiento 04 mayo 2026', created_at: '2024-01-01', updated_at: '2024-05-04' },
    { user_id: userId, entity: 'paypaps', description: 'Dominio paypaps.com', amount: 349, due_date: '2026-10-18', status: 'pending', recurrence: 'yearly', recurrence_day: 18, payment_method: 'card', category: 'dominio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'zxyw', description: 'Dominio 9stratex.com', amount: 425, due_date: '2027-02-26', status: 'pending', recurrence: 'yearly', recurrence_day: 26, payment_method: 'card', category: 'dominio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'zxyw', description: 'Dominio zxyw.site', amount: 321, due_date: '2027-03-09', status: 'pending', recurrence: 'yearly', recurrence_day: 9, payment_method: 'card', category: 'dominio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'bnrecords', description: 'Dominio bnrecords.com.mx', amount: 500, due_date: '2027-04-12', status: 'pending', recurrence: 'yearly', recurrence_day: 12, payment_method: 'card', category: 'dominio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'pardesantos', description: 'Dominio pardesantos.mx', amount: 1150, due_date: '2027-04-20', status: 'pending', recurrence: 'yearly', recurrence_day: 20, payment_method: 'card', category: 'dominio', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'bnrecords', description: 'Plan Emprendedor bnrecords.com.mx (Anual)', amount: 1734, due_date: '2027-05-12', status: 'pending', recurrence: 'yearly', recurrence_day: 12, payment_method: 'card', category: 'suscription', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { user_id: userId, entity: 'paypaps', description: 'Plan Emprendedor paypaps.com (Trienal)', amount: 4158, due_date: '2028-11-18', status: 'pending', recurrence: 'triennial', recurrence_day: 18, payment_method: 'card', category: 'suscription', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  const entities = [
    { user_id: userId, name: 'Oscaromargp', icon: '💼', color: 'emerald', type: 'personal', is_active: true },
    { user_id: userId, name: 'Centenario', icon: '🏢', color: 'indigo', type: 'personal', is_active: true },
    { user_id: userId, name: 'Tulum', icon: '🏖️', color: 'pink', type: 'personal', is_active: true },
    { user_id: userId, name: 'Paypaps', icon: '💻', color: 'blue', type: 'business', is_active: true },
    { user_id: userId, name: 'BN Records', icon: '🎵', color: 'amber', type: 'business', is_active: true },
    { user_id: userId, name: 'Pardesantos', icon: '🚗', color: 'cyan', type: 'business', is_active: true },
    { user_id: userId, name: 'XYZW', icon: '🏭', color: 'violet', type: 'business', is_active: true },
  ];

  try {
    const { data: existingTx } = await supabase.from('transactions').select('id').eq('user_id', userId);
    if (existingTx && existingTx.length > 0) {
      return NextResponse.json({ success: true, message: 'Data already exists', count: existingTx.length });
    }

    const { error: txError } = await supabase.from('transactions').insert(transactions);
    if (txError) throw new Error(`Transactions: ${txError.message}`);

    const { error: entError } = await supabase.from('entities').insert(entities);
    if (entError) throw new Error(`Entities: ${entError.message}`);

    return NextResponse.json({
      success: true,
      message: 'Seed data loaded successfully',
      transactions: transactions.length,
      entities: entities.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Seed failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to /api/seed?secret=YOUR_SECRET with { "userId": "..." } to load seed data',
  });
}
