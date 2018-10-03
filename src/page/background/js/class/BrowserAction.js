class BrowserAction {
    /**
     * @param {Function} listener
     * @return {void}
     */
    static addListener(listener) {
        browser.browserAction.onClicked.addListener(listener);
    }
}
