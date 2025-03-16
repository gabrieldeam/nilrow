-- Opcional: verifique o nome da constraint de unicidade (caso não saiba o nome exato)
-- SELECT conname FROM pg_constraint WHERE conrelid = 'catalogs'::regclass;

-- Remove a restrição de unicidade da coluna address_id
ALTER TABLE catalogs
DROP CONSTRAINT IF EXISTS uk_gu7i36mvn462n7nnob4f6spyj;
