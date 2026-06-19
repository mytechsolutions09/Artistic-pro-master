'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Truck, Award, Eye } from 'lucide-react';
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
  created_date?: string;
  status: string;
  categories: string[];
  tags: string[];
  product_type: string;
  originalPrice?: number;
  discountPercentage?: number;
}

interface Props {
  initialProducts: Product[];
}

export default function LuxuryWallArtClient({ initialProducts }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const slideLeft = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: -width, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: width, behavior: 'smooth' });
    }
  };

  const sliderProducts = useMemo(() => {
    // Prioritize products that belong to the 'Painting' category
    const paintings = initialProducts.filter(p => 
      p.images && 
      p.images.length > 0 && 
      (p.categories || []).some(cat => cat.toLowerCase().includes('painting'))
    );
    
    // Fallback to all luxury products if no paintings found
    return paintings.length > 0 
      ? paintings.slice(0, 6) 
      : initialProducts.filter(p => p.images && p.images.length > 0).slice(0, 6);
  }, [initialProducts]);

  useEffect(() => {
    if (sliderProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderProducts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sliderProducts]);

  const faqs = [
    {
      question: "What defines luxury wall art at Lurevi?",
      answer: "Lurevi Luxury Wall Art comprises original artworks created by professional artists. Every piece is printed on museum-quality archival paper (240+ GSM) or premium heavy cotton canvas (350 GSM) using professional-grade pigment inks that guarantee 75+ years of fade-resistance under standard room lighting."
    },
    {
      question: "What sizes should I choose for my living room wall?",
      answer: "For feature walls behind sofas or in dining rooms, we recommend large-format prints like A1 (59.4 × 84.1 cm) or 24×36 inches. A smaller print can get lost on a large wall, whereas large-format luxury prints act as the central anchor of your room design."
    },
    {
      question: "How are the prints packaged and shipped?",
      answer: "To ensure absolute protection, all prints are wrapped in tissue paper and shipped in heavy-duty cardboard tubes. We provide free shipping across India for orders above ₹999, fully insured, with tracking updates sent straight to your phone."
    },
    {
      question: "How do I choose between matte paper and canvas?",
      answer: "Matte paper (240 GSM) offers crisp details, deep blacks, and a smooth modern appearance, which is ideal under glass frames. Canvas (350 GSM) provides a rich, tactile painted texture and organic depth, making it excellent for stretch-framing without glass."
    },
    {
      question: "Do you offer pre-framed prints?",
      answer: "Currently, we ship rolled prints. This lets you choose custom frames locally that match your furniture's exact wood grain, color scheme, and trim style, avoiding standard generic framing."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 font-sans pb-20 text-stone-800 selection:bg-teal-500/10 selection:text-teal-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-stone-200/80 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.03),rgba(0,0,0,0))]" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          {/* Hero Left Column */}
          <div className="w-full lg:w-1/2 space-y-6 lg:pr-8">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-500 font-normal overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
              <Link href="/" className="hover:text-teal-800 transition-colors duration-200">Home</Link>
              <span className="text-stone-300 select-none">&gt;</span>
              <span className="text-stone-500 select-none">Collections</span>
              <span className="text-stone-300 select-none">&gt;</span>
              <span className="text-stone-900 font-semibold">Luxury Wall Art</span>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-3.5 py-1 text-xs text-teal-800 font-medium tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lurevi Signature Curation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-900 leading-tight tracking-tight font-sans">
              Elevate your space with <span className="bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">Luxury Wall Art</span>
            </h1>
            
            <div className="text-stone-600 leading-relaxed text-xs sm:text-sm space-y-3.5 font-light">
              <p>
                Luxury is defined by standard-setting execution and fine materials. The Lurevi Luxury Collection brings together hand-selected digital paintings, abstract designs, and modern landscapes from premier creators. 
              </p>
              <p>
                Designed natively on high-resolution canvas screens, every print ensures perfect color accuracy and absolute visual crispness. Printed on museum-grade heavy archival media and shipped in robust damage-proof packaging across India.
              </p>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href="#product-grid" 
                className="px-8 py-3.5 bg-black hover:bg-stone-900 text-white text-sm font-semibold rounded-xl text-center shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                Browse Curated Artworks
              </a>
              <a 
                href="#specifications" 
                className="px-8 py-3.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-850 text-sm font-semibold rounded-xl text-center transition-all duration-300 hover:bg-stone-50"
              >
                View Print Specifications
              </a>
            </div>
          </div>

          {/* Hero Right Column - Painting Image Slider */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-stone-100 p-2 group">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent z-20 pointer-events-none" />
              
              {sliderProducts && sliderProducts.length > 0 ? (
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  {/* Slides */}
                  {sliderProducts.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <img 
                        src={p.images[0]} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform duration-700 scale-100 hover:scale-105"
                      />
                      
                      {/* Active Info details overlay */}
                      {idx === currentSlide && (
                        <div className="absolute bottom-4 left-4 z-30 animate-fade-in-up">
                          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-teal-100 font-medium font-sans bg-teal-900/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-teal-500/20">
                            Luxury Collection
                          </span>
                          <h3 className="text-xs sm:text-sm font-semibold text-white mt-1 shadow-sm drop-shadow-md">
                            {p.title}
                          </h3>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Manual Navigation Controls */}
                  {sliderProducts.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide(prev => (prev - 1 + sliderProducts.length) % sliderProducts.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide(prev => (prev + 1) % sliderProducts.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs group-hover:opacity-100 opacity-0 transition-all duration-300"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Dots indicators */}
                      <div className="absolute bottom-4 right-4 z-30 flex space-x-1 bg-black/30 backdrop-blur-xs px-2 py-1 rounded-full border border-white/10">
                        {sliderProducts.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === currentSlide ? 'bg-amber-300 w-3' : 'bg-white/50 hover:bg-white'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-8">
                  <Award className="w-16 h-16 text-teal-650/40 mb-3" />
                  <span className="text-sm font-medium">Lurevi Premium Curation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-lg shadow-stone-100/40">
          <div className="flex items-start space-x-4 p-2">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-700 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Archival Fine Art</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-light leading-relaxed">Museum-grade prints designed to prevent fading and retain depth for 75+ years.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-2 md:border-l md:border-stone-100 md:pl-6">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Premium Heavy Media</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-light leading-relaxed">Printed on museum-standard 240+ GSM matte paper and 350 GSM linen canvas.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-2 md:border-l md:border-stone-100 md:pl-6">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-700 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Insured Transit</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-light leading-relaxed">Shipped in robust protective tubes. Insured transit, direct shipping across India.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Dynamic Product Grid Header with Slide Controls */}
        <div id="product-grid" className="border-t border-stone-200 pt-10 mb-8 scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-stone-900 font-sans">
                Shop the Luxury Collection
              </h2>
              <p className="text-stone-500 text-xs mt-1 font-light">
                Browse our premium high-end curated digital art prints
              </p>
            </div>
            <div className="flex items-center space-x-3 self-end sm:self-center">
              <span className="text-stone-600 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg px-4 py-2 shadow-sm">
                Showing <span className="text-teal-700 font-semibold">{initialProducts.length}</span> curated pieces
              </span>
              {initialProducts.length > 4 && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={slideLeft}
                    className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-100 transition-colors shadow-sm"
                    aria-label="Slide left"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>
                  <button 
                    onClick={slideRight}
                    className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-100 transition-colors shadow-sm"
                    aria-label="Slide right"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {initialProducts.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-16 text-center mb-16 shadow-sm">
            <Award className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800">Curating luxury artworks...</h3>
            <p className="text-stone-500 text-sm mt-1 font-light">We are refreshing our custom items. Check back shortly.</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Left overlay arrow */}
            {initialProducts.length > 4 && (
              <button 
                onClick={slideLeft}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-stone-200 bg-white/95 hover:bg-white text-stone-850 shadow-md transition-all duration-300 hover:scale-110 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 focus:outline-none hidden sm:flex items-center justify-center"
                aria-label="Slide left"
              >
                <ChevronLeft className="w-5 h-5 text-stone-800" />
              </button>
            )}

            {/* Right overlay arrow */}
            {initialProducts.length > 4 && (
              <button 
                onClick={slideRight}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-stone-200 bg-white/95 hover:bg-white text-stone-850 shadow-md transition-all duration-300 hover:scale-110 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 focus:outline-none hidden sm:flex items-center justify-center"
                aria-label="Slide right"
              >
                <ChevronRight className="w-5 h-5 text-stone-800" />
              </button>
            )}

            {/* Product snapped list */}
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-6 mb-16"
            >
              {initialProducts.map((product) => {
                return (
                  <div 
                    key={product.id} 
                    className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-start group relative transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg"
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Specifications and Info Layout */}
        <div id="specifications" className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 scroll-mt-6 border-t border-stone-200 pt-12">
          {/* Specifications Info Block (Left Column) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-stone-900 font-sans mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>The Art of Archival Print Care</span>
              </h2>
              <div className="text-stone-600 text-xs sm:text-sm leading-relaxed space-y-3.5 font-light">
                <p>
                  Luxury wall art relies heavily on material longevity. Unlike standard commercial posters printed with cheap dye inks on thin wood-pulp paper, Lurevi uses <strong>mineral-based pigment inks</strong> that sit on top of the media fibers rather than sinking in, ensuring color depth and high UV stability.
                </p>
                <p>
                  When selecting framed displays, we recommend using UV-filtering acrylic glass or placing prints away from direct, harsh afternoon sunlight. This maintains color saturation and visual warmth for generations.
                </p>
                <p>
                  For detailed information on custom configurations or styling, explore our resources: learn <Link href="/blog/what-is-digital-art" className="text-teal-600 font-semibold hover:underline">what is digital art</Link> or discover how to select the perfect print size in our <Link href="/blog/digital-artwork-for-home" className="text-teal-600 font-semibold hover:underline">digital artwork home sizing guide</Link>.
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-stone-900 font-sans mb-4">
                Curated for Prestigious Interiors
              </h2>
              <div className="text-stone-600 text-xs sm:text-sm leading-relaxed space-y-3.5 font-light">
                <p>
                  Our luxury collection is curated with architectural visual themes in mind. Minimalist line art pairs beautifully with contemporary Japandi and Scandinavian decors. Bold abstract canvases, on the other hand, command attention in formal living spaces, and monochrome photography adds classic structure to executive studies.
                </p>
                <p>
                  To explore similar styles, you can browse Lurevi's dedicated <Link href="/categories/abstract" className="text-teal-600 font-semibold hover:underline">Abstract Art Collection</Link> and our premium <Link href="/categories/minimalist" className="text-teal-600 font-semibold hover:underline">Minimalist Prints</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Table (Right Column) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm sticky top-8">
              <h2 className="text-base sm:text-lg font-semibold text-stone-900 font-sans mb-4">
                Print Specifications
              </h2>
              
              <div className="overflow-hidden border border-stone-200 rounded-xl">
                <table className="min-w-full divide-y divide-stone-200 text-xs sm:text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-stone-800">Spec</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-stone-800">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Paper Weight</td>
                      <td className="px-4 py-3 text-stone-600">240+ GSM museum-grade matte</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Canvas Media</td>
                      <td className="px-4 py-3 text-stone-600">350 GSM thick cotton canvas</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Ink Longevity</td>
                      <td className="px-4 py-3 text-stone-600">Giclée pigment inks, 75+ years lightfast</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Resolution</td>
                      <td className="px-4 py-3 text-stone-600">300 DPI native file calibration</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Standard Formats</td>
                      <td className="px-4 py-3 text-stone-600">A4, A3, A2, A1, 12×18, 24×36 in</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-stone-700 bg-stone-50/50">Free Shipping</td>
                      <td className="px-4 py-3 font-semibold text-teal-700">Across India (Free above ₹999)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm mb-12">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 font-sans mb-6 border-b border-stone-100 pb-4">
            Luxury Wall Art FAQs
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
                    <span className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors text-sm sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
                    />
                  </button>
                  <div 
                    className={`mt-2 text-stone-600 text-xs sm:text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="py-2 font-light">{faq.answer}</p>
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
