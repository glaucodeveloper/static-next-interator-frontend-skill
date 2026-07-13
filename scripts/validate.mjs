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

for (const file of javascriptFiles) {
  new Function(readFileSync(file, "utf8"));
}

for (const file of markdownFiles) {
  const source = readFileSync(file, "utf8");
  const codeBlocks = source.matchAll(/```js\s*\n([\s\S]*?)```/g);
  const links = source.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g);

  for (const block of codeBlocks) {
    codeBlockCount += 1;
    new Function(block[1]);
  }

  for (const link of links) {
    const target = resolve(dirname(file), link[1]);
    assert(existsSync(target), `Link quebrado em ${file}: ${link[1]}`);
  }
}

const skillSource = readFileSync(join(root, "SKILL.md"), "utf8");
const skillName = skillSource.match(/^name:\s*([^\n]+)$/m)?.[1]?.trim();

assert(skillName === basename(root), "O frontmatter name deve coincidir com a pasta");
assert(existsSync(join(root, "agents", "openai.yaml")), "agents/openai.yaml ausente");

const forbidden = [
  [/\b(?:TODO|FIXME|TBD)\b:?/i, "marcador pendente"],
  [/onclick\s*=/i, "handler inline"],
  [/document\.getElementById\([^\n]+\.component/i, "dispatch local por lookup global"],
  [/\bAppFrontend\b/, "wrapper AppFrontend legado"],
];

for (const file of files.filter(file => !file.endsWith("scripts/validate.mjs"))) {
  const source = readFileSync(file, "utf8");

  for (const [pattern, label] of forbidden) {
    assert(!pattern.test(source), `${label} encontrado em ${file}`);
  }
}

const runtimeSource = readFileSync(join(root, "references", "runtime-types.md"), "utf8");
const runtimeBlocks = [
  ...runtimeSource.matchAll(/```js\s*\n([\s\S]*?)```/g),
].map(match => match[1]);

assert(runtimeBlocks.length >= 3, "Blocos runtime esperados nao foram encontrados");

const runtimeChecks = `
  if (user.label() !== "1:Icaro") throw new Error("label invalido");
  user.rename("Glauco");
  if (user.name !== "Glauco") throw new Error("rename invalido");
  if (!User.is(user)) throw new Error("Model.is rejeitou instancia valida");

  let rejected = 0;
  const invalidConstructions = [
    () => new User({ name: "x", admin: true }),
    () => new User({ id: 1, name: "x", admin: true, extra: 1 }),
  ];

  for (const construct of invalidConstructions) {
    try {
      construct();
    } catch (error) {
      if (error instanceof TypeError) rejected += 1;
    }
  }

  try {
    user.extra = 1;
  } catch (error) {
    if (error instanceof TypeError) rejected += 1;
  }

  try {
    user.id = NaN;
  } catch (error) {
    if (error instanceof TypeError) rejected += 1;
  }

  if (rejected !== 4) throw new Error("Validacao estrita incompleta");
`;

new Function(`${runtimeBlocks.slice(0, 3).join("\n")}\n${runtimeChecks}`)();

console.log(
  `OK: ${javascriptFiles.length} arquivos JS, ` +
  `${codeBlockCount} blocos JS e contratos runtime validados`
);
