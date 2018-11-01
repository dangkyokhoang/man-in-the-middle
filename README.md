# Man in the Middle
Firefox Extension: Man in the Middle—Allow user to intercept network requests and inject JavaScript, CSS into tabs.  
Get the extension on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/man-in-the-middle/):
[Man in the Middle](https://addons.mozilla.org/en-US/firefox/addon/man-in-the-middle/).
## Rules
### Blocking Rule
Rule to block or redirect requests.  
- [Name](#name);
- [URL filters (Required)](#url-filters);
- [Redirect URL](#redirect-url);
- [Origin URL filters](#origin-url-filters);
- [Method](#method).
### Header Rule
Rule to modify request or response headers.
- [Name](#name);
- [Text headers (Required)](#text-headers);
- [Text type](#text-type);
- [Header type](#header-type);
- [URL filters (Required)](#url-filters);
- [Origin URL filters](#origin-url-filters);
- [Method](#method).
### Content Script
Rule to inject JavaScript, CSS into tabs.
- [Name](#name);
- [Code (Required)](#code);
- [Script type](#script-type);
- [DOM event](#dom-event);
- [URL filters](#url-filters).
## Properties
### Name
- Any string as the name of the rule.
- Rule: [Blocking Rule](#blocking-rule), [Header Rule](#header-rule), [Content Script](#content-script).
### URL filters
- `URL filter`s are filters to match request URLs or document URLs.
- A URL is matched if it matches at least one of the filters; or if no filter is set ([Content Script](#content-script) only).
- `URL filter`s are separated by a comma `','`.
- `URL filter` is of `RegExp pattern` or `string filter`.
  - Type `RegExp pattern`:
    - A `RegExp pattern` begins with a `'/'` and ends with a `'/'`.
    - Any filter that begins with a `'/'` and ends with a `'/'` is treated as a `RegExp pattern`.
    - A URL matches the filter if it matches the `RegExp pattern`.
    - Examples:
    ````
    /face\w{4}\.[\w]+/, /anything-that-start-with-a-slash-and-end-with-a-slash/
    ````
  - Type `string filter`:
    - A `string filter` is any string that is not a `RegExp pattern` described above.
    - A URL matches the filter if it includes the `string filter`.
    - Examples:
    ````
    facebook., anything-that-does-not-start-with-'/'-and-end-with-'/'
    ````
- The property [Origin URL filters](#origin-url-filters) has the same writing rule as this property.
- Rule: [Blocking Rule](#blocking-rule), [Header Rule](#header-rule), [Content Script](#content-script).
### Redirect URL
- If not set, matched requests are canceled (Default).
- If set, matched requests are redirected to the `redirect URL`.
- Capturing groups from a [URL filter](#url-filters) type `RegExp pattern` can be used inside `redirect URL` using group number `$x`.
- Examples:
  ````
  (Matched) URL filter: https://www.google.com/
  Redirect URL: https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif
  
  (Matched) URL filter: /^http:(.*)[force-https]?/
  Redirect URL: https://$1
  ````
- Rule: [Blocking Rule](#blocking-rule).
### Origin URL filters
- `Origin URL filter`s are filters to match the documents which triggered requests.
- A request is modified if one of the following is satisfied:
  - No filter is set (Default);
  - The request comes from a document that matches at least one of the filters.
- Helps on writing `URL filter`s, see: [URL filters](#url-filters).
- Rules: [Blocking Rule](#blocking-rule), [Header Rule](#header-rule).
### Method
- A request is modified if the request method is equals to `method`.
- `Method` can be one of the `HTTP request method`s, i.e: `'GET'`, `'POST'`, `'HEAD'`, etc.

- Rules: [Blocking Rule](#blocking-rule), [Header Rule](#header-rule).
### Text headers
- Plaintext or JavaScript to modify request or response headers.
- Type `Plaintext`:
  - `Text header`s are separated by a new line `'\r\n'`, `'\r'` or `'\n'`.
  - `Text header` is of the format: `Name: Value`.
    - If `name` is empty, the header is omitted.
    - If a header with the name `name` exists, the header is modified.
    - If no header with the name `name` exists, a new header is added.
    - If `value` is empty, existing header with the name `name` is removed; or the header is omitted.
  - Examples:
    ````
    Accept: *
    ````
    ````
    User-Agent:
    ````
- Type `JavaScript`:
  - `Text headers` is a JavaScript code, more specifically, a function body.
  - The code must `return` an array of objects, each objects has two properties: `name` and `value`.
  - The code can only access built-in objects and some APIs, which are:
    - `Object`, `Array`, `String`, `RegExp`, `JSON`, `Map`, `Set`, `Promise`, ...built-in objects;
    - `isFinite`, `isNaN`, `parseInt`, `parseFloat`;
    - `encodeURI`, `encodeURIComponent`, `decodeURI`, `decodeURIComponent`;
    - `crypto`, `performance`, `atob`, `btoa`, `fetch` and `XMLHttpRequest`.
  - The code may use `requestHeaders` or `responseHeaders` which contains existing headers.
  - The code may use `await` when performing asynchronous tasks.
  - Examples:
    ```` JavaScript
    // Header type: Request headers
    const acceptHeader = requestHeaders.find(({name}) => (
        name.toLowerCase() === 'accept'
    ));
    acceptHeader.value = '*';
    return requestHeaders; 
    ````
    ```` JavaScript
    // Header type: Request headers
    const userAgentHeaderIndex = requestHeaders.findIndex(({name}) => (
        name.toLowerCase() === 'user-agent'
    ));
    requestHeaders.splice(userAgentHeaderIndex, 1);
    return requestHeaders;
    ````
    ```` JavaScript
    // Header type: Response headers
    responseHeaders.push({
        name: 'Set-Cookie',
        value: 'Firefox-Extension=Man in the Middle; HttpOnly',
    });
    return responseHeaders;
    ````
- Rule: [Header Rule](#header-rule).
### Text type
- Declares `text headers` type.
- `Text type` can be one of the following values:
  - `Plaintext`;
  - `JavaScript`.
- Rule: [Header Rule](#header-rule).
### Header type
- Declares the type headers.
- `Header type` can be one of the following values:
  - `Request headers`;
  - `Response headers`.
- Rule: [Header Rule](#header-rule).
### Code
- JavaScript or CSS code to inject to documents.
- Rule: [Content Script](#content-script).
### Script type
- Declares `code` type.
- `Script type` can be one of the following values:
  - `JavaScript`;
  - `CSS`.
- Rule: [Content Script](#content-script).
### DOM event
- An event of the `DOM`, on which the code is injected.
- `DOM event` can be one of the following values:
  - `Loading`;
  - `Loaded`;
  - `Completed`.
- Rule: [Content Script](#content-script).
## Others
- If you have questions, or need help, feel free to message me at:
  [Facebook/dangkyokhoang](https://www.facebook.com/dangkyokhoang).
- If you have feature requests, suggestions or you found bugs, raise issues at:
  [Man-in-the-Middle/issues](https://github.com/dangkyokhoang/Man-in-the-Middle/issues).
