# Philosophy

## Why this exists

This style treats the frontend as an explicit runtime plus plain JavaScript components.
It is useful when you want:

- low build complexity
- easy view-source debugging
- deterministic state transitions
- direct control over routing and events
- components without framework ceremony

## Principles

### 1. Boot layer first

The runtime is the spine of the app. It wires routes, state, persistence, and component instances.

### 2. Components are message handlers

The component contract is not "mount lifecycle"; it is "receive message, update local state, return markup".

### 3. Events are serialized intent

DOM events should be translated into messages such as `navigate`, `announce`, `deleteItem`, and `logout`.

### 4. Shared behavior is injected

Navigation, auth, persistence, and global lookups should come from `props` or tools passed by `bootapp`.

### 5. Static-first wins

Prefer HTML strings, closure state, and a small number of conventions over deep abstraction layers.

## What to avoid

- component-owned global listeners by default
- hidden mutable singletons spread across files
- view logic mixed with persistence details
- pseudo-React lifecycle patterns inside plain JS
- multiple competing app shells
