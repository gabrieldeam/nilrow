-- V10__update_channels_table_unique_constraint.sql

-- Renomeia a constraint única existente
ALTER TABLE public.channels
DROP CONSTRAINT uk_norty3onr1ee8v2g2gm2iep6g;

-- Adiciona a constraint única com um nome descritivo
ALTER TABLE public.channels
ADD CONSTRAINT channels_people_id_unique UNIQUE (people_id);
