# Component Examples

Pure functional component as iterator:

```js
const LabelComponent = ({ id, props = {} }) => ({
  next(message = {}) {
    const text = message.text ?? props.text ?? "";

    return {
      done: false,
      value: `<span id="${id}">${text}</span>`,
    };
  },
});
```

Stateful component as generator program:

```js
const CounterProgram = {
  *program(id) {
    let state = { counting: 0 };

    yield { type: "mount", id };
    yield { type: "events", id };

    while (true) {
      const input = yield {
        type: "html",
        id,
        value: `
          <section id="${id}">
            <span>${state.counting}</span>
            <button data-cid="${id}" data-message="increment">click</button>
          </section>
        `,
      };

      if (input?.type === "increment") state.counting += 1;
      if (input?.type === "reset") state.counting = 0;
    }
  },
};
```
