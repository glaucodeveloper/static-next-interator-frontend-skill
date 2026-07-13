---
name: static-next-interator-frontend-skill
description: Build, migrate, refactor, or review framework-free JavaScript interfaces whose components are generator functions. Each live component receives state patches through generator.next(patch), creates one HTMLElement from a template fragment, stores methods and state on its this context, exposes itself through element.component, and replaces its own root after updates. Use for React-like local state, inline DOM handlers, progressive UI composition, component typing, or Static Next architecture without frameworks.
---

# Static Next Interator Frontend

Use one canonical component lifecycle: a `function*`, a live `this` context, and the native generator `next()` protocol.

```js
function* CounterComponent({ id, props = {} }) {
  this.id = id;
  this.state = { counting: props.counting ?? 0 };
  this.element = null;

  this.increment = amount => this.next({
    counting: this.state.counting + amount,
  });

  while (true) {
    Object.assign(
      this.state,
      yield (this.element = ((element) => {
        element.id = id;
        element.component = this;
        if (this.element?.isConnected) this.element.replaceWith(element);
        return element;
      })(Object.assign(document.createElement("template"), {
        innerHTML: `<section><output>${this.state.counting}</output>
          <button onclick="document.getElementById('${id}').component.increment(1)">+1</button>
        </section>`,
      }).content.firstElementChild)),
    );
  }
}
```

## Bind the generator

Create one context per instance and bind the generator iterator to it. Keep the binder generic; do not move component state or rendering into it.

```js
function component(Component, props) {
  const context = {};
  const iterator = Component.call(context, props);

  context.next = iterator.next.bind(iterator);
  context.return = iterator.return.bind(iterator);
  context.throw = iterator.throw.bind(iterator);

  return context;
}

const counter = component(CounterComponent, { id: "counter-1" });
document.querySelector("#app").append(counter.next().value);
```

## Preserve the contract

- Keep the component implementation in one `function* Component({ id, props })`.
- Store instance identity, state, current root, and public handlers on `this`.
- Create the disposable `<template>` inline with `Object.assign(document.createElement("template"), { innerHTML })`; never allocate it to a local variable.
- Consume its `DocumentFragment` immediately through `.content.firstElementChild`.
- Require exactly one root `HTMLElement`.
- Apply `id` after extracting the root.
- Apply `element.component = this` before mounting or replacing it.
- Keep the canonical state patcher visible as `Object.assign(this.state, yield element)`; the yielded value is the rendered root and the resumed value is the next state patch.
- Prefer the full expression `Object.assign(this.state, yield (this.element = ...))` when documenting the complete auto-state anatomy.
- Replace only `this.element` when connected; then refresh `this.element`.
- Write template handlers as `document.getElementById(id).component.method(...)` when following the inline Static Next form.
- Validate ids, state patches, and dynamic values before committing DOM.

Read the expression linearly, not as nesting for its own sake:

1. `Object.assign(this.state, ...)` declares the pending state transition.
2. The inner expression materializes and commits the current root.
3. `yield root` suspends the component and exposes that render.
4. `next(statePatch)` resumes the same expression with the patch as the yielded result.
5. The pending `Object.assign` completes.
6. The `while` loop begins the next render from the updated state.

Keep template creation inline because it belongs to the value-producing side of `yield`. Giving the template a separate local lifecycle breaks the linear representation of render-output followed by state-input.

Do not reinterpret `yield` as an app-step bus, an event registry, or an HTML-string lifecycle. Do not replace the generator with a returned component object or a static module registry.
Do not give the disposable template any local-variable identity inside a component.

Read [references/component-anatomy.md](references/component-anatomy.md) before implementing a component, [references/events.md](references/events.md) when defining handlers, and [references/component-contract.md](references/component-contract.md) when formalizing types. Use [examples/ui-components.md](examples/ui-components.md) for the complexity progression.

## Validate

- Confirm the first `next()` returns the initial `HTMLElement`.
- Confirm `next(patch)` merges state and returns the replacement root.
- Confirm `element.component === context` after every render.
- Confirm two ids keep independent contexts and state.
- Confirm every rendered handler resolves the current root by id.
- Confirm each component owns one root and one render loop.
- Run `node scripts/validate.mjs`.
