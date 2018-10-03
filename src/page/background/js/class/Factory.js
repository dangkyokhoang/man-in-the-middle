class Factory {
    /**
     * Initialize rule instances by types.
     * If no types are specified, initialize all types of rules.
     * @param {(string[]|string|void)} [types]
     * @param {Object} [data]
     * @return {Promise<void>}
     */
    static async initialize(types = [...this.types.keys()], data) {
        if (Array.isArray(types)) {
            return types.forEach(async type => {
                await this.initialize(type, data ? data[type] : null);
            });
        }

        // String
        const type = types;
        // Remove all existing rules of this type
        this.list(type).forEach(instance => instance.remove());
        // Create new instances
        data = data || await Storage.get(type);
        Array.isArray(data) && data.forEach(details => {
            this.create(type, details);
        });
    }

    /**
     * Create a rule instance.
     * @private
     * @param {string} type
     * @param {Object} [details]
     * @return {Object}
     */
    static create(type, details) {
        const ruleConstructor = this.types.get(type);
        return new ruleConstructor(details);
    }

    /**
     * Add a new rule.
     * @param {string} type
     */
    static add(type) {
        const details = this.create(type);

        // The rule data has been updated,
        // hence updating storage.
        this.saveData(type);

        // As the outside of this factory should not care about rule instances,
        // there's no need to return the created rule instance.
        // Instead, this return the created rule's details.
        return details.getDetails();
    }

    /**
     * Modify a property of a rule.
     * @param {string} type
     * @param {string} id
     * @param {Object} change
     * @return {void}
     */
    static modify(type, id, change) {
        this.types.get(type).instances.get(id).update(change);

        // Update storage
        this.saveData(type);
    }

    /**
     * Remove a rule instance.
     * @param {string} type
     * @param {string} id
     * @return {void}
     */
    static remove(type, id) {
        this.types.get(type).instances.get(id).remove();

        // Update storage
        this.saveData(type);
    }

    /**
     * Get rule data (all rules' details) of a type.
     * @param {string} type
     * @return {Object[]}
     */
    static getData(type) {
        return this.list(type).map(rule => rule.getDetails());
    }

    /**
     * Save rule data to storage.
     * @param {string} type
     */
    static saveData(type) {
        Storage.set({[type]: Factory.getData(type)});
    }

    /**
     * List all instances of a type.
     * @private
     * @param type
     * @return {Rule[]}
     */
    static list(type) {
        return [...this.types.get(type).instances.values()];
    }

    /**
     * Rule constructors MUST register with this Factory via this method.
     * @param {string} name
     * @param {Rule} rule
     * @return {void}
     */
    static register(name, rule) {
        this.types.set(name, rule);
    }
}

/**
 * @type {Map<string, Rule>}
 */
Factory.types = new Map;
