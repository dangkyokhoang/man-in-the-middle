class Upgrader {
    /**
     * @private
     * @return {Promise<void>}
     */
    static async upgradeDatabase() {
        // Instead of match patterns,
        // new versions (>= 3) use URL filters to filter requests.
        const allRuleData = await Storage.get(Factory.listTypes());

        Object.values(allRuleData).forEach(data => {
            data && data.forEach(details => {
                if (details.hasOwnProperty('matchPatterns')) {
                    details.urlFilters = details.matchPatterns.map(
                        Utils.convertMatchPattern
                    );
                    delete details.matchPatterns;
                }
            });
        });

        // Update storage and notify the background script
        await Storage.set({...allRuleData}, false);
    }

    /**
     * @return {Promise<void>}
     */
    static async installedCallback() {
        const databaseVersion = await Storage.get('version');
        const {value, type} = this.versionCompare(
            databaseVersion,
            this.version
        );

        // Version not changed
        if (value === 0) {
            return;
        }
        // The extension must be upgraded to be able to write to the database
        if (value === 1) {
            //noinspection JSUnusedGlobalSymbols
            this.databaseWritable = false;
            return;
        }

        if (type === 'major') {
            await this.upgradeDatabase();
        }
        if (type === 'major' || type === 'minor') {
            await Tabs.openOptionsPage();
        }

        await Storage.set({version: this.version});
    }

    /**
     * Compare two versions.
     * @param {string} [version1]
     * @param {string} [version2]
     * @return {Object}
     */
    static versionCompare(version1 = '', version2 = '') {
        const types = ['major', 'minor', 'patch'];
        const version1Parts = version1.split('.').map(Number);
        const version2Parts = version2.split('.').map(Number);

        for (let i = 0; i < version1Parts.length; i++) {
            if (version1Parts[i] < version2Parts[i]) {
                return {value: -1, type: types[i]};
            } else if (version1Parts[i] > version2Parts[i]) {
                return {value: 1, type: types[i]};
            }
        }
        return {value: 0};
    }
}

Binder.bind(Upgrader);

/**
 * Current version.
 * @const
 * @type {string}
 */
Upgrader.version = Runtime.getManifest('version');

/**
 * If the extension version is lower than the database's version,
 *     the extension must be upgraded to be able to write to the database.
 * @type {boolean}
 */
Upgrader.databaseWritable = true;

Runtime.addEventListener('installed', Upgrader.installedCallback);
