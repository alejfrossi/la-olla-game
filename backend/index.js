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

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor de La Olla corriendo en el puerto ${PORT} 🚀`);
});