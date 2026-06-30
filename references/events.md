# Events

Events are inputs passed back into live programs.

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
2. Driver normalizes message.
3. Interator handles global effects.
4. Driver calls `program.next(message)` on the component program.
5. Driver applies the yielded HTML.
