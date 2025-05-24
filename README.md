# dx-htmx

## Introduction

**dx-htmx** is a lightweight JavaScript library for dynamic HTML interactions, inspired by [htmx](https://htmx.org/) and aligned with the [dx](https://github.com/xtompie/dx) architecture.

> **Note:** `dx-htmx` supports only a subset of htmx features.

```html
<button hx-get="/hello" onclick="hx(this)">
  Load
</button>
```

This is the most basic usage. When the button is clicked, an HTTP GET request is sent to `/hello`. By default, the response is injected into the element that triggered the request (the button itself).

## Attribute List

* `hx-get`, `hx-post`, `hx-put`, `hx-delete`, `hx-patch`: HTTP method and URL
* `hx-target`: selector that defines where to insert the response; supports `closest`
* `hx-swap`: defines how the response is inserted (`innerHTML`, `outerHTML`, `append`, `prepend`, `none`)
* `hx-select`: selector used to extract part of the response
* `hx-indicator`: selector for an element shown while request is pending
* `hx-disable`: disables the trigger element while the request is active
* `hx-disabled-elt`: selector for another element to disable during the request

## Selector

When a selector starts with `closest`, it is resolved in two steps:

1. The element walks up the DOM to find the nearest ancestor that matches the first part.
2. Then, it optionally searches inside that ancestor using the remaining selector.

Example:

```html
<button hx-target="closest .panel .content"></button>
```

This will:

* find the closest ancestor with class `.panel`
* then look for a child `.content` inside that `.panel`

## Examples

### Click to load

You can use `hx-get` with a button to dynamically load and replace content in a list. Here's an example:

```html
<ul>
  <li>Agent 1</li>
  <li>Agent 2</li>
  <li id="replaceMe">
    <button class="btn primary"
            hx-get="/contacts/?page=2"
            hx-target="#replaceMe"
            hx-swap="outerHTML">
      Load More Agents...
      <img class="htmx-indicator" src="/img/bars.svg" alt="Loading...">
    </button>
  </li>
</ul>
```

In this example:

- Clicking the "Load More Agents..." button sends an HTTP GET request to `/contacts/?page=2`.
- The response replaces the `<li>` with `id="replaceMe"` using the `outerHTML` swap strategy.
- The `htmx-indicator` image is displayed while the request is in progress.

