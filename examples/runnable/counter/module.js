window.CounterComponents = window.CounterComponents || {};

const CounterComponent = {
  frontends: window.CounterComponents,
  events: {},

  *frontend(id) {
    let state = { counting: 0 };
    const idRef = JSON.stringify(id);

    yield function mount(target = document.body, position = "beforeend") {
      target.insertAdjacentHTML(position, CounterComponent.frontends[id].next().value);
    };

    yield {
      addCountingState(number) {
        const frontend = CounterComponent.frontends[id];
        const element = document.querySelector(`#${CSS.escape(id)}`);
        if (!frontend || !element) return;
        element.outerHTML = frontend.next({ counting: number }).value;
      },
      resetCountingState() {
        const frontend = CounterComponent.frontends[id];
        const element = document.querySelector(`#${CSS.escape(id)}`);
        if (!frontend || !element) return;
        element.outerHTML = frontend.next({ counting: 0 }).value;
      },
    };

    while (true) {
      const newState = yield `
        <section id="${escapeHtmlAttr(id)}">
          <h2>Contador</h2>
          <output>${state.counting}</output>
          <button onclick="${escapeHtmlAttr(`CounterComponent.events[${idRef}].addCountingState(${state.counting + 1})`)}">+1</button>
          <button onclick="${escapeHtmlAttr(`CounterComponent.events[${idRef}].resetCountingState()`)}">reset</button>
        </section>`;
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
CounterComponent.create("counter-1")(document.querySelector("#app"));

function escapeHtmlAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#39;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
