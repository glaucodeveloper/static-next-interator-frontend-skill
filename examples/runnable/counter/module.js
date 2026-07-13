function component(Component, props) {
  const context = {};
  const iterator = Component.call(context, props);

  context.next = iterator.next.bind(iterator);
  context.return = iterator.return.bind(iterator);
  context.throw = iterator.throw.bind(iterator);

  return context;
}

function* CounterComponent({ id, props = {} }) {
  if (!id) throw new TypeError("CounterComponent requer id");

  const initialState = {
    counting: props.counting ?? 0,
    label: props.label ?? "Contador",
  };

  this.id = id;
  this.state = { ...initialState };
  this.element = null;

  this.increment = amount => this.next({
    counting: this.state.counting + amount,
  });
  this.decrement = amount => this.next({
    counting: this.state.counting - amount,
  });
  this.reset = () => this.next(initialState);

  while (true) {
    const idArgument = JSON.stringify(this.id);

    Object.assign(
      this.state,
      yield (this.element = ((element) => {
        element.id = this.id;
        element.querySelector("[data-slot='label']").textContent = this.state.label;
        element.querySelector("[data-slot='counting']").textContent = this.state.counting;
        element.component = this;

        if (this.element?.isConnected) this.element.replaceWith(element);
        return element;
      })(Object.assign(document.createElement("template"), {
        innerHTML: /* html */ `
          <section>
            <h2 data-slot="label"></h2>
            <output data-slot="counting"></output>
            <p>
              <button type="button" onclick="document.getElementById(${escapeHtmlAttr(idArgument)}).component.decrement(1)">−1</button>
              <button type="button" onclick="document.getElementById(${escapeHtmlAttr(idArgument)}).component.increment(1)">+1</button>
              <button type="button" onclick="document.getElementById(${escapeHtmlAttr(idArgument)}).component.increment(10)">+10</button>
              <button type="button" onclick="document.getElementById(${escapeHtmlAttr(idArgument)}).component.reset()">reset</button>
            </p>
          </section>
        `.trim(),
      }).content.firstElementChild)),
    );
  }
}

function validateCounterPatch(patch) {
  if (patch === undefined) return;
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    throw new TypeError("patch deve ser um objeto");
  }
  if (Object.keys(patch).some(key => !["counting", "label"].includes(key))) {
    throw new TypeError("campo de estado desconhecido");
  }
  if ("counting" in patch && !Number.isFinite(patch.counting)) {
    throw new TypeError("counting deve ser finito");
  }
  if ("label" in patch && typeof patch.label !== "string") {
    throw new TypeError("label deve ser string");
  }
}

function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const counter = component(CounterComponent, {
  id: "counter-1",
  props: { counting: 0 },
});

document.querySelector("#app").append(counter.next().value);
