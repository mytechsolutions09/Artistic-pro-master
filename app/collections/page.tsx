import type { Metadata } from 'next';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/server';
import { Sparkles, ArrowRight, Award } from 'lucide-react';
import { getCategoryExplainer } from '@/src/config/categoryExplainers';

export const metadata: Metadata = {
  title: 'Premium Collections | Lurevi',
  description: 'Explore curated art collections at Lurevi, including Luxury Wall Art, Abstract, Minimalist, and more.',
  alternates: { canonical: 'https://lurevi.in/collections' },
};

export const revalidate = 3600;

export default async function CollectionsPage() {
  const supabase = createStaticClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  const allCategories = categories || [];

  // Find luxury wall art details specifically if it exists in the categories list
  const luxuryCategory = allCategories.find(c => c.slug === 'luxury-wall-art');

  const getCatImage = (cat: any) => {
    return cat.image || cat.image_url || (cat.images && cat.images.length > 0 ? cat.images[0] : '');
  };

  return (
    <div className="min-h-screen bg-stone-50/50 font-sans pb-20 text-stone-850">
      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200/80 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.03),rgba(0,0,0,0))]" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 font-sans tracking-tight">
            Curated <span className="bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">Art Collections</span>
          </h1>
          <p className="max-w-2xl mx-auto text-stone-600 text-sm sm:text-base font-light leading-relaxed">
            Discover Lurevi's signature selections, hand-picked and printed on museum-quality archival materials to bring visual harmony and premium style to your spaces.
          </p>
        </div>
      </section>

      {/* Featured Collection Tabs / Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-wrap items-center justify-center gap-4 border-b border-stone-200 pb-6 mb-10">
          <span className="text-stone-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Quick Links:</span>
          <Link 
            href="/collections/luxury-wall-art" 
            className="flex items-center space-x-2 px-5 py-2.5 bg-black hover:bg-stone-900 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
            <span>Luxury Wall Art (Signature Curation)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a 
            href="#all-collections" 
            className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-700 font-semibold rounded-full text-xs sm:text-sm transition-all duration-300"
          >
            Browse All Collections
          </a>
        </div>

        {/* Featured / Highlighted Luxury Collection Showcase */}
        {luxuryCategory && (
          <div className="mb-16 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-lg shadow-stone-100/50 grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
              <img 
                src={getCatImage(luxuryCategory) || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                alt="Luxury Wall Art Collection Cover" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-teal-800 text-white font-semibold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-teal-600/30">
                Signature Collection
              </div>
            </div>
            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-sans">
                  Luxury Wall Art Collection
                </h2>
                <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
                  Lurevi's standard-setting curation of high-end artworks. Printed on 240+ GSM archival matte paper and 350 GSM cotton canvas using fade-resistant pigment inks, designed to act as the primary statement anchor in your rooms.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-stone-100 py-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-stone-400 font-normal">Media Option</span>
                  <span className="font-semibold text-stone-850">Paper & Canvas</span>
                </div>
                <div>
                  <span className="block text-stone-400 font-normal">Ink Guarantee</span>
                  <span className="font-semibold text-teal-850">75+ Years Lightfast</span>
                </div>
              </div>
              <div className="pt-2">
                <Link 
                  href="/collections/luxury-wall-art" 
                  className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-850 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-300 hover:shadow-md"
                >
                  <span>Explore Luxury Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* All Collections Grid */}
        <div id="all-collections" className="scroll-mt-20">
          <div className="border-t border-stone-200 pt-10 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-sans">
              Browse Art Styles & Themes
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-light">
              Filter by style, format, and artistic medium
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCategories
              .filter(cat => cat.slug !== 'luxury-wall-art') // Hide here as it is featured above
              .map((category) => {
                const explainer = getCategoryExplainer(category.slug);
                return (
                  <div 
                    key={category.id}
                    className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group animate-fade-in"
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100 shrink-0">
                      <img 
                        src={getCatImage(category) || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                        alt={`${category.name} Collection`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
                          {category.count || 0} Pieces
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-stone-900 font-sans group-hover:text-teal-850 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                          {explainer.description}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link 
                          href={`/collections/${category.slug}`}
                          className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-900 group-hover:underline"
                        >
                          <span>Explore Styles</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
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
