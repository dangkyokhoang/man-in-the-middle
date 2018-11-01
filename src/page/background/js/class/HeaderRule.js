/**
 * Request header modification rule.
 */
class HeaderRule extends RequestRule {
    /**
     * Modify request or response headers.
     * @param {string} url
     * @param {Object} extraInfo
     * @return {Promise<Object<Object[]>>}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    requestCallback(url, extraInfo) {
        return this.blockingResponse(
            this.processHeaders(extraInfo[this.headerType])
        );
    }

    /**
     * @private
     * @param {Object[]} headers
     * @return {Promise<Object[]>}
     */
    async processHeaders(headers) {
        switch (this.textType) {
            case 'plaintext':
                return this.constructor.replaceHeaders(
                    headers,
                    this.textHeaders
                );
            case 'JavaScript':
                return Interpreter.run({
                    functionBody: this.textHeaders,
                    args: {[this.headerType]: headers}
                });
        }
    }

    /**
     * @private
     * @param {Promise<Object<Object[]>>} promise
     */
    blockingResponse(promise) {
        return promise.then(headers => ({[this.headerType]: headers}));
    }

    /**
     * @private
     * @param {Object[]} headers
     * @param {string} textHeaders
     */
    static replaceHeaders(headers, textHeaders) {
        textHeaders.trim().split(/\s*[\r\n]\s*/).forEach(textHeader => {
            let [name, value = ''] = textHeader.split(':', 2);
            name = name.trim();
            value = value.trim();

            // Find the current header in the existed header list
            const header = headers.find(header => (
                header.name.toLowerCase() === name.toLowerCase()
            ));
            // If a header with the name exists, replace the header's value.
            // Otherwise, add the current header to header list.
            if (header) {
                header.value = value;
            } else if (value) {
                headers.push({name, value});
            }
        });

        return headers;
    }

    /**
     * @param {string} textHeaders
     */
    setTextHeaders(textHeaders) {
        this.textHeaders = textHeaders;
    }

    /**
     * @param {string} textType
     */
    setTextType(textType) {
        this.textType = textType;
    }

    /**
     * @param {HeaderType} headerType
     */
    setHeaderType(headerType) {
        this.headerType = headerType;

        this.constructor.requestEvent = (
            this.constructor.requestEvents[this.headerType]
        );

        this.constructor.extraInfoSpec = (
            this.constructor.extraInfoSpecs[this.headerType]
        );
    }
}

Binder.bind(HeaderRule);

/**
 * @inheritDoc
 */
HeaderRule.instances = new Map;

/**
 * @type {HeaderRuleDetails}
 */
HeaderRule.detailsDefault = {
    ...HeaderRule.detailsDefault,
    textHeaders: '',
    textType: 'plaintext',
    headerType: 'requestHeaders',
};

/**
 * @inheritDoc
 */
HeaderRule.setters = {
    ...HeaderRule.setters,
    textHeaders: 'setTextHeaders',
    textType: 'setTextType',
    headerType: 'setHeaderType',
};

/**
 * @const
 * @type {Object}
 */
HeaderRule.requestEvents = {
    requestHeaders: browser.webRequest.onBeforeSendHeaders,
    responseHeaders: browser.webRequest.onHeadersReceived,
};

/**
 * @const
 * @type {Object<string[]>}
 */
HeaderRule.extraInfoSpecs = {
    requestHeaders: [
        ...HeaderRule.extraInfoSpec,
        'requestHeaders',
    ],
    responseHeaders: [
        ...HeaderRule.extraInfoSpec,
        'responseHeaders',
    ],
};

Factory.register('headerRules', HeaderRule);

/**
 * @typedef {RequestRuleDetails} HeaderRuleDetails
 * @property {string} [textHeaders]
 * @property {string} [textType]
 * @property {HeaderType} [headerType]
 */

/**
 * @typedef {string} HeaderType
 * @enum {
 *     'requestHeaders',
 *     'responseHeaders'
 * }
 */
