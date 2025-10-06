import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MessageSquare, Phone, Search, BookOpen, FileText, Users } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const helpCategories = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Getting Started",
      description: "Learn how to use our platform",
      topics: ["Account Setup", "First Purchase", "Profile Settings"]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Orders & Shipping",
      description: "Everything about your orders",
      topics: ["Track Your Order", "Shipping Options", "Delivery Times"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Account & Security",
      description: "Manage your account safely",
      topics: ["Password Reset", "Profile Updates", "Privacy Settings"]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Support",
      description: "Get help when you need it",
      topics: ["Contact Support", "Live Chat", "Report Issues"]
    }
  ];

  const popularQuestions = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and checking the order status, or using the tracking number sent to your email.",
      category: "Orders"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and digital wallets. All transactions are secure and encrypted.",
      category: "Payment"
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. International shipping may take 7-14 days.",
      category: "Shipping"
    },
    {
      question: "Can I return my purchase?",
      answer: "Yes, we offer a 30-day return policy for most items. Please check our Returns page for specific conditions.",
      category: "Returns"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 rounded-full">
              <HelpCircle className="w-12 h-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions and get the support you need. We're here to help!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics, questions, or issues..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {helpCategories.map((category, index) => (
            <Link
              key={index}
              to={`/help/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-pink-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-1">
                {category.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-sm text-gray-500">• {topic}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Questions</h2>
          <div className="space-y-6">
            {popularQuestions.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600 mb-2">{item.answer}</p>
                    <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-pink-100 mb-6">
            Can't find what you're looking for? Our support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-white text-pink-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center px-6 py-3 bg-pink-800 text-white font-medium rounded-lg hover:bg-pink-900 transition-colors"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
