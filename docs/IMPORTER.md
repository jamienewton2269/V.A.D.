# Read-only Home Assistant automation importer

The first importer accepts **JSON representations** of Home Assistant automations, not YAML text. It supports modern `triggers` / `conditions` / `actions` and legacy `trigger` / `condition` / `action` lists.

Nested `choose`, `if/then/else`, `repeat`, `parallel`, delays and waits are mapped to inspectable graph nodes. Every node retains its original source object and path, and the entire automation is retained in `graph.source.automation`.

**Limitations:** branch semantics and joins are not executable; layout is preliminary; graph editing is not mapped back to native HA syntax. Import does not read Home Assistant directly. No YAML parser, HA API calls, native export or execution are provided. Import is strictly for inspection. JSON imported from untrusted sources is treated as data and never evaluated.

Run tests with `node --test tests/*.test.cjs`.

## Control-flow representation (November 2026)

Multiple triggers now converge through an explicit continuation node before shared conditions/actions. Choose, if/else, parallel, and repeat constructs have continuation nodes so following actions are not incorrectly attached to only one branch. This is a **visual approximation**, not a runtime execution plan. Branch conditions, early stop, repeat iteration counts, errors, and concurrency are not evaluated. No native export or simulation is enabled for imported HA graphs.
