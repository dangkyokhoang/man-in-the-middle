'use strict';

/**
 * Give ability to do any rule-related tasks.
 */
class Factory {
    /**
     * Initialize rule instances by types.
     * If no type is specified, initialize all types of rules.
     * @param {(string[]|string|void)} [types]
     * @param {Object} [data]
     * @return {Promise<void>}
     */
    static async initialize(types = this.getTypes(), data) {
        if (Array.isArray(types)) {
            for (const type of types) {
                await this.initialize(type, data ? data[type] : null);
            }
            return;
        }

        // String
        const type = types;

        // Remove existing rule instances of this type
        this.getRules(type).forEach(instance => instance.remove());

        // Create new instances
        data = data || await this.readData(type);
        Array.isArray(data) && data.forEach(data => {
            let rule = {}
            if (Array.isArray(data)) {
                const {fields} = this.types.get(type);
                data.forEach((value, index) => {
                    const field = fields[index];
                    rule[field] = value;
                });
            } else {
                rule = data;
            }
            this.create(type, rule);
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
        const data = instance.getDetails();
        return {...data, sync: true};
    }

    /**
     * Modify details of a rule.
     * @param {string} type
     * @param {string} id
     * @param {Object} changes
     * @return {void}
     */
    static modify(type, id, changes) {
        if (changes.hasOwnProperty('sync')) {
            if (changes.sync) {
                this.local.delete(id);
            } else {
                this.local.add(id);
            }
        } else {
            this.types.get(type).instances.get(id).update(changes);
        }

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
     * @param {boolean} raw
     * @return {Object[]}
     */
    static getData(type, raw) {
        const rules = this.getRules(type)
        return raw
            ? rules
            : rules.map(rule => {
                const data = rule.getDetails();
                const {id} = data;
                const sync = !this.local.has(id);
                return {...data, sync};
            });
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
    static async readData(type) {
        const {fields} = this.types.get(type);
        const index = fields.indexOf('id')
        const local = await Storage.localGet(type) || [];
        const sync = await Storage.syncGet(type) || [];
        const rules = [...local, ...sync];

        local.forEach(data => this.local.add(data[index]));

        return rules;
    }

    /**
     * Save rule data to storage.
     * @private
     * @param {string} type
     * @return {void}
     */
    static saveData(type) {
        const {fields} = this.types.get(type);
        const local = [];
        const sync = [];

        this.getData(type, true).forEach(rule => {
            const {id} = rule;
            const data = fields.map(field => rule[field]);

            if (this.local.has(id)) {
                local.push(data);
            } else {
                sync.push(data);
            }
        });

        Storage.localSet({[type]: local});
        Storage.syncSet({[type]: sync});
    }

    static upgradeDatabase() {
        const types = this.getTypes();

        types.forEach(type => this.saveData(type));
    }
}

/**
 * A map of rule constructors.
 * @type {Map<string, Object>}
 */
Factory.types = new Map([
    ['blockingRules', BlockingRule],
    ['headerRules', HeaderRule],
    ['responseRules', ResponseRule],
    ['contentScripts', ContentScript],
]);

/**
 * Stores local rules' ids.
 * @type {Set<string>}
 */
Factory.local = new Set;
