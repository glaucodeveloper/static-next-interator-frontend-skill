# Static Next Interator Frontend

Uma skill para criar componentes React-like em JavaScript puro usando o protocolo real de generators.

```js
const counter = component(CounterComponent, { id: "counter-1" });
document.querySelector("#app").append(counter.next().value);
counter.next({ counting: 10 });
```

O ciclo canônico é:

`next(patch) → Object.assign(state, yield HTMLElement) → template/DocumentFragment → element.component = this → replaceWith`

O componente inteiro vive em uma única `function*`. A expressão canônica é `Object.assign(this.state, yield element)`: o `yield` entrega o root renderizado e, quando o generator é retomado, recebe o patch que será aplicado automaticamente ao estado. O elemento aponta de volta para a instância por `element.component`, permitindo handlers como:

```html
<button onclick="document.getElementById('counter-1').component.increment(1)">
  +1
</button>
```

## Estado como programa; UI como leaf component

Generators definem programas; iterators mantêm sua execução viva. Isso permite preservar estado e posição ao longo de uma rota, sessão ou workflow: `yield` torna o momento atual observável e `next(input)` continua o mesmo programa com a próxima informação.

Static Next aplica essa primitiva a **leaf components**. Cada leaf possui um único root DOM, seu estado local e seus handlers; entrega o `HTMLElement` atual e recebe somente seu `StatePatch`. "Leaf" é uma fronteira de propriedade, não sinônimo de UI pequena: tabelas, formulários e painéis podem continuar sendo leaves quando possuem e substituem apenas o próprio root.

Programas de aplicação podem coordenar estado duradouro em outra escala. O `yield` do leaf, porém, não deve virar um barramento global de mensagens.

## Inspiração em Effect

Static Next é claramente inspirado pela família Effect/Effect-TS na ideia de descrever um programa suspenso e retomá-lo através de um intérprete explícito. Aqui essa influência é aplicada ao DOM: o generator descreve o ciclo do componente, `yield` demarca a fronteira entre render atual e próximo estado, e o binder conduz o iterator.

Essa é uma inspiração conceitual, não uma dependência nem uma alegação de compatibilidade com a API de Effect. Static Next usa apenas generators, DOM e JavaScript nativos.

## Transparência tecnológica para produção com IA

Static Next trata simplicidade como uma escolha estratégica: pessoas e sistemas de IA leem a mesma cadeia causal diretamente no código. Estado, template inline, identidade DOM, handlers, `yield`, `StatePatch` e atualização não ficam escondidos por um runtime ou lifecycle implícito.

O segredo de leitura é compartilhado: seguir a linha `estado → root → yield → next(patch) → assign → próximo root`. Isso reduz overhead cognitivo, de contexto e de arquitetura durante geração, revisão e manutenção. Ganhos de bundle ou runtime, porém, só devem ser afirmados quando medidos.

Extensões de editor para HTML em template strings podem ser usadas diretamente. A anotação `/* html */` antes do template literal adiciona highlight, autocomplete ou formatação em tooling compatível sem custo de runtime e sem alterar o protocolo do componente.

## Documentação

- [Anatomia completa do generator](references/component-anatomy.md)
- [Iterators, programas e leaf components](references/iterators-programs-and-leaf-components.md)
- [Contrato e tipos](references/component-contract.md)
- [Handlers e identidade DOM](references/events.md)
- [Transparência tecnológica e IA](references/technology-transparency.md)
- [Exemplos fundamentais](examples/components.md)
- [Galeria progressiva de componentes](examples/ui-components.md)
- [Exemplo executável do contador](examples/runnable/counter/)

## Validação

```sh
node scripts/validate.mjs
```

## Tutorial interativo

[Acesse a GitHub Page](https://glaucodeveloper.github.io/static-next-interator-frontend-skill/)
