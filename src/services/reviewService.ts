import { supabase } from './supabaseService';
import { Review } from '../types';

export interface CreateReviewData {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[]; // Array of image URLs
  orderId?: string; // ID of the order this review is for
  orderItemId?: string; // ID of the specific order item this review is for
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(reviewData: CreateReviewData): Promise<Review | null> {
    try {
      // First, verify that the product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', reviewData.productId)
        .single();

      if (productError || !product) {
        console.error('Product not found:', reviewData.productId);
        throw new Error('Product not found');
      }

      // Check if user already has a review for this specific order item
      if (reviewData.orderItemId) {
        const existingReview = await this.getUserOrderItemReview(reviewData.orderItemId, reviewData.userId);
        if (existingReview) {
          throw new Error('You have already reviewed this order item');
        }
      } else {
        // Fallback to product-based review check if no order item ID
        const existingReview = await this.getUserReview(reviewData.productId, reviewData.userId);
        if (existingReview) {
          throw new Error('You have already reviewed this product');
        }
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.productId,
          user_id: reviewData.userId,
          user_name: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: reviewData.images || [],
          order_id: reviewData.orderId || null,
          order_item_id: reviewData.orderItemId || null,
          status: 'active',
          verified: true // Mark as verified since user just purchased
        }])
        .select()
        .single();

      if (error) throw error;

      // Update product rating
      await this.updateProductRating(reviewData.productId);

      return {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        userName: data.user_name,
        rating: data.rating,
        comment: data.comment,
        date: data.date,
        helpful: data.helpful,
        verified: data.verified,
        status: data.status,
        images: data.images || [],
        orderId: data.order_id,
        orderItemId: data.order_item_id
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error; // Re-throw to let the component handle the error
    }
  }

  /**
   * Get reviews for a specific product
   */
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'active')
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        helpful: review.helpful,
        verified: review.verified,
        status: review.status,
        images: review.images || [],
        orderId: review.order_id,
        orderItemId: review.order_item_id
      }));
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  /**
   * Get all reviews from the database
   */
  static async getAllReviews(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        helpful: review.helpful,
        verified: review.verified,
        status: review.status,
        images: review.images || [],
        orderId: review.order_id,
        orderItemId: review.order_item_id
      }));
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  }

  /**
   * Get user's review for a specific product
   */
  static async getUserReview(productId: string, userId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      if (!data) return null;

      return {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        userName: data.user_name,
        rating: data.rating,
        comment: data.comment,
        date: data.date,
        helpful: data.helpful,
        verified: data.verified,
        status: data.status,
        images: data.images || [],
        orderId: data.order_id,
        orderItemId: data.order_item_id
      };
    } catch (error) {
      console.error('Error fetching user review:', error);
      return null;
    }
  }

  /**
   * Get user's review for a specific order item
   */
  static async getUserOrderItemReview(orderItemId: string, userId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_item_id', orderItemId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      if (!data) return null;

      return {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        userName: data.user_name,
        rating: data.rating,
        comment: data.comment,
        date: data.date,
        helpful: data.helpful,
        verified: data.verified,
        status: data.status,
        images: data.images || [],
        orderId: data.order_id,
        orderItemId: data.order_item_id
      };
    } catch (error) {
      console.error('Error fetching user order item review:', error);
      return null;
    }
  }

  /**
   * Get all reviews by a specific user
   */
  static async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        helpful: review.helpful,
        verified: review.verified,
        status: review.status,
        images: review.images || [],
        orderId: review.order_id,
        orderItemId: review.order_item_id
      }));
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  /**
   * Update an existing review
   */
  static async updateReview(reviewId: string, updateData: UpdateReviewData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      // Get the review to update product rating
      const { data: review } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .single();

      if (review) {
        await this.updateProductRating(review.product_id);
      }

      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<boolean> {
    try {
      // Get the review to update product rating after deletion
      const { data: review } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .single();

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      if (review) {
        await this.updateProductRating(review.product_id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  /**
   * Update review status
   */
  static async updateReviewStatus(reviewId: string, status: 'active' | 'pending' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating review status:', error);
      return false;
    }
  }

  /**
   * Update product rating based on all reviews
   */
  static async updateProductRating(productId: string): Promise<boolean> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'active');

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        // No reviews, set rating to 0
        await supabase
          .from('products')
          .update({ rating: 0 })
          .eq('id', productId);
        return true;
      }

      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      const { error: updateError } = await supabase
        .from('products')
        .update({ rating: Math.round(averageRating * 10) / 10 }) // Round to 1 decimal place
        .eq('id', productId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error updating product rating:', error);
      return false;
    }
  }

  /**
   * Check if user can review a product (has purchased it)
   */
  static async canUserReview(productId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', userId)
        .eq('status', 'completed')
        .contains('items', [{ product_id: productId }]);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if user can review:', error);
      return false;
    }
  }

  /**
   * Get review statistics for a product
   */
  static async getReviewStats(productId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'active');

      if (error) throw error;

      const totalReviews = data.length;
      const averageRating = totalReviews > 0 
        ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }
}

export default ReviewService;
