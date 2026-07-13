# Component Examples

Leia primeiro o contrato canonico em [../references/component-contract.md](../references/component-contract.md). Use estes cenarios para verificar uma implementacao.

## Stateful

```js
const counter = CounterComponent({
  id: "counter-1",
  props: { counting: 10, label: "Itens" },
});

const firstElement = counter.next().value;
document.body.append(firstElement);

counter.addCountingState(1);

console.assert(counter.state.counting === 11);
console.assert(counter.element !== firstElement);
console.assert(!firstElement.isConnected);
console.assert(counter.element.component === counter);
```

Depois de cada update, clique novamente em um controle `data-action`. O listener deve continuar ativo porque `connect(element)` foi executado no root novo.

## Stateless

```js
const label = LabelComponent({
  id: "status",
  props: { text: "pronto" },
});

const firstElement = label.next().value;
document.body.append(firstElement);
label.next({ text: "concluido" });

console.assert(label.element.textContent === "concluido");
console.assert(label.element !== firstElement);
console.assert(!firstElement.isConnected);
```
