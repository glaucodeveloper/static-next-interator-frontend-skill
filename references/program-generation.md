# Program Generation

A frontend can be produced as a generator pipeline.

## Idea

`function*` is useful when each stage of the program should be explicit and inspectable.
Each `yield` is one algorithmic piece-step.

## Step types

- resolve the root node
- create the interator layer
- register component factories
- wire event delegation
- hydrate or restore atomic state
- mount the first render

## Example

```js
function* buildProgram({ rootSelector, createInteractor, registerComponent }) {
  const root = yield { type: "resolveRoot", root: document.querySelector(rootSelector) };
  const interator = yield { type: "createInteractor", interator: createInteractor() };
  yield { type: "registerComponent", id: "home" };
  yield { type: "registerComponent", id: "topbar" };
  yield { type: "wireEvents", root, interator };
  return { type: "ready", root, interator };
}
```

## Rule of thumb

Use generator production when you want the program to read like a build log that is also executable.
