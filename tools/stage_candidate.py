#!/usr/bin/env python3
"""V.A.D. guarded *offline* automation file staging.

Never calls Home Assistant or reloads automations. Produces a reviewed candidate
file separately. Does not support writing a live HA automations.yaml.
"""
import argparse
import difflib
import hashlib
import json
from pathlib import Path

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def stage(original_path, proposed_path, output_path, expected_sha):
    original_path, proposed_path, output_path = map(Path, (original_path, proposed_path, output_path))
    if not expected_sha or len(expected_sha) != 64:
        raise ValueError("Expected SHA-256 required")
    if original_path.resolve() == output_path.resolve() or proposed_path.resolve() == output_path.resolve():
        raise ValueError("Output must be a separate new file")
    if output_path.exists():
        raise FileExistsError("Refusing to overwrite existing output")
    original = original_path.read_bytes()
    if sha256(original) != expected_sha:
        raise ValueError("Original has changed; refusing stale proposal")
    proposal = proposed_path.read_bytes()
    old = json.loads(original)
    new = json.loads(proposal)
    if not isinstance(old, (dict, list)) or not isinstance(new, type(old)):
        raise ValueError("Unsupported JSON automation structures")
    if old == new:
        raise ValueError("No changes to stage")
    diff = ''.join(difflib.unified_diff(
        json.dumps(old, indent=2, sort_keys=True).splitlines(True),
        json.dumps(new, indent=2, sort_keys=True).splitlines(True),
        fromfile='original', tofile='candidate'))
    if not diff:
        raise ValueError("No semantic changes")
    # Explicitly offline: no Home Assistant APIs or file paths are touched except output.
    with output_path.open('x', encoding='utf-8') as handle:
        json.dump({'source_sha256': expected_sha, 'candidate': new, 'diff': diff,
                   'status': 'review-only', 'publishable': False}, handle, indent=2)
        handle.write('\n')
    return diff

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('original')
    p.add_argument('proposed')
    p.add_argument('--expected-sha256', required=True)
    p.add_argument('--output', required=True)
    args = p.parse_args()
    print(stage(args.original, args.proposed, args.output, args.expected_sha256))
    print("REVIEW ONLY — nothing published to Home Assistant")

if __name__ == '__main__':
    main()
