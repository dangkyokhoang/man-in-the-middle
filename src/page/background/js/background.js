'use strict';

// Initialize all rules on startup
Factory.initialize();

// If storage changes, re-initialize rules.
Storage.addListener(changes => changes.forEach(async ([type, {newValue}]) => {
    if (!Factory.hasType(type)) {
        return;
    }

    // Re-initialize rules
    await Factory.initialize(type, newValue);

    // Notify the options page
    Runtime.sendMessage({
        sender: 'backgroundPage',
        command: 'update',
        details: {
            type,
            data: Factory.getData(type),
        },
    });
}));

// Handle requests from the options page
Runtime.addEventListener('message', async ({sender, request, details}) => {
    if (sender !== 'optionsPage') {
        return;
    }

    switch (request) {
        case 'getInformation':
            return {
                version: Runtime.getManifest('version'),
            };
        case 'add':
            return Factory.add(details.type);
        case 'remove':
            return Factory.remove(details.type, details.id);
        case 'modify':
            return Factory.modify(details.type, details.id, details.change);
        case 'getData':
            return Factory.getData(details.type);
    }
});

// Open the options page if user clicks the extension icon
BrowserAction.addListener(Tabs.openOptionsPage);
