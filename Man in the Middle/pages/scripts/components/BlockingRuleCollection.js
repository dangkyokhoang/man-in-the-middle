class BlockingRuleCollection extends Collection {
    /**
     * @inheritDoc
     */
    static createInputGroups(ruleElement,
                             {
                                 matchPatterns = [],
                                 originUrlFilters = [],
                                 method = 'GET'
                             }) {
        this.createTextareaGroup({
            parent: ruleElement,
            text: 'Match patterns',
            textarea: {
                tagName: 'TEXTAREA',
                attributes: {
                    name: 'matchPatterns',
                    placeholder: 'URL patterns to block'
                },
                children: matchPatterns.length ?
                    [{text: matchPatterns.join('\n')}] :
                    []
            }
        });

        this.createInputGroup({
            parent: ruleElement,
            text: 'Origin URL filters',
            input: {
                tagName: 'INPUT',
                attributes: {
                    name: 'originUrlFilters',
                    value: originUrlFilters.join(', '),
                    placeholder: 'Origin URL filters'
                }
            }
        });

        this.createSelectGroup({
            parent: ruleElement,
            text: 'Method',
            select: {
                tagName: 'SELECT',
                attributes: {
                    name: 'method'
                },
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
    }
}

Binder.bindMethods(BlockingRuleCollection);

BlockingRuleCollection.ruleType = 'BlockingRule';

BlockingRuleCollection.ruleElements = [];