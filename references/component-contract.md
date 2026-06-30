# Component Contract

Canonical shape:

```js
const ExampleComponent = ({ id, props }) => {
  let state = null;

  return {
    next(message = {}) {
      if (message.type === "doSomething") state = message.value;

      return {
        done: false,
        value: `<section data-component="${id}">${state ?? ""}</section>`,
      };
    },
  };
};
```

Guidelines:

- Receive dependencies through `props`.
- Keep closure state private and minimal.
- Return markup every time `next()` runs.
- Keep the component concerned only with its own UI decisions.
- Let interators handle cross-component state, event transport, and global coordination.
