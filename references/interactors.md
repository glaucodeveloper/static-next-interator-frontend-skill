# Interators

Interators coordinate:

- event system
- routing
- session
- persistence
- atomic global state
- synchronization between components

Suggested shape:

```js
const createInterator = ({ persist }) => {
  const atoms = {
    route: "home",
    session: null,
    selectedId: null,
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") atoms.route = message.route;
      if (message.type === "select") atoms.selectedId = message.value;
      if (message.type === "login") atoms.session = message.session;
      persist?.(atoms);
      return atoms;
    },
    getAtoms() {
      return atoms;
    },
  };
};
```
