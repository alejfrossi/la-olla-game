const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// GAME STATE ON MEMORY
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Un jugador se ha conectado: ${socket.id}`);

    // EVENT - Create a new room
    socket.on('createRoom', ({ playerName }, callback) => {
        // Generate a unique 4-letter room code
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        rooms[roomCode] = {
            roomCode: roomCode,
            players: [{ id: socket.id, name: playerName, team: 'A', isHost: true }],
            wordsPool: [],
            wordsGuessed: [],
            score: { A: 0, B: 0 },
            currentRound: 1,   // 1: Description, 2: One Word, 3: Mimic
            status: 'LOBBY',   // LOBBY, PLAYING, FINISHED
            currentTurn: null  // Player ID of who's turn it is
        };

        socket.join(roomCode);
        callback({ success: true, roomCode });
        console.log(`Sala ${roomCode} creada por ${playerName}`);
    });

    // EVENT - Join an existing room
    socket.on('joinRoom', ({ playerName, roomCode }, callback) => {
        const room = rooms[roomCode];

        if (!room) {
            return callback({ success: false, message: 'La sala no existe.' });
        }

        if (room.status !== 'LOBBY') {
            return callback({ success: false, message: 'El juego ya empezó.' });
        }

        // Assign player to the team with fewer members
        const teamA_count = room.players.filter(p => p.team === 'A').length;
        const teamB_count = room.players.filter(p => p.team === 'B').length;
        const assignedTeam = teamA_count <= teamB_count ? 'A' : 'B';

        const newPlayer = { id: socket.id, name: playerName, team: assignedTeam, isHost: false };
        room.players.push(newPlayer);
        
        socket.join(roomCode);
        
        // Notify all players in the room about the updated state
        io.to(roomCode).emit('roomUpdated', room);
        callback({ success: true, room });
        
        console.log(`${playerName} se unió a la sala ${roomCode}`);
    });

    // EVENT - Receive words from a player
    socket.on('submitWords', ({ roomCode, playerName, words }, callback) => {
        const room = rooms[roomCode];

        if (!room) {
            return callback({ success: false, message: 'Room does not exist' });
        }

        // Add submitted words to the common pool
        words.forEach(word => {
            room.wordsPool.push({ text: word, author: playerName });
        });

        // Notify all players in the room to update UI (e.g., "Player X is ready")
        io.to(roomCode).emit('roomUpdated', room);
        callback({ success: true, message: 'Words added to La Olla' });
        
        console.log(`${playerName} added ${words.length} words to room ${roomCode}`);
    });

    // EVENT - Host starts the game
    socket.on('startGame', ({ roomCode }, callback) => {
        const room = rooms[roomCode];

        if (!room) {
            return callback({ success: false, message: 'Room does not exist' });
        }

        // Change status and shuffle the words pool
        room.status = 'PLAYING';
        room.currentRound = 1;
        room.wordsPool = room.wordsPool.sort(() => Math.random() - 0.5);

        // Determine the first player to take the turn (first player of Team A)
        const teamAPlayers = room.players.filter(p => p.team === 'A');
        if (teamAPlayers.length > 0) {
            room.currentTurn = teamAPlayers.id;
        }

        // Broadcast game start to all connected clients
        io.to(roomCode).emit('gameStarted', room);
        callback({ success: true });

        console.log(`Game started in room ${roomCode}! Round 1 begins.`);
    });

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor de La Olla corriendo en el puerto ${PORT} 🚀`);
});