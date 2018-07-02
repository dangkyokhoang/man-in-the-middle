/**
 * Content script manager
 * */
class ContentScript extends Rule {
    /**
     * Initialize a content script
     * @param {ContentScriptDetails} details
     * */
    constructor({
                    code = '',
                    scriptType = 'JavaScript',
                    domEvent = 'completed',
                    urlFilters = [],
                    frameId = 0
                }) {
        super();

        this.injectDetails = {
            code: '',
            frameId: 0
        };

        this.setCode(code);
        this.setScriptType(scriptType);
        this.setDOMEvent(domEvent);
        this.setUrlFilters(urlFilters);
        this.setFrameId(frameId);
    }

    /**
     * Inject content script if navigation's frame ID matched.
     * @param {NavigationEventDetails}
     * */
    onNavigateCallback({frameId, tabId}) {
        if (frameId !== this.injectDetails.frameId) {
            return;
        }

        this.injector(tabId, this.injectDetails);
    }

    /**
     * @param {string} code
     * */
    setCode(code) {
        this.injectDetails.code = code;
    }

    /**
     * @param {ScriptTypeString} scriptType
     * */
    setScriptType(scriptType) {
        this.scriptType = scriptType;
        this.injector = this.constructor.getScriptInjector(scriptType);
    }

    /**
     * @param {DOMEventString} domEvent
     * */
    setDOMEvent(domEvent) {
        const active = this.isActive();

        this.deactivate();

        this.domEvent = domEvent;
        this.navigationEvent = this.constructor.getNavigationEvent(domEvent);

        if (active) {
            this.activate();
        }
    }

    /**
     * @param {[string]} urlFilters
     * */
    setUrlFilters(urlFilters) {
        this.urlFilters = [...new Set(urlFilters)];

        this.filterObject = this.constructor.createFilterObject(this.urlFilters);

        if (this.isActive()) {
            this.deactivate();
            this.activate();
        }
    }

    /**
     * @param {number} frameId
     * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webNavigation/onDOMContentLoaded#details}
     * */
    setFrameId(frameId) {
        this.injectDetails.frameId = frameId;
    }

    /**
     * @inheritDoc
     * */
    activate() {
        if (this.isActive()) {
            return;
        }

        this.navigationEvent.addListener(
            this.onNavigateCallback,
            this.filterObject
        );

        this.active = true;
    }

    deactivate() {
        if (!this.isActive()) {
            return;
        }

        this.navigationEvent.removeListener(this.onNavigateCallback);

        this.active = false;
    }

    toDataObject() {
        return {
            code: this.injectDetails.code,
            scriptType: this.scriptType,
            domEvent: this.domEvent,
            urlFilters: this.urlFilters,
            frameId: this.injectDetails.frameId
        }
    }

    /**
     * @param {DOMEventString} domEvent
     * @return {object}
     */
    static getNavigationEvent(domEvent) {
        return this.navigationEvents[domEvent];
    }

    /**
     * @param {ScriptTypeString} scriptType
     * @return {function}
     */
    static getScriptInjector(scriptType) {
        return this.scriptInjectors[scriptType];
    }

    /**
     * Create navigation event listener's URL filter object from URL filter set.
     * @param {array} urlFilters
     * @return {(NavigationEventUrlFilter|undefined)} URL filter object, or undefined if no filter is given.
     */
    static createFilterObject(urlFilters) {
        if (urlFilters.length === 0) {
            return undefined;
        }

        const url = [];

        for (let urlFilter of urlFilters) {
            url.push(
                urlFilter.substr(0, 1) === '/' &&
                urlFilter.substr(-1, 1) === '/' ?
                    {urlMatches: urlFilter.substr(1, urlFilter.length - 2)} :
                    {urlContains: urlFilter}
            );
        }

        return {url};
    }
}

ContentScript.instances = [];

ContentScript.navigationEvents = {
    loading: browser.webNavigation.onCommitted,
    loaded: browser.webNavigation.onDOMContentLoaded,
    completed: browser.webNavigation.onCompleted
};

ContentScript.scriptInjectors = {
    JavaScript: browser.tabs.executeScript,
    CSS: browser.tabs.insertCSS
};

/**
 * @typedef {object} ContentScriptDetails
 * @property {string} [code]
 * @property {ScriptTypeString} [scriptType]
 * @property {DOMEventString} [domEvent]
 * @property {[string]} [urlFilters]
 * @property {number} [frameId]
 * */

/**
 * @typedef {string} ScriptTypeString
 * @value {'Javascript'}
 * @value {'CSS'}
 * */

/**
 * @typedef {string} DOMEventString
 * @value {'loading'}
 * @value {'loaded'}
 * @value {'completed'}
 * */

/**
 * @typedef {object} NavigationEventDetails
 * @property {number} tabId
 * @property {number} frameId
 *
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webNavigation/onDOMContentLoaded#details}
 * */

/**
 * @typedef {object} NavigationEventUrlFilter
 * @property {[events.UrlFilter]} url
 * */