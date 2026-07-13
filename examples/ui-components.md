# Galeria progressiva de componentes UI

Todos os níveis mantêm o mesmo ciclo: `function*`, métodos em `this`, fragmento de template, root com `id`, `element.component = this`, substituição localizada e patch recebido por `yield`.

## Nível 1 — Output com grupo de controles

Estado numérico, métodos `increment`, `decrement` e `reset`, e um root com três handlers.

## Nível 2 — Região condicional acessível

Estado booleano, `aria-expanded`, conteúdo condicional e método `toggle`.

## Nível 3 — Formulário controlado

Estado aninhado de valores, touched e errors; handlers de campo e submit produzem patches explícitos.

## Nível 4 — Data grid pesquisável e ordenável

Estado de query, sort e rows; o render deriva linhas visíveis, mantém semântica tabular e preserva o foco da busca.

## Nível 5 — Lista repetível com steppers e total

Itens aninhados, controles de quantidade e total derivado; os métodos atualizam coleções imutavelmente antes de `next(patch)`.

## Nível 6 — Painel de múltiplas colunas

Colunas, itens e movimentação entre regiões; um único componente demonstra estado estrutural, embora a produção deva extrair subcomponentes quando eles precisarem de ciclos independentes.

## Nível 7 — Painel de estados assíncronos

Estados `idle`, `pending`, `success` e `error`; métodos assíncronos usam múltiplos `next(patch)` e preservam a mesma instância/root identity.

Os códigos completos e demonstrações interativas estão em `docs/index.html`, selecionáveis na galeria da GitHub Page.
