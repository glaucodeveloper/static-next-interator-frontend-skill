# Component Contract

## Sumario

- [Commit unico](#commit-unico)
- [Componente stateful](#componente-stateful)
- [Componente stateless](#componente-stateless)
- [Invariantes](#invariantes)
- [Custo da substituicao](#custo-da-substituicao)

## Commit unico

Use um unico helper de commit em todos os tipos de componente. Mantenha a criacao do DOM e a decisao de estado dentro de `next()`; use o helper apenas para conectar e publicar o novo root.

```js
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
```

Chame `connect(element)` antes de substituir o root anterior. Assim, uma falha de binding nao remove a interface ainda funcional.

## Componente stateful

Use dados declarativos no template e conecte os handlers depois de materializar o DOM. Nao gere `onclick` nem codigo JavaScript em strings.

```js
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
document.body.append(counter.next().value);
```

## Componente stateless

Mantenha o mesmo commit mesmo sem estado local. Chame esse objeto de stateless ou read-only; ele nao e uma funcao pura porque preserva `element`.

```js
function LabelComponent({ id, props = {} }) {
  return {
    id,
    element: null,

    next(input = {}) {
      const template = document.createElement("template");
      template.innerHTML = "<span></span>";

      const element = template.content.firstElementChild;
      element.id = this.id;
      element.textContent = input.text ?? props.text ?? "";

      return commitComponentElement(this, element);
    },
  };
}
```

## Invariantes

- Use `{ id, element, next }` como contrato base.
- Adicione `state` apenas a componentes stateful.
- Passe `statePatch` ou dados de renderizacao a `next()`; passe eventos a handlers.
- Crie exatamente um root novo por `next()`.
- Execute o mesmo helper de commit em componentes stateful e stateless.
- Reconecte listeners locais a cada root novo.
- Retorne sempre o root publicado em `{ value, done: false }`.

## Custo da substituicao

Considere que `replaceWith()` remove listeners do root antigo, referencias externas, foco, selecao e estado DOM nao controlado. Preserve foco ou selecao de forma explicita quando a experiencia exigir. Nao registre listeners de `window` ou `document`, timers ou subscriptions em `connect()`; se o componente possuir esses recursos, adicione `dispose()` e cancele-os antes do descarte definitivo.
