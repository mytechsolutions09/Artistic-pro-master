# Inventory Management System 📦

## Overview
The inventory system automatically tracks stock quantities **ONLY for clothing products**. All digital art products remain unlimited. This ensures you never oversell physical clothing items while keeping your digital products always available.

---

## 🚀 Activation Steps

### Step 1: Run SQL Migration
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Open the file `activate_inventory.sql`
4. Copy all contents and paste in SQL Editor
5. Click "Run" to execute

### Step 2: Automatic Configuration
After running the SQL, the system will **automatically**:
- ✅ Enable inventory tracking for **all clothing products**
- ✅ Set default stock quantity to **100 units** for each clothing item
- ✅ Set low stock threshold to **10 units**
- ✅ Keep **all digital/art products unlimited** (no tracking)

### Step 3: Verify Installation
You should have:
- ✅ 3 new columns in products table
- ✅ 2 views for stock monitoring
- ✅ 2 functions for stock management
- ✅ Clothing products automatically configured with stock tracking

---

## 🔍 How Products Are Classified

### Clothing Products (Inventory Tracked) 👕
Products are **automatically identified** as clothing if they have:
- A `gender` field (e.g., "men", "women", "unisex")
- **OR** categories containing: "men", "women", "clothing", or "apparel"

**These products automatically get:**
- ✅ `track_inventory = true`
- ✅ `stock_quantity = 100` (default)
- ✅ `low_stock_threshold = 10`

### Digital/Art Products (Unlimited) 🎨
Products without gender or clothing categories are treated as digital/art:
- ❌ No gender field
- ❌ No clothing-related categories

**These products automatically get:**
- ✅ `track_inventory = false`
- ✅ `stock_quantity = NULL`
- ✅ **Always available** - never show out of stock

---

## 📊 Database Schema

### New Columns Added to `products` Table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `stock_quantity` | INTEGER | NULL | Available stock (NULL = unlimited) |
| `low_stock_threshold` | INTEGER | 10 | Alert when stock falls below this |
| `track_inventory` | BOOLEAN | false | Enable inventory tracking |

---

## 🎯 How to Use

### For Digital Products (Unlimited Stock)
- Set `track_inventory` = `false`
- Leave `stock_quantity` as `NULL`
- Product will never show as out of stock

### For Physical Products (Limited Stock)
- Set `track_inventory` = `true`
- Set `stock_quantity` to available quantity (e.g., 100)
- Set `low_stock_threshold` to alert level (e.g., 10)

---

## 💡 Examples

### Example 1: Digital Artwork (Unlimited)
```sql
UPDATE products SET
  track_inventory = false,
  stock_quantity = NULL
WHERE productType = 'digital';
```

### Example 2: Clothing Item (Limited Stock)
```sql
UPDATE products SET
  track_inventory = true,
  stock_quantity = 50,
  low_stock_threshold = 5
WHERE productId = 'HOODIE-001';
```

### Example 3: Check Low Stock Products
```sql
SELECT * FROM low_stock_products;
```

### Example 4: Check Out of Stock Products
```sql
SELECT * FROM out_of_stock_products;
```

---

## 🔧 Functions Available

### 1. Reduce Stock (After Sale)
```sql
SELECT reduce_product_stock(
  '12345-uuid-here'::UUID,  -- Product ID
  2                           -- Quantity sold
);
```
Returns `TRUE` if successful, `FALSE` if insufficient stock.

### 2. Add Stock (Restocking)
```sql
SELECT add_product_stock(
  '12345-uuid-here'::UUID,  -- Product ID
  20                          -- Quantity to add
);
```
Returns `TRUE` if successful.

---

## 📈 Monitoring Stock Levels

### View Low Stock Products
```sql
SELECT * FROM low_stock_products 
ORDER BY stock_quantity ASC;
```

### View Out of Stock Products
```sql
SELECT * FROM out_of_stock_products;
```

