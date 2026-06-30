const TopbarProgram = {
  *program(id) {
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

const AppProgram = {
  *program({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarProgram };
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

function render(root, interator, children) {
  const route = interator.getAtoms().route;

  root.innerHTML = `
    ${children.topbar.next().value.value}
    <main>${children[route].next().value.value}</main>
  `;
}

function executeStep(step, context) {
  if (step.type === "resolveRoot") return document.querySelector(step.rootSelector);
  if (step.type === "createInterator") return createInterator();

  if (step.type === "createComponent") {
    if (step.component.create) return step.component.create(step.id);
    if (step.component.program) return step.component.program(step.id);
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

function runApp(appProgram) {
  const context = {};
  const app = appProgram.program();
  let cursor = app.next();

  while (!cursor.done) {
    const result = executeStep(cursor.value, context);
    cursor = app.next(result);
  }
}

runApp(AppProgram);
