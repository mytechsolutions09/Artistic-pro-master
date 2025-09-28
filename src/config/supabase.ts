// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
};

// Development mode settings
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Localhost configuration
export const localhostConfig = {
  host: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DEV_SERVER_PORT || '5173'),
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',
  adminUrl: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173/admin'
};

// API endpoints and configurations
export const apiConfig = {
  timeout: 10000,
  retries: 3,
  baseURL: isDevelopment ? localhostConfig.apiUrl : supabaseConfig.url
};

// Database table names
export const tables = {
  tasks: 'tasks',
  taskCategories: 'task_categories',
  teamMembers: 'team_members',
  taskLabels: 'task_labels',
  taskTemplates: 'task_templates',
  taskComments: 'task_comments',
  taskAttachments: 'task_attachments'
} as const;

// Real-time channels
export const channels = {
  tasks: 'tasks_changes',
  taskStats: 'task_stats_changes',
  users: 'users_changes'
} as const;

export default {
  supabaseConfig,
  localhostConfig,
  isDevelopment,
  isProduction,
  apiConfig,
  tables,
  channels
};
