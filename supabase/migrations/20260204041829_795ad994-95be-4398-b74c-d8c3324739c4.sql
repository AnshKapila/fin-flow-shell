-- Add purchase_price_per_unit and gold_type columns to investments table
ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS purchase_price_per_unit numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gold_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weight_in_grams numeric DEFAULT NULL;