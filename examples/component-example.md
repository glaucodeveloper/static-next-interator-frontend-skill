# Component Example

```js
const CounterComponent = ({ id, props }) => {
  let count = props.initialCount ?? 0;

  return {
    next(message = {}) {
      if (message.type === "increment") count += 1;
      if (message.type === "reset") count = 0;
      if (message.type === "hydrate") count = message.value ?? count;

      return {
        done: false,
        value: `
          <section class="counter" data-component="${id}">
            <p>Total: ${count}</p>
            <button type="button" data-cid="${id}" data-message="increment">+</button>
            <button type="button" data-cid="${id}" data-message="reset">Reset</button>
            <button type="button" data-cid="${id}" data-message="navigate" data-route="home">Home</button>
          </section>
        `,
      };
    },
  };
};
```

Notes:

- Local state stays in the closure.
- Component knowledge stays local.
- Cross-component actions such as `navigate` should be handled by an interator or the runtime.
