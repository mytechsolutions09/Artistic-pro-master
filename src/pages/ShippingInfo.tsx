import React from 'react';
import { Truck, Clock, Globe, Package, Shield, CheckCircle, MapPin } from 'lucide-react';

const ShippingInfo: React.FC = () => {
  const shippingOptions = [
    {
      icon: <Truck className="w-8 h-8" />,
      name: "Standard Shipping",
      time: "3-5 business days",
      cost: "Free on orders over Rs 5000, otherwise Rs 599",
      description: "Reliable delivery to your doorstep",
        features: ["Tracking included", "Signature required for orders over Rs 15000", "Insurance included"]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      name: "Express Shipping",
      time: "1-2 business days",
      cost: "Rs 1299",
      description: "Fast delivery for urgent needs",
      features: ["Priority handling", "Tracking included", "Delivery confirmation"]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      name: "International Shipping",
      time: "7-14 business days",
      cost: "Starting at Rs 1599",
      description: "Worldwide delivery available",
        features: ["Customs documentation", "Tracking included", "Insurance up to Rs 35000"]
    }
  ];

  const shippingZones = [
    {
      zone: "Zone 1 - Major Indian Cities",
      states: ["Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata"],
      time: "3-5 business days",
      cost: "Free on orders Rs 5000+, Rs 599 otherwise"
    },
    {
      zone: "Zone 2 - Tier 2 Cities",
      states: ["Ahmedabad, Surat, Jaipur, Lucknow, Kanpur, Nagpur, Indore"],
      time: "5-7 business days",
      cost: "Free on orders Rs 7000+, Rs 899 otherwise"
    },
    {
      zone: "Zone 3 - Tier 3 Cities",
      states: ["Other Indian cities and towns"],
      time: "7-10 business days",
      cost: "Rs 999"
    },
    {
      zone: "Zone 4 - Asia Pacific",
      states: ["Singapore, UAE, Australia, Japan, South Korea"],
      time: "10-14 business days",
      cost: "Rs 1599"
    },
    {
      zone: "Zone 5 - Rest of World",
      states: ["USA, Canada, Europe, Africa, South America"],
      time: "12-21 business days",
      cost: "Rs 1999"
    }
  ];

  const importantNotes = [
    {
      icon: <Package className="w-6 h-6" />,
      title: "Processing Time",
      description: "All orders are processed within 1-2 business days. Orders placed after 2 PM EST will be processed the next business day."
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Truck className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our shipping options, delivery times, and international shipping.
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {shippingOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="text-blue-600 mb-4">{option.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{option.name}</h3>
              <p className="text-blue-600 font-semibold mb-2">{option.time}</p>
              <p className="text-gray-900 font-medium mb-3">{option.cost}</p>
              <p className="text-gray-600 mb-4">{option.description}</p>
              <ul className="space-y-2">
                {option.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Shipping Zones */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Zones & Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Zone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Delivery Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((zone, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{zone.zone}</td>
                    <td className="py-3 px-4 text-gray-600">{zone.states}</td>
                    <td className="py-3 px-4 text-gray-600">{zone.time}</td>
                    <td className="py-3 px-4 text-gray-600">{zone.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {importantNotes.map((note, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <div className="text-blue-600">{note.icon}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                  <p className="text-gray-600">{note.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">When will my order ship?</h3>
              <p className="text-gray-600">Orders are typically processed within 1-2 business days and shipped the same day they're processed. You'll receive a shipping confirmation email with tracking information.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my shipping address?</h3>
              <p className="text-gray-600">You can change your shipping address within 1 hour of placing your order by contacting our support team. After that, changes may not be possible if the order is already in processing.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my package is lost or damaged?</h3>
              <p className="text-gray-600">All packages are insured. If your package is lost or damaged during transit, contact us immediately and we'll work with the shipping carrier to resolve the issue or send a replacement.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you ship to PO Boxes?</h3>
              <p className="text-gray-600">Yes, we ship to PO Boxes for domestic orders. However, some express shipping options may not be available for PO Box addresses.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with Shipping?</h2>
          <p className="text-blue-100 mb-6">
            Have questions about your order or shipping options? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/help-center"
              className="inline-flex items-center px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
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
