# App Program Example

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
