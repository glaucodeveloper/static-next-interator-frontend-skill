# Anatomia do componente generator

Este é o contrato canônico. Use-o como um componente React-like sem framework: estado fechado no generator, template como render e patch como próxima entrada.

```js
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
        if (frontend && element) element.outerHTML = frontend.next({ counting: number }).value;
      },
    };

    while (true) {
      const patch = yield `<div id="${id}">
        <output>${state.counting}</output>
        <button onclick="CounterComponent.events[${idRef}].addCountingState(${state.counting + 1})">+1</button>
      </div>`;
      state = Object.assign(state, patch || {});
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

## Leitura por etapas

1. `frontends[id]` guarda a instância persistente do generator.
2. `events[id]` contém handlers seguros para o id daquela instância.
3. `state` fica fechado dentro de `*frontend(id)`.
4. O primeiro `yield` entrega uma função `mount`.
5. O segundo `yield` entrega handlers que avançam o generator.
6. Cada volta do loop devolve um template HTML com o estado atual.
7. `frontend.next(patch)` pausa no próximo `yield` e injeta o patch em `patch`.
8. `Object.assign` transforma o patch no próximo estado.
9. O handler troca somente o elemento atual com `outerHTML` e a string produzida pelo generator.
