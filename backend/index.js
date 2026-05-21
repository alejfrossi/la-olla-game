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
    socket.on('startGame', ({ roomCode, timerLength }, callback) => {
        const room = rooms[roomCode];

        if (!room) {
            return callback({ success: false, message: 'Room does not exist' });
        }

        // Apply settings, change status and shuffle the words pool
        room.timerLength = timerLength || 60;
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

    // --- TURN LOGIC EVENTS ---

    // Helper function to pick a random word and remove it from the pool
    const drawRandomWord = (pool) => {
        if (pool.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool.splice(randomIndex, 1); 
    };

    // EVENT - Active player starts the timer and draws the first word
    socket.on('startTurn', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room && room.wordsPool.length > 0) {
            room.currentWord = drawRandomWord(room.wordsPool);
            io.to(roomCode).emit('roomUpdated', room);
        }
    });

    // EVENT - Team guessed the word correctly
    socket.on('wordGuessed', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room && room.currentWord) {
            // 1. Move word to guessed pool
            room.wordsGuessed.push(room.currentWord);

            // 2. Add point to the active player's team
            const activePlayer = room.players.find(p => p.id === room.currentTurn);
            if (activePlayer) {
                room.score[activePlayer.team] += 1;
            }

            // 3. Draw next word or handle end of words
            if (room.wordsPool.length > 0) {
                room.currentWord = drawRandomWord(room.wordsPool);
            } else {
                room.currentWord = null;
                // Note: We will add the "Round Change" logic here later
            }
            
            io.to(roomCode).emit('roomUpdated', room);
        }
    });

    // EVENT - Player decides to skip the current word
    socket.on('wordSkipped', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room && room.currentWord) {
            // 1. Put current word back into the pool
            room.wordsPool.push(room.currentWord);
            
            // 2. Draw a new word
            room.currentWord = drawRandomWord(room.wordsPool);
            
            io.to(roomCode).emit('roomUpdated', room);
        }
    });

    // EVENT - The timer runs out
    socket.on('timeUp', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room) {
            // 1. If there's a word on screen, throw it back to La Olla
            if (room.currentWord) {
                room.wordsPool.push(room.currentWord);
                room.currentWord = null;
            }

            // 2. Find the current player to determine the next team
            const activePlayer = room.players.find(p => p.id === room.currentTurn);
            const nextTeam = activePlayer?.team === 'A' ? 'B' : 'A';

            // 3. Find players of the next team and pick the first one
            const nextTeamPlayers = room.players.filter(p => p.team === nextTeam);
            
            if (nextTeamPlayers.length > 0) {
                room.currentTurn = nextTeamPlayers.id;
                
                // Rotate the player to the end of the line so everyone gets a turn
                const playerIndex = room.players.findIndex(p => p.id === nextTeamPlayers.id);
                const playerToMove = room.players.splice(playerIndex, 1);
                room.players.push(playerToMove);
            }

            io.to(roomCode).emit('roomUpdated', room);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor de La Olla corriendo en el puerto ${PORT} 🚀`);
});