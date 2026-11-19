import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("vad_yaml", Path(__file__).resolve().parents[1] / "tools" / "yaml_to_json.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class TestYamlImport(unittest.TestCase):
    def test_modern_automation(self):
        result = MODULE.convert("""
alias: Test
triggers:
  - trigger: sun
    event: sunset
actions:
  - action: light.turn_on
    target:
      entity_id: light.porch
""")
        self.assertEqual(result["actions"][0]["action"], "light.turn_on")

    def test_include_not_resolved(self):
        result = MODULE.convert("actions: []\nvariables: !include secrets.yaml\n")
        self.assertEqual(result["variables"], {"__vad_yaml_tag__": "include", "value": "secrets.yaml"})

    def test_python_object_rejected(self):
        with self.assertRaises(Exception):
            MODULE.convert("actions: []\nvariables: !!python/object/apply:os.system ['echo unsafe']\n")

    def test_rejects_invalid_actions(self):
        with self.assertRaises(ValueError):
            MODULE.convert("alias: broken\nactions: hello\n")

if __name__ == "__main__":
    unittest.main()
