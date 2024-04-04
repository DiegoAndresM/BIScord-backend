const mongoose = require('mongoose');

const pukSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        trim: true
    },
    key: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const pukModel = mongoose.model('PublicKey', pukSchema);
module.exports = pukModel;