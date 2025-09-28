import { supabase } from './supabaseService';

export interface TableInfo {
  name: string;
  description: string;
  rowCount: number;
  columns: ColumnInfo[];
  lastModified: string;
  size: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface TableData {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ImportResult {
  table: string;
  success: boolean;
  message: string;
  rowsImported?: number;
  error?: string;
}

export class DatabaseService {
  /**
   * Get all database tables with their information
   */
  static async getTables(): Promise<TableInfo[]> {
    try {
      // Get table information from information_schema
      const { data: tables, error } = await supabase.rpc('get_table_info');
      
      if (error) {
        console.error('Error fetching tables:', error);
        // Fallback to hardcoded table info if RPC fails
        return this.getDefaultTables();
      }

      return tables || this.getDefaultTables();
    } catch (error) {
      console.error('Error in getTables:', error);
      return this.getDefaultTables();
    }
  }

  /**
   * Get table data with pagination
   */
  static async getTableData(
    tableName: string, 
    page: number = 1, 
    pageSize: number = 50
  ): Promise<TableData> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      // Get paginated data
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: data || [],
        totalCount,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get table columns information
   */
  static async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    try {
      const { data, error } = await supabase.rpc('get_table_columns', {
        table_name: tableName
      });

      if (error) {
        console.error('Error fetching columns:', error);
        // Fallback to basic column info
        return this.getDefaultColumns(tableName);
      }

      return data || this.getDefaultColumns(tableName);
    } catch (error) {
      console.error('Error in getTableColumns:', error);
      return this.getDefaultColumns(tableName);
    }
  }

  /**
   * Import SQL file content
   */
  static async importSQL(sqlContent: string): Promise<ImportResult[]> {
    const results: ImportResult[] = [];
    
    try {
      // Split SQL content into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.toLowerCase().includes('create table')) {
          const tableName = this.extractTableName(statement);
          
          try {
            const { error } = await supabase.rpc('execute_sql', {
              sql_statement: statement
            });

            if (error) {
              results.push({
                table: tableName || 'unknown',
                success: false,
                message: `Failed to create table: ${error.message}`,
                error: error.message
              });
            } else {
              results.push({
                table: tableName || 'unknown',
                success: true,
                message: `Successfully created table ${tableName}`,
                rowsImported: 0
              });
            }
          } catch (err) {
            results.push({
              table: tableName || 'unknown',
              success: false,
              message: `Error executing SQL: ${err}`,
              error: String(err)
            });
          }
        } else if (statement.toLowerCase().includes('insert into')) {
          const tableName = this.extractTableName(statement);
          
          try {
            const { error } = await supabase.rpc('execute_sql', {
              sql_statement: statement
            });

            if (error) {
              results.push({
                table: tableName || 'unknown',
                success: false,
                message: `Failed to insert data: ${error.message}`,
                error: error.message
              });
            } else {
              results.push({
                table: tableName || 'unknown',
                success: true,
                message: `Successfully inserted data into ${tableName}`,
                rowsImported: 1
              });
            }
          } catch (err) {
            results.push({
              table: tableName || 'unknown',
              success: false,
              message: `Error executing SQL: ${err}`,
              error: String(err)
            });
          }
        }
      }
    } catch (error) {
      results.push({
        table: 'general',
        success: false,
        message: `Import failed: ${error}`,
        error: String(error)
      });
    }

