---
name: static-next-interator-frontend-skill
description: Build, migrate, refactor, or review framework-free JavaScript interfaces made from static component modules that manage instance state through this.frontends, expose per-instance handlers through this.events, render HTML with this.template(id), mount with this.mount(id, target), and rerender with this.update(id, patch) plus outerHTML. Use for React-like component state and UI composition without frameworks, generators, yield, create factories, or returned component objects.
---

# Static Next Interator Frontend

Use one canonical component anatomy:

```js
const Component = {
  frontends: {},
  events: {},

  mount(id, target = document.body) {},
  template(id) {},
  update(id, patch = {}) {},
};
```

## Apply the contract

- Store every live instance at `this.frontends[id]`.
- Store local state inside `this.frontends[id].state`.
- Register public UI callbacks at `this.events[id]` during `mount()`.
- Define callbacks as arrow functions when they must retain the component module as `this`.
- Produce the complete root HTML string with `this.template(id)`.
- Mount the first string with `insertAdjacentHTML()`.
- Merge partial state only inside `this.update(id, patch)`.
- Replace only the owned root with `element.outerHTML = this.template(id)`.
- Refresh `frontend.element` after replacement.
- Escape ids and values used in HTML attributes.

Do not introduce generators, `yield`, `create()`, factories returning component objects, DOM commit helpers, or a second lifecycle.

## Implement the lifecycle

```js
const CounterComponent = {
  frontends: {},
  events: {},

  mount(id, target = document.body) {
    this.frontends[id] = {
      state: { counting: 0 },
      element: null,
    };

    this.events[id] = {
      add: amount => this.update(id, {
        counting: this.frontends[id].state.counting + amount,
      }),
      reset: () => this.update(id, { counting: 0 }),
    };

    target.insertAdjacentHTML("beforeend", this.template(id));
    this.frontends[id].element = document.querySelector(`#${CSS.escape(id)}`);
  },

  template(id) {
    const state = this.frontends[id].state;
    const idRef = JSON.stringify(id);

    return `<section id="${escapeHtmlAttr(id)}">
      <output>${state.counting}</output>
      <button onclick="CounterComponent.events[${escapeHtmlAttr(idRef)}].add(1)">+1</button>
      <button onclick="CounterComponent.events[${escapeHtmlAttr(idRef)}].reset()">reset</button>
    </section>`;
  },

  update(id, patch = {}) {
    const frontend = this.frontends[id];
    if (!frontend) throw new TypeError(`frontend desconhecido: ${id}`);
    validateCounterPatch(patch);
    Object.assign(frontend.state, patch);
    frontend.element.outerHTML = this.template(id);
    frontend.element = document.querySelector(`#${CSS.escape(id)}`);
    return frontend.element;
  },
};
```

Read [references/component-anatomy.md](references/component-anatomy.md) for the complete anatomy and [references/events.md](references/events.md) for handler ownership. Use [examples/ui-components.md](examples/ui-components.md) for progressively composed interfaces.

## Validate before publishing

- Confirm two ids keep independent state.
- Confirm every handler routes through `this.events[id]`.
- Confirm one action causes one `this.update()` and one root replacement.
- Confirm `frontend.element` points to the replacement root.
- Reject unknown patch fields.
- Run `node scripts/validate.mjs`.
