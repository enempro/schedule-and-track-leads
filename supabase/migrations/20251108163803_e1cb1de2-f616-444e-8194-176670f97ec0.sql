-- Add 'paid' status to lead_status enum
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'paid';

-- Add payment_amount column to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS payment_amount numeric NOT NULL DEFAULT 0;