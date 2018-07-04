class Tabs {
    static async openOptionsPage() {
        try {
            await browser.runtime.openOptionsPage();
        } catch (error) {
            console.warn(error);
        }
    }
}