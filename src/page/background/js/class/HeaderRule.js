'use strict';

/**
 * Request header modification rule.
 */
class HeaderRule extends RequestRule {
    /**
     * Modify request or response headers.
     * @param {string} url
     * @param {Object} extraInfo
     * @return {(Promise<Object<Object[]>>|void)}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    requestCallback(url, extraInfo) {
        if (!this.textHeaders) {
            return;
        }

        return this.modifyHeaders(extraInfo[this.headerType]).then(headers => ({
            [this.headerType]: headers,
        }));
    }

    /**
     * @private
     * @param {Object[]} headers
     * @return {Promise<Object[]>}
     */
    async modifyHeaders(headers) {
        switch (this.textType) {
            case 'plaintext':
                return this.constructor.modify(headers, this.headers);
            case 'JavaScript':
                return Interpreter.run({
                    functionBody: this.methodModify() + this.textHeaders,
                    args: {
                        [this.headerType]: headers,
                    },
                });
        }
    }

    /**
     * @private
     * @param {Object[]} headers
     * @param {Array[]} newHeaders
     */
    static modify(headers, newHeaders) {
        newHeaders.forEach(([name, value]) => {
            // Find the current header in the list of existing headers
            const header = headers.find(header => (
                header.name.toLowerCase() === name.toLowerCase()
            ));

            // If a header with the name exists,
            // replace the header's value.
            // Otherwise, add the current header to the header list.
            if (header) {
                header.value = value;
            } else if (value) {
                headers.push({name, value});
            }
        });

        return headers;
    }

    /**
     * Generate a string to add the method 'modify' to the array of headers.
     * @return {string}
     * @see {HeaderRule.modifyHeaders}
     * @see {HeaderRule.modify}
     */
    methodModify() {
        return `${this.headerType}.modify=(function(newHeaders){`
            + `newHeaders.forEach(([name,value])=>{`
            + `const header=this.find(header=>`
            + `header.name.toLowerCase()===name.toLowerCase());`
            + `if(header){header.value=value;}`
            + `else if(value){this.push({name,value});}`
            + `});`
            + `return this;`
            + `}).bind(${this.headerType});`;
    }

    /**
     * @param {string} textHeaders
     */
    setTextHeaders(textHeaders) {
        this.textHeaders = textHeaders;

        // This updates the key 'headers'
        if (this.hasOwnProperty('textType')) {
            this.setTextType(this.textType);
        }
    }

    /**
     * @param {string} textType
     */
    setTextType(textType) {
        this.textType = textType;

        if (this.textType === 'plaintext') {
            // Convert text headers to array of new headers for later use
            const lines = this.textHeaders.trim().split(/\s*[\r\n]\s*/);
            // Convert strings to arrays, remove invalid headers
            this.headers = lines.reduce((headers, textHeader) => {
                const matches = textHeader.match(/(.+?)\s*:\s*(.*)/);
                if (matches) {
                    // [, name, value]
                    matches.shift();
                    headers.push(matches);
                }
                return headers;
            }, []);
        } else {
            this.headers = null;
        }
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
HeaderRule.default = {
    ...HeaderRule.default,
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
