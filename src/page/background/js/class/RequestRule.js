'use strict';

/**
 * Request interception rule.
 * @abstract
 */
class RequestRule extends Rule {
    /**
     * @abstract
     * @param {!string} url
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
    filterRequest({url, originUrl, method, ...extraInfo}) {
        if (
            Utils.filterUrl(url, this.urlFilter, false)
            && method === this.method
            && Utils.filterUrl(originUrl || url, this.originUrlFilter)
        ) {
            return this.requestCallback(url, extraInfo);
        }
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
RequestRule.default = {
    ...RequestRule.default,
    method: 'GET',
};

/**
 * @inheritDoc
 */
RequestRule.setters = {
    ...RequestRule.setters,
    method: 'setMethod',
};

/**
 * Children MUST declare their request event.
 * @type {Object}
 */
RequestRule.requestEvent = null;

/**
 * Children MAY add their required extra info.
 * @type {string[]}
 */
RequestRule.extraInfoSpec = ['blocking'];

/**
 * @typedef {RuleDetails} RequestRuleDetails
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
 * @property {string} url
 * @property {string} method
 * @property {Object[]} requestHeaders
 * @property {Object[]} responseHeaders
 * @property {string} requestId
 */
