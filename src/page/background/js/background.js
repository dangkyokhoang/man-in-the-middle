'use strict';

// Initialize all rules on startup
const initialization = Factory.initialize();

// If storage changes, re-initialize rules.
Storage.addListener(changes => changes.forEach(async ([type]) => {
    if (!Factory.hasType(type)) {
        return;
    }

    // Re-initialize rules
    await Factory.initialize(type);

    // This makes sure rules are stored in the latest [array] format.
    await Factory.saveData(type);

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

Runtime.addEventListener('installed', async () => {
    const databaseVersion = await Storage.localGet('version');
    const version = Runtime.getManifest('version');

    const {result, difference} = Utils.versionCompare(
        databaseVersion,
        version
    );

    // Version unchanged or
    //     the extension version is lower than the database version
    if (result !== -1) {
        return;
    }

    await initialization;

    // If there's a major or minor update (not a patch one),
    // open the options page.
    if (difference === 'major' || difference === 'minor') {
        await Tabs.openOptionsPage();
    }

    await Storage.localSet({version});

    await Factory.upgradeDatabase();
});

// Open the options page if user clicks the extension icon
BrowserAction.addListener(Tabs.openOptionsPage);
