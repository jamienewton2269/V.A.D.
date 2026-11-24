#!/usr/bin/env python3
"""Synchronise the development frontend with the HACS integration bundle."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "frontend"
target = ROOT / "custom_components/vad/frontend"
FILES = ("index.html", "style.css", "editor.js", "ha-import.js",
         "graph-analysis.js", "node-properties.js", "simulator.js",
         "native-preview.js", "file-parser.js", "js-yaml.min.js", "js-yaml.LICENSE", "native-draft.js")

def main():
    target.mkdir(parents=True, exist_ok=True)
    for filename in FILES:
        shutil.copyfile(source / filename, target / filename)
    print(f"Synchronised {len(FILES)} frontend files")

if __name__ == "__main__":
    main()
