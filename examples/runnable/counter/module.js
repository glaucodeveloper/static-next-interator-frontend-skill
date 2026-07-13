function commitComponentElement(component, element) {
  if (!(element instanceof Element)) {
    throw new TypeError("next() deve produzir um Element");
  }

  element.component = component;
  component.connect?.(element);

  if (component.element?.isConnected) {
    component.element.replaceWith(element);
  }

  component.element = element;

  return {
    value: element,
    done: false,
  };
}

function CounterComponent({ id, props = {} }) {
  const initialState = {
    counting: props.counting ?? 0,
    label: props.label ?? "Contador",
  };

  return {
    id,
    state: { ...initialState },
    element: null,

    connect(element) {
      for (const control of element.querySelectorAll("[data-action]")) {
        control.addEventListener("click", this.handleAction.bind(this));
      }

      return element;
    },

    handleAction(event) {
      const control = event.currentTarget;

      switch (control.dataset.action) {
        case "add":
          return this.addCountingState(Number(control.dataset.amount));
        case "set":
          return this.setCountingState(Number(control.dataset.value));
        case "label":
          return this.changeLabel(control.dataset.label);
        case "reset":
          return this.resetState();
        default:
          throw new TypeError("Acao local desconhecida");
      }
    },

    next(statePatch = {}) {
      if (
        statePatch === null ||
        typeof statePatch !== "object" ||
        Array.isArray(statePatch)
      ) {
        throw new TypeError("CounterComponent recebeu um statePatch invalido");
      }

      const allowedKeys = new Set(["counting", "label"]);

      for (const key of Object.keys(statePatch)) {
        if (!allowedKeys.has(key)) {
          throw new TypeError(`CounterComponent.state.${key} nao existe`);
        }
      }

      const nextState = {
        ...this.state,
        ...statePatch,
      };

      if (!Number.isFinite(nextState.counting)) {
        throw new TypeError("CounterComponent.state.counting deve ser finito");
      }

      if (typeof nextState.label !== "string") {
        throw new TypeError("CounterComponent.state.label deve ser string");
      }

      Object.assign(this.state, statePatch);

      const template = document.createElement("template");
      template.innerHTML = /*html*/ `
        <section>
          <h2 data-slot="label"></h2>
          <output data-slot="counting"></output>
          <button type="button" data-action="add" data-amount="1">+1</button>
          <button type="button" data-action="add" data-amount="10">+10</button>
          <button type="button" data-action="set" data-value="100">set 100</button>
          <button type="button" data-action="label" data-label="Estado alterado">
            mudar label
          </button>
          <button type="button" data-action="reset">reset</button>
        </section>
      `.trim();

      if (template.content.childElementCount !== 1) {
        throw new TypeError("CounterComponent deve renderizar um unico root");
      }

      const element = template.content.firstElementChild;
      element.id = this.id;
      element.querySelector("[data-slot='label']").textContent = this.state.label;
      element.querySelector("[data-slot='counting']").textContent = this.state.counting;

      return commitComponentElement(this, element);
    },

    addCountingState(number) {
      return this.next({ counting: this.state.counting + number });
    },

    setCountingState(number) {
      return this.next({ counting: number });
    },

    changeLabel(label) {
      return this.next({ label });
    },

    resetState() {
      return this.next(initialState);
    },
  };
}

const counter = CounterComponent({ id: "counter-1" });
document.querySelector("#app").append(counter.next().value);

window.counter = counter;
window.CounterComponent = CounterComponent;
