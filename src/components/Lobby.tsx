'use client';


import { Room, VARIATION_NAMES } from '@/lib/types';

interface LobbyProps {
  room: Room;
  playerId: string;
  onUpdateSettings: (settings: { variation?: string; bootAmount?: number; startingChips?: number }) => void;
  onStartGame: () => void;
  loading: boolean;
}

export default function Lobby({ room, playerId, onUpdateSettings, onStartGame, loading }: LobbyProps) {
  const isHost = room.hostId === playerId;
  const playerCount = room.playerOrder.length;
  const canStart = playerCount >= 2;

  const copyRoomCode = () => {
    const url = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Room link copied!');
    }).catch(() => {
      // Fallback: copy just the code
      navigator.clipboard.writeText(room.id);
      alert('Room code copied!');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 safe-top safe-bottom">
      <div className="w-full max-w-md space-y-6">
        {/* Room Code Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gold mb-2">Room Lobby</h1>
          <div className="bg-black/30 rounded-xl p-4 inline-block">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Room Code</div>
            <div className="text-3xl font-mono font-bold text-white tracking-[0.3em]">{room.id}</div>
          </div>
          <button
            onClick={copyRoomCode}
            className="mt-2 block mx-auto text-sm text-gold hover:text-gold-light transition-colors"
          >
            📋 Copy Invite Link
          </button>
        </div>

        {/* Player List */}
        <div className="bg-black/20 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gold/70 uppercase tracking-wider mb-3">Players ({playerCount}/4)</h2>
          <div className="space-y-2">
            {room.playerOrder.map((id) => {
              const p = room.players[id];
              if (!p) return null;
              return (
                <div key={id} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                  <div className={`w-3 h-3 rounded-full ${p.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="font-semibold text-white flex-1">{p.name}</span>
                  {id === room.hostId && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">Host</span>
                  )}
                  <span className="text-sm text-gray-400">{p.chips} chips</span>
                </div>
              );
            })}
            {playerCount < 4 && (
              <div className="flex items-center gap-3 bg-black/10 rounded-lg p-3 border border-dashed border-gray-600">
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <span className="text-gray-500 italic">Waiting for players...</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Settings (Host only) */}
        {isHost && (
          <div className="bg-black/20 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gold/70 uppercase tracking-wider">Game Settings</h2>
            
            {/* Variation */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Variation</label>
              <select
                value={room.variation}
                onChange={(e) => onUpdateSettings({ variation: e.target.value })}
                className="w-full bg-black/40 text-white border border-gray-600 rounded-lg p-2.5 text-sm
                  focus:outline-none focus:border-gold"
              >
                {Object.entries(VARIATION_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            {/* Boot Amount */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Boot Amount</label>
              <div className="flex gap-2">
                {[10, 20, 50, 100].map(amt => (
                  <button
                    key={amt}
                    onClick={() => onUpdateSettings({ bootAmount: amt })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                      ${room.bootAmount === amt 
                        ? 'bg-gold text-black' 
                        : 'bg-black/30 text-gray-300 hover:bg-black/50'}`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Chips */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Starting Chips</label>
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => onUpdateSettings({ startingChips: amt })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                      ${room.startingChips === amt 
                        ? 'bg-gold text-black' 
                        : 'bg-black/30 text-gray-300 hover:bg-black/50'}`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Non-host sees settings summary */}
        {!isHost && (
          <div className="bg-black/20 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gold/70 uppercase tracking-wider mb-2">Game Settings</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-400">Variation</div>
                <div className="font-semibold text-white text-sm">{VARIATION_NAMES[room.variation]}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Boot</div>
                <div className="font-semibold text-white text-sm">{room.bootAmount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Chips</div>
                <div className="font-semibold text-white text-sm">{room.startingChips}</div>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95
              ${canStart 
                ? 'bg-gold hover:bg-gold-light text-black shadow-glow' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          >
            {loading ? 'Starting...' : canStart ? '🎯 Start Game' : 'Need at least 2 players'}
          </button>
        ) : (
          <div className="text-center text-gray-400 animate-pulse">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
