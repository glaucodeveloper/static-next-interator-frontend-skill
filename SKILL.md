---
name: static-next-interator-frontend
description: Use when building or maintaining JavaScript frontends without frameworks using local UI components, interators for event and global coordination, and generators as explicit program-production steps.
---

# SKILL.md - Generator Frontend Components

## Objetivo

Criar frontends JavaScript sem framework com uma arquitetura explicita de tres camadas:

- componentes para estado local e renderizacao de UI
- interators para event system, estados atomicos globais e coordenacao entre partes
- generators para producao passo a passo do programa frontend

A arquitetura deve permitir:

- componentes declarados como objetos JS ou factories pequenas
- estado interno fechado no escopo local do componente
- `function* program(id)` como forma de producao do runtime do componente ou do app
- `yield` como emissao de uma peca-step concreta do programa
- multiplas instancias por `id`
- runtime central para composicao e rerender
- nenhuma dependencia de React, Vue, Svelte, Redux ou bundler

---

## Modelo mental

Um componente nao e o app inteiro. Um componente e uma unidade local de decisao de UI.

Um interator nao renderiza HTML. Um interator coordena sistema.

Um generator nao existe aqui apenas como detalhe de controle de fluxo. Ele existe como forma de producao do programa.

```js
const input = yield step;
```

Significa:

1. `yield step` emite uma peca concreta do programa.
2. O generator pausa com um estado de montagem previsivel.
3. `.next(input)` injeta a entrada seguinte.
4. O runtime continua a construcao ou a atualizacao.
5. O proximo `yield` entrega a proxima peca-step.

A ideia principal e separar tres responsabilidades:

- componente decide UI local
- interator decide eventos e globais
- generator decide sequencia de producao

---

## Determinacao de componentes

Use a compreensao do estilo `labbing` como referencia de forma:

- componente pequeno
- estado privado
- renderizacao explicita
- sem lifecycle de framework
- sem singleton global escondido para logica de view

Regra pratica:

- se algo altera apenas uma view, fica no componente
- se algo afeta varias views, eventos compartilhados, navegacao ou estado atomico, sobe para interator
- se algo representa a ordem de construcao do frontend, modela em generator

Exemplo de componente local:

```js
const CounterComponent = {
  create({ id, props = {} }) {
    let state = { counting: props.initialCount ?? 0 };

    return {
      next(message = {}) {
        if (message.type === "increment") state.counting += 1;
        if (message.type === "reset") state.counting = 0;

        return {
          done: false,
          value: `
            <section id="${id}">
              <span>${state.counting}</span>
              <button data-cid="${id}" data-message="increment">click</button>
            </section>
          `,
        };
      },
    };
  },
};
```

O componente acima nao conhece roteamento global, sessao, cache nem event bus. Isso e intencional.

---

## Interators

Interators sao a camada de coordenacao do frontend.

Eles devem concentrar:

- event system
- roteamento
- sessao
- persistencia
- estados atomicos globais
- sincronizacao entre componentes

Estados atomicos globais sao verdades pequenas e compartilhadas, por exemplo:

- rota atual
- usuario autenticado
- item selecionado
- filtros ativos
- dirty flag
- cache de consulta

Shape sugerido:

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

Regra estrutural:

- componente nao vira fonte de verdade global
- interator nao vira gerador de markup
- boot/runtime continua sendo a espinha de orquestracao

---

## Programas como `function*`

Use `function*` quando a producao do programa precisar ser visivel, deterministica e algoritmica.

Cada `yield` deve representar uma peca-step real do programa. Nao apenas um retorno intermediario arbitrario.

Passos comuns:

- resolver root DOM
- criar interator
- registrar componentes
- ligar delegacao de eventos
- hidratar estado global
- montar primeira renderizacao

Exemplo de gerador de app:

```js
function* buildFrontendProgram({ rootSelector }) {
  const root = yield { type: "resolveRoot", rootSelector };
  const interator = yield { type: "createInterator" };
  yield { type: "registerComponent", id: "topbar" };
  yield { type: "registerComponent", id: "home" };
  yield { type: "wireEvents", root, interator };
  return { type: "ready", root, interator };
}
```

Esse modelo e melhor quando o frontend precisa ser lido como construcao incremental, quase como uma DSL executavel.

---

## Generator de componente

Se quiser um componente como programa vivo, use esta leitura correta:

- o generator mantem estado local do componente
- o generator pode emitir boot steps e depois snapshots HTML
- eventos compartilhados nao devem morar exclusivamente dentro dele

Shape sugerido:

