# Frontend Generation

Use uma funcao geradora `frontend()` para ordenar composicao, nao como modelo interno do componente.

## Mantenha steps consistentes

Use `children` como objeto indexado por nome em todos os steps:

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

## Limite o driver

Faca o driver:

- resolver o root;
- criar o Interator;
- chamar toda factory como `component({ id, props, interator })`;
- montar o resultado inicial de cada componente uma vez;
- instalar uma delegacao global no root;
- atualizar somente o componente ou outlet indicado pelo resultado de `dispatch()`.

Nao faca o driver:

- chamar `component.next(message)` com um evento DOM;
- chamar `next()` e reconstruir o app inteiro logo depois;
- duplicar o commit interno de um componente;
- alternar `children` entre array e objeto.

## Execute o generator

```js
function runApp(frontend, executeStep) {
  const app = frontend();
  let cursor = app.next();

  while (!cursor.done) {
    cursor = app.next(executeStep(cursor.value));
  }
}
```

Mantenha `executeStep` sincrono somente enquanto todos os steps forem sincronos. Use um driver `async` e aguarde resultados quando resolucao, persistencia ou montagem dependerem de promises.
