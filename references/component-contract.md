# Contrato e tipos

## Tipos conceituais

```ts
type StatePatch<State extends object> = Partial<State>;

interface GeneratorResultElement {
  value: HTMLElement;
  done: false;
}

interface ComponentContext<State extends object> {
  id: string;
  state: State;
  element: HTMLElement | null;
  next(patch?: StatePatch<State>): GeneratorResultElement;
  return(value?: unknown): IteratorResult<HTMLElement>;
  throw(error?: unknown): IteratorResult<HTMLElement>;
}

type ComponentGenerator<Props, State extends object> = (
  this: ComponentContext<State>,
  input: { id: string; props?: Props },
) => Generator<HTMLElement, void, StatePatch<State>>;

interface ComponentElement<State extends object> extends HTMLElement {
  component: ComponentContext<State>;
}
```

## Invariantes

- Uma chamada inicial a `next()` produz exatamente um `HTMLElement`.
- Uma chamada posterior a `next(patch)` entrega `patch` ao `Object.assign(this.state, yield element)` e produz exatamente um novo `HTMLElement`.
- `element.id === component.id`.
- `element.component === component` em toda renderização.
- `component.element` aponta para o root mais recente.
- O patch aceito é parcial, validado e nunca é um `Event` DOM bruto.
- A instância permanece viva até `return()` ou até perder todas as referências.

O generator é um iterator ECMAScript real. O `context` apenas delega `next`, `return` e `throw` ao iterator nativo, preservando `this` como API pública do componente.
