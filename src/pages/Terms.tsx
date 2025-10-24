import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, CreditCard, Package, AlertCircle, Mail, ChevronDown, ChevronUp, User, Truck, RotateCcw, Copyright, Scale, Lock, FileCheck, Gavel, Globe } from 'lucide-react';

const Terms: React.FC = () => {
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
      'agreement', 'products', 'accounts', 'orders', 'shipping', 
      'returns', 'ip', 'conduct', 'privacy', 'disclaimers', 
      'indemnification', 'modifications', 'governing', 'severability', 
      'entire', 'contact'
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
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-1">
            Terms and Conditions
          </h1>
          <p className="text-center text-teal-100 text-xs sm:text-sm">
            Please read these terms carefully before using our services
          </p>
          <p className="text-center text-teal-200 text-xs mt-1">
            Last Updated: October 7, 2025
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
          
          {/* 1. Agreement to Terms */}
          <AccordionSection id="agreement" icon={Shield} title="1. Agreement to Terms">
            <p>Welcome to Lurevi, Purple Plus, and Necessary Milan (collectively "Company", "we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website located at lurevi.in and our services.</p>
            <p className="mt-2">By accessing or using our website and services, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our website or use our services.</p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-2 mt-2">
              <div className="flex">
                <AlertCircle className="w-3 h-3 text-orange-400 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">
                  <strong>Important:</strong> You must be at least 18 years old to use our services.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 2. Products and Services */}
          <AccordionSection id="products" icon={Package} title="2. Products and Services">
            <div>
              <p className="font-semibold text-gray-900">2.1 Digital Products</p>
              <p className="mt-1">We offer digital art products including digital artwork and downloadable content. Digital products are delivered electronically and are available for immediate download after successful payment.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">2.2 Physical Products</p>
              <p className="mt-1">We offer physical products including posters, prints, and premium clothing items such as oversized hoodies, extra oversized hoodies, t-shirts, and sweatshirts. Physical products are shipped to the address provided during checkout.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">2.3 Product Descriptions</p>
              <p className="mt-1">We strive to provide accurate product descriptions, images, and specifications. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">2.4 Pricing</p>
              <p className="mt-1">All prices are listed in Indian Rupees (INR) unless otherwise stated. We reserve the right to change prices at any time without prior notice.</p>
            </div>
          </AccordionSection>

          {/* 3. User Accounts */}
          <AccordionSection id="accounts" icon={User} title="3. User Accounts">
            <div>
              <p className="font-semibold text-gray-900">3.1 Account Creation</p>
              <p className="mt-1">To access certain features of our website, you may be required to create an account. You agree to provide accurate, current, and complete information during registration.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.2 Account Security</p>
              <p className="mt-1">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.3 Account Termination</p>
              <p className="mt-1">We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms, fraudulent activity, or misuse of our services.</p>
            </div>
          </AccordionSection>

          {/* 4. Orders and Payment */}
          <AccordionSection id="orders" icon={CreditCard} title="4. Orders and Payment">
            <div>
              <p className="font-semibold text-gray-900">4.1 Order Acceptance</p>
              <p className="mt-1">All orders are subject to acceptance by us. We reserve the right to refuse or cancel any order for any reason.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.2 Payment Methods</p>
              <p className="mt-1">We accept Credit Cards, Debit Cards, and UPI payments. All payments are processed securely through our payment gateway partners.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.3 Payment Processing</p>
              <p className="mt-1">Payment must be received in full before we process your order. If payment is declined or fails, we reserve the right to cancel your order.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.4 Order Confirmation</p>
              <p className="mt-1">You will receive an order confirmation email after successfully placing an order. We will send a separate email confirming dispatch of your order.</p>
            </div>
          </AccordionSection>

          {/* 5. Shipping and Delivery */}
          <AccordionSection id="shipping" icon={Truck} title="5. Shipping and Delivery">
            <div>
              <p className="font-semibold text-gray-900">5.1 Shipping</p>
              <p className="mt-1">Physical products are shipped via our logistics partners. Shipping times may vary depending on your location and product availability.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">5.2 Digital Delivery</p>
              <p className="mt-1">Digital products are delivered electronically via download link to your registered email address.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">5.3 Delivery Address</p>
              <p className="mt-1">You are responsible for providing accurate shipping information. We are not liable for orders delivered to incorrect addresses provided by you.</p>
            </div>
          </AccordionSection>

          {/* 6. Returns and Refunds */}
          <AccordionSection id="returns" icon={RotateCcw} title="6. Returns and Refunds">
            <div>
              <p className="font-semibold text-gray-900">6.1 Physical Products</p>
              <p className="mt-1">Physical products may be returned within 7 days of delivery if they are defective, damaged, or not as described. For detailed return procedures, please visit our <Link to="/returns-and-refunds" className="text-teal-600 hover:text-teal-700 underline">Returns & Refunds page</Link>.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">6.2 Digital Products</p>
              <p className="mt-1">Due to the nature of digital products, all sales are final. Digital products cannot be returned or refunded once downloaded.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">6.3 Refund Processing</p>
              <p className="mt-1">Approved refunds will be processed within 7-10 business days and credited to the original payment method.</p>
            </div>
          </AccordionSection>

          {/* 7. Intellectual Property */}
          <AccordionSection id="ip" icon={Copyright} title="7. Intellectual Property Rights">
            <div>
              <p className="font-semibold text-gray-900">7.1 Ownership</p>
              <p className="mt-1">All content on our website is the property of Lurevi or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.2 Limited License</p>
              <p className="mt-1">When you purchase digital products, you are granted a limited, non-exclusive, non-transferable license to use the product for personal, non-commercial purposes only.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.3 Prohibited Uses</p>
              <p className="mt-1">You may not use our products or website content for any illegal purpose or in any way that violates these Terms.</p>
            </div>
          </AccordionSection>

          {/* 8. User Conduct */}
          <AccordionSection id="conduct" icon={Scale} title="8. User Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Use our website or services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the operation of our website or services</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or harvest information about other users without consent</li>
              <li>Use automated systems (bots, scrapers) to access our website</li>
            </ul>
          </AccordionSection>

          {/* 9. Privacy */}
          <AccordionSection id="privacy" icon={Lock} title="9. Privacy and Data Protection">
            <p>Your privacy is important to us. Our collection and use of personal information is governed by our <Link to="/privacy" className="text-teal-600 hover:text-teal-700 underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
            <p className="mt-2">By using our website and services, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.</p>
          </AccordionSection>

          {/* 10. Disclaimers */}
          <AccordionSection id="disclaimers" icon={AlertCircle} title="10. Disclaimers and Limitations of Liability">
            <div>
              <p className="font-semibold text-gray-900">10.1 Disclaimer of Warranties</p>
              <p className="mt-1">OUR WEBSITE AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">10.2 Limitation of Liability</p>
              <p className="mt-1">TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUREVI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">10.3 Maximum Liability</p>
              <p className="mt-1">Our total liability to you for any claims shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>
            </div>
          </AccordionSection>

          {/* 11. Indemnification */}
          <AccordionSection id="indemnification" icon={Shield} title="11. Indemnification">
            <p>You agree to indemnify, defend, and hold harmless Lurevi, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, or expenses arising from:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Your use or misuse of our website or services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your violation of any applicable laws or regulations</li>
            </ul>
          </AccordionSection>

          {/* 12. Modifications */}
          <AccordionSection id="modifications" icon={FileCheck} title="12. Modifications to Terms">
            <p>We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website with a new "Last Updated" date.</p>
            <p className="mt-2">Your continued use of our website and services after any modifications constitutes your acceptance of the updated Terms.</p>
          </AccordionSection>

          {/* 13. Governing Law */}
          <AccordionSection id="governing" icon={Gavel} title="13. Governing Law and Jurisdiction">
            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
            <p className="mt-2">Any disputes arising from or relating to these Terms or our services shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.</p>
          </AccordionSection>

          {/* 14. Severability */}
          <AccordionSection id="severability" icon={FileCheck} title="14. Severability">
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.</p>
          </AccordionSection>

          {/* 15. Entire Agreement */}
          <AccordionSection id="entire" icon={FileText} title="15. Entire Agreement">
            <p>These Terms, together with our Privacy Policy and any other legal notices published on our website, constitute the entire agreement between you and Lurevi (including Purple Plus and Necessary Milan) regarding your use of our website and services.</p>
          </AccordionSection>

          {/* 16. Contact Us */}
          <AccordionSection id="contact" icon={Mail} title="16. Contact Us">
            <div className="bg-teal-50 rounded p-2 border border-teal-200">
              <p className="mb-2">If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="space-y-1 mb-2">
                <p className="font-semibold text-gray-900">Lurevi (Purple Plus & Necessary Milan)</p>
                <p><strong>Email:</strong> support@lurevi.com</p>
                <p><strong>Phone:</strong> +91 9625788455</p>
                <p><strong>Address:</strong> WZ 14 Janakpuri, New Delhi - 110058, India</p>
              </div>
              <p className="text-gray-600 mt-2">We aim to respond to all inquiries within 2-3 business days.</p>
            </div>
          </AccordionSection>

          {/* Acknowledgment */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mt-3 rounded">
            <p className="text-xs text-orange-800">
              <strong>Acknowledgment:</strong> By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>

        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-3 text-xs">Related Pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              to="/privacy" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/returns-and-refunds" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Returns & Refunds
            </Link>
            <Link 
              to="/shipping-info" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Shipping Info
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

export default Terms;
