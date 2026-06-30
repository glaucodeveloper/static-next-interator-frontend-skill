function* buildFrontendProgram({ rootSelector }) {
  const root = yield { type: "resolveRoot", rootSelector };
  const interator = yield { type: "createInterator" };
  yield { type: "registerComponent", id: "topbar" };
  yield { type: "registerComponent", id: "home" };
  yield { type: "wireEvents", root, interator };
  return { type: "ready", root, interator };
}

const program = buildFrontendProgram({ rootSelector: "#app" });

console.log(program.next().value);
console.log(program.next(document.querySelector("#app")).value);
console.log(program.next({ route: "home" }).value);
console.log(program.next().value);
console.log(program.next().value);
