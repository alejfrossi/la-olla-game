export default function GameScreen({ roomData, socketId, onStartTurn }) {
  // Find out who is currently playing
  const activePlayer = roomData?.players?.find(p => p.id === roomData?.currentTurn);
  const isMyTurn = roomData?.currentTurn === socketId;
  
  // Determine the name of the current round in Spanish
  const currentRoundName = roomData?.currentRound === 1 ? 'Descripción'
                         : roomData?.currentRound === 2 ? 'Una Palabra'
                         : 'Mímica';

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-700 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        Ronda {roomData?.currentRound}: <br/><span className="text-orange-400">{currentRoundName}</span>
      </h2>
      <p className="text-slate-300 mb-6">Sala: <span className="font-bold text-white">{roomData?.roomCode}</span></p>

      {/* Scoreboard */}
      <div className="flex justify-between w-full mb-8 bg-slate-800 p-4 rounded-lg border border-slate-600">
        <div className="text-center w-1/2 border-r border-slate-600">
          <p className="text-lg text-blue-400 font-bold">Equipo A</p>
          <p className="text-4xl text-white font-black mt-2">{roomData?.score?.A || 0}</p>
        </div>
        <div className="text-center w-1/2">
          <p className="text-lg text-red-400 font-bold">Equipo B</p>
          <p className="text-4xl text-white font-black mt-2">{roomData?.score?.B || 0}</p>
        </div>
      </div>

      {/* Turn Actions */}
      {isMyTurn ? (
        <div className="text-center w-full py-4 border-t border-slate-600 pt-6">
          <p className="text-green-400 font-bold text-2xl mb-4 animate-pulse">¡Es tu turno!</p>
          <button 
            onClick={onStartTurn} 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg transition-colors shadow-lg text-xl"
          >
            Iniciar Tiempo y Jugar
          </button>
        </div>
      ) : (
        <div className="text-center w-full py-4 border-t border-slate-600 pt-6">
          <p className="text-slate-300 mb-4">Esperando al jugador activo...</p>
          <div className="bg-slate-800 rounded-full py-3 px-6 inline-block border border-slate-600">
            Turno Actual: <span className="font-bold text-orange-400 uppercase">{activePlayer?.name || 'Alguien'}</span>
          </div>
        </div>
      )}
    </div>
  );
}