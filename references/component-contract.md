# Component Contract

Every component module exposes `frontends`, `events`, `mount`, `template`, and `update`.

| Member | Responsibility |
| --- | --- |
| `frontends[id]` | Instance state and current root reference. |
| `events[id]` | Public callbacks used by template controls. |
| `mount(id, target)` | Register, render, insert, and capture the first root. |
| `template(id)` | Return the complete HTML string for current state. |
| `update(id, patch)` | Validate, merge, rerender, and refresh the root reference. |

Use `this` for all internal module calls. Use the component's global name only inside inline HTML handler strings, because the browser evaluates those strings outside the module call context.
