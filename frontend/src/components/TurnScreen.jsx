import { useState, useEffect } from 'react';

export default function TurnScreen({ roomData, onWordGuessed, onWordSkipped, onTimeUp }) {
  // Initialize countdown timer with backend settings
  const [timeLeft, setTimeLeft] = useState(roomData?.timerLength || 60);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp(); 
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); 
  }, [timeLeft, onTimeUp]);

  // Dynamic color for timer (turns red at 10 seconds)
  const timerColor = timeLeft > 10 ? 'text-white' : 'text-red-500 animate-pulse';

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-800 border-4 border-orange-500 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>

      <div className="text-center mb-8">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">
          Ronda {roomData?.currentRound}
        </p>
        <div className={`text-7xl font-black ${timerColor} drop-shadow-md transition-colors duration-300`}>
          {timeLeft}
        </div>
      </div>

      {/* Current Word Display */}
      <div className="w-full bg-slate-700 py-12 px-4 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-slate-600">
        <h2 className="text-5xl font-bold text-orange-400 text-center break-words uppercase">
          {roomData?.currentWord?.text || "PREPARATE..."}
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex gap-4">
        <button
          onClick={onWordSkipped}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-4 rounded-xl transition-transform active:scale-95 shadow-lg text-lg uppercase"
        >
          Pasar
        </button>
        <button
          onClick={onWordGuessed}
          className="flex-1 bg-green-500 hover:bg-green-400 text-green-950 font-black py-6 px-4 rounded-xl transition-transform active:scale-95 shadow-lg text-lg uppercase"
        >
          ¡Adivinada!
        </button>
      </div>
    </div>
  );
}