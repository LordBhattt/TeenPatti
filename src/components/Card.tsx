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
  const sizeClasses = {
    sm: 'w-10 h-[60px] text-[10px]',
    md: 'w-14 h-[84px] text-xs',
    lg: 'w-[72px] h-[106px] text-sm',
  };

  const suitSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  if (!faceUp || !card) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-[4px] bg-surface border border-border
          flex items-center justify-center select-none shadow-sm shrink-0
          ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
          ${selected ? 'ring-2 ring-accent -translate-y-1.5' : ''}`}
        onClick={onClick}
      >
        <div className="w-5 h-7 rounded-sm border border-border/60 bg-base/40" />
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = isRed ? 'text-card-red' : 'text-neutral-800';

  return (
    <div
      className={`${sizeClasses[size]} rounded-[4px] bg-white
        flex flex-col justify-between p-1 sm:p-1.5 relative select-none shadow-sm shrink-0
        border ${isWild ? 'border-accent ring-1 ring-accent' : 'border-neutral-300'}
        ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
        ${selected ? 'ring-2 ring-accent -translate-y-2' : ''}`}
      onClick={onClick}
    >
      {isWild && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full
          flex items-center justify-center text-[7px] font-bold text-white shadow-sm z-20">
          W
        </div>
      )}

      {/* Top-left corner */}
      <div className={`${color} font-semibold leading-none flex flex-col items-center self-start z-10`}>
        <span className="tracking-tighter">{RANK_DISPLAY[card.rank]}</span>
        <span className={size === 'sm' ? 'text-[8px] mt-0.5' : 'text-[10px] mt-0.5'}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>

      {/* Center suit symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${color} ${suitSize[size]} opacity-90 select-none`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>

      {/* Bottom-right corner (inverted) */}
      <div className={`${color} font-semibold leading-none flex flex-col items-center self-end rotate-180 z-10`}>
        <span className="tracking-tighter">{RANK_DISPLAY[card.rank]}</span>
        <span className={size === 'sm' ? 'text-[8px] mt-0.5' : 'text-[10px] mt-0.5'}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>
    </div>
  );
}
