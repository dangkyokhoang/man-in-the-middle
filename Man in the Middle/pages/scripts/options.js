(async () => {
    const
        contentScriptSection = DOMHelper.id('content_script'),
        blockingRuleSection = DOMHelper.id('blocking_rule'),
        containerDetails = {
            tagName: 'SECTION'
        },
        addButtonDetails = {
            tagName: 'BUTTON',
            classList: ['highlight-ok'],
            children: [{text: 'Add'}]
        };

    ContentScriptCollection.container = DOMHelper.createNode(
        Object.assign(containerDetails, {
            parent: contentScriptSection
        })
    );
    BlockingRuleCollection.container = DOMHelper.createNode(
        Object.assign(containerDetails, {
            parent: blockingRuleSection
        })
    );

    await ContentScriptCollection.displayAllRules();
    await BlockingRuleCollection.displayAllRules();

    DOMHelper.createNode(
        Object.assign(addButtonDetails, {
            parent: contentScriptSection
        })
    ).addEventListener(
        'click',
        () => ContentScriptCollection.addRule(),
        true
    );
    DOMHelper.createNode(
        Object.assign(addButtonDetails, {
            parent: blockingRuleSection
        })
    ).addEventListener(
        'click',
        () => BlockingRuleCollection.addRule(),
        true
    );
})();