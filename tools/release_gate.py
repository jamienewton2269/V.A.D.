#!/usr/bin/env python3
"""Distribution readiness gate. Nonzero exit means DO NOT publish."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors = []
def fail(message):
    errors.append(message)

manifest_path = ROOT / "custom_components/vad/manifest.json"
try:
    manifest = json.loads(manifest_path.read_text())
    if manifest.get("domain") != "vad":
        fail("Incorrect integration domain")
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?", str(manifest.get("version", ""))):
        fail("Invalid integration version")
except (OSError, ValueError) as exc:
    fail(f"Invalid integration manifest: {exc}")

if not (ROOT / "LICENSE").exists():
    fail("Open-source LICENSE missing")
if not (ROOT / "hacs.json").exists():
    fail("HACS metadata missing")

frontend = ROOT / "frontend"
index = (frontend / "index.html").read_text(encoding="utf-8")
for src in re.findall(r'<script\s+src="([^"]+)"', index):
    if src.startswith(("http://", "https://", "//")):
        fail(f"External runtime script is not marketplace/offline safe: {src}")
    elif not (frontend / src).is_file():
        fail(f"Missing frontend script: {src}")

# A HACS integration must ship its usable frontend *inside* the integration.
bundle = ROOT / "custom_components/vad/frontend"
if not bundle.is_dir() or not (bundle / "index.html").exists():
    fail("Frontend not packaged inside custom_components/vad/frontend")
for file in ("index.html", "style.css", "editor.js", "ha-import.js",
             "graph-analysis.js", "node-properties.js", "simulator.js",
             "native-preview.js", "file-parser.js", "js-yaml.min.js", "js-yaml.LICENSE"):
    if (frontend / file).read_bytes() != (bundle / file).read_bytes():
        fail(f"Frontend bundle is stale: {file}")
if not (ROOT / "custom_components/vad/config_flow.py").exists():
    fail("Integration lacks UI configuration flow")
if not (ROOT / "custom_components/vad/__init__.py").exists():
    fail("Integration setup missing")
if not (ROOT / "tests").is_dir():
    fail("Regression tests missing")

if errors:
    print("NOT RELEASE READY:")
    for item in errors:
        print(" -", item)
    sys.exit(1)
print("Static distribution checks passed (runtime integration tests still required).")
