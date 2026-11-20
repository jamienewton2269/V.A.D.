# Native Home Assistant preview (limited)

The **Simulate** button on imported Home Assistant JSON now uses a fail-closed preview of the original source (not the diagram). It does not contact Home Assistant.

Enter scenario JSON, for example:

```json
{"states":{"sensor.west_eaves_lux":"20","input_boolean.manual":"off"},"triggerIndex":0}
```

The caller must identify which trigger fired when the automation has triggers. The preview **does not evaluate triggers**.

Supported: state and numeric-state conditions, and/or/not condition groups, first-match choose/default, if/then/else, fixed HH:MM:SS delay, stop, basic service/action calls. No service is executed.

Unsupported constructs (templates, waits, repeat, parallel, trigger evaluation, variables, dynamic targets, HA context, scripts, error behaviour, concurrency, time/calendar conditions) are rejected rather than guessed. Results are *illustrative* and **not execution-equivalent to Home Assistant**. Use the real Home Assistant test environment for authoritative semantics.

No native publishing is available. A valid preview is not permission to publish.
