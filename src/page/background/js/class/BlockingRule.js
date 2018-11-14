'use strict';

/**
 * Request blocking rule.
 */
class BlockingRule extends RequestRule {
    /**
     * Block or redirect requests.
     * @param {string} url
     * @param {Object} extraInfo
     * @return {browser.webRequest.BlockingResponse}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    async requestCallback(url, extraInfo) {
        // If redirect URL is set,
        // redirect the request to the redirect URL.
        // Otherwise, cancel the request.
        const redirectUrl = this.getRedirectUrl(url);
        return redirectUrl ? {redirectUrl} : {cancel: true};
    }

    /**
     * @param {string} redirectUrl
     * @return {void}
     */
    setRedirectUrl(redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    /**
     * @private
     * @param {string} url
     * @return {string}
     */
    getRedirectUrl(url) {
        if (!this.redirectUrl) {
            return '';
        }

        let redirectUrl = this.redirectUrl;

        // Find a RegExp filter that matches the URL
        const filter = this.urlFilter.url.find(({urlMatches}) => (
            urlMatches && RegExp(urlMatches).test(url)
        ));
        // If a filter found,
        // replace '$i' in the redirect URL with capture groups.
        if (filter) {
            // Capture groups
            const matches = url.match(RegExp(filter.urlMatches));
            for (let i = matches.length - 1; i > 0; i--) {
                const search = RegExp('\\$' + i.toString(), 'g');
                redirectUrl = redirectUrl.replace(search, matches[i]);
            }
        }

        return redirectUrl;
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
BlockingRule.default = {
    ...BlockingRule.default,
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

Factory.register('blockingRules', BlockingRule);

/**
 * @typedef {RequestRuleDetails} BlockingRuleDetails
 * @property {string} redirectUrl
 */
