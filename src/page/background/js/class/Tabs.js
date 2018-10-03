class Tabs {
    /**
     * @return {void}
     */
    static openOptionsPage() {
        browser.runtime.openOptionsPage().catch(console.warn);
    }
}

Binder.bindOwn(Tabs);
