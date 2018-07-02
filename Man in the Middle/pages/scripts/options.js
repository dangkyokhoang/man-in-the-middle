(async () => {
    ContentScriptCollection.container = DOMHelper.id('content_scripts');
    BlockingRuleCollection.container = DOMHelper.id('blocking_rules');

    await ContentScriptCollection.displayAllRules();
    await BlockingRuleCollection.displayAllRules();

    DOMHelper.id('add_content_script').addEventListener(
        'click',
        async () =>
            DOMHelper.activateElement(await ContentScriptCollection.addRule()),
        true
    );
    DOMHelper.id('add_blocking_rule').addEventListener(
        'click',
        async () =>
            DOMHelper.activateElement(await BlockingRuleCollection.addRule()),
        true
    );
})();