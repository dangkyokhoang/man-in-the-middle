'use strict';

/**
 * Content script rule.
 */
class ContentScript extends Rule {
    /**
     * @inheritDoc
     */
    register() {
        if (this.code && this.urlFilters.length) {
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
     * Inject content scripts to tabs matching the filters.
     * @private
     * @param {NavigationDetails}
     * @return {void}
     */
    async navigateCallback({tabId, frameId, url}) {
        if (Utils.testUrl(url, this.urlExceptions, false)) {
            return;
        }

        if (this.originUrlFilters.length) {
            // Origin URL is the top window's URL
            let originUrl;
            // If the current frame is the top window,
            // the origin URL is the navigation URL.
            if (frameId === 0) {
                originUrl = url;
            } else {
                const originFrame = await browser.webNavigation.getFrame({
                    tabId,
                    frameId: 0,
                });
                originUrl = originFrame.url;
            }

            if (
                !Utils.testUrl(originUrl, this.originUrlFilter)
                || Utils.testUrl(originUrl, this.originUrlExceptions, false)
            ) {
                return;
            }
        }

        this.injector(tabId, {
            frameId,
            code: this.code,
            runAt: this.runAt,
        }).catch(Logger.log);
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

        if (this.active) {
            this.deactivate();
            this.activate();
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
        const active = this.active;
        this.deactivate();

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
        /**
         * @private
         * @type {string}
         */
        this.runAt = this.constructor.runAts[this.domEvent];

        active && this.activate();
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
ContentScript.default = {
    ...ContentScript.default,
    code: '',
    scriptType: 'JavaScript',
    domEvent: 'completed',
};

/**
 * @inheritDoc
 */
ContentScript.setters = {
    ...ContentScript.setters,
    code: 'setCode',
    scriptType: 'setScriptType',
    domEvent: 'setDOMEvent',
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
 * @type {Object<string>}
 */
ContentScript.runAts = {
    loading: 'document_start',
    loaded: 'document_end',
    completed: 'document_idle',
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
 * @typedef {RuleDetails} ContentScriptDetails
 * @property {string} [code]
 * @property {ScriptType} [scriptType]
 * @property {DOMEvent} [domEvent]
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
