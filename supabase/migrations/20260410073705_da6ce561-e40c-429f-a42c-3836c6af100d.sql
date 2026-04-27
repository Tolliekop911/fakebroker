
ALTER TABLE public.accounts
ADD COLUMN condor_account_id varchar NULL,
ADD COLUMN deposit_confirmed boolean NOT NULL DEFAULT false;
