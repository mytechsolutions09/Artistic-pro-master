import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  DollarSign, 
  Percent,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { CouponService, Coupon } from '../../../services/couponService';

// Using Coupon interface from couponService

const CouponSettings: React.FC = () => {
  const { formatUIPrice, currencySettings } = useCurrency();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    discount: 0,
    min_amount: 0,
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const coupons = await CouponService.getAllCoupons();
      
      // Auto-deactivate expired coupons
      const processedCoupons = coupons.map(coupon => ({
        ...coupon,
        is_active: coupon.is_active && !isExpired(coupon.valid_until)
      }));
      
      // Update expired coupons in database
      const expiredCoupons = processedCoupons.filter(c => !c.is_active && coupons.find(orig => orig.id === c.id)?.is_active);
      for (const coupon of expiredCoupons) {
        try {
          await CouponService.toggleCouponStatus(coupon.id, false);
        } catch (error) {
          console.error('Failed to deactivate expired coupon:', error);
        }
      }
      
      setCoupons(processedCoupons);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if coupon code already exists
      const codeExists = await CouponService.checkCouponCodeExists(
        formData.code, 
        editingCoupon?.id
      );
      
      if (codeExists) {
        alert('Coupon code already exists. Please use a different code.');
        setLoading(false);
        return;
      }

      const couponData = {
        code: formData.code,
        description: formData.description,
        type: formData.type,
        discount: formData.discount,
        min_amount: formData.min_amount,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        is_active: formData.is_active
      };

      if (editingCoupon) {
        // Update existing coupon
        const updatedCoupon = await CouponService.updateCoupon(editingCoupon.id, couponData);
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? updatedCoupon : c));
      } else {
        // Create new coupon
        const newCoupon = await CouponService.createCoupon(couponData);
        setCoupons(prev => [...prev, newCoupon]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save coupon:', error);
      alert('Failed to save coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      discount: 0,
      min_amount: 0,
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      discount: coupon.discount,
      min_amount: coupon.min_amount,
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from,
      valid_until: coupon.valid_until,
      is_active: coupon.is_active
    });
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await CouponService.deleteCoupon(couponId);
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      } catch (error) {
        console.error('Failed to delete coupon:', error);
        alert('Failed to delete coupon. Please try again.');
      }
    }
  };

  const toggleActive = async (couponId: string) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) return;

      // Don't allow activating expired coupons
      if (!coupon.is_active && isExpired(coupon.valid_until)) {
        alert('Cannot activate expired coupons. Please update the validity date first.');
        return;
      }

      const newStatus = !coupon.is_active;
      const updatedCoupon = await CouponService.toggleCouponStatus(couponId, newStatus);
      setCoupons(prev => prev.map(c => c.id === couponId ? updatedCoupon : c));
    } catch (error) {
      console.error('Failed to toggle coupon status:', error);
      alert('Failed to update coupon status. Please try again.');
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.max_uses) return 0;
    return (coupon.used_count / coupon.max_uses) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Create Coupon Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="e.g., WELCOME10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Coupon description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {formData.type === 'percentage' ? '%' : currencySettings.defaultCurrency}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Amount *
                </label>
                <input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Active Coupons</h3>
          <p className="text-gray-600 text-sm mt-1">{coupons.length} total coupons</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading coupons...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-pink-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.type === 'percentage' ? (
                          <span className="flex items-center space-x-1">
                            <Percent className="w-3 h-3" />
                            <span>{coupon.discount}%</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatUIPrice(coupon.discount, 'INR')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Min: {formatUIPrice(coupon.min_amount, 'INR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.used_count} / {coupon.max_uses || '∞'}
                      </div>
                      {coupon.max_uses && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-pink-500 h-2 rounded-full"
                            style={{ width: `${Math.min(getUsagePercentage(coupon), 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                      </div>
                      {isExpired(coupon.valid_until) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(coupon.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponSettings;
