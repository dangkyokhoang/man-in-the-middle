'use strict';

class Tabs {
    /**
     * @return {void}
     */
    static openOptionsPage() {
        browser.runtime.openOptionsPage().catch(Logger.log);
    }

    /**
     * Get details of a tab.
     * @return {Promise<browser.tabs.Tab>}
     */
    static get(tabId) {
        return browser.tabs.get(tabId).catch(Logger.log);
    }
}

Binder.bindOwn(Tabs);
