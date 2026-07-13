---
name: static-next-interator-frontend-skill
description: Build, migrate, refactor, or review framework-free vanilla JavaScript frontends that use live nextable components with DOM identity, state patches, template-created elements, bound local handlers, self-owned root replacement, direct frontend generators, Interator coordination, and runtime contracts. Use when implementing or auditing this paradigm, especially component lifecycle, event ownership, routing composition, or runnable examples.
---

# Static Next Interator Frontend

Leia primeiro [references/component-anatomy.md](references/component-anatomy.md). Ele é o contrato canônico do generator, da montagem, dos eventos, do template e do auto-update.

## Aplique o contrato central

Modele cada instancia como um componente vivo e nextable, nao como um iterator ECMAScript completo.

- Exponha `id`, `element` e `next(input)` no contrato base.
- Adicione `state` somente a componentes stateful.
- Reserve `next(statePatch)` para patches de estado ou dados de renderizacao.
- Encaminhe mensagens DOM para handlers ou para o Interator; nunca mescle um `Event` bruto em `state`.
- Crie um novo elemento raiz a cada `next()` usando `<template>`.
- Atribua `element.component = this` ao novo elemento.
- Conecte handlers locais ao novo elemento antes do commit.
- Substitua `this.element` com `replaceWith()` quando o root anterior estiver conectado.
- Atualize `this.element` e retorne `{ value: element, done: false }`.

Trate `{ value, done: false }` como o protocolo nextable da skill. Nao prometa interoperabilidade com `Iterator` sem tambem implementar `[Symbol.iterator]`, `return()` e termino.

## Implemente o ciclo de um componente

Padronize factories como `Component({ id, props, interator })`, mesmo quando algum argumento nao for usado.

```js
function TextComponent({ id, props = {} }) {
  return {
    id,
    state: {
      text: props.text ?? "",
    },
    element: null,

    connect(element) {
      element
        .querySelector("[data-action='clear']")
        .addEventListener("click", this.handleClear.bind(this));

      return element;
    },

    handleClear() {
      return this.next({ text: "" });
    },

    next(statePatch = {}) {
      if (
        statePatch === null ||
        typeof statePatch !== "object" ||
        Array.isArray(statePatch) ||
        Object.keys(statePatch).some(key => key !== "text")
      ) {
        throw new TypeError("TextComponent recebeu um statePatch invalido");
      }

      if (
        Object.hasOwn(statePatch, "text") &&
        typeof statePatch.text !== "string"
      ) {
        throw new TypeError("TextComponent.state.text deve ser string");
      }

      Object.assign(this.state, statePatch);

      const template = document.createElement("template");
      template.innerHTML = /*html*/ `
        <section>
          <span data-slot="text"></span>
          <button type="button" data-action="clear">limpar</button>
        </section>
      `.trim();

      if (template.content.childElementCount !== 1) {
        throw new TypeError("TextComponent deve renderizar um unico elemento raiz");
      }

      const element = template.content.firstElementChild;
      element.id = this.id;
      element.querySelector("[data-slot='text']").textContent = this.state.text;
      element.component = this;
      this.connect(element);

      if (this.element?.isConnected) {
        this.element.replaceWith(element);
      }

      this.element = element;

      return {
        value: element,
        done: false,
      };
    },
  };
}
```

Monte a primeira renderizacao uma unica vez:

```js
const text = TextComponent({
  id: "greeting",
  props: { text: "Ola" },
});

document.querySelector("#app").append(text.next().value);
```

Leia [references/component-contract.md](references/component-contract.md) antes de implementar componentes stateful ou stateless completos.

## Separe eventos locais de eventos globais

Conecte uma acao local no `connect(element)` do componente quando ela alterar apenas seu estado.

- Use `addEventListener(type, handler.bind(this))`.
- Use `event.currentTarget` para ler dados do controle que recebeu o listener.
- Execute `connect(element)` em cada novo root, pois `replaceWith()` remove o root e seus listeners anteriores.
- Mantenha listeners de `document`, `window`, timers e subscriptions fora do ciclo de renderizacao e implemente teardown explicito para eles.

Delegue no root do app somente mensagens globais, como rota, sessao ou sincronizacao. Normalize a mensagem, envie-a ao Interator e renderize apenas a regiao afetada. Nao chame `component.next(message)` com o objeto DOM bruto.

Leia [references/events.md](references/events.md) para escolher o protocolo local ou global.

## Componha o app sem tomar o ciclo dos componentes

Use uma funcao geradora `frontend()` apenas para ordenar montagem e wiring:

```js
function* frontend({ rootSelector = "#app" } = {}) {
  const root = yield { type: "resolveRoot", rootSelector };
  const interator = yield { type: "createInterator" };
  const topbar = yield {
    type: "createComponent",
    id: "topbar",
    component: TopbarComponent,
  };
  const home = yield {
    type: "createComponent",
    id: "home",
    component: HomeComponent,
  };

  yield { type: "mount", root, interator, children: { topbar, home } };
  yield { type: "wireEvents", root, interator, children: { topbar, home } };
}
```

Faca o driver:

- criar componentes com `component({ id, props, interator })`;
- montar cada resultado inicial uma unica vez;
- delegar mensagens globais ao Interator;
- passar aos componentes apenas patches ou dados derivados;
- atualizar somente o outlet ou componente afetado.

Nao faca o driver renderizar um componente antes de reconstruir o app inteiro. Leia [references/program-generation.md](references/program-generation.md) para o contrato de steps e [references/interactors.md](references/interactors.md) para ownership global.

## Trate templates e dados com seguranca

- Mantenha o HTML do template estatico sempre que possivel.
- Aplique texto dinamico com `textContent`.
- Aplique `id`, `value`, URLs e outros atributos por propriedades DOM ou `setAttribute()` apos validar o valor.
- Exija exatamente um elemento raiz por renderizacao.
- Nao gere codigo em `onclick` nem use strings de metodo vindas de dados externos.
- Nao considere `JSON.stringify()` um escape de HTML.
- Use escaping contextual somente quando a interpolacao em HTML for inevitavel.

## Use contratos de runtime como complemento

Use schemas de runtime para validar entradas e mutacoes em JavaScript puro. Mantenha JSDoc, `checkJs`, TypeScript ou `.d.ts` quando o projeto tambem precisar de verificacao estatica; uma abordagem nao substitui automaticamente a outra.

Leia [references/runtime-types.md](references/runtime-types.md) ao definir componentes, mensagens, steps, rotas ou entidades verificaveis em runtime.

## Verifique a implementacao

- Confirme que o segundo `next()` remove o root anterior e preserva `element.component`.
- Confirme que handlers continuam ativos depois de uma substituicao.
- Confirme que mensagens DOM nao aparecem no estado local.
- Confirme que uma acao produz somente uma renderizacao do componente ou outlet afetado.
- Teste texto e IDs hostis para detectar interpolacao insegura.
- Valide sintaxe dos exemplos e execute os fluxos runnable em navegador real.
- Execute `node scripts/validate.mjs` antes de publicar a skill.

Use [examples/component-generators.md](examples/component-generators.md) para criar componentes UI por generator e [examples/ui-components.md](examples/ui-components.md) para compor modal, tabela, métricas e kanban sobre o protocolo de `module.js`.
