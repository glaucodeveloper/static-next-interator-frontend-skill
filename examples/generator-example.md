# App Frontend Example

```js
const HomeComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<main id="${id}"></main>`,
    };
  },
});

const AppFrontend = {
  *frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };

    yield { type: "render", root, interator, children: { home } };
    yield { type: "wireEvents", root, interator, children: { home } };
  },
};
```
