import React from 'react';
import { checkEnvironmentVariables, getLocalhostConfig, isLocalhost } from '../utils/envCheck';

const EnvTest: React.FC = () => {
  const envValid = checkEnvironmentVariables();
  const localhostConfig = getLocalhostConfig();
  const isLocal = isLocalhost();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Environment Test</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${envValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-medium">Environment Variables: {envValid ? 'Valid' : 'Invalid'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Supabase Configuration</h3>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">URL:</span> 
                <span className={`ml-2 ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                  {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="font-medium">Anon Key:</span> 
                <span className={`ml-2 ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="font-medium">Service Key:</span> 
                <span className={`ml-2 ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'text-green-600' : 'text-yellow-600'}`}>
                  {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Optional'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Development Info</h3>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Mode:</span> 
                <span className="ml-2 text-blue-600">{import.meta.env.MODE}</span>
              </div>
              <div>
                <span className="font-medium">Development:</span> 
                <span className={`ml-2 ${import.meta.env.DEV ? 'text-green-600' : 'text-gray-600'}`}>
                  {import.meta.env.DEV ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Localhost:</span> 
                <span className={`ml-2 ${isLocal ? 'text-green-600' : 'text-gray-600'}`}>
                  {isLocal ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isLocal && (
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Localhost Configuration</h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Host:</span> <span className="ml-2 text-blue-600">{localhostConfig.host}</span></div>
              <div><span className="font-medium">Port:</span> <span className="ml-2 text-blue-600">{localhostConfig.port}</span></div>
              <div><span className="font-medium">URL:</span> <span className="ml-2 text-blue-600">{localhostConfig.url}</span></div>
              <div><span className="font-medium">API URL:</span> <span className="ml-2 text-blue-600">{localhostConfig.apiUrl}</span></div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-3 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Environment Variables</h3>
          <div className="text-sm space-y-1">
            {Object.entries(import.meta.env)
              .filter(([key]) => key.startsWith('VITE_'))
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-600 truncate max-w-xs">
                    {value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 'Not set'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;
