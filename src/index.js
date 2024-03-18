const express = require('express');
const http = require('http');
const socket = require("socket.io")
const bodyParser = require("body-parser")
const cors = require("cors")
require('./db.js')

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(bodyParser.json())
app.use(cors())

const routes = require('./routes')
app.use('/', routes);

io.on("connection", (socket)=>{
    console.log("conected");

    socket.on('message', (message)=>{
        console.log(message);

        io.emit("message", message)
    })
    socket.on("disconnect", (message)=>{
        console.log("disconnected", message)
    })   
})

server.listen(3000, ()=>{
    console.log("servidor prendido en: ", 3000)
})
