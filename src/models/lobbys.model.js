const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    memberIds: [{
        type: String,
        required: true,
        trim: true
    }]
}, {
    timestamps: true,
    versionKey: false
});

const lobbyModel = mongoose.model('Lobby', lobbySchema); 
module.exports = lobbyModel;
