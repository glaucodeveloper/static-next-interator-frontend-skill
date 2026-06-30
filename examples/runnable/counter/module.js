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

    yield {
      type: "mount",
      id,
      mount(target = document.body, position = "beforeend") {
        const program = window.counterPrograms[id];
        target.insertAdjacentHTML(position, program.next().value.value);
      },
    };

    yield {
      type: "events",
      id,
      events: {
        addCountingState(number) {
          const program = window.counterPrograms[id];
          const el = document.querySelector(`#${CSS.escape(id)}`);

          if (!program || !el) return;

          el.outerHTML = program.next({
            counting: number,
          }).value.value;
        },

        resetCountingState() {
          const program = window.counterPrograms[id];
          const el = document.querySelector(`#${CSS.escape(id)}`);

          if (!program || !el) return;

          el.outerHTML = program.next({
            counting: 0,
          }).value.value;
        },
      },
    };

    while (true) {
      const addHandler = escapeHtmlAttr(
        `CounterProgram.events[${idRef}].addCountingState(${state.counting + 1})`
      );

      const resetHandler = escapeHtmlAttr(
        `CounterProgram.events[${idRef}].resetCountingState()`
      );

      const newState = yield {
        type: "html",
        id,
        value: `
          <div id="${escapeHtmlAttr(id)}">
            <span>${state.counting}</span>
            <button onclick="${addHandler}">click!</button>
            <button onclick="${resetHandler}">reset</button>
          </div>
        `,
      };

      state = Object.assign(state, newState || {});
    }
  },
};

function runComponent(componentProgram, id, target = document.body) {
  const program = componentProgram.program(id);

  window.counterPrograms = window.counterPrograms || {};
  window.counterPrograms[id] = program;

  const mountStep = program.next().value;
  const eventsStep = program.next().value;

  componentProgram.events[id] = eventsStep.events;
  mountStep.mount(target);

  return program;
}

window.CounterProgram = CounterProgram;
runComponent(CounterProgram, "counter-1");
