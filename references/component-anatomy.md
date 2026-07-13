# Anatomia completa de um componente generator

## Sumário

1. Binder mínimo
2. Generator completo
3. Sequência de execução
4. Por que o patch aparece depois do `yield`
5. Identidade e substituição do root
6. Inspiração em Effect/Effect-TS
7. Pensamento linear do auto-state

## 1. Binder mínimo

O generator precisa de um contexto de instância para que `this` seja estável. O binder cria esse contexto, inicia o generator com `Function.prototype.call()` e expõe seus métodos nativos.

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

O binder não guarda estado, não renderiza e não interpreta eventos. Toda a anatomia continua dentro da única `function*` do componente.

## 2. Generator completo

```js
function* CounterComponent({ id, props = {} }) {
  if (!id) throw new TypeError("CounterComponent requer id");

  const initialState = {
    counting: props.counting ?? 0,
    label: props.label ?? "Contador",
  };

  this.id = id;
  this.state = { ...initialState };
  this.element = null;

  this.increment = amount => this.next({
    counting: this.state.counting + amount,
  });

  this.setCounting = counting => this.next({ counting });
  this.rename = label => this.next({ label });
  this.reset = () => this.next(initialState);

  while (true) {
    Object.assign(
      this.state,
      yield (this.element = ((element) => {
        if (!(element instanceof HTMLElement)) {
          throw new TypeError("CounterComponent deve produzir HTMLElement");
        }

        element.id = this.id;
        element.querySelector("[data-slot='label']").textContent = this.state.label;
        element.querySelector("[data-slot='counting']").textContent = this.state.counting;
        element.component = this;

        if (this.element?.isConnected) {
          this.element.replaceWith(element);
        }

        return element;
      })(Object.assign(document.createElement("template"), {
        innerHTML: /* html */ `
          <section>
            <p data-slot="label"></p>
            <output data-slot="counting"></output>
            <button onclick="document.getElementById('${id}').component.increment(1)">+1</button>
            <button onclick="document.getElementById('${id}').component.increment(10)">+10</button>
            <button onclick="document.getElementById('${id}').component.reset()">reset</button>
          </section>
        `.trim(),
      }).content.firstElementChild)),
    );
  }
}
```

## 3. Sequência de execução

1. `component(CounterComponent, props)` cria `context` e o iterator nativo.
2. `context.next()` inicia o corpo da `function*`.
3. O generator inicializa `this.state`, `this.element` e os métodos públicos.
4. `Object.assign(document.createElement("template"), { innerHTML })` cria e preenche um template descartável sem variável local.
5. `.content.firstElementChild` consome imediatamente o `DocumentFragment` e extrai o root.
6. O root recebe `id` e `element.component = this`.
7. Na primeira renderização não há root conectado para substituir.
8. `yield element` devolve `{ value: element, done: false }`.
9. O chamador anexa `value` ao DOM.
10. Um handler recupera a instância pelo id e chama, por exemplo, `component.increment(1)`.
11. O método calcula um patch e chama `this.next(patch)`.
12. O patch se torna o resultado da expressão `yield (...)` suspensa.
13. A chamada externa de `Object.assign(this.state, ...)` recebe esse patch e o mescla automaticamente.
14. A próxima volta cria outro fragmento e outro root.
15. O root conectado é substituído, `this.element` é atualizado e o novo root é entregue pelo próximo `yield`.

## 4. A direção dupla do `yield`

```text
Object.assign(
  this.state,
  yield (this.element = buildCurrentElement()),
);
```

Essa única linha possui duas direções:

- Saída: `yield element` entrega o `HTMLElement` ao chamador de `next()`.
- Entrada: o argumento da chamada seguinte, `next(patch)`, vira o valor da expressão suspensa e é entregue diretamente ao `Object.assign`.

Por isso o `yield` é a fronteira do auto-state: entrega o `HTMLElement` atual e recebe o patch que o `Object.assign` aplica antes da próxima volta do loop.

