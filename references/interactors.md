# Interators

Use o Interator como owner de estado e efeitos compartilhados:

- rota;
- sessao;
- persistencia;
- sincronizacao entre componentes;
- efeitos de aplicacao.

Mantenha estado visual local dentro do componente. Nao use o Interator como armazenamento de cada detalhe da interface.

## Retorne mudancas explicitas

```js
function createInterator({ persist } = {}) {
  const atoms = {
    route: "home",
    session: null,
    selectedId: null,
  };

  const subscribers = new Set();
  const snapshot = () => Object.freeze({ ...atoms });

  return {
    dispatch(message) {
      const changed = [];

      if (message.type === "navigate" && message.route !== atoms.route) {
        atoms.route = message.route;
        changed.push("route");
      }

      if (message.type === "select" && message.value !== atoms.selectedId) {
        atoms.selectedId = message.value;
        changed.push("selectedId");
      }

      if (message.type === "login" && message.session !== atoms.session) {
        atoms.session = message.session;
        changed.push("session");
      }

      const nextSnapshot = snapshot();

      if (changed.length > 0) {
        persist?.(nextSnapshot);

        for (const subscriber of subscribers) {
          subscriber({ changed, snapshot: nextSnapshot });
        }
      }

      return {
        changed,
        snapshot: nextSnapshot,
      };
    },

    getSnapshot() {
      return snapshot();
    },

    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
```

## Escolha uma estrategia de entrega

Prefira uma destas estrategias e documente-a no app:

1. Passe `interator` a `component({ id, props, interator })` para leitura sob demanda.
2. Passe snapshots derivados a `component.next(renderInput)` pelo driver.
3. Use `subscribe()` para atualizacoes reativas e guarde a funcao de unsubscribe em `dispose()`.

Nao misture as tres sem necessidade. Nunca passe o `Event` DOM bruto ao Interator nem retenha elementos em seus atoms.
