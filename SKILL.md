---
name: static-next-interator-frontend
description: Use when building JavaScript frontends without frameworks where components are live iterator-like objects with `id`, `state`, `element`, and `next(newState)`, rendering DOM elements from templates and updating by replacing their own connected element.
---

# Static Next Interator Frontend

## Objetivo

Criar frontends JavaScript sem framework usando componentes vivos com `next(newState)` como operacao unica de renderizacao e atualizacao.

A regra central:

- componentes sao objetos vivos com `id`, `state`, `element` e `next(newState)`
- `next()` sempre retorna `{ value: Element, done: false }`
- `next(newState)` mescla estado novo em `this.state`
- o componente renderiza DOM real a partir de `<template>`
- quando `this.element` ja esta conectado, o novo elemento substitui o antigo com `replaceWith`
- cada elemento raiz recebe `element.component = this`
- handlers inline chamam metodos pelo proprio elemento: `document.getElementById(id).component.metodo(...)`
- composicao de app ainda pode usar `AppFrontend` com `*frontend()` para ordenar criacao, render e wiring

## Modelo Mental

Um componente e um objeto com estado e identidade DOM.

```js
component.next({ counting: 1 }).value;
```

Significa:

1. O estado recebido e mesclado em `component.state`.
2. Um novo DOM raiz e criado via `<template>`.
3. O novo DOM recebe `element.component = component`.
4. Se o elemento anterior esta conectado, ele e substituido.
5. O `Element` atual e retornado em `{ value, done: false }`.

## Stateful Components

Use este formato quando o componente tem estado local e acoes proprias.

```js
function CounterComponent(id) {
  const title = "Contador";

  const actions = [
    { text: "+1", call: "addCountingState(1)" },
    { text: "+10", call: "addCountingState(10)" },
    { text: "set 100", call: "setCountingState(100)" },
    { text: "mudar label", call: "changeLabel('Estado alterado')" },
    { text: "reset", call: "resetState()" },
  ];

  const actionButtons = () =>
    actions
      .map(
        (action) => /*html*/ `
          <button onclick="document.getElementById('${id}').component.${action.call}">
            ${action.text}
          </button>
        `
      )
      .join("");

  return {
    id,

    state: {
      counting: 0,
      label: title,
    },

    element: null,

    next(newState = {}) {
      Object.assign(this.state, newState);

      const template = document.createElement("template");

      template.innerHTML = /*html*/ `
        <div id="${this.id}">
          <h2>${this.state.label}</h2>
          <span>${this.state.counting}</span>
          ${actionButtons()}
        </div>
      `.trim();

      this.element = ((element) =>
        this.element?.isConnected
          ? (
              this.element.replaceWith(
                (element.component = this, element)
              ),
              element
            )
          : (
              element.component = this,
              element
            )
      )(template.content.children[0]);

      return {
        value: this.element,
        done: false,
      };
    },

    addCountingState(number) {
      return this.next({
        counting: this.state.counting + number,
      });
    },

    setCountingState(number) {
      return this.next({
        counting: number,
      });
    },

    changeLabel(label) {
      return this.next({
        label,
      });
    },

    resetState() {
      return this.next({
        counting: 0,
        label: title,
      });
    },
  };
}
```

Montagem:

```js
document.body.append(
  CounterComponent("counter-1").next().value
);
```

## Functional Components

Quando o componente nao precisa de estado mutavel nem metodos de acao, mantenha o mesmo contrato de iterator e retorne DOM real.

```js
const LabelComponent = ({ id, props = {} }) => ({
  id,
  element: null,

  next(message = {}) {
    const text = message.text ?? props.text ?? "";
    const template = document.createElement("template");

    template.innerHTML = `<span id="${id}">${text}</span>`;
    this.element = template.content.children[0];
    this.element.component = this;

    return {
      done: false,
      value: this.element,
    };
  },
});
```

## App Frontend

A composicao do app pode continuar como um frontend generator. O generator descreve a ordem; componentes continuam sendo objetos com `next()`.

```js
const AppFrontend = {
  *frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarComponent };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };

    yield { type: "render", root, interator, children: { topbar, home } };
    yield { type: "wireEvents", root, interator, children: { topbar, home } };
  },
};
```

## Driver

O driver executa steps do app. Ele pode:

- resolver root DOM
- criar interator
- criar componentes chamando `component(id)` ou `component({ id })`
- normalizar eventos em mensagens
- chamar `.next(message)` nos componentes vivos
- anexar ou substituir `Element` retornado em `.value`

O driver nao deve recriar o protocolo interno do componente. O componente sabe renderizar, atualizar e substituir seu proprio elemento.

## Runtime Type Contracts

Quando o frontend precisar de "type definitions" em JS puro, use contratos de runtime em vez de `.d.ts`.

- Defina schemas como objetos de validadores.
- Crie modelos com prototype + proxy.
- Valide dados no construtor e em toda atribuição.
- Rejeite propriedades fora do schema.
- Use métodos compartilhados no prototype para comportamento de domínio.

Leia `references/runtime-types.md` quando o projeto precisar de modelos, componentes, mensagens, eventos, rotas ou entidades com contrato verificável em runtime.

## Regras

### Faca

- Use objetos vivos com `id`, `state`, `element` e `next(newState)`.
- Retorne sempre `{ value: this.element, done: false }`.
- Use `<template>` para transformar HTML em DOM.
- Atribua `element.component = this` no elemento raiz renderizado.
- Use `this.element.replaceWith(newElement)` quando o elemento anterior esta conectado.
- Deixe metodos de acao chamarem `this.next(...)`.
- Use `document.getElementById(id).component.metodo(...)` em handlers inline pequenos.
- Use `append(component.next().value)` para montagem inicial.
- Use `JSON.stringify(id)` ao interpolar `id` em JavaScript inline dinamico.
- Use `escapeHtmlAttr()` em atributos HTML quando valores vierem de dados externos.
- Use `CSS.escape(id)` quando precisar montar selectors.

### Nao faca

- Nao use `create()` + boot yields para componentes stateful novos.
- Nao use `outerHTML` como mecanismo padrao de update.
- Nao retorne string HTML de componentes que serao montados no DOM.
- Nao use `append(string)` esperando HTML parseado.
- Nao deixe o driver manipular estado interno de componente local.
- Nao transforme componente local em coordenador global.

## Glossario

- `component`: objeto vivo que possui estado, elemento atual e `next()`.
- `next(newState)`: renderiza o componente e aplica estado incremental.
- `state`: estado local do componente.
- `element`: ultimo elemento raiz renderizado.
- `element.component`: referencia do DOM para o objeto vivo.
- `FunctionalComponent`: componente sem estado mutavel que ainda retorna `{ value: Element, done: false }`.
- `AppFrontend`: generator de composicao do app.
- `interator`: coordenador de eventos, atomos globais e efeitos compartilhados.
