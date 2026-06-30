# Bootapp Example

```js
const bootApp = ({ rootSelector = "#app" } = {}) => {
  const root = document.querySelector(rootSelector);
  const components = new Map();
  const interator = createInterator({
    persist(atoms) {
      localStorage.setItem("app-atoms", JSON.stringify(atoms));
    },
  });

  const add = (id, factory, props = {}) => {
    const instance = factory.create
      ? factory.create({ id, props, interator })
      : factory({ id, props, interator });

    components.set(id, instance);
    return instance;
  };

  const render = () => {
    root.innerHTML = `
      ${components.get("topbar").next().value}
      <main>${components.get(interator.getAtoms().route).next().value}</main>
    `;
  };

  const dispatch = (target, event) => {
    const message = {
      ...target.dataset,
      type: target.dataset.message,
      value: target.dataset.value ?? target.value,
      target,
      event,
    };

    interator.dispatch(message);

    const component = components.get(target.dataset.cid);
    if (component) component.next(message);

    render();
  };

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-cid][data-message]");
    if (actionTarget) dispatch(actionTarget, event);
  });

  return { add, render, interator };
};
```
