# Bootapp Example

```js
const bootApp = ({ rootSelector = "#app" } = {}) => {
  const root = document.querySelector(rootSelector);
  const components = new Map();
  const interator = createInteractor({
    state: { route: "home" },
    persist(value) {
      localStorage.setItem("app-state", JSON.stringify(value));
    },
  });

  const add = (id, factory, props = {}) => {
    const instance = factory({ id, props });
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
    const component = components.get(target.dataset.cid);
    if (!component) return;

    const message = {
      ...target.dataset,
      type: target.dataset.message,
      value: target.dataset.value ?? target.value,
      target,
      event,
    };

    if (message.type === "navigate") {
      interator.dispatch(message);
      render();
      return;
    }

    component.next(message);
    render();
  };

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-cid][data-message]");
    if (actionTarget) dispatch(actionTarget, event);
  });

  add("topbar", TopbarComponent, {
    goToRoute(route) {
      interator.dispatch({ type: "navigate", route });
    },
  });

  add("home", HomeComponent);
  add("favoritos", FavoritesComponent);
  render();
};
```

This keeps orchestration centralized and pushes shared effects into the interator.
