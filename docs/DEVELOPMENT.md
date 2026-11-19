# Local development

## Standalone frontend

Open `frontend/index.html` in a modern browser. The app does not require Home Assistant or a server. Import `tests/fixtures/dusk.json` using **Import JSON** to inspect a representative native Home Assistant automation.

The import is read-only with respect to Home Assistant. The editor currently allows changing a *graph draft*, but does not translate graph changes into native HA automation syntax.

## Tests

Run `node --test tests/*.test.cjs` with Node.js 22 or newer. GitHub Actions also checks JavaScript syntax, compiles Python integration files and validates manifest metadata.

## Important boundaries

- The standalone canvas is not a registered Home Assistant sidebar panel.
- Import is JSON only and does not connect to HA.
- Simulation, YAML round-tripping, deployment, rollback and recommendations are not implemented.
- No production deployment should be attempted with the current scaffold.
