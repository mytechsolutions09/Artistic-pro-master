-- =====================================================
-- SUPABASE DATABASE MANAGEMENT FUNCTIONS
-- Copy and paste this into Supabase SQL Editor
-- =====================================================

-- Function to get table information
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
  name text,
  description text,
  row_count bigint,
  columns jsonb,
  last_modified timestamp with time zone,
  size text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text as name,
    COALESCE(obj_description(c.oid), 'No description available')::text as description,
    COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0)::bigint as row_count,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', column_name,
          'type', data_type,
          'nullable', is_nullable = 'YES',
          'defaultValue', column_default,
          'isPrimaryKey', EXISTS(
            SELECT 1 FROM information_schema.key_column_usage kcu
            WHERE kcu.table_name = t.table_name 
            AND kcu.column_name = c.column_name
            AND kcu.constraint_name IN (
              SELECT constraint_name FROM information_schema.table_constraints tc
              WHERE tc.table_name = t.table_name 
              AND tc.constraint_type = 'PRIMARY KEY'
            )
          ),
          'isForeignKey', EXISTS(
            SELECT 1 FROM information_schema.key_column_usage kcu
            WHERE kcu.table_name = t.table_name 
            AND kcu.column_name = c.column_name
            AND kcu.constraint_name IN (
              SELECT constraint_name FROM information_schema.table_constraints tc
              WHERE tc.table_name = t.table_name 
              AND tc.constraint_type = 'FOREIGN KEY'
            )
          )
        )
      )
      FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.table_schema = 'public'
    ) as columns,
    COALESCE(s.last_analyze, s.last_autoanalyze, NOW()) as last_modified,
    COALESCE(
      pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))),
      '0 bytes'
    )::text as size
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE 'sql_%'
  ORDER BY t.table_name;
END;
$$;

-- Function to get table columns information
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  name text,
  type text,
  nullable boolean,
  default_value text,
  is_primary_key boolean,
  is_foreign_key boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text as name,
    c.data_type::text as type,
    (c.is_nullable = 'YES') as nullable,
    c.column_default::text as default_value,
    EXISTS(
      SELECT 1 FROM information_schema.key_column_usage kcu
      WHERE kcu.table_name = get_table_columns.table_name
      AND kcu.column_name = c.column_name
      AND kcu.constraint_name IN (
        SELECT constraint_name FROM information_schema.table_constraints tc
        WHERE tc.table_name = get_table_columns.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
      )
    ) as is_primary_key,
    EXISTS(
      SELECT 1 FROM information_schema.key_column_usage kcu
      WHERE kcu.table_name = get_table_columns.table_name
      AND kcu.column_name = c.column_name
      AND kcu.constraint_name IN (
        SELECT constraint_name FROM information_schema.table_constraints tc
        WHERE tc.table_name = get_table_columns.table_name
        AND tc.constraint_type = 'FOREIGN KEY'
      )
    ) as is_foreign_key
  FROM information_schema.columns c
  WHERE c.table_name = get_table_columns.table_name
  AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$;

-- Function to execute SQL statements (with security restrictions)
CREATE OR REPLACE FUNCTION execute_sql(sql_statement text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result text;
BEGIN
  -- Only allow certain types of SQL statements for security
  IF sql_statement ~* '^(CREATE|INSERT|UPDATE|DELETE|ALTER|DROP)' THEN
    -- Execute the SQL statement
    EXECUTE sql_statement;
    result := 'SQL executed successfully';
  ELSE
    RAISE EXCEPTION 'Only CREATE, INSERT, UPDATE, DELETE, ALTER, and DROP statements are allowed';
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL execution failed: %', SQLERRM;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_table_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;

-- Create a view for easier table statistics
CREATE OR REPLACE VIEW table_statistics AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation,
  most_common_vals::text,
  most_common_freqs::text,
  histogram_bounds::text
FROM pg_stats
WHERE schemaname = 'public';

-- Grant access to the view
GRANT SELECT ON table_statistics TO authenticated;

-- Create a function to get database size information
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  total_size text,
  index_size text,
  table_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0)::bigint as row_count,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)))::text as total_size,
    pg_size_pretty(pg_indexes_size(quote_ident(t.table_name)))::text as index_size,
    pg_size_pretty(pg_relation_size(quote_ident(t.table_name)))::text as table_size
  FROM information_schema.tables t
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size(quote_ident(t.table_name)) DESC;
END;
$$;

-- Grant access to the database size function
GRANT EXECUTE ON FUNCTION get_database_size() TO authenticated;

-- Create a function to get table row counts
CREATE OR REPLACE FUNCTION get_table_row_counts()
RETURNS TABLE (
  table_name text,
  row_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0)::bigint as row_count
  FROM information_schema.tables t
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$;

-- Grant access to the row count function
GRANT EXECUTE ON FUNCTION get_table_row_counts() TO authenticated;
