// Initialize all rules
Factory.initialize();

// If storage changes, re-initialize rules.
Storage.addListener(changes => changes.forEach(async ([type, {newValue}]) => {
    if (!Factory.hasType(type)) {
        return;
    }

    await Factory.initialize(type, newValue);

    Runtime.sendMessage({
        sender: 'backgroundPage',
        command: 'update',
        details: {type, data: Factory.getData(type)},
    });
}));

// Handle requests from options page
Runtime.addEventListener('message', async ({sender, request, details}) => {
    if (sender !== 'optionsPage') {
        return;
    }

    const {type, id, change} = details;
    switch (request) {
        case 'add':
            return Factory.add(type);
        case 'remove':
            return Factory.remove(type, id);
        case 'modify':
            return Factory.modify(type, id, change);
        case 'get':
            return Factory.getData(type);
    }
});

BrowserAction.addListener(Tabs.openOptionsPage);
