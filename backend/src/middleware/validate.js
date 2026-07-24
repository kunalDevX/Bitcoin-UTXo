const { validateBitcoinAddress } = require('../utils/addressValidator');

/**
 * Middleware to validate Bitcoin address from req.params or req.body
 */
const validateAddress = (source = 'params') => (req, res, next) => {
    const address = source === 'params' ? req.params.address : req.body.address;

    if (!address) {
        return res.status(400).json({ success: false, error: 'Bitcoin address is required.' });
    }

    const result = validateBitcoinAddress(address.trim());
    if (!result.valid) {
        return res.status(400).json({ success: false, error: result.message });
    }

    next();
};

module.exports = { validateAddress };
