const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env file
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/['"]/g, '');
    acc[key] = value;
  }
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Anon Key is missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting Luxury Wall Art database seeding...');

  try {
    // 1. Fetch active digital art prints
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, title, categories, tags, price, images, product_type')
      .eq('status', 'active');

    if (prodError) throw prodError;

    // Filter for art prints (exclude hoodies and other clothing)
    const artProducts = products.filter(p => {
      const isClothing = p.product_type === 'clothing' || 
        (p.categories && p.categories.some(cat => 
          cat.toLowerCase().includes('men') || 
          cat.toLowerCase().includes('women') || 
          cat.toLowerCase().includes('unisex') ||
          cat.toLowerCase().includes('clothing')
        ));
      return !isClothing;
    });

    console.log(`Found ${artProducts.length} active art products in database.`);

    // Selection criteria: abstract, minimalist, landscapes, painting, contemporary
    const premiumKeywords = ['abstract', 'minimalist', 'landscapes', 'painting', 'contemporary', 'floral', 'nature'];
    
    // Sort products: featured first, then products matching premium keywords
    const selectedArtworks = artProducts.filter(p => {
      const categories = (p.categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const combined = [...categories, ...tags].join(' ');
      return premiumKeywords.some(keyword => combined.includes(keyword));
    }).slice(0, 24); // Limit to top 24 premium products

    console.log(`Selected ${selectedArtworks.length} premium products for 'Luxury Wall Art'.`);

    if (selectedArtworks.length === 0) {
      console.log('No suitable premium products found. Exiting.');
      return;
    }

    // Use the image of the first premium artwork as the category cover image
    const firstProductImage = selectedArtworks[0].images?.[0] || '';
    console.log('Using cover image:', firstProductImage);

    // 2. Insert or update the 'luxury-wall-art' category
    const categoryData = {
      name: 'Luxury Wall Art',
      slug: 'luxury-wall-art',
      description: 'Discover our premium, hand-selected collection of luxury wall art prints. Printed on museum-grade archival canvas and paper using lightfast pigment inks, designed to elevate your living room, bedroom, and executive spaces.',
      image: firstProductImage,
      count: selectedArtworks.length,
      featured: true,
      updated_at: new Date().toISOString()
    };

    // Check if category already exists
    const { data: existingCat, error: catFetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'luxury-wall-art')
      .maybeSingle();

    if (catFetchError) throw catFetchError;

    let catId;
    if (existingCat) {
      console.log('Category "luxury-wall-art" already exists. Updating details...');
      const { data: updatedCat, error: catUpdateError } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('slug', 'luxury-wall-art')
        .select('id')
        .single();
      
      if (catUpdateError) throw catUpdateError;
      catId = updatedCat.id;
    } else {
      console.log('Category "luxury-wall-art" does not exist. Creating new category...');
      const { data: insertedCat, error: catInsertError } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (catInsertError) throw catInsertError;
      catId = insertedCat.id;
    }

    console.log(`Category set up successfully with ID: ${catId}`);

    // 3. Update the selected products to include 'Luxury Wall Art' in their categories
    let updatedCount = 0;
    for (const product of selectedArtworks) {
      const currentCategories = product.categories || [];
      
      // Add 'Luxury Wall Art' if not already present
      if (!currentCategories.includes('Luxury Wall Art')) {
        const newCategories = [...currentCategories, 'Luxury Wall Art'];
        
        const { error: prodUpdateError } = await supabase
          .from('products')
          .update({ categories: newCategories })
          .eq('id', product.id);

        if (prodUpdateError) {
          console.error(`Error updating product ${product.title}:`, prodUpdateError.message);
        } else {
          updatedCount++;
        }
      } else {
        console.log(`Product "${product.title}" already has "Luxury Wall Art" category.`);
      }
    }

    console.log(`Seeding complete. Tagged ${updatedCount} products with the 'Luxury Wall Art' category.`);
  } catch (error) {
    console.error('Seeding encountered an error:', error);
    process.exit(1);
  }
}

seed();
