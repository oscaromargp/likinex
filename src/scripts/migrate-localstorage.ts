import { supabase } from '@/lib/supabase';

interface LocalStorageTransaction {
  id: string;
  entity: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  recurrence: string;
  recurrence_day?: number;
  payment_method?: string;
  category?: string;
  notes?: string;
  follow_up?: string;
  attachment_url?: string;
  price_change?: number;
  created_at: string;
  updated_at: string;
}

interface LocalStorageEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export async function migrateLocalStorageToSupabase(userId: string) {
  const results = {
    transactions: { migrated: 0, skipped: 0, errors: 0 },
    entities: { migrated: 0, skipped: 0, errors: 0 },
    categories: { migrated: 0, errors: 0 },
  };

  const txData = localStorage.getItem(`likinex_transactions_${userId}`);
  if (txData) {
    try {
      const transactions: LocalStorageTransaction[] = JSON.parse(txData);

      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId);

      const existingIds = new Set((existing || []).map((t: any) => t.id));

      for (const tx of transactions) {
        if (existingIds.has(tx.id)) {
          results.transactions.skipped++;
          continue;
        }

        const { error } = await supabase
          .from('transactions')
          .insert([{
            id: tx.id,
            user_id: userId,
            entity: tx.entity,
            description: tx.description,
            amount: tx.amount,
            currency: 'MXN',
            due_date: tx.due_date,
            paid_date: tx.paid_date || null,
            status: tx.status,
            recurrence: tx.recurrence,
            recurrence_day: tx.recurrence_day || null,
            payment_method: tx.payment_method || null,
            category: tx.category || null,
            notes: tx.notes || null,
            follow_up: tx.follow_up || null,
            attachment_url: tx.attachment_url || null,
            price_change: tx.price_change || null,
            created_at: tx.created_at,
            updated_at: tx.updated_at,
          }]);

        if (error) {
          console.error(`Error migrating transaction ${tx.id}:`, error);
          results.transactions.errors++;
        } else {
          results.transactions.migrated++;
        }
      }
    } catch (e) {
      console.error('Error parsing transactions:', e);
    }
  }

  const entityData = localStorage.getItem(`likinex_entities_${userId}`);
  if (entityData) {
    try {
      const entities: LocalStorageEntity[] = JSON.parse(entityData);

      const { data: existing } = await supabase
        .from('entities')
        .select('id')
        .eq('user_id', userId);

      const existingIds = new Set((existing || []).map((e: any) => e.id));

      for (const entity of entities) {
        if (existingIds.has(entity.id)) {
          results.entities.skipped++;
          continue;
        }

        const { error } = await supabase
          .from('entities')
          .insert([{
            id: entity.id,
            user_id: userId,
            name: entity.name,
            icon: entity.icon,
            color: entity.color,
            type: 'personal',
            is_active: entity.is_active,
          }]);

        if (error) {
          console.error(`Error migrating entity ${entity.id}:`, error);
          results.entities.errors++;
        } else {
          results.entities.migrated++;
        }
      }
    } catch (e) {
      console.error('Error parsing entities:', e);
    }
  }

  return results;
}

export function getMigrationStatus(userId: string) {
  const txData = localStorage.getItem(`likinex_transactions_${userId}`);
  const entityData = localStorage.getItem(`likinex_entities_${userId}`);

  return {
    hasTransactions: !!txData,
    transactionCount: txData ? JSON.parse(txData).length : 0,
    hasEntities: !!entityData,
    entityCount: entityData ? JSON.parse(entityData).length : 0,
  };
}
