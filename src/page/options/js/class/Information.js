class Information {
    /**
     * Display extension's information.
     * @return {void}
     */
    static display() {
        Runtime.sendMessage({
            sender: 'optionsPage',
            request: 'getInformation',
        }).then(information => {
            Object.entries(information).forEach(([label, text]) => {
                DOM.createNode({
                    tagName: 'DIV',
                    parent: DOM.id('information'),
                    children: [{
                        text: `${label.toUpperCase()} ${text}`,
                    }],
                });
            });
        });
    }
}