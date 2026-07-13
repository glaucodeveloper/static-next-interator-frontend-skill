# Iterators, estado e programas ao longo da aplicação

Generators definem programas; iterators mantêm sua execução viva.

Uma `function*` pode conservar estado local, posição de execução e regras de transição entre chamadas. O objeto iterator retornado é a superfície de controle desse programa:

- `next(input)` retoma o programa suspenso e fornece sua próxima entrada;
- `yield output` torna um valor intermediário observável e suspende a execução;
- `throw(error)` devolve uma falha para o ponto suspenso;
- `return(value)` encerra o programa explicitamente.

Isso permite representar estado como uma sequência no tempo, sem separar os dados da ordem que os transforma.

## Um programa de estado duradouro

Este exemplo não renderiza DOM. Ele mostra a primitiva geral que pode acompanhar rota, sessão ou fluxo de trabalho durante a aplicação:

```js
function* stateProgram(initialState) {
  const state = { ...initialState };

  while (true) {
    Object.assign(state, yield Object.freeze({ ...state }));
  }
}

const application = stateProgram({
  route: "home",
  authenticated: false,
});

const initial = application.next().value;
const authenticated = application.next({ authenticated: true }).value;
const details = application.next({ route: "details" }).value;
```

Leia a linha do tempo:

1. o primeiro `next()` inicia o programa e observa o snapshot inicial;
2. `next({ authenticated: true })` retoma o `yield` com um patch;
3. `Object.assign` aplica o patch ao estado preservado dentro do generator;
4. o loop produz o snapshot seguinte e volta a suspender;
5. o iterator continua sendo a mesma instância durante toda a sequência.

O valor de um generator aqui não é apenas produzir uma coleção. Ele modela um programa que continua existindo entre eventos.

## Static Next especializa a primitiva no leaf component

Um componente Static Next é um **leaf component**: uma fronteira terminal de estado e renderização que possui um root `HTMLElement`, expõe seus handlers nesse root e substitui somente a si mesma.

```text
programa da aplicação
├── rota e sessão
├── coordenação de fluxos
└── leaf components
    ├── estado local em this.state
    ├── yield HTMLElement
    ├── next(StatePatch)
    └── replaceWith do próprio root
```

"Leaf" descreve a fronteira de propriedade, não o tamanho visual. Um formulário, uma tabela ou um painel com várias regiões ainda pode ser leaf quando possui um único estado local, um único root e não tenta interpretar o programa inteiro da aplicação.

## Duas escalas, a mesma chave de leitura

| Escala | Programa generator | Valor produzido | Entrada de retomada | Responsabilidade |
|---|---|---|---|---|
| Aplicação | rota, sessão ou workflow | snapshot/decisão observável | comando ou patch validado | coordenar programas duradouros |
| Leaf component | ciclo local de UI | `HTMLElement` atual | `StatePatch` local | possuir e substituir um root |

Não misture os contratos. No leaf component, o `yield` continua reservado ao root renderizado e sua retomada continua sendo o patch local. Mensagens globais, roteamento e efeitos de aplicação devem permanecer no programa de nível apropriado.

