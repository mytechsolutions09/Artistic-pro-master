import React, { useState } from 'react';
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle, Truck, CreditCard, DollarSign, Shield, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const Returns: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "How long do I have to return an item?",
      answer: "You have 7 days from the delivery date to initiate a return for most physical items. Digital downloads are final sale."
    },
    {
      question: "Do I have to pay for return shipping?",
      answer: "We provide free return shipping for domestic returns on qualifying items. You'll receive a prepaid return label."
    },
    {
      question: "How long does it take to process my refund?",
      answer: "Once we receive your return, refunds are processed within 3-5 business days. Credit card and debit card refunds appear within 3-5 business days, while UPI refunds may take 2-4 business days."
    },
    {
      question: "What payment methods do you refund to?",
      answer: "We process refunds to Credit Cards, UPI, and Debit Cards. You can also choose to receive store credit for immediate use on future purchases."
    },
    {
      question: "Can I exchange an item instead of returning it?",
      answer: "Yes! You can request an exchange for a different size or color. The process is similar to returns, but we'll send the new item once we receive your return."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "If your item arrives damaged, contact us immediately with photos. We'll arrange for a replacement or full refund at no cost to you."
    },
    {
      question: "How do I track my refund?",
      answer: "You'll receive email notifications when your refund is processed. Check your original payment method statement for the credit. For UPI, check your UPI app for transaction history."
    }
  ];

  const returnSteps = [
    {
      step: "1",
      title: "Initiate Return",
      description: "Log into your account and go to 'My Orders' to start the return process",
      icon: <RotateCcw className="w-6 h-6" />
    },
    {
      step: "2",
      title: "Package Items",
      description: "Securely package your items in the original packaging with all tags attached",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Pick Up",
      description: "We'll arrange for package pickup from your location",
      icon: <Truck className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Receive Refund",
      description: "Get your refund processed within 3-5 business days of receiving your return",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const returnPolicy = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "7-Day Return Window",
      description: "You have 7 days from the delivery date to initiate a return for most items."
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
      description: "Refunds will appear on your original payment method",
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      method: "UPI",
      time: "2-4 business days",
      description: "Refunds will be processed back to your UPI account",
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      method: "Debit Card",
      time: "3-5 business days",
      description: "Refunds will appear on your original debit card",
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      method: "Store Credit",
      time: "Immediate",
      description: "Instant store credit for future purchases",
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  const refundTypes = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Full Refund",
      description: "Complete refund of the purchase price for eligible returns within 7 days",
      conditions: "Original condition, unused items with tags attached"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Exchange Credit",
      description: "Store credit for exchanges or when you prefer credit over refund",
      conditions: "Can be used for any future purchase on our platform"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <RotateCcw className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Our easy return and refund process makes it simple to return items that don't meet your expectations or get your money back quickly and securely.
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
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">How to Return an Item</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="text-green-600">{step.icon}</div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {returnConditions.map((condition, index) => (
            <div key={index} className="bg-white rounded-md shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">{condition.category}</h3>
              <ul className="space-y-2">
                {condition.conditions.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Refund Types */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Types of Refunds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {refundTypes.map((type, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-100 hover:shadow-md hover:shadow-teal-200 transition-all duration-200">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-teal-100 rounded-full">
                    <div className="text-teal-600">{type.icon}</div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{type.description}</p>
                <div className="pt-3 border-t border-teal-100">
                  <p className="text-gray-600 text-xs font-medium">{type.conditions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Methods */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Refund Methods & Processing Times</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {refundInfo.map((info, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-pink-100 rounded-full">
                    <div className="text-pink-600">{info.icon}</div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{info.method}</h3>
                <p className="text-teal-600 font-medium mb-1 text-sm">{info.time}</p>
                <p className="text-gray-600 text-xs">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Returns & Refunds FAQ</h2>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <h3 className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-md p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-3">Need Help with Returns & Refunds?</h2>
          <p className="text-teal-100 mb-4 text-sm">
            Have questions about returning an item, processing refunds, or need assistance with the return process?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contact-us"
              className="inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              Contact Support
            </a>
            <a
              href="/help-center"
              className="inline-flex items-center px-4 py-2 bg-teal-800 text-white font-medium rounded-md hover:bg-teal-900 transition-colors text-sm"
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
