# Event Handlers

Register handlers during `mount()`:

```js
this.events[id] = {
  increment: () => this.update(id, {
    counting: this.frontends[id].state.counting + 1,
  }),
};
```

Use arrow functions so `this` remains the component module. Templates call the instance registry explicitly:

```html
<button onclick="CounterComponent.events['counter-1'].increment()">+1</button>
```

Handlers must calculate a patch and delegate to `this.update()`. Do not merge state, replace HTML, or refresh element references inside individual handlers.
