# Safety contract

- Import and observation are read-only.
- Editing always creates a separate draft.
- Unknown Home Assistant syntax is represented as an opaque node and retained verbatim.
- Simulation must not invoke Home Assistant services or events.
- Never publish from the frontend without a validated server-side approval workflow.
- A deployment requires an immutable backup, diff review, schema validation, explicit approval, and rollback plan.
- No credentials or tokens are stored in browser local storage.