    return results;
  }

  /**
   * Export table data as CSV
   */
  static async exportTableAsCSV(tableName: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10000); // Limit to prevent memory issues

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return '';
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );

      return [csvHeaders, ...csvRows].join('\n');
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Export all database tables as a ZIP file
   */
  static async exportAllTablesAsZIP(): Promise<Blob> {
    try {
      // Get all tables
      const tables = await this.getTables();
      
      // Create a JSZip instance (you'll need to install jszip)
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add a metadata file
      const metadata = {
        exportDate: new Date().toISOString(),
        totalTables: tables.length,
        tables: tables.map(table => ({
          name: table.name,
          description: table.description,
          rowCount: table.rowCount,
          columns: table.columns.length
        }))
      };
      
      zip.file('export_metadata.json', JSON.stringify(metadata, null, 2));
      
      // Export each table
      const exportPromises = tables.map(async (table) => {
        try {
          const csvContent = await this.exportTableAsCSV(table.name);
          if (csvContent) {
            zip.file(`${table.name}.csv`, csvContent);
            return { table: table.name, success: true, rows: csvContent.split('\n').length - 1 };
          } else {
            zip.file(`${table.name}.csv`, 'No data available');
            return { table: table.name, success: true, rows: 0 };
          }
        } catch (error) {
          zip.file(`${table.name}_error.txt`, `Export failed: ${error}`);
          return { table: table.name, success: false, error: String(error) };
        }
      });
      
      // Wait for all exports to complete
      const results = await Promise.all(exportPromises);
      
      // Add export results summary
      const summary = {
        exportDate: new Date().toISOString(),
        totalTables: tables.length,
        successfulExports: results.filter(r => r.success).length,
        failedExports: results.filter(r => !r.success).length,
        results: results
      };
      
      zip.file('export_summary.json', JSON.stringify(summary, null, 2));
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      return zipBlob;
    } catch (error) {
      console.error('Error exporting all tables:', error);
      throw error;
    }
  }

  /**
   * Get table row count
   */
  static async getTableRowCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error getting row count for ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Execute custom SQL query
   */
  static async executeQuery(query: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_statement: query
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Extract table name from SQL statement
   */
  private static extractTableName(statement: string): string | null {
    const createTableMatch = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)/i);
    if (createTableMatch) {
      return createTableMatch[1];
    }

    const insertMatch = statement.match(/insert\s+into\s+(\w+)/i);
    if (insertMatch) {
      return insertMatch[1];
    }

    return null;
  }

  /**
   * Default table information when RPC fails
   */
  private static getDefaultTables(): TableInfo[] {
    return [
      {
        name: 'products',
        description: 'Main products table with all product information',
        rowCount: 0,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'title', type: 'varchar', nullable: false },
          { name: 'price', type: 'integer', nullable: false },
          { name: 'category', type: 'varchar', nullable: false },
          { name: 'images', type: 'text[]', nullable: true },
          { name: 'main_image', type: 'varchar', nullable: true },
          { name: 'pdf_url', type: 'varchar', nullable: true },
          { name: 'featured', type: 'boolean', nullable: true, defaultValue: 'false' },
          { name: 'downloads', type: 'integer', nullable: true, defaultValue: '0' },
          { name: 'rating', type: 'decimal', nullable: true, defaultValue: '0.0' },
          { name: 'status', type: 'varchar', nullable: true, defaultValue: 'active' },
          { name: 'created_date', type: 'timestamp', nullable: true }
        ],
        lastModified: new Date().toISOString().split('T')[0],
        size: '0 KB'
      },
      {
        name: 'categories',
        description: 'Product categories and their metadata',
        rowCount: 0,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'varchar', nullable: false },
          { name: 'slug', type: 'varchar', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'image', type: 'varchar', nullable: true },
          { name: 'count', type: 'integer', nullable: true, defaultValue: '0' },
          { name: 'created_at', type: 'timestamp', nullable: true }
        ],
        lastModified: new Date().toISOString().split('T')[0],
        size: '0 KB'
      },
      {
        name: 'orders',
        description: 'Customer orders and payment information',
        rowCount: 0,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'customer_id', type: 'uuid', nullable: true, isForeignKey: true },
          { name: 'customer_name', type: 'varchar', nullable: false },
          { name: 'customer_email', type: 'varchar', nullable: false },
          { name: 'total_amount', type: 'integer', nullable: false },
          { name: 'status', type: 'varchar', nullable: true, defaultValue: 'pending' },
          { name: 'payment_method', type: 'varchar', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: true }
        ],
        lastModified: new Date().toISOString().split('T')[0],
        size: '0 KB'
      },
      {
        name: 'reviews',
        description: 'Product reviews and ratings from customers',
        rowCount: 0,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'product_id', type: 'uuid', nullable: false, isForeignKey: true },
          { name: 'user_id', type: 'uuid', nullable: true, isForeignKey: true },
          { name: 'user_name', type: 'varchar', nullable: false },
          { name: 'rating', type: 'integer', nullable: false },
          { name: 'comment', type: 'text', nullable: true },
          { name: 'date', type: 'timestamp', nullable: true },
          { name: 'helpful', type: 'integer', nullable: true, defaultValue: '0' },
          { name: 'verified', type: 'boolean', nullable: true, defaultValue: 'false' }
        ],
        lastModified: new Date().toISOString().split('T')[0],
        size: '0 KB'
      },
      {
        name: 'tasks',
        description: 'Task management system for project tracking',
        rowCount: 0,
        columns: [
          { name: 'id', type: 'bigserial', nullable: false, isPrimaryKey: true },
          { name: 'title', type: 'varchar', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'priority', type: 'varchar', nullable: false, defaultValue: 'normal' },
          { name: 'status', type: 'varchar', nullable: false, defaultValue: 'todo' },
          { name: 'due_date', type: 'date', nullable: true },
          { name: 'assignee', type: 'varchar', nullable: true },
          { name: 'progress', type: 'integer', nullable: true, defaultValue: '0' },
          { name: 'created_at', type: 'timestamp', nullable: true }
        ],
        lastModified: new Date().toISOString().split('T')[0],
        size: '0 KB'
      }
    ];
  }

  /**
   * Default column information when RPC fails
   */
  private static getDefaultColumns(tableName: string): ColumnInfo[] {
    const defaultTables = this.getDefaultTables();
    const table = defaultTables.find(t => t.name === tableName);
    return table?.columns || [];
  }
}
