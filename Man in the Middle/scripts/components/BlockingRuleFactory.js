class BlockingRuleFactory extends Factory {
    /**
     * @inheritDoc
     */
    static initializeRule(details) {
        const blockingRule = new this.ruleConstructor(
            Object.assign({
                requestUrls: [],
                urlFilters: [],
                frameId: 0
            }, details)
        );

        Binder.bindParentMethods(blockingRule, [{
            methodEquals: 'onRequestCallback'
        }]);

        return blockingRule.activate();
    }

    /**
     * @inheritDoc
     */
    static changeRuleDetail({index, name, value}) {
        const ruleInstance = this.ruleConstructor.getInstance(index);

        switch (name) {
            case 'matchPatterns':
                ruleInstance.setMatchPatterns(
                    value
                        .trim()
                        .split(/\s*[\r\n]\s*/)
                        .filter(matchPattern =>
                            matchPattern && matchPattern !== '<all_urls>')
                );

                break;
            case 'originUrlFilters':
                ruleInstance.setOriginUrlFilters(
                    value
                        .trim()
                        .split(/\s*[\r\n]\s*/)
                        .filter(originUrlFilters => originUrlFilters)
                );

                break;
            case 'method':
                ruleInstance.setMethod(value);
        }

        return ruleInstance;
    }
}

Binder.bindOwnMethods(BlockingRuleFactory);

Factory.ruleTypes.BlockingRule = BlockingRuleFactory;

BlockingRuleFactory.ruleConstructor = BlockingRule;

BlockingRuleFactory.storageKey = 'blockingRules';

BlockingRuleFactory.defaultRuleData = [{
    matchPatterns: [
        'https://*/ajax/bz*',
        'https://*/ajax/mercury/change_read_status*',
        'https://*/ajax/mercury/mark_folder_as_read*',
        'https://*/ajax/messaging/typ*',
    ],
    originUrlFilters: ['www.facebook.com', 'www.messenger.com'],
    method: 'POST'
}, {
    matchPatterns: [
        'https://www.facebook.com/ajax/typeahead/record_basic_metrics*',
        'https://www.facebook.com/ufi/typing*'
    ],
    originUrlFilters: [],
    method: 'POST'
}];