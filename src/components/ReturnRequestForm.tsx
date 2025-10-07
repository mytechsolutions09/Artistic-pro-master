import React, { useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle, Package, Truck } from 'lucide-react';
import { ReturnService } from '../services/returnService';
import { useAuth } from '../contexts/AuthContext';

interface ReturnRequestFormProps {
  orderId: string;
  itemId: string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedProductType?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  orderId,
  itemId,
  productTitle,
  productImage,
  quantity,
  unitPrice,
  totalPrice,
  selectedProductType,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState('');

  const returnReasons = [
    'Defective or damaged item',
    'Wrong item received',
    'Item not as described',
    'Changed mind',
    'Size not suitable',
    'Quality not satisfactory',
    'Other'
  ];

  const checkEligibility = async () => {
    try {
      const result = await ReturnService.isEligibleForReturn(orderId, itemId);
      setEligibilityChecked(true);
      setIsEligible(result.eligible);
      setEligibilityReason(result.reason || '');
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setError('Error checking return eligibility');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for return');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get customer email from auth context
      const customerEmail = user?.email || 'guest@example.com';
      
      const result = await ReturnService.createReturnRequest({
        orderId,
        itemId,
        reason,
        customerNotes,
        requestedBy: customerEmail
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to create return request');
      }
    } catch (error) {
      console.error('Error creating return request:', error);
      setError('Failed to create return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check eligibility on component mount
  React.useEffect(() => {
    checkEligibility();
  }, []);

  if (!eligibilityChecked) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Checking eligibility...</span>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Return Not Eligible</h3>
        </div>
        <p className="text-gray-600 mb-4">{eligibilityReason}</p>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center mb-6">
        <RotateCcw className="w-6 h-6 text-teal-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Request Return</h3>
      </div>

      {/* Product Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          {productImage && (
            <img 
              src={productImage} 
              alt={productTitle}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
          <div>
            <h4 className="font-medium text-gray-900">{productTitle}</h4>
            <p className="text-sm text-gray-600">
              Quantity: {quantity} × ₹{unitPrice} = ₹{totalPrice}
            </p>
            {selectedProductType && (
              <p className="text-sm text-gray-500">
                Type: {selectedProductType}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Return Process Info */}
      <div className="bg-teal-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-teal-900 mb-2">Return Process</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
              <Package className="w-3 h-3 text-teal-600" />
            </div>
            <span className="text-teal-800">Package Items</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
              <Truck className="w-3 h-3 text-teal-600" />
            </div>
            <span className="text-teal-800">Pickup Arranged</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
              <CheckCircle className="w-3 h-3 text-teal-600" />
            </div>
            <span className="text-teal-800">Refund Processed</span>
          </div>
          <div className="text-teal-700 text-xs">
            Refund in 3-5 business days
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Return *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Select a reason</option>
            {returnReasons.map((returnReason) => (
              <option key={returnReason} value={returnReason}>
                {returnReason}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Please provide any additional details about your return request..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Return Request'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnRequestForm;
