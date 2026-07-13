# Componentes UI por generator

Todos os componentes seguem o protocolo de `module.js`:

1. `create(id)` registra `frontend(id)` em um namespace.
2. O primeiro `yield` devolve `mount`.
3. O segundo devolve handlers em `events[id]`.
4. O loop devolve uma string HTML e recebe o patch seguinte.

## Contador

```js
const mount = CounterComponent.create("counter-1");
mount(document.querySelector("#app"));
```

## Card expansível

```js
const ExpandableCard = {
  frontends: {},
  events: {},

  *frontend(id, props = {}) {
    let state = { open: false, title: props.title ?? "Detalhes" };
    const idRef = JSON.stringify(id);

    yield target => target.insertAdjacentHTML("beforeend", this.frontends[id].next().value);
    yield {
      toggle() {
        const element = document.querySelector(`#${CSS.escape(id)}`);
        element.outerHTML = ExpandableCard.frontends[id].next({ open: !state.open }).value;
      },
    };

    while (true) {
      const patch = yield `<article id="${id}">
        <button onclick="ExpandableCard.events[${idRef}].toggle()">${state.title}</button>
        ${state.open ? "<p>Conteúdo visível.</p>" : ""}
      </article>`;
      state = Object.assign(state, patch || {});
    }
  },

  create(id, props) {
    const frontend = this.frontend(id, props);
    this.frontends[id] = frontend;
    const mount = frontend.next().value;
    this.events[id] = frontend.next().value;
    return mount;
  },
};
```
