const TopbarComponent = ({ id }) => ({
  id,
  element: null,

  next() {
    const template = document.createElement("template");

    template.innerHTML = /*html*/ `
      <nav id="${id}">
        <button data-cid="${id}" data-message="navigate" data-route="home">home</button>
        <button data-cid="${id}" data-message="navigate" data-route="favorites">favorites</button>
      </nav>
    `.trim();

    this.element = ((element) =>
      this.element?.isConnected
        ? (this.element.replaceWith((element.component = this, element)), element)
        : (element.component = this, element)
    )(template.content.children[0]);

    return {
      done: false,
      value: this.element,
    };
  },
});

const HomeComponent = ({ id }) => ({
  id,
  element: null,

  next() {
    const template = document.createElement("template");

    template.innerHTML = `<section id="${id}"><h1>home</h1></section>`;
    this.element = template.content.children[0];
    this.element.component = this;

    return {
      done: false,
      value: this.element,
    };
  },
});

const FavoritesComponent = ({ id }) => ({
  id,
  element: null,

  next() {
    const template = document.createElement("template");

    template.innerHTML = `<section id="${id}"><h1>favorites</h1></section>`;
    this.element = template.content.children[0];
    this.element.component = this;

    return {
      done: false,
      value: this.element,
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

function render(root, interator, children) {
  const route = interator.getAtoms().route;
  const fragment = document.createDocumentFragment();
  const main = document.createElement("main");

  fragment.append(children.topbar.next().value);
  main.append(children[route].next().value);
  fragment.append(main);

  root.replaceChildren(fragment);
}

function executeStep(step, context) {
  if (step.type === "resolveRoot") return document.querySelector(step.rootSelector);
  if (step.type === "createInterator") return createInterator();

  if (step.type === "createComponent") {
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
