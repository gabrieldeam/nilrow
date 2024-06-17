
ALTER TABLE address DROP CONSTRAINT fkbpnmyrivr2hsbglwtuijh14wm;


ALTER TABLE address
ADD CONSTRAINT address_people_id_fk FOREIGN KEY (people_id)
REFERENCES public.people (id)
ON DELETE CASCADE;