# Event Example

```html
<a href="#favoritos" data-cid="topbar" data-message="navigate" data-route="favoritos">
  Favoritos
</a>

<button
  type="button"
  data-cid="listing"
  data-message="toggleFavorite"
  data-property-id="apt-204"
>
  Favoritar
</button>

<form data-cid="announce" data-message="announce">
  <input name="ownerName" required>
  <input name="phone" required>
  <button type="submit">Enviar</button>
</form>
```

The runtime can normalize those DOM interactions into messages and pass them to `component.next(message)`.
