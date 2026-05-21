import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the local backend server
const socket = io('http://localhost:3001');

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen for successful connection
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to La Olla server!');
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold text-orange-500 mb-6 tracking-wider">
        LA OLLA
      </h1>
      <div className="bg-slate-700 p-6 rounded-2xl shadow-lg flex flex-col items-center">
        <p className="text-xl mb-4 font-semibold">Server Status</p>
        {isConnected ? (
          <span className="bg-green-500 text-green-950 px-4 py-2 rounded-full font-bold animate-pulse">
            🟢 Connected
          </span>
        ) : (
          <span className="bg-red-500 text-red-950 px-4 py-2 rounded-full font-bold">
            🔴 Disconnected
          </span>
        )}
      </div>
    </div>
  );
}

export default App;