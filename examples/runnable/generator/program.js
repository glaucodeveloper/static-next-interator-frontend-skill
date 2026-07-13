const TopbarComponent = ({ id }) => ({ id, element: null, next() {} });
const HomeComponent = ({ id }) => ({ id, element: null, next() {} });

const AppFrontend = {
  *frontend({ rootSelector = "#app" } = {}) {
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
      component: HomeComponent,
    };

    yield { type: "mount", root, interator, children: { topbar, home } };
    yield { type: "wireEvents", root, interator, children: { topbar, home } };
  },
};

const root = { nodeType: 1, id: "app" };
const interator = { dispatch() {}, getSnapshot() {} };
const topbar = TopbarComponent({ id: "topbar", interator });
const home = HomeComponent({ id: "home", interator });
const app = AppFrontend.frontend({ rootSelector: "#app" });

console.log(app.next().value);
console.log(app.next(root).value);
console.log(app.next(interator).value);
console.log(app.next(topbar).value);
console.log(app.next(home).value);
console.log(app.next().value);
console.log(app.next());
