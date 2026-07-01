# Frontend Generation

Use `function*` as `*frontend` for app composition and stateful component rendering.

Common app frontend steps:

- resolve root DOM
- create interator
- create components
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

The driver can be small because the app frontend carries the composition order.
