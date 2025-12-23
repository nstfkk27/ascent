-- Run this first to see the actual column names in your database
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'Property'
ORDER BY ordinal_position;
