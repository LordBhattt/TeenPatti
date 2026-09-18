'use client';

import { Card as CardType, SUIT_SYMBOLS, RANK_DISPLAY } from '@/lib/types';

interface CardProps {
  card?: CardType;
  faceUp: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isWild?: boolean;
}

export default function Card({ card, faceUp, selected, onClick, size = 'md', isWild }: CardProps) {
  // Sizes: sm = w-12 h-18, md = w-16 h-24, lg = w-20 h-30
  const sizeClasses = {
    sm: 'w-12 h-[72px] text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-[120px] text-base',
  };

  if (!faceUp || !card) {
    // Card back - decorative pattern
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-card-back to-blue-900 
          border-2 border-blue-400/30 shadow-card flex items-center justify-center
          ${onClick ? 'cursor-pointer hover:shadow-card-hover transform hover:-translate-y-1 transition-all' : ''}
          ${selected ? 'ring-2 ring-gold -translate-y-2' : ''}`}
        onClick={onClick}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-400/20 flex items-center justify-center">
          <span className="text-blue-300/50 text-2xl">🂠</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const textColor = isRed ? 'text-red-500' : 'text-gray-900';

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-white shadow-card 
        flex flex-col items-center justify-between p-1.5 relative
        border-2 ${isWild ? 'border-gold shadow-glow' : 'border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-card-hover transform hover:-translate-y-1 transition-all' : ''}
        ${selected ? 'ring-2 ring-gold -translate-y-3 shadow-glow' : ''}`}
      onClick={onClick}
    >
      {isWild && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] font-bold text-black z-10">
          W
        </div>
      )}
      <div className={`${textColor} font-bold self-start leading-none`}>
        <div>{RANK_DISPLAY[card.rank]}</div>
        <div className="text-xs">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
      <div className={`${textColor} text-2xl`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div className={`${textColor} font-bold self-end leading-none rotate-180`}>
        <div>{RANK_DISPLAY[card.rank]}</div>
        <div className="text-xs">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
    </div>
  );
}
