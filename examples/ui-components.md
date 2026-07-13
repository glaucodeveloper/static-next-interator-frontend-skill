# Catálogo de UI

Use generators independentes para cada parte da tela e registre cada instância pelo seu `id`.

## Modal de confirmação

```js
const mountDelete = ConfirmDialog.create("delete-user", {
  title: "Excluir usuário",
});
mountDelete(document.body);
```

O handler `open()` avança o generator com `{ open: true }`; `cancel()` o avança com `{ open: false }`; `confirm()` pode chamar a ação de domínio e então fechar o modal.

## Tabela com filtro

```js
const mountTable = UsersTable.create("users-table", { users });
mountTable(document.querySelector("#content"));
```

O template contém um input com `oninput`. O handler recebe o termo, chama `frontend.next({ query })` e troca somente `#users-table` com `outerHTML`.

## Painel de métricas

```js
const mountDashboard = MetricsDashboard.create("dashboard", { period: "30d" });
mountDashboard(document.querySelector("#content"));
```

Cada botão de período chama `events[id].setPeriod("7d")`. O generator recebe o patch, recompõe as métricas e devolve o HTML do painel atualizado.

## Kanban

Crie `KanbanColumn.create("todo")`, `KanbanColumn.create("doing")` e `KanbanColumn.create("done")`. Cada coluna possui seu próprio generator e seu próprio mapa de eventos; mover um card chama o handler da coluna de destino e atualiza os dois roots envolvidos.
