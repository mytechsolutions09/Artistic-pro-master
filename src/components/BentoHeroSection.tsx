import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

export interface BentoCard {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link: string;
  bgColor?: string;
  desktopColSpan?: number;
  desktopRowSpan?: number;
}

interface BentoHeroSectionProps {
  cards: BentoCard[];
}

const DEFAULT_CARDS: BentoCard[] = [
  {
    id: 'default-1',
    title: 'Paintings',
    subtitle: 'Explore Collection',
    image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/paintings',
    bgColor: '#f5e6d3',
    desktopColSpan: 1,
    desktopRowSpan: 2,
  },
  {
    id: 'default-2',
    title: 'Photography',
    subtitle: 'Stunning Shots',
    image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/photography',
    bgColor: '#d3e8f5',
    desktopColSpan: 2,
    desktopRowSpan: 1,
  },
  {
    id: 'default-3',
    title: 'Abstract',
    subtitle: 'Modern Expressions',
    image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/abstract',
    bgColor: '#e8d3f5',
    desktopColSpan: 1,
    desktopRowSpan: 1,
  },
  {
    id: 'default-4',
    title: 'Nature',
    subtitle: 'Raw & Beautiful',
    image: 'https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/nature',
    bgColor: '#d3f5e8',
    desktopColSpan: 1,
    desktopRowSpan: 1,
  },
  {
    id: 'default-5',
    title: 'Portrait',
    subtitle: 'Human Stories',
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/portrait',
    bgColor: '#f5d3d3',
    desktopColSpan: 2,
    desktopRowSpan: 1,
  },
  {
    id: 'default-6',
    title: 'Digital Art',
    subtitle: 'New Dimensions',
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/digital',
    bgColor: '#f5f0d3',
    desktopColSpan: 1,
    desktopRowSpan: 1,
  },
];

const BentoHeroSection: React.FC<BentoHeroSectionProps> = ({ cards }) => {
  const getDefaultSpanForIndex = (index: number) => {
    if (index === 0) return { desktopColSpan: 1, desktopRowSpan: 2 };
    if (index === 1) return { desktopColSpan: 2, desktopRowSpan: 1 };
    if (index === 4) return { desktopColSpan: 2, desktopRowSpan: 1 };
    return { desktopColSpan: 1, desktopRowSpan: 1 };
  };

  const normalizedCards: BentoCard[] = cards.map((card, index) => ({
    ...card,
    ...getDefaultSpanForIndex(index),
    ...card,
  }));
  if (normalizedCards.length < 6) {
    normalizedCards.push(...DEFAULT_CARDS.slice(normalizedCards.length, 6));
  }

  const clampSpan = (value: number | undefined, max: number) => {
    const parsed = Number(value || 1);
    if (Number.isNaN(parsed)) return 1;
    return Math.max(1, Math.min(max, parsed));
  };

  const TABLET_SPAN_PATTERN = [
    'row-span-2',
    'row-span-2',
    'col-span-2',
    'row-span-2',
    'row-span-2',
    'col-span-2 row-span-2',
  ];

  const MOBILE_SPAN_PATTERN = [
    'col-span-2 row-span-2',
    'row-span-2',
    'row-span-2',
    'col-span-2',
    'col-span-2',
    'col-span-2 row-span-2',
  ];

  const getTabletCardClass = (index: number) =>
    TABLET_SPAN_PATTERN[index % TABLET_SPAN_PATTERN.length];

  const getMobileCardClass = (index: number) =>
    MOBILE_SPAN_PATTERN[index % MOBILE_SPAN_PATTERN.length];

  const renderCard = (
    card: BentoCard,
    extraClass: string = '',
    style?: React.CSSProperties
  ) => (
    <Link
      key={card.id}
      to={card.link}
      className={`relative overflow-hidden rounded-2xl group h-full ${extraClass}`}
      style={{
        ...(!card.image ? { backgroundColor: card.bgColor || '#f5f5f5' } : {}),
        ...(style || {}),
      }}
    >
      {card.image && (
        <OptimizedImage
          src={card.image}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={800}
        />
      )}
      {!card.image && (
        <div className="absolute inset-0" style={{ backgroundColor: card.bgColor || '#f0f0f0' }} />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest font-sans leading-tight">
          {card.title}
        </h3>
        {card.subtitle && (
          <p className="text-white/70 text-xs mt-1 font-sans font-normal">{card.subtitle}</p>
        )}
      </div>
    </Link>
  );

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Desktop: adjustable bento spans */}
        <div
          className="hidden lg:grid grid-cols-3 gap-3 auto-rows-[160px] grid-flow-row-dense"
        >
          {normalizedCards.map((card) => {
            const colSpan = clampSpan(card.desktopColSpan, 3);
            const rowSpan = clampSpan(card.desktopRowSpan, 3);
            return renderCard(card, '', {
              gridColumn: `span ${colSpan} / span ${colSpan}`,
              gridRow: `span ${rowSpan} / span ${rowSpan}`,
            });
          })}
        </div>

        {/* ── Tablet (md – lg) ── mixed 2-col grid */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3 grid-flow-dense" style={{ gridAutoRows: '150px' }}>
          {normalizedCards.map((card, index) => renderCard(card, getTabletCardClass(index)))}
        </div>

        {/* ── Mobile ── asymmetric collage */}
        <div className="grid md:hidden grid-cols-2 gap-2.5 grid-flow-dense" style={{ gridAutoRows: '110px' }}>
          {normalizedCards.map((card, index) => renderCard(card, getMobileCardClass(index)))}
        </div>

      </div>
    </section>
  );
};

export default BentoHeroSection;
