import { useState } from 'react';

export default function WordsSetup({ roomData, me, onSubmitWords, onStartGame }) {
  const [words, setWords] = useState(['', '', '', '', '']);
  const [timerLength, setTimerLength] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Separate players by team for display
  const teamA = roomData?.players?.filter(p => p.team === 'A') || [];
  const teamB = roomData?.players?.filter(p => p.team === 'B') || [];

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value.toUpperCase();
    setWords(newWords);
  };

  const handleSubmit = () => {
    const validWords = words.filter(w => w.trim() !== '');
    if (validWords.length >= 5) {
      onSubmitWords(validWords);
      setIsSubmitted(true);
    } else {
      alert('¡Por favor ingresa al menos 5 palabras!');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-700 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-2">El Pozo de Palabras</h2>
      <p className="text-slate-300 mb-6">Sala: <span className="font-bold text-orange-400">{roomData?.roomCode}</span></p>

      {!isSubmitted ? (
        <div className="w-full space-y-3">
          <p className="text-sm text-slate-400 mb-2">Ingresa de 5 a 10 palabras para el juego:</p>
          
          {words.map((word, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Palabra ${index + 1}`}
              value={word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-orange-500 outline-none uppercase"
            />
          ))}
          
          {words.length < 10 && (
            <button
              onClick={() => setWords([...words, ''])}
              className="text-orange-400 text-sm hover:text-orange-300 transition-colors mt-2 font-semibold"
            >
              + Agregar otra palabra
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            TIRAR A LA OLLA
          </button>
        </div>
      ) : (
        <div className="text-center w-full py-4">
          <p className="text-green-400 font-bold text-2xl mb-2">¡Palabras enviadas!</p>
          <p className="text-slate-300 mb-4">Esperando a los demás jugadores...</p>
          
          {me?.isHost && (
            <div className="w-full bg-slate-800 p-4 rounded-lg mt-2 shadow-inner border border-slate-600">
              <p className="text-slate-300 text-sm mb-2 font-semibold">Configuración:</p>
              <div className="flex items-center justify-between mb-4">
                <label className="text-white text-sm">Duración del turno:</label>
                <select 
                  value={timerLength}
                  onChange={(e) => setTimerLength(Number(e.target.value))}
                  className="bg-slate-700 text-white p-2 rounded-lg outline-none border border-slate-500 text-sm"
                >
                  <option value={30}>30 seg</option>
                  <option value={45}>45 seg</option>
                  <option value={60}>60 seg</option>
                  <option value={90}>90 seg</option>
                </select>
              </div>
              <button
                onClick={() => onStartGame(timerLength)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
              >
                Comenzar Juego
              </button>
            </div>
          )}
        </div>
      )}

      {/* TEAM LISTS */}
      <div className="w-full flex gap-4 mt-6">
        <div className="flex-1 bg-slate-800 p-4 rounded-lg border border-slate-600">
          <h3 className="text-blue-400 font-bold mb-3 text-center border-b border-slate-600 pb-2">Equipo A</h3>
          <ul className="text-white text-sm space-y-2 text-center">
            {teamA.map(p => <li key={p.id} className="font-semibold">{p.name} {p.isHost && '👑'}</li>)}
          </ul>
        </div>
        <div className="flex-1 bg-slate-800 p-4 rounded-lg border border-slate-600">
          <h3 className="text-red-400 font-bold mb-3 text-center border-b border-slate-600 pb-2">Equipo B</h3>
          <ul className="text-white text-sm space-y-2 text-center">
            {teamB.map(p => <li key={p.id} className="font-semibold">{p.name} {p.isHost && '👑'}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}