-- Remove email notification system (Resend removed)
-- Drop email_logs table
DROP TABLE IF EXISTS public.email_logs CASCADE;

-- Remove notification columns from visits table
ALTER TABLE public.visits
  DROP COLUMN IF EXISTS notification_enabled,
  DROP COLUMN IF EXISTS notification_delay_hours,
  DROP COLUMN IF EXISTS notification_email,
  DROP COLUMN IF EXISTS agent_notification_email,
  DROP COLUMN IF EXISTS client_notification_email,
  DROP COLUMN IF EXISTS last_notification_sent_at;
