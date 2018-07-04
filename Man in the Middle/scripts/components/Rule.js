/**
 * This makes it easy to deal with rules
 * */
class Rule {
    /**
     * Initialize a rule
     * */
    constructor() {
        // This tells whether this rule is active.
        this.active = false;

        this.constructor.instances.push(this);
    }

    /**
     * @abstract
     */
    activate() {
    }

    /**
     * @abstract
     */
    deactivate() {
    }

    /**
     * @abstract
     * @return {object}
     * */
    toDataObject() {
    }

    /**
     * @return {boolean} True if the rule is active, false otherwise.
     * */
    isActive() {
        return this.active;
    }

    /**
     * Remove this instance of rule
     * */
    remove() {
        this.isActive() && this.deactivate();

        this.constructor.instances.splice(
            this.constructor.getIndex(this),
            1
        );
    }

    /**
     * @param {object} instance
     * @return {number}
     * */
    static getIndex(instance) {
        return this.instances.indexOf(instance);
    }

    /**
     * @param {number} index
     * @return {Rule}
     * */
    static getInstance(index) {
        return this.instances[index];
    }

    /**
     * @param {[UrlFilter]} urlFilters
     * @return {[browser.events.UrlFilter]}
     * */
    static createEventUrlFilters(urlFilters) {
        return urlFilters.map(
            urlFilter =>
                urlFilter.substr(0, 1) === '/' &&
                urlFilter.substr(-1, 1) === '/' ?
                    {urlMatches: urlFilter.substr(1, urlFilter.length - 2)} :
                    {urlContains: urlFilter}
        );
    }
}

// To get rid of IDE warnings.
Rule.instances = [];

/**
 * @typedef {string} UrlFilter
 * */