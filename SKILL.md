---
name: static-next-interator-frontend
description: Use when building JavaScript frontends without frameworks where stateful components own `create()` plus `*frontend()`, functional components are iterators with `next()`, and application composition can be expressed as frontend generators.
---

# Generator Frontend Components

## Objetivo

Criar frontends JavaScript sem framework usando `*frontend` como o generator de componente stateful e de composicao da aplicacao.

A regra central:

- componentes stateful usam `create()` + `*frontend()`
- a propria `create()` do componente consome `mount` e `events`
- componentes puramente funcionais sao iterators com `next()`
- composicao de app pode ser expressa como um `AppFrontend` com `*frontend()`
- cada `yield` em `*frontend` produz uma etapa concreta de montagem, evento ou HTML

## Modelo Mental

Um componente stateful e um frontend vivo.

```js
const input = yield html;
```

Significa:

1. `yield html` envia HTML para fora.
2. O frontend pausa.
3. `.next(input)` injeta estado ou evento de volta.
4. O componente atualiza estado interno.
5. O proximo `yield` produz o proximo HTML.

## Stateful Components

Use este formato quando o componente tem estado, eventos proprios, boot steps ou sequencia interna.

```js
const CounterComponent = {
  frontends: {},
  events: {},

  *frontend(id) {
    let state = { counting: 0 };

    yield function mount(target = document.body, position = "beforeend") {
      const frontend = CounterComponent.frontends[id];
      target.insertAdjacentHTML(position, frontend.next().value);
    };

    yield {
      increment() {
        const frontend = CounterComponent.frontends[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);
        if (!frontend || !el) return;
        el.outerHTML = frontend.next({ counting: state.counting + 1 }).value;
      },
    };

    while (true) {
      const input = yield `<section id="${id}">${state.counting}</section>`;
      state = Object.assign(state, input || {});
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

`create()` pertence ao componente. Ela cria o frontend vivo, registra por `id`, consome os primeiros yields (`mount` e `events`) e retorna a funcao de montagem. Codigo externo nao deve consumir esse protocolo interno.

## Functional Components

Quando o componente nao precisa de estado nem boot steps, use um iterator simples com `next()`.

```js
const LabelComponent = ({ id, props = {} }) => ({
  next(message = {}) {
    const text = message.text ?? props.text ?? "";

    return {
      done: false,
      value: `<span id="${id}">${text}</span>`,
    };
  },
});
```

## App Frontend

A composicao do app tambem pode ser um frontend generator.

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

O `AppFrontend` decide a ordem de composicao. O driver apenas interpreta os steps.

## Driver

O driver executa steps do app. Ele pode:

- resolver root DOM
- criar interator
- chamar `component.create(id)` para stateful components
- chamar `component({ id })` para functional components
- chamar `component.frontend(id)` para frontend generators simples sem `create`
- normalizar eventos em mensagens
- chamar `.next(message)` nos iterators vivos
- aplicar HTML produzido

O driver nao deve abrir o protocolo interno de `mount` e `events` de um componente stateful. Isso e responsabilidade de `component.create(id)`.

## Regras

### Faca

- Use `create()` + `*frontend()` para componentes stateful.
- Use iterator com `next()` para componentes funcionais.
- Deixe `create()` consumir `mount` e `events`.
- Guarde frontends vivos por `id`.
- Use `frontend.next(input).value` para avancar componentes stateful.
- Use `outerHTML` quando o HTML gerado contem o elemento raiz.
- Use `insertAdjacentHTML` para montagem inicial.
- Use `JSON.stringify(id)` para `id` dentro de JavaScript inline.
- Use `escapeHtmlAttr()` em atributos HTML.
- Use `CSS.escape(id)` em selectors.

### Nao faca

- Nao deixe o driver externo consumir `mount` e `events` de stateful components.
- Nao salve a generator function como frontend vivo. Salve o iterator retornado por `frontend(...)`.
- Nao chame `.next()` na generator function bruta.
- Nao use `append(string)` esperando HTML parseado.
- Nao transforme componente local em coordenador global.

## Glossario

- `*frontend`: generator de componente ou composicao.
- `frontend`: iterator vivo retornado por `frontend(...)`.
- `create(id)`: fabrica publica de componente stateful.
- `mount`: primeiro yield interno do componente stateful.
- `events`: segundo yield interno do componente stateful.
- `FunctionalComponent`: componente puro que retorna iterator com `next()`.
- `AppFrontend`: generator de composicao do app.
- `interator`: coordenador de eventos, atomos globais e efeitos compartilhados.
