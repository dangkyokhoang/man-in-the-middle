# Man in the Middle
Firefox Extension.

## Guide on Writing Rules

### Content Script

#### Code
JavaScript or CSS code.

#### Script type
`'JavaScript'` or `'CSS'`, in respect of the code above.

#### DOM event
`'loading'`, `'loaded'` or `'completed'`.

#### URL filters (Optional)
Events will fire only if the event URL matches at least one of the `URL filter`s, or if no `URL filter` presents.

- `URL filter`s, if present, are separated by a `','`.
- `URL filter` is of `RegExp pattern` or `filter string`.
  - An event URL is matched if it matches the `RegExp pattern` or contains the `filter string`.
  - `RegExp pattern` must begin with a `'/'` and end with a `'/'`.
  - `Filter string`, on the other hand, must not.

#### Frame ID
The level of the frame in which the content script is injected.

### Blocking Rule

#### Match patterns
Events will fire only if the event URL matches at least one of the `match pattern`s.

- `Match pattern`s are separated by a `'\r'` or `'\n'`.
- `Match pattern` is of the format: `<scheme>://<host><path>`.
  - `<scheme>` can be `'*'`, `'http'`, `'https'` or `'file'`.
  - `<scheme>` and `<host>` are separated by `'://'`.
  - `<host>` can be `'*'` or `'*'` followed by part of a `hostname` or a complete `hostname`.
  - `<host>` is optional if the `<scheme>` is `'file'`.
  - `<path>` must begin with a `'/'`.
  - `<path>` is `URL path` with missing components replaced with `'*'`.

#### URL filters
See **Content Script > URL filters**.

#### Method
One of the `HTTP request method`s, i.e: `'GET'`, `'POST'`, `'HEAD'`, etc. Events will fire only if the event's request method equals the selected `method`.

## Others
- If you have questions, or need help, feel free to message me at: https://www.facebook.com/dangkyokhoang.
- If you have future requests, suggestions or you found a bug, raise issues at: https://github.com/dangkyokhoang/Man-in-the-Middle/issues.
