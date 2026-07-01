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

Stateful component as `create()` + `*frontend()`:

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
      const input = yield `
        <section id="${id}">
          <span>${state.counting}</span>
          <button onclick="CounterComponent.events[${JSON.stringify(id)}].increment()">click</button>
        </section>
      `;

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
