# Program Generation

Use `function*` for the app and for stateful or staged components. Use plain iterators with `next()` for pure functional components.

Common app steps:

- resolve root DOM
- create interator
- create component programs
- render active component programs
- wire event delegation

```js
const TopbarProgram = {
  *program(id) {
    yield {
      type: "html",
      id,
      value: `<nav id="${id}"></nav>`,
    };
  },
};

const HomeComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<main id="${id}"></main>`,
    };
  },
});

const AppProgram = {
  *program({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarProgram };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };
    yield { type: "render", root, interator, children: [topbar, home] };
    yield { type: "wireEvents", root, interator, children: [topbar, home] };
  },
};
```

Common component steps:

- mount
- events
- html
- next update

The driver can be small because the application program carries the composition order.

Pure component example:

```js
const LabelComponent = ({ id, props = {} }) => ({
  next() {
    return {
      done: false,
      value: `<span id="${id}">${props.text}</span>`,
    };
  },
});
```
