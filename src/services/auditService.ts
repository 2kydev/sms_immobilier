import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 'create' | 'update' | 'delete';

export async function logAction(params: {
  action: AuditAction;
  table: string;
  recordId: string;
  label: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    user_email: user.email ?? '',
    action: params.action,
    table_name: params.table,
    record_id: params.recordId,
    label: params.label,
  });
}
