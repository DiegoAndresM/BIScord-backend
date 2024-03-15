const mongoose = require('mongoose');

const pkSchema = new mongoose.Schema({
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

const pkModel = mongoose.model('PrivateKey', pkSchema);