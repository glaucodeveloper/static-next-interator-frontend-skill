# Frontend Generator Example

Mantenha `children` como objeto e use um step `mount` distinto de `wireEvents`:

```js
function* frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const home = yield {
      type: "createComponent",
      id: "home",
      component: HomeComponent,
    };

    yield { type: "mount", root, interator, children: { home } };
    yield { type: "wireEvents", root, interator, children: { home } };
}
```

Faca o driver criar `home` com:

```js
HomeComponent({
  id: "home",
  props: {},
  interator,
});
```

Nao alterne entre `children: []` e `children: {}` em steps diferentes.
