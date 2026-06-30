# Component Contract

Stateful or staged component program:

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
        value: `<section id="${id}">${state.counting}</section>`,
      };

      state = Object.assign(state, input || {});
    }
  },
};
```

Pure functional component iterator:

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

Rules:

- `*program(id)` creates the live component iterator.
- Functional components may directly return an iterator object with `next()`.
- Local state stays inside the generator when using `*program`.
- `yield` emits boot steps and HTML steps for generator components.
- `.next(input)` updates the component.
- Generated HTML should include the root element when updates use `outerHTML`.
