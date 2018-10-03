Runtime.addEventListener('message', async ({sender, command, details}) => {
    if (sender !== 'backgroundPage') {
        return;
    }

    const {type, data} = details;
    switch (command) {
        case 'update':
            return Collection.initialize(type, data);
    }
});

addEventListener('DOMContentLoaded', () => Collection.initialize());
