# Driver Example

Use `runApp()` somente como driver da funcao geradora `frontend`. Preserve estes limites:

```js
function runApp(frontend, executeStep) {
  const app = frontend();
  let cursor = app.next();

  while (!cursor.done) {
    cursor = app.next(executeStep(cursor.value));
  }
}
```

- Monte cada componente uma vez no step `mount`.
- Encaminhe eventos globais a `interator.dispatch(message)`.
- Use `result.changed` para renderizar apenas a regiao afetada.
- Nao chame `component.next(message)` antes de uma renderizacao global.
- Nao execute `root.replaceChildren()` a cada acao local.

Veja a implementacao completa em `examples/runnable/bootapp/module.js`.
