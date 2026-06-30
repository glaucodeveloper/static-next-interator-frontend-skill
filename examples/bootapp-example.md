# Driver Example

`bootApp` is not the paradigm. It is only a driver for `AppProgram`.

```js
function runApp(appProgram) {
  const app = appProgram.program();
  let step = app.next();

  while (!step.done) {
    const result = executeStep(step.value);
    step = app.next(result);
  }
}
```

The app composition belongs in `AppProgram`.
