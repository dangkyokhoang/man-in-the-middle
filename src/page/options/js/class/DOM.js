'use strict';

/**
 * Provide useful functions to work with DOM.
 */
class DOM {
    /**
     * Create node(s).
     * @param {NodeDetails}
     * @return {(HTMLElement|Node|void)}
     */
    static createNode({
                          tagName,
                          text,
                          classList,
                          attributes,
                          parent,
                          children,
                      }) {
        let node;

        // Property 'tagName' prevails over 'text'
        if (tagName) {
            node = document.createElement(tagName);

            // Classes if exists,
            // are added to the element.
            if (classList && classList.length) {
                node.classList.add.apply(node.classList, classList);
            }

            if (attributes) {
                Object.entries(attributes).forEach(([name, value]) => {
                    // An attribute is set only if it's a string
                    if (typeof value === 'string') {
                        node.setAttribute(name, value);
                    }
                });
            }

            // Recursively create children nodes
            if (children) {
                children.forEach(child => {
                    if (child instanceof Node) {
                        node.appendChild(child);
                    } else {
                        this.createNode({...child, parent: node});
                    }
                });
            }
        } else if (text) {
            node = document.createTextNode(text);
        } else {
            return;
        }

        return parent ? parent.appendChild(node) : node;
    }

    /**
     * Build an input based on the instructions.
     * @param {Object}
     * @return {Object<HTMLElement>}
     */
    static buildInput({parent, input, domValue}) {
        // A function to create input
        let builder;
        // The key of the DOM value to pass to the builder
        let key;

        switch (input.tagName.toUpperCase()) {
            case 'TEXTAREA':
                builder = this.createTextareaGroup;
                key = 'text';
                break;
            case 'INPUT':
                builder = this.createInputGroup;
                key = 'text';
                break;
            case 'SELECT':
                builder = this.createSelectGroup;
                key = 'selection';
                break;
            case 'SWITCH':
                builder = this.createToggleSwitch;
                key = 'checked';
                break;
            default:
                builder = this.createNode;
                key = 'text';
        }

        return builder({...input, parent, [key]: domValue});
    }

    /**
     * Create a textarea element group.
     * @param {TextareaGroupDetails}
     * @return {Object<HTMLElement>}
     */
    static createTextareaGroup({label, parent, text, placeholder}) {
        const textarea = this.createNode({
            tagName: 'TEXTAREA',
            attributes: {placeholder},
            children: text ? [{text}] : [],
        });

        const container = this.createNode({
            tagName: 'DIV',
            classList: ['multiline-input'],
            parent,
            children: [
                {
                    tagName: 'LABEL',
                    children: [{text: label}],
                },
                {
                    tagName: 'DIV',
                    classList: ['textarea'],
                    children: [textarea],
                }
            ]
        });

        return {container, input: textarea};
    }

    /**
     * Create an input element group.
     * @param {InputGroupDetails}
     * @return {Object<HTMLElement>}
     */
    static createInputGroup({label, parent, text, placeholder}) {
        const input = this.createNode({
            tagName: 'INPUT',
            attributes: {
                value: text,
                placeholder,
            },
        });

        const container = this.createNode({
            tagName: 'DIV',
            classList: ['input'],
            parent,
            children: [
                {
                    tagName: 'LABEL',
                    children: [{text: label}],
                },
                input,
            ],
        });

        return {container, input};
    }

    /**
     * Create a select element group.
     * @param {SelectGroupDetails}
     * @return {Object<HTMLElement>}
     */
    static createSelectGroup({label, parent, options, selection}) {
        const select = this.createNode({
            tagName: 'SELECT',
            children: Object.entries(options).map(([value, text]) => ({
                tagName: 'OPTION',
                attributes: {
                    value,
                    selected: value === selection ? '' : null,
                },
                children: [{text}],
            })),
        });

        const container = this.createNode({
            tagName: 'DIV',
            classList: ['input'],
            parent,
            children: [
                {
                    tagName: 'LABEL',
                    children: [{text: label}],
                },
                select,
            ],
        });

        return {container, input: select};
    }

