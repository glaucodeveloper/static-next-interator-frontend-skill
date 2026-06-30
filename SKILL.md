---
name: static-next-interator-frontend
description: Use when building or maintaining a static frontend architecture with a central bootapp runtime, deterministic component factories, interator-owned event and shared runtime state, and generator-based program assembly where each yield emits one concrete step.
---

# Static Next Interator Frontend

This skill describes a static frontend architecture organized around three explicit layers:

- components for local UI state and view rendering
- interators for events, shared runtime state, and cross-component coordination
- generator-driven program assembly for deterministic boot and composition

## Core Model

- `bootapp` owns startup, composition, mounting, and orchestration.
- Components are factory functions receiving `{ id, props }`.
- Each component exposes `next(message = {})`.
- `next()` absorbs a message and returns the current HTML snapshot.
- Component-local state stays in closure variables.
- Interators own event normalization, shared runtime state, routing, persistence, and cross-component coordination.
- Program assembly can be expressed as `function*` generators, where each `yield` emits one algorithmic step of the program.

## Component Determination

- Treat each component as a local decision boundary.
- If a concern changes only one view, keep it inside that component.
- If a concern affects multiple views, event routing, or shared state, lift it to an interator.
- Use the labbing style: small factory, private state, explicit render output, no framework lifecycle.

## Interator Rules

- Convert DOM events into normalized messages.
- Own shared runtime state such as route, session, selection, dirty flags, or cache records.
- Provide helpers to components through `props`.
- Never let a component become the source of truth for global system behavior.

## Generator Model

- Use `function* buildProgram()` when the frontend should be produced as a sequence of explicit steps.
- Each `yield` should represent one concrete artifact: resolve root, create interator, register component, wire events, mount view.
- Prefer generators when you need deterministic composition, inspectable boot flow, or staged program construction.
- Keep yielded values small and composable.

## Rules

- Use `data-cid` and `data-message` for interactive elements when the runtime is DOM-driven.
- Prefer intent-first message names: `navigate`, `saveItem`, `toggleFavorite`, `syncGlobal`.
- Keep component scope local. Do not let components own the event system or shared runtime state.
- Inject cross-cutting behavior through `props` or interator contracts, never through hidden globals.
- Re-render from the runtime after state transitions.
- Model build-time or boot-time composition as generator steps when the program benefits from explicit sequencing.
- Keep the architecture static-first, explicit, and stepwise.

## Read Next

- Philosophy: [philosophy.md](philosophy.md)
- Component examples: [examples/component-example.md](examples/component-example.md)
- Event examples: [examples/event-example.md](examples/event-example.md)
- Bootapp example: [examples/bootapp-example.md](examples/bootapp-example.md)
- Generator example: [examples/generator-example.md](examples/generator-example.md)
- Component contract: [references/component-contract.md](references/component-contract.md)
- Event guide: [references/events.md](references/events.md)
- Interator guide: [references/interactors.md](references/interactors.md)
- Program generation: [references/program-generation.md](references/program-generation.md)