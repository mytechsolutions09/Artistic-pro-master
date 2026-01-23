# Commissioned Art - Quick Start Guide

## ✅ What's Been Implemented

### 1. Database Setup
- **File**: `database/commissioned_art_setup.sql`
- Complete table schema with all fields
- RLS policies for security
- Sample data included
- Automatic timestamp updates

### 2. Service Layer
- **File**: `src/services/commissionedArtService.ts`
- Full CRUD operations
- Status and progress tracking
- Customer filtering
- Statistics dashboard

### 3. Admin Interface
- **File**: `src/pages/admin/CommissionedArt.tsx`
- Beautiful admin dashboard
- Grid and list view modes
- Advanced filtering and search
- Create, edit, delete commissions
- Real-time statistics

### 4. Navigation
- **File**: `src/components/admin/Sidebar.tsx` (already updated)
- **File**: `src/App.tsx` (already updated)
- Route: `/admin/commissioned-art`

## 🚀 How to Activate

### Step 1: Run Database Setup

Go to your Supabase project:
1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste contents from: `database/commissioned_art_setup.sql`
6. Click **Run** or press `Ctrl+Enter`
7. You should see: "Commissioned Art Management System setup completed successfully!"

### Step 2: Verify the Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to admin panel:
   ```
   http://localhost:5173/admin
   ```

3. Login with admin credentials

4. Click on **"Commissioned Art"** in the left sidebar (with Brush icon)

5. You should see:
   - 4 sample commissions loaded
   - Statistics dashboard at the top
   - List/Grid view options
   - Filter and search functionality

### Step 3: Test CRUD Operations

#### Create a New Commission:
1. Click **"New Commission"** button
2. Fill in the form:
   - Customer Name: "Test Customer"
   - Customer Email: "test@example.com"
   - Commission Title: "Test Portrait"
   - Art Type: Select from dropdown
   - Status: "Inquiry"
   - Priority: "Normal"
3. Click **"Create Commission"**

#### Edit a Commission:
1. Click the **Edit icon** (pencil) on any commission
2. Update any fields (e.g., change status to "In Progress")
3. Click **"Update Commission"**

#### Delete a Commission:
1. Click the **Delete icon** (trash) on any commission
2. Confirm deletion
3. Commission should be removed

## 📊 Features Overview

### Dashboard Statistics
- **Total**: All commissions count
- **Inquiry**: New requests
- **In Progress**: Active commissions
- **Completed**: Finished artworks
- **Delivered**: Delivered to customers
- **Revenue**: Total from completed commissions

### Filter Options
- **Status**: Filter by inquiry, quoted, in progress, etc.
- **Priority**: Filter by low, normal, high, urgent
- **Search**: Search by customer name, email, or title
- **Sort**: By date, customer, delivery date, or price

### View Modes
- **List View**: Detailed table with all information
- **Grid View**: Card layout for quick overview

## 🎨 Commission Workflow

### Typical Flow:
1. **Inquiry** → Customer makes initial request
2. **Quoted** → You send price quote
3. **Accepted** → Customer accepts quote
4. **In Progress** → Artist working on piece (update progress %)
5. **Review** → Customer reviews artwork
6. **Completed** → Artwork finished
7. **Delivered** → Delivered to customer

## 💰 Pricing Fields

- **Budget Min/Max**: Customer's budget range
- **Quoted Price**: Your initial quote
- **Final Price**: Agreed upon price
- **Deposit Paid**: Deposit amount received

## 📅 Timeline Tracking

- **Requested Delivery Date**: Customer's desired date
- **Estimated Completion**: Your estimated date
- **Actual Completion**: When it was actually finished
- **Progress**: Percentage completion (0-100%)

## 🎯 Priority Levels

- **Low**: No rush, flexible timeline
- **Normal**: Standard processing
- **High**: Expedited, important client
- **Urgent**: Rush order, ASAP

## 📧 Customer Information

Each commission tracks:
- Customer name
- Customer email
- Customer phone (optional)
- Customer ID (linked to user account if logged in)

## 🔒 Security

- **Admin Access**: Full control over all commissions
- **User Access**: Can view and create their own commissions
- **RLS Policies**: Automatic database-level security

## 📱 Responsive Design

- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Responsive grid layouts

## 🛠️ Customization

### Change Art Types
Edit `src/services/commissionedArtService.ts`:
```typescript
art_type: 'painting' | 'digital' | 'sculpture' | 'mixed_media' | 'illustration' | 'custom'
```

### Add More Status Options
Edit the database enum in `commissioned_art_setup.sql` and update the TypeScript types.

### Modify Fields
- Update database schema
- Update TypeScript interface
- Update admin form

## 📚 Documentation

Full documentation available at: `docs/COMMISSIONED_ART_SETUP.md`

## ✨ Next Steps

After basic setup:
1. Add image upload for reference images
2. Set up email notifications
3. Create customer-facing commission tracking
4. Integrate payment gateway for deposits
5. Add automated invoicing

## 🐛 Troubleshooting

**Issue**: Can't see "Commissioned Art" in sidebar
- **Fix**: Check that you accepted the Sidebar.tsx changes

**Issue**: Page loads but shows error
- **Fix**: Make sure database table is created (Step 1)

**Issue**: No sample data showing
- **Fix**: Re-run the SQL script, check INSERT statements

**Issue**: Can't create commissions
- **Fix**: Check Supabase connection, verify RLS policies

## 🎉 You're All Set!

The Commissioned Art management system is now fully activated and ready to use. Start managing your custom art commissions with ease!

---

**Need Help?** Check the full documentation or review the code comments for more details.

