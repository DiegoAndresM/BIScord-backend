const mongoose = require('mongoose');

const lobbyMsgSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
        trim: true
    },
    senderId: {
        type: String,
        trim: true,
        required: true,
    },
    lobbyId: {
        type: String,
        trim: true,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
});

const lobbyMsgModel = mongoose.model('LobbyMsgs', lobbyMsgSchema);
module.exports = lobbyMsgModel;