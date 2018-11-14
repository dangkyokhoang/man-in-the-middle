'use strict';

/**
 * Give ability to do any rule-related tasks.
 */
class Factory {
    /**
     * Rule constructors MUST be registered with the factory via this method.
     * @param {string} type
     * @param {Object} constructor
     * @return {void}
     */
    static register(type, constructor) {
        this.types.set(type, constructor);
    }

    /**
     * Initialize rule instances by types.
     * If no type is specified, initialize all types of rules.
     * @param {(string[]|string|void)} [types]
     * @param {Object} [data]
     * @return {Promise<void>}
     */
    static async initialize(types = this.getTypes(), data) {
        if (Array.isArray(types)) {
            types.forEach(async type => {
                await this.initialize(type, data ? data[type] : null);
            });
            return;
        }

        // String
        const type = types;

        // Remove existing rule instances of this type
        this.getRules(type).forEach(instance => instance.remove());

        // Create new instances
        data = data || await this.readData(type);
        Array.isArray(data) && data.forEach(details => {
            this.create(type, details);
        });
    }

    /**
     * Add a new rule.
     * @param {string} type
     */
    static add(type) {
        const instance = this.create(type);

        // The rule data has been updated,
        // hence storage needs updating.
        this.saveData(type);

        // Return the details of the newly created rule
        return instance.getDetails();
    }

    /**
     * Modify details of a rule.
     * @param {string} type
     * @param {string} id
     * @param {Object} changes
     * @return {void}
     */
    static modify(type, id, changes) {
        this.types.get(type).instances.get(id).update(changes);

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
     * Get data of a type of rule.
     * @param {string} type
     * @return {Object[]}
     */
    static getData(type) {
        return this.getRules(type).map(rule => rule.getDetails());
    }

    /**
     * Get all types of rule.
     * @return {string[]}
     */
    static getTypes() {
        return [...this.types.keys()];
    }

    /**
     * Check if a type of rule exists.
     * @param {string} type
     * @return {boolean}
     */
    static hasType(type) {
        return this.types.has(type);
    }

    /**
     * Create a rule instance.
     * @private
     * @param {string} type
     * @param {Object} [details]
     * @return {Rule}
     */
    static create(type, details) {
        const constructor = this.types.get(type);
        return new constructor(details);
    }

    /**
     * Get all rule instances of a type.
     * @private
     * @param type
     * @return {Rule[]}
     */
    static getRules(type) {
        return [...this.types.get(type).instances.values()];
    }

    /**
     * Read rule data from storage.
     * @param type
     * @return {Promise}
     */
    static readData(type) {
        return Storage.get(type);
    }

    /**
     * Save rule data to storage.
     * @private
     * @param {string} type
     * @return {void}
     */
    static saveData(type) {
        Storage.set({[type]: this.getData(type)});
    }
}

/**
 * A map of rule constructors.
 * @type {Map<string, Object>}
 */
Factory.types = new Map;
