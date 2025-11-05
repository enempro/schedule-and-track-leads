-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('open', 'scheduled', 'rejected');

-- Create enum for courses
CREATE TYPE public.course_type AS ENUM (
  'QA Automation - playwright/cypress',
  'QA Automation - selenium java',
  'Devops',
  'UI/UX designing',
  'Workflow Automation'
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  course course_type NOT NULL,
  meeting_date TIMESTAMPTZ,
  status lead_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for the scheduling form)
CREATE POLICY "Allow public inserts"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to view and update
CREATE POLICY "Authenticated users can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update all leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete all leads"
ON public.leads
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;