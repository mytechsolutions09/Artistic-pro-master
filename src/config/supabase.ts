// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

// Development mode settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Localhost configuration
export const localhostConfig = {
  host: process.env.NEXT_PUBLIC_DEV_SERVER_HOST || 'localhost',
  port: parseInt(process.env.NEXT_PUBLIC_DEV_SERVER_PORT || '3000'),
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000/admin'
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



