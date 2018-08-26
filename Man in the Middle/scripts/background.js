(async () => {
    await ContentScriptFactory.initializeAll();
    await BlockingRuleFactory.initializeAll();
})();

/**
 * @callback
 * @return {Promise}
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onMessage}
 * */
browser.runtime.onMessage.addListener(async (message, {id}) => {
    // Since the listener can receive messages from other extensions,
    // the messages should be type-checked.
    if (id !== browser.runtime.id) {
        return;
    }

    const
        {event, ruleType, details = null} = message,
        ruleFactory = Factory.getFactory(ruleType);

    switch (event) {
        case 'get':
            return ruleFactory.getRuleList();
        case 'add':
            return ruleFactory.initializeRule({}).toDataObject();
        case 'change':
            ruleFactory.changeRuleDetail(details);
            break;
        case 'remove':
            ruleFactory.removeRule(details);
    }

    return ruleFactory.saveRuleData();
});

browser.runtime.onInstalled.addListener(({reason, previousVersion}) => {
    if (reason === 'install') {
        Tabs.openOptionsPage();
    } else if (reason === 'update') {
        // Open the options page if it's a functionality update, not a patch
        // Version format: MAJOR.MINOR.PATCH
        if (browser.runtime.getManifest().version.split('.').slice(0, 2).toString() !==
            previousVersion.split('.').slice(0, 2).toString()) {
            Tabs.openOptionsPage();
        }
    }
});

browser.browserAction.onClicked.addListener(Tabs.openOptionsPage);