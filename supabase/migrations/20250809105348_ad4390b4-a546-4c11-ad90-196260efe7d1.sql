-- Ensure properties.type accepts 'immeuble' in addition to existing types
alter table public.properties drop constraint if exists properties_type_check;
alter table public.properties add constraint properties_type_check check (type in ('terrain','maison','entrepot','immeuble'));
