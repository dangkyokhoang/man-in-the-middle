/**
 * This makes it easy to work with DOM.
 * */
class DOMHelper {
    /**
     * Create node(s).
     * @param {NodeDetails}
     * @return {(HTMLElement|Node)} The top-most node created.
     * */
    static createNode({
                          tagName = '',
                          text = '',
                          classList = [],
                          attributes = {},
                          parent = null,
                          children = []
                      }) {
        let node;

        // Elements are prioritized.
        if (tagName) {
            node = document.createElement(tagName);

            if (classList.length) {
                node.classList.add.apply(node.classList, classList);
            }

            Object.entries(attributes).forEach(attribute =>
                node.setAttribute(attribute[0], attribute[1]));

            children.forEach(details =>
                this.createNode(
                    Object.assign(details, {
                        parent: node
                    })
                ));
        } else {
            node = document.createTextNode(text);
        }

        parent && parent.appendChild(node);

        return node;
    }

    /**
     * Create an input group element.
     * @param {InputGroupDetails} details
     * @return {HTMLElement} The created input group element.
     * @see {DOMHelper.createNode}
     */
    static createInputGroup({parent, text, input}) {
        return this.createNode({
            tagName: 'DIV',
            classList: [
                this.isMultilineInput(input) ?
                    'multiline-input-group' :
                    'input-group'
            ],
            parent,
            children: [{
                tagName: 'LABEL',
                children: [{text}]
            }, input]
        })
    }

    /**
     * Create an select group element.
     * @param {SelectGroupDetails} details
     * @return {HTMLElement} The created select group element.
     * @see {DOMHelper.createInputGroup}
     */
    static createSelectGroup({parent, text, select}) {
        select.tagName = 'SELECT';

        select.children = select.options.map(option => {
            option.tagName = 'OPTION';

            if (!option.hasOwnProperty('attributes')) {
                option.attributes = {};
            }

            option.attributes.value = option.value;

            if (option.value === select.selectedValue) {
                option.attributes.selected = '';
            }

            option.children = [{text: option.text || option.value}];

            return option;
        });

        return this.createInputGroup({
            parent,
            text,
            input: select
        });
    }

    /**
     * Create a textarea group element.
     * @param {TextareaGroupDetails} details
     * @return {HTMLElement} The created textarea group element.
     * @see {DOMHelper.createInputGroup}
     */
    static createTextareaGroup({parent, text, textarea}) {
        textarea.tagName = 'TEXTAREA';

        return this.createInputGroup({
            parent,
            text,
            input: {
                tagName: 'DIV',
                classList: ['textarea-wrapper'],
                children: [textarea]
            }
        });
    }

    /**
     * Activate an element
     * @param {HTMLElement} element
     */
    static activateElement(element) {
        if (this.isElementActive(element)) {
            return;
        }

        // Deactivate siblings.
        [...element.parentElement.children].forEach(siblingElement =>
            this.deactivateElement(siblingElement));

        element.classList.add('active');
    }

    /**
     * Deactivate an element
     * @param {HTMLElement} element
     */
    static deactivateElement(element) {
        element.classList.remove('active');
    }

    /**
     * Check if an element is 'active'.
     * @param {HTMLElement} element
     * @return {boolean} True if the element is active.
     */
    static isElementActive(element) {
        return element.classList.contains('active');
    }

    /**
     * @param {NodeDetails} details
     * @return {boolean} True if the input group is multiline.
     * */
    static isMultilineInput(details) {
        return details.tagName === 'DIV';
    }

    /**
     * Get element by ID.
     * @param {string} id
     * @return {HTMLElement}
     */
    static id(id) {
        return document.getElementById(id);
    }
}

/**
 * @typedef {object} NodeDetails
 * @property {string} [tagName = ''] - ELEMENT TAG NAME. Prioritized over the property 'text'.
 * @property {string} [text = ''] - Must be non-empty in case the property 'tagName' is empty.
 * @property {array} [classList = []]
 * @property {{string}} [attributes = {}]
 * @property {HTMLElement} [parent = null]
 * @property {[NodeDetails]} [children = []]
 * */

/**
 * @typedef {object} InputGroupDetails
 * @property {HTMLElement} [parent]
 * @property {string} text
 * @property {NodeDetails} input
 * */

/**
 * @typedef {object} SelectGroupDetails
 * @property {HTMLElement} [parent]
 * @property {string} text
 * @property {SelectElementDetails} select
 * */

/**
 * @typedef {NodeDetails} SelectElementDetails
 * @property {[OptionElementDetails]} options
 * @property {string} selectedValue
 * */

/**
 * @typedef {NodeDetails} OptionElementDetails
 * @property {string} value
 * @property {string} [text = value]
 * */

/**
 * @typedef {object} TextareaGroupDetails
 * @property {HTMLElement} [parent]
 * @property {string} text
 * @property {NodeDetails} textarea
 * */