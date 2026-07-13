# Events

## Sumario

- [Escolha o owner](#escolha-o-owner)
- [Conecte eventos locais](#conecte-eventos-locais)
- [Delegue mensagens globais](#delegue-mensagens-globais)
- [Preserve a separacao de mensagens](#preserve-a-separacao-de-mensagens)
- [Limpe efeitos externos](#limpe-efeitos-externos)

## Escolha o owner

| Escopo | Owner | Fluxo |
| --- | --- | --- |
| Estado de um componente | componente | listener ligado ao root novo -> handler -> `next(statePatch)` |
| Rota, sessao ou efeito compartilhado | app/Interator | listener delegado no root -> mensagem serializavel -> `dispatch()` -> render afetado |

Escolha um owner por acao. Nao ligue o mesmo clique ao componente e ao driver.

## Conecte eventos locais

Conecte handlers depois de criar o elemento e antes de publica-lo:

```js
const SaveComponent = ({ id }) => ({
  id,
  state: { saved: false },
  element: null,

  connect(element) {
    element
      .querySelector("[data-action='save']")
      .addEventListener("click", this.handleSave.bind(this));

    return element;
  },

  handleSave(event) {
    event.preventDefault();
    return this.next({ saved: true });
  },
});
```

Execute `connect(element)` em cada `next()`. O root anterior e seus listeners desaparecem juntos depois de `replaceWith()`.

Use `event.currentTarget` quando o listener estiver no proprio controle. Use `event.target.closest(selector)` apenas ao delegar dentro de um root e confirme que o resultado pertence a esse root.

## Delegue mensagens globais

Use atributos declarativos para eventos do app:

```html
<button
  type="button"
  data-source-id="topbar"
  data-message="navigate"
  data-route="favorites"
>
  favoritos
</button>
```

Normalize somente dados serializaveis. Nao armazene `event` nem `target` no Interator:

```js
function messageFrom(target) {
  const message = {
    type: target.dataset.message,
    sourceId: target.dataset.sourceId,
  };

  if (target.dataset.route !== undefined) {
    message.route = target.dataset.route;
  }

  if (target.dataset.value !== undefined) {
    message.value = target.dataset.value;
  } else if (target.matches("input, select, textarea")) {
    message.value = target.value;
  }

  if ("checked" in target) {
    message.checked = target.checked;
  }

  return message;
}

root.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const target = event.target.closest("[data-message]");

  if (!target || !root.contains(target)) return;

  const result = interator.dispatch(messageFrom(target));
  renderAffectedOutlet(result);
});
```

Faca `dispatch()` retornar um resultado explicito, como `{ changed: ["route"], snapshot }`. Use esse resultado para atualizar somente o outlet ou componente afetado.

## Preserve a separacao de mensagens

Mantenha estas assinaturas distintas:

```js
component.next({ counting: 2 });
interator.dispatch({ type: "navigate", route: "favorites" });
```

Nao execute:

```js
component.next({
  type: "click",
  target: event.target,
  event,
});
```

Esse objeto nao e um patch de estado; ele pode contaminar o estado com referencias DOM obsoletas e nao serializaveis.

## Limpe efeitos externos

Listeners ligados ao root do componente sao descartados com o root. Para recursos externos, implemente teardown:

```js
const component = {
  abortController: null,

  start() {
    this.abortController = new AbortController();
    window.addEventListener("resize", this.handleResize.bind(this), {
      signal: this.abortController.signal,
    });
  },

  dispose() {
    this.abortController?.abort();
    this.abortController = null;
  },
};
```

Nao chame `start()` dentro de cada `next()`.
