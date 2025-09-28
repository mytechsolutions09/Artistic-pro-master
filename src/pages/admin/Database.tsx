import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import TableDataViewer from '../../components/admin/TableDataViewer';
import { DatabaseService, TableInfo, ImportResult } from '../../services/databaseService';
import { 
  Database, 
  Table, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';


const DatabaseManagement: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [databaseTables, setDatabaseTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTableDataViewer, setShowTableDataViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Load database tables on component mount
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const tables = await DatabaseService.getTables();
      setDatabaseTables(tables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = databaseTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportSQL = async () => {
    if (!selectedFile) {
      alert('Please select a SQL file to import');
      return;
    }

    setIsImporting(true);
    setImportResults([]);

    try {
      const fileContent = await selectedFile.text();
      const results = await DatabaseService.importSQL(fileContent);
      
      setImportResults(results);
      setShowImportModal(true);
      
      // Reload tables after import
      await loadTables();
    } catch (error) {
      setImportResults([{
        table: 'general',
        success: false,
        message: `Import failed: ${error}`,
        error: String(error)
      }]);
      setShowImportModal(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportTable = async (tableName: string) => {
    try {
      const csvContent = await DatabaseService.exportTableAsCSV(tableName);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export table: ${error}`);
    }
  };

  const handleViewTable = (tableName: string) => {
    setSelectedTable(tableName);
    setShowTableDataViewer(true);
  };

  const handleExportAllTables = async () => {
    try {
      setIsExportingAll(true);
      const zipBlob = await DatabaseService.exportAllTablesAsZIP();
      
      // Create and download the ZIP file
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export all tables: ${error}`);
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <AdminLayout title="Database Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Database Tables</h2>
              <p className="text-sm text-gray-500">Manage and import all database tables</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".sql"
                onChange={handleFileSelect}
                className="hidden"
                id="sql-file-input"
              />
              <label
                htmlFor="sql-file-input"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Select SQL File</span>
              </label>
              {selectedFile && (
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
              )}
            </div>
            <button
              onClick={handleImportSQL}
              disabled={isImporting || !selectedFile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isImporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isImporting ? 'Importing...' : 'Import SQL'}</span>
            </button>
            <button
              onClick={handleExportAllTables}
              disabled={isExportingAll || databaseTables.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExportingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExportingAll ? 'Exporting...' : 'Export All Tables'}</span>
            </button>
            <button
              onClick={loadTables}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading database tables...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Tables</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadTables}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Tables List */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Database Tables ({filteredTables.length})</h3>
            </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTables.map((table) => (
              <div key={table.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleTableExpansion(table.name)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedTables.has(table.name) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Table className="w-4 h-4 text-gray-600" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">{table.name}</h4>
                      <p className="text-sm text-gray-500">{table.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{table.rowCount} rows</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{table.size}</span>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleViewTable(table.name)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Table"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportTable(table.name)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Export Table"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Table Details */}
                {expandedTables.has(table.name) && (
                  <div className="mt-4 ml-8 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Table Information</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Rows: {table.rowCount}</div>
                          <div>Size: {table.size}</div>
                          <div>Last Modified: {table.lastModified}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Columns ({table.columns.length})</h5>
                        <div className="flex flex-wrap gap-1">
                          {table.columns.map((column) => (
                            <span
                              key={column.name}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              title={`${column.type}${column.nullable ? ' (nullable)' : ' (not null)'}`}
                            >
                              {column.name}
                              {column.isPrimaryKey && <span className="text-blue-600 ml-1">🔑</span>}
                              {column.isForeignKey && <span className="text-green-600 ml-1">🔗</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => handleViewTable(table.name)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                      >
                        View Data
                      </button>
                      <button
                        onClick={() => handleExportTable(table.name)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Import Results Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Import Results</h3>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {importResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{result.table}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.rowsImported && (
                          <div className="text-sm text-gray-500">
                            {result.rowsImported} rows imported
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Data Viewer */}
        {showTableDataViewer && selectedTable && (
          <TableDataViewer
            tableName={selectedTable}
            onClose={() => {
              setShowTableDataViewer(false);
              setSelectedTable(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default DatabaseManagement;
