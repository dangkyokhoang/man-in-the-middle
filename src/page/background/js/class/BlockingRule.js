'use strict';

/**
 * Request blocking rule.
 */
class BlockingRule extends RequestRule {
    /**
     * Block or redirect requests.
     * @param {RequestDetails} details
     * @return {(browser.webRequest.BlockingResponse|void)}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    async requestCallback(details) {
        // If redirect URL is set,
        // redirect the request to the redirect URL.
        // Otherwise, cancel the request.
        const redirectUrl = await this.getRedirectUrl(details);

        if (redirectUrl) {
            if (redirectUrl === details.url) {
                return {cancel: false};
            }

            return {redirectUrl};
        }

        return {cancel: true};
    }

    /**
     * @param {string} textRedirectUrl
     * @return {void}
     */
    setTextRedirectUrl(textRedirectUrl) {
        this.textRedirectUrl = textRedirectUrl;
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
     * @param {RequestDetails} details
     * @return {string}
     */
    async getRedirectUrl(details) {
        let redirectUrl;
        if (this.textRedirectUrl) {
            if (this.textType === 'JavaScript') {
                return await this.constructor.executeScript(
                    details,
                    this.textRedirectUrl
                );
            }

            redirectUrl = this.textRedirectUrl;
        } else {
            redirectUrl = this.redirectUrl;
        }
        if (!redirectUrl) {
            return '';
        }

        const {url} = details;

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
    textRedirectUrl: '',
    redirectUrl: '',
};

/**
 * @inheritDoc
 */
BlockingRule.setters = {
    ...BlockingRule.setters,
    textRedirectUrl: 'setTextRedirectUrl',
    redirectUrl: 'setRedirectUrl',
};

/**
 * @override
 * @type {Object}
 */
BlockingRule.requestEvent = browser.webRequest.onBeforeRequest;

/**
 * @private
 * @type {Object}
 */
BlockingRule.defaultUrlExceptions = {
    url: [
        {urlMatches: browser.runtime.getURL('/')},
    ],
};

Factory.register('blockingRules', BlockingRule);

/**
 * @typedef {RequestRuleDetails} BlockingRuleDetails
 * @property {string} redirectUrl
 */
