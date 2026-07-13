function commitComponentElement(component, element) {
  if (!(element instanceof Element)) {
    throw new TypeError("next() deve produzir um Element");
  }

  element.component = component;
  component.connect?.(element);

  if (component.element?.isConnected) {
    component.element.replaceWith(element);
  }

  component.element = element;

  return {
    value: element,
    done: false,
  };
}

function TopbarComponent({ id }) {
  return {
    id,
    element: null,
    renders: 0,

    next() {
      this.renders += 1;

      const template = document.createElement("template");
      template.innerHTML = /*html*/ `
        <nav aria-label="Navegacao principal">
          <button type="button" data-message="navigate" data-route="home">home</button>
          <button type="button" data-message="navigate" data-route="favorites">
            favorites
          </button>
        </nav>
      `.trim();

      const element = template.content.firstElementChild;
      element.id = this.id;

      for (const control of element.querySelectorAll("[data-message]")) {
        control.dataset.sourceId = this.id;
      }

      return commitComponentElement(this, element);
    },
  };
}

function PageComponent({ id, props = {} }) {
  return {
    id,
    element: null,
    renders: 0,

    next(input = {}) {
      this.renders += 1;

      const template = document.createElement("template");
      template.innerHTML = "<section><h1></h1></section>";

      const element = template.content.firstElementChild;
      element.id = this.id;
      element.querySelector("h1").textContent = input.title ?? props.title ?? this.id;

      return commitComponentElement(this, element);
    },
  };
}

function createInterator() {
  const atoms = {
    route: "home",
  };

  return {
    dispatch(message) {
      const changed = [];

      if (
        message.type === "navigate" &&
        ["home", "favorites"].includes(message.route) &&
        message.route !== atoms.route
      ) {
        atoms.route = message.route;
        changed.push("route");
      }

      return {
        changed,
        snapshot: Object.freeze({ ...atoms }),
      };
    },

    getSnapshot() {
      return Object.freeze({ ...atoms });
    },
  };
}

function* frontend({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield {
      type: "createComponent",
      id: "topbar",
      component: TopbarComponent,
    };
    const home = yield {
      type: "createComponent",
      id: "home",
      component: PageComponent,
      props: { title: "home" },
    };
    const favorites = yield {
      type: "createComponent",
      id: "favorites",
      component: PageComponent,
      props: { title: "favorites" },
    };

    yield {
      type: "mount",
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
}

function renderRoute(root, interator, children) {
  const route = interator.getSnapshot().route;
  const outlet = root.querySelector("[data-outlet]");
  const element = children[route].next().value;

  if (element.parentElement !== outlet) {
    outlet.replaceChildren(element);
  }
}

function mount(root, interator, children) {
  const outlet = document.createElement("main");
  outlet.dataset.outlet = "";
  root.replaceChildren(children.topbar.next().value, outlet);
  renderRoute(root, interator, children);
}

function messageFrom(target) {
  const message = {
    type: target.dataset.message,
    sourceId: target.dataset.sourceId,
  };

  if (target.dataset.route !== undefined) {
    message.route = target.dataset.route;
  }

  if (target.dataset.value !== undefined) {
    message.value = target.dataset.value;
  } else if (target.matches("input, select, textarea")) {
    message.value = target.value;
  }

  if ("checked" in target) {
    message.checked = target.checked;
  }

  return message;
}

function wireEvents(root, interator, children) {
  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const target = event.target.closest("[data-message]");

    if (!target || !root.contains(target)) return;

    const result = interator.dispatch(messageFrom(target));

    if (result.changed.includes("route")) {
      renderRoute(root, interator, children);
    }
  });
}

function executeStep(step, context) {
  if (step.type === "resolveRoot") {
    context.root = document.querySelector(step.rootSelector);
    return context.root;
  }

  if (step.type === "createInterator") {
    context.interator = createInterator();
    return context.interator;
  }

  if (step.type === "createComponent") {
    const component = step.component({
      id: step.id,
      props: step.props ?? {},
      interator: context.interator,
    });

    context.children[step.id] = component;
    return component;
  }

  if (step.type === "mount") {
    mount(step.root, step.interator, step.children);
    return null;
  }

  if (step.type === "wireEvents") {
    wireEvents(step.root, step.interator, step.children);
    return null;
  }

  throw new TypeError(`Step desconhecido: ${step.type}`);
}

function runApp(frontend) {
  const context = {
    root: null,
    interator: null,
    children: {},
  };
  const app = frontend();
  let cursor = app.next();

  while (!cursor.done) {
    cursor = app.next(executeStep(cursor.value, context));
  }

  return context;
}

window.appDebug = runApp(frontend);
