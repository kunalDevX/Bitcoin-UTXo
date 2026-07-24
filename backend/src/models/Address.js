const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        address: { type: String, required: true, unique: true, index: true },
        lastFetched: { type: Date, default: null },
        utxoCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
