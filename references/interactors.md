# Interators

Interators are the coordination layer between DOM events, atomic global state, and components.

## Responsibilities

- normalize DOM events into messages
- hold atomic shared state such as route, selection, auth, and cache records
- expose helpers to components through `props`
- publish state changes back to the boot runtime
- keep cross-component effects explicit

## What stays here

- routing state
- session state
- global flags
- persistence access
- event dispatch and fan-out

## What does not stay here

- view markup
- component-local counters or toggles
- low-level DOM rendering details
- hidden singleton logic that bypasses the runtime

## Shape

```js
const createInteractor = ({ state, persist }) => {
  const atoms = {
    route: "home",
    selection: null,
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") atoms.route = message.route;
      if (message.type === "select") atoms.selection = message.value;
      persist(atoms);
      return atoms;
    },
    getAtoms() {
      return atoms;
    },
  };
};
```

## Rule of thumb

If two or more components need the same truth, put it in an interator.
