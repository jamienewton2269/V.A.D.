# Read-only Home Assistant automation importer

The first importer accepts **JSON representations** of Home Assistant automations, not YAML text. It supports modern `triggers` / `conditions` / `actions` and legacy `trigger` / `condition` / `action` lists.

Nested `choose`, `if/then/else`, `repeat`, `parallel`, delays and waits are mapped to inspectable graph nodes. Every node retains its original source object and path, and the entire automation is retained in `graph.source.automation`.

**Limitations:** branch semantics and joins are not executable; layout is preliminary; graph editing is not mapped back to native HA syntax. Import does not read Home Assistant directly. No YAML parser, HA API calls, native export or execution are provided. Import is strictly for inspection. JSON imported from untrusted sources is treated as data and never evaluated.

Run tests with `node --test tests/*.test.cjs`.
