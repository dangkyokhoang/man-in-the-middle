'use strict';

class Runtime {
    /**
     * Send message within the extension.
     * @param {Object} message
     * @return {Promise}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/sendMessage}
     */
    static sendMessage(message) {
        // Ignore the error: Receiving end doesn't exist
        return browser.runtime.sendMessage(message).catch(() => {});
    }

    /**
     * @param {string} [key]
     */
    static getManifest(key) {
        const manifest = browser.runtime.getManifest();
        return key ? manifest[key] : manifest;
    }

    /**
     * @param {string} type
     * @param {Function} listener
     * @return {void}
     */
    static addEventListener(type, listener) {
        const event = this.events[type];

        if (type === 'message') {
            event.addListener(async (message, {id}) => {
                // As the extension can receive messages from other extensions,
                // the sender's identity must be verified.
                if (id !== browser.runtime.id) {
                    return;
                }

                return listener(message);
            });
        } else {
            event.addListener(listener);
        }
    }
}

Binder.bind(Runtime);

Runtime.events = {
    'message': browser.runtime.onMessage,
    'installed': browser.runtime.onInstalled,
};
