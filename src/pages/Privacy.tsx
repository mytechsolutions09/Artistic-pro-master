import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, Eye, Database, Lock, Share2, Cookie, Mail, Bell, UserCheck, FileText, Globe, AlertCircle } from 'lucide-react';

const Privacy: React.FC = () => {
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
      'intro', 'collection', 'usage', 'sharing', 'cookies', 'security', 
      'rights', 'retention', 'children', 'international', 'updates', 'contact'
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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-1">
            Privacy Policy
          </h1>
          <p className="text-center text-teal-100 text-xs sm:text-sm">
            Your privacy is important to us. Learn how we collect, use, and protect your data.
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
          
          {/* 1. Introduction */}
          <AccordionSection id="intro" icon={FileText} title="1. Introduction">
            <p>Welcome to Lurevi's Privacy Policy. This policy describes how Lurevi, Purple Plus, and Necessary Milan (collectively "we", "us", or "our") collect, use, share, and protect your personal information when you use our website at lurevi.in and our services.</p>
            <p className="mt-2">By using our website and services, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our website or services.</p>
            <div className="bg-teal-50 border-l-4 border-teal-400 p-2 mt-2">
              <div className="flex">
                <AlertCircle className="w-3 h-3 text-teal-600 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-800">
                  <strong>Key Point:</strong> We are committed to protecting your privacy and handling your data transparently and securely.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 2. Information We Collect */}
          <AccordionSection id="collection" icon={Database} title="2. Information We Collect">
            <div>
              <p className="font-semibold text-gray-900">2.1 Information You Provide</p>
              <p className="mt-1">We collect information that you voluntarily provide to us:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                <li><strong>Profile Information:</strong> Profile picture, preferences, settings</li>
                <li><strong>Order Information:</strong> Shipping address, billing address, payment details</li>
                <li><strong>Communication:</strong> Messages, reviews, feedback, support inquiries</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">2.2 Information Collected Automatically</p>
              <p className="mt-1">When you use our website, we automatically collect:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, navigation paths</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                <li><strong>Cookies:</strong> Session data, preferences, authentication tokens</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">2.3 Information from Third Parties</p>
              <p className="mt-1">We may receive information from:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Payment processors (transaction status, payment verification)</li>
                <li>Shipping partners (delivery status, tracking information)</li>
                <li>Analytics providers (website usage statistics)</li>
              </ul>
            </div>
          </AccordionSection>

          {/* 3. How We Use Your Information */}
          <AccordionSection id="usage" icon={Eye} title="3. How We Use Your Information">
            <p>We use your information for the following purposes:</p>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.1 Service Delivery</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations, shipping updates, and delivery notifications</li>
                <li>Manage your account and preferences</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.2 Improvement and Personalization</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Analyze usage patterns to improve our website and services</li>
                <li>Personalize your experience and show relevant products</li>
                <li>Conduct research and develop new features</li>
                <li>Test and optimize website performance</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.3 Marketing and Communication</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Send promotional emails about new products and offers (with your consent)</li>
                <li>Notify you about important updates and changes</li>
                <li>Request reviews and feedback</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">3.4 Legal and Security</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Prevent fraud and unauthorized access</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Protect our rights and property</li>
                <li>Resolve disputes and troubleshoot problems</li>
              </ul>
            </div>
          </AccordionSection>

          {/* 4. How We Share Your Information */}
          <AccordionSection id="sharing" icon={Share2} title="4. How We Share Your Information">
            <p>We do not sell your personal information. We may share your information with:</p>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.1 Service Providers</p>
              <p className="mt-1">We share information with trusted third-party service providers who help us operate our business:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><strong>Payment Processors:</strong> To process payments securely</li>
                <li><strong>Shipping Partners:</strong> To deliver your orders (Delhivery, etc.)</li>
                <li><strong>Email Service Providers:</strong> To send transactional and marketing emails</li>
                <li><strong>Cloud Hosting:</strong> To store and manage data (Supabase)</li>
                <li><strong>Analytics Services:</strong> To understand website usage</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.2 Legal Requirements</p>
              <p className="mt-1">We may disclose your information if required by law or to:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Comply with legal processes or government requests</li>
                <li>Enforce our terms and conditions</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or illegal activities</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">4.3 Business Transfers</p>
              <p className="mt-1">If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
            </div>
          </AccordionSection>

          {/* 5. Cookies and Tracking */}
          <AccordionSection id="cookies" icon={Cookie} title="5. Cookies and Tracking Technologies">
            <div>
              <p className="font-semibold text-gray-900">5.1 What Are Cookies?</p>
              <p className="mt-1">Cookies are small text files stored on your device that help us provide and improve our services.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">5.2 Types of Cookies We Use</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><strong>Essential Cookies:</strong> Required for website functionality (login, cart)</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Track your activity for targeted advertising</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">5.3 Managing Cookies</p>
              <p className="mt-1">You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
            </div>
          </AccordionSection>

          {/* 6. Data Security */}
          <AccordionSection id="security" icon={Lock} title="6. Data Security">
            <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li><strong>Encryption:</strong> All data transmitted is encrypted using SSL/TLS</li>
              <li><strong>Secure Storage:</strong> Data is stored on secure servers with access controls</li>
              <li><strong>Authentication:</strong> Strong password requirements and secure authentication</li>
              <li><strong>Regular Audits:</strong> We regularly review and update our security practices</li>
              <li><strong>Limited Access:</strong> Only authorized personnel can access personal data</li>
            </ul>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-2 mt-2">
              <div className="flex">
                <AlertCircle className="w-3 h-3 text-orange-400 mr-1.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">
                  <strong>Note:</strong> While we strive to protect your data, no method of transmission over the internet is 100% secure. Please use strong passwords and keep your account credentials confidential.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* 7. Your Privacy Rights */}
          <AccordionSection id="rights" icon={UserCheck} title="7. Your Privacy Rights">
            <p>You have the following rights regarding your personal information:</p>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.1 Access and Portability</p>
              <p className="mt-1">You can request a copy of your personal data in a structured, commonly used format.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.2 Correction</p>
              <p className="mt-1">You can update or correct your personal information through your account settings or by contacting us.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.3 Deletion</p>
              <p className="mt-1">You can request deletion of your personal data, subject to legal retention requirements.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.4 Opt-Out</p>
              <p className="mt-1">You can opt out of marketing communications by clicking "unsubscribe" in emails or updating your preferences.</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-gray-900">7.5 Objection</p>
              <p className="mt-1">You can object to certain types of data processing, such as direct marketing.</p>
            </div>
            <p className="mt-2 text-teal-600 font-medium">To exercise these rights, contact us at support@lurevi.com</p>
          </AccordionSection>

          {/* 8. Data Retention */}
          <AccordionSection id="retention" icon={Database} title="8. Data Retention">
            <p>We retain your personal information for as long as necessary to:</p>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li>Provide our services and fulfill orders</li>
              <li>Comply with legal, tax, and accounting obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Maintain business records and analytics</li>
            </ul>
            <p className="mt-2">When data is no longer needed, we securely delete or anonymize it. Typical retention periods:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Account Data:</strong> Until account deletion + 30 days</li>
              <li><strong>Order Data:</strong> 7 years (for tax and legal compliance)</li>
              <li><strong>Marketing Data:</strong> Until you opt out + 90 days</li>
              <li><strong>Analytics Data:</strong> 26 months (anonymized)</li>
            </ul>
          </AccordionSection>

          {/* 9. Children's Privacy */}
          <AccordionSection id="children" icon={Shield} title="9. Children's Privacy">
            <p>Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children.</p>
            <p className="mt-2">If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information from our systems.</p>
          </AccordionSection>

          {/* 10. International Data Transfers */}
          <AccordionSection id="international" icon={Globe} title="10. International Data Transfers">
            <p>Our services are primarily operated in India. If you access our website from outside India, your information may be transferred to, stored, and processed in India.</p>
            <p className="mt-2">By using our services, you consent to the transfer of your information to India and other countries where we or our service providers operate.</p>
            <p className="mt-2">We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>
          </AccordionSection>

          {/* 11. Changes to Privacy Policy */}
          <AccordionSection id="updates" icon={Bell} title="11. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>
            <p className="mt-2">When we make material changes, we will:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Update the "Last Updated" date at the top of this policy</li>
              <li>Notify you via email or through a prominent notice on our website</li>
              <li>Provide you with an opportunity to review the changes</li>
            </ul>
            <p className="mt-2">Your continued use of our services after changes are posted constitutes your acceptance of the updated policy.</p>
          </AccordionSection>

          {/* 12. Contact Us */}
          <AccordionSection id="contact" icon={Mail} title="12. Contact Us">
            <div className="bg-teal-50 rounded p-2 border border-teal-200">
              <p className="mb-2">If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="space-y-1 mb-2">
                <p className="font-semibold text-gray-900">Lurevi (Purple Plus & Necessary Milan)</p>
                <p><strong>Email:</strong> support@lurevi.com</p>
                <p><strong>Phone:</strong> +91 9625788455</p>
                <p><strong>Address:</strong> WZ 14 Janakpuri, New Delhi - 110058, India</p>
              </div>
              <p className="text-gray-600 mt-2">We aim to respond to all privacy-related inquiries within 2-3 business days.</p>
            </div>
          </AccordionSection>

          {/* Acknowledgment */}
          <div className="bg-teal-50 border-l-4 border-teal-400 p-3 mt-3 rounded">
            <p className="text-xs text-teal-800">
              <strong>Your Consent:</strong> By using our website and services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
            </p>
          </div>

        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-3 text-xs">Related Pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              to="/terms-and-conditions" 
              className="px-3 py-1.5 bg-white text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition-colors text-xs font-medium"
            >
              Terms & Conditions
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

export default Privacy;
