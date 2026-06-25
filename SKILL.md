---
name: static-next-interator-frontend
description: Use when building or maintaining a static frontend architecture with a central bootapp runtime, components that expose next(message), HTML-string rendering, delegated DOM events through data-cid/data-message, and shared route or session tools injected as props.
---

# Static Next Interator Frontend

This skill is for lightweight monolithic frontends that do not need React, Vue, or template compilers.

## Core Model

- `bootapp` owns app startup, component registration, routing, shared state, and delegated events.
- Components are factories receiving `{ id, props }`.
- Every component exposes `next(message = {})`.
- `next()` handles both action messages and rendering.
- Rendering returns `{ done: false, value: "<html>" }`.
- Component-local state stays in closure variables.
- Shared state and persistence stay in `bootapp`.

## Rules

- Use `data-cid` and `data-message` for interactive elements.
- Prefer message names that express intent: `navigate`, `saveItem`, `toggleFavorite`.
- Inject cross-cutting behavior through `props`, not hidden globals.
- Re-render from the runtime after state transitions.
- Keep the architecture static-first and explicit.

## Read Next

- Philosophy: [philosophy.md](philosophy.md)
- Component examples: [examples/component-example.md](examples/component-example.md)
- Event examples: [examples/event-example.md](examples/event-example.md)
- Bootapp example: [examples/bootapp-example.md](examples/bootapp-example.md)
- Component contract: [references/component-contract.md](references/component-contract.md)
- Event guide: [references/events.md](references/events.md)
