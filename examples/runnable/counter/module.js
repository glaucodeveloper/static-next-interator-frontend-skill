const CounterComponent = {
  frontends: {},
  events: {},

  mount(id, target = document.body) {
    this.frontends[id] = { state: { counting: 0 }, element: null };
    this.events[id] = {
      add: amount => this.update(id, {
        counting: this.frontends[id].state.counting + amount,
      }),
      reset: () => this.update(id, { counting: 0 }),
    };
    target.insertAdjacentHTML("beforeend", this.template(id));
    this.frontends[id].element = document.querySelector(`#${CSS.escape(id)}`);
  },

  template(id) {
    const { counting } = this.frontends[id].state;
    const idRef = escapeHtmlAttr(JSON.stringify(id));
    return `<section id="${escapeHtmlAttr(id)}">
      <h2>Contador</h2>
      <output>${counting}</output>
      <button onclick="CounterComponent.events[${idRef}].add(1)">+1</button>
      <button onclick="CounterComponent.events[${idRef}].add(10)">+10</button>
      <button onclick="CounterComponent.events[${idRef}].reset()">reset</button>
    </section>`;
  },

  update(id, patch = {}) {
    const frontend = this.frontends[id];
    if (!frontend) throw new TypeError(`frontend desconhecido: ${id}`);
    if (Object.keys(patch).some(key => key !== "counting")) {
      throw new TypeError("patch desconhecido");
    }
    if (!Number.isFinite(patch.counting ?? frontend.state.counting)) {
      throw new TypeError("counting deve ser finito");
    }
    Object.assign(frontend.state, patch);
    frontend.element.outerHTML = this.template(id);
    frontend.element = document.querySelector(`#${CSS.escape(id)}`);
    return frontend.element;
  },
};

window.CounterComponent = CounterComponent;
CounterComponent.mount("counter-1", document.querySelector("#app"));

function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
