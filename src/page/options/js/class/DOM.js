/**
 * APIs to work with DOM.
 */
class DOM {
    /**
     * Create node(s).
     * @param {NodeDetails}
     * @return {(HTMLElement|Node|void)} The topmost node created.
     */
    static createNode({
                          tagName,
                          text,
                          classList,
                          attributes,
                          parent,
                          children
                      }) {
        let node;
        // .tagName prevails against .text
        if (tagName) {
            node = document.createElement(tagName);
            if (classList && classList.length) {
                node.classList.add.apply(node.classList, classList);
            }
            if (attributes) {
                Object.entries(attributes).forEach(([name, value]) => {
                    // Set an attribute only if it's a string
                    if (typeof value === 'string') {
                        node.setAttribute(name, value);
                    }
                });
            }
            if (children) {
                children.forEach(child => {
                    if (child instanceof Node) {
                        node.appendChild(child);
                    } else {
                        this.createNode({parent: node, ...child});
                    }
                });
            }
        } else {
            node = document.createTextNode(text);
        }

        return node && parent ? parent.appendChild(node) : node;
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
            children: text ? [{text}] : []
        });
        const container = this.createNode({
            tagName: 'DIV',
            classList: ['multiline-input-group'],
            parent,
            children: [
                {tagName: 'LABEL', children: [{text: label}]},
                {
                    tagName: 'DIV',
                    classList: ['textarea-wrapper'],
                    children: [textarea]
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
            attributes: {value: text, placeholder}
        });
        const container = this.createNode({
            tagName: 'DIV',
            classList: ['input-group'],
            parent,
            children: [
                {tagName: 'LABEL', children: [{text: label}]},
                input
            ]
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
            children: options
                ? Object.entries(options).map(([value, text]) => {
                    return {
                        tagName: 'OPTION',
                        attributes: {
                            selected: value === selection ? '' : null,
                            value
                        },
                        children: [{text}]
                    };
                })
                : []
        });
        const container = this.createNode({
            tagName: 'DIV',
            classList: ['input-group'],
            parent,
            children: [
                {tagName: 'LABEL', children: [{text: label}]},
                select
            ]
        });

        return {container, input: select};
    }

    /**
     * Get element builder by tag name.
     * @param {string} tagName
     * @return {Function}
     */
    static getInputBuilder(tagName) {
        switch (tagName.toUpperCase()) {
            case 'TEXTAREA':
                return this.createTextareaGroup;
            case 'INPUT':
                return this.createInputGroup;
            case 'SELECT':
                return this.createSelectGroup;
            default:
                return this.createNode;
        }
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
