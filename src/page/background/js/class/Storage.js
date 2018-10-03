class Storage {
    /**
     * @param {(string[]|string|void)} [keys]
     * @return {Promise}
     */
    static get(keys) {
        return browser.storage.sync.get(keys).then(
            data => Array.isArray(keys) || !keys ? data : data[keys],
            console.warn
        );
    }

    /**
     * @param {!Object} keys
     * @return {void}
     */
    static set(keys) {
        browser.storage.sync.set(keys).catch(console.warn);

        // Remember this change
        this.changeHistory.push(Object.entries(keys));
    }

    /**
     * Add a listener for storage-changed events.
     * @param {Function} listener
     * @return {void}
     */
    static addListener(listener) {
        // If one listener is added,
        // register storage-changed event callback.
        if (this.listeners.size === 0) {
            this.onChanged.addListener(this.changedCallback);
        }

        this.listeners.add(listener);
    }

    /**
     * Storage change event listener, triggers user-registered listeners.
     * @callback
     * @param {browser.storage.StorageChange} changes
     * @param {string} areaName
     * @return {void}
     */
    static changedCallback(changes, areaName) {
        if (areaName !== 'sync') {
            return;
        }
        // Ignore changes made by Storage.set
        if (this.isInHistory(changes)) {
            this.changeHistory.shift();
            return;
        }

        // Remap and filter changes
        const entries = Object.entries(changes)
            .filter(([, {newValue, oldValue}]) => (
                !Utils.compare(newValue, oldValue)
            ));
        if (entries.length) {
            this.listeners.forEach(callback => callback(entries));
        }
    }

    /**
     * This checks if changes were made by Storage.set.
     * @private
     * @param {Object} changes
     * @return {boolean}
     */
    static isInHistory(changes) {
        if (this.changeHistory.length) {
            return Utils.compare(
                Object.entries(changes).map(([key, {newValue}]) => (
                    [key, newValue]
                )),
                this.changeHistory[0]
            );
        }

        return false;
    }
}

/**
 * This stores changes made by Storage.set so that
 *     storage-changed event listener can skip those changes.
 * @private
 * @const
 * @type {Array}
 */
Storage.changeHistory = [];

/**
 * @private
 * @const
 * @type {Set<Function>}
 */
Storage.listeners = new Set;

/**
 * @private
 * @const
 * @type {WebExtEvent}
 */
Storage.onChanged = browser.storage.onChanged;

Binder.bindOwn(Storage);
