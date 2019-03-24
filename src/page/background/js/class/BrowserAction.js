'use strict';

class BrowserAction {
    /**
     * @param {Function} listener
     * @return {void}
     */
    static addListener(listener) {
        browser.browserAction.onClicked.addListener(listener);
    }
}

Binder.bind(BrowserAction);
