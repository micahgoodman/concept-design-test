---
trigger: always_on
---

General:

- You are encouraged to work with the application in phases, as each piece is
  modular: concept specs contain sufficient context to (re)generate independent
  implementations, and synchronizations can be generated without knowledge of
  concept implementation details, and refer solely to action signatures in their
  specification.
- You should not need to inspect inside the `engine/` folder unless specifically
  to debug a tricky issue or if you generate behavior that does not align with
  expectations according to your understanding of the concept + synchronization
  structure, and can prove so with tests.

Concept implementations should:

- Never import one another, and should run fully independently.
- Be able to be tested individually, and carry a canonical test modeled after
  their "operational principle"

Synchronizations should:

- Be written concisely, with direct reference to the concept action, such as
  `User.register` as the first argument in the `actions` pattern lists.
- Typing should work after concepts are instrumented, and the baseline concept
  `User` is an instance that has been `instrument`ed.
- Use `.query` on `frames: Frames` in the `where` clause function as much as
  possible to maintain readibility and clarity. When new bindings are provided
  by `query`, the typing should update to the next chained method's version of
  `Frames`.
- Use standard `Array` functions over manual `for` iteration, and maintain a
  functional-style approach for readibility.