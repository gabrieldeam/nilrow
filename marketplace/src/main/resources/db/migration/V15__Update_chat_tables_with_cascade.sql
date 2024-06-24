
-- Atualizar constraints da tabela chat_conversations
ALTER TABLE chat_conversations
    DROP CONSTRAINT fkfnk294b63gipuwbtndulr7sgg,
    DROP CONSTRAINT fkjfyb13n2m6yehf3eeo15whla0;

ALTER TABLE chat_conversations
    ADD CONSTRAINT fk_chat_conversations_people FOREIGN KEY (people_id)
        REFERENCES people (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_chat_conversations_channel FOREIGN KEY (channel_id)
        REFERENCES channels (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;

-- Atualizar constraints da tabela chat_messages
ALTER TABLE chat_messages
    DROP CONSTRAINT fk2uu7q7vtbycloutfnj8md9ogl,
    DROP CONSTRAINT fkqgkanrr90j46564w4ww63jcna;

ALTER TABLE chat_messages
    ADD CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id)
        REFERENCES people (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_chat_messages_conversation FOREIGN KEY (conversation_id)
        REFERENCES chat_conversations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE;
