'use client';

import { useRef, useEffect } from 'react';
import { ActionLogEntry } from '@/lib/types';

interface ActionLogProps {
  entries: ActionLogEntry[];
}

export default function ActionLog({ entries }: ActionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (!entries || entries.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="max-h-24 overflow-y-auto py-2 space-y-0.5"
    >
      {entries.map((entry, i) => (
        <div key={i} className="text-xs text-muted leading-relaxed">
          <span className="text-primary/80 font-medium">{entry.playerName}</span>{' '}
          {entry.action}
          {entry.amount != null && (
            <span className="text-primary/60"> ({entry.amount})</span>
          )}
        </div>
      ))}
    </div>
  );
}
