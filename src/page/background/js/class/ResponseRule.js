'use strict';

/**
 * Request response body modification rule.
 */
class ResponseRule extends RequestRule {
    /**
     * Modify the response body of the request.
     * @param {string} url
     * @param {Object} extraInfo
     * @return {void}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData}
     */
    async requestCallback(url, extraInfo) {
        const {requestId, responseHeaders, documentUrl} = extraInfo;
        let charset = this.constructor.getCharset(responseHeaders);
        if (!charset) {
            if (documentUrl === undefined) {
                // No charset was detected,
                // but this request is a document (assumed html),
                // the response's supposed to be text,
                // so default encoding is used.
                charset = this.constructor.defaultEncoding;
            } else {
                return;
            }
        }

        /**
         * @type {Object}
         */
        const filter = browser.webRequest.filterResponseData(requestId);
        const decoder = new TextDecoder(charset);
        const encoder = new TextEncoder();

        let responseBody = '';
        filter.ondata = (event) => {
            responseBody += decoder.decode(event.data, {stream: true});
        };

        filter.onstop = async () => {
            filter.write(encoder.encode(await this.modifyResponse(
                responseBody
            )));
            filter.close();
        };
    }

    /**
     * @private
     * @param {string} responseBody
     * @return {Promise<string>}
     */
    async modifyResponse(responseBody) {
        switch (this.textType) {
            case 'plaintext':
                return this.textResponse;
            case 'JavaScript':
                return Interpreter.run({
                    functionBody: this.textResponse,
                    args: {responseBody},
                });
        }
    }

    /**
     * Get charset from Content-Type header.
     * @param {Object[]} responseHeaders
     * @return {string}
     */
    static getCharset(responseHeaders) {
        // Find Content-Type header
        const header = responseHeaders.find(({name}) => (
            name.toLowerCase() === 'content-type'
        ));
        if (!header) {
            // No content type is specified
            return '';
        }
        const value = header.value.toLowerCase();

        const matchType = value.match(/[a-z]+\/[0-9a-z\-+.]+/);
        if (
            !matchType
            || !this.textSigns.some(sign => matchType[0].includes(sign))
        ) {
            // Content type is not recognized or not supported
            return '';
        }

        const matchCharset = value.match(/charset\s*=\s*['"]?([\w\- ]+)/);
        if (!matchCharset) {
            return this.defaultEncoding;
        }

        const [, charset] = matchCharset;
        if (!this.encodings.has(charset)) {
            // The specified charset is not supported
            return '';
        }

        return charset;
    }

    /**
     * @param {string} textResponse
     */
    setTextResponse(textResponse) {
        this.textResponse = textResponse;
    }

    /**
     * @param {string} textType
     */
    setTextType(textType) {
        this.textType = textType;
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
    textType: 'plaintext',
};

/**
 * @inheritDoc
 */
ResponseRule.setters = {
    ...ResponseRule.setters,
    textResponse: 'setTextResponse',
    textType: 'setTextType',
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
 * If Content-Type includes one of these signs,
 *     it's supposed to be text.
 * @type {string[]}
 */
ResponseRule.textSigns = [
    'text',
    'javascript',
    'css',
    'json',
    'typescript',
    'xml',
    'rtf',
];

/**
 * Supported (common) encodings.
 * @type {Set<string>}
 * @see {@link https://en.wikipedia.org/wiki/Character_encoding}
 */
ResponseRule.encodings = new Set([
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
]);

/**
 * Though HTTP 1.1 default encoding is ISO-8859-1,
 *     UTF-8 is probably more common.
 * @type {string}
 */
ResponseRule.defaultEncoding = 'utf-8';

Factory.register('responseRules', ResponseRule);

/**
 * @typedef {RequestRuleDetails} ResponseRuleDetails
 * @property {string} [textResponse]
 * @property {string} [textType]
 */
