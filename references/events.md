# Events

The recommended event protocol is attribute-driven.

## Required

- `data-cid`
- `data-message`

## Common payload attributes

- `data-route`
- `data-value`
- `data-property-id`
- `data-name`

## Message shape

```js
{
  ...target.dataset,
  type: target.dataset.message,
  name: target.dataset.name || target.name,
  value: target.dataset.value ?? target.value,
  checked: target.checked,
  fields,
  target,
  event
}
```

## Naming

- Prefer intent-first verbs.
- Avoid DOM-coupled labels like `onClickCard`.
- Keep names stable across components when the semantic action is the same.
