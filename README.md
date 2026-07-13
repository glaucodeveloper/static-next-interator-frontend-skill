# Static Next Interator Frontend

Uma skill para criar componentes UI React-like em JavaScript puro com módulos estáticos, estado por instância e rerender localizado.

```js
Component.mount(id, target);
Component.events[id].action();
Component.update(id, patch);
Component.template(id);
```

O ciclo canônico é:

`handler -> this.update(id, patch) -> state merge -> this.template(id) -> outerHTML`

Não há generators, `yield`, `create()` ou factories que retornam objetos de componente.

## Documentação

- [Anatomia canônica](references/component-anatomy.md)
- [Contrato do componente](references/component-contract.md)
- [Ownership dos handlers](references/events.md)
- [Exemplos básicos](examples/components.md)
- [Progressão de componentes UI](examples/ui-components.md)

## Validação

```sh
node scripts/validate.mjs
```

## Demonstração

[GitHub Page](https://glaucodeveloper.github.io/static-next-interator-frontend-skill/)
