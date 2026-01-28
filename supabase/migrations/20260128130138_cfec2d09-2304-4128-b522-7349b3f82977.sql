-- Create spendings table
CREATE TABLE public.spendings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency_type TEXT NOT NULL DEFAULT 'monthly',
  frequency_interval INTEGER,
  start_date DATE,
  icon TEXT DEFAULT 'Home',
  icon_bg TEXT DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.spendings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own spendings"
ON public.spendings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spendings"
ON public.spendings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spendings"
ON public.spendings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spendings"
ON public.spendings
FOR DELETE
USING (auth.uid() = user_id);