import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("vad_stage", Path(__file__).resolve().parents[1] / "tools" / "stage_candidate.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class TestStage(unittest.TestCase):
    def test_stage_diff_without_touching_source(self):
        with tempfile.TemporaryDirectory() as temp:
            d = Path(temp)
            original, proposed, output = (d / n for n in ("original.json", "proposed.json", "review.json"))
            original.write_text('{"actions":[]}')
            proposed.write_text('{"actions":[{"action":"light.turn_on"}]}')
            source = original.read_bytes()
            diff = MODULE.stage(original, proposed, output, MODULE.sha256(source))
            self.assertIn("light.turn_on", diff)
            self.assertEqual(original.read_bytes(), source)
            self.assertFalse(json.loads(output.read_text())["publishable"])
            with self.assertRaises(FileExistsError):
                MODULE.stage(original, proposed, output, MODULE.sha256(source))

    def test_rejects_changed_original(self):
        with tempfile.TemporaryDirectory() as temp:
            d = Path(temp)
            original, proposed, output = (d / n for n in ("a", "b", "c"))
            original.write_text('{"actions":[]}')
            proposed.write_text('{"actions":[{"action":"light.turn_on"}]}')
            with self.assertRaises(ValueError):
                MODULE.stage(original, proposed, output, "0" * 64)
            self.assertFalse(output.exists())

if __name__ == "__main__":
    unittest.main()
