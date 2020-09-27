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
     * @protected
     * @param {RequestDetails} details
     * @param {string} functionBody
     * @return {Promise}
     */
    static async executeScript(details, functionBody) {
        const args = {};

        // Add request details to the arguments
        this.requestDetails.forEach(detail => {
            if (functionBody.includes(detail)) {
                args[detail] = details[detail];
            }
        });

        // Add tab details to the arguements
        if (this.tabDetails.some(detail => functionBody.includes(detail))) {
            // Add tab details to the arguments
            const tab = await Tabs.get(details.tabId);
            this.tabDetails.forEach(detail => {
                if (functionBody.includes(detail)) {
                    args[detail] = tab[detail];
                }
            });
        }

        return Interpreter.run({
            functionBody,
            args,
        }).catch(Logger.log);
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

    /**
     * @param {string} textType
     */
    setTextType(textType) {
        this.textType = textType;
    }
}

/**
 * @const
 * @type {RequestRuleDetails}
 */
RequestRule.default = {
    ...RequestRule.default,
    method: '',
    textType: 'plaintext',
};

RequestRule.fields = [
    ...RequestRule.fields,
    'method',
    'textType',
];

/**
 * @inheritDoc
 */
RequestRule.setters = {
    ...RequestRule.setters,
    method: 'setMethod',
    textType: 'setTextType',
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
 * Request details accessible inside JavaScript function.
 * @type {string[]}
 */
RequestRule.requestDetails = [
    'requestHeaders',
    'responseHeaders',
    'responseBody',
    'url',
    'originUrl',
    'documentUrl',
    'method',
    'proxyInfo',
    'type',
    'timeStamp',
];

/**
 * Tab details accessible inside JavaScript function.
 * @type {string[]}
 */
RequestRule.tabDetails = [
    'incognito',
    'pinned',
];

/**
 * @typedef {RuleDetails} RequestRuleDetails
 * @property {RequestMethod} [method]
 * @property {string} [textType]
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
