# Events

Recommended DOM protocol:

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

Flow:

1. DOM emits interaction.
2. Runtime or interator normalizes message.
3. Interator resolves global impact.
4. Component handles local impact.
5. Runtime rerenders.
