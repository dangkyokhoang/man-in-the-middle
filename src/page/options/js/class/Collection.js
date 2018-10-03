class Collection {
    /**
     * Initialize rules by types.
     * If no types are specified, initialize all types of rules.
     * @param {(string[]|string|void)} [types]
     * @param {Object} [data]
     * @return {Promise<void>}
     */
    static async initialize(types = Object.keys(this.types), data) {
        if (Array.isArray(types)) {
            return types.forEach(type => {
                this.initialize(type, data ? data[type] : null);
            });
        }

        // String
        const type = types;
        // Remove all existing rule elements of this type
        [...this.elements[type].keys()].forEach(id => {
            this.removeElement(type, id);
        });
        // Create new rule elements
        data = data || await Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'get',
            details: {type}
        });
        data.forEach(details => this.create(type, details));
    }

    /**
     * Create and display rule element.
     * @param {string} type
     * @param {RuleDetails} details
     * @return {HTMLElement}
     */
    static create(type, details) {
        const {id} = details;

        // Create rule element
        const parent = DOM.createNode({
            tagName: 'ARTICLE',
            parent: this.containers[type]
        });

        // Rule element info
        const element = {
            container: parent,
        };
        this.elements[type].set(id, element);

        // Create input elements for the rule element
        for (const property of this.types[type]) {
            if (!this.guide.hasOwnProperty(property)) {
                continue;
            }

            const {valueType, input} = this.guide[property];
            const {tagName} = input;
            const value = details[property];
            const text = this.toText({value, tagName, valueType});

            element[property] = DOM.getInputBuilder(tagName)({
                parent,
                [tagName === 'SELECT' ? 'selection' : 'text']: text,
                ...input
            });
            // On input change, modify the rule property.
            element[property].input.addEventListener('change', ({target}) => {
                const text = target.value;
                this.modify(type, id, {
                    [property]: this.toValue({text, tagName, valueType})
                });
            });
        }

        // Create remove button for the rule element
        DOM.createNode({
            tagName: 'BUTTON',
            parent,
            classList: ['highlight-error'],
            children: [{text: 'Remove'}]
        }).addEventListener('dblclick', () => {
            this.remove(type, id);
        });

        // The rule element
        return parent;
    }

    /**
     * @callback
     * @param {string} type
     * @return {void}
     */
    static add(type) {
        Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'add',
            details: {type},
        }).then(
            details => DOM.activate(this.create(type, details)),
            console.warn
        );
    }

    /**
     * @callback
     * @param {string} type
     * @param {string} id
     * @return {void}
     */
    static remove(type, id) {
        Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'remove',
            details: {type, id},
        }).then(
            () => this.removeElement(type, id),
            console.warn
        );
    }

    /**
     * @callback
     * @param {string} type
     * @param {string} id
     * @param {Object} change
     * @return {void}
     */
    static modify(type, id, change) {
        Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'modify',
            details: {type, id, change},
        }).catch(
            console.warn
        );
    }

    /**
     * @param {string} type
     * @param {string} id
     * @return {void}
     */
    static removeElement(type, id) {
        this.elements[type].get(id).container.remove();
        this.elements[type].delete(id);
    }

    /**
     * Create rule containers and add buttons on register.
     * @return {void}
     */
    static prepare() {
        // For each type of rule
        Object.keys(this.types).forEach(type => {
            const section = DOM.id(type);

            // Create container
            this.containers[type] = DOM.createNode({
                tagName: 'SECTION',
                parent: section
            });

            // Create add button
            DOM.createNode({
                tagName: 'BUTTON',
                parent: section,
                classList: ['highlight-ok'],
                children: [{text: 'Add'}]
            }).addEventListener('click', () => {
                this.add(type);
            });

            // Create a map to store created rule elements.
            this.elements[type] = new Map;
        });
    }

    /**
     * Convert property value to string.
     * @private
     * @param {Object} details
     * @return {string}
     */
    static toText({value, tagName, valueType}) {
        switch (tagName) {
            case 'TEXTAREA':
                return valueType === 'array' ? value.join('\n') : value;
            case 'INPUT':
                return valueType === 'array' ? value.join(', ') : value;
            case 'SELECT':
                return value;
        }
    }

    /**
     * Convert string to property value.
     * @private
     * @param {Object} details
     * @return {(string[]|string)}
     */
    static toValue({text, tagName, valueType}) {
        switch (tagName) {
            case 'TEXTAREA':
                return valueType === 'array' ?
                    text.trim().split(/\s*[\r\n]\s*/) :
                    text;
            case 'INPUT':
                return valueType === 'array' ?
                    text.trim().split(/\s*,\s*/).filter(Boolean) :
                    text;
            case 'SELECT':
                return text;
        }
    }
}

