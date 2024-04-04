
/*
                                            .      //
                                       /) \ |\    //
  OC                             (\\|  || \)u|   |F     /)
                                  \```.FF  \  \  |J   .'/
                               __  `.  `|   \  `-'J .'.'
        ______           __.--'  `-. \_ J    >.   `'.'   .
    _.-'      ""`-------'           `-.`.`. / )>.  /.' .<'
  .'                                   `-._>--' )\ `--''
  F .                                          ('.--'"
 (_/                                            '\
  \                                             'o`.
  |\                                                `.
  J \          |              /      |                \
   L \                       J       (             .  |
   J  \      .               F        _.--'`._  /`. \_)
    F  `.    |                       /        ""   "'
    F   /\   |_          ___|   `-_.'
   /   /  F  J `--.___.-'   F  - /
  /    F  |   L            J    /|
 (_   F   |   L            F  .'||
  L  F    |   |           |  /J  |
  | J     `.  |           | J  | |              ____.---.__
  |_|______ \  L          | F__|_|___.---------'
--'        `-`--`--.___.-'-'---
*/

const express = require('express');
const http = require('http');
const socket = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const msg = require('./rsaMessages.js');


const UserModel = require('./models/user.model.js')
const messageModel = require('./models/messages.model.js')
const privateKey = require('./models/privateKey.model.js')
const publicKey = require('./models/publicKey.model.js')


require('./db.js');

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

const routes = require('./routes');
app.use('/', routes);

// Cuarda las conexiones al socket con los emails de los usuarios
const users = {};

io.on("connection", (socket) => {
    console.log("connected");

    // Cuando un usuario se conecta, Guarda su email junto con un socket ID generado automaticamente
    socket.on('login', (email) => {
        users[email] = socket.id;
        console.log("Actuales en linea: ", users)
    });



    // mandar private message
    /*
    ---------EJEMPLO DEL JOSN QUE EL FRONT TIENE QUE MANDAR------
    {
    "sender": "test@test.com",
    "receptor": "omar@test.com",
    "message": "Hola"
    }
    */


    socket.on('private_message', async (data) => {
        const { sender, receptor, message } = data;

        // checa si esta conectado y si no se lo madrea... digo nomas lo guarda en la db
        if (users[receptor]) {
            io.to(users[receptor]).emit('private_message', { sender, message });

            const pubKeyInfo = await publicKey.findOne({ userId: receptor});
            const pubKey = pubKeyInfo.key;
            //console.log('El mensaje se encriptara con la public key de: ', receptor, ' la cual es: ', pubKey) USAR PARA DEBUG
            const encryptedMessage = msg.encryptMessage(message, pubKey);

            const newMessage = new messageModel({content: encryptedMessage, senderId: sender, receptorId: receptor});
            await newMessage.save();

        } else {
            // Aqui handleamos cuando no este el otro en linea. en teoria no deberia tronar si el usuario al cerrar la app se desloguea
            console.log(`${receptor} no anda en linea, se guardara su mensaje`);
            // podemos emitir algo para avisar al sender que el receptor no esta en linea pero eso seria crema

            //Guarda el mensaje para traerlo despues con un endpoint normal
            const pubKeyInfo = await publicKey.findOne({ userId: receptor});
            const pubKey = pubKeyInfo.key;
            //console.log('El mensaje se encriptara con la public key de: ', receptor, ' la cual es: ', pubKey) USAR PARA DEBUG
            const encryptedMessage = msg.encryptMessage(message, pubKey);

            const newMessage = new messageModel({content: encryptedMessage, senderId: sender, receptorId: receptor});
            await newMessage.save();
        }
    });

    //El evento logout es importante ya que si el usuario no llama al evento al cerrar la app el servidor PODRIA tronar, no esta comprobado pero podria pasar.
    socket.on("logout", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const disconnectedUser = Object.keys(users).find(data => users[data] === socket.id);
        console.log(`Disconnected user found: ${disconnectedUser}`);
        if (disconnectedUser) {
            delete users[disconnectedUser];
            console.log(`${disconnectedUser} disconnected`);
            console.log(`Users after disconnection:`, users);
        }
    });
    
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});