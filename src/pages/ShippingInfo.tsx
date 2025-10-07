import React from 'react';
import { Truck, Clock, Globe, Package, Shield, CheckCircle, MapPin } from 'lucide-react';

const ShippingInfo: React.FC = () => {
  const importantNotes = [
    {
      icon: <Package className="w-6 h-6" />,
      title: "Processing Time",
      description: "All orders are processed within 1-2 business days. Orders placed after 2 PM IST will be processed the next business day."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Package Protection",
      description: "All packages are insured and protected during transit. We'll replace any items damaged during shipping at no cost to you."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Delivery Confirmation",
      description: "You'll receive tracking information and delivery confirmation via email and SMS (if provided)."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address Accuracy",
      description: "Please double-check your shipping address. We're not responsible for packages delivered to incorrect addresses."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Shipping Information</h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Important Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {importantNotes.map((note, index) => (
            <div key={index} className="bg-white rounded-md shadow-sm p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-teal-100 rounded">
                  <div className="text-teal-500">{note.icon}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-sm text-gray-600">{note.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">When will my order ship?</h3>
              <p className="text-sm text-gray-600">Orders are typically processed within 1-2 business days and shipped the same day they're processed. You'll receive a shipping confirmation email with tracking information.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Can I change my shipping address?</h3>
              <p className="text-sm text-gray-600">You can change your shipping address within 1 hour of placing your order by contacting our support team. After that, changes may not be possible if the order is already in processing.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">What if my package is lost or damaged?</h3>
              <p className="text-sm text-gray-600">All packages are insured. If your package is lost or damaged during transit, contact us immediately and we'll work with the shipping carrier to resolve the issue or send a replacement.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Do you ship to PO Boxes?</h3>
              <p className="text-sm text-gray-600">Yes, we ship to PO Boxes for domestic orders. However, some express shipping options may not be available for PO Box addresses.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-md p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-3">Need Help with Shipping?</h2>
          <p className="text-teal-100 mb-4 text-sm">
            Have questions about your order or shipping options? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contact-us"
              className="inline-flex items-center px-4 py-2 bg-white text-teal-500 font-medium rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              Contact Support
            </a>
            <a
              href="/help-center"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors text-sm"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
