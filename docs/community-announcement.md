# Anúncio para a comunidade

**Static Next Interator Frontend** propõe componentes React-like em JavaScript puro com uma anatomia explícita:

```text
DOM handler -> element.component -> this.method -> next(patch)
-> Object.assign(this.state, yield HTMLElement) -> replaceWith
```

Cada componente é uma única `function*`: cria seu próprio `<template>`/`DocumentFragment`, estende o root com `id` e `element.component = this`, entrega o `HTMLElement` pelo `yield` e recebe o próximo state patch por `next(patch)`. O projeto inclui um contador canônico, sete exemplos executáveis por complexidade, tipos formais e uma página interativa que explica cada expressão.

A arquitetura assume explicitamente uma inspiração conceitual em Effect/Effect-TS — programa suspenso e interpretação explícita — mas usa somente generators, JavaScript e DOM nativos.

Essa transparência também é uma escolha estratégica para produção assistida por IA: o código gerado, executado e revisado compartilha a mesma chave de leitura linear, reduzindo overhead cognitivo, de contexto e de arquitetura. Extensões de editor podem reconhecer as template strings com `/* html */` sem acrescentar runtime ao componente.

Projeto: https://github.com/glaucodeveloper/static-next-interator-frontend-skill

Tags: `javascript` `vanillajs` `generators` `frontend` `components` `architecture` `dom` `effect-ts`
