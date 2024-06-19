-- V8__update_channels_table.sql

-- Remove a constraint existente
ALTER TABLE public.channels
DROP CONSTRAINT fkn8oyesbod7eybp05hsq9ooexe;

-- Adiciona a constraint com ON DELETE CASCADE
ALTER TABLE public.channels
ADD CONSTRAINT channels_people_id_fk FOREIGN KEY (people_id)
REFERENCES public.people (id)
ON DELETE CASCADE;
