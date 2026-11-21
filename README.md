# V.A.D. — Visual Automation Editor

**A Node-RED-style visual editor for native Home Assistant automations.**

> **Development status:** Pre-release (v0.1.0). A standalone visual editor, read-only importer, limited preview, and an initial Home Assistant admin-only panel are committed. Home Assistant runtime integration is **not yet tested**, YAML currently requires a CDN dependency, and native publishing is **not implemented**. Do not treat this as a production automation editor.

V.A.D. aims to make Home Assistant automation logic easier to **see, understand, edit, test and extend**, without requiring users to write YAML or run a second automation engine.

## The vision

- **Visual-first editing:** drag blocks onto a zoomable canvas, connect them, and configure properties with visual controls.
- **Import existing logic:** map Home Assistant triggers, conditions, branching, timers, scripts and actions into connected nodes.
- **Progressive editing:** start with an imported flow, adjust one decision, and incrementally build additional logic.
- **Contextual recommendations:** suggest useful blocks directly alongside the relevant flow (for example, sensor-failure handling or manual override protection); recommendations are optional.
- **Safe testing:** simulate draft changes using recorded or synthetic inputs, compare behaviour against the original, and run native-HA compatibility checks in an isolated test environment.
- **Native execution:** Home Assistant remains the production automation engine; V.A.D. is the editor, not a replacement runtime.
- **No silent data loss:** preserve unsupported automation constructs and prevent unsafe round-trip conversion.

The initial real-world reference case is an adaptive lighting controller, but V.A.D. is intended for **general-purpose Home Assistant automations**.

## Intended workflow

1. **Import** an existing automation in read-only mode.
2. **Inspect** the actual flow, its nodes, connections and conditions.
3. **Create a draft** and visually add, connect, remove or configure nodes.
4. **Review suggestions** displayed within the canvas.
5. **Simulate** the draft without issuing real device commands.
6. **Compare** the draft against the original and validate compatibility.
7. **Publish only after explicit approval** and successful safety checks (future feature).

No existing Home Assistant automation should be changed merely by opening or importing it.

## Safety principles

- Default to **read-only access** to live Home Assistant.
- Draft editing and simulations must never call real device services.
- Preserve source definitions, identifiers and unsupported YAML structures.
- Do not enable publishing until schema validation, explicit user approval, backup, diff review and rollback are implemented and tested.
- Prefer least-privilege access and avoid exposing tokens to the browser.
- Never silently overwrite automations that have changed since import.

See [Safety contract](docs/SAFETY.md).

## Installation

**Developer testing only:** the repository now includes a config flow and bundled editor assets in `custom_components/vad`. Copy that folder into a disposable Home Assistant test instance, restart, then add V.A.D. under Settings → Devices & services. The intended result is an admin-only V.A.D. sidebar panel. This path has **not yet been verified against a real HA runtime**. Do not install on your production Home Assistant instance.

Planned distribution: **HACS-compatible custom integration**, with a Home Assistant sidebar editor. This does not imply acceptance into Home Assistant Core or any official marketplace.

## Development status

| Component | Status |
| --- | --- |
| GitHub repository and integration scaffold | Started |
| HACS metadata | Added, not installation-tested |
| Node-RED-style editor frontend | Planned integration |
| Read-only Home Assistant automation import | Not implemented |
| Visual graph editing and property panels | Not implemented in integration |
| Suggestions in the flow canvas | Not implemented |
| Isolated simulation and regression tests | Not implemented |
| Native HA validation and guarded publishing | Not implemented |

An earlier standalone HTML prototype informed the interface direction; it is **not** a validated integration or production deployment.

## Roadmap

- **19–21 November 2026:** repository foundation, editor architecture and initial frontend.
- **22–24 November:** read-only automation import and faithful flow mapping.
- **25–27 November:** visual editing, suggestions and draft simulation.
- **28–30 November:** compatibility, regression and isolated Home Assistant testing.
- **1–3 December:** documentation and **public beta target**, contingent on passing safety and functionality tests.

See [Development roadmap](docs/ROADMAP.md). Dates are targets, not release guarantees.

## Contributing

Issues, reproducible test cases and pull requests are welcome as development progresses. Please avoid submitting real access tokens, private entity histories or sensitive Home Assistant configuration data. Include the Home Assistant version and a sanitised example when reporting import or simulation problems.

## Licence

The project is intended to be released under the **MIT licence**. A repository licence file should be included and verified before public distribution.

---

Developed by **JNSystems**. V.A.D. is an independent open-source project for Home Assistant users.

## Distribution readiness

Run `python tools/sync_frontend.py` after changing frontend source and `python tools/release_gate.py` before any release. The gate intentionally fails while external scripts are required or the integration bundle is incomplete. The Home Assistant panel is currently a read-only iframe, **not a native automation publisher**. See [release blockers](docs/RELEASE_READINESS.md).
