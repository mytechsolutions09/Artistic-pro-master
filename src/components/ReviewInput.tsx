import React, { useState, useRef } from 'react';
import { Star, Send, X, Camera, Image as ImageIcon, Upload } from 'lucide-react';
import { ReviewService, CreateReviewData } from '../services/reviewService';
import { ImageUploadService } from '../services/imageUploadService';

interface ReviewInputProps {
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  orderId?: string; // ID of the order this review is for
  orderItemId?: string; // ID of the specific order item this review is for
  onReviewSubmitted?: (review: any) => void;
  onClose?: () => void;
  className?: string;
}

const ReviewInput: React.FC<ReviewInputProps> = ({
  productId,
  productTitle,
  userId,
  userName,
  orderId,
  orderItemId,
  onReviewSubmitted,
  onClose,
  className = ''
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }
        
        const result = await ImageUploadService.uploadReviewImage(file, userId);
        if (!result.success || !result.url) {
          throw new Error(result.error || 'Upload failed');
        }
        return result.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error: any) {
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      alert('Please write at least 10 characters for your review');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReviewData = {
        productId,
        userId,
        userName,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
        orderId: orderId,
        orderItemId: orderItemId
      };

      const review = await ReviewService.createReview(reviewData);
      
      if (review) {
        setIsSubmitted(true);
        onReviewSubmitted?.(review);
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 text-center ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-500 fill-current" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Thank you for your review!</h3>
        <p className="text-green-600">Your review has been submitted and will help other customers.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Rate Your Purchase</h3>
          <p className="text-sm text-gray-600">How was your experience with "{productTitle}"?</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && (
                <>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this artwork. What did you like about it? How was the quality? Would you recommend it to others?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            required
            minLength={10}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              Minimum 10 characters
            </span>
            <span className="text-xs text-gray-500">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            {/* Upload Button */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages || images.length >= 5}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingImages ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                ) : (
                  <Camera className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600">
                  {uploadingImages ? 'Uploading...' : 'Add Photos'}
                </span>
              </button>
              <span className="text-xs text-gray-500">
                {images.length}/5 photos • Max 5MB each
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="flex items-center space-x-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewInput;
