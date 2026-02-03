-- Add new columns for structured FD date/tenure fields
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS tenure_value integer,
ADD COLUMN IF NOT EXISTS tenure_unit text,
ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;