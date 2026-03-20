'use client';

import React from 'react';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { CurrencyProvider } from '@/src/contexts/CurrencyContext';
import { ProductProvider } from '@/src/contexts/ProductContext';
import { CategoryProvider } from '@/src/contexts/CategoryContext';
import { AppearanceProvider } from '@/src/contexts/AppearanceContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ProductProvider>
          <CategoryProvider>
            <AppearanceProvider>
              {children}
            </AppearanceProvider>
          </CategoryProvider>
        </ProductProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
