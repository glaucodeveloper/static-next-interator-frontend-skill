# Component Contract

## Stateful Component

```js
const CounterComponent = {
  frontends: {},
  events: {},

  *frontend(id) {
    let state = { counting: 0 };

    yield function mount(target = document.body, position = "beforeend") {
      const frontend = CounterComponent.frontends[id];
      target.insertAdjacentHTML(position, frontend.next().value);
    };

    yield {
      increment() {
        const frontend = CounterComponent.frontends[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);
        if (!frontend || !el) return;
        el.outerHTML = frontend.next({ counting: state.counting + 1 }).value;
      },
    };

    while (true) {
      const input = yield `<section id="${id}">${state.counting}</section>`;
      state = Object.assign(state, input || {});
    }
  },

  create(id) {
    const frontend = this.frontend(id);

    this.frontends[id] = frontend;

    const mount = frontend.next().value;
    this.events[id] = frontend.next().value;

    return mount;
  },
};
```

Rules:

- `create(id)` creates and stores the live frontend iterator.
- `create(id)` consumes the component boot yields: first `mount`, then `events`.
- External app drivers should not manually consume a component's internal mount/events protocol.
- Local state stays inside `*frontend`.
- Generated HTML should include the root element when updates use `outerHTML`.

## Functional Component

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
