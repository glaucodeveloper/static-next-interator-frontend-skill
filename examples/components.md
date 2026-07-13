# Componentes fundamentais

## Binder

```js
function component(Component, props) {
  const context = {};
  const iterator = Component.call(context, props);
  context.next = iterator.next.bind(iterator);
  context.return = iterator.return.bind(iterator);
  context.throw = iterator.throw.bind(iterator);
  return context;
}
```

## Contador mínimo

```js
function* Counter({ id }) {
  this.id = id;
  this.state = { counting: 0 };
  this.element = null;
  this.increment = () => this.next({ counting: this.state.counting + 1 });

  while (true) {
    const template = document.createElement("template");
    template.innerHTML = `<button>${this.state.counting}</button>`;
    Object.assign(
      this.state,
      yield (this.element = ((element) => {
        element.id = id;
        element.component = this;
        element.setAttribute(
          "onclick",
          `document.getElementById(${JSON.stringify(id)}).component.increment()`,
        );
        if (this.element?.isConnected) this.element.replaceWith(element);
        return element;
      })(template.content.firstElementChild)),
    );
  }
}

const counter = component(Counter, { id: "counter-1" });
document.body.append(counter.next().value);
```

## Duas instâncias

```js
const first = component(Counter, { id: "counter-a" });
const second = component(Counter, { id: "counter-b" });

document.body.append(first.next().value, second.next().value);
first.increment();

console.assert(first.state.counting === 1);
console.assert(second.state.counting === 0);
```
