# Interators

Interators are the coordination layer between DOM events, shared runtime state, and components.

## Responsibilities

- normalize DOM events into messages
- hold shared runtime state such as route, selection, auth, and cache records
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
const createInteractor = ({ persist }) => {
  const state = {
    route: "home",
    selection: null,
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") state.route = message.route;
      if (message.type === "select") state.selection = message.value;
      persist(state);
      return state;
    },
    getState() {
      return state;
    },
  };
};
```

## Rule of thumb

If two or more components need the same truth, put it in an interator.