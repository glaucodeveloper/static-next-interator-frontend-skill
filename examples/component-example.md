# Component Example

```js
const CounterComponent = ({ id, props }) => {
  let count = 0;

  return {
    next(message = {}) {
      if (message.type === "increment") count += 1;
      if (message.type === "reset") count = 0;

      return {
        done: false,
        value: `
          <section class="counter">
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
- Cross-component actions such as `navigate` can be delegated through props or the runtime.
