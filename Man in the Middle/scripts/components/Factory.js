class Factory {
    /**
     * @abstract
     * @param {object} [details]
     */
    static initialize(details) {
    }

    /**
     * @abstract
     * @param {ChangeDetails} details
     */
    static change(details) {
    }

    /**
     * Initialize all the rules
     * */
    static async initializeAll() {
        const detailsArray = await this.getStorageData();

        if (detailsArray) {
            for (let details of detailsArray) {
                this.initialize(details);
            }
        }
    }

    /**
     * Remove a rule
     * @param {RemoveDetails} removeDescription
     */
    static remove({index}) {
        this.ruleConstructor.removeInstance(index);
    }

    /**
     * @return {[object]}
     */
    static getDetailsArray() {
        const detailsArray = [];

        for (let instance of this.ruleConstructor.instances) {
            detailsArray.push(instance.toDataObject());
        }

        return detailsArray;
    }

    /**
     * @return {object}
     */
    static getDataObject() {
        return {[this.storageKey]: this.getDetailsArray()};
    }

    /**
     * @return {Promise<array>}
     * */
    static async getStorageData() {
        return await Storage.get(this.storageKey) || this.defaultStorageData;
    }

    /**
     * @return {object}
     * */
    static getFactory(type) {
        return this.ruleTypes[type];
    }
}

Factory.ruleTypes = {};

// This is to get rid of IDE warnings
Factory.ruleConstructor = null;
Factory.storageKey = null;
Factory.defaultStorageData = [];

/**
 * @typedef {UpdateDetails} ChangeDetails
 * @property {string} name - The name of the changed detail.
 * @property {string} value - The detail's new value.
 * */

/**
 * @typedef {UpdateDetails} RemoveDetails
 * */

/**
 * @typedef {object} UpdateDetails
 * @property {number} index
 * */