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
     * Convert URL filter strings to UrlFilter and UrlExceptions objects.
     * @param {string[]} urlFilters
     * @return {Object[]}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter}
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCompleted}
     */
    static createUrlFilter(urlFilters) {
        // [UrlFilter, UrlExceptions]
        const filter = [
            {url: []},
            {url: []},
        ];

        urlFilters.forEach(urlFilter => {
            // Type === 0 ? UrlFilter : UrlExceptions
            let type = 0;

            // Filters beginning with `!` are URL exceptions
            const exceptionMark = urlFilter.match(/^\s*!\s*/);
            if (exceptionMark) {
                // Remove the exception mark from the string
                urlFilter = urlFilter.substr(exceptionMark[0].length);
                type = 1;
            }

            // This tests if the URL filter string looks like a RegExp
            if (
                urlFilter.substr(0, 1) === '/'
                && urlFilter.substr(-1, 1) === '/'
            ) {
                // If the string is a valid RegExp,
                // let the filter be a RegExp matching filter.
                try {
                    const urlMatches = urlFilter.slice(1, -1);
                    // Verify that the string is a valid RegExp
                    RegExp(urlMatches);
                    filter[type].url.push({urlMatches});
                    return;
                } catch (error) {
                    Logger.log(error);
                }
            }
            // Or let the filter be a string filter by default
            filter[type].url.push({urlContains: urlFilter});
        });

        return filter;
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
    static testUrl(url, filter, optional = true) {
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

    /**
     * Compare two versions.
     * @param {string} [version1]
     * @param {string} [version2]
     * @return {Object}
     */
    static versionCompare(version1 = '', version2 = '') {
        // Parts of a version string
        const parts = ['major', 'minor', 'patch'];

        const version1Parts = version1.split('.').map(Number);
        const version2Parts = version2.split('.').map(Number);

        for (let i = 0; i < parts.length; i++) {
            if (version1Parts[i] < version2Parts[i]) {
                return {
                    result: -1,
                    difference: parts[i],
                };
            } else if (version1Parts[i] > version2Parts[i]) {
                return {
                    result: 1,
                    difference: parts[i],
                };
            }
        }
        return {
            result: 0,
        };
    }
}

Binder.bindOwn(Utils);

/**
 * @typedef {(primitive|Object<UtilsComparable>|UtilsComparable[])} UtilsComparable
 */

/**
 * @typedef {(boolean|null|undefined|number|string|symbol)} primitive
 */
