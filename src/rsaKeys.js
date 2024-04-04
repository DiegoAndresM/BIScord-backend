const crypto = require('crypto');


const generateKeys = (passphrase) => {
// Generar una nueva clave privada y pública
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Longitud del módulo en bits
    publicKeyEncoding: {
        type: 'spki', // formato de la clave pública
        format: 'pem' // formato de salida
    },
    privateKeyEncoding: {
        type: 'pkcs8', // formato de la clave privada
        format: 'pem', // formato de salida
        cipher: 'aes-256-cbc', // cifrado de la clave privada
        passphrase: passphrase // contraseña para proteger la clave privada (opcional)
    }
});

console.log(privateKey, publicKey)
return {privateKey, publicKey}

}

module.exports = generateKeys;