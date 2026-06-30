const TopbarProgram = {
  *program(id) {
    yield { type: "mount", id };
    yield { type: "html", id, value: `<nav id="${id}"></nav>` };
  },
};

const HomeComponent = ({ id }) => ({
  next() {
    return {
      done: false,
      value: `<main id="${id}"></main>`,
    };
  },
});

const AppProgram = {
  *program({ rootSelector = "#app" } = {}) {
    const root = yield { type: "resolveRoot", rootSelector };
    const interator = yield { type: "createInterator" };
    const topbar = yield { type: "createComponent", id: "topbar", component: TopbarProgram };
    const home = yield { type: "createComponent", id: "home", component: HomeComponent };
    yield { type: "render", root, interator, children: [topbar, home] };
    yield { type: "wireEvents", root, interator, children: [topbar, home] };
  },
};

const app = AppProgram.program({ rootSelector: "#app" });

console.log(app.next().value);
console.log(app.next({ nodeType: 1 }).value);
console.log(app.next({ route: "home" }).value);
console.log(app.next(TopbarProgram.program("topbar")).value);
console.log(app.next(HomeComponent({ id: "home" })).value);
console.log(app.next().value);
