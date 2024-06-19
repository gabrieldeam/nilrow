ALTER TABLE people
ADD COLUMN channel_id VARCHAR(255);

ALTER TABLE people
ADD CONSTRAINT people_channel_id_fk FOREIGN KEY (channel_id)
REFERENCES channels (id)
ON DELETE CASCADE;
