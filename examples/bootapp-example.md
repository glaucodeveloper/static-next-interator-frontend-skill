# Driver Example

`bootApp` is not the paradigm. It is only a driver for `AppFrontend`.

```js
function runApp(appFrontend) {
  const app = appFrontend.frontend();
  let step = app.next();

  while (!step.done) {
    const result = executeStep(step.value);
    step = app.next(result);
  }
}
```

The app composition belongs in `AppFrontend`. Component rendering belongs in each component's `next(newState)` method.
