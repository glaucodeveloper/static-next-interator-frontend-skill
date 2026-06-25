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
- Let the runtime handle shared concerns.
