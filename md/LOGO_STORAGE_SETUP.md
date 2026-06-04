# Logo Storage Setup Guide

This guide explains how to set up the logo storage system in Supabase for consistent logo display across production and local environments.

## Overview

The logo system now uses Supabase storage to store and serve logos, ensuring consistency between local and production environments. The system supports both uploaded image files and text-based SVG generation.

## Setup Instructions

### 1. Run the SQL Setup Script

Execute the `setup_logo_storage_bucket.sql` script in your Supabase SQL editor:

```sql
-- This creates:
-- 1. A 'logos' storage bucket
-- 2. logo_settings table
-- 3. Proper RLS policies
-- 4. Default logo settings
```

### 2. Storage Bucket Configuration

The script creates a `logos` bucket with:
- **Public access**: Yes (logos need to be publicly accessible)
- **File size limit**: 5MB
- **Allowed types**: JPEG, PNG, WebP, SVG, GIF
- **RLS policies**: Public read, authenticated upload/update/delete

### 3. Database Table

The `logo_settings` table stores:
- `logo_url`: URL to the logo file (Supabase storage or external)
- `logo_text`: Text content for generated logos
- `logo_color`: Text color
- `background_color`: Background color
- `show_underline`: Whether to show underline
- `underline_color`: Underline color
- `font_size`: Font size in pixels
- `font_family`: Font family name
- `is_active`: Whether this is the active logo setting

## Components

### LogoService (`src/services/logoService.ts`)

Handles all logo-related operations:
- `getActiveLogoSettings()`: Get current logo settings
- `updateLogoSettings()`: Update logo settings
- `uploadLogoFile()`: Upload image files to storage
- `deleteLogoFile()`: Delete files from storage
- `generateSVGLogo()`: Generate SVG from text settings
- `uploadGeneratedSVG()`: Upload generated SVG to storage

### useLogo Hook (`src/hooks/useLogo.ts`)

React hook for components to access logo:
- Loads logo from Supabase storage
- Falls back to localStorage for backward compatibility
- Listens for logo updates from admin panel
- Provides loading state

### LogoSettings Component (`src/components/admin/settings/LogoSettings.tsx`)

Admin interface for managing logos:
- Upload custom logo files
- Configure text-based logos
- Preview changes
- Save settings to Supabase
- Download generated SVGs

### Header Component Updates

The Header component now uses the `useLogo` hook to:
- Load logo from Supabase storage
- Display loading state
- Handle fallback to default logo on error

## Usage

### For Administrators

1. Go to Admin Panel → Settings → Logo Settings
2. Upload a custom logo file OR configure text-based logo
3. Preview your changes
4. Click "Save Settings"
5. Logo updates across the entire site

### For Developers

```typescript
// Use the logo hook in any component
import { useLogo } from '../hooks/useLogo';

const MyComponent = () => {
  const { logoUrl, isLoading } = useLogo();
  
  return (
    <img 
      src={logoUrl} 
      alt="Logo" 
      className="h-12 w-auto"
    />
  );
};
```

## Migration from localStorage

The system maintains backward compatibility:
1. First tries to load from Supabase storage
2. Falls back to localStorage if Supabase is unavailable
3. Finally falls back to default logo file

## Troubleshooting

### Logo Not Showing in Production

1. **Check storage bucket**: Ensure `logos` bucket exists and is public
2. **Check RLS policies**: Verify public read policy is active
3. **Check logo_settings table**: Ensure there's an active record
4. **Check file URL**: Verify the logo_url points to a valid file

### Upload Failures

1. **File size**: Ensure file is under 5MB
2. **File type**: Only JPEG, PNG, WebP, SVG, GIF allowed
3. **Permissions**: Ensure user is authenticated
4. **Storage quota**: Check Supabase storage limits

### RLS Policy Issues

If you encounter RLS errors, run:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE logo_settings DISABLE ROW LEVEL SECURITY;

-- Re-enable with permissive policies
ALTER TABLE logo_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
CREATE POLICY "Allow all access to logo_settings" ON logo_settings
    FOR ALL USING (true);
```

## File Structure

```
src/
├── services/
│   └── logoService.ts          # Logo operations
├── hooks/
│   └── useLogo.ts              # Logo React hook
├── components/
│   ├── Header.tsx              # Updated to use logo hook
│   └── admin/settings/
│       └── LogoSettings.tsx    # Admin logo management
└── setup_logo_storage_bucket.sql # Database setup script
```

## Benefits

1. **Consistency**: Same logo across all environments
2. **Centralized Management**: Single admin interface
3. **Scalability**: CDN delivery via Supabase storage
4. **Flexibility**: Support for both images and generated SVGs
5. **Backward Compatibility**: Works with existing localStorage setups
6. **Performance**: Optimized loading with fallbacks

## Next Steps

1. Run the SQL setup script
2. Test logo upload in admin panel
3. Verify logo displays correctly in production
4. Remove any old localStorage logo code if desired
