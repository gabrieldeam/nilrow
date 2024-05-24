-- Primeiro, remova as constraints existentes que serão renomeadas
ALTER TABLE people DROP CONSTRAINT IF EXISTS fkmdhygj3uwkwcfqns9mu1htoi5;
ALTER TABLE people DROP CONSTRAINT IF EXISTS uk_av66guy6x8qkjf1npcjm8de25;

-- Adicione novamente as constraints com nomes descritivos
ALTER TABLE people
ADD CONSTRAINT people_user_id_unique UNIQUE (user_id),
ADD CONSTRAINT people_cpf_unique UNIQUE (cpf),
ADD CONSTRAINT people_email_unique UNIQUE (email),
ADD CONSTRAINT people_phone_unique UNIQUE (phone),
ADD CONSTRAINT people_user_id_fk FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
