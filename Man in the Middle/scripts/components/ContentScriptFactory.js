class ContentScriptFactory extends Factory {
    /**
     * @inheritDoc
     */
    static initialize(details = {
        code: '',
        scriptType: 'JavaScript',
        domEvent: 'completed',
        urlFilters: [],
        frameId: 0
    }) {
        const contentScript = new this.ruleConstructor(details);

        Binder.bindParentMethods(contentScript, [{
            methodEquals: 'onNavigateCallback'
        }]);

        contentScript.activate();

        return contentScript;
    }

    /**
     * @inheritDoc
     */
    static change({index, name, value}) {
        const instance = this.ruleConstructor.getInstance(index);

        if (!instance) {
            return;
        }

        switch (name) {
            case 'scriptType':
                return instance.setScriptType(value);
            case 'code':
                return instance.setCode(value);
            case 'domEvent':
                return instance.setDOMEvent(value);
            case 'urlFilters':
                value = value.trim();
                return instance.setUrlFilters(value ?
                    value.split(/\s*,\s*/) :
                    []);
            case 'frameId':
                return instance.setFrameId(parseInt(value));
        }
    }
}

Factory.ruleTypes.ContentScript = ContentScriptFactory;

ContentScriptFactory.ruleConstructor = ContentScript;
ContentScriptFactory.storageKey = 'contentScripts';
ContentScriptFactory.defaultStorageData = [{
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
    urlFilters: [],
    frameId: 0
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
    'line-height: 1.5m; ' +
    'letter-spacing: 0.125em; ' +
    'background-color: #ff69b480; ' +
    'pointer-events: none;' +
    '}',
    scriptType: 'CSS',
    domEvent: 'loading',
    urlFilters: [],
    frameId: 0
}];