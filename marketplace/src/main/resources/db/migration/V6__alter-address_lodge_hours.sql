ALTER TABLE address_lodge_hours DROP CONSTRAINT fkhsi1xw5m20tjj2m0bgp9oo42x;

ALTER TABLE address_lodge_hours
ADD CONSTRAINT address_lodge_hours_address_id_fk FOREIGN KEY (address_id)
REFERENCES public.address (id)
ON DELETE CASCADE;
