import { useState } from 'react';

export default function Lobby({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-700 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-6">Welcome to La Olla</h2>
      
      {/* Player Name Input */}
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-orange-500 outline-none"
      />

      <div className="w-full space-y-4">
        {/* Create Room Button */}
        <button
          onClick={() => onCreateRoom(playerName)}
          disabled={!playerName}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Create New Room
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-600"></div>
          <span className="px-3 text-slate-400">OR</span>
          <div className="flex-grow border-t border-slate-600"></div>
        </div>

        {/* Join Room Inputs & Button */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ROOM CODE"
            maxLength={4}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-1/2 p-3 rounded-lg bg-slate-800 text-white border border-slate-600 text-center uppercase font-bold focus:border-blue-500 outline-none"
          />
          <button
            onClick={() => onJoinRoom(playerName, roomCode)}
            disabled={!playerName || roomCode.length !== 4}
            className="w-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}