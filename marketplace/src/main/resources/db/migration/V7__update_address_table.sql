ALTER TABLE public.address
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS type_name,
DROP COLUMN IF EXISTS packages_in_lodge,
DROP COLUMN IF EXISTS lodge_days,
DROP COLUMN IF EXISTS lodge_open_24h,
DROP COLUMN IF EXISTS lodge_closed,
DROP COLUMN IF EXISTS lodge_open_hour,
DROP COLUMN IF EXISTS lodge_close_hour;

DROP TABLE IF EXISTS public.address_lodge_hours;