Binder.bind(Collection);

/**
 * Rule properties by type.
 * @type {Object<string[]>}
 */
Collection.types = {
    blockingRules: [
        'matchPatterns',
        'redirectUrl',
        'originUrlFilters',
        'method',
    ],
    headerRules: [
        'textHeaders',
        'textType',
        'headerType',
        'matchPatterns',
        'originUrlFilters',
        'method',
    ],
    contentScripts: [
        'code',
        'scriptType',
        'domEvent',
        'urlFilters',
    ],
};

/**
 * @type {Object<HTMLElement>}
 */
Collection.containers = {};

/**
 * @type {Object<Map<string, Object>>}
 */
Collection.elements = {};

/**
 * Guide on how to display rule properties.
 * @type {Object}
 */
Collection.guide = {
    // Request rule
    matchPatterns: {
        valueType: 'array',
        input: {
            tagName: 'TEXTAREA',
            label: 'Match patterns',
            placeholder: 'URL patterns to match (Required)',
        },
    },
    originUrlFilters: {
        valueType: 'array',
        input: {
            tagName: 'INPUT',
            label: 'Origin URL filters',
            placeholder: 'Origin URL filters',
        },
    },
    method: {
        valueType: 'string',
        input: {
            tagName: 'SELECT',
            label: 'Method',
            options: {
                GET: 'GET',
                POST: 'POST',
                HEAD: 'HEAD',
                PUT: 'PUT',
                DELETE: 'DELETE',
                OPTIONS: 'OPTIONS',
                TRACE: 'TRACE',
                PATCH: 'PATCH',
            },
        },
    },
    // Blocking rule
    redirectUrl: {
        valueType: 'string',
        input: {
            tagName: 'INPUT',
            label: 'Redirect URL',
            placeholder: 'URL to redirect to or blank to block',
        },
    },
    // Header rule
    textHeaders: {
        valueType: 'string',
        input: {
            tagName: 'TEXTAREA',
            label: 'Text headers',
            placeholder: 'Plaintext or JavaScript to modify headers (Required)',
        },
    },
    textType: {
        valueType: 'string',
        input: {
            tagName: 'SELECT',
            label: 'Text type',
            options: {
                plaintext: 'Plaintext',
                JavaScript: 'JavaScript',
            },
        },
    },
    headerType: {
        valueType: 'string',
        input: {
            tagName: 'SELECT',
            label: 'Header type',
            options: {
                requestHeaders: 'Request headers',
                responseHeaders: 'Response headers',
            },
        },
    },
    // Content script
    code: {
        valueType: 'string',
        input: {
            tagName: 'TEXTAREA',
            label: 'Code',
            placeholder: 'JavaScript or CSS as content script (Required)',
        },
    },
    scriptType: {
        valueType: 'string',
        input: {
            tagName: 'SELECT',
            label: 'Script type',
            options: {
                JavaScript: 'JavaScript',
                CSS: 'CSS',
            },
        },
    },
    domEvent: {
        valueType: 'string',
        input: {
            tagName: 'SELECT',
            label: 'DOM event',
            options: {
                loading: 'Loading',
                loaded: 'Loaded',
                completed: 'Completed',
            },
        },
    },
    urlFilters: {
        valueType: 'array',
        input: {
            tagName: 'INPUT',
            label: 'URL filters',
            placeholder: 'URL filters',
        },
    },
};

addEventListener('DOMContentLoaded', Collection.prepare, true);
s