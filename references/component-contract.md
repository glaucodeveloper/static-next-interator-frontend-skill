# Component Contract

Stateful or staged component program:

```js
const CounterProgram = {
  events: {},

  *program(id) {
    let state = { counting: 0 };

    yield function mount(target = document.body, position = "beforeend") {
      const program = window.counterPrograms[id];
      target.insertAdjacentHTML(position, program.next().value);
    };

    yield {
      increment() {
        const program = window.counterPrograms[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);
        if (!program || !el) return;
        el.outerHTML = program.next({ counting: state.counting + 1 }).value;
      },
    };

    while (true) {
      const input = yield `<section id="${id}">${state.counting}</section>`;

      state = Object.assign(state, input || {});
    }
  },

  create(id) {
    const program = this.program(id);

    window.counterPrograms = window.counterPrograms || {};
    window.counterPrograms[id] = program;

    const mount = program.next().value;
    this.events[id] = program.next().value;

    return mount;
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

- `create(id)` creates and stores the live component iterator.
- `create(id)` consumes the component boot yields: first `mount`, then `events`.
- External app drivers should not manually consume a component's internal mount/events protocol.
- Functional components may directly return an iterator object with `next()`.
- Local state stays inside the generator when using `*program`.
- `yield` emits internal boot steps and HTML for generator components.
- `.next(input)` updates the component.
- Generated HTML should include the root element when updates use `outerHTML`.
