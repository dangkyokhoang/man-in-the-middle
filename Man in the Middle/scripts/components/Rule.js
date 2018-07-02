/**
 * Rule manager
 * */
class Rule {
    /**
     * Initialize a rule
     * */
    constructor() {
        // This tells whether this rule is active
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
        this.deactivate();

        this.constructor.instances.splice(
            this.constructor.instances.indexOf(this),
            1
        );
    }

    /**
     * @param {number} index
     * @return {(Rule|null)}
     * */
    static getInstance(index) {
        return index < this.instances.length ? this.instances[index] : null;
    }

    /**
     * @param {number} index
     * */
    static removeInstance(index) {
        const instance = this.getInstance(index);

        instance && instance.remove();
    }
}

// This is to get rid of IDE warnings
Rule.instances = [];