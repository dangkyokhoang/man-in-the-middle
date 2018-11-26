'use strict';

class Tabs {
    /**
     * @return {void}
     */
    static openOptionsPage() {
        browser.runtime.openOptionsPage().catch(Logger.log);
    }
}

Binder.bindOwn(Tabs);
