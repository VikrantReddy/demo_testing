const { db } = require("../config");
const { ERROR_MESSAGES } = require("../constants");
const { ApiError } = require("./api-error");
const log = require("./log");

const processDBRequest = async ({ query, queryParams }) => {
    const startTime = Date.now();

    try {
        const result = await db.query(query, queryParams);
        const duration = Date.now() - startTime;

        // Log slow queries - important for performance monitoring
        if (duration > 1000) {
            log.warn("Slow database query detected", {
                queryType: getQueryType(query),
                duration: `${duration}ms`,
                rowsAffected: result.rowCount,
            });
        }

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;

        // Log database errors - critical for debugging
        log.error("Database operation failed", {
            queryType: getQueryType(query),
            duration: `${duration}ms`,
            errorMessage: error.message,
        });

        throw new ApiError(500, ERROR_MESSAGES.DATABASE_ERROR);
    }
};

/**
 * Extract query type (SELECT, INSERT, UPDATE, DELETE)
 */
function getQueryType(query) {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith("SELECT")) return "SELECT";
    if (trimmedQuery.startsWith("INSERT")) return "INSERT";
    if (trimmedQuery.startsWith("UPDATE")) return "UPDATE";
    if (trimmedQuery.startsWith("DELETE")) return "DELETE";
    return "UNKNOWN";
}

module.exports = { processDBRequest };