#!/usr/bin/env python3
"""Offline, read-only Home Assistant YAML -> JSON conversion for V.A.D.

Requires PyYAML. This does not evaluate HA templates or write HA config.
"""
import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML missing. Install with: python -m pip install PyYAML")

class HASafeLoader(yaml.SafeLoader):
    """Safe YAML parser with support for HA !include-style tags as opaque markers."""

def opaque_tag(loader, tag_suffix, node):
    """Retain unsupported HA tags as tagged JSON objects; never resolve includes."""
    if isinstance(node, yaml.ScalarNode):
        value = loader.construct_scalar(node)
    elif isinstance(node, yaml.SequenceNode):
        value = loader.construct_sequence(node, deep=True)
    else:
        value = loader.construct_mapping(node, deep=True)
    return {"__vad_yaml_tag__": tag_suffix, "value": value}

HASafeLoader.add_multi_constructor("!", opaque_tag)

def convert(text):
    obj = yaml.load(text, Loader=HASafeLoader)
    if not isinstance(obj, (list, dict)):
        raise ValueError("Expected an automation mapping or list")
    entries = obj if isinstance(obj, list) else [obj]
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            raise ValueError(f"Automation {index} must be a mapping")
        if not isinstance(entry.get("actions", entry.get("action")), list):
            raise ValueError(f"Automation {index} must contain an actions/action list")
    return obj

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Home Assistant YAML file")
    parser.add_argument("-o", "--output", type=Path, help="Output JSON (default stdout)")
    args = parser.parse_args()
    if args.input.stat().st_size > 5_000_000:
        parser.error("Input exceeds 5 MB safety limit")
    data = convert(args.input.read_text(encoding="utf-8"))
    result = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        if args.output.resolve() == args.input.resolve():
            parser.error("Output must not overwrite input")
        args.output.write_text(result, encoding="utf-8")
    else:
        sys.stdout.write(result)

if __name__ == "__main__":
    main()
