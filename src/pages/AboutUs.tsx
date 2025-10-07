import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, Globe, Target, Lightbulb, CheckCircle, Leaf, Palette, Shield, Handshake } from 'lucide-react';
import Footer from '../components/Footer';

const AboutUs: React.FC = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion for Art",
      description: "We believe art has the power to inspire, transform, and connect people across cultures and generations. Every piece in our collection is carefully curated to bring joy and meaning to your life."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer-Centric",
      description: "Our customers are at the heart of everything we do. We strive to exceed expectations with every interaction, from browsing to purchase to post-delivery support."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Excellence",
      description: "We maintain the highest standards in all our products, using premium materials and cutting-edge printing technology for digital art and clothing collections."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Serving customers worldwide with fast, reliable shipping and exceptional customer service. We partner with local artists and designers globally to bring you diverse, authentic creations."
    }
  ];

  const milestones = [
    {
      year: "Jan 2023",
      title: "Founded",
      description: "Lurevi was established in New Delhi with a vision to make art accessible to everyone. Started with a small team of passionate artists and entrepreneurs."
    },
    {
      year: "Jun 2023",
      title: "Digital Platform Launch",
      description: "Launched our digital art platform with thousands of unique designs from talented artists worldwide. Reached our first 5,000 customers milestone."
    },
    {
      year: "Sep 2023",
      title: "Fashion Launch",
      description: "Introduced premium clothing line featuring original artwork. Partnered with sustainable manufacturers to ensure ethical production practices."
    },
    {
      year: "Dec 2023",
      title: "Technology Innovation",
      description: "Launched AI-powered personalization features and mobile app. Implemented advanced printing technology for superior quality products."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to serve customers in over 50 countries worldwide. Achieved 50,000+ happy customers and established partnerships with international artists."
    }
  ];

  const teamMembers = [
    {
      name: "Arpit Kanotra",
      role: "Founder & CEO",
      description: "Visionary entrepreneur with 15+ years in e-commerce and digital marketing. Passionate about making art accessible to everyone."
    },
    {
      name: "Aayush Kanotra",
      role: "Director",
      description: "Award-winning artist and designer leading our creative vision. Specializes in contemporary Indian art and fashion design."
    },
    {
      name: "Amit Patel",
      role: "Head of Operations",
      description: "Operations expert ensuring seamless customer experiences. Manages our supply chain and logistics across 50+ countries."
    },
    {
      name: "Sneha Gupta",
      role: "Tech Lead",
      description: "Full-stack developer building our innovative platform. Expert in AI-powered personalization and mobile app development."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              About <span className="text-pink-300">Lurevi</span>
            </h1>
            <p className="text-lg text-teal-100 max-w-3xl mx-auto leading-relaxed">
              We're passionate about bringing art to life through digital creations and premium clothing. 
              Founded in 2023, Lurevi, along with our sister companies Purple Plus and Necessary Milan, 
              has grown from a small startup to a global platform serving customers in over 50 countries. 
              Our mission is to make unique, high-quality art accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              At Lurevi, we believe that art should be accessible, wearable, and shareable. 
              We bridge the gap between digital creativity and everyday fashion, offering 
              unique designs that allow you to express your personality through what you wear.
            </p>
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              From stunning digital art pieces to premium clothing collections, we curate 
              and create products that inspire confidence and creativity in every customer. 
              Our carefully selected artists and designers work tirelessly to bring you 
              exclusive collections that you won't find anywhere else.
            </p>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Whether you're looking for a unique digital print to decorate your space or 
              a stylish piece of clothing that makes a statement, Lurevi has something special 
              for every taste and budget. We're committed to sustainable practices and ethical 
              sourcing, ensuring that your purchase makes a positive impact.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="bg-gradient-to-r from-teal-600 to-pink-600 hover:from-teal-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Our Products
              </Link>
              <Link
                to="/contact-us"
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-pink-50 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">50K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">15K+</div>
                <div className="text-sm text-gray-600">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What We Do</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              At Lurevi, we specialize in bringing digital art to life through multiple channels, 
              creating unique experiences for our customers worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Art Gallery</h3>
              <p className="text-gray-600 text-sm">
                Curated collection of unique digital artworks from talented artists worldwide. 
                Download high-resolution prints instantly for your home or office.
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Clothing</h3>
              <p className="text-gray-600 text-sm">
                Fashion-forward clothing featuring original artwork. From t-shirts to hoodies, 
                express your style with unique designs that stand out.
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Solutions</h3>
              <p className="text-gray-600 text-sm">
                Personalized services including custom artwork, bulk orders, and corporate 
                partnerships. We work closely with clients to bring their vision to life.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Lurevi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                  index % 2 === 0 ? 'bg-teal-100 text-teal-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {React.cloneElement(value.icon, { className: "w-6 h-6" })}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Journey</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Key milestones in our growth and evolution
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-400 to-pink-400"></div>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-6 text-right' : 'pl-6 text-left'}`}>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <div className="text-xl font-bold text-teal-600 mb-1">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-pink-500 rounded-full border-2 border-white shadow-lg z-10"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Meet Our Team</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind Lurevi's success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  index % 2 === 0 ? 'bg-teal-100 text-teal-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-teal-600 font-medium mb-1 text-sm">{member.role}</p>
                <p className="text-xs text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commitment Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Commitment</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              We're committed to making a positive impact through sustainable practices, 
              ethical sourcing, and supporting artists worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-teal-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Sustainable Practices</h3>
              <p className="text-gray-600 text-xs">
                Eco-friendly packaging, sustainable materials, and carbon-neutral shipping options.
              </p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Artist Support</h3>
              <p className="text-gray-600 text-xs">
                Fair compensation for artists and designers, promoting creative talent worldwide.
              </p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600 text-xs">
                Rigorous quality control and premium materials for all our products.
              </p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-600 text-xs">
                Supporting local communities and giving back through art education programs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Experience Lurevi?</h2>
          <p className="text-lg text-teal-100 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover the perfect blend of art and fashion. 
            Start your journey with us today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="bg-white text-teal-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explore Art Gallery
            </Link>
            <Link
              to="/clothes"
              className="bg-white text-pink-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Shop Clothing
            </Link>
            <Link
              to="/contact-us"
              className="border-2 border-white text-white hover:bg-white hover:text-teal-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
