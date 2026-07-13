import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function filesInside(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.name === ".git") return [];
    return entry.isDirectory() ? filesInside(path) : [path];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const files = filesInside(root);
const markdownFiles = files.filter(file => extname(file) === ".md");
const javascriptFiles = files.filter(file => extname(file) === ".js");
let codeBlockCount = 0;

for (const file of javascriptFiles) new Function(readFileSync(file, "utf8"));

for (const file of markdownFiles) {
  const source = readFileSync(file, "utf8");

  for (const block of source.matchAll(/```js\s*\n([\s\S]*?)```/g)) {
    codeBlockCount += 1;
    new Function(block[1]);
  }

  for (const link of source.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)) {
    assert(existsSync(resolve(dirname(file), link[1])), `Link quebrado: ${file} -> ${link[1]}`);
  }
}

const skill = readFileSync(join(root, "SKILL.md"), "utf8");
assert(skill.match(/^name:\s*(.+)$/m)?.[1].trim() === basename(root), "name deve coincidir com a pasta");
assert(existsSync(join(root, "agents", "openai.yaml")), "agents/openai.yaml ausente");

const joined = files
  .filter(file => !file.endsWith("scripts/validate.mjs"))
  .map(file => readFileSync(file, "utf8"))
  .join("\n");

for (const [pattern, message] of [
  [/\b(?:TODO|FIXME|TBD)\b:?/i, "marcador pendente"],
  [/function\*\s+CounterComponent/, "generator canônico ausente"],
  [/Object\.assign\(\s*this\.state,\s*yield\s*\(this\.element\s*=/, "auto-state generator ausente"],
  [/element\.component\s*=\s*this/, "back-reference ausente"],
  [/document\.getElementById\([^\n]+\.component/, "handler por root.component ausente"],
  [/Object\.assign\(document\.createElement\("template"\),\s*\{\s*innerHTML/, "template inline ausente"],
]) {
  assert(pattern.test(joined), message);
}

assert(!/\b(?:const|let|var)\s+template\b/.test(joined), "template não pode ser alocado em variável");
assert(/Pensamento linear do auto-state/.test(joined), "filosofia linear do state patch ausente");
assert(/O segredo de leitura da IA e o seu é o mesmo/.test(joined), "estratégia de transparência para IA ausente");
assert(/innerHTML:\s*\/\* html \*\/\s*`/.test(joined), "language injection HTML ausente");

console.log(`OK: ${javascriptFiles.length} JS, ${codeBlockCount} blocos JS e contrato generator validado`);
