class Tabs {
    /**
     * @param {string} url
     * @return {Promise<void>}
     */
    static async open(url) {
        const tabs = await browser.tabs.query({currentWindow: true});

        for (let tab of tabs) {
            if (tab.url.includes(url)) {
                if (!tab.active) {
                    await browser.tabs.update(tab.id, {active: true});
                }

                return;
            }
        }

        await browser.tabs.create({active: true, url});
    }

    /**
     * @return {Promise<void>}
     */
    static async openOptionsPage() {
        await browser.runtime.openOptionsPage();
    }
}