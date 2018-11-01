// Initialize all rules
Factory.initialize();

// If storage changes, re-initialize rules.
Storage.addListener(changes => changes.forEach(async ([type, {newValue}]) => {
    if (!Factory.hasType(type)) {
        return;
    }

    await Factory.initialize(type, newValue);

    Runtime.sendMessage({
        sender: 'backgroundPage',
        command: 'update',
        details: {type, data: Factory.getData(type)},
    });
}));

// Handle requests from options page
Runtime.addEventListener('message', async ({sender, request, details}) => {
    if (sender !== 'optionsPage') {
        return;
    }

    const {type, id, change} = details;
    switch (request) {
        case 'add':
            return Factory.add(type);
        case 'remove':
            return Factory.remove(type, id);
        case 'modify':
            return Factory.modify(type, id, change);
        case 'get':
            return Factory.getData(type);
    }
});

BrowserAction.addListener(Tabs.openOptionsPage);

async function resetStorage() {
    await Storage.set(JSON.parse('{"contentScripts":[{"id":"{1559dec4-76a1-b300-82c7-b534de9e5066}","code":"const players = document.getElementById(\'players\');\\nconst video = document.querySelector(\'video.jw-video\');\\nconst container = video.parentElement;\\nconst mitmContainer = (() => {\\n    // Create a new video container\\n    document.styleSheets[0].insertRule(\'.mitm-player {display: block; margin-top: 10px; margin-bottom: -15px;}\');\\n    document.styleSheets[0].insertRule(\'.mitm-player > * {width: 100%;}\');\\n    const mitmContainer = document.createElement(\'DIV\');\\n    mitmContainer.classList.add(\'mitm-player\');\\n    players.parentNode.insertBefore(mitmContainer, players);\\n    return mitmContainer;\\n})();\\n\\nconst setPlayersAreaHeight = () => {\\n    if (players.style.height !== \'60px\') {\\n        players.style.height = \'60px\';\\n    }\\n};\\n\\n// Set to fullscreen mode on fullscreen\\nconst fullscreenMode = () => container.appendChild(video);\\n// Set to default separated mode when not fullscreen\\nconst defaultMode = () => mitmContainer.appendChild(video);\\n\\nsetPlayersAreaHeight();\\ndefaultMode();\\n\\n// If the default player height changes,\\n// resize it again.\\nconst playersObserver = new MutationObserver(mutationList => mutationList.forEach(({attributeName}) => {\\n    if (attributeName === \'style\') {\\n        setPlayersAreaHeight();\\n    }\\n}));\\nplayersObserver.observe(players, {attributes: true});\\n\\n// If the video element has moved to another place, and if it\'s moved by default player,\\n// moved it to the new container again.\\nconst mitmPlayerObserver = new MutationObserver(mutationList => mutationList.forEach(({removedNodes}) => {\\n    const [removedNode] = removedNodes;\\n    if (!fullScreen && removedNode === video) {\\n        defaultMode();\\n    }\\n}));\\nmitmPlayerObserver.observe(mitmContainer, {childList: true});\\n\\ndocument.styleSheets[0].insertRule(\'#player_1.active {height: 40px;}\');\\ndocument.styleSheets[0].insertRule(\'#player_1.active > * {max-height: 40px;}\');\\n\\ndocument.querySelector(\'div.jw-controlbar\').focus();\\n\\n// Switch between modes on fullscreen change\\ndocument.addEventListener(\'mozfullscreenchange\', () => {\\n    if (fullScreen) {\\n        fullscreenMode();\\n    } else {\\n        defaultMode();\\n    }\\n});","scriptType":"JavaScript","domEvent":"completed","urlFilters":["animetvn.tv/xem-phim"]},{"id":"{155aa25e-3fc5-d200-a4ce-6d8b2cbbeb3f}","code":"const stories = document.getElementsByClassName(\'_5jmm _5pat\');\\nconst maxStories = 23;\\n\\n// Register cleaner\\nsetInterval(cleanupStories, 10000);\\n\\nfunction cleanupStories() {\\n    if (stories.length <= maxStories) {\\n        return;\\n    }\\n\\n    const pageType = getPageType();\\n    switch (pageType) {\\n        case \'home\':\\n            while (stories.length > maxStories) {\\n                // Make sure the story\'s container is not hidden\\n                let container = stories[0];\\n                for (let i = 0; i < 3; i++) {\\n                    container = container.parentElement;\\n                    if (container.classList.contains(\'hidden_elem\')) {\\n                        container.classList.remove(\'hidden_elem\');\\n                        break;\\n                    }\\n                }\\n                // The story element on the home page can\'t be removed for stability\\n                // Instead it gets emptied\\n                stories[0].firstChild.style.height = getComputedStyle(stories[0]).height;\\n                stories[0].firstChild.innerHTML = \'&nbsp;\';\\n                stories[0].classList.remove(\'_5jmm\');\\n            }\\n            break;\\n        default:\\n            const lastStory = stories[stories.length - 1];\\n\\n            // If the story count is greater than the max count,\\n            // but the removable stories are in view,\\n            // those stories won\'t get removed.\\n            let end;\\n            for (end = 0; end < stories.length - maxStories; end++) {\\n                if (getY(stories[end]) + stories[end].offsetHeight > 0) {\\n                    break;\\n                }\\n            }\\n            for (let i = 0; i < end; i++) {\\n                // Remember the last story and its offset top to preserve scrolling position\\n                const offsetTop = getY(lastStory);\\n\\n                switch (pageType) {\\n                    case \'page\':\\n                        // Just remove the story\'s container\\n                        stories[0].parentElement.parentElement.remove();\\n                        break;\\n                    default:\\n                        // Remove the story itself\\n                        stories[0].remove();\\n                }\\n\\n                // Scroll to the last position\\n                scrollBy(0, lastStory.getBoundingClientRect().y - offsetTop);\\n            }\\n    }\\n}\\n\\nfunction getPageType() {\\n    if (\\n        document.getElementById(\'substream_0\') ||\\n        document.getElementById(\'substream_1\')\\n    ) {\\n        return \'home\';\\n    } else if (\\n        document.getElementById(\'www_pages_reaction_see_more_unitwww_pages_home\') ||\\n        document.getElementById(\'www_pages_reaction_see_more_unitwww_pages_posts\')\\n    ) {\\n        return \'page\';\\n    } else {\\n        return \'other\';\\n    }\\n}\\n\\nfunction getY(element) {\\n    return element.getBoundingClientRect().y;\\n}","scriptType":"JavaScript","domEvent":"completed","urlFilters":["www.facebook.com"]}],"headerRules":[{"id":"{1559dd08-a08f-f100-481c-75aaa7c9e79d}","matchPatterns":["*://*/*"],"originUrlFilters":[],"method":"GET","textHeaders":"Test: Success","textType":"plaintext","headerType":"requestHeaders"}],"version":"3.0.0","blockingRules":[{"id":"{1559db4b-f4fd-3400-96a4-5b9b5235cc0c}","matchPatterns":["https://*/ajax/bz*","https://*/ajax/mercury/change_read_status*","https://*/ajax/mercury/mark_folder_as_read*","https://*/ajax/messaging/typ*"],"originUrlFilters":["www.facebook.com","www.messenger.com"],"method":"POST","redirectUrl":"","urlFilters":["/https:\\\\/\\\\/.*?\\\\/ajax\\\\/bz.*/","/https:\\\\/\\\\/.*?\\\\/ajax\\\\/mercury\\\\/change_read_status.*/","/https:\\\\/\\\\/.*?\\\\/ajax\\\\/mercury\\\\/mark_folder_as_read.*/","/https:\\\\/\\\\/.*?\\\\/ajax\\\\/messaging\\\\/typ.*/"]},{"id":"{1559db4b-f51b-b900-df13-7f1d4578e2af}","matchPatterns":["https://www.facebook.com/ajax/typeahead/record_basic_metrics*","https://www.facebook.com/ufi/typing*"],"originUrlFilters":[],"method":"POST","redirectUrl":"","urlFilters":["/https:\\\\/\\\\/www.facebook.com\\\\/ajax\\\\/typeahead\\\\/record_basic_metrics.*/","/https:\\\\/\\\\/www.facebook.com\\\\/ufi\\\\/typing.*/"]},{"id":"{1559db4b-f51b-b900-c385-a5fcfe92fa58}","matchPatterns":["http://lienminh360.vn/*js*"],"originUrlFilters":[],"method":"GET","redirectUrl":"","urlFilters":["/http:\\\\/\\\\/lienminh360.vn\\\\/.*?js.*/"]}],"contentScript":[],"test1":0.9043822645991522,"test0":0.9287462447999394}'));
    await browser.storage.sync.remove('version');
}