'use strict';

/**
 * Request header modification rule.
 */
class HeaderRule extends RequestRule {
    /**
     * Modify request or response headers.
     * @param {RequestDetails} details
     * @return {(Promise<Object>|Object)}
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
     */
    requestCallback(details) {
        if (!this.textHeaders) {
            return;
        }

        const headers = details[this.headerType];
        switch (this.textType) {
            case 'plaintext':
                return {
                    [this.headerType]: this.textModify(headers),
                };
            case 'JavaScript':
                return this.constructor.executeScript(
                    details,
                    this.getHeaderMethods() + this.textHeaders
                ).then(headers => ({
                    [this.headerType]: headers,
                }));
        }
    }

    /**
     * @private
     * @param {Object[]} headers
     */
    textModify(headers) {
        if (!this.arrayHeaders) {
            // Convert text headers to array of new headers
            const lines = this.textHeaders.trim().split(/\s*[\r\n]\s*/);

            // Convert lines to arrays of pairs, remove invalid headers
            this.arrayHeaders = lines.reduce((headers, textHeader) => {
                const matches = textHeader.match(/(.+?)\s*:\s*(.*)/);
                if (matches) {
                    // [, name, value]
                    matches.shift();
                    headers.push(matches);
                }
                return headers;
            }, []);
        }

        this.arrayHeaders.forEach(([name, value]) => {
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
     * Additional methods for the header array.
     * @return {string}
     */
    getHeaderMethods() {
        return Object.entries(this.constructor.headerMethods).reduce(
            /**
             * @param {string} methods
             * @param {string} name
             * @param {string} args
             * @param {string} functionBody
             * @return {string}
             */
            (methods, [name, [args, functionBody]]) => {
                if (
                    this.textHeaders.includes(`${this.headerType}.${name}`)
                    || methods.includes(`this.${name}`)
                ) {
                    methods = `${this.headerType}.${name}=`
                        + `(function(${args}){${functionBody}`
                        + `}).bind(${this.headerType});`
                        + methods;
                }
                return methods;
            },
            ''
        );
    }

    /**
     * @param {string} textHeaders
     */
    setTextHeaders(textHeaders) {
        this.textHeaders = textHeaders;
        this.arrayHeaders = null;
    }

    /**
     * @param {HeaderType} headerType
     */
    setHeaderType(headerType) {
        const active = this.active;
        this.deactivate();

        this.headerType = headerType;

        this.constructor.requestEvent = (
            this.constructor.requestEvents[this.headerType]
        );
        this.constructor.extraInfoSpec = (
            this.constructor.extraInfoSpecs[this.headerType]
        );

        active && this.activate();
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
    headerType: 'requestHeaders',
};

/**
 * @inheritDoc
 */
HeaderRule.setters = {
    ...HeaderRule.setters,
    textHeaders: 'setTextHeaders',
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

/**
 * Header array methods.
 * @type {Object<string[]>}
 */
HeaderRule.headerMethods = {
    modify: [
        'pairs',
        `pairs.forEach(([name,value])=>this.set(name,value));`
        + `return this;`
    ],
    set: [
        'name,value',
        `const header=this.get(name);`
        + `if(header){header.value=value;}`
        + `else if(value){this.push({name,value});}`
        + `return this;`,
    ],
    get: [
        'name',
        `return this.find(`
        + `header=>header.name.toLowerCase()===name.toLowerCase());`,
    ],
};

Factory.register('headerRules', HeaderRule);

/**
 * @typedef {RequestRuleDetails} HeaderRuleDetails
 * @property {string} [textHeaders]
 * @property {HeaderType} [headerType]
 */

/**
 * @typedef {string} HeaderType
 * @enum {
 *     'requestHeaders',
 *     'responseHeaders'
 * }
 */
