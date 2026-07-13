# Canonical Component Anatomy

## State registry

`this.frontends[id]` is the live instance. It owns state and the current root reference.

```js
this.frontends[id] = {
  state: { counting: 0 },
  element: null,
};
```

## Handler registry

Create handlers in `mount()`. Arrow functions capture the component module as `this`.

```js
this.events[id] = {
  add: amount => this.update(id, {
    counting: this.frontends[id].state.counting + amount,
  }),
};
```

The HTML calls the registered handler:

```js
const idRef = JSON.stringify(id);
return `<button onclick="CounterComponent.events[${idRef}].add(1)">+1</button>`;
```

## Template

`this.template(id)` is a pure read of the registered instance. It returns the full root HTML string.

## Mount

`this.mount(id, target)` registers state and handlers, inserts the first template, then stores the root element.

## Update

`this.update(id, patch)` is the only state transition:

```js
Object.assign(frontend.state, patch);
frontend.element.outerHTML = this.template(id);
frontend.element = document.querySelector(`#${CSS.escape(id)}`);
```

This is the React-like cycle:

`handler -> this.update(id, patch) -> state merge -> this.template(id) -> outerHTML -> refreshed element reference`

## Required invariants

- No generators or `yield`.
- No `create()` bootstrap.
- No returned component instance object.
- No DOM mutation outside `mount()` and `update()`.
- One stable id per instance.
- One root element per template.
- One handler registry per instance.
