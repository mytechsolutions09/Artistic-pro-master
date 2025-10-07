import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Search, BookOpen, FileText, Users } from 'lucide-react';

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
      answer: "We accept Credit Card, UPI, and Debit Card. All transactions are secure and encrypted.",
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics, questions, or issues..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {helpCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-md p-4 shadow-sm"
            >
              <div className="text-teal-600 mb-3">
                {category.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <ul className="space-y-1">
                {category.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-xs text-gray-500">• {topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Questions</h2>
          <div className="space-y-4">
            {popularQuestions.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.answer}</p>
                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-md p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-3">Still Need Help?</h2>
          <p className="text-teal-100 mb-4 text-sm">
            Can't find what you're looking for? Our support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact-us"
              className="inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center px-4 py-2 bg-teal-800 text-white font-medium rounded-md hover:bg-teal-900 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
