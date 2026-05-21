import { useState } from 'react';

export default function WordsSetup({ roomData, me, onSubmitWords, onStartGame }) {
  const [words, setWords] = useState(['', '', '', '', '']); // 5 initial empty inputs
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleSubmit = () => {
    // Filter out empty words and trim whitespace
    const validWords = words.filter(w => w.trim() !== '');
    
    if (validWords.length >= 5) {
      onSubmitWords(validWords);
      setIsSubmitted(true);
    } else {
      alert('Please enter at least 5 words!');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md bg-slate-700 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-2">The Word Pool</h2>
      <p className="text-slate-300 mb-6">Room: <span className="font-bold text-orange-400">{roomData?.roomCode}</span></p>

      {!isSubmitted ? (
        <div className="w-full space-y-3">
          <p className="text-sm text-slate-400 mb-2">Enter 5 to 10 words for the game:</p>
          
          {words.map((word, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Word ${index + 1}`}
              value={word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-orange-500 outline-none"
            />
          ))}
          
          {words.length < 10 && (
            <button
              onClick={() => setWords([...words, ''])}
              className="text-orange-400 text-sm hover:text-orange-300 transition-colors mt-2 font-semibold"
            >
              + Add another word
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Throw into La Olla
          </button>
        </div>
      ) : (
        <div className="text-center w-full py-6">
          <p className="text-green-400 font-bold text-2xl mb-4">Words submitted!</p>
          <p className="text-slate-300 mb-8">Waiting for other players...</p>
          
          {me.isHost && (
            <button
              onClick={onStartGame}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
            >
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}