-- Update foreign key constraint for transactions.property_id to allow ON DELETE SET NULL
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_property_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES public.properties(id) 
ON DELETE SET NULL;

-- Update foreign key constraint for transactions.client_id to allow ON DELETE SET NULL  
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_client_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE SET NULL;