const io = require("socket.io-client");
const socket = io("http://localhost:3000");


socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("message", (message) => {
  console.log("Mensaje recibido:", message);
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
readline.on('line', (input) => {
  socket.emit('message', input);
});
socket.on('error', (error) => {
  console.error('Error en la conexión Socket.IO:', error.message);
});
