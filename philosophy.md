# Philosophy

Stateful components own their frontend lifecycle.

The component's `create()` function creates the live frontend iterator, consumes `mount` and `events`, and returns the mount function. External drivers should treat the component through that public API.

Functional components stay simple: they return an iterator with `next()`.

App composition can be an `AppFrontend`, but component internals remain component-owned.
