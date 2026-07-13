# Anatomia completa de um componente generator

## Sumário

1. Binder mínimo
2. Generator completo
3. Sequência de execução
4. Por que o patch aparece depois do `yield`
5. Identidade e substituição do root
6. Inspiração em Effect/Effect-TS

## 1. Binder mínimo

O generator precisa de um contexto de instância para que `this` seja estável. O binder cria esse contexto, inicia o generator com `Function.prototype.call()` e expõe seus métodos nativos.

```js
function component(Component, props) {
  const context = {};
  const iterator = Component.call(context, props);

  context.next = iterator.next.bind(iterator);
  context.return = iterator.return.bind(iterator);
  context.throw = iterator.throw.bind(iterator);

  return context;
}
```

O binder não guarda estado, não renderiza e não interpreta eventos. Toda a anatomia continua dentro da única `function*` do componente.

## 2. Generator completo

```js
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

  this.setCounting = counting => this.next({ counting });
  this.rename = label => this.next({ label });
  this.reset = () => this.next(initialState);

  while (true) {
    const template = document.createElement("template");

    template.innerHTML = /* html */ `
      <section>
        <p data-slot="label"></p>
        <output data-slot="counting"></output>
        <button onclick="document.getElementById('${id}').component.increment(1)">+1</button>
        <button onclick="document.getElementById('${id}').component.increment(10)">+10</button>
        <button onclick="document.getElementById('${id}').component.reset()">reset</button>
      </section>
    `.trim();

    if (template.content.childElementCount !== 1) {
      throw new TypeError("CounterComponent deve produzir um único root");
    }

    Object.assign(
      this.state,
      yield (this.element = ((element) => {
        if (!(element instanceof HTMLElement)) {
          throw new TypeError("CounterComponent deve produzir HTMLElement");
        }

        element.id = this.id;
        element.querySelector("[data-slot='label']").textContent = this.state.label;
        element.querySelector("[data-slot='counting']").textContent = this.state.counting;
        element.component = this;

        if (this.element?.isConnected) {
          this.element.replaceWith(element);
        }

        return element;
      })(template.content.firstElementChild)),
    );
  }
}
```

## 3. Sequência de execução

1. `component(CounterComponent, props)` cria `context` e o iterator nativo.
2. `context.next()` inicia o corpo da `function*`.
3. O generator inicializa `this.state`, `this.element` e os métodos públicos.
4. `<template>` parseia o markup em um `DocumentFragment` em `template.content`.
5. O único `HTMLElement` é extraído do fragmento.
6. O root recebe `id` e `element.component = this`.
7. Na primeira renderização não há root conectado para substituir.
8. `yield element` devolve `{ value: element, done: false }`.
9. O chamador anexa `value` ao DOM.
10. Um handler recupera a instância pelo id e chama, por exemplo, `component.increment(1)`.
11. O método calcula um patch e chama `this.next(patch)`.
12. O patch se torna o resultado da expressão `yield (...)` suspensa.
13. A chamada externa de `Object.assign(this.state, ...)` recebe esse patch e o mescla automaticamente.
14. A próxima volta cria outro fragmento e outro root.
15. O root conectado é substituído, `this.element` é atualizado e o novo root é entregue pelo próximo `yield`.

## 4. A direção dupla do `yield`

```text
Object.assign(
  this.state,
  yield (this.element = buildCurrentElement()),
);
```

Essa única linha possui duas direções:

- Saída: `yield element` entrega o `HTMLElement` ao chamador de `next()`.
- Entrada: o argumento da chamada seguinte, `next(patch)`, vira o valor da expressão suspensa e é entregue diretamente ao `Object.assign`.

Por isso o `yield` é a fronteira do auto-state: entrega o `HTMLElement` atual e recebe o patch que o `Object.assign` aplica antes da próxima volta do loop.

## 5. Identidade do root

`element.component = this` transforma o root em ponte para a instância viva. Como cada render cria outro elemento, a referência deve ser reaplicada antes de `replaceWith()`. O handler sempre consulta `document.getElementById(id)` e, portanto, encontra o root atual, nunca o anterior desconectado.

## 6. Inspiração em Effect/Effect-TS

A influência é a separação entre descrição e execução de um programa: a `function*` descreve um ciclo suspensível e o binder o interpreta por meio de `next`, `throw` e `return`. O valor entregue pelo generator é explícito, assim como o valor usado para retomá-lo.

Static Next especializa essa ideia para componentes DOM:

- o programa é o ciclo de renderização do componente;
- o valor produzido é um `HTMLElement`;
- o valor de retomada é um `StatePatch`;
- o contexto `this` é a instância viva;
- o root atual é a superfície pública que aponta para essa instância.

Não importe Effect para implementar esse contrato. A referência é filosófica; o runtime do componente permanece JavaScript e DOM nativos.
