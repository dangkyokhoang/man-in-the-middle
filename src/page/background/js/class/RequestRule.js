/**
 * Request interception rule.
 */
class RequestRule extends Rule {
    /**
     * @abstract
     * @param {Object} [extraInfo]
     * @return {Object}
     */
    requestCallback(extraInfo) {
    }

    /**
     * @inheritDoc
     */
    register() {
        if (this.matchPatterns.length) {
            this.constructor.requestEvent.addListener(
                this.filterRequest,
                {urls: this.matchPatterns},
                this.constructor.extraInfoSpec
            );
        }
    }

    /**
     * @inheritDoc
     */
    unregister() {
        this.constructor.requestEvent.removeListener(this.filterRequest);
    }

    /**
     * @param {RequestDetails} details
     * @return {(Object|void)}
     */
    filterRequest({method, originUrl, url, ...extraInfo}) {
        if (
            method === this.method &&
            Utils.filterUrl(originUrl || url, this.urlFilter)
        ) {
            return this.requestCallback(extraInfo);
        }
    }

    /**
     * @param {string[]} matchPatterns
     * @return {void}
     */
    setMatchPatterns(matchPatterns) {
        this.matchPatterns = matchPatterns;

        if (this.enabled) {
            this.disable();
            this.enable();
        }
    }

    /**
     * @param {string[]} originUrlFilters
     * @return {void}
     */
    setOriginUrlFilters(originUrlFilters) {
        this.originUrlFilters = originUrlFilters;
        this.urlFilter = Utils.createUrlFilters(this.originUrlFilters);
    }

    /**
     * @param {string} method
     * @return {void}
     */
    setMethod(method) {
        this.method = method;
    }
}

/**
 * @const
 * @type {RequestRuleDetails}
 */
RequestRule.detailsDefault = {
    ...RequestRule.detailsDefault,
    matchPatterns: [],
    originUrlFilters: [],
    method: 'GET',
};

/**
 * @inheritDoc
 */
RequestRule.setters = {
    ...RequestRule.setters,
    matchPatterns: 'setMatchPatterns',
    originUrlFilters: 'setOriginUrlFilters',
    method: 'setMethod',
};

/**
 * Children MUST register their request event.
 * @type {Object}
 */
RequestRule.requestEvent = null;

/**
 * Children MUST declare their required extra info.
 * @type {string[]}
 */
RequestRule.extraInfoSpec = ['blocking'];

/**
 * @typedef {RuleDetails} RequestRuleDetails
 * @property {string[]} [matchPatterns]
 * @property {string[]} [originUrlFilters]
 * @property {RequestMethod} [method]
 */

/**
 * @typedef {string} RequestMethod
 * @enum {
 *     'GET',
 *     'POST',
 *     'HEAD',
 *     'PUT',
 *     'DELETE',
 *     'CONNECT',
 *     'TRACE',
 *     'PATCH',
 * }
 */

/**
 * @typedef {object} RequestDetails
 * @property {string} method
 * @property {string} originUrl
 * @property {string} url
 * @property {Object[]} requestHeaders
 * @property {Object[]} responseHeaders
 */
