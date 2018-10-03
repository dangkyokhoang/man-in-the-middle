/**
 * Content script rule.
 */
class ContentScript extends Rule {
    /**
     * @inheritDoc
     */
    register() {
        if (this.code) {
            this.navigationEvent.addListener(
                this.navigateCallback,
                this.urlFilter
            );
        }
    }

    /**
     * @inheritDoc
     */
    unregister() {
        this.navigationEvent.removeListener(this.navigateCallback);
    }

    /**
     * Inject content scripts to the tab matched the filters.
     * @private
     * @param {NavigationDetails}
     * @return {void}
     */
    navigateCallback({tabId, frameId}) {
        this.injector(tabId, {frameId, code: this.code}).catch(console.warn);
    }

    /**
     * @private
     * @param {string} code
     * @return {void}
     */
    setCode(code) {
        /**
         * @private
         * @type {string}
         */
        this.code = code;

        if (this.enabled) {
            this.disable();
            this.enable();
        }
    }

    /**
     * @private
     * @param {ScriptType} scriptType
     * @return {void}
     */
    setScriptType(scriptType) {
        /**
         * @private
         * @type {ScriptType}
         */
        this.scriptType = scriptType;
        /**
         * @private
         * @type {Function}
         */
        this.injector = this.constructor.injectors[this.scriptType];
    }

    /**
     * @private
     * @param {DOMEvent} domEvent
     * @return {void}
     */
    setDOMEvent(domEvent) {
        const enabled = this.enabled;
        this.disable();

        /**
         * @private
         * @type {DOMEvent}
         */
        this.domEvent = domEvent;
        /**
         * @private
         * @type {WebExtEvent}
         */
        this.navigationEvent = this.constructor.navigationEvents[this.domEvent];

        enabled && this.enable();
    }

    /**
     * @param {string[]} urlFilters
     * @return {void}
     */
    setUrlFilters(urlFilters) {
        /**
         * @private
         * @type {string[]}
         */
        this.urlFilters = urlFilters;
        /**
         * Web navigation event URL filter object.
         * @private
         * @type {Object}
         */
        this.urlFilter = Utils.createUrlFilters(this.urlFilters);

        if (this.enabled) {
            this.disable();
            this.enable();
        }
    }
}

/**
 * @inheritDoc
 */
ContentScript.instances = new Map;

/**
 * @override
 * @type {ContentScriptDetails}
 */
ContentScript.detailsDefault = {
    code: '',
    scriptType: 'JavaScript',
    domEvent: 'completed',
    urlFilters: [],
};

/**
 * @inheritDoc
 */
ContentScript.setters = {
    code: 'setCode',
    scriptType: 'setScriptType',
    domEvent: 'setDOMEvent',
    urlFilters: 'setUrlFilters',
};

/**
 * @private
 * @type {Object<WebExtEvent>}
 */
ContentScript.navigationEvents = {
    loading: browser.webNavigation.onCommitted,
    loaded: browser.webNavigation.onDOMContentLoaded,
    completed: browser.webNavigation.onCompleted,
};

/**
 * @private
 * @type {Object<Function>}
 */
ContentScript.injectors = {
    JavaScript: browser.tabs.executeScript,
    CSS: browser.tabs.insertCSS,
};

Factory.register('contentScripts', ContentScript);

/**
 * @typedef {Object} ContentScriptDetails
 * @property {string} [code]
 * @property {ScriptType} [scriptType]
 * @property {DOMEvent} [domEvent]
 * @property {string[]} [urlFilters]
 */

/**
 * @typedef {string} ScriptType
 * @enum {
 *     'Javascript',
 *     'CSS',
 * }
 */

/**
 * @typedef {string} DOMEvent
 * @enum {
 *     'loading',
 *     'loaded',
 *     'completed',
 * }
 */

/**
 * @typedef {object} NavigationDetails
 * @property {number} tabId
 * @property {number} frameId
 */
