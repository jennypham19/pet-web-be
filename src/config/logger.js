// src/config/logger.js
const config = require('./index');

const logger = {
    info: (...args) => {
        if(config.logLevel === 'info' || config.logLevel === 'debug') {
            console.log('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if(['info', 'debug', 'warn'].includes(config.logLevel)) {
            console.warn('[WARN]', ...args);
            
        }
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },
    debug: (...args) => {
        if (config.logLevel === 'debug') {
        console.debug('[DEBUG]', ...args);
        }
    },
};

module.exports = logger;