'use strict';

/**
 * Used for debugging purposes.
 */
class Logger {
    /**
     * @param {*} value
     */
    static log(value) {
        Runtime.sendMessage({
            sender: 'backgroundPage',
            command: 'log',
            details: {
                message: value instanceof Error ? String(value) : value,
            }
        });
    }
}

Binder.bind(Logger);
