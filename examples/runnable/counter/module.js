function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const CounterComponent = {
  frontends: {},
  events: {},

  *frontend(id) {
    let state = {
      counting: 0,
    };

    const idRef = JSON.stringify(id);

    yield function mount(target = document.body, position = "beforeend") {
      const frontend = CounterComponent.frontends[id];
      target.insertAdjacentHTML(position, frontend.next().value);
    };

    yield {
      addCountingState(number) {
        const frontend = CounterComponent.frontends[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);

        if (!frontend || !el) return;

        el.outerHTML = frontend.next({
          counting: number,
        }).value;
      },

      resetCountingState() {
        const frontend = CounterComponent.frontends[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);

        if (!frontend || !el) return;

        el.outerHTML = frontend.next({
          counting: 0,
        }).value;
      },
    };

    while (true) {
      const addHandler = escapeHtmlAttr(
        `CounterComponent.events[${idRef}].addCountingState(${state.counting + 1})`
      );

      const resetHandler = escapeHtmlAttr(
        `CounterComponent.events[${idRef}].resetCountingState()`
      );

      const newState = yield `
        <div id="${escapeHtmlAttr(id)}">
          <span>${state.counting}</span>
          <button onclick="${addHandler}">click!</button>
          <button onclick="${resetHandler}">reset</button>
        </div>
      `;

      state = Object.assign(state, newState || {});
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

window.CounterComponent = CounterComponent;

const mountCounter = CounterComponent.create("counter-1");
mountCounter(document.body);
