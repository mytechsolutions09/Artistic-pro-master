import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import ProductCard from '@/src/components/ProductCard';
import { Link } from '@/src/compat/router';

export const metadata: Metadata = {
  title: 'Digital Art Prints — Curated Wall Art for Indian Homes | Lurevi',
  description: 'Shop digital art prints in India. Lurevi curates modern wall art from independent artists — archival-quality prints, delivered to your door. Free shipping above ₹999.',
  alternates: { canonical: 'https://lurevi.in/categories/digital-art-prints' },
};

export const revalidate = 3600;

export default async function DigitalArtPrintsPage() {
  const supabase = createStaticClient();

  // Fetch top digital art prints. 
  // If exact category match doesn't exist, this will just fetch some products to populate the list.
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .contains('categories', ['digital-art-prints'])
    .limit(8);
    
  // Fallback to regular products if none specifically match
  let displayProducts = products || [];
  if (displayProducts.length === 0) {
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('*')
      .limit(20);
    displayProducts = fallbackProducts || [];
  }

  // Filter out clothing products
  displayProducts = displayProducts.filter(product => {
    const isClothing = 
      product.gender === 'Men' || 
      product.gender === 'Women' || 
      product.gender === 'Unisex' ||
      (product.categories && product.categories.some((cat: string) => 
        cat.toLowerCase().includes('men') || 
        cat.toLowerCase().includes('women') || 
        cat.toLowerCase().includes('unisex') ||
        cat.toLowerCase().includes('clothing')
      ));
    return !isClothing;
  }).slice(0, 8);

  // Generate structured data
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lurevi.in" },
      { "@type": "ListItem", "position": 2, "name": "Digital Art Prints", "item": "https://lurevi.in/categories/digital-art-prints" }
    ]
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are digital art prints?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Digital art prints are high-resolution reproductions of artwork created digitally — using tools like Procreate, Photoshop, or Illustrator. They are printed on archival paper or canvas and offer the same visual quality as traditional prints."
        }
      },
      {
        "@type": "Question",
        "name": "Are Lurevi's digital art prints original?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every piece in Lurevi's collection is curated from independent artists. Prints are produced under license and are not mass-market stock images."
        }
      },
      {
        "@type": "Question",
        "name": "What sizes do Lurevi's digital art prints come in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer sizes from A4 (21×30 cm) up to A1 (59×84 cm). Custom sizing is available on request — contact us before placing your order."
        }
      },
      {
        "@type": "Question",
        "name": "Do you ship digital art prints across India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we ship to all major cities and most pin codes across India. Standard delivery takes 5–7 business days. Free shipping on orders above ₹999."
        }
      },
      {
        "@type": "Question",
        "name": "How should I frame a digital art print?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard frame sizes available at most Indian framing shops (like Ikea Ribba, local frame-wallahs) align with our print dimensions. We recommend a white or natural wood frame with a mat board for the cleanest look."
        }
      }
    ]
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": displayProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.title,
        "image": product.images?.[0] || '',
        "url": `https://lurevi.in/shop/${product.slug || product.id}`,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "INR",
          "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 space-y-6">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">Digital Art Prints</span>
            </nav>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Digital art prints
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Modern, curated wall art from independent artists — printed and delivered across India.
            </p>
            <div className="pt-4">
              <a href="#product-grid" className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                Shop all prints
              </a>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-100">
              <img 
                src={displayProducts[0]?.images?.[0] || ""} 
                alt="Curated digital art prints for Indian homes — Lurevi" 
                className="w-full h-full object-cover"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Intro Copy */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed font-serif italic opacity-90">
            Digital art prints bring together the precision of technology and the sensibility of a human artist. At Lurevi, every print in this collection is hand-selected — chosen for how it reads on a wall, not just a screen.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            Whether you're looking for a bold statement piece for your living room or something quieter for a home office, our <Link to="/categories/digital-wall-paintings" className="text-pink-600 hover:underline">digital wall painting</Link> and <Link to="/blog/what-is-digital-art" className="text-pink-600 hover:underline">what is digital art</Link> collections are available in multiple sizes and printed on archival-quality paper. Each order ships across India within 5–7 business days.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section id="product-grid" className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Curations</h2>
            {/* Optional Filter Bar could go here */}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Left Column: Context */}
            <div className="space-y-12">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Curated for Indian spaces</h2>
                <p className="text-gray-600 leading-relaxed">
                  Indian home aesthetics vary widely — Lurevi's curation covers both contemporary and traditional-leaning styles. Our artworks work exceptionally well in typical Indian room proportions, offering popular sizes like A3, A2, and 12×18. Furthermore, our color grading is carefully chosen to complement the warm lighting conditions commonly found in Indian interiors. To learn more about selecting the perfect piece, read our guide on <Link to="/blog/digital-artwork-for-home" className="text-pink-600 hover:underline">how to choose digital artwork</Link>.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Print quality that lasts</h2>
                <p className="text-gray-600 leading-relaxed">
                  Will it look good in person? Yes. We print exclusively on 240+ GSM archival-grade paper and canvas. By utilizing pigment-based inks and a strictly color-calibrated process, we ensure museum-level color accuracy. Unlike mass printed stock, each <Link to="/categories" className="text-pink-600 hover:underline">digital illustration prints</Link> is produced to order for you.
                </p>
              </div>
            </div>

            {/* Right Column: Size Guide */}
            <div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to choose the right size</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-4 px-4 text-sm font-semibold text-gray-900 bg-gray-50 rounded-tl-lg">Room / Placement</th>
                        <th className="py-4 px-4 text-sm font-semibold text-gray-900 bg-gray-50 rounded-tr-lg">Recommended Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-700">Living room (feature wall)</td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-medium">A1 (59×84 cm) or 24×36 in</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-700">Bedroom</td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-medium">A2 (42×59 cm) or 18×24 in</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-700">Home office / study</td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-medium">A3 (30×42 cm) or 12×18 in</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-700">Hallway / nook</td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-medium">A4 (21×30 cm) or 8×10 in</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are digital art prints?</h3>
              <p className="text-gray-600">Digital art prints are high-resolution reproductions of artwork created digitally — using tools like Procreate, Photoshop, or Illustrator. They are printed on archival paper or canvas and offer the same visual quality as traditional prints.</p>
            </div>
            
            <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are Lurevi's digital art prints original?</h3>
              <p className="text-gray-600">Every piece in Lurevi's collection is curated from independent artists. Prints are produced under license and are not mass-market stock images.</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What sizes do Lurevi's digital art prints come in?</h3>
              <p className="text-gray-600">We offer sizes from A4 (21×30 cm) up to A1 (59×84 cm). Custom sizing is available on request — contact us before placing your order.</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you ship digital art prints across India?</h3>
              <p className="text-gray-600">Yes, we ship to all major cities and most pin codes across India. Standard delivery takes 5–7 business days. Free shipping on orders above ₹999.</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How should I frame a digital art print?</h3>
              <p className="text-gray-600">Standard frame sizes available at most Indian framing shops (like Ikea Ribba, local frame-wallahs) align with our print dimensions. We recommend a white or natural wood frame with a mat board for the cleanest look.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
