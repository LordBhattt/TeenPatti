'use client';
import { useState, useEffect } from 'react';

export function usePlayer() {
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    let id = localStorage.getItem('teenPattiPlayerId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('teenPattiPlayerId', id);
    }
    setPlayerId(id);
    
    const name = localStorage.getItem('teenPattiPlayerName') || '';
    setPlayerName(name);
    setIsLoaded(true);
  }, []);

  const updateName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('teenPattiPlayerName', name);
  };

  return { playerId, playerName, setPlayerName: updateName, isLoaded };
}
