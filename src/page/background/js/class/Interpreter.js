'use strict';

/**
 * This safely runs JavaScript codes.
 */
class Interpreter {
    /**
     * @param {InterpreterFunctionDetails} details
     * @return {Promise}
     */
    static run(details) {
        return this.sendMessage(details).catch(console.warn);
    }

    /**
     * @private
     * @param {Object} message
     * @return {Promise}
     */
    static sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (!this.sandbox) {
                reject('Sandbox unavailable');
            }

            // Generate a UUID as message identifier
            const id = UUID.generate();
            // This promise is resolved or rejected only when the sandbox
            //     responses with a message with the same identifier.
            this.promises.set(id, {resolve, reject});

            this.sandbox.postMessage({id, message}, '*');
        });
    }

    /**
     * @callback
     * @param {MessageEvent} event
     * @return {void}
     */
    static messageListener({data}) {
        const {id, success, response} = data;

        if (!this.promises.has(id)) {
            return;
        }

        const promise = this.promises.get(id);
        success ? promise.resolve(response) : promise.reject(response);

        // As the promise has been fulfilled,
        // now forget it.
        this.promises.delete(id);
    }

    static startup() {
        /**
         * @private
         * @const
         * @type {Window}
         */
        this.sandbox = frames[0];
    }
}

Binder.bind(Interpreter);

/**
 * @private
 * @const
 * @type {Map<string, {Function}>}
 */
Interpreter.promises = new Map;

addEventListener('DOMContentLoaded', Interpreter.startup, true);
addEventListener('message', Interpreter.messageListener, true);

/**
 * @typedef {Object} InterpreterFunctionDetails
 * @property {string} functionBody
 * @property {Object} [args]
 */
