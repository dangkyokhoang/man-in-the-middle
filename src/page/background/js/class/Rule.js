'use strict';

/**
 * Rule skeleton.
 * @abstract
 */
class Rule {
    /**
     * Initialize a rule.
     * @param {RuleDetails} details
     */
    constructor(details) {
        Binder.bind(this);

        /**
         * Unique rule ID.
         * @type {string}
         */
        this.id = details && details.id ? details.id : UUID.generate();

        /**
         * @protected
         * @type {boolean}
         */
        this.active = false;

        this.update({...this.constructor.default, ...details});
        this.activate();

        this.constructor.instances.set(this.id, this);
    }

    /**
     * Register the rule with browser.
     * @protected
     * @abstract
     * @return {void}
     */
    register() {
    }

    /**
     * @protected
     * @abstract
     * @return {void}
     */
    unregister() {
    }

    /**
     * @return {void}
     */
    activate() {
        if (this.enabled && !this.active) {
            this.register();
            this.active = true;
        }
    }

    /**
     * @return {void}
     */
    deactivate() {
        if (this.active) {
            this.unregister();
            this.active = false;
        }
    }

    getDetails() {
        const details = {id: this.id};
        Object.keys(this.constructor.default).forEach(key => {
            details[key] = this[key];
        });
        return details;
    }

    /**
     * Update rule details.
     * @param {Object} details
     * @return {void}
     */
    update(details) {
        Object.entries(details).forEach(([key, value]) => {
            const setter = this[this.constructor.setters[key]];
            setter && setter(value);
        });
    }

    /**
     * @param {string} name
     * @return {void}
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Enable or disable the current rule.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        // If the property 'enabled' doesn't exist,
        // it means the rule is being initialized,
        // then don't activate the rule at the moment.
        const isInitialized = this.hasOwnProperty('enabled');

        this.enabled = enabled;

        if (isInitialized) {
            this.enabled ? this.activate() : this.deactivate();
        }
    }

    /**
     * @param {string[]} urlFilters
     * @return {void}
     */
    setUrlFilters(urlFilters) {
        this.urlFilters = urlFilters;
        this.urlFilter = Utils.createUrlFilter(this.urlFilters);

        if (this.active) {
            this.deactivate();
            this.activate();
        }
    }

    /**
     * @param {string[]} originUrlFilters
     * @return {void}
     */
    setOriginUrlFilters(originUrlFilters) {
        this.originUrlFilters = originUrlFilters;
        this.originUrlFilter = Utils.createUrlFilter(this.originUrlFilters);
    }

    /**
     * Remove the rule itself.
     * @return {void}
     */
    remove() {
        this.deactivate();
        this.constructor.instances.delete(this.id);
    }
}

/**
 * A map of created rule instances.
 * <concrete>Children MUST have their own map.
 * @protected
 * @type {Map<string, Rule>}
 */
Rule.instances = null;

/**
 * Rule default details.
 * Children MUST inherit default details.
 * @type {Object}
 */
Rule.default = {
    name: '',
    enabled: true,
    urlFilters: [],
    originUrlFilters: [],
};

/**
 * Rule property setters.
 * Children MUST inherit setters.
 * @protected
 * @type {Object<string>}
 */
Rule.setters = {
    name: 'setName',
    enabled: 'setEnabled',
    urlFilters: 'setUrlFilters',
    originUrlFilters: 'setOriginUrlFilters',
};

/**
 * @typedef {Object} RuleDetails
 * @property {string} [id]
 * @property {string} [name]
 * @propẻty {boolean} [enabled]
 * @property {string[]} [urlFilters]
 * @property {string[]} [originUrlFilters]
 */
