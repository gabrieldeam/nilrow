-- V9__update_follows_table.sql

-- Remove as constraints existentes
ALTER TABLE public.follows
DROP CONSTRAINT fk89eene8i8gf5lypmw6vyrn34t;

ALTER TABLE public.follows
DROP CONSTRAINT fkcfuuvmmyodfvuoa6maks12jqu;

-- Adiciona as constraints com ON DELETE CASCADE
ALTER TABLE public.follows
ADD CONSTRAINT follows_channel_id_fk FOREIGN KEY (channel_id)
REFERENCES public.channels (id)
ON DELETE CASCADE;

ALTER TABLE public.follows
ADD CONSTRAINT follows_follower_id_fk FOREIGN KEY (follower_id)
REFERENCES public.people (id)
ON DELETE CASCADE;
