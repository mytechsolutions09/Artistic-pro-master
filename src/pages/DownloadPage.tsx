import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Download, FileText, Image as ImageIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { CompleteOrderService } from '../services/completeOrderService';
import { DownloadService } from '../services/downloadService';
import { useCurrency } from '../contexts/CurrencyContext';

const DownloadPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currencySettings } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [fileSize, setFileSize] = useState<{ pdf?: number; image?: number }>({});

  const token = searchParams.get('token');
  const orderId = searchParams.get('order');

  // Format date based on currency
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (currencySettings.defaultCurrency === 'INR') {
      // DDMMYYYY format for INR
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      // Default format for other currencies
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    if (!productId || !token || !orderId) {
      setError('Invalid download link. Missing required parameters.');
      setLoading(false);
      return;
    }

    validateAndLoadDownload();
  }, [productId, token, orderId]);

  const validateAndLoadDownload = async () => {
    try {
      // Validate the download token and order
      const orderResult = await CompleteOrderService.getOrderById(orderId!);
      
      if (!orderResult.success || !orderResult.order) {
        setError('Invalid order or download link has expired.');
        setLoading(false);
        return;
      }

      const orderData = orderResult.order;
      
      // Check if the product is in this order
      const orderItem = orderData.order_items.find((item: any) => item.product_id === productId);
      
      if (!orderItem) {
        setError('This product is not part of your order.');
        setLoading(false);
        return;
      }

      // Check if order is completed
      if (orderData.status !== 'completed') {
        setError('This order is not yet completed.');
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setProduct(orderItem.products);
      setLoading(false);

    } catch (error) {
      console.error('Error validating download:', error);
      setError('Failed to validate download link. Please try again.');
      setLoading(false);
    }
  };

  const handleDownload = async (type: 'pdf' | 'image') => {
    const isDownloading = type === 'pdf' ? downloadingPdf : downloadingImage;
    if (!product || isDownloading) return;

    // Set the appropriate loading state
    if (type === 'pdf') {
      setDownloadingPdf(true);
    } else {
      setDownloadingImage(true);
    }
    
    try {
      let downloadUrl = '';
      let filename = '';
      let bucketName = '';

      if (type === 'pdf' && product.pdf_url) {
        downloadUrl = product.pdf_url;
        filename = `${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        bucketName = 'product-pdfs';
      } else if (type === 'image' && product.main_image) {
        downloadUrl = product.main_image;
        filename = `${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        bucketName = 'main-images';
      }

      if (downloadUrl && bucketName) {
        // Extract file path from URL
        const urlParts = downloadUrl.split('/');
        const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
        
        // Get file size for validation
        const size = await DownloadService.getFileSize(bucketName, filePath);
        const sizeValidation = DownloadService.validateDownloadSize(size, 100); // 100MB limit
        
        if (!sizeValidation.isValid) {
          setError(sizeValidation.error || 'File too large for download');
          return;
        }

        // Update file size state
        setFileSize(prev => ({
          ...prev,
          [type]: size
        }));

        // Download with progress tracking
        const result = await DownloadService.downloadFile(
          downloadUrl,
          filename,
          (progress) => setDownloadProgress(progress)
        );

        if (result.success) {
          // Show success message
          setTimeout(() => {
            if (type === 'pdf') {
              setDownloadingPdf(false);
            } else {
              setDownloadingImage(false);
            }
            setDownloadProgress(0);
          }, 1000);
        } else {
          setError(result.error || `Failed to download ${type.toUpperCase()} file`);
        }
      } else {
        setError(`No ${type.toUpperCase()} file available for this product.`);
        if (type === 'pdf') {
          setDownloadingPdf(false);
        } else {
          setDownloadingImage(false);
        }
      }

    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file. Please try again.');
      if (type === 'pdf') {
        setDownloadingPdf(false);
      } else {
        setDownloadingImage(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating download link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">Download Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="mb-4">
              <h2 className="text-l font-bold text-gray-800">YOUR AWESOME PRODUCT</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2"></h3>
                <p className="text-gray-600">{product?.title}</p>
                <p className="text-sm text-gray-500 mt-1">Order Date: {order?.created_at ? formatDate(order.created_at) : ''}</p>
              </div>

              {product?.main_image && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Preview</h3>
                  <img
                    src={product.main_image}
                    alt={product.title}
                    className="w-full h-80 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Download Options */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Download Files</h2>
            
            <div className="space-y-3">
              {/* PDF Download */}
              {product?.pdf_url && (
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">Product PDF</h3>
                      <p className="text-xs text-gray-500">
                        High-resolution digital file
                        {fileSize.pdf && ` (${DownloadService.formatFileSize(fileSize.pdf)})`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Download Progress */}
                  {downloadingPdf && downloadProgress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Downloading...</span>
                        <span>{Math.round(downloadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloadingPdf}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-pink-300 hover:bg-pink-400 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPdf ? 'Downloading...' : 'Download PDF'}</span>
                  </button>
                </div>
              )}

              {/* Main Image Download */}
              {product?.main_image && (
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">Main Image</h3>
                      <p className="text-xs text-gray-500">
                        High-quality image file
                        {fileSize.image && ` (${DownloadService.formatFileSize(fileSize.image)})`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Download Progress */}
                  {downloadingImage && downloadProgress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Downloading...</span>
                        <span>{Math.round(downloadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDownload('image')}
                    disabled={downloadingImage}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingImage ? 'Downloading...' : 'Download Image'}</span>
                  </button>
                </div>
              )}

              {/* No files available */}
              {!product?.pdf_url && !product?.main_image && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No downloadable files available for this product.</p>
                </div>
              )}
            </div>

            {/* Important Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-1 text-sm">📋 Important Information</h3>
              <ul className="text-xs text-blue-700 space-y-0.5">
                <li>• Download links are valid forever</li>
                <li>• Files can be used for both personal and commercial purposes</li>
                <li>• Keep this page bookmarked for future downloads</li>
                <li>• Contact support if you have any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
