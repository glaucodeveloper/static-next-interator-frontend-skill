# Bootapp Example

```js
const bootApp = (rootSelector = "#app") => {
  const root = document.querySelector(rootSelector);
  const components = new Map();
  const routeState = { route: "home" };

  const add = (id, factory, props = {}) => {
    const instance = factory({ id, props });
    components.set(id, instance);
    return instance;
  };

  const render = () => {
    root.innerHTML = `
      ${components.get("topbar").next().value}
      <main>${components.get(routeState.route).next().value}</main>
    `;
  };

  const dispatch = (target, event) => {
    const component = components.get(target.dataset.cid);
    if (!component) return;

    component.next({
      ...target.dataset,
      type: target.dataset.message,
      value: target.dataset.value ?? target.value,
      target,
      event,
    });

    render();
  };

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-cid][data-message]");
    if (actionTarget) dispatch(actionTarget, event);
  });

  add("topbar", TopbarComponent, {
    goToRoute(route) {
      routeState.route = route;
    },
  });

  add("home", HomeComponent);
  add("favoritos", FavoritesComponent);
  render();
};
```

This keeps orchestration centralized and components small.
