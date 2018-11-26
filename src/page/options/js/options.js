'use strict';

Information.display();

Collection.startup();

Runtime.addEventListener('message', async ({sender, command, details}) => {
    if (sender !== 'backgroundPage') {
        return;
    }

    switch (command) {
        case 'update':
            return Collection.initialize(details.type, details.data);
        case 'log':
            return console.log(details.message);
    }
});
