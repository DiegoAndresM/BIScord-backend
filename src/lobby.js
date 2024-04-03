const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Lobby = require('./models/lobbys.model.js');
const LobbyMsgs = require('./models/lobbyMessage.model.js');
const cors = require("cors");

require('./db.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

const users = {};

io.on("connection", (socket) => {
    console.log("connected");

    // Cuando un usuario se conecta, Guarda su email junto con un socket ID generado automaticamente
    socket.on('login', (email) => {
        users[email] = socket.id;
        console.log("Actuales en linea: ", users)
    });

// Ruta para crear un nuevo lobby
app.post('/lobbies', async (req, res) => {
    try {
        const { name, ownerId } = req.body;
        const newLobby = new Lobby({ name, ownerId });
        await newLobby.save();
        res.status(201).json(newLobby);
    } catch (error) {
        res.status(500).json({ message: 'Error creating lobby' });
    }
});

// Ruta para enviar un mensaje en un lobby
app.post('/lobbies/:id/sendMessage', async (req, res) => {
    try {
        const { content, senderId } = req.body;
        const lobbyId = req.params.id;
        const newMessage = new LobbyMsgs({ content, senderId, lobbyId });
        await newMessage.save();
        
        // Emitir el mensaje a todos los clientes en el mismo lobby
        io.to(lobbyId).emit('lobby_message', newMessage);
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
});

});


// Iniciar el servidor
server.listen(3000, () => {
    console.log("Server is running on port 3000");
});