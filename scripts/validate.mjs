import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name);
  if (entry.name === ".git" || entry.name === ".playwright-cli") return [];
  return entry.isDirectory() ? walk(path) : [path];
});
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const files = walk(root);
const markdown = files.filter(file => extname(file) === ".md");
const javascript = files.filter(file => extname(file) === ".js");
let blocks = 0;

for (const file of javascript) new Function(readFileSync(file, "utf8"));
for (const file of markdown) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/```js\s*\n([\s\S]*?)```/g)) {
    blocks += 1;
    new Function(match[1]);
  }
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)) {
    assert(existsSync(resolve(dirname(file), match[1])), `Link quebrado: ${match[1]}`);
  }
}

const skill = readFileSync(join(root, "SKILL.md"), "utf8");
assert(skill.match(/^name:\s*([^\n]+)$/m)?.[1] === basename(root), "Nome da skill invalido");
assert(existsSync(join(root, "agents", "openai.yaml")), "agents/openai.yaml ausente");

const canonical = ["frontends", "events", "mount(id", "template(id", "update(id", "outerHTML"];
for (const token of canonical) assert(skill.includes(token), `Contrato ausente: ${token}`);

const obsolete = [/function\s*\*/, /commitComponentElement/];
for (const file of files.filter(file => !file.endsWith("scripts/validate.mjs"))) {
  const source = readFileSync(file, "utf8");
  for (const pattern of obsolete) assert(!pattern.test(source), `Contrato obsoleto em ${file}: ${pattern}`);
}

console.log(`OK: ${javascript.length} JS, ${blocks} blocos JS e contrato static-next validado`);
