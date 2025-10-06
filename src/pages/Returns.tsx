import React from 'react';
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle, Truck } from 'lucide-react';

const Returns: React.FC = () => {
  const returnSteps = [
    {
      step: "1",
      title: "Initiate Return",
      description: "Log into your account and go to 'My Orders' to start the return process",
      icon: <RotateCcw className="w-6 h-6" />
    },
    {
      step: "2",
      title: "Print Label",
      description: "Download and print the prepaid return shipping label we provide",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Package Items",
      description: "Securely package your items in the original packaging with all tags attached",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Ship Back",
      description: "Drop off your package at any authorized shipping location",
      icon: <Truck className="w-6 h-6" />
    },
    {
      step: "5",
      title: "Receive Refund",
      description: "Get your refund processed within 3-5 business days of receiving your return",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const returnPolicy = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "30-Day Return Window",
      description: "You have 30 days from the delivery date to initiate a return for most items."
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Original Condition Required",
      description: "Items must be unused, in original packaging, and with all tags and labels attached."
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Digital Downloads Non-Refundable",
      description: "Digital art downloads and digital products are final sale and cannot be returned."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Free Return Shipping",
      description: "We provide prepaid return shipping labels for domestic returns on qualifying items."
    }
  ];

  const returnConditions = [
    {
      category: "Clothing & Apparel",
      conditions: [
        "Must be unworn and unwashed",
        "All original tags and labels must be attached",
        "Items must be in original packaging",
        "No signs of wear, stains, or damage"
      ]
    },
    {
      category: "Digital Art",
      conditions: [
        "Digital downloads are final sale",
        "No returns or refunds for digital products",
        "All sales are final once downloaded"
      ]
    },
    {
      category: "Accessories",
      conditions: [
        "Must be in original condition",
        "Original packaging required",
        "No signs of use or wear",
        "All components must be included"
      ]
    }
  ];

  const refundInfo = [
    {
      method: "Credit Card",
      time: "3-5 business days",
      description: "Refunds will appear on your original payment method"
    },
    {
      method: "PayPal",
      time: "1-3 business days",
      description: "Refunds will be processed back to your PayPal account"
    },
    {
      method: "Store Credit",
      time: "Immediate",
      description: "Instant store credit for future purchases"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <RotateCcw className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We want you to be completely satisfied with your purchase. Our easy return process makes it simple to return items that don't meet your expectations.
          </p>
        </div>

        {/* Return Policy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {returnPolicy.map((policy, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="text-green-600">{policy.icon}</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{policy.title}</h3>
              <p className="text-gray-600 text-sm">{policy.description}</p>
            </div>
          ))}
        </div>

        {/* How to Return */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">How to Return an Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="text-green-600">{step.icon}</div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {returnConditions.map((condition, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{condition.category}</h3>
              <ul className="space-y-3">
                {condition.conditions.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Refund Information */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {refundInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.method}</h3>
                <p className="text-green-600 font-medium mb-2">{info.time}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Returns FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long do I have to return an item?</h3>
              <p className="text-gray-600">You have 30 days from the delivery date to initiate a return for most physical items. Digital downloads are final sale.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do I have to pay for return shipping?</h3>
              <p className="text-gray-600">We provide free return shipping for domestic returns on qualifying items. You'll receive a prepaid return label.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does it take to process my refund?</h3>
              <p className="text-gray-600">Once we receive your return, refunds are processed within 3-5 business days and appear on your original payment method within 7-10 business days.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I exchange an item instead of returning it?</h3>
              <p className="text-gray-600">Yes! You can request an exchange for a different size or color. The process is similar to returns, but we'll send the new item once we receive your return.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my item arrives damaged?</h3>
              <p className="text-gray-600">If your item arrives damaged, contact us immediately with photos. We'll arrange for a replacement or full refund at no cost to you.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with Returns?</h2>
          <p className="text-green-100 mb-6">
            Have questions about returning an item or need assistance with the return process?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/help-center"
              className="inline-flex items-center px-6 py-3 bg-green-800 text-white font-medium rounded-lg hover:bg-green-900 transition-colors"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
