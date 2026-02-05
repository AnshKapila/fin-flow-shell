-- Add scheme_code and SIP-related columns to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS scheme_code TEXT,
ADD COLUMN IF NOT EXISTS nav_value NUMERIC,
ADD COLUMN IF NOT EXISTS nav_date TEXT,
ADD COLUMN IF NOT EXISTS units_owned NUMERIC,
ADD COLUMN IF NOT EXISTS is_sip_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sip_amount NUMERIC,
ADD COLUMN IF NOT EXISTS sip_start_date DATE,
ADD COLUMN IF NOT EXISTS sip_day_of_month INTEGER;

-- Add index for faster scheme_code lookups
CREATE INDEX IF NOT EXISTS idx_investments_scheme_code ON public.investments(scheme_code);