const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
        trim: true
    },
    senderId: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    receptorId: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const msgModel = mongoose.model('Messages', msgSchema);
module.exports = msgModel;