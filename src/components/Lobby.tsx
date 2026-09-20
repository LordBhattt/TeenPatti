'use client';

import { useState } from 'react';
import { Room, VARIATION_NAMES } from '@/lib/types';
import RulesModal from './RulesModal';

interface LobbyProps {
  room: Room;
  playerId: string;
  onUpdateSettings: (settings: { variation?: string; bootAmount?: number; startingChips?: number }) => void;
  onStartGame: () => void;
  loading: boolean;
}

const CHIP_PRESETS = [500, 1000, 2000, 5000];

export default function Lobby({ room, playerId, onUpdateSettings, onStartGame, loading }: LobbyProps) {
  const isHost = room.hostId === playerId;
  const playerCount = room.playerOrder.length;
  const canStart = playerCount >= 2;
  const [showRules, setShowRules] = useState(false);
  const [customChips, setCustomChips] = useState(false);
  const [customChipValue, setCustomChipValue] = useState('');
  const [chipError, setChipError] = useState('');

  const isPreset = CHIP_PRESETS.includes(room.startingChips);

  const copyRoomCode = () => {
    const url = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(url).catch(() => {
      navigator.clipboard.writeText(room.id);
    });
  };

  const handleCustomChipChange = (val: string) => {
    setCustomChipValue(val);
    setChipError('');
    const num = parseInt(val, 10);
    if (!val.trim()) return;
    if (isNaN(num) || num !== parseFloat(val) || num < 100) {
      setChipError('Min 100, whole numbers only');
      return;
    }
    onUpdateSettings({ startingChips: num });
  };

  const selectPreset = (amt: number) => {
    setCustomChips(false);
    setCustomChipValue('');
    setChipError('');
    onUpdateSettings({ startingChips: amt });
  };

  const enableCustom = () => {
    setCustomChips(true);
    setCustomChipValue(isPreset ? '' : String(room.startingChips));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Room code */}
        <div className="text-center">
          <p className="text-muted text-xs mb-2">Room code</p>
          <h1 className="font-serif text-5xl text-primary tracking-[0.15em]">{room.id}</h1>
          <button
            onClick={copyRoomCode}
            className="text-muted text-xs mt-3 hover:text-primary transition-colors"
          >
            Copy invite link
          </button>
        </div>

        {/* Players */}
        <div className="space-y-2">
          <p className="text-muted text-xs">Players ({playerCount}/4)</p>
          {room.playerOrder.map((id) => {
            const p = room.players[id];
            if (!p) return null;
            return (
              <div key={id} className="flex items-center gap-3 py-2">
                <div className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? 'bg-accent' : 'bg-border'}`} />
                <span className="text-primary text-sm flex-1">{p.name}</span>
                {id === room.hostId && (
                  <span className="text-muted text-xs">host</span>
                )}
                <span className="text-muted text-xs font-serif">{p.chips}</span>
              </div>
            );
          })}
          {playerCount < 4 && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="text-muted/40 text-sm">Waiting...</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Settings */}
        {isHost ? (
          <div className="space-y-5">
            {/* Variation + rules button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-muted text-xs">Variation</label>
                <button
                  onClick={() => setShowRules(true)}
                  className="text-muted text-xs hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-muted text-[9px] leading-none">?</span>
                  How to play
                </button>
              </div>
              <select
                value={room.variation}
                onChange={(e) => onUpdateSettings({ variation: e.target.value })}
                className="w-full bg-surface border border-border rounded px-3 py-2
                  text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              >
                {Object.entries(VARIATION_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            {/* Boot */}
            <div>
              <label className="text-muted text-xs block mb-1.5">Boot amount</label>
              <div className="flex gap-2">
                {[10, 20, 50, 100].map(amt => (
                  <button
                    key={amt}
                    onClick={() => onUpdateSettings({ bootAmount: amt })}
                    className={`flex-1 py-1.5 rounded text-sm font-serif transition-colors
                      ${room.bootAmount === amt
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-primary'}`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chips */}
            <div>
              <label className="text-muted text-xs block mb-1.5">Starting chips</label>
              <div className="flex gap-2">
                {CHIP_PRESETS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => selectPreset(amt)}
                    className={`flex-1 py-1.5 rounded text-sm font-serif transition-colors
                      ${room.startingChips === amt && !customChips
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-primary'}`}
                  >
                    {amt}
                  </button>
                ))}
                <button
                  onClick={enableCustom}
                  className={`flex-1 py-1.5 rounded text-sm transition-colors
                    ${customChips || (!isPreset)
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-border text-muted hover:text-primary'}`}
                >
                  Custom
                </button>
              </div>
              {(customChips || !isPreset) && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={customChipValue || (!isPreset ? String(room.startingChips) : '')}
                    onChange={(e) => handleCustomChipChange(e.target.value)}
                    placeholder="Enter amount (min 100)"
                    min={100}
                    className="w-full bg-surface border border-border rounded px-3 py-2
                      text-primary text-center font-serif text-sm
                      placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                  {chipError && <p className="text-card-red text-xs mt-1 text-center">{chipError}</p>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted">Variation</span>
                <span className="text-primary ml-2">{VARIATION_NAMES[room.variation]}</span>
              </div>
              <button
                onClick={() => setShowRules(true)}
                className="text-muted text-xs hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-muted text-[9px] leading-none">?</span>
                Rules
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <div><span className="text-muted">Boot</span> <span className="text-primary font-serif ml-1">{room.bootAmount}</span></div>
              <div><span className="text-muted">Chips</span> <span className="text-primary font-serif ml-1">{room.startingChips}</span></div>
            </div>
          </div>
        )}

        {/* Start */}
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart || loading}
            className={`w-full py-3 rounded text-sm font-medium transition-colors active:scale-[0.98]
              ${canStart
                ? 'bg-accent text-white hover:bg-accent-dim'
                : 'bg-surface text-muted cursor-not-allowed'}`}
          >
            {loading ? 'Starting...' : canStart ? 'Start game' : 'Need 2+ players'}
          </button>
        ) : (
          <p className="text-center text-muted text-sm">Waiting for host to start...</p>
        )}
      </div>

      {/* Rules modal */}
      {showRules && (
        <RulesModal variation={room.variation} onClose={() => setShowRules(false)} />
      )}
    </div>
  );
}
