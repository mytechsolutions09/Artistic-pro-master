import { supabase } from './supabaseService';

export interface DownloadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export class DownloadService {
  /**
   * Get direct download URL for a file without any transformations
   * This ensures the original file size is maintained and reduces egress costs
   */
  static async getDirectDownloadUrl(
    bucketName: string,
    filePath: string,
    filename?: string
  ): Promise<DownloadResult> {
    try {
      // Get the public URL directly without any transformations
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!publicUrl) {
        return {
          success: false,
          error: 'Failed to generate download URL'
        };
      }

      // Get file metadata to determine size
      const { data: fileData, error: metadataError } = await supabase.storage
        .from(bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      let fileSize = 0;
      if (!metadataError && fileData && fileData.length > 0) {
        fileSize = fileData[0].metadata?.size || 0;
      }

      return {
        success: true,
        url: publicUrl,
        filename: filename || filePath.split('/').pop() || 'download',
        size: fileSize
      };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Download a file directly without any server-side processing
   * This method fetches the original file and triggers a browser download
   */
  static async downloadFile(
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<DownloadResult> {
    try {
      // Fetch the file with progress tracking
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      // Create a readable stream to track progress
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          onProgress((loaded / total) * 100);
        }
      }

      // Combine all chunks into a single blob
      const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' });
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);

      return {
        success: true,
        url: blobUrl,
        filename,
        size: blob.size
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  /**
   * Get file size information without downloading the entire file
   */
  static async getFileSize(bucketName: string, filePath: string): Promise<number> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return 0;
      }

      return data[0].metadata?.size || 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Format file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate if file size is within acceptable limits for download
   */
  static validateDownloadSize(size: number, maxSizeMB: number = 100): {
    isValid: boolean;
    error?: string;
  } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size (${this.formatFileSize(size)}) exceeds maximum allowed size (${maxSizeMB}MB)`
      };
    }
    
    return { isValid: true };
  }
}
