# Offline YAML import (developer tool)

The initial YAML import route is a **local command-line converter**, not yet an in-browser YAML parser.

Install PyYAML in a development environment, then:

```sh
python -m pip install PyYAML
python tools/yaml_to_json.py automations.yaml -o vad-import.json
```

Open `frontend/index.html` and choose **Import JSON** to load the converted file. For a YAML list of automations, the frontend now displays an **Imported automations** selector to inspect each automation individually. Imported HA graphs are locked against direct edits.

Safety boundaries:
- Uses a restricted YAML loader, never evaluates Python objects or Jinja templates.
- Home Assistant `!include` and similar tags are retained as **opaque tagged JSON markers**; they are not resolved or expanded.
- Conversion is read-only with respect to the original YAML; generated JSON is inspection data, **not** a native Home Assistant export.
- YAML anchors and comments are not preserved in the JSON representation. Do **not** use this converter for lossless round-trip editing or publishing.
- Treat generated files as potentially sensitive: automations may contain private entity names and secrets.
- Only import configuration you are authorised to access.

Run tests with `python -m unittest discover -s tests -p 'test_*.py'`.
