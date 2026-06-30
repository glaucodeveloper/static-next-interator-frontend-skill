# Philosophy

The application is a generator program.

Stateful or staged components can be generator programs.

Pure functional components are iterators with `next()`.

The runtime is only a driver. It interprets yielded steps, stores live iterators, forwards events through `.next(input)`, and applies the produced HTML.

This keeps frontend construction explicit: composition, mounting, event binding, rendering, and updates are visible as steps instead of being hidden inside an imperative app shell.
