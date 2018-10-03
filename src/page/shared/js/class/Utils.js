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
        // at least one of them is primitive value.
        // Since the two values are compared in the first step,
        // it's not hard to tell they're different.
        if (
            typeof value1 !== 'object' ||
            typeof value2 !== 'object' ||
            !value1 ||
            !value2
        ) {
            return false;
        }

        if (this.isCyclic(value1) || this.isCyclic(value2)) {
            //throw TypeError('Cyclic object value');
            return false;
        }

        // If the two constructors are different,
        // the two value are different.
        if (value1.constructor !== value2.constructor) {
            return false;
        }

        const object1Keys = Object.keys(value1);
        const object2Keys = Object.keys(value2);
        // This also applies to array
        return object1Keys.length === object2Keys.length ?
            object1Keys.every(key => (
                this.compare(value1[key], value2[key])
            )) :
            false;
    }

    /**
     * Check if an object is cyclic.
     * @param {*} value
     * @param {Set} [seen]
     * @return {boolean}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value}
     */
    static isCyclic(value, seen = new Set) {
        if (typeof value === 'object') {
            if (seen.has(value)) {
                return true;
            }

            return Object.values(value).some(currentValue => {
                const currentSeen = new Set([...seen.values(), value]);
                return this.isCyclic(currentValue, currentSeen);
            });
        }

        return false;
    }

    /**
     * @param {string[]} urlFilters
     * @return {(Object|void)}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCompleted}
     */
    static createUrlFilters(urlFilters) {
        if (urlFilters.length === 0) {
            return;
        }

        const url = urlFilters.map(urlFilter => (
            // If the URL filter string looks like a RegExp
            // use regular expression matching filter.
            urlFilter.substr(0, 1) === '/' &&
            urlFilter.substr(-1, 1) === '/' ?
                {urlMatches: urlFilter.slice(1, -1)} :
                {urlContains: urlFilter}
        ));

        return {url};
    }

    /**
     * @param {string} url
     * @param {Object} [filter]
     * @return {boolean} True if the URL matches at least one of the filters
     *     or no filter is applied.
     */
    static filterUrl(url, filter) {
        return filter ?
            filter.url.some(({urlContains, urlMatches}) => {
                if (urlContains) {
                    return url.includes(urlContains);
                } else if (urlMatches) {
                    return RegExp(urlMatches).test(url);
                }
                return false;
            }) :
            true;
    }
}

Binder.bindOwn(Utils);

/**
 * @typedef {(
 *     primitive |
 *     Object<UtilsComparable> |
 *     UtilsComparable[]
 * )} UtilsComparable
 */

/**
 * @typedef {(boolean|null|undefined|number|string|symbol)} primitive
 */
