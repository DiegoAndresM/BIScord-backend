const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Lobby = require('./models/lobbys.model.js');
const LobbyMsgs = require('./models/lobbyMessage.model.js');
const cors = require("cors");

require('./db.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(express.json());
app.use(cors({
    origin: '*'
}));

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

     // Cuando un usuario se conecta, Guarda su email junto con un socket ID generado automaticamente
     socket.on('login', (email) => {
        users[email] = socket.id;
        console.log("Actuales en linea: ", users)
    });


    // Manejar evento para crear un nuevo lobby
    socket.on('create_lobby', async ({ name, ownerId }) => {
        try {
            const newLobby = new Lobby({ name, ownerId });
            await newLobby.save();
            io.emit('lobby_created', newLobby); // Emitir evento a todos los clientes
        } catch (error) {
            console.error('Error creating lobby:', error.message);
        }
    });

    // Manejar evento para enviar un mensaje en un lobby
    socket.on('send_message', async ({ lobbyId, content, senderId }) => {
        try {
            const newMessage = new LobbyMsgs({ content, senderId, lobbyId });
            await newMessage.save();
            io.to(lobbyId).emit('lobby_message', newMessage); // Emitir evento solo a los clientes en el mismo lobby
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    });

    // Manejar eventos de desconexión
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});
// Iniciar el servidor
server.listen(3000, () => {
    console.log("Server is running on port 3000");
});