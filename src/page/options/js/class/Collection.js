'use strict';

/**
 * Create and organize rule elements.
 */
class Collection {
    /**
     * Initialize rule elements by types.
     * If no type is specified, initialize all types of rules.
     * @param {(string[]|string|void)} [types]
     * @param {Object} [data]
     * @return {Promise<void>}
     */
    static async initialize(types = this.getTypes(), data) {
        if (Array.isArray(types)) {
            types.forEach(type => {
                this.initialize(type, data ? data[type] : null);
            });
            return;
        }

        // String
        const type = types;

        // Remove existing rule elements of this type
        this.getRules(type).forEach(id => this.removeItem(type, id));

        // Create new elements
        data = data || await this.getData(type);
        data && data.forEach(details => this.create(type, details));
    }

    /**
     * Create and display rule element.
     * @param {string} type
     * @param {RuleDetails} details
     * @return {HTMLElement}
     */
    static create(type, details) {
        const {id, enabled} = details;

        // Create rule wrapper element
        const parent = DOM.createNode({
            tagName: 'ARTICLE',
            parent: this.containers[type],
            classList: enabled ? ['enabled'] : null,
        });

        // Sequentially create input elements for rule properties
        for (const property of this.types[type]) {
            // Only display properties in the instructions
            if (!this.instructions.hasOwnProperty(property)) {
                continue;
            }

            const value = details[property];
            const {valueType, input} = this.instructions[property];
            const {tagName} = input;
            const domValue = this.toDomValue({value, tagName, valueType});

            const element = DOM.buildInput({parent, input, domValue});

            if (property === 'name') {
                // Clicking textarea group activates or deactivates the item
                element.container.addEventListener('click', ({target}) => {
                    if (DOM.isActive(parent)) {
                        if (target.tagName === 'LABEL') {
                            DOM.deactivate(parent);
                        }
                    } else {
                        DOM.activate(parent);
                        element.input.focus();
                    }
                });
            }

            if (property === 'enabled') {
                element.input.addEventListener('change', ({target}) => {
                    if (DOM.value(target) === 'enabled') {
                        DOM.enable(parent);
                    } else {
                        DOM.disable(parent);
                    }
                });
            }

            // On input change,
            // tell the background script to modify rule property.
            element.input.addEventListener('change', ({target}) => {
                this.modify(type, id, {
                    [property]: this.toPropertyValue({
                        domValue: DOM.value(target),
                        tagName,
                        valueType,
                    }),
                });
            });
        }

        // Create remove button for the rule item
        const button = DOM.createButton({
            parent,
            text: 'Remove',
            highlight: ['highlight-error'],
        });
        button.button.addEventListener('dblclick', () => this.remove(type, id));

        // Add the rule item to the collection
        this.items[type].set(id, parent);

        return parent;
    }

    /**
     * Convert property value to DOM value.
     * @private
     * @param {Object}
     * @return {string|null}
     */
    static toDomValue({value, tagName, valueType}) {
        switch (tagName) {
            case 'TEXTAREA':
                return valueType === 'string' ? value : value.join('\n');
            case 'INPUT':
                return valueType === 'string' ? value : value.join(', ');
            case 'SELECT':
                return value;
            case 'SWITCH':
                return value ? '' : null;
        }
    }

