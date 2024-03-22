const crypto = require('crypto');



const encryptMessage = (message, publicKey) => {
    const bufferMessage = Buffer.from(message, 'utf8');
    const encryptedData = crypto.publicEncrypt(publicKey, bufferMessage);
    return encryptedData.toString('base64');
}

const decryptMessage = (encryptedMessage, privateKey, passphrase) => {
    const bufferEncryptedMessage = Buffer.from(encryptedMessage, 'base64');
    const decryptedData = crypto.privateDecrypt({
        key: privateKey,
        passphrase: passphrase
    }, bufferEncryptedMessage);
    return decryptedData.toString('utf8');
}


module.exports = {
    encryptMessage,
    decryptMessage
 }