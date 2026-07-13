# Handlers, estado e identidade DOM

Defina métodos públicos diretamente em `this` dentro do generator.

```js
this.increment = amount => this.next({
  counting: this.state.counting + amount,
});
```

No template, resolva a instância pelo root atual:

```html
<button onclick="document.getElementById('counter-1').component.increment(1)">
  +1
</button>
```

O fluxo é:

`evento DOM → root atual por id → root.component → método em this → next(patch) → novo root`

## Regras

- Use arrows para métodos que chamam `this.next()` e precisam reter o contexto vivo.
- Passe valores normalizados ao método; não passe o `Event` inteiro para o estado.
- Leia valores de formulário no handler e construa um patch explícito.
- Valide o patch após o generator retomar e antes de `Object.assign`.
- Reaplique `element.component = this` em cada renderização.
- Mantenha o id único e estável durante toda a vida do componente.
- Para valores dinâmicos em atributos inline, escape HTML e serialize argumentos com segurança.

## Formulário

```js
this.changeField = (field, value) => this.next({
  values: { ...this.state.values, [field]: value },
});
```

```html
<input oninput="document.getElementById('profile-form').component.changeField('name', this.value)">
```

`this` dentro do atributo inline acima é o controle DOM. `document.getElementById(...).component` é o contexto do componente. Não confunda os dois.
