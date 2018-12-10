'use strict';

/**
 * Request interception rule.
 * @abstract
 */
class RequestRule extends Rule {
    /**
     * @abstract
     * @param {RequestDetails} details
     * @return {Object}
     */
    requestCallback(details) {
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
     * @param {RequestDetails} details
     * @return {(Object|void)}
     */
    filterRequest(details) {
        // If origin URL or document URL is undefined,
        // let it be the request URL.
        if (!details.originUrl) {
            details.originUrl = details.url;
        }
        if (!details.documentUrl) {
            details.documentUrl = details.url;
        }

        const {url, originUrl, method} = details;
        if (
            Utils.testUrl(url, this.urlFilter, false)
            && !Utils.testUrl(url, this.urlExceptions, false)
            && (
                !this.method
                || method === this.method
            )
            && (
                Utils.testUrl(originUrl, this.originUrlFilter)
                && !Utils.testUrl(originUrl, this.originUrlExceptions, false)
            )
        ) {
            return this.requestCallback(details);
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
    method: '',
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
 *     '',
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
 * @property {string} originUrl
 * @property {string} documentUrl
 * @property {string} method
 * @property {Object[]} requestHeaders
 * @property {Object[]} responseHeaders
 * @property {string} responseBody
 * @property {string} requestId
 * @property {string} type
 * @property {number} tabId
 */
