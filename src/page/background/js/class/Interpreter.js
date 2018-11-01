/**
 * This safely runs JavaScript codes.
 */
class Interpreter {
    /**
     * @param {InterpreterFunctionDetails}
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
            // Generate a UUID as message identifier
            const id = UUID.generate();
            // This promise is resolved or rejected only when the sandbox
            //     responses with a message containing the identifier.
            this.promises.set(id, {resolve, reject});

            this.sandbox.postMessage({id, message}, '*');
        });
    }

    /**
     * @callback
     * @param {MessageEvent} event
     * @return {void}
     */
    static listener({data}) {
        const {id, success, response} = data;

        if (!this.promises.has(id)) {
            return;
        }

        const promise = this.promises.get(id);
        success ? promise.resolve(response) : promise.reject(response);
    }
}

Binder.bind(Interpreter);

/**
 * @private
 * @const
 * @type {Map<string, {Function}>}
 */
Interpreter.promises = new Map;

addEventListener('DOMContentLoaded', () => {
    /**
     * @private
     * @const
     * @type {Window}
     */
    Interpreter.sandbox = frames[0];
}, true);

addEventListener('message', Interpreter.listener, true);

/**
 * @typedef {Object} InterpreterFunctionDetails
 * @property {string} functionBody
 * @property {Object} [args]
 */
