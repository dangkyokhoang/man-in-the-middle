/**
 * This makes it easy to work with rules.
 * */
class Collection {
    /**
     * @abstract
     * @param {object} details - The rule details.
     * @return {HTMLElement} The created rule element.
     * */
    static createRuleElement(details) {
    }

    /**
     * Ask the background script for the list of rules and display them all.
     * */
    static async displayAllRules() {
        const detailsArray = await Message.send({
            event: 'get',
            ruleType: this.ruleType
        });

        if (detailsArray) {
            for (let details of detailsArray) {
                this.displayRule(details);
            }
        }
    }

    /**
     * Tell the background script to add a new rule, display the new rule.
     * @return {HTMLElement} The rule element.
     * */
    static async addRule() {
        return this.displayRule(await Message.send({
            event: 'add',
            ruleType: this.ruleType
        }));
    }

    /**
     * Display a rule.
     * @param {object} details
     * @return {HTMLElement} The created rule element.
     * */
    static displayRule(details) {
        const ruleElement = this.createRuleElement(details);

        this.container.appendChild(ruleElement);

        this.ruleElements.push(ruleElement);

        return ruleElement;
    }

    /**
     * Create and display an input group, add default event listeners thereto.
     * @param {InputGroupDetails} details
     * @return {HTMLElement} The input group element.
     * @see {DOMHelper.createInputGroup}
     * */
    static createInputGroup(details) {
        const inputGroup = DOMHelper.createInputGroup(details);

        inputGroup.addEventListener('change', this.onChangeCallback, false);

        DOMHelper.isMultilineInput(details.input) &&
        inputGroup.addEventListener('click', this.toggleActiveStateCallback, false);

        return inputGroup;
    }

    /**
     * Create and display a select group, add default event listeners thereto.
     * @param {SelectGroupDetails} details
     * @return {HTMLElement} The input group element.
     * @see {DOMHelper.createSelectGroup}
     * */
    static createSelectGroup(details) {
        const selectGroup = DOMHelper.createSelectGroup(details);

        selectGroup.addEventListener('change', this.onChangeCallback, false);

        return selectGroup;
    }

    /**
     * Create and display the remove button, add default event listeners to the button.
     * @param {NodeDetails} details
     * @return {HTMLElement} The button element.
     * @see {DOMHelper.createNode}
     * */
    static createRemoveButton(details) {
        const removeButton = DOMHelper.createNode(details);

        if (removeButton) {
            removeButton.addEventListener('dblclick', this.removeCallback, true);

            return removeButton;
        }
    }

    /**
     * Remove a rule element, notify the background script.
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static async removeCallback(event) {
        const index = this.getIndex(event.target);

        // Remove the rule element
        this.ruleElements[index].remove();

        // Remove the rule from the collection's rule element list
        this.ruleElements.splice(index, 1);

        await Message.send({
            event: 'remove',
            ruleType: this.ruleType,
            details: {
                index
            }
        });
    }

    /**
     * Notify the background script on rule detail change.
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static async onChangeCallback(event) {
        await Message.send({
            event: 'change',
            ruleType: this.ruleType,
            details: {
                index: this.getIndex(event.target),
                name: event.target.name,
                value: event.target.value
            }
        });
    }

    /**
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static toggleActiveStateCallback(event) {
        const ruleElement = this.getRuleElement(event.target);

        if (DOMHelper.isActiveElement(ruleElement)) {
            if (event.target.tagName === 'LABEL') {
                DOMHelper.deactivateElement(ruleElement);
            }
        } else {
            if (event.target.tagName === 'DIV') {
                DOMHelper.activateElement(ruleElement);
            }
        }
    }

    /**
     * Get the rule element of the given descendant element.
     * @param {HTMLElement} element
     * @param {function} element.closest
     * @return {HTMLElement}
     * */
    static getRuleElement(element) {
        return element.closest('article');
    }

    /**
     * Get the index of the rule element in the collection's rule element list.
     * @param {HTMLElement} element
     * @return {number}
     * */
    static getIndex(element) {
        return this.ruleElements.indexOf(this.getRuleElement(element));
    }
}

// This is to get rid of IDE warnings
Collection.ruleType = '';
Collection.ruleElements = [];
Collection.container = null;