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
    lg: 'w-[72px] h-[108px] text-sm',
  };

  const suitSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  if (!faceUp || !card) {
    return (
      <div
        className={`${sizeClasses[size]} rounded bg-surface border border-border
          flex items-center justify-center select-none
          ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
          ${selected ? 'ring-1 ring-accent -translate-y-1.5' : ''}`}
        onClick={onClick}
      >
        <div className="w-5 h-7 rounded-sm border border-border/50" />
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = isRed ? 'text-card-red' : 'text-neutral-800';

  return (
    <div
      className={`${sizeClasses[size]} rounded bg-white
        flex flex-col justify-between p-1 relative select-none
        border ${isWild ? 'border-accent' : 'border-neutral-200'}
        ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
        ${selected ? 'ring-1 ring-accent -translate-y-2' : ''}`}
      onClick={onClick}
    >
      {isWild && (
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full
          flex items-center justify-center text-[7px] font-bold text-white">W</div>
      )}
      <div className={`${color} font-semibold leading-none`}>
        <div>{RANK_DISPLAY[card.rank]}</div>
        <div className="text-[8px]">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
      <div className={`${color} ${suitSize[size]} self-center`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div className={`${color} font-semibold leading-none self-end rotate-180`}>
        <div>{RANK_DISPLAY[card.rank]}</div>
        <div className="text-[8px]">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
    </div>
  );
}
