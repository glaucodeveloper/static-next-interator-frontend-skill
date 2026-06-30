# Philosophy

This skill follows one simple separation:

- component decides local UI
- interator decides events and globals
- generator decides program sequence

Use it when you want explicit frontend construction without framework lifecycle or build-heavy abstraction.

Avoid turning components into global coordinators or using generators as syntax ornament without clear program steps.
