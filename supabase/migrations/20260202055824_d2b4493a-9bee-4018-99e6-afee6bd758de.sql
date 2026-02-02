-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create investments table for wealth tracking
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stocks', 'mutual-funds', 'gold', 'fd', 'savings')),
  current_value NUMERIC NOT NULL DEFAULT 0,
  invested_value NUMERIC NOT NULL DEFAULT 0,
  -- Type-specific fields
  category TEXT,
  risk_level TEXT,
  bank TEXT,
  account_number TEXT,
  interest_rate NUMERIC,
  maturity_date TEXT,
  maturity_value NUMERIC,
  added_date TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own investments" 
ON public.investments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" 
ON public.investments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" 
ON public.investments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" 
ON public.investments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();