```js
const NameComponent = {
  *program({ id, props = {} }) {
    let state = { value: props.initialValue ?? 0 };

    yield { type: "mount" };
    yield { type: "bind" };

    while (true) {
      const input = yield {
        type: "html",
        value: `<section id="${id}">${state.value}</section>`,
      };

      if (input?.type === "increment") state.value += 1;
      if (input?.type === "reset") state.value = 0;
    }
  },
};
```

Ponto importante:

- `yield` aqui deve representar uma etapa clara do programa do componente
- nao use isso para misturar evento global, sessao global e render local no mesmo bloco sem separacao

---

## Event system

Prefira eventos delegados e serializados por atributos sem acoplar a semantica ao DOM bruto.

Atributos recomendados:

- `data-cid`
- `data-message`
- `data-route`
- `data-value`
- `data-name`

Shape de mensagem sugerido:

```js
{
  ...target.dataset,
  type: target.dataset.message,
  value: target.dataset.value ?? target.value,
  checked: target.checked,
  target,
  event,
}
```

O fluxo recomendado e:

1. DOM gera interacao.
2. runtime ou interator normaliza para mensagem.
3. interator decide se ha impacto global.
4. componente recebe apenas a parte local que lhe cabe.
5. runtime rerenderiza.

Evite nomes acoplados ao gesto DOM como `onClickCard`. Prefira nomes de intencao como `navigate`, `toggleFavorite`, `saveDraft`, `syncGlobal`.

---

## Bootapp

O bootapp continua sendo a espinha de montagem.

Responsabilidades:

- criar componentes
- registrar instancias por `id`
- criar interator
- centralizar render
- delegar eventos
- aplicar rerender depois de transicoes

Shape sugerido:

```js
const bootApp = ({ rootSelector = "#app" } = {}) => {
  const root = document.querySelector(rootSelector);
  const components = new Map();
  const interator = createInterator({
    persist(atoms) {
      localStorage.setItem("app-atoms", JSON.stringify(atoms));
    },
  });

  const add = (id, factory, props = {}) => {
    const instance = factory.create
      ? factory.create({ id, props, interator })
      : factory({ id, props, interator });

    components.set(id, instance);
    return instance;
  };

  const render = () => {
    root.innerHTML = `
      ${components.get("topbar").next().value}
      <main>${components.get(interator.getAtoms().route).next().value}</main>
    `;
  };

  const dispatch = (target, event) => {
    const message = {
      ...target.dataset,
      type: target.dataset.message,
      value: target.dataset.value ?? target.value,
      target,
      event,
    };

    interator.dispatch(message);

    const component = components.get(target.dataset.cid);
    if (component) component.next(message);

    render();
  };

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-cid][data-message]");
    if (actionTarget) dispatch(actionTarget, event);
  });

  return { add, render, interator };
};
```

---

## Regras de geracao

### Faca

- Use componentes pequenos e locais.
- Use interators para event system e estados atomicos globais.
- Use `function*` quando a construcao do programa precisar ser uma sequencia explicita de steps.
- Faca cada `yield` representar uma peca algoritmica concreta.
- Injete dependencias compartilhadas por `props` ou pelo runtime.
- Re-renderize a partir do boot/runtime apos transicoes.
- Trate `id` como chave de instancia e nao como acoplamento semantico.

### Nao faca

- Nao transforme um componente local em coordenador global.
- Nao jogue sessao, rota e cache dentro de um componente qualquer.
- Nao use generator apenas por exotismo sintatico.
- Nao esconda transicoes importantes fora do runtime.
- Nao misture markup, persistencia e protocolo global no mesmo trecho sem separacao.
- Nao replique padroes de lifecycle de framework dentro de JS simples.

---

## Quando usar esta arquitetura

Use para:

- prototipos sem framework
- micro-SPAs
- interfaces experimentais
- apps locais
- frontends com DSL propria
- geracao de componentes por LLM/Codex
- apps onde o fluxo de producao do programa precisa ficar explicito

Evite para:

- apps grandes com lifecycle muito complexo
- interfaces altamente reativas com grande volume de inputs controlados
- cenarios criticos com HTML externo sem sanitizacao robusta
- sistemas que exigem ecossistema maduro de componentes prontos e integracoes profundas

---

## Glossario

- `component`: unidade local de UI
- `interator`: coordenador de eventos, atomos globais e efeitos compartilhados
- `bootApp`: runtime central de composicao e renderizacao
- `function*`: forma de expressar a producao incremental do programa
- `yield`: emissao de uma peca-step do programa
- `.next(input)`: injecao da entrada seguinte no fluxo do generator
- `atoms`: estados globais pequenos e compartilhados
- `message`: intencao serializada derivada do DOM ou do runtime
