'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, FileText, ChevronDown, BookOpen } from 'lucide-react';
import ProductCard from '@/src/components/ProductCard';

interface Product {
  id: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  featured: boolean;
  created_date: string;
  status: string;
  categories: string[];
  tags: string[];
  product_type: string;
}

interface Props {
  initialProducts: Product[];
}

export default function DigitalArtPageClient({ initialProducts }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is digital art?",
      answer: "Digital art is artwork created using digital technology, such as computers, tablets, and stylus pens, instead of traditional physical media like oil paints or watercolor."
    },
    {
      question: "How is a digital art print made?",
      answer: "At Lurevi, digital art prints are created by taking the high-resolution digital-native file and printing it using premium pigment-based inks on museum-grade archival matte paper (200 GSM) or premium canvas (350 GSM)."
    },
    {
      question: "Is digital art as good as original paintings for home decor?",
      answer: "Yes! Digital art prints offer exceptional clarity, crisp lines, and uniform color accuracy. Because they are designed natively on screens, they translate to print with incredible fidelity, making them perfect for modern, clean decor."
    },
    {
      question: "Can I get digital art prints framed in India?",
      answer: "Yes! Lurevi ships all prints in standard dimensions (like A4, A3, A2, A1), making it very easy to find pre-made frames at local shops or online. You can also take them to any local framing shop in India."
    },
    {
      question: "What digital art styles work best in Indian homes?",
      answer: "Indian home decors range from traditional to modern minimalist. Abstract prints and geometric landscape illustrations work beautifully in contemporary apartments, while colorful portraits and map prints add a personalized touch to family living rooms."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 font-sans pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200/80 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Left Column */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 font-normal overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
              <Link href="/" className="hover:text-teal-800 transition-colors duration-200">Home</Link>
              <span className="text-gray-300 select-none">&gt;</span>
              <Link href="/categories" className="hover:text-teal-800 transition-colors duration-200">Categories</Link>
              <span className="text-gray-300 select-none">&gt;</span>
              <span className="text-gray-950 font-semibold truncate">Digital Art</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight tracking-tight">
              Digital art prints — curated wall art for modern Indian homes
            </h1>
            
            <div className="prose prose-stone text-stone-700 leading-relaxed text-sm sm:text-base">
              <p>
                Digital art is a contemporary art form created entirely on a digital medium, born directly on a digital screen rather than on a traditional canvas. If you want to learn more about this medium, you can read our article on <Link href="/blog/what-is-digital-art" className="text-teal-600 font-semibold hover:underline">what is digital art</Link>. At Lurevi, we curate only digital-native work. This means every single piece was designed digitally from the very start, rather than being scanned from a physical original, ensuring that the visual lines remain clean and crisp. Our museum-quality <Link href="/categories/digital-art-prints" className="text-teal-600 font-semibold hover:underline">digital art prints</Link> are produced using archival materials, promising stunning clarity and long-lasting vibrance. Explore our curated selection below to find the perfect addition to your space.
              </p>
            </div>
            
            <div className="pt-2">
              <a href="#product-grid" className="inline-block px-8 py-4 bg-black hover:bg-stone-900 text-white font-semibold rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5">
                Explore Collection
              </a>
            </div>
          </div>

          {/* Hero Right Column */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 flex items-center justify-center">
              {initialProducts && initialProducts.length > 0 && initialProducts[0]?.images?.[0] ? (
                <img 
                  src={initialProducts[0].images[0]} 
                  alt="Curated digital art print by Lurevi" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="text-center text-stone-400 p-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-3 opacity-60" />
                  <span className="text-sm font-medium">Lurevi Premium Curation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid outline sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Text Content (Left Panel) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1 */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-4">
                What makes Lurevi's digital art different
              </h2>
              <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  When decoration demands excellence, Lurevi offers a distinctive approach. First, our <strong>curated selection</strong> process is rigorous — not every submission is accepted, ensuring only standard, premium-tier artwork enters our collection. Second, we focus exclusively on <strong>digital-native only</strong> creations. Unlike digital art galleries in India that display scanned physical originals, this guarantees sharper prints, highly accurate colour translation, and a complete absence of scan artefacts or muddy textures. If you are exploring <Link href="/blog/digital-art-galleries-india" className="text-teal-600 font-semibold hover:underline">digital art galleries in India</Link>, you will find Lurevi's approach to be unique. Finally, all physical orders are <strong>printed in India</strong> on archival 200 GSM paper or heavy canvas using advanced pigment inks, and then shipped domestically. This domestic printing pipeline ensures fast, secure shipping across India, delivering museum-grade wall art prints right to your doorstep.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-4">
                Browse by style
              </h2>
              <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  Finding the perfect match for your home is simple when you browse by style. Whether you are looking for bold abstract pieces, modern <Link href="/blog/digital-illustration-guide" className="text-teal-600 font-semibold hover:underline">digital illustration</Link> designs, striking portrait art, scenic landscape layouts, or geometric world cities representations, Lurevi offers specialized sub-collections for each category. Exploring these styles allows you to construct a cohesive theme across your home or office walls, making it easy to create beautiful, unified spaces that tell a story. By filtering our categories, you can easily discover pieces that match your home's color scheme and architectural lines.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-4">
                How to choose digital art for your home
              </h2>
              <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  Selecting the right piece for your decor is a rewarding creative process. Here are three practical tips to guide you. First, try to <strong>match the colour</strong> of your artwork to at least one existing element in the room, such as your cushions, rug, or an accent wall, to create a harmonized palette. Second, <strong>go larger than you think</strong> — small frames can look lost on expansive walls; ideally, your art should occupy about 60–75% of the available wall width to command the space. Finally, <strong>choose print over download</strong> if you want it framed immediately; Lurevi prints are sent print-ready on professional archival paper. This makes Lurevi a premier choice for finding <Link href="/blog/affordable-wall-art-high-end-look-india" className="text-teal-600 font-semibold hover:underline">affordable wall art India</Link> that delivers a high-end luxury look without breaking the budget. By taking these factors into account, you can confidently choose pieces that elevate your home's aesthetic appeal.
                </p>
              </div>
            </div>
          </div>

          {/* Specs Table (Right Panel) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs sticky top-8">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-4">
                Print specifications
              </h2>
              
              <div className="overflow-hidden border border-stone-100 rounded-xl">
                <table className="min-w-full divide-y divide-stone-100 text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-stone-900">Spec</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-stone-900">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Paper</td>
                      <td className="px-4 py-3 text-stone-600">200 GSM archival matte</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Canvas</td>
                      <td className="px-4 py-3 text-stone-600">350 GSM premium canvas</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Ink</td>
                      <td className="px-4 py-3 text-stone-600">Pigment inks, 75+ year lightfastness</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Resolution</td>
                      <td className="px-4 py-3 text-stone-600">300 DPI</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Sizes</td>
                      <td className="px-4 py-3 text-stone-600">A4, A3, A2, A1, custom</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-800 bg-stone-50/30">Shipping</td>
                      <td className="px-4 py-3 text-stone-600">Free above ₹999 · 3–5 days across India</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Header */}
        <div id="product-grid" className="border-t border-stone-200 pt-8 mb-6 scroll-mt-6">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            Shop Digital Art Collection
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Browse our curated high-resolution digital-native prints
          </p>
        </div>

        {/* Product Grid */}
        {initialProducts.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center mb-12">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800">No products available</h3>
            <p className="text-stone-500 text-sm mt-1">We are updating our collection. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left py-2 focus:outline-none group"
                    type="button"
                  >
                    <span className="font-semibold text-stone-800 group-hover:text-teal-800 transition-colors text-sm sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
                    />
                  </button>
                  <div 
                    className={`mt-2 text-stone-600 text-xs sm:text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="py-1">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
