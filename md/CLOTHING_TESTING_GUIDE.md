# Clothing System - Testing Guide 🧪

## Quick Start

### Step 1: Run SQL Setup ✅
```sql
-- In Supabase SQL Editor, run:
-- File: supabase_clothes_setup_database_only.sql
```

Expected Result:
- 10 new columns added to `products` table
- Indexes created
- Helper functions created
- View `clothing_products_view` created

---

### Step 2: Setup Storage Policies 🔐

Go to Supabase Dashboard → Storage → `clothes-images` → Policies

Run these 4 SQL commands **one at a time**:

```sql
-- Policy 1: Upload
CREATE POLICY "Allow authenticated users to upload clothes images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'clothes-images');

-- Policy 2: View
CREATE POLICY "Allow public read access to clothes images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'clothes-images');

-- Policy 3: Update
CREATE POLICY "Allow authenticated users to update clothes images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'clothes-images')
WITH CHECK (bucket_id = 'clothes-images');

-- Policy 4: Delete
CREATE POLICY "Allow authenticated users to delete clothes images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clothes-images');
```

---

## Testing Workflow

### Test 1: Create New Clothing Product 🆕

1. **Navigate:** Admin → Clothes → Create
2. **Fill in all fields:**
   - **SKU:** `HOODIE-BLK-001`
   - **Title:** `Black Oversized Hoodie`
   - **Price:** `1299`
   - **Original Price:** `1999`
   - **Discount %:** `35`
   - **Gender:** Select `Men`
   - **Clothing Type:** `Oversized Hoodies`
   - **Material:** `100% Cotton`
   - **Brand:** `Necessary Milan`
   - **Description:** `Premium quality oversized hoodie...`
   - **Details:** `100% BRUSHED COTTON FLEECE\nWEIGHT - 450 GSM\nEMBROIDERY FRONT AND BACK`
   - **Wash Care:** `USE COLD WATER TO PROTECT AGAINST FADING & SHRINKING.\nAVOID HARSHER DETERGENTS & TURN THEM INSIDE OUT FOR THE WASH.`
   - **Shipping:** `SHIPPED WITHIN 24 HOURS.\nFREE DELIVERY PAN-INDIA.\nDISPATCHES NEXT DAY.`
   - **Sizes:** Select `S`, `M`, `L`, `XL`, `XXL`
   - **Colors:** Select `Black`, `White`, `Navy`
   - **Images:** Upload at least 1 image

3. **Click:** Create Product

**Expected Results:**
- ✅ Success notification: "Clothing product created successfully!"
- ✅ Redirected to "All" tab
- ✅ Product appears in grid
- ✅ Product shows in "Men" tab
- ✅ Current price shown: ₹1299 (auto-calculated from discount)

---

### Test 2: Verify Database Storage 💾

In Supabase SQL Editor, run:

```sql
SELECT 
  id, 
  title, 
  productid,
  gender,
  clothingtype,
  material,
  brand,
  details,
  washcare,
  shipping,
  price,
  originalprice,
  discountpercentage
FROM products 
WHERE productid = 'HOODIE-BLK-001';
```

**Expected Results:**
- ✅ 1 row returned
- ✅ All fields populated with entered data
- ✅ `gender` = 'Men'
- ✅ `productid` = 'HOODIE-BLK-001'
- ✅ `originalprice` = 1999
- ✅ `discountpercentage` = 35
- ✅ `price` = 1299

---

### Test 3: Edit Product ✏️

1. **Navigate:** Admin → Clothes → All
2. **Hover** over the product card
3. **Click** Edit (blue pencil icon)

**Expected Results:**
- ✅ Modal opens
- ✅ All fields pre-filled with saved data:
  - SKU: `HOODIE-BLK-001`
  - Title: `Black Oversized Hoodie`
  - Price: `1299`
  - Original Price: `1999`
  - Discount: `35`
  - Gender: `Men` selected
  - Clothing Type: `Oversized Hoodies` selected
  - Material: `100% Cotton`
  - Brand: `Necessary Milan`
  - Description, Details, Wash Care, Shipping: All populated
  - Sizes: S, M, L, XL, XXL selected
  - Colors: Black, White, Navy selected
  - Images: All images shown

4. **Modify** some fields:
   - Change price to `1199`
   - Add size `XXXL`
   - Update material to `100% Brushed Cotton`

5. **Click** Update Product

**Expected Results:**
- ✅ Success notification: "Product updated successfully!"
- ✅ Modal closes
- ✅ Changes reflected immediately in product grid

---

### Test 4: SKU Duplicate Validation 🚫

1. **Navigate:** Admin → Clothes → Create
2. **Fill in:**
   - **SKU:** `HOODIE-BLK-001` (same as existing product)
   - **Title:** `Another Hoodie`
   - Fill other required fields

3. **Click:** Create Product

**Expected Results:**
- ❌ Error notification: "SKU 'HOODIE-BLK-001' already exists. Please use a unique SKU."
- ❌ Product NOT created

---

### Test 5: Frontend Display 🖥️

1. **Navigate:** Frontend → Men (or `/men`)
2. **Verify** product appears in grid
3. **Click** on the product

