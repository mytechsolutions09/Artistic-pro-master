import React, { useState } from 'react';
import { ImageUploadService } from '../../services/imageUploadService';
import { supabase } from '../../services/supabaseService';

export const StorageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBucketConnection = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing storage bucket connection...');
      
      const result = await ImageUploadService.testBucketConnection();
      
      if (result.success) {
        addResult('✅ Bucket connection successful!');
        addResult(`📦 Bucket info: ${JSON.stringify(result.bucketInfo, null, 2)}`);
      } else {
        addResult(`❌ Bucket connection failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Error during bucket test: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testImageUrl = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing image URL accessibility...');
      
      // Test the specific URL from your debug info
      const testUrl = 'https://varduayfdqivaofymfov.supabase.co/storage/v1/object/public/category-images/public/1756638415999-my0u4elqxy.png';
      
      addResult(`📸 Testing URL: ${testUrl}`);
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (response.ok) {
        addResult('✅ Image URL is accessible!');
        addResult(`📊 Response status: ${response.status}`);
        addResult(`📏 Content length: ${response.headers.get('content-length') || 'Unknown'}`);
      } else {
        addResult(`❌ Image URL not accessible: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`💥 Error testing image URL: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testCategoryImages = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing category images from database...');
      
      // Import and test category service
      const { categoryService } = await import('../../services/categoryService');
      const categories = await categoryService.getAllCategories();
      
      addResult(`📊 Found ${categories.length} categories`);
      
      categories.forEach((cat, index) => {
        if (cat.image) {
          addResult(`🖼️ Category ${index + 1}: ${cat.name} - Image: ${cat.image}`);
        } else {
          addResult(`❌ Category ${index + 1}: ${cat.name} - No image`);
        }
      });
      
    } catch (error) {
      addResult(`💥 Error testing category images: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Image Upload Debug</h3>
      
      <div className="space-y-3 mb-6">
        <button
          onClick={testBucketConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Bucket Connection'}
        </button>
        
        <button
          onClick={testImageUrl}
          disabled={isTesting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          {isTesting ? 'Testing...' : 'Test Image URL'}
        </button>
        
        <button
          onClick={testCategoryImages}
          disabled={isTesting}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 ml-2"
        >
          {isTesting ? 'Testing...' : 'Test Category Images'}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
        <div className="space-y-1 text-sm">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-gray-700 font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
