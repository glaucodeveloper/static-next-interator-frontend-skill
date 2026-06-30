# Component Contract

Canonical local component:

```js
const CounterComponent = {
  create({ id, props = {} }) {
    let state = { counting: props.initialCount ?? 0 };

    return {
      next(message = {}) {
        if (message.type === "increment") state.counting += 1;
        if (message.type === "reset") state.counting = 0;

        return {
          done: false,
          value: `
            <section id="${id}">
              <span>${state.counting}</span>
              <button data-cid="${id}" data-message="increment">click</button>
            </section>
          `,
        };
      },
    };
  },
};
```

Rules:

- state stays local
- `next(message)` returns markup
- globals stay outside the component
