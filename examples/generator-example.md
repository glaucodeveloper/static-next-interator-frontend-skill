# Generator Example

```js
function* buildFrontendProgram({ rootSelector }) {
  const root = yield { type: "resolveRoot", rootSelector };
  const interator = yield { type: "createInteractor" };
  yield { type: "registerComponent", id: "topbar" };
  yield { type: "registerComponent", id: "home" };
  yield { type: "registerComponent", id: "favoritos" };
  yield { type: "wireEvents", root, interator };
  return { type: "ready", root, interator };
}
```

Each `yield` acts as a produced step of the program, not just a control-flow detail.
