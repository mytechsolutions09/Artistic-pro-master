# ✅ Selective Product Export Feature

## What's New

The Product Catalog Export now supports **selective product export**! You can choose exactly which products to export to CSV instead of exporting everything.

---

## 🎯 Key Features

### 1. **Individual Product Selection**
- ☑️ Checkbox next to each product
- Click checkbox OR click the entire row to select
- Selected rows are highlighted in blue

### 2. **Bulk Selection**
- 🔲 **Select All** button - selects all products at once
- ☑️ **Deselect All** button - clears all selections
- Header checkbox for quick toggle

### 3. **Smart Export Button**
The export button text changes dynamically:
- No selection: **"Export All 17 Products"**
- 5 selected: **"Export 5 Selected Products"**
- 1 selected: **"Export 1 Selected Product"**

### 4. **Clear Selection**
- A "Clear Selection" button appears when products are selected
- One-click reset to start fresh

### 5. **Visual Feedback**
- Selected rows have blue background (`bg-blue-50`)
- Hover effects for better user experience
- Selection count shown in real-time

---

## 📋 How to Use

### **Option 1: Export All Products (Default Behavior)**

1. Don't select any products
2. Click **"Export All X Products"**
3. All products will be exported

### **Option 2: Export Selected Products**

1. **Select Individual Products:**
   - Click checkbox next to each product you want
   - Or click the entire row to toggle selection

2. **Select All Products:**
   - Click the **"Select All"** button in the top-right
   - Or click the checkbox in the table header

3. **Export:**
   - Click **"Export X Selected Products"**
   - Only selected products will be exported

4. **Clear Selection (Optional):**
   - Click **"Clear Selection"** to start over

---

## 🎨 UI/UX Improvements

### Visual Indicators
- **Unselected Row:** White background, gray text
- **Selected Row:** Light blue background (`bg-blue-50`)
- **Hover:** Blue tint on hover for better feedback

### Smart Button States
- Button text adapts to show what will be exported
- Export count always visible
- Disabled state when no products available

### Responsive Design
- Works on all screen sizes
- Touch-friendly checkboxes
- Scrollable table for many products

---

## 🔧 Technical Details

### Component Changes
**File:** `src/components/admin/ProductExport.tsx`

- Added `selectedIds` state (Set<string>)
- Added `allProducts` state to store all products
- Added `toggleSelectAll()` function
- Added `toggleSelectProduct()` function
- Updated export button to show selection count
- Added checkboxes to product table

### Service Changes
**File:** `src/services/productCatalogExport.ts`

```typescript
static async exportToCSV(productIds?: string[]): Promise<{...}>
```

- Added optional `productIds` parameter
- Filters products by IDs if provided
- Falls back to exporting all if no IDs provided

### Export Logic
```typescript
// If products selected → export only those
const productIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
const result = await ProductCatalogExportService.exportToCSV(productIds);
```

---

## 📊 Preview Section

The preview table now shows:
- ☑️ Checkbox column
- 🆔 Product ID (shortened)
- 📝 Title
- 💰 Price
- ✅ Availability (in stock / out of stock)
- 🔗 View Link

**First 10 products** are shown in the preview for better performance.

---

## 🚀 Use Cases

### 1. **Seasonal Products**
Export only winter collection or summer products

### 2. **Category-Specific**
Export hoodies separately from t-shirts

### 3. **New Arrivals**
Export only the latest products for a special campaign

### 4. **Testing**
Export a few products first to test Facebook catalog integration

### 5. **Out of Stock Management**
Export only in-stock or out-of-stock products

---

## ✅ Benefits

1. **More Control** - Export exactly what you need
2. **Save Time** - No need to export and then filter
3. **Facebook Catalog** - Update specific products only
4. **Testing** - Test with a subset before bulk upload
5. **Campaign-Specific** - Create targeted product feeds

---

## 🎯 Where to Find It

1. Go to **Admin Panel**
2. Click **Clothes** in the sidebar
3. Click **Export** tab
4. Scroll down to **"Select Products to Export"** section
5. Use checkboxes to select products
6. Click the export button

---

## 📝 Example Workflow

### Exporting Only Hoodies for Instagram

1. Go to `Admin → Clothes → Export`
2. Scroll to product list
3. Select only hoodie products (check their boxes)
4. Button now shows: **"Export 5 Selected Products"**
5. Click the button
6. Download `product-catalog.csv` with only hoodies
7. Upload to Facebook Commerce Manager
8. Enable Instagram Shopping for hoodies only!

---

## 🔄 Default Behavior Preserved

**Important:** If you don't select any products, the system will export ALL products by default. This ensures backward compatibility and prevents confusion.

---

## 💡 Pro Tips

1. **Select All First** - Then deselect what you don't want
2. **Use Clear Selection** - To quickly start over
3. **Visual Confirmation** - Selected rows turn blue
4. **Button Text** - Always shows what will be exported
5. **No Selection = All** - Default is to export everything

---

## 🐛 Edge Cases Handled

- ✅ No products selected → exports all
- ✅ All products selected → exports all
- ✅ Single product selected → exports one
- ✅ Invalid product IDs → filtered out automatically
- ✅ Products deleted after selection → handled gracefully

---

## 📞 Need Help?

If you have any questions or issues:
1. Check the statistics at the top of the page
2. Use the refresh button to reload products
3. Clear selection and try again
4. Check browser console for errors

---

## 🎉 Ready to Use!

The feature is live and ready to use. Refresh the Export page to see the new selection capabilities!

**Location:** `Admin → Clothes → Export → Select Products to Export`

Happy exporting! 🚀

