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

## Inspiração em Effect

Static Next é claramente inspirado pela família Effect/Effect-TS na ideia de descrever um programa suspenso e retomá-lo através de um intérprete explícito. Aqui essa influência é aplicada ao DOM: o generator descreve o ciclo do componente, `yield` demarca a fronteira entre render atual e próximo estado, e o binder conduz o iterator.

Essa é uma inspiração conceitual, não uma dependência nem uma alegação de compatibilidade com a API de Effect. Static Next usa apenas generators, DOM e JavaScript nativos.

## Documentação

- [Anatomia completa do generator](references/component-anatomy.md)
- [Contrato e tipos](references/component-contract.md)
- [Handlers e identidade DOM](references/events.md)
- [Exemplos fundamentais](examples/components.md)
- [Galeria progressiva de componentes](examples/ui-components.md)
- [Exemplo executável do contador](examples/runnable/counter/)

## Validação

```sh
node scripts/validate.mjs
```

## Tutorial interativo

[Acesse a GitHub Page](https://glaucodeveloper.github.io/static-next-interator-frontend-skill/)
