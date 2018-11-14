'use strict';

/**
 * This helps with binding object methods.
 * Note that this doesn't work with getters and setters.
 */
class Binder {
    /**
     * Bind all methods of an object.
     * @param {!Object} object
     * @return {void}
     */
    static bind(object) {
        this.bindOwn(object);
        this.bindAncestors(object);
    }

    /**
     * @param {!Object} object
     * @return {void}
     */
    static bindOwn(object) {
        this.getMethods(object).forEach(method => {
            object[method] = object[method].bind(object);
        });
    }

    /**
     * @param {!Object} object
     * @return {void}
     */
    static bindAncestors(object) {
        let ancestor = Object.getPrototypeOf(object);

        // Function and {} prototypes are not bound
        while (!this.exceptions.has(ancestor)) {
            this.bindOtherOwn(object, ancestor);
            ancestor = Object.getPrototypeOf(ancestor);
        }
    }

    /**
     * @param {!Object} object
     * @param {!Object} other
     * @return {void}
     */
    static bindOtherOwn(object, other) {
        this.getMethods(other).forEach(method => {
            if (!object.hasOwnProperty(method)) {
                object[method] = other[method].bind(object);
            }
        });
    }

    /**
     * Get all method names of an object.
     * @param {!Object} object
     * @return {string[]}
     */
    static getMethods(object) {
        return Object.getOwnPropertyNames(object).filter(property => (
            typeof object[property] === 'function'
            && property !== 'constructor'
        ));
    }
}

/**
 * @type {Set}
 * @see {Binder.bindAncestors}
 */
Binder.exceptions = new Set([
    Object.getPrototypeOf(() => {
    }),
    Object.getPrototypeOf({}),
    null
]);
