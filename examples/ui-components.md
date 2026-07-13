# Galeria progressiva de componentes UI

Todos os níveis mantêm o mesmo ciclo: `function*`, métodos em `this`, fragmento de template, root com `id`, `element.component = this`, substituição localizada e patch recebido por `yield`.

## Nível 1 — Contador

Estado numérico, métodos `increment`, `decrement` e `reset`, e um root com três handlers.

## Nível 2 — Disclosure acessível

Estado booleano, `aria-expanded`, conteúdo condicional e método `toggle`.

## Nível 3 — Formulário validado

Estado aninhado de valores, touched e errors; handlers de campo e submit produzem patches explícitos.

## Nível 4 — Tabela pesquisável e ordenável

Estado de query, sort e rows; o render deriva as linhas visíveis sem duplicar dados no DOM.

## Nível 5 — Carrinho de compras

Itens aninhados, quantidades, cupom e totais derivados; os métodos atualizam coleções imutavelmente antes de `next(patch)`.

## Nível 6 — Kanban composto

Colunas, cartões, filtro, seleção e movimentação; um único componente pode demonstrar estado estrutural, embora a produção deva extrair subcomponentes quando eles precisarem de ciclos independentes.

## Nível 7 — Workspace assíncrono

Estados `idle`, `pending`, `success` e `error`; métodos assíncronos usam múltiplos `next(patch)` e preservam a mesma instância/root identity.

Os códigos completos e demonstrações interativas estão em `docs/index.html`, selecionáveis na galeria da GitHub Page.
