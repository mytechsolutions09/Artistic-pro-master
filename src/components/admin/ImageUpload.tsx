import React, { useState, useRef, useCallback } from 'react';
import { ImageUploadService, UploadResult } from '../../services/imageUploadService';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (result: UploadResult) => void;
  onImageRemove?: () => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
  showThumbnail?: boolean;
  disabled?: boolean;
  onUploadStart?: () => void; // Added onUploadStart prop
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  className = '',
  maxWidth = 400,
  maxHeight = 300,
  showPreview = true,
  showThumbnail = true,
  disabled = false,
  onUploadStart // Destructure onUploadStart
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Notify parent that upload has started
    onUploadStart?.();

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Thumbnail generation removed to preserve original file sizes and reduce egress costs
      // Thumbnails are now handled via CSS transforms only

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload image
      const result = await ImageUploadService.uploadImage(file, 'public');

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        onImageUpload(result);
        setError(null);
      } else {
        setError(result.error || 'Upload failed');
        setPreviewUrl(null);
        setThumbnailUrl(null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
      setThumbnailUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onImageUpload, showThumbnail, onUploadStart]); // Added onUploadStart to dependencies

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle remove image
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setThumbnailUrl(null);
    setError(null);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  // Handle click on drop zone
  const handleDropZoneClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Cleanup preview URLs
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [previewUrl, thumbnailUrl]);

  const displayImage = previewUrl || currentImageUrl;
  const hasImage = displayImage || isUploading;

  return (
    <div className={`image-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${hasImage ? 'hidden' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div className="text-gray-600">
            <p className="text-lg font-medium">
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </p>
            <p className="text-sm">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP, GIF up to 10MB
            </p>
          </div>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image preview */}
      {showPreview && hasImage && (
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-auto object-cover"
              style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                {!disabled && !isUploading && (
                  <>
                    <button
                      onClick={handleDropZoneClick}
                      className="px-3 py-2 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail preview */}
          {showThumbnail && thumbnailUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Thumbnail:</p>
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-16 h-16 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
