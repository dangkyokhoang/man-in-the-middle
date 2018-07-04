/**
 * This makes it easy to deal with rules.
 * */
class Collection {
    /**
     * Each type of rule has its own details, therefore the creation method of input groups.
     * @abstract
     * @param {HTMLElement} ruleElement - The rule element to contain input elements.
     * @param {object} details - Rule details.
     * */
    static createInputGroups(ruleElement, details) {
    }

    /**
     * Get rules from the background script and display them all.
     * */
    static async displayAllRules() {
        let ruleList;

        try {
            ruleList = await Message.send({
                event: 'get',
                ruleType: this.ruleType
            });
        } catch (error) {
            return console.warn(error);
        }

        ruleList.forEach(this.displayRule);
    }

    /**
     * Tell the background script to add a new rule, display the new rule.
     * */
    static async addRule() {
        let details;

        try {
            details = await Message.send({
                event: 'add',
                ruleType: this.ruleType
            });
        } catch (error) {
            return console.warn(error);
        }

        DOMHelper.activateElement(
            this.displayRule(details)
        );
    }

    /**
     * Display a rule.
     * @param {object} details - Rule details.
     * @return {HTMLElement} The created rule element.
     * */
    static displayRule(details) {
        const ruleElement = DOMHelper.createNode({
            tagName: 'ARTICLE',
            parent: this.container
        });

        this.createInputGroups(ruleElement, details);

        this.createRemoveButton({
            tagName: 'BUTTON',
            parent: ruleElement,
            classList: ['highlight-error'],
            children: [{text: 'Remove'}]
        });

        this.container.appendChild(ruleElement);

        this.ruleElements.push(ruleElement);

        return ruleElement;
    }

    /**
     * Create an input group, add default event listeners thereto.
     * @param {InputGroupDetails} details
     * @see {DOMHelper.createInputGroup}
     * */
    static createInputGroup(details) {
        DOMHelper.createInputGroup(details)
            .addEventListener('change', this.onChangeCallback, false);
    }

    /**
     * Create a select group, add default event listeners thereto.
     * @param {SelectGroupDetails} details
     * @see {DOMHelper.createSelectGroup}
     * */
    static createSelectGroup(details) {
        DOMHelper.createSelectGroup(details)
            .addEventListener('change', this.onChangeCallback, false);
    }

    /**
     * Create a select group, add default event listeners thereto.
     * @param {TextareaGroupDetails} details
     * @see {DOMHelper.createTextareaGroup}
     * */
    static createTextareaGroup(details) {
        const textareaGroup = DOMHelper.createTextareaGroup(details);

        textareaGroup.addEventListener(
            'change',
            this.onChangeCallback,
            false
        );
        textareaGroup.addEventListener(
            'click',
            this.toggleStateCallback,
            false
        );
    }

    /**
     * Create rule's remove button, add default event listeners thereto.
     * @param {NodeDetails} details
     * @see {DOMHelper.createNode}
     * */
    static createRemoveButton(details) {
        DOMHelper.createNode(details)
            .addEventListener('dblclick', this.removeCallback, false);
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
        return this.ruleElements.indexOf(element);
    }

    /**
     * Notify the background script on rule detail change.
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static async onChangeCallback(event) {
        try {
            await Message.send({
                event: 'change',
                ruleType: this.ruleType,
                details: {
                    index: this.getIndex(this.getRuleElement(event.target)),
                    name: event.target.name,
                    value: event.target.value
                }
            });
        } catch (error) {
            console.warn(error);
        }
    }

    /**
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static toggleStateCallback(event) {
        const ruleElement = this.getRuleElement(event.target);

        if (DOMHelper.isElementActive(ruleElement)) {
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
     * Remove a rule and notify the background script.
     * @private
     * @param {MouseEvent} event
     * @param {HTMLElement} event.target
     * */
    static async removeCallback(event) {
        const
            ruleElement = this.getRuleElement(event.target),
            index = this.getIndex(ruleElement);

        ruleElement.remove();

        // Remove the rule from the collection's rule element list.
        this.ruleElements.splice(index, 1);

        try {
            await Message.send({
                event: 'remove',
                ruleType: this.ruleType,
                details: {
                    index
                }
            });
        } catch (error) {
            return console.warn(error);
        }
    }
}

// To get rid of IDE warnings.
Collection.ruleType = '';
Collection.ruleElements = [];
Collection.container = null;