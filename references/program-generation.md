# Program Generation

Use `function*` when the program must be produced step by step.

Common steps:

- resolve root DOM
- create interator
- register components
- wire event delegation
- hydrate global state
- mount first render

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
