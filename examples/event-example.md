# Event Example

Use atributos declarativos para mensagens de aplicacao:

```html
<button
  type="button"
  data-source-id="topbar"
  data-message="navigate"
  data-route="favorites"
>
  Favoritos
</button>
```

Normalize o controle para um objeto serializavel antes de chamar o Interator:

```js
interator.dispatch(messageFrom(target));
```

Implemente `messageFrom()` conforme [../references/events.md](../references/events.md), omitindo campos ausentes. Nao inclua `event` nem `target` na mensagem persistida. Veja o fluxo executavel em `examples/runnable/events/`.