## Template descartável, nunca variável

Não dê identidade local ao template. Escreva a criação, o preenchimento e o consumo na mesma expressão:

```js
Object.assign(document.createElement("template"), {
  innerHTML: html,
}).content.firstElementChild
```

O template não faz parte do estado nem da identidade do componente. É apenas o mecanismo descartável que materializa o `DocumentFragment`; somente o `HTMLElement` extraído entra em `this.element` e no `yield`.

### Extensões para HTML em template strings

Editores podem reconhecer HTML embutido em template literals por language injection. Use a anotação sem custo de runtime:

```js
Object.assign(document.createElement("template"), {
  innerHTML: /* html */ `<section>${content}</section>`,
}).content.firstElementChild
```

Extensões compatíveis podem fornecer destaque de sintaxe, autocomplete, Emmet e formatação dentro da string. A anotação é apenas metadado para tooling e não interfere na avaliação JavaScript.

Um tagged template também pode ser adotado:

```js
innerHTML: html`<section>${content}</section>`
```

Nesse caso, documente a função `html` e mantenha seu comportamento explícito. Ela deve produzir o valor esperado por `innerHTML` e não pode fazer o leitor presumir escaping ou sanitização que não existe. Não deixe a tag criar estado, registrar componentes ou introduzir outro lifecycle.

## 7. Pensamento linear do auto-state

A forma de escrita representa a ordem temporal do programa. Ela não existe para reduzir linhas e não deve ser refatorada como preparação de template separada do `yield`.

```js
Object.assign(
  this.state,
  yield (this.element = ((element) => {
    element.id = this.id;
    element.component = this;
    if (this.element?.isConnected) this.element.replaceWith(element);
    return element;
  })(Object.assign(document.createElement("template"), {
    innerHTML: html,
  }).content.firstElementChild)),
);
```

Leia de fora para dentro e, depois da suspensão, de dentro para fora:

1. `Object.assign(this.state, ...)` abre uma atualização ainda sem patch.
2. O template descartável é criado, preenchido e consumido na própria posição de valor.
3. O root recebe identidade, referência ao componente e substitui o root anterior.
4. `yield` entrega esse root e suspende a execução antes de `Object.assign` poder terminar.
5. Um método chama `this.next(statePatch)`.
6. O `statePatch` passa a ser o valor da expressão `yield (...)`.
7. `Object.assign` recebe esse valor como segundo argumento e conclui a atualização.
8. O `while` continua e o template seguinte já lê `this.state` atualizado.

Essa linearidade une três momentos sem criar um lifecycle paralelo:

```text
render atual → yield HTMLElement → next(statePatch) → assign state → próximo render
```

Separar o template em uma variável local sugere incorretamente que ele possui duração ou responsabilidade próprias. Neste paradigma, ele é somente uma etapa transitória da produção do valor entregue pelo `yield`; o que persiste é `this.state`, `this.element` e o iterator vivo.

## 5. Identidade do root

`element.component = this` transforma o root em ponte para a instância viva. Como cada render cria outro elemento, a referência deve ser reaplicada antes de `replaceWith()`. O handler sempre consulta `document.getElementById(id)` e, portanto, encontra o root atual, nunca o anterior desconectado.

## 6. Inspiração em Effect/Effect-TS

A influência é a separação entre descrição e execução de um programa: a `function*` descreve um ciclo suspensível e o binder o interpreta por meio de `next`, `throw` e `return`. O valor entregue pelo generator é explícito, assim como o valor usado para retomá-lo.

Static Next especializa essa ideia para componentes DOM:

- o programa é o ciclo de renderização do componente;
- o valor produzido é um `HTMLElement`;
- o valor de retomada é um `StatePatch`;
- o contexto `this` é a instância viva;
- o root atual é a superfície pública que aponta para essa instância.

Não importe Effect para implementar esse contrato. A referência é filosófica; o runtime do componente permanece JavaScript e DOM nativos.
