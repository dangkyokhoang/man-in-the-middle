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

        this.setMatchPatterns(matchPatterns)
            .setOriginUrlFilters(originUrlFilters)
            .setMethod(method);
    }

    /**
     * @param {[string]} matchPatterns
     * @return {BlockingRule}
     */
    setMatchPatterns(matchPatterns) {
        this.matchPatterns = [...new Set(matchPatterns)];

        if (this.isActive()) {
            this.deactivate();
            this.activate();
        }

        return this;
    }

    /**
     * @param {[string]} originUrlFilters
     * @return {BlockingRule}
     * */
    setOriginUrlFilters(originUrlFilters) {
        this.originUrlFilters = [...new Set(originUrlFilters)];
        this.originFilterRule = this.constructor.createEventUrlFilters(
            this.originUrlFilters
        );

        return this;
    }

    /**
     * @param {string} method
     * @return {BlockingRule}
     * */
    setMethod(method) {
        this.method = method;

        return this;
    }

    /**
     * @override
     * @return {BlockingRule}
     */
    activate() {
        if (!this.isActive()) {
            this.active = true;

            if (this.matchPatterns.length) {
                this.constructor.webRequestEvent.addListener(
                    this.onRequestCallback,
                    {
                        urls: this.matchPatterns
                    },
                    ['blocking']
                );
            }
        }

        return this;
    }

    /**
     * @override
     * @return {BlockingRule}
     */
    deactivate() {
        if (this.isActive()) {
            this.active = false;

            this.constructor.webRequestEvent.removeListener(
                this.onRequestCallback
            );
        }

        return this;
    }

    /**
     * Block request if it satisfies request filters
     * @private
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     * */
    onRequestCallback({method, originUrl, url}) {
        if (method !== this.method) {
            return;
        }

        if (this.originFilterRule.length) {
            // If the request origin's URL is undefined,
            // let it be the request URL.
            if (!originUrl) {
                originUrl = url;
            }

            if (!this.originFilterRule.some(
                    ({urlContains = '', urlMatches = ''}) =>
                        urlContains && originUrl.includes(urlContains) ||
                        urlMatches && RegExp(urlMatches).test(originUrl)
                )) {
                return;
            }
        }

        return {cancel: true};
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
 * @param {[string]} matchPatterns = [] - Value '<all_urls>' is not allowed.
 * @param {[UrlFilter]} originUrlFilters = []
 * @param {string} method = 'GET'
 * */