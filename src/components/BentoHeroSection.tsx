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
  },
  {
    id: 'default-2',
    title: 'Photography',
    subtitle: 'Stunning Shots',
    image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/photography',
    bgColor: '#d3e8f5',
  },
  {
    id: 'default-3',
    title: 'Abstract',
    subtitle: 'Modern Expressions',
    image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/abstract',
    bgColor: '#e8d3f5',
  },
  {
    id: 'default-4',
    title: 'Nature',
    subtitle: 'Raw & Beautiful',
    image: 'https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/nature',
    bgColor: '#d3f5e8',
  },
  {
    id: 'default-5',
    title: 'Portrait',
    subtitle: 'Human Stories',
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/portrait',
    bgColor: '#f5d3d3',
  },
  {
    id: 'default-6',
    title: 'Digital Art',
    subtitle: 'New Dimensions',
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/categories/digital',
    bgColor: '#f5f0d3',
  },
];

const BentoHeroSection: React.FC<BentoHeroSectionProps> = ({ cards }) => {
  const normalizedCards: BentoCard[] = [...cards];
  if (normalizedCards.length < 6) {
    normalizedCards.push(...DEFAULT_CARDS.slice(normalizedCards.length, 6));
  }

  const renderCard = (card: BentoCard, extraClass: string = '') => (
    <Link
      key={card.id}
      to={card.link}
      className={`relative overflow-hidden rounded-2xl group h-full ${extraClass}`}
      style={!card.image ? { backgroundColor: card.bgColor || '#f5f5f5' } : undefined}
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

  const [a, b, c, d, e, f] = normalizedCards;
  const extraCards = normalizedCards.slice(6);

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Desktop bento (lg+) ── 3 cols, 3 rows
            Layout:
              [A tall×2] [B wide col-span-2     ]
              [         ] [C          ] [D       ]
              [E wide col-span-2      ] [F       ]
        */}
        <div
          className="hidden lg:grid grid-cols-3 gap-3"
          style={{ gridTemplateRows: '240px 200px 180px' }}
        >
          {renderCard(a, 'row-span-2')}
          {renderCard(b, 'col-span-2')}
          {renderCard(c, '')}
          {renderCard(d, '')}
          {renderCard(e, 'col-span-2')}
          {renderCard(f, '')}
        </div>
        {extraCards.length > 0 && (
          <div className="hidden lg:grid grid-cols-3 gap-3 mt-3" style={{ gridAutoRows: '200px' }}>
            {extraCards.map((card) => renderCard(card))}
          </div>
        )}

        {/* ── Tablet (md – lg) ── 2-col grid */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3" style={{ gridAutoRows: '200px' }}>
          {normalizedCards.map((card) => renderCard(card))}
        </div>

        {/* ── Mobile ── 2-col compact */}
        <div className="grid md:hidden grid-cols-2 gap-2" style={{ gridAutoRows: '150px' }}>
          {normalizedCards.map((card, index) => renderCard(card, index === 0 ? 'row-span-2' : ''))}
        </div>

      </div>
    </section>
  );
};

export default BentoHeroSection;
