class ContentScriptCollection extends Collection {
    /**
     * @inheritDoc
     */
    static createRuleElement({
                                 code = '',
                                 scriptType = 'JavaScript',
                                 domEvent = 'completed',
                                 urlFilters = [],
                                 frameId = 0
                             }) {

        const ruleElement = DOMHelper.createNode({
            tagName: 'ARTICLE',
            parent: this.container
        });

        this.createInputGroup({
            parent: ruleElement,
            text: 'Code',
            input: {
                tagName: 'DIV',
                classList: ['textarea-wrapper'],
                children: [{
                    tagName: 'TEXTAREA',
                    attributes: {
                        placeholder: 'JavaScript or CSS code as content script',
                        name: 'code'
                    },
                    children: code ? [{text: code}] : undefined,
                }]
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Script type',
            select: {
                attributes: {name: 'scriptType'},
                options: [
                    {value: 'JavaScript'},
                    {value: 'CSS'}
                ],
                selectedValue: scriptType
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'DOM event',
            select: {
                attributes: {name: 'domEvent'},
                options: [
                    {value: 'loading', text: 'Loading'},
                    {value: 'loaded', text: 'Loaded'},
                    {value: 'completed', text: 'Completed'}
                ],
                selectedValue: domEvent
            }
        });

        this.createInputGroup({
            parent: ruleElement,
            text: 'URL filters',
            input: {
                tagName: 'INPUT',
                attributes: {
                    value: urlFilters.join(', '),
                    placeholder: 'URL filters',
                    name: 'urlFilters'
                }
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Frame ID',
            select: {
                tagName: 'SELECT',
                attributes: {name: 'frameId'},
                options: [
                    {value: '0'},
                    {value: '1'},
                    {value: '2'}
                ],
                selectedValue: frameId.toString()
            }
        });

        this.createRemoveButton({
            tagName: 'BUTTON',
            parent: ruleElement,
            classList: ['highlight-error'],
            children: [{text: 'Remove'}]
        });

        return ruleElement;
    }
}

Binder.bindMethods(ContentScriptCollection);

ContentScriptCollection.ruleType = 'ContentScript';
ContentScriptCollection.ruleElements = [];