/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err.message || err);

    // Use explicit status set by our services, or infer from upstream response, or 500
    const status = err.status || err.response?.status || 500;
    const message =
        err.message ||
        err.response?.data?.message ||
        'An unexpected error occurred.';

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
