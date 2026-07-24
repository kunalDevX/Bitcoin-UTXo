const mongoose = require('mongoose');

const utxoSchema = new mongoose.Schema(
    {
        txid: { type: String, required: true },
        vout: { type: Number, required: true },
        value: { type: Number, required: true }, // in satoshis
        blockHeight: { type: Number, default: null },
        confirmations: { type: Number, default: 0 },
        scriptType: { type: String, default: 'unknown' },
        address: { type: String, required: true, index: true },
    },
    { timestamps: true }
);

utxoSchema.index({ address: 1, txid: 1, vout: 1 }, { unique: true });

module.exports = mongoose.model('Utxo', utxoSchema);
