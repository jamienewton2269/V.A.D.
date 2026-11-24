import asyncio
import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("publisher", Path(__file__).resolve().parents[1]/"custom_components/vad/publisher.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class Adapter:
    def __init__(self):
        self.value = {"id":"demo","actions":[]}
        self.valid = True
        self.fail_reload = False
        self.backups = []
    async def read(self, key): return copy.deepcopy(self.value)
    async def validate(self, value): return self.valid
    async def backup(self, key, value):
        self.backups.append(copy.deepcopy(value))
        return "backup-1"
    async def compare_and_swap(self, key, expected, value):
        if mod.digest(self.value) != expected: return False
        self.value = copy.deepcopy(value)
        return True
    async def reload(self):
        if self.fail_reload:
            self.fail_reload = False
            raise RuntimeError("reload failed")

class PublisherTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.adapter = Adapter()
        self.publisher = mod.Publisher(self.adapter)
        self.original = copy.deepcopy(self.adapter.value)
        self.candidate = {"id":"demo","actions":[{"delay":"00:00:05"}]}
    async def run_publish(self, expected=None, approval=None):
        return await self.publisher.publish("demo",self.candidate,expected or mod.digest(self.original),approval or mod.digest(self.candidate))
    async def test_success(self):
        self.assertEqual((await self.run_publish())["status"],"verified")
        self.assertEqual(self.adapter.value,self.candidate)
        self.assertEqual(self.adapter.backups,[self.original])
    async def test_stale_source(self):
        with self.assertRaisesRegex(mod.PublishError,"Source changed"):
            await self.run_publish(expected="stale")
        self.assertEqual(self.adapter.backups,[])
    async def test_unapproved(self):
        with self.assertRaisesRegex(mod.PublishError,"not approved"):
            await self.run_publish(approval="wrong")
        self.assertEqual(self.adapter.value,self.original)
    async def test_invalid(self):
        self.adapter.valid=False
        with self.assertRaisesRegex(mod.PublishError,"validation failed"):
            await self.run_publish()
        self.assertEqual(self.adapter.backups,[])
    async def test_rollback(self):
        self.adapter.fail_reload=True
        with self.assertRaisesRegex(mod.PublishError,"original restored"):
            await self.run_publish()
        self.assertEqual(self.adapter.value,self.original)
