# dx-htmx

## Introduction

**dx-htmx** [htmx](https://htmx.org/) in [dx](https://github.com/xtompie/dx) architecture.

> **Note:** `dx-htmx` supports only a subset of htmx features.

```html
<button hx-get="/hello" onclick="hx(this, event)">
  Load
</button>
```

This is the most basic usage. When the button is clicked, an HTTP GET request is sent to `/hello`. By default, the response is injected into the element that triggered the request (the button itself).

## Attribute List

* `hx-get`, `hx-post`, `hx-put`, `hx-delete`, `hx-patch`: HTTP method and URL
* `hx-target`: selector that defines where to insert the response
* `hx-swap`: defines how the response is inserted (`innerHTML`, `outerHTML`, `append`, `prepend`, `none`)
* `hx-select`: selector used to extract part of the response
* `hx-indicator`: selector for an element shown while request is pending
* `hx-disable`: if present, prevents the element from triggering any request

## Event Binding

You can call `hx(element)` in any event handler. The second argument (`event`) is optional but recommended in many cases:

```html
<button hx-get="/hello" onclick="hx(this, event)">
  Load
</button>
```

Passing `event` ensures proper behavior (like `preventDefault()`) especially when used on:

* `<a href="...">`
* `<form>`
* `<button>` inside a `<form>`

Without `event`, the default browser behavior (like navigation or form submission) may still occur.

## A and FORM support

Besides elements using `hx-get`, `hx-post`, etc., `hx()` recognizes native HTML semantics:

* `<a href="...">` triggers a `GET` request to the `href` URL.
* `<form>` triggers a `POST` request to the `action` URL (or current location if `action` is missing), and serializes its data.

This allows `hx()` to work even without explicit `hx-*` attributes in common cases.

## Selector

Some attributes (`hx-target`, `hx-indicator`, etc.) accept a **selector string** to find an element in the DOM. `dx-htmx` supports the following selector types:

### `this`

Refers to the element that triggered the request.

```html
<button hx-get="/x" hx-target="this" onclick="hx(this, event)">Click</button>
```

The response will be inserted into the button itself.

### `find <selector>`

Finds all elements matching the given selector **inside the current element**.

```html
<div hx-get="/x" hx-indicator="find .loading">
    <span class="loading" style="display:none">Loading...</span>
</div>
```

This looks for `.loading` **inside** the triggering element (`div` in this case).

### `closest <selector> [subselector]`

First finds the **closest ancestor** matching `<selector>`,
then optionally queries inside it using `[subselector]`.

```html
<button hx-target="closest .panel .content"></button>
```

This will:

1. Find the nearest ancestor with class `.panel`
2. Then find `.content` inside that `.panel`

If no `[subselector]` is provided, the ancestor itself is used.

### Standard selector

Any other string is treated as a standard global CSS selector.

```html
<button hx-target="#output" hx-get="/x" onclick="hx(this, event)">Click</button>
<div id="output"></div>
```

This injects the response into the element with `id="output"`.


## Examples

### Tabs

You can use `hx-get` with buttons to switch tab content dynamically. Each tab button loads its content into a shared container using the `hx-target` attribute.

```html
<div
    tab-space
    hx-target="closest [tab-space] [tab-content]"
    hx-swap="innerHTML"
>
    <button hx-get="/tab/1" onclick="hx(this, event)">Tab 1</button>
    <button hx-get="/tab/2" onclick="hx(this, event)">Tab 2</button>
</div>
<div tab-content>
  <!-- Tab content will be loaded here -->
</div>
```

In this example:

* Clicking any tab button sends an HTTP GET request to the corresponding URL (e.g., `/tab/1`).
* The response is injected into the `<div tab-content>` using the `innerHTML` swap strategy.
* Only the content area is updated, not the buttons themselves.

### Click to load

You can use `hx-get` with a button to dynamically load and replace content in a list. Here's an example using `closest` in `hx-target`:

```html
<ul>
    <li>Agent 1</li>
    <li>Agent 2</li>
    <li
        hx-target="this"
        hx-get="/contacts/?page=3"
        hx-swap="outerHTML"
        hx-indicator="find .htmx-indicator"
    >
        <button onclick="hx(this, event)">
            Load More Agents...
        </button>
        <img
            class="htmx-indicator"
            src="/img/bars.svg"
            alt="Loading..."
            style="display:none"
        >
    </li>
</ul>
```

In this example:

* Clicking the "Load More Agents..." button sends an HTTP GET request to `/contacts/?page=3`.
* The response replaces the `<li>` using the `outerHTML` swap.
* The `htmx-indicator` image is displayed while the request is in progress.

Example response body for `/contacts/?page=3`:

```html
    <li>Agent 3</li>
    <li
        hx-target="this"
        hx-get="/contacts/?page=4"
        hx-swap="outerHTML"
        hx-indicator="find .htmx-indicator"
    >
        <button onclick="hx(this, event)">
            Load More Agents...
        </button>
        <img
            class="htmx-indicator"
            src="/img/bars.svg"
            alt="Loading..."
            style="display:none"
        >
    </li>
```