**Expected Results on Product Page:**
- ✅ Product title shown
- ✅ Price: ~~₹1999~~ **₹1299** (strikethrough + orange)
- ✅ Discount badge: "35% OFF"
- ✅ Sizes: S, M, L, XL, XXL, XXXL buttons
- ✅ Colors: Black, White, Navy buttons
- ✅ Description section populated
- ✅ Details section shows custom text
- ✅ Wash Care section shows custom text
- ✅ Shipping section shows custom text
- ✅ Size chart displays for "Oversized Hoodies"

---

### Test 6: Image Upload 📸

1. **Navigate:** Admin → Clothes → Create
2. **Click** "Choose Files" under "Add Images (File Upload)"
3. **Select** 2-3 images (JPEG, PNG, max 10MB each)

**Expected Results:**
- ✅ Upload progress shown
- ✅ Success notification: "Successfully uploaded X image(s)"
- ✅ Images appear in preview grid
- ✅ Can remove individual images with X button

4. **Complete** the product creation
5. **Verify** images saved

**Expected Results:**
- ✅ Product shows all uploaded images
- ✅ First image is main image
- ✅ Images displayed on product page
- ✅ Image thumbnails work on product page

---

### Test 7: Discount Auto-Calculation 🧮

1. **Navigate:** Admin → Clothes → Create
2. **Enter:**
   - Original Price: `2000`
   - Discount %: `25`

**Expected Results:**
- ✅ Current Price auto-updates to `1500`

3. **Change:**
   - Discount %: `50`

**Expected Results:**
- ✅ Current Price auto-updates to `1000`

4. **Change:**
   - Original Price: `3000`
   - (Keep discount at 50%)

**Expected Results:**
- ✅ Current Price auto-updates to `1500`

---

### Test 8: Delete Product 🗑️

1. **Navigate:** Admin → Clothes → All
2. **Hover** over a product
3. **Click** Delete (red trash icon)

**Expected Results:**
- ✅ Confirmation modal appears: "Are you sure you want to delete this product?"

4. **Click** Confirm

**Expected Results:**
- ✅ Success notification: "Product deleted successfully!"
- ✅ Product removed from grid
- ✅ Product count updated

---

### Test 9: Gender Filtering 🚹🚺

1. **Create products with different genders:**
   - Product A: Gender = Men
   - Product B: Gender = Women
   - Product C: Gender = Men

2. **Navigate:** Admin → Clothes → Men

**Expected Results:**
- ✅ Shows Product A and Product C only
- ✅ Product count: "2"

3. **Navigate:** Admin → Clothes → Women

**Expected Results:**
- ✅ Shows Product B only
- ✅ Product count: "1"

4. **Navigate:** Admin → Clothes → All

**Expected Results:**
- ✅ Shows all 3 products
- ✅ Product count: "3"

---

### Test 10: Size Chart Display 📏

Create products with different clothing types and verify size charts:

1. **Product with "Oversized Hoodies"**
   - ✅ Shows 6 columns: SIZE, LENGTH, CHEST, SHOULDER, SLEEVE LENGTH, ARMHOLE
   - ✅ Shows sizes: S, M, L, XL, XXL

2. **Product with "Extra Oversized Hoodies"**
   - ✅ Shows 6 columns (same as above)
   - ✅ Different measurements than Oversized

3. **Product with "Regular Sized Sweatshirt"**
   - ✅ Shows 3 columns: SIZE, LENGTH, CHEST
   - ✅ Shows sizes: S, M, L, XL, XXL, XXXL

4. **Product with "Oversized T-Shirt"**
   - ✅ Shows 4 columns: SIZE, LENGTH, CHEST, SLEEVE
   - ✅ Shows sizes: S, M, L, XL

---

## Common Issues & Solutions

### Issue: Images not uploading
**Solution:**
- Verify `clothes-images` bucket exists
- Check storage policies are created
- Ensure file size < 10MB
- Ensure file type is JPEG, PNG, GIF, or WEBP

### Issue: Products not showing in Men/Women tabs
**Solution:**
- Check `gender` field is set in database
- Verify filtering logic uses `gender` not `categories`
- Check product was created after integration

### Issue: Fields showing as "undefined"
**Solution:**
- Run SQL setup script to add columns
- Verify field names match (camelCase in code, lowercase in DB)
- Check product was created/updated after integration

### Issue: Discount not calculating
**Solution:**
- Ensure both `originalPrice` and `discountPercentage` have values
- Check calculation: `price = originalPrice - (originalPrice * discount / 100)`
- Verify rounding to whole number

---

## Database Verification Queries

### Check all clothing products:
```sql
SELECT * FROM clothing_products_view;
```

### Check product counts by gender:
```sql
SELECT gender, COUNT(*) as count
FROM products
WHERE gender IS NOT NULL
GROUP BY gender;
```

### Check products with discounts:
```sql
SELECT 
  title, 
  productid,
  originalprice, 
  discountpercentage, 
  price,
  (originalprice - price) as saved_amount
FROM products 
WHERE discountpercentage > 0;
```

### Verify storage policies:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%clothes%';
```

---

## Success Criteria ✨

All tests pass when:
- ✅ Products can be created with all fields
- ✅ All fields save to database correctly
- ✅ Products can be edited and updated
- ✅ Products can be deleted
- ✅ SKU duplicate validation works
- ✅ Discount auto-calculation works
- ✅ Images upload successfully
- ✅ Frontend displays all saved data
- ✅ Size charts display correctly
- ✅ Gender filtering works
- ✅ No console errors

---

**Happy Testing!** 🎉

If all tests pass, your clothing system is fully integrated and production-ready! 🚀

