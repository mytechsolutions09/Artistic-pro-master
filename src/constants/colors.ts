// Site Color Theme Constants
// This file contains the official color palette for the Artistic Pro website

export const SITE_COLORS = {
  // Primary Pink Shades (from user's preferred specification)
  LIGHT_PINK: '#FAC6CF',     // Primary brand color - user specified
  MEDIUM_PINK: '#F48FB1',    // Medium pink - for accents and highlights
  DARK_PINK: '#E91E63',      // Darker pink - for text and emphasis
  
  // Supporting Colors
  WHITE: '#FFFFFF',          // Pure white for backgrounds
  LIGHT_GRAY: '#F5F5F5',     // Very light gray for subtle backgrounds
  TEXT_GRAY: '#333333',      // Dark gray for text
  
  // Gradient Combinations
  GRADIENTS: {
    PRIMARY: 'from-[#FAC6CF] to-[#F48FB1]',           // Light to medium pink
    SUBTLE: 'from-[#FAC6CF]/20 to-[#F48FB1]/30',      // Very subtle pink gradient
    HEADER: 'from-[#FAC6CF] to-[#FAC6CF]',            // Single light pink tone
    CARD: 'from-[#F48FB1] to-[#E91E63]',              // Medium to dark pink
  }
} as const;

// CSS Custom Properties (for use in Tailwind config if needed)
export const CSS_VARIABLES = {
  '--color-light-pink': '#FAC6CF',
  '--color-medium-pink': '#F48FB1', 
  '--color-dark-pink': '#E91E63',
  '--color-white': '#FFFFFF',
} as const;

// Tailwind-compatible color object
export const TAILWIND_COLORS = {
  'site-light': '#FAC6CF',
  'site-medium': '#F48FB1',
  'site-dark': '#E91E63',
  'site-white': '#FFFFFF',
} as const;
