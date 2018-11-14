'use strict';

/**
 * This automatically upgrades database if needed.
 */
class Upgrader {
    /**
     * @private
     * @param {string} databaseVersion
     * @return {Promise<void>}
     */
    static async upgradeDatabase(databaseVersion) {
        const data = await Storage.get(Factory.getTypes());

        // List of versions and respective database upgrade functions
        const upgrades = [
            ['3', this.upgradeDatabaseToVersion3],
        ];
        upgrades.forEach(([version, upgrade]) => {
            if (this.versionCompare(databaseVersion, version).result === -1) {
                // The 'data' object will be modified
                upgrade(data);
            }
        });

        // Update storage and notify the background script
        await Storage.set(data, false);
    }

    /**
     * Replace match patterns with URL filters.
     * @private
     * @param {Object} data
     * @return {void}
     */
    static upgradeDatabaseToVersion3(data) {
        Object.values(data).forEach(rules => rules && rules.forEach(rule => {
            if (!rule.hasOwnProperty('matchPatterns')) {
                return;
            }

            // Convert match patterns to URL filters
            if (rule.matchPatterns.includes('*://*/*')) {
                rule.urlFilters = ['://'];
            } else {
                rule.urlFilters = rule.matchPatterns.map(matchPattern => (
                    matchPattern
                        .replace(/\//g, '\\/')
                        .replace(/\*(.)/g, '.*?$1')
                        .replace(/\*$/g, '.*')
                ));
            }

            // Remove the deprecated property
            delete rule.matchPatterns;
        }));
    }

    /**
     * @return {Promise<void>}
     */
    static async installedCallback() {
        const databaseVersion = await Storage.get('version');
        // Current extension version
        // After installing, the database version is the current version
        const version = Runtime.getManifest('version');

        const {result, difference} = this.versionCompare(
            databaseVersion,
            version
        );

        // Version unchanged or
        //     the extension version is lower than the database version
        if (result !== -1) {
            return;
        }

        if (difference === 'major') {
            await this.upgradeDatabase(databaseVersion);
        }
        // If there's a major or minor update (not a patch one),
        // open the options page.
        if (difference === 'major' || difference === 'minor') {
            await Tabs.openOptionsPage();
        }

        await Storage.set({version});
    }

    /**
     * Compare two versions.
     * @private
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

Binder.bind(Upgrader);

Runtime.addEventListener('installed', Upgrader.installedCallback);
