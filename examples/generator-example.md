# App Frontend Example

```js
const HomeComponent = ({ id }) => ({
  id,
  element: null,

  next() {
    const template = document.createElement("template");

    template.innerHTML = `<main id="${id}"></main>`;
    this.element = template.content.children[0];
    this.element.component = this;

    return {
      done: false,
      value: this.element,
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
