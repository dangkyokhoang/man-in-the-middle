/**
 * Bind class methods dynamically
 * */
class Binder {
    /**
     * Bind all methods of a class
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     */
    static bindMethods(object, methodFilters = []) {
        this.bindOwnMethods(object, methodFilters);
        this.bindAncestorMethods(object, methodFilters);
    }

    /**
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     * */
    static bindOwnMethods(object, methodFilters = []) {
        this.getMethods(object, methodFilters).forEach(method =>
            object[method] = object[method].bind(object));
    }

    /**
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     * */
    static bindParentMethods(object, methodFilters = []) {
        const parent = Object.getPrototypeOf(object);

        if (parent) {
            this.getMethods(parent, methodFilters)
                .filter(method => !object.hasOwnProperty(method))
                .forEach(method =>
                    object[method] = parent[method].bind(object));
        }
    }

    /**
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     * */
    static bindAncestorMethods(object, methodFilters = []) {
        let ancestor = Object.getPrototypeOf(object),
            ancestorParent;

        // Don't bind Function.prototype methods.
        while (ancestorParent = Object.getPrototypeOf(ancestor)) {

            this.getMethods(ancestor, methodFilters)
                .filter(method => !object.hasOwnProperty(method))
                .forEach(method =>
                    object[method] = ancestor[method].bind(object));

            ancestor = ancestorParent;
        }
    }

    /**
     * Get all filtered method names of an object
     * @param {object} object
     * @param {[MethodFilter]} methodFilters
     * @return {[string]}
     * */
    static getMethods(object, methodFilters) {
        return Object.getOwnPropertyNames(object)
            .filter(property => typeof object[property] === 'function')
            .filter(method => this.methodSatisfies(method, methodFilters));
    }

    /**
     * @private
     * @param {string} method
     * @param {[MethodFilter]} methodFilters
     * @return {boolean} True if the method satisfies at least one of the filters or if no filter is applied.
     * */
    static methodSatisfies(method, methodFilters) {
        if (methodFilters.length === 0) {
            return true;
        }

        return methodFilters.some(
            ({methodEquals = '', methodContains = ''}) =>
                methodEquals && method === methodEquals ||
                methodContains && method.includes(methodContains)
        );
    }
}

/**
 * @typedef {object} MethodFilter
 * @property {string} methodEquals - Prioritized over the property 'methodContains'.
 * @property {string} methodContains
 * */