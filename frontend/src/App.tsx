import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import WordsSetup from './components/WordsSetup';
import GameScreen from './components/GameScreen';

const socket = io('http://localhost:3001');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WORDS_SETUP, WAITING_ROOM, PLAYING
  const [roomData, setRoomData] = useState(null);
  const [me, setMe] = useState(null); // Stores current player's data

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('gameStarted', (updatedRoom) => {
      setRoomData(updatedRoom);
      setGameState('PLAYING');
    });

    // Listen for room updates from the server
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

  // Handler for creating a room
  const handleCreateRoom = (playerName) => {
    socket.emit('createRoom', { playerName }, (response) => {
      if (response.success) {
        setMe({ name: playerName, isHost: true });
        setRoomData({ roomCode: response.roomCode }); 
        setGameState('WORDS_SETUP');
      }
    });
  };

  // Handler for joining a room
  const handleJoinRoom = (playerName, roomCode) => {
    socket.emit('joinRoom', { playerName, roomCode }, (response) => {
      if (response.success) {
        setRoomData(response.room);
        setMe({ name: playerName, isHost: false });
        setGameState('WORDS_SETUP');
      } else {
        alert(response.message); // Simple error handling for now
      }
    });
  };

  const handleSubmitWords = (words) => {
    socket.emit('submitWords', { 
      roomCode: roomData.roomCode, 
      playerName: me.name, 
      words 
    }, (response) => {
      if (!response.success) alert(response.message);
    });
  };

  const handleStartGame = () => {
    socket.emit('startGame', { roomCode: roomData.roomCode }, (response) => {
      if (!response.success) alert(response.message);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 font-sans">
      <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-8 tracking-widest drop-shadow-md">
        LA OLLA
      </h1>

      {/* Basic Connection Warning */}
      {!isConnected && (
        <div className="mb-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
          Connecting to server...
        </div>
      )}

      {/* Screen Router */}
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
        />
      )}
    </div>
  );
}

export default App;