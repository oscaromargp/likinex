import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzE4MDdkZS0xMTI4LTQ1OTgtYjE5OS1mZjQ2ZmIwZGYzODUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYTVjMDYyMTMtYTQ3OS00MWNiLWI4ZWUtZDBlMjIxNzAxNTYyIiwiaWF0IjoxNzc4ODA3MTU3fQ.YSuBJJjuNl9NGhBJxF9nwvunsZW3TxdgOkLanxcwcpo';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.antigravity.com.mx/webhook/likinex-notifications';
const DEFAULT_WHATSAPP_PHONE = process.env.DEFAULT_WHATSAPP_PHONE || '6121077805';

interface NotificationPayload {
  type: 'payment_reminder' | 'payment_due' | 'payment_overdue' | 'cashflow_alert' | 'card_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>;
  phone?: string;
  userId?: string;
  transactionId?: string;
}

async function sendToN8N(payload: NotificationPayload) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_API_KEY}`,
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'likinex-pro',
        channel: 'whatsapp',
      }),
    });

    if (!response.ok) {
      console.error('N8N webhook failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending to N8N:', error);
    return false;
  }
}

async function saveNotification(payload: NotificationPayload) {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('notifications_log')
      .insert({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        phone: payload.phone || DEFAULT_WHATSAPP_PHONE,
        user_id: payload.userId,
        transaction_id: payload.transactionId,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Supabase error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    
    const { type, title, message, priority, data, phone, userId, transactionId } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const notificationPayload: NotificationPayload = {
      type: type || 'payment_reminder',
      title,
      message,
      priority: priority || 'medium',
      data,
      phone: phone || DEFAULT_WHATSAPP_PHONE,
      userId,
      transactionId,
    };

    const savedNotification = await saveNotification(notificationPayload);
    
    const n8nSent = await sendToN8N(notificationPayload);

    return NextResponse.json({
      success: true,
      notificationId: savedNotification?.id,
      sentToN8N: n8nSent,
      message: n8nSent 
        ? `Notification sent to WhatsApp ${notificationPayload.phone}` 
        : 'Notification saved but N8N delivery failed',
    });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    const client = getSupabaseClient();
    let query = client
      .from('notifications_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
