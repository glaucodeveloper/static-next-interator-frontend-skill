# Static Next Interator Frontend

> Uma skill para construir interfaces JavaScript sem framework com componentes vivos, DOM real e contratos claros de atualizacao.

`Static Next Interator Frontend` transforma uma ideia simples em disciplina de implementacao: cada componente conhece seu elemento atual, recebe apenas dados validos em `next()` e publica um novo root de forma segura. O resultado e uma alternativa pequena e auditavel para telas que nao precisam de um framework completo.

## Por que este repositorio existe?

Frontends pequenos costumam acumular handlers inline, interpolacao insegura de HTML e atualizacoes espalhadas pelo DOM. Esta skill oferece um contrato pratico para evitar esse desgaste sem esconder o navegador atras de uma camada magica.

- Componentes mantem identidade por `id`, `element` e `next(input)`.
- Cada renderizacao cria um unico root a partir de `<template>`.
- O componente publica seu proprio root com `replaceWith()` quando necessario.
- Acoes locais usam listeners ligados ao novo root; mensagens globais passam pelo Interator.
- Dados dinamicos chegam ao DOM por propriedades e `textContent`, nao por codigo gerado em strings.
- Contratos de runtime tornam patches, mensagens e entidades verificaveis em JavaScript puro.

## O que voce encontra aqui

| Area | O que ela resolve |
| --- | --- |
| Componentes nextable | Estado local, substituicao segura do root e listeners que sobrevivem a novos renders. |
| Eventos | Separacao entre acao local e mensagem global, sem misturar `Event` no estado. |
| Geracao do frontend | Uma funcao `frontend()` descreve montagem e wiring; o driver executa os steps. |
| Interator | Coordenacao de rota, sessao e outros atomos compartilhados sem tomar o ciclo do componente. |
| Tipos em runtime | Validadores estritos para modelos, resultados de `next()` e contratos de componente. |

## Comece pelo contrato

Um componente stateful e um objeto vivo; ele nao precisa se passar por um iterator ECMAScript completo.

```js
const counter = CounterComponent({
  id: "counter",
  props: { counting: 0 },
});

document.querySelector("#app").append(counter.next().value);
counter.next({ counting: 1 });
```

O `next()` devolve sempre `{ value: Element, done: false }`. Antes de publicar o proximo root, o componente liga seus handlers; depois, substitui apenas o root que controla.

Veja o contrato completo em [component-contract.md](references/component-contract.md) e o exemplo progressivo em [component-example.md](examples/component-example.md).

## Como usar a skill

Instale-a no Codex a partir deste repositorio:

```sh
python3 "$HOME/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py" \
  --repo glaucodeveloper/static-next-interator-frontend-skill \
  --path . \
  --ref main \
  --name static-next-interator-frontend-skill
```

Em seguida, use uma solicitacao objetiva, por exemplo:

```text
Use $static-next-interator-frontend-skill para criar um componente de filtro com estado local, handlers ligados no root e mensagens globais normalizadas pelo Interator.
```

## Mapa de leitura

1. [SKILL.md](SKILL.md) apresenta o contrato e os limites da abordagem.
2. [component-contract.md](references/component-contract.md) mostra componentes stateful e stateless.
3. [events.md](references/events.md) define ownership de eventos locais e globais.
4. [program-generation.md](references/program-generation.md) explica a funcao geradora `frontend()` e seu driver.
5. [runtime-types.md](references/runtime-types.md) formaliza validacao em runtime.
6. [examples/](examples/) traz trechos focados e fluxos executaveis no navegador.

## Quando usar — e quando nao usar

Use esta abordagem quando voce quer DOM nativo, componentes pequenos com ciclo explicito e atualizacoes localizadas. Ela e especialmente util em ferramentas internas, prototipos duraveis, paginas interativas e migracoes graduais de JavaScript legado.

Ela nao tenta substituir um framework completo. Nao a use para prometer compatibilidade com o protocolo `Iterator` sem implementar esse protocolo, nem para esconder efeitos globais dentro de `next()`. Timers, subscriptions e listeners de `window` ou `document` precisam de ownership e `dispose()` explicitos.

## Exemplos executaveis

Os exemplos em `examples/runnable/` cobrem contador, eventos globais, composicao do frontend e geracao de steps. Abra o respectivo `index.html` em um navegador ou sirva a pasta localmente para observar a troca de roots e o wiring dos eventos.

## Contribua

Contribuicoes sao bem-vindas quando preservam o contrato central e melhoram exemplos, referencias ou validacoes.

Antes de enviar uma mudanca, execute:

```sh
node scripts/validate.mjs
```

O validador verifica links Markdown, sintaxe dos exemplos, contratos de runtime e a ausencia de padroes proibidos, como handlers inline e o wrapper legado de geracao.

## Para compartilhar com a comunidade

Ha um texto curto e um anuncio detalhado prontos em [docs/community-announcement.md](docs/community-announcement.md). Eles explicam a proposta sem vender a skill como um framework ou uma solucao universal.
