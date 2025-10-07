import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "General Questions",
      questions: [
        {
          question: "What is Lurevi?",
          answer: "Lurevi is an online marketplace specializing in digital art and clothing. We offer a curated collection of artwork from talented artists and high-quality clothing items."
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is easy! Click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address. You'll be ready to start shopping in minutes."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we take security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent."
        },
        {
          question: "Do you offer customer support?",
          answer: "Absolutely! Our customer support team is available Monday through Friday, 9 AM to 6 PM IST. You can reach us via email, phone, or through our contact form."
        }
      ]
    },
    {
      title: "Orders & Shopping",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Browse our products, add items to your cart, and proceed to checkout. Enter your shipping information, select a payment method, and confirm your order. You'll receive a confirmation email with your order details."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 1 hour of placing it. After that, you'll need to contact our support team. For shipped items, you may need to return them following our return policy."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Credit Card, UPI, and Debit Card. All transactions are secure and encrypted."
        }
      ]
    },
    {
      title: "Digital Art",
      questions: [
        {
          question: "What file formats do you provide for digital art?",
          answer: "Digital art downloads are typically provided in high-resolution JPEG and PNG formats. Some pieces may also be available in PDF format for print purposes."
        },
        {
          question: "Can I print the digital art I purchase?",
          answer: "Yes! Most digital art purchases include personal use rights for printing. However, commercial use may require additional licensing. Check the specific terms for each artwork."
        },
        {
          question: "How do I download my digital art?",
          answer: "After purchase, you'll receive an email with download links. You can also access your downloads by logging into your account and visiting the 'Downloads' section."
        },
        {
          question: "What's the resolution of the digital art?",
          answer: "Our digital art is provided in high resolution suitable for both screen viewing and printing. Most pieces are at least 300 DPI for print quality."
        }
      ]
    },
    {
      title: "Clothing & Apparel",
      questions: [
        {
          question: "What sizes are available for clothing?",
          answer: "We offer sizes from XS to XXXL for most clothing items. Each product page includes detailed size charts to help you find the perfect fit."
        },
        {
          question: "How do I know what size to order?",
          answer: "Check our size charts on each product page. We recommend measuring yourself and comparing with our size guide. If you're between sizes, we suggest sizing up."
        },
        {
          question: "Are your clothing items ethically made?",
          answer: "Yes, we're committed to ethical manufacturing practices. We work with suppliers who follow fair labor practices and use sustainable materials when possible."
        },
        {
          question: "Do you offer plus sizes?",
          answer: "Yes! We offer extended sizing options for many of our clothing items. Look for the 'Plus Size' filter when browsing our clothing collection."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      questions: [
        {
          question: "How much does shipping cost?",
          answer: "Shipping costs vary by location and order size. We offer free shipping on orders over Rs 5000. Check our shipping calculator at checkout for exact costs."
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days within India. Express shipping (1-2 days) is available for an additional fee. International shipping typically takes 7-14 business days."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination. Customs fees may apply and are the customer's responsibility."
        },
        {
          question: "Can I change my shipping address?",
          answer: "You can change your shipping address within 1 hour of placing your order. After that, contact our support team immediately as your order may already be in processing."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most physical items. Items must be unused, in original packaging, and with tags attached. Digital downloads are non-refundable."
        },
        {
          question: "How do I initiate a return?",
          answer: "Log into your account, go to 'My Orders', and click 'Return Item' next to the order you want to return. Follow the instructions and we'll provide a return shipping label."
        },
        {
          question: "How long do refunds take?",
          answer: "Once we receive your returned item, refunds are processed within 3-5 business days. The refund will appear on your original payment method within 7-10 business days."
        },
        {
          question: "Do you offer exchanges?",
          answer: "Yes! If you need a different size or color, you can request an exchange. The process is similar to returns, but we'll send the new item once we receive your return."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-700 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-md shadow-sm overflow-hidden">
              <h2 className="text-lg font-bold text-gray-900 p-4 bg-gray-50 border-b">
                {category.title}
              </h2>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 100 + itemIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={itemIndex} className="p-4">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                          {item.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 ml-3" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-3" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gradient-to-r from-teal-700 to-teal-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-teal-100 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact-us"
            className="inline-flex items-center px-6 py-3 bg-white text-teal-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
