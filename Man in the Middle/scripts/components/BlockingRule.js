/**
 * Request blocking rule manager
 * */
class BlockingRule extends Rule {
    /**
     * Initialize request blocking rules
     * @param {BlockingRuleDetails} details
     * */
    constructor({
                    matchPatterns = [],
                    originUrlFilters = [],
                    method = 'GET'
                }) {
        super();

        this.setMatchPatterns(matchPatterns);
        this.setOriginUrlFilters(originUrlFilters);
        this.setMethod(method);
    }

    /**
     * Block request if it satisfies request filters
     * */
    onRequestCallback({url, originUrl, method}) {
        if (method !== this.method) {
            return;
        }

        if (this.originUrlFilters.length) {
            // If the originalUrl is undefined, let it be the url
            originUrl = originUrl || url;

            let isOriginUrlMatched = false;

            for (let originUrlFilter of this.originUrlFilters) {
                if (originUrl.includes(originUrlFilter)) {
                    isOriginUrlMatched = true;
                }
            }

            if (!isOriginUrlMatched) {
                return;
            }
        }

        return {cancel: true};
    }

    /**
     * @param {[string]} matchPatterns
     */
    setMatchPatterns(matchPatterns) {
        this.matchPatterns = [...new Set(matchPatterns)];

        if (this.isActive()) {
            this.deactivate();
            this.activate();
        }
    }

    /**
     * @param {[string]} originUrlFilters
     * */
    setOriginUrlFilters(originUrlFilters) {
        this.originUrlFilters = [...new Set(originUrlFilters)];
    }

    /**
     * @param {string} method
     * */
    setMethod(method) {
        this.method = method;
    }

    /**
     * @inheritDoc
     */
    activate() {
        if (this.isActive()) {
            return;
        }

        if (this.matchPatterns.length) {
            this.constructor.webRequestEvent.addListener(
                this.onRequestCallback,
                {urls: this.matchPatterns},
                ['blocking']
            );
        }

        this.active = true;
    }

    /**
     * @inheritDoc
     */
    deactivate() {
        if (!this.isActive()) {
            return;
        }

        this.constructor.webRequestEvent.removeListener(
            this.onRequestCallback
        );

        this.active = false;
    }

    /**
     * @inheritDoc
     */
    toDataObject() {
        return {
            matchPatterns: this.matchPatterns,
            originUrlFilters: this.originUrlFilters,
            method: this.method
        }
    }
}

BlockingRule.instances = [];

BlockingRule.webRequestEvent = browser.webRequest.onBeforeRequest;

/**
 * @typedef {object} BlockingRuleDetails
 * @param {[string]} matchPatterns = []
 * @param {[string]} originUrlFilters = []
 * @param {string} method = 'GET'
 * */