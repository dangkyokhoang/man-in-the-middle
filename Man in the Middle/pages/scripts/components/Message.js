class Message {
    /**
     * Send message within the extension
     * @param {object} message
     * @return {Promise}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/sendMessage}
     */
    static send(message) {
        return browser.runtime.sendMessage(message);
    }
}