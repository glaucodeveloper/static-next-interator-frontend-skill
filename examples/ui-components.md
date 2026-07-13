# Progressive UI Components

## Level 1: Counter

State: one number. Handlers: add and reset. Template: output and buttons.

## Level 2: Expandable card

State: `{ open, title }`. Handlers call `this.update(id, { open })`. The template conditionally includes the body.

## Level 3: Validated form

State: `{ values, errors, submitting }`. Each field handler clones `values`, updates one key, and delegates to `this.update()`.

## Level 4: Filtered table

State: `{ query, sort, rows }`. `template(id)` derives visible rows without storing a duplicate filtered list.

## Level 5: Modal workflow

State: `{ open, pending, error }`. Handlers open, cancel, confirm, and delegate every visual transition to `this.update()`.

## Level 6: Kanban board

The board owns `{ columns, selectedCardId }`. Per-instance handlers calculate moves and call one update. The template renders all columns from the new state.

For every level, retain the same anatomy. Complexity belongs in state validation and template composition, never in a second lifecycle.
