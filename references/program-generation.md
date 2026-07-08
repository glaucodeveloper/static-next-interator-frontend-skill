# Frontend Generation

Use `function*` as `*frontend` for app composition, not as the default stateful component model.

Common app frontend steps:

- resolve root DOM
- create interator
- create component objects
- render active components
- wire event delegation

```js
const AppFrontend = {
  *frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const counter = yield { type: "createComponent", id: "counter", component: CounterComponent };
    const label = yield { type: "createComponent", id: "label", component: LabelComponent };

    yield { type: "render", root, interator, children: { counter, label } };
    yield { type: "wireEvents", root, interator, children: { counter, label } };
  },
};
```

The driver can be small because the app frontend carries the composition order. Components still own their own render/update cycle through `next(newState)`.
