class BlockingRuleFactory extends Factory {
    /**
     * @inheritDoc
     */
    static initialize(details = {
        requestUrls: [],
        urlFilters: [],
        frameId: 0
    }) {
        const blockingRule = new this.ruleConstructor(details);

        Binder.bindParentMethods(blockingRule, [{
            methodEquals: 'onRequestCallback'
        }]);

        blockingRule.activate();

        return blockingRule;
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
            case 'matchPatterns':
                value = value.trim();
                return instance.setMatchPatterns(value ?
                    value.split(/\s*[\r\n]\s*/) :
                    []);
            case 'originUrlFilters':
                value = value.trim();
                return instance.setOriginUrlFilters(value ?
                    value.split(/\s*,\s*/) :
                    []);
            case 'method':
                return instance.setMethod(value);
        }
    }
}

Factory.ruleTypes.BlockingRule = BlockingRuleFactory;

BlockingRuleFactory.ruleConstructor = BlockingRule;
BlockingRuleFactory.storageKey = 'blockingRules';
BlockingRuleFactory.defaultStorageData = [{
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