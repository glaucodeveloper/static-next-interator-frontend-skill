# Component Examples

All examples use the same module contract: `frontends`, `events`, `mount`, `template`, and `update`.

## Counter

```js
CounterComponent.mount("counter-1", document.querySelector("#app"));
CounterComponent.events["counter-1"].add(1);
```

## Independent instances

```js
CounterComponent.mount("cart-count", document.querySelector("#header"));
CounterComponent.mount("inventory-count", document.querySelector("#main"));

CounterComponent.events["cart-count"].add(1);
CounterComponent.events["inventory-count"].add(10);
```

Each id owns separate state at `CounterComponent.frontends[id].state`.
