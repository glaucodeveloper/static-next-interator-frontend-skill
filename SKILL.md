---
name: static-next-interator-frontend
description: Use when building JavaScript frontends without frameworks where stateful components own `create()` plus `*program()`, while purely functional components are iterators with `next()`.
---

# Generator Frontend Programs

## Objetivo

Criar frontends JavaScript sem framework onde `function*` / `*program` e a forma principal de composicao da aplicacao e de fluxos vivos, e componentes puramente funcionais sao iterators com `next()`.

A regra central:

- o app inteiro e um programa generator
- componentes com estado, boot steps ou sequencia usam `create()` + `*program()`
- componentes puramente funcionais sao iterators simples com `next(message)`
- cada `yield` produz uma peca-step concreta do app ou do componente
- `.next(input)` injeta evento, estado ou resultado da etapa anterior

O runtime nao e o paradigma. O runtime apenas dirige os programas vivos.

## Modelo Mental

Um frontend e uma arvore de programas e iterators vivos.

```js
const input = yield step;
```

Significa:

1. `yield step` entrega uma peca do programa.
2. O generator pausa.
3. O driver executa ou registra essa peca.
4. `.next(input)` devolve resultado, evento ou estado para dentro do programa.
5. O proximo `yield` produz a proxima peca.

## Programas de Aplicacao

O app tambem deve ser escrito como `*program`, nao como um `bootApp` imperativo central.

```js
const TopbarProgram = {
  *program(id) {
    yield {
      type: "html",
      id,
      value: `<nav id="${id}"></nav>`,
    };
  },
};

const HomeComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<main id="${id}"></main>`,
    };
  },
});

const AppProgram = {
  *program({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };

    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarProgram };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };

    yield { type: "render", root, interator, children: [topbar, home] };
    yield { type: "wireEvents", root, interator, children: [topbar, home] };
  },
};
```

O app program decide a ordem de composicao. O driver so interpreta os steps.

## Programas de Componentes

Use `create()` + `*program` para componentes com estado interno, boot steps ou sequencia propria.

A funcao `create()` pertence ao componente. Ela cria o iterator vivo, registra por `id`, consome os primeiros yields (`mount` e `events`) e retorna a funcao de montagem. O driver externo nao deve conhecer nem consumir esse protocolo interno.

```js
const CounterProgram = {
  events: {},

  *program(id) {
    let state = { counting: 0 };

    yield function mount(target = document.body, position = "beforeend") {
      const program = window.counterPrograms[id];
      target.insertAdjacentHTML(position, program.next().value);
    };

    yield {
      increment() {
        const program = window.counterPrograms[id];
        const el = document.querySelector(`#${CSS.escape(id)}`);
        if (!program || !el) return;
        el.outerHTML = program.next({ counting: state.counting + 1 }).value;
      },
    };

    while (true) {
      const input = yield `<section id="${id}">${state.counting}</section>`;

      state = Object.assign(state, input || {});
    }
  },

  create(id) {
    const program = this.program(id);

    window.counterPrograms = window.counterPrograms || {};
    window.counterPrograms[id] = program;

    const mount = program.next().value;
    this.events[id] = program.next().value;

    return mount;
  }
};
```

## Componentes Puramente Funcionais

Quando o componente nao precisa pausar entre etapas, ele pode ser um iterator funcional com `next()`.

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

Esse formato e valido para componentes sem estado proprio e sem protocolo de montagem. O driver pode trata-lo do mesmo modo que qualquer outro componente vivo: chama `.next(input)` e consome `.value`.

## Componentes

Componentes sao programas locais de UI.

Use componentes para:

- estado local
- renderizacao local
- eventos que alteram somente a propria view
- producao de HTML completo do elemento raiz

Nao use componentes para:

- coordenar o app inteiro
- guardar rota global, sessao ou cache global
- registrar listeners globais soltos

## Interators

Interators continuam existindo, mas como peca-step produzida pelo app program.

Eles coordenam:

- event system
- roteamento
- sessao
- persistencia
- estados atomicos globais
- sincronizacao entre component programs

```js
const createInterator = ({ persist }) => {
  const atoms = {
    route: "home",
    session: null,
    selectedId: null,
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") atoms.route = message.route;
      if (message.type === "select") atoms.selectedId = message.value;
      if (message.type === "login") atoms.session = message.session;
      persist?.(atoms);
      return atoms;
    },

    getAtoms() {
      return atoms;
    },
  };
};
```

## Driver

O driver executa steps. Ele nao deve esconder a arquitetura.

Responsabilidades do driver:

- criar ou receber iterators vivos via API publica dos componentes
- resolver root DOM
- montar HTML
- aplicar `outerHTML`
- normalizar eventos em mensagens
- chamar `.next(input)` nos programas corretos
- chamar `component.create(id)` quando o componente stateful expor essa API

## Regras

### Faca

- Modele componentes com estado/sequencia como `create()` + `*program()`.
- Modele componentes puramente funcionais como iterators com `next()`.
- Trate cada `yield` como peca algoritmica concreta.
- Use driver pequeno para executar os steps.
- Deixe `create()` do componente consumir `mount` e `events` dos stateful components.
- Guarde iterators vivos por `id`.
- Use `program.next(input).value` para avancar programas.
- Use `outerHTML` quando o HTML gerado contem o elemento raiz.
- Use `insertAdjacentHTML` para montagem inicial.
- Use `JSON.stringify(id)` para `id` dentro de JavaScript inline.
- Use `escapeHtmlAttr()` em atributos HTML.
- Use `CSS.escape(id)` em selectors.

### Nao faca

- Nao coloque a composicao principal em `bootApp` imperativo quando ela pode ser um app program.
- Nao trate generator como detalhe sintatico.
- Nao salve a generator function como programa vivo. Salve o iterator retornado.
- Nao chame `.next()` na generator function bruta.
- Nao use `append(string)` esperando HTML parseado.
- Nao transforme componente local em coordenador global.

## Glossario

- `AppProgram`: generator que compoe o app inteiro.
- `ComponentProgram`: componente stateful com `create()` e `*program()`.
- `FunctionalComponent`: iterator simples com `next()` para componentes puros.
- `program`: iterator vivo retornado por `*program(...)`.
- `yield step`: saida de uma etapa concreta.
- `.next(input)`: entrada de dados, eventos ou resultado no programa.
- `driver`: executor pequeno que interpreta steps.
- `interator`: coordenador de eventos, atomos globais e efeitos compartilhados.
