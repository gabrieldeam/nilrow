-- Remover as constraints existentes
ALTER TABLE public.muted_conversations
    DROP CONSTRAINT IF EXISTS fk4ad4rhwkypqeey2kwjxe3o2fy,
    DROP CONSTRAINT IF EXISTS fkj8wo3vi0betgg3vjcawfbxq3u;

-- Adicionar novas constraints com delete em cascata e nomes melhores
ALTER TABLE public.muted_conversations
    ADD CONSTRAINT fk_muted_conversations_people
        FOREIGN KEY (people_id)
        REFERENCES public.people (id)
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_muted_conversations_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES public.chat_conversations (id)
        ON DELETE CASCADE;