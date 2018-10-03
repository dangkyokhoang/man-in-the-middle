# Man in the Middle
Firefox Extension: Man in the Middle—Allow user to intercept network requests and inject JavaScript, CSS into tabs.  
Get the extension on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/man-in-the-middle/):
[Man in the Middle](https://addons.mozilla.org/en-US/firefox/addon/man-in-the-middle/).
## Rules
### Blocking Rule
Rule to block or redirect requests.  
- [Match patterns](#match-patterns-required);
- [Redirect URL](#redirect-url);
- [Origin URL filters](#origin-url-filters);
- [Method](#method).
### Header Rule
Rule to modify request or response headers.
- [Text headers](#text-headers-required);
- [Text type](#text-type);
- [Header type](#header-type);
- [Match patterns](#match-patterns-required);
- [Origin URL filters](#origin-url-filters);
- [Method](#method).
### Content Script
Rule to inject JavaScript, CSS into tabs.
- [Code](#code-required);
- [Script type](#script-type);
- [DOM event](#dom-event);
- [URL filters](#url-filters).

## Properties
### Match patterns (Required)
- A request is modified, redirected or canceled if the request URL matches at least one of the `match pattern`s.  
- `Match pattern`s are separated by a new line `'\r\n'`, `'\r'` or `'\n'`.
- `Match pattern` is of the format: `<scheme>://<host><path>`.
  - `<scheme>` can be `'*'`, `'http'`, `'https'` or `'file'`.
  - `<scheme>` and `<host>` are separated by `'://'`.
  - `<host>` can be `'*'` or `'*'` followed by part of a `hostname` or a complete `hostname`.
  - `<host>` is optional if the `<scheme>` is `'file'`.
  - `<path>` must begin with a `'/'`.
  - `<path>` is `URL path` with missing components replaced with `'*'`.
- Examples:
  ````
  https://*/ajax/bz*
  https://*/ajax/mercury/change_read_status*
  https://*/ajax/mercury/mark_folder_as_read*
  https://*/ajax/messaging/typ*
  ````
  ````
  https://www.facebook.com/ajax/typeahead/record_basic_metrics*
  https://www.facebook.com/ufi/typing*
  ````
- Rules: [Blocking Rule](#blocking-rule), [Header Rule](#header-rule).
### Redirect URL
- If not set, matched requests are canceled (Default).
- If set, matched requests are redirected to the `redirect URL`.
- Examples:
  ````
  https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif
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
### Text headers (Required)
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
  - The function body can make use of argument `requestHeaders` or `responseHeaders` which contains existing headers.
  - The code must `return` an array of objects. Each objects has two properties (case-sensitive): `name` and `value`.
  - Argument `requestHeaders` or `responseHeaders` has the same format as the return value described above.
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
### Code (Required)
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
#### URL filters
- `URL filter`s are filters to match the documents in which the code is injected.
- The code is injected if one of the following is satisfied:
  - No filter is set (Default);
  - The document URL matches at least one of the filters.
- `URL filter`s are separated by a comma `','`.
- `URL filter` is of `RegExp pattern` or `string filter`.
  - Type `RegExp pattern`:
    - A `RegExp pattern` begins with a `'/'` and ends with a `'/'`.
    - Any filter that begins with a `'/'` and ends with a `'/'` is treated as a `RegExp pattern`.
    - Document URL matches the filter if it matches the `RegExp pattern`.
    - Examples:
    ````
    /face\w{4}\.[\w]+/, /anything-inside-two-slashes/
    ````
  - Type `string filter`:
    - A `string filter` is any string that is not a `RegExp pattern` described above.
    - Document URL matches the filter if it includes the `string filter`.
    - Examples:
    ````
    facebook., any-thing-that-is-not-inside-'/'-and-'/'
    ````
- The property [Origin URL filters](#origin-url-filters) has the same writing rule as this.
- Rule: [Content Script](#content-script).
## Others
- If you have questions, or need help, feel free to message me at:
  [Facebook/dangkyokhoang](https://www.facebook.com/dangkyokhoang).
- If you have feature requests, suggestions or you found bugs, raise issues at:
  [Man-in-the-Middle/issues](https://github.com/dangkyokhoang/Man-in-the-Middle/issues).
