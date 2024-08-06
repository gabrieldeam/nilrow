-- Remover a foreign key constraint existente
ALTER TABLE public.faqs
    DROP CONSTRAINT fkrem1a2s6s0ti3kc0xmcxlp8j3;

-- Adicionar a nova foreign key constraint com DELETE CASCADE
ALTER TABLE public.faqs
    ADD CONSTRAINT fk_about_id
    FOREIGN KEY (about_id)
    REFERENCES public.about (id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
