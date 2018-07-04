class ContentScriptCollection extends Collection {
    /**
     * @inheritDoc
     */
    static createInputGroups(ruleElement,
                             {
                                 code = '',
                                 scriptType = 'JavaScript',
                                 domEvent = 'completed',
                                 urlFilters = [],
                                 frameId = 0
                             }) {
        this.createTextareaGroup({
            parent: ruleElement,
            text: 'Code',
            textarea: {
                tagName: 'TEXTAREA',
                attributes: {
                    name: 'code',
                    placeholder: 'JavaScript or CSS as content script'
                },
                children: code ? [{text: code}] : []
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Script type',
            select: {
                attributes: {
                    name: 'scriptType'
                },
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
                attributes: {
                    name: 'domEvent'
                },
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
                    name: 'urlFilters',
                    value: urlFilters.join(', '),
                    placeholder: 'URL filters'
                }
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Frame ID',
            select: {
                tagName: 'SELECT',
                attributes: {
                    name: 'frameId'
                },
                options: [
                    {value: '0'},
                    {value: '1'},
                    {value: '2'}
                ],
                selectedValue: frameId.toString()
            }
        });
    }
}

Binder.bindMethods(ContentScriptCollection);

ContentScriptCollection.ruleType = 'ContentScript';

ContentScriptCollection.ruleElements = [];