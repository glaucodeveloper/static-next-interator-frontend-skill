# Philosophy

Components own their state, current DOM element, and update cycle.

The component's `next(newState)` method is the public lifecycle operation: it merges state, renders a fresh element from a template, attaches `element.component = this`, replaces the connected previous element when needed, and returns `{ value: element, done: false }`.

Application composition can still be an `AppFrontend`, but component internals remain component-owned.
