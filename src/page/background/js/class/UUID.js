'use strict';

/**
 * Generate universally unique identifiers.
 */
class UUID {
    /**
     * Generate a UUID.
     * @return {string}
     * @see {@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
     */
    static generate() {
        const time = this.timeOrigin + Math.floor(performance.now() * 1e6);
        // Since collisions may occur only if two UUIDs are generated
        //     at the same time, i.e., within a same timestamp of time,
        // the exception list should be cleared on timestamp change.
        if (time > this.context.time) {
            this.context.time = time;
            this.context.exceptions.clear();
        }

        let uuid;
        const uintArray = new Uint32Array(2);
        do {
            crypto.getRandomValues(uintArray);

            uuid = time.toString(16)
                + uintArray[0].toString(16).padStart(8, '0')
                + uintArray[1].toString(16).padStart(8, '0');
            uuid = uuid.replace(
                /^(\w+)(\w{4})(\w{4})(\w{4})(\w{12})$/,
                '{$1-$2-$3-$4-$5}'
            );
            // If the UUID already exists,
            // re-generate a new UUID.
        } while (this.context.exceptions.has(uuid));

        // Add the generated UUID to the exception list
        this.context.exceptions.add(uuid);

        return uuid;
    }
}

Binder.bind(UUID);

/**
 * Due to security concerns, browser might round 'performance.now()' results,
 *     which affects the uniqueness of UUIDs.
 * This is a workaround to make sure UUIDs are unique.
 * @type {Object}
 * @property {Set<string>} exceptions
 * @property {number} time
 * @see {UUID.generate}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#Reduced_time_precision}
 */
UUID.context = {
    exceptions: new Set,
    time: 0,
};

/**
 * High resolution timestamp, since UNIX epoch.
 * @type {number}
 */
UUID.timeOrigin = Math.floor((performance.timeOrigin || Date.now()) * 1e6);
