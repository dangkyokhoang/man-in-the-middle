class Factory {
    /**
     * Each rule type has its own constructor, therefore the rule initialization method.
     * @abstract
     * @param {object} details
     * @return {object}
     */
    static initializeRule(details) {
    }

    /**
     * @abstract
     * @param {ChangeDetails} details
     * @return {object} The instance whose detail changed.
     */
    static changeRuleDetail(details) {
    }

    /**
     * Initialize all the rules
     * */
    static async initializeAll() {
        let ruleList;

        try {
            ruleList = await this.getStorageData();
        } catch (error) {
            return console.warn(error);
        }

        ruleList.forEach(this.initializeRule);
    }

    /**
     * Remove a rule
     * @param {RemoveDetails} removeDescription
     */
    static removeRule({index}) {
        this.ruleConstructor.getInstance(index).remove();
    }

    /**
     * @return {[object]}
     */
    static getRuleList() {
        return this.ruleConstructor.instances.map(
            instance => instance.toDataObject()
        );
    }

    /**
     * @return {object}
     */
    static getRuleData() {
        return {[this.storageKey]: this.getRuleList()};
    }

    /**
     * @return {Promise<array>}
     * */
    static async getStorageData() {
        return await Storage.get(this.storageKey) || this.defaultRuleData;
    }

    static async saveRuleData() {
        return await Storage.set(this.getRuleData());
    }

    /**
     * @return {object}
     * */
    static getFactory(type) {
        return this.ruleTypes[type];
    }
}

Factory.ruleTypes = {};

// To get rid of IDE warnings.
Factory.ruleConstructor = null;
Factory.storageKey = null;
Factory.defaultRuleData = [];

/**
 * @typedef {UpdateDetails} ChangeDetails
 * @property {string} name - The name of the changed rule detail.
 * @property {string} value - The rule detail's new value.
 * */

/**
 * @typedef {UpdateDetails} RemoveDetails
 * */

/**
 * @typedef {object} UpdateDetails
 * @property {number} index
 * */