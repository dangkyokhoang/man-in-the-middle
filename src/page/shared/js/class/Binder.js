'use strict';

/**
 * This helps with binding object methods.
 * Note that this doesn't work with getters and setters.
 */
class Binder {
    /**
     * Bind all methods of an object.
     * @param {!Object} object
     * @param {BinderFilter[]} [filters]
     * @return {void}
     */
    static bind(object, filters) {
        this.bindOwn(object, filters);
        this.bindAncestors(object, filters);
    }

    /**
     * @param {!Object} object
     * @param {BinderFilter[]} [filters]
     * @return {void}
     */
    static bindOwn(object, filters) {
        this.getMethods(object, filters)
            .forEach(method => {
                object[method] = object[method].bind(object)
            });
    }

    /**
     * @param {!Object} object
     * @param {BinderFilter[]} [filters]
     * @return {void}
     */
    static bindAncestors(object, filters) {
        let ancestor = Object.getPrototypeOf(object);

        // Doesn't bind function and {} prototypes
        while (!this.exceptions.has(ancestor)) {
            this.bindOtherOwn(object, ancestor, filters);
            ancestor = Object.getPrototypeOf(ancestor);
        }
    }

    /**
     * @param {!Object} object
     * @param {!Object} other
     * @param {BinderFilter[]} [filters]
     * @return {void}
     */
    static bindOtherOwn(object, other, filters) {
        this.getMethods(other, filters)
            .forEach(method => {
                if (!object.hasOwnProperty(method)) {
                    object[method] = other[method].bind(object);
                }
            });
    }

    /**
     * Get all method names of an object.
     * @param {!Object} object
     * @param {BinderFilter[]} [filters]
     * @return {string[]}
     */
    static getMethods(object, filters) {
        return Object.getOwnPropertyNames(object)
            .filter(property => (
                property !== 'constructor' &&
                typeof object[property] === 'function' &&
                this.filter(property, filters)
            ));
    }

    /**
     * @private
     * @param {string} method
     * @param {BinderFilter[]} [filters]
     * @return {boolean} True if the method name satisfies at least one of
     *     the filters or no filter is applied.
     */
    static filter(method, filters) {
        return filters && filters.length
            ? filters.some(({methodEquals}) => method === methodEquals)
            : true;
    }
}

Binder.exceptions = new Set([
    Object.getPrototypeOf(() => {
    }),
    Object.getPrototypeOf({}),
    null
]);

/**
 * @typedef {Object} BinderFilter
 * @property {string} methodEquals
 */
