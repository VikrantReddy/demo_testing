const { ApiError } = require("../utils");
const log = require("../utils/log");

const handleGlobalError = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "Internal server error";

    // Log error with context
    log.error(errorMessage, {
        method: req.method,
        path: req.path,
        statusCode: statusCode,
        stack: process.env.DEBUG === "true" ? err.stack : undefined,
    });

    // Send error response
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    return res.status(500).json({
        error: "Internal server error",
    });
};

module.exports = { handleGlobalError };
