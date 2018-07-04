# Man in the Middle
Firefox Extension: Man in the Middle

# Rule Details

## Content Script

### Code
- JavaScript or CSS code.

### Script type
- `'JavaScript'` or `'CSS'`, in respect of the code above.

### DOM event
- `'loading'`; `'loaded'` or `'completed'`.

### URL filters (optional)
- Events will fire only when the event URL matches at least one of the `URL filter`s. If no `URL filter` presents, all events will fire.
- URL filters are separated by a `','`.
- Each URL filter is a `filter string` or a `RegExp pattern`, and must not be empty.
  - `Filter string`: An event URL is matched if it contains the `filter string`.
  - `RegExp pattern`: An event URL is matched if it matches the `RegExp pattern`.

### Frame ID
- The frame level in which events fire.

## Blocking Rule

### Match patterns
- Match patterns are separated by a `'\r'` or `'\n'`.
- Each match pattern is of the format: `<scheme>://<host><path>`.
  - `<scheme>` can be `'*'`; `'http'`; `'https'`; `'file'`; etc.
  - `<scheme>` and `<host>` are separated by `'://'`.
  - `<host>` can be `'*'`; `'*'` followed by part of a `hostname` or a complete `hostname`.
  - `<host>` is optional if the `<scheme>` is `'file'`.
  - `<path>` must begin with a `'/'`.
  - `<path>` is URL path with missing components replaced with `'*'`.

### URL filters
- See **Content Script** > **URL filters**.

### Method
- One of the HTTP request methods, i.e: `'GET'`, `'POST'`, `'HEAD'`, etc.
