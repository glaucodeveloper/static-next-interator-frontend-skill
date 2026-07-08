const TopbarComponent = ({ id }) => ({
  id,
  element: null,

  next() {
    const template = document.createElement("template");

    template.innerHTML = `<nav id="${id}"></nav>`;
    this.element = template.content.children[0];
    this.element.component = this;

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
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarComponent };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };
    yield { type: "render", root, interator, children: [topbar, home] };
    yield { type: "wireEvents", root, interator, children: [topbar, home] };
  },
};

const app = AppFrontend.frontend({ rootSelector: "#app" });

console.log(app.next().value);
console.log(app.next({ nodeType: 1 }).value);
console.log(app.next({ route: "home" }).value);
console.log(app.next(TopbarComponent({ id: "topbar" })).value);
console.log(app.next(HomeComponent({ id: "home" })).value);
console.log(app.next().value);
