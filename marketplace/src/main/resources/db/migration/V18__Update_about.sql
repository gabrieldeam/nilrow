-- Renomear a unique constraint
ALTER TABLE public.about
    RENAME CONSTRAINT uk_r4qnrksd1gx5qui89akcg99no TO unique_channel_id;

-- Remover a foreign key constraint existente
ALTER TABLE public.about
    DROP CONSTRAINT fkmhnqo7n5mufiqdgebyflp74tq;

-- Adicionar a nova foreign key constraint com DELETE CASCADE
ALTER TABLE public.about
    ADD CONSTRAINT fk_channel_id
    FOREIGN KEY (channel_id)
    REFERENCES public.channels (id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
