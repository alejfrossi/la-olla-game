import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import WordsSetup from './components/WordsSetup';
import GameScreen from './components/GameScreen';
import TurnScreen from './components/TurnScreen';

const socket = io('http://localhost:3001');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState('LOBBY'); 
  const [roomData, setRoomData] = useState(null);
  const [me, setMe] = useState(null); 

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('gameStarted', (updatedRoom) => {
      setRoomData(updatedRoom);
      setGameState('PLAYING');
    });

    socket.on('roomUpdated', (updatedRoom) => {
      setRoomData(updatedRoom);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomUpdated');
      socket.off('gameStarted');
    };
  }, []);

  const handleCreateRoom = (playerName) => {
    socket.emit('createRoom', { playerName }, (response) => {
      if (response.success) {
        setMe({ name: playerName, isHost: true });
        setRoomData({ roomCode: response.roomCode }); 
        setGameState('WORDS_SETUP');
      }
    });
  };

  const handleJoinRoom = (playerName, roomCode) => {
    socket.emit('joinRoom', { playerName, roomCode }, (response) => {
      if (response.success) {
        setRoomData(response.room);
        setMe({ name: playerName, isHost: false });
        setGameState('WORDS_SETUP');
      } else {
        alert(response.message); 
      }
    });
  };

  const handleSubmitWords = (words) => {
    socket.emit('submitWords', { 
      roomCode: roomData?.roomCode,
      playerName: me?.name, 
      words 
    }, (response) => {
      if (!response.success) alert(response.message);
    });
  };

  const handleStartGame = (timerLength) => {
    socket.emit('startGame', { roomCode: roomData?.roomCode, timerLength }, (response) => {
      if (!response.success) alert(response.message);
    });
  };

  const handleStartTurn = () => {
    socket.emit('startTurn', { roomCode: roomData?.roomCode });
    setGameState('ACTIVE_TURN'); 
  };

  const handleWordGuessed = () => {
    socket.emit('wordGuessed', { roomCode: roomData?.roomCode });
  };

  const handleWordSkipped = () => {
    socket.emit('wordSkipped', { roomCode: roomData?.roomCode });
  };

  const handleTimeUp = () => {
    socket.emit('timeUp', { roomCode: roomData?.roomCode });
    setGameState('PLAYING'); 
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 font-sans">
      <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-8 tracking-widest drop-shadow-md">
        LA OLLA
      </h1>

      {!isConnected && (
        <div className="mb-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
          Connecting to server...
        </div>
      )}

      {gameState === 'LOBBY' && (
        <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}

      {gameState === 'WORDS_SETUP' && (
        <WordsSetup 
          roomData={roomData} 
          me={me} 
          onSubmitWords={handleSubmitWords}
          onStartGame={handleStartGame}
        />
      )}

      {gameState === 'PLAYING' && (
        <GameScreen 
          roomData={roomData} 
          socketId={socket.id}
          onStartTurn={handleStartTurn}
        />
      )}

      {gameState === 'ACTIVE_TURN' && (
        <TurnScreen 
          roomData={roomData}
          onWordGuessed={handleWordGuessed}
          onWordSkipped={handleWordSkipped}
          onTimeUp={handleTimeUp}
        />
      )}
    </div>
  );
}

export default App;