### Get Stock Status for Specific Product
```sql
SELECT 
  title,
  stock_quantity,
  low_stock_threshold,
  CASE 
    WHEN track_inventory = false THEN 'Unlimited'
    WHEN stock_quantity IS NULL THEN 'Unlimited'
    WHEN stock_quantity <= 0 THEN 'Out of Stock'
    WHEN stock_quantity <= low_stock_threshold THEN 'Low Stock'
    ELSE 'In Stock'
  END as status
FROM products
WHERE productId = 'YOUR-SKU-HERE';
```

---

## 🎨 Admin UI Integration

### Clothes Admin Panel
The inventory fields will automatically appear in:
- Create Product form
- Edit Product modal

### Fields to Add in Admin UI:
1. **Track Inventory** (Checkbox)
2. **Stock Quantity** (Number input)
3. **Low Stock Threshold** (Number input)

---

## 🔔 Stock Alerts

### Products Below Threshold
```sql
SELECT 
  productId as sku,
  title,
  stock_quantity,
  low_stock_threshold
FROM low_stock_products;
```

### Auto-Alert Query (for notifications)
```sql
SELECT COUNT(*) as low_stock_count
FROM low_stock_products;
```

---

## 🛒 Order Integration

### When Order is Placed
Automatically reduce stock:
```javascript
// In your order completion code
await supabase.rpc('reduce_product_stock', {
  product_uuid: productId,
  quantity_sold: quantity
});
```

### Stock Validation Before Checkout
```javascript
const { data } = await supabase
  .from('products')
  .select('stock_quantity, track_inventory')
  .eq('id', productId)
  .single();

if (data.track_inventory && data.stock_quantity < requestedQuantity) {
  // Show "Insufficient stock" error
}
```

---

## 📱 Frontend Display

### Show Stock Status
```javascript
function getStockStatus(product) {
  if (!product.trackInventory) return 'In Stock';
  if (!product.stockQuantity) return 'In Stock';
  if (product.stockQuantity <= 0) return 'Out of Stock';
  if (product.stockQuantity <= product.lowStockThreshold) {
    return `Only ${product.stockQuantity} left!`;
  }
  return 'In Stock';
}
```

### Disable Add to Cart if Out of Stock
```javascript
const isOutOfStock = product.trackInventory && 
                     product.stockQuantity !== null && 
                     product.stockQuantity <= 0;
```

---

## 🔄 Stock Management Workflows

### Daily Stock Check
```sql
-- Run this daily to monitor stock
SELECT 
  'Low Stock' as alert_type,
  COUNT(*) as product_count
FROM low_stock_products
UNION ALL
SELECT 
  'Out of Stock' as alert_type,
  COUNT(*) as product_count
FROM out_of_stock_products;
```

### Bulk Restock
```sql
-- Add 50 units to all hoodies
UPDATE products 
SET stock_quantity = stock_quantity + 50
WHERE clothingType = 'Oversized Hoodies'
  AND track_inventory = true;
```

### Set All Digital Products to Unlimited
```sql
UPDATE products 
SET track_inventory = false,
    stock_quantity = NULL
WHERE productType = 'digital';
```

---

## 🚨 Important Notes

1. **Digital Products**: Always set `track_inventory = false`
2. **NULL Stock**: NULL means unlimited (not zero!)
3. **Zero Stock**: Product is out of stock
4. **Threshold**: Recommended 5-10% of total stock
5. **Negative Stock**: Not allowed by the functions

---

## 🎯 Next Steps

1. ✅ Run `activate_inventory.sql` in Supabase
2. ✅ TypeScript types already updated in `src/types/index.ts`
3. ⏳ Add UI fields to admin panels (optional)
4. ⏳ Integrate stock reduction on order completion (optional)
5. ⏳ Add stock status display on product pages (optional)

---

## 📞 Support

For questions or issues with inventory management:
- Check Supabase logs for SQL errors
- Verify columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name LIKE '%stock%';`
- Test functions manually in SQL Editor first

---

**Inventory System v1.0**
Created: 2025-01-04

