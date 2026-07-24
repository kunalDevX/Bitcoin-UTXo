/**
 * Bitcoin address validation
 * Supports P2PKH (1...), P2SH (3...), and Bech32 (bc1...) addresses.
 */
const VALID_ADDRESS_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{6,87})$/;

/**
 * Validates a Bitcoin mainnet address.
 * @param {string} address
 * @returns {{ valid: boolean, message?: string }}
 */
const validateBitcoinAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return { valid: false, message: 'Address is required and must be a string.' };
    }

    const trimmed = address.trim();

    if (!VALID_ADDRESS_REGEX.test(trimmed)) {
        return {
            valid: false,
            message:
                'Invalid Bitcoin address format. Supported formats: P2PKH (1...), P2SH (3...), Bech32 (bc1...).',
        };
    }

    return { valid: true };
};

module.exports = { validateBitcoinAddress };
