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
         * This tells whether this rule is active.
         * @protected
         * @type {boolean}
         */
        this.enabled = false;

        this.update({...this.constructor.detailsDefault, ...details});
        this.enable();

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
    enable() {
        if (!this.enabled) {
            this.register();
            this.enabled = true;
        }
    }

    /**
     * @return {void}
     */
    disable() {
        if (this.enabled) {
            this.unregister();
            this.enabled = false;
        }
    }

    getDetails() {
        const details = {id: this.id};
        Object.keys(this.constructor.detailsDefault).forEach(key => {
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
     * Set the name of the rule.
     * @param {string} name
     * @return {void}
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Remove the rule itself.
     * @return {void}
     */
    remove() {
        this.disable();
        this.constructor.instances.delete(this.id);
    }
}

/**
 * A map of created rule instances. <concrete>Children MUST have their own map.
 * @protected
 * @type {Map<string, Rule>}
 */
Rule.instances = null;

/**
 * Rule details default. <concrete>Children MUST define their own default.
 * @type {Object}
 */
Rule.detailsDefault = {
    name: '',
};

/**
 * Rule property setters. <concrete>Children MUST define their own setters.
 * @protected
 * @type {Object<string>}
 */
Rule.setters = {
    name: 'setName',
};

/**
 * @typedef {Object} RuleDetails
 * @property {string} [id]
 */
