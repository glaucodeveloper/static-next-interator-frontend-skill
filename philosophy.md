# Philosophy

## Why this exists

This style treats the frontend as an explicit runtime plus plain JavaScript layers.
It is useful when you want:

- low build complexity
- easy view-source debugging
- deterministic state transitions
- direct control over routing and events
- component boundaries that stay local
- program assembly that can be read as a sequence of steps

## Principles

### 1. Boot layer first

The runtime is the spine of the app. It wires routes, interators, state, persistence, and component instances.

### 2. Components are local decision units

A component does not own the whole app. It receives a message, updates local state, and returns markup.

### 3. Interators own the system concerns

Events, atomic global state, routing, and cross-component effects belong to interators, not to random components.

### 4. Events are serialized intent

DOM events should become messages such as `navigate`, `announce`, `deleteItem`, and `logout`.

### 5. Generators make program production explicit

When program construction matters, use `function*` and `yield` to model each piece-step of the program.

### 6. Static-first wins

Prefer HTML strings, closure state, and a small number of conventions over deep abstraction layers.

## What to avoid

- component-owned global listeners by default
- hidden mutable singletons spread across files
- view logic mixed with persistence details
- pseudo-React lifecycle patterns inside plain JS
- multiple competing app shells
- implicit boot sequences that cannot be inspected step by step
