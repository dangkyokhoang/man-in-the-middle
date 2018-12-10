/**
 * @abstract
 */
class RequestModificationRule extends RequestRule {
    /**
     * @protected
     * @param {RequestDetails} details
     * @param {string} functionBody
     * @return {Promise}
     */
    static async scriptModify(details, functionBody) {
        const args = {};
        // Add request details to the arguments
        this.requestDetails.forEach(detail => {
            if (functionBody.includes(detail)) {
                args[detail] = details[detail];
            }
        });
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
     * @param {string} textType
     */
    setTextType(textType) {
        this.textType = textType;
    }
}

RequestModificationRule.default = {
    ...RequestModificationRule.default,
    textType: 'plaintext',
};

RequestModificationRule.setters = {
    ...RequestModificationRule.setters,
    textType: 'setTextType',
};

/**
 * Request details accessible inside JavaScript function.
 * @type {string[]}
 */
RequestModificationRule.requestDetails = [
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
RequestModificationRule.tabDetails = [
    'incognito',
    'pinned',
];

/**
 * @typedef {RequestRuleDetails} RequestModificationRuleDetails
 * @property {string} [textType]
 */
