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
      const input = yield `
          <section id="${id}">
            <span>${state.counting}</span>
            <button onclick="CounterProgram.events[${JSON.stringify(id)}].increment()">click</button>
          </section>
        `;

      if (input?.type === "increment") state.counting += 1;
      if (input?.type === "reset") state.counting = 0;
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
