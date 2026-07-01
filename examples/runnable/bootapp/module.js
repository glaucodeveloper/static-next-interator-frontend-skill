const TopbarComponent = {
  *frontend(id) {
    while (true) {
      yield {
        type: "html",
        id,
        value: `
          <nav id="${id}">
            <button data-cid="${id}" data-message="navigate" data-route="home">home</button>
            <button data-cid="${id}" data-message="navigate" data-route="favorites">favorites</button>
          </nav>
        `,
      };
    }
  },
};

const HomeComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<section id="${id}"><h1>home</h1></section>`,
    };
  },
});

const FavoritesComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<section id="${id}"><h1>favorites</h1></section>`,
    };
  },
});

const createInterator = () => {
  const atoms = {
    route: "home",
  };

  return {
    dispatch(message) {
      if (message.type === "navigate") atoms.route = message.route;
      return atoms;
    },
    getAtoms() {
      return atoms;
    },
  };
};

const AppFrontend = {
  *frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarComponent };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };
    const favorites = yield { type: "createComponent", id: "favorites", component: FavoritesComponent };

    yield {
      type: "render",
      root,
      interator,
      children: { topbar, home, favorites },
    };

    yield {
      type: "wireEvents",
      root,
      interator,
      children: { topbar, home, favorites },
    };
  },
};

function readHtml(component) {
  const result = component.next().value;
  return typeof result === "string" ? result : result.value;
}

function render(root, interator, children) {
  const route = interator.getAtoms().route;

  root.innerHTML = `
    ${readHtml(children.topbar)}
    <main>${readHtml(children[route])}</main>
  `;
}

function executeStep(step, context) {
  if (step.type === "resolveRoot") return document.querySelector(step.rootSelector);
  if (step.type === "createInterator") return createInterator();

  if (step.type === "createComponent") {
    if (step.component.create) return step.component.create(step.id);
    if (step.component.frontend) return step.component.frontend(step.id);
    return step.component({ id: step.id });
  }

  if (step.type === "render") {
    render(step.root, step.interator, step.children);
    return null;
  }

  if (step.type === "wireEvents") {
    step.root.addEventListener("click", (event) => {
      const target = event.target.closest("[data-cid][data-message]");
      if (!target) return;

      const message = {
        ...target.dataset,
        type: target.dataset.message,
        value: target.dataset.value ?? target.value,
        target,
        event,
      };

      step.interator.dispatch(message);
      step.children[target.dataset.cid]?.next(message);
      render(step.root, step.interator, step.children);
    });

    return context;
  }

  return null;
}

function runApp(appFrontend) {
  const context = {};
  const app = appFrontend.frontend();
  let cursor = app.next();

  while (!cursor.done) {
    const result = executeStep(cursor.value, context);
    cursor = app.next(result);
  }
}

runApp(AppFrontend);
