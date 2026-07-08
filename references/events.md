# Events

Events are inputs passed back into live components through `.next(message)` or component action methods.

Recommended delegated DOM protocol:

- `data-cid`
- `data-message`
- `data-route`
- `data-value`
- `data-name`

Message shape:

```js
{
  ...target.dataset,
  type: target.dataset.message,
  value: target.dataset.value ?? target.value,
  checked: target.checked,
  target,
  event,
}
```

Local inline action protocol:

```html
<button onclick="document.getElementById('counter-1').component.addCountingState(1)">
  +1
</button>
```

Flow with delegated events:

1. DOM emits interaction.
2. Driver normalizes message.
3. Interator handles global effects.
4. Driver calls `.next(message)` on the target component.
5. Component returns an `Element` and replaces its connected root when needed.

Flow with local inline actions:

1. DOM emits interaction.
2. Handler gets the component from `element.component`.
3. Handler calls a component method.
4. Method calls `this.next(newState)`.
5. Component replaces its connected root.
