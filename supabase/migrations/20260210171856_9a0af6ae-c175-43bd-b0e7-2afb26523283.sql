
-- Add goal_id column to investments table for asset-goal linking
ALTER TABLE public.investments ADD COLUMN goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_investments_goal_id ON public.investments(goal_id);
