// Member Levels System for Artistic Pro
// This defines the membership tiers and their benefits

export interface MemberLevel {
  id: string;
  name: string;
  icon: string;
  color: string;
  minOrders: number;
  minSpent: number;
  benefits: string[];
  nextLevelOrders?: number;
  nextLevelSpent?: number;
  description: string;
}

export const MEMBER_LEVELS: MemberLevel[] = [
  {
    id: 'art_enthusiast',
    name: 'Art Enthusiast',
    icon: '🎨',
    color: '#F48FB1', // Medium Pink
    minOrders: 0,
    minSpent: 0,
    nextLevelOrders: 3,
    nextLevelSpent: 100,
    benefits: [
      'Access to all artworks',
      'Standard customer support',
      'Basic download quality',
    ],
    description: 'Welcome to the art community! Start your collection journey.'
  },
  {
    id: 'art_collector',
    name: 'Art Collector',
    icon: '🖼️',
    color: '#FAC6CF', // Light Pink
    minOrders: 3,
    minSpent: 100,
    nextLevelOrders: 10,
    nextLevelSpent: 500,
    benefits: [
      'All Art Enthusiast benefits',
      '5% discount on all purchases',
      'High-quality downloads',
      'Early access to new collections',
    ],
    description: 'You\'re building a beautiful collection! Keep discovering amazing art.'
  },
  {
    id: 'art_connoisseur',
    name: 'Art Connoisseur',
    icon: '👑',
    color: '#E91E63', // Dark Pink
    minOrders: 10,
    minSpent: 500,
    nextLevelOrders: 25,
    nextLevelSpent: 1500,
    benefits: [
      'All Art Collector benefits',
      '10% discount on all purchases',
      'Premium download quality',
      'Exclusive monthly collections',
      'Priority customer support',
      'Artist collaboration invitations',
    ],
    description: 'A true connoisseur with exceptional taste! Enjoy exclusive perks.'
  },
  {
    id: 'art_patron',
    name: 'Art Patron',
    icon: '💎',
    color: '#8E24AA', // Purple
    minOrders: 25,
    minSpent: 1500,
    nextLevelOrders: 50,
    nextLevelSpent: 5000,
    benefits: [
      'All Art Connoisseur benefits',
      '15% discount on all purchases',
      'Ultra-high quality downloads',
      'Limited edition artworks access',
      'Personal art consultant',
      'VIP events and exhibitions',
      'Custom artwork commissions',
    ],
    description: 'A distinguished patron supporting the arts! You have premium access to everything.'
  },
  {
    id: 'art_legend',
    name: 'Art Legend',
    icon: '🌟',
    color: '#4A148C', // Deep Purple
    minOrders: 50,
    minSpent: 5000,
    benefits: [
      'All Art Patron benefits',
      '20% discount on all purchases',
      'Master quality downloads',
      'First access to artist originals',
      'Dedicated account manager',
      'Private gallery viewings',
      'Artist meet & greet events',
      'Lifetime membership benefits',
      'Your name in our Hall of Fame',
    ],
    description: 'A legendary collector! You are part of our exclusive inner circle.'
  }
];

// Helper functions
export const getMemberLevel = (orders: number, totalSpent: number): MemberLevel => {
  // Find the highest level the user qualifies for
  for (let i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    const level = MEMBER_LEVELS[i];
    if (orders >= level.minOrders && totalSpent >= level.minSpent) {
      return level;
    }
  }
  return MEMBER_LEVELS[0]; // Default to Art Enthusiast
};

export const getNextLevel = (currentLevel: MemberLevel): MemberLevel | null => {
  const currentIndex = MEMBER_LEVELS.findIndex(level => level.id === currentLevel.id);
  if (currentIndex < MEMBER_LEVELS.length - 1) {
    return MEMBER_LEVELS[currentIndex + 1];
  }
  return null; // Already at highest level
};

export const getProgressToNextLevel = (orders: number, totalSpent: number): {
  currentLevel: MemberLevel;
  nextLevel: MemberLevel | null;
  ordersProgress: number;
  spentProgress: number;
  ordersNeeded: number;
  spentNeeded: number;
} => {
  const currentLevel = getMemberLevel(orders, totalSpent);
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      ordersProgress: 100,
      spentProgress: 100,
      ordersNeeded: 0,
      spentNeeded: 0
    };
  }
  
  const ordersNeeded = Math.max(0, nextLevel.minOrders - orders);
  const spentNeeded = Math.max(0, nextLevel.minSpent - totalSpent);
  
  const ordersProgress = Math.min(100, (orders / nextLevel.minOrders) * 100);
  const spentProgress = Math.min(100, (totalSpent / nextLevel.minSpent) * 100);
  
  return {
    currentLevel,
    nextLevel,
    ordersProgress,
    spentProgress,
    ordersNeeded,
    spentNeeded
  };
};
