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
        for (let method of this.getMethods(object, methodFilters)) {
            object[method] = object[method].bind(object);
        }
    }

    /**
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     * */
    static bindParentMethods(object, methodFilters = []) {
        let parentObject = Object.getPrototypeOf(object);

        if (parentObject) {
            for (let method of this.getMethods(parentObject, methodFilters)
                .filter(method => !object.hasOwnProperty(method))) {

                object[method] = parentObject[method].bind(object);
            }
        }
    }

    /**
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters = []]
     * */
    static bindAncestorMethods(object, methodFilters = []) {
        let ancestorObject = Object.getPrototypeOf(object),
            higherAncestorObject;

        while (higherAncestorObject = Object.getPrototypeOf(ancestorObject)) {
            for (let method of this.getMethods(ancestorObject, methodFilters)
                .filter(method => !object.hasOwnProperty(method))) {

                object[method] = ancestorObject[method].bind(object);
            }

            ancestorObject = Object.getPrototypeOf(higherAncestorObject);
        }
    }

    /**
     * Get filtered method names
     * @param {object} object
     * @param {[MethodFilter]} [methodFilters]
     * @return {[string]}
     * */
    static getMethods(object, methodFilters) {
        return Object.getOwnPropertyNames(object)
            .filter(property => typeof object[property] === 'function')
            .filter(method => this.filterMethod(method, methodFilters));
    }

    /**
     * @param {string} method
     * @param {[MethodFilter]} [methodFilters]
     * @return {boolean} - True if the method satisfies at least one of the filters, false otherwise.
     * */
    static filterMethod(method, methodFilters) {
        if (methodFilters.length === 0) {
            return true;
        }

        for (let methodFilter of methodFilters) {
            if (methodFilter.hasOwnProperty('methodEquals')) {
                if (method === methodFilter.methodEquals) {
                    return true;
                }
            } else if (methodFilter.hasOwnProperty('methodContains')) {
                if (method.includes(methodFilter.methodContains)) {
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * @typedef {object} MethodFilter
 * @property {string} methodEquals
 * @property {string} methodContains
 * */