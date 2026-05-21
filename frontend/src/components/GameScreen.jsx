export default function GameScreen({ roomData, socketId }) {
  // Find out who is currently playing
  const activePlayer = roomData?.players?.find(p => p.id === roomData?.currentTurn);
  const isMyTurn = roomData?.currentTurn === socketId;
  
  // Determine the name of the current round
  const currentRoundName = roomData?.currentRound === 1 ? 'Description'
                         : roomData?.currentRound === 2 ? 'One Word'
                         : 'Charades';

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-700 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        Round {roomData?.currentRound}: <br/><span className="text-orange-400">{currentRoundName}</span>
      </h2>
      <p className="text-slate-300 mb-6">Room: <span className="font-bold text-white">{roomData?.roomCode}</span></p>

      {/* Scoreboard */}
      <div className="flex justify-between w-full mb-8 bg-slate-800 p-4 rounded-lg border border-slate-600">
        <div className="text-center w-1/2 border-r border-slate-600">
          <p className="text-lg text-blue-400 font-bold">Team A</p>
          <p className="text-4xl text-white font-black mt-2">{roomData?.score?.A || 0}</p>
        </div>
        <div className="text-center w-1/2">
          <p className="text-lg text-red-400 font-bold">Team B</p>
          <p className="text-4xl text-white font-black mt-2">{roomData?.score?.B || 0}</p>
        </div>
      </div>

      {/* Turn Actions */}
      {isMyTurn ? (
        <div className="text-center w-full py-4 border-t border-slate-600 pt-6">
          <p className="text-green-400 font-bold text-2xl mb-4 animate-pulse">It's your turn!</p>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg transition-colors shadow-lg text-xl">
            Start Timer & Play
          </button>
        </div>
      ) : (
        <div className="text-center w-full py-4 border-t border-slate-600 pt-6">
          <p className="text-slate-300 mb-4">Waiting for the active player...</p>
          <div className="bg-slate-800 rounded-full py-3 px-6 inline-block border border-slate-600">
            Current Turn: <span className="font-bold text-orange-400">{activePlayer?.name || 'Someone'}</span>
          </div>
        </div>
      )}
    </div>
  );
}