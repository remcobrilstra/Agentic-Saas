-- Add missing columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN
IF NOT EXISTS first_name TEXT,
ADD COLUMN
IF NOT EXISTS last_name TEXT,
ADD COLUMN
IF NOT EXISTS avatar_url TEXT;

-- Update the view to use the new columns instead of metadata
DROP VIEW IF EXISTS public.users_with_profiles;
CREATE OR REPLACE VIEW public.users_with_profiles AS
SELECT
    p.id,
    u.email,
    p.role,
    COALESCE(p.first_name, u.raw_user_meta_data->>'firstName') as first_name,
    COALESCE(p.last_name, u.raw_user_meta_data->>'lastName') as last_name,
    COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatarUrl') as avatar_url,
    p.created_at,
    p.updated_at
FROM
    public.user_profiles p
    LEFT JOIN auth.users u ON p.id = u.id;

-- Grant access to authenticated users
GRANT SELECT ON public.users_with_profiles TO authenticated;

-- Update the RPC function to use the new columns
CREATE OR REPLACE FUNCTION public.get_users_paginated
(
  search_email text DEFAULT NULL,
  filter_role text DEFAULT NULL,
  page_number int DEFAULT 1,
  page_size int DEFAULT 10
)
RETURNS TABLE
(
  id uuid,
  email text,
  role varchar
(50),
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_value int;
BEGIN
  offset_value :=
(page_number - 1) * page_size;

RETURN QUERY
WITH
    filtered_users
    AS
    (
        SELECT
            p.id,
            u.email,
            p.role,
            COALESCE(p.first_name, u.raw_user_meta_data->>'firstName') as first_name,
            COALESCE(p.last_name, u.raw_user_meta_data->>'lastName') as last_name,
            COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatarUrl') as avatar_url,
            p.created_at,
            p.updated_at
        FROM
            public.user_profiles p
            LEFT JOIN auth.users u ON p.id = u.id
        WHERE
      (search_email IS NULL OR u.email
     ILIKE '%' || search_email || '%')
      AND
(filter_role IS NULL OR p.role = filter_role)
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET offset_value
  ),
  total AS
(
    SELECT COUNT(*) as count
FROM public.user_profiles p
    LEFT JOIN auth.users u ON p.id = u.id
WHERE
      (search_email IS NULL OR u.email
ILIKE '%' || search_email || '%')
      AND
(filter_role IS NULL OR p.role = filter_role)
  )
SELECT
    fu.*,
    (SELECT count
    FROM total) as total_count
FROM filtered_users fu;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_paginated TO authenticated;