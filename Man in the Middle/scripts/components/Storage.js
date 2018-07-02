class Storage {
    /**
     * @param {(null|string|[string])} [keys = null]
     *
     * @return {Promise<*>}
     */
    static async get(keys = null) {
        if (keys === null || Array.isArray(keys)) {

            return browser.storage.sync.get(keys);

        } else if (typeof keys === 'string') {
            const result = await browser.storage.sync.get(keys);

            return result[keys];
        }
    }

    /**
     * @param {object} items
     * @return {Promise<void>}
     */
    static set(items) {
        return browser.storage.sync.set(items);
    }
}