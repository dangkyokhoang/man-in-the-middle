class ContentScriptFactory extends Factory {
    /**
     * @inheritDoc
     */
    static initializeRule(details) {
        const contentScript = new this.ruleConstructor(
            Object.assign({
                code: '',
                scriptType: 'JavaScript',
                domEvent: 'completed',
                urlFilters: []
            }, details)
        );

        Binder.bindParentMethods(contentScript, [{
            methodEquals: 'onNavigateCallback'
        }]);

        return contentScript.activate();
    }

    /**
     * @inheritDoc
     */
    static changeRuleDetail({index, name, value}) {
        const ruleInstance = this.ruleConstructor.getInstance(index);

        switch (name) {
            case 'code':
                ruleInstance.setCode(value);

                break;
            case 'scriptType':
                ruleInstance.setScriptType(value);

                break;
            case 'domEvent':
                ruleInstance.setDOMEvent(value);

                break;
            case 'urlFilters':
                ruleInstance.setUrlFilters(
                    value
                        .trim()
                        .split(/\s*,\s*/)
                        .filter(urlFilter => urlFilter)
                );

                break;
        }

        return ruleInstance;
    }
}

Binder.bindOwnMethods(ContentScriptFactory);

Factory.ruleTypes.ContentScript = ContentScriptFactory;

ContentScriptFactory.ruleConstructor = ContentScript;

ContentScriptFactory.storageKey = 'contentScripts';

ContentScriptFactory.defaultRuleData = [{
    code: '/* Sample JavaScript code */ ' +
    'document && ' +
    'document.body && ' +
    '(() => {' +
    'const textNode = document.createTextNode("MitM Extension"), ' +
    'icon = document.createElement("DIV"); ' +
    'icon.classList.add("MitM-Icon"); ' +
    'icon.appendChild(textNode); ' +
    'document.body.appendChild(icon);' +
    '})();',
    scriptType: 'JavaScript',
    domEvent: 'loading',
    urlFilters: []
}, {
    code: '/* Sample CSS code */ ' +
    'body > div.MitM-Icon {' +
    'z-index: 2147483647; ' +
    'position: fixed; ' +
    'left: 10px; ' +
    'top: 10px; ' +
    'font-size: 10px; ' +
    'font-family: Arial; ' +
    'border-radius: 1em; ' +
    'padding: 0.25em 1em; ' +
    'line-height: 1.5em; ' +
    'letter-spacing: 0.125em; ' +
    'background-color: #ff69b480; ' +
    'pointer-events: none;' +
    '}',
    scriptType: 'CSS',
    domEvent: 'loading',
    urlFilters: []
}];