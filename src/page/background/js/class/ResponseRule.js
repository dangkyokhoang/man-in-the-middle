'use strict';

/**
 * Request response body modification rule.
 */
class ResponseRule extends RequestRule {
    /**
     * Modify the response body of the request.
     * @param {RequestDetails} details
     * @return {void}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData}
     */
    async requestCallback(details) {
        if (!this.textResponse) {
            return;
        }

        const {requestId, responseHeaders} = details;

        // Detect charset
        let charset = this.constructor.detectCharset(responseHeaders);
        if (!charset && !this.constructor.textResources.has(details.type)) {
            // If the charset is undefined,
            // and the resource type is unknown,
            // then skip the request.
            return;
        }

        /**
         * @type {Object}
         */
        const filter = browser.webRequest.filterResponseData(requestId);
        const decoder = new TextDecoder(
            charset || this.constructor.defaultEncoding
        );
        const encoder = new TextEncoder();

        // Request body as a property of the request details
        details.responseBody = '';
        filter.ondata = (event) => {
            details.responseBody += decoder.decode(event.data, {stream: true});
        };

        filter.onstop = async () => {
            const responseBody = await this.getResponse(details);

            filter.write(encoder.encode(responseBody || details.responseBody));
            filter.close();
        };
    }

    /**
     * @private
     * @param {RequestDetails} details
     * @return {(Promise<string>|string)}
     */
    getResponse(details) {
        switch (this.textType) {
            case 'plaintext':
                return this.textResponse;
            case 'JavaScript':
                return this.constructor.executeScript(
                    details,
                    this.textResponse
                );
        }
    }

    /**
     * Get charset from Content-Type header.
     * @param {Object[]} responseHeaders
     * @return {(string|void)}
     */
    static detectCharset(responseHeaders) {
        // Get the Content-Type header
        const header = responseHeaders.find(({name}) => (
            name.toLowerCase() === 'content-type'
        ));
        if (!header) {
            return;
        }
        const value = header.value.toLowerCase();

        const charset = this.encodings.find(charset => value.includes(charset));
        if (charset) {
            return charset;
        }
        // If the charset is not detected,
        // but the content type is a text type,
        // return the default charset.
        if (this.textTypes.some(textType => value.includes(textType))) {
            return this.defaultEncoding;
        }
    }

    /**
     * @param {string} textResponse
     */
    setTextResponse(textResponse) {
        this.textResponse = textResponse;
    }
}

Binder.bind(ResponseRule);

/**
 * @inheritDoc
 */
ResponseRule.instances = new Map;

/**
 * @type {ResponseRuleDetails}
 */
ResponseRule.default = {
    ...ResponseRule.default,
    textResponse: '',
};

/**
 * @inheritDoc
 */
ResponseRule.setters = {
    ...ResponseRule.setters,
    textResponse: 'setTextResponse',
};

/**
 * @override
 * @type {Object}
 */
ResponseRule.requestEvent = browser.webRequest.onHeadersReceived;

/**
 * @const
 * @type {Object<string[]>}
 */
ResponseRule.extraInfoSpec = [
    ...ResponseRule.extraInfoSpec,
    'responseHeaders',
];

/**
 * Types of text resources.
 * @type {Set<string>}
 */
ResponseRule.textResources = new Set([
    'main_frame',
    'sub_frame',
    'web_manifest',
    'script',
    'stylesheet',
]);

/**
 * Content types as texts.
 * @type {string[]}
 */
ResponseRule.textTypes = [
    'text',
    'javascript',
    'css',
    'json',
    'typescript',
    'xml',
];

/**
 * Supported (common) encodings.
 * @type {string[]}
 * @see {@link https://en.wikipedia.org/wiki/Character_encoding}
 */
ResponseRule.encodings = [
    'utf-8',
    'ascii',
    'iso-8859-1',
    'iso-8859-2',
    'iso-8859-3',
    'iso-8859-4',
    'iso-8859-5',
    'iso-8859-6',
    'iso-8859-7',
    'iso-8859-8',
    'iso-8859-9',
    'iso-8859-10',
    'iso-8859-11',
    'iso-8859-13',
    'iso-8859-14',
    'iso-8859-15',
    'iso-8859-16',
    'windows-1251',
    'windows-1252',
    'windows-1253',
    'windows-1254',
    'windows-1255',
    'windows-1256',
    'windows-1257',
    'windows-1258',
    'macintosh',
    'koi8-r',
    'koi8-u',
    'shift_jis',
    'euc-jp',
    'iso-2022-jp',
    'gb_2312-80',
    'gbk',
    'gb18030',
    'big5',
    'euc-kr',
];

/**
 * @type {string}
 */
ResponseRule.defaultEncoding = 'utf-8';

Factory.register('responseRules', ResponseRule);

/**
 * @typedef {RequestRuleDetails} ResponseRuleDetails
 * @property {string} [textResponse]
 */
