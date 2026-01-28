-- Add frequency_unit column for custom frequencies
ALTER TABLE public.spendings 
ADD COLUMN frequency_unit text;

-- Add comment for clarity
COMMENT ON COLUMN public.spendings.frequency_unit IS 'Unit for custom frequency: day, week, month, year. Only used when frequency_type = custom';