    /**
     * Convert DOM value to property value.
     * @private
     * @param {Object}
     * @return {(string[]|string)}
     */
    static toPropertyValue({domValue, tagName, valueType}) {
        switch (tagName) {
            case 'TEXTAREA':
                if (valueType === 'string') {
                    return domValue;
                }
                return domValue.trim().split(/\s*[\r\n]\s*/).filter(Boolean);
            case 'INPUT':
                if (valueType === 'string') {
                    return domValue;
                }
                return domValue.trim().split(/\s*,\s*/).filter(Boolean);
            case 'SELECT':
                // Always be text
                return domValue;
            case 'SWITCH':
                // Always be boolean
                return domValue === 'enabled';
        }
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
        }).then(details => {
            DOM.activate(this.create(type, details));
        });
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
        }).then(() => {
            this.removeItem(type, id);
        });
    }

    /**
     * Remove the rule item from the item collection.
     * @param {string} type
     * @param {string} id
     * @return {void}
     */
    static removeItem(type, id) {
        this.items[type].get(id).remove();
        this.items[type].delete(id);
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
        });
    }

    /**
     * Get rule data from the background script.
     * @param {string} type
     * @return {Promise}
     */
    static getData(type) {
        return Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'getData',
            details: {type},
        });
    }

    /**
     * Get existing rule IDs of a type.
     * @param {string} type
     * @return {string[]}
     */
    static getRules(type) {
        return [...this.items[type].keys()];
    }

    /**
     * Get rule types.
     * @return {string[]}
     */
    static getTypes() {
        return Object.keys(this.types);
    }

    /**
     * Create rule containers and add buttons on register.
     * @return {void}
     */
    static startup() {
        // For each type of rule
        this.getTypes().forEach(type => {
            const section = DOM.id(type);

            // Create container
            this.containers[type] = DOM.createNode({
                tagName: 'SECTION',
                parent: section,
            });

            // Create add button
            const button = DOM.createButton({
                parent: section,
                text: 'Add',
                highlight: ['highlight-ok'],
            });
            button.button.addEventListener('click', () => this.add(type));

            // Create a map to store created rule elements.
            this.items[type] = new Map;
        });

        this.initialize();
    }
}

Binder.bind(Collection);

/**
 * Rule properties by type.
 * @type {Object<string[]>}
 */
Collection.types = {
    blockingRules: [
        'name',
        'urlFilters',
        'method',
        'redirectUrl',
        'originUrlFilters',
        'enabled',
    ],
    headerRules: [
        'name',
        'textHeaders',
        'textType',
        'headerType',
        'urlFilters',
        'method',
        'originUrlFilters',
        'enabled',
    ],
    responseRules: [
        'name',
        'textResponse',
        'textType',
        'urlFilters',
        'method',
        'originUrlFilters',
        'enabled',
    ],
    contentScripts: [
        'name',
        'code',
        'scriptType',
        'urlFilters',
        'domEvent',
        'originUrlFilters',
        'enabled',
    ],
};

/**
 * Rule containers.
 * @type {Object<HTMLElement>}
 */
Collection.containers = {};

/**
 * Store all rule items.
 * @type {Object<Map<string, Object>>}
 */
Collection.items = {};

/**
 * Instructions to display rule properties.
 * @type {Object}
 */
Collection.instructions = {
    // RequestRule
    name: {
        valueType: 'string',
        input: {
            tagName: 'INPUT',
            label: 'Name',
            placeholder: 'Rule name',
        },
    },
    enabled: {
        valueType: 'boolean',
        input: {
            tagName: 'SWITCH',
        },
    },
    urlFilters: {
        valueType: 'array',
        input: {
            tagName: 'TEXTAREA',
            label: 'URL filters (Required)',
            placeholder: 'String or /RegExp/ to filter URLs (Required)',
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
    originUrlFilters: {
        valueType: 'array',
        input: {
            tagName: 'INPUT',
            label: 'Origin URL filters',
            placeholder: 'Origin URL filters',
        },
    },
    // BlockingRule
    redirectUrl: {
        valueType: 'string',
        input: {
            tagName: 'INPUT',
            label: 'Redirect URL',
            placeholder: 'URL to redirect to or blank to block',
        },
    },
    // HeaderRule
    textHeaders: {
        valueType: 'string',
        input: {
            tagName: 'TEXTAREA',
            label: 'Text headers (Required)',
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
    // ResponseRule
    textResponse: {
        valueType: 'string',
        input: {
            tagName: 'TEXTAREA',
            label: 'Text response (Required)',
            placeholder: 'Plaintext or JavaScript to modify response body (Required)',
        },
    },
    // ContentScript
    code: {
        valueType: 'string',
        input: {
            tagName: 'TEXTAREA',
            label: 'Code (Required)',
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
};
