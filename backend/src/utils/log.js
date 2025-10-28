/**
 * Simple logging utility for quality logs
 * Uses console but with consistent formatting and levels
 */

const timestamp = () => new Date().toISOString();

const log = {
  // Info level - general flow and important events
  info: (message, data = {}) => {
    console.log(`[${timestamp()}] INFO: ${message}`, Object.keys(data).length ? data : "");
  },

  // Success level - successful operations
  success: (message, data = {}) => {
    console.log(`[${timestamp()}] SUCCESS: ${message}`, Object.keys(data).length ? data : "");
  },

  // Warning level - unexpected but handled situations
  warn: (message, data = {}) => {
    console.warn(`[${timestamp()}] WARN: ${message}`, Object.keys(data).length ? data : "");
  },

  // Error level - errors that need attention
  error: (message, data = {}) => {
    console.error(`[${timestamp()}] ERROR: ${message}`, Object.keys(data).length ? data : "");
  },

  // Debug level - detailed diagnostic info
  debug: (message, data = {}) => {
    if (process.env.DEBUG === "true") {
      console.log(`[${timestamp()}] DEBUG: ${message}`, Object.keys(data).length ? data : "");
    }
  },
};

module.exports = log;
