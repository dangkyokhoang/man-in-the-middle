class BlockingRuleCollection extends Collection {
    /**
     * @inheritDoc
     */
    static createRuleElement({
                                 matchPatterns = [],
                                 originUrlFilters = [],
                                 method = 'GET'
                             }) {

        const ruleElement = DOMHelper.createNode({
            tagName: 'ARTICLE',
            parent: this.container,
        });

        this.createInputGroup({
            parent: ruleElement,
            text: 'Match patterns',
            input: {
                tagName: 'DIV',
                classList: ['textarea-wrapper'],
                children: [{
                    tagName: 'TEXTAREA',
                    attributes: {
                        placeholder: 'URL patterns to block',
                        name: 'matchPatterns'
                    },
                    children: matchPatterns.length ?
                        [{text: matchPatterns.join('\n')}] :
                        undefined,
                }]
            }
        });

        this.createInputGroup({
            parent: ruleElement,
            text: 'Origin URL filters',
            input: {
                tagName: 'INPUT',
                attributes: {
                    value: originUrlFilters.join(', '),
                    placeholder: 'Origin URL filters',
                    name: 'originUrlFilters'
                }
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Method',
            select: {
                tagName: 'SELECT',
                attributes: {name: 'method'},
                options: [
                    {value: 'GET'},
                    {value: 'POST'},
                    {value: 'HEAD'},
                    {value: 'PUT'},
                    {value: 'DELETE'},
                    {value: 'CONNECT'},
                    {value: 'OPTIONS'},
                    {value: 'TRACE'},
                    {value: 'PATCH'}
                ],
                selectedValue: method
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

Binder.bindMethods(BlockingRuleCollection);

BlockingRuleCollection.ruleType = 'BlockingRule';
BlockingRuleCollection.ruleElements = [];