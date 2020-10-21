const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ipSchema = new Schema({
    ip: {
        type: String,
        required: true,
        unique: 1
    },
    expiresIn: {
        type: Number,
        required: true
    }
});

const Ip = mongoose.model('Ips', ipSchema);

module.exports = { Ip };