const TopbarComponent = {
  create({ id }) {
    return {
      next() {
        return {
          done: false,
          value: `
            <nav>
              <button data-cid="${id}" data-message="navigate" data-route="home">home</button>
              <button data-cid="${id}" data-message="navigate" data-route="favorites">favorites</button>
            </nav>
          `,
        };
      },
    };
  },
};

const HomeComponent = {
  create() {
    return {
      next() {
        return {
          done: false,
          value: `<section><h1>home</h1></section>`,
        };
      },
    };
  },
};

const FavoritesComponent = {
  create() {
    return {
      next() {
        return {
          done: false,
          value: `<section><h1>favorites</h1></section>`,
        };
      },
    };
  },
};

const createInterator = ({ persist }) => {
  const atoms = {
    route: "home",
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") atoms.route = message.route;
      persist?.(atoms);
      return atoms;
    },
    getAtoms() {
      return atoms;
    },
  };
};

const bootApp = ({ rootSelector = "#app" } = {}) => {
  const root = document.querySelector(rootSelector);
  const components = new Map();
  const interator = createInterator({});

  const add = (id, factory, props = {}) => {
    const instance = factory.create({ id, props, interator });
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

  add("topbar", TopbarComponent);
  add("home", HomeComponent);
  add("favorites", FavoritesComponent);
  render();
};

bootApp();
