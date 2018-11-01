/**
 * Request interception rule.
 */
class RequestRule extends Rule {
    /**
     * @abstract
     * @param {string} url
     * @param {Object} [extraInfo]
     * @return {Object}
     */
    requestCallback(url, extraInfo) {
    }

    /**
     * @inheritDoc
     */
    register() {
        if (this.urlFilters.length) {
            this.constructor.requestEvent.addListener(
                this.filterRequest,
                {urls: ['<all_urls>']},
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
     * @param {RequestDetails}
     * @return {(Object|void)}
     */
    filterRequest({method, originUrl, url, ...extraInfo}) {
        if (
            method === this.method &&
            Utils.filterUrl(url, this.urlFilter) &&
            Utils.filterUrl(originUrl || url, this.originUrlFilter)
        ) {
            return this.requestCallback(url, extraInfo);
        }
    }

    /**
     * @param {string[]} urlFilters
     * @return {void}
     */
    setUrlFilters(urlFilters) {
        this.urlFilters = urlFilters;
        this.urlFilter = Utils.createUrlFilters(this.urlFilters);

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
        this.originUrlFilter = Utils.createUrlFilters(this.originUrlFilters);
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
    urlFilters: [],
    originUrlFilters: [],
    method: 'GET',
};

/**
 * @inheritDoc
 */
RequestRule.setters = {
    ...RequestRule.setters,
    urlFilters: 'setUrlFilters',
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
 * @property {string[]} [urlFilters]
 * @property {string[]} [matchPatterns] Deprecated since version 3.
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
