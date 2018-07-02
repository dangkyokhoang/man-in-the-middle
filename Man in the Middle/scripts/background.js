(async () => {
    await ContentScriptFactory.initializeAll();
    await BlockingRuleFactory.initializeAll();

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (typeof message !== 'object') {
            return;
        }

        const {event, ruleType, details = null} = message;

        switch (event) {
            case 'get':
                sendResponse(Factory.getFactory(ruleType).getDetailsArray());
                return;
            case 'add':
                sendResponse(Factory.getFactory(ruleType).initialize()
                    .toDataObject());
                break;
            case 'change':
                Factory.getFactory(ruleType).change(details);
                break;
            case 'remove':
                Factory.getFactory(ruleType).remove(details);
                break;
            default:
                return;
        }

        Storage.set(Factory.getFactory(ruleType).getDataObject()).then();
    });

    browser.runtime.onInstalled.addListener(async ({reason}) => {
        if (reason === 'update') {
            await Tabs.openOptionsPage();
        }
    });

    browser.browserAction.onClicked.addListener(() => Tabs.openOptionsPage());
})();