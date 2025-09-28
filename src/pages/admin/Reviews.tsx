import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Star,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ThumbsUp,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Review, Product } from '../../types';
import { useProducts } from '../../contexts/ProductContext';
import { ReviewService } from '../../services/reviewService';

const Reviews: React.FC = () => {
  const { allProducts } = useProducts();
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllReviews = async () => {
      setLoading(true);
      try {
        // Fetch all reviews from the database
        const reviews = await ReviewService.getAllReviews();
        setAllReviews(reviews);
        setFilteredReviews(reviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setAllReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllReviews();
  }, []);

  useEffect(() => {
    let filtered = allReviews;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allProducts.find(p => p.id === review.productId)?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Filter by product
    if (productFilter !== 'all') {
      filtered = filtered.filter(review => review.productId === productFilter);
    }

    setFilteredReviews(filtered);
  }, [searchTerm, statusFilter, productFilter, allReviews]);

  const handleStatusChange = async (reviewId: string, newStatus: 'active' | 'pending' | 'rejected') => {
    try {
      const success = await ReviewService.updateReviewStatus(reviewId, newStatus);
      if (success) {
        setAllReviews(prev => 
          prev.map(review => 
            review.id === reviewId ? { ...review, status: newStatus } : review
          )
        );
        // Update filtered reviews as well
        setFilteredReviews(prev => 
          prev.map(review => 
            review.id === reviewId ? { ...review, status: newStatus } : review
          )
        );
      } else {
        alert('Failed to update review status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update review status. Please try again.');
    }
  };

  const getProductTitle = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.title : 'Unknown Product';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Active</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">Unknown</span>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="bg-gray-50 p-3">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and moderate customer reviews across all products</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">{allReviews.length}</div>
                <div className="text-xs text-gray-500">Total Reviews</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Product Filter */}
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              >
                <option value="all">All Products</option>
                {allProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.title}</option>
                ))}
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">
                  {filteredReviews.length} of {allReviews.length} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                <span className="ml-3 text-gray-600 text-sm">Loading reviews...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <AlertCircle className="w-10 h-10 mx-auto" />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">No reviews found</h3>
                <p className="text-gray-600 text-sm">
                  {allReviews.length === 0 
                    ? "No reviews have been submitted yet." 
                    : "No reviews match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-pink-600 text-xs font-medium">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                            <p className="text-xs text-gray-600 truncate max-w-xs">
                              {review.comment}
                            </p>
                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                              <div className="flex items-center space-x-1 mt-1">
                                <ImageIcon className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {review.images.length} image{review.images.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                <ThumbsUp className="w-3 h-3 inline mr-1" />
                                {review.helpful}
                              </span>
                              {review.verified && (
                                <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-800 font-medium">
                          {getProductTitle(review.productId)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          {getRatingStars(review.rating)}
                          <span className="text-xs text-gray-600 ml-1">({review.rating})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowReviewModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(review.id, 'active')}
                                className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                title="Approve Review"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(review.id, 'rejected')}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                title="Reject Review"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {review.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(review.id, 'rejected')}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Reject Review"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {review.status === 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(review.id, 'active')}
                              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Review Detail Modal */}
          {showReviewModal && selectedReview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Review Details</h3>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 text-sm font-medium">
                          {selectedReview.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-gray-800">{selectedReview.userName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRatingStars(selectedReview.rating)}
                          <span className="text-xs text-gray-600">({selectedReview.rating}/5)</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(selectedReview.status)}
                          {selectedReview.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(selectedReview.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-800 text-sm mb-1">Product</h5>
                      <p className="text-gray-600 text-sm">{getProductTitle(selectedReview.productId)}</p>
                    </div>

                    {/* Review Comment */}
                    <div>
                      <h5 className="font-medium text-gray-800 text-sm mb-1">Review</h5>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedReview.comment}</p>
                    </div>

                    {/* Review Images */}
                    {selectedReview.images && selectedReview.images.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 text-sm mb-2">Images ({selectedReview.images.length})</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {selectedReview.images.map((image, index) => (
                            <div key={index} className="relative group cursor-pointer">
                              <img
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:border-pink-300 transition-all duration-200"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Eye className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-pink-600">{selectedReview.helpful}</div>
                        <div className="text-xs text-gray-600">Helpful Votes</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-600">
                          {selectedReview.verified ? 'Yes' : 'No'}
                        </div>
                        <div className="text-xs text-gray-600">Verified Purchase</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center space-x-3 pt-3 border-t border-gray-200">
                      {selectedReview.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              handleStatusChange(selectedReview.id, 'active');
                              setShowReviewModal(false);
                            }}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm"
                          >
                            Approve Review
                          </button>
                          <button
                            onClick={() => {
                              handleStatusChange(selectedReview.id, 'rejected');
                              setShowReviewModal(false);
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
                          >
                            Reject Review
                          </button>
                        </>
                      )}
                      
                      {selectedReview.status === 'active' && (
                        <button
                          onClick={() => {
                            handleStatusChange(selectedReview.id, 'rejected');
                            setShowReviewModal(false);
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                          Reject Review
                        </button>
                      )}
                      
                      {selectedReview.status === 'rejected' && (
                        <button
                          onClick={() => {
                            handleStatusChange(selectedReview.id, 'active');
                            setShowReviewModal(false);
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                          Approve Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reviews;
