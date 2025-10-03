// Simple test file to verify Supabase client
import { supabase } from './supabaseService';

export async function testSupabaseConnection() {
  try {



    
    // Test a simple query
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      return false;
    }
    

    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

// Test storage
export async function testStorageAccess() {
  try {

    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage access error:', error);
      return false;
    }
    

    return true;
  } catch (err) {
    console.error('Storage access failed:', err);
    return false;
  }
}
