import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, RotateCcw, FileText, AlertCircle, Clock, DollarSign, Shield, CheckCircle, XCircle, Mail, Calendar, Percent } from 'lucide-react';

const UseAndReturnPolicy: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    const allSections = [
      'intro', 'offer', 'eligibility', 'timeline', 'claim', 
      'exclusions', 'notes', 'promise', 'contact'
    ];
    const expanded = allSections.reduce((acc, section) => ({ ...acc, [section]: true }), {});
    setExpandedSections(expanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const AccordionSection = ({ 
    id, 
    icon: Icon, 
    title, 
    children 
  }: { 
    id: string; 
    icon: React.ElementType; 
    title: string; 
    children: React.ReactNode;
  }) => (
    <section className="bg-white rounded-lg shadow-sm shadow-teal-100 overflow-hidden border border-gray-200 hover:shadow-md hover:shadow-teal-200 transition-shadow">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-4 h-4 mr-2 text-teal-600 flex-shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 text-left">{title}</h2>
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-4 pb-3 text-gray-700 space-y-2 text-xs border-t border-gray-100">
          <div className="pt-2">{children}</div>
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-2">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-1">
            120-Day Use & Return Offer
          </h1>
          <p className="text-center text-teal-100 text-xs sm:text-sm">
            Experience our clothing risk-free. Not satisfied? Get 50% store credit after 120 days!
          </p>
          <p className="text-center text-teal-200 text-xs mt-1">
            Last Updated: October 22, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Expand/Collapse All Buttons */}
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
          >
            Collapse All
          </button>
        </div>

        <div className="space-y-2">
          
          {/* 1. Overview */}
          <AccordionSection id="intro" icon={FileText} title="1. Overview">
            <p>At <strong>Lurevi</strong>, we believe in giving you complete confidence in your purchase. That's why we offer our exclusive <strong>120-Day Use & Return Offer</strong> — designed to let you truly experience our clothing, risk-free.</p>
            <p className="mt-2">This policy applies exclusively to <strong>clothing products</strong> purchased from our official website at lurevi.in.</p>
            <div className="bg-teal-50 border-l-4 border-teal-400 p-2 mt-2">
              <div className="flex">
                <AlertCircle className="w-3 h-3 text-teal-600 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-800">
                  <strong>Key Point:</strong> Try our clothing for 120 days. If you're not satisfied, return it for 50% store credit — no questions asked!
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 2. What This Offer Includes */}
          <AccordionSection id="offer" icon={Percent} title="2. What This Offer Includes">
            <ul className="list-disc pl-4 space-y-2 mt-1">
              <li>You can <strong>use and wear</strong> our clothing product for up to <strong>120 days</strong> from the date of delivery.</li>
              <li>If you are <strong>not satisfied for any reason</strong>, you are eligible to <strong>return the item</strong> and receive <strong>50% of the price you paid as store credit</strong> (discounted price if applicable).</li>
              <li>Store credit can be used for <strong>any future purchases</strong> on lurevi.in with <strong>no expiration date</strong>.</li>
              <li>This refund offer is <strong>valid for 7 days after the 120-day period</strong>.</li>
            </ul>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
              <p className="font-semibold text-gray-900 mb-2">📅 Timeline Example:</p>
              <p className="text-gray-700 mb-2">If your order was delivered on <strong>June 1</strong>, you can claim your 50% store credit <strong>between September 29 and October 6</strong>.</p>
              <p className="font-semibold text-gray-900 mb-1 mt-2">💰 Store Credit Calculation:</p>
              <p className="text-gray-700 text-xs">• If you paid ₹1,000 (after discount) → You get ₹500 store credit<br/>• If you paid ₹800 (after 20% off) → You get ₹400 store credit</p>
            </div>
          </AccordionSection>

          {/* 3. Eligibility Criteria */}
          <AccordionSection id="eligibility" icon={CheckCircle} title="3. Eligibility Criteria">
            <p>To qualify for the 120-Day Use & Return Offer:</p>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li>The product must have been purchased directly from <strong>Lurevi's official website</strong> (lurevi.in).</li>
              <li>The return request must be made <strong>after 120 days but within 127 days</strong> from delivery.</li>
              <li>The product should be in <strong>good wearable condition</strong> — not damaged, torn, or excessively worn.</li>
              <li>The <strong>original order number or receipt</strong> is required.</li>
            </ul>
          </AccordionSection>

          {/* 4. Return Timeline */}
          <AccordionSection id="timeline" icon={Calendar} title="4. Return Timeline">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 border border-teal-200">
              <p className="font-semibold text-gray-900 mb-3">Understanding Your Return Window:</p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mr-3 text-xs font-bold">Day 1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Delivery Date</p>
                    <p className="text-xs text-gray-600">Your order is delivered</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mr-3 text-xs font-bold">120</div>
                  <div>
                    <p className="font-semibold text-gray-900">Return Window Opens</p>
                    <p className="text-xs text-gray-600">You can now initiate your 50% refund claim</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mr-3 text-xs font-bold">127</div>
                  <div>
                    <p className="font-semibold text-gray-900">Return Window Closes</p>
                    <p className="text-xs text-gray-600">Last day to claim your 50% refund</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-2 mt-3">
              <div className="flex">
                <AlertCircle className="w-3 h-3 text-orange-400 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">
                  <strong>Important:</strong> Claims made <strong>before 120 days</strong> or <strong>after 127 days</strong> will not be accepted under this offer.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 5. How to Claim Your Store Credit */}
          <AccordionSection id="claim" icon={FileText} title="5. How to Claim Your 50% Store Credit">
            <p className="font-semibold text-gray-900 mb-2">Step-by-Step Process:</p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mr-2 text-xs font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900">Contact Us</p>
                  <p className="mt-0.5">Email us at <strong>support@lurevi.com</strong> with your <strong>order ID</strong> and <strong>return request</strong> between day 120-127 after delivery.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mr-2 text-xs font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900">Eligibility Verification</p>
                  <p className="mt-0.5">Our team will verify eligibility within <strong>3–5 business days</strong>.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mr-2 text-xs font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900">Return Shipping Arranged</p>
                  <p className="mt-0.5">You will receive a <strong>return shipping label</strong> or pickup schedule.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mr-2 text-xs font-bold">4</div>
                <div>
                  <p className="font-semibold text-gray-900">Receive Store Credit</p>
                  <p className="mt-0.5">Once we receive and inspect the item, <strong>50% store credit</strong> will be added to your account within <strong>3–5 business days</strong>. You'll receive a confirmation email with your store credit balance.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mt-3">
              <div className="flex">
                <CheckCircle className="w-3 h-3 text-blue-600 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <strong>Store Credit Benefits:</strong> Your store credit never expires and can be used on any product on lurevi.in — including sale items!
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 6. Non-Eligible Items */}
          <AccordionSection id="exclusions" icon={XCircle} title="6. Non-Eligible Items">
            <p>This offer does <strong>not apply</strong> to:</p>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li><strong>Innerwear, socks, and accessories</strong></li>
              <li><strong>Items bought during clearance or flash sales</strong></li>
              <li><strong>Customized or altered clothing</strong></li>
              <li><strong>Products damaged due to improper use or care</strong></li>
              <li><strong>Digital art products</strong> (separate return policy applies)</li>
            </ul>
          </AccordionSection>

          {/* 7. Important Notes */}
          <AccordionSection id="notes" icon={AlertCircle} title="7. Important Notes">
            <ul className="list-disc pl-4 space-y-2 mt-1">
              <li><strong>Store credit only:</strong> The 50% return value will be issued as store credit, not as a monetary refund to your bank account or card.</li>
              <li>Store credit amount is <strong>50% of the price you actually paid</strong> (if you purchased with a discount, it's 50% of the discounted price).</li>
              <li>Return request validity is strictly limited to <strong>7 days after the 120-day mark</strong> (Day 120-127).</li>
              <li>Claims made <strong>before 120 days</strong> or <strong>after 127 days</strong> will not be accepted.</li>
              <li>Shipping charges (if any) are <strong>non-refundable</strong>.</li>
              <li>The offer is <strong>applicable once per order</strong>.</li>
              <li>Product must be in <strong>good wearable condition</strong> to qualify.</li>
              <li>Store credit <strong>never expires</strong> and can be used on any future purchase.</li>
            </ul>
          </AccordionSection>

          {/* 8. Our Promise */}
          <AccordionSection id="promise" icon={Shield} title="8. Our Promise">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
              <p className="text-gray-800 leading-relaxed">
                We designed this offer to give you <strong>complete peace of mind</strong> — so you can live, move, and style freely in our clothes. 
                If you're not happy even after 120 days, we'll still stand by our product — and by you.
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-3">
              <div className="flex">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-800">
                  <strong>Your Satisfaction Matters:</strong> This unique 120-day policy shows our confidence in our products and our commitment to your satisfaction.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 9. Contact Us */}
          <AccordionSection id="contact" icon={Mail} title="9. Need Help?">
            <div className="bg-teal-50 rounded p-2 border border-teal-200">
              <p className="mb-2">If you have any questions or need assistance with your 120-day return, please contact us:</p>
              <div className="space-y-1 mb-2">
                <p className="font-semibold text-gray-900">Lurevi Customer Care</p>
                <p><strong>📩 Email:</strong> support@lurevi.com</p>
                <p><strong>📞 Phone:</strong> +91 9625788455</p>
                <p><strong>📍 Address:</strong> WZ 14 Janakpuri, New Delhi - 110058, India</p>
              </div>
              <p className="text-gray-600 mt-2">We aim to respond to all inquiries within 24 hours during business days.</p>
            </div>
          </AccordionSection>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-teal-400 p-3 mt-3 rounded">
            <p className="text-xs text-teal-800">
              <strong>Note:</strong> This 120-Day Use & Return Offer applies exclusively to <strong>clothing products</strong> purchased from lurevi.in. The policy in effect at the time of your purchase will apply to your order. We reserve the right to update this policy at any time.
            </p>
          </div>

        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-3 text-xs">Related Pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              to="/shipping-info" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Shipping Info
            </Link>
            <Link 
              to="/terms-and-conditions" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/contact-us" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseAndReturnPolicy;

