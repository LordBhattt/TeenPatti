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
    <div className="w-full">
      <h3 className="text-xs font-semibold text-gold/70 uppercase tracking-wider mb-1">Game Log</h3>
      <div
        ref={scrollRef}
        className="max-h-28 overflow-y-auto bg-black/30 rounded-lg p-2 space-y-1"
      >
        {entries.map((entry, i) => (
          <div key={i} className="text-xs text-gray-300 flex items-start gap-1">
            <span className="text-gold/60 shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>
              <span className="font-semibold text-white">{entry.playerName}</span>{' '}
              {entry.action}
              {entry.amount != null && (
                <span className="text-gold font-semibold"> ({entry.amount} chips)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
