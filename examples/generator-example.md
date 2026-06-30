# Generator Example

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
