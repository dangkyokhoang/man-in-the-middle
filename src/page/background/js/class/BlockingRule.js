/**
 * Request blocking rule.
 */
class BlockingRule extends RequestRule {
    /**
     * Block or redirect requests.
     * @param {Object} extraInfo
     * @return {browser.webRequest.BlockingResponse}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    async requestCallback(extraInfo) {
        // If redirect URL is set, redirect the request to the URL.
        // Otherwise, cancel the request.
        const redirectUrl = this.redirectUrl;
        return redirectUrl ? {redirectUrl} : {cancel: true};
    }

    /**
     * @param {string} redirectUrl
     * @return {void}
     */
    setRedirectUrl(redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
}

Binder.bind(BlockingRule);

/**
 * @inheritDoc
 */
BlockingRule.instances = new Map;

/**
 * @type {BlockingRuleDetails}
 */
BlockingRule.detailsDefault = {
    ...BlockingRule.detailsDefault,
    redirectUrl: '',
};

/**
 * @inheritDoc
 */
BlockingRule.setters = {
    ...BlockingRule.setters,
    redirectUrl: 'setRedirectUrl',
};

/**
 * @override
 * @type {Object}
 */
BlockingRule.requestEvent = browser.webRequest.onBeforeRequest;

/**
 * @const
 * @type {string[]}
 */
BlockingRule.extraInfoSpec = [...BlockingRule.extraInfoSpec];

Factory.register('blockingRules', BlockingRule);

/**
 * @typedef {RequestRuleDetails} BlockingRuleDetails
 * @property {string} redirectUrl
 */