    /**
     * Create a toggle switch element.
     * @param {ToggleSwitchDetails}
     * @return {Object<HTMLElement>}
     */
    static createToggleSwitch({parent, checked}) {
        const checkbox = this.createNode({
            tagName: 'INPUT',
            attributes: {
                type: 'checkbox',
                checked,
            },
        });

        const container = this.createNode({
            tagName: 'SPAN',
            parent,
            children: [{
                tagName: 'LABEL',
                classList: ['switch'],
                children: [
                    checkbox,
                    {
                        tagName: 'SPAN',
                        classList: ['slider'],
                    },
                ],
            }],
        });

        return {container, input: checkbox};
    }

    /**
     * Create a button element.
     * @param {ButtonDetails}
     * @return {Object<HTMLElement>}
     */
    static createButton({parent, text, highlight = []}) {
        const classList = highlight.length ? highlight : ['highlight-ok'];

        const button = this.createNode({
            tagName: 'BUTTON',
            classList,
            children: [{text}],
        });

        const container = this.createNode({
            tagName: 'SPAN',
            parent,
            children: [button],
        });

        return {container, button};
    }

    /**
     * Get element value.
     * @param {DOMInput} element
     * @return {string}
     */
    static value(element) {
        if (element.getAttribute('type') === 'checkbox') {
            return element.checked ? 'enabled' : 'disabled';
        }
        return element.value;
    }

    /**
     * Activate an element.
     * @param {Element} element
     */
    static activate(element) {
        if (this.isActive(element)) {
            return;
        }

        // Deactivate siblings
        Array.from(element.parentElement.children).forEach(sibling => {
            this.deactivate(sibling);
        });
        // Activate the element
        element.classList.add('active');
    }

    /**
     * Deactivate an element.
     * @param {Element} element
     */
    static deactivate(element) {
        element.classList.remove('active');
    }

    /**
     * Check if an element is active.
     * @param {Element} element
     * @return {boolean} True if the element is active.
     */
    static isActive(element) {
        return element.classList.contains('active');
    }

    /**
     * Enable an element.
     * @param {Element} element
     */
    static enable(element) {
        element.classList.add('enabled');
    }

    /**
     * Disable an element.
     * @param {Element} element
     */
    static disable(element) {
        element.classList.remove('enabled');
    }

    /**
     * Get element by ID.
     * @param {string} id
     * @return {(HTMLElement|null)}
     */
    static id(id) {
        return document.getElementById(id);
    }
}

Binder.bind(DOM);

/**
 * @typedef {Object} NodeDetails
 * @property {string} [tagName]
 * @property {string} [text]
 * @property {string[]} [classList]
 * @property {Object<string>} [attributes]
 * @property {HTMLElement} [parent]
 * @property {NodeDetails[]} [children]
 */

/**
 * @typedef {Object} TextareaGroupDetails
 * @property {string} label
 * @property {HTMLElement} [parent]
 * @property {string} [text]
 * @property {string} [placeholder]
 */

/**
 * @typedef {Object} InputGroupDetails
 * @property {string} label
 * @property {HTMLElement} [parent]
 * @property {string} [text]
 * @property {string} [placeholder]
 */

/**
 * @typedef {Object} SelectGroupDetails
 * @property {string} label
 * @property {HTMLElement} [parent]
 * @property {Object} [options]
 * @property {string} [selection]
 */

/**
 * @typedef {Object} ToggleSwitchDetails
 * @property {HTMLElement} [parent]
 * @property {Object} [checked]
 */

/**
 * @typedef {HTMLElement} DOMInput
 * @property {boolean} [checked]
 * @property {string} [value]
 */

/**
 * @typedef {Object} ButtonDetails
 * @property {HTMLElement} [parent]
 * @property {Object} [text]
 * @property {string[]} [highlight]
 */
