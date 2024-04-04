const mongoose = require('mongoose')

const mongoUrl = "" //Poner aca la uri
// const mongoUrl = process.env.MONGO_URL

// console.log('uy: ', mongoUrl)

mongoose.connect(mongoUrl, {
}).then(()=>{
    console.log("[+] Connected succesfully")
}).catch(error => {
    console.error("[-] Error trying to connect: ", error)
});

module.exports = mongoose.connection;
