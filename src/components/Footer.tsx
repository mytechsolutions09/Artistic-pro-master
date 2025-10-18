import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-3">
              <img 
                src="/logo.png" 
                alt="Lurevi" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Your premier destination for digital art and premium clothing. Discover unique pieces that express your style.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://www.facebook.com/lurevi.in" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-300 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/lurevi.in/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-300 transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/about-us" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Art Gallery
                </Link>
              </li>
              <li>
                <Link to="/clothes" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-base font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/help-center" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping-info" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns-and-refunds" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-3">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-3 h-3 text-pink-300 mr-2" />
                <span className="text-gray-400 text-sm">support@lurevi.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 text-pink-300 mr-2" />
                <span className="text-gray-400 text-sm">+91 9625788455</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-3 h-3 text-pink-300 mr-2 mt-1" />
                <span className="text-gray-400 text-sm">WZ 14 Janakpuri New Delhi<br />110058, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-700 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">
              © {currentYear} Lurevi. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-3 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="text-gray-400 hover:text-white text-xs transition-colors">
                Terms of Service
              </Link>
              <div className="flex items-center text-gray-400 text-xs">
                Made with <Heart className="w-3 h-3 text-pink-300 mx-1" /> by Lurevi Team
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
