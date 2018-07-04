class Storage {
    /**
     * @param {(null|string|[string])} [keys = null]
     * @return {Promise}
     */
    static async get(keys = null) {
        try {
            const result = await browser.storage.sync.get(keys);

            return keys === null || Array.isArray(keys) ?
                result :
                result[keys];
        } catch (error) {
            console.warn(error);
        }
    }

    /**
     * @param {object} items
     */
    static async set(items) {
        try {
            return await browser.storage.sync.set(items);
        } catch (error) {
            console.warn(error);
        }
    }
}