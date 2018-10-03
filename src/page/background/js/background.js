// Initialize all rules
Factory.initialize();

// If storage changes, re-initialize rules.
Storage.addListener(changes => changes.forEach(async ([type, {newValue}]) => {
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

Runtime.addEventListener('installed', ({reason, previousVersion}) => {
    switch (reason) {
        case 'install':
            // Open the options page on install.
            return Tabs.openOptionsPage();
        case 'update':
            // Version format: MAJOR.MINOR.PATCH
            const currentVersion = Runtime.getManifest('version');
            // If it's a major or minor functionality update,
            // open the options page.
            if (
                currentVersion.split('.').slice(0, 2).toString() !==
                previousVersion.split('.').slice(0, 2).toString()
            ) {
                Tabs.openOptionsPage();
            }
    }
});

BrowserAction.addListener(Tabs.openOptionsPage);
