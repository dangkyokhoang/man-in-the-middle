'use strict';

/**
 * A collection of useful functions.
 */
class Utils {
    /**
     * Compare two values.
     * @param {UtilsComparable} value1
     * @param {UtilsComparable} value2
     * @return {boolean} True if the two values are the same.
     * @throws {TypeError}
     * @see {Utils.isCyclic}
     */
    static compare(value1, value2) {
        // Check if the two values are of the same primitive value or
        //     object reference.
        if (value1 === value2) {
            return true;
        }

        // As the two values aren't both objects,
        // at least one of them is a primitive value.
        // Hence they're not the same.
        if (
            typeof value1 !== 'object'
            || typeof value2 !== 'object'
            || !value1
            || !value2
        ) {
            return false;
        }

        if (this.isCyclic(value1) || this.isCyclic(value2)) {
            // throw TypeError('Cyclic object value');
            return false;
        }

        // If the two constructors are different,
        // the two value are different.
        if (value1.constructor !== value2.constructor) {
            return false;
        }

        // This also applies to array
        const object1Keys = Object.keys(value1);
        const object2Keys = Object.keys(value2);
        if (object1Keys.length !== object2Keys.length) {
            return false;
        }

        return object1Keys.every(key => this.compare(value1[key], value2[key]));
    }

    /**
     * Check if an object is cyclic.
     * @private
     * @param {*} object
     * @param {Set} [seen]
     * @return {boolean}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value}
     */
    static isCyclic(object, seen = new Set) {
        if (typeof object !== 'object') {
            return false;
        }

        if (seen.has(object)) {
            return true;
        }

        seen.add(object);
        // Each path has its own set of seen objects
        return Object.values(object).some(value => (
            this.isCyclic(value, new Set(seen))
        ));
    }

    /**
     * @param {string[]} urlFilters
     * @return {Object}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCompleted}
     */
    static createUrlFilter(urlFilters) {
        const url = urlFilters.map(urlFilter => {
            // This tests if the URL filter string looks like a RegExp
            if (
                urlFilter.substr(0, 1) === '/'
                && urlFilter.substr(-1, 1) === '/'
            ) {
                // If the string is a valid RegExp,
                // let the filter be a RegExp matching filter.
                try {
                    const urlMatches = urlFilter.slice(1, -1);
                    RegExp(urlMatches);

                    return {urlMatches};
                } catch ({message}) {
                    console.warn(message);
                }
            }
            // Or return string filter by default
            return {urlContains: urlFilter};
        });
        return {url};
    }

    /**
     * Check if the URL matches at least one of the filters or
     *     if no filter is set (optional).
     * @param {string} url
     * @param {Object} filter
     * @param {boolean} [optional]
     * @return {boolean}
     * @see {Utils.createUrlFilter}
     */
    static filterUrl(url, filter, optional = true) {
        if (optional && filter.url.length === 0) {
            return true;
        }

        return filter.url.some(({urlContains, urlMatches}) => {
            if (urlContains) {
                return url.includes(urlContains);
            } else if (urlMatches) {
                return RegExp(urlMatches).test(url);
            }
            return false;
        });
    }
}

Binder.bindOwn(Utils);

/**
 * @typedef {(primitive|Object<UtilsComparable>|UtilsComparable[])} UtilsComparable
 */

/**
 * @typedef {(boolean|null|undefined|number|string|symbol)} primitive
 */
