/**
 * This makes it easy to work with DOM.
 * */
class DOMHelper {
    /**
     * Create node(s).
     * @param {NodeDetails}
     * @return {(HTMLElement|Node)} - The top-most node created.
     * */
    static createNode({
                          text = '',
                          tagName = 'DIV',
                          classList = [],
                          attributes = {},
                          parent = null,
                          children = []
                      }) {

        // Text nodes are prioritized
        if (text !== '') {
            const textNode = document.createTextNode(text);

            parent && parent.appendChild(textNode);

            return textNode;
        }

        // If it's not a text node, create element(s) instead.
        const element = document.createElement(tagName);

        if (classList.length > 0) {
            element.classList.add.apply(element.classList, classList);
        }

        for (let attribute of Object.entries(attributes)) {
            element.setAttribute(attribute[0], attribute[1]);
        }

        parent && parent.appendChild(element);

        if (children) {
            for (let details of children) {

                details.parent = element;

                this.createNode(details);
            }
        }

        return element;
    }

    /**
     * Create an input group element.
     * @param {InputGroupDetails} details
     * @return {HTMLElement} The created input group element.
     * @see {DOMHelper.createNode}
     */
    static createInputGroup({parent, text, input}) {
        return this.createNode({
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
     * @see {DOMHelper.createNode}
     */
    static createSelectGroup({parent, text, select}) {
        select.tagName = 'SELECT';

        select.children = select.options.map(option => {
            option.tagName = 'OPTION';

            option.hasOwnProperty('attributes') || (option.attributes = {});

            option.attributes.value = option.value;

            if (option.value === select.selectedValue) {
                option.attributes.selected = '';
            }

            option.children = [{text: option.text || option.value}];
            delete option.text;

            return option;
        });

        return this.createNode({
            classList: ['input-group'],
            parent,
            children: [{
                tagName: 'LABEL',
                children: [{text}]
            }, select]
        });
    }

    /**
     * Activate an element
     * @param {HTMLElement} element
     */
    static activateElement(element) {
        if (this.isActiveElement(element)) {
            return;
        }

        // Deactivate siblings
        for (let sameLevelElement of element.parentElement.children) {
            this.deactivateElement(sameLevelElement);
        }

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
     * @return {boolean} - True if the element is active.
     */
    static isActiveElement(element) {
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
     * @return {(Element|null)}
     */
    static id(id) {
        return document.getElementById(id);
    }
}

/**
 * @typedef {object} NodeDetails
 * @property {string} [text = '']
 * @property {string} [tagName = 'DIV'] - ELEMENT TAG NAME.
 * @property {array} [classList = []]
 * @property {object.<string>} [attributes = {}]
 * @property {HTMLElement} [parent = null]
 * @property {[NodeDetails]} [children = []]
 * */

/**
 * @typedef {object} InputGroupDetails
 * @property {HTMLElement} [parent]
 * @property {string} text - Input group's label text.
 * @property {NodeDetails} input - Details of the input element.
 * */

/**
 * @typedef {object} SelectGroupDetails
 * @property {HTMLElement} [parent]
 * @property {string} text - Select group's label text.
 * @property {SelectElementDetails} select - Details of the input element.
 * */

/**
 * @typedef {NodeDetails} SelectElementDetails
 * @property {[OptionElementDetails]} options
 * @property {string} selectedValue - The selected option.
 * */

/**
 * @typedef {NodeDetails} OptionElementDetails
 * @property {string} value
 * @property {string} [text = value]
 * */