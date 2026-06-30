function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const CounterProgram = {
  events: {},

  *program(id) {
    let state = {
      counting: 0,
    };

    const idRef = JSON.stringify(id);

    yield function mount(target = document.body, position = "beforeend") {
      const program = window.counterPrograms[id];
      target.insertAdjacentHTML(position, program.next().value);
    };

    yield {
      addCountingState(number) {
        const program = window.counterPrograms[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);

        if (!program || !el) return;

        el.outerHTML = program.next({
          counting: number,
        }).value;
      },

      resetCountingState() {
        const program = window.counterPrograms[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);

        if (!program || !el) return;

        el.outerHTML = program.next({
          counting: 0,
        }).value;
      },
    };

    while (true) {
      const addHandler = escapeHtmlAttr(
        `CounterProgram.events[${idRef}].addCountingState(${state.counting + 1})`
      );

      const resetHandler = escapeHtmlAttr(
        `CounterProgram.events[${idRef}].resetCountingState()`
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
    const program = this.program(id);

    window.counterPrograms = window.counterPrograms || {};
    window.counterPrograms[id] = program;

    const mount = program.next().value;
    this.events[id] = program.next().value;

    return mount;
  },
};

window.CounterProgram = CounterProgram;

const mountCounter = CounterProgram.create("counter-1");
mountCounter(document.body);
